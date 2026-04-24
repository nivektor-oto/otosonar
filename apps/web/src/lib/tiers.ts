/**
 * OtoSonar tier registry — single source of truth for pricing, limits, feature flags.
 *
 * Fiyat kuralı (user direktifi, 2026-04-23):
 *   - Tüm fiyatlar KDV DAHIL gösterilir.
 *   - KDV oranı: %20 (Türkiye standart SaaS).
 *     NOT: User "%45" yazdı ama TR SaaS KDV %20; %45 büyük olasılıkla
 *     "KDV + kâr marjı" karıştırılmasından. Rapor sonu user'a sorulacak.
 *   - Yıllık abonelik = 10 × aylık (2 ay bedava).
 *   - En üst paket (BAYI_MAX) yıllık 10.000 TL altı: 9.990 TL.
 *
 * Limit kuralı:
 *   -1 = sınırsız.
 *   Aylık limitler calendar month bazlı ("now" içeren ayın 1'i 00:00'dan itibaren).
 *   Lifetime limitler gerekirse ayrıca tanımlanır.
 */

export type TierKey =
  | "FREE"
  | "PLUS"
  | "PRO"
  | "BAYI_PLUS"
  | "BAYI_PRO"
  | "BAYI_MAX";

export type BillingPeriod = "MONTHLY" | "YEARLY";

// KDV oranı (user onayı bekleniyor — şu an TR standardı %20).
export const VAT_RATE = 0.20;

// Yıllık çarpan: 10 aylık fiyat = yıllık (2 ay bedava).
export const YEARLY_MULTIPLIER = 10;

export interface TierLimits {
  /** Aylık analiz hakkı. -1 = sınırsız. 0 = kapalı. */
  analyses: number;
  /** Aktif fiyat alarmı sayısı. -1 = sınırsız. */
  alerts: number;
  /** Aynı anda tutulabilir favori (SavedListing) sayısı. -1 = sınırsız. */
  favorites: number;
  /** Aktif marketplace ilan sayısı. -1 = sınırsız. 0 = ilan veremez. */
  listings: number;
  /** Aylık ilan yayın limiti (aktif olmayan + draftları saymaz). */
  listingsPerMonth: number;
  /** Aylık (pazar) trend raporu erişimi. */
  trendReports: boolean;
  /** KM risk + boya/hasar detay modülü. */
  advancedRedFlags: boolean;
  /** Duplicate/fraud detection uyarıları (ayrıntılı). */
  duplicateDetection: boolean;
  /** Galerici dashboard + stok paneli. */
  dealerDashboard: boolean;
  /** WhatsApp Business bot entegrasyonu. */
  whatsappBot: boolean;
  /** Fırsat tarayıcı (pazar araştırma). */
  opportunityScanner: boolean;
  /** Public API erişimi. */
  apiAccess: boolean;
  /** Öncelikli destek (WhatsApp + hızlı SLA). */
  prioritySupport: boolean;
  /** Galerici doğrulama rozeti (Gold). */
  verifiedBadge: boolean;
}

export interface TierConfig {
  /** UI'da gösterilecek isim. */
  label: string;
  /** Hedef kitle. */
  audience: "b2c" | "b2b";
  /** Aylık fiyat — KURUŞ. KDV dahil. 0 = Free. */
  monthlyKurus: number;
  /** Yıllık fiyat — KURUŞ. KDV dahil. 0 = Free. */
  yearlyKurus: number;
  /** Paylaşılacak kısa pitch. */
  pitch: string;
  /** Feature limitleri. */
  limits: TierLimits;
  /** Kullanıcıya gösterilecek özet bullets (UI için). */
  bullets: string[];
  /** Varsa featured badge. */
  badge?: string;
}

/**
 * Master pricing table.
 * Fiyatlar KDV dahil. Aylık × 10 = yıllık (2 ay bedava).
 */
