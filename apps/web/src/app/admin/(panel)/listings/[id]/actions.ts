"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, writeAudit } from "@/lib/admin-auth";
import { logError } from "@/lib/error-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const idSchema = z.string().min(1).max(64);
const reasonSchema = z.string().min(3).max(500);

async function rateGuard(adminId: string, scope: string): Promise<void> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin:act:${scope}:${adminId}:${ip}`, 30, 60);
  if (!rl.allowed) throw new Error("Çok hızlı — 1 dakika bekleyin.");
}

export async function approveListingAction(
  listingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  try {
    const id = idSchema.parse(listingId);
    await rateGuard(admin.id, "listing.approve");

    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) notFound();
    if (listing.status !== "DRAFT") {
      return { ok: false, error: `Zaten ${listing.status}.` };
    }

    await prisma.marketplaceListing.update({
      where: { id },
      data: {
        status: "ACTIVE",
        moderatedByUserId: admin.id,
        moderatedAt: new Date(),
        rejectionReason: null,
      },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "listing.approve",
      targetType: "listing",
      targetId: id,
      payload: { from: listing.status, to: "ACTIVE" },
    });

    revalidatePath(`/admin/listings/${id}`);
    revalidatePath("/admin/listings");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/listings/approve", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function rejectListingAction(
  listingId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  try {
    const id = idSchema.parse(listingId);
    const trimmed = reasonSchema.parse(reason.trim());
    await rateGuard(admin.id, "listing.reject");

    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) notFound();

    await prisma.marketplaceListing.update({
      where: { id },
      data: {
        status: "REJECTED",
        moderatedByUserId: admin.id,
        moderatedAt: new Date(),
        rejectionReason: trimmed,
      },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "listing.reject",
      targetType: "listing",
      targetId: id,
      payload: { reason: trimmed, from: listing.status },
    });

    revalidatePath(`/admin/listings/${id}`);
    revalidatePath("/admin/listings");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/listings/reject", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function takedownListingAction(
  listingId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  try {
    const id = idSchema.parse(listingId);
    const trimmed = reasonSchema.parse(reason.trim());
    await rateGuard(admin.id, "listing.takedown");

    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) notFound();

    await prisma.marketplaceListing.update({
      where: { id },
      data: {
        status: "TAKEDOWN",
        moderatedByUserId: admin.id,
        moderatedAt: new Date(),
        rejectionReason: trimmed,
        closedAt: new Date(),
      },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "listing.takedown",
      targetType: "listing",
      targetId: id,
      payload: { reason: trimmed, from: listing.status },
    });

    revalidatePath(`/admin/listings/${id}`);
    revalidatePath("/admin/listings");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/listings/takedown", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}
