"use client";

/**
 * PaywallModal — 402 response geldiğinde açılacak modal.
 *
 * Kullanım:
 *   const [paywall, setPaywall] = useState<PaywallErrorBody | null>(null);
 *   const res = await fetch(...);
 *   if (res.status === 402 || res.status === 401) {
 *     const body = await res.json();
 *     setPaywall(body);
 *     return;
 *   }
 *   ...
 *   <PaywallModal data={paywall} onClose={() => setPaywall(null)} />
 *
 * Shadcn/Radix gerekmiyor — sade div overlay.
 */

import { useEffect } from "react";
import Link from "next/link";
import { X, Zap, ArrowRight } from "lucide-react";

export interface PaywallErrorBody {
  error: "paywall" | "unauthenticated" | string;
  reason?: string;
  currentTier?: string;
  requiredTier?: string;
  limit?: number;
  used?: number;
  message?: string;
}

const TIER_LABELS: Record<string, string> = {
  FREE: "Ücretsiz",
  PLUS: "Plus",
  PRO: "Pro",
  BAYI_PLUS: "Bayi Plus",
  BAYI_PRO: "Bayi Pro",
  BAYI_MAX: "Bayi Max",
};

export interface PaywallModalProps {
  data: PaywallErrorBody | null;
  onClose: () => void;
}

export function PaywallModal({ data, onClose }: PaywallModalProps) {
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [data, onClose]);

  if (!data) return null;

  const isAuth = data.error === "unauthenticated";
  const required = data.requiredTier ?? "PLUS";
  const requiredLabel = TIER_LABELS[required] ?? required;
  const currentLabel = TIER_LABELS[data.currentTier ?? "FREE"] ?? "Ücretsiz";

  const cta = isAuth
    ? { href: "/kayit", label: "Hesap aç" }
    : { href: `/fiyatlar?highlight=${required}`, label: `${requiredLabel}'e yükselt` };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-panel border border-border p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Kapat"
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <Zap className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {isAuth ? "Önce hesap açın" : "Paket yükseltmeniz gerekli"}
            </div>
            <div className="text-xs text-slate-500">
              Mevcut paket:{" "}
              <span className="font-semibold text-slate-700">
                {currentLabel}
              </span>{" "}
              → {requiredLabel}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          {data.message ??
            (isAuth
              ? "Bu özelliği kullanmak için ücretsiz bir hesap açın."
              : "Bu özellik mevcut paketinizde sınırlı. Yükselterek devam edin.")}
        </p>

        {typeof data.limit === "number" && typeof data.used === "number" && (
          <div className="mb-5 text-xs text-slate-500 bg-bg p-3 rounded-lg border border-border">
            Bu dönem kullanım:{" "}
            <strong className="text-slate-800">{data.used}</strong> / {data.limit}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full font-semibold border border-border text-slate-700 hover:bg-bg transition"
          >
            Kapat
          </button>
          <Link
            href={cta.href}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full font-bold bg-gradient-to-r from-accent to-accent2 text-slate-900 hover:opacity-90 transition"
          >
            {cta.label}
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Fetch helper — 401/402 olursa paywall modal data'sını döndürür, aksi halde response'u.
 */
export async function fetchWithPaywall(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ res: Response; paywall: PaywallErrorBody | null }> {
  const res = await fetch(input, init);
  if (res.status === 401 || res.status === 402) {
    try {
      const body = (await res.clone().json()) as PaywallErrorBody;
      if (body && (body.error === "paywall" || body.error === "unauthenticated")) {
        return { res, paywall: body };
      }
    } catch {
      // ignore JSON parse errors
    }
  }
  return { res, paywall: null };
}
