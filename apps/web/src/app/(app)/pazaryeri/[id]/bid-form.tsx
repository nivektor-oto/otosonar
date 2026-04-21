"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BidForm({ listingId, minAmount }: { listingId: string; minAmount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const amount = Number(fd.get("amount"));
    if (!amount || amount < minAmount) {
      toast.error(`En düşük teklif: ${minAmount.toLocaleString("tr-TR")} TL`);
      setLoading(false);
      return;
    }

    const r = await fetch(`/api/marketplace/listings/${listingId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, note: String(fd.get("note") ?? "") || undefined }),
    });
    const data = await r.json();
    setLoading(false);
    if (!r.ok || !data.success) {
      toast.error("Teklif başarısız.");
      return;
    }
    toast.success("Teklif verildi.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <h2 className="text-sm font-semibold">Teklif ver</h2>
      <label className="block space-y-1">
        <span className="text-xs text-neutral-500">Tutar (TL)</span>
        <input
          name="amount"
          type="number"
          min={minAmount}
          required
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-neutral-500">Not (ops.)</span>
        <textarea
          name="note"
          rows={2}
          maxLength={500}
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm"
        />
      </label>
      <button
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Gönderiliyor…" : "Teklif gönder"}
      </button>
    </form>
  );
}
