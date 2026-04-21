import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  brand: z.string().min(1).max(40),
  model: z.string().min(1).max(60),
  variant: z.string().max(100).optional(),
  year: z.number().int().min(1970).max(new Date().getFullYear() + 1),
  plate: z.string().max(15).optional(),
  vin: z.string().max(20).optional(),
  km: z.number().int().min(0).max(2_000_000).optional(),
  color: z.string().max(40).optional(),
  fuelType: z.string().max(30).optional(),
  transmission: z.string().max(30).optional(),
  bodyType: z.string().max(30).optional(),
  purchasePrice: z.number().int().min(0).max(50_000_000).optional(),
  purchaseDate: z.string().datetime().optional(),
  purchaseFromWhom: z.string().max(120).optional(),
  expenseTotal: z.number().int().min(0).max(10_000_000).optional(),
  askingPrice: z.number().int().min(0).max(50_000_000).optional(),
  insurancePolicyEnd: z.string().datetime().optional(),
  inspectionDueDate: z.string().datetime().optional(),
  insuranceType: z.string().max(30).optional(),
  ruhsatPhotoUrl: z.string().url().max(500).optional(),
  photos: z.array(z.string().url()).max(12).optional(),
  status: z.enum(["IN_STOCK", "LISTED", "RESERVED", "SOLD"]).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

async function getDealerForUser(userId: string) {
  return prisma.dealer.findUnique({ where: { userId } });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await getDealerForUser(user.id);
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  const vehicles = await prisma.vehicle.findMany({
    where: { dealerId: dealer.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ success: true, vehicles });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await getDealerForUser(user.id);
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const d = parsed.data;
    const vehicle = await prisma.vehicle.create({
      data: {
        dealerId: dealer.id,
        brand: d.brand,
        model: d.model,
        variant: d.variant ?? null,
        year: d.year,
        plate: d.plate?.toUpperCase() || null,
        vin: d.vin?.toUpperCase() || null,
        km: d.km ?? null,
        color: d.color ?? null,
        fuelType: d.fuelType ?? null,
        transmission: d.transmission ?? null,
        bodyType: d.bodyType ?? null,
        purchasePrice: d.purchasePrice ?? null,
        purchaseDate: d.purchaseDate ? new Date(d.purchaseDate) : null,
        purchaseFromWhom: d.purchaseFromWhom ?? null,
        expenseTotal: d.expenseTotal ?? 0,
        askingPrice: d.askingPrice ?? null,
        insurancePolicyEnd: d.insurancePolicyEnd ? new Date(d.insurancePolicyEnd) : null,
        inspectionDueDate: d.inspectionDueDate ? new Date(d.inspectionDueDate) : null,
        insuranceType: d.insuranceType ?? null,
        ruhsatPhotoUrl: d.ruhsatPhotoUrl ?? null,
        photosJson: (d.photos ?? null) as never,
        status: d.status ?? "IN_STOCK",
        notes: d.notes ?? null,
      },
    });
    return NextResponse.json({ success: true, vehicle });
  } catch (err) {
    await logError(err, { path: "/api/dealer/vehicles", userId: user.id });
    const msg = err instanceof Error ? err.message : "";
    if (/Unique constraint.*plate/i.test(msg)) {
      return NextResponse.json({ success: false, error: "plate_exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
