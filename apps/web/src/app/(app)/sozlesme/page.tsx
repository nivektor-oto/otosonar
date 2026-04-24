export const metadata = { title: "Kullanım Sözleşmesi — OtoSonar" };

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">Kullanım Sözleşmesi</h1>
        <p className="text-xs text-neutral-500">Son güncelleme: 21 Nisan 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Taraflar</h2>
          <p>
            Bu sözleşme bir yanda <b>Barış Furkan Koyuncu</b> — Şahıs İşletmesi, VKN: 5811141301 (vergi
            levhası başvuru aşamasında), Konya/Türkiye — tarafından NiVector markası altında işletilen
            OtoSonar ("Platform"), diğer yanda sisteme kayıt olan kullanıcı ("Üye") arasındadır.
          </p>
          <p>İletişim: <a href="mailto:destek@otosonar.com" className="text-emerald-400 hover:underline">destek@otosonar.com</a></p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Hizmet Tanımı</h2>
          <p>
            OtoSonar, ikinci el araç ilanları için yapay zekâ destekli değer tahmini, gizli arıza analizi ve
            pazarlık önerisi sunan bir SaaS platformudur. Sunulan analizler yardımcı bilgidir;{" "}
            <b>ekspertiz raporu yerine geçmez</b>, hukuki delil niteliği taşımaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Üyelik ve Sorumluluk</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>18 yaşından küçükler üye olamaz.</li>
            <li>Üye, verdiği bilgilerin doğru olduğunu taahhüt eder.</li>
            <li>Hesap güvenliği üyenin sorumluluğundadır; şifreyi başkasıyla paylaşamaz.</li>
            <li>Galerici hesapları için vergi levhası veya MERSİS kaydı gereklidir.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Ücretlendirme</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ücretler aylık/yıllık olarak peşin tahsil edilir.</li>
            <li>İyzico/PayTR üzerinden kart ile ödeme alınır.</li>
            <li>Otomatik yenileme aktifken, yenileme tarihinden 24 saat öncesine kadar iptal edilebilir.</li>
            <li>14 gün içinde koşulsuz cayma hakkı (tüketici mevzuatı) saklıdır.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Yasaklar</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Otomatik scraping, reverse engineering</li>
            <li>Platform'u rakip AI modeli eğitmek için kullanmak</li>
            <li>Sahte ilan / sahte bozdurma talebi</li>
            <li>Başka üyelerin hesaplarına erişmeye çalışmak</li>
            <li>Rate limit'i aşmaya yönelik davranış</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">6. Sorumluluğun Sınırlandırılması</h2>
          <p>
            AI tahminleri olasılıksaldır. Platform'un verdiği emsal değer, pazarlık skoru veya arıza tahmini
            sonucu alınan satın alma/satış kararlarından doğacak doğrudan/dolaylı zararlardan Platform sorumlu
            tutulamaz. Platform'un toplam sorumluluğu, Üye'nin son 12 ayda ödediği abonelik tutarı ile sınırlıdır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">7. Fesih</h2>
          <p>
            Üye hesabını istediği an /hesap sayfasından kapatabilir. Platform, sözleşmeye aykırı kullanımda
            hesabı askıya alma veya kapatma hakkını saklı tutar.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">8. Uyuşmazlık Çözümü</h2>
          <p>
            Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Müdürlükleri yetkilidir. Tüketiciler için tüketici
            hakem heyetleri/mahkemeleri yetkisi saklıdır.
          </p>
        </section>
      </article>
    </main>
  );
}
