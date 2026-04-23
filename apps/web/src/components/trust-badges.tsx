import { ShieldCheck, RotateCcw, Award, BadgeCheck } from "lucide-react";

const badges = [
  {
    Icon: BadgeCheck,
    title: "AI destekli tahmin",
    desc: "AI pazar bilgisi ve büyüyen galerici ağı verisiyle her gün kalibre olur.",
    source: "Her raporda güven skoru",
  },
  {
    Icon: RotateCcw,
    title: "30 gün para iade",
    desc: "İlk 30 gün içinde sorun çıkarsa tek tıkla iade — koşulsuz.",
    source: "Kart + havale iade",
  },
  {
    Icon: ShieldCheck,
    title: "KVKK + VERBİS",
    desc: "Veri sorumlusu sıfatıyla kayıtlı. Her rapor şifreli, audit log'lu.",
    source: "VERBİS aktif",
  },
  {
    Icon: Award,
    title: "OtoSonar Onaylı",
    desc: "Her AI raporu çoklu model kontrol + güven skoruyla işaretlenir.",
    source: "OtoSonar AI çift-model kontrolü",
  },
];

export function TrustBadges() {
  return (
    <section
      aria-label="Güven rozetleri"
      className="py-10 sm:py-14 border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {badges.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-panel/40 p-4 sm:p-5 flex flex-col gap-2"
            >
              <b.Icon
                className="w-6 h-6 text-accent"
                aria-hidden
                strokeWidth={2}
              />
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                {b.title}
              </h3>
              <p className="text-[12px] sm:text-xs text-slate-400 leading-relaxed">
                {b.desc}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-auto pt-1.5 font-mono">
                {b.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
