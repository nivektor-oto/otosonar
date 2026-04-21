import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  km: z.number().int().min(0).max(2_000_000).optional(),
  askingPrice: z.number().int().min(0).max(50_000_000).optional(),
  expenseTotal: z.number().int().min(0).max(10_000_000).optional(),
  insurancePolicyEnd: z.string().datetime().nullable().optional(),
  inspectionDueDate: z.string().datetime().nullable().optional(),
  insuranceType: z.string().max(30).nullable().optional(),
  status: z.enum(["IN_STOCK", "LISTED", "RESERVED", "SOLD"]).optional(),
  soldPrice: z.number().int().min(0).max(50_000_000).nullable().optional(),
  soldToName: z.string().max(120).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
}).strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle || vehicle.dealerId !== dealer.id) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  try {
    const data: Record<string, unknown> = { ...parsed.data };
    if ("insurancePolicyEnd" in data && typeof data.insurancePolicyEnd === "string") {
      data.insurancePolicyEnd = new Date(data.insurancePolicyEnd);
    }
    if ("inspectionDueDate" in data && typeof data.inspectionDueDate === "string") {
      data.inspectionDueDate = new Date(data.inspectionDueDate);
    }
    if (parsed.data.status === "SOLD" && !vehicle.soldAt) {
      data.soldAt = new Date();
    }
    const updated = await prisma.vehicle.update({ where: { id }, data });
    return NextResponse.json({ success: true, vehicle: updated });
  } catch (err) {
    await logError(err, { path: `/api/dealer/vehicles/${id}`, userId: user.id });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle || vehicle.dealerId !== dealer.id) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
