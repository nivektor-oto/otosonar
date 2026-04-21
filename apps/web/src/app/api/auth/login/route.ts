import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  USER_COOKIE,
  createSession,
  hashIp,
  normalizeEmail,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/analytics";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z
  .object({
    email: z.string().email().max(200),
    password: z.string().min(1).max(256),
  })
  .strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`auth.login:ip:${ip}`, 10, 600);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "validation" },
      { status: 400 },
    );
  }

  try {
    const normalized = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    const okPassword = user && (await verifyPassword(parsed.data.password, user.passwordHash));
    if (!user || !okPassword) {
      await checkRateLimit(`auth.login.fail:ip:${ip}`, 20, 900);
      return NextResponse.json(
        { success: false, error: "invalid_credentials" },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const ua = req.headers.get("user-agent");
    const { cookie } = await createSession(user.id, ua, hashIp(ip));
    const res = NextResponse.json({ success: true, userId: user.id });
    res.cookies.set(USER_COOKIE, cookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    logEvent({ event: "login.success", userId: user.id }).catch(() => undefined);

    return res;
  } catch (err) {
    await logError(err, { path: "/api/auth/login" });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