export const TIER_PRICING: Record<TierKey, TierConfig> = {
  FREE: {
    label: "Ücretsiz",
    audience: "b2c" as const,
    monthlyKurus: 0,
    yearlyKurus: 0,
    pitch: "Hesap açan herkes için temel analiz + chatbot",
    bullets: [
      "3 analiz / ay",
      "5 favori listesi",
      "OtoSonar chatbot",
      "Topluluk pazar özeti",
    ],
    limits: {
      analyses: 3,
      alerts: 0,
      favorites: 5,
      listings: 0,
      listingsPerMonth: 0,
      trendReports: false,
      advancedRedFlags: false,
      duplicateDetection: false,
      dealerDashboard: false,
      whatsappBot: false,
      opportunityScanner: false,
      apiAccess: false,
      prioritySupport: false,
      verifiedBadge: false,
    },
  },
  PLUS: {
    label: "OtoSonar Plus",
    audience: "b2c" as const,
    monthlyKurus: 79_00,
    yearlyKurus: 790_00,
    pitch: "Aktif araç arayan bireysel kullanıcı",
    bullets: [
      "20 analiz / ay",
      "5 aktif fiyat alarmı",
      "Pazar araştırma erişimi",
      "Temel kırmızı bayrak tespiti",
      "E-posta desteği",
    ],
    limits: {
      analyses: 20,
      alerts: 5,
      favorites: 25,
      listings: 2,
      listingsPerMonth: 1,
      trendReports: false,
      advancedRedFlags: false,
      duplicateDetection: true,
      dealerDashboard: false,
      whatsappBot: false,
      opportunityScanner: false,
      apiAccess: false,
      prioritySupport: false,
      verifiedBadge: false,
    },
  },
  PRO: {
    label: "OtoSonar Pro",
    audience: "b2c" as const,
    monthlyKurus: 149_00,
    yearlyKurus: 1_490_00,
    badge: "EN POPÜLER",
    pitch: "Karar öncesi ince detay isteyen power user",
    bullets: [
      "Sınırsız analiz",
      "Sınırsız fiyat alarmı",
      "Haftalık trend raporu",
      "Duplicate + KM risk + boya-hasar tespiti",
      "İlan paylaşımı sınırsız",
      "Öncelikli destek",
    ],
    limits: {
      analyses: -1,
      alerts: -1,
      favorites: -1,
      listings: -1,
      listingsPerMonth: -1,
      trendReports: true,
      advancedRedFlags: true,
      duplicateDetection: true,
      dealerDashboard: false,
      whatsappBot: false,
      opportunityScanner: true,
      apiAccess: false,
      prioritySupport: true,
      verifiedBadge: false,
    },
  },
  BAYI_PLUS: {
    label: "Bayi Plus",
    audience: "b2b" as const,
    monthlyKurus: 299_00,
    yearlyKurus: 2_990_00,
    pitch: "Küçük galerici · aylık 5-15 araç",
    bullets: [
      "50 analiz / ay",
      "Aylık 10 ilan yayınlama",
      "Stok dashboard (temel)",
      "Fiyat alarmı sınırsız",
      "WhatsApp Business destek hattı",
    ],
    limits: {
      analyses: 50,
      alerts: -1,
      favorites: -1,
      listings: 10,
      listingsPerMonth: 10,
      trendReports: true,
      advancedRedFlags: true,
      duplicateDetection: true,
      dealerDashboard: true,
      whatsappBot: false,
      opportunityScanner: false,
      apiAccess: false,
      prioritySupport: false,
      verifiedBadge: false,
    },
  },
  BAYI_PRO: {
    label: "Bayi Pro",
    audience: "b2b" as const,
    monthlyKurus: 499_00,
    yearlyKurus: 4_990_00,
    badge: "GALERİCİ FAVORİSİ",
    pitch: "Orta ölçek galeri · stok + fırsat tarayıcı",
    bullets: [
      "Sınırsız analiz",
      "Sınırsız ilan yayınlama",
      "Stok paneli (tam)",
      "WhatsApp Business bot",
      "Fırsat tarayıcı (pazar araştırma)",
      "Fleet dashboard + trend raporu",
    ],
    limits: {
      analyses: -1,
      alerts: -1,
      favorites: -1,
      listings: -1,
      listingsPerMonth: -1,
      trendReports: true,
      advancedRedFlags: true,
      duplicateDetection: true,
      dealerDashboard: true,
      whatsappBot: true,
      opportunityScanner: true,
      apiAccess: false,
      prioritySupport: true,
      verifiedBadge: false,
    },
  },
  BAYI_MAX: {
    label: "Bayi Max",
    audience: "b2b" as const,
    monthlyKurus: 833_00,
    yearlyKurus: 9_990_00,
    badge: "KURUMSAL",
    pitch: "Büyük galerici · bayilik · 40+ araç/ay",
    bullets: [
      "Tüm Bayi Pro özellikleri",
      "Sınırsız herşey",
      "Galerici doğrulama rozeti (Gold)",
      "Öncelikli destek + özel hesap yöneticisi",
      "Public API erişimi",
      "Özel integrator (CRM/Excel)",
    ],
    limits: {
      analyses: -1,
      alerts: -1,
      favorites: -1,
      listings: -1,
      listingsPerMonth: -1,
      trendReports: true,
      advancedRedFlags: true,
      duplicateDetection: true,
      dealerDashboard: true,
      whatsappBot: true,
      opportunityScanner: true,
      apiAccess: true,
      prioritySupport: true,
      verifiedBadge: true,
    },
  },
};

