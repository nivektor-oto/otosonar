"use client";

/**
 * PageTour — sayfa-spesifik onboarding turu.
 *
 * Kullanım:
 *   <PageTour
 *     id="dashboard"
 *     steps={[
 *       { selector: "[data-tour='nav-analiz']", title: "AI Analiz", body: "Buradan..." },
 *       { title: "Bitirdiniz", body: "Sorularınız için /iletisim'e yazın." },
 *     ]}
 *   />
 *
 * Davranış:
 *  - localStorage'da `tour:{id}:v{version}` varsa hiç açılmaz
 *  - "Atla" → kalıcı kapat
 *  - "Tamam" (son step) → kalıcı kapat
 *  - "Tekrar göster": window.dispatchEvent(new Event(`tour:restart:${id}`))
 *  - Selector bulunamazsa o adım merkez modunda gösterilir (skip değil)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TourStep = {
  /** CSS selector — bulunmazsa adım sayfa ortasında metin olarak gösterilir. */
  selector?: string;
  title: string;
  body: string;
  /** Eyleme yönlendirme — "Bunu dene" gibi. */
  cta?: string;
};

type Props = {
  id: string;
  steps: TourStep[];
  /** Versiyon arttırınca eski 'seen' invalid olur, tur tekrar gösterilir. */
  version?: number;
  /** Mount sonrası ne kadar bekleyip başlasın (ms) */
  startDelayMs?: number;
};

export function PageTour({ id, steps, version = 1, startDelayMs = 800 }: Props) {
  const storageKey = `tour:${id}:v${version}`;
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = steps.length;
  const step = steps[idx];
  const isLast = idx >= total - 1;

  const start = useCallback(() => {
    setIdx(0);
    setActive(true);
  }, []);

  const dismiss = useCallback(
    (mark: "skipped" | "completed") => {
      try {
        localStorage.setItem(storageKey, mark);
      } catch {
        /* private mode */
      }
      setActive(false);
    },
    [storageKey]
  );

  // Auto-start logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(storageKey);
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = window.setTimeout(start, startDelayMs);
    return () => window.clearTimeout(t);
  }, [storageKey, start, startDelayMs]);

  // Manual restart event
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      start();
    };
    window.addEventListener(`tour:restart:${id}`, handler);
    return () => window.removeEventListener(`tour:restart:${id}`, handler);
  }, [id, storageKey, start]);

  // Compute target rect for current step
  useEffect(() => {
    if (!active || !step) {
      setRect(null);
      return;
    }
    const compute = () => {
      if (!step.selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.selector);
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      // küçük gecikme ile rect al — scroll bitsin
      window.setTimeout(() => {
        setRect(el.getBoundingClientRect());
      }, 250);
    };
    compute();
    const onScrollOrResize = () => {
      if (!step.selector) return;
      const el = document.querySelector(step.selector);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [active, step]);

  // ESC kapatır
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss("skipped");
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, dismiss, total]);

  const captionStyle = useMemo<React.CSSProperties>(() => {
    if (!rect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: 420,
      };
    }
    const margin = 16;
    const cw = 360;
    const ch = 180;
    let top = rect.bottom + margin;
    let left = rect.left + rect.width / 2 - cw / 2;
    if (top + ch > window.innerHeight - margin) {
      top = rect.top - ch - margin;
    }
    if (top < margin) top = margin;
    if (left < margin) left = margin;
    if (left + cw > window.innerWidth - margin)
      left = window.innerWidth - cw - margin;
    return { top, left, width: cw };
  }, [rect]);

  if (!active || !step) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      {/* Overlay + spotlight */}
      {rect ? (
        <div
          className="absolute pointer-events-none"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            borderRadius: 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
            transition: "all 220ms ease",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/72" />
      )}

      {/* Caption box */}
      <div
        className="absolute rounded-xl border border-orange-500/40 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur"
        style={captionStyle}
      >
        <div className="mb-1 flex items-center justify-between text-xs text-orange-300/80">
          <span>
            Adım {idx + 1} / {total}
          </span>
          <button
            type="button"
            onClick={() => dismiss("skipped")}
            className="rounded px-2 py-0.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
          >
            Atla
          </button>
        </div>
        <h3
          id="tour-title"
          className="text-base font-semibold text-orange-300"
        >
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-200">
          {step.body}
        </p>
        {step.cta && (
          <p className="mt-2 text-xs text-orange-300/90">{step.cta}</p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(i - 1, 0))}
            disabled={idx === 0}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Geri
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={() => dismiss("completed")}
              className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              Tamam, başlayalım
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(i + 1, total - 1))}
              className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              İleri
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Yardımcı: Tour'u manuel başlatma butonu.
 * Settings/Yardım menüsüne eklenir, kullanıcı isterse turu tekrar açar.
 */
export function RestartTourButton({
  id,
  className = "text-sm text-orange-400 hover:underline",
  children = "Turu yeniden göster",
}: {
  id: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event(`tour:restart:${id}`))
      }
      className={className}
    >
      {children}
    </button>
  );
}
