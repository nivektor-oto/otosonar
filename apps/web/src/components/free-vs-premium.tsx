import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

type Feature = { label: string; free: string | boolean; premium: string | boolean };

const features: Feature[] = [
  { label: "İlan yapıştırıp hızlı fiyat kontrolü", free: true, premium: true },
  { label: "Temel emsal değer + pazarlık skoru", free: true, premium: true },
  { label: "Pazaryeri ilanlarını görüntüleme", free: true, premium: true },
  { label: "İlk 2 ilan ücretsiz paylaşma", free: true, premium: "Pakete dahil 7–25 ilan" },
  { label: "Detaylı analiz / ay", free: "3 analiz", premium: "Sınırsız" },
  { label: "Gizli arıza + km manipülasyon tespiti", free: false, premium: true },
  { label: "Fotoğraftan hasar / boya AI", free: false, premium: true },
  { label: "Plaka OCR + VIN sorgu", free: false, premium: true },
  { label: "Günlük fırsat bildirimi (push + WA)", free: false, premium: true },
  { label: "Galerici kâr motoru (stok / marj / timeline)", free: false, premium: true },
  { label: "Haftalık pazar raporu + Chrome eklentisi", free: false, premium: true },
  { label: "Rapor PDF indirme + QR paylaşım", free: false, premium: true },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/15 text-accent">
        <Check className="w-3.5 h-3.5" aria-hidden strokeWidth={3} />
      </span>
    );
  }
  if (v === false) {
    return <span className="text-slate-600 text-xs">—</span>;
  }
  return <span className="text-xs font-semibold text-slate-200">{v}</span>;
}

export function FreeVsPremium() {
  return (
    <section className="py-20 border-t border-border bg-panel/20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Ücretsiz vs Premium
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ücretsiz başla, <span className="gradient-text">gerek duyunca yükselt</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Kayıt olunca 3 analizin ve 2 ücretsiz ilanın var. Daha fazlasına ihtiyacın olursa Plus, Pro ya da Max'e geç.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-border bg-panel/40">
          <div className="grid grid-cols-[1fr_110px_130px] sm:grid-cols-[1fr_150px_170px] border-b border-border bg-panel/60">
            <div className="px-4 sm:px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Özellik
            </div>
            <div className="px-3 py-4 text-center">
              <div className="text-xs font-bold text-slate-300">Ücretsiz</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sonsuza kadar</div>
            </div>
            <div className="px-3 py-4 text-center bg-accent/5">
              <div className="text-xs font-bold text-accent">Premium</div>
              <div className="text-[10px] text-accent/80 mt-0.5">99 TL/ay'dan</div>
            </div>
          </div>
          {features.map((f, i) => (
            <div
              key={f.label}
              className={`grid grid-cols-[1fr_110px_130px] sm:grid-cols-[1fr_150px_170px] items-center ${
                i % 2 === 0 ? "bg-transparent" : "bg-panel/20"
              }`}
            >
              <div className="px-4 sm:px-6 py-3 text-sm text-slate-200">{f.label}</div>
              <div className="px-3 py-3 text-center"><Cell v={f.free} /></div>
              <div className="px-3 py-3 text-center bg-accent/5"><Cell v={f.premium} /></div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link href="/kayit" className="btn-ghost inline-flex items-center gap-2">
            Ücretsiz hesap aç
          </Link>
          <Link href="#pricing" className="btn-primary inline-flex items-center gap-2">
            Premium paketlere bak
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </Link>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">
          Premium'da 3 gün ücretsiz dene · İstediğin zaman iptal · Yıllık ödemede 2 ay hediye
        </p>
      </div>
    </section>
  );
}
