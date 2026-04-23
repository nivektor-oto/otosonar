"use client";

import { useState, useTransition } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Reason = "DUPLICATE" | "FRAUD" | "KM" | "SCAM" | "PHOTO_MISMATCH" | "OTHER";

const REASON_LABELS: Record<Reason, string> = {
  DUPLICATE: "Bu ilan zaten var (mükerrer)",
  FRAUD: "Sahte ilan / dolandırıcılık",
  KM: "KM oynamış olabilir",
  SCAM: "Ödeme/kapora tuzağı",
  PHOTO_MISMATCH: "Fotoğraflar araçla uyumsuz",
  OTHER: "Diğer",
};

export function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("DUPLICATE");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, notes: notes.trim() || undefined }),
        });
        const data = await res.json();
        if (res.status === 429) {
          toast.error(data.message ?? "Günlük rapor sınırı aşıldı");
          return;
        }
        if (res.status === 401) {
          toast.error("Önce giriş yap");
          return;
        }
        if (!res.ok || !data.success) {
          toast.error("Rapor gönderilemedi");
          return;
        }
        if (data.already) {
          toast.info("Bu ilanı zaten raporlamıştın");
        } else {
          toast.success("Teşekkürler — moderasyon ekibi inceleyecek");
        }
        setOpen(false);
        setNotes("");
      } catch {
        toast.error("Ağ hatası");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-400 hover:border-red-500/40 hover:text-red-300 transition"
      >
        <Flag className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
        Bu ilanı raporla
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#12121a] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-400" aria-hidden strokeWidth={2.5} />
              <h3 className="text-sm font-bold">İlanı raporla</h3>
            </div>

            <div className="space-y-2">
              {(Object.keys(REASON_LABELS) as Reason[]).map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm text-neutral-200 cursor-pointer">
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  <span>{REASON_LABELS[r]}</span>
                </label>
              ))}
            </div>

            <label className="mt-4 block text-xs text-neutral-400">
              <span className="mb-1 block">Not (opsiyonel, max 1000 karakter)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
                rows={3}
                className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </label>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-700"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> : null}
                Raporu gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
