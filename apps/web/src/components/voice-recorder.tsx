"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export type VoiceExtracted = {
  brand?: string;
  model?: string;
  variant?: string;
  year?: number;
  km?: number;
  fuelType?: string;
  transmission?: string;
  city?: string;
  askingPrice?: number;
  damageStatus?: string;
};

type Props = {
  onResult: (extracted: VoiceExtracted, transcript: string) => void;
  disabled?: boolean;
  className?: string;
};

type State = "idle" | "requesting" | "recording" | "processing" | "error";

const MAX_DURATION_MS = 60_000;

export function VoiceRecorder({ onResult, disabled, className }: Props) {
  const [state, setState] = useState<State>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  useEffect(() => {
    return () => cleanup();
  }, []);

  function cleanup() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  async function start() {
    if (disabled || state === "recording" || state === "processing") return;
    setErrorMsg(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setErrorMsg("Tarayıcın mikrofonu desteklemiyor.");
      return;
    }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime = pickSupportedMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        upload(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setState("recording");
      setElapsed(0);
      tickRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 200);
      autoStopRef.current = window.setTimeout(() => stop(), MAX_DURATION_MS);
    } catch (e) {
      setState("error");
      const msg = e instanceof Error ? e.message : "Mikrofon erişimi reddedildi";
      setErrorMsg(msg.includes("Permission") ? "Mikrofon izni gerekli" : msg.slice(0, 100));
    }
  }

  function stop() {
    if (state !== "recording") return;
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    try {
      recorderRef.current?.stop();
    } catch {
      // already stopped
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState("processing");
  }

  async function upload(blob: Blob) {
    if (blob.size < 2_000) {
      setState("idle");
      toast.error("Çok kısa kayıt — biraz daha uzun anlat.");
      return;
    }
    try {
      const fd = new FormData();
      const ext = (blob.type.split("/")[1] || "webm").split(";")[0];
      fd.append("audio", blob, `voice.${ext}`);
      const res = await fetch("/api/voice-extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const code = data?.error;
        const msg =
          code === "rate_limited"
            ? "Limit aşıldı, 10 dk sonra tekrar dene."
            : code === "audio_too_large"
              ? "Kayıt çok uzun / büyük."
              : code === "invalid_audio_mime"
                ? "Tarayıcın bu ses formatını desteklemiyor."
                : "Ses işlenemedi — internet veya servis problemi olabilir.";
        toast.error(msg);
        setState("error");
        setErrorMsg(msg);
        return;
      }
      const filled = Object.values(data.extracted ?? {}).filter((v) => v != null && v !== "").length;
      toast.success(
        filled > 0
          ? `${filled} alan otomatik dolduruldu — boş kalanları tamamla.`
          : "Kayıt dinlendi ama yapısal alan çıkarılamadı. Açıklama alanına transkript eklendi.",
      );
      onResult(data.extracted as VoiceExtracted, data.transcript ?? "");
      setState("idle");
      setElapsed(0);
    } catch (e) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Ağ hatası");
      toast.error("Yükleme başarısız. İnternet bağlantını kontrol et.");
    }
  }

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition px-4 py-2.5";

  if (state === "recording") {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={stop}
          className={`${baseBtn} bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30`}
          aria-label="Kaydı durdur"
        >
          <Square className="w-4 h-4 fill-red-400" aria-hidden strokeWidth={2.5} />
          <span>Durdur · {String(elapsed).padStart(2, "0")}s</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </button>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Marka, model, yıl, km ve fiyatı söyle — max 60 sn.
        </p>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          className={`${baseBtn} bg-accent/10 border border-accent/30 text-accent opacity-80 cursor-wait`}
        >
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          <span>AI dinliyor…</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={start}
        disabled={disabled || state === "requesting"}
        className={`${baseBtn} bg-gradient-to-r from-accent/15 to-accent2/10 border border-accent/30 text-accent hover:from-accent/25 hover:to-accent2/20 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Araçı sesli anlat"
      >
        <Mic className="w-4 h-4" aria-hidden strokeWidth={2.5} />
        <span>{state === "requesting" ? "İzin veriliyor…" : "Aracı sesli anlat"}</span>
      </button>
      <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
        Örnek: &ldquo;2018 BMW 520i, 165 bin km, otomatik dizel, 1 milyon 350 bin TL, Konya, boyasız değişensiz.&rdquo; AI dinleyip formu dolduracak.
      </p>
      {errorMsg && (
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-red-300">
          <AlertTriangle className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          {errorMsg}
        </p>
      )}
    </div>
  );
}

function pickSupportedMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return null;
}
