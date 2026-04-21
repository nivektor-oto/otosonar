"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  LayoutDashboard,
  Check,
  AlertTriangle,
  Lightbulb,
  Clock,
  Loader2,
  Car,
  TrendingUp,
  Wrench,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/logo";
import { parseListingUrl } from "@/lib/listing-url-parser";
import { AnalysisFeedback } from "@/components/analysis-feedback";

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
}

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

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

  const fillFromUrl = () => {
    const parsed = parseListingUrl(form.listingUrl);
    if (!parsed) {
      toast.error("URL geçersiz — Sahibinden / Arabam bağlantısı yapıştır");
      return;
    }
    if (!parsed.source) {
      toast.info("URL tanındı ama otomatik doldurma sadece Sahibinden / Arabam için çalışıyor. Alanları manuel doldur.");
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
      `${parsed.source === "sahibinden" ? "Sahibinden" : "Arabam"} linki okundu — ${filled} alan dolduruldu. Kalan alanları tamamla.`,
    );
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
    <main className="min-h-screen bg-bg text-white pb-24 lg:pb-0">
      <nav className="sticky top-0 z-30 backdrop-blur-lg bg-bg/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
          </Link>
          <Link
            href="/dashboard"
            className="btn-ghost text-sm inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden /> Panel
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Araç Analizi
            </h1>
            <p className="text-slate-400 text-sm">
              Bilgileri doldur — OtoSonar AI saniyeler içinde emsal değer,
              gizli arıza ve pazarlık skoru çıkarır.
            </p>
            <button
              onClick={fillSample}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent2 transition"
            >
              <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
              Örnek araç bilgilerini yükle
            </button>
          </div>

          <div className="card space-y-4">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-accent">
                  İlan Linki (isteğe bağlı)
                </label>
                <span className="text-[10px] text-slate-500">Sahibinden / Arabam</span>
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="https://www.sahibinden.com/ilan/..."
                  value={form.listingUrl}
                  onChange={(e) => update("listingUrl", e.target.value)}
                  inputMode="url"
                  autoComplete="off"
                />
                <button
                  onClick={fillFromUrl}
                  disabled={!form.listingUrl.trim()}
                  className="btn-ghost text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Linkden Doldur
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Link'i yapıştır → marka, model, yıl, km, fiyat otomatik gelir. Kalan alanları (açıklama, hasar) manuel tamamla. Sahibinden / Arabam sunucularından veri çekmiyoruz — sadece link adresini okuyoruz.
              </p>
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <option>Benzin & LPG</option>
                  <option>Hibrit</option>
                  <option>Elektrik</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                rows={5}
                maxLength={5000}
              />
              <div className="text-[11px] text-slate-500 text-right mt-1 tabular-nums">
                {form.description.length} / 5000
              </div>
            </Field>

            {/* Desktop button */}
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

            {error && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3" aria-live="polite">
          {!result && !loading && <EmptyState onSample={fillSample} />}
          {loading && <LoadingState />}
          {result && <ResultPanel result={result} meta={meta} feedbackId={feedbackId} />}
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg/95 backdrop-blur-lg border-t border-border p-4 z-20">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="btn-primary w-full"
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
      <div className="text-xs text-slate-400 mb-1.5 font-semibold">{label}</div>
      {children}
    </label>
  );
}

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="card text-center py-16">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
        <Car className="w-8 h-8 text-accent" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2">
        Analiz için hazırız
      </h3>
      <p className="text-slate-400 max-w-sm mx-auto mb-5">
        Sol taraftaki formu doldur ve <strong>Aracı Analiz Et</strong>&apos;e
        bas. AI senin için emsal değer, gizli arıza ve pazarlık skorunu
        hazırlayacak.
      </p>
      <button
        onClick={onSample}
        className="btn-ghost text-sm inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" aria-hidden />
        Örnek veriyle dene
      </button>
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
      className="card text-center py-14"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent" aria-hidden />
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-1">
        AI aracı analiz ediyor
      </h3>
      <p className="text-sm text-slate-400 mb-6">Tahmini 6-10 saniye</p>
      <ul className="space-y-2.5 text-sm max-w-sm mx-auto text-left">
        {steps.map((s, i) => {
          const isDone = i < completed;
          const isCurrent = i === completed;
          return (
            <li
              key={s}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isDone
                  ? "text-slate-200"
                  : isCurrent
                  ? "text-white"
                  : "text-slate-500"
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 transition-all ${
                  isDone
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-accent/20 border border-accent"
                    : "bg-panel border border-border"
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

function ResultPanel({
  result,
  meta,
  feedbackId,
}: {
  result: AnalysisResult;
  meta: Meta | null;
  feedbackId: string | null;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" aria-hidden />}
          label="Emsal Değer"
          value={`${result.emsalValue.toLocaleString("tr-TR")} TL`}
          sub={`Güven %${Math.round(result.emsalConfidence * 100)}`}
          tone="accent"
        />
        <MetricCard
          icon={<Lightbulb className="w-4 h-4" aria-hidden />}
          label="Pazarlık Skoru"
          value={`${result.negotiationScore}/100`}
          sub={pazarlikLabel(result.negotiationScore)}
          tone={
            result.negotiationScore > 60
              ? "success"
              : result.negotiationScore > 30
              ? "warn"
              : "muted"
          }
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
          tone={result.repairEstimateMax > 10000 ? "danger" : "success"}
        />
      </div>

      <div className="card">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">
          Genel Değerlendirme
        </div>
        <p className="leading-relaxed text-slate-200">{result.summary}</p>
      </div>

      <div className="card border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <div className="icon-badge shrink-0">
            <Lightbulb className="w-5 h-5" aria-hidden />
          </div>
          <div>
            <div className="font-semibold mb-1">Pazarlık Tavsiyesi</div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result.negotiationAdvice}
            </p>
          </div>
        </div>
      </div>

      {result.redFlags.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-warn" aria-hidden />
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Tespit Edilen Uyarılar ({result.redFlags.length})
            </div>
          </div>
          <div className="space-y-3">
            {result.redFlags.map((rf, i) => (
              <RedFlagItem key={i} flag={rf} index={i} />
            ))}
          </div>
        </div>
      )}

      {meta && (
        <div className="text-xs text-slate-500 text-center pt-2 flex items-center justify-center gap-2 tabular-nums">
          <Clock className="w-3 h-3" aria-hidden />
          Analiz {(meta.durationMs / 1000).toFixed(1)}sn
          {meta.model && ` · ${meta.model}`}
          {meta.retried && meta.retried > 0 ? ` · retry ${meta.retried}` : ""}
        </div>
      )}

      <AnalysisFeedback feedbackId={feedbackId} />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "accent" | "success" | "warn" | "danger" | "muted";
}) {
  const colorMap = {
    accent: "text-accent",
    success: "text-success",
    warn: "text-warn",
    danger: "text-danger",
    muted: "text-slate-400",
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          {label}
        </div>
        <div className={`${colorMap[tone]}`}>{icon}</div>
      </div>
      <div
        className={`text-lg sm:text-xl font-bold mt-1 tabular-nums ${colorMap[tone]}`}
      >
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

function RedFlagItem({ flag, index }: { flag: RedFlag; index: number }) {
  const sevColor = {
    DUSUK: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    ORTA: "bg-warn/15 text-warn border-warn/40",
    YUKSEK: "bg-danger/15 text-danger border-danger/40",
    KRITIK: "bg-danger/25 text-danger border-danger/60 font-bold",
  }[flag.severity];
  return (
    <div
      className="border border-border rounded-lg p-3 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
        <div className="font-semibold text-sm">
          {flag.type.replace(/_/g, " ")}
        </div>
        <div className="flex items-center gap-2">
          {flag.repairEstimateTL != null && flag.repairEstimateTL > 0 && (
            <span className="text-xs text-slate-400 tabular-nums">
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
      <div className="text-sm text-slate-400 leading-relaxed">
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
