export const metadata = { title: "İletişim — OtoSonar" };

export default function IletisimPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-neutral-300">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-white">İletişim</h1>
          <p className="text-xs text-neutral-500">
            Bize aşağıdaki kanallardan ulaşabilirsiniz. Normal çalışma saatleri içinde (hafta içi 09:00–18:00)
            en geç 24 saat içinde dönüş yapılmaktadır.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">İşletme Bilgileri</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Unvan: <b>Barış Furkan Koyuncu</b> (Şahıs İşletmesi)</li>
            <li>Vergi Kimlik No: 5811141301</li>
            <li>Vergi Levhası: Başvuru aşamasında</li>
            <li>Marka: OtoSonar (NiVector markası altında)</li>
            <li>Merkez: Konya · Türkiye</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Destek & İletişim Kanalları</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Genel destek:{" "}
              <a href="mailto:destek@otosonar.com" className="text-emerald-400 hover:underline">
                destek@otosonar.com
              </a>
            </li>
            <li>
              Fatura / abonelik:{" "}
              <a href="mailto:fatura@otosonar.com" className="text-emerald-400 hover:underline">
                fatura@otosonar.com
              </a>
            </li>
            <li>
              KVKK başvuruları:{" "}
              <a href="mailto:kvkk@otosonar.com" className="text-emerald-400 hover:underline">
                kvkk@otosonar.com
              </a>
            </li>
            <li>
              Kurumsal / yatırım:{" "}
              <a href="mailto:kurucu@otosonar.com" className="text-emerald-400 hover:underline">
                kurucu@otosonar.com
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Hukuki Tebligat</h2>
          <p>
            Resmi yazışmalar için yazılı tebligat adresimiz henüz kurumsal ofis kiralaması tamamlanmadığı
            için güncellenmemiştir. Acil hukuki başvurular için{" "}
            <a href="mailto:kvkk@otosonar.com" className="text-emerald-400 hover:underline">kvkk@otosonar.com</a>{" "}
            adresine başvurulması halinde, güncel tebligat adresi aynı gün içinde elektronik ortamda iletilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Sosyal</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ana site: <a href="https://otosonar.com" className="text-emerald-400 hover:underline">otosonar.com</a></li>
            <li>Blog: <a href="/blog" className="text-emerald-400 hover:underline">otosonar.com/blog</a></li>
          </ul>
        </section>
      </article>
    </main>
  );
}
