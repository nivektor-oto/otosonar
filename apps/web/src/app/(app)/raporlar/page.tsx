import Link from "next/link";
import { TrendingUp, BarChart3, Lock, ArrowRight } from "lucide-react";

export const metadata = { title: "Raporlar — OtoSonar" };

export default function RaporlarIndexPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            <BarChart3 className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Raporlar
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Pazar hareketlerini, trendleri ve fırsatları tek bakışta gör. Yeni rapor modülleri yakında eklenecek.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/raporlar/trend"
            className="card border-border hover:border-accent/40 transition group flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" aria-hidden strokeWidth={2} />
              </div>
              <ArrowRight
                className="w-4 h-4 text-slate-500 group-hover:text-accent transition"
                aria-hidden
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Trend Raporu</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Aylık piyasa özeti: en aktif markalar, ortalama fiyat ve km eğilimi, şehir hareketleri. Pro ve Max paketlere özel tam içerik.
              </p>
            </div>
          </Link>

          <div
            aria-disabled="true"
            className="card border-border opacity-60 cursor-not-allowed flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-400" aria-hidden strokeWidth={2} />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Yakında
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-300">
                Pazar Zeka Raporu
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Segment bazlı kârlılık, stok devir hızı ve fırsat skorları. Geliştirme aşamasında.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
