"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2, Camera, Upload, X } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { PaintMapEditor, type PaintMap } from "@/components/paint-map";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadedPhoto {
  id: string;
  url: string;
  previewUrl: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

type BodyType = "sedan" | "hatchback" | "suv" | "station" | "coupe" | "cabrio" | "pickup" | "minivan" | "unknown";

type QuotaInfo =
  | { allowed: true; reason: "b2c_free" | "dealer_quota"; freeRemaining: number; limit: number; used: number }
  | { allowed: false; reason: "b2c_over" | "dealer_over"; priceTL: number; limit: number; used: number };

interface ScoreResult {
  overallScore: number;
  titleScore: number;
  priceScore: number;
  photoScore: number;
  textScore: number;
  aiTitle: string;
  aiDescription: string;
  photoOrder: string[];
  tips: Array<{ label: string; severity: "info" | "warning" | "critical" }>;
}

export function NewListingForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [bodyType, setBodyType] = useState<BodyType>("sedan");
  const [paintMap, setPaintMap] = useState<PaintMap>({});
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDays, setAuctionDays] = useState(3);
  const [minBid, setMinBid] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Revoke any outstanding object URLs on unmount
      uploadedPhotos.forEach((p) => {
        if (p.previewUrl && p.previewUrl.startsWith("blob:")) {
          try { URL.revokeObjectURL(p.previewUrl); } catch { /* ignore */ }
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_PHOTOS - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      toast.error(`En fazla ${MAX_PHOTOS} fotoğraf yükleyebilirsin.`);
      return;
    }
    const selected = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.warning(`Sadece ilk ${remainingSlots} fotoğraf eklendi (limit ${MAX_PHOTOS}).`);
    }

    for (const file of selected) {
      // Client-side validation
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        toast.error(`${file.name}: JPG, PNG veya WebP olmalı.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        toast.error(`${file.name}: 8 MB sınırını aşıyor.`);
        continue;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const previewUrl = URL.createObjectURL(file);
      setUploadedPhotos((prev) => [
        ...prev,
        { id, url: "", previewUrl, uploading: true, progress: 0 },
      ]);

      try {
        // Derive a safe-ish filename; blob client will dedupe server-side.
        const ext = file.name.includes(".")
          ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
          : "jpg";
        const filename = `listings/${id}.${ext}`;
        const blob = await upload(filename, file, {
          access: "public",
          handleUploadUrl: "/api/upload/listing-photo",
          onUploadProgress: ({ percentage }) => {
            setUploadedPhotos((prev) =>
              prev.map((p) =>
                p.id === id ? { ...p, progress: Math.round(percentage) } : p,
              ),
            );
          },
        });
        setUploadedPhotos((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, url: blob.url, uploading: false, progress: 100 }
              : p,
          ),
        );
      } catch (err) {
        const msg = (err as Error).message ?? "Yükleme başarısız";
        toast.error(`${file.name}: ${msg}`);
        setUploadedPhotos((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, uploading: false, error: msg } : p,
          ),
        );
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeUploadedPhoto(id: string) {
    setUploadedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl?.startsWith("blob:")) {
        try { URL.revokeObjectURL(target.previewUrl); } catch { /* ignore */ }
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  async function onAiScore() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const photoStr = String(fd.get("photos") ?? "");
    const photoCount = photoStr.split(/[\n,]/).filter((s) => /^https?:\/\//.test(s.trim())).length;
    const brand = String(fd.get("brand") ?? "").trim();
    const model = String(fd.get("model") ?? "").trim();
    const city = String(fd.get("city") ?? "").trim();
    if (!brand || !model || !city) {
      toast.error("AI skor için marka, model ve şehir doldur.");
      return;
    }
    setScoring(true);
    try {
      const r = await fetch("/api/listing-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          model,
          year: Number(fd.get("year")) || new Date().getFullYear(),
          km: Number(fd.get("km")) || 0,
          city,
          askingPrice: Number(fd.get("askingPrice")) || 100000,
          currentDescription: String(fd.get("description") ?? "") || undefined,
          photoCount,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        toast.error("AI skor hatası");
        return;
      }
      setScore(data.result);
      toast.success("AI analizi hazır — aşağıda öneriler var");
    } catch {
      toast.error("Ağ hatası");
    } finally {
      setScoring(false);
    }
  }

  function applyAiSuggestions() {
    if (!score || !formRef.current) return;
    const desc = formRef.current.elements.namedItem("description") as HTMLTextAreaElement | null;
    if (desc) desc.value = score.aiDescription;
    toast.success("AI açıklaması forma uygulandı");
  }

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
    const urlPhotos = photoStr
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//.test(s));
    const uploadedUrls = uploadedPhotos
      .filter((p) => p.url && !p.uploading && !p.error)
      .map((p) => p.url);
    // Uploaded photos first (higher priority), then pasted URLs, deduped.
    const photos = Array.from(new Set([...uploadedUrls, ...urlPhotos])).slice(0, 12);

    const stillUploading = uploadedPhotos.some((p) => p.uploading);
    if (stillUploading) {
      toast.error("Bazı fotoğraflar hâlâ yükleniyor. Lütfen bekle.");
      setLoading(false);
      return;
    }

    const body = {
      brand: String(fd.get("brand") ?? ""),
      model: String(fd.get("model") ?? ""),
      year: Number(fd.get("year")),
      km: Number(fd.get("km")),
      city: String(fd.get("city") ?? ""),
      bodyType: bodyType !== "unknown" ? bodyType : undefined,
      askingPrice: Number(fd.get("askingPrice")),
      description: String(fd.get("description") ?? "") || undefined,
      photos: photos.length ? photos : undefined,
      paintMap: Object.keys(paintMap).length > 0 ? paintMap : undefined,
      isAuction,
      auctionDays: isAuction ? auctionDays : undefined,
      minBid: isAuction && minBid ? parseInt(minBid.replace(/\D/g, ""), 10) : undefined,
      isUrgent,
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
      ref={formRef}
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
        <span className="mb-1 block text-xs text-neutral-400">Kasa tipi</span>
        <select
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value as BodyType)}
          className={input}
        >
          <option value="sedan">Sedan</option>
          <option value="hatchback">Hatchback</option>
          <option value="suv">SUV</option>
          <option value="station">Station</option>
          <option value="coupe">Coupe</option>
          <option value="cabrio">Cabrio</option>
          <option value="pickup">Pickup</option>
          <option value="minivan">Minivan</option>
          <option value="unknown">Belirtme</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Açıklama</span>
        <textarea name="description" rows={4} maxLength={2000} className={input} />
      </label>

      <div className="space-y-2">
        <div className="text-xs text-neutral-400">Boya / Değişen şeması (isteğe bağlı)</div>
        <PaintMapEditor bodyType={bodyType} onChange={setPaintMap} />
      </div>

      <div className="rounded-xl border border-border bg-panel/30 p-4 space-y-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          İlan seçenekleri
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <strong className="text-white">Acil sat</strong> bayrağı — ilan ana sayfada kırmızı rozetle öne çıkar.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAuction}
            onChange={(e) => setIsAuction(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <strong className="text-white">Açık arttırma</strong> (Pro ve Max paketler) — belirtilen süre sonunda en yüksek teklif kazanır.
          </span>
        </label>
        {isAuction && (
          <div className="grid grid-cols-2 gap-3 pl-6">
            <label className="block">
              <span className="mb-1 block text-[10px] text-neutral-400">Süre (gün)</span>
              <select
                value={auctionDays}
                onChange={(e) => setAuctionDays(parseInt(e.target.value, 10))}
                className={input}
              >
                <option value={1}>1 gün</option>
                <option value={3}>3 gün</option>
                <option value={7}>7 gün</option>
                <option value={14}>14 gün</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] text-neutral-400">
                Asgari teklif (TL — opsiyonel)
              </span>
              <input
                value={minBid}
                onChange={(e) => setMinBid(e.target.value)}
                inputMode="numeric"
                placeholder="500000"
                className={input}
              />
            </label>
          </div>
        )}
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-panel/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent" aria-hidden strokeWidth={2} />
              Fotoğraflar
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Telefondan çek veya galeriden seç — en fazla {MAX_PHOTOS} adet, 8 MB altı, JPG/PNG/WebP.
            </p>
          </div>
          <span className="text-[11px] tabular-nums text-neutral-400">
            {uploadedPhotos.length}/{MAX_PHOTOS}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
          id="listing-photo-input"
        />
        <label
          htmlFor="listing-photo-input"
          className={`flex flex-col items-center justify-center gap-1 w-full rounded-lg border border-dashed border-neutral-700 bg-[#0a0a0f] px-4 py-6 text-sm text-neutral-300 hover:border-accent hover:text-white cursor-pointer transition ${uploadedPhotos.length >= MAX_PHOTOS ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Upload className="w-5 h-5 text-accent" aria-hidden strokeWidth={2} />
          <span className="font-semibold">Fotoğraf yükle / çek</span>
          <span className="text-[10px] text-neutral-500">
            {uploadedPhotos.length >= MAX_PHOTOS
              ? "Limit doldu"
              : "Dokun veya sürükle-bırak"}
          </span>
        </label>

        {uploadedPhotos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {uploadedPhotos.map((p) => (
              <div
                key={p.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-neutral-800 bg-[#0a0a0f] group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url || p.previewUrl}
                  alt="Fotoğraf önizleme"
                  className="w-full h-full object-cover"
                />
                {p.uploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-4 h-4 text-accent animate-spin" aria-hidden />
                    <div className="text-[10px] text-white tabular-nums font-semibold">
                      {p.progress}%
                    </div>
                  </div>
                )}
                {p.error && (
                  <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center px-2">
                    <div className="text-[10px] text-red-100 text-center leading-tight">
                      {p.error}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeUploadedPhoto(p.id)}
                  aria-label="Fotoğrafı kaldır"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition hover:bg-red-500/80"
                >
                  <X className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        <details className="text-xs text-neutral-400">
          <summary className="cursor-pointer hover:text-white">
            Fotoğrafın yoksa URL de yapıştırabilirsin
          </summary>
          <div className="mt-2">
            <textarea
              name="photos"
              rows={3}
              placeholder="https://.../foto1.jpg&#10;https://.../foto2.jpg"
              className={input}
            />
            <p className="mt-1 text-[10px] text-neutral-500">
              Virgül veya satır ayrı, max 12 adet. Yüklenen fotoğraflarla birleştirilir.
            </p>
          </div>
        </details>
      </div>
      <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" aria-hidden strokeWidth={2.5} />
              AI ilan iyileştirici
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fiyatını puanlayıp başlık + açıklama önerir, en iyi foto sırasını çıkarır.
            </p>
          </div>
          <button
            type="button"
            onClick={onAiScore}
            disabled={scoring}
            className="btn-ghost text-xs whitespace-nowrap inline-flex items-center gap-1.5"
          >
            {scoring ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                Analiz ediliyor…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
                AI ile analiz et
              </>
            )}
          </button>
        </div>
        {score && <ScorePanel result={score} onApply={applyAiSuggestions} />}
      </div>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Yayınlanıyor…" : quota && !quota.allowed ? "Öde ve yayınla — 500 TL" : "İlan yayınla"}
      </button>
    </form>
  );
}

function ScorePanel({ result, onApply }: { result: ScoreResult; onApply: () => void }) {
  return (
    <div className="space-y-3 pt-3 border-t border-accent/20">
      <div className="grid grid-cols-5 gap-2 text-center">
        <ScoreTile label="Genel" value={result.overallScore} big />
        <ScoreTile label="Başlık" value={result.titleScore} />
        <ScoreTile label="Fiyat" value={result.priceScore} />
        <ScoreTile label="Foto" value={result.photoScore} />
        <ScoreTile label="Metin" value={result.textScore} />
      </div>

      <div className="rounded-lg border border-border bg-panel/60 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Önerilen başlık
        </div>
        <div className="text-sm font-semibold text-white flex items-start justify-between gap-2">
          <span className="flex-1">{result.aiTitle}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(result.aiTitle).then(() => toast.success("Kopyalandı"));
            }}
            className="shrink-0 text-slate-400 hover:text-white"
            aria-label="Başlığı kopyala"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-panel/60 p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Önerilen açıklama
          </div>
          <button
            type="button"
            onClick={onApply}
            className="text-[11px] text-accent font-semibold hover:text-accent2"
          >
            Açıklamaya uygula →
          </button>
        </div>
        <pre className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-auto">
          {result.aiDescription}
        </pre>
      </div>

      <div className="rounded-lg border border-border bg-panel/60 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Önerilen foto sırası ({result.photoOrder.length})
        </div>
        <ol className="text-xs text-slate-300 space-y-0.5 list-decimal list-inside">
          {result.photoOrder.map((p, i) => <li key={i}>{p}</li>)}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-panel/60 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
          İyileştirme önerileri
        </div>
        <ul className="text-xs space-y-1">
          {result.tips.map((t, i) => (
            <li
              key={i}
              className={`flex gap-2 ${
                t.severity === "critical"
                  ? "text-red-300"
                  : t.severity === "warning"
                  ? "text-amber-300"
                  : "text-slate-300"
              }`}
            >
              <span>•</span>
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ScoreTile({ label, value, big }: { label: string; value: number; big?: boolean }) {
  const color =
    value >= 80
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : value >= 60
      ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-500/10 border-red-500/30";
  return (
    <div className={`rounded-lg border px-2 py-2 ${color}`}>
      <div className={`font-black tabular-nums ${big ? "text-2xl" : "text-lg"}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider font-semibold opacity-80">{label}</div>
    </div>
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
