import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true, askingPrice: true, photosJson: true } },
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
    },
  });
  if (!conv) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  const iAmBuyer = conv.buyerId === user.id;
  const iAmSeller = conv.sellerId === user.id;
  if (!iAmBuyer && !iAmSeller) {
    return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  }

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

  const photos = (conv.listing.photosJson as string[] | null) ?? [];
  const counterparty = iAmBuyer ? conv.seller : conv.buyer;

  return NextResponse.json({
    success: true,
    conversation: {
      id: conv.id,
      listing: {
        id: conv.listing.id,
        title: `${conv.listing.brand} ${conv.listing.model} ${conv.listing.year}`,
        coverImage: photos[0] ?? null,
        askingPrice: conv.listing.askingPrice,
      },
      counterparty,
      iAmBuyer,
      createdAt: conv.createdAt.toISOString(),
    },
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const conv = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, buyerId: true, sellerId: true },
  });
  if (!conv) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  const iAmBuyer = conv.buyerId === user.id;
  const iAmSeller = conv.sellerId === user.id;
  if (!iAmBuyer && !iAmSeller) {
    return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  }

  await prisma.conversation.update({
    where: { id: conv.id },
    data: iAmBuyer ? { buyerArchivedAt: new Date() } : { sellerArchivedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
