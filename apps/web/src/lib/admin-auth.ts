import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Admin paneli erişim muhafızı.
 * - Oturum yoksa veya role != ADMIN/MODERATOR ise `notFound()` fırlatır.
 *   (Yani admin paneli mevcut değilmiş gibi 404 döner — keşfedilebilirliği azaltır.)
 * - Disabled/deleted hesap erişimini engeller.
 * - Geriye her zaman admin role'ü olan bir User döner.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) notFound();
  if (user.disabledAt || user.deletedAt) notFound();
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") notFound();
  return user;
}

/** ADMIN zorunlu (MODERATOR yetmez). */
export async function requireFullAdmin(): Promise<User> {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") notFound();
  return user;
}

export type AuditAction =
  | "user.disable"
  | "user.enable"
  | "user.promote"
  | "user.demote"
  | "user.delete"
  | "listing.approve"
  | "listing.reject"
  | "listing.takedown"
  | "subscription.refund"
  | "subscription.cancel"
  | "bootstrap.create_first_admin";

interface AuditInput {
  adminUserId: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}

/**
 * Her admin eyleminin önüne çağırılır — audit log yazar.
 * DB hatası işlemi bloklamaz (fail-open, konsola düşer).
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      h.get("cf-connecting-ip") ??
      null;
    const userAgent = h.get("user-agent")?.slice(0, 500) ?? null;

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        payload: (input.payload ?? null) as never,
        ip: ip?.slice(0, 64) ?? null,
        userAgent,
      },
    });
  } catch (err) {
    console.error("[admin-audit] write failed:", err);
  }
}
