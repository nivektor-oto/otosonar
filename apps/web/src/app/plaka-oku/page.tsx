"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function PlatePage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ plate: string | null; confidence: number; region: string | null } | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("5MB üstü dosya yüklenemez.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result ?? "");
      setPreview(dataUrl);
      setLoading(true);
      const base64 = dataUrl.split(",")[1] ?? "";
      try {
        const r = await fetch("/api/plate-ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await r.json();
        if (!r.ok || !data.success) {
          toast.error("Okuma başarısız.");
          return;
        }
        setResult(data.result);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Plaka Oku</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Araç plakası fotoğrafını yükle, AI okusun. (Türkiye plaka formatı desteklenir.)
          </p>
        </div>

        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-neutral-700 bg-[#12121a] p-8 text-center hover:border-emerald-500">
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <div className="text-sm text-neutral-300">{loading ? "Okunuyor…" : "Plaka fotoğrafı seç"}</div>
        </label>

        {preview && <img src={preview} alt="" className="max-h-64 w-full rounded-xl object-contain border border-neutral-800" />}

        {result && (
          <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6 text-center">
            <div className="text-xs text-neutral-500">Okunan plaka</div>
            <div className="mt-2 font-mono text-3xl font-bold tracking-wider">
              {result.plate ?? "Okunamadı"}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Güven: {Math.round(result.confidence * 100)}% {result.region ? `• ${result.region}` : ""}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
