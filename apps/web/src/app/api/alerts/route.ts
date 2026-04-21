import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  label: z.string().max(80).optional(),
  brand: z.string().min(1).max(40),
  model: z.string().max(60).optional(),
  yearMin: z.number().int().min(1970).max(2030).optional(),
  yearMax: z.number().int().min(1970).max(2030).optional(),
  priceMax: z.number().int().min(10_000).max(50_000_000).optional(),
  cityFilter: z.string().max(40).optional(),
}).strict();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ success: true, alerts });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const count = await prisma.priceAlert.count({ where: { userId: user.id, active: true } });
  if (count >= 10) {
    return NextResponse.json({ success: false, error: "limit_reached" }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  const alert = await prisma.priceAlert.create({
    data: {
      userId: user.id,
      label: parsed.data.label ?? null,
      brand: parsed.data.brand,
      model: parsed.data.model ?? null,
      yearMin: parsed.data.yearMin ?? null,
      yearMax: parsed.data.yearMax ?? null,
      priceMax: parsed.data.priceMax ?? null,
      cityFilter: parsed.data.cityFilter ?? null,
    },
  });

  return NextResponse.json({ success: true, alert });
}
