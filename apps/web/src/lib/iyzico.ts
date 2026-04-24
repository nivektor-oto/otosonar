/**
 * İyzico Checkout Form entegrasyonu.
 *
 * Akış:
 * 1. createCheckoutSession -> PaymentIntent (PENDING) + iyzico checkoutFormInitialize.create
 *    -> paymentPageUrl, token, conversationId döner. Token providerRef olarak PaymentIntent'e yazılır.
 * 2. Kullanıcı paymentPageUrl'e yönlenir, iyzico 3DS + ödeme adımını yönetir.
 * 3. iyzico, `IYZICO_CALLBACK_URL` ya da default `/odeme/callback` adresine POST ile token döner.
 * 4. retrieveCheckoutResult(token) -> ödeme sonucu (paymentStatus, conversationId, price...).
 * 5. Webhook da (X-IYZ-SIGNATURE doğrulamalı) idempotent şekilde sonuçları işler.
 *
 * Env:
 *   IYZICO_API_KEY       — sandbox-xxx veya prod
 *   IYZICO_SECRET_KEY    — sandbox veya prod secret
 *   IYZICO_URI           — default https://sandbox-api.iyzipay.com
 *   IYZICO_CALLBACK_URL  — default https://otosonar.com/odeme/callback
 *
 * SDK resmi tip dağıtmıyor; minimum tip tanımlarını burada tutuyoruz.
 */
import { createHmac, randomUUID } from "node:crypto";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require("iyzipay") as IyzipayConstructor;
import { prisma } from "@/lib/prisma";
import {
  TIER_PRICING,
  getTierPriceKurus as getTierPriceKurusFromRegistry,
  type TierKey,
  type BillingPeriod as TierBillingPeriod,
} from "@/lib/tiers";

// --------------------------------------------------------------------------
// Minimal tip tanımları (iyzipay paket tip içermiyor)
// --------------------------------------------------------------------------

type IyzipayCallback<T> = (err: Error | null, result: T) => void;

interface CheckoutFormInitializeRequest {
  locale: "tr" | "en";
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: "TRY";
  basketId: string;
  paymentGroup: "PRODUCT" | "LISTING" | "SUBSCRIPTION";
  callbackUrl: string;
  enabledInstallments?: number[];
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber?: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    category2?: string;
    itemType: "VIRTUAL" | "PHYSICAL";
    price: string;
  }>;
}

interface CheckoutFormInitializeResult {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  token?: string;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  tokenExpireTime?: number;
  signature?: string;
}

interface RetrieveCheckoutFormRequest {
  locale: "tr" | "en";
  conversationId: string;
  token: string;
}

interface RetrieveCheckoutFormResult {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  price?: number;
  paidPrice?: number;
  installment?: number;
  paymentId?: string;
  fraudStatus?: number;
  merchantCommissionRate?: number;
  merchantCommissionRateAmount?: number;
  iyziCommissionRateAmount?: number;
  iyziCommissionFee?: number;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  basketId?: string;
  currency?: string;
  token?: string;
  callbackUrl?: string;
  paymentStatus?: "SUCCESS" | "FAILURE" | "INIT_THREEDS" | "CALLBACK_THREEDS" | "BKM_POS_SELECTED" | "CALLBACK_PECCO";
  mdStatus?: number;
  signature?: string;
}

interface IyzipayInstance {
  checkoutFormInitialize: {
    create(
      request: CheckoutFormInitializeRequest,
      cb: IyzipayCallback<CheckoutFormInitializeResult>,
    ): void;
  };
  checkoutForm: {
    retrieve(
      request: RetrieveCheckoutFormRequest,
      cb: IyzipayCallback<RetrieveCheckoutFormResult>,
    ): void;
  };
}

interface IyzipayConstructor {
  new (config: { apiKey: string; secretKey: string; uri: string }): IyzipayInstance;
  (config: { apiKey: string; secretKey: string; uri: string }): IyzipayInstance;
}

// --------------------------------------------------------------------------
// Konfigürasyon
// --------------------------------------------------------------------------

