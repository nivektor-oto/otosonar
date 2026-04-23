import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCurrentUser, hashIp } from "@/lib/user-auth";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-log";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 30;

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export async function GET() {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`kvkk-export:ip:${ip}`, 3, 3600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const [
      sessions,
      dealer,
      broker,
      subscriptions,
      analyses,
      analysisFeedbacks,
      priceAlerts,
      savedListings,
      buyerPrefs,
      conversationsBuyer,
      conversationsSeller,
      messagesSent,
    ] = await Promise.all([
      prisma.userSession.findMany({ where: { userId: user.id } }),
      prisma.dealer.findUnique({ where: { userId: user.id } }),
      prisma.broker.findUnique({ where: { userId: user.id } }),
      prisma.subscription.findMany({ where: { userId: user.id } }),
      prisma.analysis.findMany({ where: { userId: user.id } }),
      prisma.analysisFeedback.findMany({ where: { userId: user.id } }),
      prisma.priceAlert.findMany({ where: { userId: user.id } }),
      prisma.savedListing.findMany({ where: { userId: user.id } }),
      prisma.buyerPreferences.findUnique({ where: { userId: user.id } }),
      prisma.conversation.findMany({ where: { buyerId: user.id } }),
      prisma.conversation.findMany({ where: { sellerId: user.id } }),
      prisma.message.findMany({ where: { senderId: user.id } }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
      user: {
        id: user.id,
        customerNumber: user.customerNumber,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        userType: user.userType,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        marketingOptIn: user.marketingOptIn,
        kvkkConsentAt: user.kvkkConsentAt,
        quizResult: user.quizResult,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      dealer,
      broker,
      buyerPreferences: buyerPrefs,
      subscriptions,
      analyses,
      analysisFeedbacks,
      priceAlerts,
      savedListings,
      conversations: {
        asBuyer: conversationsBuyer,
        asSeller: conversationsSeller,
        sentMessages: messagesSent,
      },
      sessions: sessions.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastSeenAt: s.lastSeenAt,
        revokedAt: s.revokedAt,
      })),
    };

    const json = JSON.stringify(exportPayload, null, 2);
    const bytes = Buffer.byteLength(json, "utf8");

    const h = await headers();
    const ua = h.get("user-agent") ?? null;

    prisma.kvkkRequest
      .create({
        data: {
          type: "EXPORT",
          userIdHash: sha256(user.id),
          emailHash: sha256(user.email.toLowerCase()),
          ipHash: hashIp(ip),
          userAgent: ua?.slice(0, 500) ?? null,
          payloadBytes: bytes,
        },
      })
      .catch(() => undefined);

    const filename = `otosonar-veri-${user.customerNumber}-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(json, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    await logError(err, { path: "/api/account/export" });
    return NextResponse.json({ success: false, error: "export_failed" }, { status: 500 });
  }
}
