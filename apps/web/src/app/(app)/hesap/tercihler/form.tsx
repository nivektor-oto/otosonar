"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Initial {
  budgetMin: number | null;
  budgetMax: number | null;
  brands: string[];
  cities: string[];
}

export function PrefsForm({ initial }: { initial: Initial | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      budgetMin: Number(fd.get("budgetMin")) || null,
      budgetMax: Number(fd.get("budgetMax")) || null,
      brands: String(fd.get("brands") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20),
      cities: String(fd.get("cities") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20),
    };
    const r = await fetch("/api/buyer-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!r.ok) {
      toast.error("Kayıt başarısız.");
      return;
    }
    toast.success("Tercihler kaydedildi.");
    router.push("/hesap");
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-neutral-400">Bütçe min (TL)</span>
          <input
            name="budgetMin"
            type="number"
            min={0}
            defaultValue={initial?.budgetMin ?? ""}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-neutral-400">Bütçe max (TL)</span>
          <input
            name="budgetMax"
            type="number"
            min={0}
            defaultValue={initial?.budgetMax ?? ""}
            className={input}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">İlgilendiğin markalar (virgülle ayır)</span>
        <input
          name="brands"
          defaultValue={initial?.brands.join(", ") ?? ""}
          placeholder="Volkswagen, BMW, Toyota"
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Şehirler (virgülle ayır)</span>
        <input
          name="cities"
          defaultValue={initial?.cities.join(", ") ?? ""}
          placeholder="İstanbul, Ankara"
          className={input}
        />
      </label>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
