import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Ödemeniz onaylandı | OtoSonar",
  description: "OtoSonar paket ödemesi başarıyla alındı.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<{
    paket?: string;
    referans?: string;
    sip?: string;
  }>;
}

export default async function OdemeBasariliPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const paket = (sp.paket || "").toString().slice(0, 30);
  const referans = (sp.referans || sp.sip || "").toString().slice(0, 80);

  return (
    <main className="min-h-dvh bg-bg flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/40 flex items-center justify-center mb-6">
            <CheckCircle2
              className="w-12 h-12 text-emerald-500"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ödemeniz <span className="text-emerald-500">onaylandı</span>
          </h1>
          <p className="mt-4 text-slate-600 leading-relaxed max-w-md">
            Teşekkürler — OtoSonar ekibi olarak hoş geldiniz. Ödeme servisi
            işlemi başarıyla tamamladı; aboneliğiniz birkaç dakika içinde
            hesabınızda aktif olacak.
          </p>
        </div>

        {(paket || referans) && (
          <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
            {paket && (
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Paket</span>
                <strong className="text-slate-900">{paket}</strong>
              </div>
            )}
            {referans && (
              <div className="flex justify-between">
                <span className="text-slate-500">Referans</span>
                <code className="font-mono text-xs text-slate-700">
                  {referans}
                </code>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <Mail
              className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
              aria-hidden
            />
            <span>
              Onay e-postası ve fatura kayıtlı adresinize gönderilecek
              (en fazla 24 saat).
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
              aria-hidden
            />
            <span>
              Aboneliğiniz aktive olunca dashboard'da "Aktif" rozeti görürsünüz.
              Eğer 24 saat içinde aktif olmazsa{" "}
              <a
                href="mailto:destek@otosonar.com"
                className="text-emerald-600 hover:underline font-semibold"
              >
                destek@otosonar.com
              </a>{" "}
              adresine yazın.
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="btn-primary text-center inline-flex items-center justify-center gap-2"
          >
            Kontrol Paneline Git
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </Link>
          <Link
            href="/"
            className="btn-ghost text-center"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
