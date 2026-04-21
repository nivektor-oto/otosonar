"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(fd.get("email") ?? "") }),
    });
    setLoading(false);
    if (r.ok) {
      setDone(true);
      toast.success("Eğer e-posta kayıtlıysa sıfırlama linki gönderildi.");
    }
  }

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Şifremi unuttum</h1>
        {done ? (
          <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6 text-sm text-neutral-300">
            E-posta kutunu kontrol et. (Henüz e-posta servisi bağlanmadı — lansmanda aktif olacak.)
            <div className="mt-4">
              <Link href="/giris" className="text-emerald-400 hover:underline">Giriş sayfasına dön</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-400">E-posta</span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <button
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "Gönderiliyor…" : "Sıfırlama linki gönder"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
