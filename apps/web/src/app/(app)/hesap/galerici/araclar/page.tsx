import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { VehicleManager } from "./client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stok Araçlarım — OtoSonar" };

export default async function DealerVehiclesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/galerici/araclar");

  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) redirect("/hesap/galerici");

  const vehicles = await prisma.vehicle.findMany({
    where: { dealerId: dealer.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const summary = {
    inStock: vehicles.filter((v) => v.status === "IN_STOCK").length,
    listed: vehicles.filter((v) => v.status === "LISTED").length,
    reserved: vehicles.filter((v) => v.status === "RESERVED").length,
    sold: vehicles.filter((v) => v.status === "SOLD").length,
    totalInvested: vehicles
      .filter((v) => v.status !== "SOLD")
      .reduce((sum, v) => sum + (v.purchasePrice ?? 0) + (v.expenseTotal ?? 0), 0),
  };

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
                Stok yönetimi
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Araçlarım</h1>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Excel yerine OtoSonar. Ruhsat, vize, sigorta, alış, maliyet ve satış geçmişi tek yerde.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <Stat label="Stokta" value={String(summary.inStock)} />
            <Stat label="İlanda" value={String(summary.listed)} />
            <Stat label="Rezerv" value={String(summary.reserved)} />
            <Stat label="Satıldı" value={String(summary.sold)} />
            <Stat
              label="Toplam yatırım"
              value={`${summary.totalInvested.toLocaleString("tr-TR")} ₺`}
              accent
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <VehicleManager
          initialVehicles={vehicles.map((v) => ({
            id: v.id,
            brand: v.brand,
            model: v.model,
            variant: v.variant,
            year: v.year,
            plate: v.plate,
            km: v.km,
            color: v.color,
            fuelType: v.fuelType,
            bodyType: v.bodyType,
            purchasePrice: v.purchasePrice,
            expenseTotal: v.expenseTotal,
            askingPrice: v.askingPrice,
            inspectionDueDate: v.inspectionDueDate?.toISOString() ?? null,
            insurancePolicyEnd: v.insurancePolicyEnd?.toISOString() ?? null,
            status: v.status,
            soldPrice: v.soldPrice,
            createdAt: v.createdAt.toISOString(),
          }))}
        />

        <div className="mt-8 rounded-2xl border border-border bg-panel/30 p-5 text-sm text-slate-400">
          <strong className="text-white">İpucu:</strong>{" "}
          Bu sayfadaki aracı tek tıkla pazaryerine yayınlayabilir veya{" "}
          <Link href="/bozdurma" className="text-accent underline underline-offset-2">
            bozdurma modülüne
          </Link>{" "}
          gönderebilirsin (yakında).
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent ? "border-accent/30 bg-accent/5" : "border-border bg-panel/40"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-black tabular-nums ${
          accent ? "text-accent" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
