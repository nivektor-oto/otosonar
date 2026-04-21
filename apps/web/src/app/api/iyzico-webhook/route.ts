import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markFailed, markSuccess, verifyWebhookSignature } from "@/lib/iyzico";
import { logError } from "@/lib/error-log";

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
      await markSuccess(payload.paymentIntentId, payload.providerRef);
      const intent = await prisma.paymentIntent.findUnique({ where: { id: payload.paymentIntentId } });
      if (intent) {
        const meta = intent.metadata as { tier?: string; billingPeriod?: "MONTHLY" | "YEARLY" } | null;
        const tier = meta?.tier;
        if (tier === "PLUS" || tier === "PRO" || tier === "MAX") {
          const period = meta?.billingPeriod ?? "MONTHLY";
          const periodMs = period === "YEARLY" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
          await prisma.subscription.create({
            data: {
              userId: intent.userId,
              tier: tier,
              billingPeriod: period,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + periodMs),
              iyzicoSubscriptionRef: payload.providerRef,
            },
          });
        }
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
