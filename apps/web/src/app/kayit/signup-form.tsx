"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      fullName: String(fd.get("fullName") ?? ""),
      userType: String(fd.get("userType") ?? "BUYER"),
      referralCode: String(fd.get("referralCode") ?? "") || undefined,
      kvkkConsent: fd.get("kvkkConsent") === "on",
      marketingOptIn: fd.get("marketingOptIn") === "on",
    };

    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        const msg =
          data.error === "email_in_use"
            ? "Bu e-posta zaten kayıtlı."
            : data.error === "weak_password"
              ? (data.detail ?? "Şifre yetersiz.")
              : data.error === "rate_limited"
                ? "Çok fazla deneme. Biraz bekle."
                : "Kayıt başarısız.";
        toast.error(msg);
        return;
      }
      toast.success("Hesap açıldı. E-postanı doğrulamayı unutma.");
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
      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-400">Ad soyad</span>
        <input
          name="fullName"
          required
          minLength={2}
          maxLength={80}
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>

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
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <p className="text-xs text-neutral-500">En az 8 karakter, harf + rakam.</p>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-400">Hesap tipi</span>
        <select
          name="userType"
          defaultValue="BUYER"
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm"
        >
          <option value="BUYER">Bireysel (araç alıcısı)</option>
          <option value="DEALER">Galerici</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-400">Davet kodu (opsiyonel)</span>
        <input
          name="referralCode"
          maxLength={20}
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm uppercase"
        />
      </label>

      <label className="flex items-start gap-2 text-xs text-neutral-400">
        <input type="checkbox" name="kvkkConsent" required className="mt-0.5" />
        <span>
          <Link href="/kvkk" className="underline">KVKK Aydınlatma Metni</Link>'ni okudum,{" "}
          <Link href="/sozlesme" className="underline">Kullanım Sözleşmesi</Link>'ni kabul ediyorum.
        </span>
      </label>

      <label className="flex items-start gap-2 text-xs text-neutral-400">
        <input type="checkbox" name="marketingOptIn" className="mt-0.5" />
        <span>Ticari ileti gönderilmesine onay veriyorum (opsiyonel).</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Hesap aç"}
      </button>

      <p className="text-center text-xs text-neutral-400">
        Zaten üye misin?{" "}
        <Link href="/giris" className="text-emerald-400 hover:underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
