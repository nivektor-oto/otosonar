"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  isLoggedIn: boolean;
}

// Sadeleşmiş 4 link — nav ile aynı sıra.
const LINKS: Array<{ href: string; label: string }> = [
  { href: "/analiz", label: "Analiz" },
  { href: "/pazaryeri", label: "Pazaryeri" },
  { href: "/raporlar", label: "Raporlar" },
  { href: "/hesap", label: "Hesap" },
];

export function MobileMenu({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Menü"
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="font-bold text-slate-900">Menü</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-700"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col divide-y divide-slate-200">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="h-2" />
            {isLoggedIn ? (
              <Link
                href="/hesap"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-slate-50"
              >
                Hesabım
              </Link>
            ) : (
              <>
                <Link
                  href="/giris"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Giriş yap
                </Link>
                <Link
                  href="/kayit"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-amber-700 hover:bg-slate-50"
                >
                  Ücretsiz Dene
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
