import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { getPublicKey } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(40).max(200),
    auth: z.string().min(8).max(80),
  }),
}).strict();

export async function GET() {
  const publicKey = getPublicKey();
  return NextResponse.json({ success: true, publicKey, enabled: !!publicKey });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  const user = await getCurrentUser();
  const ua = req.headers.get("user-agent");

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      userId: user?.id ?? null,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent: ua?.slice(0, 500) ?? null,
    },
    update: {
      userId: user?.id ?? null,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      lastSeenAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ success: false }, { status: 400 });
  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => undefined);
  return NextResponse.json({ success: true });
}
