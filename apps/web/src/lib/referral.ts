import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

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
}> {
  const code = await getOrCreateCode(userId);
  const [redemptionCount, pendingCount] = await Promise.all([
    prisma.referralRedemption.count({ where: { code } }),
    prisma.referralRedemption.count({ where: { code, bonusGrantedAt: null } }),
  ]);
  return { code, uses: redemptionCount, pending: pendingCount };
}
