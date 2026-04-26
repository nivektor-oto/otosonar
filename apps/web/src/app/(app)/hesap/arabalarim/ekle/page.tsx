import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import { AddVehicleForm } from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Araç Ekle — OtoSonar" };

export default async function AddVehiclePage() {
  if (!isFeatureEnabled("GARAGE_ENABLED")) redirect("/hesap");
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/arabalarim/ekle");

  // Dealer mı bireysel mi → form'da insurance preset'i ona göre değişsin
  const dealer = await prisma.dealer
    .findUnique({ where: { userId: user.id }, select: { id: true } })
    .catch(() => null);
  const userKind: "dealer" | "individual" = dealer ? "dealer" : "individual";

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/hesap/arabalarim"
            className="text-xs text-neutral-500 hover:text-emerald-400"
          >
            ← Araçlarıma dön
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Yeni araç ekle</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Ruhsat fotoğrafını yükle, alanlar otomatik dolsun. Muayene, sigorta, MTV bitiş tarihlerini belirle — yaklaştığında push bildirim al.
          </p>
        </div>
        <AddVehicleForm userKind={userKind} />
      </div>
    </main>
  );
}
