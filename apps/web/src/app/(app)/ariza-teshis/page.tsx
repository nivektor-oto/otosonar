import { DiagnoseForm } from "./form";

export const metadata = {
  title: "AI Arıza Teşhis — OtoSonar",
  description: "Marka, model ve arıza tarifini gir, AI olası arıza nedenlerini + aciliyeti + tahmini tamir maliyetini çıkarsın.",
};

export default function ArizaTeshisPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            AI Arıza Teşhis
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Aracım şöyle ses çıkarıyor…
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Marka, model, km ve arıza tarifi gir. AI hem olası nedenleri hem de <strong className="text-white">aciliyet seviyesini</strong> söyler: Acil servis mi, yakın servis mi, takip et mi, normal mi? Tahmini tamir aralığı dahil.
          </p>
          <p className="mt-2 text-xs text-amber-400/80">
            Uyarı: AI yardımcıdır — resmi ekspertiz veya tamirci gözlemi yerine geçmez.
          </p>
        </div>
        <DiagnoseForm />
      </div>
    </main>
  );
}
