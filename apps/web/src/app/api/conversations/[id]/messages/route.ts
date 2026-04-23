import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendToUser } from "@/lib/push";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    body: z.string().trim().min(1).max(2000),
  })
  .strict();

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isFeatureEnabled("MESSAGING_ENABLED")) {
    return featureDisabledResponse("MESSAGING_ENABLED");
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

  const rl = await checkRateLimit(`conv.msg:user:${user.id}`, 30, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const { id } = await ctx.params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { brand: true, model: true } },
    },
  });
  if (!conv) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  const iAmBuyer = conv.buyerId === user.id;
  const iAmSeller = conv.sellerId === user.id;
  if (!iAmBuyer && !iAmSeller) {
    return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  }

  const body = parsed.data.body.trim();
  const now = new Date();
  const recipientId = iAmBuyer ? conv.sellerId : conv.buyerId;

  try {
    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: user.id,
        body,
      },
    });

    await prisma.conversation.update({
      where: { id: conv.id },
      data: {
        lastMessageAt: now,
        lastMessageBody: body.slice(0, 500),
        lastSenderId: user.id,
        ...(iAmBuyer
          ? { sellerUnread: { increment: 1 }, sellerArchivedAt: null }
          : { buyerUnread: { increment: 1 }, buyerArchivedAt: null }),
      },
    });

    sendToUser(recipientId, {
      title: `${user.fullName} mesaj gönderdi`,
      body: `${conv.listing.brand} ${conv.listing.model}: ${body.slice(0, 120)}`,
      url: `/hesap/mesajlar/${conv.id}`,
      tag: `conv-${conv.id}`,
    }).catch(() => undefined);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
