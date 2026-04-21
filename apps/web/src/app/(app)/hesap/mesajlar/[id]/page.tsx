import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { ThreadClient } from "./thread-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Konuşma — OtoSonar" };

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/giris?next=/hesap/mesajlar/${id}`);

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true, askingPrice: true, photosJson: true } },
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
    },
  });
  if (!conv) notFound();

  const iAmBuyer = conv.buyerId === user.id;
  const iAmSeller = conv.sellerId === user.id;
  if (!iAmBuyer && !iAmSeller) notFound();

  const messages = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  if (iAmBuyer && conv.buyerUnread > 0) {
    await prisma.conversation
      .update({ where: { id: conv.id }, data: { buyerUnread: 0 } })
      .catch(() => undefined);
  } else if (iAmSeller && conv.sellerUnread > 0) {
    await prisma.conversation
      .update({ where: { id: conv.id }, data: { sellerUnread: 0 } })
      .catch(() => undefined);
  }

  const counterparty = iAmBuyer ? conv.seller : conv.buyer;

  return (
    <ThreadClient
      conversationId={conv.id}
      meId={user.id}
      counterpartyName={counterparty.fullName}
      listing={{
        id: conv.listing.id,
        title: `${conv.listing.brand} ${conv.listing.model} ${conv.listing.year}`,
        askingPrice: conv.listing.askingPrice,
      }}
      initialMessages={messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
