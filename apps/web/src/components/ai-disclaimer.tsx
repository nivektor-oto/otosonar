"use client";

import { useState } from "react";
import { AlertTriangle, Info, ChevronDown } from "lucide-react";

type Props = {
  emsalCount?: number | null;
  dateRange?: { from: string; to: string } | null;
  provider?: string;
  durationMs?: number;
  compact?: boolean;
};

/**
 * AiDisclaimer — honest, always-visible disclosure on AI result pages.
 *
 * The numbers shown above this component are AI estimates, not ground truth.
 * If we have >=5 real comparable listings in our DB we say "AI + N emsal
 * kalibre" (amber). Otherwise we warn that this is AI-only (red).
 */
export function AiDisclaimer({
  emsalCount,
  dateRange,
  provider,
  durationMs,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);

  const count = typeof emsalCount === "number" ? emsalCount : null;
  const hasEnough = count !== null && count >= 5;
  const hasDateRange = !!dateRange && !!dateRange.from && !!dateRange.to;

  const chipClass = hasEnough
    ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
    : "bg-red-500/10 border border-red-500/40 text-red-300";

  const chipIcon = hasEnough ? (
    <Info className="w-3.5 h-3.5 shrink-0" aria-hidden strokeWidth={2.5} />
  ) : (
    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden strokeWidth={2.5} />
  );

  const chipText = hasEnough
    ? `AI + ${count} emsal kayıttan kalibre${
        typeof durationMs === "number" ? ` · ${durationMs}ms` : ""
      }`
    : "Bu sonuç yalnızca AI tahminidir — yeterli gerçek emsal yok. Kritik karar öncesi ekspertiz zorunlu.";

  return (
    <div
      className={`${compact ? "space-y-1" : "space-y-1.5"} w-full`}
      role="note"
      aria-label="AI sonucu güvenilirlik uyarısı"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-start gap-2 px-3 py-1.5 rounded-full text-xs font-semibold leading-snug w-full text-left ${chipClass} hover:brightness-110 transition`}
        aria-expanded={open}
      >
        {chipIcon}
        <span className="flex-1">{chipText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div className="rounded-lg border border-border bg-panel/60 px-3 py-2 text-[11px] text-slate-400 leading-relaxed space-y-1">
          <div>
            <strong className="text-slate-200">Nasıl hesaplandı?</strong>{" "}
            {hasEnough
              ? `AI, girdiğin bilgiler + ${count} adet pazaryerindeki benzer aracı kaynak alarak tahmin üretti.`
              : "AI yalnızca senin girdiğin form bilgileri ve eğitim verisiyle tahmin üretti. Veritabanımızda yeterli benzer kayıt yok."}
          </div>
          {hasDateRange && dateRange && (
            <div>
              <strong className="text-slate-200">Emsal tarih aralığı:</strong>{" "}
              {formatDate(dateRange.from)} – {formatDate(dateRange.to)}
            </div>
          )}
          {provider && (
            <div>
              <strong className="text-slate-200">Sağlayıcı:</strong> {provider}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
        <Info className="w-3 h-3 shrink-0 mt-0.5" aria-hidden strokeWidth={2} />
        <span>Tahmin yanılabilir. Satış / alım öncesi ekspertiz yaptır.</span>
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
