import { prisma } from "@/lib/prisma";

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface Aggregates {
  totalListings: number;
  avgPrice: number;
  avgKm: number;
  topBrands: Array<{ brand: string; count: number; avgPrice: number }>;
  topCities: Array<{ city: string; count: number }>;
}

export async function buildAggregates(from: Date, to: Date): Promise<Aggregates> {
  const rows = await prisma.marketplaceListing.findMany({
    where: { createdAt: { gte: from, lt: to } },
    select: { brand: true, city: true, askingPrice: true, km: true },
    take: 10_000,
  });

  const totalListings = rows.length;
  const avgPrice = totalListings
    ? Math.round(rows.reduce((s, r) => s + r.askingPrice, 0) / totalListings)
    : 0;
  const avgKm = totalListings
    ? Math.round(rows.reduce((s, r) => s + r.km, 0) / totalListings)
    : 0;

  const brandMap = new Map<string, { count: number; total: number }>();
  for (const r of rows) {
    const key = r.brand;
    const b = brandMap.get(key) ?? { count: 0, total: 0 };
    b.count += 1;
    b.total += r.askingPrice;
    brandMap.set(key, b);
  }
  const topBrands = Array.from(brandMap.entries())
    .map(([brand, v]) => ({ brand, count: v.count, avgPrice: Math.round(v.total / v.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const cityMap = new Map<string, number>();
  for (const r of rows) cityMap.set(r.city, (cityMap.get(r.city) ?? 0) + 1);
  const topCities = Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { totalListings, avgPrice, avgKm, topBrands, topCities };
}

export async function generateReport(period: string): Promise<void> {
  const [y, m] = period.split("-").map((x) => parseInt(x, 10));
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);

  const data = await buildAggregates(from, to);

  const title = `${period} Türkiye 2. el araç piyasa özeti`;
  const summary = `${data.totalListings.toLocaleString("tr-TR")} ilan analiz edildi. Ortalama fiyat ${data.avgPrice.toLocaleString("tr-TR")} TL, ortalama km ${data.avgKm.toLocaleString("tr-TR")}. En aktif marka: ${data.topBrands[0]?.brand ?? "—"}. En aktif şehir: ${data.topCities[0]?.city ?? "—"}.`;

  await prisma.marketTrendReport.upsert({
    where: { period },
    update: { title, summary, dataJson: data as object, publishedAt: new Date() },
    create: { period, title, summary, dataJson: data as object, accessTier: "PRO" },
  });
}
