"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Loader2,
  AlertTriangle,
  Printer,
  Cog,
  Wrench,
  Shield,
  Zap,
  Car,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

type Category = "motor" | "sanziman" | "sasi" | "elektrik" | "ic_disi" | "belge" | "genel";
type Severity = "yuksek" | "orta" | "dusuk";

interface ChecklistItem {
  category: Category;
  title: string;
  why: string;
  severity: Severity;
}

interface VehicleProps {
  brand: string;
  model: string;
  year: number;
  km?: number;
  fuelType?: string;
  transmission?: string;
  damageStatus?: string;
}

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode; tone: string }> = {
  motor: { label: "Motor", icon: <Cog className="w-3 h-3" aria-hidden />, tone: "bg-red-50 text-red-700 border-red-200" },
  sanziman: {
    label: "Şanzıman",
    icon: <Wrench className="w-3 h-3" aria-hidden />,
    tone: "bg-orange-50 text-orange-700 border-orange-200",
  },
  sasi: { label: "Şasi", icon: <Shield className="w-3 h-3" aria-hidden />, tone: "bg-amber-50 text-amber-800 border-amber-200" },
  elektrik: { label: "Elektrik", icon: <Zap className="w-3 h-3" aria-hidden />, tone: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  ic_disi: { label: "İç/Dış", icon: <Car className="w-3 h-3" aria-hidden />, tone: "bg-sky-50 text-sky-700 border-sky-200" },
  belge: { label: "Belge", icon: <FileText className="w-3 h-3" aria-hidden />, tone: "bg-slate-100 text-slate-700 border-slate-200" },
  genel: { label: "Genel", icon: <Eye className="w-3 h-3" aria-hidden />, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const SEVERITY_META: Record<Severity, { label: string; tone: string; dot: string }> = {
  yuksek: { label: "Yüksek", tone: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  orta: { label: "Orta", tone: "bg-amber-50 text-amber-800 border-amber-300", dot: "bg-amber-500" },
  dusuk: { label: "Düşük", tone: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const SEVERITY_RANK: Record<Severity, number> = { yuksek: 0, orta: 1, dusuk: 2 };

export function AiInspectionChecklist({ vehicle }: { vehicle: VehicleProps }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/inspection-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          km: vehicle.km,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          damageStatus: vehicle.damageStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Liste oluşturulamadı");
      }
      const sorted = (data.items as ChecklistItem[]).slice().sort(
        (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
      );
      setItems(sorted);
      setChecked(new Set());
      toast.success(`${sorted.length} maddelik ekspertiz listesi hazır`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      toast.error("Liste oluşturulamadı", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const toggleChecked = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (!items && !loading) {
    return (
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="icon-badge shrink-0">
            <ClipboardCheck className="w-5 h-5" aria-hidden />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 mb-1">
              Bu araca özel ekspertiz listesi
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {vehicle.brand} {vehicle.model} {vehicle.year} için bilinen yaygın sorunlar +
              ekspertiz noktalarını AI hazırlasın. Test sürüşünden önce bu listeyi yanına al.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary"
              type="button"
            >
              <ClipboardCheck className="w-4 h-4" aria-hidden strokeWidth={2.5} />
              Bu araç için ekspertiz listesi
            </button>
            {error && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card text-center py-10" aria-busy="true">
        <Loader2 className="w-8 h-8 mx-auto text-amber-500 animate-spin mb-3" aria-hidden />
        <div className="text-sm font-semibold text-slate-900">Ekspertiz listesi hazırlanıyor</div>
        <div className="text-xs text-slate-500 mt-1">
          {vehicle.brand} {vehicle.model} {vehicle.year} için yaygın sorunlar taranıyor...
        </div>
      </div>
    );
  }

  if (!items) return null;

  return (
    <div className="card print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4 print:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-600" aria-hidden strokeWidth={2.25} />
            <h3 className="font-bold text-slate-900">
              Ekspertiz Check Listesi
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {vehicle.brand} {vehicle.model} {vehicle.year}
            {vehicle.km != null ? ` · ${vehicle.km.toLocaleString("tr-TR")} km` : ""}
            {" · "}
            {items.length} madde · OtoSonar AI
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="btn-ghost text-xs"
            type="button"
            aria-label="Listeyi yazdır veya PDF olarak kaydet"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
            Yazdır / PDF
          </button>
          <button
            onClick={handleGenerate}
            className="btn-ghost text-xs"
            type="button"
            disabled={loading}
          >
            Yenile
          </button>
        </div>
      </div>

      <div className="space-y-2 print:space-y-1">
        {items.map((it, i) => {
          const cat = CATEGORY_META[it.category];
          const sev = SEVERITY_META[it.severity];
          const isChecked = checked.has(i);
          return (
            <div
              key={i}
              className={`border rounded-lg p-3 transition-colors ${
                isChecked
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <label className="flex items-center pt-0.5 cursor-pointer print:hidden">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChecked(i)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    aria-label={`Maddeyi tamamla: ${it.title}`}
                  />
                </label>
                <span className={`hidden print:inline-block w-4 h-4 border border-slate-400 rounded mt-0.5`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cat.tone}`}
                    >
                      {cat.icon}
                      {cat.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sev.tone}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} aria-hidden />
                      {sev.label}
                    </span>
                  </div>
                  <div
                    className={`font-semibold text-sm leading-snug ${
                      isChecked ? "text-slate-500 line-through" : "text-slate-900"
                    }`}
                  >
                    {it.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{it.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 mt-4 print:mt-2">
        Bu liste OtoSonar AI tarafından üretildi. Kontrol için lütfen yetkili ekspertiz servisi tercih
        edin — AI önerileri tahminidir, fiziksel muayene yerine geçmez.
      </p>
    </div>
  );
}
