"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, X } from "lucide-react";
import { toast } from "sonner";

export function MessageSellerButton({
  listingId,
  listingTitle,
}: {
  listingId: string;
  listingTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (trimmed.length === 0 || loading) return;
    setLoading(true);
    try {
      const r = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, initialMessage: trimmed }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        if (data?.error === "cannot_message_self") toast.error("Kendi ilanına mesaj gönderemezsin.");
        else if (data?.error === "rate_limited") toast.error("Çok fazla yeni konuşma. Biraz bekle.");
        else if (data?.error === "not_authenticated") {
          router.push(`/giris?next=/pazaryeri/${listingId}`);
          return;
        } else toast.error("Mesaj gönderilemedi.");
        setLoading(false);
        return;
      }
      toast.success("Mesaj iletildi.");
      router.push(`/hesap/mesajlar/${data.conversation.id}`);
    } catch {
      toast.error("Ağ hatası.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400"
      >
        <MessageSquare className="h-4 w-4" />
        Satıcıyla iletişime geç
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#12121a] p-6 shadow-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Satıcıya mesaj</h3>
                <p className="mt-1 text-xs text-neutral-500">{listingTitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Merhaba, ilanınızla ilgilendim. Takas mümkün mü? Aracı görmek istiyorum…"
                rows={5}
                maxLength={2000}
                required
                autoFocus
                className="w-full resize-none rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-500">{body.length}/2000</span>
                <button
                  type="submit"
                  disabled={loading || body.trim().length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Gönderiliyor…" : "Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
