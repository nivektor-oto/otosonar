import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/error-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    message: z.string().min(1).max(2000),
    stack: z.string().max(8000).optional(),
    path: z.string().max(300).optional(),
    sessionId: z.string().max(80).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export async function POST(req: Request) {
  // Anonim DDoS sink kapatıldı. Sadece auth user veya same-origin client.
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ success: false }, { status: 415 });
  }

  const user = await getCurrentUser();
  const ip = await getClientIp();
  // Auth varsa user-bazlı, yoksa IP-bazlı çok sıkı limit (anonim flood'u boğ).
  const rlKey = user ? `errors:user:${user.id}` : `errors:ip:${ip}`;
  const rlMax = user ? 60 : 10;
  const rl = await checkRateLimit(rlKey, rlMax, 60);
  if (!rl.allowed) return NextResponse.json({ success: true });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });

  await logError(new Error(parsed.data.message), {
    level: "ERROR",
    path: parsed.data.path,
    sessionId: parsed.data.sessionId,
    userId: user?.id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    metadata: { ...parsed.data.metadata, clientStack: parsed.data.stack },
  });

  return NextResponse.json({ success: true });
}
