import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  USER_COOKIE,
  createSession,
  hashIp,
  hashPassword,
  hashToken,
  normalizeEmail,
  passwordStrength,
  randomToken,
  SESSION_MAX_AGE,
} from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/analytics";
import { logError } from "@/lib/error-log";
import { sendEmail, verifyEmailTemplate, welcomeTemplate } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const signupSchema = z
  .object({
    email: z.string().email().max(200),
    password: z.string().min(1).max(256),
    fullName: z.string().min(2).max(80),
    userType: z.enum(["BUYER", "DEALER"]).default("BUYER"),
    referralCode: z.string().max(20).optional(),
    kvkkConsent: z.literal(true),
    marketingOptIn: z.boolean().optional(),
  })
  .strict();

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`auth.signup:ip:${ip}`, 5, 600);
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

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, password, fullName, userType, referralCode, marketingOptIn } = parsed.data;

  const strength = passwordStrength(password);
  if (!strength.ok) {
    return NextResponse.json(
      { success: false, error: "weak_password", detail: strength.reason },
      { status: 400 },
    );
  }

  const normalized = normalizeEmail(email);

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "email_in_use" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalized,
        fullName,
        userType,
        passwordHash,
        kvkkConsentAt: new Date(),
        marketingOptIn: marketingOptIn ?? false,
      },
    });

    if (referralCode) {
      const ref = await prisma.referralCode.findUnique({
        where: { code: referralCode.toUpperCase() },
      });
      if (ref && ref.ownerId !== user.id) {
        await prisma.$transaction([
          prisma.referralRedemption.create({
            data: { code: ref.code, referredId: user.id },
          }),
          prisma.referralCode.update({
            where: { id: ref.id },
            data: { usesCount: { increment: 1 } },
          }),
        ]).catch(() => undefined);
      }
    }

    const raw = randomToken(24);
    await prisma.authToken.create({
      data: {
        userId: user.id,
        kind: "EMAIL_VERIFY",
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com"}/eposta-dogrula?token=${raw}`;

    const verifyMail = verifyEmailTemplate(verifyUrl, user.fullName);
    sendEmail({ to: user.email, subject: verifyMail.subject, html: verifyMail.html }).catch(() => undefined);
    const welcome = welcomeTemplate(user.fullName, user.customerNumber);
    sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html }).catch(() => undefined);

    const ua = req.headers.get("user-agent");
    const { cookie } = await createSession(user.id, ua, hashIp(ip));
    const res = NextResponse.json({ success: true, userId: user.id, verifyUrl: process.env.NODE_ENV === "production" ? undefined : verifyUrl });
    res.cookies.set(USER_COOKIE, cookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    logEvent({ event: "signup.complete", userId: user.id, metadata: { userType } }).catch(() => undefined);

    return res;
  } catch (err) {
    await logError(err, { path: "/api/auth/signup" });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
