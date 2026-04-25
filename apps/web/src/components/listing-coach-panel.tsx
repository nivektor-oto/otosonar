"use client";

import { useState } from "react";
import { Sparkles, Loader2, Tag, FileText, BarChart3, AlertCircle, CheckCircle2 } from "lucide-react";

interface CoachResult {
  titleSuggestion: string;
  descriptionTips: string[];
  priceContext: string;
  missingInfo: string[];
  readinessScore: number;
}

export function ListingCoachPanel({ vehicleId }: { vehicleId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchAdvice() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/listing-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data?.error === "rate_limited") {
          setError("Sınıra ulaştın. 10 dakika sonra tekrar dene.");
        } else if (data?.error === "not_dealer") {
          setError("Bu özellik sadece doğrulanmış galericiler için.");
        } else if (data?.error === "ai_unavailable") {
          setError("AI servisi şu an meşgul, az sonra tekrar dene.");
        } else {
          setError("Öneri alınamadı. Lütfen tekrar dene.");
        }
        return;
      }
      setResult(data.result as CoachResult);
    } catch {
      setError("Bağlantı hatası. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result == null
      ? ""
      : result.readinessScore >= 80
      ? "text-emerald-400"
      : result.readinessScore >= 60
      ? "text-amber-400"
      : "text-red-400";
  const scoreLabel =
    result == null
      ? ""
      : result.readinessScore >= 80
      ? "Yayına hazır"
      : result.readinessScore >= 60
      ? "İyileştirilebilir"
      : "Ciddi eksik";

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden strokeWidth={2.5} />
          <h3 className="text-sm font-bold text-white">OtoSonar AI · İlan Koçu</h3>
        </div>
        {!result && (
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden strokeWidth={2.5} />
                Analiz ediliyor…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
                AI Önerisi Al
              </>
            )}
          </button>
        )}
        {result && (
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="rounded-lg border border-emerald-500/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            {loading ? "Yenileniyor…" : "Yenile"}
          </button>
        )}
      </div>

      {!result && !loading && !error && (
        <p className="text-xs text-slate-400">
          Stoktaki bu araç için OtoSonar AI sana satışı hızlandıracak başlık, açıklama ve fiyat önerileri verecek.
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden strokeWidth={2.5} />
          <div>{error}</div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Hazırlık skoru */}
          <div className="rounded-xl border border-border bg-panel/40 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Hazırlık Skoru
              </div>
              <div className={`text-xs font-bold ${scoreColor}`}>{scoreLabel}</div>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className={`text-3xl font-black tabular-nums ${scoreColor}`}>
                {result.readinessScore}
              </div>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.readinessScore >= 80
                      ? "bg-emerald-400"
                      : result.readinessScore >= 60
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${result.readinessScore}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">/100</div>
            </div>
          </div>

          {/* Başlık */}
          <Section icon={<Tag className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />} title="Önerilen Başlık">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm font-semibold text-emerald-100">
              {result.titleSuggestion}
            </div>
          </Section>

          {/* Açıklama tüyoları */}
          <Section
            icon={<FileText className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />}
            title="Açıklama İyileştirmeleri"
          >
            <ul className="space-y-1.5">
              {result.descriptionTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400"
                    aria-hidden
                    strokeWidth={2.5}
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Fiyat bağlamı */}
          <Section
            icon={<BarChart3 className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />}
            title="Fiyatın Pazar Konumu"
          >
            <p className="text-xs leading-relaxed text-slate-200">{result.priceContext}</p>
          </Section>

          {/* Eksik bilgi */}
          {result.missingInfo.length > 0 && (
            <Section
              icon={<AlertCircle className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />}
              title="Eksik Bilgiler"
            >
              <ul className="space-y-1.5">
                {result.missingInfo.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
