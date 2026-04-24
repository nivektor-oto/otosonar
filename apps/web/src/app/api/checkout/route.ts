import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, getTierPriceKurus, isReady } from "@/lib/iyzico";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { featureDisabledResponse, isFeatureEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ücretli tier'lar; FREE checkout'a girmez.
// Not: Eski "MAX" enum'ı şema uyumluluğu için korunur ama UI'da artık sunulmaz.
const schema = z
  .object({
    tier: z.enum(["PLUS", "PRO", "BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"]),
    billingPeriod: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  })
  .strict();

export async function POST(req: Request) {
  if (!isFeatureEnabled("IYZICO_LIVE_INTEGRATION_ENABLED")) {
    return featureDisabledResponse("IYZICO_LIVE_INTEGRATION_ENABLED");
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  // Kullanıcı başına ve IP başına iki ayrı rate limit (abuse önleme).
  const ip = await getClientIp();
  const rlUser = await checkRateLimit(`checkout:user:${user.id}`, 10, 600);
  if (!rlUser.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited", reason: "user" },
      { status: 429 },
    );
  }
  const rlIp = await checkRateLimit(`checkout:ip:${ip}`, 20, 600);
  if (!rlIp.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited", reason: "ip" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  // Registry fiyatı zaten yıllık = 10 aylık (2 ay hediye) — ikinci katlama YOK.
  const amountKurus = getTierPriceKurus(parsed.data.tier, parsed.data.billingPeriod);

  try {
    const result = await createCheckoutSession({
      userId: user.id,
      tier: parsed.data.tier,
      billingPeriod: parsed.data.billingPeriod,
      amountKurus,
      buyerIp: ip,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      paymentIntentId: result.paymentIntentId,
      isStub: result.isStub,
      providerReady: isReady(),
    });
  } catch (err) {
    await logError(err, {
      path: "/api/checkout",
      userId: user.id,
      metadata: { tier: parsed.data.tier, billingPeriod: parsed.data.billingPeriod },
    });
    return NextResponse.json(
      { success: false, error: "checkout_failed" },
      { status: 502 },
    );
  }
}
