import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pruneExpiredBuckets } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Shared cron entry. Hit by Vercel Cron (or external scheduler) every hour.
 * Protected by CRON_SECRET bearer.
 */

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    const expired = await prisma.subscription.updateMany({
      where: {
        status: { in: ["ACTIVE", "TRIAL"] },
        currentPeriodEnd: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });
    results.subscriptionsExpired = expired.count;
  } catch (err) {
    await logError(err, { path: "/api/cron/subscriptions" });
  }

  try {
    const pruned = await pruneExpiredBuckets();
    results.rateLimitPruned = pruned;
  } catch (err) {
    await logError(err, { path: "/api/cron/rate-limit" });
  }

  try {
    const oldErrors = await prisma.errorLog.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 3600 * 1000) } },
    });
    results.errorsPruned = oldErrors.count;
  } catch (err) {
    await logError(err, { path: "/api/cron/errors-prune" });
  }

  try {
    const oldAnalytics = await prisma.analyticsEvent.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 180 * 24 * 3600 * 1000) } },
    });
    results.analyticsPruned = oldAnalytics.count;
  } catch (err) {
    await logError(err, { path: "/api/cron/analytics-prune" });
  }

  return NextResponse.json({ success: true, ranAt: new Date().toISOString(), results });
}
