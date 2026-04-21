"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 1500, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.floor(eased * target));
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return value;
}

export default function StatsCountUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const avgSeconds = useCountUp(8, 1200, inView);
  const accuracy = useCountUp(92, 1500, inView);
  const dealers = useCountUp(15000, 2000, inView);

  const items = [
    { n: `< ${avgSeconds} sn`, l: "Ortalama analiz süresi" },
    { n: `%${accuracy}`, l: "Emsal değer doğruluğu" },
    { n: `${dealers.toLocaleString("tr-TR")}+`, l: "Galerici pazar hacmi (TR)" },
    { n: "GİB + KVKK", l: "Tam uyumlu altyapı" },
  ];

  return (
    <section
      ref={ref}
      className="py-16 border-y border-border bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent"
    >
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {items.map((it) => (
          <div key={it.l}>
            <div className="text-3xl md:text-4xl font-bold gradient-text tabular-nums tracking-tight">
              {it.n}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-2 font-medium">
              {it.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
