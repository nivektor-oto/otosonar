import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  const { id } = await params;
  const key = await prisma.dealerApiKey.findUnique({ where: { id } });
  if (!key || key.dealerId !== dealer.id) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  if (key.revokedAt) {
    return NextResponse.json({ success: true, alreadyRevoked: true });
  }

  try {
    await prisma.dealerApiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    await logError(err, { path: `/api/dealer/api-keys/${id}`, userId: user.id });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
