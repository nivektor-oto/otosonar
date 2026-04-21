import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { PrefsForm } from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Araç Tercihleri — OtoSonar" };

export default async function PrefsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const prefs = await prisma.buyerPreferences.findUnique({ where: { userId: user.id } });
  return (
    <main className="px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Araç Tercihleri</h1>
        <p className="text-sm text-neutral-400">
          Tercihlerini belirt; uygun ilan çıktığında anlık bildirim alacaksın.
        </p>
        <PrefsForm
          initial={
            prefs
              ? {
                  budgetMin: prefs.budgetMin,
                  budgetMax: prefs.budgetMax,
                  brands: prefs.brands,
                  cities: prefs.cities,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
