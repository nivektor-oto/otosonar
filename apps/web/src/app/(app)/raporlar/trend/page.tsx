import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import Link from "next/link";
import { TrendingUp, Lock } from "lucide-react";
import { TrendInsights } from "@/components/trend-insights";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aylık Piyasa Trend Raporu — OtoSonar" };

interface Aggregates {
  totalListings: number;
  avgPrice: number;
  avgKm: number;
  topBrands: Array<{ brand: string; count: number; avgPrice: number }>;
  topCities: Array<{ city: string; count: number }>;
}

export default async function TrendReportPage() {
  const user = await getCurrentUser();
  const latest = await prisma.marketTrendReport.findFirst({
    orderBy: { publishedAt: "desc" },
  });

  const activeSub = user
    ? await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["ACTIVE", "TRIAL"] },
          tier: { in: ["PRO", "MAX"] },
        },
      })
    : null;
  const hasAccess = !!activeSub;

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Trend Raporu
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Aylık Piyasa Raporu</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Türkiye 2. el araç pazarı aylık özeti: en aktif markalar, ortalama fiyat/km eğilimi, şehir hareketleri. Pro + Max paketler için.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {!latest ? (
          <EmptyState />
        ) : !hasAccess ? (
          <Paywall latestPeriod={latest.period} summary={latest.summary} />
        ) : (
          <ReportBody
            period={latest.period}
            title={latest.title}
            summary={latest.summary}
            data={latest.dataJson as unknown as Aggregates}
          />
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-panel/20 p-10 text-center">
      <h2 className="text-lg font-semibold">Henüz yayımlanmış rapor yok</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
        İlk rapor lansman sonrası ilk ayın sonunda yayımlanacak.
      </p>
    </div>
  );
}

function Paywall({ latestPeriod, summary }: { latestPeriod: string; summary: string }) {
  return (
    <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/5 via-accent2/5 to-transparent p-8 text-center">
      <Lock className="w-10 h-10 text-accent mx-auto mb-4" aria-hidden strokeWidth={1.5} />
      <h2 className="text-xl font-bold">
        {latestPeriod} Raporu · Pro ve Max paketlerine özel
      </h2>
      <p className="mt-3 text-sm text-slate-300 max-w-lg mx-auto italic">"{summary}"</p>
      <p className="mt-2 text-xs text-slate-500">Önizleme · Tam rapor için Pro paketine geç</p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Link href="/#pricing" className="btn-primary text-sm">
          Pro paketine geç
        </Link>
        <Link href="/" className="btn-ghost text-sm">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}

function ReportBody({
  period,
  title,
  summary,
  data,
}: {
  period: string;
  title: string;
  summary: string;
  data: Aggregates;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-accent uppercase tracking-wider">
          Dönem · {period}
        </div>
        <h2 className="text-2xl font-bold tracking-tight mt-1">{title}</h2>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">{summary}</p>
      </div>

      <TrendInsights timeWindowDays={30} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Toplam ilan" value={data.totalListings.toLocaleString("tr-TR")} />
        <MetricCard label="Ortalama fiyat" value={`${data.avgPrice.toLocaleString("tr-TR")} TL`} />
        <MetricCard label="Ortalama km" value={`${data.avgKm.toLocaleString("tr-TR")} km`} />
      </div>

      <div className="rounded-2xl border border-border bg-panel/30 p-5">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
          En aktif markalar
        </h3>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500">
            <tr>
              <th className="pb-2 font-semibold">Marka</th>
              <th className="pb-2 font-semibold text-right">İlan</th>
              <th className="pb-2 font-semibold text-right">Ortalama fiyat</th>
            </tr>
          </thead>
          <tbody>
            {data.topBrands.map((b) => (
              <tr key={b.brand} className="border-t border-border/60">
                <td className="py-2 font-semibold text-white">{b.brand}</td>
                <td className="py-2 text-right tabular-nums">{b.count}</td>
                <td className="py-2 text-right tabular-nums text-slate-300">
                  {b.avgPrice.toLocaleString("tr-TR")} TL
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-border bg-panel/30 p-5">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
          En aktif şehirler
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {data.topCities.map((c) => (
            <div key={c.city} className="rounded-lg border border-border bg-bg/60 p-3 text-center">
              <div className="text-sm font-semibold">{c.city}</div>
              <div className="text-[11px] text-slate-400 tabular-nums">{c.count} ilan</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 text-center">
        Veri OtoSonar Pazaryeri'ndeki aktif ilanlardan agregedir. Dışarıdan veri kaynağı kullanılmadı.
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel/40 p-4">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-black tabular-nums text-white">{value}</div>
    </div>
  );
}
