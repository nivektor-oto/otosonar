import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashToken, normalizeEmail, randomToken } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email().max(200) }).strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`auth.reset:ip:${ip}`, 5, 900);
  if (!rl.allowed) {
    return NextResponse.json({ success: true });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: true }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: true });

  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(parsed.data.email) } });
  if (user) {
    const raw = randomToken(24);
    await prisma.authToken.create({
      data: {
        userId: user.id,
        kind: "PASSWORD_RESET",
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    // TODO: Resend entegrasyonu — şu an link sadece dev log'unda.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[password-reset] ${process.env.NEXT_PUBLIC_SITE_URL}/sifre-sifirla?token=${raw}`);
    }
  }

  return NextResponse.json({ success: true });
}
