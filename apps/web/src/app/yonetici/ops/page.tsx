import { redirect } from "next/navigation";
import Link from "next/link";
import { getFounderSession } from "@/lib/founder-auth";
import { prisma } from "@/lib/prisma";
import { topRiskUsers } from "@/lib/churn";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ops — Yönetici" };

export default async function OpsPage() {
  const session = await getFounderSession();
  if (!session) redirect("/yonetici/giris");

  const [
    userCount,
    dealerCount,
    activeSubCount,
    pendingPayments,
    recentErrors,
    topErrors,
    todayEvents,
    activeListings,
    churn,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { userType: "DEALER" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.paymentIntent.count({ where: { status: "PENDING" } }),
    prisma.errorLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.errorLog.groupBy({
      by: ["fingerprint"],
      _count: { fingerprint: true },
      orderBy: { _count: { fingerprint: "desc" } },
      take: 5,
    }),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
    }),
    prisma.marketplaceListing.count({ where: { status: "ACTIVE" } }),
    topRiskUsers(20),
  ]);

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-10 text-neutral-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Operasyon Paneli</h1>
          <Link href="/yonetici" className="text-xs text-neutral-500 hover:underline">
            ← Ana panel
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Kayıtlı kullanıcı" value={String(userCount)} />
          <Stat label="Galerici" value={String(dealerCount)} />
          <Stat label="Aktif abonelik" value={String(activeSubCount)} />
          <Stat label="Bekleyen ödeme" value={String(pendingPayments)} />
          <Stat label="24h event" value={String(todayEvents)} />
          <Stat label="Aktif ilan" value={String(activeListings)} />
          <Stat label="Son 20 hata" value={String(recentErrors.length)} />
          <Stat label="Risk altı" value={String(churn.length)} tone="danger" />
        </div>

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="mb-3 text-sm font-semibold">En sık 5 hata</h2>
          {topErrors.length === 0 ? (
            <p className="text-sm text-neutral-500">Hata yok — tertemiz.</p>
          ) : (
            <ul className="space-y-2">
              {topErrors.map((e) => (
                <li key={e.fingerprint} className="flex items-center justify-between text-sm">
                  <code className="text-xs text-neutral-400">{e.fingerprint}</code>
                  <span className="font-semibold text-red-400">{e._count.fingerprint}x</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="mb-3 text-sm font-semibold">Son hatalar (20)</h2>
          {recentErrors.length === 0 ? (
            <p className="text-sm text-neutral-500">—</p>
          ) : (
            <ul className="divide-y divide-neutral-800 text-sm">
              {recentErrors.map((e) => (
                <li key={e.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className={e.level === "FATAL" ? "text-red-500" : e.level === "WARNING" ? "text-yellow-400" : "text-red-400"}>
                      [{e.level}] {e.path ?? "—"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(e.createdAt).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-400">{e.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="mb-3 text-sm font-semibold">Churn riski yüksek (&gt; 0.3)</h2>
          {churn.length === 0 ? (
            <p className="text-sm text-neutral-500">Yok. Takip ediyoruz.</p>
          ) : (
            <ul className="divide-y divide-neutral-800 text-sm">
              {churn.map((c) => (
                <li key={c.userId} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{c.email}</div>
                    <div className="text-xs text-neutral-500">{c.factors.join(" • ")}</div>
                  </div>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
                    {Math.round(c.score * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "danger"
          ? "border-red-700/40 bg-red-900/10"
          : "border-neutral-800 bg-[#12121a]"
      }`}
    >
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${tone === "danger" ? "text-red-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}
