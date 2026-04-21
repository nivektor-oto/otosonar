import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { DealerForm } from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Galerici Bilgilerim — OtoSonar" };

export default async function DealerInfoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });

  return (
    <main className="px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Galerici Bilgilerim</h1>
        <p className="text-sm text-neutral-400">
          Pazaryerinde teklif verebilmek, verified rozeti almak ve galerici paketi aktive edebilmek için firma
          bilgilerini tamamla.
        </p>
        <DealerForm
          initial={
            dealer
              ? {
                  companyName: dealer.companyName,
                  handle: dealer.handle,
                  bio: dealer.bio,
                  phone: dealer.phone,
                  cityId: dealer.cityId,
                  address: dealer.address,
                  taxNo: dealer.taxNo,
                  mersisNo: dealer.mersisNo,
                  monthlyVolume: dealer.monthlyVolume,
                  verificationStatus: dealer.verificationStatus,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
