import { NextResponse } from "next/server";
import {
  FOUNDER_COOKIE,
  SESSION_MAX_AGE,
  mintSessionToken,
  verifyFounderCredentials,
} from "@/lib/founder-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { success: false, error: "content-type application/json olmalı" },
      { status: 415 },
    );
  }

  // Brute-force koruması — admin endpoint, çok sıkı.
  const ip = await getClientIp();
  const rlIp = await checkRateLimit(`founder.login:ip:${ip}`, 5, 900); // 5 / 15dk per IP
  if (!rlIp.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited", retryAt: rlIp.resetsAt.toISOString() },
      { status: 429 },
    );
  }
  const rlGlobal = await checkRateLimit("founder.login:global", 30, 3600); // 30 / saat global
  if (!rlGlobal.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "E-posta ve şifre zorunlu" },
      { status: 400 },
    );
  }

  // Constant-time regardless of outcome.
  const ok = verifyFounderCredentials(email, password);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 200));
    return NextResponse.json(
      { success: false, error: "E-posta veya şifre hatalı" },
      { status: 401 },
    );
  }

  const token = mintSessionToken(email.trim().toLowerCase());
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set(FOUNDER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
