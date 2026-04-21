import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Giriş yap — OtoSonar" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/hesap");

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Giriş yap</h1>
          <p className="mt-2 text-sm text-neutral-400">E-postan ile hesabına gir.</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-neutral-500">
          <Link href="/sifremi-unuttum" className="hover:underline">
            Şifremi unuttum
          </Link>
        </p>
      </div>
    </main>
  );
}
