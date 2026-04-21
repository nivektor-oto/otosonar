"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const LAUNCH_AT = new Date("2026-05-12T10:00:00+03:00").getTime();

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(now: number): Parts {
  const ms = Math.max(0, LAUNCH_AT - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

export function CountdownTimer() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(diff(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const done = parts !== null && parts.days <= 0 && parts.hours <= 0 && parts.minutes <= 0 && parts.seconds <= 0;

  return (
    <Link
      href="/bekleme-listesi"
      aria-label="Lansmana kalan süre — Kurucu Kulübü'ne katıl"
      className="relative overflow-hidden border-b border-accent/20 bg-gradient-to-r from-accent/10 via-accent2/5 to-accent/10 block hover:brightness-125 transition"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 text-slate-200">
          <Sparkles className="w-4 h-4 text-accent shrink-0" aria-hidden strokeWidth={2.5} />
          <strong className="text-white">12 Mayıs lansman</strong>
          <span className="text-slate-400 hidden sm:inline">·</span>
        </span>
        {parts && !done && (
          <span
            className="inline-flex items-center gap-1.5 tabular-nums font-bold text-white"
            aria-live="polite"
            aria-atomic="true"
          >
            <Unit n={parts.days} label="gün" />
            <span className="text-slate-500">:</span>
            <Unit n={parts.hours} label="sa" />
            <span className="text-slate-500">:</span>
            <Unit n={parts.minutes} label="dk" />
            <span className="text-slate-500 hidden sm:inline">:</span>
            <span className="hidden sm:inline">
              <Unit n={parts.seconds} label="sn" />
            </span>
          </span>
        )}
        {done && (
          <span className="font-bold text-accent">Lansman başladı!</span>
        )}
        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-slate-300">
          Kurucu Kulübü kapanıyor · <span className="text-white font-bold">37/100</span> kaldı ·{" "}
          <span className="text-accent underline underline-offset-2 inline-flex items-center gap-1">
            katıl <ArrowRight className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          </span>
        </span>
      </div>
    </Link>
  );
}

function Unit({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span>{String(n).padStart(2, "0")}</span>
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
    </span>
  );
}
