import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çerez Politikası — OtoSonar",
  description:
    "OtoSonar tarafından kullanılan zorunlu, performans ve pazarlama çerezleri; üçüncü taraf çerezleri ve onay yönetimi hakkında bilgi.",
  robots: { index: true, follow: true },
};

function DraftBanner() {
  return (
    <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 p-4 my-6">
      <div className="font-bold text-yellow-700 dark:text-yellow-400">
        ⚠ TASLAK — Avukat Onayı Bekliyor
      </div>
      <p className="text-sm mt-1 text-yellow-900 dark:text-yellow-200">
        Bu metin 30 Nisan 2026 tarihinde hazırlanmış ön taslaktır. Hukuk
        danışmanı onayı sonrası yürürlüğe girecektir. Bu süreçte size daha iyi
        hizmet verebilmek için yasal yükümlülüklerimizi şeffaflıkla
        paylaşıyoruz.
      </p>
    </div>
  );
}

export default function CerezlerPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">Çerez Politikası</h1>
        <p className="text-xs text-neutral-500">
          Son güncelleme: 30 Nisan 2026 · Yürürlük: Avukat onayı sonrası
        </p>

        <DraftBanner />

        <p>
          İşbu Çerez Politikası; OtoSonar (&quot;Platform&quot;) tarafından{" "}
          <a href="/" className="text-emerald-400 hover:underline">
            otosonar.com
          </a>{" "}
          ve alt alan adlarında kullanılan çerezler hakkında 6698 sayılı
          KVKK, 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi
          Hakkında Kanun ve Elektronik Haberleşme Sektöründe Kişisel
          Verilerin İşlenmesi ve Gizliliğinin Korunması Hakkında Yönetmelik
          (Çerez Yönetmeliği) uyarınca bilgilendirme amacıyla hazırlanmıştır.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            1. Çerez Nedir?
          </h2>
          <p>
            Çerez (cookie); web sitesinin tarayıcınız aracılığıyla cihazınıza
            yerleştirdiği küçük metin dosyalarıdır. Oturum çerezleri tarayıcı
            kapatıldığında silinir; kalıcı çerezler belirli bir süre cihazda
            saklanır. Çerezlere benzer şekilde çalışan local storage,
            session storage ve piksel etiketleri de bu politika kapsamındadır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            2. Çerez Kategorileri
          </h2>

          <h3 className="text-base font-semibold text-white pt-2">
            (a) Zorunlu Çerezler
          </h3>
          <p>
            Hizmetin sunulabilmesi için teknik olarak zorunludur. Onay
            gerektirmez; reddedilemezler (devre dışı bırakılırsa hizmet
            çalışmaz).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border border-neutral-800 text-xs">
              <thead className="bg-[#12121a]">
                <tr>
                  <th className="border-b border-neutral-800 px-3 py-2 text-left">
                    Çerez
                  </th>
                  <th className="border-b border-neutral-800 px-3 py-2 text-left">
                    Amaç
                  </th>
                  <th className="border-b border-neutral-800 px-3 py-2 text-left">
                    Süre
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    <code>otosonar_session</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Kullanıcı oturumu (HMAC-SHA256 imzalı, HttpOnly,
                    Secure, SameSite=Lax)
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    30 gün
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    <code>otosonar_founder</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Kurucu paneline erişim (HttpOnly, Secure)
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    30 gün
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    <code>otosonar_csrf</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    CSRF (siteler arası istek sahteciliği) koruması
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Oturum
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    <code>otosonar_ratelimit</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Rate limit / istismar önleme
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    10 dk
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    <code>otosonar_consent</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Çerez onay tercihinin saklanması
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    12 ay
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-white pt-2">
            (b) Performans / Analitik Çerezler (opt-in)
          </h3>
          <p>
            Hizmetin nasıl kullanıldığını anlayıp iyileştirmek için
            kullanılır. Kullanıcı onayı olmadan etkinleştirilmez.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border border-neutral-800 text-xs">
              <thead className="bg-[#12121a]">
                <tr>
                  <th className="border-b border-neutral-800 px-3 py-2 text-left">
                    Çerez / Sağlayıcı
                  </th>
                  <th className="border-b border-neutral-800 px-3 py-2 text-left">
                    Amaç
                  </th>
                  <th className="border-b border-neutral-800 px-3 py-2 text-left">
                    Süre
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    <code>otosonar_analytics</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Anonim ziyaretçi kimliği (kendi sistemimiz)
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    180 gün
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    PostHog (eu.posthog.com) —{" "}
                    <code>ph_*</code>
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Anonim event analitiği (sayfa görüntüleme, tıklama)
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    365 gün
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Sentry (sentry.io)
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Hata/performans izleme (kişisel veri minimize edilmiş)
                  </td>
                  <td className="border-b border-neutral-800 px-3 py-2">
                    Oturum
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-white pt-2">
            (c) Pazarlama / Reklam Çerezleri
          </h3>
          <p>
            <b>Şu anda kullanılmamaktadır.</b> İleride eklenmesi hâlinde
            kullanıcı onayı alınacak ve bu sayfa güncellenecektir.
          </p>

          <h3 className="text-base font-semibold text-white pt-2">
            (d) Üçüncü Taraf Hizmetlerin Çerezleri
          </h3>
          <p>
            Ödeme adımına geçildiğinde,{" "}
            <b>İyzico</b>, <b>Shopier</b>, <b>PayTR</b> ve{" "}
            <b>Lemon Squeezy</b> gibi ödeme sağlayıcılar kendi alan
            adlarında işlem güvenliği için çerez yerleştirebilir. Bu
            çerezler sağlayıcının kendi politikasına tâbidir; OtoSonar
            içeriklerini okuyamaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            3. Onay Yönetimi
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Siteye ilk girişinizde alt kısımda bir <b>çerez bildirimi</b>{" "}
              (cookie banner) gösterilir. Burada zorunlu çerezler dışındaki
              kategorileri kabul etmek (Tümünü Kabul Et) veya reddetmek
              (Sadece Zorunlu) seçenekleri sunulur.
            </li>
            <li>
              Tercihiniz <code>otosonar_consent</code> çerezinde 12 ay
              boyunca saklanır.
            </li>
            <li>
              Tercihinizi dilediğiniz zaman tarayıcı çerezlerini silerek veya
              hesap ayarlarınızdan değiştirerek güncelleyebilirsiniz.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            4. Çerezleri Reddetme
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Cookie banner üzerinden &quot;Sadece Zorunlu&quot;yu seçerek
              analitik çerezleri devre dışı bırakabilirsiniz.
            </li>
            <li>
              Tarayıcı ayarlarınızdan tüm çerezleri silebilir veya
              engelleyebilirsiniz (Chrome, Firefox, Safari, Edge için
              tarayıcı yardım sayfalarına bakınız). Zorunlu çerezler devre
              dışı bırakılırsa giriş yapamaz, ödeme alamaz ve panel
              kullanılamaz.
            </li>
            <li>
              <b>Do Not Track</b> tarayıcı ayarına saygı gösterilir;
              etkinse analitik çerezler yüklenmez.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            5. Hukuki Dayanak
          </h2>
          <p>
            Zorunlu çerezler için ayrıca onay gerekmez (KVKK md. 5/2-c —
            sözleşmenin ifası). Performans/analitik ve pazarlama çerezleri
            için açık rıza esas alınır (KVKK md. 5/1 ve Çerez Yönetmeliği).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            6. İletişim
          </h2>
          <p>
            Çerezlere ilişkin sorularınız için:{" "}
            <a
              href="mailto:kvkk@otosonar.com"
              className="text-emerald-400 hover:underline"
            >
              kvkk@otosonar.com
            </a>
          </p>
        </section>

        <DraftBanner />
      </article>
    </main>
  );
}
