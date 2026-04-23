"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireFullAdmin, writeAudit } from "@/lib/admin-auth";
import { logError } from "@/lib/error-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const idSchema = z.string().min(1).max(64);
const noteSchema = z.string().min(3).max(500).optional();

async function rateGuard(adminId: string, scope: string): Promise<void> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin:act:${scope}:${adminId}:${ip}`, 15, 60);
  if (!rl.allowed) throw new Error("Çok hızlı — bekleyin.");
}

export async function cancelSubscriptionAction(
  subscriptionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireFullAdmin();
  try {
    const id = idSchema.parse(subscriptionId);
    await rateGuard(admin.id, "subscription.cancel");

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) notFound();
    if (sub.status === "CANCELED") {
      return { ok: false, error: "Zaten iptal." };
    }

    await prisma.subscription.update({
      where: { id },
      data: { status: "CANCELED", cancelAtPeriodEnd: true },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "subscription.cancel",
      targetType: "subscription",
      targetId: id,
      payload: { userId: sub.userId, tier: sub.tier, from: sub.status },
    });

    revalidatePath(`/admin/subscriptions/${id}`);
    revalidatePath("/admin/subscriptions");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/subscriptions/cancel", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function refundSubscriptionAction(
  subscriptionId: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireFullAdmin();
  try {
    const id = idSchema.parse(subscriptionId);
    const trimmedNote = note ? noteSchema.parse(note.trim()) : undefined;
    await rateGuard(admin.id, "subscription.refund");

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) notFound();

    // Son başarılı PaymentIntent'i bul — varsa REFUNDED'e çevir.
    const lastPayment = await prisma.paymentIntent.findFirst({
      where: { subscriptionId: id, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id },
        data: { status: "CANCELED", cancelAtPeriodEnd: true },
      });
      if (lastPayment) {
        await tx.paymentIntent.update({
          where: { id: lastPayment.id },
          data: {
            status: "REFUNDED",
            failReason: trimmedNote ?? "admin_refund",
          },
        });
      }
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "subscription.refund",
      targetType: "subscription",
      targetId: id,
      payload: {
        userId: sub.userId,
        tier: sub.tier,
        paymentId: lastPayment?.id ?? null,
        amountKurus: lastPayment?.amountKurus ?? null,
        note: trimmedNote ?? null,
      },
    });

    revalidatePath(`/admin/subscriptions/${id}`);
    revalidatePath("/admin/subscriptions");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/subscriptions/refund", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}
