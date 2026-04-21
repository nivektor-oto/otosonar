import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { Bookmark, TrendingDown, Car, ArrowRight } from "lucide-react";
import { FavoritesActions } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Favorilerim — OtoSonar" };

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const rows = await prisma.savedListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          km: true,
          city: true,
          askingPrice: true,
          photosJson: true,
          status: true,
          isAuction: true,
          isUrgent: true,
        },
      },
    },
  });

  return (
    <main className="px-4 py-10 text-neutral-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider mb-3">
            <Bookmark className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Favorilerim
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kaydettiğin ilanlar</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Fiyat düşerse otomatik bildirim alırsın. Not eklemek için ilanın üzerindeki yıldıza bas.
          </p>
        </header>

        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {rows.map((s) => {
              const photos = (s.listing.photosJson as string[] | null) ?? [];
              const drop = s.savedPrice - s.listing.askingPrice;
              const dropped = drop > 0;
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-neutral-800 bg-[#12121a] p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    href={`/pazaryeri/${s.listing.id}`}
                    className="shrink-0 w-full sm:w-36 aspect-[4/3] rounded-xl bg-neutral-900 overflow-hidden border border-neutral-800 relative"
                  >
                    {photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <Car className="w-8 h-8" aria-hidden />
                      </div>
                    )}
                    {s.listing.isUrgent && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/90 text-white">
                        ACİL
                      </span>
                    )}
                    {s.listing.isAuction && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-accent text-white">
                        AÇIK ARTTIRMA
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/pazaryeri/${s.listing.id}`} className="hover:text-accent">
                      <h3 className="font-semibold text-white truncate">
                        {s.listing.brand} {s.listing.model} {s.listing.year}
                      </h3>
                    </Link>
                    <div className="mt-1 text-xs text-neutral-400 flex gap-3 flex-wrap">
                      <span>{s.listing.km.toLocaleString("tr-TR")} km</span>
                      <span>{s.listing.city}</span>
                      {s.listing.status !== "ACTIVE" && (
                        <span className="text-amber-400 font-semibold">{s.listing.status}</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                      <div className="text-lg sm:text-xl font-bold tabular-nums">
                        {TL.format(s.listing.askingPrice)}
                      </div>
                      {dropped && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <TrendingDown className="w-3 h-3" aria-hidden strokeWidth={2.5} />
                          {TL.format(drop)} düştü
                        </span>
                      )}
                      {!dropped && s.savedPrice !== s.listing.askingPrice && (
                        <span className="text-[11px] text-neutral-500">
                          Kaydettiğinde: {TL.format(s.savedPrice)}
                        </span>
                      )}
                    </div>
                    {s.note && (
                      <p className="mt-2 text-xs text-neutral-400 italic">&ldquo;{s.note}&rdquo;</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <Link
                        href={`/pazaryeri/${s.listing.id}`}
                        className="text-xs font-semibold text-accent hover:text-accent2 inline-flex items-center gap-1"
                      >
                        İlanı aç <ArrowRight className="w-3 h-3" aria-hidden strokeWidth={2.5} />
                      </Link>
                      <FavoritesActions savedId={s.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#12121a]/40 p-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
        <Bookmark className="w-6 h-6 text-amber-400" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="text-base font-semibold">Henüz favorin yok</h3>
      <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
        Pazaryerinde beğendiğin ilanda &ldquo;Favorilere ekle&rdquo; butonuna bas. Fiyat düştüğünde
        otomatik bildirim alırsın.
      </p>
      <Link
        href="/pazaryeri"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent/15 border border-accent/30 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
      >
        Pazaryerine git <ArrowRight className="w-3 h-3" aria-hidden strokeWidth={2.5} />
      </Link>
    </div>
  );
}
