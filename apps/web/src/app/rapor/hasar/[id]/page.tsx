import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { LogoMark } from "@/components/logo";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

const severityColor: Record<string, string> = {
  YOK: "#10b981",
  HAFIF: "#eab308",
  ORTA: "#f97316",
  AGIR: "#ef4444",
};

type DamageItem = { type: string; location: string; severity: string; description: string };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Hasar Raporu ${id.slice(0, 8)} — OtoSonar` };
}

export default async function DamageReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.damageAnalysis.findUnique({ where: { id } });
  if (!row) return notFound();

  const damages = Array.isArray(row.damagesJson) ? (row.damagesJson as unknown as DamageItem[]) : [];
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com";
  const reportUrl = `${base}/rapor/hasar/${id}`;
  const qrDataUrl = await QRCode.toDataURL(reportUrl, { width: 200, margin: 1, color: { dark: "#0a0a0f", light: "#ffffff" } });

  const dateStr = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(row.createdAt);

  return (
    <main className="min-h-dvh bg-white text-slate-900 print:bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
        <header className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <LogoMark size={32} />
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900">OtoSonar</div>
              <div className="text-xs text-slate-500">AI destekli hasar analiz raporu</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Rapor no</div>
            <div className="font-mono text-sm text-slate-700">{id.slice(0, 12).toUpperCase()}</div>
            <div className="text-[10px] text-slate-400 mt-1">{dateStr}</div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Genel hasar</div>
            <div
              className="mt-2 text-3xl font-black"
              style={{ color: severityColor[row.overallSeverity] ?? "#64748b" }}
            >
              {row.overallSeverity}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Tahmini tamir maliyeti</div>
            <div className="mt-2 text-xl font-black text-slate-900 tabular-nums">
              {TL.format(row.repairEstimateMinTL)} – {TL.format(row.repairEstimateMaxTL)}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Tespit edilen hasarlar ({damages.length})
          </h2>
          {damages.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              Görünür hasar tespit edilmedi.
            </div>
          ) : (
            <div className="space-y-3">
              {damages.map((d, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 p-4 text-sm grid grid-cols-[1fr_auto] gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {d.type} · {d.location}
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{d.description}</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold h-fit"
                    style={{
                      backgroundColor: (severityColor[d.severity] ?? "#64748b") + "20",
                      color: severityColor[d.severity] ?? "#64748b",
                    }}
                  >
                    {d.severity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {row.notes && (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 mb-1">Not</div>
            {row.notes}
          </section>
        )}

        <section className="mt-10 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-center border-t border-slate-200 pt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Rapor QR kodu" className="w-28 h-28 rounded-xl border border-slate-200" />
          <div>
            <div className="text-sm font-bold text-slate-900">Raporu paylaş</div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Bu QR'ı tara veya linki paylaş — rapor internet üzerinden açılır. Telefondan fotoğraf çekip satıcıya da gösterebilirsin.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-500 truncate">{reportUrl}</div>
          </div>
        </section>

        <footer className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <Link href="/hasar-tespit" className="hover:text-slate-900 underline underline-offset-2">
            Yeni hasar tespiti
          </Link>
          <PrintButton />
          <div>OtoSonar · NiVector</div>
        </footer>

        <div className="hidden print:block text-[10px] text-slate-400 mt-8">
          Bu rapor AI yardımcıdır; resmi ekspertiz yerine geçmez. OtoSonar · otosonar.com · {dateStr}
        </div>
      </div>
    </main>
  );
}

