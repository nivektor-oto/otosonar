"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";

const BRANDS = [
  "Audi", "BMW", "Chevrolet", "Chery", "Citroen", "Cupra", "Dacia", "Fiat",
  "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Land Rover", "Lexus", "Mazda",
  "Mercedes", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche",
  "Renault", "Seat", "Skoda", "Subaru", "Suzuki", "Tesla", "Togg", "Toyota",
  "Volkswagen", "Volvo",
];

const FUELS = [
  { value: "benzin", label: "Benzin" },
  { value: "dizel", label: "Dizel" },
  { value: "lpg", label: "Benzin + LPG" },
  { value: "hybrid", label: "Hibrit" },
  { value: "elektrik", label: "Elektrik" },
];

const TRANSMISSIONS = [
  { value: "manuel", label: "Manuel" },
  { value: "otomatik", label: "Otomatik" },
  { value: "yarı-otomatik", label: "Yarı otomatik" },
];

function formatPlate(raw: string): string {
  // "34ABC123" / "34abc123" / "34 abc 123" → "34 ABC 123"
  const cleaned = raw.toUpperCase().replace(/[^0-9A-ZÇĞİÖŞÜ]/g, "");
  if (cleaned.length < 3) return cleaned;
  const city = cleaned.slice(0, 2);
  const rest = cleaned.slice(2);
  const m = rest.match(/^([A-ZÇĞİÖŞÜ]{1,3})([0-9]{1,4})?$/);
  if (!m) return `${city} ${rest}`;
  const letters = m[1];
  const digits = m[2] ?? "";
  return digits ? `${city} ${letters} ${digits}` : `${city} ${letters}`;
}

