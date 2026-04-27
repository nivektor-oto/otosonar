"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, User, Building2, Sparkles, ExternalLink } from "lucide-react";
import {
  TIER_PRICING,
  B2C_TIERS,
  B2B_TIERS,
  type TierKey,
  type BillingPeriod,
  formatKurusToTL,
  monthlyEquivalentKurus,
} from "@/lib/tiers";
import type { ExternalCheckoutMap } from "@/lib/payment-providers";

type Audience = "b2c" | "b2b";

interface ComparisonFeature {
  key: string;
  label: string;
  /** hangi tier'da açık olduğunu bool veya numeric gösterim olarak döndür. */
  value: (tier: TierKey) => string | boolean;
}

const COMPARISON: ComparisonFeature[] = [
  {
    key: "analyses",
    label: "Analiz / ay",
    value: (t) =>
      TIER_PRICING[t].limits.analyses === -1
        ? "Sınırsız"
        : `${TIER_PRICING[t].limits.analyses}`,
  },
  {
    key: "alerts",
    label: "Fiyat alarmı",
    value: (t) => {
      const v = TIER_PRICING[t].limits.alerts;
      if (v === -1) return "Sınırsız";
      if (v === 0) return false;
      return String(v);
    },
  },
  {
    key: "favorites",
    label: "Favori listesi",
    value: (t) =>
      TIER_PRICING[t].limits.favorites === -1
        ? "Sınırsız"
        : `${TIER_PRICING[t].limits.favorites}`,
  },
  {
    key: "listings",
    label: "İlan yayınlama (ay)",
    value: (t) => {
      const v = TIER_PRICING[t].limits.listingsPerMonth;
      if (v === -1) return "Sınırsız";
      if (v === 0) return false;
      return String(v);
    },
  },
  {
    key: "redFlags",
    label: "KM risk + boya-hasar",
    value: (t) => TIER_PRICING[t].limits.advancedRedFlags,
  },
  {
    key: "duplicate",
    label: "Duplicate tespit",
    value: (t) => TIER_PRICING[t].limits.duplicateDetection,
  },
  {
    key: "trend",
    label: "Trend raporu",
    value: (t) => TIER_PRICING[t].limits.trendReports,
  },
  {
    key: "opportunity",
    label: "Fırsat tarayıcı",
    value: (t) => TIER_PRICING[t].limits.opportunityScanner,
  },
  {
    key: "dashboard",
    label: "Galerici dashboard",
    value: (t) => TIER_PRICING[t].limits.dealerDashboard,
  },
  {
    key: "wa",
    label: "WhatsApp Business bot",
    value: (t) => TIER_PRICING[t].limits.whatsappBot,
  },
  {
    key: "priority",
    label: "Öncelikli destek",
    value: (t) => TIER_PRICING[t].limits.prioritySupport,
  },
  {
    key: "api",
    label: "API erişimi",
    value: (t) => TIER_PRICING[t].limits.apiAccess,
  },
  {
    key: "verifiedBadge",
    label: "Galerici doğrulama rozeti",
    value: (t) => TIER_PRICING[t].limits.verifiedBadge,
  },
];

interface Props {
  currentTier?: TierKey;
  isAuthenticated: boolean;
  externalCheckoutUrls?: ExternalCheckoutMap;
}

