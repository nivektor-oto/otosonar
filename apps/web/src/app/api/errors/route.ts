import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/error-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  path: z.string().max(300).optional(),
  sessionId: z.string().max(80).optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`errors:ip:${ip}`, 60, 60);
  if (!rl.allowed) return NextResponse.json({ success: true });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });

  await logError(new Error(parsed.data.message), {
    level: "ERROR",
    path: parsed.data.path,
    sessionId: parsed.data.sessionId,
    userAgent: req.headers.get("user-agent") ?? undefined,
    metadata: { ...parsed.data.metadata, clientStack: parsed.data.stack },
  });

  return NextResponse.json({ success: true });
}
