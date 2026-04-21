import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  companyName: z.string().min(2).max(120),
  cityId: z.string().min(2).max(40),
  address: z.string().max(300).optional(),
  taxNo: z.string().min(10).max(11).optional(),
  mersisNo: z.string().max(20).optional(),
  monthlyVolume: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
}).strict();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ success: true, dealer });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`dealer.post:user:${user.id}:${ip}`, 10, 600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = await prisma.dealer.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      companyName: parsed.data.companyName,
      cityId: parsed.data.cityId,
      address: parsed.data.address ?? null,
      taxNo: parsed.data.taxNo ?? null,
      mersisNo: parsed.data.mersisNo ?? null,
      monthlyVolume: parsed.data.monthlyVolume ?? null,
    },
    update: {
      companyName: parsed.data.companyName,
      cityId: parsed.data.cityId,
      address: parsed.data.address ?? null,
      taxNo: parsed.data.taxNo ?? null,
      mersisNo: parsed.data.mersisNo ?? null,
      monthlyVolume: parsed.data.monthlyVolume ?? null,
    },
  });

  if (user.userType !== "DEALER") {
    await prisma.user.update({ where: { id: user.id }, data: { userType: "DEALER" } });
  }

  return NextResponse.json({ success: true, dealer: d });
}
