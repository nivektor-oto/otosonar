import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeGoogleCode, verifyOAuthState } from "@/lib/oauth";
import {
  USER_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  hashIp,
  normalizeEmail,
} from "@/lib/user-auth";
import { getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateToken = url.searchParams.get("state");

  if (!code || !stateToken) {
    return NextResponse.redirect(new URL("/giris?error=google_invalid_request", req.url));
  }

  const state = verifyOAuthState(stateToken);
  if (!state) {
    return NextResponse.redirect(new URL("/giris?error=google_invalid_state", req.url));
  }

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
    const redirectUri = `${base}/api/auth/google/callback`;
    const profile = await exchangeGoogleCode(code, redirectUri);
    const email = normalizeEmail(profile.email);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { id: { in: (await prisma.oAuthAccount.findMany({
              where: { provider: "google", providerAccountId: profile.id },
              select: { userId: true },
            })).map((r) => r.userId) } },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: profile.name,
          avatarUrl: profile.picture ?? null,
          emailVerified: new Date(),
          userType: "BUYER",
          kvkkConsentAt: new Date(),
        },
      });
      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: "google",
          providerAccountId: profile.id,
          email,
        },
      });

      if (state.ref) {
        const ref = await prisma.referralCode.findUnique({
          where: { code: state.ref.toUpperCase() },
        });
        if (ref && ref.ownerId !== user.id) {
          await prisma.referralRedemption.create({
            data: { code: ref.code, referredId: user.id },
          }).catch(() => undefined);
          await prisma.referralCode.update({
            where: { id: ref.id },
            data: { usesCount: { increment: 1 } },
          }).catch(() => undefined);
        }
      }
    } else {
      const existing = await prisma.oAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.id } },
      });
      if (!existing) {
        await prisma.oAuthAccount.create({
          data: { userId: user.id, provider: "google", providerAccountId: profile.id, email },
        });
      }
      if (!user.emailVerified) {
        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
      }
      if (profile.picture && !user.avatarUrl) {
        await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: profile.picture } });
      }
    }

    const ip = await getClientIp();
    const ua = req.headers.get("user-agent");
    const { cookie } = await createSession(user.id, ua, hashIp(ip));

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const res = NextResponse.redirect(new URL("/hesap", req.url));
    res.cookies.set(USER_COOKIE, cookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    await logError(err, { path: "/api/auth/google/callback" });
    return NextResponse.redirect(new URL("/giris?error=google_failed", req.url));
  }
}