export function isReady(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

function getIyzicoUri(): string {
  // Geriye dönük uyumluluk: eski .env IYZICO_BASE_URL kullanıyordu.
  return (
    process.env.IYZICO_URI ??
    process.env.IYZICO_BASE_URL ??
    "https://sandbox-api.iyzipay.com"
  );
}

function getCallbackUrl(): string {
  return (
    process.env.IYZICO_CALLBACK_URL ??
    (process.env.PUBLIC_BASE_URL ? `${process.env.PUBLIC_BASE_URL}/odeme/callback` : "https://otosonar.com/odeme/callback")
  );
}

let cached: IyzipayInstance | null = null;
function getClient(): IyzipayInstance {
  if (cached) return cached;
  if (!isReady()) {
    throw new Error("iyzico_not_configured");
  }
  cached = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY!,
    secretKey: process.env.IYZICO_SECRET_KEY!,
    uri: getIyzicoUri(),
  });
  return cached;
}

// --------------------------------------------------------------------------
// Fiyatlandırma
// --------------------------------------------------------------------------

// Paid tier seçimleri — FREE checkout'a girmez.
export type PaidTier = Exclude<TierKey, "FREE">;

export interface CheckoutInput {
  userId: string;
  tier: PaidTier;
  billingPeriod: TierBillingPeriod;
  amountKurus: number;
  buyerIp?: string;
}

/**
 * Kuruş cinsinden tier fiyatı. KDV dahil.
 * `period` verilmezse MONTHLY varsayılır (geriye dönük uyum için).
 */
export function getTierPriceKurus(
  tier: PaidTier,
  period: TierBillingPeriod = "MONTHLY",
): number {
  return getTierPriceKurusFromRegistry(tier, period);
}

function getTierLabel(tier: PaidTier): string {
  return TIER_PRICING[tier].label;
}

function kurusToLiraStr(kurus: number): string {
  // iyzico "price"/"paidPrice" decimal string bekliyor, ondalık nokta.
  const lira = Math.round(kurus) / 100;
  return lira.toFixed(2);
}

// --------------------------------------------------------------------------
// Checkout session
// --------------------------------------------------------------------------

export async function createCheckoutSession(input: CheckoutInput): Promise<{
  checkoutUrl: string;
  paymentIntentId: string;
  isStub: boolean;
  token?: string;
  conversationId?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, fullName: true, phone: true },
  });
  if (!user) throw new Error("user_not_found");

  const conversationId = randomUUID();
  const intent = await prisma.paymentIntent.create({
    data: {
      userId: input.userId,
      amountKurus: input.amountKurus,
      currency: "TRY",
      provider: "iyzico",
      status: "PENDING",
      metadata: {
        tier: input.tier,
        billingPeriod: input.billingPeriod,
        conversationId,
      } as never,
    },
  });

  if (!isReady()) {
    return {
      checkoutUrl: `/odeme/sahte?intent=${intent.id}`,
      paymentIntentId: intent.id,
      isStub: true,
    };
  }

  const label = getTierLabel(input.tier);
  const priceStr = kurusToLiraStr(input.amountKurus);
  const [firstName, ...rest] = (user.fullName ?? "Müşteri").trim().split(/\s+/);
  const surname = rest.join(" ") || firstName;

  const request: CheckoutFormInitializeRequest = {
    locale: "tr",
    conversationId,
    price: priceStr,
    paidPrice: priceStr,
    currency: "TRY",
    basketId: intent.id,
    paymentGroup: "SUBSCRIPTION",
    callbackUrl: getCallbackUrl(),
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: user.id,
      name: firstName || "Musteri",
      surname: surname || firstName || "Musteri",
      email: user.email,
      gsmNumber: user.phone ?? undefined,
      // iyzico zorunlu: TC kimlik no alanı — elimizde yok, 11 haneli placeholder (sandbox kabul ediyor, prod'da KYC ile değişmeli)
      identityNumber: "11111111111",
      registrationAddress: "Turkiye",
      ip: input.buyerIp ?? "0.0.0.0",
      city: "Istanbul",
      country: "Turkiye",
    },
    shippingAddress: {
      contactName: user.fullName ?? "Musteri",
      city: "Istanbul",
      country: "Turkiye",
      address: "Dijital abonelik",
    },
    billingAddress: {
      contactName: user.fullName ?? "Musteri",
      city: "Istanbul",
      country: "Turkiye",
      address: "Dijital abonelik",
    },
    basketItems: [
      {
        id: `sub_${input.tier}_${input.billingPeriod}`,
        name: `${label} (${input.billingPeriod === "YEARLY" ? "Yıllık" : "Aylık"})`,
        category1: "Abonelik",
        category2: "OtoSonar",
        itemType: "VIRTUAL",
        price: priceStr,
      },
    ],
  };

  const client = getClient();
  const result = await new Promise<CheckoutFormInitializeResult>((resolve, reject) => {
    try {
      client.checkoutFormInitialize.create(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });

  if (result.status !== "success" || !result.paymentPageUrl || !result.token) {
    // Intent'i fail'e al.
    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "FAILED",
        failReason: result.errorMessage ?? result.errorCode ?? "iyzico_init_failed",
      },
    });
    throw new Error(result.errorMessage ?? "iyzico_init_failed");
  }

  // Token'ı providerRef'e yaz (unique — idempotency).
  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: { providerRef: result.token },
  });

  return {
    checkoutUrl: result.paymentPageUrl,
    paymentIntentId: intent.id,
    isStub: false,
    token: result.token,
    conversationId,
  };
}

