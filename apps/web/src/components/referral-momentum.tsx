"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Gift, Copy, Share2, MessageCircle, Check } from "lucide-react";

interface Props {
  code: string;
  shareUrl: string;
  uses: number;
  pendingReward: number;
  earnedDays: number;
  inviterName?: string | null;
}

export function ReferralMomentum({
  code,
  shareUrl,
  uses,
  pendingReward,
  earnedDays,
  inviterName,
}: Props) {
  const [copied, setCopied] = useState(false);

  const waText = encodeURIComponent(
    `${inviterName ? inviterName + " seni davet etti: " : ""}OtoSonar — Türkiye'nin ilk AI araç analiz platformu. 8 saniyede gerçek pazar değeri, gizli arıza tespiti, pazarlık skoru.\n\nBenim linkimle ücretsiz başla → ${shareUrl}\n\nHer dostuna +30 gün Plus hediye.`,
  );

  const wa = `https://wa.me/?text=${waText}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanamadı — elle seç");
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "OtoSonar — AI araç analizi",
          text: "Her davet ettiğin arkadaşa +30 gün Plus hediye.",
          url: shareUrl,
        });
      } catch {
        // user cancelled — noop
      }
    } else {
      handleCopy();
    }
  }

  return (
    <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent2/5 to-transparent p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
          <Gift className="w-6 h-6 text-accent" aria-hidden strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Davet ettiğin her arkadaşa <span className="gradient-text">+30 gün Plus</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Kod paylaş, arkadaşın kayıt olunca ikinize de 30 gün Plus abonelik hediye. Sınır yok.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Davet sayısı" value={String(uses)} />
        <Stat label="Bekleyen ödül" value={`${pendingReward} gün`} />
        <Stat label="Kazanılan" value={`${earnedDays} gün`} highlight />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-panel/60 p-3 flex items-center gap-2">
        <div className="flex-1 font-mono text-xs sm:text-sm text-slate-200 truncate pl-2" aria-label="Davet kodu">
          {shareUrl}
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-panel border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
          aria-label="Davet linkini kopyala"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent" aria-hidden strokeWidth={3} />
              Kopyalandı
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
              Kopyala
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-black font-bold px-5 py-3 text-sm hover:brightness-95 transition"
        >
          <MessageCircle className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          WhatsApp'tan gönder
        </a>
        <button
          onClick={handleShare}
          className="btn-ghost inline-flex items-center justify-center gap-2 flex-1"
        >
          <Share2 className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          Paylaş
        </button>
      </div>
      <p className="mt-3 text-[10px] text-slate-500 text-center">
        Kod: <span className="font-mono text-slate-300">{code}</span> · Abone olunca ödül verilir · Kötüye kullanım engellenir
      </p>
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        highlight ? "border-accent/40 bg-accent/10" : "border-border bg-panel/40"
      }`}
    >
      <div className={`text-lg font-black tabular-nums ${highlight ? "text-accent" : "text-white"}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}
