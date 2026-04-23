import { NextResponse } from "next/server";
import { z } from "zod";
import {
  chatMessageSchema,
  generateReply,
  transcribeAudio,
  type ChatUserContext,
} from "@/lib/chatbot";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 45;

const textBodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z.array(chatMessageSchema).max(20).optional(),
});

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/mp4",
]);

// Build a best-effort user context for the chat system prompt. If any of
// the enrichment queries fail we log a warning and return undefined so
// the caller falls back to the static prompt — chat must never break
// just because a side-query did.
async function buildUserContext(): Promise<ChatUserContext | undefined> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { isAuthenticated: false };
    }

    const [
      dealer,
      activeSub,
      unreadBuyer,
      unreadSeller,
      analysisCount,
      savedCount,
    ] = await Promise.all([
      prisma.dealer.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
      prisma.subscription.findFirst({
        where: { userId: user.id, status: { in: ["ACTIVE", "TRIAL"] } },
        orderBy: { createdAt: "desc" },
        select: { tier: true },
      }),
      prisma.conversation.aggregate({
        where: { buyerId: user.id, buyerArchivedAt: null },
        _sum: { buyerUnread: true },
      }),
      prisma.conversation.aggregate({
        where: { sellerId: user.id, sellerArchivedAt: null },
        _sum: { sellerUnread: true },
      }),
      prisma.analysis.count({ where: { userId: user.id } }),
      prisma.savedListing.count({ where: { userId: user.id } }),
    ]);

    const persona =
      (user.quizResult as { persona?: string } | null)?.persona ?? null;

    return {
      isAuthenticated: true,
      fullName: user.fullName,
      userType: user.userType as ChatUserContext["userType"],
      customerNumber: user.customerNumber,
      hasDealer: !!dealer,
      activeSubTier: activeSub?.tier ?? null,
      unreadMessageCount:
        (unreadBuyer._sum.buyerUnread ?? 0) +
        (unreadSeller._sum.sellerUnread ?? 0),
      recentAnalysisCount: analysisCount,
      savedListingCount: savedCount,
      persona,
    };
  } catch (err) {
    await logError(err, {
      path: "/api/chat:buildUserContext",
      level: "WARNING",
    });
    return undefined;
  }
}

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`chat:ip:${ip}`, 25, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let userMessage: string;
  let history: Array<{ role: "user" | "assistant"; content: string }> = [];
  let transcript: string | undefined;

  try {
    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      const audio = fd.get("audio");
      const historyRaw = fd.get("history");
      if (!audio || typeof audio === "string") {
        return NextResponse.json({ success: false, error: "audio_missing" }, { status: 400 });
      }
      const file = audio as File;
      if (file.size === 0 || file.size > MAX_AUDIO_BYTES) {
        return NextResponse.json({ success: false, error: "audio_size" }, { status: 400 });
      }
      const mime = file.type.split(";")[0].trim().toLowerCase();
      if (!AUDIO_MIMES.has(mime)) {
        return NextResponse.json({ success: false, error: "invalid_audio_mime" }, { status: 400 });
      }
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      transcript = await transcribeAudio(base64, mime);
      if (!transcript || transcript.length < 2) {
        return NextResponse.json({ success: false, error: "empty_transcript" }, { status: 400 });
      }
      userMessage = transcript.slice(0, 1000);
      if (typeof historyRaw === "string") {
        try {
          const parsed = JSON.parse(historyRaw);
          const h = z.array(chatMessageSchema).max(20).safeParse(parsed);
          if (h.success) history = h.data;
        } catch {
          // ignore malformed history
        }
      }
    } else {
      const raw = await req.json();
      const parsed = textBodySchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
      }
      userMessage = parsed.data.message;
      history = parsed.data.history ?? [];
    }

    const userContext = await buildUserContext();
    const { reply, durationMs } = await generateReply(
      history,
      userMessage,
      userContext,
    );
    return NextResponse.json({
      success: true,
      reply,
      transcript: transcript ?? null,
      meta: { durationMs },
    });
  } catch (err) {
    await logError(err, { path: "/api/chat" });
    return NextResponse.json(
      { success: false, error: "chat_failed" },
      { status: 500 },
    );
  }
}
