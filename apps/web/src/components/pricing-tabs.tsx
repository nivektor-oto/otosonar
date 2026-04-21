"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, User, Building2, Sparkles } from "lucide-react";

type Audience = "b2c" | "b2b";

interface Tier {
  name: string;
  price: string;
  founderPrice?: string;
  bestFor: string;
  badge?: string | null;
  items: string[];
  cta: string;
}

const B2C_TIERS: Tier[] = [
  {
    name: "Plus",
    price: "99",
    bestFor: "Yeni başlayan · araç alacak bireysel kullanıcı",
    items: [
      "25 analiz / ay",
      "Emsal değer + pazarlık skoru",
      "Temel kırmızı bayrak tespiti",
      "Mobile PWA (iOS / Android)",
      "E-posta desteği",
    ],
    cta: "Plus'ı Dene",
  },
  {
    name: "Pro",
    price: "249",
    badge: "EN POPÜLER",
    bestFor: "Aktif araç alıcısı · karar öncesi detay isteyen",
    items: [
      "Sınırsız analiz",
      "Günde 20 fırsat bildirimi",
      "KM manipülasyon + boya oynama uyarısı",
      "Chrome eklentisi",
      "Haftalık pazar raporu",
      "Öncelikli destek (WhatsApp)",
    ],
    cta: "Pro'yu Seç",
  },
  {
    name: "Max",
    price: "449",
    badge: "PREMIUM",
    bestFor: "Power user · ailece veya arkadaşlarla kullanan",
    items: [
      "Tüm Pro özellikleri",
      "Plaka OCR + VIN sorgu",
      "Fotoğraftan hasar AI",
      "3 kullanıcıya kadar paylaşım",
      "AI sahtecilik alarmı",
      "Beyaz eldiven konsiyerj (analiz yardımı)",
    ],
    cta: "Max'i Dene",
  },
];

const B2B_TIERS: Tier[] = [
  {
    name: "Bayi Plus",
    price: "799",
    founderPrice: "559",
    bestFor: "Küçük galerici · aylık 5-15 araç",
    items: [
      "200 analiz / ay",
      "🆕 Araç Bozdurma hesaplayıcı",
      "🏢 Dealer verification rozet",
      "Stok değerleme (5 araç)",
      "2 kullanıcı (galerici + 1 çalışan)",
      "WhatsApp Business bot entegrasyonu",
      "Haftalık fırsat bülteni",
    ],
    cta: "Bayi Plus Başla",
  },
  {
    name: "Bayi Pro",
    price: "1.599",
    founderPrice: "1.119",
    badge: "EN POPÜLER",
    bestFor: "Orta ölçek galeri · aylık 15-40 araç",
    items: [
      "Sınırsız analiz",
      "🆕 Bozdurma Pro (kâr marjı ayarlı)",
      "🆕 Trade-in modu (eski+yeni araç paralel)",
      "Fleet dashboard (20 araç stok)",
      "5 kullanıcı (ekip)",
      "Ruhsat OCR + otomatik ilan taslağı",
      "Marketplace öncelikli listing",
      "API erişimi (1.000 req/gün)",
      "Anlık fırsat alarmı (push + WhatsApp)",
    ],
    cta: "Bayi Pro'yu Seç",
  },
  {
    name: "Bayi Max",
    price: "3.499",
    founderPrice: "2.449",
    badge: "PREMIUM",
    bestFor: "Büyük galerici veya bayilik · aylık 40+ araç",
    items: [
      "Tüm Bayi Pro özellikleri",
      "Fleet dashboard (50 araç stok)",
      "10 kullanıcı (ekip + yöneticiler)",
      "Verified Gold Dealer rozet (marketplace)",
      "Marketplace komisyon %50 indirim",
      "API rate limit × 3 (3.000 req/gün)",
      "Özel hesap yöneticisi",
      "Aylık performans raporu + analiz danışmanlığı",
    ],
    cta: "Bayi Max'i Dene",
  },
];

