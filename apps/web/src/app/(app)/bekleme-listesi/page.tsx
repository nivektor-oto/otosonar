"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/logo";

type UserType = "buyer" | "dealer" | "broker";

interface FormState {
  email: string;
  fullName: string;
  userType: UserType;
  city: string;
  referralSource: string;
  kvkkConsent: boolean;
  website: string;
}

const INITIAL_FORM: FormState = {
  email: "",
  fullName: "",
  userType: "buyer",
  city: "",
  referralSource: "",
  kvkkConsent: false,
  website: "",
};

const LAUNCH_DATE = new Date("2026-05-12T09:00:00+03:00");

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const d = Math.floor(diffMs / 86_400_000);
  const h = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1000);
  return { d, h, m, s, done: false };
}

export default function WaitlistPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ queueNumber: number; email: string } | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const countdown = useCountdown(LAUNCH_DATE);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && typeof d.stats?.total === "number") setTotal(d.stats.total);
      })
      .catch(() => {});
  }, [success]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Geçerli bir e-posta gir";
    if (form.fullName.trim().length > 0 && form.fullName.trim().length < 2) return "Ad-soyad en az 2 karakter olmalı";
    if (!form.kvkkConsent) return "KVKK onayı gerekli";
    return null;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        email: form.email.trim(),
        userType: form.userType,
        kvkkConsent: true as const,
        ...(form.fullName.trim() ? { fullName: form.fullName.trim() } : {}),
        ...(form.city.trim() ? { city: form.city.trim() } : {}),
        ...(form.referralSource.trim() ? { referralSource: form.referralSource.trim() } : {}),
        ...(form.website ? { website: form.website } : {}),
      };
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data?.error ?? "Kayıt başarısız");
        return;
      }
      setSuccess({ queueNumber: data.queueNumber, email: form.email.trim() });
      toast.success(`Listedesin — sıran #${data.queueNumber}`);
    } catch {
      toast.error("Bağlantı hatası, tekrar dene");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-bg text-white">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Ana sayfa
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="grid gap-10 md:gap-14 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel/60 px-3 py-1 text-xs text-accent">
              <Sparkles size={14} aria-hidden />
              <span>Erken erişim — Lansman 12 Mayıs 2026</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight">
              OtoSonar bekleme listesine
              <br />
              <span className="gradient-text">ilk sen katıl</span>
            </h1>

            <p className="mt-5 text-slate-300 leading-relaxed">
              İlk 100 kurucu için <strong className="text-white">%40 indirim</strong> ve ömür boyu sabit fiyat garantisi.
              Lansmanda kayıt açılır açılmaz önceliğin olur, sıra numaran e-postana gelir.
            </p>

            {countdown && !countdown.done && (
              <div
                className="mt-8 grid grid-cols-4 gap-2 md:gap-3 max-w-md"
                role="timer"
                aria-live="polite"
                aria-label="Lansmana kalan süre"
              >
                <CountBlock label="Gün" value={countdown.d} />
                <CountBlock label="Saat" value={countdown.h} />
                <CountBlock label="Dakika" value={countdown.m} />
                <CountBlock label="Saniye" value={countdown.s} />
              </div>
            )}

            <dl className="mt-10 space-y-4">
              <Perk
                icon={<CheckCircle2 size={18} aria-hidden />}
                title="Kurucu fiyatı — hayat boyu sabit"
                desc="Plus: 249 TL → 149 TL | Pro: 449 TL → 269 TL — ilk yıldan sonra da artmaz."
              />
              <Perk
                icon={<Users size={18} aria-hidden />}
                title="İlk 100 galerici kulübü"
                desc="Bayiler için ilk ay ücretsiz + kişisel onboarding + 3 aylık özel Slack kanalı."
              />
              <Perk
                icon={<ShieldCheck size={18} aria-hidden />}
                title="Öncelikli destek"
                desc="Soruların önce sana cevaplanır. Feature taleplerin roadmap'te üst sıraya atanır."
              />
            </dl>

            {total !== null && (
              <p className="mt-8 text-sm text-slate-400">
                Şu ana kadar <span className="text-white font-semibold tabular-nums">{total}</span> kişi kayıt oldu.
              </p>
            )}
          </div>

          <div className="card-interactive p-6 md:p-8">
            {success ? (
              <SuccessPanel email={success.email} queueNumber={success.queueNumber} />
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div>
                  <h2 className="text-2xl font-bold">Listeye katıl</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    30 saniye sürer. Spam göndermeyiz.
                  </p>
                </div>

                <fieldset>
                  <legend className="text-sm font-medium text-slate-300 mb-2">
                    Seni en iyi tanımlayan
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    <TypePill
                      selected={form.userType === "buyer"}
                      onClick={() => update("userType", "buyer")}
                      icon={<User size={16} aria-hidden />}
                      label="Alıcı"
                    />
                    <TypePill
                      selected={form.userType === "dealer"}
                      onClick={() => update("userType", "dealer")}
                      icon={<Building2 size={16} aria-hidden />}
                      label="Galerici"
                    />
                    <TypePill
                      selected={form.userType === "broker"}
                      onClick={() => update("userType", "broker")}
                      icon={<Users size={16} aria-hidden />}
                      label="Komisyoncu"
                    />
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="wl-email" className="block text-sm font-medium text-slate-300 mb-1">
                    E-posta <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      aria-hidden
                    />
                    <input
                      id="wl-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      className="input pl-9"
                      placeholder="ornek@mail.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="wl-name" className="block text-sm font-medium text-slate-300 mb-1">
                    Ad soyad <span className="text-slate-500">(opsiyonel)</span>
                  </label>
                  <input
                    id="wl-name"
                    type="text"
                    autoComplete="name"
                    className="input"
                    placeholder="Mehmet Yılmaz"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="wl-city" className="block text-sm font-medium text-slate-300 mb-1">
                    Şehir <span className="text-slate-500">(opsiyonel)</span>
                  </label>
                  <input
                    id="wl-city"
                    type="text"
                    className="input"
                    placeholder="Konya, İstanbul…"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="wl-ref" className="block text-sm font-medium text-slate-300 mb-1">
                    Nereden duydun? <span className="text-slate-500">(opsiyonel)</span>
                  </label>
                  <input
                    id="wl-ref"
                    type="text"
                    className="input"
                    placeholder="Instagram, YouTube, arkadaş…"
                    value={form.referralSource}
                    onChange={(e) => update("referralSource", e.target.value)}
                  />
                </div>

                <div
                  aria-hidden
                  style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}
                >
                  <label htmlFor="wl-website">Website</label>
                  <input
                    id="wl-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={form.kvkkConsent}
                    onChange={(e) => update("kvkkConsent", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border bg-panel text-accent focus-visible:ring-2 focus-visible:ring-accent"
                    aria-describedby="kvkk-desc"
                  />
                  <span id="kvkk-desc" className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-300">KVKK aydınlatma metni</span>&apos;ni okudum, lansman bildirimi ve kurucu avantajları için e-posta almayı kabul ediyorum.
                    İstediğim an tek tıkla çıkarım.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      Kaydediliyor…
                    </>
                  ) : (
                    <>
                      Listeye katıl
                      <ArrowRight size={16} aria-hidden />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Sadece ürün bildirimleri ve lansman takibi için kullanılır. İstenmeyen posta göndermeyiz.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 justify-between">
          <span>© 2026 OtoSonar · Barış Furkan Koyuncu (Şahıs İşletmesi)</span>
          <span>
            Yardım: <a className="text-slate-300 hover:text-white" href="mailto:destek@otosonar.com">destek@otosonar.com</a>
          </span>
        </div>
      </footer>
    </main>
  );
}

function CountBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-panel/60 px-2 py-3 text-center">
      <div className="text-2xl md:text-3xl font-black tabular-nums text-white">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function Perk({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="icon-badge shrink-0">{icon}</div>
      <div>
        <dt className="font-semibold text-white">{title}</dt>
        <dd className="text-sm text-slate-400 mt-0.5">{desc}</dd>
      </div>
    </div>
  );
}

function TypePill({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors ${
        selected
          ? "border-accent bg-accent/10 text-white"
          : "border-border bg-panel/60 text-slate-400 hover:text-white hover:border-slate-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SuccessPanel({ email, queueNumber }: { email: string; queueNumber: number }) {
  return (
    <div className="text-center py-4" role="status" aria-live="polite">
      <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-emerald-400" aria-hidden />
      </div>
      <h2 className="mt-5 text-2xl font-bold">Listedesin!</h2>
      <p className="mt-2 text-slate-400 text-sm">
        <span className="text-white">{email}</span> adresine doğrulama gönderdik
        (şimdilik sadece kaydettik — lansman yaklaşınca detay atacağız).
      </p>
      <div className="mt-6 inline-flex flex-col items-center rounded-xl border border-border bg-panel/60 px-8 py-4">
        <div className="text-[11px] uppercase tracking-widest text-slate-500">Sıra numaran</div>
        <div className="text-4xl font-black gradient-text tabular-nums mt-1">#{queueNumber}</div>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        İlk 100 kişi kurucu avantajına hak kazanır. Arkadaşını davet edersen sıra sende yukarı kayar (davet sistemi lansmanda aktif).
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
        <Link href="/" className="btn-primary justify-center">
          Ana sayfaya dön
        </Link>
        <Link
          href="/analiz"
          className="rounded-lg border border-border bg-panel/60 px-4 py-2 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors inline-flex items-center justify-center gap-2"
        >
          Demoyu dene
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
