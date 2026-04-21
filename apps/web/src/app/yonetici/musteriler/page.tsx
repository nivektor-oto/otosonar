import { redirect } from "next/navigation";
import Link from "next/link";
import { getFounderSession } from "@/lib/founder-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Müşteriler — Yönetici" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const session = await getFounderSession();
  if (!session) redirect("/yonetici/giris");

  const { q = "", type = "" } = await searchParams;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type === "BUYER" || type === "DEALER" || type === "BROKER" || type === "ADMIN") {
    where.userType = type;
  }

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { customerNumber: "desc" },
      take: 200,
      include: {
        _count: { select: { analyses: true } },
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIAL"] } },
          select: { tier: true, status: true },
          take: 1,
        },
      },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { userType: "BUYER" } }),
      prisma.user.count({ where: { userType: "DEALER" } }),
      prisma.user.count({ where: { userType: "BROKER" } }),
    ]),
  ]);

  const [total, buyers, dealers, brokers] = counts;

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-10 text-neutral-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Müşteriler</h1>
            <p className="text-sm text-neutral-400">
              Toplam {total} • {buyers} alıcı • {dealers} galerici • {brokers} broker
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/founder/users-csv"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
            >
              CSV indir
            </a>
            <Link href="/yonetici" className="text-xs text-neutral-500 hover:underline">
              ← Ana panel
            </Link>
          </div>
        </div>

        <form className="flex flex-wrap gap-2" method="GET">
          <input
            name="q"
            defaultValue={q}
            placeholder="E-posta / isim ara"
            className="flex-1 rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm"
          />
          <select
            name="type"
            defaultValue={type}
            className="rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm"
          >
            <option value="">Tüm tipler</option>
            <option value="BUYER">Alıcı</option>
            <option value="DEALER">Galerici</option>
            <option value="BROKER">Broker</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black">
            Ara
          </button>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-[#12121a]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0f] text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Müşteri No</th>
                <th className="px-3 py-2">Ad Soyad</th>
                <th className="px-3 py-2">E-posta</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">Abonelik</th>
                <th className="px-3 py-2">Analiz</th>
                <th className="px-3 py-2">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-neutral-800 hover:bg-[#151522]">
                  <td className="px-3 py-2 font-mono text-xs text-emerald-400">
                    OS-{String(u.customerNumber).padStart(6, "0")}
                  </td>
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2 text-neutral-400">{u.email}</td>
                  <td className="px-3 py-2">{u.userType}</td>
                  <td className="px-3 py-2 text-xs">
                    {u.subscriptions[0]
                      ? `${u.subscriptions[0].tier} (${u.subscriptions[0].status})`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{u._count.analyses}</td>
                  <td className="px-3 py-2 text-xs text-neutral-500">
                    {u.createdAt.toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-neutral-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
