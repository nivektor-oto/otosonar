"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, ShieldAlert } from "lucide-react";
import {
  approveListingAction,
  rejectListingAction,
  takedownListingAction,
} from "./actions";

interface Props {
  listingId: string;
  status: string;
}

export function ModerationPanel({ listingId, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"reject" | "takedown" | null>(null);
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      const res = await approveListingAction(listingId);
      if (res.ok) {
        toast.success("İlan ONAYLANDI. Yayına alındı.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function handleSubmitReason() {
    if (mode === null) return;
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      toast.error("Sebep en az 3 karakter olmalı.");
      return;
    }
    startTransition(async () => {
      const fn = mode === "reject" ? rejectListingAction : takedownListingAction;
      const res = await fn(listingId, trimmed);
      if (res.ok) {
        toast.success(
          mode === "reject" ? "İlan REDDEDİLDİ." : "İlan KALDIRILDI (takedown).",
        );
        setReason("");
        setMode(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  const isFinal = ["REJECTED", "TAKEDOWN", "SOLD", "EXPIRED"].includes(status);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-emerald-400" />
        Moderasyon eylemleri
      </h3>

      {mode === null ? (
        <div className="flex flex-wrap gap-2">
          {status === "DRAFT" ? (
            <button
              type="button"
              onClick={handleApprove}
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-sm"
            >
              <Check className="h-4 w-4" />
              Onayla (DRAFT → ACTIVE)
            </button>
          ) : null}

          {!isFinal ? (
            <>
              <button
                type="button"
                onClick={() => setMode("reject")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm"
              >
                <X className="h-4 w-4" />
                Reddet
              </button>
              <button
                type="button"
                onClick={() => setMode("takedown")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" />
                Takedown (spam / dolandırıcılık)
              </button>
            </>
          ) : (
            <span className="text-sm text-neutral-500">
              İlan {status} durumunda — ek eylem yok.
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {mode === "reject" ? "Red sebebi" : "Kaldırma sebebi (spam/fraud)"}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={
              mode === "reject"
                ? "Örn: Fiyat gerçekçi değil, fotoğraflar yetersiz."
                : "Örn: Çalıntı araç şüphesi, telefonda dolandırıcılık girişimi."
            }
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-emerald-500/60 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmitReason}
              disabled={pending}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 ${
                mode === "reject"
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-red-500 hover:bg-red-400 text-black"
              }`}
            >
              {mode === "reject" ? "Reddet" : "Takedown uygula"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setReason("");
              }}
              disabled={pending}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
