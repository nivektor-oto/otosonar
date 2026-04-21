"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Initial {
  companyName: string;
  cityId: string;
  address: string | null;
  taxNo: string | null;
  mersisNo: string | null;
  monthlyVolume: "SMALL" | "MEDIUM" | "LARGE" | null;
  verificationStatus: string;
}

const TR_CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Gaziantep", "Adana",
  "Mersin", "Kocaeli", "Şanlıurfa", "Kayseri", "Samsun", "Eskişehir", "Diyarbakır",
  "Sakarya", "Denizli", "Balıkesir", "Manisa", "Hatay", "Malatya", "Erzurum", "Aydın",
  "Trabzon", "Ordu", "Muğla", "Tekirdağ", "Elazığ", "Sivas", "Kahramanmaraş",
];

export function DealerForm({ initial }: { initial: Initial | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      companyName: String(fd.get("companyName") ?? ""),
      cityId: String(fd.get("cityId") ?? ""),
      address: String(fd.get("address") ?? "") || undefined,
      taxNo: String(fd.get("taxNo") ?? "") || undefined,
      mersisNo: String(fd.get("mersisNo") ?? "") || undefined,
      monthlyVolume: (String(fd.get("monthlyVolume") ?? "") || undefined) as
        | "SMALL"
        | "MEDIUM"
        | "LARGE"
        | undefined,
    };

    const r = await fetch("/api/dealer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    setLoading(false);
    if (!r.ok || !data.success) {
      toast.error("Kayıt başarısız.");
      return;
    }
    toast.success("Bilgiler kaydedildi. Doğrulama için ekibimiz inceleyecek.");
    router.push("/hesap");
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6"
    >
      {initial && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            initial.verificationStatus === "VERIFIED"
              ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-300"
              : initial.verificationStatus === "REJECTED"
                ? "border-red-700/40 bg-red-900/20 text-red-300"
                : "border-amber-700/40 bg-amber-900/20 text-amber-300"
          }`}
        >
          Doğrulama: <b>{initial.verificationStatus}</b>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Firma adı *</span>
        <input
          name="companyName"
          required
          minLength={2}
          maxLength={120}
          defaultValue={initial?.companyName ?? ""}
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Şehir *</span>
        <select name="cityId" required defaultValue={initial?.cityId ?? ""} className={input}>
          <option value="">Seç</option>
          {TR_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Adres</span>
        <input
          name="address"
          maxLength={300}
          defaultValue={initial?.address ?? ""}
          className={input}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-neutral-400">Vergi No (10 haneli)</span>
          <input
            name="taxNo"
            maxLength={11}
            minLength={10}
            pattern="[0-9]{10,11}"
            defaultValue={initial?.taxNo ?? ""}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-neutral-400">MERSİS No</span>
          <input
            name="mersisNo"
            maxLength={20}
            defaultValue={initial?.mersisNo ?? ""}
            className={input}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Aylık satış hacmi</span>
        <select name="monthlyVolume" defaultValue={initial?.monthlyVolume ?? ""} className={input}>
          <option value="">Seçilmedi</option>
          <option value="SMALL">Küçük (&lt;5 araç/ay)</option>
          <option value="MEDIUM">Orta (5-20 araç/ay)</option>
          <option value="LARGE">Büyük (20+ araç/ay)</option>
        </select>
      </label>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
      <p className="text-xs text-neutral-500">
        Doğrulama için KEP adresi veya vergi levhası fotoğrafı lansmanda istenecek.
      </p>
    </form>
  );
}
