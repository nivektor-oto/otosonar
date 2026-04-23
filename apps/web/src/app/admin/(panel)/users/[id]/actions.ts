"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireFullAdmin, writeAudit } from "@/lib/admin-auth";
import { logError } from "@/lib/error-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const idSchema = z.string().min(1).max(64);

async function adminRateGuard(adminId: string, scope: string): Promise<void> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin:act:${scope}:${adminId}:${ip}`, 30, 60);
  if (!rl.allowed) {
    throw new Error("Çok fazla işlem — 1 dakika bekleyin.");
  }
}

export async function disableUserAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  try {
    const id = idSchema.parse(userId);
    await adminRateGuard(admin.id, "user.disable");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) notFound();
    if (target.id === admin.id) {
      return { ok: false, error: "Kendini askıya alamazsın." };
    }
    if (target.role === "ADMIN" && admin.role !== "ADMIN") {
      return { ok: false, error: "Admin'i sadece ADMIN askıya alabilir." };
    }

    await prisma.user.update({
      where: { id },
      data: { disabledAt: new Date() },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "user.disable",
      targetType: "user",
      targetId: id,
      payload: { email: target.email },
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/users/disable", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function enableUserAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  try {
    const id = idSchema.parse(userId);
    await adminRateGuard(admin.id, "user.enable");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) notFound();

    await prisma.user.update({
      where: { id },
      data: { disabledAt: null },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "user.enable",
      targetType: "user",
      targetId: id,
      payload: { email: target.email },
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/users/enable", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function promoteUserAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireFullAdmin();
  try {
    const id = idSchema.parse(userId);
    await adminRateGuard(admin.id, "user.promote");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) notFound();
    if (target.role === "ADMIN") {
      return { ok: false, error: "Zaten ADMIN." };
    }

    const newRole = target.role === "MODERATOR" ? "ADMIN" : "MODERATOR";
    await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "user.promote",
      targetType: "user",
      targetId: id,
      payload: { from: target.role, to: newRole, email: target.email },
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/users/promote", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function demoteUserAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireFullAdmin();
  try {
    const id = idSchema.parse(userId);
    await adminRateGuard(admin.id, "user.demote");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) notFound();
    if (target.id === admin.id) {
      return { ok: false, error: "Kendini indiremezsin." };
    }
    if (target.role === "USER") {
      return { ok: false, error: "Zaten normal kullanıcı." };
    }

    const newRole = target.role === "ADMIN" ? "MODERATOR" : "USER";

    if (target.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN", deletedAt: null },
      });
      if (adminCount <= 1) {
        return { ok: false, error: "Son ADMIN indirilmez." };
      }
    }

    await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "user.demote",
      targetType: "user",
      targetId: id,
      payload: { from: target.role, to: newRole, email: target.email },
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/users/demote", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}

export async function softDeleteUserAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireFullAdmin();
  try {
    const id = idSchema.parse(userId);
    await adminRateGuard(admin.id, "user.delete");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) notFound();
    if (target.id === admin.id) {
      return { ok: false, error: "Kendini silemezsin." };
    }
    if (target.role === "ADMIN") {
      return { ok: false, error: "ADMIN silinemez — önce indir." };
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), disabledAt: new Date() },
    });

    await writeAudit({
      adminUserId: admin.id,
      action: "user.delete",
      targetType: "user",
      targetId: id,
      payload: { email: target.email, softDelete: true },
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    await logError(err, { path: "/admin/users/delete", userId: admin.id });
    return { ok: false, error: (err as Error).message ?? "Hata" };
  }
}
