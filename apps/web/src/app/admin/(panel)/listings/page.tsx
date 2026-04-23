import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, MarketplaceListingStatus } from "@prisma/client";
import { Search, Filter, Flag } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const VALID_STATUSES: MarketplaceListingStatus[] = [
  "DRAFT",
  "ACTIVE",
  "SOLD",
  "WITHDRAWN",
  "EXPIRED",
  "REJECTED",
  "TAKEDOWN",
];

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sellerId?: string;
    reported?: string;
    page?: string;
  }>;
}

export default async function AdminListingsList({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status = sp.status && VALID_STATUSES.includes(sp.status as MarketplaceListingStatus)
    ? (sp.status as MarketplaceListingStatus)
    : null;
  const sellerId = sp.sellerId?.trim() || null;
  const onlyReported = sp.reported === "1";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.MarketplaceListingWhereInput = {};
  if (q) {
    where.OR = [
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  else where.status = { in: ["DRAFT", "ACTIVE"] }; // default: moderation-relevant

  if (sellerId) where.sellerId = sellerId;
  if (onlyReported) where.reportCount = { gt: 0 };

  const [total, listings, pendingCount, reportedCount] = await Promise.all([
    prisma.marketplaceListing.count({ where }),
    prisma.marketplaceListing.findMany({
      where,
      orderBy: [{ reportCount: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.marketplaceListing.count({ where: { status: "DRAFT" } }),
    prisma.marketplaceListing.count({
      where: { reportCount: { gt: 0 }, status: { in: ["ACTIVE", "DRAFT"] } },
    }),
  ]);

  const sellerMap = await loadSellers(listings.map((l) => l.sellerId));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            İlan Moderasyonu
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {total.toLocaleString("tr-TR")} sonuç
          </h1>
          <div className="mt-2 flex gap-4 text-sm text-neutral-400">
            <span>
              Onay bekleyen (DRAFT):{" "}
              <strong className="text-amber-400">{pendingCount}</strong>
            </span>
            <span>
              Şikayetli:{" "}
              <strong className="text-red-400">{reportedCount}</strong>
            </span>
          </div>
        </div>
      </header>

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto] items-center">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Marka, model, şehir, açıklama"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-emerald-500/60 focus:outline-none"
          />
        </label>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Bekleyen + Aktif</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="sellerId"
          defaultValue={sellerId ?? ""}
          placeholder="Satıcı ID"
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm w-40"
        />
        <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            name="reported"
            value="1"
            defaultChecked={onlyReported}
            className="accent-emerald-500"
          />
          Şikayetli
        </label>
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
                <th className="px-4 py-3">Araç</th>
                <th className="px-4 py-3">Şehir / Fiyat</th>
                <th className="px-4 py-3">Satıcı</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Şikayet</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    Filtreye uyan ilan yok.
                  </td>
                </tr>
              ) : (
                listings.map((l) => {
                  const s = sellerMap.get(l.sellerId);
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {l.brand} {l.model}
                        </div>
                        <div className="text-xs text-neutral-500 tabular-nums">
                          {l.year} · {l.km.toLocaleString("tr-TR")} km
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{l.city}</div>
                        <div className="text-xs text-neutral-400 tabular-nums">
                          {formatTL(l.askingPrice)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {s ? (
                          <Link
                            href={`/admin/users/${l.sellerId}`}
                            className="hover:text-emerald-400"
                          >
                            {s.email}
                          </Link>
                        ) : (
                          <span className="text-neutral-500 font-mono">
                            {l.sellerId.slice(0, 8)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusTag status={l.status} />
                      </td>
                      <td className="px-4 py-3">
                        {l.reportCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            <Flag className="h-3 w-3" />
                            {l.reportCount}
                          </span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400 tabular-nums">
                        {l.createdAt.toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/listings/${l.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold"
                        >
                          Moderasyon
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          query={{
            q,
            status: status ?? "",
            sellerId: sellerId ?? "",
            reported: onlyReported ? "1" : "",
          }}
        />
      ) : null}
    </div>
  );
}

async function loadSellers(ids: string[]): Promise<Map<string, { email: string }>> {
  if (ids.length === 0) return new Map();
  const sellers = await prisma.user.findMany({
    where: { id: { in: Array.from(new Set(ids)) } },
    select: { id: true, email: true },
  });
  return new Map(sellers.map((s) => [s.id, { email: s.email }]));
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    SOLD: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    WITHDRAWN: "bg-white/5 text-neutral-400 border-white/10",
    EXPIRED: "bg-white/5 text-neutral-400 border-white/10",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
    TAKEDOWN: "bg-red-500/25 text-red-300 border-red-500/50",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
        map[status] ?? map.WITHDRAWN
      }`}
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
  query: { q: string; status: string; sellerId: string; reported: string };
}) {
  const build = (p: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.status) params.set("status", query.status);
    if (query.sellerId) params.set("sellerId", query.sellerId);
    if (query.reported) params.set("reported", query.reported);
    params.set("page", String(p));
    return `/admin/listings?${params.toString()}`;
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

function formatTL(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}
