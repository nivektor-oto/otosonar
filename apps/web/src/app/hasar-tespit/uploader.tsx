"use client";

import { useState } from "react";
import { toast } from "sonner";

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

interface DamageResult {
  overallSeverity: "YOK" | "HAFIF" | "ORTA" | "AGIR";
  repairEstimateMinTL: number;
  repairEstimateMaxTL: number;
  damages: Array<{ type: string; location: string; severity: string; description: string }>;
  notes: string;
}

export function DamageUploader() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DamageResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya 5MB'ı aşamaz.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result ?? "");
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1] ?? "";

      setLoading(true);
      try {
        const r = await fetch("/api/damage-detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await r.json();
        if (!r.ok || !data.success) {
          toast.error(data.error === "rate_limited" ? "Günlük limite ulaştın." : "Analiz başarısız.");
          return;
        }
        setResult(data.result);
      } catch {
        toast.error("Ağ hatası.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const severityColor = {
    YOK: "text-emerald-400",
    HAFIF: "text-yellow-400",
    ORTA: "text-orange-400",
    AGIR: "text-red-400",
  } as const;

  return (
    <div className="space-y-6">
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-neutral-700 bg-[#12121a] p-8 text-center transition hover:border-emerald-500">
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onUpload} />
        <div className="text-sm text-neutral-300">
          {loading ? "Analiz ediliyor…" : "Araç fotoğrafı seç"}
        </div>
        <div className="mt-1 text-xs text-neutral-500">JPG, PNG, WebP • Max 5MB</div>
      </label>

      {preview && (
        <img src={preview} alt="Önizleme" className="max-h-96 w-full rounded-xl border border-neutral-800 object-contain" />
      )}

      {result && (
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">Genel durum</div>
              <div className={`text-3xl font-bold ${severityColor[result.overallSeverity]}`}>
                {result.overallSeverity}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-500">Tahmini tamir</div>
              <div className="text-xl font-bold">
                {TL.format(result.repairEstimateMinTL)} – {TL.format(result.repairEstimateMaxTL)}
              </div>
            </div>
          </div>

          {result.damages.length > 0 ? (
            <ul className="space-y-2">
              {result.damages.map((d, i) => (
                <li key={i} className="rounded-lg border border-neutral-800 bg-[#0a0a0f] p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {d.type} • {d.location}
                    </span>
                    <span className={`text-xs ${severityColor[d.severity as keyof typeof severityColor] ?? "text-neutral-400"}`}>
                      {d.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{d.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-emerald-400">Görünür hasar tespit edilmedi.</div>
          )}

          {result.notes && <p className="text-xs text-neutral-400">{result.notes}</p>}
        </div>
      )}
    </div>
  );
}
