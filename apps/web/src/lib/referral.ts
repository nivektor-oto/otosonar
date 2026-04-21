import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendToUser } from "@/lib/push";

const REFERRAL_BONUS_DAYS = 30; // 1 month Plus credit per successful referral

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let out = "";
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) out += chars[bytes[i] % chars.length];
  return out;
}

export async function getOrCreateCode(userId: string): Promise<string> {
  const existing = await prisma.referralCode.findFirst({ where: { ownerId: userId } });
  if (existing) return existing.code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = genCode();
    try {
      const created = await prisma.referralCode.create({ data: { ownerId: userId, code } });
      return created.code;
    } catch {
      continue;
    }
  }
  throw new Error("referral-code-generation-failed");
}

export async function getStats(userId: string): Promise<{
  code: string;
  uses: number;
  pending: number;
  granted: number;
}> {
  const code = await getOrCreateCode(userId);
  const [redemptionCount, pendingCount, grantedCount] = await Promise.all([
    prisma.referralRedemption.count({ where: { code } }),
    prisma.referralRedemption.count({ where: { code, bonusGrantedAt: null } }),
    prisma.referralRedemption.count({ where: { code, bonusGrantedAt: { not: null } } }),
  ]);
  return { code, uses: redemptionCount, pending: pendingCount, granted: grantedCount };
}

/**
 * Invoked when a referred user converts to paid.
 * Grants REFERRAL_BONUS_DAYS credit to the referrer.
 */
export async function grantReferralBonusIfApplicable(referredUserId: string): Promise<void> {
  const redemption = await prisma.referralRedemption.findUnique({
    where: { referredId: referredUserId },
  });
  if (!redemption || redemption.bonusGrantedAt) return;

  const code = await prisma.referralCode.findUnique({ where: { code: redemption.code } });
  if (!code) return;

  await prisma.$transaction([
    prisma.creditLedger.create({
      data: {
        userId: code.ownerId,
        kind: "REFERRAL_BONUS",
        amountDays: REFERRAL_BONUS_DAYS,
        note: `Davet ettiğin kullanıcı abone oldu (${redemption.referredId})`,
        refId: redemption.id,
      },
    }),
    prisma.referralRedemption.update({
      where: { id: redemption.id },
      data: { bonusGrantedAt: new Date() },
    }),
  ]);

  sendToUser(code.ownerId, {
    title: `+${REFERRAL_BONUS_DAYS} gün Plus kazandın!`,
    body: "Davet ettiğin kullanıcı abone oldu. Krediyi hesabında görebilirsin.",
    url: "/davet",
    tag: `referral-bonus-${redemption.id}`,
  }).catch(() => undefined);
}
