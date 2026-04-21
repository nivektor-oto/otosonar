import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { AlertsClient } from "./client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fiyat Alarmlarım — OtoSonar" };

export default async function AlertsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/alarmlarim");
  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            Fiyat Alarmı
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Aradığın araç <span className="gradient-text">yüklenir yüklenmez</span> haber al
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Marka + model + yıl + max fiyat tanımla — pazaryerine eşleşen bir ilan girdiği an sana push bildirim gider. En fazla 10 aktif alarm.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <AlertsClient
          initial={alerts.map((a) => ({
            id: a.id,
            label: a.label,
            brand: a.brand,
            model: a.model,
            yearMin: a.yearMin,
            yearMax: a.yearMax,
            priceMax: a.priceMax,
            cityFilter: a.cityFilter,
            active: a.active,
            lastTriggeredAt: a.lastTriggeredAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </main>
  );
}
