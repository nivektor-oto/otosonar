import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreListing } from "@/lib/listing-score";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { detectKmRisk } from "@/lib/km-heuristic";

export const runtime = "nodejs";
export const maxDuration = 120;

const schema = z.object({
  brand: z.string().min(2).max(40),
  model: z.string().min(1).max(60),
  year: z.number().int().min(1970).max(new Date().getFullYear() + 1),
  km: z.number().int().min(0).max(2_000_000),
  city: z.string().min(2).max(40),
  askingPrice: z.number().int().min(10_000).max(50_000_000),
  bodyType: z.string().max(30).optional(),
  currentTitle: z.string().max(200).optional(),
  currentDescription: z.string().max(2000).optional(),
  photoCount: z.number().int().min(0).max(30).optional(),
}).strict();

export async function POST(req: Request) {
  // Auth durumuna göre ayrı kova: anonim çağrı havuzu daraltıldı, auth'lu
  // kullanıcılar normal limit. Maliyet sızıntısı + rakip scraping vektörü
  // koruması (audit 2026-04-26).
  const user = await getCurrentUser();
  const ip = await getClientIp();
  const rlKey = user ? `listing-score:user:${user.id}` : `listing-score:anon:${ip}`;
  const rlMax = user ? 20 : 3;
  const rl = await checkRateLimit(rlKey, rlMax, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  try {
    const { result, provider: _provider, durationMs, emsalCount } = await scoreListing(parsed.data);
    void _provider;
    if (user) {
      await prisma.listingScore.create({
        data: {
          sellerId: user.id,
          overallScore: result.overallScore,
          titleScore: result.titleScore,
          priceScore: result.priceScore,
          photoScore: result.photoScore,
          textScore: result.textScore,
          aiTitle: result.aiTitle,
          aiDescription: result.aiDescription,
          photoOrderJson: result.photoOrder as object,
          tipsJson: result.tips as object,
        },
      }).catch(() => undefined);
    }

    // KM risk heuristic
    let kmRisk: { score: number; flags: string[] } | null = null;
    try {
      const r = await detectKmRisk({
        brand: parsed.data.brand,
        model: parsed.data.model,
        year: parsed.data.year,
        km: parsed.data.km,
        listingPrice: parsed.data.askingPrice,
      });
      kmRisk = { score: r.score, flags: r.flags };
    } catch (kmErr) {
      console.warn("[listing-score] km-risk failed:", kmErr instanceof Error ? kmErr.message : kmErr);
    }

    return NextResponse.json({
      success: true,
      result,
      meta: {
        provider: "otosonar",
        model: "otosonar-ai-v1",
        durationMs,
        emsalCount: emsalCount ?? 0,
        kmRisk,
      },
    });
  } catch (err) {
    await logError(err, { path: "/api/listing-score" });
    return NextResponse.json({ success: false, error: "score_failed" }, { status: 500 });
  }
}
