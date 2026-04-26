"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip data URL prefix
      const idx = result.indexOf(",");
      const base64 = idx >= 0 ? result.slice(idx + 1) : result;
      const mimeMatch = result.match(/^data:([^;]+);/);
      const mime = mimeMatch?.[1] ?? file.type ?? "image/jpeg";
      resolve({ base64, mime });
    };
    reader.onerror = () => reject(new Error("file read failed"));
    reader.readAsDataURL(file);
  });
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface RuhsatFields {
  plate: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  variant: string | null;
  vin: string | null;
  motorNumber: string | null;
  engineCc: number | null;
  fuelType: string | null;
  color: string | null;
  registrationDate: string | null;
  inspectionDueAt: string | null;
  ownerName: string | null;
  vehicleClass: string | null;
  netWeightKg: number | null;
  maxLoadKg: number | null;
  seatCount: number | null;
  confidence: number;
  notes: string | null;
}

export function AddVehicleForm({ userKind }: { userKind: "dealer" | "individual" }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Controlled state — ruhsat OCR doldurabilsin diye
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [variant, setVariant] = useState("");
  const [kmCurrent, setKmCurrent] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [vin, setVin] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [acquiredAt, setAcquiredAt] = useState("");
  const [inspectionDueAt, setInspectionDueAt] = useState("");
  const [insuranceDueAt, setInsuranceDueAt] = useState("");
  const [mtvDueAt, setMtvDueAt] = useState("");
  const [notes, setNotes] = useState("");

  const [uploading, setUploading] = useState<"photo" | "ruhsat" | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [ruhsatPhotoUrl, setRuhsatPhotoUrl] = useState<string | null>(null);
  const [ruhsatFilled, setRuhsatFilled] = useState<RuhsatFields | null>(null);

  // Hidden file input refs — galeri vs kamera
  const photoGalleryRef = useRef<HTMLInputElement>(null);
  const photoCameraRef = useRef<HTMLInputElement>(null);
  const ruhsatGalleryRef = useRef<HTMLInputElement>(null);
  const ruhsatCameraRef = useRef<HTMLInputElement>(null);

  // İlk render: insurance default'u kullanıcı tipine göre — sadece boşsa
  useEffect(() => {
    if (insuranceDueAt) return;
    // Dealer'a otomatik 90 gün önermek istemiyoruz; sadece placeholder yönlendirmesi yeter
  }, [insuranceDueAt]);

  function applyRuhsatFields(f: RuhsatFields) {
    if (f.plate) setPlate(formatPlate(f.plate));
    if (f.brand) {
      // Marka listesinden eşleştir (case-insensitive)
      const match = BRANDS.find((b) => b.toLowerCase() === f.brand!.toLowerCase());
      if (match) setBrand(match);
    }
    if (f.model) setModel(f.model);
    if (f.year) setYear(String(f.year));
    if (f.variant) setVariant(f.variant);
    if (f.vin) setVin(f.vin);
    if (f.fuelType) setFuelType(f.fuelType);
    if (f.registrationDate) setRegistrationDate(f.registrationDate);
    if (f.inspectionDueAt) setInspectionDueAt(f.inspectionDueAt);
    setRuhsatFilled(f);
  }

  async function runRuhsatOcr(file: File) {
    setOcrRunning(true);
    try {
      const { base64, mime } = await fileToBase64(file);
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      const finalMime = allowedMimes.includes(mime) ? mime : "image/jpeg";
      const res = await fetch("/api/ruhsat-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: finalMime }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data?.error === "rate_limited") toast.error("Ruhsat OCR limiti (saatte 30) aşıldı");
        else if (data?.error === "image_too_large") toast.error("Ruhsat fotoğrafı 5 MB'tan büyük");
        else toast.error("Ruhsat okunamadı, alanları el ile doldurabilirsin");
        return;
      }
      const fields = data.fields as RuhsatFields;
      if (fields.confidence < 0.3) {
        toast.warning("Ruhsat bulanık — alanları kontrol et");
      } else {
        toast.success(`Ruhsat okundu (${Math.round(fields.confidence * 100)}% güven)`);
      }
      applyRuhsatFields(fields);
    } catch (e) {
      console.error(e);
      toast.error("Ruhsat OCR başarısız");
    } finally {
      setOcrRunning(false);
    }
  }

  async function onFileUpload(file: File, which: "photo" | "ruhsat") {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Dosya 8 MB'tan büyük");
      return;
    }
    try {
      setUploading(which);
      const blob = await upload(`garage/${which}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload/listing-photo",
      });
      if (which === "photo") {
        setPhotoUrl(blob.url);
        toast.success("Araç fotoğrafı yüklendi");
      } else {
        setRuhsatPhotoUrl(blob.url);
        toast.success("Ruhsat yüklendi, okunuyor...");
        // Senkron OCR — orijinal File ile
        await runRuhsatOcr(file);
      }
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
      const payload: Record<string, unknown> = {
        plate: plate.trim() || undefined,
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year, 10) || new Date().getFullYear(),
        variant: variant.trim() || undefined,
        kmCurrent: kmCurrent ? parseInt(kmCurrent.replace(/\D/g, ""), 10) : undefined,
        colorHex: colorHex.trim() || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        vin: vin.trim() || undefined,
        registrationDate: registrationDate || undefined,
        inspectionDueAt: inspectionDueAt || undefined,
        inspectionNotifyDaysBefore: 7,
        insuranceDueAt: insuranceDueAt || undefined,
        insuranceNotifyDaysBefore: 14,
        mtvDueAt: mtvDueAt || undefined,
        mtvNotifyDaysBefore: 7,
        acquiredAt: acquiredAt || undefined,
        photoUrl: photoUrl ?? undefined,
        ruhsatPhotoUrl: ruhsatPhotoUrl ?? undefined,
        notes: notes.trim() || undefined,
      };

      // Override notify-before from form fields if present
      const fd = new FormData(e.currentTarget);
      const fdNum = (k: string) => {
        const v = fd.get(k);
        const s = typeof v === "string" ? v.replace(/\D/g, "") : "";
        return s ? parseInt(s, 10) : undefined;
      };
      const ib = fdNum("inspectionNotifyDaysBefore");
      const isb = fdNum("insuranceNotifyDaysBefore");
      const mb = fdNum("mtvNotifyDaysBefore");
      if (ib) payload.inspectionNotifyDaysBefore = ib;
      if (isb) payload.insuranceNotifyDaysBefore = isb;
      if (mb) payload.mtvNotifyDaysBefore = mb;

      // Send ruhsat OCR result so server stores it
      if (ruhsatFilled) payload.ruhsatOcrResult = ruhsatFilled;

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      if (!payload.brand || !payload.model) {
        toast.error("Marka ve model zorunlu");
        setSubmitting(false);
        return;
      }

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
  const labelCls =
    "block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1";
  const btnPrimary =
    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700/20 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-700/30 active:scale-[0.98]";
  const btnSecondary =
    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 active:scale-[0.98]";
  const quickBtn =
    "inline-flex min-h-[40px] items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:border-emerald-500 hover:text-emerald-300 active:scale-[0.97]";

  const insuranceHint =
    userKind === "dealer"
      ? "Galerici için tipik: 1-3 ay (envanter dönüşü). Hızlı seç ↓"
      : "Bireysel için tipik: 12 ay. Hızlı seç ↓";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-neutral-800 bg-[#12121a] p-6"
    >
      {/* RUHSAT — en üstte: yükle, alanlar otomatik dolsun */}
      <section className="space-y-3 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
        <div>
          <h2 className="text-sm font-semibold text-emerald-400">Ruhsat fotoğrafı (önerilir)</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Ruhsatı yükle veya kameradan çek — plaka, marka, model, VIN, ilk tescil ve muayene
            tarihi otomatik doldurulur.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => ruhsatGalleryRef.current?.click()}
            disabled={uploading === "ruhsat" || ocrRunning}
            className={btnSecondary + " disabled:opacity-50"}
          >
            Galeriden seç
          </button>
          <button
            type="button"
            onClick={() => ruhsatCameraRef.current?.click()}
            disabled={uploading === "ruhsat" || ocrRunning}
            className={btnPrimary + " disabled:opacity-50"}
          >
            Kamerayla çek
          </button>
          <input
            ref={ruhsatGalleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileUpload(f, "ruhsat");
              e.target.value = "";
            }}
          />
          <input
            ref={ruhsatCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileUpload(f, "ruhsat");
              e.target.value = "";
            }}
          />
        </div>

        {uploading === "ruhsat" && (
          <div className="text-xs text-amber-400">Ruhsat yükleniyor...</div>
        )}
        {ocrRunning && (
          <div className="text-xs text-amber-400">OtoSonar AI ruhsatı okuyor...</div>
        )}
        {ruhsatPhotoUrl && !ocrRunning && (
          <div className="flex items-start gap-3">
            <div className="relative h-20 w-28 overflow-hidden rounded-md border border-neutral-700 bg-black">
              <Image
                src={ruhsatPhotoUrl}
                alt="Ruhsat"
                fill
                className="object-cover"
                sizes="112px"
                unoptimized
              />
            </div>
            <div className="text-xs text-emerald-400">
              Yüklendi
              {ruhsatFilled && ruhsatFilled.confidence > 0
                ? ` · ${Math.round(ruhsatFilled.confidence * 100)}% güvenle okundu`
                : ""}
              <div className="mt-1 text-neutral-500">
                Aşağıdaki alanları kontrol edip düzeltebilirsin.
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400">Temel bilgiler</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelCls}>Plaka</span>
            <input
              value={plate}
              onChange={(e) => setPlate(formatPlate(e.target.value))}
              maxLength={14}
              className={input + " font-mono uppercase"}
              placeholder="34 ABC 123"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Marka *</span>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              className={input}
            >
              <option value="" disabled>
                Seç
              </option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              {brand && !BRANDS.includes(brand) && <option value={brand}>{brand}</option>}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Model *</span>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              maxLength={60}
              className={input}
              placeholder="3.20i / Megane / Corolla"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Yıl *</span>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              type="number"
              required
              min={1950}
              max={2035}
              className={input}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Versiyon / paket</span>
            <input
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              maxLength={80}
              className={input}
              placeholder="Executive / Sport / ..."
            />
          </label>
          <label className="block">
            <span className={labelCls}>Kilometre</span>
            <input
              value={kmCurrent}
              onChange={(e) => setKmCurrent(e.target.value)}
              type="number"
              min={0}
              max={2000000}
              className={input}
              placeholder="75000"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Renk (hex)</span>
            <input
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              maxLength={10}
              className={input}
              placeholder="#1a1a1a"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Yakıt</span>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className={input}
            >
              <option value="">—</option>
              {FUELS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Şanzıman</span>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className={input}
            >
              <option value="">—</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Şase (VIN)</span>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              maxLength={30}
              className={input + " font-mono uppercase"}
            />
          </label>
          <label className="block">
            <span className={labelCls}>İlk tescil tarihi</span>
            <input
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              type="date"
              className={input}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Edinme tarihi (senin)</span>
            <input
              value={acquiredAt}
              onChange={(e) => setAcquiredAt(e.target.value)}
              type="date"
              className={input}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400">Uyarılar</h2>
        <p className="text-xs text-neutral-500">
          Tarihler yaklaşırken push bildirim gönderilir.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-neutral-800 p-3">
            <div className="text-xs font-semibold">Muayene (fenni muayene) bitiş</div>
            <input
              value={inspectionDueAt}
              onChange={(e) => setInspectionDueAt(e.target.value)}
              type="date"
              className={input}
            />
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
            <input
              value={insuranceDueAt}
              onChange={(e) => setInsuranceDueAt(e.target.value)}
              type="date"
              className={input}
            />
            <p className="text-[10px] text-neutral-500">{insuranceHint}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className={quickBtn}
                onClick={() => setInsuranceDueAt(todayPlus(30))}
              >
                +1 ay
              </button>
              <button
                type="button"
                className={quickBtn}
                onClick={() => setInsuranceDueAt(todayPlus(60))}
              >
                +2 ay
              </button>
              <button
                type="button"
                className={quickBtn}
                onClick={() => setInsuranceDueAt(todayPlus(90))}
              >
                +3 ay
              </button>
              <button
                type="button"
                className={quickBtn}
                onClick={() => setInsuranceDueAt(todayPlus(180))}
              >
                +6 ay
              </button>
              <button
                type="button"
                className={quickBtn}
                onClick={() => setInsuranceDueAt(todayPlus(365))}
              >
                +12 ay
              </button>
            </div>
            <label className="block">
              <span className="text-[10px] text-neutral-500">Kaç gün önce uyar?</span>
              <input
                name="insuranceNotifyDaysBefore"
                type="number"
                min={1}
                max={90}
                defaultValue={userKind === "dealer" ? 7 : 14}
                className={input}
              />
            </label>
          </div>
          <div className="space-y-2 rounded-lg border border-neutral-800 p-3">
            <div className="text-xs font-semibold">MTV 1. taksit (Ocak)</div>
            <input
              value={mtvDueAt}
              onChange={(e) => setMtvDueAt(e.target.value)}
              type="date"
              className={input}
            />
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

      {/* ARAÇ FOTOĞRAFI — galeri + kamera */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400">Araç fotoğrafı (opsiyonel)</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => photoGalleryRef.current?.click()}
            disabled={uploading === "photo"}
            className={btnSecondary + " disabled:opacity-50"}
          >
            Galeriden seç
          </button>
          <button
            type="button"
            onClick={() => photoCameraRef.current?.click()}
            disabled={uploading === "photo"}
            className={btnPrimary + " disabled:opacity-50"}
          >
            Kamerayla çek
          </button>
          <input
            ref={photoGalleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileUpload(f, "photo");
              e.target.value = "";
            }}
          />
          <input
            ref={photoCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileUpload(f, "photo");
              e.target.value = "";
            }}
          />
        </div>
        {uploading === "photo" && (
          <div className="text-xs text-amber-400">Yükleniyor...</div>
        )}
        {photoUrl && (
          <div className="flex items-start gap-3">
            <div className="relative h-24 w-32 overflow-hidden rounded-md border border-neutral-700 bg-black">
              <Image
                src={photoUrl}
                alt="Araç"
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            </div>
            <div className="text-xs text-emerald-400">Yüklendi</div>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <label className="block">
          <span className={labelCls}>Notlar</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
          className="min-h-[44px] rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] rounded-lg border border-emerald-600 bg-emerald-600/20 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50"
        >
          {submitting ? "Ekleniyor…" : "Aracı kaydet"}
        </button>
      </div>
    </form>
  );
}
