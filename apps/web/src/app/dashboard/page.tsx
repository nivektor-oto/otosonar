import Link from "next/link";
import { LogoMark } from "@/components/logo";
import {
  Plus,
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Clock,
  MapPin,
  Search,
  Bell,
  BarChart3,
} from "lucide-react";

const stats = [
  {
    label: "Bu ay analiz",
    value: "47",
    change: "+23%",
    changeType: "pos" as const,
    Icon: Target,
  },
  {
    label: "Yakalanan fırsat",
    value: "8",
    change: "+2 dün",
    changeType: "pos" as const,
    Icon: Zap,
  },
  {
    label: "Ortalama kazanç",
    value: "42.500",
    unit: "TL",
    change: "/ araç",
    changeType: "neutral" as const,
    Icon: TrendingUp,
  },
  {
    label: "Aktif uyarı",
    value: "3",
    change: "takipte",
    changeType: "neutral" as const,
    Icon: AlertTriangle,
  },
];

const recentAnalyses = [
  {
    brand: "BMW 5.20",
    year: "2012",
    city: "Konya",
    price: "850.000",
    negotiation: 72,
    when: "12 dk önce",
  },
  {
    brand: "Audi A4",
    year: "2015",
    city: "İstanbul",
    price: "1.120.000",
    negotiation: 45,
    when: "1 sa önce",
  },
  {
    brand: "VW Passat",
    year: "2018",
    city: "Bursa",
    price: "890.000",
    negotiation: 28,
    when: "3 sa önce",
  },
  {
    brand: "Mercedes C180",
    year: "2014",
    city: "Ankara",
    price: "950.000",
    negotiation: 63,
    when: "Dün 18:42",
  },
  {
    brand: "Toyota Corolla",
    year: "2019",
    city: "İzmir",
    price: "680.000",
    negotiation: 81,
    when: "Dün 14:03",
  },
];

const opportunities = [
  {
    brand: "BMW 3.20i",
    year: "2016",
    price: "695.000",
    emsal: "820.000",
    diff: 125000,
    city: "Ankara",
  },
  {
    brand: "Passat 1.6 TDI",
    year: "2017",
    price: "720.000",
    emsal: "830.000",
    diff: 110000,
    city: "İstanbul",
  },
  {
    brand: "Corolla 1.6",
    year: "2020",
    price: "780.000",
    emsal: "870.000",
    diff: 90000,
    city: "Bursa",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <nav className="sticky top-0 z-30 backdrop-blur-lg bg-bg/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/pazar-arastir"
              className="btn-ghost text-sm hidden sm:inline-flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" aria-hidden />
              Pazar Araştır
            </Link>
            <Link
              href="/analiz"
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
              Yeni Analiz
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Kontrol Paneli</h1>
          <p className="text-slate-400 mt-1">
            Hoş geldin — bugün 3 yeni fırsat seni bekliyor.
          </p>
        </header>

        <section
          aria-label="Özet istatistikler"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="card card-interactive animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {s.label}
                </span>
                <s.Icon
                  className="w-4 h-4 text-accent"
                  aria-hidden
                  strokeWidth={2}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">
                  {s.value}
                </span>
                {s.unit && (
                  <span className="text-sm text-slate-400">{s.unit}</span>
                )}
              </div>
              <div
                className={`text-xs mt-1 flex items-center gap-1 ${
                  s.changeType === "pos" ? "text-success" : "text-slate-400"
                }`}
              >
                {s.changeType === "pos" && <ArrowUpRight className="w-3 h-3" aria-hidden />}
                {s.change}
              </div>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold tracking-tight flex items-center gap-2">
                <Search className="w-4 h-4 text-accent" aria-hidden />
                Son Analizler
              </h2>
              <Link
                href="#"
                className="text-xs text-accent hover:text-accent/80 transition"
              >
                Tümü →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 font-semibold">Araç</th>
                    <th className="text-left px-6 py-3 font-semibold">Şehir</th>
                    <th className="text-right px-6 py-3 font-semibold">Fiyat</th>
                    <th className="text-right px-6 py-3 font-semibold">Skor</th>
                    <th className="text-right px-6 py-3 font-semibold">Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnalyses.map((a, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/60 hover:bg-panel transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3 font-medium whitespace-nowrap">
                        {a.brand}{" "}
                        <span className="text-slate-500">· {a.year}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-300">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <MapPin
                            className="w-3 h-3 text-slate-500"
                            aria-hidden
                          />
                          {a.city}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums whitespace-nowrap">
                        {a.price} TL
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${
                            a.negotiation >= 60
                              ? "bg-success/15 text-success"
                              : a.negotiation >= 30
                              ? "bg-warn/15 text-warn"
                              : "bg-slate-500/15 text-slate-400"
                          }`}
                        >
                          {a.negotiation}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500 text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden /> {a.when}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-warn" fill="currentColor" aria-hidden />
                Bugünkü Fırsatlar
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-warn/10 text-warn font-semibold uppercase tracking-wider">
                <Bell className="w-3 h-3" aria-hidden />
                {opportunities.length} yeni
              </span>
            </div>
            <ul>
              {opportunities.map((o, i) => (
                <li
                  key={i}
                  className="px-5 py-4 border-b border-border/60 last:border-b-0 hover:bg-panel transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="font-medium text-sm">
                      {o.brand}{" "}
                      <span className="text-slate-500">· {o.year}</span>
                    </div>
                    <span className="text-xs font-bold text-success tabular-nums whitespace-nowrap">
                      -{(o.diff / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 tabular-nums">
                    {o.price} TL ·{" "}
                    <span className="text-slate-500">emsal {o.emsal}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" aria-hidden /> {o.city}
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-border">
              <Link
                href="/analiz"
                className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" aria-hidden />
                Kendim Analiz Yap
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" aria-hidden />
                Pazar Araştırması — Yeni!
              </h2>
              <p className="text-sm text-slate-400">
                Bir model için 2026 Türkiye pazar durumu, yaygın arızalar,
                alım-satım kar marjı ve yeniden satış projeksiyonu.
              </p>
            </div>
            <Link
              href="/pazar-arastir"
              className="btn-primary text-sm shrink-0 inline-flex items-center gap-2"
            >
              Araştırma Başlat
              <BarChart3 className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
