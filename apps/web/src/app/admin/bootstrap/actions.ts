"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  passwordStrength,
  normalizeEmail,
  createSession,
  USER_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/user-auth";
import { writeAudit } from "@/lib/admin-auth";
import { logError } from "@/lib/error-log";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cookies, headers } from "next/headers";
import { createHash } from "node:crypto";

export interface BootstrapResult {
  ok: boolean;
  error?: string;
}

/**
 * Sistemde hiç ADMIN yokken ilk admin hesabını oluşturur.
 * - Sadece ADMIN sayısı 0 iken çalışır (self-destructs).
 * - Var olan kullanıcıyı ADMIN'e yükseltir veya yeni hesap açar.
 * - İşlem sonrası kullanıcıyı otomatik login eder.
 */
export async function bootstrapFirstAdminAction(
  formData: FormData,
): Promise<BootstrapResult> {
  try {
    // Defense-in-depth: action middleware'siz invoke edilse de gate kapalı kalsın.
    if (!isFeatureEnabled("ADMIN_PANEL_ENABLED")) {
      return { ok: false, error: "Bu işlem şu anda kullanılamaz." };
    }
    const ip = await getClientIp();
    const rl = await checkRateLimit(`admin:bootstrap:${ip}`, 3, 600);
    if (!rl.allowed) {
      return { ok: false, error: "Çok deneme. 10 dakika bekle." };
    }

    // Idempotent guard — sistem zaten admin'e sahipse 404 mantığıyla reddet.
    const existingAdmins = await prisma.user.count({
      where: { role: "ADMIN", deletedAt: null },
    });
    if (existingAdmins > 0) {
      return {
        ok: false,
        error: "Sistemde zaten ADMIN var. Bu sayfa artık kullanılamaz.",
      };
    }

    const email = normalizeEmail(String(formData.get("email") ?? ""));
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();

    if (!email || !password) {
      return { ok: false, error: "E-posta ve şifre zorunlu." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Geçersiz e-posta." };
    }
    const strength = passwordStrength(password);
    if (!strength.ok) {
      return { ok: false, error: strength.reason ?? "Zayıf şifre." };
    }

    const passwordHash = await hashPassword(password);

    const existing = await prisma.user.findUnique({ where: { email } });
    let userId: string;

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "ADMIN",
          passwordHash,
          disabledAt: null,
          deletedAt: null,
          fullName: fullName || existing.fullName,
        },
      });
      userId = existing.id;
    } else {
      const created = await prisma.user.create({
        data: {
          email,
          fullName: fullName || email.split("@")[0],
          passwordHash,
          role: "ADMIN",
          userType: "ADMIN",
          emailVerified: new Date(),
        },
      });
      userId = created.id;
    }

    // Auto-login: set cookie.
    const h = await headers();
    const ua = h.get("user-agent") ?? null;
    const ipHash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;
    const { cookie } = await createSession(userId, ua, ipHash);
    const store = await cookies();
    store.set(USER_COOKIE, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    await writeAudit({
      adminUserId: userId,
      action: "bootstrap.create_first_admin",
      targetType: "user",
      targetId: userId,
      payload: { email, bootstrap: true },
    });
  } catch (err) {
    await logError(err, { path: "/admin/bootstrap" });
    return { ok: false, error: "Beklenmedik hata." };
  }

  redirect("/admin");
}
