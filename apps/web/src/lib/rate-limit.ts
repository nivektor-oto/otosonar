import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetsAt: Date;
}

/**
 * Postgres-backed rate limiter. Durable across serverless invocations.
 * Key format: "scope:identifier" (e.g., "auth.login:ip:1.2.3.4").
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const windowEnds = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimitBucket.findUnique({
      where: { bucketKey: key },
    });

    if (!existing || existing.windowEnds < now) {
      await prisma.rateLimitBucket.upsert({
        where: { bucketKey: key },
        create: { bucketKey: key, hits: 1, windowEnds },
        update: { hits: 1, windowEnds },
      });
      return { allowed: true, remaining: max - 1, resetsAt: windowEnds };
    }

    if (existing.hits >= max) {
      return { allowed: false, remaining: 0, resetsAt: existing.windowEnds };
    }

    const updated = await prisma.rateLimitBucket.update({
      where: { bucketKey: key },
      data: { hits: { increment: 1 } },
    });
    return {
      allowed: true,
      remaining: Math.max(0, max - updated.hits),
      resetsAt: updated.windowEnds,
    };
  } catch {
    // Fail-open on DB errors so we don't brick legitimate traffic.
    return { allowed: true, remaining: max, resetsAt: windowEnds };
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

/**
 * Best-effort cleanup — call from a cron or on occasional writes.
 */
export async function pruneExpiredBuckets(): Promise<number> {
  const res = await prisma.rateLimitBucket.deleteMany({
    where: { windowEnds: { lt: new Date(Date.now() - 60_000) } },
  });
  return res.count;
}
