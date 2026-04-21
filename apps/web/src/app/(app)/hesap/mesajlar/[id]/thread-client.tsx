"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

type Msg = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const TIME_FMT = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" });
const DATE_FMT = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const today = startOfDay(new Date());
  const diff = Math.round((startOfDay(d) - today) / 86_400_000);
  if (diff === 0) return "Bugün";
  if (diff === -1) return "Dün";
  return DATE_FMT.format(d);
}

export function ThreadClient({
  conversationId,
  meId,
  counterpartyName,
  listing,
  initialMessages,
}: {
  conversationId: string;
  meId: string;
  counterpartyName: string;
  listing: { id: string; title: string; askingPrice: number };
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await fetch(`/api/conversations/${conversationId}`, { cache: "no-store" });
        const data = await r.json();
        if (cancelled || !data?.success) return;
        const fresh: Msg[] = data.messages ?? [];
        setMessages((prev) => {
          if (fresh.length === prev.length && fresh[fresh.length - 1]?.id === prev[prev.length - 1]?.id) {
            return prev;
          }
          return fresh;
        });
      } catch {
        // ignore
      }
    }
    const iv = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [conversationId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        if (data?.error === "rate_limited") toast.error("Çok hızlı mesaj gönderiyorsun. Biraz bekle.");
        else toast.error("Mesaj gönderilemedi.");
        setSending(false);
        return;
      }
      setMessages((prev) => [...prev, data.message as Msg]);
      setDraft("");
      setTimeout(() => scrollToBottom(true), 10);
    } catch {
      toast.error("Ağ hatası.");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const groups: { dateLabel: string; items: Msg[] }[] = [];
  for (const m of messages) {
    const label = dateLabel(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.dateLabel === label) last.items.push(m);
    else groups.push({ dateLabel: label, items: [m] });
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#0a0a0f] text-neutral-100">
      <header className="border-b border-neutral-800 bg-[#12121a]/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <Link
              href={`/pazaryeri/${listing.id}`}
              className="truncate text-xs text-emerald-400 hover:underline"
            >
              ← İlan: {listing.title} · {TL.format(listing.askingPrice)}
            </Link>
            <div className="truncate text-sm font-semibold">{counterpartyName}</div>
          </div>
          <Link
            href="/hesap/mesajlar"
            className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-emerald-500"
          >
            Tüm mesajlar
          </Link>
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {groups.length === 0 && (
            <div className="mt-16 text-center text-sm text-neutral-500">Konuşma başlasın.</div>
          )}
          {groups.map((g, gi) => (
            <div key={gi} className="space-y-2">
              <div className="flex justify-center">
                <span className="rounded-full bg-neutral-900 px-3 py-0.5 text-[11px] text-neutral-500">
                  {g.dateLabel}
                </span>
              </div>
              {g.items.map((m) => {
                const mine = m.senderId === meId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-emerald-500 text-black"
                          : "border border-neutral-800 bg-[#12121a] text-neutral-100"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.body}</div>
                      <div className={`mt-1 text-right text-[10px] ${mine ? "text-emerald-900/70" : "text-neutral-500"}`}>
                        {TIME_FMT.format(new Date(m.createdAt))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-neutral-800 bg-[#12121a]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Mesajını yaz…"
            rows={1}
            maxLength={2000}
            className="max-h-40 flex-1 resize-none rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={sending || draft.trim().length === 0}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Gönder
          </button>
        </div>
      </div>
    </main>
  );
}
