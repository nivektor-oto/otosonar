import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Veri Havuzu — OtoSonar Yönetim",
  robots: { index: false, follow: false },
};

export default async function ScraperAdminPage() {
  await requireAdmin();

  const since24h = new Date(Date.now() - 24 * 3600 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const [
    totalListings,
    activeListings,
    droppedListings,
    new24h,
    updated24h,
    bySource,
    byBrandTop,
    queueStats,
    recentRuns,
    recentAlerts,
    historyCount,
  ] = await Promise.all([
    prisma.scrapedListing.count(),
    prisma.scrapedListing.count({ where: { dropped: false } }),
    prisma.scrapedListing.count({ where: { dropped: true } }),
    prisma.scrapedListing.count({
      where: { firstSeenAt: { gte: since24h } },
    }),
    prisma.scrapedListing.count({
      where: { lastSeenAt: { gte: since24h } },
    }),
    prisma.scrapedListing.groupBy({
      by: ["source"],
      _count: { _all: true },
      where: { dropped: false },
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.scrapedListing.groupBy({
      by: ["brand"],
      _count: { _all: true },
      where: { dropped: false },
      orderBy: { _count: { brand: "desc" } },
      take: 15,
    }),
    prisma.scraperJob.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.scraperRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    prisma.dealAlert.findMany({
      orderBy: { computedAt: "desc" },
      take: 10,
      include: {
        listing: {
          select: {
            brand: true,
            model: true,
            year: true,
            km: true,
            sourceUrl: true,
            location: true,
          },
        },
      },
    }),
    prisma.scrapedListingHistory.count({
      where: { observedAt: { gte: since7d } },
    }),
  ]);

  const queueBy = Object.fromEntries(
    queueStats.map((s) => [s.status, s._count._all])
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Veri Havuzu</h1>
        <p className="text-sm text-neutral-400">
          Scraper sağlığı, kuyruk durumu, fırsat tespiti. Canlı pazar verisinin
          omurgası.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aktif ilan"
          value={activeListings.toLocaleString("tr-TR")}
          icon={<Database className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Son 24s yeni"
          value={new24h.toLocaleString("tr-TR")}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Son 24s güncellenen"
          value={updated24h.toLocaleString("tr-TR")}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Dropped"
          value={droppedListings.toLocaleString("tr-TR")}
          icon={<AlertCircle className="h-4 w-4" />}
          muted
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Kaynak dağılımı">
          {bySource.length === 0 ? (
            <EmptyNote label="Henüz scraped veri yok." />
          ) : (
            <ul className="space-y-2">
              {bySource.map((row) => (
                <li
                  key={row.source}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">{row.source}</span>
                  <span className="tabular-nums text-neutral-300">
                    {row._count._all.toLocaleString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Kuyruk durumu">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Bekleyen</span>
              <span className="tabular-nums text-amber-400">
                {(queueBy["pending"] ?? 0).toLocaleString("tr-TR")}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Çalışan</span>
              <span className="tabular-nums text-blue-400">
                {(queueBy["running"] ?? 0).toLocaleString("tr-TR")}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Tamamlanan</span>
              <span className="tabular-nums text-emerald-400">
                {(queueBy["done"] ?? 0).toLocaleString("tr-TR")}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Başarısız</span>
              <span className="tabular-nums text-red-400">
                {(queueBy["failed"] ?? 0).toLocaleString("tr-TR")}
              </span>
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-neutral-500 leading-relaxed">
            Kuyruk GitHub Actions üzerinden 2 saatte bir 8 paralel shard ile
            çekiliyor. Pending şu an ne kadar yüksek olursa olsun, shard'lar
            FOR UPDATE SKIP LOCKED ile paralel tüketiyor.
          </p>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top markalar (aktif)">
          {byBrandTop.length === 0 ? (
            <EmptyNote label="Marka dağılımı henüz oluşmadı." />
          ) : (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {byBrandTop.map((row) => (
                <li
                  key={row.brand}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{row.brand}</span>
                  <span className="tabular-nums text-neutral-400">
                    {row._count._all.toLocaleString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Son scraper çalışmaları">
          {recentRuns.length === 0 ? (
            <EmptyNote label="Henüz scraper run kaydı yok." />
          ) : (
            <ul className="space-y-2 text-xs">
              {recentRuns.map((run) => (
                <li
                  key={run.id}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-500">
                      {run.workerId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        run.completedAt ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {run.completedAt ? "Tamamlandı" : "Çalışıyor"}
                    </span>
                  </div>
                  <div className="mt-1 text-neutral-300">
                    {run.source} · {run.workerType} ·{" "}
                    {run.fetchCount.toLocaleString("tr-TR")} fetch
                    {run.newListings > 0
                      ? ` · +${run.newListings} yeni`
                      : ""}
                    {run.errorCount > 0
                      ? ` · ${run.errorCount} hata`
                      : ""}
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-500">
                    {new Date(run.startedAt).toLocaleString("tr-TR")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section>
        <Panel title="Son fırsatlar (galerici bildirimi)">
          {recentAlerts.length === 0 ? (
            <EmptyNote label="Henüz fırsat bildirimi oluşmadı — emsal havuzu olgunlaşınca otomatik üretilecek." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-500 border-b border-white/10">
                    <th className="py-2 pr-3">Araç</th>
                    <th className="py-2 pr-3">Şehir</th>
                    <th className="py-2 pr-3 text-right">Fiyat</th>
                    <th className="py-2 pr-3 text-right">Medyan</th>
                    <th className="py-2 pr-3 text-right">Tasarruf</th>
                    <th className="py-2 pr-3 text-right">Skor</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-white/5 text-xs"
                    >
                      <td className="py-2 pr-3 font-medium">
                        {a.brandModel} · {a.year}
                        <div className="text-[10px] text-neutral-500">
                          {a.km.toLocaleString("tr-TR")} km
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-neutral-400">
                        {a.listing?.location ?? "-"}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {a.listingPrice.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-neutral-400">
                        {a.marketMedian.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-emerald-400">
                        {a.savings.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        %{Math.round(a.dealScore * 100)}
                      </td>
                      <td className="py-2 pr-3">
                        {a.listing?.sourceUrl && (
                          <Link
                            href={a.listing.sourceUrl}
                            target="_blank"
                            className="text-emerald-400 hover:text-emerald-300 text-[11px]"
                          >
                            Aç →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>

      <section className="flex items-center gap-4 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> 7 günlük history snapshot:{" "}
          {historyCount.toLocaleString("tr-TR")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Toplam
          kayıt (aktif + dropped):{" "}
          {totalListings.toLocaleString("tr-TR")}
        </span>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  muted,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-emerald-500/40 bg-emerald-500/5"
          : muted
            ? "border-neutral-800 bg-neutral-900/40"
            : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-500">
        <span>{label}</span>
        {icon}
      </div>
      <div
        className={`mt-2 text-2xl font-bold tabular-nums ${
          accent ? "text-emerald-400" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function EmptyNote({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-neutral-500">
      {label}
    </div>
  );
}
