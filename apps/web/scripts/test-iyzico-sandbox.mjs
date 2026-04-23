#!/usr/bin/env node
/**
 * iyzico sandbox smoke test.
 *
 * lib/iyzico.ts'in kullandığı iyzipay paketini aynı konfigürasyonla çağırır,
 * checkoutFormInitialize.create → paymentPageUrl dönüyor mu gösterir.
 *
 * Çalıştırma:
 *   IYZICO_API_KEY=... IYZICO_SECRET_KEY=... node apps/web/scripts/test-iyzico-sandbox.mjs
 *
 * Default olarak iyzico docs'ta verilen public sandbox anahtarlarını kullanır.
 */
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Iyzipay = require("iyzipay");

const apiKey = process.env.IYZICO_API_KEY || "sandbox-afXhZPW0MQlE4dCUUlHcEopnMBgXnAZI";
const secretKey = process.env.IYZICO_SECRET_KEY || "sandbox-wbwpzKIiplZxI3hh5ALI4FJyAcZKL6kq";
const uri = process.env.IYZICO_URI || "https://sandbox-api.iyzipay.com";

console.log("[iyzico-sandbox] uri=", uri);

const iyzipay = new Iyzipay({ apiKey, secretKey, uri });

const conversationId = randomUUID();
const request = {
  locale: "tr",
  conversationId,
  price: "249.00",
  paidPrice: "249.00",
  currency: "TRY",
  basketId: "TEST_" + Date.now(),
  paymentGroup: "SUBSCRIPTION",
  callbackUrl: "https://otosonar.com/odeme/callback",
  enabledInstallments: [1, 2, 3, 6, 9],
  buyer: {
    id: "test_buyer",
    name: "Ali",
    surname: "Yilmaz",
    email: "test@otosonar.com",
    gsmNumber: "+905350000000",
    identityNumber: "11111111111",
    registrationAddress: "Turkiye",
    ip: "127.0.0.1",
    city: "Istanbul",
    country: "Turkiye",
  },
  shippingAddress: {
    contactName: "Ali Yilmaz",
    city: "Istanbul",
    country: "Turkiye",
    address: "Dijital abonelik",
  },
  billingAddress: {
    contactName: "Ali Yilmaz",
    city: "Istanbul",
    country: "Turkiye",
    address: "Dijital abonelik",
  },
  basketItems: [
    {
      id: "sub_pro_monthly",
      name: "OtoSonar Pro (Aylık)",
      category1: "Abonelik",
      category2: "OtoSonar",
      itemType: "VIRTUAL",
      price: "249.00",
    },
  ],
};

console.log("[iyzico-sandbox] POST checkoutFormInitialize…");
const initResult = await new Promise((resolve, reject) => {
  iyzipay.checkoutFormInitialize.create(request, (err, res) => {
    if (err) reject(err);
    else resolve(res);
  });
});

console.log("[iyzico-sandbox] init result:");
console.log(JSON.stringify(initResult, null, 2).slice(0, 1500));

if (initResult.status !== "success") {
  console.error("[iyzico-sandbox] FAIL: init did not succeed");
  process.exit(1);
}

if (!initResult.token || !initResult.paymentPageUrl) {
  console.error("[iyzico-sandbox] FAIL: token or paymentPageUrl missing");
  process.exit(1);
}

console.log("\n[iyzico-sandbox] SUCCESS:");
console.log("  token:", initResult.token);
console.log("  paymentPageUrl:", initResult.paymentPageUrl);
console.log("  conversationId:", conversationId);

// Retrieve flow — aynı token ile sorgula. Henüz ödeme yapılmadığı için
// paymentStatus null/FAILURE dönebilir ama istek kabul edilmeli.
console.log("\n[iyzico-sandbox] GET checkoutForm.retrieve…");
const retrieveResult = await new Promise((resolve, reject) => {
  iyzipay.checkoutForm.retrieve(
    { locale: "tr", token: initResult.token, conversationId },
    (err, res) => {
      if (err) reject(err);
      else resolve(res);
    },
  );
});

console.log("[iyzico-sandbox] retrieve result:");
console.log(JSON.stringify(retrieveResult, null, 2).slice(0, 1500));

console.log("\n[iyzico-sandbox] Tüm akış OK. Gerçek 3DS ödemesi için paymentPageUrl'i tarayıcıda aç.");
console.log("Sandbox test kartı: 5528790000000008  CVC 123  son 12/30");
