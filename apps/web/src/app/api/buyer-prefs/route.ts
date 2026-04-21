import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  budgetMin: z.number().int().min(0).max(50_000_000).nullable().optional(),
  budgetMax: z.number().int().min(0).max(50_000_000).nullable().optional(),
  brands: z.array(z.string().max(40)).max(20).default([]),
  cities: z.array(z.string().max(40)).max(20).default([]),
}).strict();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const p = await prisma.buyerPreferences.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ success: true, prefs: p });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  await prisma.buyerPreferences.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
      brands: parsed.data.brands,
      cities: parsed.data.cities,
    },
    update: {
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
      brands: parsed.data.brands,
      cities: parsed.data.cities,
    },
  });

  return NextResponse.json({ success: true });
}
