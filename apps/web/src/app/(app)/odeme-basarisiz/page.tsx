import Link from "next/link";
import type { Metadata } from "next";
import { XCircle, ArrowRight, Mail, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Ödeme tamamlanamadı | OtoSonar",
  description: "OtoSonar ödemesi başarısız oldu. Tekrar deneyin veya bizimle iletişime geçin.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<{
    sebep?: string;
    referans?: string;
  }>;
}

export default async function OdemeBasarisizPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const sebep = (sp.sebep || "").toString().slice(0, 100);
  const referans = (sp.referans || "").toString().slice(0, 80);

  return (
    <main className="min-h-dvh bg-bg flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/15 ring-2 ring-red-500/40 flex items-center justify-center mb-6">
            <XCircle
              className="w-12 h-12 text-red-500"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ödeme tamamlanamadı
          </h1>
          <p className="mt-4 text-slate-600 leading-relaxed max-w-md">
            Bir sorun nedeniyle ödemeniz alınamadı. Hesabınızdan tahsilat{" "}
            <strong>yapılmadı</strong> — endişelenmenize gerek yok.
          </p>
        </div>

        {(sebep || referans) && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">
            {sebep && (
              <div className="mb-1">
                <span className="text-slate-500">Sebep:</span>{" "}
                <span className="text-slate-800">{sebep}</span>
              </div>
            )}
            {referans && (
              <div className="text-xs text-slate-500">
                Referans:{" "}
                <code className="font-mono text-slate-700">{referans}</code>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <RefreshCw
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              aria-hidden
            />
            <span>
              Tekrar denemek isterseniz{" "}
              <Link
                href="/fiyatlar"
                className="text-red-600 hover:underline font-semibold"
              >
                Fiyatlar
              </Link>{" "}
              sayfasından paketinizi tekrar seçebilirsiniz.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Mail
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              aria-hidden
            />
            <span>
              Sorun devam ederse{" "}
              <a
                href="mailto:destek@otosonar.com"
                className="text-red-600 hover:underline font-semibold"
              >
                destek@otosonar.com
              </a>{" "}
              adresine yazın — en geç 4 saat içinde dönüş yapılır.
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/fiyatlar"
            className="btn-primary text-center inline-flex items-center justify-center gap-2"
          >
            Tekrar Dene
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </Link>
          <Link href="/" className="btn-ghost text-center">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
