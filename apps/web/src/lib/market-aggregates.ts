/**
 * Market Aggregates — OtoSonar'ın MarketplaceListing tablosunda bulunan
 * gerçek ilanları baz alan pazar istatistikleri.
 *
 * AI prompt'larına "gerçek emsal" verisi inject etmek için kullanılır.
 * Aggregate fonksiyonu 10 dakikalık in-process cache ile Neon yükünü düşürür.
 */
import { prisma } from "@/lib/prisma";

export type SampleListing = {
  brand: string;
  model: string;
  year: number;
  km: number;
  askingPrice: number;
  city: string;
  createdAt: string;
  source?: "marketplace" | "arabam" | "sahibinden";
};

export type MarketAgg = {
  count: number;
  priceAvg: number | null;
  priceMedian: number | null;
  priceP25: number | null;
  priceP75: number | null;
  kmAvg: number | null;
  kmMedian: number | null;
  dateRange: { from: string; to: string } | null;
  sampleListings: SampleListing[];
};

export interface MarketAggregateParams {
  brand: string;
  model?: string;
  variant?: string; // opsiyonel — Polo R-Line vs Trend gibi varyant kirliliğini düşürmek için
  yearMin?: number;
  yearMax?: number;
  city?: string;
  kmTolerance?: number; // +/- km band around target
  targetKm?: number;
}

// ─── 10-dakikalık in-process cache ───────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000;
type CacheEntry = { expires: number; value: MarketAgg };
const cache = new Map<string, CacheEntry>();

function cacheKey(p: MarketAggregateParams): string {
  return JSON.stringify({
    b: p.brand.toLowerCase(),
    m: p.model?.toLowerCase() ?? null,
    y1: p.yearMin ?? null,
    y2: p.yearMax ?? null,
    c: p.city?.toLowerCase() ?? null,
    kt: p.kmTolerance ?? null,
    tk: p.targetKm ?? null,
  });
}

function getCached(key: string): MarketAgg | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key: string, value: MarketAgg): void {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
}

// ─── küçük stats yardımcıları ────────────────────────────────
function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round(s / nums.length);
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return Math.round(sorted[lo] * (1 - w) + sorted[hi] * w);
}

// ─── ana sorgu ───────────────────────────────────────────────
type ListingRow = {
  brand: string;
  model: string;
  year: number;
  km: number;
  askingPrice: number;
  city: string;
  createdAt: Date;
  source: "marketplace" | "arabam" | "sahibinden";
};

async function queryListings(params: {
  brand: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  city?: string;
}): Promise<ListingRow[]> {
  const where: {
    brand: { equals: string; mode: "insensitive" };
    model?: { contains: string; mode: "insensitive" };
    year?: { gte?: number; lte?: number };
    city?: { equals: string; mode: "insensitive" };
    status: { in: ("ACTIVE" | "SOLD")[] };
  } = {
    brand: { equals: params.brand, mode: "insensitive" },
    status: { in: ["ACTIVE", "SOLD"] },
  };
  if (params.model) {
    where.model = { contains: params.model, mode: "insensitive" };
  }
  if (params.yearMin != null || params.yearMax != null) {
    where.year = {};
    if (params.yearMin != null) where.year.gte = params.yearMin;
    if (params.yearMax != null) where.year.lte = params.yearMax;
  }
  if (params.city) {
    where.city = { equals: params.city, mode: "insensitive" };
  }

  const mpRows = await prisma.marketplaceListing.findMany({
    where,
    take: 200,
    orderBy: { createdAt: "desc" },
    select: {
      brand: true,
      model: true,
      year: true,
      km: true,
      askingPrice: true,
      city: true,
      createdAt: true,
    },
  });

  return mpRows.map((r) => ({
    brand: r.brand,
    model: r.model,
    year: r.year,
    km: r.km,
    askingPrice: r.askingPrice,
    city: r.city,
    createdAt: r.createdAt,
    source: "marketplace" as const,
  }));
}

