"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  Target,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/logo";
import { AiDisclaimer } from "@/components/ai-disclaimer";

type Condition = "MUKEMMEL" | "IYI" | "ORTA" | "KOTU";
type FuelType = "Benzin" | "Dizel" | "LPG" | "Hibrit" | "Elektrik";
type Transmission = "Manuel" | "Otomatik" | "Yarı Otomatik";

interface FormState {
  brand: string;
  model: string;
  variant: string;
  year: string;
  km: string;
  fuelType: FuelType | "";
  transmission: Transmission | "";
  city: string;
  condition: Condition;
  hasDamage: boolean;
  hasPaintChange: boolean;
  hasMajorService: boolean;
  customerAskingPrice: string;
  targetMarginPct: number;
  quickSale: boolean;
  description: string;
}

interface RedFlag {
  type: string;
  severity: "DUSUK" | "ORTA" | "YUKSEK" | "KRITIK";
  detail: string;
  impactOnPriceTL: number | null;
}

interface BuybackResult {
  emsalSaleValue: number;
  maxBuyPrice: number;
  suggestedOffer: number;
  walkAwayPrice: number;
  expectedMarginTL: number;
  expectedMarginPct: number;
  stockTimeDays: number;
  sellConfidence: number;
  buyScore: number;
  recommendation: "AL" | "PAZARLIK_YAP" | "REDDET";
  redFlags: RedFlag[];
  negotiationTips: string[];
  summary: string;
  rationale: string;
}

interface EmsalListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  city: string;
  askingPrice: number;
  createdAt: string;
}

interface BozdurmaMeta {
  durationMs?: number;
  provider?: string;
  emsalCount?: number | null;
}

const INITIAL: FormState = {
  brand: "",
  model: "",
  variant: "",
  year: "",
  km: "",
  fuelType: "",
  transmission: "",
  city: "",
  condition: "IYI",
  hasDamage: false,
  hasPaintChange: false,
  hasMajorService: false,
  customerAskingPrice: "",
  targetMarginPct: 0.12,
  quickSale: false,
  description: "",
};

