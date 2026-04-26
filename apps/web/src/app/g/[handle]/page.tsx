import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LogoMark } from "@/components/logo";
import { MapPin, ShieldCheck, Gauge, ArrowRight, Phone, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const dealer = await prisma.dealer.findUnique({ where: { handle: handle.toLowerCase() } });
  if (!dealer) return { title: "Bulunamadı — OtoSonar" };
  return {
    title: `${dealer.companyName} — Galerici Profili · OtoSonar`,
    description: dealer.bio ?? `${dealer.companyName} galericinin OtoSonar üzerindeki araç stoğu ve iletişim bilgileri.`,
  };
}

export default async function DealerPublicProfile({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const lower = handle.toLowerCase();

  const dealer = await prisma.dealer.findUnique({ where: { handle: lower } });
  if (!dealer) return notFound();

  // Galericinin açık ilanları (MarketplaceListing tarafından)
  const listings = await prisma.marketplaceListing.findMany({
    where: { sellerId: dealer.userId, status: "ACTIVE" },
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    take: 24,
    include: { _count: { select: { bids: true } } },
  });

  const cards = listings.map((l) => {
    const photos = Array.isArray(l.photosJson) ? (l.photosJson as unknown as string[]) : [];
    return { ...l, photo: photos[0] ?? null, bidCount: l._count.bids };
  });

  const verified = dealer.verificationStatus === "VERIFIED";

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <nav className="sticky top-0 z-30 backdrop-blur-lg bg-bg/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-lg font-black gradient-text">OtoSonar</span>
          </Link>
          <Link href="/pazaryeri" className="btn-ghost text-sm inline-flex items-center gap-2">
            Pazaryerine dön
          </Link>
        </div>
      </nav>

      <header className="border-b border-border bg-gradient-to-b from-accent/8 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-accent">
                {dealer.companyName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                  {dealer.companyName}
                </h1>
                {verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
                    OtoSonar Onaylı
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" aria-hidden strokeWidth={2} />
                  {dealer.cityId}
                </span>
                <span className="font-mono">@{dealer.handle}</span>
              </div>
              {dealer.bio && (
                <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xl">{dealer.bio}</p>
              )}
              {dealer.phone && (
                <a
                  href={`tel:${dealer.phone.replace(/\s+/g, "")}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-panel/60 border border-border px-4 py-1.5 text-sm font-semibold hover:border-accent/40"
                >
                  <Phone className="w-3.5 h-3.5 text-accent" aria-hidden strokeWidth={2.5} />
                  {dealer.phone}
                </a>
              )}
            </div>
            {!verified && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300 max-w-sm">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
                  Doğrulanmamış galerici
                </div>
                Firma doğrulaması henüz tamamlanmadı. İlanlara dikkat ederek teklif ver.
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl font-bold">
            Aktif ilanlar ({cards.length})
          </h2>
          <Link
            href="/pazaryeri"
            className="text-xs text-accent hover:text-accent2 font-semibold inline-flex items-center gap-1"
          >
            Tüm pazaryeri <ArrowRight className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-panel/20 p-10 text-center">
            <p className="text-sm text-slate-400">
              Şu anda aktif ilan yok. Galericinin yeni ilanları burada listelenecek.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((l) => (
              <Link
                key={l.id}
                href={`/pazaryeri/${l.id}`}
                className="group rounded-2xl overflow-hidden border border-border bg-panel/40 hover:border-accent/40 hover:bg-panel/60 transition"
              >
                <div className="relative aspect-[4/3] bg-panel flex items-center justify-center text-slate-600 text-xs overflow-hidden">
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
                  {l.isUrgent && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Acil
                    </div>
                  )}
                  {l.isAuction && (
                    <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-accent text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Açık arttırma
                    </div>
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
                    <span>{l.city}</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-lg font-black tabular-nums gradient-text">
                      {l.askingPrice.toLocaleString("tr-TR")} TL
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
        )}
      </div>
    </main>
  );
}
