import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/user-auth";
import { resolveUserTier } from "@/lib/paywall";
import { PricingView } from "./pricing-view";

export const metadata: Metadata = {
  title: "Fiyatlar | OtoSonar",
  description:
    "OtoSonar bireysel ve galerici paketleri. Ücretsizden başla, ihtiyacın kadar yükselt. Tüm fiyatlar KDV dahil, yıllık ödemede 2 ay bedava.",
};

export const dynamic = "force-dynamic";

export default async function FiyatlarPage() {
  const user = await getCurrentUser();
  const tier = user ? await resolveUserTier(user.id) : undefined;

  return (
    <main className="min-h-dvh">
      <PricingView currentTier={tier} isAuthenticated={!!user} />
    </main>
  );
}
