import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export const USER_COOKIE = "otosonar_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): string {
  const s = process.env.USER_SESSION_SECRET ?? process.env.FOUNDER_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("USER_SESSION_SECRET / FOUNDER_SESSION_SECRET missing or too short.");
  }
  return s;
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export function mintSessionCookie(sessionId: string, userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = Buffer.from(
    JSON.stringify({ sid: sessionId, uid: userId, exp }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export interface SessionPayload {
  sid: string;
  uid: string;
  exp: number;
}

export function verifySessionCookie(token: string | undefined): SessionPayload | null {
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
  let data: SessionPayload;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  const payload = verifySessionCookie(token);
  if (!payload) return null;

  const session = await prisma.userSession.findUnique({ where: { id: payload.sid } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.uid } });
  if (!user) return null;

  prisma.userSession
    .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
    .catch(() => undefined);

  return user;
}

export async function createSession(
  userId: string,
  userAgent: string | null,
  ipHash: string | null,
): Promise<{ sessionId: string; cookie: string }> {
  const raw = randomToken(32);
  const tokenHash = hashToken(raw);
  const session = await prisma.userSession.create({
    data: {
      userId,
      tokenHash,
      userAgent: userAgent?.slice(0, 500) ?? null,
      ipHash,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  });
  const cookie = mintSessionCookie(session.id, userId);
  return { sessionId: session.id, cookie };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.userSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  }).catch(() => undefined);
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "otosonar-v1";
  return createHash("sha256").update(salt + "|" + ip).digest("hex").slice(0, 32);
}

export function passwordStrength(pw: string): { ok: boolean; reason?: string } {
  if (pw.length < 8) return { ok: false, reason: "En az 8 karakter olmalı." };
  if (pw.length > 128) return { ok: false, reason: "En fazla 128 karakter." };
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(pw)) return { ok: false, reason: "En az bir harf gerekli." };
  if (!/[0-9]/.test(pw)) return { ok: false, reason: "En az bir rakam gerekli." };
  return { ok: true };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
