import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { BootstrapForm } from "./bootstrap-form";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "İlk yönetici — OtoSonar",
  robots: { index: false, follow: false },
};

export default async function AdminBootstrapPage() {
  // KVKK 6698 m.12/5 — endpoint default fail-closed; insan
  // BOOTSTRAP_ENABLED=true geçici set ettiği bootstrap penceresi dışında 404.
  if (process.env.BOOTSTRAP_ENABLED !== "true") notFound();
  // Defense-in-depth: middleware matcher anomalisi veya stale module cache
  // halinde sayfa kendi başına da gate uygulasın. Fail-closed.
  if (!isFeatureEnabled("ADMIN_PANEL_ENABLED")) notFound();

  const adminCount = await prisma.user.count({
    where: { role: "ADMIN", deletedAt: null },
  });
  if (adminCount > 0) notFound();

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-[#e5e7eb] grid place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black">İlk yönetici hesabı</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sistemde henüz ADMIN yok. Bu form bir kez çalışır — kayıttan sonra
            bootstrap devre dışı kalır.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <BootstrapForm />
        </div>

        <p className="mt-4 text-[11px] text-neutral-500 text-center leading-relaxed">
          Bu sayfa yalnızca sistem ilk kurulduğunda, hiç yönetici yokken erişilebilir.
          İşlem başarılı olursa otomatik olarak yönetici paneline yönlendirilirsin.
        </p>
      </div>
    </main>
  );
}
