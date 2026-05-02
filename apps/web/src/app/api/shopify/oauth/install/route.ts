import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-time OAuth bridge for NiPrint Shopify (ni-vector store).
// To be removed after token is captured.
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || "";
const SHOP = process.env.SHOPIFY_SHOP || "ni-vector";
const SCOPES = [
  "read_products", "write_products",
  "read_inventory", "write_inventory",
  "read_orders", "write_orders",
  "read_draft_orders", "write_draft_orders",
  "read_customers", "write_customers",
  "read_fulfillments", "write_fulfillments",
  "read_assigned_fulfillment_orders", "write_assigned_fulfillment_orders",
  "read_themes", "write_themes",
  "read_content", "write_content",
  "read_files", "write_files",
  "read_locations",
  "read_shipping",
  "read_price_rules", "write_price_rules",
  "read_discounts", "write_discounts",
  "read_metaobjects", "write_metaobjects",
  "read_metafield_definitions", "write_metafield_definitions",
].join(",");

export async function GET(req: Request) {
  if (!SHOPIFY_API_KEY) {
    return NextResponse.json(
      { error: "SHOPIFY_API_KEY env not set" },
      { status: 500 }
    );
  }
  const url = new URL(req.url);
  const origin = `https://${url.host}`;
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/shopify/oauth/callback`;

  const authUrl =
    `https://${SHOP}.myshopify.com/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  const res = NextResponse.redirect(authUrl, 302);
  // 10 min expiry CSRF guard
  res.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
