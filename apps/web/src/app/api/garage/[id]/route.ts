import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const plateSchema = z
  .string()
  .trim()
  .max(20)
  .regex(/^[0-9]{2}\s?[A-ZÇĞİÖŞÜ]{1,3}\s?[0-9]{2,4}$/i)
  .transform((v) => v.toUpperCase().replace(/\s+/g, " ").trim());

const isoDate = z
  .string()
  .datetime()
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
  .transform((v) => new Date(v));

const patchSchema = z
  .object({
    plate: plateSchema.nullable().optional(),
    brand: z.string().min(1).max(40).optional(),
    model: z.string().min(1).max(60).optional(),
    year: z.number().int().min(1950).max(2035).optional(),
    variant: z.string().max(80).nullable().optional(),
    kmCurrent: z.number().int().min(0).max(2_000_000).nullable().optional(),
    colorHex: z.string().max(10).nullable().optional(),
    fuelType: z.enum(["benzin", "dizel", "lpg", "hybrid", "elektrik"]).nullable().optional(),
    transmission: z.enum(["manuel", "otomatik", "yarı-otomatik"]).nullable().optional(),
    vin: z.string().max(30).nullable().optional(),
    registrationDate: isoDate.nullable().optional(),
    inspectionDueAt: isoDate.nullable().optional(),
    inspectionNotifyDaysBefore: z.number().int().min(1).max(90).optional(),
    insuranceDueAt: isoDate.nullable().optional(),
    insuranceNotifyDaysBefore: z.number().int().min(1).max(90).optional(),
    mtvDueAt: isoDate.nullable().optional(),
    mtvNotifyDaysBefore: z.number().int().min(1).max(90).optional(),
    acquiredAt: isoDate.nullable().optional(),
    photoUrl: z.string().url().max(2000).nullable().optional(),
    ruhsatPhotoUrl: z.string().url().max(2000).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .strict();

async function loadOwned(id: string, userId: string) {
  const v = await prisma.userVehicle.findUnique({ where: { id } });
  if (!v || v.userId !== userId) return null;
  return v;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isFeatureEnabled("GARAGE_ENABLED")) return featureDisabledResponse("GARAGE_ENABLED");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const v = await loadOwned(id, user.id);
  if (!v) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ success: true, vehicle: v });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isFeatureEnabled("GARAGE_ENABLED")) return featureDisabledResponse("GARAGE_ENABLED");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const v = await loadOwned(id, user.id);
  if (!v) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "validation", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if ("kmCurrent" in data && data.kmCurrent != null) {
    data.kmLastUpdatedAt = new Date();
  }

  const updated = await prisma.userVehicle.update({
    where: { id },
    data,
  });
  return NextResponse.json({ success: true, vehicle: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isFeatureEnabled("GARAGE_ENABLED")) return featureDisabledResponse("GARAGE_ENABLED");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const v = await loadOwned(id, user.id);
  if (!v) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });

  // soft delete
  const updated = await prisma.userVehicle.update({
    where: { id },
    data: { soldAt: new Date() },
  });
  return NextResponse.json({ success: true, vehicle: updated });
}
