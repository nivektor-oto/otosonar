import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { GarageGrid } from "./grid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Araçlarım — OtoSonar" };

export default async function GaragePage() {
  if (!isFeatureEnabled("GARAGE_ENABLED")) redirect("/hesap");

  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/arabalarim");

  const vehicles = await prisma.userVehicle.findMany({
    where: { userId: user.id, soldAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-emerald-900/10 to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Garaj
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Araçlarım — <span className="text-emerald-400">muayene, sigorta, MTV hepsi tek yerde</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Her aracını ekle, uyarı günlerini belirle — OtoSonar bitiş tarihi yaklaştığında sana push bildirim gönderir. Galeri stoğundan bağımsız bireysel takip.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            {vehicles.length} aktif araç
          </div>
          <Link
            href="/hesap/arabalarim/ekle"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-600/20"
          >
            + Araç ekle
          </Link>
        </div>

        <GarageGrid
          initial={vehicles.map((v) => ({
            id: v.id,
            plate: v.plate,
            brand: v.brand,
            model: v.model,
            year: v.year,
            variant: v.variant,
            kmCurrent: v.kmCurrent,
            kmLastUpdatedAt: v.kmLastUpdatedAt?.toISOString() ?? null,
            colorHex: v.colorHex,
            fuelType: v.fuelType,
            transmission: v.transmission,
            photoUrl: v.photoUrl,
            inspectionDueAt: v.inspectionDueAt?.toISOString() ?? null,
            inspectionNotifyDaysBefore: v.inspectionNotifyDaysBefore,
            insuranceDueAt: v.insuranceDueAt?.toISOString() ?? null,
            insuranceNotifyDaysBefore: v.insuranceNotifyDaysBefore,
            mtvDueAt: v.mtvDueAt?.toISOString() ?? null,
            mtvNotifyDaysBefore: v.mtvNotifyDaysBefore,
            notes: v.notes,
          }))}
        />
      </div>
    </main>
  );
}