// --------------------------------------------------------------------------
// Checkout sonuç sorgulama
// --------------------------------------------------------------------------

export async function retrieveCheckoutResult(
  token: string,
  conversationId: string,
): Promise<RetrieveCheckoutFormResult> {
  const client = getClient();
  return new Promise<RetrieveCheckoutFormResult>((resolve, reject) => {
    try {
      client.checkoutForm.retrieve({ locale: "tr", token, conversationId }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}

// --------------------------------------------------------------------------
// Webhook imza doğrulama (iyzico HMAC-SHA1, X-IYZ-SIGNATURE)
// --------------------------------------------------------------------------

/**
 * iyzico webhook payload'ı için HMAC-SHA1(secretKey, rawBody) base64 karşılaştırması.
 * iyzico döküman: "V1 webhook imza algoritması = HMAC-SHA1, secretKey ile raw body."
 * Header: X-IYZ-SIGNATURE (bazı dökümantasyonlarda x-iyz-signature-v3 de gözüküyor,
 * iki varyantı da kabul edecek şekilde çağıran tarafta header okuyoruz).
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.IYZICO_SECRET_KEY) return false;
  const secret = process.env.IYZICO_SECRET_KEY;

  // Birincil: HMAC-SHA1 base64
  const sha1b64 = createHmac("sha1", secret).update(rawBody).digest("base64");
  if (timingEqual(sha1b64, signature)) return true;

  // Bazı iyzico hesaplarında hex formatı veriliyor — backup kontrol.
  const sha1hex = createHmac("sha1", secret).update(rawBody).digest("hex");
  if (timingEqual(sha1hex, signature)) return true;

  // V2 akışı SHA-256 döndürebilir.
  const sha256b64 = createHmac("sha256", secret).update(rawBody).digest("base64");
  if (timingEqual(sha256b64, signature)) return true;

  return false;
}

function timingEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// --------------------------------------------------------------------------
// PaymentIntent durum yardımcıları
// --------------------------------------------------------------------------

export async function markSuccess(intentId: string, providerRef: string): Promise<void> {
  await prisma.paymentIntent.update({
    where: { id: intentId },
    data: { status: "SUCCESS", providerRef },
  });
}

export async function markFailed(intentId: string, reason: string): Promise<void> {
  await prisma.paymentIntent.update({
    where: { id: intentId },
    data: { status: "FAILED", failReason: reason },
  });
}
