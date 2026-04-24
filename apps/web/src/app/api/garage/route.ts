import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TR plaka basit kontrol: "34 ABC 123" / "34 AB 1234" vb. — boşluk, dash, * harf rakam karışık
const plateSchema = z
  .string()
  .trim()
  .max(20)
  .regex(/^[0-9]{2}\s?[A-ZÇĞİÖŞÜ]{1,3}\s?[0-9]{2,4}$/i, "plaka formatı")
  .transform((v) => v.toUpperCase().replace(/\s+/g, " ").trim());

const isoDate = z
  .string()
  .datetime()
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
  .transform((v) => new Date(v));

const createSchema = z
  .object({
    plate: plateSchema.optional(),
    brand: z.string().min(1).max(40),
    model: z.string().min(1).max(60),
    year: z.number().int().min(1950).max(2035),
    variant: z.string().max(80).optional(),
    kmCurrent: z.number().int().min(0).max(2_000_000).optional(),
    colorHex: z
      .string()
      .max(10)
      .regex(/^#?[0-9a-fA-F]{3,8}$/)
      .optional(),
    fuelType: z.enum(["benzin", "dizel", "lpg", "hybrid", "elektrik"]).optional(),
    transmission: z.enum(["manuel", "otomatik", "yarı-otomatik"]).optional(),
    vin: z.string().max(30).optional(),
    registrationDate: isoDate.optional(),
    inspectionDueAt: isoDate.optional(),
    inspectionNotifyDaysBefore: z.number().int().min(1).max(90).default(7),
    insuranceDueAt: isoDate.optional(),
    insuranceNotifyDaysBefore: z.number().int().min(1).max(90).default(14),
    mtvDueAt: isoDate.optional(),
    mtvNotifyDaysBefore: z.number().int().min(1).max(90).default(7),
    acquiredAt: isoDate.optional(),
    photoUrl: z.string().url().max(2000).optional(),
    ruhsatPhotoUrl: z.string().url().max(2000).optional(),
    notes: z.string().max(2000).optional(),
  })
  .strict();

export async function GET() {
  if (!isFeatureEnabled("GARAGE_ENABLED")) return featureDisabledResponse("GARAGE_ENABLED");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const vehicles = await prisma.userVehicle.findMany({
    where: { userId: user.id, soldAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ success: true, vehicles });
}

export async function POST(req: Request) {
  if (!isFeatureEnabled("GARAGE_ENABLED")) return featureDisabledResponse("GARAGE_ENABLED");
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`garage.create:user:${user.id}`, 20, 24 * 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited", resetsAt: rl.resetsAt },
      { status: 429 },
    );
  }
  // IP bazlı ikinci kat (bot / fuzz koruması)
  await checkRateLimit(`garage.create:ip:${ip}`, 40, 24 * 3600);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "validation", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const count = await prisma.userVehicle.count({
    where: { userId: user.id, soldAt: null },
  });
  if (count >= 20) {
    return NextResponse.json(
      { success: false, error: "limit_reached", message: "En fazla 20 aktif araç." },
      { status: 429 },
    );
  }

  const vehicle = await prisma.userVehicle.create({
    data: {
      userId: user.id,
      plate: d.plate ?? null,
      brand: d.brand,
      model: d.model,
      year: d.year,
      variant: d.variant ?? null,
      kmCurrent: d.kmCurrent ?? null,
      kmLastUpdatedAt: d.kmCurrent != null ? new Date() : null,
      colorHex: d.colorHex ?? null,
      fuelType: d.fuelType ?? null,
      transmission: d.transmission ?? null,
      vin: d.vin ?? null,
      registrationDate: d.registrationDate ?? null,
      inspectionDueAt: d.inspectionDueAt ?? null,
      inspectionNotifyDaysBefore: d.inspectionNotifyDaysBefore,
      insuranceDueAt: d.insuranceDueAt ?? null,
      insuranceNotifyDaysBefore: d.insuranceNotifyDaysBefore,
      mtvDueAt: d.mtvDueAt ?? null,
      mtvNotifyDaysBefore: d.mtvNotifyDaysBefore,
      acquiredAt: d.acquiredAt ?? null,
      photoUrl: d.photoUrl ?? null,
      ruhsatPhotoUrl: d.ruhsatPhotoUrl ?? null,
      notes: d.notes ?? null,
    },
  });

  return NextResponse.json({ success: true, vehicle }, { status: 201 });
}
