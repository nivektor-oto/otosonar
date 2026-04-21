import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { InboxClient } from "./inbox-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mesajlarım — OtoSonar" };

export default async function MesajlarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/mesajlar");

  const rows = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: user.id, buyerArchivedAt: null },
        { sellerId: user.id, sellerArchivedAt: null },
      ],
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true, askingPrice: true, photosJson: true } },
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
    },
  });

  const items = rows.map((c) => {
    const iAmBuyer = c.buyerId === user.id;
    const counterparty = iAmBuyer ? c.seller : c.buyer;
    const photos = (c.listing.photosJson as string[] | null) ?? [];
    return {
      id: c.id,
      listing: {
        id: c.listing.id,
        title: `${c.listing.brand} ${c.listing.model} ${c.listing.year}`,
        coverImage: photos[0] ?? null,
        askingPrice: c.listing.askingPrice,
      },
      counterparty: { id: counterparty.id, fullName: counterparty.fullName },
      lastMessageAt: c.lastMessageAt.toISOString(),
      lastMessageBody: c.lastMessageBody,
      unread: iAmBuyer ? c.buyerUnread : c.sellerUnread,
    };
  });

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-10 text-neutral-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Mesajlarım</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Pazaryerinde ilgilendiğin ilanların satıcılarıyla ve ilan sahiplerine gelen mesajlar.
          </p>
        </header>
        <InboxClient initial={items} />
      </div>
    </main>
  );
}
