import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Gauge, MapPin, Plus, Search, Car } from "lucide-react";

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
    <main className="min-h-dvh bg-bg text-ink">
      {/* Başlık bandı */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
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
            className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            İlan Ekle
          </Link>
        </div>
      </div>

      {/* Sticky filter bar — Sahibinden tarzı */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <form action="/pazaryeri" method="get" className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" aria-hidden strokeWidth={2.25} />
              <input
                type="text"
                name="q"
                placeholder="Marka, model"
                className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <FilterSelect name="year" label="Yıl" options={yearOptions()} />
            <FilterSelect name="priceRange" label="Fiyat aralığı" options={PRICE_RANGES} />
            <FilterSelect name="city" label="Şehir" options={CITY_OPTIONS} />
            <button type="submit" className="btn-primary text-sm">
              Ara
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-4 text-xs text-slate-500">
              <strong className="text-slate-700">{cards.length}</strong> ilan listeleniyor
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

function FilterSelect({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name={name}
      defaultValue=""
      aria-label={label}
      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function yearOptions() {
  const now = 2026;
  const opts: Array<{ value: string; label: string }> = [];
  for (let y = now; y >= now - 20; y--) {
    opts.push({ value: String(y), label: String(y) });
  }
  return opts;
}

const PRICE_RANGES = [
  { value: "0-500000", label: "0 - 500.000 TL" },
  { value: "500000-1000000", label: "500.000 - 1.000.000 TL" },
  { value: "1000000-2000000", label: "1.000.000 - 2.000.000 TL" },
  { value: "2000000-", label: "2.000.000 TL +" },
];

const CITY_OPTIONS = [
  { value: "istanbul", label: "İstanbul" },
  { value: "ankara", label: "Ankara" },
  { value: "izmir", label: "İzmir" },
  { value: "bursa", label: "Bursa" },
  { value: "antalya", label: "Antalya" },
  { value: "konya", label: "Konya" },
];

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
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
