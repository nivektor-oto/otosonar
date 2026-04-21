import { NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleConfigured, signOAuthState } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/giris?error=google_not_configured", req.url));
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") === "kayit" ? "kayit" : "giris";
  const referralCode = url.searchParams.get("ref") ?? "";

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const redirectUri = `${base}/api/auth/google/callback`;
  const state = signOAuthState({ mode, ref: referralCode });

  return NextResponse.redirect(getGoogleAuthUrl(state, redirectUri));
}
