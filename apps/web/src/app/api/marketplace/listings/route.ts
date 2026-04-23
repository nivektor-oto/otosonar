import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { evaluateListingQuota, LISTING_FEE_TL } from "@/lib/marketplace-quota";
import { fireMatchingAlerts } from "@/lib/alert-matcher";
import { findDuplicates, hashPhone } from "@/lib/listing-dedup";
import { detectKmRisk } from "@/lib/km-heuristic";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  brand: z.string().min(2).max(40),
  model: z.string().min(1).max(60),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  km: z.number().int().min(0).max(2_000_000),
  city: z.string().min(2).max(40),
  bodyType: z.string().max(30).optional(),
  askingPrice: z.number().int().min(10_000).max(50_000_000),
  description: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(12).optional(),
  paintMap: z.record(z.string(), z.enum(["ORIGINAL", "PAINTED", "CHANGED", "UNKNOWN"])).optional(),
  isAuction: z.boolean().optional(),
  auctionDays: z.number().int().min(1).max(14).optional(),
  minBid: z.number().int().min(10_000).max(50_000_000).optional(),
  isUrgent: z.boolean().optional(),
  vin: z.string().max(32).optional(),
  contactPhone: z.string().max(30).optional(), // dealer.phone veya user.phone yoksa bu kullanılır
  allowDuplicate: z.boolean().optional(),       // kullanıcı uyarıyı görüp devam etmek isterse
}).strict();

// 7 gün içinde aynı telefon numarasından max 10 ilan — sonrası 429 + moderation.
const PHONE_LISTING_LIMIT_7D = 10;
const PHONE_LISTING_WINDOW_SECS = 7 * 86_400;

