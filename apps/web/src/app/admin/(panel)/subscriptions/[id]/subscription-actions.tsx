"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XCircle, RotateCcw } from "lucide-react";
import {
  cancelSubscriptionAction,
  refundSubscriptionAction,
} from "./actions";

interface Props {
  subscriptionId: string;
  status: string;
  canRefund: boolean;
}

export function SubscriptionActions({ subscriptionId, status, canRefund }: Props) {
  const [pending, startTransition] = useTransition();
  const [refundMode, setRefundMode] = useState(false);
  const [note, setNote] = useState("");
  const router = useRouter();

  function handleCancel() {
    if (!window.confirm("Aboneliği iptal etmek istiyor musun?")) return;
    startTransition(async () => {
      const res = await cancelSubscriptionAction(subscriptionId);
      if (res.ok) {
        toast.success("Abonelik iptal edildi.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function handleRefund() {
    if (!window.confirm("İADE uygulanacak ve abonelik iptal olacak. Emin misin?")) return;
    startTransition(async () => {
      const res = await refundSubscriptionAction(subscriptionId, note.trim() || undefined);
      if (res.ok) {
        toast.success("İade işlendi, abonelik iptal.");
        setNote("");
        setRefundMode(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  const isCanceled = status === "CANCELED" || status === "EXPIRED";

  return (
    <div className="space-y-3">
      {!refundMode ? (
        <div className="flex flex-wrap gap-2">
          {!isCanceled ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm"
            >
              <XCircle className="h-4 w-4" />
              İptal et
            </button>
          ) : null}
          {canRefund ? (
            <button
              type="button"
              onClick={() => setRefundMode(true)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              İade ver
            </button>
          ) : null}
          {isCanceled && !canRefund ? (
            <span className="text-sm text-neutral-500">İşlem yapılabilir bir durum yok.</span>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            İade notu (isteğe bağlı)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Örn: Kullanıcı 30 gün içinde iade talep etti."
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefund}
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-black font-semibold text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              İadeyi onayla
            </button>
            <button
              type="button"
              onClick={() => {
                setRefundMode(false);
                setNote("");
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
