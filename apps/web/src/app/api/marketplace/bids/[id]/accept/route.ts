import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { sendToUser } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const bid = await prisma.marketplaceBid.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!bid) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  if (bid.listing.sellerId !== user.id) {
    return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  }
  if (bid.listing.status !== "ACTIVE") {
    return NextResponse.json({ success: false, error: "listing_not_active" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.marketplaceBid.update({ where: { id }, data: { acceptedAt: new Date() } }),
    prisma.marketplaceListing.update({
      where: { id: bid.listingId },
      data: { status: "SOLD", closedAt: new Date(), winningBidId: id },
    }),
  ]);

  sendToUser(bid.bidderId, {
    title: "Teklifin kabul edildi!",
    body: `${bid.listing.brand} ${bid.listing.model} (${bid.listing.year}) — satıcı teklifini kabul etti.`,
    url: `/pazaryeri/${bid.listingId}`,
    tag: `bid-accepted-${bid.id}`,
  }).catch(() => undefined);

  return NextResponse.json({ success: true });
}
