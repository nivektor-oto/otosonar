import { NextResponse } from "next/server";
import { z } from "zod";
import { readPlate } from "@/lib/vision";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const schema = z.object({
  imageBase64: z.string().min(100),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
}).strict();

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const ip = await getClientIp();
  const rl = await checkRateLimit(user ? `plate:user:${user.id}` : `plate:ip:${ip}`, user ? 60 : 10, 3600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  if (parsed.data.imageBase64.length > MAX_IMAGE_BYTES * 1.4) {
    return NextResponse.json({ success: false, error: "image_too_large" }, { status: 413 });
  }

  try {
    const out = await readPlate(parsed.data.imageBase64, parsed.data.mimeType);
    return NextResponse.json({ success: true, ...out });
  } catch (err) {
    await logError(err, { path: "/api/plate-ocr", userId: user?.id });
    return NextResponse.json({ success: false, error: "ocr_failed" }, { status: 500 });
  }
}
