import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { BidForm } from "./bid-form";

export const dynamic = "force-dynamic";

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, user] = await Promise.all([
    prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        bids: {
          where: { retracted: false },
          orderBy: { amount: "desc" },
          take: 20,
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!listing) notFound();

  const canBid = !!user && user.userType === "DEALER" && listing.sellerId !== user.id;

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h1 className="text-2xl font-bold">
            {listing.brand} {listing.model}
          </h1>
          <div className="mt-1 text-sm text-neutral-400">
            {listing.year} • {listing.km.toLocaleString("tr-TR")} km • {listing.city}
          </div>
          <div className="mt-4 text-3xl font-bold text-emerald-400">
            {TL.format(listing.askingPrice)}
          </div>
          {listing.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-300">{listing.description}</p>
          )}
        </div>

        {canBid && <BidForm listingId={listing.id} minAmount={Math.floor(listing.askingPrice * 0.5)} />}

        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="mb-3 text-sm font-semibold">
            Teklifler ({listing.bids.length})
          </h2>
          {listing.bids.length === 0 ? (
            <p className="text-sm text-neutral-500">Henüz teklif yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {listing.bids.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-neutral-400">
                    {new Date(b.createdAt).toLocaleString("tr-TR")}
                  </span>
                  <span className="font-semibold text-emerald-400">{TL.format(b.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
