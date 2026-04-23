import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, ErrorLevel } from "@prisma/client";
import { Search, Filter, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 200;
const VALID_LEVELS: ErrorLevel[] = ["INFO", "WARNING", "ERROR", "FATAL"];

interface PageProps {
  searchParams: Promise<{
    level?: string;
    path?: string;
    fingerprint?: string;
  }>;
}

export default async function AdminErrorsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;

  const level =
    sp.level && VALID_LEVELS.includes(sp.level as ErrorLevel)
      ? (sp.level as ErrorLevel)
      : null;
  const pathFilter = (sp.path ?? "").trim();
  const fingerprint = sp.fingerprint?.trim() || null;

  const where: Prisma.ErrorLogWhereInput = {};
  if (level) where.level = level;
  if (pathFilter) where.path = { contains: pathFilter, mode: "insensitive" };
  if (fingerprint) where.fingerprint = fingerprint;

  const [list, groups, since24hCount] = await Promise.all([
    prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.errorLog.groupBy({
      by: ["fingerprint"],
      where: {
        ...where,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
      },
      _count: { fingerprint: true },
      _max: { message: true, level: true, path: true, createdAt: true },
      orderBy: { _count: { fingerprint: "desc" } },
      take: 10,
    }),
    prisma.errorLog.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
      },
    }),
  ]);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl">
      <header className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Hata Logları
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          {list.length.toLocaleString("tr-TR")} kayıt
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Son {PAGE_SIZE}. Geçtiğimiz 24 saatte toplam{" "}
          <strong className="text-white">{since24hCount}</strong> hata.
        </p>
      </header>

      <form className="mb-6 grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] items-center">
        <select
          name="level"
          defaultValue={level ?? ""}
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
        >
          <option value="">Tüm seviyeler</option>
          {VALID_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="search"
            name="path"
            defaultValue={pathFilter}
            placeholder="Path içerir (örn: /api/analyze)"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm"
          />
        </label>
        <input
          type="text"
          name="fingerprint"
          defaultValue={fingerprint ?? ""}
          placeholder="Fingerprint (tam eşleşme)"
          className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm inline-flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Uygula
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Haftalık gruplar (top 10)
          </h3>
          {groups.length === 0 ? (
            <p className="text-sm text-neutral-500">Grup yok.</p>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li
                  key={g.fingerprint}
                  className="p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <LevelTag level={g._max.level ?? "ERROR"} />
                    <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 tabular-nums">
                      {g._count.fingerprint}x
                    </span>
                  </div>
                  <div className="text-sm truncate">{g._max.message ?? "—"}</div>
                  {g._max.path ? (
                    <div className="mt-1 text-[10px] text-neutral-500 font-mono truncate">
                      {g._max.path}
                    </div>
                  ) : null}
                  <a
                    href={`?fingerprint=${g.fingerprint}`}
                    className="mt-2 inline-block text-[10px] font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Bu grubu filtrele →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-bold mb-4">Son kayıtlar</h3>
          {list.length === 0 ? (
            <p className="text-sm text-neutral-500">Kayıt yok.</p>
          ) : (
            <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {list.map((e) => (
                <li
                  key={e.id}
                  className="p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <LevelTag level={e.level} />
                    <span className="text-neutral-500 tabular-nums">
                      {e.createdAt.toLocaleString("tr-TR")}
                    </span>
                    {e.path ? (
                      <span className="text-neutral-400 font-mono truncate">{e.path}</span>
                    ) : null}
                  </div>
                  <div className="text-sm">{e.message}</div>
                  {e.stack ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[10px] text-neutral-500 hover:text-white">
                        stack
                      </summary>
                      <pre className="mt-1 text-[10px] font-mono text-neutral-400 whitespace-pre-wrap break-all">
                        {e.stack}
                      </pre>
                    </details>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                    {e.fingerprint}
                    {e.userId ? <span>· uid: {e.userId.slice(0, 8)}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function LevelTag({ level }: { level: ErrorLevel }) {
  const map: Record<ErrorLevel, string> = {
    INFO: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    WARNING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ERROR: "bg-red-500/15 text-red-400 border-red-500/30",
    FATAL: "bg-red-500/30 text-red-200 border-red-500/60",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${map[level]}`}
    >
      {level}
    </span>
  );
}
