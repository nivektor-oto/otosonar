import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const FOUNDER_COOKIE = "otosonar_founder";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const s = process.env.FOUNDER_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("FOUNDER_SESSION_SECRET missing or too short (>=32 chars).");
  }
  return s;
}

export function verifyFounderCredentials(email: string, password: string): boolean {
  const envEmail = process.env.FOUNDER_EMAIL ?? "";
  const envPass = process.env.FOUNDER_PASSWORD ?? "";
  if (!envEmail || !envPass) return false;

  try {
    const emailA = Buffer.from(email.trim().toLowerCase().padEnd(64, "\0").slice(0, 64));
    const emailB = Buffer.from(envEmail.trim().toLowerCase().padEnd(64, "\0").slice(0, 64));
    const passA = Buffer.from(password.padEnd(128, "\0").slice(0, 128));
    const passB = Buffer.from(envPass.padEnd(128, "\0").slice(0, 128));
    return timingSafeEqual(emailA, emailB) && timingSafeEqual(passA, passB);
  } catch {
    return false;
  }
}

export function mintSessionToken(email: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_MAX_AGE;
  const payload = Buffer.from(
    JSON.stringify({ email, iat: issuedAt, exp: expiresAt }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export interface FounderSession {
  email: string;
  iat: number;
  exp: number;
}

export function verifySessionToken(token: string | undefined): FounderSession | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  let expected: string;
  try {
    expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  } catch {
    return null;
  }
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  let data: FounderSession;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (!data.exp || data.exp < now) return null;
  return data;
}

export async function getFounderSession(): Promise<FounderSession | null> {
  const store = await cookies();
  const token = store.get(FOUNDER_COOKIE)?.value;
  return verifySessionToken(token);
}
