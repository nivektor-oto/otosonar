"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AcceptBidButton({ bidId }: { bidId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm("Bu teklifi kabul edip ilanı satıldı olarak işaretlemek istediğinden emin misin?")) return;
    setLoading(true);
    const r = await fetch(`/api/marketplace/bids/${bidId}/accept`, { method: "POST" });
    setLoading(false);
    if (!r.ok) {
      toast.error("Kabul başarısız.");
      return;
    }
    toast.success("Teklif kabul edildi. Alıcıya bildirim gitti.");
    router.refresh();
  }

  return (
    <button
      disabled={loading}
      onClick={onClick}
      className="ml-3 shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
    >
      {loading ? "…" : "Kabul et"}
    </button>
  );
}
