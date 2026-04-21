import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { generateSecret, getOtpAuthUri, verifyCode } from "@/lib/totp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enableSchema = z.object({
  code: z.string().min(4).max(10),
  secret: z.string().min(16).max(64),
}).strict();

const disableSchema = z.object({
  code: z.string().min(4).max(10),
}).strict();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  if (user.totpEnabled) {
    return NextResponse.json({ success: true, enabled: true });
  }

  const secret = generateSecret();
  const uri = getOtpAuthUri(secret, user.email);
  return NextResponse.json({ success: true, enabled: false, secret, otpauthUri: uri });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`totp.enable:user:${user.id}:${ip}`, 10, 600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = enableSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  if (!verifyCode(parsed.data.secret, parsed.data.code)) {
    return NextResponse.json({ success: false, error: "invalid_code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: parsed.data.secret, totpEnabled: true },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ success: true });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = disableSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  if (!verifyCode(user.totpSecret, parsed.data.code)) {
    return NextResponse.json({ success: false, error: "invalid_code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null },
  });
  return NextResponse.json({ success: true });
}
