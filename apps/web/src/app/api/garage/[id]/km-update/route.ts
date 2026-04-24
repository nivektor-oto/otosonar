import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    kmCurrent: z.number().int().min(0).max(2_000_000),
  })
  .strict();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isFeatureEnabled("GARAGE_ENABLED")) return featureDisabledResponse("GARAGE_ENABLED");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const v = await prisma.userVehicle.findUnique({ where: { id } });
  if (!v || v.userId !== user.id) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  // Km geriye gitmesin (manipülasyon)
  if (v.kmCurrent != null && parsed.data.kmCurrent < v.kmCurrent) {
    return NextResponse.json(
      { success: false, error: "km_regression", message: "Kilometre geriye gitmez." },
      { status: 400 },
    );
  }

  const updated = await prisma.userVehicle.update({
    where: { id },
    data: {
      kmCurrent: parsed.data.kmCurrent,
      kmLastUpdatedAt: new Date(),
    },
  });
  return NextResponse.json({ success: true, vehicle: updated });
}
