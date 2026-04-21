import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { TotpSection } from "./totp-section";

export const dynamic = "force-dynamic";
export const metadata = { title: "Güvenlik — OtoSonar" };

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  return (
    <main className="px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Güvenlik</h1>
        <p className="text-sm text-neutral-400">
          İki adımlı doğrulama (TOTP) ile hesabını ekstra koru. Galerici hesaplarında önerilir; lansmanda
          zorunlu hale gelir.
        </p>
        <TotpSection enabled={user.totpEnabled} email={user.email} />
      </div>
    </main>
  );
}
