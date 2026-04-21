import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { NewListingForm } from "./form";

export const metadata = { title: "İlan ekle — Pazaryeri" };

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/pazaryeri/ekle");
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Aracını pazaryerine ekle</h1>
        <NewListingForm />
      </div>
    </main>
  );
}
