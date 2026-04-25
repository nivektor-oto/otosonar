"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

export function AiReplySuggestions({
  conversationId,
  onPick,
}: {
  conversationId: string;
  onPick: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchSuggestions() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/reply-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data?.error === "rate_limited") setError("Çok hızlı deniyorsun. Az bekle.");
        else if (data?.error === "empty_conversation") setError("Henüz mesaj yok.");
        else if (data?.error === "ai_unavailable") setError("AI servisi şu an meşgul.");
        else setError("Öneri alınamadı.");
        return;
      }
      setSuggestions(data.suggestions as string[]);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    setSuggestions(null);
    setError(null);
  }

  function handlePick(text: string) {
    onPick(text);
    dismiss();
  }

  const labels = ["Resmi", "Sıcak", "Soru"];

  return (
    <div className="space-y-2">
      {!suggestions && !error && (
        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden strokeWidth={2.5} />
              Hazırlanıyor…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" aria-hidden strokeWidth={2.5} />
              AI önerileri
            </>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] text-red-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Kapat"
            className="text-red-300 hover:text-red-200"
          >
            <X className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
          </button>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <Sparkles className="h-3 w-3" aria-hidden strokeWidth={2.5} />
              OtoSonar AI önerileri
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Kapat"
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePick(s)}
                className="group flex max-w-full items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-left text-xs text-emerald-50 hover:border-emerald-400 hover:bg-emerald-500/15"
              >
                <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200 shrink-0">
                  {labels[i] ?? `#${i + 1}`}
                </span>
                <span className="flex-1 break-words">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
