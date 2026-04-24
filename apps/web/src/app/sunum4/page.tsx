import { LogoMark } from "@/components/logo";

export const metadata = {
  title: "OtoSonar — Sunum v5",
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
      <Pazaryeri />
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
        h2 { font-size: 34px; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 18px; font-weight: 700; color: #0f172a; }
        h3 { font-size: 17px; margin: 0 0 8px; font-weight: 700; color: #0f172a; }
        p, li { font-size: 14px; line-height: 1.6; color: #475569; margin: 0; }
        .lead { font-size: 18px; line-height: 1.55; color: #334155; margin-top: 4px; max-width: 560px; }
        .accent { color: #10b981; }
        .muted { color: #94a3b8; }
        .footer {
          position: absolute; bottom: 14mm; left: 22mm; right: 22mm;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; color: #94a3b8;
          border-top: 1px solid #e2e8f0; padding-top: 10px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
        }
        .card-strong {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }
        .card-accent {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #6ee7b7;
        }
        .num {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #10b981;
        }
        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
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
      <span>OtoSonar · NiVector · otosonar.com</span>
      <span>{page} / {total}</span>
    </div>
  );
}

function Cover() {
  return (
    <section className="slide" style={{ justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <LogoMark size={42} />
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>
          OtoSonar
        </span>
      </div>
      <div className="kicker">Türkiye · AI araç zekâ platformu</div>
      <h1>
        İlanı yapıştır,<br />
        <span className="accent">8 saniyede</span><br />
        karar ver.
      </h1>
      <p className="lead" style={{ marginTop: 12 }}>
        Bireysel alıcı için yanlış aracı engeller. Galerici için
        <strong style={{ color: "#0f172a" }}> kâr işletim sistemi</strong> —
        doğru fiyattan alım, daha hızlı satış.
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span className="badge">12 MAYIS 2026 · LANSMAN</span>
        <span className="badge">3 GÜN ÜCRETSIZ DENE</span>
        <span className="badge">AI DESTEKLİ TAHMİN</span>
      </div>
      <div style={{ marginTop: "auto", fontSize: 12, color: "#94a3b8" }}>
        NiVector · Müşteri Sunumu · Sürüm 5
      </div>
      <FooterBar page={1} total={9} />
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
        Yılda 9 milyon 2. el araç el değiştiriyor. Alıcı fiyatı tahmin eder, galerici Excel tutar, kimse gizli arızayı görmeden imza atar. Ekspertiz 800 TL, yarım gün.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 36 }}>
        <div className="card">
          <div className="num">68%</div>
          <h3 style={{ marginTop: 10 }}>Piyasa üstü ödüyor</h3>
          <p>Bireysel alıcıların emsal değer fikri yok.</p>
        </div>
        <div className="card">
          <div className="num">30K₺</div>
          <h3 style={{ marginTop: 10 }}>Aylık zarar</h3>
          <p>Yanlış fiyatlandırma bir galericiye düşük marj + stok beklemesi.</p>
        </div>
        <div className="card">
          <div className="num">0</div>
          <h3 style={{ marginTop: 10 }}>Standart doğrulama</h3>
          <p>Tutarlı fiyat, hasar ve km kontrol sistemi yok.</p>
        </div>
      </div>
      <FooterBar page={2} total={9} />
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
        Aynı AI motor, üç farklı hedef: alıcıya güven, galericiye kâr, pazara şeffaflık.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 40, flex: 1 }}>
        <div className="card">
          <h3>Bireysel</h3>
          <ul style={{ margin: "10px 0 0", paddingLeft: 16, listStyle: "disc" }}>
            <li>İlan + URL analizi</li>
            <li>Fotoğraftan hasar</li>
            <li>Plaka OCR</li>
            <li>Arıza teşhis</li>
            <li>PDF rapor + QR</li>
          </ul>
        </div>
        <div className="card card-accent">
          <h3>Galerici — Kâr motoru</h3>
          <ul style={{ margin: "10px 0 0", paddingLeft: 16, listStyle: "disc", color: "#065f46" }}>
            <li>Fiyat önerisi (alım/max/hızlı/normal)</li>
            <li>Stok eritme takvimi 7/14/30</li>
            <li>Fırsat tarayıcı</li>
            <li>Bozdurma + trade-in</li>
            <li>Fleet + API + ekip</li>
          </ul>
        </div>
        <div className="card">
          <h3>Pazaryeri</h3>
          <ul style={{ margin: "10px 0 0", paddingLeft: 16, listStyle: "disc" }}>
            <li>Doğrulanmış galerici</li>
            <li>Şeffaf teklif akışı</li>
            <li>2 ücretsiz ilan · sonrası 500 TL</li>
            <li>Galerici kotalı</li>
            <li>Push uyarı</li>
          </ul>
        </div>
      </div>
      <FooterBar page={3} total={9} />
    </section>
  );
}

function Ozellikler() {
  return (
    <section className="slide">
      <div className="kicker">03 · Özellikler</div>
      <h2>
        13 modül, <span className="accent">hepsi çalışır</span>.
      </h2>
      <p className="lead" style={{ maxWidth: 600 }}>
        Mayıs lansmanında hazır. AI modülleri OtoSonar AI çift-model doğrulama ile çalışır.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 28, flex: 1 }}>
        <FeatureCard icon="📋" title="İlan URL Analizi" body="Sahibinden/Arabam linkini yapıştır, 8 sn rapor." />
        <FeatureCard icon="🔧" title="Fotoğraftan Hasar" body="OtoSonar AI görü — boya, değişen, tamir." new />
        <FeatureCard icon="🚨" title="Arıza Teşhis" body="Marka + arıza tarifi → aciliyet + maliyet." new />
        <FeatureCard icon="📸" title="Plaka OCR + VIN" body="Plakadan sorgu ve geçmiş." />
        <FeatureCard icon="💰" title="Bozdurma / Fiyat" body="Alım/max/hızlı/normal + stok takvimi." />
        <FeatureCard icon="🎯" title="Fırsat Tarayıcı" body="Galericinin hedeflerinde uyarı." />
        <FeatureCard icon="🛒" title="Pazaryeri + Teklif" body="İlan paylaş, teklif kabul, push." />
        <FeatureCard icon="🎁" title="Referral Motoru" body="Her davete +30 gün Plus." />
        <FeatureCard icon="✅" title="Outcome Feedback" body="Aldım/yanlış çıktı — model öğrenir." new />
        <FeatureCard icon="📑" title="PDF Rapor + QR" body="Hasar raporu paylaşılabilir link." new />
        <FeatureCard icon="🔌" title="Chrome Eklenti" body="İlan sayfasında tek tık analiz." />
        <FeatureCard icon="🌐" title="PWA + Push" body="iOS/Android native gibi kurulur." />
      </div>
      <FooterBar page={4} total={9} />
    </section>
  );
}

function FeatureCard({ icon, title, body, new: isNew }: { icon: string; title: string; body: string; new?: boolean }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <h3 style={{ fontSize: 14, margin: 0 }}>{title}</h3>
        {isNew && <span className="badge" style={{ fontSize: 8, padding: "1px 6px" }}>Yeni</span>}
      </div>
      <p style={{ fontSize: 12, marginTop: 4 }}>{body}</p>
    </div>
  );
}

