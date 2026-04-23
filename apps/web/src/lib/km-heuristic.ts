import { prisma } from "@/lib/prisma";

/**
 * KM manipulation heuristic — server-side, AI'dan bağımsız.
 * Üç kural:
 *   (a) Yıllık ortalama km < 5.000 veya > 50.000 → flag.
 *   (b) Aynı telefon hash son 90 gün içinde aynı araç (brand+model+year) için
 *       daha yüksek km'li ilan açmışsa → flag (km gerilemesi).
 *   (c) Emsal km ortalamasından > 2 std sapma uzak → flag.
 *
 * Her flag ~25 puan ağırlığında; max 100.
 */

export interface KmRiskInput {
  brand: string;
  model: string;
  year: number;
  km: number;
  listingPrice?: number | null;
  phoneHash?: string | null;
}

export interface KmRiskResult {
  score: number;        // 0-100
  flags: string[];      // insan-okunur açıklamalar
  details: {
    yearlyKm: number | null;
    emsalMean: number | null;
    emsalStd: number | null;
    sigma: number | null;
    pastHigherKmCount: number;
  };
}

const CURRENT_YEAR = new Date().getFullYear();

export async function detectKmRisk(input: KmRiskInput): Promise<KmRiskResult> {
  const flags: string[] = [];
  let score = 0;
  const ageYears = Math.max(1, CURRENT_YEAR - input.year);
  const yearlyKm = input.km > 0 ? Math.round(input.km / ageYears) : null;

  // (a) Yıllık ortalama km dışına çıkış
  if (yearlyKm !== null) {
    if (yearlyKm < 5000) {
      flags.push(`Yıllık ortalama ${yearlyKm.toLocaleString("tr-TR")} km — olağan dışı düşük (KM düşürülmüş olabilir).`);
      score += 35;
    } else if (yearlyKm > 50000) {
      flags.push(`Yıllık ortalama ${yearlyKm.toLocaleString("tr-TR")} km — olağan dışı yüksek (ticari kullanım veya ilan hatası olabilir).`);
      score += 15;
    }
  }

  // (b) Aynı telefon son 90 gün içinde aynı araçta daha yüksek km ile ilan açmış mı?
  let pastHigherKmCount = 0;
  if (input.phoneHash) {
    const since = new Date(Date.now() - 90 * 86_400_000);
    pastHigherKmCount = await prisma.marketplaceListing.count({
      where: {
        contactPhoneHash: input.phoneHash,
        brand: { equals: input.brand, mode: "insensitive" },
        model: { equals: input.model, mode: "insensitive" },
        year: input.year,
        km: { gt: input.km },
        createdAt: { gte: since },
      },
    });
    if (pastHigherKmCount > 0) {
      flags.push(`Aynı satıcı son 90 günde aynı araçta daha yüksek km'li ilan açmış (${pastHigherKmCount} adet) — KM geriye gitmiş.`);
      score += 40;
    }
  }

  // (c) Emsal km ortalamasından > 2 std sapma
  let emsalMean: number | null = null;
  let emsalStd: number | null = null;
  let sigma: number | null = null;
  try {
    const rows = await prisma.marketplaceListing.findMany({
      where: {
        brand: { equals: input.brand, mode: "insensitive" },
        model: { equals: input.model, mode: "insensitive" },
        year: { gte: input.year - 1, lte: input.year + 1 },
        km: { gt: 0 },
        status: { in: ["ACTIVE", "SOLD"] },
      },
      select: { km: true },
      take: 200,
    });
    if (rows.length >= 8) {
      const kms = rows.map((r) => r.km);
      const mean = kms.reduce((a, b) => a + b, 0) / kms.length;
      const variance = kms.reduce((a, b) => a + (b - mean) ** 2, 0) / kms.length;
      const std = Math.sqrt(variance);
      emsalMean = Math.round(mean);
      emsalStd = Math.round(std);
      if (std > 0) {
        sigma = (input.km - mean) / std;
        if (sigma < -2) {
          flags.push(`Emsal km ortalaması ${emsalMean.toLocaleString("tr-TR")} (~${rows.length} ilan) — ilan km'si ortalamanın ${Math.abs(sigma).toFixed(1)} sigma altında.`);
          score += 25;
        }
      }
    }
  } catch {
    // sessizce geç — emsal okuma başarısızsa sinyal 0 olur.
  }

  score = Math.min(100, Math.max(0, score));
  return {
    score,
    flags,
    details: {
      yearlyKm,
      emsalMean,
      emsalStd,
      sigma,
      pastHigherKmCount,
    },
  };
}
