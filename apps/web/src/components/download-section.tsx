"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Apple,
  Check,
  ChevronRight,
  Download,
  MoreVertical,
  Plus,
  Share,
  Smartphone,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { LogoMark } from "@/components/logo";

type Platform = "ios" | "android";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function DownloadSection() {
  const [platform, setPlatform] = useState<Platform>("ios");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent || "";
    if (/Android/i.test(ua)) setPlatform("android");
    else if (/iPhone|iPad|iPod/i.test(ua)) setPlatform("ios");

    if (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    ) {
      setInstalled(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function triggerInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  return (
    <section id="download" className="relative py-24 border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/30 text-accent mb-5 uppercase tracking-wider">
            <Smartphone className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Mobil Uygulama
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            OtoSonar'ı <span className="gradient-text">cebinde</span> taşı
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            App Store beklemedi — <strong className="text-white">3 saniyede</strong> kur, çevrimdışı
            kullan, bildirim al. Native uygulama gibi çalışır ama mağaza ücreti yok.
          </p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-8 lg:gap-6 items-center">
          <PhoneMockup variant="ios" active={platform === "ios"} onClick={() => setPlatform("ios")} />

          <div className="order-last lg:order-none">
            <div className="card p-6 sm:p-8 bg-panel/60 border-border">
              <div className="flex gap-2 p-1 bg-bg/60 rounded-lg border border-border mb-6">
                <TabButton
                  active={platform === "ios"}
                  onClick={() => setPlatform("ios")}
                  icon={<Apple className="w-4 h-4" aria-hidden strokeWidth={2} />}
                  label="iPhone / iPad"
                />
                <TabButton
                  active={platform === "android"}
                  onClick={() => setPlatform("android")}
                  icon={<Smartphone className="w-4 h-4" aria-hidden strokeWidth={2} />}
                  label="Android"
                />
              </div>

              {installed ? (
                <InstalledState />
              ) : platform === "ios" ? (
                <IosInstructions />
              ) : (
                <AndroidInstructions
                  canInstall={!!deferred}
                  onInstall={triggerInstall}
                />
              )}

              <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-3 text-center">
                <PerkMini icon={<WifiOff className="w-4 h-4" aria-hidden strokeWidth={2} />} label="Çevrimdışı" />
                <PerkMini icon={<Zap className="w-4 h-4" aria-hidden strokeWidth={2} />} label="0 indirme süresi" />
                <PerkMini icon={<Check className="w-4 h-4" aria-hidden strokeWidth={2} />} label="Mağaza ücreti yok" />
              </div>
            </div>
          </div>

          <PhoneMockup
            variant="android"
            active={platform === "android"}
            onClick={() => setPlatform("android")}
          />
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent" aria-hidden strokeWidth={2.5} />
            Native app Hafta 6+ (React Native)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldBadge />
            SSL + HSTS şifreli
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" aria-hidden strokeWidth={2.5} />
            Otomatik güncellenir
          </span>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-accent/15 text-white border border-accent/40 shadow-sm"
          : "text-slate-400 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InstalledState() {
  return (
    <div className="text-center py-6" role="status">
      <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
        <Check className="w-7 h-7 text-emerald-400" aria-hidden strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold text-white">Uygulama kurulu</h3>
      <p className="mt-1 text-sm text-slate-400">
        Ana ekranından hemen açabilirsin. Güncellemeler otomatik gelir.
      </p>
    </div>
  );
}

function IosInstructions() {
  return (
    <ol className="space-y-4" aria-label="iOS kurulum adımları">
      <Step
        n={1}
        title="Safari'de paylaş butonuna dokun"
        body="Adres çubuğunun yanındaki paylaş ikonu."
        icon={<Share className="w-5 h-5" aria-hidden strokeWidth={2} />}
      />
      <Step
        n={2}
        title={<>&quot;Ana Ekrana Ekle&quot; seçeneğini bul</>}
        body="Listede biraz aşağı kaydırman gerekebilir."
        icon={<Plus className="w-5 h-5" aria-hidden strokeWidth={2.5} />}
      />
      <Step
        n={3}
        title="Ekle'ye bas — bitti"
        body="OtoSonar ikonu ana ekranında belirir. Açtığında Safari çubuğu görünmez."
        icon={<Check className="w-5 h-5" aria-hidden strokeWidth={2.5} />}
      />
      <div className="mt-4 rounded-lg border border-warn/20 bg-warn/5 px-3 py-2 text-xs text-warn/90 flex gap-2">
        <span aria-hidden>ℹ</span>
        <span>
          Chrome, Firefox ve diğer iOS tarayıcıları Apple kısıtlaması nedeniyle PWA kurulumunu
          desteklemez. <strong>Safari&apos;yi kullan.</strong>
        </span>
      </div>
    </ol>
  );
}

function AndroidInstructions({
  canInstall,
  onInstall,
}: {
  canInstall: boolean;
  onInstall: () => void;
}) {
  return (
    <div>
      {canInstall && (
        <button
          onClick={onInstall}
          className="btn-primary w-full justify-center mb-5 text-base py-3"
        >
          <Download className="w-5 h-5" aria-hidden strokeWidth={2.5} />
          Tek dokunuşla kur
        </button>
      )}
      <ol className="space-y-4" aria-label="Android kurulum adımları">
        <Step
          n={1}
          title="Chrome'da menüyü aç"
          body="Adres çubuğunun sağındaki üç nokta."
          icon={<MoreVertical className="w-5 h-5" aria-hidden strokeWidth={2} />}
        />
        <Step
          n={2}
          title={<>&quot;Uygulamayı yükle&quot; veya &quot;Ana ekrana ekle&quot;</>}
          body="Chrome uygulamayı tanıdıysa ilk seçenek, değilse ikincisi."
          icon={<Plus className="w-5 h-5" aria-hidden strokeWidth={2.5} />}
        />
        <Step
          n={3}
          title="Yükle'ye dokun — bitti"
          body="OtoSonar'ı uygulama çekmecende ve ana ekranda bulursun."
          icon={<Check className="w-5 h-5" aria-hidden strokeWidth={2.5} />}
        />
      </ol>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: number;
  title: React.ReactNode;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <div className="shrink-0 relative">
        <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
          {icon}
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bg border border-border text-[10px] font-bold text-accent flex items-center justify-center tabular-nums">
          {n}
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="font-semibold text-white text-[15px] leading-snug">{title}</div>
        <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{body}</div>
      </div>
      <ChevronRight
        className="w-4 h-4 text-slate-600 self-center hidden sm:block"
        aria-hidden
        strokeWidth={2}
      />
    </li>
  );
}

function PerkMini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-slate-400">
      <span className="text-accent">{icon}</span>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

function ShieldBadge() {
  return (
    <svg
      className="w-3 h-3 text-emerald-400"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.5}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PhoneMockup({
  variant,
  active,
  onClick,
}: {
  variant: "ios" | "android";
  active: boolean;
  onClick: () => void;
}) {
  const isIos = variant === "ios";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${isIos ? "iPhone" : "Android"} önizlemesini seç`}
      className={`group relative mx-auto transition-all duration-500 focus:outline-none ${
        active ? "scale-100 opacity-100" : "lg:scale-95 opacity-60 hover:opacity-100"
      }`}
    >
      <div
        className={`relative mx-auto rounded-[2.8rem] border transition-all duration-500 ${
          active
            ? "border-accent/40 shadow-2xl shadow-accent/20"
            : "border-border shadow-xl shadow-black/40"
        }`}
        style={{ width: 260, height: 540 }}
      >
        <div className="absolute inset-0 rounded-[2.8rem] bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0f] overflow-hidden">
          <div className="absolute inset-[3px] rounded-[2.65rem] bg-[#0a0a0f] overflow-hidden">
            {isIos ? <IosStatusBar /> : <AndroidStatusBar />}

            <PhoneScreen />

            {isIos ? <IosHomeIndicator /> : <AndroidNavBar />}
          </div>
        </div>

        {isIos && (
          <>
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[85px] h-[24px] rounded-full bg-black shadow-inner" />
            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[100px] h-[32px] rounded-[18px] bg-black" />
          </>
        )}

        {!isIos && (
          <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}

        <div className={`absolute -right-[2px] top-24 h-10 w-[3px] rounded-r ${active ? "bg-accent/40" : "bg-slate-700"}`} />
        <div className={`absolute -left-[2px] top-20 h-6 w-[3px] rounded-l ${active ? "bg-accent/40" : "bg-slate-700"}`} />
        <div className={`absolute -left-[2px] top-32 h-10 w-[3px] rounded-l ${active ? "bg-accent/40" : "bg-slate-700"}`} />
      </div>

      <div
        className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
          active
            ? "bg-accent/15 text-accent border border-accent/30"
            : "bg-panel text-slate-500 border border-border"
        }`}
      >
        {isIos ? (
          <Apple className="w-3 h-3" aria-hidden strokeWidth={2} />
        ) : (
          <Smartphone className="w-3 h-3" aria-hidden strokeWidth={2} />
        )}
        {isIos ? "iPhone" : "Android"}
      </div>
    </button>
  );
}

function IosStatusBar() {
  return (
    <div className="h-[44px] flex items-end justify-between px-6 pb-1 text-[11px] font-semibold text-white/90 tabular-nums">
      <span>09:41</span>
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 18 12" className="w-4 h-3 fill-current" aria-hidden>
          <circle cx="2" cy="10" r="1.5" />
          <circle cx="6" cy="8" r="1.5" />
          <circle cx="10" cy="6" r="1.5" />
          <circle cx="14" cy="3" r="1.5" />
        </svg>
        <svg viewBox="0 0 16 12" className="w-4 h-3 fill-current" aria-hidden>
          <path d="M8 10.5A6.5 6.5 0 0 1 1.5 4 6.5 6.5 0 0 1 14.5 4 6.5 6.5 0 0 1 8 10.5z" opacity="0.4" />
          <path d="M8 10.5A4 4 0 0 1 4 6.5 4 4 0 0 1 12 6.5 4 4 0 0 1 8 10.5z" opacity="0.7" />
          <circle cx="8" cy="9" r="1.5" />
        </svg>
        <div className="relative w-6 h-3 border border-white/70 rounded-[3px]">
          <div className="absolute top-0.5 left-0.5 w-[70%] h-[60%] bg-white rounded-sm" />
          <div className="absolute -right-[2px] top-1 w-[2px] h-1 bg-white/70 rounded-r" />
        </div>
      </div>
    </div>
  );
}

function AndroidStatusBar() {
  return (
    <div className="h-[30px] flex items-center justify-between px-5 text-[10px] font-medium text-white/90 tabular-nums">
      <span>09:41</span>
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 14 10" className="w-3.5 h-2.5 fill-current" aria-hidden>
          <rect x="0" y="5" width="2" height="5" opacity="0.8" />
          <rect x="4" y="3" width="2" height="7" opacity="0.9" />
          <rect x="8" y="1" width="2" height="9" />
          <rect x="12" y="0" width="2" height="10" />
        </svg>
        <span className="text-[9px]">91%</span>
        <div className="w-5 h-2.5 border border-white/70 rounded-[2px] relative">
          <div className="absolute inset-0.5 bg-white rounded-[1px] w-[80%]" />
        </div>
      </div>
    </div>
  );
}

function IosHomeIndicator() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1.5">
      <div className="w-32 h-1 bg-white/60 rounded-full" />
    </div>
  );
}

function AndroidNavBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-bg/80 backdrop-blur-sm flex items-center justify-center gap-12">
      <div className="w-2 h-2 rounded-full bg-white/40" />
      <div className="w-3 h-3 rounded-full border border-white/60" />
      <div className="w-3 h-3 bg-white/40 rotate-45" />
    </div>
  );
}

function PhoneScreen() {
  return (
    <div className="px-4 py-3 h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <LogoMark size={22} />
        <span className="text-[14px] font-black gradient-text">OtoSonar</span>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-accent/10 to-accent2/5 border border-accent/20 p-3 mb-3">
        <div className="text-[9px] uppercase tracking-wider text-accent/80 font-bold mb-1">
          Son analiz
        </div>
        <div className="text-xs font-bold text-white">Toyota Corolla 1.6 Advance</div>
        <div className="text-[10px] text-slate-400 mt-0.5">2020 · 87.000 km · İstanbul</div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-black gradient-text">₺685.000</span>
          <span className="text-[9px] text-emerald-400 font-semibold">emsal</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <MiniFlag severity="high" text="KM manipülasyon şüphesi" />
        <MiniFlag severity="medium" text="Motor revize edilmiş" />
        <MiniFlag severity="low" text="Değişen panel yok" />
      </div>

      <div className="rounded-lg border border-border bg-panel/60 px-2.5 py-2 flex items-center justify-between">
        <div>
          <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">
            Pazarlık skoru
          </div>
          <div className="text-sm font-black text-white tabular-nums">68 / 100</div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
          <Sparkles className="w-2.5 h-2.5" aria-hidden />
          25.000₺ fırsat
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <MiniAction label="Analiz" active />
        <MiniAction label="Pazar" />
        <MiniAction label="Panel" />
      </div>
    </div>
  );
}

function MiniFlag({
  severity,
  text,
}: {
  severity: "high" | "medium" | "low";
  text: string;
}) {
  const cfg = {
    high: "bg-danger/10 border-danger/30 text-danger",
    medium: "bg-warn/10 border-warn/30 text-warn",
    low: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  }[severity];
  return (
    <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-medium ${cfg}`}>
      <span className="w-1 h-1 rounded-full bg-current" aria-hidden />
      <span className="truncate">{text}</span>
    </div>
  );
}

function MiniAction({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`rounded-md px-1.5 py-1 text-center text-[9px] font-semibold ${
        active
          ? "bg-accent/20 border border-accent/40 text-white"
          : "bg-panel border border-border text-slate-500"
      }`}
    >
      {label}
    </div>
  );
}

// Make TS happy about unused import (Link was used in prior version; keep for future native badges).
void Link;
