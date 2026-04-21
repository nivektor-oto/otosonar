import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, ArrowRight, Gauge } from "lucide-react";

type ListingCard = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  city: string;
  askingPrice: number;
  photo: string | null;
  bidCount: number;
};

async function fetchRecent(): Promise<ListingCard[]> {
  try {
    const rows = await prisma.marketplaceListing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { _count: { select: { bids: true } } },
    });
    return rows.map((r) => {
      const photos = Array.isArray(r.photosJson) ? (r.photosJson as unknown as string[]) : [];
      return {
        id: r.id,
        brand: r.brand,
        model: r.model,
        year: r.year,
        km: r.km,
        city: r.city,
        askingPrice: r.askingPrice,
        photo: photos[0] ?? null,
        bidCount: r._count.bids,
      };
    });
  } catch {
    return [];
  }
}

// Lansmandan önce ilanlar seyrek olabilir — boş durumda sahte sample yerine
// boş state göster; insanlar gerçek olmadığını görünce güveni sarsar, onun yerine
// kısa bir açıklama + "ilk ilanı sen paylaş" CTA koy.
const PLACEHOLDER_ACTIVE = true;

export async function MarketplacePreview() {
  const listings = await fetchRecent();
  const hasRealData = listings.length > 0;

  if (!hasRealData && !PLACEHOLDER_ACTIVE) return null;

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
              Pazaryeri
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {hasRealData ? "Son eklenen ilanlar" : "Pazaryeri hazırlanıyor"}
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              {hasRealData
                ? "Kullanıcıların paylaştığı son ilanlar — ilk 2 ilanın ücretsiz, sonrası ilan başına 500 TL sabit."
                : "İlk ilanı sen paylaş. Yeni başlayanlar için ilk 2 ilan ücretsiz, sonrası 500 TL sabit."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pazaryeri/ekle"
              className="btn-ghost text-sm inline-flex items-center gap-2"
            >
              İlan ekle
            </Link>
            <Link
              href="/pazaryeri"
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              Tümünü gör
              <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {hasRealData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/pazaryeri/${l.id}`}
                className="group rounded-2xl overflow-hidden border border-border bg-panel/40 hover:border-accent/40 hover:bg-panel/60 transition"
              >
                <div className="aspect-[4/3] bg-panel flex items-center justify-center text-slate-600 text-sm overflow-hidden">
                  {l.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.photo}
                      alt={`${l.brand} ${l.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <span>Fotoğraf yok</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-sm text-white truncate">
                    {l.brand} {l.model} · {l.year}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="w-3 h-3" aria-hidden strokeWidth={2} />
                      {l.km.toLocaleString("tr-TR")} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden strokeWidth={2} />
                      {l.city}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-lg font-black tabular-nums gradient-text">
                      {l.askingPrice.toLocaleString("tr-TR")} <span className="text-xs text-slate-400 font-normal">TL</span>
                    </div>
                    {l.bidCount > 0 && (
                      <div className="text-[10px] text-amber-400 font-semibold">
                        {l.bidCount} teklif
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyMarketplace />
        )}
      </div>
    </section>
  );
}

function EmptyMarketplace() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-panel/20 p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
        <Gauge className="w-7 h-7 text-accent" aria-hidden strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">
        İlk ilanı sen paylaş
      </h3>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
        Pazaryeri lansmanla birlikte açılıyor. Erken paylaşan ilanlar ana sayfada öne çıkar. İlk 2 ilan ücretsiz.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Link href="/pazaryeri/ekle" className="btn-primary inline-flex items-center gap-2">
          İlan paylaş
        </Link>
        <Link href="/pazaryeri" className="btn-ghost inline-flex items-center gap-2">
          Pazaryerine bak
        </Link>
      </div>
    </div>
  );
}
