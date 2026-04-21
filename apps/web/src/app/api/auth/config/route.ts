import { NextResponse } from "next/server";
import { isAppleConfigured, isGoogleConfigured } from "@/lib/oauth";
import { isEmailReady } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    google: isGoogleConfigured(),
    apple: isAppleConfigured(),
    email: isEmailReady(),
  });
}