function Akis() {
  return (
    <section className="slide">
      <div className="kicker">04 · Nasıl çalışır</div>
      <h2>
        11 saniyede <span className="accent">karar</span>.
      </h2>
      <p className="lead">
        Üç adım, sıfır ezber. Kayıt ol, ilan gir, rapor oku — karar senin.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 44, flex: 1 }}>
        <Step n="01" title="İlanı yapıştır" body="Sahibinden / Arabam linkini kopyala. Ya da marka, model, km manuel gir." hint="3 saniye" />
        <Step n="02" title="AI analiz etsin" body="OtoSonar AI çift-model doğrulama: emsal değer, gizli arıza, pazarlık skoru." hint="8 saniye" />
        <Step n="03" title="Karar ver" body="Al, pazarla ya da vazgeç. Rapor sonunda net tavsiye + PDF + QR." hint="Paylaş" />
      </div>
      <FooterBar page={5} total={9} />
    </section>
  );
}

function Step({ n, title, body, hint }: { n: string; title: string; body: string; hint: string }) {
  return (
    <div className="card">
      <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", letterSpacing: "-0.02em" }}>{n}</div>
      <h3 style={{ marginTop: 8 }}>{title}</h3>
      <p style={{ marginTop: 6 }}>{body}</p>
      <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.1em" }}>{hint}</div>
    </div>
  );
}