export function PricingView({
  currentTier,
  isAuthenticated,
  externalCheckoutUrls,
}: Props) {
  const [audience, setAudience] = useState<Audience>("b2c");
  const [billing, setBilling] = useState<BillingPeriod>("MONTHLY");

  const visibleTiers: TierKey[] = audience === "b2c" ? B2C_TIERS : B2B_TIERS;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
          Fiyatlandırma
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Sade paket, <span className="gradient-text">net değer</span>
        </h1>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          Tüm fiyatlar <strong>KDV dahil</strong>. Yıllık ödemede{" "}
          <strong className="text-accent">2 ay bedava</strong>. İstediğiniz zaman
          iptal.
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

      <div
        className={`grid gap-5 items-stretch ${
          visibleTiers.length === 3 ? "md:grid-cols-3" : "md:grid-cols-3"
        }`}
      >
        {visibleTiers.map((t) => (
          <TierCard
            key={t}
            tier={t}
            billing={billing}
            currentTier={currentTier}
            isAuthenticated={isAuthenticated}
            externalUrl={externalCheckoutUrls?.[t]?.[billing]}
          />
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        KDV dahil. Faturalandırma TL. Aboneliğinizi istediğiniz zaman hesabınızdan
        iptal edebilirsiniz.
      </div>

      {/* Karşılaştırma tablosu */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8">
          Paket karşılaştırması
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-panel/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold text-slate-700">
                  Özellik
                </th>
                {visibleTiers.map((t) => (
                  <th
                    key={t}
                    className="text-center p-3 font-semibold text-slate-700"
                  >
                    {TIER_PRICING[t].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((f) => (
                <tr
                  key={f.key}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="p-3 text-slate-600">{f.label}</td>
                  {visibleTiers.map((t) => {
                    const v = f.value(t);
                    return (
                      <td key={t} className="p-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check
                              className="w-4 h-4 text-accent inline"
                              strokeWidth={3}
                              aria-label="Var"
                            />
                          ) : (
                            <X
                              className="w-4 h-4 text-slate-400 inline"
                              strokeWidth={2}
                              aria-label="Yok"
                            />
                          )
                        ) : (
                          <span className="font-medium">{v}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 text-center space-y-2 text-sm text-slate-600">
        <p>
          Sorunuz mu var?{" "}
          <a
            href="mailto:destek@otosonar.com"
            className="text-accent hover:underline underline-offset-2 font-semibold"
          >
            destek@otosonar.com
          </a>
        </p>
        <p className="text-xs text-slate-500">
          Kurumsal / bayi zinciri / 20+ çalışan için özel paket →{" "}
          <a
            href="mailto:kurumsal@otosonar.com"
            className="text-accent hover:underline underline-offset-2"
          >
            kurumsal@otosonar.com
          </a>
        </p>
      </section>
    </div>
  );
}

function TierCard({
  tier,
  billing,
  currentTier,
  isAuthenticated,
  externalUrl,
}: {
  tier: TierKey;
  billing: BillingPeriod;
  currentTier?: TierKey;
  isAuthenticated: boolean;
  externalUrl?: string;
}) {
  const conf = TIER_PRICING[tier];
  const isFree = tier === "FREE";
  const isCurrent = currentTier === tier;
  const isFeatured = conf.badge === "EN POPÜLER" || conf.badge === "GALERİCİ FAVORİSİ";
  const hasExternal = !isFree && !isCurrent && Boolean(externalUrl);

  const monthlyEq = monthlyEquivalentKurus(tier, billing);
  const yearlyKurus = conf.yearlyKurus;

  const ctaHref = isFree
    ? isAuthenticated
      ? "/dashboard"
      : "/kayit"
    : hasExternal
      ? externalUrl!
      : `/onboarding?tier=${tier}&billing=${billing.toLowerCase()}`;

  const ctaLabel = isFree
    ? isAuthenticated
      ? "Ücretsiz kullanıyorsunuz"
      : "Hesap aç"
    : isCurrent
      ? "Mevcut paketiniz"
      : hasExternal
        ? "Hemen Satın Al"
        : "Bu paketi seç";

  return (
    <div
      className={`card card-interactive relative flex flex-col ${
        isFeatured
          ? "md:scale-[1.03] md:z-10 border-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.45),0_20px_50px_rgba(245,158,11,0.2)] order-first md:order-none"
          : ""
      } ${isCurrent ? "ring-2 ring-accent/60" : ""}`}
    >
      {conf.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-accent to-accent2 text-slate-900 tracking-widest whitespace-nowrap">
          {conf.badge}
        </div>
      )}
      {isCurrent && !conf.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-accent text-white tracking-widest whitespace-nowrap">
          MEVCUT
        </div>
      )}

      <div className="text-xl font-bold tracking-tight mb-1">{conf.label}</div>
      <div className="text-xs text-slate-500 mb-5 min-h-[32px]">
        {conf.pitch}
      </div>

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
                  Aylık ödeme · yıllıkta{" "}
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
      {isCurrent ? (
        <div className="text-center py-3 rounded-full font-bold bg-accent/10 text-accent border border-accent/30">
          {ctaLabel}
        </div>
      ) : hasExternal ? (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-center py-3 rounded-full font-bold transition inline-flex items-center justify-center gap-2 ${
            isFeatured ? "btn-primary" : "btn-ghost"
          }`}
        >
          {ctaLabel}
          <ExternalLink className="w-4 h-4" aria-hidden strokeWidth={2.5} />
        </a>
      ) : (
        <Link
          href={ctaHref}
          className={`text-center py-3 rounded-full font-bold transition ${
            isFeatured ? "btn-primary" : "btn-ghost"
          } justify-center`}
        >
          {ctaLabel}
        </Link>
      )}
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

// Re-export for landing use
export { Sparkles as _Sparkles };