export default function BozdurmaPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuybackResult | null>(null);
  const [emsalListings, setEmsalListings] = useState<EmsalListing[]>([]);
  const [meta, setMeta] = useState<BozdurmaMeta | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const year = parseInt(form.year, 10);
    const km = parseInt(form.km, 10);
    if (!form.brand || !form.model || !year || isNaN(km)) {
      toast.error("Marka, model, yıl ve km zorunlu");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        year,
        km,
        condition: form.condition,
        targetMarginPct: form.targetMarginPct,
      };
      if (form.variant.trim()) payload.variant = form.variant.trim();
      if (form.fuelType) payload.fuelType = form.fuelType;
      if (form.transmission) payload.transmission = form.transmission;
      if (form.city.trim()) payload.city = form.city.trim();
      if (form.hasDamage) payload.hasDamage = true;
      if (form.hasPaintChange) payload.hasPaintChange = true;
      if (form.hasMajorService) payload.hasMajorService = true;
      if (form.customerAskingPrice) {
        const p = parseInt(form.customerAskingPrice, 10);
        if (!isNaN(p) && p > 0) payload.customerAskingPrice = p;
      }
      if (form.quickSale) payload.quickSale = true;
      if (form.description.trim()) payload.description = form.description.trim();

      const res = await fetch("/api/bozdurma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Analiz başarısız");
        return;
      }
      setResult(data.buyback);
      setEmsalListings(Array.isArray(data.emsalListings) ? data.emsalListings : []);
      setMeta(data.meta ?? null);
      toast.success("Bozdurma analizi hazır");
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setForm(INITIAL);
    setResult(null);
    setEmsalListings([]);
    setMeta(null);
  }

  return (
    <main className="min-h-dvh bg-bg text-white">
      <nav className="sticky top-0 z-30 backdrop-blur-lg bg-bg/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent2/15 border border-accent2/30 text-accent2 text-[10px] font-bold uppercase tracking-wider">
              <Building2 className="w-3 h-3" aria-hidden strokeWidth={2.5} />
              Galerici
            </span>
          </Link>
          <Link href="/analiz" className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
            <Radar className="w-4 h-4" aria-hidden strokeWidth={2} />
            Normal Analiz
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent2/10 border border-accent2/30 text-accent2 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Galerici Özel · Bozdurma Modu
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Müşteriden araç alırken <br />
            <span className="gradient-text">en fazla ne verirsin?</span>
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl leading-relaxed">
            AI aracı değerler, satış süresini tahmin eder, kâr marjını hesap eder ve sana{" "}
            <strong className="text-white">üst limit, önerilen teklif ve red flag&apos;ler</strong> verir. Pazarlık
            masasına veriyle otur.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
          <form onSubmit={submit} className="card p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marka *" htmlFor="b-brand">
                <input
                  id="b-brand"
                  className="input"
                  placeholder="Toyota"
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  required
                />
              </Field>
              <Field label="Model *" htmlFor="b-model">
                <input
                  id="b-model"
                  className="input"
                  placeholder="Corolla"
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Paket / Versiyon" htmlFor="b-variant">
                <input
                  id="b-variant"
                  className="input"
                  placeholder="1.6 Advance"
                  value={form.variant}
                  onChange={(e) => update("variant", e.target.value)}
                />
              </Field>
              <Field label="Şehir" htmlFor="b-city">
                <input
                  id="b-city"
                  className="input"
                  placeholder="Konya"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Yıl *" htmlFor="b-year">
                <input
                  id="b-year"
                  type="number"
                  inputMode="numeric"
                  className="input"
                  placeholder="2020"
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  required
                />
              </Field>
              <Field label="KM *" htmlFor="b-km">
                <input
                  id="b-km"
                  type="number"
                  inputMode="numeric"
                  className="input"
                  placeholder="87000"
                  value={form.km}
                  onChange={(e) => update("km", e.target.value)}
                  required
                />
              </Field>
              <Field label="Müşterinin istediği (TL)" htmlFor="b-ask">
                <input
                  id="b-ask"
                  type="number"
                  inputMode="numeric"
                  className="input"
                  placeholder="700000"
                  value={form.customerAskingPrice}
                  onChange={(e) => update("customerAskingPrice", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Yakıt" htmlFor="b-fuel">
                <select
                  id="b-fuel"
                  className="input"
                  value={form.fuelType}
                  onChange={(e) => update("fuelType", e.target.value as FuelType)}
                >
                  <option value="">Seçiniz</option>
                  <option value="Benzin">Benzin</option>
                  <option value="Dizel">Dizel</option>
                  <option value="LPG">LPG</option>
                  <option value="Hibrit">Hibrit</option>
                  <option value="Elektrik">Elektrik</option>
                </select>
              </Field>
              <Field label="Vites" htmlFor="b-trans">
                <select
                  id="b-trans"
                  className="input"
                  value={form.transmission}
                  onChange={(e) => update("transmission", e.target.value as Transmission)}
                >
                  <option value="">Seçiniz</option>
                  <option value="Manuel">Manuel</option>
                  <option value="Otomatik">Otomatik</option>
                  <option value="Yarı Otomatik">Yarı Otomatik</option>
                </select>
              </Field>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-300 mb-2">Kondisyon</legend>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { v: "MUKEMMEL", label: "Mükemmel" },
                    { v: "IYI", label: "İyi" },
                    { v: "ORTA", label: "Orta" },
                    { v: "KOTU", label: "Kötü" },
                  ] as { v: Condition; label: string }[]
                ).map((c) => (
                  <button
                    type="button"
                    key={c.v}
                    onClick={() => update("condition", c.v)}
                    aria-pressed={form.condition === c.v}
                    className={`py-2 rounded-lg border text-xs font-semibold transition-colors ${
                      form.condition === c.v
                        ? "bg-accent/15 border-accent/40 text-white"
                        : "bg-panel/60 border-border text-slate-400 hover:text-white"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-slate-300 mb-2">Durum notları</legend>
              <div className="space-y-2">
                <CheckboxRow
                  label="Hasar kaydı var"
                  checked={form.hasDamage}
                  onChange={(v) => update("hasDamage", v)}
                />
                <CheckboxRow
                  label="Boya değişimi var"
                  checked={form.hasPaintChange}
                  onChange={(v) => update("hasPaintChange", v)}
                />
                <CheckboxRow
                  label="Majör tamir / motor revizesi yapılmış"
                  checked={form.hasMajorService}
                  onChange={(v) => update("hasMajorService", v)}
                />
                <CheckboxRow
                  label="Hızlı stok dönüşü istiyorum"
                  checked={form.quickSale}
                  onChange={(v) => update("quickSale", v)}
                />
              </div>
            </fieldset>

            <div>
              <label htmlFor="b-margin" className="block text-sm font-medium text-slate-300 mb-2">
                Hedef kâr marjı:{" "}
                <span className="gradient-text font-black tabular-nums">
                  %{Math.round(form.targetMarginPct * 100)}
                </span>
              </label>
              <input
                id="b-margin"
                type="range"
                min={0.05}
                max={0.25}
                step={0.01}
                value={form.targetMarginPct}
                onChange={(e) => update("targetMarginPct", parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>%5 (agresif)</span>
                <span>%12 (dengeli)</span>
                <span>%25 (muhafazakar)</span>
              </div>
            </div>

            <div>
              <label htmlFor="b-desc" className="block text-sm font-medium text-slate-300 mb-1">
                Müşteri notları / araç açıklaması
              </label>
              <textarea
                id="b-desc"
                className="input min-h-[90px]"
                placeholder="Örn: Tek sahibiyim, motor sessiz, klima soğutuyor, 2 yıl önce kaza yaptı yan panel boyalı…"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={3000}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    AI değerlendiriyor…
                  </>
                ) : (
                  <>
                    Bozdurma analizi yap
                    <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                  </>
                )}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 rounded-lg border border-border bg-panel/60 hover:bg-panel text-sm text-slate-400 hover:text-white"
                >
                  Sıfırla
                </button>
              )}
            </div>
          </form>

          <div>
            {!result && !loading && <EmptyHint />}
            {loading && <LoadingHint />}
            {result && (
              <ResultPanel
                r={result}
                askedPrice={parseInt(form.customerAskingPrice, 10) || undefined}
                emsalListings={emsalListings}
                meta={meta}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none rounded-md py-1.5 px-2 hover:bg-white/5 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border bg-panel text-accent focus-visible:ring-2 focus-visible:ring-accent"
      />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}

function EmptyHint() {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-panel border border-border flex items-center justify-center mb-4">
        <Target className="w-7 h-7 text-slate-500" aria-hidden strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold mb-2">Formu doldur, AI konuşsun</h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
        10 saniyede üst alım limiti, önerilen teklif, stok süresi tahmini, red flag&apos;ler ve
        müşteriyle pazarlık cümleleri önünde olur.
      </p>
    </div>
  );
}

function LoadingHint() {
  return (
    <div className="card p-8 text-center">
      <div className="relative mx-auto w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
      </div>
      <h3 className="text-lg font-bold mb-2">Hesaplanıyor…</h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto">
        Emsal + stok süresi + kâr marjı + red flag sentezi.
      </p>
    </div>
  );
}

function ResultPanel({
  r,
  askedPrice,
  emsalListings = [],
  meta,
}: {
  r: BuybackResult;
  askedPrice?: number;
  emsalListings?: EmsalListing[];
  meta?: BozdurmaMeta | null;
}) {
  const recCfg = {
    AL: { color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.35)", icon: CheckCircle2, label: "AL" },
    PAZARLIK_YAP: {
      color: "#fbbf24",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.35)",
      icon: TrendingDown,
      label: "PAZARLIK YAP",
    },
    REDDET: {
      color: "#f87171",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.35)",
      icon: XCircle,
      label: "REDDET",
    },
  }[r.recommendation];
  const RecIcon = recCfg.icon;

  return (
    <div className="space-y-4">
      <AiDisclaimer
        emsalCount={meta?.emsalCount ?? emsalListings.length}
        durationMs={meta?.durationMs}
        provider={meta?.provider}
      />
      <div
        className="card p-6"
        style={{ background: recCfg.bg, borderColor: recCfg.border }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: recCfg.border, color: recCfg.color }}
          >
            <RecIcon className="w-6 h-6" aria-hidden strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Öneri
            </div>
            <div className="text-2xl font-black tracking-tight" style={{ color: recCfg.color }}>
              {recCfg.label}
            </div>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{r.summary}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Alım fiyatları
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Önerilen teklif (ilk)</div>
            <div className="text-3xl font-black tabular-nums gradient-text">
              {fmt(r.suggestedOffer)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Max alım (üst sınır)</div>
            <div className="text-3xl font-black tabular-nums text-white">{fmt(r.maxBuyPrice)}</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-panel overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-accent to-amber-400"
            style={{ width: "100%" }}
          />
          {askedPrice && askedPrice > 0 && (
            <div
              className="absolute top-[-4px] w-1 h-[18px] bg-red-500"
              style={{
                left: `${Math.min(100, (askedPrice / (r.walkAwayPrice * 1.15)) * 100)}%`,
              }}
              title={`Müşterinin istediği: ${fmt(askedPrice)}`}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
          <span>{fmt(Math.round(r.suggestedOffer * 0.9))}</span>
          <span>Öneri: {fmt(r.suggestedOffer)}</span>
          <span>Üst: {fmt(r.maxBuyPrice)}</span>
        </div>
        {askedPrice && askedPrice > r.walkAwayPrice && (
          <div className="mt-3 flex gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden strokeWidth={2} />
            <span>
              Müşteri {fmt(askedPrice)} istiyor — üst sınırın üstünde. Kâr marjı eriyor. Pazarlığa indir
              ya da yürü.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric
          icon={<DollarSign className="w-4 h-4" aria-hidden strokeWidth={2} />}
          label="Normal satış"
          value={fmt(r.emsalSaleValue)}
          sublabel="Emsal piyasa"
          color="accent"
        />
        <Metric
          icon={<TrendingDown className="w-4 h-4" aria-hidden strokeWidth={2} />}
          label="Hızlı satış"
          value={fmt(Math.round(r.emsalSaleValue * 0.9))}
          sublabel="%10 iskontolu, 7-10 gün"
          color="accent2"
        />
        <Metric
          icon={<TrendingUp className="w-4 h-4" aria-hidden strokeWidth={2} />}
          label="Beklenen kâr"
          value={`${fmt(r.expectedMarginTL)}`}
          sublabel={`%${Math.round(r.expectedMarginPct * 100)}`}
          color={r.expectedMarginTL > 0 ? "emerald" : "red"}
        />
        <Metric
          icon={<Clock className="w-4 h-4" aria-hidden strokeWidth={2} />}
          label="Stok süresi"
          value={`~${r.stockTimeDays} gün`}
          sublabel={`güven %${r.sellConfidence}`}
          color="accent2"
        />
      </div>

      {r.stockTimeDays > 7 && (
        <div className="card p-5 border-slate-700 bg-panel/40">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Stok eritme takvimi
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <TimelineStep
              day="7. gün"
              action="İlanı pin'le, fotoları ve açıklamayı yenile"
              price={fmt(r.emsalSaleValue)}
            />
            <TimelineStep
              day="14. gün"
              action="Fiyatı %4-6 indir, yeni müşteri dalgası başlat"
              price={fmt(Math.round(r.emsalSaleValue * 0.95))}
            />
            <TimelineStep
              day="30. gün"
              action="Hızlı satış moduna geç ya da bozdur — stokta tutmanın maliyeti kârı yiyor"
              price={fmt(Math.round(r.emsalSaleValue * 0.88))}
            />
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Alım fırsat skoru
            </div>
            <div className="text-4xl font-black tabular-nums">
              {r.buyScore} <span className="text-base text-slate-500">/ 100</span>
            </div>
          </div>
          <ScoreRing score={r.buyScore} />
        </div>
      </div>

      {r.redFlags.length > 0 && (
        <div className="card p-6">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" aria-hidden strokeWidth={2.5} />
            Kırmızı bayraklar ({r.redFlags.length})
          </div>
          <div className="space-y-2">
            {r.redFlags.map((f, i) => (
              <RedFlagItem key={i} flag={f} />
            ))}
          </div>
        </div>
      )}

      {r.negotiationTips.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-accent2/5 to-transparent border-accent2/25">
          <div className="text-[11px] uppercase tracking-wider text-accent2 font-semibold mb-3 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
            Müşteriye söyleyebileceğin
          </div>
          <ul className="space-y-2">
            {r.negotiationTips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-200">
                <span className="text-accent2 font-bold shrink-0 tabular-nums">{i + 1}.</span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-5 bg-panel/40">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
          <Info className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          Hesap mantığı
        </div>
        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{r.rationale}</p>
      </div>

      {emsalListings.length > 0 && (
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-1.5">
            <Radar className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Gerçek benzer ilanlar ({emsalListings.length})
          </div>
          <ul className="space-y-2">
            {emsalListings.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/pazaryeri/${l.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-panel/40 hover:bg-panel px-3 py-2 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">
                      {l.brand} {l.model} · {l.year}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {l.km.toLocaleString("tr-TR")} km · {l.city}
                    </div>
                  </div>
                  <div className="text-sm font-bold tabular-nums text-accent shrink-0">
                    {fmt(l.askingPrice)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/yonetici"
        className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white py-2"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden strokeWidth={2} />
        Kurucu paneline dön
      </Link>
    </div>
  );
}

function TimelineStep({ day, action, price }: { day: string; action: string; price: string }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-panel/60 p-3 flex flex-col gap-1">
      <div className="text-[10px] uppercase tracking-wider text-accent font-bold">{day}</div>
      <div className="text-sm text-slate-200 leading-snug">{action}</div>
      <div className="text-xs font-semibold text-white tabular-nums mt-1">{price}</div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  color: "accent" | "accent2" | "emerald" | "red";
}) {
  const palette = {
    accent: "text-accent",
    accent2: "text-accent2",
    emerald: "text-emerald-400",
    red: "text-red-400",
  }[color];
  return (
    <div className="card p-4">
      <div className={`flex items-center gap-2 mb-2 ${palette}`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </span>
      </div>
      <div className={`text-xl font-black tabular-nums ${palette}`}>{value}</div>
      {sublabel && <div className="text-[10px] text-slate-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
    </svg>
  );
}

function RedFlagItem({ flag }: { flag: RedFlag }) {
  const cfg = {
    KRITIK: { color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
    YUKSEK: { color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
    ORTA: { color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
    DUSUK: { color: "#94a3b8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.2)" },
  }[flag.severity];

  return (
    <div
      className="rounded-lg border px-3 py-2.5 flex gap-3"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
        style={{ background: cfg.color }}
        aria-hidden
      />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div className="text-sm font-semibold" style={{ color: cfg.color }}>
            {flag.type.replaceAll("_", " ")}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: cfg.color }}>
            {flag.severity}
          </div>
        </div>
        <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{flag.detail}</div>
        {flag.impactOnPriceTL !== null && flag.impactOnPriceTL > 0 && (
          <div className="text-[11px] text-red-300 mt-1.5 font-semibold">
            − {fmt(flag.impactOnPriceTL)} indirim önerisi
          </div>
        )}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return `${n.toLocaleString("tr-TR")} TL`;
}
