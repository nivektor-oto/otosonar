"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Clock, Loader2, Sparkles, Wrench, ArrowRight } from "lucide-react";

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

type Urgency = "NORMAL" | "TAKIP_ET" | "YAKIN_SERVIS" | "ACIL_SERVIS";

interface Cause {
  title: string;
  likelihood: "DÜŞÜK" | "ORTA" | "YÜKSEK";
  reason: string;
  estimatedRepairTL: { min: number; max: number } | null;
}

interface DiagnosisResult {
  urgency: Urgency;
  oneLineVerdict: string;
  possibleCauses: Cause[];
  safetyAdvice: string;
  nextSteps: string[];
  disclaimer: string;
}

const urgencyMeta: Record<Urgency, { label: string; tone: string; desc: string }> = {
  ACIL_SERVIS: { label: "ACİL SERVİS", tone: "text-red-400 border-red-500/40 bg-red-500/10", desc: "Hemen servis — araçla sürmeyi bırak" },
  YAKIN_SERVIS: { label: "YAKIN SERVİS", tone: "text-orange-400 border-orange-500/40 bg-orange-500/10", desc: "3-7 gün içinde servis şart" },
  TAKIP_ET: { label: "TAKİP ET", tone: "text-amber-300 border-amber-500/30 bg-amber-500/10", desc: "2-4 hafta izle, kötüye giderse servis" },
  NORMAL: { label: "NORMAL", tone: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10", desc: "Arıza değil — normal davranış" },
};

export function DiagnoseForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [meta, setMeta] = useState<{ provider?: string; durationMs?: number } | null>(null);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    km: "",
    fuelType: "",
    engineSize: "",
    problem: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brand || !form.model || form.problem.length < 10) {
      toast.error("Marka, model ve arıza tarifini eksiksiz yaz.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        year: form.year ? parseInt(form.year, 10) : undefined,
        km: form.km ? parseInt(form.km.replace(/\D/g, ""), 10) : undefined,
        fuelType: form.fuelType || undefined,
        engineSize: form.engineSize || undefined,
        problem: form.problem,
      };
      const r = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        toast.error(data.error === "rate_limited" ? "Limit aşıldı, 10 dk sonra tekrar dene." : "Teşhis başarısız.");
        return;
      }
      setResult(data.result);
      setMeta(data.meta);
      toast.success(`Teşhis hazır · ${(data.meta.durationMs / 1000).toFixed(1)}s`);
    } catch {
      toast.error("Ağ hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-border bg-panel/40 p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Marka *">
            <input
              className="input"
              placeholder="Örn: Renault"
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              maxLength={40}
            />
          </Field>
          <Field label="Model *">
            <input
              className="input"
              placeholder="Örn: Clio 4"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              maxLength={80}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="Yıl">
            <input
              className="input tabular-nums"
              placeholder="2019"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field label="Km">
            <input
              className="input tabular-nums"
              placeholder="85000"
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
              <option>Benzin</option>
              <option>Dizel</option>
              <option>LPG</option>
              <option>Hibrit</option>
              <option>Elektrik</option>
            </select>
          </Field>
          <Field label="Motor">
            <input
              className="input"
              placeholder="1.5 dCi"
              value={form.engineSize}
              onChange={(e) => update("engineSize", e.target.value)}
              maxLength={20}
            />
          </Field>
        </div>
        <Field label="Arıza tarifi *">
          <textarea
            className="input min-h-[120px]"
            rows={5}
            placeholder="Örn: Son 3 gündür soğuk havada ilk çalıştırmada motordan takırtı sesi geliyor, 2 dakika sonra kayboluyor. Check engine lambası da ara sıra yanıyor."
            value={form.problem}
            onChange={(e) => update("problem", e.target.value)}
            maxLength={2000}
          />
          <div className="text-[11px] text-slate-500 text-right mt-1 tabular-nums">
            {form.problem.length} / 2000
          </div>
        </Field>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Teşhis ediliyor…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden strokeWidth={2.5} /> AI teşhis başlat
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 text-center">
          Ortalama 5-8 saniye sürer · Can güvenliği konuları için her zaman servise git
        </p>
      </form>

      {result && <ResultPanel result={result} meta={meta} />}
    </div>
  );
}

function ResultPanel({ result, meta }: { result: DiagnosisResult; meta: { provider?: string; durationMs?: number } | null }) {
  const u = urgencyMeta[result.urgency];
  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`rounded-2xl border-2 p-5 ${u.tone}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" aria-hidden strokeWidth={2} />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">{u.label}</div>
            <div className="text-lg font-bold mt-0.5">{u.desc}</div>
            <p className="text-sm mt-2 text-slate-200 leading-relaxed">{result.oneLineVerdict}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-panel/40 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Güvenlik tavsiyesi
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed">{result.safetyAdvice}</p>
      </div>

      <div className="rounded-2xl border border-border bg-panel/40 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Olası nedenler ({result.possibleCauses.length})
        </h3>
        <div className="space-y-3">
          {result.possibleCauses.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{c.title}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.likelihood === "YÜKSEK"
                      ? "bg-red-500/20 text-red-300"
                      : c.likelihood === "ORTA"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-slate-500/20 text-slate-300"
                  }`}
                >
                  {c.likelihood}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{c.reason}</p>
              {c.estimatedRepairTL && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-300">
                  <Wrench className="w-3 h-3 text-accent" aria-hidden strokeWidth={2.5} />
                  Tahmini tamir: <strong className="text-white">
                    {TL.format(c.estimatedRepairTL.min)} – {TL.format(c.estimatedRepairTL.max)}
                  </strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-accent2/30 bg-accent2/5 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-accent2 mb-3 flex items-center gap-2">
          <ArrowRight className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          Adım adım ne yap
        </h3>
        <ol className="space-y-2 text-sm text-slate-200">
          {result.nextSteps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent2 font-bold tabular-nums shrink-0">{i + 1}.</span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-[11px] text-slate-500 text-center italic">{result.disclaimer}</p>

      {meta && (
        <div className="text-[11px] text-slate-600 text-center flex items-center justify-center gap-2">
          <Clock className="w-3 h-3" aria-hidden strokeWidth={2} />
          {meta.durationMs ? `${(meta.durationMs / 1000).toFixed(1)}s` : ""} · {meta.provider}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-400 mb-1.5 font-semibold">{label}</div>
      {children}
    </label>
  );
}