// Scraped havuzdan (Arabam/Sahibinden) eşleşen ilanları getir.
// dropped=false, priceTry/km/year NOT NULL filtresi. Sessiz fail (ham pazar verisi
// yoksa MarketplaceListing'e fallback, analiz hiç bozulmasın).
async function queryScrapedListings(params: {
  brand: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  city?: string;
}): Promise<ListingRow[]> {
  try {
    const where: {
      brand: { equals: string; mode: "insensitive" };
      model?: { contains: string; mode: "insensitive" };
      year?: { gte?: number; lte?: number };
      location?: { contains: string; mode: "insensitive" };
      dropped: boolean;
      priceTry: { not: null };
      km: { not: null };
    } = {
      brand: { equals: params.brand, mode: "insensitive" },
      dropped: false,
      priceTry: { not: null },
      km: { not: null },
    };
    if (params.model) {
      where.model = { contains: params.model, mode: "insensitive" };
    }
    if (params.yearMin != null || params.yearMax != null) {
      where.year = {};
      if (params.yearMin != null) where.year.gte = params.yearMin;
      if (params.yearMax != null) where.year.lte = params.yearMax;
    }
    if (params.city) {
      // ScrapedListing.location "Istanbul / Kadikoy" gibi serbest metin — contains filtresi
      where.location = { contains: params.city, mode: "insensitive" };
    }

    const scRows = await prisma.scrapedListing.findMany({
      where,
      take: 300,
      orderBy: { scrapedAt: "desc" },
      select: {
        brand: true,
        model: true,
        year: true,
        km: true,
        priceTry: true,
        location: true,
        scrapedAt: true,
        source: true,
      },
    });

    return scRows
      .filter((r) => r.year != null && r.km != null && r.priceTry != null)
      .map((r) => ({
        brand: r.brand,
        model: r.model,
        year: r.year as number,
        km: r.km as number,
        askingPrice: r.priceTry as number,
        city: r.location ?? "",
        createdAt: r.scrapedAt,
        source:
          r.source === "sahibinden"
            ? ("sahibinden" as const)
            : ("arabam" as const),
      }));
  } catch (err) {
    console.warn(
      "[market-agg] scraped pool query failed:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

// Marketplace + ScrapedListing birleşik sorgu. Dedupe için brand+model+year+km
// tuple'ına göre tekilleştirir (aynı araç iki kaynakta da olabilir — marketplace
// önceliklidir).
async function queryCombinedListings(params: {
  brand: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  city?: string;
}): Promise<ListingRow[]> {
  const [mp, sc] = await Promise.all([
    queryListings(params),
    queryScrapedListings(params),
  ]);

  const seen = new Set<string>();
  const merged: ListingRow[] = [];
  for (const r of [...mp, ...sc]) {
    const key = `${r.brand.toLowerCase()}|${r.model.toLowerCase()}|${r.year}|${Math.round(r.km / 1000)}|${r.askingPrice}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  // createdAt desc
  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return merged;
}

function emptyAgg(): MarketAgg {
  return {
    count: 0,
    priceAvg: null,
    priceMedian: null,
    priceP25: null,
    priceP75: null,
    kmAvg: null,
    kmMedian: null,
    dateRange: null,
    sampleListings: [],
  };
}

export async function computeMarketAggregates(
  params: MarketAggregateParams,
): Promise<MarketAgg> {
  const key = cacheKey(params);
  const cached = getCached(key);
  if (cached) return cached;

  // Yıl aralığı default'u: yearMin +/- 2 (yearMax yoksa).
  const yearMin = params.yearMin;
  const yearMax =
    params.yearMax ?? (yearMin != null ? yearMin + 4 : undefined);
  const resolvedYearMin =
    yearMin != null && params.yearMax == null ? yearMin - 2 : yearMin;

  // 1) Tercih: aynı şehir (marketplace + scraped pool)
  let rows: ListingRow[] = [];
  if (params.city) {
    try {
      rows = await queryCombinedListings({
        brand: params.brand,
        model: params.model,
        yearMin: resolvedYearMin,
        yearMax,
        city: params.city,
      });
    } catch (err) {
      console.warn(
        "[market-agg] city query failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // 2) Şehirde <5 sonuç varsa şehirsiz tekrar sorgula
  if (rows.length < 5) {
    try {
      rows = await queryCombinedListings({
        brand: params.brand,
        model: params.model,
        yearMin: resolvedYearMin,
        yearMax,
      });
    } catch (err) {
      console.warn(
        "[market-agg] broad query failed:",
        err instanceof Error ? err.message : err,
      );
      const agg = emptyAgg();
      setCached(key, agg);
      return agg;
    }
  }

  // 3) targetKm + kmTolerance verildiyse km bandını filtrele (en az 3 satır kalırsa)
  if (params.targetKm != null && params.kmTolerance != null) {
    const band = rows.filter(
      (r) =>
        Math.abs(r.km - (params.targetKm as number)) <=
        (params.kmTolerance as number),
    );
    if (band.length >= 3) rows = band;
  }

  // 4) Outlier trim — top %10 + alt %10 kırp (Civic Type R, Polo R-Line gibi
  // premium varyantlar medyanı şişiriyordu). Kalan satır en az 3 olmalı.
  if (rows.length >= 8) {
    const sortedByPrice = [...rows].sort((a, b) => a.askingPrice - b.askingPrice);
    const trimCount = Math.floor(sortedByPrice.length * 0.1);
    const trimmed = sortedByPrice.slice(trimCount, sortedByPrice.length - trimCount);
    if (trimmed.length >= 3) rows = trimmed;
  }

  if (rows.length < 3) {
    const agg: MarketAgg = {
      count: rows.length,
      priceAvg: null,
      priceMedian: null,
      priceP25: null,
      priceP75: null,
      kmAvg: null,
      kmMedian: null,
      dateRange:
        rows.length > 0
          ? {
              from: rows[rows.length - 1].createdAt.toISOString(),
              to: rows[0].createdAt.toISOString(),
            }
          : null,
      sampleListings: rows.slice(0, 5).map((r) => ({
        brand: r.brand,
        model: r.model,
        year: r.year,
        km: r.km,
        askingPrice: r.askingPrice,
        city: r.city,
        createdAt: r.createdAt.toISOString(),
        source: r.source,
      })),
    };
    setCached(key, agg);
    return agg;
  }

  const prices = rows.map((r) => r.askingPrice).sort((a, b) => a - b);
  const kms = rows.map((r) => r.km).sort((a, b) => a - b);

  const agg: MarketAgg = {
    count: rows.length,
    priceAvg: mean(prices),
    priceMedian: percentile(prices, 0.5),
    priceP25: percentile(prices, 0.25),
    priceP75: percentile(prices, 0.75),
    kmAvg: mean(kms),
    kmMedian: percentile(kms, 0.5),
    dateRange: {
      from: rows[rows.length - 1].createdAt.toISOString(),
      to: rows[0].createdAt.toISOString(),
    },
    sampleListings: rows.slice(0, 5).map((r) => ({
      brand: r.brand,
      model: r.model,
      year: r.year,
      km: r.km,
      askingPrice: r.askingPrice,
      city: r.city,
      createdAt: r.createdAt.toISOString(),
    })),
  };
  setCached(key, agg);
  return agg;
}

// ─── prompt-text serializer ─────────────────────────────────
function fmtTl(n: number | null): string {
  if (n == null) return "-";
  return `${n.toLocaleString("tr-TR")} TL`;
}

function fmtKm(n: number | null): string {
  if (n == null) return "-";
  return `${n.toLocaleString("tr-TR")} km`;
}

export function aggregatesAsPromptText(agg: MarketAgg): string {
  if (agg.count < 3) {
    const tail =
      agg.count === 0
        ? "Hiç eşleşen ilan bulunamadı."
        : `Sadece ${agg.count} eşleşme var (eşik 3).`;
    return `Gerçek pazar verisi: Bu araç için yeterli (3+) gerçek emsal yok. ${tail} Tahminin belirsizliği yüksek — emsalConfidence ≤ 0.4 olmalı ve summary'de belirsizliği belirt.`;
  }

  const sourceLabel = (s: SampleListing): string => {
    switch (s.source) {
      case "arabam":
        return "Arabam.com";
      case "sahibinden":
        return "Sahibinden";
      case "marketplace":
        return "OtoSonar";
      default:
        return "OtoSonar";
    }
  };

  const samples = agg.sampleListings
    .map(
      (s) =>
        `  - ${s.year} ${s.brand} ${s.model}, ${s.km.toLocaleString("tr-TR")} km, ${s.askingPrice.toLocaleString("tr-TR")} TL (${s.city}) [${sourceLabel(s)}]`,
    )
    .join("\n");

  const range = agg.dateRange
    ? `${agg.dateRange.from.slice(0, 10)} - ${agg.dateRange.to.slice(0, 10)}`
    : "-";

  return [
    `Gerçek pazar verisi (OtoSonar marketplace + Arabam pool, ${agg.count} eşleşme, tarih aralığı ${range}):`,
    `  Ortalama fiyat: ${fmtTl(agg.priceAvg)} (medyan ${fmtTl(agg.priceMedian)}, p25 ${fmtTl(agg.priceP25)}, p75 ${fmtTl(agg.priceP75)})`,
    `  Ortalama km: ${fmtKm(agg.kmAvg)} (medyan ${fmtKm(agg.kmMedian)})`,
    `  Örnek ilanlar:`,
    samples,
    `Bu veriyi kullan — yukarıdaki istatistikler gerçek, emsal değerini bu aralığa yakın belirle.`,
  ].join("\n");
}

export function aggregatesAsJsonBlock(agg: MarketAgg): string {
  return [
    "REAL_MARKET_DATA_JSON:",
    JSON.stringify(
      {
        count: agg.count,
        priceStats: {
          avg: agg.priceAvg,
          median: agg.priceMedian,
          p25: agg.priceP25,
          p75: agg.priceP75,
        },
        kmStats: { avg: agg.kmAvg, median: agg.kmMedian },
        sampleListings: agg.sampleListings,
      },
      null,
      2,
    ),
  ].join("\n");
}
