import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z.object({
  listingId: z.string().min(1).max(100),
  note: z.string().trim().max(200).optional(),
  notifyOnDrop: z.boolean().optional(),
}).strict();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });

  const rows = await prisma.savedListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
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

  const items = rows.map((s) => {
    const photos = (s.listing.photosJson as string[] | null) ?? [];
    const priceDropped = s.listing.askingPrice < s.savedPrice;
    return {
      id: s.id,
      listingId: s.listingId,
      listing: {
        id: s.listing.id,
        title: `${s.listing.brand} ${s.listing.model} ${s.listing.year}`,
        km: s.listing.km,
        city: s.listing.city,
        coverImage: photos[0] ?? null,
        askingPrice: s.listing.askingPrice,
        status: s.listing.status,
        isAuction: s.listing.isAuction,
        isUrgent: s.listing.isUrgent,
      },
      note: s.note,
      savedPrice: s.savedPrice,
      priceDropped,
      priceDiff: s.savedPrice - s.listing.askingPrice,
      notifyOnDrop: s.notifyOnDrop,
      createdAt: s.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ success: true, saved: items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });

  const rl = await checkRateLimit(`saved.toggle:user:${user.id}`, 30, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ success: false, error: "validation" }, { status: 400 }); }
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true, askingPrice: true, sellerId: true },
  });
  if (!listing) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  if (listing.sellerId === user.id) {
    return NextResponse.json({ success: false, error: "cannot_save_own" }, { status: 403 });
  }

  const saved = await prisma.savedListing.upsert({
    where: { userId_listingId: { userId: user.id, listingId: listing.id } },
    create: {
      userId: user.id,
      listingId: listing.id,
      savedPrice: listing.askingPrice,
      note: parsed.data.note,
      notifyOnDrop: parsed.data.notifyOnDrop ?? true,
    },
    update: {
      note: parsed.data.note,
      notifyOnDrop: parsed.data.notifyOnDrop ?? true,
    },
    select: { id: true, savedPrice: true },
  });

  return NextResponse.json({ success: true, saved });
}
