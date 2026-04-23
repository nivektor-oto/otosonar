import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  Clipboard,
  Gauge,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
  MapPin,
} from "lucide-react";
import { LogoMark, LogoLockup } from "@/components/logo";
import { PricingTabs } from "@/components/pricing-tabs";
import { InstallPrompt } from "@/components/install-prompt";

/**
 * OtoSonar Landing — Arabam / Sahibinden seviyesinde sade.
 * Section sayısı: 4 (Hero + 3 rozet + Nasıl çalışır + Pricing).
 * Tüm testimonial, feature grid, FAQ, ROI, karşılaştırma, trust badges vb. kaldırıldı.
 */
export default async function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <Nav />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <PricingTabs />
      <Footer />
      <InstallPrompt />
    </main>
  );
}

function Nav() {
  return (
    <nav
      aria-label="Ana menü"
      className="sticky top-0 z-30 bg-white border-b border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="OtoSonar ana sayfa"
          className="flex items-center gap-2 shrink-0"
        >
          <LogoMark size={26} className="shrink-0" />
          <span className="text-lg sm:text-xl font-black text-slate-900 whitespace-nowrap">
            OtoSonar
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm text-slate-700">
          <NavLink href="/analiz">Analiz</NavLink>
          <NavLink href="/pazaryeri">Pazaryeri</NavLink>
          <NavLink href="/raporlar">Raporlar</NavLink>
          <NavLink href="/hesap">Hesap</NavLink>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/giris"
            className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2"
          >
            Giriş
          </Link>
          <Link
            href="/kayit"
            aria-label="Ücretsiz dene"
            className="btn-primary text-sm whitespace-nowrap"
          >
            <span className="hidden sm:inline">Ücretsiz Dene</span>
            <span className="sm:hidden">Başla</span>
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

type AbVariant = "dealer" | "buyer";

function resolveVariant(raw: string | null | undefined): AbVariant {
  return raw === "dealer" || raw === "buyer" ? raw : "buyer";
}

async function Hero() {
  const h = await headers();
  const variant = resolveVariant(h.get("x-ab-variant"));
  const isDealer = variant === "dealer";

  const title = isDealer
    ? "Galericiye günde 5 fırsat, saatlerce arama yok."
    : "Sen yapıştır, biz hallederiz.";
  const subtitle = isDealer
    ? "Hedef modellerini tara, fiyat/değer oranı en iyi aracı sana düşsün."
    : "İlan linkini yapıştır, 8 saniyede emsal fiyat + gizli arıza + pazarlık skoru.";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 to-white">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-20 text-center">
        <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* HUGE Sahibinden-style search */}
        <form
          action="/analiz"
          method="get"
          className="mt-8 flex flex-col sm:flex-row gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 max-w-2xl mx-auto"
        >
          <input
            name="q"
            type="text"
            placeholder="İlan linkini yapıştır veya marka-model yaz"
            aria-label="İlan linki veya araç"
            className="flex-1 bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary">
            Analiz Et
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Kredi kartı yok · İlk 3 analiz ücretsiz · İstediğin zaman iptal
        </p>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { Icon: Gauge, label: "8 saniyede analiz" },
    { Icon: Store, label: "Galerici ağı verisi" },
    { Icon: ShieldCheck, label: "30 gün para iade" },
  ];
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {items.map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Icon className="w-4 h-4 text-amber-500" strokeWidth={2.25} aria-hidden />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { Icon: Clipboard, title: "Yapıştır", desc: "İlan linkini kutuya koy." },
    { Icon: Sparkles, title: "Analiz et", desc: "AI 8 saniyede rapor çıkarır." },
    { Icon: Wallet, title: "Karar ver", desc: "Emsal fiyat + pazarlık skoru." },
  ];
  return (
    <section className="py-16 bg-bg">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Nasıl çalışır?
          </h2>
          <p className="mt-2 text-sm text-slate-600">Üç adım, o kadar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="card text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-11 h-11 rounded-full bg-amber-100 text-amber-600 font-bold">
                {i + 1}
              </div>
              <h3 className="font-semibold text-base text-slate-900 mb-1">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <LogoLockup size={20} />
        <div>© 2026 OtoSonar · NiVector Teknoloji Ltd. Şti.</div>
        <div className="flex gap-5 flex-wrap justify-center">
          <Link href="/blog" className="hover:text-slate-900 transition">
            Blog
          </Link>
          <Link href="/gizlilik" className="hover:text-slate-900 transition">
            Gizlilik
          </Link>
          <Link href="/kvkk" className="hover:text-slate-900 transition">
            KVKK
          </Link>
          <Link href="/sozlesme" className="hover:text-slate-900 transition">
            Üyelik
          </Link>
          <a
            href="mailto:destek@otosonar.com"
            className="hover:text-slate-900 transition"
          >
            Destek
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3 h-3" aria-hidden />
          <span>Konya · Türkiye</span>
        </div>
      </div>
    </footer>
  );
}
