"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";

interface Props {
  isLoggedIn: boolean;
}

// Sadeleşmiş 4 link — nav ile aynı sıra.
const LINKS: Array<{ href: string; label: string; desc: string }> = [
  { href: "/analiz", label: "Analiz", desc: "İlan linkini yapıştır, AI rapor çıkarsın" },
  { href: "/pazaryeri", label: "Pazaryeri", desc: "Aktif ilanları tara" },
  { href: "/raporlar", label: "Raporlar", desc: "Geçmiş analizlerin" },
  { href: "/hesap", label: "Hesap", desc: "Profil + paket yönetimi" },
];

export function MobileMenu({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  // Drawer açıkken body scroll'u kilitle.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC ile kapat.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Swipe-to-close: sağa doğru 80px çekilince kapan.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchDeltaX.current > 80) {
      setOpen(false);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Menüyü aç"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="hit-target -mr-2 inline-flex items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 active:bg-slate-200"
      >
        <Menu className="h-6 w-6" strokeWidth={2.25} aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-white pt-safe pb-safe"
          role="dialog"
          aria-modal="true"
          aria-label="Ana menü"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 h-14">
            <span className="text-base font-black tracking-tight text-slate-900">
              Menü
            </span>
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setOpen(false)}
              className="hit-target -mr-2 inline-flex items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 active:bg-slate-200"
            >
              <X className="h-6 w-6" strokeWidth={2.25} aria-hidden />
            </button>
          </div>

          <nav className="flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 active:bg-slate-50"
              >
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-slate-900">
                    {l.label}
                  </span>
                  <span className="text-xs text-slate-500">{l.desc}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
              </Link>
            ))}
          </nav>

          <div className="mt-4 px-5">
            {isLoggedIn ? (
              <Link
                href="/hesap"
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-900 active:bg-slate-50"
              >
                Hesabım
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/kayit"
                  onClick={() => setOpen(false)}
                  className="btn-accent-gradient w-full min-h-14"
                >
                  <Sparkles className="h-4 w-4" aria-hidden strokeWidth={2.5} />
                  Ücretsiz Dene
                </Link>
                <Link
                  href="/giris"
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:bg-slate-50"
                >
                  Giriş yap
                </Link>
              </div>
            )}
          </div>

          <p className="mt-6 px-5 text-center text-[11px] text-slate-400">
            Sağa kaydır veya ESC ile kapat
          </p>
        </div>
      )}
    </div>
  );
}
