"use client";

/**
 * AIAssistant — sayfa sağ-altında sabit duran global yardımcı asistan.
 *
 * - FAB (Floating Action Button) tıklanınca koyu temalı chat paneli açılır.
 * - Misafir kullanıcı da kullanabilir (rate-limited backend).
 * - sessionStorage'da history sürer; refresh dayanır, tab kapanınca sıfırlanır.
 * - Mobil: tam genişlik panel; masaüstü: 360px sabit panel.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";

// Bu sayfalarda asistan render edilmez — kullanıcı form doldururken /
// admin işi yaparken canını sıkmasın.
const HIDDEN_PATH_PREFIXES = [
  "/giris",
  "/kayit",
  "/sifremi-unuttum",
  "/sifre-sifirla",
  "/eposta-dogrula",
  "/onboarding",
  "/admin",
  "/yonetici",
  "/odeme",
];

function shouldHide(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

const STORAGE_KEY = "otosonar_ai_assistant_history_v1";
const MAX_HISTORY = 20;

const GREETING: Message = {
  role: "assistant",
  content:
    "Merhaba! Araç hakkında bilmek istediğin her şeyi sor — fiyat, risk, satıcıya soracağın sorular, hatta site nasıl çalışır.",
};

const SUGGESTIONS = [
  "Bu aracı nasıl değerlendiririm?",
  "Satıcıya hangi soruları sormalıyım?",
  "OtoSonar nasıl çalışıyor?",
  "Ekspertizde nelere bakılır?",
];

export function AIAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // sessionStorage'dan geçmişi yükle (varsa)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // sessionStorage'a yaz
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_HISTORY)),
      );
    } catch {
      // ignore
    }
  }, [messages]);

  // Mesaj geldiğinde aşağı kaydır
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  // Açılınca input'a fokuslan
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;
    setError(null);
    setInput("");

    const userMsg: Message = { role: "user", content: clean };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setSending(true);

    try {
      const contextHint =
        typeof window !== "undefined" ? window.location.pathname : "";
      const payload = {
        messages: nextMessages
          .slice(-MAX_HISTORY)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
        contextHint: contextHint.slice(0, 500),
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;

      if (!res.ok || !data || !data.ok || !data.message) {
        const friendly =
          data?.error === "rate_limited" || data?.error === "guest_quota_exhausted"
            ? "Çok fazla mesaj gönderildi. Biraz sonra tekrar dene."
            : "Şu an cevap veremiyorum, az sonra dene.";
        setError(friendly);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.message }]);
    } catch {
      setError("Bağlantı sorunu — lütfen tekrar dene.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  // Auth/admin/odeme sayfalarında render etme — tüm hook'lardan sonra.
  if (shouldHide(pathname)) {
    return null;
  }

  return (
    <>
      {/* Floating action button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-nopdf
          aria-label="OtoSonar AI Asistan"
          style={{
            bottom: "calc(5rem + env(safe-area-inset-bottom))",
          }}
          className="fixed right-4 z-[60] h-14 w-14 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 hover:bg-emerald-400 hover:scale-105 transition flex items-center justify-center group"
        >
          <Bot className="w-6 h-6" strokeWidth={2.2} aria-hidden />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-[#0a0a0f]">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300 opacity-70" />
          </span>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-emerald-500/30 bg-[#0a0a0f] px-3 py-1.5 text-xs text-slate-100 opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
            OtoSonar AI Asistan
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          data-nopdf
          role="dialog"
          aria-label="OtoSonar AI Asistan"
          style={{
            bottom: "calc(5rem + env(safe-area-inset-bottom))",
          }}
          className="fixed inset-x-3 z-[60] sm:inset-auto sm:right-4 sm:w-[360px] flex flex-col rounded-2xl border border-emerald-500/20 bg-[#0a0a0f] text-slate-100 shadow-2xl shadow-black/50 overflow-hidden max-h-[540px] sm:h-[540px]"
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-emerald-600/20 to-transparent">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  OtoSonar Asistanı
                </div>
                <div className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Çevrimiçi
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" strokeWidth={2.5} aria-hidden />
            </button>
          </header>

          {/* Mesaj listesi */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0a0a0f]"
          >
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
            {sending && <TypingIndicator />}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
            {messages.length === 1 && !sending && (
              <div className="pt-2">
                <div className="text-[11px] text-slate-500 mb-2">
                  Hızlı sorular
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void sendMessage(s)}
                      disabled={sending}
                      className="text-[11px] px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-3 bg-[#0a0a0f] flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajını yaz..."
              rows={1}
              disabled={sending}
              maxLength={2000}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 px-3 py-2.5 resize-none max-h-24 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Gönder"
              className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <Send className="w-4 h-4" aria-hidden strokeWidth={2.5} />
              )}
            </button>
          </form>
          <div className="px-3 pb-2 text-[10px] text-slate-500 text-center bg-[#0a0a0f]">
            OtoSonar AI · tahminler bilgilendirme amaçlıdır, ekspertiz yerine geçmez.
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "rounded-br-sm bg-emerald-500 text-white"
            : "rounded-bl-sm bg-white/5 border border-white/10 text-slate-100"
        }`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 px-3 py-2 inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:240ms]" />
      </div>
    </div>
  );
}

/** Markdown-lite render: bullet (- veya •) ve **bold**. */
function renderContent(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    const isBullet = /^[-*•]\s+/.test(trimmed);
    const inner = isBullet ? trimmed.replace(/^[-*•]\s+/, "") : line;
    return (
      <div
        key={i}
        className={isBullet ? "flex gap-2 items-start" : undefined}
      >
        {isBullet && (
          <span className="text-emerald-400 mt-0.5 shrink-0" aria-hidden>
            •
          </span>
        )}
        <span className={isBullet ? "flex-1" : undefined}>
          {renderBold(inner)}
        </span>
      </div>
    );
  });
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
