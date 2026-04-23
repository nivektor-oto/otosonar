import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import Link from "next/link";
import { BidForm } from "./bid-form";
import { AcceptBidButton } from "./accept-button";
import { MessageSellerButton } from "./message-seller-button";
import { SaveListingButton } from "./save-button";

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

  const savedRow = user
    ? await prisma.savedListing.findUnique({
        where: { userId_listingId: { userId: user.id, listingId: listing.id } },
        select: { id: true },
      })
    : null;

  const isOwner = !!user && listing.sellerId === user.id;
  const canBid =
    !!user &&
    (user.userType === "DEALER" || user.userType === "BROKER") &&
    !isOwner &&
    listing.status === "ACTIVE";
  const photos = (listing.photosJson as string[] | null) ?? [];

  const statusColor = ({
    ACTIVE: "text-emerald-400",
    SOLD: "text-amber-400",
    DRAFT: "text-neutral-500",
    WITHDRAWN: "text-neutral-500",
    EXPIRED: "text-neutral-500",
    REJECTED: "text-red-400",
    TAKEDOWN: "text-red-400",
  } as Record<string, string>)[listing.status] ?? "text-neutral-500";

  return (
    <main className="px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {listing.brand} {listing.model}
              </h1>
              <div className="mt-1 text-sm text-neutral-400">
                {listing.year} • {listing.km.toLocaleString("tr-TR")} km • {listing.city}
              </div>
            </div>
            <span className={`text-xs font-bold ${statusColor}`}>{listing.status}</span>
          </div>

          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.slice(0, 6).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={p}
                  alt={`Foto ${i + 1}`}
                  className="aspect-[4/3] w-full rounded-lg border border-neutral-800 object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-4 text-3xl font-bold text-emerald-400">
            {TL.format(listing.askingPrice)}
          </div>
          {listing.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-300">{listing.description}</p>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          {isOwner ? (
            <div className="rounded-lg border border-neutral-800 bg-[#0a0a0f] px-4 py-3 text-center text-sm text-neutral-400">
              Bu ilan senin.
            </div>
          ) : user ? (
            <div className="space-y-3">
              <MessageSellerButton
                listingId={listing.id}
                listingTitle={`${listing.brand} ${listing.model} ${listing.year}`}
              />
              <SaveListingButton
                listingId={listing.id}
                initiallySaved={!!savedRow}
                savedId={savedRow?.id ?? null}
              />
            </div>
          ) : (
            <Link
              href={`/giris?next=/pazaryeri/${listing.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Satıcıyla iletişime geç
            </Link>
          )}
        </div>

        {canBid && <BidForm listingId={listing.id} minAmount={Math.floor(listing.askingPrice * 0.5)} />}

        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="mb-3 text-sm font-semibold">Teklifler ({listing.bids.length})</h2>
          {listing.bids.length === 0 ? (
            <p className="text-sm text-neutral-500">Henüz teklif yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {listing.bids.map((b) => {
                const isWinning = listing.winningBidId === b.id;
                return (
                  <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{TL.format(b.amount)}</span>
                        {isWinning && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                            Kazanan
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {new Date(b.createdAt).toLocaleString("tr-TR")}
                      </div>
                      {b.note && <p className="mt-1 text-xs text-neutral-400">{b.note}</p>}
                    </div>
                    {isOwner && listing.status === "ACTIVE" && !b.acceptedAt && (
                      <AcceptBidButton bidId={b.id} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
