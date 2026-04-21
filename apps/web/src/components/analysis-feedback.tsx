"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Minus, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

type Outcome = "BOUGHT" | "SKIPPED" | "UNDECIDED";
type Accuracy = "CORRECT" | "WRONG" | "PARTIAL";

interface Props {
  feedbackId: string | null;
}

export function AnalysisFeedback({ feedbackId }: Props) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [accuracy, setAccuracy] = useState<Accuracy | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!feedbackId) {
    return (
      <div className="card border-slate-700 bg-panel/20">
        <h3 className="font-semibold text-sm mb-1">Rapor doğru mu çıktı?</h3>
        <p className="text-xs text-slate-400">
          Giriş yaparsan feedback verebilir ve modelimizi iyileştirmemize yardımcı olursun.
        </p>
      </div>
    );
  }

  const submit = async (payload: { outcome?: Outcome; accuracy?: Accuracy }) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/analyze/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "feedback_fail");
      toast.success("Teşekkürler — feedback alındı");
      if (payload.outcome) setOutcome(payload.outcome);
      if (payload.accuracy) setAccuracy(payload.accuracy);
      if ((payload.outcome || outcome) && (payload.accuracy || accuracy)) {
        setDone(true);
      }
    } catch (e) {
      toast.error("Feedback kaydedilemedi", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="card border-accent/30 bg-accent/5">
        <div className="flex items-center gap-2 text-accent font-semibold text-sm">
          <Check className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          Feedback kaydedildi — teşekkürler, model senin verinle öğreniyor.
        </div>
      </div>
    );
  }

  return (
    <div className="card border-slate-700 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-2">Bu aracı aldın mı?</h3>
        <div className="grid grid-cols-3 gap-2">
          <OutcomeButton
            active={outcome === "BOUGHT"}
            onClick={() => submit({ outcome: "BOUGHT" })}
            icon={<Check className="w-4 h-4" aria-hidden strokeWidth={2.5} />}
            label="Aldım"
            disabled={busy}
          />
          <OutcomeButton
            active={outcome === "SKIPPED"}
            onClick={() => submit({ outcome: "SKIPPED" })}
            icon={<X className="w-4 h-4" aria-hidden strokeWidth={2.5} />}
            label="Vazgeçtim"
            disabled={busy}
          />
          <OutcomeButton
            active={outcome === "UNDECIDED"}
            onClick={() => submit({ outcome: "UNDECIDED" })}
            icon={<Minus className="w-4 h-4" aria-hidden strokeWidth={2.5} />}
            label="Kararsızım"
            disabled={busy}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Rapor doğru çıktı mı?</h3>
        <div className="grid grid-cols-3 gap-2">
          <OutcomeButton
            active={accuracy === "CORRECT"}
            onClick={() => submit({ accuracy: "CORRECT" })}
            icon={<ThumbsUp className="w-4 h-4" aria-hidden strokeWidth={2.5} />}
            label="Doğru"
            disabled={busy}
          />
          <OutcomeButton
            active={accuracy === "PARTIAL"}
            onClick={() => submit({ accuracy: "PARTIAL" })}
            icon={<Minus className="w-4 h-4" aria-hidden strokeWidth={2.5} />}
            label="Kısmen"
            disabled={busy}
          />
          <OutcomeButton
            active={accuracy === "WRONG"}
            onClick={() => submit({ accuracy: "WRONG" })}
            icon={<ThumbsDown className="w-4 h-4" aria-hidden strokeWidth={2.5} />}
            label="Yanlış"
            disabled={busy}
          />
        </div>
      </div>

      {busy && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
          Kaydediliyor...
        </div>
      )}
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Verdiğin feedback anonim modellerimizi eğitmek için kullanılır. Hiçbir şekilde paylaşılmaz.
      </p>
    </div>
  );
}

function OutcomeButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition border ${
        active
          ? "bg-accent/15 border-accent/40 text-accent"
          : "bg-panel/40 border-border text-slate-300 hover:text-white hover:border-slate-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}
