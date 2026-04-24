import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { analyzeVehicle, type AnalysisResult, type AnalyzeMeta } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { detectKmRisk } from "@/lib/km-heuristic";
import { logError } from "@/lib/error-log";
import {
  checkPaywall,
  paywallErrorBody,
  paywallHttpStatus,
} from "@/lib/paywall";

export const runtime = "nodejs";
export const maxDuration = 60;

const inputSchema = z
  .object({
    listingUrl: z.string().url().max(500).optional(),
    brand: z.string().max(60).optional(),
    model: z.string().max(60).optional(),
    variant: z.string().max(100).optional(),
    year: z.number().int().min(1980).max(2027).optional(),
    km: z.number().int().min(0).max(1_500_000).optional(),
    fuelType: z.string().max(30).optional(),
    transmission: z.string().max(30).optional(),
    city: z.string().max(60).optional(),
    askingPrice: z.number().int().min(0).max(50_000_000).optional(),
    description: z.string().max(5000).optional(),
    damageStatus: z.string().max(300).optional(),
    extras: z.array(z.string().max(60)).max(20).optional(),
  })
  .strict();

type AnalyzeInput = z.infer<typeof inputSchema>;

// 24 saat cache TTL
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Consistency bucket hash. Aynı aracın varyasyonlarını aynı cache slot'una düşür.
 * - km 5000'lik kovalara yuvarlanır (örn 123.457 → 125000)
 * - price ve description gibi değişken alanlar hash'e GIRMEZ (farklı ilanlar aynı araç = aynı cache)
 * - city lowercase + trim
 */
