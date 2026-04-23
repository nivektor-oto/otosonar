/**
 * iyzico webhook alıcısı.
 *
 * iyzico bildirim formatı kullanılan ürüne göre değişir; iki yaygın senaryo:
 *   (A) Checkout Form tamamlandığında `token` + `iyziEventType` gelir.
 *       Bu durumda retrieveCheckoutResult ile tam sonucu doğrulayıp idempotent güncelleriz.
 *   (B) Internal integration: paymentIntentId + status + providerRef alanları iletilir (önceki stub formatı).
 *
 * İmza: X-IYZ-SIGNATURE (v1 HMAC-SHA1) veya x-iyz-signature-v3 (v3).
 * Secret: IYZICO_SECRET_KEY.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  markFailed,
  markSuccess,
  retrieveCheckoutResult,
  verifyWebhookSignature,
} from "@/lib/iyzico";
import { grantReferralBonusIfApplicable } from "@/lib/referral";
import { logError } from "@/lib/error-log";
import { featureDisabledResponse, isFeatureEnabled } from "@/lib/feature-flags";

type Tier = "PLUS" | "PRO" | "MAX";
const B2C_TIERS: readonly Tier[] = ["PLUS", "PRO", "MAX"];

function mapTier(raw: string | undefined): { tier: Tier; isB2B: boolean } | null {
  if (!raw) return null;
  if (B2C_TIERS.includes(raw as Tier)) return { tier: raw as Tier, isB2B: false };
  if (raw === "BAYI_PLUS") return { tier: "PLUS", isB2B: true };
  if (raw === "BAYI_PRO") return { tier: "PRO", isB2B: true };
  if (raw === "BAYI_MAX") return { tier: "MAX", isB2B: true };
  return null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WebhookPayloadA {
  iyziEventType?: string;
  token?: string;
  paymentConversationId?: string;
  status?: string;
}

interface WebhookPayloadB {
  paymentIntentId?: string;
  status?: string;
  providerRef?: string;
  reason?: string;
}

type WebhookPayload = WebhookPayloadA & WebhookPayloadB;

export async function POST(req: Request) {
  if (!isFeatureEnabled("IYZICO_LIVE_INTEGRATION_ENABLED")) {
    return featureDisabledResponse("IYZICO_LIVE_INTEGRATION_ENABLED");
  }
  const raw = await req.text();
  const sig =
    req.headers.get("x-iyz-signature") ??
    req.headers.get("x-iyz-signature-v3") ??
    req.headers.get("X-IYZ-SIGNATURE") ??
    null;

  if (!verifyWebhookSignature(raw, sig)) {
    await logError(new Error("invalid_signature"), {
      level: "WARNING",
      path: "/api/iyzico-webhook",
      metadata: { hasSig: !!sig, bodyLen: raw.length },
    });
    return NextResponse.json({ success: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw) as WebhookPayload;
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  await logError(new Error("iyzico_webhook_received"), {
    level: "INFO",
    path: "/api/iyzico-webhook",
    metadata: {
      eventType: payload.iyziEventType,
      hasToken: !!payload.token,
      status: payload.status,
      intentId: payload.paymentIntentId,
    },
  });

  try {
    // Senaryo A — Checkout Form webhook (token taşır)
    if (payload.token) {
      const intent = await prisma.paymentIntent.findUnique({
        where: { providerRef: payload.token },
      });
      if (!intent) {
        return NextResponse.json({ success: false, error: "intent_missing" }, { status: 404 });
      }
      // Idempotent
      if (intent.status === "SUCCESS" || intent.status === "FAILED") {
        return NextResponse.json({ success: true, idempotent: true });
      }

      const meta = intent.metadata as {
        tier?: string;
        billingPeriod?: "MONTHLY" | "YEARLY";
        conversationId?: string;
      } | null;
      const convId = payload.paymentConversationId ?? meta?.conversationId ?? intent.id;
      const result = await retrieveCheckoutResult(payload.token, convId);

      if (result.status === "success" && result.paymentStatus === "SUCCESS") {
        const paidKurus = Math.round((result.paidPrice ?? 0) * 100);
        if (paidKurus !== intent.amountKurus) {
          await markFailed(
            intent.id,
            `amount_mismatch_${paidKurus}_vs_${intent.amountKurus}`,
          );
          return NextResponse.json({ success: false, error: "amount_mismatch" }, { status: 400 });
        }
        await markSuccess(intent.id, payload.token);

        const mapped = mapTier(meta?.tier);
        if (mapped) {
          const period = meta?.billingPeriod ?? "MONTHLY";
          const periodMs =
            period === "YEARLY" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
          const existing = await prisma.subscription.findFirst({
            where: { userId: intent.userId, status: "ACTIVE" },
            orderBy: { currentPeriodEnd: "desc" },
          });
          if (existing) {
            const base =
              existing.currentPeriodEnd && existing.currentPeriodEnd > new Date()
                ? existing.currentPeriodEnd.getTime()
                : Date.now();
            await prisma.subscription.update({
              where: { id: existing.id },
              data: {
                tier: mapped.tier,
                billingPeriod: period,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(base + periodMs),
                iyzicoSubscriptionRef: payload.token,
              },
            });
          } else {
            await prisma.subscription.create({
              data: {
                userId: intent.userId,
                tier: mapped.tier,
                billingPeriod: period,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + periodMs),
                iyzicoSubscriptionRef: payload.token,
              },
            });
          }
          if (mapped.isB2B) {
            const user = await prisma.user.findUnique({ where: { id: intent.userId } });
            if (user && user.userType !== "DEALER" && user.userType !== "ADMIN") {
              await prisma.user.update({
                where: { id: intent.userId },
                data: { userType: "DEALER" },
              });
            }
          }
          await grantReferralBonusIfApplicable(intent.userId).catch(() => undefined);
        }
      } else {
        await markFailed(
          intent.id,
          result.errorMessage ?? `payment_${result.paymentStatus ?? "unknown"}`,
        );
      }

      return NextResponse.json({ success: true });
    }

    // Senaryo B — Legacy: direkt intentId + status payload
    if (payload.paymentIntentId) {
      const existing = await prisma.paymentIntent.findUnique({
        where: { id: payload.paymentIntentId },
      });
      if (!existing) {
        return NextResponse.json({ success: false, error: "intent_missing" }, { status: 404 });
      }
      if (existing.status === "SUCCESS" || existing.status === "FAILED") {
        return NextResponse.json({ success: true, idempotent: true });
      }

      if (payload.status === "SUCCESS" && payload.providerRef) {
        await markSuccess(payload.paymentIntentId, payload.providerRef);
        const meta = existing.metadata as {
          tier?: string;
          billingPeriod?: "MONTHLY" | "YEARLY";
        } | null;
        const mapped = mapTier(meta?.tier);
        if (mapped) {
          const period = meta?.billingPeriod ?? "MONTHLY";
          const periodMs =
            period === "YEARLY" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
          await prisma.subscription.create({
            data: {
              userId: existing.userId,
              tier: mapped.tier,
              billingPeriod: period,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + periodMs),
              iyzicoSubscriptionRef: payload.providerRef,
            },
          });
          if (mapped.isB2B && existing.userId) {
            const user = await prisma.user.findUnique({ where: { id: existing.userId } });
            if (user && user.userType !== "DEALER" && user.userType !== "ADMIN") {
              await prisma.user.update({
                where: { id: existing.userId },
                data: { userType: "DEALER" },
              });
            }
          }
          await grantReferralBonusIfApplicable(existing.userId).catch(() => undefined);
        }
      } else if (payload.status === "FAILED") {
        await markFailed(payload.paymentIntentId, payload.reason ?? "unknown");
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "unknown_payload" }, { status: 400 });
  } catch (err) {
    await logError(err, { path: "/api/iyzico-webhook" });
    return NextResponse.json({ success: false, error: "processing_failed" }, { status: 500 });
  }
}