export async function GET() {
  const rows = await prisma.marketplaceListing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      _count: { select: { bids: true } },
    },
  });
  return NextResponse.json({
    success: true,
    listings: rows.map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      year: r.year,
      km: r.km,
      city: r.city,
      askingPrice: r.askingPrice,
      bidCount: r._count.bids,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`market.create:ip:${ip}`, 20, 3600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });

  const quota = await evaluateListingQuota(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "payment_required",
        priceTL: quota.priceTL,
        reason: quota.reason,
        limit: quota.limit,
        used: quota.used,
      },
      { status: 402 },
    );
  }

  // Açık arttırma sadece aktif Pro/Max aboneliğe izinli
  if (parsed.data.isAuction) {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "TRIAL"] },
        tier: { in: ["PRO", "MAX"] },
      },
    });
    if (!sub) {
      return NextResponse.json(
        { success: false, error: "auction_requires_pro" },
        { status: 403 },
      );
    }
  }

  // === P1 fraud detection: telefonu çöz, hashle, rate limit + dedup kontrolleri ===
  // Ham telefon saklanmaz — yalnızca hash.
  const dealer = user.userType === "DEALER"
    ? await prisma.dealer.findUnique({ where: { userId: user.id }, select: { phone: true } })
    : null;
  const rawPhone = parsed.data.contactPhone ?? dealer?.phone ?? user.phone ?? null;
  const phoneHash = hashPhone(rawPhone);

  // Phone abuse rate limit — aynı hash 7 gün içinde > PHONE_LISTING_LIMIT_7D ilan → 429
  if (phoneHash) {
    const phoneRl = await checkRateLimit(
      `market.create:phone:${phoneHash}`,
      PHONE_LISTING_LIMIT_7D,
      PHONE_LISTING_WINDOW_SECS,
    );
    if (!phoneRl.allowed) {
      // moderation queue'ya işaret — error-log olarak kalıcı kayıt
      await logError("phone_abuse_blocked", {
        level: "WARNING",
        path: "/api/marketplace/listings",
        userId: user.id,
        metadata: { phoneHash, limit: PHONE_LISTING_LIMIT_7D, windowSecs: PHONE_LISTING_WINDOW_SECS },
      }).catch(() => undefined);
      return NextResponse.json(
        {
          success: false,
          error: "phone_rate_limited",
          message: `Bu telefon numarasından son 7 günde ${PHONE_LISTING_LIMIT_7D} ilan sınırına ulaşıldı. Moderasyon inceleyecek.`,
        },
        { status: 429 },
      );
    }
  }

  // Duplicate detection
  let duplicateWarning: Awaited<ReturnType<typeof findDuplicates>> | null = null;
  try {
    duplicateWarning = await findDuplicates({
      sellerId: user.id,
      brand: parsed.data.brand,
      model: parsed.data.model,
      year: parsed.data.year,
      km: parsed.data.km,
      askingPrice: parsed.data.askingPrice,
      city: parsed.data.city,
      phone: rawPhone,
      vin: parsed.data.vin ?? null,
    });
  } catch (err) {
    await logError(err, { path: "/api/marketplace/listings#dedup", userId: user.id }).catch(() => undefined);
  }

  if (duplicateWarning && duplicateWarning.severity !== "none") {
    const forceAllowed = parsed.data.allowDuplicate === true;
    // block seviyesinde kullanıcı override edemez; warn seviyesinde override edebilir.
    const mustBlock =
      duplicateWarning.severity === "block" ||
      (duplicateWarning.severity === "warn" && !forceAllowed);
    if (mustBlock) {
      return NextResponse.json(
        {
          success: false,
          error: "duplicate",
          severity: duplicateWarning.severity,
          message:
            duplicateWarning.severity === "block"
              ? "Bu ilan halihazırda yayımlanmış görünüyor. Mevcut ilanını güncelle."
              : "Benzer bir ilanın var. Devam etmek istersen 'Yine de yayınla' seçeneğini kullan.",
          matches: duplicateWarning.matches.map((m) => ({
            listingId: m.listingId,
            createdAt: m.createdAt,
            confidence: m.confidence,
            reasons: m.reasons,
            brand: m.snapshot.brand,
            model: m.snapshot.model,
            year: m.snapshot.year,
            km: m.snapshot.km,
            askingPrice: m.snapshot.askingPrice,
            city: m.snapshot.city,
          })),
        },
        { status: 409 },
      );
    }
  }

  // KM risk
  let kmRiskScore: number | null = null;
  let kmRiskFlags: string[] | null = null;
  try {
    const km = await detectKmRisk({
      brand: parsed.data.brand,
      model: parsed.data.model,
      year: parsed.data.year,
      km: parsed.data.km,
      listingPrice: parsed.data.askingPrice,
      phoneHash,
    });
    kmRiskScore = km.score;
    kmRiskFlags = km.flags;
  } catch (err) {
    await logError(err, { path: "/api/marketplace/listings#kmRisk", userId: user.id }).catch(() => undefined);
  }

  const isAuction = parsed.data.isAuction === true;
  const auctionDays = parsed.data.auctionDays ?? 3;
  const auctionEndsAt = isAuction ? new Date(Date.now() + auctionDays * 86_400_000) : null;

  const listing = await prisma.marketplaceListing.create({
    data: {
      sellerId: user.id,
      brand: parsed.data.brand,
      model: parsed.data.model,
      year: parsed.data.year,
      km: parsed.data.km,
      city: parsed.data.city,
      bodyType: parsed.data.bodyType ?? null,
      askingPrice: parsed.data.askingPrice,
      description: parsed.data.description ?? null,
      photosJson: (parsed.data.photos ?? null) as never,
      paintMapJson: (parsed.data.paintMap ?? null) as never,
      isAuction,
      auctionEndsAt,
      minBid: parsed.data.minBid ?? null,
      isUrgent: parsed.data.isUrgent === true,
      status: "ACTIVE",
      vin: parsed.data.vin?.trim() || null,
      contactPhoneHash: phoneHash,
      kmRiskScore,
      kmRiskFlags: (kmRiskFlags ?? null) as never,
    },
  });

  // Best-effort: eşleşen price alert'leri tetikle (push gönderir)
  fireMatchingAlerts({
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    askingPrice: listing.askingPrice,
    city: listing.city,
  }).catch(() => undefined);

  return NextResponse.json({
    success: true,
    listingId: listing.id,
    feeTL: 0,
    quotaReason: quota.reason,
    kmRisk: kmRiskScore !== null ? { score: kmRiskScore, flags: kmRiskFlags ?? [] } : null,
    duplicateWarning: duplicateWarning && duplicateWarning.severity !== "none"
      ? { severity: duplicateWarning.severity, count: duplicateWarning.matches.length }
      : null,
  });
}
