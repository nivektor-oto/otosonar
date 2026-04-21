import { NextResponse } from "next/server";
import { z } from "zod";
import { chatMessageSchema, generateReply, transcribeAudio } from "@/lib/chatbot";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

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

    const { reply, durationMs } = await generateReply(history, userMessage);
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
