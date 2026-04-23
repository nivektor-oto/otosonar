"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  Check,
  AlertTriangle,
  Lightbulb,
  Loader2,
  TrendingUp,
  Gauge,
  Calendar,
  Wrench,
  Sparkles,
  Target,
  Car,
} from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/logo";
import { AiDisclaimer } from "@/components/ai-disclaimer";

interface MarketResult {
  priceRange: { min: number; avg: number; max: number };
  typicalKm: { low: number; avg: number; high: number };
  commonIssues: Array<{
    issue: string;
    frequency: "NADIR" | "ORTA" | "SIK";
    estimatedCost: number;
  }>;
  bestTrims: string[];
  avoidYears: number[];
  negotiationMargin: { typical: number; max: number };
  fuelCostPer100km?: number;
  maintenanceYearly?: number;
  resaleForecast: string;
  verdict: string;
  buyingTips: string[];
}

interface Meta {
  durationMs: number;
  model?: string;
  provider?: string;
  emsalCount?: number | null;
}

export default function PazarArastirPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketResult | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    yearMin: "",
    yearMax: "",
    budgetMin: "",
    budgetMax: "",
    fuelType: "",
    city: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const fillSample = () => {
    setForm({
      brand: "Volkswagen",
      model: "Passat",
      yearMin: "2015",
      yearMax: "2019",
      budgetMin: "700000",
      budgetMax: "1000000",
      fuelType: "Dizel",
      city: "Konya",
    });
    toast.info("Örnek arama dolduruldu");
  };

  const handleResearch = async () => {
    if (!form.brand.trim()) {
      toast.error("En az marka girmelisin");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        brand: form.brand.trim(),
        model: form.model || undefined,
        yearMin: form.yearMin ? parseInt(form.yearMin, 10) : undefined,
        yearMax: form.yearMax ? parseInt(form.yearMax, 10) : undefined,
        budgetMin: form.budgetMin
          ? parseInt(form.budgetMin.replace(/\D/g, ""), 10)
          : undefined,
        budgetMax: form.budgetMax
          ? parseInt(form.budgetMax.replace(/\D/g, ""), 10)
          : undefined,
        fuelType: form.fuelType || undefined,
        city: form.city || undefined,
      };

      const res = await fetch("/api/market-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Araştırma başarısız");
      }
      setResult(data.result);
      setMeta(data.meta);
      toast.success(`Araştırma hazır · ${(data.meta.durationMs / 1000).toFixed(1)}s`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      toast.error("Araştırma başarısız", { description: msg });
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent mb-3">
              <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
              Galericiye özel
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Pazar Araştırması
            </h1>
            <p className="text-slate-400 text-sm">
              Bir model için 2026 Türkiye pazarının tam fotoğrafı — fiyat
              aralığı, yaygın arızalar, en iyi paketler, kaçınılacak yıllar ve
              yeniden satış projeksiyonu.
            </p>
            <button
              onClick={fillSample}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent2 transition"
            >
              <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
              Örnek arama yükle
            </button>
          </div>

          <div className="card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Marka *">
                <input
                  className="input"
                  placeholder="Volkswagen"
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                />
              </Field>
              <Field label="Model">
                <input
                  className="input"
                  placeholder="Passat"
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Yıl (en eski)">
                <input
                  className="input tabular-nums"
                  placeholder="2015"
                  value={form.yearMin}
                  onChange={(e) => update("yearMin", e.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Yıl (en yeni)">
                <input
                  className="input tabular-nums"
                  placeholder="2019"
                  value={form.yearMax}
                  onChange={(e) => update("yearMax", e.target.value)}
                  inputMode="numeric"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Bütçe min (TL)">
                <input
                  className="input tabular-nums"
                  placeholder="700000"
                  value={form.budgetMin}
                  onChange={(e) => update("budgetMin", e.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Bütçe max (TL)">
                <input
                  className="input tabular-nums"
                  placeholder="1000000"
                  value={form.budgetMax}
                  onChange={(e) => update("budgetMax", e.target.value)}
                  inputMode="numeric"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Yakıt">
                <select
                  className="input"
                  value={form.fuelType}
                  onChange={(e) => update("fuelType", e.target.value)}
                >
                  <option value="">Farketmez</option>
                  <option>Dizel</option>
                  <option>Benzin</option>
                  <option>Benzin & LPG</option>
                  <option>Hibrit</option>
                  <option>Elektrik</option>
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

            <button
              onClick={handleResearch}
              disabled={loading}
              className="btn-primary w-full hidden lg:inline-flex"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Araştırılıyor...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                  Pazar Araştırması Başlat
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
          {result && <ResultPanel result={result} meta={meta} />}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg/95 backdrop-blur-lg border-t border-border p-4 z-20">
        <button
          onClick={handleResearch}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Araştırılıyor...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" aria-hidden strokeWidth={2.5} />
              Pazar Araştırması Başlat
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
        <BarChart3 className="w-8 h-8 text-accent" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2">
        Hangi modelin pazarını araştıralım?
      </h3>
      <p className="text-slate-400 max-w-sm mx-auto mb-5">
        Marka (ve istersen model) gir, AI 2026 Türkiye pazarının tam
        fotoğrafını çıkarır — fiyat aralığı, arıza örüntüleri, en iyi paketler,
        kaçınılacak yıllar.
      </p>
      <button
        onClick={onSample}
        className="btn-ghost text-sm inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" aria-hidden />
        Örnek arama dene
      </button>
    </div>
  );
}

function LoadingState() {
  const steps = [
    "Pazar verileri taranıyor",
    "Fiyat aralığı hesaplanıyor",
    "Arıza örüntüleri analiz ediliyor",
    "En iyi paketler seçiliyor",
    "Rapor hazırlanıyor",
  ];
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (completed >= steps.length) return;
    const delay = completed === 0 ? 500 : 900 + Math.random() * 400;
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
          <BarChart3 className="w-6 h-6 text-accent" aria-hidden />
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-1">
        AI pazarı inceliyor
      </h3>
      <p className="text-sm text-slate-400 mb-6">Tahmini 8-12 saniye</p>
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
}: {
  result: MarketResult;
  meta: Meta | null;
}) {
  const freqStyle = {
    NADIR: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    ORTA: "bg-warn/15 text-warn border-warn/40",
    SIK: "bg-danger/15 text-danger border-danger/40",
  };
  return (
    <div className="space-y-4 animate-fade-in">
      <AiDisclaimer
        emsalCount={meta?.emsalCount ?? null}
        durationMs={meta?.durationMs}
        provider={meta?.provider}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <RangeCard
          icon={<TrendingUp className="w-4 h-4" aria-hidden />}
          label="Fiyat Aralığı"
          min={result.priceRange.min}
          avg={result.priceRange.avg}
          max={result.priceRange.max}
          unit="TL"
        />
        <RangeCard
          icon={<Gauge className="w-4 h-4" aria-hidden />}
          label="Tipik Km"
          min={result.typicalKm.low}
          avg={result.typicalKm.avg}
          max={result.typicalKm.high}
          unit="km"
        />
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Pazarlık Marjı
            </div>
            <Target className="w-4 h-4 text-accent" aria-hidden />
          </div>
          <div className="text-xl font-bold tabular-nums text-accent">
            ~{result.negotiationMargin.typical}%
          </div>
          <div className="text-xs text-slate-400 mt-1 tabular-nums">
            max %{result.negotiationMargin.max}
          </div>
        </div>
      </div>

      <div className="card border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <div className="icon-badge shrink-0">
            <Lightbulb className="w-5 h-5" aria-hidden />
          </div>
          <div>
            <div className="font-semibold mb-1">Genel Değerlendirme</div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {result.verdict}
            </p>
          </div>
        </div>
      </div>

      {result.commonIssues.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-warn" aria-hidden />
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Yaygın Arızalar
            </div>
          </div>
          <div className="space-y-2.5">
            {result.commonIssues.map((it, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 py-2 border-b border-border/60 last:border-b-0 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex-1 text-sm">{it.issue}</div>
                <div className="flex items-center gap-2 shrink-0">
                  {it.estimatedCost > 0 && (
                    <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                      ~{it.estimatedCost.toLocaleString("tr-TR")} TL
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${freqStyle[it.frequency]}`}
                  >
                    {it.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.bestTrims.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-success" aria-hidden />
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Önerilen Paketler
              </div>
            </div>
            <ul className="space-y-1.5">
              {result.bestTrims.map((t, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Check
                    className="w-4 h-4 text-success mt-0.5 shrink-0"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.avoidYears.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-danger" aria-hidden />
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Kaçınılacak Yıllar
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.avoidYears.map((y) => (
                <span
                  key={y}
                  className="text-sm font-semibold tabular-nums px-3 py-1 rounded-full bg-danger/15 text-danger border border-danger/30"
                >
                  {y}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {(result.fuelCostPer100km || result.maintenanceYearly) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.fuelCostPer100km && (
            <div className="card">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Yakıt Maliyeti
              </div>
              <div className="text-lg font-bold tabular-nums mt-1">
                {result.fuelCostPer100km.toLocaleString("tr-TR")}{" "}
                <span className="text-sm text-slate-400">TL / 100 km</span>
              </div>
            </div>
          )}
          {result.maintenanceYearly && (
            <div className="card">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Yıllık Bakım
              </div>
              <div className="text-lg font-bold tabular-nums mt-1">
                {result.maintenanceYearly.toLocaleString("tr-TR")}{" "}
                <span className="text-sm text-slate-400">TL</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">
          Yeniden Satış Projeksiyonu
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {result.resaleForecast}
        </p>
      </div>

      {result.buyingTips.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-4 h-4 text-accent" aria-hidden />
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Alım Tüyoları
            </div>
          </div>
          <ul className="space-y-2">
            {result.buyingTips.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-200 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-accent font-bold tabular-nums shrink-0 w-6">
                  {i + 1}.
                </span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meta && (
        <div className="text-xs text-slate-500 text-center pt-2 tabular-nums">
          Araştırma {(meta.durationMs / 1000).toFixed(1)}sn
          {meta.model && ` · ${meta.model}`}
        </div>
      )}
    </div>
  );
}

function RangeCard({
  icon,
  label,
  min,
  avg,
  max,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  min: number;
  avg: number;
  max: number;
  unit: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          {label}
        </div>
        <div className="text-accent">{icon}</div>
      </div>
      <div className="text-lg font-bold tabular-nums text-accent">
        {avg.toLocaleString("tr-TR")}{" "}
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <div className="text-xs text-slate-400 mt-1 tabular-nums">
        {min.toLocaleString("tr-TR")} — {max.toLocaleString("tr-TR")}
      </div>
    </div>
  );
}
