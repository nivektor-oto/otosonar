import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { KvkkPanel } from "./kvkk-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "KVKK & Verilerim — OtoSonar" };

export default async function KvkkPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  return (
    <main className="px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Verilerim & Hesap Yönetimi</h1>
          <p className="text-sm text-neutral-400">
            KVKK (6698 sayılı Kanun) kapsamında verilerinin bir kopyasını alabilir, hesabını kalıcı
            olarak silebilirsin. Silme işlemi geri alınamaz.
          </p>
        </header>
        <KvkkPanel email={user.email} hasPassword={!!user.passwordHash} />
      </div>
    </main>
  );
}
