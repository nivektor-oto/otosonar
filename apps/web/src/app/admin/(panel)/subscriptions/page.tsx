import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, SubscriptionStatus } from "@prisma/client";
import { Search, Filter, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const VALID_STATUSES: SubscriptionStatus[] = [
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
];

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tier?: string;
    page?: string;
  }>;
}

export default async function AdminSubscriptionsList({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status =
    sp.status && VALID_STATUSES.includes(sp.status as SubscriptionStatus)
      ? (sp.status as SubscriptionStatus)
      : null;
  const tier =
    sp.tier && ["PLUS", "PRO", "MAX"].includes(sp.tier)
      ? (sp.tier as "PLUS" | "PRO" | "MAX")
      : null;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.SubscriptionWhereInput = {};
  if (status) where.status = status;
  if (tier) where.tier = tier;
  if (q) {
    where.user = {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const [total, subs, counts] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: {
          select: { id: true, email: true, fullName: true, customerNumber: true },
        },
      },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const statusCounts = new Map(counts.map((c) => [c.status, c._count.status]));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl">
      <header className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Abonelikler
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          {total.toLocaleString("tr-TR")} kayıt
        </h1>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {VALID_STATUSES.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10"
            >
              <span className="text-neutral-500">{s}:</span>{" "}
              <strong className="text-white tabular-nums">
                {statusCounts.get(s) ?? 0}
              </strong>
            </span>
          ))}
        </div>
      </header>

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] items-center">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Kullanıcı e-posta veya adı"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
          />
        </label>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Tüm durumlar</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="tier"
          defaultValue={tier ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Tüm paketler</option>
          <option value="PLUS">PLUS</option>
          <option value="PRO">PRO</option>
          <option value="MAX">MAX</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm inline-flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Uygula
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-500 bg-black/40 border-b border-white/10">
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Dönem</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Bitiş</th>
                <th className="px-4 py-3">Başlangıç</th>
                <th className="px-4 py-3 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    Filtreye uyan abonelik yok.
                  </td>
                </tr>
              ) : (
                subs.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${s.user.id}`}
                        className="font-semibold hover:text-emerald-400"
                      >
                        {s.user.email}
                      </Link>
                      <div className="text-xs text-neutral-400">
                        {s.user.fullName} · #{s.user.customerNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        <CreditCard className="h-3 w-3" />
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {s.billingPeriod === "MONTHLY" ? "Aylık" : "Yıllık"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusTag status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 tabular-nums">
                      {s.currentPeriodEnd
                        ? s.currentPeriodEnd.toLocaleDateString("tr-TR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 tabular-nums">
                      {s.createdAt.toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/subscriptions/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          query={{ q, status: status ?? "", tier: tier ?? "" }}
        />
      ) : null}
    </div>
  );
}

function StatusTag({ status }: { status: SubscriptionStatus }) {
  const map: Record<SubscriptionStatus, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    TRIAL: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    PAST_DUE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    CANCELED: "bg-red-500/15 text-red-400 border-red-500/30",
    EXPIRED: "bg-white/5 text-neutral-400 border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${map[status]}`}
    >
      {status}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: { q: string; status: string; tier: string };
}) {
  const build = (p: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.status) params.set("status", query.status);
    if (query.tier) params.set("tier", query.tier);
    params.set("page", String(p));
    return `/admin/subscriptions?${params.toString()}`;
  };
  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      <div className="text-neutral-400">
        Sayfa <span className="tabular-nums text-white">{page}</span> / {totalPages}
      </div>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={build(page - 1)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
          >
            ← Önceki
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={build(page + 1)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
          >
            Sonraki →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
