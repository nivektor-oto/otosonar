import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { LogoMark } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";

/**
 * OtoSonar app-scope header — Arabam / Sahibinden seviyesinde sade.
 * Logo · 4 link (Analiz, Pazaryeri, Raporlar, Hesap) · CTA.
 * Zemin beyaz, alt border slate — backdrop-blur yok.
 *
 * Mobile UX notu:
 *  - `pt-safe` ile iPhone notch / dinamik status bar'ın üstüne itilmiyor.
 *  - Hamburger buton 48x48 hit-target (Apple HIG 44pt, Material 48dp).
 *  - `sticky top-0 z-50` — chatbot widget z-40, sticky filter bar z-20.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white pt-safe">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark size={24} className="shrink-0" />
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
            OtoSonar
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-slate-700 md:flex">
          <NavLink href="/analiz">Analiz</NavLink>
          <NavLink href="/pazaryeri">Pazaryeri</NavLink>
          <NavLink href="/raporlar">Raporlar</NavLink>
          <NavLink href="/hesap">Hesap</NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link
              href="/hesap"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              {user.fullName.split(" ")[0]}
              <span className="ml-2 text-slate-400">
                OS-{String(user.customerNumber).padStart(6, "0")}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/giris"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                Giriş
              </Link>
              <Link
                href="/kayit"
                className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-400 shadow-sm"
              >
                Ücretsiz Dene
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
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
