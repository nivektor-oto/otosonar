import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Gauge, MapPin, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MODELS, getModel, getBrand } from "@/lib/brand-seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ brand: string; model: string }> };

export async function generateStaticParams() {
  return MODELS.map((m) => ({ brand: m.brandSlug, model: m.modelSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const info = getModel(brand, model);
  if (!info) return { title: "Model bulunamadı — OtoSonar" };
  return {
    title: `${info.brandDisplayName} ${info.displayName} İkinci El Fiyatları 2026 — OtoSonar`,
    description: `${info.brandDisplayName} ${info.displayName} ikinci el fiyat analizi, bilinen sorunlar, ideal alım yılları ve km beklentisi. 2026 Türkiye pazar verisi.`,
    keywords: [
      `${info.brandDisplayName} ${info.displayName} ikinci el`,
      `${info.brandDisplayName} ${info.displayName} fiyat 2026`,
      `${info.brandDisplayName} ${info.displayName} km`,
      `${info.brandDisplayName} ${info.displayName} bilinen sorunlar`,
      `${info.brandDisplayName} ${info.displayName} alım rehberi`,
    ],
    openGraph: {
      title: `${info.brandDisplayName} ${info.displayName} İkinci El Fiyatları 2026`,
      description: info.summary,
      locale: "tr_TR",
      type: "website",
    },
  };
}

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("tr-TR");

export default async function BrandModelPage({ params }: Props) {
  const { brand, model } = await params;
  const info = getModel(brand, model);
  if (!info) notFound();
  const brandInfo = getBrand(info.brandSlug);

  const whereClause = {
    brand: { equals: info.brandDisplayName, mode: "insensitive" as const },
    model: { contains: info.matchQuery, mode: "insensitive" as const },
    status: "ACTIVE" as const,
  };

  const [aggregate, featured] = await Promise.all([
    prisma.marketplaceListing.aggregate({
      where: whereClause,
      _avg: { askingPrice: true, km: true },
      _count: true,
    }),
    prisma.marketplaceListing.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const count = aggregate._count;
  const avgPrice = aggregate._avg.askingPrice;
  const avgKm = aggregate._avg.km;

  return (
    <main className="min-h-screen bg-bg text-white">
      <section className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <nav className="text-xs text-slate-400 mb-4 inline-flex items-center gap-2">
            <Link href="/marka" className="hover:text-white">
              Markalar
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/marka/${info.brandSlug}`} className="hover:text-white">
              {info.brandDisplayName}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-300">{info.displayName}</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Model analizi
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text">
              {info.brandDisplayName} {info.displayName}
            </span>{" "}
            İkinci El Fiyatları 2026
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {info.summary}
          </p>

          {count === 0 ? (
            <p className="mt-6 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Şu an için {info.brandDisplayName} {info.displayName} için aktif
              pazaryeri ilanı yok, ancak OtoSonar AI modeli 2026{" "}
              {info.brandDisplayName} {info.displayName} fiyat tahminleri
              üretebilir. Bakmakta olduğun ilanı yapıştır, saniyeler içinde
              emsal değer görüntüle.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <div className="card">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  Aktif ilan
                </div>
                <div className="text-2xl font-bold text-white">
                  {NUM.format(count)}
                </div>
              </div>
              <div className="card">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  Ortalama fiyat
                </div>
                <div className="text-2xl font-bold text-white">
                  {avgPrice ? TL.format(Math.round(avgPrice)) : "—"}
                </div>
              </div>
              <div className="card">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  Ortalama km
                </div>
                <div className="text-2xl font-bold text-white">
                  {avgKm ? `${NUM.format(Math.round(avgKm))} km` : "—"}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/analiz" className="btn-primary">
              {info.displayName} ilanını analiz et
              <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            </Link>
            <Link href="/kayit" className="btn-ghost">
              Ücretsiz kayıt
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
            Öne çıkan{" "}
            <span className="gradient-text">
              {info.brandDisplayName} {info.displayName} ilanları
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <Link
                key={l.id}
                href={`/pazaryeri/${l.id}`}
                className="card card-interactive group"
              >
                <div className="font-semibold text-sm text-white truncate">
                  {l.brand} {l.model}
                </div>
                <div className="mt-2 text-lg font-bold gradient-text">
                  {TL.format(l.askingPrice)}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="w-3 h-3" aria-hidden strokeWidth={2} />
                    {l.year}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="w-3 h-3" aria-hidden strokeWidth={2} />
                    {NUM.format(l.km)} km
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" aria-hidden strokeWidth={2} />
                    {l.city}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 py-14 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          {info.brandDisplayName} {info.displayName} bilinen sorunlar
        </h2>
        <p className="text-slate-300 leading-relaxed mb-6">
          {info.commonIssues}
        </p>

        <h3 className="text-xl font-semibold tracking-tight mb-3 text-white">
          İdeal alım yılları
        </h3>
        <p className="text-slate-300 leading-relaxed mb-6">{info.bestYears}</p>

        <h3 className="text-xl font-semibold tracking-tight mb-3 text-white">
          Tipik km beklentileri
        </h3>
        <p className="text-slate-300 leading-relaxed">{info.typicalKm}</p>

        {brandInfo && (
          <p className="mt-8 text-sm text-slate-400">
            Tüm {brandInfo.displayName} modellerini görmek için{" "}
            <Link
              href={`/marka/${brandInfo.slug}`}
              className="text-accent hover:underline"
            >
              marka sayfasına
            </Link>{" "}
            göz atabilirsiniz.
          </p>
        )}
      </section>

      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            {info.brandDisplayName} {info.displayName} ilanı mı inceleyeceksin?
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Sahibinden veya arabam.com linkini yapıştır — emsal değer, km
            sinyali ve boya durumu 8 saniyede senin önünde.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/analiz" className="btn-primary">
              İlanı analiz et
              <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            </Link>
            <Link href="/kayit" className="btn-ghost">
              Ücretsiz hesap aç
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
