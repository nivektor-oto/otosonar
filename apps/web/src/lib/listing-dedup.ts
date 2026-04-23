import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Duplicate listing detection — pazaryerinde aynı aracın birden fazla kez
 * yayınlanmasını tespit etmek için. Birkaç sinyal birleştirilir:
 *
 *   (a) Aynı telefon hash son 30 gün içinde aynı marka/model
 *   (b) Aynı VIN (şasi) — exact match
 *   (c) marka + model + yıl + km (±5%) + fiyat (±10%) son 30 gün
 *   (d) Aynı foto hash'i (DamageAnalysis.imageHash üzerinden) — opsiyonel
 *
 * Her sinyal bir `confidence` üretir (0-1); sinyaller birleştirilir.
 * Dönüş: aday eşleşmelerin listesi, en yüksek confidence önce.
 */

const HASH_SALT = process.env.IP_HASH_SALT ?? "otosonar-v1";

export function hashPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) return null;
  // Son 10 hane (TR cep: 5XXXXXXXXX) — formatlamaları tolere etmek için
  const normalized = digits.slice(-10);
  return createHash("sha256").update(HASH_SALT + "|phone|" + normalized).digest("hex").slice(0, 32);
}

export interface DedupParams {
  sellerId: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  askingPrice: number;
  city?: string | null;
  phone?: string | null;           // ham telefon — burada hashlenir
  vin?: string | null;
  photoHashes?: string[] | null;   // opsiyonel — foto perceptual hash varsa
  /** Aday aranırken hariç tutulacak listing id (güncelleme sırasında kendi id'si). */
  excludeListingId?: string | null;
  /** Ne kadar geriye bak (gün). Default 30. */
  windowDays?: number;
}

export interface DuplicateMatch {
  listingId: string;
  createdAt: Date;
  confidence: number;             // 0-1
  reasons: string[];               // ["same_phone", "km_close", "price_close", ...]
  snapshot: {
    brand: string;
    model: string;
    year: number;
    km: number;
    askingPrice: number;
    city: string;
    status: string;
  };
}

export interface DedupResult {
  matches: DuplicateMatch[];
  highestConfidence: number;
  /** >= 0.8 → yeni ilana izin verme; 0.5-0.8 → UI'da uyar. */
  severity: "none" | "warn" | "block";
}

const SEVERITY_WARN = 0.5;
const SEVERITY_BLOCK = 0.8;

export async function findDuplicates(params: DedupParams): Promise<DedupResult> {
  const windowDays = params.windowDays ?? 30;
  const since = new Date(Date.now() - windowDays * 86_400_000);
  const phoneHash = hashPhone(params.phone ?? null);
  const vin = params.vin?.trim() || null;

  // Geniş aday kümesi — aynı marka/model/yıl penceresi, +/- 1 yıl tolere et.
  const candidates = await prisma.marketplaceListing.findMany({
    where: {
      id: params.excludeListingId ? { not: params.excludeListingId } : undefined,
      createdAt: { gte: since },
      status: { in: ["ACTIVE", "DRAFT", "SOLD"] },
      brand: { equals: params.brand, mode: "insensitive" },
      model: { equals: params.model, mode: "insensitive" },
      year: { gte: params.year - 1, lte: params.year + 1 },
    },
    select: {
      id: true,
      createdAt: true,
      brand: true,
      model: true,
      year: true,
      km: true,
      askingPrice: true,
      city: true,
      status: true,
      vin: true,
      contactPhoneHash: true,
      sellerId: true,
    },
    take: 200,
    orderBy: { createdAt: "desc" },
  });

  const matches: DuplicateMatch[] = [];

  for (const c of candidates) {
    const reasons: string[] = [];
    let score = 0;

    if (c.sellerId === params.sellerId) {
      reasons.push("same_seller");
      score += 0.3;
    }
    if (phoneHash && c.contactPhoneHash && c.contactPhoneHash === phoneHash) {
      reasons.push("same_phone");
      score += 0.45;
    }
    if (vin && c.vin && c.vin.trim().toUpperCase() === vin.toUpperCase()) {
      reasons.push("same_vin");
      score += 0.9; // VIN eşleşmesi tek başına neredeyse kesin
    }

    // km ±5%
    if (params.km > 0 && c.km > 0) {
      const kmDelta = Math.abs(c.km - params.km) / Math.max(params.km, c.km);
      if (kmDelta <= 0.05) {
        reasons.push("km_close");
        score += 0.2;
      }
    }

    // price ±10%
    if (params.askingPrice > 0 && c.askingPrice > 0) {
      const priceDelta = Math.abs(c.askingPrice - params.askingPrice) / Math.max(params.askingPrice, c.askingPrice);
      if (priceDelta <= 0.10) {
        reasons.push("price_close");
        score += 0.2;
      }
    }

    // Year exact
    if (c.year === params.year) {
      reasons.push("year_exact");
      score += 0.05;
    }

    // City
    if (params.city && c.city && c.city.toLowerCase() === params.city.toLowerCase()) {
      reasons.push("same_city");
      score += 0.05;
    }

    // Photo hash eşleşmesi — opsiyonel; şu an schema'da foto hash yok (photosJson URL listesi).
    // İleride listing foto hash kaydedilirse buraya bağlanır. Placeholder şimdilik atlanıyor.

    if (score >= 0.3) {
      matches.push({
        listingId: c.id,
        createdAt: c.createdAt,
        confidence: Math.min(1, score),
        reasons,
        snapshot: {
          brand: c.brand,
          model: c.model,
          year: c.year,
          km: c.km,
          askingPrice: c.askingPrice,
          city: c.city,
          status: c.status,
        },
      });
    }
  }

  matches.sort((a, b) => b.confidence - a.confidence);
  const top = matches.slice(0, 5);
  const highest = top[0]?.confidence ?? 0;
  const severity: DedupResult["severity"] =
    highest >= SEVERITY_BLOCK ? "block" : highest >= SEVERITY_WARN ? "warn" : "none";

  return { matches: top, highestConfidence: highest, severity };
}
