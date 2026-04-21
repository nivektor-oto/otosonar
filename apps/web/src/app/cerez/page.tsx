export const metadata = { title: "Çerez Politikası — OtoSonar" };

export default function CookiePage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <article className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-300">
        <h1 className="text-3xl font-bold text-white">Çerez Politikası</h1>
        <p className="text-xs text-neutral-500">Son güncelleme: 21 Nisan 2026</p>

        <p>
          OtoSonar <b>minimum çerez politikası</b> izler. Üçüncü taraf analitik/reklam çerezi kullanılmaz.
        </p>

        <table className="w-full border border-neutral-800 text-xs">
          <thead className="bg-[#12121a]">
            <tr>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Çerez</th>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Amaç</th>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Süre</th>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Tip</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-neutral-800 px-3 py-2"><code>otosonar_session</code></td>
              <td className="border-b border-neutral-800 px-3 py-2">Kullanıcı oturumu</td>
              <td className="border-b border-neutral-800 px-3 py-2">30 gün</td>
              <td className="border-b border-neutral-800 px-3 py-2">Zorunlu</td>
            </tr>
            <tr>
              <td className="border-b border-neutral-800 px-3 py-2"><code>otosonar_founder</code></td>
              <td className="border-b border-neutral-800 px-3 py-2">Kurucu paneli</td>
              <td className="border-b border-neutral-800 px-3 py-2">30 gün</td>
              <td className="border-b border-neutral-800 px-3 py-2">Zorunlu</td>
            </tr>
            <tr>
              <td className="border-b border-neutral-800 px-3 py-2"><code>otosonar_analytics</code></td>
              <td className="border-b border-neutral-800 px-3 py-2">Anonim ziyaretçi ID</td>
              <td className="border-b border-neutral-800 px-3 py-2">180 gün</td>
              <td className="border-b border-neutral-800 px-3 py-2">Analitik (opt-out)</td>
            </tr>
          </tbody>
        </table>

        <p>
          Tarayıcı ayarlarından çerezleri devre dışı bırakabilirsin; oturum çerezi olmadan giriş yapılamaz.
        </p>
      </article>
    </main>
  );
}