export function AddVehicleForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [plate, setPlate] = useState("");
  const [uploading, setUploading] = useState<"photo" | "ruhsat" | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [ruhsatPhotoUrl, setRuhsatPhotoUrl] = useState<string | null>(null);

  async function onFileUpload(file: File, which: "photo" | "ruhsat") {
    try {
      setUploading(which);
      // listing-photo endpoint'ini generic blob upload olarak kullanıyoruz
      const blob = await upload(`garage/${which}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload/listing-photo",
      });
      if (which === "photo") setPhotoUrl(blob.url);
      else setRuhsatPhotoUrl(blob.url);
      toast.success(which === "photo" ? "Araç fotoğrafı yüklendi" : "Ruhsat yüklendi");
    } catch (e) {
      toast.error("Yükleme başarısız");
      console.error(e);
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const str = (k: string) => {
        const v = fd.get(k);
        return typeof v === "string" && v.trim() ? v.trim() : undefined;
      };
      const num = (k: string) => {
        const v = fd.get(k);
        const s = typeof v === "string" ? v.replace(/\D/g, "") : "";
        return s ? parseInt(s, 10) : undefined;
      };
      const date = (k: string) => {
        const v = fd.get(k);
        return typeof v === "string" && v ? v : undefined;
      };

      const payload: Record<string, unknown> = {
        plate: plate.trim() || undefined,
        brand: str("brand") ?? "",
        model: str("model") ?? "",
        year: num("year") ?? new Date().getFullYear(),
        variant: str("variant"),
        kmCurrent: num("kmCurrent"),
        colorHex: str("colorHex"),
        fuelType: str("fuelType"),
        transmission: str("transmission"),
        vin: str("vin"),
        registrationDate: date("registrationDate"),
        inspectionDueAt: date("inspectionDueAt"),
        inspectionNotifyDaysBefore: num("inspectionNotifyDaysBefore") ?? 7,
        insuranceDueAt: date("insuranceDueAt"),
        insuranceNotifyDaysBefore: num("insuranceNotifyDaysBefore") ?? 14,
        mtvDueAt: date("mtvDueAt"),
        mtvNotifyDaysBefore: num("mtvNotifyDaysBefore") ?? 7,
        acquiredAt: date("acquiredAt"),
        photoUrl: photoUrl ?? undefined,
        ruhsatPhotoUrl: ruhsatPhotoUrl ?? undefined,
        notes: str("notes"),
      };

      // Undefined alanları temizle
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await fetch("/api/garage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error === "rate_limited") toast.error("Günlük ekleme limiti aşıldı (20/gün)");
        else if (data.error === "limit_reached") toast.error(data.message ?? "Limit aşıldı");
        else if (data.error === "validation") toast.error("Form eksik veya hatalı");
        else toast.error("Eklenemedi");
        return;
      }
      toast.success("Araç eklendi");
      router.push("/hesap/arabalarim");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const input =
    "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500";
  const label =
    "block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-neutral-800 bg-[#12121a] p-6"
    >
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400">Temel bilgiler</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={label}>Plaka</span>
            <input
              value={plate}
              onChange={(e) => setPlate(formatPlate(e.target.value))}
              maxLength={14}
              className={input + " font-mono uppercase"}
              placeholder="34 ABC 123"
            />
          </label>
          <label className="block">
            <span className={label}>Marka *</span>
            <select name="brand" required defaultValue="" className={input}>
              <option value="" disabled>
                Seç
              </option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Model *</span>
            <input name="model" required maxLength={60} className={input} placeholder="3.20i / Megane / Corolla" />
          </label>
          <label className="block">
            <span className={label}>Yıl *</span>
            <input
              name="year"
              type="number"
              required
              min={1950}
              max={2035}
              defaultValue={new Date().getFullYear()}
              className={input}
            />
          </label>
          <label className="block">
            <span className={label}>Versiyon / paket</span>
            <input name="variant" maxLength={80} className={input} placeholder="Executive / Sport / ..." />
          </label>
          <label className="block">
            <span className={label}>Kilometre</span>
            <input name="kmCurrent" type="number" min={0} max={2000000} className={input} placeholder="75000" />
          </label>
          <label className="block">
            <span className={label}>Renk (hex)</span>
            <input name="colorHex" maxLength={10} className={input} placeholder="#1a1a1a" />
          </label>
          <label className="block">
            <span className={label}>Yakıt</span>
            <select name="fuelType" defaultValue="" className={input}>
              <option value="">—</option>
              {FUELS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Şanzıman</span>
            <select name="transmission" defaultValue="" className={input}>
              <option value="">—</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Şase (VIN)</span>
            <input name="vin" maxLength={30} className={input + " font-mono uppercase"} />
          </label>
          <label className="block">
            <span className={label}>İlk tescil tarihi</span>
            <input name="registrationDate" type="date" className={input} />
          </label>
          <label className="block">
            <span className={label}>Edinme tarihi (senin)</span>
            <input name="acquiredAt" type="date" className={input} />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400">Uyarılar</h2>
        <p className="text-xs text-neutral-500">
          Tarihlerden kaç gün önce seni uyaralım?
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-neutral-800 p-3">
            <div className="text-xs font-semibold">Muayene (fenni muayene) bitiş</div>
            <input name="inspectionDueAt" type="date" className={input} />
            <label className="block">
              <span className="text-[10px] text-neutral-500">Kaç gün önce uyar?</span>
              <input
                name="inspectionNotifyDaysBefore"
                type="number"
                min={1}
                max={90}
                defaultValue={7}
                className={input}
              />
            </label>
          </div>
          <div className="space-y-2 rounded-lg border border-neutral-800 p-3">
            <div className="text-xs font-semibold">Sigorta (trafik/kasko) bitiş</div>
            <input name="insuranceDueAt" type="date" className={input} />
            <label className="block">
              <span className="text-[10px] text-neutral-500">Kaç gün önce uyar?</span>
              <input
                name="insuranceNotifyDaysBefore"
                type="number"
                min={1}
                max={90}
                defaultValue={14}
                className={input}
              />
            </label>
          </div>
          <div className="space-y-2 rounded-lg border border-neutral-800 p-3">
            <div className="text-xs font-semibold">MTV 1. taksit (Ocak)</div>
            <input name="mtvDueAt" type="date" className={input} />
            <label className="block">
              <span className="text-[10px] text-neutral-500">Kaç gün önce uyar?</span>
              <input
                name="mtvNotifyDaysBefore"
                type="number"
                min={1}
                max={90}
                defaultValue={7}
                className={input}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400">Fotoğraf & ruhsat</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold">Araç fotoğrafı</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileUpload(f, "photo");
              }}
              className="text-xs"
            />
            {uploading === "photo" && <div className="text-xs text-amber-400">Yükleniyor…</div>}
            {photoUrl && <div className="text-xs text-emerald-400">Yüklendi</div>}
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold">Ruhsat fotoğrafı (OCR kuyruğa alınır)</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileUpload(f, "ruhsat");
              }}
              className="text-xs"
            />
            {uploading === "ruhsat" && <div className="text-xs text-amber-400">Yükleniyor…</div>}
            {ruhsatPhotoUrl && (
              <div className="text-xs text-emerald-400">
                Yüklendi · OCR kuyrukta (VIN/tescil tarihi otomatik doldurulacak)
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <label className="block">
          <span className={label}>Notlar</span>
          <textarea
            name="notes"
            maxLength={2000}
            rows={3}
            className={input}
            placeholder="Özel durumlar, değişen parçalar, vb."
          />
        </label>
      </section>

      <div className="flex justify-end gap-2 border-t border-neutral-800 pt-4">
        <button
          type="button"
          onClick={() => router.push("/hesap/arabalarim")}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border border-emerald-600 bg-emerald-600/20 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50"
        >
          {submitting ? "Ekleniyor…" : "Aracı kaydet"}
        </button>
      </div>
    </form>
  );
}
