import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, getTierPriceKurus, isReady } from "@/lib/iyzico";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  tier: z.enum(["PLUS", "PRO", "MAX", "BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"]),
  billingPeriod: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
}).strict();

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`checkout:ip:${ip}`, 20, 600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  const amountKurus = getTierPriceKurus(parsed.data.tier) *
    (parsed.data.billingPeriod === "YEARLY" ? 10 : 1); // 2 ay hediye yıllıkta

  const result = await createCheckoutSession({
    userId: user.id,
    tier: parsed.data.tier,
    billingPeriod: parsed.data.billingPeriod,
    amountKurus,
  });

  return NextResponse.json({
    success: true,
    checkoutUrl: result.checkoutUrl,
    paymentIntentId: result.paymentIntentId,
    isStub: result.isStub,
    providerReady: isReady(),
  });
}
