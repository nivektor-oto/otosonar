import { NextResponse } from "next/server";
import { isAppleConfigured, isGoogleConfigured } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    google: isGoogleConfigured(),
    apple: isAppleConfigured(),
  });
}
