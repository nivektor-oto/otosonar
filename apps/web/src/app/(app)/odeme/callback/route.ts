/**
 * iyzico Checkout Form callback handler.
 *
 * Akış:
 *   iyzico -> POST /odeme/callback  (body: token=...)
 *   Biz tokenı doğrula, PaymentIntent'i güncelle, Subscription yarat, sonra kullanıcıya sonuç HTML'i göster.
 *
 * iyzico form-post yapıyor (x-www-form-urlencoded). GET ile hata sayfasını da render edebilir
 * (örn. kullanıcı "geri dön" dediğinde query string ile gelir).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveCheckoutResult, markSuccess, markFailed } from "@/lib/iyzico";
import { grantReferralBonusIfApplicable } from "@/lib/referral";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Tier = "PLUS" | "PRO" | "MAX" | "BAYI_PLUS" | "BAYI_PRO" | "BAYI_MAX";
const B2C_TIERS: readonly Tier[] = ["PLUS", "PRO", "MAX"];
const B2B_TIERS: readonly Tier[] = ["BAYI_PLUS", "BAYI_PRO", "BAYI_MAX"];
const ALL_PAID_TIERS: readonly Tier[] = [...B2C_TIERS, ...B2B_TIERS];

function mapTier(raw: string | undefined): { tier: Tier; isB2B: boolean } | null {
  if (!raw) return null;
  if (!(ALL_PAID_TIERS as readonly string[]).includes(raw)) return null;
  const tier = raw as Tier;
  return { tier, isB2B: (B2B_TIERS as readonly string[]).includes(tier) };
}

async function handleToken(token: string | null): Promise<{
  ok: boolean;
  status: "paid" | "failed" | "pending" | "unknown";
  reason?: string;
  intentId?: string;
}> {
  if (!token) return { ok: false, status: "unknown", reason: "missing_token" };

  const intent = await prisma.paymentIntent.findUnique({ where: { providerRef: token } });
  if (!intent) return { ok: false, status: "unknown", reason: "intent_not_found" };

  // Idempotency — aynı intent daha önce sonuçlandıysa mevcut durumu dön.
  if (intent.status === "SUCCESS") {
    return { ok: true, status: "paid", intentId: intent.id };
  }
  if (intent.status === "FAILED") {
    return { ok: false, status: "failed", intentId: intent.id, reason: intent.failReason ?? "previously_failed" };
  }

  const meta = intent.metadata as {
    tier?: string;
    billingPeriod?: "MONTHLY" | "YEARLY";
    conversationId?: string;
  } | null;

  const conversationId = meta?.conversationId ?? intent.id;

  let result;
  try {
    result = await retrieveCheckoutResult(token, conversationId);
  } catch (err) {
    await logError(err, {
      path: "/odeme/callback",
      userId: intent.userId,
      metadata: { intentId: intent.id, token: token.slice(0, 8) + "..." },
    });
    await markFailed(intent.id, "retrieve_failed");
    return { ok: false, status: "failed", intentId: intent.id, reason: "retrieve_failed" };
  }

  await logError(new Error("iyzico_callback"), {
    level: "INFO",
    path: "/odeme/callback",
    userId: intent.userId,
    metadata: {
      intentId: intent.id,
      paymentStatus: result.paymentStatus,
      conversationId: result.conversationId,
      token: token.slice(0, 8) + "...",
      status: result.status,
    },
  });

  if (result.status !== "success" || result.paymentStatus !== "SUCCESS") {
    const reason = result.errorMessage ?? `payment_${result.paymentStatus ?? "unknown"}`;
    await markFailed(intent.id, reason);
    return { ok: false, status: "failed", intentId: intent.id, reason };
  }

  // Güvenlik: paid amount intent.amountKurus ile eşleşmeli.
  const paidPriceKurus = Math.round((result.paidPrice ?? 0) * 100);
  if (paidPriceKurus !== intent.amountKurus) {
    await markFailed(intent.id, `amount_mismatch_${paidPriceKurus}_vs_${intent.amountKurus}`);
    return {
      ok: false,
      status: "failed",
      intentId: intent.id,
      reason: "amount_mismatch",
    };
  }

  // Güncelle
  await markSuccess(intent.id, token);

  const mapped = mapTier(meta?.tier);
  if (mapped) {
    const period = meta?.billingPeriod ?? "MONTHLY";
    const periodMs = period === "YEARLY" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;

    // Mevcut aktif subscription varsa extend et; yoksa yeni kayıt.
    const existing = await prisma.subscription.findFirst({
      where: { userId: intent.userId, status: "ACTIVE" },
      orderBy: { currentPeriodEnd: "desc" },
    });

    if (existing) {
      const base =
        existing.currentPeriodEnd && existing.currentPeriodEnd > new Date()
          ? existing.currentPeriodEnd.getTime()
          : Date.now();
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          tier: mapped.tier,
          billingPeriod: period,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(base + periodMs),
          iyzicoSubscriptionRef: token,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: intent.userId,
          tier: mapped.tier,
          billingPeriod: period,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + periodMs),
          iyzicoSubscriptionRef: token,
        },
      });
    }

    if (mapped.isB2B) {
      const user = await prisma.user.findUnique({ where: { id: intent.userId } });
      if (user && user.userType !== "DEALER" && user.userType !== "ADMIN") {
        await prisma.user.update({
          where: { id: intent.userId },
          data: { userType: "DEALER" },
        });
      }
    }

    await grantReferralBonusIfApplicable(intent.userId).catch(() => undefined);
  }

  return { ok: true, status: "paid", intentId: intent.id };
}

function renderHtml(outcome: {
  ok: boolean;
  status: "paid" | "failed" | "pending" | "unknown";
  reason?: string;
  intentId?: string;
}): string {
  const title = outcome.ok ? "Ödemeniz başarıyla tamamlandı" : "Ödeme tamamlanamadı";
  const color = outcome.ok ? "#22c55e" : "#ef4444";
  const subtitle = outcome.ok
    ? "Aboneliğiniz aktifleştirildi. Birkaç saniye içinde hesabınıza yönlendiriliyorsunuz."
    : `Ödeme işlemi başarısız oldu${outcome.reason ? ` (${outcome.reason})` : ""}. Kartınızdan tutar çekilmediyse endişelenmeyin.`;
  const next = outcome.ok ? "/hesap" : "/hesap/abonelik";
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta http-equiv="refresh" content="4;url=${next}" />
<style>
  body { background:#0a0a0f; color:#e5e7eb; font-family:-apple-system,system-ui,sans-serif; margin:0; min-height:100dvh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .card { background:#111114; border:1px solid #27272a; border-radius:16px; padding:32px; max-width:480px; text-align:center; }
  h1 { color:${color}; font-size:22px; margin:0 0 12px; }
  p { color:#a3a3a3; font-size:14px; line-height:1.55; margin:0 0 24px; }
  .ref { font-size:11px; color:#525252; margin-top:16px; word-break:break-all; }
  a { display:inline-block; background:#27272a; color:#fafafa; padding:10px 20px; border-radius:10px; text-decoration:none; font-size:14px; }
  a:hover { background:#3f3f46; }
</style>
</head>
<body>
<div class="card">
  <h1>${title}</h1>
  <p>${subtitle}</p>
  <a href="${next}">Devam et</a>
  ${outcome.intentId ? `<div class="ref">Referans: ${outcome.intentId}</div>` : ""}
</div>
</body>
</html>`;
}

async function extractToken(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const qToken = url.searchParams.get("token");
  if (qToken) return qToken;
  if (req.method === "POST") {
    try {
      const ct = req.headers.get("content-type") ?? "";
      if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
        const form = await req.formData();
        const t = form.get("token");
        if (typeof t === "string" && t) return t;
      } else if (ct.includes("application/json")) {
        const body = (await req.json()) as { token?: string };
        if (body?.token) return body.token;
      } else {
        // Son çare: düz body oku
        const raw = await req.text();
        const m = raw.match(/token=([^&]+)/);
        if (m) return decodeURIComponent(m[1]);
      }
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const token = await extractToken(req);
  const outcome = await handleToken(token);
  return new NextResponse(renderHtml(outcome), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const token = await extractToken(req);
  const outcome = await handleToken(token);
  return new NextResponse(renderHtml(outcome), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