function Pazaryeri() {
  return (
    <section className="slide">
      <div className="kicker">05 · Pazaryeri</div>
      <h2>
        İlk 2 ücretsiz, <span className="accent">sonrası 500 TL sabit</span>.
      </h2>
      <p className="lead">
        Bireysel kullanıcılar ilanlarını paylaşır. Galericiler paketlerine göre aylık kotalı ilan + teklif yapar.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 40, flex: 1 }}>
        <div className="card">
          <h3>Bireysel</h3>
          <ul style={{ margin: "10px 0 0", paddingLeft: 16, listStyle: "disc" }}>
            <li><strong style={{ color: "#0f172a" }}>2 ilan ücretsiz</strong> (sonsuza)</li>
            <li>3. ilandan itibaren 500 TL sabit</li>
            <li>Doğrulanmış galericilere teklif açar</li>
          </ul>
        </div>
        <div className="card card-accent">
          <h3>Galerici paketi içinde</h3>
          <ul style={{ margin: "10px 0 0", paddingLeft: 16, listStyle: "disc", color: "#065f46" }}>
            <li>Plus: 7 ilan / ay</li>
            <li>Pro: 15 ilan / ay</li>
            <li>Max: 25 ilan / ay</li>
            <li>Aşım: ilan başına 500 TL</li>
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: 16, background: "#f8fafc", borderRadius: 12, fontSize: 13, color: "#475569" }}>
        Galerici 2026-05 öncesi doğrulama için firma bilgisi + vergi levhası yükler. OtoSonar Onaylı rozeti ile açık pazar görünümü.
      </div>
      <FooterBar page={6} total={9} />
    </section>
  );
}

function Fiyat() {
  return (
    <section className="slide">
      <div className="kicker">06 · Fiyatlandırma</div>
      <h2>
        Sade fiyat, <span className="accent">net değer</span>.
      </h2>
      <p className="lead">
        3 gün ücretsiz dene · Yıllık ödemede 2 ay hediye · İstediğin zaman iptal
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32, flex: 1 }}>
        <div className="card">
          <div className="badge">Bireysel · B2C</div>
          <div style={{ marginTop: 14 }}>
            <PriceRow name="Plus" price="99" desc="25 analiz / ay · temel tespit" />
            <PriceRow name="Pro" price="249" desc="Sınırsız analiz · Chrome eklenti · WA destek" highlight />
            <PriceRow name="Max" price="449" desc="Hasar AI · Plaka OCR · 3 kullanıcı" />
          </div>
        </div>
        <div className="card card-accent">
          <div className="badge" style={{ background: "#d1fae5", color: "#047857" }}>Galerici · B2B</div>
          <div style={{ marginTop: 14 }}>
            <PriceRow name="Bayi Plus" price="559" strike="799" desc="200 analiz · 2 kullanıcı · WA bot" />
            <PriceRow name="Bayi Pro" price="1.119" strike="1.599" desc="Sınırsız · fleet · API · 5 kullanıcı" highlight />
            <PriceRow name="Bayi Max" price="2.449" strike="3.499" desc="Gold rozet · API x3 · danışmanlık" />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
        Galerici fiyatları Kurucu 100 Kulübü dahil (ömür boyu %30 indirim). Yıllık ödemede 2 ay hediye tüm paketlerde geçerli.
      </div>
      <FooterBar page={7} total={9} />
    </section>
  );
}

