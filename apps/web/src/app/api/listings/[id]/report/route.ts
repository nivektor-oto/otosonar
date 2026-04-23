import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  reason: z.enum(["DUPLICATE", "FRAUD", "KM", "SCAM", "PHOTO_MISMATCH", "OTHER"]),
  notes: z.string().max(1000).optional(),
}).strict();

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = await getClientIp();
  const { id: listingId } = await ctx.params;
  if (!listingId || listingId.length > 40) {
    return NextResponse.json({ success: false, error: "bad_listing_id" }, { status: 400 });
  }

  // 5 rapor / gün per user
  const rlUser = await checkRateLimit(`listing.report:user:${user.id}`, 5, 86_400);
  if (!rlUser.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited", message: "Günlük 5 rapor sınırına ulaşıldı." },
      { status: 429 },
    );
  }
  // Ek güvenlik: aynı IP'den 20 rapor/gün
  await checkRateLimit(`listing.report:ip:${ip}`, 20, 86_400);

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  // İlan var mı?
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, reportCount: true },
  });
  if (!listing) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  if (listing.sellerId === user.id) {
    return NextResponse.json({ success: false, error: "self_report_forbidden" }, { status: 400 });
  }

  try {
    // Bir kullanıcı bir ilanı birden fazla raporlayamaz (@@unique)
    const existing = await prisma.marketplaceListingReport.findUnique({
      where: { listingId_reporterUserId: { listingId, reporterUserId: user.id } },
      select: { id: true },
    });

    if (existing) {
      // zaten raporlanmış — sadece idempotent OK dön
      return NextResponse.json({ success: true, already: true, reportId: existing.id });
    }

    // transaction: report oluştur + listing.reportCount artır
    const created = await prisma.$transaction(async (tx) => {
      const report = await tx.marketplaceListingReport.create({
        data: {
          listingId,
          reporterUserId: user.id,
          reason: parsed.data.reason,
          notes: parsed.data.notes ?? null,
        },
        select: { id: true },
      });
      await tx.marketplaceListing.update({
        where: { id: listingId },
        data: { reportCount: { increment: 1 } },
      });
      return report;
    });

    return NextResponse.json({ success: true, reportId: created.id });
  } catch (err) {
    await logError(err, { path: "/api/listings/[id]/report", userId: user.id }).catch(() => undefined);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
