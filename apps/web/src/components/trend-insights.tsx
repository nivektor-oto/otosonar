"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

type Confidence = "yuksek" | "orta" | "dusuk";

interface InsightStats {
  totalCount: number;
  recentCount: number;
  previousCount: number;
  recentAvgPrice: number | null;
  previousAvgPrice: number | null;
  pricePctChange: number | null;
  recentMedianKm: number | null;
  dailyAvgPrices: Array<{ date: string; avg: number; count: number }>;
}

interface InsightResult {
  headline: string;
  summary: string;
  factors: string[];
  forecast: string;
  confidence: Confidence;
  stats: InsightStats;
}

const CONFIDENCE_META: Record<Confidence, { label: string; tone: string }> = {
  yuksek: { label: "Yüksek güven", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  orta: { label: "Orta güven", tone: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  dusuk: { label: "Düşük güven", tone: "bg-red-500/15 text-red-300 border-red-500/40" },
};

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

interface TrendInsightsProps {
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  timeWindowDays?: number;
}

export function TrendInsights(props: TrendInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload: Record<string, unknown> = {};
        if (props.brand) payload.brand = props.brand;
        if (props.model) payload.model = props.model;
        if (props.yearMin) payload.yearMin = props.yearMin;
        if (props.yearMax) payload.yearMax = props.yearMax;
        if (props.timeWindowDays) payload.timeWindowDays = props.timeWindowDays;

        const res = await fetch("/api/ai/trend-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          if (res.status === 401) throw new Error("Üyelik gerekli — giriş yap");
          throw new Error(data.error || "Trend özeti alınamadı");
        }
        setResult(data as InsightResult);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInsights();
    return () => {
      cancelled = true;
    };
  }, [props.brand, props.model, props.yearMin, props.yearMax, props.timeWindowDays, reloadKey]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-panel/30 p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-accent" aria-hidden strokeWidth={2.25} />
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            AI Trend Özeti
          </div>
        </div>
        <div className="h-7 w-3/4 bg-neutral-800/60 rounded mb-3" />
        <div className="h-4 w-full bg-neutral-800/60 rounded mb-2" />
        <div className="h-4 w-5/6 bg-neutral-800/60 rounded mb-2" />
        <div className="h-4 w-4/6 bg-neutral-800/60 rounded mb-4" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-neutral-800/60 rounded" />
          <div className="h-16 bg-neutral-800/60 rounded" />
          <div className="h-16 bg-neutral-800/60 rounded" />
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
          OtoSonar AI özet hazırlıyor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" aria-hidden />
          <div className="flex-1">
            <div className="font-semibold text-red-200">AI özet alınamadı</div>
            <div className="text-sm text-red-200/80 mt-1">{error}</div>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-200 hover:text-white"
              type="button"
            >
              <RefreshCw className="w-3 h-3" aria-hidden /> Tekrar dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const trendIcon =
    result.stats.pricePctChange != null && result.stats.pricePctChange < 0 ? (
      <TrendingDown className="w-5 h-5 text-emerald-400" aria-hidden strokeWidth={2.25} />
    ) : (
      <TrendingUp className="w-5 h-5 text-amber-400" aria-hidden strokeWidth={2.25} />
    );

  return (
    <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-transparent to-transparent p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" aria-hidden strokeWidth={2.25} />
          <div className="text-xs uppercase tracking-wider font-semibold text-accent">
            AI Trend Özeti
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CONFIDENCE_META[result.confidence].tone}`}
          >
            {CONFIDENCE_META[result.confidence].label}
          </span>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
          aria-label="Yenile"
          type="button"
        >
          <RefreshCw className="w-3 h-3" aria-hidden /> Yenile
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className="shrink-0">{trendIcon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {result.headline}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat
          label={`Son ${props.timeWindowDays ?? 30} gün`}
          value={`${result.stats.recentCount.toLocaleString("tr-TR")} ilan`}
        />
        <Stat
          label="Ort. fiyat"
          value={result.stats.recentAvgPrice != null ? TL.format(result.stats.recentAvgPrice) : "-"}
          highlight
        />
        <Stat
          label="Önceki dönem"
          value={result.stats.previousAvgPrice != null ? TL.format(result.stats.previousAvgPrice) : "-"}
        />
        <Stat
          label="Değişim"
          value={
            result.stats.pricePctChange != null
              ? `${result.stats.pricePctChange > 0 ? "+" : ""}${result.stats.pricePctChange}%`
              : "-"
          }
          tone={
            result.stats.pricePctChange == null
              ? "neutral"
              : result.stats.pricePctChange > 0
                ? "warn"
                : "good"
          }
        />
      </div>

      {result.factors.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Olası Sebepler
          </div>
          <ul className="space-y-1.5 text-sm">
            {result.factors.map((f, i) => (
              <li
                key={i}
                className="flex gap-2 text-slate-200"
              >
                <span className="text-accent shrink-0 mt-0.5">▸</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-accent mb-1">
          30 Günlük Tahmin
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{result.forecast}</p>
      </div>

      <p className="text-[10px] text-slate-500 text-center">
        OtoSonar AI · Tahmin niteliğindedir, yatırım tavsiyesi değildir.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  tone = "neutral",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "neutral" | "good" | "warn";
}) {
  const valueColor =
    tone === "good"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-amber-300"
        : highlight
          ? "text-white"
          : "text-slate-200";
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-3">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-sm font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}
