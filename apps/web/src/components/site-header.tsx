import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { LogoMark } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-[#0a0a0f]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={24} />
          <span className="text-lg font-black tracking-tight text-white">OtoSonar</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-neutral-300 md:flex">
          <NavLink href="/analiz">Analiz</NavLink>
          <NavLink href="/bozdurma">Bozdurma</NavLink>
          <NavLink href="/pazar-arastir">Pazar</NavLink>
          <NavLink href="/pazaryeri">Pazaryeri</NavLink>
          <NavLink href="/hasar-tespit">Hasar AI</NavLink>
          <NavLink href="/plaka-oku">Plaka</NavLink>
          <NavLink href="/quiz">Quiz</NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link
              href="/hesap"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-900"
            >
              {user.fullName.split(" ")[0]}
              <span className="ml-2 text-neutral-500">
                OS-{String(user.customerNumber).padStart(6, "0")}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/giris"
                className="rounded-lg px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
              >
                Giriş
              </Link>
              <Link
                href="/kayit"
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
              >
                Kayıt ol
              </Link>
            </>
          )}
        </div>

        <MobileMenu isLoggedIn={!!user} />
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-900 hover:text-white"
    >
      {children}
    </Link>
  );
}
