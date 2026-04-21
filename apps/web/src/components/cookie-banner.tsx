"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = ["/sunum", "/gomulu", "/offline", "/yonetici"];

export function CookieBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!pathname || EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;
    try {
      if (!localStorage.getItem("otosonar_cookie_consent")) setShow(true);
    } catch {
      /* noop */
    }
  }, [pathname]);

  function accept() {
    try {
      localStorage.setItem("otosonar_cookie_consent", String(Date.now()));
    } catch {
      /* noop */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      data-nopdf
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-neutral-700 bg-[#12121a]/95 p-4 text-xs text-neutral-300 shadow-xl backdrop-blur print:hidden"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Zorunlu oturum çerezleri ve anonim analitik çerezler kullanıyoruz.{" "}
          <Link href="/cerez" className="text-emerald-400 hover:underline">
            Detay
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400"
        >
          Tamam, anladım
        </button>
      </div>
    </div>
  );
}
