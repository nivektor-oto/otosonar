"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const photoStr = String(fd.get("photos") ?? "");
    const photos = photoStr
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//.test(s))
      .slice(0, 12);

    const body = {
      brand: String(fd.get("brand") ?? ""),
      model: String(fd.get("model") ?? ""),
      year: Number(fd.get("year")),
      km: Number(fd.get("km")),
      city: String(fd.get("city") ?? ""),
      askingPrice: Number(fd.get("askingPrice")),
      description: String(fd.get("description") ?? "") || undefined,
      photos: photos.length ? photos : undefined,
    };

    const r = await fetch("/api/marketplace/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    setLoading(false);
    if (!r.ok || !data.success) {
      toast.error("İlan kaydedilemedi.");
      return;
    }
    toast.success("İlan yayınlandı.");
    router.push(`/pazaryeri/${data.listingId}`);
  }

  const input =
    "w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs text-neutral-400">Marka</span>
          <input name="brand" required maxLength={40} className={input} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-neutral-400">Model</span>
          <input name="model" required maxLength={60} className={input} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-neutral-400">Yıl</span>
          <input name="year" type="number" min={1980} max={new Date().getFullYear() + 1} required className={input} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-neutral-400">KM</span>
          <input name="km" type="number" min={0} required className={input} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-neutral-400">Şehir</span>
          <input name="city" required maxLength={40} className={input} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-neutral-400">Fiyat (TL)</span>
          <input name="askingPrice" type="number" min={10_000} required className={input} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Açıklama</span>
        <textarea name="description" rows={4} maxLength={2000} className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">
          Fotoğraf URL'leri (virgül veya satır ayrı, max 12 adet)
        </span>
        <textarea
          name="photos"
          rows={3}
          placeholder="https://.../foto1.jpg\nhttps://.../foto2.jpg"
          className={input}
        />
        <p className="mt-1 text-[10px] text-neutral-500">
          Şu an sadece URL kabul ediyoruz. Dosya yükleme özelliği lansman sonrası.
        </p>
      </label>
      <button
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Yayınlanıyor…" : "İlan yayınla"}
      </button>
    </form>
  );
}
