export const metadata = { title: "Gizlilik Politikası — OtoSonar" };

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">Gizlilik Politikası</h1>
        <p className="text-xs text-neutral-500">Son güncelleme: 21 Nisan 2026</p>

        <p>
          OtoSonar ("biz", "Platform") olarak gizliliğe saygı gösteriyoruz. Topladığımız veriler minimum
          düzeydedir ve sadece hizmeti sunmak için kullanılır.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Toplanan Veriler</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hesap bilgileri: ad, e-posta, şifrenin bcrypt hash'i</li>
            <li>Analiz girdileri: ilan URL'si, araç bilgileri</li>
            <li>Teknik: IP hash'i (salted SHA-256), tarayıcı, cihaz tipi</li>
            <li>Çerez: yalnızca oturum devamlılığı için HttpOnly cookie</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Üçüncü Taraflar</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b>Vercel</b>: Hosting (Frankfurt)
            </li>
            <li>
              <b>Neon</b>: Veritabanı (Frankfurt, AWS eu-central-1)
            </li>
            <li>
              <b>Cloudflare</b>: DNS + DDoS koruma
            </li>
            <li>
              <b>Lisanslı 3. taraf AI altyapı sağlayıcıları</b> (ABD/AB merkezli, KVKK uyumlu sözleşmeler kapsamında): AI analizi — yalnızca anonim ilan metni/fotoğraf gönderilir
            </li>
            <li>
              <b>İyzico / PayTR</b>: Ödeme (PCI-DSS uyumlu; kart bilgisi OtoSonar'a ulaşmaz)
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Çerezler</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code>otosonar_session</code> — oturum, HttpOnly, Secure, SameSite=Lax, 30 gün
            </li>
            <li>
              <code>otosonar_analytics</code> — anonim ziyaretçi ID, 180 gün
            </li>
          </ul>
          <p>
            Tarayıcı ayarlarından çerezleri reddedebilirsin; bu durumda oturum açık kalmaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Güvenlik</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>TLS 1.3 (Cloudflare + Vercel)</li>
            <li>Şifreler bcrypt cost 12 ile hashlenir</li>
            <li>Oturum token'ı HMAC-SHA256 ile imzalanır</li>
            <li>IBAN ve hassas alanlar AES-256-GCM ile uygulama katmanında şifrelenir</li>
            <li>Rate limiting tüm kritik endpoint'lerde</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">İletişim</h2>
          <p>
            Sorular için:{" "}
            <a href="mailto:kvkk@otosonar.com" className="text-emerald-400 hover:underline">
              kvkk@otosonar.com
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