function computeInputHash(data: AnalyzeInput): string {
  const kmBucket =
    typeof data.km === "number" ? Math.round(data.km / 5000) * 5000 : null;
  const parts = [
    (data.brand ?? "").trim().toLowerCase(),
    (data.model ?? "").trim().toLowerCase(),
    data.year ?? "",
    kmBucket ?? "",
    (data.city ?? "").trim().toLowerCase(),
    (data.fuelType ?? "").trim().toLowerCase(),
    (data.transmission ?? "").trim().toLowerCase(),
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type application/json olmalı" },
      { status: 415 }
    );
  }

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI servisi yapılandırılmamış" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Giriş bilgileri geçersiz" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const hasMinimum =
    (!!data.brand && (!!data.model || !!data.year)) || !!data.description;
  if (!hasMinimum) {
    return NextResponse.json(
      {
        error:
          "En az marka + (model veya yıl) gerekli, ya da ilan açıklaması yapıştır",
      },
      { status: 400 }
    );
  }

  // ─── PAYWALL: kimlik + aylık analiz limiti ──────────────────────
  // Misafir → 401 (hesap aç). FREE → aylık 3 analiz. PLUS → 20/ay. PRO+ → sınırsız.
  const authedUser = await getCurrentUser();
  const gate = await checkPaywall(
    authedUser?.id ?? null,
    "analyze",
    { userType: authedUser?.userType },
  );
  if (!gate.ok) {
    return NextResponse.json(paywallErrorBody(gate), {
      status: paywallHttpStatus(gate),
    });
  }

  // ─── CACHE LOOKUP ────────────────────────────────────────────
  // Hash hesapla; cache hit ise direkt dön (tutarlılık için bit-identical)
  const inputHash = computeInputHash(data);
  const cacheable =
    !!data.brand && !!data.model && !!data.year && typeof data.km === "number";
  let cachedHit = false;
  let cacheBucket: string | null = cacheable ? inputHash : null;

  if (cacheable) {
    try {
      const hit = await prisma.analysisCache.findUnique({
        where: { inputHash },
      });
      if (
        hit &&
        !hit.invalidated &&
        Date.now() - new Date(hit.createdAt).getTime() < CACHE_TTL_MS
      ) {
        // Cache hit — hit sayacını artır, aynı cevabı dön
        prisma.analysisCache
          .update({
            where: { inputHash },
            data: { hits: { increment: 1 }, lastHitAt: new Date() },
          })
          .catch(() => {});

        const cachedResult = hit.resultJson as unknown as AnalysisResult;
        const cachedMeta = hit.metaJson as unknown as AnalyzeMeta;
        cachedHit = true;

        // Feedback stub (login'de) — cache'li bile olsa user-specific kayıt gerekli
        let feedbackId: string | null = null;
        try {
          const user = authedUser;
          if (user) {
            const fb = await prisma.analysisFeedback.create({
              data: {
                userId: user.id,
                listingUrl: data.listingUrl ?? null,
                inputSnapshot: data as object,
                outputSnapshot: cachedResult as object,
                providerMeta: {
                  ...cachedMeta,
                  cached: true,
                  cacheBucket,
                } as object,
              },
              select: { id: true },
            });
            feedbackId = fb.id;
          }
        } catch (fbErr) {
          console.warn(
            "[analyze] cached feedback stub failed:",
            fbErr instanceof Error ? fbErr.message : fbErr
          );
        }

        // KM risk heuristic cached sonuç için de çalıştır (cheap, local)
        let kmRisk: { score: number; flags: string[] } | null = null;
        if (
          data.brand &&
          data.model &&
          data.year &&
          typeof data.km === "number" &&
          data.km > 0
        ) {
          try {
            const r = await detectKmRisk({
              brand: data.brand,
              model: data.model,
              year: data.year,
              km: data.km,
              listingPrice: data.askingPrice ?? null,
            });
            kmRisk = { score: r.score, flags: r.flags };
          } catch {}
        }

        console.info(
          `[analyze] cache_hit inputHash=${inputHash.slice(0, 12)} hits=${hit.hits + 1}`
        );

        return NextResponse.json({
          success: true,
          result: cachedResult,
          meta: {
            ...cachedMeta,
            provider: "otosonar",
            model: "otosonar-ai-v1",
            timestamp: new Date().toISOString(),
            emsalCount: cachedMeta.emsalCount ?? 0,
            kmRisk,
            cached: true,
            consistencyBucket: cacheBucket,
          },
          feedbackId,
        });
      }
    } catch (cacheErr) {
      console.warn(
        "[analyze] cache lookup failed:",
        cacheErr instanceof Error ? cacheErr.message : cacheErr
      );
    }
  }

  try {
    const { result, meta } = await analyzeVehicle(data);
    const emsalCount = meta.emsalCount ?? 0;

    // KM risk heuristic
    let kmRisk: { score: number; flags: string[] } | null = null;
    if (
      data.brand &&
      data.model &&
      data.year &&
      typeof data.km === "number" &&
      data.km > 0
    ) {
      try {
        const r = await detectKmRisk({
          brand: data.brand,
          model: data.model,
          year: data.year,
          km: data.km,
          listingPrice: data.askingPrice ?? null,
        });
        kmRisk = { score: r.score, flags: r.flags };
      } catch (kmErr) {
        console.warn(
          "[analyze] km-risk failed:",
          kmErr instanceof Error ? kmErr.message : kmErr
        );
      }
    }

    // ─── CACHE WRITE ──────────────────────────────────────────
    if (cacheable) {
      try {
        await prisma.analysisCache.upsert({
          where: { inputHash },
          create: {
            inputHash,
            resultJson: result as object,
            metaJson: meta as object,
          },
          update: {
            resultJson: result as object,
            metaJson: meta as object,
            invalidated: false,
            hits: 0,
            createdAt: new Date(),
            lastHitAt: new Date(),
          },
        });
      } catch (cacheErr) {
        console.warn(
          "[analyze] cache write failed:",
          cacheErr instanceof Error ? cacheErr.message : cacheErr
        );
      }
    }

    // Feedback stub
    let feedbackId: string | null = null;
    try {
      const user = await getCurrentUser();
      if (user) {
        const fb = await prisma.analysisFeedback.create({
          data: {
            userId: user.id,
            listingUrl: data.listingUrl ?? null,
            inputSnapshot: data as object,
            outputSnapshot: result as object,
            providerMeta: {
              ...meta,
              cached: false,
              cacheBucket,
            } as object,
          },
          select: { id: true },
        });
        feedbackId = fb.id;
      }
    } catch (fbErr) {
      console.warn(
        "[analyze] feedback stub failed:",
        fbErr instanceof Error ? fbErr.message : fbErr
      );
    }

    return NextResponse.json({
      success: true,
      result,
      meta: {
        ...meta,
        provider: "otosonar",
        model: "otosonar-ai-v1",
        timestamp: new Date().toISOString(),
        emsalCount,
        kmRisk,
        cached: cachedHit,
        consistencyBucket: cacheBucket,
      },
      feedbackId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
    console.error("[analyze] error:", msg);
    await logError(e, { path: "/api/analyze", metadata: { rawMessage: msg.slice(0, 500) } });

    const userMessage = /HTTP 5\d\d|UNAVAILABLE|overloaded|timeout|429/i.test(msg)
      ? "AI geçici olarak meşgul. Birkaç saniye sonra tekrar deneyin."
      : /parse fail|schema|invalid/i.test(msg)
        ? "AI beklenmedik bir cevap döndü. Lütfen tekrar deneyin."
        : "Analiz başarısız oldu.";

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
