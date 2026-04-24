import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendToUser } from "@/lib/push";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/garage-reminders
 *
 * Her gün 09:00 TR (Vercel'de 06:00 UTC) çalışır. Yetki:
 *  - "authorization: Bearer $CRON_SECRET" (otopatron / manuel tetik), veya
 *  - "x-vercel-cron: 1" başlığı (Vercel Cron imzası)
 *
 * İş:
 *  - UserVehicle kayıtlarından muayene / sigorta / MTV eşiğine gelenleri bul
 *  - Aynı gün aynı araç + aynı kind için tekrar gönderme (lastXxxReminderAt kontrolü)
 *  - Web push ile kullanıcıya bildirim gönder
 *  - User.unreadReminders sayacını arttır
 */

type ReminderKind = "inspection" | "insurance" | "mtv";

function authorized(req: Request): boolean {
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function daysUntil(due: Date, ref: Date): number {
  const ms = due.getTime() - ref.getTime();
  return Math.ceil(ms / (24 * 3600 * 1000));
}

function plateLabel(v: { plate: string | null; brand: string; model: string }): string {
  return v.plate ? v.plate : `${v.brand} ${v.model}`;
}

function bodyText(kind: ReminderKind, days: number): string {
  const noun =
    kind === "inspection" ? "Fenni muayene" : kind === "insurance" ? "Sigorta" : "MTV";
  if (days < 0) return `${noun} ${-days} gün önce bitti. Cezayı geciktirme.`;
  if (days === 0) return `${noun} BUGÜN bitiyor. Hemen yenile.`;
  return `${noun} ${days} gün sonra bitiyor. Yenilemeyi ihmal etme.`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Gün başı — "bugün bir kere" kontrolü için
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Maksimum bakılacak eşik = 90 gün (notifyDaysBefore üst sınır)
  const horizon = new Date(now.getTime() + 90 * 24 * 3600 * 1000);
  // Gecikmişleri de yakala: 14 gün öncesine kadar
  const overdueFloor = new Date(now.getTime() - 14 * 24 * 3600 * 1000);

  const sent: Record<string, number> = { inspection: 0, insurance: 0, mtv: 0 };
  const skippedSameDay: Record<string, number> = { inspection: 0, insurance: 0, mtv: 0 };
  let pushSent = 0;
  let pushFailed = 0;

  try {
    const candidates = await prisma.userVehicle.findMany({
      where: {
        soldAt: null,
        OR: [
          { inspectionDueAt: { gte: overdueFloor, lte: horizon } },
          { insuranceDueAt: { gte: overdueFloor, lte: horizon } },
          { mtvDueAt: { gte: overdueFloor, lte: horizon } },
        ],
      },
      take: 5000,
    });

    for (const v of candidates) {
      const tasks: Array<{
        kind: ReminderKind;
        due: Date | null;
        threshold: number;
        lastAt: Date | null;
      }> = [
        {
          kind: "inspection",
          due: v.inspectionDueAt,
          threshold: v.inspectionNotifyDaysBefore,
          lastAt: v.lastInspectionReminderAt,
        },
        {
          kind: "insurance",
          due: v.insuranceDueAt,
          threshold: v.insuranceNotifyDaysBefore,
          lastAt: v.lastInsuranceReminderAt,
        },
        {
          kind: "mtv",
          due: v.mtvDueAt,
          threshold: v.mtvNotifyDaysBefore,
          lastAt: v.lastMtvReminderAt,
        },
      ];

      for (const t of tasks) {
        if (!t.due) continue;
        const days = daysUntil(t.due, now);
        // Eşiğe girmiş mi? (negatif = gecikmiş; 14 güne kadar hatırlat)
        if (days > t.threshold) continue;
        if (days < -14) continue;

        // Bugün aynı kind için zaten attıysak skip
        if (t.lastAt && t.lastAt >= dayStart) {
          skippedSameDay[t.kind]++;
          continue;
        }

        // Push gönder
        try {
          const label = plateLabel(v);
          const result = await sendToUser(v.userId, {
            title: `${label} — ${
              t.kind === "inspection" ? "Muayene" : t.kind === "insurance" ? "Sigorta" : "MTV"
            }`,
            body: bodyText(t.kind, days),
            url: `/hesap/arabalarim`,
            tag: `garage-${t.kind}-${v.id}`,
          });
          pushSent += result.sent;
          pushFailed += result.failed;

          // DB'de işaretle
          const updateData: Record<string, Date> = {};
          if (t.kind === "inspection") updateData.lastInspectionReminderAt = now;
          if (t.kind === "insurance") updateData.lastInsuranceReminderAt = now;
          if (t.kind === "mtv") updateData.lastMtvReminderAt = now;
          await prisma.userVehicle.update({ where: { id: v.id }, data: updateData });

          // Kullanıcının okunmamış uyarı sayacını arttır (in-app badge için)
          await prisma.user.update({
            where: { id: v.userId },
            data: { unreadReminders: { increment: 1 } },
          });

          sent[t.kind]++;
        } catch (err) {
          await logError(err, {
            path: "/api/cron/garage-reminders",
            metadata: { vehicleId: v.id, kind: t.kind },
          });
        }
      }
    }
  } catch (err) {
    await logError(err, { path: "/api/cron/garage-reminders" });
    return NextResponse.json(
      { success: false, error: "internal" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    ranAt: now.toISOString(),
    results: {
      sent,
      skippedSameDay,
      pushSent,
      pushFailed,
    },
  });
}
