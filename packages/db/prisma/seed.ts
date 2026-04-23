/**
 * OtoSonar seed script.
 *
 * Run:  DATABASE_URL=<postgres-url> pnpm tsx packages/db/prisma/seed.ts
 *
 * Idempotent: upserts keyed by stable identifiers. Safe to rerun.
 * Covers:
 *   - One published MarketTrendReport for current month so /raporlar/trend
 *     is not an empty state in production.
 *
 * NOT covered (intentionally):
 *   - Admin user bootstrap — use /admin/bootstrap (built by admin-panel agent)
 *   - Subscription plans — plans live as enum + tier fields, no separate table.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function seedMarketTrendReport() {
  const period = currentPeriod();
  const existing = await prisma.marketTrendReport.findUnique({ where: { period } });
  if (existing) {
    console.log(`[seed] MarketTrendReport ${period} already present, skipping.`);
    return;
  }

  const dataJson = {
    schemaVersion: 1,
    period,
    source: "seed",
    note:
      "Lansman öncesi başlangıç raporu. Gerçek emsal veri yeterli olduğunda otomatik rapor akışıyla değişecek.",
    top: [
      {
        brand: "Renault",
        model: "Clio",
        yearRange: "2018-2021",
        medianPriceTry: 720000,
        trend30d: -1.8,
        listingCount: null,
      },
      {
        brand: "Fiat",
        model: "Egea",
        yearRange: "2019-2022",
        medianPriceTry: 865000,
        trend30d: -2.4,
        listingCount: null,
      },
      {
        brand: "Volkswagen",
        model: "Passat",
        yearRange: "2017-2020",
        medianPriceTry: 1480000,
        trend30d: +0.9,
        listingCount: null,
      },
    ],
    caveats: [
      "Bu rapor lansman öncesi başlangıç sürümüdür.",
      "Trend yüzdeleri yeterli emsal birikince otomatik güncellenir.",
      "Her rapor 'AI + galerici ağı verisi' ile üretilir; tek başına yatırım tavsiyesi değildir.",
    ],
  };

  await prisma.marketTrendReport.create({
    data: {
      period,
      title: `OtoSonar Pazar Trend Raporu — ${period}`,
      summary:
        "Bu ayın öne çıkan segmentleri, fiyat hareketleri ve galerici alım-satım paterni. Lansman başlangıç sürümü — her ay otomatik yenilenir.",
      dataJson,
      accessTier: "PRO",
    },
  });
  console.log(`[seed] MarketTrendReport ${period} created.`);
}

async function main() {
  await seedMarketTrendReport();
  console.log("[seed] done.");
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
