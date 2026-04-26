"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">(
    token ? "loading" : "idle",
  );

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => setState(d.success ? "ok" : "error"))
      .catch(() => setState("error"));
  }, [token]);

  if (state === "idle") {
    return (
      <p className="text-sm text-neutral-400">
        Mailindeki doğrulama linkine tıkladığında bu sayfa otomatik açılır.
      </p>
    );
  }
  if (state === "loading") return <p className="text-sm text-neutral-400">Doğrulanıyor...</p>;
  if (state === "ok") {
    return (
      <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-4 text-sm text-emerald-200">
        E-postan doğrulandı.{" "}
        <Link href="/hesap" className="underline">
          Hesabıma dön
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4 text-sm text-red-200">
      Link geçersiz veya süresi dolmuş.
    </div>
  );
}