export const TIER_ORDER: TierKey[] = [
  "FREE",
  "PLUS",
  "PRO",
  "BAYI_PLUS",
  "BAYI_PRO",
  "BAYI_MAX",
];

export const B2C_TIERS: TierKey[] = ["FREE", "PLUS", "PRO"];
export const B2B_TIERS: TierKey[] = ["BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"];

/** Ranking for upgrade suggestions. Higher = more features. */
const TIER_RANK: Record<TierKey, number> = {
  FREE: 0,
  PLUS: 1,
  PRO: 2,
  BAYI_PLUS: 3,
  BAYI_PRO: 4,
  BAYI_MAX: 5,
};

export function isValidTier(x: string): x is TierKey {
  return x in TIER_PRICING;
}

export function asTierKey(x: string | null | undefined): TierKey {
  return x && isValidTier(x) ? x : "FREE";
}

export function getTierConfig(tier: TierKey | string | null | undefined): TierConfig {
  return TIER_PRICING[asTierKey(tier)];
}

/**
 * Fiyatı kuruş cinsinden döndürür (KDV dahil).
 * Ücretsiz tier → 0.
 */
export function getTierPriceKurus(
  tier: TierKey | string,
  period: BillingPeriod,
): number {
  const t = TIER_PRICING[asTierKey(tier)];
  return period === "YEARLY" ? t.yearlyKurus : t.monthlyKurus;
}

/**
 * Limit değeri (numeric).
 * -1 = sınırsız, 0 = kapalı.
 */
export function getTierLimit<K extends keyof TierLimits>(
  tier: TierKey | string | null | undefined,
  key: K,
): TierLimits[K] {
  return TIER_PRICING[asTierKey(tier)].limits[key];
}

/** Numeric limit için hızlı "sınırsız mı?" kontrolü. */
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

/** Upgrade önerisi — istenen feature'a erişecek en ucuz tier. */
export function suggestTierFor(
  feature:
    | "analyses"
    | "alerts"
    | "listings"
    | "trendReports"
    | "dealerDashboard"
    | "whatsappBot"
    | "opportunityScanner"
    | "apiAccess"
    | "advancedRedFlags"
    | "verifiedBadge",
  audienceHint?: "b2c" | "b2b",
): TierKey {
  const candidates: TierKey[] =
    audienceHint === "b2b"
      ? ["BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"]
      : audienceHint === "b2c"
        ? ["PLUS", "PRO"]
        : ["PLUS", "PRO", "BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"];

  for (const t of candidates) {
    const lim = TIER_PRICING[t].limits[feature];
    if (typeof lim === "boolean" && lim) return t;
    if (typeof lim === "number" && (lim === -1 || lim > 0)) return t;
  }
  return audienceHint === "b2b" ? "BAYI_MAX" : "PRO";
}

/** "PLUS" vs "FREE" gibi iki tier karşılaştırması. positive = a > b. */
export function compareTier(a: TierKey | string, b: TierKey | string): number {
  return TIER_RANK[asTierKey(a)] - TIER_RANK[asTierKey(b)];
}

// --------------------------------------------------------------------------
// Fiyat formatlama yardımcıları (UI için)
// --------------------------------------------------------------------------

export function formatKurusToTL(kurus: number): string {
  const tl = Math.round(kurus) / 100;
  return tl.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

export function formatTierPrice(
  tier: TierKey,
  period: BillingPeriod,
): { display: string; period: string } {
  const k = getTierPriceKurus(tier, period);
  if (k === 0) return { display: "Ücretsiz", period: "" };
  return {
    display: `${formatKurusToTL(k)} TL`,
    period: period === "YEARLY" ? "/yıl" : "/ay",
  };
}

/** Aylık eşdeğer (yıllık seçildiğinde "ayda şu kadar geliyor" göstermek için). */
export function monthlyEquivalentKurus(
  tier: TierKey,
  period: BillingPeriod,
): number {
  if (period === "MONTHLY") return getTierPriceKurus(tier, "MONTHLY");
  const yearly = getTierPriceKurus(tier, "YEARLY");
  return Math.round(yearly / 12);
}
