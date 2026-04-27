/**
 * Provider-agnostic checkout link sistemi.
 *
 * iyzico onayı beklerken **harici** ödeme servisleri üzerinden gelir alabilirsin:
 *   - Lemon Squeezy (MoR, USD payout, en hızlı kurulum)
 *   - PayTR (TR yerli, %1.99 komisyon)
 *   - Stripe Payment Links (TR'de Stripe Atlas üzerinden)
 *   - Shopify Buy Button (mağaza şart, 3rd-party gateway gerekli)
 *
 * Her tier × billing kombinasyonu için ENV'den URL okur. URL yoksa fallback
 * /onboarding flow (iyzico beklemede). Sıfır karmaşıklık — sadece env doldur.
 *
 * Env örnekleri:
 *   PAYMENT_PLUS_MONTHLY_URL=https://otosonar.lemonsqueezy.com/checkout/buy/abc-123
 *   PAYMENT_BAYI_PLUS_YEARLY_URL=https://otosonar.lemonsqueezy.com/checkout/buy/xyz-789
 *   PAYMENT_KURUCU_URL=https://otosonar.lemonsqueezy.com/checkout/buy/kurucu-30k
 */

import type { BillingPeriod, TierKey } from "./tiers";

export type ExternalCheckoutMap = Partial<
  Record<TierKey, Partial<Record<BillingPeriod, string>>>
> & {
  /** Galerici 30K Kurucu Paket — özel tek seferlik ödeme. */
  kurucu?: string;
};

function envKey(tier: TierKey, billing: BillingPeriod): string {
  return `PAYMENT_${tier}_${billing}_URL`;
}

export function loadExternalCheckoutUrls(): ExternalCheckoutMap {
  const tiers: TierKey[] = ["PLUS", "PRO", "BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"];
  const billings: BillingPeriod[] = ["MONTHLY", "YEARLY"];
  const result: ExternalCheckoutMap = {};
  for (const t of tiers) {
    const sub: Partial<Record<BillingPeriod, string>> = {};
    for (const b of billings) {
      const url = process.env[envKey(t, b)];
      if (url && url.startsWith("http")) sub[b] = url;
    }
    if (Object.keys(sub).length > 0) result[t] = sub;
  }
  const kurucu = process.env.PAYMENT_KURUCU_URL;
  if (kurucu && kurucu.startsWith("http")) result.kurucu = kurucu;
  return result;
}

export function getCheckoutUrl(
  map: ExternalCheckoutMap,
  tier: TierKey,
  billing: BillingPeriod
): string | null {
  const t = map[tier];
  if (!t) return null;
  return t[billing] || null;
}
