import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendToUser } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.number().int().min(10_000).max(50_000_000),
  note: z.string().max(500).optional(),
}).strict();

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bids = await prisma.marketplaceBid.findMany({
    where: { listingId: id, retracted: false },
    orderBy: { amount: "desc" },
    take: 50,
  });
  return NextResponse.json({
    success: true,
    bids: bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      createdAt: b.createdAt,
    })),
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (user.userType !== "DEALER" && user.userType !== "BROKER") {
    return NextResponse.json({ success: false, error: "dealer_only" }, { status: 403 });
  }

  const ip = await getClientIp();
  const rl = await checkRateLimit(`market.bid:ip:${ip}`, 60, 3600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ success: false, error: "listing_unavailable" }, { status: 404 });
  }
  if (listing.sellerId === user.id) {
    return NextResponse.json({ success: false, error: "self_bid_forbidden" }, { status: 400 });
  }

  const bid = await prisma.marketplaceBid.create({
    data: {
      listingId: id,
      bidderId: user.id,
      amount: parsed.data.amount,
      note: parsed.data.note ?? null,
    },
  });

  sendToUser(listing.sellerId, {
    title: "Yeni teklif var!",
    body: `${listing.brand} ${listing.model} için ${parsed.data.amount.toLocaleString("tr-TR")} TL teklif geldi.`,
    url: `/pazaryeri/${id}`,
    tag: `new-bid-${id}`,
  }).catch(() => undefined);

  return NextResponse.json({ success: true, bidId: bid.id });
}
