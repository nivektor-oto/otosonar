import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).nullable().optional(),
  marketingOptIn: z.boolean().optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
}).strict();

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`profile.patch:user:${user.id}:${ip}`, 30, 600);
  if (!rl.allowed) return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.fullName !== undefined && { fullName: parsed.data.fullName }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
      ...(parsed.data.marketingOptIn !== undefined && { marketingOptIn: parsed.data.marketingOptIn }),
      ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl }),
    },
  });

  return NextResponse.json({ success: true });
}
