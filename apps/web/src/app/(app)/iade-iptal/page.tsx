export const metadata = { title: "İade & İptal Koşulları — OtoSonar" };

export default function IadeIptalPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">İade & İptal Koşulları</h1>
        <p className="text-xs text-neutral-500">Son güncelleme: 24 Nisan 2026</p>

        <p>
          OtoSonar, dijital abonelik hizmeti sunmaktadır. Aşağıdaki iade ve iptal politikası, 6502 sayılı
          Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde, tüketici
          lehine genişletilmiş olarak uygulanır.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. 14 Gün Koşulsuz İade</h2>
          <p>
            Hizmeti ilk kez satın alan abonelere, ödeme tarihinden itibaren <b>14 gün</b> içinde hiçbir
            gerekçe göstermeksizin tam iade hakkı tanınır. Kullanım düzeyi (yapılan analiz sayısı vb.)
            iadeyi etkilemez. Talep için{" "}
            <a href="mailto:fatura@otosonar.com" className="text-emerald-400 hover:underline">
              fatura@otosonar.com
            </a>{" "}
            adresine yazılı başvuru yeterlidir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Abonelik İptali</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Abonelik her an <a href="/hesap" className="text-emerald-400 hover:underline">/hesap</a>{" "}
              sayfasından iptal edilebilir.
            </li>
            <li>İptal sonrası kalan dönem sonuna kadar hizmete erişim devam eder; veriler silinmez.</li>
            <li>Otomatik yenileme, iptal tarihinden itibaren kapanır.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Otomatik Yenileme Sonrası İade</h2>
          <p>
            Otomatik yenileme ücretinin çekildiği tarihten itibaren <b>7 gün</b> içinde yapılan taleplerde,
            yeni dönemde <b>hiç kullanım yapılmamışsa</b> tam iade gerçekleştirilir. Yenileme sonrası
            analiz/rapor kullanımı yapıldıysa, kalan kapasite oranında kısmi iade uygulanır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Hizmet Hatası Durumunda</h2>
          <p>
            Platform'un uzun süreli kesintisi (24 saatten uzun), satın alınan paketin özelliklerinin
            sunulamaması veya teknik arıza nedeniyle Alıcı'nın hizmetten yararlanamaması hâlinde, Alıcı
            talebi üzerine <b>tam iade</b> veya etkilenen gün sayısı kadar <b>abonelik uzatma</b> seçeneği
            sunulur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. İade Süreci</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Başvurular 3 iş günü içinde incelenir ve yanıtlanır.</li>
            <li>
              Onaylanan iadeler, ödemenin yapıldığı <b>aynı kart/hesaba</b>, en geç <b>10 iş günü</b>{" "}
              içinde iade edilir.
            </li>
            <li>
              Bankadan kaynaklanan geri yansıma süreleri iade süresine dahil değildir (genellikle 2–7
              iş günü ek süre).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">6. İade Kapsamı Dışı Haller</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Sözleşmeye aykırı kullanım (scraping, sahte hesap, kötü niyetli istismar) tespit edilen hesaplar.</li>
            <li>14 günlük koşulsuz iade süresi geçmiş ve kullanımın yoğun olduğu dönemler (yıllık paketlerde 14 gün sonrası).</li>
            <li>Hediye/promosyon kodu ile aktive edilen ücretsiz abonelikler (zaten ücret ödenmemiştir).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">7. Başvuru Kanalı</h2>
          <p>
            Tüm iade/iptal talepleri yazılı olarak{" "}
            <a href="mailto:fatura@otosonar.com" className="text-emerald-400 hover:underline">
              fatura@otosonar.com
            </a>{" "}
            adresine iletilir. Dönüş 3 iş günü içinde aynı e-posta adresine yapılır.
          </p>
        </section>
      </article>
    </main>
  );
}
