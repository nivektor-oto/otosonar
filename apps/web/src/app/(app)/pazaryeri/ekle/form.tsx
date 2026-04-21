"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type QuotaInfo =
  | { allowed: true; reason: "b2c_free" | "dealer_quota"; freeRemaining: number; limit: number; used: number }
  | { allowed: false; reason: "b2c_over" | "dealer_over"; priceTL: number; limit: number; used: number };

export function NewListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);

  useEffect(() => {
    fetch("/api/marketplace/quota")
      .then((r) => r.json())
      .then((d) => { if (d.success) setQuota(d.quota); })
      .catch(() => undefined);
  }, []);

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
    if (r.status === 402) {
      toast.error(`Bu ilan ${data.priceTL} TL ödeme gerektiriyor`, {
        description:
          data.reason === "dealer_over"
            ? `Aylık ${data.limit} ilan kotanı kullandın (${data.used}). Ek ilan için 500 TL sabit ücret.`
            : `2 ücretsiz ilan hakkını kullandın. Ek ilan için 500 TL sabit ücret.`,
      });
      router.push(`/odeme?type=listing_fee&amount=${data.priceTL}`);
      return;
    }
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
      {quota && <QuotaBanner quota={quota} />}
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
        {loading ? "Yayınlanıyor…" : quota && !quota.allowed ? "Öde ve yayınla — 500 TL" : "İlan yayınla"}
      </button>
    </form>
  );
}

function QuotaBanner({ quota }: { quota: QuotaInfo }) {
  if (quota.allowed && quota.reason === "b2c_free") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
        <div className="font-semibold mb-0.5">
          {quota.freeRemaining} ücretsiz ilan hakkın kaldı ({quota.used}/{quota.limit} kullanıldı)
        </div>
        <div className="text-xs text-emerald-400/80">
          İlk 2 ilan ücretsiz — 3. ilandan itibaren ilan başına 500 TL sabit ücret.
        </div>
      </div>
    );
  }
  if (quota.allowed && quota.reason === "dealer_quota") {
    return (
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 px-4 py-3 text-sm text-sky-200">
        <div className="font-semibold mb-0.5">
          Bu ay {quota.used}/{quota.limit} ilan kullanıldı — {quota.freeRemaining} hak kaldı
        </div>
        <div className="text-xs text-sky-300/80">
          Paketinin aylık ilan kotası içindesin. Ay sonunda sıfırlanır.
        </div>
      </div>
    );
  }
  // not allowed — narrow the discriminated union
  if (quota.allowed) return null;
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
      <div className="font-semibold mb-0.5">
        {quota.reason === "dealer_over"
          ? `Aylık ${quota.limit} ilan kotanı doldurdun (${quota.used})`
          : `${quota.limit} ücretsiz ilan hakkını kullandın`}
      </div>
      <div className="text-xs text-amber-300/80">
        Bu ilan için sabit <strong>{quota.priceTL} TL</strong> ücret uygulanır. Yayınla'ya basınca ödemeye yönlendirilirsin.
      </div>
    </div>
  );
}
