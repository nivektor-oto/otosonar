"use client";

/**
 * Landing pricing section — tier registry'den beslenir.
 * Tam karşılaştırma tablosu için kullanıcı /fiyatlar'a yönlendirilir.
 */

import { useState } from "react";
import Link from "next/link";
import { Check, User, Building2 } from "lucide-react";
import {
  TIER_PRICING,
  B2C_TIERS,
  B2B_TIERS,
  formatKurusToTL,
  monthlyEquivalentKurus,
  type TierKey,
  type BillingPeriod,
} from "@/lib/tiers";

type Audience = "b2c" | "b2b";

export function PricingTabs() {
  const [audience, setAudience] = useState<Audience>("b2c");
  const [billing, setBilling] = useState<BillingPeriod>("MONTHLY");
  const tiers: TierKey[] = audience === "b2c" ? B2C_TIERS : B2B_TIERS;

  return (
    <section id="pricing" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Fiyatlandırma
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Sade paket, <span className="gradient-text">net değer</span>
          </h2>
          <p className="mt-4 text-slate-600">
            Tüm fiyatlar <strong>KDV dahil</strong> · Yıllık ödemede{" "}
            <strong className="text-accent">2 ay bedava</strong> · İstediğin zaman
            iptal
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-10">
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
              icon={
                <Building2 className="w-4 h-4" aria-hidden strokeWidth={2} />
              }
              label="Galerici"
              sublabel="B2B · Ekip"
            />
          </div>
          <BillingToggle value={billing} onChange={setBilling} />
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {tiers.map((t) => (
            <TierCard key={t} tier={t} billing={billing} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Tam karşılaştırma tablosu için{" "}
          <Link
            href="/fiyatlar"
            className="text-accent hover:text-accent2 underline underline-offset-2 font-semibold"
          >
            fiyatlar sayfası →
          </Link>
        </p>
      </div>
    </section>
  );
}

function TierCard({
  tier,
  billing,
}: {
  tier: TierKey;
  billing: BillingPeriod;
}) {
  const conf = TIER_PRICING[tier];
  const isFree = tier === "FREE";
  const isFeatured =
    conf.badge === "EN POPÜLER" || conf.badge === "GALERİCİ FAVORİSİ";

  const monthlyEq = monthlyEquivalentKurus(tier, billing);
  const yearlyKurus = conf.yearlyKurus;

  const ctaHref = isFree
    ? "/kayit"
    : `/onboarding?tier=${tier}&billing=${billing.toLowerCase()}`;
  const ctaLabel = isFree ? "Hesap aç (ücretsiz)" : "Bu paketi seç";

  return (
    <div
      className={`card card-interactive relative flex flex-col ${
        isFeatured
          ? "md:scale-[1.03] md:z-10 border-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.45),0_20px_50px_rgba(245,158,11,0.2)] order-first md:order-none"
          : ""
      }`}
    >
      {conf.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-accent to-accent2 text-slate-900 tracking-widest whitespace-nowrap">
          {conf.badge}
        </div>
      )}
      <div className="text-xl font-bold tracking-tight mb-1">{conf.label}</div>
      <div className="text-xs text-slate-500 mb-5 min-h-[32px]">{conf.pitch}</div>

      <div className="mb-5">
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tabular-nums">Ücretsiz</span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tabular-nums">
                {formatKurusToTL(monthlyEq)}
              </span>
              <span className="text-slate-500 text-sm">TL/ay</span>
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              {billing === "YEARLY" ? (
                <>
                  Yıllık:{" "}
                  <strong className="text-slate-900">
                    {formatKurusToTL(yearlyKurus)} TL
                  </strong>{" "}
                  <span className="text-accent font-semibold">· 2 ay bedava</span>
                </>
              ) : (
                <>
                  Yıllıkta{" "}
                  <strong className="text-slate-900">
                    {formatKurusToTL(yearlyKurus)} TL
                  </strong>{" "}
                  (2 ay bedava)
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">KDV dahil</div>
          </>
        )}
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {conf.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <Check
              className="w-4 h-4 text-accent mt-0.5 shrink-0"
              aria-hidden
              strokeWidth={2.5}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`text-center py-3 rounded-full font-bold transition ${
          isFeatured ? "btn-primary" : "btn-ghost"
        } justify-center`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (b: BillingPeriod) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Ödeme periyodu"
      className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-panel/60 backdrop-blur-lg text-xs"
    >
      <button
        role="tab"
        aria-selected={value === "MONTHLY"}
        onClick={() => onChange("MONTHLY")}
        className={`px-4 py-1.5 rounded-full font-semibold transition ${
          value === "MONTHLY"
            ? "bg-amber-500 text-white shadow"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Aylık
      </button>
      <button
        role="tab"
        aria-selected={value === "YEARLY"}
        onClick={() => onChange("YEARLY")}
        className={`px-4 py-1.5 rounded-full font-semibold transition inline-flex items-center gap-2 ${
          value === "YEARLY"
            ? "bg-amber-500 text-white shadow"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Yıllık
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent uppercase tracking-wide">
          2 ay bedava
        </span>
      </button>
    </div>
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
          ? "bg-amber-100 text-slate-900 border border-amber-300 shadow-inner"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {icon}
      <span className="flex flex-col items-start leading-tight">
        <span>{label}</span>
        <span
          className={`text-[10px] font-medium ${
            active ? "text-accent/80" : "text-slate-500"
          }`}
        >
          {sublabel}
        </span>
      </span>
    </button>
  );
}
