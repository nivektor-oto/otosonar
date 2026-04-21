import { LogoMark } from "@/components/logo";

export const metadata = {
  title: "OtoSonar v4 Sunum — Müşteri ve Galerici için",
  robots: "noindex",
};

export default function SunumV4() {
  return (
    <div className="sunum">
      <SlideCover />
      <SlideProblem />
      <SlideSolution />
      <SlideEcosystem />
      <SlideAIStack />
      <SlideMarketplace />
      <SlideUserJourney />
      <SlideSecurity />
      <SlideGrowth />
      <SlidePricing />
      <SlideMetrics />
      <SlideRoadmap />
      <SlideCta />

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #0a0a0f; }
        .sunum { font-family: var(--font-inter), 'Inter', system-ui, sans-serif; color: #e5e7eb; }
        .slide {
          width: 210mm; height: 297mm;
          page-break-inside: avoid;
          break-inside: avoid;
          position: relative;
          overflow: hidden;
          color: #e5e7eb;
          background: radial-gradient(ellipse at top, #15152a 0%, #0a0a0f 65%);
          padding: 18mm 16mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .slide + .slide { page-break-before: always; }
        .slide-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(#1a1a2e 1px, transparent 1px), linear-gradient(90deg, #1a1a2e 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 60%);
          opacity: 0.4;
          pointer-events: none;
        }
        .chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
          background: rgba(129,140,248,0.1); border: 1px solid rgba(129,140,248,0.3);
          color: #a5b4fc;
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #22d3ee 50%, #4ade80 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        h1 { font-size: 48px; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; font-weight: 900; }
        h2 { font-size: 32px; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 20px; font-weight: 800; }
        h3 { font-size: 20px; margin: 0 0 12px; font-weight: 700; }
        p  { margin: 0; line-height: 1.55; color: #cbd5e1; }
        .muted { color: #94a3b8; }
        .card { border: 1px solid #1a1a2e; background: rgba(255,255,255,0.02); border-radius: 16px; padding: 16px; }
        .footer {
          position: absolute; bottom: 12mm; left: 16mm; right: 16mm;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; color: #64748b;
          border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;
        }
        .big-num { font-size: 44px; font-weight: 900; line-height: 1; letter-spacing: -0.02em; }
        @media screen {
          body { padding: 20px 0; }
          .slide { margin: 0 auto 20px; box-shadow: 0 20px 60px rgba(0,0,0,.6); border-radius: 12px; }
        }
      `}</style>
    </div>
  );
}

function Footer({ page, section }: { page: number; section: string }) {
  return (
    <div className="footer">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LogoMark size={14} />
        <span>OtoSonar · otosonar.com</span>
      </div>
      <div>{section}</div>
      <div>
        {page} / 13 · v4 · 2026-04-21
      </div>
    </div>
  );
}

function SlideCover() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 40% at 30% 20%, rgba(129,140,248,.25), transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(34,211,238,.2), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <LogoMark size={36} />
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>OtoSonar</span>
          <span className="chip" style={{ marginLeft: 12 }}>AI · MARKETPLACE · SaaS</span>
        </div>
        <h1 className="gradient-text" style={{ fontSize: 64 }}>
          Türkiye&apos;nin 2. el<br />
          araç zekâ platformu
        </h1>
        <p style={{ fontSize: 20, color: "#cbd5e1", maxWidth: 540, marginTop: 16 }}>
          Galericiler ve bireysel alıcılar için uçtan uca AI — ilan analizi, hasar tespit, plaka OCR, bozdurma
          hesaplayıcı, şeffaf pazaryeri, davet bonusu, push bildirim, Chrome eklentisi.
        </p>
        <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
          <Stat value="12+" label="Aktif Modül" />
          <Stat value="~8 sn" label="Analiz süresi" />
          <Stat value="2026" label="Lansman yılı" />
        </div>
      </div>
      <Footer page={1} section="Kapak" />
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card" style={{ padding: "14px 18px", minWidth: 120 }}>
      <div className="big-num gradient-text" style={{ fontSize: 32 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, letterSpacing: ".05em" }}>{label}</div>
    </div>
  );
}

function SlideProblem() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>01 · PROBLEM</div>
      <h2>
        Türkiye&apos;de 2. el araç alan her 10 kişiden 6&apos;sı{" "}
        <span className="gradient-text">bilinçsiz fiyat ödüyor</span>.
      </h2>
      <p className="muted" style={{ fontSize: 16, maxWidth: 620, marginTop: 6 }}>
        Ekspertize gitmek 800-1500 TL ve 2 saat. Sahibinden&apos;deki ilanı gözle okuyup pazarlamak risk.
        Galericiye pazarlık şansı yok. Bu boşluk bizim fırsatımız.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28, flex: 1 }}>
        <Pain
          n="1"
          title="Bireysel alıcı"
          detail="İlanı 3 dk inceliyor, boya ile değiştirilmiş paneli fark edemeyebilir, pazar ortalamasını bilmiyor."
        />
        <Pain
          n="2"
          title="Galerici"
          detail="Stok alırken yanlış fiyat biçerse 30-50K TL zarar. Her araç için manuel Excel + telefonla gezinti."
        />
        <Pain
          n="3"
          title="Broker/komisyoncu"
          detail="İkinci elde müşteri-satıcı arasında güven problemi. Referans ve şeffaf teklif mekanizması yok."
        />
        <Pain
          n="4"
          title="Genel pazar"
          detail="Standart bir fiyat, hasar, kilometre doğrulama sistemi yok. Dolandırıcılık sık, KYC yok."
        />
      </div>
      <Footer page={2} section="Problem" />
    </section>
  );
}

function Pain({ n, title, detail }: { n: string; title: string; detail: string }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(239,68,68,0.15)",
            color: "#fca5a5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {n}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
      </div>
      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55 }}>{detail}</p>
    </div>
  );
}

function SlideSolution() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>02 · ÇÖZÜM</div>
      <h2>
        <span className="gradient-text">Tek bir platform</span> — 13 bileşen,<br />AI&apos;dan marketplace&apos;e uçtan uca.
      </h2>
      <p className="muted" style={{ fontSize: 15, maxWidth: 620, marginBottom: 26 }}>
        Bireysel kullanıcılara hız ve güven, galericilere stok yönetim otomasyonu, pazara ortak standart.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, flex: 1 }}>
        {[
          ["AI İlan Analizi", "OtoSonar AI çift-model", "Emsal değer, gizli arıza, pazarlık skoru"],
          ["Araç Bozdurma AI", "Galerici özel", "Alım fiyatı, marjı, redFlag, stok tahmini"],
          ["Foto Hasar Tespiti", "OtoSonar AI görü", "Boya, ezik, çizik, tampon ~TL"],
          ["Plaka OCR", "OtoSonar AI görü", "Türkiye plaka formatı + bölge"],
          ["Pazaryeri", "Faz 2 BETA", "İlan + ihale + satıcı kabul"],
          ["Pazar Araştırma", "Model trend", "Marka/model fiyat bandı"],
          ["Persona Quiz", "5 soru", "Hangi paket sana uygun"],
          ["Davet & Bonus", "Referral", "+30 gün Plus ödül"],
          ["Push Bildirim", "Web Push", "Teklif + fırsat + kabul"],
          ["Chrome Eklentisi", "SahibindenArabam üstü", "Tek tık analiz"],
          ["Embed Widget", "3. taraf siteler", "iframe + embed.js"],
          ["Galerici Paneli", "Fleet + API", "Verified rozet + multi-user"],
        ].map(([title, chip, detail]) => (
          <div key={title} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
            <div
              style={{
                display: "inline-block",
                fontSize: 9,
                color: "#67e8f9",
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.25)",
                marginBottom: 6,
              }}
            >
              {chip}
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>{detail}</p>
          </div>
        ))}
      </div>
      <Footer page={3} section="Çözüm" />
    </section>
  );
}

function SlideEcosystem() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>03 · EKOSİSTEM</div>
      <h2>Tek ekosistem, her cihazda.</h2>
      <p className="muted" style={{ fontSize: 15, maxWidth: 620, marginBottom: 24 }}>
        OtoSonar nerede çalışır: tarayıcı, iOS/Android PWA, Chrome eklentisi, 3. taraf embed, yönetici paneli, API.
      </p>
      <div
        style={{
          flex: 1,
          border: "1px solid #1a1a2e",
          borderRadius: 16,
          background:
            "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.15), transparent 70%)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          padding: 22,
        }}
      >
        {[
          { t: "Web + PWA", d: "otosonar.com — iOS/Android ana ekrana ekle" },
          { t: "Chrome Extension", d: "sahibinden & arabam ilan üstünde tek tık" },
          { t: "Embed Widget", d: "<script src=\"/embed.js\">\\n<div data-otosonar></div>" },
          { t: "Kurucu Paneli", d: "/yonetici — müşteri, ops, churn, waitlist" },
          { t: "Galerici API", d: "Bayi Pro tier — REST endpoint + webhook" },
          { t: "Push Bildirim", d: "VAPID — teklif + fırsat anında" },
        ].map((c) => (
          <div key={c.t} className="card">
            <div style={{ fontSize: 16, fontWeight: 700, color: "#a5b4fc", marginBottom: 6 }}>{c.t}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55 }}>{c.d}</div>
          </div>
        ))}
      </div>
      <Footer page={4} section="Ekosistem" />
    </section>
  );
}

function SlideAIStack() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>04 · AI KATMANI</div>
      <h2>
        <span className="gradient-text">Çift sağlayıcı</span> — sıfır down-time, düşük maliyet.
      </h2>
      <p className="muted" style={{ fontSize: 15, maxWidth: 620, marginBottom: 22 }}>
        OtoSonar AI çift-model doğrulama: birincil + yedek yapay zeka altyapısı, otomatik devralma. Zod ile
        çıktı validate edilir, prompt injection koruması aktif.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: "#67e8f9", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            Yapılar
          </div>
          {["İlan analizi (emsal + redFlag + pazarlık)", "Bozdurma AI (galerici alım fiyatı)", "Pazar araştırma (trend + bant)", "Fotoğraftan hasar (Vision)", "Plaka OCR (Vision)", "Persona quiz (deterministic)"].map((t) => (
            <div key={t} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", fontSize: 13 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            Güvenlik katmanları
          </div>
          {[
            "Prompt injection koruması (system prompt izolasyonu)",
            "Zod strict output validation",
            "Retry + exponential backoff (429/503)",
            "55s timeout + 5 MB image limit",
            "Image sha256 de-dup (dup yüklemede cache)",
            "Rate limit (free 5/saat, user 30/saat)",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", fontSize: 13 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <Footer page={5} section="AI Katmanı" />
    </section>
  );
}

function SlideMarketplace() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>05 · PAZARYERİ</div>
      <h2>Şeffaf ihale — alıcı ve satıcı <span className="gradient-text">aynı platformda</span>.</h2>
      <p className="muted" style={{ fontSize: 15, maxWidth: 620, marginBottom: 22 }}>
        Satıcı ilan verir → doğrulanmış galericiler teklif yapar → satıcı kabul eder → ilan SATILDI olur +
        kazanan galericiye push bildirim gider.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, flex: 1 }}>
        <Step n="1" title="İlan" text="Bireysel kullanıcı aracını ekler — marka, km, şehir, fiyat." />
        <Step n="2" title="Teklif" text="DEALER/BROKER kullanıcılar teklif verir. Push bildirim satıcıya gider." />
        <Step n="3" title="Kabul" text="Satıcı teklifi kabul → SATILDI, kazanan rozetli, bidder push alır." />
      </div>
      <div style={{ marginTop: 20 }} className="card">
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em" }}>
              Rate limit
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>20 ilan/saat &nbsp;·&nbsp; 60 teklif/saat</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em" }}>
              Min teklif
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>İstenen fiyatın %50&apos;si</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em" }}>
              Komisyon
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>İlk sürümde 0 · Faz 3&apos;te %1.5</div>
          </div>
        </div>
      </div>
      <Footer page={6} section="Pazaryeri" />
    </section>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #818cf8, #22d3ee)",
          color: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 900,
          marginBottom: 12,
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function SlideUserJourney() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>06 · KULLANICI YOLCULUĞU</div>
      <h2>Kayıt → Analiz → <span className="gradient-text">Değer</span>.</h2>
      <p className="muted" style={{ fontSize: 15, maxWidth: 620, marginBottom: 22 }}>
        E-posta + şifre veya Google ile tek tık kayıt. Otomatik müşteri numarası (OS-000001). Her eylem takip
        edilir, geçmiş saklanır, davet bonusu işler.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {[
          ["1. KAYIT", "E-posta/Google → otomatik OS-xxxxxx müşteri numarası + KVKK onayı"],
          ["2. PROFIL", "Ad, telefon, araç tercihleri (bütçe, marka, şehir) — bildirime girdi"],
          ["3. 2FA (opsiyonel)", "TOTP ile ekstra güvenlik — galericide önerilir"],
          ["4. ANALIZ", "İlan yapıştır → 8 sn → emsal + redFlag + pazarlık skoru kaydedilir"],
          ["5. BİLDİRİM", "Push subscribe → fırsat araç, teklif, davet bonusu anında"],
          ["6. PAZARYERİ", "İlan ekle veya galerici teklifleri kabul et"],
          ["7. DAVET", "Link paylaş → arkadaş abone olur → +30 gün Plus hediye"],
          ["8. GEÇMİŞ", "Tüm analizler + hasar + plaka /gecmis'te — rapor olarak indir"],
        ].map(([step, detail]) => (
          <div key={step} className="card" style={{ padding: 12, display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "#a5b4fc",
                minWidth: 120,
                letterSpacing: ".08em",
              }}
            >
              {step}
            </div>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>{detail}</div>
          </div>
        ))}
      </div>
      <Footer page={7} section="Kullanıcı Yolculuğu" />
    </section>
  );
}

function SlideSecurity() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>07 · GÜVENLİK &amp; GİZLİLİK</div>
      <h2>
        KVKK uyumlu, <span className="gradient-text">zero-trust</span> tasarım.
      </h2>
      <p className="muted" style={{ fontSize: 15, maxWidth: 620, marginBottom: 22 }}>
        Üretim seviyesi güvenlik: bcrypt, HMAC, TLS 1.3, Postgres rate limit, IP hash salting, TOTP 2FA, Zod
        validation, idempotent webhook&apos;lar.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1 }}>
        <SecCard title="Kullanıcı kimliği">
          <li>bcrypt cost 12 şifre hash</li>
          <li>HMAC-SHA256 session cookie (HttpOnly + Secure + SameSite=Lax)</li>
          <li>TOTP 2FA (otpauth kütüphanesi) — galericide önerilir</li>
          <li>Google OAuth (Apple Sign In hazır, Apple Developer hesabına bağlı)</li>
          <li>Session per-device + &quot;diğerlerini kapat&quot; butonu</li>
        </SecCard>
        <SecCard title="Uygulama katmanı">
          <li>Zod strict şema (in + out)</li>
          <li>Rate limit (Postgres bucket, dayanıklı)</li>
          <li>IP salted SHA-256 (PII yok)</li>
          <li>Prompt injection koruma (AI)</li>
          <li>Email enumeration byte-identical response</li>
        </SecCard>
        <SecCard title="Veri &amp; uyum">
          <li>KVKK aydınlatma + gizlilik + sözleşme + çerez sayfaları</li>
          <li>IBAN AES-256-GCM (app-level encryption)</li>
          <li>Neon PITR 7 gün + haftalık pg_dump cron</li>
          <li>Cookie banner (localStorage consent)</li>
          <li>Veri aktarım AB (Frankfurt) + Türkiye uyumlu</li>
        </SecCard>
        <SecCard title="Ödeme &amp; webhook">
          <li>İyzico PCI-DSS (kart OtoSonar&apos;a ulaşmaz)</li>
          <li>providerRef unique → idempotent webhook</li>
          <li>HMAC-SHA256 imza doğrulama</li>
          <li>PaymentIntent audit trail</li>
          <li>3D Secure zorunlu</li>
        </SecCard>
      </div>
      <Footer page={8} section="Güvenlik &amp; Gizlilik" />
    </section>
  );
}

function SecCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", marginBottom: 10 }}>{title}</div>
      <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.7 }}>
        {children}
      </ul>
    </div>
  );
}

function SlideGrowth() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>08 · BÜYÜME MOTORLARI</div>
      <h2>
        Kendi kendine büyüyen <span className="gradient-text">viral döngü</span>.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 18, flex: 1, marginTop: 10 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "#67e8f9", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            Akış
          </div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8 }}>
            Kullanıcı analiz yapar →<br />
            Faydayı görür →<br />
            Arkadaşa link paylaşır →<br />
            Arkadaş kayıt + abone olur →<br />
            Davet eden <b style={{ color: "#4ade80" }}>+30 gün Plus</b> kredi alır →<br />
            Davet eden tekrar kullanır …<br />
            <span style={{ color: "#94a3b8" }}>
              Sonuç: CAC düşer, LTV artar.
            </span>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
            Aktif büyüme kanalları
          </div>
          {[
            ["Referral kodu", "Her kullanıcıya otomatik kod, /davet sayfası"],
            ["Persona Quiz", "5 soru → tier önerisi → /kayit CTA"],
            ["Chrome eklentisi", "Sahibinden/Arabam ilanlarında görünür buton"],
            ["Embed widget", "3. taraf bloglar, galeri siteleri"],
            ["Push bildirim", "Re-engagement ücretsiz"],
            ["Kurucu 100 Kulübü", "İlk 100 galericiye ömür boyu %30 indirim"],
          ].map(([t, d]) => (
            <div key={t} style={{ padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer page={9} section="Büyüme" />
    </section>
  );
}

function SlidePricing() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>09 · FİYATLANDIRMA</div>
      <h2>İki pazar, iki fiyat yapısı.</h2>
      <p className="muted" style={{ fontSize: 14, marginBottom: 18 }}>
        Bireysel kullanıcılara uygun, galericilere komisyon-değil-abonelik modeli. İlk 100 galericiye ömür
        boyu %30 indirim.
      </p>

      <div style={{ marginBottom: 14, fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em" }}>
        BİREYSEL (B2C)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Price tier="Plus" price="99" sub="25 analiz/ay" feats={["Emsal + redFlag", "Pazarlık skoru", "Temel geçmiş"]} />
        <Price tier="Pro" price="249" sub="Sınırsız analiz" feats={["PDF rapor", "Push bildirim", "Tercih bildirimleri"]} highlighted />
        <Price tier="Max" price="449" sub="Pro + AI araçlar" feats={["Plaka OCR", "Hasar AI", "Öncelikli destek"]} />
      </div>

      <div style={{ marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em" }}>
        GALERİCİ (B2B) — Kurucu 100 fiyatı parantezde
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, flex: 1 }}>
        <Price
          tier="Bayi Plus"
          price="799"
          founder="559"
          sub="200 analiz/ay · 2 kullanıcı"
          feats={["Bozdurma AI", "Dealer rozet", "WhatsApp"]}
        />
        <Price
          tier="Bayi Pro"
          price="1.599"
          founder="1.119"
          sub="Sınırsız · 5 kullanıcı"
          feats={["Fleet dashboard", "API erişim", "Trade-in modu", "Günde 5 fırsat"]}
          highlighted
        />
        <Price
          tier="Bayi Max"
          price="3.499"
          founder="2.449"
          sub="Enterprise · 10 kullanıcı"
          feats={["Verified Gold", "%50 komisyon indirim", "SLA desteği", "Özel entegrasyon"]}
        />
      </div>
      <Footer page={10} section="Fiyatlandırma" />
    </section>
  );
}

function Price({
  tier,
  price,
  founder,
  sub,
  feats,
  highlighted,
}: {
  tier: string;
  price: string;
  founder?: string;
  sub: string;
  feats: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        position: "relative",
        border: highlighted ? "2px solid #22d3ee" : undefined,
        background: highlighted ? "rgba(34,211,238,0.06)" : undefined,
      }}
    >
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 10,
            fontSize: 9,
            fontWeight: 900,
            background: "#22d3ee",
            color: "#000",
            padding: "3px 10px",
            borderRadius: 8,
            letterSpacing: ".08em",
          }}
        >
          POPÜLER
        </div>
      )}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>{tier}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 6 }}>
        {founder && (
          <span style={{ fontSize: 14, color: "#64748b", textDecoration: "line-through" }}>{price}</span>
        )}
        <span style={{ fontSize: 26, fontWeight: 900 }}>{founder ?? price}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>TL/ay</span>
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>{sub}</div>
      <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11, color: "#cbd5e1", lineHeight: 1.7 }}>
        {feats.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

function SlideMetrics() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>10 · KAPASİTE &amp; METRİKLER</div>
      <h2>
        Bugün altyapı <span className="gradient-text">2.000+ aktif kullanıcı</span>&apos;yı kaldırır.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1, marginTop: 14 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>
            Kapasite (free tier)
          </div>
          {[
            ["Vercel bandwidth", "100 GB/ay", "3.300 user"],
            ["Vercel serverless", "100 GB-h/ay", "5.000 user"],
            ["Neon Postgres compute", "190 h/ay", "500 user"],
            ["AI birincil tier", "1.500 req/gün", "1.800 Plus user"],
            ["Concurrent conn.", "10 (pooler)", "Sınırsız"],
          ].map(([label, limit, cap]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,.05)", fontSize: 12 }}>
              <span style={{ color: "#94a3b8" }}>{label}</span>
              <span style={{ color: "#cbd5e1" }}>{limit}</span>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>{cap}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>
            MRR hedefleri
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["1. ay", "50K TL"],
              ["3. ay", "288K TL"],
              ["6. ay", "960K TL"],
              ["12. ay", "3.84M TL"],
            ].map(([m, v]) => (
              <div key={m} style={{ padding: 10, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "#fbbf24" }}>{m}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
            Exit hedefi: <b style={{ color: "#fff" }}>$10M+ arabam.com / sahibinden.com satış</b> 2. yıl sonu.
          </div>
        </div>
      </div>
      <Footer page={11} section="Kapasite &amp; Metrik" />
    </section>
  );
}

function SlideRoadmap() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 18 }}>11 · YOL HARİTASI</div>
      <h2>Şu an 48 sayfa, <span className="gradient-text">13 aktif modül</span>.</h2>
      <div style={{ display: "flex", gap: 16, flex: 1, marginTop: 14 }}>
        <Phase
          color="#4ade80"
          label="TAMAMLANAN"
          items={[
            "Bireysel auth + OAuth (Google)",
            "TOTP 2FA",
            "Analiz + bozdurma AI",
            "Hasar + plaka OCR (Vision)",
            "Pazaryeri + teklif kabul",
            "Referral + bonus",
            "Push (VAPID)",
            "Embed widget + Chrome ext",
            "Ops paneli + müşteri CSV",
            "KVKK + gizlilik + çerez",
            "Iyzico stub + idempotency",
            "Cron: sub expiry, cleanup",
            "Backup + DR planı",
          ]}
        />
        <Phase
          color="#fbbf24"
          label="SIRADAKİ"
          items={[
            "Resend email servisi",
            "Iyzico gerçek merchant",
            "Apple Sign In",
            "Native iOS/Android",
            "Chrome Web Store yayın",
            "Plaka üstü araç arama",
            "Marketplace komisyon",
            "WhatsApp bot entegrasyonu",
            "SSO (dealer enterprise)",
            "Fleet analytics grafikleri",
            "Dashboard trend grafikleri",
          ]}
        />
        <Phase
          color="#a5b4fc"
          label="VİZYON"
          items={[
            "Sahibinden/arabam resmi API ortaklığı",
            "Araç geçmişi blockchain imza",
            "Satış sonrası garanti pazarı",
            "Trade-in market analizi enterprise",
            "Sigortacıya veri export",
            "Kredi ortaklığı (banka)",
            "B2B uluslararası (KIB)",
          ]}
        />
      </div>
      <Footer page={12} section="Yol Haritası" />
    </section>
  );
}

function Phase({ color, label, items }: { color: string; label: string; items: string[] }) {
  return (
    <div
      className="card"
      style={{
        flex: 1,
        padding: 16,
        borderColor: color + "40",
        background: color + "08",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color,
          letterSpacing: ".1em",
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11, color: "#cbd5e1", lineHeight: 1.75 }}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function SlideCta() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(80% 50% at 50% 100%, rgba(34,211,238,.25), transparent 60%), radial-gradient(50% 40% at 30% 20%, rgba(129,140,248,.25), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", textAlign: "center", alignItems: "center" }}>
        <div className="chip" style={{ marginBottom: 26 }}>HAZIRLIK · 3 HAFTA · LANSMAN 12 MAYIS 2026</div>
        <h1 className="gradient-text" style={{ fontSize: 56 }}>
          2. el araç alırken<br />
          artık yalnız kalma.
        </h1>
        <p style={{ fontSize: 18, color: "#cbd5e1", maxWidth: 560, marginTop: 22, lineHeight: 1.6 }}>
          İlanını yapıştır, 8 saniyede gizli arızayı, emsal değeri ve pazarlık kozunu gör. Galericiysen
          bozdurma hesaplayıcısıyla stoğunu otomatize et.
        </p>
        <div style={{ marginTop: 38, display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              padding: "16px 28px",
              background: "linear-gradient(135deg, #10b981, #22d3ee)",
              color: "#000",
              fontSize: 18,
              fontWeight: 900,
              borderRadius: 14,
            }}
          >
            otosonar.com
          </div>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>
            veya <strong style={{ color: "#fff" }}>/kayit</strong> → Google ile tek tık
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 12, color: "#64748b" }}>
          İletişim: kurucu@otosonar.com &nbsp;·&nbsp; NiVector Teknoloji
        </div>
      </div>
      <Footer page={13} section="CTA" />
    </section>
  );
}
