import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeVehicle } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { detectKmRisk } from "@/lib/km-heuristic";

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

  try {
    // Emsal sayısı lib/ai.ts içinde hesaplanıyor (computeMarketAggregates).
    // Burada tekrar sorgu yapmıyoruz — meta.emsalCount'u direkt kullanıyoruz.
    const { result, meta } = await analyzeVehicle(data);
    const emsalCount = meta.emsalCount ?? 0;

    // KM risk heuristic — brand+model+year+km hepsi varsa
    let kmRisk: { score: number; flags: string[] } | null = null;
    if (data.brand && data.model && data.year && typeof data.km === "number" && data.km > 0) {
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
        console.warn("[analyze] km-risk failed:", kmErr instanceof Error ? kmErr.message : kmErr);
      }
    }

    // Feedback stub: only for logged-in users (so we can learn from real outcomes)
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
            providerMeta: meta as object,
          },
          select: { id: true },
        });
        feedbackId = fb.id;
      }
    } catch (fbErr) {
      console.warn("[analyze] feedback stub failed:", fbErr instanceof Error ? fbErr.message : fbErr);
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
      },
      feedbackId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
    console.error("[analyze] error:", msg);

    const userMessage = /HTTP 5\d\d|UNAVAILABLE|overloaded|timeout|429/i.test(msg)
      ? "AI geçici olarak meşgul. Birkaç saniye sonra tekrar deneyin."
      : /parse fail|schema|invalid/i.test(msg)
      ? "AI beklenmedik bir cevap döndü. Lütfen tekrar deneyin."
      : "Analiz başarısız oldu.";

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
