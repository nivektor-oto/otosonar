"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { bootstrapFirstAdminAction } from "./actions";

export function BootstrapForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await bootstrapFirstAdminAction(fd);
      if (res && !res.ok) {
        setError(res.error ?? "Hata");
        toast.error(res.error ?? "Hata");
      }
      // redirect() başarıda burada dönmeden yönlendirir.
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Ad Soyad">
        <input
          name="fullName"
          type="text"
          required
          minLength={2}
          maxLength={80}
          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-emerald-500/60 focus:outline-none"
          autoComplete="name"
        />
      </Field>
      <Field label="E-posta">
        <input
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-emerald-500/60 focus:outline-none"
          autoComplete="email"
        />
      </Field>
      <Field label="Şifre" hint="En az 8 karakter, harf + rakam.">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-emerald-500/60 focus:outline-none"
          autoComplete="new-password"
        />
      </Field>
      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm"
      >
        {pending ? "Oluşturuluyor…" : "Yönetici hesabı oluştur"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
        {label}
      </span>
      {children}
      {hint ? <span className="block mt-1 text-[10px] text-neutral-500">{hint}</span> : null}
    </label>
  );
}
