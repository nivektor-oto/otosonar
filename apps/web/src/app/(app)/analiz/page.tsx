"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Check,
  AlertTriangle,
  Lightbulb,
  Clock,
  Loader2,
  Car,
  TrendingUp,
  Wrench,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { parseListingUrl } from "@/lib/listing-url-parser";
import { AnalysisFeedback } from "@/components/analysis-feedback";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { VoiceRecorder, type VoiceExtracted } from "@/components/voice-recorder";
import { AiInspectionChecklist } from "@/components/ai-inspection-checklist";
import { PageTour } from "@/components/page-tour";

interface RedFlag {
  type: string;
  severity: "DUSUK" | "ORTA" | "YUKSEK" | "KRITIK";
  detail: string;
  repairEstimateTL: number | null;
}

interface AnalysisResult {
  emsalValue: number;
  emsalConfidence: number;
  negotiationScore: number;
  redFlags: RedFlag[];
  repairEstimateMin: number;
  repairEstimateMax: number;
  summary: string;
  negotiationAdvice: string;
}

interface Meta {
  durationMs: number;
  provider?: string;
  model?: string;
  retried?: number;
  emsalCount?: number | null;
  kmRisk?: { score: number; flags: string[] } | null;
}

const LISTING_URL_REGEX =
  /^https?:\/\/(www\.)?(sahibinden\.com|arabam\.com)\//i;

/**
 * URL'den kaynak platformu tespit et. Analiz input'unun altında rozet olarak gösterilir.
 * Arabam'ın ergonomi hissini yakalamak için: kullanıcı linki yapıştırdığı an "ok, anladım" feedback'i.
 */
