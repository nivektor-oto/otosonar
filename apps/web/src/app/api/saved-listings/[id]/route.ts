import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.savedListing.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  await prisma.savedListing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
