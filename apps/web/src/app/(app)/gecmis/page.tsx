import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Geçmişim — OtoSonar" };

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/gecmis");

  const [analyses, damages, plates] = await Promise.all([
    prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { listing: true },
    }),
    prisma.damageAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.plateRecognition.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <main className="px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-2xl font-bold">Geçmişim</h1>
          <p className="text-sm text-neutral-400">
            Yaptığın tüm analizler, hasar tespitleri ve plaka okumaları.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-sm font-semibold">İlan analizleri ({analyses.length})</h2>
          {analyses.length === 0 ? (
            <p className="text-sm text-neutral-500">Henüz analiz yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-[#12121a]">
              {analyses.map((a) => (
                <li key={a.id} className="p-4 text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {a.listing.brand} {a.listing.model} {a.listing.year ?? ""}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {a.listing.city ?? "—"} •{" "}
                        {new Date(a.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </div>
                    <div className="text-right">
                      {a.emsalValue && (
                        <div className="text-sm font-semibold text-emerald-400">
                          Emsal {TL.format(a.emsalValue)}
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-500">
                        {Array.isArray(a.redFlags) ? (a.redFlags as unknown[]).length : 0} red flag
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Hasar analizi ({damages.length})</h2>
          {damages.length === 0 ? (
            <p className="text-sm text-neutral-500">Henüz hasar analizi yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-[#12121a]">
              {damages.map((d) => (
                <li key={d.id} className="p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Genel durum: <span className={severity(d.overallSeverity)}>{d.overallSeverity}</span></div>
                      <div className="text-xs text-neutral-500">
                        {new Date(d.createdAt).toLocaleString("tr-TR")} • {d.damagesJson ? (d.damagesJson as unknown[]).length : 0} bulgu
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      {TL.format(d.repairEstimateMinTL)} – {TL.format(d.repairEstimateMaxTL)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Plaka okuma ({plates.length})</h2>
          {plates.length === 0 ? (
            <p className="text-sm text-neutral-500">Henüz plaka okuma yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-[#12121a]">
              {plates.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <div className="font-mono font-bold tracking-wider">{p.plate ?? "Okunamadı"}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(p.createdAt).toLocaleString("tr-TR")} {p.region ? `• ${p.region}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {Math.round(p.confidence * 100)}% güven
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function severity(s: string): string {
  if (s === "YOK") return "text-emerald-400";
  if (s === "HAFIF") return "text-yellow-400";
  if (s === "ORTA") return "text-orange-400";
  return "text-red-400";
}
