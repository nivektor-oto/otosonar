"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TotpSection({ enabled, email }: { enabled: boolean; email: string }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (enabled) return;
    fetch("/api/totp")
      .then((r) => r.json())
      .then((d) => {
        if (!d.enabled && d.secret && d.otpauthUri) {
          setSetup({ secret: d.secret, otpauthUri: d.otpauthUri });
        }
      })
      .catch(() => undefined);
  }, [enabled]);

  async function enable() {
    if (!setup) return;
    setLoading(true);
    const r = await fetch("/api/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, secret: setup.secret }),
    });
    setLoading(false);
    const data = await r.json();
    if (!r.ok || !data.success) {
      toast.error(data.error === "invalid_code" ? "Kod yanlış." : "Aktive edilemedi.");
      return;
    }
    toast.success("2FA aktif.");
    router.refresh();
  }

  async function disable() {
    const input = prompt("Aktif 2FA kodunu gir:");
    if (!input) return;
    setLoading(true);
    const r = await fetch("/api/totp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: input }),
    });
    setLoading(false);
    const data = await r.json();
    if (!r.ok || !data.success) {
      toast.error("Kapatılamadı.");
      return;
    }
    toast.success("2FA kapatıldı.");
    router.refresh();
  }

  if (enabled) {
    return (
      <div className="rounded-2xl border border-emerald-700/40 bg-emerald-900/10 p-6">
        <h2 className="mb-2 text-sm font-semibold text-emerald-300">2FA aktif</h2>
        <p className="mb-3 text-xs text-neutral-400">Her girişte 6 haneli doğrulama kodu istenir.</p>
        <button
          disabled={loading}
          onClick={disable}
          className="rounded-lg border border-red-700/40 px-4 py-2 text-xs text-red-300 hover:bg-red-900/20"
        >
          Kapat
        </button>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6 text-sm text-neutral-400">
        Hazırlanıyor…
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    setup.otpauthUri,
  )}`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <h2 className="text-sm font-semibold">2FA kurulumu</h2>
      <ol className="list-decimal space-y-2 pl-4 text-sm text-neutral-300">
        <li>
          Google Authenticator / 1Password / Authy uygulamasını aç.
        </li>
        <li>"Hesap ekle" → QR kodu tara:</li>
      </ol>
      <div className="flex justify-center">
        <img src={qrUrl} alt="TOTP QR" className="rounded-lg border border-neutral-800" />
      </div>
      <div className="rounded-lg border border-neutral-800 bg-[#0a0a0f] p-3 text-xs">
        QR çalışmazsa elle gir: <code className="break-all text-emerald-400">{setup.secret}</code>
        <div className="mt-1 text-neutral-500">Hesap: {email}</div>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-neutral-400">Uygulamada üreyen 6 haneli kodu gir:</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          maxLength={6}
          className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-center font-mono text-lg tracking-widest focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <button
        disabled={loading || code.length !== 6}
        onClick={enable}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "2FA'yı aktive et"}
      </button>
    </div>
  );
}
