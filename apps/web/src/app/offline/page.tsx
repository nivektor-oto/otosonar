import Link from "next/link";
import { WifiOff, RefreshCw, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/logo";

export const metadata = {
  title: "Çevrimdışı — OtoSonar",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-panel border border-border flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-slate-400" aria-hidden strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-black mb-3">Şu an çevrimdışısın</h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          OtoSonar bağlantı kurulduğunda yeniden çalışacak. Önceden açtığın sayfaları
          hâlâ görebilirsin, yeni analizler için internete ihtiyaç var.
        </p>

        <div className="space-y-3">
          <Link href="/" className="btn-primary w-full justify-center">
            <RefreshCw className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            Tekrar dene
          </Link>
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-panel/60 px-4 py-3 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            Önceki analizlerime dön
          </Link>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-panel/40 px-3 py-1.5 text-xs text-slate-500">
          <LogoMark size={14} />
          <span>OtoSonar PWA · v1</span>
        </div>

        <div className="mt-6 text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          <span>Uygulamayı ana ekrana kurmadıysan bunu öner: 3 saniyede olur</span>
        </div>
      </div>
    </main>
  );
}