function PriceRow({ name, price, strike, desc, highlight }: { name: string; price: string; strike?: string; desc: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: "10px 0",
      borderBottom: "1px solid #e2e8f0",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 12,
      alignItems: "baseline",
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: highlight ? "#047857" : "#0f172a" }}>
          {name}
          {highlight && <span style={{ marginLeft: 8, fontSize: 9, background: "#10b981", color: "white", padding: "1px 6px", borderRadius: 999, letterSpacing: "0.08em" }}>POPÜLER</span>}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        {strike && <span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through", marginRight: 4 }}>{strike}</span>}
        <span style={{ fontSize: 18, fontWeight: 800, color: highlight ? "#047857" : "#0f172a" }}>{price}</span>
        <span style={{ fontSize: 10, color: "#64748b", marginLeft: 2 }}>TL/ay</span>
      </div>
    </div>
  );
}

function Guvenlik() {
  return (
    <section className="slide">
      <div className="kicker">07 · Güven</div>
      <h2>
        <span className="accent">AI destekli tahmin</span>,<br />
        30 gün koşulsuz iade.
      </h2>
      <p className="lead">
        Her iddianın arkasında kaynak var. Kötü çıktı mı? Tek tıkla iade — soru sormadan.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 36, flex: 1 }}>
        <div className="card">
          <h3>AI Destekli Tahmin</h3>
          <p style={{ marginTop: 6 }}>
            AI pazar bilgisi ve büyüyen galerici ağı verisiyle her gün kalibre olur. Her raporda modelin güven skoru birlikte gösterilir.
          </p>
          <div style={{ marginTop: 8, fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>
            Kaynak: AI pazar verisi + galerici ağı
          </div>
        </div>
        <div className="card">
          <h3>30 gün iade</h3>
          <p style={{ marginTop: 6 }}>
            İlk 30 gün içinde sorun çıkarsa tek tıkla iade. Kart veya IBAN'a 3 iş günü. Koşulsuz.
          </p>
        </div>
        <div className="card">
          <h3>KVKK + VERBİS</h3>
          <p style={{ marginTop: 6 }}>
            Veri sorumlusu sıfatıyla kayıtlı. Her rapor şifreli + audit log'lu. Hassas alanlar KMS şifreli.
          </p>
        </div>
        <div className="card card-strong">
          <h3>OtoSonar Onaylı</h3>
          <p style={{ marginTop: 6, color: "#065f46" }}>
            Her AI raporu OtoSonar AI çift-model kontrolü + güven skoru. Düşük skor = manuel inceleme önerisi.
          </p>
        </div>
      </div>
      <FooterBar page={8} total={9} />
    </section>
  );
}

function Kapanis() {
  return (
    <section className="slide" style={{ justifyContent: "center" }}>
      <div className="kicker">08 · Kapanış</div>
      <h1>
        12 Mayıs&apos;ta<br />
        <span className="accent">sahnedeyiz</span>.
      </h1>
      <p className="lead" style={{ marginTop: 16, maxWidth: 520 }}>
        Kurucu 100 Kulübü açık — ömür boyu %30 indirim, sadece 37 galerici koltuk kaldı. Bireysel için 3 gün ücretsiz deneme.
      </p>
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="card card-accent">
          <h3>Bireysel</h3>
          <p style={{ marginTop: 6, color: "#065f46" }}>otosonar.com/kayit</p>
        </div>
        <div className="card card-accent">
          <h3>Galerici</h3>
          <p style={{ marginTop: 6, color: "#065f46" }}>otosonar.com/bekleme-listesi</p>
        </div>
        <div className="card card-accent">
          <h3>Kurumsal</h3>
          <p style={{ marginTop: 6, color: "#065f46" }}>kurumsal@otosonar.com</p>
        </div>
      </div>
      <div style={{ marginTop: "auto", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
        OtoSonar · NiVector markası · 2026
      </div>
      <FooterBar page={9} total={9} />
    </section>
  );
}
