import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Gauge, MapPin, Plus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pazaryeri — OtoSonar" };

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function MarketplacePage() {
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
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
                Pazaryeri
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Araç ilanları <span className="gradient-text">ve teklif</span>
              </h1>
              <p className="mt-3 text-sm text-neutral-400 max-w-xl leading-relaxed">
                Kayıtlı kullanıcılar ve doğrulanmış galericilerin ilanları. İlk 2 ilan <strong className="text-white">ücretsiz</strong>; sonraki ilanlar için <strong className="text-white">500 TL sabit</strong> ücret. Galericiler için paketlere göre aylık kota (7/15/25 ilan).
              </p>
            </div>
            <Link
              href="/pazaryeri/ekle"
              className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
              İlan ekle
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((l) => (
              <Link
                key={l.id}
                href={`/pazaryeri/${l.id}`}
                className="group rounded-2xl overflow-hidden border border-border bg-panel/40 hover:border-accent/40 hover:bg-panel/60 transition"
              >
                <div className="aspect-[4/3] bg-panel flex items-center justify-center text-slate-600 text-xs overflow-hidden">
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
                <div className="p-4 space-y-2">
                  <div className="font-semibold text-sm text-white truncate">
                    {l.brand} {l.model}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>{l.year}</span>
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="w-3 h-3" aria-hidden strokeWidth={2} />
                      {l.km.toLocaleString("tr-TR")} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden strokeWidth={2} />
                      {l.city}
                    </span>
                  </div>
                  <div className="pt-1 flex items-baseline justify-between">
                    <div className="text-lg font-black tabular-nums gradient-text">
                      {TL.format(l.askingPrice)}
                    </div>
                    {l.bidCount > 0 ? (
                      <div className="text-[10px] text-amber-400 font-semibold">
                        {l.bidCount} teklif
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500">teklif bekliyor</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-panel/20 p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
        <Sparkles className="w-8 h-8 text-accent" aria-hidden strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold tracking-tight mb-2">Henüz aktif ilan yok</h2>
      <p className="text-sm text-neutral-400 max-w-md mx-auto mb-5">
        İlk ilanı sen paylaş. Ana sayfada ve pazaryerinde öne çıkar. İlk 2 ilan ücretsiz.
      </p>
      <Link href="/pazaryeri/ekle" className="btn-primary inline-flex items-center gap-2">
        İlk ilanı ekle
        <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
      </Link>
    </div>
  );
}
