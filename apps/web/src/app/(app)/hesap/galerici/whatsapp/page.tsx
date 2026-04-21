import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "WhatsApp ile ilan ekle — OtoSonar" };

export default async function DealerWhatsappSetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/galerici/whatsapp");
  if (user.userType !== "DEALER") redirect("/hesap");

  const dealer = await prisma.dealer.findUnique({
    where: { userId: user.id },
    select: { phone: true, verificationStatus: true },
  });
  if (!dealer) redirect("/hesap/galerici");

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com";
  const webhookUrl = `${siteBase}/api/wa/webhook`;
  const verifyTokenSet = Boolean(process.env.WA_VERIFY_TOKEN);
  const appSecretSet = Boolean(process.env.WA_APP_SECRET);

  const phoneDisplay = dealer.phone ? formatTrPhone(dealer.phone) : null;

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 uppercase tracking-wider">
            Dealer · Otomasyon
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp ile ilan ekle</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Stoğuna yeni araç eklerken tek cümle WhatsApp mesajı yaz — OtoSonar mesajı parse edip
            pazaryerinde taslak ilan oluştursun. Örnek:{" "}
            <span className="font-mono text-emerald-300">
              “BMW 520i 2019 165000 km 1.350.000 TL Konya dizel otomatik”
            </span>
          </p>
        </header>

        <section className="rounded-2xl border border-amber-700/40 bg-amber-900/20 p-4 text-sm text-amber-200">
          <div className="font-semibold text-amber-100">Kurulum bekleniyor</div>
          <p className="mt-1 text-amber-200/80">
            Bu özellik Meta Business hesabı gerektirir. Aktif olana kadar WhatsApp mesajları
            işlenmez — aşağıdaki adımları tamamlayıp env değişkenlerini bize iletince devreye alırız.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="text-sm font-semibold text-neutral-200 mb-4 uppercase tracking-wider">
            Telefon Durumu
          </h2>
          {phoneDisplay ? (
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                ✓
              </div>
              <div>
                <div className="font-mono text-sm">{phoneDisplay}</div>
                <div className="text-xs text-neutral-500">
                  {dealer.verificationStatus === "VERIFIED"
                    ? "Doğrulandı — mesajlar bu numaradan geldiğinde eşleşecek"
                    : "Kayıtlı numara — dealer verifikasyonu bekliyor"}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-700/40 bg-red-900/20 p-4 text-sm">
              <div className="font-semibold text-red-300">Telefon numaran yok</div>
              <p className="mt-1 text-red-200/80">
                Bu endpoint dealer’ı telefon numarasıyla eşleştiriyor. Önce{" "}
                <Link href="/hesap/galerici" className="underline hover:text-red-100">
                  /hesap/galerici
                </Link>{" "}
                sayfasından numaranı <span className="font-mono">+90 5XX XXX XX XX</span>{" "}
                formatında ekle.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="text-sm font-semibold text-neutral-200 mb-4 uppercase tracking-wider">
            Meta Business — Kurulum Adımları
          </h2>
          <ol className="space-y-4 text-sm text-neutral-300">
            <Step n={1}>
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noreferrer noopener"
                className="text-emerald-400 underline hover:text-emerald-300"
              >
                Meta Business hesabı aç
              </a>{" "}
              (developers.facebook.com). İş maili ve şirket bilgilerini doğrula.
            </Step>
            <Step n={2}>
              <b>WhatsApp Business Cloud API</b>’yi aktifleştir, bir telefon numarası al (Meta
              sandbox test numarası ücretsiz; prod için kendi numaranı ekleyebilirsin).
            </Step>
            <Step n={3}>
              Webhook URL olarak aşağıdaki adresi gir:
              <div className="mt-2 rounded-lg border border-neutral-700 bg-black/40 p-3 font-mono text-xs text-emerald-300 break-all">
                {webhookUrl}
              </div>
            </Step>
            <Step n={4}>
              <b>Verify Token</b> olarak <span className="font-mono">WA_VERIFY_TOKEN</span> env
              değerini gir{" "}
              <EnvBadge ok={verifyTokenSet} />
              . Meta bu değerle GET çağrısı yapacak; eşleşmezse doğrulama başarısız.
            </Step>
            <Step n={5}>
              <b>App Secret</b>’ı OtoSonar ekibine ilet —{" "}
              <span className="font-mono">WA_APP_SECRET</span> olarak saklanacak{" "}
              <EnvBadge ok={appSecretSet} />. Her gelen mesaj bu secret ile
              HMAC-SHA256 imzalanır, biz doğrularız.
            </Step>
            <Step n={6}>
              Profil ayarlarından telefon numaranı <span className="font-mono">+90 5XX XXX XX XX</span>{" "}
              formatında <Link href="/hesap/galerici" className="underline hover:text-neutral-100">galerici bilgilerine</Link>{" "}
              ekle. Bu endpoint dealer’ı telefon numarasıyla eşleştirir — numara kayıtlı değilse
              mesaj sessizce yok sayılır.
            </Step>
            <Step n={7}>
              Test: Meta üzerinden onaylı numarana WhatsApp’tan şunu yaz:
              <div className="mt-2 rounded-lg border border-neutral-700 bg-black/40 p-3 font-mono text-xs text-emerald-300">
                BMW 520i 2019 165000 km 1.350.000 TL Konya dizel otomatik
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Başarılıysa{" "}
                <Link
                  href="/pazaryeri"
                  className="underline hover:text-neutral-300"
                >
                  pazaryerinde
                </Link>{" "}
                yeni bir <span className="font-mono">DRAFT</span> ilan belirir.
              </div>
            </Step>
          </ol>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6 text-sm text-neutral-400">
          <h2 className="text-sm font-semibold text-neutral-200 mb-2 uppercase tracking-wider">
            Nasıl çalışır
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>WhatsApp’tan gelen serbest metin OtoSonar AI ile parse edilir.</li>
            <li>
              Marka + fiyat tespit edilirse pazaryerinde <span className="font-mono">DRAFT</span>{" "}
              durumunda ilan yaratılır — sen kontrol edip <b>Yayınla</b>’ya basarsın.
            </li>
            <li>
              Parse güveni düşükse (ör. eksik bilgi) ilan oluşturulmaz, mesaj log’a düşer.
            </li>
            <li>WhatsApp Business API dakikada yüzlerce mesaj destekler; rate-limit yok.</li>
          </ul>
        </section>

        <div className="text-xs text-neutral-500">
          Sorun olursa{" "}
          <Link href="/hesap" className="underline hover:text-neutral-300">
            hesap sayfasına
          </Link>{" "}
          dönebilirsin.
        </div>
      </div>
    </main>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="shrink-0 size-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">
        {n}
      </div>
      <div className="flex-1 leading-relaxed">{children}</div>
    </li>
  );
}

function EnvBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        ok
          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
      }`}
    >
      {ok ? "env set" : "env eksik"}
    </span>
  );
}

function formatTrPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return raw;
  return `+90 ${last10.slice(0, 3)} ${last10.slice(3, 6)} ${last10.slice(6, 8)} ${last10.slice(8, 10)}`;
}
