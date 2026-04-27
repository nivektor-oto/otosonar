import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Gauge, MapPin, Plus, Car } from "lucide-react";
import { PazaryeriFilterBar } from "./filter-bar";
import { SmartSearchBar } from "@/components/smart-search-bar";
import { PageTour } from "@/components/page-tour";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pazaryeri — OtoSonar" };

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

type SearchParams = {
  q?: string;
  year?: string;
  priceRange?: string;
  kmRange?: string;
  fuel?: string;
  gear?: string;
  city?: string;
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const listings = await prisma.marketplaceListing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 48,
    include: { _count: { select: { bids: true } } },
  });

  const cards = listings.map((l) => {
    const photos = Array.isArray(l.photosJson) ? (l.photosJson as unknown as string[]) : [];
    return { ...l, photo: photos[0] ?? null, bidCount: l._count.bids };
  });

  return (
    <main className="min-h-dvh bg-bg text-ink">
      <PageTour
        id="pazaryeri"
        version={1}
        steps={[
          {
            title: "OtoSonar Pazaryeri",
            body: "Galericilerin OtoSonar'a özel sürdüğü ilanlar burada toplanır. Her ilan AI tarafından çapraz doğrulanır — fiyat, kilometre, hasar geçmişi otomatik kontrol edilir.",
          },
          {
            selector: "h1",
            title: "Filtre + Akıllı Arama",
            body: "Arama çubuğuna 'altında 500K BMW 3 serisi' gibi doğal cümle yazabilirsin — AI sorguyu marka, model, fiyat ve yıl filtresine çevirir.",
          },
          {
            title: "DealAlert nedir?",
            body: "Bayi ortalamasının %15+ altındaki ilanlara kırmızı 'FIRSAT' rozeti düşer. Pazaryeri ana akışında bu rozetli kartlar üste çıkar.",
            cta: "Galericiyseniz: ilan açtığınızda OtoSonar otomatik fiyat skor verir.",
          },
        ]}
      />
      {/* Başlık bandı */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Pazaryeri
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-xl">
              Doğrulanmış galericiler ve bireysel kullanıcıların ilanları. İlk 2 ilan ücretsiz.
            </p>
          </div>
          <Link
            href="/pazaryeri/ekle"
            className="btn-primary inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            İlan Ekle
          </Link>
        </div>
      </div>

      {/* OtoSonar AI — doğal dilde akıllı arama */}
      <SmartSearchBar />

      {/* Sticky filter bar — masaüstü inline, mobilde bottom-sheet */}
      <PazaryeriFilterBar initial={sp} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-4 text-xs text-slate-500">
              <strong className="text-slate-700">{cards.length}</strong> ilan listeleniyor
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((l) => (
                <Link
                  key={l.id}
                  href={`/pazaryeri/${l.id}`}
                  className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition"
                >
                  <div className="relative aspect-[16/9] bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                    {l.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.photo}
                        alt={`${l.brand} ${l.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <Car className="w-8 h-8" aria-hidden strokeWidth={1.5} />
                        <span>Fotoğraf yok</span>
                      </div>
                    )}
                    {/* Durum rozeti — sağ üst */}
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500 text-white shadow">
                      Aktif
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-semibold text-sm text-slate-900 line-clamp-2 min-h-[2.5rem]">
                      {l.brand} {l.model}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="tabular-nums">{l.year}</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Gauge className="w-3 h-3" aria-hidden strokeWidth={2} />
                        {l.km.toLocaleString("tr-TR")} km
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden strokeWidth={2} />
                        {l.city}
                      </span>
                    </div>
                    <div className="pt-1 flex items-baseline justify-between">
                      <div className="text-xl font-black tabular-nums text-slate-900">
                        {TL.format(l.askingPrice)}
                      </div>
                      {l.bidCount > 0 ? (
                        <div className="text-[10px] text-amber-700 font-semibold">
                          {l.bidCount} teklif
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-5">
        <Car className="w-8 h-8 text-amber-600" aria-hidden strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">Henüz aktif ilan yok</h2>
      <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">
        İlk ilanı sen paylaş. Ana sayfada ve pazaryerinde öne çıkar. İlk 2 ilan ücretsiz.
      </p>
      <Link href="/pazaryeri/ekle" className="btn-primary inline-flex items-center gap-2">
        İlk ilanı ekle
        <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
      </Link>
    </div>
  );
}
