import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { TradeInDesk } from "./desk";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Trade-in Masası — OtoSonar",
  description: "Galericiler için 2 dakikada plaka sorgu + anlık teklif üretim ekranı.",
};

export default async function TradeInDeskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/bozdurma/masa");

  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) {
    redirect("/hesap/galerici");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { dealerId: dealer.id, status: { in: ["IN_STOCK", "RESERVED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
      variant: true,
      year: true,
      km: true,
      color: true,
      fuelType: true,
    },
  });

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            Trade-in masası
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Müşteri geldi, <span className="gradient-text">2 dakikada teklif</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Plaka veya stok aracından seç → hızlı kozmetik notu → AI anlık teklif üretsin → müşteriye yazdırılabilir çıktı ver.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <TradeInDesk dealerName={dealer.companyName} vehicles={vehicles.map((v) => ({ ...v, km: v.km ?? 0 }))} />

        <div className="mt-6 text-xs text-slate-500">
          <Link href="/bozdurma" className="underline hover:text-white">
            Klasik bozdurma sayfasına git →
          </Link>
        </div>
      </div>
    </main>
  );
}
