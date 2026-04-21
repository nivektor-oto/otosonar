import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Kayıt ol — OtoSonar" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/hesap");

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">OtoSonar'a katıl</h1>
          <p className="mt-2 text-sm text-neutral-400">
            AI destekli araç analizi için hesap aç.
          </p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
