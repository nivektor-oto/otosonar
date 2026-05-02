import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || "";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || "";
const SHOP = process.env.SHOPIFY_SHOP || "ni-vector";

// Telegram is the inbox where the access token will be delivered.
// Vault: NIVECTOR_BILGILER.md §3 (NINA V2 bot).
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || "5748487741";

async function notifyTelegram(text: string) {
  if (!TG_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text,
        disable_web_page_preview: true,
      }),
    });
  } catch {
    /* swallow — token is still in response body */
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateQuery = url.searchParams.get("state");
  const stateCookie = req.headers.get("cookie")?.match(/shopify_oauth_state=([a-f0-9]+)/)?.[1];

  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    return NextResponse.json(
      { error: "SHOPIFY_API_KEY / SHOPIFY_API_SECRET env not set" },
      { status: 500 }
    );
  }
  if (!code) {
    return NextResponse.json({ error: "code missing" }, { status: 400 });
  }
  if (!stateQuery || !stateCookie || stateQuery !== stateCookie) {
    return NextResponse.json(
      { error: "state mismatch (CSRF guard)", stateQuery, stateCookie: stateCookie ?? null },
      { status: 400 }
    );
  }

  const tokenRes = await fetch(`https://${SHOP}.myshopify.com/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: "token exchange failed", status: tokenRes.status, body: text },
      { status: 500 }
    );
  }

  const data = (await tokenRes.json()) as { access_token: string; scope: string };

  await notifyTelegram(
    [
      "🎉 Shopify Admin API token alındı!",
      "",
      `Mağaza: ${SHOP}.myshopify.com`,
      `Token: ${data.access_token}`,
      `Scope: ${data.scope}`,
      "",
      "Vault'a yazılacak. Bu route deploy sonrası kaldırılmalı.",
    ].join("\n")
  );

  // Don't render the token to the page — only Telegram.
  return new NextResponse(
    `<!DOCTYPE html><html lang="tr"><body style="font-family:system-ui;background:#0f0;color:#000;padding:60px;text-align:center;">
    <h1>✅ Shopify bağlandı</h1>
    <p>Token Telegram'a yollandı. Bu sekmeyi kapatabilirsin.</p>
    </body></html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
