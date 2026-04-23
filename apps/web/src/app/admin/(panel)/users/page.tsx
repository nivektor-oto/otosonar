import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Search, Filter, ShieldCheck, Ban, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    userType?: string;
    active?: string;
    page?: string;
  }>;
}

export default async function AdminUsersList({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const role = sp.role && ["USER", "ADMIN", "MODERATOR"].includes(sp.role) ? sp.role : null;
  const userType =
    sp.userType && ["BUYER", "DEALER", "BROKER", "ADMIN"].includes(sp.userType)
      ? (sp.userType as "BUYER" | "DEALER" | "BROKER" | "ADMIN")
      : null;
  const activeFilter = sp.active === "disabled" ? "disabled" : sp.active === "active" ? "active" : null;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      ...(Number.isFinite(Number(q)) ? [{ customerNumber: Number(q) }] : []),
    ];
  }
  if (role) where.role = role;
  if (userType) where.userType = userType;
  if (activeFilter === "disabled") where.disabledAt = { not: null };
  if (activeFilter === "active") where.disabledAt = null;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        customerNumber: true,
        email: true,
        fullName: true,
        userType: true,
        role: true,
        disabledAt: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            Kullanıcılar
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {total.toLocaleString("tr-TR")} kayıt
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Arama, rol/tip filtresi, askıya alma, terfi, soft delete.
          </p>
        </div>
      </header>

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto] items-center">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="E-posta, ad-soyad veya müşteri no"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-emerald-500/60 focus:outline-none"
          />
        </label>
        <select
          name="role"
          defaultValue={role ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Tüm roller</option>
          <option value="USER">USER</option>
          <option value="MODERATOR">MODERATOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          name="userType"
          defaultValue={userType ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Tüm tipler</option>
          <option value="BUYER">Alıcı</option>
          <option value="DEALER">Galerici</option>
          <option value="BROKER">Komisyoncu</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          name="active"
          defaultValue={activeFilter ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Durum: hepsi</option>
          <option value="active">Aktif</option>
          <option value="disabled">Askıda</option>
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
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">E-posta / Ad</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Kayıt</th>
                <th className="px-4 py-3 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    Filtreye uyan kayıt yok.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition"
                  >
                    <td className="px-4 py-3 tabular-nums text-neutral-500">
                      #{u.customerNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{u.email}</div>
                      <div className="text-xs text-neutral-400">{u.fullName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{turkishUserType(u.userType)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      {u.disabledAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                          <Ban className="h-3 w-3" /> Askıda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <UserCheck className="h-3 w-3" /> Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 tabular-nums">
                      {u.createdAt.toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
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
          query={{ q, role: role ?? "", userType: userType ?? "", active: activeFilter ?? "" }}
        />
      ) : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-300">
      {children}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <ShieldCheck className="h-3 w-3" /> Admin
      </span>
    );
  }
  if (role === "MODERATOR") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
        <ShieldCheck className="h-3 w-3" /> Moderator
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-neutral-400">
      Kullanıcı
    </span>
  );
}

function turkishUserType(t: string): string {
  if (t === "BUYER") return "Alıcı";
  if (t === "DEALER") return "Galerici";
  if (t === "BROKER") return "Komisyoncu";
  if (t === "ADMIN") return "Admin";
  return t;
}

function Pagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: { q: string; role: string; userType: string; active: string };
}) {
  const build = (p: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.role) params.set("role", query.role);
    if (query.userType) params.set("userType", query.userType);
    if (query.active) params.set("active", query.active);
    params.set("page", String(p));
    return `/admin/users?${params.toString()}`;
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