export function PricingTabs() {
  const [audience, setAudience] = useState<Audience>("b2c");
  const tiers = audience === "b2c" ? B2C_TIERS : B2B_TIERS;

  return (
    <section id="pricing" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Fiyatlandırma
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Sade fiyat, <span className="gradient-text">net değer</span>
          </h2>
          <p className="mt-4 text-slate-300">
            Yıllık al, <strong className="text-white">3 ay bedava</strong> · İlk 7-14 gün ücretsiz · İstediğin zaman iptal
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div
            role="tablist"
            aria-label="Abonelik türü"
            className="inline-flex gap-1 p-1.5 rounded-full border border-border bg-panel/60 backdrop-blur-lg"
          >
            <TabButton
              active={audience === "b2c"}
              onClick={() => setAudience("b2c")}
              icon={<User className="w-4 h-4" aria-hidden strokeWidth={2} />}
              label="Bireysel"
              sublabel="Araç alıcı"
            />
            <TabButton
              active={audience === "b2b"}
              onClick={() => setAudience("b2b")}
              icon={<Building2 className="w-4 h-4" aria-hidden strokeWidth={2} />}
              label="Galerici"
              sublabel="B2B · Ekip"
            />
          </div>
        </div>

        {audience === "b2b" && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
              Kurucu 100 Kulübü açık — ömür boyu %30 indirim, çizik fiyatlar uygulanır
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {tiers.map((t) => {
            const featured = t.badge === "EN POPÜLER";
            return (
              <div
                key={t.name}
                className={`card card-interactive relative flex flex-col ${
                  featured
                    ? "md:scale-[1.03] md:z-10 border-accent shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_20px_50px_rgba(99,102,241,0.2)] order-first md:order-none"
                    : ""
                }`}
              >
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-accent to-accent2 text-white tracking-widest whitespace-nowrap">
                    {t.badge}
                  </div>
                )}
                <div className="text-xl font-bold tracking-tight mb-1">{t.name}</div>
                <div className="text-xs text-slate-400 mb-5 min-h-[32px]">{t.bestFor}</div>

                <div className="mb-5">
                  {audience === "b2b" && t.founderPrice ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tabular-nums gradient-text">
                          {t.founderPrice}
                        </span>
                        <span className="text-slate-400 text-sm">TL/ay</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5">
                        Normal: <span className="line-through">{t.price} TL</span>{" "}
                        <span className="text-amber-400 font-semibold">· Kurucu %30</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tabular-nums">{t.price}</span>
                      <span className="text-slate-400 text-sm">TL/ay</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {t.items.map((i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-200"
                    >
                      <Check
                        className="w-4 h-4 text-accent mt-0.5 shrink-0"
                        aria-hidden
                        strokeWidth={2.5}
                      />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding"
                  className={`text-center py-3 rounded-full font-bold transition ${
                    featured ? "btn-primary" : "btn-ghost"
                  } justify-center`}
                >
                  {t.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {audience === "b2b" && (
          <div className="mt-10 card text-center border-accent/30 bg-gradient-to-br from-accent/5 to-accent2/5">
            <div className="text-xs text-accent uppercase tracking-wider font-bold mb-2">
              Kurumsal Paket
            </div>
            <h3 className="text-xl font-bold mb-2">
              Filo, bayi zinciri veya 20+ çalışan?
            </h3>
            <p className="text-slate-400 text-sm mb-4 max-w-xl mx-auto">
              Kurumsal paket 5.999 TL/ay&apos;dan başlar — sınırsız kullanıcı, özel API kotası, SSO, özel hesap yöneticisi, SLA %99.9, beyaz etiketli rapor.
            </p>
            <a
              href="mailto:kurumsal@otosonar.com"
              className="btn-ghost inline-flex items-center justify-center gap-2"
            >
              Satış ekibiyle görüş
            </a>
          </div>
        )}

        {audience === "b2c" && (
          <p className="mt-10 text-center text-sm text-slate-400">
            Galerici misin?{" "}
            <button
              onClick={() => setAudience("b2b")}
              className="text-accent hover:text-accent2 underline underline-offset-2 font-semibold"
            >
              Bayi paketlerini gör →
            </button>
          </p>
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-accent/20 to-accent2/20 text-white border border-accent/40 shadow-inner"
          : "text-slate-400 hover:text-white"
      }`}
    >
      {icon}
      <span className="flex flex-col items-start leading-tight">
        <span>{label}</span>
        <span className={`text-[10px] font-medium ${active ? "text-accent/80" : "text-slate-500"}`}>
          {sublabel}
        </span>
      </span>
    </button>
  );
}
