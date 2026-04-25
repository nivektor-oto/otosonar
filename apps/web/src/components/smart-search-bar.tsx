"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

type SmartFilter = {
  brands?: string[];
  models?: string[];
  yearMin?: number;
  yearMax?: number;
  kmMin?: number;
  kmMax?: number;
  priceMin?: number;
  priceMax?: number;
  cities?: string[];
  damageMax?: string;
};

function buildQueryString(f: SmartFilter, originalQuery: string): string {
  const params = new URLSearchParams();
  // Pazaryeri sayfası `q` ile metin araması yapıyor; marka/modeli oraya yansıt.
  const qParts: string[] = [];
  if (f.brands?.length) qParts.push(...f.brands);
  if (f.models?.length) qParts.push(...f.models);
  const q = qParts.join(" ").trim() || originalQuery;
  if (q) params.set("q", q);

  if (f.yearMin) params.set("yearMin", String(f.yearMin));
  if (f.yearMax) params.set("yearMax", String(f.yearMax));
  if (f.kmMin) params.set("kmMin", String(f.kmMin));
  if (f.kmMax) params.set("kmMax", String(f.kmMax));
  if (f.priceMin) params.set("priceMin", String(f.priceMin));
  if (f.priceMax) params.set("priceMax", String(f.priceMax));
  if (f.cities?.length) params.set("city", f.cities[0]);
  if (f.damageMax) params.set("damageMax", f.damageMax);
  if (f.brands?.length) params.set("brand", f.brands[0]);
  return params.toString();
}

export function SmartSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setError("En az 3 karakter yaz.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data?.error === "rate_limited") {
          setError("Çok hızlı deniyorsun. Biraz bekle.");
        } else if (data?.error === "ai_unavailable") {
          setError("AI servisi şu an meşgul, az sonra tekrar dene.");
        } else {
          setError("Arama dönüştürülemedi. Klasik filtreyi kullanmayı dene.");
        }
        return;
      }
      const qs = buildQueryString((data.filter as SmartFilter) ?? {}, trimmed);
      router.push(qs ? `/pazaryeri?${qs}` : "/pazaryeri");
    } catch {
      setError("Bağlantı hatası. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <form onSubmit={onSubmit} className="space-y-2">
          <label
            htmlFor="smart-search-input"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
            OtoSonar AI ile akıllı arama
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              id="smart-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              maxLength={300}
              placeholder="Doğal dilde ara: '2020 sonrası benzin temiz Toyota İstanbul 700k altı'"
              className="flex-1 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 3}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden strokeWidth={2.5} />
                  Anlıyor…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden strokeWidth={2.5} />
                  AI ile Ara
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}
          <div className="text-[11px] text-slate-500">
            İpucu: yıl, km, fiyat, şehir, hasar durumu hepsi tek cümlede yazılabilir.
          </div>
        </form>
      </div>
    </div>
  );
}
