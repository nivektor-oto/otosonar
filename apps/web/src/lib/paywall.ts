/**
 * Paywall middleware — server-side feature gating.
 *
 * Mantık:
 *   - Kullanıcı login değilse sadece "public" featurelar açık.
 *   - Kullanıcının aktif (ACTIVE|TRIAL) Subscription'ı yoksa FREE kabul edilir.
 *   - Her feature için hem sayısal (usage counter) hem boolean limitler kontrol edilir.
 *   - Bloklandığında, {ok:false, reason, suggestedTier} döner; caller 402 çıkarır.
 *
 * API cevap konvansiyonu:
 *   HTTP 402 Payment Required
 *   { error: "paywall", reason: "...", currentTier: "FREE", requiredTier: "PLUS", limit, used }
 *
 * Anonim (login olmayan) kullanıcıyı 401 ile ayıracağız — paywall DEĞİL, login gerekli.
 */

import { prisma } from "@/lib/prisma";
import {
  TIER_PRICING,
  type TierKey,
  getTierLimit,
  asTierKey,
  suggestTierFor,
  isUnlimited,
  compareTier,
} from "@/lib/tiers";
import type { UserType } from "@prisma/client";

// ---------------------------------------------------------------------------
// Feature sözlüğü — tek noktadan
// ---------------------------------------------------------------------------

export type PaywallFeature =
  | "public"                 // açık web sayfaları; herkes erişir
  | "analyze"                // POST /api/analyze
  | "alert.create"           // price alert ekleme
  | "favorite.add"           // saved listing
  | "listing.create"         // marketplace listing create
  | "report.advanced"        // trend rapor, gelişmiş raporlar
  | "duplicate.detection"
  | "redFlags.advanced"
  | "dealer.dashboard"
  | "dealer.whatsappBot"
  | "dealer.opportunityScanner"
  | "api.access"
  | "support.priority"
  | "verified.badge";

export type PaywallOutcome =
  | { ok: true; tier: TierKey; limit?: number; used?: number }
  | {
      ok: false;
      reason:
        | "unauthenticated"
        | "analyses_over_limit"
        | "alerts_over_limit"
        | "favorites_over_limit"
        | "listings_over_limit"
        | "feature_unavailable";
      currentTier: TierKey;
      suggestedTier: TierKey;
      limit?: number;
      used?: number;
      message: string;
    };

// ---------------------------------------------------------------------------
// Kullanıcının aktif tier'ını çöz
// ---------------------------------------------------------------------------

export async function resolveUserTier(userId: string): Promise<TierKey> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIAL"] },
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gt: new Date() } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: { tier: true },
  });
  if (!sub) return "FREE";
  return asTierKey(sub.tier as unknown as string);
}

// ---------------------------------------------------------------------------
// Kullanım sayaçları (cari ay)
// ---------------------------------------------------------------------------

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export async function countAnalysesThisMonth(userId: string): Promise<number> {
  // Analysis ve AnalysisFeedback her ikisi de "kullanıcının tetiklediği analiz"
  // anını temsil eder. AnalysisFeedback her /api/analyze POST başarısında
  // yazılır (cache'li ve yeni — tümü), Analysis tablosu feedback'e bağlı
  // zengin kayıt olabilir. İkisinden daha büyüğü sayaç olsun ki kullanıcı
  // yanıltılmasın.
  const [fb, an] = await Promise.all([
    prisma.analysisFeedback.count({
      where: { userId, createdAt: { gte: startOfMonth() } },
    }),
    prisma.analysis.count({
      where: { userId, createdAt: { gte: startOfMonth() } },
    }),
  ]);
  return Math.max(fb, an);
}

export async function countActiveAlerts(userId: string): Promise<number> {
  return prisma.priceAlert.count({ where: { userId, active: true } });
}

export async function countActiveFavorites(userId: string): Promise<number> {
  return prisma.savedListing.count({ where: { userId } });
}

export async function countActiveListings(userId: string): Promise<number> {
  return prisma.marketplaceListing.count({
    where: {
      sellerId: userId,
      status: { notIn: ["DRAFT", "WITHDRAWN", "EXPIRED", "REJECTED", "TAKEDOWN"] },
    },
  });
}

