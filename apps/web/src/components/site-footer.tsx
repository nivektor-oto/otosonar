import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} NiVector — OtoSonar</span>
          <nav className="flex flex-wrap gap-4">
            <Link href="/kvkk" className="hover:text-slate-900">KVKK</Link>
            <Link href="/gizlilik" className="hover:text-slate-900">Gizlilik</Link>
            <Link href="/sozlesme" className="hover:text-slate-900">Sözleşme</Link>
            <Link href="/cerezler" className="hover:text-slate-900">Çerezler</Link>
            <a href="mailto:kurucu@otosonar.com" className="hover:text-slate-900">İletişim</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
