import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreListing } from "@/lib/listing-score";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  const ip = await getClientIp();
  const rl = await checkRateLimit(`listing-score:ip:${ip}`, 10, 600);
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
    const { result, provider, durationMs } = await scoreListing(parsed.data);

    // Auth'lu kullanıcıya snapshot kaydet
    const user = await getCurrentUser();
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

    return NextResponse.json({ success: true, result, meta: { provider, durationMs } });
  } catch (err) {
    await logError(err, { path: "/api/listing-score" });
    return NextResponse.json({ success: false, error: "score_failed" }, { status: 500 });
  }
}
