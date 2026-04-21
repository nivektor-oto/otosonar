import { prisma } from "@/lib/prisma";
import type { Tier } from "@prisma/client";

export const LISTING_FEE_TL = 500;
export const B2C_FREE_LIFETIME = 2;

const DEALER_MONTHLY_QUOTA: Record<Tier, number> = {
  PLUS: 7,
  PRO: 15,
  MAX: 25,
};

export type QuotaResult =
  | { allowed: true; reason: "b2c_free" | "dealer_quota"; freeRemaining: number; limit: number; used: number }
  | { allowed: false; reason: "b2c_over" | "dealer_over"; priceTL: number; limit: number; used: number };

/**
 * Decide whether a user can list for free or must pay the 500 TL flat fee.
 *
 * Rules:
 *  - BUYER users: first 2 listings lifetime are free; 3rd+ costs 500 TL each.
 *  - DEALER users with active subscription: monthly quota by tier
 *    (PLUS=7, PRO=15, MAX=25). Over the quota → 500 TL each.
 *  - DEALER users without active subscription: treated like BUYER (2 free, then 500 TL).
 */
export async function evaluateListingQuota(userId: string): Promise<QuotaResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });
  if (!user) {
    return { allowed: false, reason: "b2c_over", priceTL: LISTING_FEE_TL, limit: 0, used: 0 };
  }

  const isDealer = user.userType === "DEALER";

  const activeSub = isDealer
    ? await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["ACTIVE", "TRIAL"] },
          OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
        },
        select: { tier: true, currentPeriodStart: true },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  if (isDealer && activeSub) {
    const periodStart = activeSub.currentPeriodStart ?? startOfMonth();
    const used = await prisma.marketplaceListing.count({
      where: { sellerId: userId, createdAt: { gte: periodStart }, status: { not: "DRAFT" } },
    });
    const limit = DEALER_MONTHLY_QUOTA[activeSub.tier];
    if (used >= limit) {
      return { allowed: false, reason: "dealer_over", priceTL: LISTING_FEE_TL, limit, used };
    }
    return { allowed: true, reason: "dealer_quota", freeRemaining: limit - used, limit, used };
  }

  // BUYER (or DEALER with no active sub) — lifetime free + flat fee after
  const lifetimeUsed = await prisma.marketplaceListing.count({
    where: { sellerId: userId, status: { not: "DRAFT" } },
  });

  if (lifetimeUsed >= B2C_FREE_LIFETIME) {
    return {
      allowed: false,
      reason: "b2c_over",
      priceTL: LISTING_FEE_TL,
      limit: B2C_FREE_LIFETIME,
      used: lifetimeUsed,
    };
  }

  return {
    allowed: true,
    reason: "b2c_free",
    freeRemaining: B2C_FREE_LIFETIME - lifetimeUsed,
    limit: B2C_FREE_LIFETIME,
    used: lifetimeUsed,
  };
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
