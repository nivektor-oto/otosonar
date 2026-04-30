import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "otosonar-web",
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION ?? "unknown",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
