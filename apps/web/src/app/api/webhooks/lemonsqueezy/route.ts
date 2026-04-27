/**
 * Lemon Squeezy webhook handler.
 *
 * Setup:
 *   1. Lemon Squeezy → Settings → Webhooks → Add endpoint
 *   2. URL: https://otosonar.com/api/webhooks/lemonsqueezy
 *   3. Events: order_created, subscription_created, subscription_updated, subscription_cancelled
 *   4. Signing secret → ENV LEMONSQUEEZY_WEBHOOK_SECRET
 *
 * Bu handler signature'ı doğrular ve PaymentIntent kaydı atar.
 * Kullanıcı eşleştirme: order'in custom_data['user_id'] alanından okunur
 * (Lemon Squeezy checkout açarken `?checkout[custom][user_id]=...` ile gönder).
 *
 * Aktif tier yükseltme bu handler içinde **otomatik DEĞİL** — admin panelinden
 * manuel onay sonrası prod'a geçirilir. Kazara yanlış yükseltme riski sıfır.
 */

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // Sabit zaman karşılaştırma — timing attack önle
  const a = Buffer.from(hmac);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type LSEvent = {
  meta?: { event_name?: string; custom_data?: Record<string, string> };
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      status?: string;
      total?: number; // cents (USD)
      total_formatted?: string;
      user_email?: string;
      currency?: string;
    };
  };
};

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "webhook_secret_missing" },
      { status: 503 }
    );
  }

  const raw = await req.text();
  const sig = req.headers.get("x-signature");

  if (!verifySignature(raw, sig, secret)) {
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 401 }
    );
  }

  let event: LSEvent;
  try {
    event = JSON.parse(raw) as LSEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const eventName = event.meta?.event_name || "unknown";
  const customData = event.meta?.custom_data || {};
  const userId = customData.user_id;
  const tier = customData.tier;

  const data = event.data?.attributes || {};
  const providerRef = event.data?.id ? `ls_${event.data.id}` : null;

  // PaymentIntent kaydı — schema 'iyzico' | 'paytr' der ama field STRING; lemonsqueezy de eklenebilir.
  if (userId && providerRef) {
    try {
      const cents = data.total ?? 0;
      // USD cents → TL kuruş yaklaşık (sabit kur 33; kesin değer önemli değil, audit için kayıt amaçlı)
      const amountKurus = Math.round(cents * 33);

      const status =
        data.status === "paid" || eventName === "order_created"
          ? "SUCCESS"
          : data.status === "refunded"
            ? "REFUNDED"
            : data.status === "failed"
              ? "FAILED"
              : "PENDING";

      await prisma.paymentIntent.upsert({
        where: { providerRef },
        create: {
          userId,
          amountKurus,
          currency: (data.currency || "USD").toUpperCase(),
          provider: "lemonsqueezy",
          providerRef,
          status,
          metadata: {
            event: eventName,
            tier: tier ?? null,
            user_email: data.user_email ?? null,
            total_formatted: data.total_formatted ?? null,
            raw_status: data.status ?? null,
          } as object,
        },
        update: {
          status,
          metadata: {
            event: eventName,
            tier: tier ?? null,
            user_email: data.user_email ?? null,
            total_formatted: data.total_formatted ?? null,
            raw_status: data.status ?? null,
          } as object,
        },
      });
    } catch (err) {
      await logError(err, { path: "webhooks/lemonsqueezy", metadata: { eventName } });
      // 200 dön ama logla; LS retry yapmasın (signature OK, sadece DB sorunu)
    }
  }

  return NextResponse.json({ ok: true, event: eventName });
}
