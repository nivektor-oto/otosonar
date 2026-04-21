import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markFailed, markSuccess, verifyWebhookSignature } from "@/lib/iyzico";
import { grantReferralBonusIfApplicable } from "@/lib/referral";
import { logError } from "@/lib/error-log";

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

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-iyz-signature");

  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ success: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: { paymentIntentId?: string; status?: string; providerRef?: string; reason?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  if (!payload.paymentIntentId) {
    return NextResponse.json({ success: false, error: "missing_intent" }, { status: 400 });
  }

  try {
    if (payload.status === "SUCCESS" && payload.providerRef) {
      const existing = await prisma.paymentIntent.findUnique({
        where: { id: payload.paymentIntentId },
      });
      if (!existing) {
        return NextResponse.json({ success: false, error: "intent_missing" }, { status: 404 });
      }
      if (existing.status === "SUCCESS") {
        // Idempotent: already processed.
        return NextResponse.json({ success: true, idempotent: true });
      }

      await markSuccess(payload.paymentIntentId, payload.providerRef);

      const meta = existing.metadata as {
        tier?: string;
        billingPeriod?: "MONTHLY" | "YEARLY";
      } | null;
      const mapped = mapTier(meta?.tier);
      if (mapped) {
        const period = meta?.billingPeriod ?? "MONTHLY";
        const periodMs = period === "YEARLY" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
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
  } catch (err) {
    await logError(err, { path: "/api/iyzico-webhook" });
    return NextResponse.json({ success: false, error: "processing_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
