"use client";

import { useState } from "react";
import {
  MessageCircleQuestion,
  Loader2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  TrendingDown,
  Flag,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Position = "altinda" | "ortalamada" | "ustunde";
type Tab = "questions" | "levers" | "redFlags" | "offer";

interface VehicleProps {
  brand: string;
  model: string;
  year: number;
  km: number;
  askingPrice: number;
  location?: string;
}

interface CoachResult {
  askingVsMarket: Position;
  pricePercentDiff: number;
  questionsToAsk: string[];
  negotiationLevers: string[];
  redFlags: string[];
  suggestedOffer: number;
  market: { median: number | null; p25: number | null; p75: number | null; count: number };
  askingPrice: number;
}

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const POSITION_META: Record<Position, { label: string; tone: string }> = {
  altinda: {
    label: "Pazarın altında",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ortalamada: {
    label: "Pazar ortalamasında",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
  },
  ustunde: {
    label: "Pazarın üstünde",
    tone: "bg-red-50 text-red-700 border-red-200",
  },
};

export function NegotiationCoachPanel({
  listingId,
  vehicle,
  marketMedian,
}: {
  listingId?: string;
  vehicle: VehicleProps;
  marketMedian?: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("offer");

  const handleOpen = async () => {
    setOpen(true);
    if (result || loading) return;
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (listingId) payload.listingId = listingId;
      else payload.vehicle = vehicle;
      if (marketMedian) payload.marketMedian = marketMedian;

      const res = await fetch("/api/ai/negotiation-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Pazarlık koçu açılamadı");
      }
      setResult(data as CoachResult);
      toast.success("Pazarlık koçu hazır");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      toast.error("Koç çağrılamadı", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-gradient-to-r from-amber-500/10 to-amber-500/5 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:from-amber-500/20 hover:to-amber-500/10 transition-colors"
      >
        <Sparkles className="w-4 h-4" aria-hidden strokeWidth={2.5} />
        AI Pazarlık Koçu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="negotiation-coach-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-neutral-800 bg-[#12121a] text-neutral-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-800 bg-[#12121a]/95 backdrop-blur p-4">
              <div className="flex items-center gap-2">
                <MessageCircleQuestion
                  className="w-5 h-5 text-amber-400"
                  aria-hidden
                  strokeWidth={2.25}
                />
                <h3
                  id="negotiation-coach-title"
                  className="font-bold text-white"
                >
                  AI Pazarlık Koçu
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-neutral-800 text-neutral-400"
                aria-label="Kapat"
                type="button"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2
                  className="w-8 h-8 text-amber-400 animate-spin"
                  aria-hidden
                />
                <div className="text-sm font-semibold">
                  Pazarlık koçu hazırlanıyor
                </div>
                <div className="text-xs text-neutral-500">
                  {vehicle.brand} {vehicle.model} {vehicle.year} pazar verisi
                  toplanıyor...
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="m-4 flex gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            {result && !loading && (
              <div className="p-4 sm:p-5 space-y-4">
                {/* Üst hero — suggested offer + market position */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300/80 mb-1">
                    Önerilen ilk teklif
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tabular-nums text-emerald-300">
                    {TL.format(result.suggestedOffer)}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">
                    İlan {TL.format(result.askingPrice)} ·{" "}
                    {result.askingPrice > result.suggestedOffer
                      ? `≈ ${TL.format(result.askingPrice - result.suggestedOffer)} pazarlık marjı`
                      : "rakam ilan fiyatı seviyesinde"}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full border ${POSITION_META[result.askingVsMarket].tone}`}
                    >
                      {POSITION_META[result.askingVsMarket].label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full border border-neutral-700 bg-neutral-800/40 text-neutral-300 tabular-nums">
                      Δ {result.pricePercentDiff > 0 ? "+" : ""}
                      {result.pricePercentDiff.toFixed(1)}%
                    </span>
                    {result.market.count >= 3 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full border border-neutral-700 bg-neutral-800/40 text-neutral-300 tabular-nums">
                        {result.market.count} emsal
                      </span>
                    )}
                  </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 overflow-x-auto rounded-lg bg-neutral-900/50 p-1 text-xs">
                  <TabButton active={tab === "offer"} onClick={() => setTab("offer")} icon={<Wallet className="w-3.5 h-3.5" aria-hidden />} label="Teklif" />
                  <TabButton active={tab === "questions"} onClick={() => setTab("questions")} icon={<HelpCircle className="w-3.5 h-3.5" aria-hidden />} label={`Sorular (${result.questionsToAsk.length})`} />
                  <TabButton active={tab === "levers"} onClick={() => setTab("levers")} icon={<TrendingDown className="w-3.5 h-3.5" aria-hidden />} label={`Argümanlar (${result.negotiationLevers.length})`} />
                  <TabButton active={tab === "redFlags"} onClick={() => setTab("redFlags")} icon={<Flag className="w-3.5 h-3.5" aria-hidden />} label={`Bayraklar (${result.redFlags.length})`} />
                </div>

                <div className="min-h-[120px]">
                  {tab === "offer" && (
                    <div className="space-y-3">
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {result.askingVsMarket === "altinda" &&
                          "İlan fiyatı pazar medyanının altında. Acele etmeden, ekspertiz şartı ile ilerle. Çok ucuza takılma — gizli sorun olabilir."}
                        {result.askingVsMarket === "ortalamada" &&
                          "İlan fiyatı pazar ortalamasına yakın. Klasik %5-8 pazarlık marjı denenebilir, somut argümanlarla aşağı çek."}
                        {result.askingVsMarket === "ustunde" &&
                          "İlan fiyatı pazar medyanının üstünde. Net pazarlık argümanlarına ihtiyacın var — emsal verisini somut göster."}
                      </p>
                      {result.market.median != null && result.market.count >= 3 && (
                        <div className="grid grid-cols-3 gap-2 rounded-lg border border-neutral-800 bg-[#0a0a0f] p-3 text-center text-xs">
                          <Stat label="Pazar p25" value={result.market.p25 != null ? TL.format(result.market.p25) : "-"} />
                          <Stat label="Pazar medyan" value={TL.format(result.market.median)} highlight />
                          <Stat label="Pazar p75" value={result.market.p75 != null ? TL.format(result.market.p75) : "-"} />
                        </div>
                      )}
                      {result.market.count < 3 && (
                        <div className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                          Bu segment için pazar verisi az ({result.market.count} emsal). Önerilen teklif rakamı tahmin payı içeriyor — fiyat aralığını kendin de doğrula.
                        </div>
                      )}
                    </div>
                  )}

                  {tab === "questions" && (
                    <ol className="space-y-2 text-sm">
                      {result.questionsToAsk.map((q, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-lg border border-neutral-800 bg-[#0a0a0f] p-3"
                        >
                          <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tabular-nums">
                            {i + 1}
                          </span>
                          <span className="text-neutral-200 leading-relaxed">{q}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {tab === "levers" && (
                    <ul className="space-y-2 text-sm">
                      {result.negotiationLevers.map((l, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3"
                        >
                          <TrendingDown className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" aria-hidden strokeWidth={2.25} />
                          <span className="text-neutral-200 leading-relaxed">{l}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {tab === "redFlags" && (
                    <ul className="space-y-2 text-sm">
                      {result.redFlags.map((r, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3"
                        >
                          <Flag className="w-4 h-4 mt-0.5 text-red-400 shrink-0" aria-hidden strokeWidth={2.25} />
                          <span className="text-neutral-200 leading-relaxed">{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="text-[10px] text-neutral-500 text-center">
                  OtoSonar AI — Öneriler tahmindir. Kritik kararlardan önce ekspertiz tavsiye edilir.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md font-semibold transition-colors ${
        active
          ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
          : "text-neutral-400 hover:text-neutral-200 border border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
        {label}
      </div>
      <div
        className={`tabular-nums font-bold text-sm mt-0.5 ${highlight ? "text-amber-300" : "text-neutral-200"}`}
      >
        {value}
      </div>
    </div>
  );
}
