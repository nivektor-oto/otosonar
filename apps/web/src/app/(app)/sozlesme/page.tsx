import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi — OtoSonar",
  description:
    "OtoSonar dijital hizmet abonelikleri için 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca düzenlenmiş sözleşme metni.",
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

export default function SozlesmePage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">
          Mesafeli Satış Sözleşmesi
        </h1>
        <p className="text-xs text-neutral-500">
          Son güncelleme: 30 Nisan 2026 · Yürürlük: Avukat onayı sonrası
        </p>

        <DraftBanner />

        <p>
          İşbu Mesafeli Satış Sözleşmesi (&quot;Sözleşme&quot;) 6502 sayılı
          Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği kapsamında, Satıcı ile Alıcı arasında elektronik
          ortamda akdedilmektedir.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Taraflar</h2>
          <p>
            <b>SATICI (Sağlayıcı):</b>
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Unvan: Barış Furkan Koyuncu (Şahıs İşletmesi)</li>
            <li>Marka: NiVector / OtoSonar</li>
            <li>Vergi Kimlik No: 5811141301</li>
            <li>Vergi Dairesi: [avukat tarafından doldurulacak]</li>
            <li>Merkez: Konya · Türkiye</li>
            <li>
              E-posta:{" "}
              <a
                href="mailto:nivektorna@gmail.com"
                className="text-emerald-400 hover:underline"
              >
                nivektorna@gmail.com
              </a>{" "}
              ·{" "}
              <a
                href="mailto:fatura@otosonar.com"
                className="text-emerald-400 hover:underline"
              >
                fatura@otosonar.com
              </a>
            </li>
            <li>
              MERSİS / Ticaret Sicil No: [avukat tarafından doldurulacak]
            </li>
          </ul>
          <p>
            <b>ALICI (Tüketici):</b> OtoSonar platformuna kayıt olarak hizmet
            satın alan gerçek veya tüzel kişi. Alıcı, kayıt sırasında verdiği
            bilgilerin doğruluğundan sorumludur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            2. Sözleşmenin Konusu
          </h2>
          <p>
            İşbu Sözleşme, Alıcı&apos;nın{" "}
            <a href="/" className="text-emerald-400 hover:underline">
              otosonar.com
            </a>{" "}
            üzerinden elektronik ortamda satın aldığı dijital içerik /
            yazılım hizmetlerinin (OtoSonar AI destekli araç analiz hizmeti,
            emsal fiyat raporu, pazarlık skoru, Galerici Kurucu Paketi,
            DealAlert bildirimleri ve abonelik tabanlı diğer dijital
            hizmetler) sunulmasına ilişkin taraflar arasındaki hak ve
            yükümlülükleri düzenler.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            3. Hizmet ve Ücret Bilgisi
          </h2>
          <p>
            Mevcut paketler, fiyatlar (KDV dâhil Türk Lirası cinsinden), ödeme
            periyodu (aylık / yıllık), kapasite limitleri ve otomatik
            yenileme koşulları{" "}
            <a
              href="/fiyatlar"
              className="text-emerald-400 hover:underline"
            >
              /fiyatlar
            </a>{" "}
            sayfasında güncel olarak yayımlanır. Alıcı, ödeme ekranına
            geçmeden önce paket adı, ücret, vade, ön bilgilendirme metni ve
            işbu Sözleşme metnini görür ve onaylar.
          </p>
          <p>
            Ödeme; PCI-DSS uyumlu İyzico, Shopier, PayTR veya Lemon Squeezy
            altyapıları üzerinden kredi/banka kartı, havale/EFT veya yurt dışı
            kart ile tahsil edilir. Kart bilgisi OtoSonar tarafında
            saklanmaz; ödeme sağlayıcı tarafında PCI-DSS standartlarında
            işlenir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Teslim</h2>
          <p>
            Hizmet dijital olup ödeme onayının ardından <b>anlık</b> teslim
            edilir. Ödeme başarıyla tamamlandığı anda abonelik aktif hâle
            gelir, ilgili pakete tanımlı özellikler Alıcı hesabına açılır.
            Fiziksel teslimat ve kargo söz konusu değildir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            5. Cayma Hakkı (Dijital Hizmet İstisnası)
          </h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği <b>md. 15/1-ğ</b> uyarınca,
            tüketicinin onayı ile ifasına başlanan, elektronik ortamda anında
            ifa edilen ve elektronik ortamda tüketiciye anında teslim edilen
            gayri maddi mallara (dijital içerik / yazılım hizmeti) ilişkin
            sözleşmelerde <b>cayma hakkı kullanılamaz</b>.
          </p>
          <p>
            Alıcı, ödeme adımında işbu Sözleşme&apos;yi onaylayarak ve hizmetin
            ifasının derhâl başlamasını talep ederek dijital hizmetin teslim
            edildiğini, dolayısıyla yasal cayma hakkının başlangıcı ile
            birlikte sona erdiğini kabul eder.
          </p>
          <p>
            <b>Gönüllü iyi niyet iadesi:</b> OtoSonar, yasal yükümlülüğü
            bulunmamasına rağmen, ilk kez abone olan tüketicilere ödeme
            tarihinden itibaren <b>7 gün</b> içinde herhangi bir gerekçe
            göstermeksizin tam iade hakkı tanır. Detaylar ve başvuru kanalı{" "}
            <a
              href="/iade-iptal"
              className="text-emerald-400 hover:underline"
            >
              /iade-iptal
            </a>{" "}
            sayfasındadır. Gönüllü iade, yasal cayma hakkı niteliğinde olmayıp
            tek taraflı olarak değiştirilebilir/sonlandırılabilir; yürürlükte
            olan koşullar her zaman ilgili sayfada yayımlanır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            6. Otomatik Yenileme ve İptal
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Abonelik, Alıcı aksini belirtmedikçe dönem sonunda aynı
              koşullarla otomatik olarak yenilenir.
            </li>
            <li>
              Alıcı, dilediği zaman{" "}
              <a
                href="/hesap"
                className="text-emerald-400 hover:underline"
              >
                /hesap
              </a>{" "}
              sayfasından otomatik yenilemeyi kapatabilir. İptal sonrasında
              kalan dönem sonuna kadar hizmete erişim devam eder.
            </li>
            <li>
              Yenileme gerçekleştikten sonra kalan dönem için kısmi iade
              yapılmaz; ancak{" "}
              <a
                href="/iade-iptal"
                className="text-emerald-400 hover:underline"
              >
                /iade-iptal
              </a>{" "}
              sayfasındaki istisnalar saklıdır.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            7. Tarafların Yükümlülükleri
          </h2>
          <p>
            <b>Satıcı,</b> hizmeti sözleşme şartlarına uygun, makul özen ve
            beceri ile sunmayı; sistem güvenliğini sağlamayı; teknik destek
            kanallarını işletmeyi taahhüt eder.
          </p>
          <p>
            <b>Alıcı,</b> kayıt bilgilerinin doğruluğunu, hesabını üçüncü
            kişilerle paylaşmamayı, otomatik scraping / yetkisiz API kullanımı
            / sahte kullanıcı oluşturma gibi sözleşmeye aykırı faaliyetlerden
            kaçınmayı taahhüt eder. Aksi tespit edilirse hesap askıya
            alınabilir veya sonlandırılabilir, iade yapılmaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            8. Sorumluluğun Sınırlandırılması
          </h2>
          <p>
            OtoSonar AI tarafından üretilen analizler, emsal fiyat tahminleri
            ve pazarlık önerileri yardımcı bilgi niteliğindedir; ekspertiz
            raporu yerine geçmez. Yatırım, satın alma veya satış
            kararlarından doğacak zararlardan Satıcı sorumlu tutulamaz.
            Türk Borçlar Kanunu&apos;nun emredici hükümleri saklı kalmak
            kaydıyla, Satıcı&apos;nın toplam sorumluluğu Alıcı&apos;nın son
            12 ayda ödediği abonelik bedeli ile sınırlıdır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">9. Mücbir Sebep</h2>
          <p>
            Doğal afet, savaş, ayaklanma, salgın, yetkili kurum kararları,
            altyapı sağlayıcı kaynaklı geniş çaplı kesintiler ve benzeri
            mücbir sebep hâllerinde, etkilenen yükümlülüklerin ifası mücbir
            sebep süresince ertelenir. 30 günü aşan kesintilerde Alıcı
            sözleşmeyi kullanılmamış dönem oranında iade alarak
            sonlandırabilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            10. Kişisel Verilerin Korunması
          </h2>
          <p>
            Kişisel verilerin işlenmesine ilişkin detaylar{" "}
            <a href="/kvkk" className="text-emerald-400 hover:underline">
              /kvkk
            </a>{" "}
            adresindeki Aydınlatma Metni&apos;nde,{" "}
            <a
              href="/gizlilik"
              className="text-emerald-400 hover:underline"
            >
              /gizlilik
            </a>{" "}
            adresindeki Gizlilik Politikası&apos;nda ve{" "}
            <a
              href="/cerezler"
              className="text-emerald-400 hover:underline"
            >
              /cerezler
            </a>{" "}
            adresindeki Çerez Politikası&apos;nda yer almaktadır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            11. Uyuşmazlık Çözümü
          </h2>
          <p>
            İşbu Sözleşme&apos;den doğan uyuşmazlıklarda, Ticaret Bakanlığı
            tarafından her yıl ilan edilen parasal sınırlar dâhilinde
            Alıcı&apos;nın yerleşim yerindeki veya tüketici işleminin
            yapıldığı yerdeki <b>Tüketici Hakem Heyetleri</b>; bu sınırı
            aşan uyuşmazlıklarda <b>Tüketici Mahkemeleri</b> yetkilidir.
            Tüketici sıfatı bulunmayan tacir Alıcılar bakımından{" "}
            <b>Konya Mahkemeleri ve İcra Daireleri</b> yetkilidir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">12. Yürürlük</h2>
          <p>
            Alıcı, ödeme ekranında işbu Sözleşme&apos;yi ve Ön Bilgilendirme
            Formu&apos;nu elektronik olarak onayladığı andan itibaren
            Sözleşme yürürlüğe girer. Bu işlem 6098 sayılı Türk Borçlar
            Kanunu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
            6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun
            uyarınca yazılı onay niteliğindedir.
          </p>
        </section>

        <DraftBanner />
      </article>
    </main>
  );
}
