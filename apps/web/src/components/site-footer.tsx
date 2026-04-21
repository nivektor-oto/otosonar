import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-[#0a0a0f] py-8 text-xs text-neutral-500">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} NiVector — OtoSonar</span>
          <nav className="flex flex-wrap gap-4">
            <Link href="/kvkk" className="hover:text-neutral-200">KVKK</Link>
            <Link href="/gizlilik" className="hover:text-neutral-200">Gizlilik</Link>
            <Link href="/sozlesme" className="hover:text-neutral-200">Sözleşme</Link>
            <Link href="/cerez" className="hover:text-neutral-200">Çerezler</Link>
            <a href="mailto:kurucu@otosonar.com" className="hover:text-neutral-200">İletişim</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
