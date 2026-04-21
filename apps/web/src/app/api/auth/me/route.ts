import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
}
