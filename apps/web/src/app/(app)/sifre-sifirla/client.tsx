"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ResetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: String(fd.get("password") ?? "") }),
    });
    const data = await r.json();
    setLoading(false);
    if (!r.ok || !data.success) {
      toast.error(
        data.error === "invalid_or_expired"
          ? "Link geçersiz veya süresi dolmuş."
          : data.error === "weak_password"
            ? (data.detail ?? "Şifre yetersiz.")
            : "Sıfırlama başarısız.",
      );
      return;
    }
    toast.success("Şifre güncellendi.");
    router.push("/giris");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-400">Yeni şifre</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <button
        disabled={loading || !token}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Güncelleniyor…" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}
