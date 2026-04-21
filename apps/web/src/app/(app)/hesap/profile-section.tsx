"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface DealerSummary {
  companyName: string;
  cityId: string;
  taxNo: string | null;
  verificationStatus: string;
}

interface PrefsSummary {
  budgetMin: number | null;
  budgetMax: number | null;
  brands: string[];
  cities: string[];
}

interface Props {
  fullName: string;
  phone: string | null;
  marketingOptIn: boolean;
  userType: "BUYER" | "DEALER" | "BROKER" | "ADMIN";
  hasDealer: boolean;
  dealerSummary: DealerSummary | null;
  prefsSummary: PrefsSummary | null;
}

export function ProfileSection({
  fullName,
  phone,
  marketingOptIn,
  userType,
  hasDealer,
  dealerSummary,
  prefsSummary,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: String(fd.get("fullName") ?? ""),
        phone: String(fd.get("phone") ?? "") || null,
        marketingOptIn: fd.get("marketingOptIn") === "on",
      }),
    });
    setLoading(false);
    if (!r.ok) {
      toast.error("Güncellenemedi.");
      return;
    }
    toast.success("Profil güncellendi.");
    setEditing(false);
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Profil bilgileri</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
            >
              Düzenle
            </button>
          )}
        </div>
        {editing ? (
          <form onSubmit={onSave} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-neutral-400">Ad soyad</span>
              <input name="fullName" defaultValue={fullName} required minLength={2} maxLength={80} className={input} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-neutral-400">Telefon (opsiyonel)</span>
              <input
                name="phone"
                defaultValue={phone ?? ""}
                type="tel"
                maxLength={20}
                placeholder="05XXXXXXXXX"
                className={input}
              />
            </label>
            <label className="flex items-start gap-2 text-xs text-neutral-400">
              <input type="checkbox" name="marketingOptIn" defaultChecked={marketingOptIn} className="mt-0.5" />
              <span>Ticari ileti gönderilmesine onay veriyorum.</span>
            </label>
            <div className="flex gap-2">
              <button
                disabled={loading}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-xs"
              >
                İptal
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Ad soyad" value={fullName} />
            <Row label="Telefon" value={phone ?? "—"} />
            <Row
              label="Pazarlama izni"
              value={marketingOptIn ? "Verildi" : "Verilmedi"}
            />
          </dl>
        )}
      </div>

      {userType === "DEALER" && (
        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Galerici bilgileri</h2>
            <Link
              href="/hesap/galerici"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
            >
              {hasDealer ? "Düzenle" : "Tamamla"}
            </Link>
          </div>
          {dealerSummary ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Firma" value={dealerSummary.companyName} />
              <Row label="Şehir" value={dealerSummary.cityId} />
              <Row label="Vergi No" value={dealerSummary.taxNo ?? "—"} />
              <Row label="Doğrulama" value={dealerSummary.verificationStatus} />
            </dl>
          ) : (
            <p className="text-xs text-amber-400">
              Galerici bilgileri eksik. Pazaryerinde teklif verebilmek için doğrulama gerekir.
            </p>
          )}
        </div>
      )}

      {userType === "BUYER" && (
        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Araç tercihlerim</h2>
            <Link
              href="/hesap/tercihler"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
            >
              {prefsSummary ? "Düzenle" : "Ekle"}
            </Link>
          </div>
          {prefsSummary ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row
                label="Bütçe"
                value={
                  prefsSummary.budgetMin || prefsSummary.budgetMax
                    ? `${(prefsSummary.budgetMin ?? 0).toLocaleString("tr-TR")} – ${(prefsSummary.budgetMax ?? 0).toLocaleString("tr-TR")} TL`
                    : "—"
                }
              />
              <Row label="Markalar" value={prefsSummary.brands.join(", ") || "—"} />
              <Row label="Şehirler" value={prefsSummary.cities.join(", ") || "—"} />
            </dl>
          ) : (
            <p className="text-xs text-neutral-500">
              Tercihlerini belirt, Pazar Fırsat bildirimlerini kişiselleştirelim.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-sm font-medium text-neutral-200">{value}</dd>
    </div>
  );
}
