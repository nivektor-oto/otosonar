import { Check, X, Minus } from "lucide-react";

type Cell = "yes" | "no" | "partial" | string;

const rows: { label: string; otosonar: Cell; sahibinden: Cell; arabam: Cell; expertise: Cell }[] = [
  { label: "AI fiyat analizi", otosonar: "%92 doğruluk", sahibinden: "no", arabam: "no", expertise: "no" },
  { label: "Gizli arıza tespiti (metinden)", otosonar: "yes", sahibinden: "no", arabam: "no", expertise: "partial" },
  { label: "Fotoğraftan boya / hasar AI", otosonar: "yes", sahibinden: "no", arabam: "no", expertise: "Fiziksel" },
  { label: "Galerici kâr motoru (stok / marj)", otosonar: "yes", sahibinden: "no", arabam: "no", expertise: "no" },
  { label: "Pazarlık skoru", otosonar: "yes", sahibinden: "no", arabam: "no", expertise: "no" },
  { label: "Analiz süresi", otosonar: "8 saniye", sahibinden: "—", arabam: "—", expertise: "2-3 gün" },
  { label: "Maliyet", otosonar: "99–3.499 ₺/ay", sahibinden: "İlan ücreti", arabam: "İlan ücreti", expertise: "500–2.000 ₺/kez" },
];

function Dot({ v }: { v: Cell }) {
  if (v === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/15 text-accent">
        <Check className="w-3.5 h-3.5" aria-hidden strokeWidth={3} />
      </span>
    );
  }
  if (v === "no") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-400">
        <X className="w-3.5 h-3.5" aria-hidden strokeWidth={3} />
      </span>
    );
  }
  if (v === "partial") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-400">
        <Minus className="w-3.5 h-3.5" aria-hidden strokeWidth={3} />
      </span>
    );
  }
  return <span className="text-xs font-semibold text-slate-200 tabular-nums">{v}</span>;
}

export function CompetitionTable() {
  return (
    <section className="py-20 border-t border-border bg-panel/20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Neden farklıyız
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Diğerleri ilan gösterir, <span className="gradient-text">biz karar verdiririz</span>
          </h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-panel/40">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="border-b border-border bg-panel/60">
              <tr>
                <th className="text-left font-semibold text-slate-300 px-4 py-3">Özellik</th>
                <th className="text-center font-bold text-accent px-3 py-3">OtoSonar</th>
                <th className="text-center font-medium text-slate-400 px-3 py-3">Sahibinden</th>
                <th className="text-center font-medium text-slate-400 px-3 py-3">Arabam</th>
                <th className="text-center font-medium text-slate-400 px-3 py-3">Ekspertiz</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.label}
                  className={i % 2 === 0 ? "bg-transparent" : "bg-panel/20"}
                >
                  <td className="px-4 py-3 text-slate-200 font-medium">{r.label}</td>
                  <td className="px-3 py-3 text-center"><Dot v={r.otosonar} /></td>
                  <td className="px-3 py-3 text-center"><Dot v={r.sahibinden} /></td>
                  <td className="px-3 py-3 text-center"><Dot v={r.arabam} /></td>
                  <td className="px-3 py-3 text-center"><Dot v={r.expertise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">
          Karşılaştırma 2026-04 · Sahibinden.com &amp; Arabam.com bağımsız platformlardır, resmi ortaklığımız yoktur.
        </p>
      </div>
    </section>
  );
}