function detectPlatform(url: string): { name: string; tone: "sahibinden" | "arabam" } | null {
  const u = url.trim().toLowerCase();
  if (!u) return null;
  if (/sahibinden\.com\//.test(u)) return { name: "Sahibinden", tone: "sahibinden" };
  if (/arabam\.com\//.test(u)) return { name: "Arabam.com", tone: "arabam" };
  return null;
}

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const [form, setForm] = useState({
    listingUrl: "",
    brand: "",
    model: "",
    variant: "",
    year: "",
    km: "",
    fuelType: "",
    transmission: "",
    city: "",
    askingPrice: "",
    damageStatus: "",
    description: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Link alanındaki URL Sahibinden/Arabam regex eşleşmesi yakalarsa tek tıkla başlat.
  const urlLooksValid = useMemo(
    () => LISTING_URL_REGEX.test(form.listingUrl.trim()),
    [form.listingUrl],
  );

  // Arabam-style "algılandı" rozeti için
  const platform = useMemo(() => detectPlatform(form.listingUrl), [form.listingUrl]);

  const fillFromUrl = () => {
    const parsed = parseListingUrl(form.listingUrl);
    if (!parsed) {
      toast.error("URL geçersiz — Sahibinden / Arabam bağlantısı yapıştır");
      return;
    }
    if (!parsed.source) {
      toast.info("URL tanındı ama otomatik doldurma sadece Sahibinden / Arabam için çalışıyor.");
      return;
    }
    setForm((f) => ({
      ...f,
      brand: parsed.brand ?? f.brand,
      model: parsed.model ?? f.model,
      year: parsed.year ? String(parsed.year) : f.year,
      km: parsed.km ? String(parsed.km) : f.km,
      askingPrice: parsed.askingPrice ? String(parsed.askingPrice) : f.askingPrice,
    }));
    const filled = [parsed.brand, parsed.model, parsed.year, parsed.km, parsed.askingPrice].filter(Boolean).length;
    toast.success(
      `${parsed.source === "sahibinden" ? "Sahibinden" : "Arabam"} linki okundu — ${filled} alan dolduruldu.`,
    );
    setManualOpen(true);
  };

  const applyVoiceExtract = (v: VoiceExtracted, transcript: string) => {
    setForm((f) => {
      const merged = { ...f };
      const setIfEmpty = <K extends keyof typeof f>(key: K, value: string | undefined) => {
        if (!merged[key] && value) merged[key] = value as typeof f[K];
      };
      setIfEmpty("brand", v.brand);
      setIfEmpty("model", v.model);
      setIfEmpty("variant", v.variant);
      setIfEmpty("city", v.city);
      setIfEmpty("damageStatus", v.damageStatus);
      setIfEmpty("fuelType", v.fuelType);
      setIfEmpty("transmission", v.transmission);
      if (!merged.year && v.year) merged.year = String(v.year);
      if (!merged.km && v.km) merged.km = String(v.km);
      if (!merged.askingPrice && v.askingPrice) merged.askingPrice = String(v.askingPrice);
      if (!merged.description && transcript) {
        merged.description = transcript;
      } else if (merged.description && transcript && merged.description.length < 20) {
        merged.description = transcript;
      }
      return merged;
    });
    setManualOpen(true);
  };

  const fillSample = () => {
    setForm({
      listingUrl: "",
      brand: "BMW",
      model: "5.20",
      variant: "F10 Executive",
      year: "2012",
      km: "185000",
      fuelType: "Dizel",
      transmission: "Otomatik",
      city: "Konya",
      askingPrice: "950000",
      damageStatus: "2 parça değişen, 3 parça boyalı",
      description:
        "Aracım temiz ve bakımlı, yeni bakım yapıldı. Motor çalışırken hafif takırtı var ama normal diyorlar. Klima gaz gerekebilir. Acil satılık, ihtiyaçtan çıkıyor. Pazarlık payı vardır.",
    });
    setManualOpen(true);
    toast.info("Örnek araç bilgileri dolduruldu");
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        listingUrl: form.listingUrl.trim() || undefined,
        brand: form.brand || undefined,
        model: form.model || undefined,
        variant: form.variant || undefined,
        year: form.year ? parseInt(form.year, 10) : undefined,
        km: form.km ? parseInt(form.km.replace(/\D/g, ""), 10) : undefined,
        fuelType: form.fuelType || undefined,
        transmission: form.transmission || undefined,
        city: form.city || undefined,
        askingPrice: form.askingPrice
          ? parseInt(form.askingPrice.replace(/\D/g, ""), 10)
          : undefined,
        damageStatus: form.damageStatus || undefined,
        description: form.description || undefined,
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analiz başarısız");
      }
      setResult(data.result);
      setMeta(data.meta);
      setFeedbackId(data.feedbackId ?? null);
      toast.success(`Analiz tamamlandı · ${(data.meta.durationMs / 1000).toFixed(1)}s`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      toast.error("Analiz başarısız", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-bg text-ink pb-28 lg:pb-0">
      <PageTour
        id="analiz"
        version={1}
        steps={[
          {
            title: "Araç Analizi nasıl çalışır?",
            body: "Sahibinden veya arabam.com ilan linkini yapıştır — OtoSonar AI çift-model doğrulama ile 8 saniyede emsal değer, gizli arıza ve pazarlık skorunu çıkarır.",
          },
          {
            selector: "#listing-url",
            title: "İlan linkini buraya yapıştır",
            body: "Tarayıcıda ilanı aç, adres çubuğundan linki kopyala, buraya yapıştır. Plaka veya VIN ile de analiz mümkün.",
            cta: "Hazırsan linki yapıştır ve 'Analiz Et' tıkla.",
          },
          {
            title: "Sonuç ne içerir?",
            body: "Emsal değer (Türkiye geneli ortalama), pazarlık skoru (1-10), kırmızı bayraklar (km riski, hasar geçmişi, hızlı satış uyarısı), tahmini onarım maliyeti ve indirim önerisi.",
          },
          {
            title: "AI Sınırları",
            body: "Tüm yorumlar tahmindir, gerçek ekspertiz yerine geçmez. Ciddi alımlardan önce yetkili servis ekspertizi şart. OtoSonar 'doğru karar vermene yardımcı olur', 'karar verir' demez.",
          },
        ]}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Araç Analizi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            İlan linkini yapıştır — OtoSonar AI 8 saniyede emsal değer, gizli arıza ve pazarlık skoru çıkarır.
          </p>
        </div>

        {/* Tek kart, URL-first akış — Arabam-seviye hero input */}
        <div className="card">
          <label
            htmlFor="listing-url"
            className="block text-sm font-bold text-slate-900 mb-2"
          >
            İlanın linkini yapıştır
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="listing-url"
              className="input flex-1 text-base sm:text-lg font-semibold min-h-12"
              placeholder="https://www.sahibinden.com/ilan/..."
              value={form.listingUrl}
              onChange={(e) => update("listingUrl", e.target.value)}
              inputMode="url"
              autoComplete="off"
            />
            {urlLooksValid ? (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-accent-gradient whitespace-nowrap min-h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    Analiz ediliyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                    Hemen Analiz Et
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={fillFromUrl}
                disabled={!form.listingUrl.trim()}
                className="btn-ghost whitespace-nowrap disabled:opacity-40 min-h-12"
              >
                Linkden Doldur
              </button>
            )}
          </div>

          {/* Platform algılandı rozeti — Arabam "anladım" feedback'i */}
          {platform ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
              {platform.name} ilanı algılandı
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Sahibinden / Arabam linki yapıştırdığında doğrudan analiz başlatılır.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setManualOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 font-semibold text-amber-700 hover:text-amber-800"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  manualOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
                aria-hidden
              />
              Link yoksa manuel doldur
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={fillSample}
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
              Örnek veriyle dene
            </button>
          </div>

          {manualOpen && (
            <div className="mt-5 pt-5 border-t border-slate-200 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
                  Sesli doldur
                </div>
                <VoiceRecorder onResult={applyVoiceExtract} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Marka">
                  <input
                    className="input"
                    placeholder="BMW"
                    value={form.brand}
                    onChange={(e) => update("brand", e.target.value)}
                  />
                </Field>
                <Field label="Model">
                  <input
                    className="input"
                    placeholder="5.20"
                    value={form.model}
                    onChange={(e) => update("model", e.target.value)}
                  />
                </Field>
                <Field label="Kasa / Paket">
                  <input
                    className="input"
                    placeholder="F10 Executive"
                    value={form.variant}
                    onChange={(e) => update("variant", e.target.value)}
                  />
                </Field>
                <Field label="Model Yılı">
                  <input
                    className="input tabular-nums"
                    placeholder="2012"
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Kilometre">
                  <input
                    className="input tabular-nums"
                    placeholder="185000"
                    value={form.km}
                    onChange={(e) => update("km", e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Yakıt">
                  <select
                    className="input"
                    value={form.fuelType}
                    onChange={(e) => update("fuelType", e.target.value)}
                  >
                    <option value="">Seç</option>
                    <option>Dizel</option>
                    <option>Benzin</option>
                    <option>Benzin &amp; LPG</option>
                    <option>Hibrit</option>
                    <option>Elektrik</option>
                  </select>
                </Field>
                <Field label="Vites">
                  <select
                    className="input"
                    value={form.transmission}
                    onChange={(e) => update("transmission", e.target.value)}
                  >
                    <option value="">Seç</option>
                    <option>Otomatik</option>
                    <option>Manuel</option>
                    <option>Yarı Otomatik</option>
                  </select>
                </Field>
                <Field label="Şehir">
                  <input
                    className="input"
                    placeholder="Konya"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="İlan Fiyatı (TL)">
                <input
                  className="input tabular-nums"
                  placeholder="850000"
                  value={form.askingPrice}
                  onChange={(e) => update("askingPrice", e.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Hasar Durumu">
                <input
                  className="input"
                  placeholder="Örn: Boyasız değişensiz / 1 parça değişen"
                  value={form.damageStatus}
                  onChange={(e) => update("damageStatus", e.target.value)}
                />
              </Field>
              <Field label="İlan Açıklaması (kopyala yapıştır)">
                <textarea
                  className="input"
                  placeholder="İlanın tam açıklama metnini buraya yapıştır. AI gizli arızaları ve sahte iddiaları burada tespit eder."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  maxLength={5000}
                />
                <div className="text-[11px] text-slate-400 text-right mt-1 tabular-nums">
                  {form.description.length} / 5000
                </div>
              </Field>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary w-full hidden lg:inline-flex"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    Analiz ediliyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                    Aracı Analiz Et
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Sonuç alanı — altta, tek akış */}
        <div aria-live="polite">
          {!result && !loading && !error && <EmptyState />}
          {loading && <LoadingState />}
          {result && (
            <ResultPanel
              result={result}
              meta={meta}
              feedbackId={feedbackId}
              form={form}
            />
          )}
        </div>
      </div>

      {/* Mobile sticky CTA — safe-area bottom + amber gradient (eye-catcher) */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 backdrop-blur border-t border-slate-200 px-4 pt-3 pb-safe z-30">
        <div className="pb-3">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-accent-gradient w-full min-h-12"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                Aracı Analiz Et
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 mb-1.5 font-semibold">{label}</div>
      {children}
    </label>
  );
}

function EmptyState() {
  return (
    <div className="card text-center py-12">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4">
        <Car className="w-7 h-7 text-amber-600" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        Analiz için hazırız
      </h3>
      <p className="text-sm text-slate-600 max-w-sm mx-auto">
        İlan linkini yapıştır, geri kalanını AI halletsin.
      </p>
    </div>
  );
}

function LoadingState() {
  const steps = [
    "İlan verileri işleniyor",
    "Açıklama AI ile taranıyor",
    "Emsal değer hesaplanıyor",
    "Pazarlık skoru çıkarılıyor",
    "Rapor hazırlanıyor",
  ];
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (completed >= steps.length) return;
    const delay = completed === 0 ? 500 : 800 + Math.random() * 400;
    const t = setTimeout(() => setCompleted((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [completed, steps.length]);

  return (
    <div
      className="card text-center py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-14 h-14 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-amber-600" aria-hidden />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        AI aracı analiz ediyor
      </h3>
      <p className="text-sm text-slate-500 mb-5">Tahmini 6-10 saniye</p>
      <ul className="space-y-2 text-sm max-w-sm mx-auto text-left">
        {steps.map((s, i) => {
          const isDone = i < completed;
          const isCurrent = i === completed;
          return (
            <li
              key={s}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isDone
                  ? "text-slate-700"
                  : isCurrent
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 transition-all ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-amber-100 border border-amber-400"
                    : "bg-white border border-slate-200"
                }`}
              >
                {isDone && <Check className="w-3 h-3" strokeWidth={3} aria-hidden />}
              </span>
              <span>{s}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface AnalysisFormState {
  brand: string;
  model: string;
  year: string;
  km: string;
  fuelType: string;
  transmission: string;
  damageStatus: string;
}

function ResultPanel({
  result,
  meta,
  feedbackId,
  form,
}: {
  result: AnalysisResult;
  meta: Meta | null;
  feedbackId: string | null;
  form: AnalysisFormState;
}) {
  const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
  const yearNum = form.year ? parseInt(form.year, 10) : NaN;
  const kmNum = form.km ? parseInt(form.km.replace(/\D/g, ""), 10) : NaN;
  const canShowChecklist =
    !!form.brand.trim() &&
    !!form.model.trim() &&
    Number.isFinite(yearNum) &&
    yearNum >= 1980 &&
    yearNum <= 2100;
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Mini disclaimer chip (sarı arka plan, küçük) */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-900 inline-flex items-center gap-2">
        <AlertTriangle className="w-3 h-3" aria-hidden strokeWidth={2.5} />
        AI sonuçları tahmindir — kritik alım öncesi ekspertiz tavsiye edilir.
      </div>

      {/* BÜYÜK fiyat kartı — Arabam style */}
      <div className="card text-center py-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Emsal Değer
        </div>
        <div className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums">
          {TL.format(result.emsalValue)}
        </div>
        <div className="text-sm text-slate-600 mt-2">
          AI güveni %{Math.round(result.emsalConfidence * 100)}
          {meta?.emsalCount ? ` · ${meta.emsalCount} emsal ilan` : ""}
        </div>

        {/* 3 badge altta */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Badge
            tone={kmRiskTone(meta?.kmRisk?.score)}
            label={
              meta?.kmRisk
                ? `KM riski ${meta.kmRisk.score}/100`
                : "KM riski — verisi yok"
            }
          />
          <Badge
            tone={
              result.redFlags.length === 0
                ? "green"
                : result.redFlags.length >= 3
                ? "red"
                : "amber"
            }
            label={
              result.redFlags.length === 0
                ? "Temiz"
                : `${result.redFlags.length} uyarı`
            }
          />
          <Badge
            tone="slate"
            label={`Pazarlık ${result.negotiationScore}/100`}
          />
        </div>
      </div>

      {/* Tek paragraf AI yorumu */}
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="icon-badge shrink-0">
            <Lightbulb className="w-5 h-5" aria-hidden />
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">AI Yorumu</div>
            <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              <strong>Pazarlık: </strong>{result.negotiationAdvice}
            </p>
          </div>
        </div>
      </div>

      {/* Detay accordion */}
      <details className="card group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" aria-hidden strokeWidth={2.25} />
            <span className="font-semibold text-slate-900">Detay Analizi</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard
              icon={<TrendingUp className="w-4 h-4" aria-hidden />}
              label="Emsal Değer"
              value={TL.format(result.emsalValue)}
              sub={`Güven %${Math.round(result.emsalConfidence * 100)}`}
            />
            <MetricCard
              icon={<Lightbulb className="w-4 h-4" aria-hidden />}
              label="Pazarlık Skoru"
              value={`${result.negotiationScore}/100`}
              sub={pazarlikLabel(result.negotiationScore)}
            />
            <MetricCard
              icon={<Wrench className="w-4 h-4" aria-hidden />}
              label="Tamir Tahmini"
              value={
                result.repairEstimateMax > 0
                  ? `${result.repairEstimateMin.toLocaleString("tr-TR")} - ${result.repairEstimateMax.toLocaleString("tr-TR")}`
                  : "Yok"
              }
              sub={
                result.redFlags.length > 0
                  ? `${result.redFlags.length} uyarı tespit edildi`
                  : "Temiz"
              }
            />
          </div>

          {meta?.kmRisk && meta.kmRisk.score >= 70 && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden strokeWidth={2.5} />
                <div className="text-sm font-bold text-red-700 uppercase tracking-wider">
                  KM oynaması riski yüksek ({meta.kmRisk.score}/100)
                </div>
              </div>
              {meta.kmRisk.flags.length > 0 && (
                <ul className="mt-1 text-xs text-red-700 space-y-1 list-disc list-inside">
                  {meta.kmRisk.flags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result.redFlags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden />
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Tespit Edilen Uyarılar ({result.redFlags.length})
                </div>
              </div>
              <div className="space-y-2">
                {result.redFlags.map((rf, i) => (
                  <RedFlagItem key={i} flag={rf} index={i} />
                ))}
              </div>
            </div>
          )}

          <AiDisclaimer
            emsalCount={meta?.emsalCount ?? null}
            durationMs={meta?.durationMs}
            provider={meta?.provider}
          />
        </div>
      </details>

      {meta && (
        <div className="text-xs text-slate-500 text-center pt-1 flex items-center justify-center gap-2 tabular-nums">
          <Clock className="w-3 h-3" aria-hidden />
          Analiz {(meta.durationMs / 1000).toFixed(1)}sn
          {meta.model && ` · ${meta.model}`}
          {meta.retried && meta.retried > 0 ? ` · retry ${meta.retried}` : ""}
        </div>
      )}

      <AnalysisFeedback feedbackId={feedbackId} />

      {canShowChecklist && (
        <AiInspectionChecklist
          vehicle={{
            brand: form.brand.trim(),
            model: form.model.trim(),
            year: yearNum,
            km: Number.isFinite(kmNum) ? kmNum : undefined,
            fuelType: form.fuelType || undefined,
            transmission: form.transmission || undefined,
            damageStatus: form.damageStatus || undefined,
          }}
        />
      )}
    </div>
  );
}

function kmRiskTone(score?: number): BadgeTone {
  if (score == null) return "slate";
  if (score >= 70) return "red";
  if (score >= 40) return "amber";
  return "green";
}

type BadgeTone = "green" | "amber" | "red" | "slate";

function Badge({ tone, label }: { tone: BadgeTone; label: string }) {
  const map: Record<BadgeTone, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${map[tone]}`}
    >
      {label}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
          {label}
        </div>
        <div className="text-amber-600">{icon}</div>
      </div>
      <div className="text-lg font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function RedFlagItem({ flag, index }: { flag: RedFlag; index: number }) {
  const sevColor = {
    DUSUK: "bg-slate-100 text-slate-700 border-slate-200",
    ORTA: "bg-amber-50 text-amber-800 border-amber-300",
    YUKSEK: "bg-red-50 text-red-700 border-red-300",
    KRITIK: "bg-red-100 text-red-800 border-red-400 font-bold",
  }[flag.severity];
  return (
    <div
      className="border border-slate-200 bg-white rounded-lg p-3 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
        <div className="font-semibold text-sm text-slate-900">
          {flag.type.replace(/_/g, " ")}
        </div>
        <div className="flex items-center gap-2">
          {flag.repairEstimateTL != null && flag.repairEstimateTL > 0 && (
            <span className="text-xs text-slate-500 tabular-nums">
              ~{flag.repairEstimateTL.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${sevColor}`}
          >
            {flag.severity}
          </span>
        </div>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed">
        {flag.detail}
      </div>
    </div>
  );
}

function pazarlikLabel(score: number): string {
  if (score >= 70) return "Yüksek pazarlık şansı";
  if (score >= 40) return "Orta seviye pazarlık";
  if (score >= 20) return "Düşük pazarlık şansı";
  return "Pazarlığa kapalı";
}
