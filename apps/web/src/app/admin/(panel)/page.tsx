import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  Users as UsersIcon,
  Store,
  Activity,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const since24h = new Date(Date.now() - 24 * 3600 * 1000);

  const [
    newUsers24h,
    newListings24h,
    newAnalyses24h,
    activeSubs,
    totalUsers,
    openReports,
    recentErrors,
    topErrors,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: since24h } } }),
    prisma.marketplaceListing.count({ where: { createdAt: { gte: since24h } } }),
    prisma.analysis.count({ where: { createdAt: { gte: since24h } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.marketplaceListing.count({
      where: { reportCount: { gt: 0 }, status: { in: ["ACTIVE", "DRAFT"] } },
    }),
    prisma.errorLog.findMany({
      where: { level: { in: ["ERROR", "FATAL"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.errorLog.groupBy({
      by: ["fingerprint"],
      where: { createdAt: { gte: since24h } },
      _count: { fingerprint: true },
      _max: { message: true, createdAt: true },
      orderBy: { _count: { fingerprint: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Özet
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Bugünün sistemi
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Son 24 saat + aktif metrikler. Tıklanabilir kartlar ilgili sayfaya götürür.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          href="/admin/users"
          icon={<UsersIcon className="h-4 w-4" />}
          label="Yeni kayıt (24s)"
          value={newUsers24h}
          sub={`Toplam aktif: ${totalUsers}`}
          tone="emerald"
        />
        <StatCard
          href="/admin/listings"
          icon={<Store className="h-4 w-4" />}
          label="Yeni ilan (24s)"
          value={newListings24h}
          sub={`Şikayet bekleyen: ${openReports}`}
          tone="cyan"
        />
        <StatCard
          href="/admin"
          icon={<Activity className="h-4 w-4" />}
          label="Analiz (24s)"
          value={newAnalyses24h}
          sub="Platform kullanımı"
          tone="violet"
        />
        <StatCard
          href="/admin/subscriptions"
          icon={<CreditCard className="h-4 w-4" />}
          label="Aktif abone"
          value={activeSubs}
          sub="ACTIVE status"
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Son kritik hatalar
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">En yeni 5 ERROR/FATAL</p>
            </div>
            <Link
              href="/admin/errors"
              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              Tümü <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentErrors.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Sessiz. Hata yok.
            </div>
          ) : (
            <ul className="space-y-2">
              {recentErrors.map((e) => (
                <li
                  key={e.id}
                  className="p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/15 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        e.level === "FATAL"
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {e.level}
                    </span>
                    <span className="text-[10px] text-neutral-500 tabular-nums">
                      {formatRelative(e.createdAt)}
                    </span>
                    {e.path ? (
                      <span className="text-[10px] text-neutral-400 font-mono truncate">
                        {e.path}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm truncate">{e.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold">Son 24s tekrarlayan hata grupları</h2>
              <p className="text-xs text-neutral-500 mt-0.5">fingerprint bazlı</p>
            </div>
          </div>
          {topErrors.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Tekrar eden hata yok.
            </div>
          ) : (
            <ul className="space-y-2">
              {topErrors.map((g) => (
                <li
                  key={g.fingerprint}
                  className="p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm truncate">{g._max.message ?? "—"}</span>
                    <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 tabular-nums">
                      {g._count.fingerprint}x
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-500 font-mono">
                    {g.fingerprint}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  href,
  icon,
  label,
  value,
  sub,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  tone: "emerald" | "cyan" | "violet" | "amber";
}) {
  const toneClass = {
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
    cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400",
    violet: "from-violet-500/10 to-transparent border-violet-500/20 text-violet-400",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400",
  }[tone];
  return (
    <Link
      href={href}
      className={`rounded-2xl border bg-gradient-to-br ${toneClass} p-5 hover:brightness-110 transition group`}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-black text-white tabular-nums">
        {formatNumber(value)}
      </div>
      <div className="mt-1 text-xs text-neutral-400">{sub}</div>
    </Link>
  );
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  const days = Math.floor(h / 24);
  return `${days}g önce`;
}
