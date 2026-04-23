"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  Square,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string; pending?: boolean };

const STORAGE_KEY = "otosonar_chat_history_v1";
const MAX_HISTORY = 20;
const MAX_DURATION_MS = 45_000;
const SUGGESTIONS = [
  "Nasıl analiz yaparım?",
  "Galerici nasıl olurum?",
  "Paketler nelerdir?",
  "Arıza teşhisi nerede?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Merhaba! Ben OtoSonar yardımcı asistanıyım. Araç analizi, galerici paneli, paketler veya başka bir konu hakkında sana yol gösterebilirim. Ne yapmak istersin?",
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    return () => cleanupRecorder();
  }, []);

  function cleanupRecorder() {
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

  async function sendText(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;
    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: clean }];
    setMessages([...nextHistory, { role: "assistant", content: "", pending: true }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: nextHistory.slice(-MAX_HISTORY).filter((m) => !m.pending),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg =
          data?.error === "rate_limited"
            ? "Çok fazla mesaj gönderdin, biraz sonra dener misin?"
            : "Bir sorun oldu. Biraz sonra tekrar deneyelim.";
        setMessages([...nextHistory, { role: "assistant", content: msg }]);
        return;
      }
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...nextHistory,
        { role: "assistant", content: "İnternet bağlantısında sorun var gibi. Biraz sonra tekrar dene." },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
    if (recording || sending) return;
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
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
        uploadVoice(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      const startedAt = Date.now();
      setRecording(true);
      setRecElapsed(0);
      tickRef.current = window.setInterval(() => {
        setRecElapsed(Math.floor((Date.now() - startedAt) / 1000));
      }, 250);
      autoStopRef.current = window.setTimeout(() => stopRecording(), MAX_DURATION_MS);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Mikrofonuna erişemedim. Tarayıcı izinlerini kontrol edebilir misin?",
        },
      ]);
    }
  }

  function stopRecording() {
    if (!recording) return;
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
    setRecording(false);
    setRecElapsed(0);
  }

  async function uploadVoice(blob: Blob) {
    if (blob.size < 2_000) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kayıt çok kısa oldu. Lütfen biraz daha uzun konuşur musun?" },
      ]);
      return;
    }
    setSending(true);
    const placeholderHistory = [...messages, { role: "user" as const, content: "🎤 (sesli soru)" }];
    setMessages([
      ...placeholderHistory,
      { role: "assistant", content: "", pending: true },
    ]);
    try {
      const fd = new FormData();
      fd.append("audio", blob, `chat-voice.${(blob.type.split("/")[1] || "webm").split(";")[0]}`);
      fd.append(
        "history",
        JSON.stringify(messages.slice(-MAX_HISTORY).filter((m) => !m.pending)),
      );
      const res = await fetch("/api/chat", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg =
          data?.error === "rate_limited"
            ? "Çok fazla mesaj. Biraz sonra tekrar dener misin?"
            : "Ses işlenemedi. Kısaca yazar mısın?";
        const finalHistory = [
          ...messages,
          { role: "user" as const, content: "🎤 (sesli soru)" },
          { role: "assistant" as const, content: msg },
        ];
        setMessages(finalHistory);
        return;
      }
      const finalHistory = [
        ...messages,
        { role: "user" as const, content: data.transcript ? `🎤 ${data.transcript}` : "🎤 (sesli soru)" },
        { role: "assistant" as const, content: data.reply },
      ];
      setMessages(finalHistory);
    } catch {
      const finalHistory = [
        ...messages,
        { role: "user" as const, content: "🎤 (sesli soru)" },
        { role: "assistant" as const, content: "Ağ hatası oldu, tekrar dener misin?" },
      ];
      setMessages(finalHistory);
    } finally {
      setSending(false);
    }
  }

  function clearHistory() {
    setMessages([GREETING]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-nopdf
          aria-label="OtoSonar yardımcı asistanı aç"
          className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/40 transition flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.2} aria-hidden />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
          </span>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg">
            Yardıma ihtiyacın var mı?
          </span>
        </button>
      )}

      {open && (
        <div
          data-nopdf
          className="fixed inset-x-3 bottom-3 z-40 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[380px] sm:h-[560px] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden max-h-[82vh]"
          role="dialog"
          aria-label="OtoSonar yardımcı asistanı"
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-amber-50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">OtoSonar Asistan</div>
                <div className="text-[11px] text-slate-500">Yardım + yol tarifi</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearHistory}
                className="text-[11px] text-slate-500 hover:text-slate-900 px-2 py-1 rounded"
                aria-label="Sohbeti temizle"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1.5 rounded"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50"
          >
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {messages.length <= 2 && (
              <div className="pt-2">
                <div className="text-[11px] text-slate-500 mb-2">Hızlı soru:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendText(s)}
                      disabled={sending}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:text-slate-900 transition disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 p-3 bg-white">
            {recording ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-300 text-red-700 text-sm font-semibold px-4 py-2.5 hover:bg-red-100"
                  aria-label="Kaydı durdur"
                >
                  <Square className="w-4 h-4 fill-red-400" aria-hidden strokeWidth={2.5} />
                  <span>Durdur · {String(recElapsed).padStart(2, "0")}s</span>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendText(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendText(input);
                    }
                  }}
                  placeholder="Sor bana — örn: paketler nedir?"
                  rows={1}
                  disabled={sending}
                  className="flex-1 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 px-3 py-2.5 resize-none max-h-24 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                />
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={sending}
                  className="shrink-0 h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-slate-900 flex items-center justify-center disabled:opacity-50"
                  aria-label="Sesli sor"
                >
                  <Mic className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                </button>
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="shrink-0 h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Gönder"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                  )}
                </button>
              </form>
            )}
            <p className="mt-2 text-[10px] text-slate-500 text-center">
              Otomatik yanıtlar yardımcıdır. Kritik işlemler için destek@otosonar.com
            </p>
          </footer>
        </div>
      )}
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  if (msg.pending) {
    return (
      <div className="flex justify-start">
        <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-3 py-2 text-sm text-slate-500 inline-flex items-center gap-2">
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "rounded-br-sm bg-amber-500 text-white"
            : "rounded-bl-sm bg-white border border-slate-200 text-slate-800"
        }`}
      >
        {renderContent(msg.content)}
      </div>
    </div>
  );
}

function renderContent(text: string) {
  const parts = text.split(/(\/[a-z0-9\-/[\]]+)/gi);
  return parts.map((p, i) => {
    if (/^\/[a-z0-9\-/[\]]+$/i.test(p) && p.length > 1 && !p.endsWith("/")) {
      return (
        <Link
          key={i}
          href={p}
          className="text-amber-700 underline underline-offset-2 hover:text-amber-800"
        >
          {p}
        </Link>
      );
    }
    return <span key={i}>{p}</span>;
  });
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
