import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin();

  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const adminIds = Array.from(new Set(logs.map((l) => l.adminUserId)));
  const admins =
    adminIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, email: true },
        })
      : [];
  const adminMap = new Map(admins.map((a) => [a.id, a.email]));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl">
      <header className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Denetim Kaydı
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
          <ScrollText className="h-7 w-7 text-emerald-400" />
          Admin eylem izi
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Son 200 kayıt. Her admin/moderator işlemi kalıcı olarak işlenir.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-500 bg-black/40 border-b border-white/10">
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Eylem</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">Payload</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                    Henüz denetim kaydı yok.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition align-top"
                  >
                    <td className="px-4 py-3 text-xs text-neutral-400 tabular-nums whitespace-nowrap">
                      {l.createdAt.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {adminMap.get(l.adminUserId) ?? (
                        <span className="font-mono text-neutral-500">
                          {l.adminUserId.slice(0, 10)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {l.targetType ? (
                        <div>
                          <div>{l.targetType}</div>
                          <div className="font-mono text-[10px] text-neutral-500">
                            {l.targetId?.slice(0, 14) ?? "—"}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {l.payload ? (
                        <details>
                          <summary className="cursor-pointer text-[10px] text-neutral-500 hover:text-white">
                            göster
                          </summary>
                          <pre className="mt-1 text-[10px] font-mono text-neutral-400 whitespace-pre-wrap break-all max-w-sm">
                            {JSON.stringify(l.payload, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-neutral-500 font-mono">
                      {l.ip ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
