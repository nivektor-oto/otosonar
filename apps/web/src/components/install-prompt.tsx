"use client";

import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "otosonar.install.dismissed";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const inStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (inStandalone) return;

    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissed && Date.now() - dismissed < DISMISS_MS) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function accept() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible || !deferred) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="install-title"
      className="fixed left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px] z-40 animate-fade-up"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-panel/95 backdrop-blur-xl shadow-2xl shadow-accent/10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent2/10 pointer-events-none" />
        <button
          onClick={dismiss}
          aria-label="Kapat"
          className="absolute top-2 right-2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={14} aria-hidden />
        </button>
        <div className="relative p-5">
          <div className="flex items-start gap-3">
            <div className="icon-badge shrink-0">
              <Sparkles size={16} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 id="install-title" className="font-bold text-white text-sm">
                OtoSonar'ı cebine kur
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ana ekrandan tek dokunuşla aç, bildirimleri al, çevrimdışı geçmişe bak.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={accept} className="btn-primary flex-1 justify-center text-sm">
              <Download size={14} aria-hidden strokeWidth={2.5} />
              Kur
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Sonra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
