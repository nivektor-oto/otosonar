import { NextResponse } from "next/server";
import { z } from "zod";
import { logEvent, parseDevice } from "@/lib/analytics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  sessionId: z.string().min(8).max(80),
  event: z.string().min(1).max(80),
  path: z.string().max(300).optional(),
  referer: z.string().max(300).optional(),
  utmSource: z.string().max(60).optional(),
  utmMedium: z.string().max(60).optional(),
  utmCampaign: z.string().max(80).optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`analytics:ip:${ip}`, 240, 60);
  if (!rl.allowed) return NextResponse.json({ success: true }); // quietly drop

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });

  const user = await getCurrentUser();
  const ua = req.headers.get("user-agent");

  await logEvent({
    ...parsed.data,
    userId: user?.id ?? null,
    device: parseDevice(ua),
  });

  return NextResponse.json({ success: true });
}
