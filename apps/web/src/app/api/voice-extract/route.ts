import { NextResponse } from "next/server";
import { extractFromVoice } from "@/lib/voice-extract";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/mp4",
  "audio/flac",
]);

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`voice-extract:ip:${ip}`, 20, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ success: false, error: "expected_multipart" }, { status: 400 });
  }

  let file: File | null = null;
  try {
    const fd = await req.formData();
    const f = fd.get("audio");
    if (!f || typeof f === "string") {
      return NextResponse.json({ success: false, error: "audio_missing" }, { status: 400 });
    }
    file = f as File;
  } catch {
    return NextResponse.json({ success: false, error: "invalid_form" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ success: false, error: "audio_empty" }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ success: false, error: "audio_too_large" }, { status: 400 });
  }
  const mime = normalizeMime(file.type);
  if (!ALLOWED_MIMES.has(mime)) {
    return NextResponse.json(
      { success: false, error: "invalid_audio_mime", mime: file.type },
      { status: 400 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");
    const { result, provider, durationMs } = await extractFromVoice(base64, mime);
    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      extracted: result.extracted,
      meta: { provider, durationMs },
    });
  } catch (err) {
    await logError(err, { path: "/api/voice-extract" });
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { success: false, error: "extract_failed", detail: msg.slice(0, 150) },
      { status: 500 },
    );
  }
}

function normalizeMime(mime: string): string {
  const base = mime.split(";")[0].trim().toLowerCase();
  if (base === "audio/webm;codecs=opus") return "audio/webm";
  return base;
}
