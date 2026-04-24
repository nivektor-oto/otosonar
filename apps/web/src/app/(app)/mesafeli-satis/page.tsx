export const metadata = { title: "Mesafeli Satış Sözleşmesi — OtoSonar" };

export default function MesafeliSatisPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-xs text-neutral-500">Son güncelleme: 24 Nisan 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Taraflar</h2>
          <p>
            İşbu Mesafeli Satış Sözleşmesi 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
            Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir. Satıcı ile Alıcı arasında elektronik ortamda
            akdedilir.
          </p>
          <p><b>SATICI:</b></p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Unvan: Barış Furkan Koyuncu (Şahıs İşletmesi)</li>
            <li>Vergi Kimlik No: 5811141301 (vergi levhası başvuru aşamasında)</li>
            <li>Marka: OtoSonar (NiVector markası altında)</li>
            <li>E-posta: destek@otosonar.com · fatura@otosonar.com</li>
            <li>Merkez: Konya · Türkiye</li>
          </ul>
          <p><b>ALICI:</b> Platform'a kayıt olarak abonelik satın alan gerçek/tüzel kişi.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Sözleşmenin Konusu</h2>
          <p>
            İşbu sözleşmenin konusu; Alıcı'nın OtoSonar platformu üzerinden dijital içerik / yazılım hizmeti
            (AI destekli araç analizi, emsal fiyat raporu, pazarlık önerisi, galerici araçları ve benzeri
            abonelik tabanlı dijital hizmetler) satın alması ve bu hizmetin sunumuna ilişkin karşılıklı hak
            ve yükümlülüklerin düzenlenmesidir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Hizmet & Fiyat Bilgisi</h2>
          <p>
            Mevcut abonelik paketleri, fiyatlar ve içerdiği kapasite limitleri{" "}
            <a href="/fiyatlar" className="text-emerald-400 hover:underline">/fiyatlar</a> sayfasında
            güncel olarak yayınlanır. Alıcı, ödeme sayfasına geçmeden önce paketin adı, ücreti (KDV dahil),
            ödeme periyodu (aylık/yıllık) ve otomatik yenileme koşullarını görür ve onaylar.
          </p>
          <p>Ödeme, PCI-DSS uyumlu İyzico/PayTR altyapısı üzerinden kredi/banka kartı ile tahsil edilir. Kart bilgisi OtoSonar tarafında saklanmaz.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Teslim</h2>
          <p>
            Hizmet dijitaldir ve ödeme onayının ardından <b>ani teslim</b> niteliğindedir. Ödeme başarıyla
            tamamlandığı anda abonelik aktif hâle gelir ve Alıcı hesabı ile ilgili pakete giriş yapılır.
            Fiziksel teslimat söz konusu değildir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği md. 15/1-ğ uyarınca, <b>elektronik ortamda anında ifa edilen
            dijital içerik</b>, Alıcı'nın onayı ile ifaya başlanmış olması hâlinde cayma hakkının istisnaları
            arasındadır. Ancak OtoSonar, yatırımcı dostu politika gereği, <b>14 gün koşulsuz cayma hakkını</b>{" "}
            gönüllü olarak tanır: aboneliğin başlangıç tarihinden itibaren 14 gün içinde{" "}
            <a href="mailto:fatura@otosonar.com" className="text-emerald-400 hover:underline">fatura@otosonar.com</a>{" "}
            adresine yazılı bildirim yapılması halinde ücretin tamamı, kullanım düzeyinden bağımsız olarak
            10 iş günü içinde aynı ödeme yöntemine iade edilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">6. Otomatik Yenileme & İptal</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Abonelik, Alıcı aksi belirtmedikçe dönem sonunda aynı şartlarla otomatik yenilenir.</li>
            <li>
              Yenileme tarihinden 24 saat öncesine kadar{" "}
              <a href="/hesap" className="text-emerald-400 hover:underline">/hesap</a> sayfasından iptal
              edilebilir. İptal edildiğinde kalan dönem sonuna kadar hizmet sunulmaya devam eder.
            </li>
            <li>Yenileme gerçekleştikten sonra kalan dönem için kısmi iade yapılmaz.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">7. Sorumluluk & Uyuşmazlık</h2>
          <p>
            Platform'un sunduğu analizler yardımcı bilgi niteliğindedir; ekspertiz raporu yerine geçmez.
            Yatırım veya satın alma kararlarından doğacak zararlardan Satıcı sorumlu tutulamaz. Satıcı'nın
            toplam sorumluluğu, Alıcı'nın son 12 ayda ödediği abonelik bedeli ile sınırlıdır.
          </p>
          <p>
            Uyuşmazlıklarda Gümrük ve Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar
            dahilinde Alıcı'nın yerleşim yerindeki <b>Tüketici Hakem Heyetleri</b> ve <b>Tüketici
            Mahkemeleri</b> yetkilidir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">8. Yürürlük</h2>
          <p>
            Alıcı, ödeme sayfasında işbu sözleşmeyi elektronik olarak onayladığı andan itibaren sözleşme
            yürürlüğe girer. Bu işlem Türk Borçlar Kanunu ve Elektronik Ticaretin Düzenlenmesi Hakkında
            Kanun uyarınca yazılı onay niteliğindedir.
          </p>
        </section>
      </article>
    </main>
  );
}
