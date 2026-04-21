"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";

export default function RoiCalculator() {
  const [carsPerMonth, setCarsPerMonth] = useState(12);
  const [avgProfit, setAvgProfit] = useState(40000);
  const monthlyCost = 1599; // Pro B2B

  const calc = useMemo(() => {
    // AI 1 iyi fırsatta tahmini ek kar = avgProfit'in %15-25
    const opportunitiesPerMonth = Math.max(1, Math.floor(carsPerMonth * 0.2));
    const extraProfit = opportunitiesPerMonth * Math.round(avgProfit * 0.25);
    const netGain = extraProfit - monthlyCost;
    const roi = monthlyCost > 0 ? Math.round((netGain / monthlyCost) * 100) : 0;
    return { opportunitiesPerMonth, extraProfit, netGain, roi };
  }, [carsPerMonth, avgProfit]);

  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            ROI Hesaplayıcı
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Sana <span className="gradient-text">ne kadar kazandıracak?</span>
          </h2>
          <p className="mt-3 text-slate-300">
            İki soruya cevap ver, OtoSonar'ın aylık net kazancını gör.
          </p>
        </div>

        <div className="card grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Ayda kaç araç alıp satıyorsun?
                <span className="float-right text-accent tabular-nums text-lg font-bold">
                  {carsPerMonth}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={carsPerMonth}
                onChange={(e) => setCarsPerMonth(parseInt(e.target.value))}
                className="w-full accent-accent h-2"
                aria-label="Aylık araç sayısı"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 tabular-nums">
                <span>1</span>
                <span>25</span>
                <span>50+</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Araç başı ortalama kar (TL)?
                <span className="float-right text-accent tabular-nums text-lg font-bold">
                  {avgProfit.toLocaleString("tr-TR")}
                </span>
              </label>
              <input
                type="range"
                min={10000}
                max={150000}
                step={5000}
                value={avgProfit}
                onChange={(e) => setAvgProfit(parseInt(e.target.value))}
                className="w-full accent-accent h-2"
                aria-label="Ortalama kar"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 tabular-nums">
                <span>10K</span>
                <span>80K</span>
                <span>150K+</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-border">
              <Calculator className="inline w-3 h-3 mr-1" aria-hidden />
              Hesap: AI her ay araç sayısının %20'sinde ekstra fırsat yakalar,
              her fırsat ortalama karın %25'i kadar ek kazanç sağlar.
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent2/10 border border-accent/30">
              <div className="text-[11px] text-accent uppercase tracking-wider font-bold mb-1">
                Aylık ek kazancın
              </div>
              <div className="text-3xl md:text-4xl font-black tabular-nums text-white">
                {calc.extraProfit.toLocaleString("tr-TR")}{" "}
                <span className="text-base text-slate-300">TL</span>
              </div>
              <div className="text-xs text-slate-300 mt-2">
                {calc.opportunitiesPerMonth} ek fırsat × ortalama{" "}
                {Math.round(avgProfit * 0.25).toLocaleString("tr-TR")} TL
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-panel border border-border">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-slate-400">OtoSonar Pro bedeli</span>
                <span className="font-bold tabular-nums">- 1.599 TL</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Net aylık kazanç
                  </div>
                  <div className="text-2xl font-black tabular-nums text-success flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" aria-hidden />
                    {calc.netGain.toLocaleString("tr-TR")} TL
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    ROI
                  </div>
                  <div className="text-2xl font-black text-accent tabular-nums">
                    {calc.roi}%
                  </div>
                </div>
              </div>
            </div>
            <a
              href="/onboarding"
              className="btn-primary w-full justify-center text-sm"
            >
              Bu kazancı elde et · 14 gün ücretsiz →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
