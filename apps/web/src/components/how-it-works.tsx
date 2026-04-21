import { Clipboard, Sparkles, ShoppingCart } from "lucide-react";

const steps = [
  {
    n: "01",
    Icon: Clipboard,
    title: "İlanı yapıştır",
    body: "Sahibinden veya arabam.com linkini kopyala-yapıştır — ya da aracın marka, model, km bilgisini gir.",
    hint: "3 saniye",
  },
  {
    n: "02",
    Icon: Sparkles,
    title: "AI analiz etsin",
    body: "Gemini 2.5 + Claude Haiku çift-model kontrol: gerçek pazar değeri, gizli arıza, pazarlık skoru.",
    hint: "8 saniye",
  },
  {
    n: "03",
    Icon: ShoppingCart,
    title: "Karar ver",
    body: "Al, pazarla ya da vazgeç — rapor sonunda sana net tavsiye ve aksiyon adımları çıkar.",
    hint: "Rapor indir · QR ile paylaş",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Nasıl çalışır
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            11 saniyede <span className="gradient-text">karar</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-lg mx-auto">
            3 adım. Kayıt ol, ilanı yapıştır, raporu oku — karar senin.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="card card-interactive relative animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute top-4 right-4 text-[10px] font-semibold text-accent tabular-nums">{s.n}</div>
              <div className="icon-badge mb-5">
                <s.Icon className="w-5 h-5" aria-hidden strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-lg tracking-tight mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{s.body}</p>
              <div className="text-[11px] text-accent font-semibold uppercase tracking-wider">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
