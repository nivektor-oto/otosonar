/**
 * PayTR callback (notification URL) handler.
 *
 * Setup:
 *   1. PayTR Mağaza paneli → Ayarlar → Bildirim URL
 *   2. URL: https://otosonar.com/api/webhooks/paytr
 *   3. Merchant Key + Salt → ENV PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT
 *
 * PayTR form-encoded gönderir, hash field'ını HMAC-SHA256 (Base64) ile doğrular.
 * Başarılı işlemler için body'e "OK" döner (PayTR şartı), aksi halde retry yapar.
 *
 * PaymentIntent.providerRef = "paytr_<merchant_oid>" formatında.
 */

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantKey || !merchantSalt) {
    return new Response("PAYMENT_NOT_CONFIGURED", { status: 503 });
  }

  const formText = await req.text();
  const params = new URLSearchParams(formText);

  const merchant_oid = params.get("merchant_oid") || "";
  const status = params.get("status") || "";
  const total_amount = params.get("total_amount") || "0";
  const hash = params.get("hash") || "";
  const failed_reason_msg = params.get("failed_reason_msg") || "";

  // PayTR hash formülü:
  //   base = merchant_oid + merchant_salt + status + total_amount
  //   hmac = HMAC-SHA256(base, merchant_key) → base64
  const base = merchant_oid + merchantSalt + status + total_amount;
  const computed = crypto
    .createHmac("sha256", merchantKey)
    .update(base)
    .digest("base64");

  if (computed !== hash) {
    return new Response("PAYTR_BAD_HASH", { status: 401 });
  }

  const providerRef = `paytr_${merchant_oid}`;
  const amountKurus = parseInt(total_amount, 10) || 0; // PayTR zaten kuruş gönderir
  const intentStatus =
    status === "success" ? "SUCCESS" : status === "failed" ? "FAILED" : "PENDING";

  // userId merchant_oid içinde encode edilmeli — örn "uos_<userId>_<tier>_<timestamp>"
  // Eğer custom_data ile gelmediyse merchant_oid prefix'inden parse et.
  let userId: string | null = null;
  let tier: string | null = null;
  const parts = merchant_oid.split("_");
  if (parts.length >= 3 && parts[0] === "uos") {
    userId = parts[1];
    tier = parts[2];
  }

  if (userId) {
    try {
      await prisma.paymentIntent.upsert({
        where: { providerRef },
        create: {
          userId,
          amountKurus,
          currency: "TRY",
          provider: "paytr",
          providerRef,
          status: intentStatus,
          failReason: status === "failed" ? failed_reason_msg.slice(0, 500) : null,
          metadata: {
            merchant_oid,
            tier,
            raw_status: status,
          } as object,
        },
        update: {
          status: intentStatus,
          failReason: status === "failed" ? failed_reason_msg.slice(0, 500) : null,
          metadata: {
            merchant_oid,
            tier,
            raw_status: status,
          } as object,
        },
      });
    } catch (err) {
      await logError(err, { path: "webhooks/paytr", metadata: { merchant_oid } });
    }
  }

  // PayTR şartı: 200 OK + body "OK" — aksi halde retry
  return new Response("OK", { status: 200 });
}
