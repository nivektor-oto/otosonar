export const metadata = { title: "KVKK Aydınlatma Metni — OtoSonar" };

export default function KvkkPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">KVKK Aydınlatma Metni</h1>
        <p className="text-xs text-neutral-500">Son güncelleme: 21 Nisan 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Veri Sorumlusu</h2>
          <p>
            OtoSonar ("Platform"), NiVector markası altında işletilmektedir. Veri sorumlusu: <b>NiVector</b>{" "}
            (iletişim: kurucu@otosonar.com).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. İşlenen Kişisel Veriler</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Kimlik: ad, soyad</li>
            <li>İletişim: e-posta, telefon (opsiyonel)</li>
            <li>İşlem: araç analizleri, abonelik, ödeme referansları</li>
            <li>Teknik: IP özeti (hash), tarayıcı, cihaz tipi, oturum çerezi</li>
            <li>Galerici hesapları için: şirket unvanı, vergi no, MERSİS no, IBAN (şifrelenmiş)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. İşleme Amaçları</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hesap oluşturma ve yönetimi</li>
            <li>AI destekli araç analizi sunumu</li>
            <li>Abonelik faturalandırma ve ödeme takibi</li>
            <li>Güvenlik: hesap korumak, dolandırıcılığı önlemek</li>
            <li>Yasal yükümlülükler (VERBİS, e-fatura, vergi)</li>
            <li>Onay verildiyse: pazarlama iletişimi</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Aktarım</h2>
          <p>
            Kişisel veriler yurt içi ve AB bölgesindeki hizmet sağlayıcılar (Vercel, Neon Postgres — Frankfurt)
            üzerinde barındırılır. Ödeme bilgileri PCI-DSS uyumlu İyzico/PayTR üzerinden işlenir ve OtoSonar
            tarafında saklanmaz. AI analizi için minimum gerekli veri (ilan metni, fotoğraf) lisanslı 3. taraf
            AI altyapı sağlayıcılarına (ABD/AB merkezli, KVKK uyumlu sözleşmeler kapsamında) iletilir — kimlik
            bilgisi aktarılmaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Saklama Süresi</h2>
          <p>
            Hesap aktif olduğu sürece + hesap kapatıldıktan sonra yasal saklama süreleri boyunca (genellikle 10
            yıl ticari, 5 yıl vergisel) saklanır. Pazarlama onayı her an geri alınabilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">6. KVKK md. 11 Haklarınız</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>İşlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse bilgi talep etme</li>
            <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içi / yurt dışı aktarılan üçüncü kişileri öğrenme</li>
            <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>İşlemin yasal dayanağı ortadan kalkmışsa hakkınızı kullanma</li>
          </ul>
          <p>
            Başvuru: <a href="mailto:kvkk@otosonar.com" className="text-emerald-400 hover:underline">kvkk@otosonar.com</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">7. Çerezler</h2>
          <p>
            Oturum devamlılığı için HttpOnly + Secure çerezler kullanılır. Üçüncü taraf analitik çerez{" "}
            <b>kullanılmaz</b> — kendi self-hosted Postgres tabanlı ölçüm sistemimiz vardır.
          </p>
        </section>
      </article>
    </main>
  );
}
