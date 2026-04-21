import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * OAuth state + nonce imzalama. CSRF ve replay koruması için.
 */
function getSecret(): string {
  const s = process.env.OAUTH_STATE_SECRET ?? process.env.USER_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("OAUTH_STATE_SECRET or USER_SESSION_SECRET missing");
  return s;
}

export function signOAuthState(data: Record<string, string>, ttlSeconds = 600): string {
  const payload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    n: randomBytes(8).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyOAuthState(token: string): Record<string, string> | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  let expected: string;
  try {
    expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  } catch {
    return null;
  }
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  let data: Record<string, string | number>;
  try {
    data = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof data.exp === "number" && data.exp < Math.floor(Date.now() / 1000)) return null;
  delete data.exp;
  delete data.n;
  return data as Record<string, string>;
}

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isAppleConfigured(): boolean {
  return Boolean(
    process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY,
  );
}

export function getGoogleAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<{ id: string; email: string; name: string; picture?: string }> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${await tokenRes.text()}`);
  }
  const token = (await tokenRes.json()) as { id_token?: string; access_token?: string };

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userRes.ok) throw new Error("Google userinfo failed");

  const user = (await userRes.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  };
  return {
    id: user.sub,
    email: user.email,
    name: user.name ?? user.email.split("@")[0],
    picture: user.picture,
  };
}
