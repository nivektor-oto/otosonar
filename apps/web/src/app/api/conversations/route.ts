import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendToUser } from "@/lib/push";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z
  .object({
    listingId: z.string().min(1).max(100),
    initialMessage: z.string().trim().min(1).max(2000),
  })
  .strict();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

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

  return NextResponse.json({ success: true, conversations: items });
}

export async function POST(req: Request) {
  if (!isFeatureEnabled("MESSAGING_ENABLED")) {
    return featureDisabledResponse("MESSAGING_ENABLED");
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

  const rl = await checkRateLimit(`conv.new:user:${user.id}`, 5, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true, sellerId: true, brand: true, model: true },
  });
  if (!listing) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  if (listing.sellerId === user.id) {
    return NextResponse.json({ success: false, error: "cannot_message_self" }, { status: 403 });
  }

  const body = parsed.data.initialMessage.trim();
  const now = new Date();

  try {
    const existing = await prisma.conversation.findUnique({
      where: { listingId_buyerId: { listingId: listing.id, buyerId: user.id } },
    });

    const conv = existing
      ? await prisma.conversation.update({
          where: { id: existing.id },
          data: {
            lastMessageAt: now,
            lastMessageBody: body.slice(0, 500),
            lastSenderId: user.id,
            sellerUnread: { increment: 1 },
            sellerArchivedAt: null,
          },
        })
      : await prisma.conversation.create({
          data: {
            listingId: listing.id,
            buyerId: user.id,
            sellerId: listing.sellerId,
            lastMessageAt: now,
            lastMessageBody: body.slice(0, 500),
            lastSenderId: user.id,
            sellerUnread: 1,
          },
        });

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: user.id,
        body,
      },
    });

    sendToUser(listing.sellerId, {
      title: `${user.fullName} mesaj gönderdi`,
      body: `${listing.brand} ${listing.model}: ${body.slice(0, 120)}`,
      url: `/hesap/mesajlar/${conv.id}`,
      tag: `conv-${conv.id}`,
    }).catch(() => undefined);

    return NextResponse.json({
      success: true,
      conversation: { id: conv.id, listingId: conv.listingId, sellerId: conv.sellerId },
      messageId: message.id,
    });
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
