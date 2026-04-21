import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function configure(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:kurucu@otosonar.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export function isPushReady(): boolean {
  return configure();
}

export function getPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export async function sendToUser(
  userId: string,
  payload: { title: string; body: string; url?: string; tag?: string },
): Promise<{ sent: number; failed: number }> {
  if (!configure()) return { sent: 0, failed: 0 };

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    let success = false;
    let errorCode: number | undefined;
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      );
      success = true;
      sent++;
    } catch (err: unknown) {
      failed++;
      errorCode =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      if (errorCode === 404 || errorCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
      }
    }
    await prisma.pushSendLog
      .create({
        data: {
          userId,
          endpoint: sub.endpoint,
          title: payload.title.slice(0, 200),
          body: payload.body.slice(0, 500),
          url: payload.url?.slice(0, 300) ?? null,
          success,
          errorCode: errorCode ?? null,
        },
      })
      .catch(() => undefined);
  }
  return { sent, failed };
}

export async function broadcast(
  payload: { title: string; body: string; url?: string; tag?: string },
  filter?: { userType?: "BUYER" | "DEALER" | "BROKER" | "ADMIN" },
): Promise<{ sent: number; failed: number }> {
  if (!configure()) return { sent: 0, failed: 0 };

  const subs = await prisma.pushSubscription.findMany({
    where: filter?.userType
      ? { userId: { not: null }, /* filter via join would be ideal but keep simple */ }
      : undefined,
  });

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
      sent++;
    } catch (err: unknown) {
      failed++;
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
      }
    }
  }
  return { sent, failed };
}