export async function countListingsThisMonth(userId: string): Promise<number> {
  return prisma.marketplaceListing.count({
    where: {
      sellerId: userId,
      status: { not: "DRAFT" },
      createdAt: { gte: startOfMonth() },
    },
  });
}

// ---------------------------------------------------------------------------
// Ana kontrol fonksiyonu
// ---------------------------------------------------------------------------

export interface CheckPaywallOpts {
  /** Eğer kullanıcının userType'ını zaten biliyorsak extra DB hit'i önlemek için. */
  userType?: UserType;
}

export async function checkPaywall(
  userId: string | null,
  feature: PaywallFeature,
  opts: CheckPaywallOpts = {},
): Promise<PaywallOutcome> {
  // Public feature → herkese açık.
  if (feature === "public") {
    return { ok: true, tier: userId ? "FREE" : "FREE" };
  }

  // Login şart olan her şey.
  if (!userId) {
    return {
      ok: false,
      reason: "unauthenticated",
      currentTier: "FREE",
      suggestedTier: "FREE",
      message: "Bu özelliği kullanmak için hesap açmanız gerekiyor.",
    };
  }

  const tier = await resolveUserTier(userId);
  const userType = opts.userType ?? null;
  const audienceHint: "b2c" | "b2b" =
    userType === "DEALER" ? "b2b" : "b2c";

  switch (feature) {
    case "analyze": {
      const limit = getTierLimit(tier, "analyses");
      if (isUnlimited(limit)) return { ok: true, tier, limit: -1 };
      const used = await countAnalysesThisMonth(userId);
      if (used >= limit) {
        return {
          ok: false,
          reason: "analyses_over_limit",
          currentTier: tier,
          suggestedTier: suggestTierFor("analyses", audienceHint),
          limit,
          used,
          message: `Bu ay ${limit} analiz hakkınızı kullandınız. Yükseltmek için Plus/Pro paketleri.`,
        };
      }
      return { ok: true, tier, limit, used };
    }

    case "alert.create": {
      const limit = getTierLimit(tier, "alerts");
      if (isUnlimited(limit)) return { ok: true, tier, limit: -1 };
      if (limit === 0) {
        return {
          ok: false,
          reason: "alerts_over_limit",
          currentTier: tier,
          suggestedTier: suggestTierFor("alerts", audienceHint),
          limit: 0,
          used: 0,
          message: "Fiyat alarmı özelliği için Plus paketine yükseltin.",
        };
      }
      const used = await countActiveAlerts(userId);
      if (used >= limit) {
        return {
          ok: false,
          reason: "alerts_over_limit",
          currentTier: tier,
          suggestedTier: suggestTierFor("alerts", audienceHint),
          limit,
          used,
          message: `Aktif fiyat alarm limitiniz doldu (${limit}). Sınırsız alarm için Pro'ya geçin.`,
        };
      }
      return { ok: true, tier, limit, used };
    }

    case "favorite.add": {
      const limit = getTierLimit(tier, "favorites");
      if (isUnlimited(limit)) return { ok: true, tier, limit: -1 };
      const used = await countActiveFavorites(userId);
      if (used >= limit) {
        return {
          ok: false,
          reason: "favorites_over_limit",
          currentTier: tier,
          suggestedTier: suggestTierFor("analyses", audienceHint),
          limit,
          used,
          message: `Favori limitiniz doldu (${limit}). Yükseltmek için Plus paketine geçin.`,
        };
      }
      return { ok: true, tier, limit, used };
    }

    case "listing.create": {
      const monthlyLimit = getTierLimit(tier, "listingsPerMonth");
      // FREE için ilan yayınlama kapalı.
      if (monthlyLimit === 0) {
        return {
          ok: false,
          reason: "listings_over_limit",
          currentTier: tier,
          suggestedTier: suggestTierFor("listings", audienceHint),
          limit: 0,
          used: 0,
          message:
            "İlan yayınlamak için Plus (bireysel) veya Bayi paketi gerekli.",
        };
      }
      if (isUnlimited(monthlyLimit)) return { ok: true, tier, limit: -1 };
      const used = await countListingsThisMonth(userId);
      if (used >= monthlyLimit) {
        return {
          ok: false,
          reason: "listings_over_limit",
          currentTier: tier,
          suggestedTier: suggestTierFor("listings", audienceHint),
          limit: monthlyLimit,
          used,
          message: `Bu ay ilan yayın limitine ulaştınız (${monthlyLimit}). Sınırsız için üst paket.`,
        };
      }
      return { ok: true, tier, limit: monthlyLimit, used };
    }

    case "report.advanced": {
      if (TIER_PRICING[tier].limits.trendReports) return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("trendReports", audienceHint),
        message: "Trend raporu Pro / Bayi paketlerinde açık.",
      };
    }

    case "duplicate.detection": {
      if (TIER_PRICING[tier].limits.duplicateDetection)
        return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("advancedRedFlags", audienceHint),
        message: "Duplicate / sahtecilik uyarıları için üst pakete geçin.",
      };
    }

    case "redFlags.advanced": {
      if (TIER_PRICING[tier].limits.advancedRedFlags)
        return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("advancedRedFlags", audienceHint),
        message: "KM risk / boya-hasar derin analizi Pro paketinde açık.",
      };
    }

    case "dealer.dashboard": {
      if (TIER_PRICING[tier].limits.dealerDashboard) return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("dealerDashboard", "b2b"),
        message: "Galerici dashboard Bayi paketlerinde açık.",
      };
    }

    case "dealer.whatsappBot": {
      if (TIER_PRICING[tier].limits.whatsappBot) return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("whatsappBot", "b2b"),
        message: "WhatsApp Business bot Bayi Pro ve üstü için.",
      };
    }

    case "dealer.opportunityScanner": {
      if (TIER_PRICING[tier].limits.opportunityScanner)
        return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("opportunityScanner", audienceHint),
        message: "Fırsat tarayıcı Pro / Bayi Pro ve üstünde.",
      };
    }

    case "api.access": {
      if (TIER_PRICING[tier].limits.apiAccess) return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: "BAYI_MAX",
        message: "API erişimi Bayi Max paketinde açık.",
      };
    }

    case "support.priority": {
      if (TIER_PRICING[tier].limits.prioritySupport)
        return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: suggestTierFor("advancedRedFlags", audienceHint),
        message: "Öncelikli destek Pro ve üstünde.",
      };
    }

    case "verified.badge": {
      if (TIER_PRICING[tier].limits.verifiedBadge) return { ok: true, tier };
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: "BAYI_MAX",
        message: "Galerici doğrulama rozeti Bayi Max paketinde açık.",
      };
    }

    default: {
      const _exhaustive: never = feature;
      void _exhaustive;
      return {
        ok: false,
        reason: "feature_unavailable",
        currentTier: tier,
        suggestedTier: "PRO",
        message: "Bu özellik paketinizde bulunmuyor.",
      };
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP response yardımcısı
// ---------------------------------------------------------------------------

export interface PaywallErrorBody {
  error: "paywall" | "unauthenticated";
  reason: string;
  currentTier: TierKey;
  requiredTier: TierKey;
  limit?: number;
  used?: number;
  message: string;
}

export function paywallErrorBody(
  outcome: Extract<PaywallOutcome, { ok: false }>,
): PaywallErrorBody {
  return {
    error: outcome.reason === "unauthenticated" ? "unauthenticated" : "paywall",
    reason: outcome.reason,
    currentTier: outcome.currentTier,
    requiredTier: outcome.suggestedTier,
    limit: outcome.limit,
    used: outcome.used,
    message: outcome.message,
  };
}

/** HTTP status kodu: 401 unauth, 402 paywall. */
export function paywallHttpStatus(
  outcome: Extract<PaywallOutcome, { ok: false }>,
): 401 | 402 {
  return outcome.reason === "unauthenticated" ? 401 : 402;
}

// ---------------------------------------------------------------------------
// Yetkilendirme yardımcıları
// ---------------------------------------------------------------------------

/** Eğer userTier required'tan düşükse false. */
export function hasMinimumTier(
  userTier: string | null | undefined,
  required: TierKey,
): boolean {
  return compareTier(asTierKey(userTier), required) >= 0;
}
