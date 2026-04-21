import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Medal, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Davet Sıralaması — OtoSonar" };

export default async function ReferralLeaderboardPage() {
  const codes = await prisma.referralCode.findMany({
    where: { usesCount: { gt: 0 } },
    orderBy: { usesCount: "desc" },
    take: 20,
  });
  const owners = codes.length
    ? await prisma.user.findMany({
        where: { id: { in: codes.map((c) => c.ownerId) } },
        select: { id: true, fullName: true, customerNumber: true },
      })
    : [];
  const byId = new Map(owners.map((o) => [o.id, o]));

  const rows = codes.map((c, i) => {
    const owner = byId.get(c.ownerId);
    return {
      rank: i + 1,
      initials: owner ? maskName(owner.fullName) : "—",
      customerNumber: owner ? `OS-${String(owner.customerNumber).padStart(6, "0")}` : "",
      uses: c.usesCount,
    };
  });

  const totalDavet = rows.reduce((s, r) => s + r.uses, 0);

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/10 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Link
            href="/davet"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Davet sayfama dön
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            <Trophy className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Liderlik
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            En çok davet edenler
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Topluluğumuzu büyüten 20 kişi. Her davet edilen arkadaşa +30 gün Plus. Sen de top 20'ye girmek istiyorsan arkadaşlarını davet et.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300">
            <strong className="text-accent text-base">{totalDavet}</strong>
            toplam doğrulanmış davet
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-panel/20 p-10 text-center">
            <p className="text-sm text-slate-400">
              Henüz doğrulanmış davet yok. İlk olmak için{" "}
              <Link href="/davet" className="text-accent underline underline-offset-2">
                linkini paylaş
              </Link>.
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.customerNumber}
                className={`rounded-2xl border p-4 flex items-center gap-4 ${
                  r.rank === 1
                    ? "border-amber-400/40 bg-amber-500/10"
                    : r.rank === 2
                    ? "border-slate-300/30 bg-slate-400/5"
                    : r.rank === 3
                    ? "border-orange-600/40 bg-orange-500/10"
                    : "border-border bg-panel/40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    r.rank === 1
                      ? "bg-amber-400 text-black"
                      : r.rank === 2
                      ? "bg-slate-300 text-black"
                      : r.rank === 3
                      ? "bg-orange-500 text-black"
                      : "bg-panel text-slate-400 border border-border"
                  }`}
                >
                  {r.rank <= 3 ? <Medal className="w-4 h-4" aria-hidden strokeWidth={2.5} /> : r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{r.initials}</div>
                  <div className="text-[10px] font-mono text-slate-500">{r.customerNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black tabular-nums text-accent">{r.uses}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    davet
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6 text-center">
          <h2 className="text-lg font-bold">Listede görmek ister misin?</h2>
          <p className="mt-2 text-sm text-slate-300">
            Davet linkini paylaş, arkadaşın kayıt olsun — sıralamada yukarı çık.
          </p>
          <Link href="/davet" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
            Davet linkim
          </Link>
        </div>
      </div>
    </main>
  );
}

function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts
    .map((p, i) => {
      const head = p.charAt(0).toUpperCase();
      if (i === 0) return `${head}${p.length > 1 ? p.charAt(1).toLowerCase() : ""}.`;
      return `${head}.`;
    })
    .join(" ");
}
