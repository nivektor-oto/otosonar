/**
 * Meta WhatsApp Cloud API webhook.
 *
 * Flow:
 *  - GET : subscription verification challenge (Meta calls once at setup).
 *  - POST: inbound message delivery. Dealer texts a free-form listing,
 *          we parse it with the primary AI provider and create a DRAFT MarketplaceListing.
 *
 * Security:
 *  - Fail-closed: if `WA_APP_SECRET` is not configured the endpoint short-circuits
 *    with 503 before parsing the body or touching the DB. Anonymous writes are not
 *    allowed at any point in the lifecycle.
 *  - x-hub-signature-256 HMAC-SHA256 over the raw request body, compared with
 *    timingSafeEqual. Missing/invalid signatures return 401.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-log";
import { parseWhatsappText } from "@/lib/wa-listing-parser";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET: verification challenge ────────────────────────────────

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = process.env.WA_VERIFY_TOKEN;

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("forbidden", { status: 403 });
}

// ─── POST: inbound messages ─────────────────────────────────────

export async function POST(req: Request) {
  if (!process.env.WA_APP_SECRET) {
    return NextResponse.json(
      { success: false, error: "not_configured" },
      { status: 503 }
    );
  }

  const ip = await getClientIp();
  const rl = await checkRateLimit(`wa.webhook:ip:${ip}`, 120, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(raw, signature)) {
    return NextResponse.json(
      { success: false, error: "invalid_signature" },
      { status: 401 }
    );
  }

  let payload: WaWebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  try {
    const messages = extractMessages(payload);
    // Process sequentially but don't let one bad message kill the rest.
    for (const msg of messages) {
      await handleMessage(msg).catch(async (err) => {
        await logError(err, {
          path: "/api/wa/webhook",
          metadata: { phone: msg.from.slice(-10) },
        });
      });
    }
  } catch (err) {
    await logError(err, { path: "/api/wa/webhook" });
    // Still return 200 so Meta doesn't retry indefinitely on our processing bugs.
  }

  return NextResponse.json({ success: true });
}

// ─── Signature verification ─────────────────────────────────────

function verifySignature(rawBody: string, sigHeader: string | null): boolean {
  const secret = process.env.WA_APP_SECRET;
  if (!secret) return false;
  if (!sigHeader || !sigHeader.startsWith("sha256=")) return false;
  const provided = sigHeader.slice("sha256=".length);
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ─── Meta payload shapes ────────────────────────────────────────

interface WaMessage {
  from: string; // E.164 without `+`
  id?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
}

interface WaChange {
  field?: string;
  value?: {
    messaging_product?: string;
    metadata?: unknown;
    messages?: WaMessage[];
    contacts?: unknown[];
  };
}

interface WaEntry {
  id?: string;
  changes?: WaChange[];
}

interface WaWebhookPayload {
  object?: string;
  entry?: WaEntry[];
}

function extractMessages(p: WaWebhookPayload): WaMessage[] {
  const out: WaMessage[] = [];
  for (const entry of p.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const m of change.value?.messages ?? []) {
        if (m && typeof m.from === "string" && m.text?.body) {
          out.push(m);
        }
      }
    }
  }
  return out;
}

// ─── Single-message handler ─────────────────────────────────────

async function handleMessage(msg: WaMessage): Promise<void> {
  const body = msg.text?.body?.trim();
  if (!body) return;

  const phone = msg.from.replace(/\D/g, "");
  if (!phone) return;
  const last10 = phone.slice(-10);

  // Find dealer by last 10 digits of the phone (robust to +90 / 0 / leading-country-code variants).
  const dealer = await findDealerByPhone(last10);
  if (!dealer) {
    console.info(
      `[wa-webhook] message from unknown phone ...${last10} — skipping (sign-up reply TODO)`
    );
    return;
  }

  const parsed = await parseWhatsappText(body);

  // Require a confident-enough parse with at least brand + price before drafting.
  if (parsed.confidence < 0.5 || !parsed.brand || !parsed.price) {
    console.info(
      `[wa-webhook] low-confidence parse (conf=${parsed.confidence}) from dealer=${dealer.id} — skipping draft`
    );
    return;
  }

  // Defaults for required MarketplaceListing fields.
  const year = parsed.year ?? new Date().getFullYear();
  const km = parsed.km ?? 0;
  // Dealer.cityId is required but we receive a free-text city from WA —
  // fall back to the dealer's registered cityId.
  const city = parsed.city ?? dealer.cityId;

  const description = [
    `WhatsApp üzerinden içe aktarıldı (imported_from_whatsapp).`,
    `Ham mesaj: ${parsed.raw.slice(0, 500)}`,
    parsed.fuelType ? `Yakıt: ${parsed.fuelType}` : null,
    parsed.transmission ? `Vites: ${parsed.transmission}` : null,
    parsed.keywords?.length ? `Etiketler: ${parsed.keywords.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await prisma.marketplaceListing.create({
    data: {
      sellerId: dealer.userId,
      brand: parsed.brand,
      model: parsed.model ?? "—",
      year,
      km,
      city,
      askingPrice: parsed.price,
      description,
      status: "DRAFT",
    },
  });
}

async function findDealerByPhone(last10: string) {
  if (last10.length < 7) return null;
  // We don't know how dealer.phone was formatted at signup; match the last 10 digits.
  const candidates = await prisma.dealer.findMany({
    where: { phone: { not: null } },
    select: { id: true, userId: true, phone: true, cityId: true },
    take: 500,
  });
  return (
    candidates.find((d) => (d.phone ?? "").replace(/\D/g, "").slice(-10) === last10) ?? null
  );
}
