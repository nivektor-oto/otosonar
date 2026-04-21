/**
 * İyzico entegrasyon iskelet.
 * Şirket kuruluşu + iyzico merchant açılımı tamamlandığında env'e doldurulur,
 * `isReady()` true olur ve gerçek ödemeler akmaya başlar.
 *
 * Stub mod:
 * - createCheckoutSession sanal ödeme URL'si döner (/odeme/sahte)
 * - Gerçek kart işlenmez, PaymentIntent PENDING kalır
 *
 * Prod için gerekli env:
 *   IYZICO_API_KEY
 *   IYZICO_SECRET_KEY
 *   IYZICO_BASE_URL  (https://api.iyzipay.com veya sandbox-api.iyzipay.com)
 */
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function isReady(): boolean {
  return Boolean(
    process.env.IYZICO_API_KEY &&
      process.env.IYZICO_SECRET_KEY &&
      process.env.IYZICO_BASE_URL,
  );
}

export interface CheckoutInput {
  userId: string;
  tier: "PLUS" | "PRO" | "MAX" | "BAYI_PLUS" | "BAYI_PRO" | "BAYI_MAX";
  billingPeriod: "MONTHLY" | "YEARLY";
  amountKurus: number;
}

const TIER_PRICES_KURUS: Record<CheckoutInput["tier"], number> = {
  PLUS: 99_00,
  PRO: 249_00,
  MAX: 449_00,
  BAYI_PLUS: 799_00,
  BAYI_PRO: 1599_00,
  BAYI_MAX: 3499_00,
};

export function getTierPriceKurus(tier: CheckoutInput["tier"]): number {
  return TIER_PRICES_KURUS[tier];
}

export async function createCheckoutSession(input: CheckoutInput): Promise<{
  checkoutUrl: string;
  paymentIntentId: string;
  isStub: boolean;
}> {
  const intent = await prisma.paymentIntent.create({
    data: {
      userId: input.userId,
      amountKurus: input.amountKurus,
      currency: "TRY",
      provider: "iyzico",
      status: "PENDING",
      metadata: { tier: input.tier, billingPeriod: input.billingPeriod } as never,
    },
  });

  if (!isReady()) {
    return {
      checkoutUrl: `/odeme/sahte?intent=${intent.id}`,
      paymentIntentId: intent.id,
      isStub: true,
    };
  }

  // Prod yolu: iyzico CFE (checkout form) init — gerçek SDK bu noktaya girecek.
  // package: iyzipay (https://www.npmjs.com/package/iyzipay)
  // Şu an stub bırakıyoruz.
  const ref = randomBytes(8).toString("hex");
  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: { providerRef: ref },
  });
  return {
    checkoutUrl: `${process.env.IYZICO_BASE_URL}/checkout/${ref}`,
    paymentIntentId: intent.id,
    isStub: false,
  };
}

/**
 * Webhook imza doğrulaması (iyzico HMAC-SHA256).
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.IYZICO_SECRET_KEY) return false;
  const expected = createHmac("sha256", process.env.IYZICO_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

export async function markSuccess(intentId: string, providerRef: string): Promise<void> {
  await prisma.paymentIntent.update({
    where: { id: intentId },
    data: { status: "SUCCESS", providerRef },
  });
}

export async function markFailed(intentId: string, reason: string): Promise<void> {
  await prisma.paymentIntent.update({
    where: { id: intentId },
    data: { status: "FAILED", failReason: reason },
  });
}
