import { LogoMark } from "@/components/logo";

export const metadata = {
  title: "OtoSonar — Sunum",
  robots: "noindex",
};

export default function SunumV5() {
  return (
    <div className="sunum">
      <Cover />
      <Sorun />
      <Cozum />
      <Ozellikler />
      <Akis />
      <Fiyat />
      <Guvenlik />
      <Kapanis />

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #ffffff; }
        .sunum {
          font-family: var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #0f172a;
          -webkit-font-smoothing: antialiased;
        }
        .slide {
          width: 210mm; height: 297mm;
          page-break-inside: avoid;
          break-inside: avoid;
          position: relative;
          overflow: hidden;
          background: #ffffff;
          padding: 28mm 22mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .slide + .slide { page-break-before: always; }
        .kicker {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 18px;
        }
        h1 { font-size: 56px; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 24px; font-weight: 800; color: #0f172a; }
        h2 { font-size: 36px; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 18px; font-weight: 700; color: #0f172a; }
        h3 { font-size: 18px; margin: 0 0 8px; font-weight: 700; color: #0f172a; }
        p, li { font-size: 15px; line-height: 1.65; color: #475569; margin: 0; }
        .lead { font-size: 19px; line-height: 1.55; color: #334155; margin-top: 4px; max-width: 560px; }
        .accent { color: #10b981; }
        .footer {
          position: absolute; bottom: 16mm; left: 22mm; right: 22mm;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; color: #94a3b8;
          border-top: 1px solid #e2e8f0; padding-top: 12px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
        }
        .card-strong {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }
        .num {
          font-size: 52px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #10b981;
        }
        @media screen {
          body { padding: 24px 0; background: #e2e8f0; }
          .slide { margin: 0 auto 24px; box-shadow: 0 10px 40px rgba(0,0,0,.12); border-radius: 10px; }
        }
      `}</style>
    </div>
  );
}

function FooterBar({ page, total }: { page: number; total: number }) {
  return (
    <div className="footer">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LogoMark size={14} />
        <span style={{ color: "#475569", fontWeight: 600 }}>OtoSonar</span>
      </div>
      <div>otosonar.com</div>
      <div>
        {page} / {total}
      </div>
    </div>
  );
}

function Cover() {
  return (
    <section className="slide" style={{ justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
        <LogoMark size={42} />
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>
          OtoSonar
        </span>
      </div>
      <div className="kicker">Türkiye · 2. el araç zekâ platformu</div>
      <h1>
        İlanı yapıştır,<br />
        <span className="accent">8 saniyede</span><br />
        gerçeği öğren.
      </h1>
      <p className="lead" style={{ marginTop: 12 }}>
        Sahibinden veya arabam.com ilanını ver; AI gizli arıza, emsal değer ve pazarlık kozunu çıkarır.
        Galericilere bozdurma hesaplayıcı, pazaryeri ve kayıt otomasyonu.
      </p>
      <div style={{ marginTop: "auto", fontSize: 12, color: "#94a3b8" }}>
        NiVector · 2026 · Sürüm 4
      </div>
      <FooterBar page={1} total={8} />
    </section>
  );
}

function Sorun() {
  return (
    <section className="slide">
      <div className="kicker">01 · Sorun</div>
      <h2>
        2. el araç alırken<br />
        herkes <span className="accent">kör gidiyor</span>.
      </h2>
      <p className="lead">
        Türkiye&apos;de yılda 9 milyon 2. el araç el değiştiriyor. Alıcı fiyatı tahmin ediyor, galerici Excel tutuyor,
        kimse gizli arızayı görmeden satın alıyor. Ekspertiz 800 TL ve yarım gün.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 40 }}>
        <div className="card">
          <div className="num">68%</div>
          <h3 style={{ marginTop: 12 }}>Piyasa üstü ödüyor</h3>
          <p>Bireysel alıcıların emsal değer fikri yok.</p>
        </div>
        <div className="card">
          <div className="num">30K₺</div>
          <h3 style={{ marginTop: 12 }}>Ortalama zarar</h3>
          <p>Yanlış fiyatlandırma bir galericiye aylık maliyeti.</p>
        </div>
        <div className="card">
          <div className="num">0</div>
          <h3 style={{ marginTop: 12 }}>Standart araç</h3>
          <p>Tutarlı fiyat, hasar ve km doğrulama sistemi yok.</p>
        </div>
      </div>
      <FooterBar page={2} total={8} />
    </section>
  );
}

function Cozum() {
  return (
    <section className="slide">
      <div className="kicker">02 · Çözüm</div>
      <h2>
        Üç kullanıcı, <span className="accent">tek platform</span>.
      </h2>
      <p className="lead">
        Aynı AI motor; bireysel alıcıya güven, galericiye hız, pazara standart verir.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 44, flex: 1 }}>
        <div className="card">
          <h3>Bireysel</h3>
          <ul style={{ margin: "12px 0 0", paddingLeft: 16, listStyle: "disc" }}>
            <li>İlan analizi</li>
            <li>Hasar tespit (fotoğraf)</li>
            <li>Plaka okuma</li>
            <li>Pazar trendi</li>
          </ul>
        </div>
        <div className="card card-strong">
          <h3>Galerici</h3>
          <ul style={{ margin: "12px 0 0", paddingLeft: 16, listStyle: "disc", color: "#065f46" }}>
            <li>Bozdurma AI</li>
            <li>Stok değerleme</li>
            <li>Fleet dashboard</li>
            <li>API &amp; ekip hesabı</li>
          </ul>
        </div>
        <div className="card">
          <h3>Pazaryeri</h3>
          <ul style={{ margin: "12px 0 0", paddingLeft: 16, listStyle: "disc" }}>
            <li>Şeffaf ihale</li>
            <li>Doğrulanmış galerici</li>
            <li>Kabul → sat</li>
            <li>Push uyarılar</li>
          </ul>
        </div>
      </div>
      <FooterBar page={3} total={8} />
    </section>
  );
}

function Ozellikler() {
  const items = [
    ["İlan Analizi", "Emsal değer + gizli arıza + pazarlık skoru"],
    ["Bozdurma AI", "Galerici için alım fiyatı hesaplayıcı"],
    ["Hasar Tespit", "Fotoğraftan ezik, boya, tampon tahmini"],
    ["Plaka OCR", "Türkiye plaka + bölge okuma"],
    ["Pazar Araştırma", "Marka/model fiyat trendi"],
    ["Pazaryeri", "İlan + teklif + kabul akışı"],
    ["Push Bildirim", "Fırsat &amp; teklif anlık uyarı"],
    ["Persona Quiz", "Hangi paket sana uyar"],
    ["Davet &amp; Bonus", "Her davet için +30 gün Plus"],
    ["Chrome Eklenti", "Sahibinden / arabam üzerinde tek tık"],
    ["Embed Widget", "Blog ve galeri sitelerine gömülebilir"],
    ["Galerici API", "Enterprise REST + webhook"],
  ];
  return (
    <section className="slide">
      <div className="kicker">03 · Özellikler</div>
      <h2>
        12 aktif modül,<br />
        <span className="accent">tek abonelikte.</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 40 }}>
        {items.map(([t, d]) => (
          <div key={t} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "#ecfdf5",
                color: "#10b981",
                fontWeight: 800,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{t}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }} dangerouslySetInnerHTML={{ __html: d }} />
            </div>
          </div>
        ))}
      </div>
      <FooterBar page={4} total={8} />
    </section>
  );
}

function Akis() {
  return (
    <section className="slide">
      <div className="kicker">04 · Nasıl Çalışır</div>
      <h2>
        Kayıt olmasan bile<br />
        <span className="accent">3 analiz ücretsiz</span>.
      </h2>
      <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 22 }}>
        <StepRow n="1" title="İlan linkini yapıştır" text="otosonar.com/analiz — sahibinden veya arabam.com URL'si." />
        <StepRow n="2" title="AI 8 saniyede raporu çıkarır" text="Emsal değer, gizli arıza sinyalleri, tamir tahmini, pazarlık kozu." />
        <StepRow n="3" title="Kararı verirken güvende hissedersin" text="Rapor PDF olarak saklanır, Geçmişim sayfasında her analiz tutulur." />
        <StepRow n="4" title="Galericisen stoğunu otomatize et" text="Bozdurma AI + trade-in + fleet dashboard + API. 2-10 kullanıcı." />
      </div>
      <FooterBar page={5} total={8} />
    </section>
  );
}

function StepRow({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "#10b981",
          color: "white",
          fontWeight: 800,
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</div>
        <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{text}</div>
      </div>
    </div>
  );
}

function Fiyat() {
  return (
    <section className="slide">
      <div className="kicker">05 · Fiyatlandırma</div>
      <h2>İki hedef kitle, net paket.</h2>
      <p className="lead">
        Tek bir iyi anlaşma 12 ay aboneliği çıkarır. İlk 100 galericiye <b className="accent">%30 ömür boyu indirim</b>.
      </p>

      <div style={{ marginTop: 30 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Bireysel (B2C)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <PriceBox tier="Plus" price="99" sub="25 analiz/ay" />
          <PriceBox tier="Pro" price="249" sub="Sınırsız" highlighted />
          <PriceBox tier="Max" price="449" sub="Pro + Vision AI" />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Galerici (B2B) — Kurucu fiyatı parantezde
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <PriceBox tier="Bayi Plus" price="799" founder="559" sub="2 kullanıcı" />
          <PriceBox tier="Bayi Pro" price="1.599" founder="1.119" sub="5 kullanıcı · API" highlighted />
          <PriceBox tier="Bayi Max" price="3.499" founder="2.449" sub="10 kullanıcı · Gold" />
        </div>
      </div>

      <p style={{ marginTop: "auto", fontSize: 12, color: "#94a3b8" }}>
        Fiyatlar TL/ay, KDV dahil · 14 gün cayma hakkı · 3D Secure
      </p>
      <FooterBar page={6} total={8} />
    </section>
  );
}

function PriceBox({
  tier,
  price,
  founder,
  sub,
  highlighted,
}: {
  tier: string;
  price: string;
  founder?: string;
  sub: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={highlighted ? "card card-strong" : "card"}
      style={{ padding: 16, position: "relative" }}
    >
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: -9,
            right: 12,
            fontSize: 9,
            fontWeight: 800,
            background: "#10b981",
            color: "white",
            padding: "3px 10px",
            borderRadius: 6,
            letterSpacing: ".08em",
          }}
        >
          POPÜLER
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>
        {tier}
      </div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 6 }}>
        {founder && (
          <span style={{ fontSize: 14, color: "#94a3b8", textDecoration: "line-through" }}>{price}</span>
        )}
        <span style={{ fontSize: 30, fontWeight: 800, color: "#0f172a" }}>{founder ?? price}</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>₺/ay</span>
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Guvenlik() {
  return (
    <section className="slide">
      <div className="kicker">06 · Güvenlik &amp; Uyum</div>
      <h2>
        KVKK uyumlu,<br />
        <span className="accent">sıfır ödün</span> tasarım.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 44, flex: 1 }}>
        {[
          ["bcrypt + HMAC", "Şifreler bcrypt cost 12, oturum token HMAC-SHA256 imzalı."],
          ["TOTP 2FA", "Google Authenticator destekli, galericide zorunlu."],
          ["Google ile Giriş", "Tek tıkla OAuth 2.0 akışı."],
          ["E-posta doğrulama", "Gmail SMTP üzerinden gerçek mail."],
          ["KVKK + Çerez", "Aydınlatma + onay + çerez tercih banner'ı."],
          ["Neon PITR", "7 gün point-in-time restore + haftalık pg_dump."],
          ["Rate limit", "Postgres tabanlı dayanıklı bucket."],
          ["3D Secure + PCI", "İyzico ile kart bilgisi sunucumuza ulaşmaz."],
        ].map(([t, d]) => (
          <div key={t} className="card">
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
      <FooterBar page={7} total={8} />
    </section>
  );
}

function Kapanis() {
  return (
    <section className="slide" style={{ justifyContent: "center", alignItems: "flex-start" }}>
      <div className="kicker">07 · Hazır</div>
      <h1>
        2. el araç alırken<br />
        artık <span className="accent">yalnız kalma</span>.
      </h1>
      <p className="lead" style={{ marginTop: 12 }}>
        Lansman 12 Mayıs 2026. Kurucu 100 Kulübü açık; ilk 100 galericiye ömür boyu %30 indirim.
      </p>
      <div style={{ marginTop: 50, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            padding: "16px 26px",
            background: "#10b981",
            color: "white",
            fontSize: 18,
            fontWeight: 800,
            borderRadius: 12,
            letterSpacing: ".01em",
          }}
        >
          otosonar.com
        </div>
        <div style={{ fontSize: 15, color: "#475569" }}>veya <b style={{ color: "#0f172a" }}>/kayit</b> → Google ile tek tık</div>
      </div>
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid #e2e8f0",
          paddingTop: 14,
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        İletişim: kurucu@otosonar.com &nbsp;·&nbsp; NiVector Teknoloji &nbsp;·&nbsp; 2026
      </div>
      <FooterBar page={8} total={8} />
    </section>
  );
}
