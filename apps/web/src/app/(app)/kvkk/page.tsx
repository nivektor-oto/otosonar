import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — OtoSonar",
  description:
    "OtoSonar KVKK kapsamında veri sorumlusu, işlenen kişisel veriler, işleme amaçları, aktarım, saklama süresi ve KVKK md. 11 hakları hakkında aydınlatma metni.",
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

export default function KvkkPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">
          KVKK Aydınlatma Metni
        </h1>
        <p className="text-xs text-neutral-500">
          Son güncelleme: 30 Nisan 2026 · Yürürlük: Avukat onayı sonrası
        </p>

        <DraftBanner />

        <p>
          İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması
          Kanunu (&quot;KVKK&quot;) md. 10 ve Aydınlatma Yükümlülüğünün Yerine
          Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca
          OtoSonar tarafından düzenlenmiştir.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            1. Veri Sorumlusu
          </h2>
          <p>
            OtoSonar (&quot;Platform&quot;) NiVector markası altında
            işletilmektedir. Veri sorumlusu sıfatıyla:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Unvan: <b>Barış Furkan Koyuncu</b> (Şahıs İşletmesi)
            </li>
            <li>Vergi Kimlik No: 5811141301</li>
            <li>Marka: NiVector / OtoSonar</li>
            <li>Merkez: Konya · Türkiye</li>
            <li>
              KVKK iletişim:{" "}
              <a
                href="mailto:kvkk@otosonar.com"
                className="text-emerald-400 hover:underline"
              >
                kvkk@otosonar.com
              </a>
            </li>
            <li>
              Genel iletişim:{" "}
              <a
                href="mailto:nivektorna@gmail.com"
                className="text-emerald-400 hover:underline"
              >
                nivektorna@gmail.com
              </a>
            </li>
            <li>VERBİS kayıt no: [avukat tarafından doldurulacak]</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            2. İşlenen Kişisel Veri Kategorileri
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b>Kimlik:</b> ad, soyad
            </li>
            <li>
              <b>İletişim:</b> e-posta, telefon (opsiyonel)
            </li>
            <li>
              <b>Müşteri işlem:</b> abonelik kayıtları, analiz girdileri,
              ödeme referans numaraları (kart bilgisi saklanmaz — bkz. madde
              4)
            </li>
            <li>
              <b>İşlem güvenliği:</b> IP adresi (hash&apos;li), tarayıcı/cihaz
              parmak izi, oturum çerezi, log kayıtları
            </li>
            <li>
              <b>Galerici/kurumsal hesaplar:</b> şirket unvanı, T.C. kimlik
              veya vergi kimlik no, MERSİS no, vergi dairesi, IBAN
              (uygulama katmanında AES-256-GCM şifreli)
            </li>
            <li>
              <b>Hizmet girdisi:</b> analiz edilmek üzere girilen ilan
              URL&apos;leri, araç plakaları (opsiyonel — sadece kullanıcı
              elle girerse), şasi numarası (opsiyonel)
            </li>
            <li>
              <b>Pazarlama:</b> e-bülten onayı, açılma/tıklama metrikleri
              (yalnızca açık rıza ile)
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            3. İşleme Amaçları
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hesap oluşturma, kimlik doğrulama ve abonelik yönetimi</li>
            <li>
              OtoSonar AI destekli araç analizi hizmetinin sunulması
              (çift-model doğrulama dâhil)
            </li>
            <li>Faturalandırma, tahsilat ve muhasebe yükümlülükleri</li>
            <li>
              Dolandırıcılık, kötü niyetli scraping ve istismarın önlenmesi
              (rate limit, IP/cihaz risk skorlaması)
            </li>
            <li>Ürün geliştirme, hata izleme ve performans iyileştirmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, e-fatura, KVK Kuruluna bilgi verme)</li>
            <li>
              Açık rıza verilmişse: pazarlama iletişimi, e-bülten,
              kişiselleştirilmiş öneriler
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            4. Hukuki Dayanak (KVKK md. 5)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b>Sözleşmenin kurulması ve ifası</b> (md. 5/2-c) — abonelik,
              hesap, faturalandırma
            </li>
            <li>
              <b>Hukuki yükümlülük</b> (md. 5/2-ç) — vergi, e-fatura, ticari
              defter saklama, yetkili kurum talepleri
            </li>
            <li>
              <b>Meşru menfaat</b> (md. 5/2-f) — dolandırıcılık önleme,
              güvenlik, ürün iyileştirme (temel hak ve özgürlüklere zarar
              vermeyecek şekilde dengeli)
            </li>
            <li>
              <b>Açık rıza</b> (md. 5/1) — pazarlama iletişimi, opsiyonel
              telefon numarası, yurt dışı aktarım onayı
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            5. Aktarılan Üçüncü Taraflar
          </h2>
          <p>
            Aşağıdaki hizmet sağlayıcılar, KVKK md. 8 ve md. 9 kapsamında
            sözleşmesel güvencelerle (Veri İşleyici Sözleşmesi /
            Standart Sözleşme Hükümleri) sınırlı amaçla görevlendirilmiştir.
            AB/ABD merkezli hizmet sağlayıcılara aktarım, KVKK md. 9/1
            uyarınca açık rızanız alınarak veya md. 9/6 kapsamında uygun
            güvenceler sağlanarak yapılır.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b>Vercel (ABD/AB)</b> — uygulama barındırma (Frankfurt edge)
            </li>
            <li>
              <b>Neon (AB)</b> — Postgres veritabanı (Frankfurt /
              eu-central-1)
            </li>
            <li>
              <b>Cloudflare (ABD/AB)</b> — DNS, DDoS koruması, CDN
            </li>
            <li>
              <b>İyzico (TR)</b> — ödeme altyapısı, PCI-DSS sertifikalı
              (kart bilgisi OtoSonar&apos;a ulaşmaz)
            </li>
            <li>
              <b>Shopier (TR)</b> — alternatif ödeme altyapısı
            </li>
            <li>
              <b>Lemon Squeezy (ABD)</b> — uluslararası ödeme/abonelik
              (Merchant of Record)
            </li>
            <li>
              <b>PayTR (TR)</b> — alternatif ödeme altyapısı
            </li>
            <li>
              <b>Resend (ABD/AB)</b> — işlemsel ve pazarlama e-postaları
            </li>
            <li>
              <b>Sentry (ABD/AB)</b> — hata izleme ve performans
              gözlemleme (kişisel veri minimize edilerek gönderilir)
            </li>
            <li>
              <b>PostHog (AB — eu.posthog.com)</b> — anonim ürün analitiği
              (kişiselleştirilmemiş event)
            </li>
            <li>
              <b>Pinecone (ABD)</b> — vektör veritabanı (semantik arama
              için ilan/araç metni; kimlik bilgisi gönderilmez)
            </li>
            <li>
              <b>OtoSonar AI altyapı sağlayıcıları</b> — AB/ABD merkezli,
              lisanslı; kişisel veri minimize edilerek (ad, e-posta vs.
              hariç) yalnızca analiz girdileri (ilan metni / fotoğraf)
              iletilir
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            6. Toplama Yöntemi
          </h2>
          <p>
            Kişisel veriler; web sitesi formları, mobil arayüz, çerezler,
            sunucu logları, ödeme altyapı sağlayıcılarından dönen başarı
            bildirimleri ve müşteri destek kanalları üzerinden, otomatik veya
            otomatik olmayan yollarla toplanır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            7. Saklama Süresi
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Hesap aktif olduğu sürece + hesap kapatılması sonrası{" "}
              <b>5 yıl</b> (Vergi Usul Kanunu md. 253 — defter saklama
              yükümlülüğü)
            </li>
            <li>
              Faturalandırma kayıtları: <b>10 yıl</b> (Türk Ticaret Kanunu
              md. 82)
            </li>
            <li>
              Pazarlama izinleri: rıza geri alınana kadar; geri alındıktan
              sonra makul sürede silinir
            </li>
            <li>
              Sunucu/erişim logları: <b>30 gün</b> (5651 sayılı kanun
              kapsamında daha uzun saklanması gerekenler hariç)
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            8. KVKK md. 11 Haklarınız
          </h2>
          <p>Veri sahibi olarak şu haklara sahipsiniz:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içi / yurt dışı aktarılan üçüncü kişileri bilme</li>
            <li>Eksik / yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
            <li>
              Otomatik sistemler ile analiz sonucu aleyhinize bir sonuç
              ortaya çıkmasına itiraz etme
            </li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğradığınızda tazminat talep etme</li>
            <li>
              KVK Kuruluna şikayette bulunma (
              <a
                href="https://www.kvkk.gov.tr"
                className="text-emerald-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                kvkk.gov.tr
              </a>
              )
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            9. Başvuru Usulü
          </h2>
          <p>
            KVKK kapsamındaki başvurularınızı{" "}
            <a
              href="mailto:kvkk@otosonar.com"
              className="text-emerald-400 hover:underline"
            >
              kvkk@otosonar.com
            </a>{" "}
            adresine veya yazılı olarak şirket merkezine iletebilirsiniz.
            Başvuruda kimlik bilgileriniz, talebiniz ve varsa belgeleyici
            ekler bulunmalıdır. Veri Sorumlusuna Başvuru Usul ve Esasları
            Hakkında Tebliğ uyarınca talepleriniz <b>30 gün</b> içinde
            ücretsiz olarak yanıtlanır (talep ek bir maliyet gerektiriyorsa
            KVK Kurulunca belirlenen tarife uygulanabilir).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            10. Güncelleme
          </h2>
          <p>
            İşbu metin gerektiğinde güncellenir. Esaslı değişikliklerde
            kayıtlı e-posta adresinize bildirim yapılır ve kullanıcı
            panelinde uyarı gösterilir.
          </p>
        </section>

        <DraftBanner />
      </article>
    </main>
  );
}
