import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pazaryeri — OtoSonar" };

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function MarketplacePage() {
  const listings = await prisma.marketplaceListing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { _count: { select: { bids: true } } },
  });

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pazaryeri</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Galericiler açık ilanlara anlık teklif veriyor. (Faz 2 BETA)
            </p>
          </div>
          <Link
            href="/pazaryeri/ekle"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            İlan ekle
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-[#12121a] p-10 text-center text-sm text-neutral-500">
            Henüz aktif ilan yok. İlk sen ekle.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/pazaryeri/${l.id}`}
                className="rounded-xl border border-neutral-800 bg-[#12121a] p-4 transition hover:border-emerald-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {l.brand} {l.model}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {l.year} • {l.km.toLocaleString("tr-TR")} km • {l.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">
                      {TL.format(l.askingPrice)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {l._count.bids} teklif
                    </div>
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
