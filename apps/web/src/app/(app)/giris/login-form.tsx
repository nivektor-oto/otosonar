"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OAuthButtons } from "@/components/oauth-buttons";
import { trackEvent } from "@/lib/track";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(fd.get("email") ?? ""),
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        const msg =
          data.error === "invalid_credentials"
            ? "E-posta veya şifre hatalı."
            : data.error === "rate_limited"
              ? "Çok fazla deneme. Biraz bekle."
              : "Giriş başarısız.";
        toast.error(msg);
        return;
      }
      trackEvent("login.success");
      toast.success("Giriş başarılı.");
      router.push("/hesap");
      router.refresh();
    } catch {
      toast.error("Ağ hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <OAuthButtons mode="giris" />
      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-400">E-posta</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-400">Şifre</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Giriliyor…" : "Giriş yap"}
      </button>
      <p className="text-center text-xs text-neutral-400">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="text-emerald-400 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
