"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  isLoggedIn: boolean;
}

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/analiz", label: "Analiz" },
  { href: "/bozdurma", label: "Bozdurma (Galerici)" },
  { href: "/pazar-arastir", label: "Pazar Araştır" },
  { href: "/pazaryeri", label: "Pazaryeri" },
  { href: "/hasar-tespit", label: "Hasar Tespit (AI)" },
  { href: "/plaka-oku", label: "Plaka Oku (OCR)" },
  { href: "/quiz", label: "Persona Quiz" },
  { href: "/davet", label: "Davet Et" },
];

export function MobileMenu({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Menü"
        onClick={() => setOpen(true)}
        className="rounded-md border border-neutral-800 px-3 py-2 text-xs text-neutral-200"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur">
          <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3">
            <span className="font-bold text-white">Menü</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-neutral-800 px-3 py-1 text-xs text-neutral-300"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col divide-y divide-neutral-900">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-900"
              >
                {l.label}
              </Link>
            ))}
            <div className="h-2" />
            {isLoggedIn ? (
              <Link
                href="/hesap"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-emerald-400 hover:bg-neutral-900"
              >
                Hesabım
              </Link>
            ) : (
              <>
                <Link
                  href="/giris"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  Giriş yap
                </Link>
                <Link
                  href="/kayit"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-semibold text-emerald-400 hover:bg-neutral-900"
                >
                  Kayıt ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
