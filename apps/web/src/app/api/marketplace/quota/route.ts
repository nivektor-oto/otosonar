import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { evaluateListingQuota, LISTING_FEE_TL, B2C_FREE_LIFETIME } from "@/lib/marketplace-quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }
  const q = await evaluateListingQuota(user.id);
  return NextResponse.json({
    success: true,
    quota: q,
    config: { listingFeeTL: LISTING_FEE_TL, b2cFreeLifetime: B2C_FREE_LIFETIME },
  });
}
