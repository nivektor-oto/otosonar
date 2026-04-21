"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function FounderLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("E-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/founder/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Giriş başarısız");
        return;
      }
      toast.success("Hoş geldin, kurucu");
      router.push("/yonetici");
      router.refresh();
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="f-email" className="block text-sm font-medium text-slate-300 mb-1.5">
          E-posta
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" aria-hidden />
          <input
            id="f-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="input pl-9"
            placeholder="kurucu@otosonar.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="f-pass" className="block text-sm font-medium text-slate-300 mb-1.5">
          Şifre
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" aria-hidden />
          <input
            id="f-pass"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            className="input pl-9 pr-10"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPass ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Giriş yapılıyor…
          </>
        ) : (
          <>
            Giriş yap
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}
