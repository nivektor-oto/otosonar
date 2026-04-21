import { NextResponse } from "next/server";
import { z } from "zod";
import { diagnose } from "@/lib/diagnose";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  brand: z.string().min(2).max(40),
  model: z.string().min(1).max(80),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  km: z.number().int().min(0).max(1_500_000).optional(),
  fuelType: z.string().max(30).optional(),
  engineSize: z.string().max(20).optional(),
  problem: z.string().min(10).max(2000),
}).strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`diagnose:ip:${ip}`, 15, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { result, provider, durationMs } = await diagnose(parsed.data);
    return NextResponse.json({ success: true, result, meta: { provider, durationMs } });
  } catch (err) {
    await logError(err, { path: "/api/diagnose" });
    return NextResponse.json({ success: false, error: "diagnose_failed" }, { status: 500 });
  }
}
