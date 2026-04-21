/**
 * Churn risk scoring — heuristic, refreshed offline or on-demand from founder panel.
 * Real ML (xgboost / logistic regression) eklenmeden önce signal validation için bir baseline.
 */
import { prisma } from "@/lib/prisma";

export interface ChurnSignal {
  userId: string;
  email: string;
  score: number; // 0-1
  factors: string[];
}

const DAY = 24 * 3600 * 1000;

export async function scoreUser(userId: string): Promise<ChurnSignal | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!user) return null;

  const now = Date.now();
  const factors: string[] = [];
  let score = 0;

  const daysSinceLastLogin = user.lastLoginAt ? (now - user.lastLoginAt.getTime()) / DAY : 999;
  if (daysSinceLastLogin > 14) {
    score += 0.3;
    factors.push(`${Math.round(daysSinceLastLogin)} gündür girmemiş`);
  }

  const analyses = await prisma.analysis.count({ where: { userId } });
  const analyses7d = await prisma.analysis.count({
    where: { userId, createdAt: { gte: new Date(now - 7 * DAY) } },
  });

  if (analyses > 10 && analyses7d === 0) {
    score += 0.25;
    factors.push("aktifti, son 7 gün 0 analiz");
  }

  if (user.emailVerified === null && (now - user.createdAt.getTime()) / DAY > 3) {
    score += 0.15;
    factors.push("3+ gündür e-posta doğrulamamış");
  }

  const sub = user.subscriptions[0];
  if (sub) {
    if (sub.status === "PAST_DUE") {
      score += 0.4;
      factors.push("ödeme geç kaldı");
    }
    if (sub.cancelAtPeriodEnd) {
      score += 0.5;
      factors.push("dönem sonu iptal kuyruğunda");
    }
    if (sub.status === "TRIAL" && sub.trialEndsAt && sub.trialEndsAt.getTime() - now < 3 * DAY) {
      score += 0.2;
      factors.push("trial 3 günden az");
    }
  } else {
    const daysSinceSignup = (now - user.createdAt.getTime()) / DAY;
    if (daysSinceSignup > 7 && analyses < 3) {
      score += 0.2;
      factors.push("abone değil + 7 günden az aktif");
    }
  }

  return {
    userId: user.id,
    email: user.email,
    score: Math.min(1, score),
    factors,
  };
}

export async function topRiskUsers(limit = 50): Promise<ChurnSignal[]> {
  const users = await prisma.user.findMany({
    where: { userType: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true },
  });

  const signals: ChurnSignal[] = [];
  for (const u of users) {
    const s = await scoreUser(u.id);
    if (s && s.score > 0.3) signals.push(s);
  }
  signals.sort((a, b) => b.score - a.score);
  return signals.slice(0, limit);
}
