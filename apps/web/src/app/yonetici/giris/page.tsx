import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { FounderLoginForm } from "@/components/founder-login-form";
import { getFounderSession } from "@/lib/founder-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kurucu Girişi — OtoSonar" };

export default async function YoneticiGiris() {
  const session = await getFounderSession();
  if (session) redirect("/yonetici");

  return (
    <main className="min-h-screen bg-bg text-white flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            Ana sayfa
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-accent/20 border border-amber-500/30 flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black">Kurucu Girişi</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sınırsız erişim paneline giriş yap.
            </p>
          </div>
          <div className="card p-6">
            <FounderLoginForm />
          </div>
          <p className="mt-6 text-xs text-slate-500 text-center">
            Bu panel sadece OtoSonar kurucusu içindir. Yanlış 3 giriş denemesi sonrası IP 15 dakika
            banlanır (lansmanda aktif).
          </p>
        </div>
      </section>
    </main>
  );
}
