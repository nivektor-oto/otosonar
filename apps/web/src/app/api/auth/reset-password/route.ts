import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashToken, passwordStrength } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(1).max(256),
}).strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`auth.reset-confirm:ip:${ip}`, 10, 900);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  const strength = passwordStrength(parsed.data.password);
  if (!strength.ok) {
    return NextResponse.json({ success: false, error: "weak_password", detail: strength.reason }, { status: 400 });
  }

  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.authToken.findUnique({ where: { tokenHash } });
  if (!record || record.kind !== "PASSWORD_RESET" || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: "invalid_or_expired" }, { status: 400 });
  }

  const newHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: newHash } }),
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.userSession.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
