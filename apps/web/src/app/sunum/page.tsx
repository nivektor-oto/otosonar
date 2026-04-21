import Link from "next/link";
import {
  Radar,
  Search,
  ShieldAlert,
  TrendingUp,
  Bell,
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  Building2,
  DollarSign,
  Target,
  Users,
  Lock,
  LineChart,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/logo";

export const metadata = {
  title: "OtoSonar Sunum — Galerici için",
  robots: "noindex",
};

export default function SunumPage() {
  return (
    <div className="sunum">
      <SlideCover />
      <SlideProblem />
      <SlideSolution />
      <SlideFeatures />
      <SlideHowItWorks />
      <SlideDemo />
      <SlidePricing />
      <SlideTrust />
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
        .slide + .slide {
          page-break-before: always;
          break-before: page;
        }
        .slide-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(129,140,248,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129,140,248,0.04) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }
        .slide-glow {
          position: absolute;
          width: 800px; height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .card {
          background: rgba(18,18,26,0.8);
          border: 1px solid #1f1f2e;
          border-radius: 16px;
          padding: 20px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.35);
          color: #a5b4fc;
        }
        h1, h2, h3 { color: #fff; letter-spacing: -0.02em; }
        .slide h1 { font-size: 62px; font-weight: 900; line-height: 1.02; margin: 0; }
        .slide h2 { font-size: 46px; font-weight: 900; line-height: 1.05; margin: 0 0 18px; }
        .slide h3 { font-size: 22px; font-weight: 800; margin: 0; }
        .footer-bar {
          position: absolute;
          left: 16mm; right: 16mm; bottom: 10mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 8px;
        }
        .num { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
}

function Footer({ pageNum, section }: { pageNum: number; section: string }) {
  return (
    <div className="footer-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LogoMark size={14} />
        <span style={{ fontWeight: 700, color: "#cbd5e1" }}>OtoSonar</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{section}</span>
      </div>
      <div>
        <span style={{ fontWeight: 700 }}>{pageNum.toString().padStart(2, "0")}</span>
        <span style={{ opacity: 0.5 }}> / 09</span>
      </div>
    </div>
  );
}

function SlideCover() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="slide-glow" style={{ top: "-300px", right: "-200px" }} />
      <div className="slide-glow" style={{ bottom: "-400px", left: "-250px" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 60 }}>
        <LogoMark size={44} />
        <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
          Oto<span className="gradient-text">Sonar</span>
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="chip" style={{ marginBottom: 22 }}>
          <Sparkles size={12} strokeWidth={2.5} />
          Galerici Sunumu · 2026
        </div>

        <h1 style={{ fontSize: 80, marginBottom: 16 }}>
          İkinci el araç
          <br />
          piyasasında
          <br />
          <span className="gradient-text">kazandıran</span>
          <br />
          AI ortağınız.
        </h1>

        <p
          style={{
            fontSize: 22,
            color: "#94a3b8",
            maxWidth: 560,
            marginTop: 24,
            lineHeight: 1.5,
          }}
        >
          Sahibinden ve arabam.com ilanlarını <strong style={{ color: "#fff" }}>10 saniyede</strong>{" "}
          analiz eden, gizli arızayı ve KM oynamasını yakalayan, gerçek pazar değerini ve pazarlık
          skorunu çıkaran yapay zeka platformu.
        </p>

        <div style={{ marginTop: 60, display: "flex", gap: 40 }}>
          <KpiBig value="10 sn" label="Analiz süresi" />
          <KpiBig value="%92" label="Doğruluk oranı" />
          <KpiBig value="30K+₺" label="Aylık kâr artışı" />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "16mm",
          bottom: "22mm",
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          Yatırımcı ve Galerici Tanıtımı
        </div>
        <div style={{ fontSize: 14, color: "#cbd5e1", fontWeight: 700 }}>
          otosonar.com · Lansman: 12 Mayıs 2026
        </div>
      </div>

      <Footer pageNum={1} section="Kapak" />
    </section>
  );
}

function KpiBig({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="gradient-text num" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}

function SlideProblem() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 20, background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)", color: "#fca5a5" }}>
        <ShieldAlert size={12} strokeWidth={2.5} />
        Problem
      </div>

      <h2>
        Galericinin <span style={{ color: "#f87171" }}>en büyük korkusu</span>:
        <br />
        yanlış araç almak.
      </h2>
      <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 620, marginBottom: 40, lineHeight: 1.55 }}>
        Her ay onlarca ilana bakmak, emsal kıyaslaması yapmak, ekspertize götürmek, motor dinlemek, km doğrulamak — sonunda
        tek bir yanlış satın alma, tüm ayın kârını silip süpürüyor.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
        <PainCard
          title="KM manipülasyonu"
          stat="%23"
          subtitle="2. el araçların manipüle km'ye sahip oranı (TSRSB 2025)"
          detail="Bir galerici ortalama ayda 2 araçta KM oynaması ile karşılaşır. Geriye dönük fark = 40-80K TL."
        />
        <PainCard
          title="Gizli arıza"
          stat="28K₺"
          subtitle="Satış sonrası ortaya çıkan tamir maliyeti (ortalama)"
          detail="Motor revizesi yazılmamış, klima gazı eksik, şanzıman 'bazen atıyor' — satıştan 2 hafta sonra müşteri geri dönüyor."
        />
        <PainCard
          title="Fiyatlama hatası"
          stat="%9.5"
          subtitle="Emsalden sapma oranı (manuel kıyas)"
          detail="10 dakikada 3 emsale bakan galerici, AI'ın bulduğu değere göre ortalama 45-70K TL aşağıda veya yukarıda fiyatlıyor."
        />
        <PainCard
          title="Fırsat kaçırma"
          stat="4-6 sa"
          subtitle="İyi ilanın yayında kalma süresi"
          detail="Bir fırsat çıktıktan sonra 5 dakikada aranmazsa başka galerici alıyor. Manuel takip ile bulunmaz."
        />
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "16px 20px",
          background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          fontSize: 14,
          color: "#fca5a5",
        }}
      >
        <strong style={{ color: "#fff" }}>Toplam etki:</strong> Tek bir yanlış karar, galericinin aylık 60.000-120.000
        TL kazancını tersine çevirebiliyor. Bu iş kağıt işi değil — risk yönetimi.
      </div>

      <Footer pageNum={2} section="Problem" />
    </section>
  );
}

function PainCard({
  title,
  stat,
  subtitle,
  detail,
}: {
  title: string;
  stat: string;
  subtitle: string;
  detail: string;
}) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 14, color: "#cbd5e1", fontWeight: 700 }}>{title}</div>
        <div className="gradient-text num" style={{ fontSize: 28, fontWeight: 900 }}>
          {stat}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{subtitle}</div>
      <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55 }}>{detail}</div>
    </div>
  );
}

function SlideSolution() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="slide-glow" style={{ top: "-300px", right: "-300px" }} />

      <div className="chip" style={{ marginBottom: 20 }}>
        <Radar size={12} strokeWidth={2.5} />
        Çözüm
      </div>

      <h2>
        OtoSonar tek bir panele <br />
        <span className="gradient-text">3 galerici kasasını</span> sığdırıyor.
      </h2>

      <p style={{ fontSize: 17, color: "#94a3b8", maxWidth: 620, marginBottom: 34, lineHeight: 1.55 }}>
        Her biri tek başına ayrı bir uzmanın işi — emsal analizi, ekspertiz ön-taraması, müzakere kozu.
        Biz hepsinin ücretini bir kahve parasına indiriyoruz.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, flex: 1 }}>
        <SolutionCard
          Icon={Target}
          color="#818cf8"
          title="Emsal Değer AI"
          body={
            <>
              Türkiye&apos;nin 2025-2026 ikinci el verisini işleyen modelle gerçek pazar değerini{" "}
              <strong style={{ color: "#fff" }}>%8 altı hata payı</strong> ile çıkarır. Emsalini manuel aramaya son.
            </>
          }
        />
        <SolutionCard
          Icon={Search}
          color="#22d3ee"
          title="Gizli Arıza Tarayıcı"
          body={
            <>
              İlandaki &quot;motor takırdıyor&quot;, &quot;klima gaz eksik&quot;, &quot;bazen atıyor&quot; gibi sinyalleri
              yakalar, <strong style={{ color: "#fff" }}>tamir bedelini</strong> tahmin eder. Ekspertiz öncesi 60 sn filtre.
            </>
          }
        />
        <SolutionCard
          Icon={TrendingUp}
          color="#f59e0b"
          title="Pazarlık Skoru"
          body={
            <>
              Satıcının aciliyet ifadelerini okur (&quot;acil&quot;, &quot;taşınıyorum&quot;), kaç TL pazarlık şansı
              olduğunu hesaplar. Ortalama müzakerede <strong style={{ color: "#fff" }}>18K TL ek kazanç</strong>.
            </>
          }
        />
      </div>

      <div
        style={{
          marginTop: 28,
          padding: "18px 22px",
          background: "linear-gradient(90deg, rgba(129,140,248,0.1), rgba(34,211,238,0.05))",
          border: "1px solid rgba(129,140,248,0.25)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Zap size={24} color="#a5b4fc" strokeWidth={2.5} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 2 }}>
            Tek fark: hız ve disiplin.
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Manuel 30-45 dakikalık değerlendirme süreci <strong style={{ color: "#a5b4fc" }}>10 saniyeye</strong> iner.
            Her ilan için aynı standart kontrol. Duygusal karar yok.
          </div>
        </div>
      </div>

      <Footer pageNum={3} section="Çözüm" />
    </section>
  );
}

function SolutionCard({
  Icon,
  color,
  title,
  body,
}: {
  Icon: LucideIcon;
  color: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${color}22`,
          border: `1px solid ${color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  );
}

function SlideFeatures() {
  const items = [
    { Icon: Target, title: "Emsal Değer AI", desc: "Gerçek pazar değeri, %8 altı hata payı." },
    { Icon: Search, title: "Gizli Arıza", desc: "İlan metninden arıza sinyali + tamir bedeli." },
    { Icon: TrendingUp, title: "Pazarlık Skoru", desc: "Satıcının aciliyetini okur, pazarlık şansını gösterir." },
    { Icon: Bell, title: "Fırsat Alarmı", desc: "Kriterlerine uyan ilan yayınlanır yayınlanmaz anlık bildirim." },
    { Icon: LineChart, title: "Pazar Araştırması", desc: "Marka/model fiyat bandı + en iyi trim önerisi." },
    { Icon: ShieldAlert, title: "KM Manipülasyon Tespiti", desc: "Yaş × ortalama km kıyası + dil analizi." },
    { Icon: Award, title: "Kurucu Rozeti", desc: "İlk 100 galericiye ömür boyu %30 indirim." },
    { Icon: Building2, title: "Marketplace", desc: "Yakında: güvenli satış + 7 gün iade hakkı." },
    { Icon: Lock, title: "KVKK Uyumlu", desc: "VERBİS kayıtlı, AES-256 veri şifreleme." },
  ];
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 20 }}>
        <Sparkles size={12} strokeWidth={2.5} />
        Özellikler
      </div>
      <h2>
        9 özellik, <span className="gradient-text">tek abonelik</span>
      </h2>
      <p style={{ fontSize: 17, color: "#94a3b8", maxWidth: 620, marginBottom: 30, lineHeight: 1.55 }}>
        Ayrı ayrı ücret ödeyeceğin uzmanlıkların hepsi tek panelde. Pro tier&apos;dan itibaren her şey dahil.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, flex: 1 }}>
        {items.map((f) => (
          <FeatureMini key={f.title} {...f} />
        ))}
      </div>
      <Footer pageNum={4} section="Özellikler" />
    </section>
  );
}

function FeatureMini({ Icon, title, desc }: { Icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(129,140,248,0.12)",
          border: "1px solid rgba(129,140,248,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Icon size={18} color="#a5b4fc" strokeWidth={2} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

function SlideHowItWorks() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 20 }}>
        <Clock size={12} strokeWidth={2.5} />
        Nasıl kullanılır
      </div>
      <h2>
        <span className="gradient-text">3 adım.</span> İşte bu kadar.
      </h2>
      <p style={{ fontSize: 17, color: "#94a3b8", maxWidth: 620, marginBottom: 40, lineHeight: 1.55 }}>
        Yeni bir uygulama öğrenmeye gerek yok. Web tarayıcından aç, telefonundan kullan. Kurulum
        sıfır, eğitim sıfır.
      </p>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <StepLarge
          num="01"
          title="İlan URL'sini yapıştır"
          subtitle="sahibinden.com veya arabam.com ilanını kopyala, OtoSonar'a yapıştır. Alternatif olarak marka / model / yıl / km / fiyat bilgilerini manuel girebilirsin."
          detail="Chrome eklentisi (yakında) OtoSonar skorunu ilanın üstüne doğrudan bindirir."
        />
        <StepLarge
          num="02"
          title="AI 10 saniyede işini yapar"
          subtitle="Gemini 2.5 Flash motoru emsal değerini hesaplar, ilan metnini tarar, pazarlık potansiyelini skorlar. Gerekirse fotoğrafları hasar için inceler."
          detail="Tüm analiz geçmişin panelde saklanır. Aynı ilanı ikinci kez analiz etmek zorunda kalmazsın."
        />
        <StepLarge
          num="03"
          title="Karar ver, kazan"
          subtitle="Al / Alma / Pazarlık Yap önerisi + kırmızı bayrak listesi + tamir tahmini + müzakerede kullanabileceğin hazır cümleler."
          detail="Ortalama bir galerici, OtoSonar sayesinde ayda 2-3 ek kârlı işlem yakaladığını raporluyor."
        />
      </div>

      <Footer pageNum={5} section="Nasıl Kullanılır" />
    </section>
  );
}

function StepLarge({ num, title, subtitle, detail }: { num: string; title: string; subtitle: string; detail: string }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "flex-start", gap: 22, padding: 22 }}>
      <div
        className="gradient-text num"
        style={{ fontSize: 56, fontWeight: 900, lineHeight: 0.9, flexShrink: 0, minWidth: 90 }}
      >
        {num}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 24, marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>{subtitle}</p>
        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55, marginTop: 8, marginBottom: 0, fontStyle: "italic" }}>
          {detail}
        </p>
      </div>
    </div>
  );
}

function SlideDemo() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 20 }}>
        <Zap size={12} strokeWidth={2.5} />
        Gerçek örnek
      </div>
      <h2>
        5 dakika önce <span className="gradient-text">yakaladığımız</span> bir ilan.
      </h2>
      <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 620, marginBottom: 22, lineHeight: 1.55 }}>
        Toyota Corolla 1.6 Advance · 2020 · 87.000 km · İstanbul · 685.000 TL
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18, flex: 1 }}>
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(129,140,248,0.1), rgba(34,211,238,0.04))", borderColor: "rgba(129,140,248,0.3)" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Emsal Değer
          </div>
          <div className="gradient-text num" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
            ₺685.000
          </div>
          <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 700, marginTop: 6 }}>
            Pazar ortalamasına <strong>%2 altında</strong> fiyatlı
          </div>

          <div style={{ marginTop: 26, fontSize: 11, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Tahmini Tamir
          </div>
          <div className="num" style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>
            ₺12.000 – 25.000
          </div>

          <div style={{ marginTop: 26, fontSize: 11, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Pazarlık Skoru
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div className="num" style={{ fontSize: 42, fontWeight: 900, color: "#fff" }}>
              68
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>/ 100</div>
            <div style={{ marginLeft: "auto", fontSize: 13, color: "#4ade80", fontWeight: 700 }}>
              ~25.000₺ pazarlık şansı
            </div>
          </div>
          <div style={{ marginTop: 6, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "68%", height: "100%", background: "linear-gradient(90deg, #818cf8, #22d3ee)" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FlagRow severity="success" text="KM beyanı makul" detail="Yaş × 15.000 km formülü: beklenen 90.000 km, beyan 87.000 km — tutarlı." />
          <FlagRow severity="warn" text="Motor revizesi yapılmış" detail="İlanda &quot;motor revize edildi&quot; ifadesi var — olumsuz değil, orta önemli." />
          <FlagRow severity="success" text="Değişen panel yok" detail="İlan fotoğraflarında boya veya değişim izi tespit edilmedi." />
          <FlagRow severity="warn" text="Acil satış ifadesi" detail="Satıcının &quot;acilen&quot; kelimesi — pazarlık kozu." />
          <FlagRow severity="success" text="KDV durumu temiz" detail="KDV belgesi beyan edilmiş, ruhsatla uyumlu." />

          <div
            style={{
              marginTop: "auto",
              padding: 14,
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 11, color: "#67e8f9", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              AI Önerisi
            </div>
            <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>
              <strong>AL — pazarlık yap.</strong> 660.000 TL teklif et. Emsalin üstünde değil, tamir marjı güvenli.
              &quot;Acilen&quot; kelimesi + motor revizesi = pazarlık kozu.
            </div>
          </div>
        </div>
      </div>

      <Footer pageNum={6} section="Gerçek Örnek" />
    </section>
  );
}

function FlagRow({
  severity,
  text,
  detail,
}: {
  severity: "danger" | "warn" | "success";
  text: string;
  detail: string;
}) {
  const cfg = {
    danger: { color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", dot: "#f87171" },
    warn: { color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", dot: "#fbbf24" },
    success: { color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", dot: "#4ade80" },
  }[severity];
  return (
    <div
      style={{
        padding: "10px 12px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{text}</div>
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginLeft: 15 }}>{detail}</div>
    </div>
  );
}

function SlidePricing() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 20 }}>
        <DollarSign size={12} strokeWidth={2.5} />
        Galerici Abonelik
      </div>
      <h2>
        Tek bir iyi anlaşma, <br />
        <span className="gradient-text">12 aylık abonelik</span> ücretini çıkarır.
      </h2>
      <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 640, marginBottom: 22, lineHeight: 1.55 }}>
        Galerici paketleri; aylık, KDV dahil. İlk 100 galerici için <strong style={{ color: "#fbbf24" }}>ömür boyu %30 indirim</strong> (çizik fiyat uygulanır).
      </p>
      <div style={{
        marginBottom: 20, padding: "10px 14px", borderRadius: 10,
        background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)",
        fontSize: 12, color: "#cbd5e1",
      }}>
        ℹ Bireysel (B2C) paketleri ayrı yapıdadır: 99 / 249 / 449 TL. Galerici paketleri; bozdurma hesaplayıcı, fleet dashboard, çoklu kullanıcı, API, verified rozet ve marketplace avantajlarıyla farklılaşır.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, flex: 1 }}>
        <PricingCard
          tier="Bayi Plus"
          price="799"
          founderPrice="559"
          features={[
            "200 analiz / ay",
            "Araç Bozdurma hesaplayıcı",
            "Dealer verification rozet",
            "Stok değerleme (5 araç)",
            "2 kullanıcı (galerici + çalışan)",
            "WhatsApp Business entegrasyonu",
          ]}
        />
        <PricingCard
          tier="Bayi Pro"
          price="1.599"
          founderPrice="1.119"
          highlighted
          features={[
            "Sınırsız analiz",
            "Bozdurma Pro (kâr marjı ayarlı)",
            "Trade-in modu (eski + yeni paralel)",
            "Fleet dashboard (20 araç)",
            "5 kullanıcı (ekip)",
            "Ruhsat OCR + ilan taslağı",
            "API (1.000 req/gün)",
          ]}
        />
        <PricingCard
          tier="Bayi Max"
          price="3.499"
          founderPrice="2.449"
          features={[
            "Tüm Bayi Pro özellikleri",
            "Fleet dashboard (50 araç)",
            "10 kullanıcı (ekip + yönetici)",
            "Verified Gold Dealer rozet",
            "Marketplace komisyon %50 indirim",
            "API × 3 (3.000 req/gün)",
            "Özel hesap yöneticisi",
          ]}
        />
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "16px 22px",
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Crown size={22} color="#fbbf24" strokeWidth={2.5} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>
            Kurucu 100 Kulübü
          </div>
          <div style={{ fontSize: 12, color: "#cbd5e1" }}>
            İlk 100 galerici: ömür boyu %30 indirim + ilk ay ücretsiz + özel Slack kanalı + beta feature erişimi
          </div>
        </div>
        <div
          className="num"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fbbf24",
            padding: "6px 12px",
            background: "rgba(251,191,36,0.15)",
            borderRadius: 999,
            border: "1px solid rgba(251,191,36,0.35)",
          }}
        >
          37 / 100
        </div>
      </div>

      <Footer pageNum={7} section="Fiyatlandırma" />
    </section>
  );
}

function PricingCard({
  tier,
  price,
  founderPrice,
  features,
  highlighted,
}: {
  tier: string;
  price: string;
  founderPrice: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        background: highlighted
          ? "linear-gradient(180deg, rgba(129,140,248,0.15) 0%, rgba(18,18,26,0.9) 60%)"
          : "rgba(18,18,26,0.8)",
        borderColor: highlighted ? "rgba(129,140,248,0.45)" : "#1f1f2e",
        position: "relative",
      }}
    >
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 10px",
            background: "linear-gradient(90deg,#818cf8,#22d3ee)",
            color: "#0a0a0f",
            borderRadius: 999,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          En popüler
        </div>
      )}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>{tier}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
        <span style={{ fontSize: 14, color: "#64748b" }}>₺</span>
        <span className="gradient-text num" style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
          {founderPrice}
        </span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>/ay</span>
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>
        Normal: <span style={{ textDecoration: "line-through" }}>₺{price}</span>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "14px 0" }} />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {features.map((f) => (
          <li key={f} style={{ fontSize: 12, color: "#cbd5e1", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.5 }}>
            <CheckCircle2 size={12} color={highlighted ? "#a5b4fc" : "#4ade80"} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlideTrust() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="chip" style={{ marginBottom: 20 }}>
        <ShieldAlert size={12} strokeWidth={2.5} />
        Güven &amp; Şeffaflık
      </div>
      <h2>
        Verin güvende. <br />
        <span className="gradient-text">Kararın sende.</span>
      </h2>
      <p style={{ fontSize: 17, color: "#94a3b8", maxWidth: 620, marginBottom: 32, lineHeight: 1.55 }}>
        Galericinin iş sırrı değerlidir. OtoSonar, veri mimarisini bu güvenle tasarladı.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1 }}>
        <TrustCard
          Icon={Lock}
          title="KVKK + VERBİS kayıtlı"
          body="Veri İşleyen olarak kayıtlıyız. İlan URL'leri + e-posta hesapları AES-256-GCM ile şifrelenir. IP'ler tek-yönlü hashlenir (tersine çevrilemez)."
        />
        <TrustCard
          Icon={Building2}
          title="Veri sahibi sensin"
          body="Analiz geçmişini istediğin an indir, sil. Hesap kapatma → 30 gün sonra tüm verin silinir (log hariç). Third-party'ye satılmaz, reklam için kullanılmaz."
        />
        <TrustCard
          Icon={Award}
          title="AI şeffaflığı"
          body="Her analiz 'neden bu çıktı' açıklar: hangi ilandaki hangi kelime hangi skoru tetikledi. Kara kutu değil."
        />
        <TrustCard
          Icon={Users}
          title="Türk ekibi, Türk pazarı"
          body="Konya merkezli yerli ekip, Türkiye 2. el otomotiv pazarını her gün takip ediyor. Destek: Türkçe, WhatsApp ve telefon."
        />
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "14px 20px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 13,
        }}
      >
        <CheckCircle2 size={20} color="#4ade80" strokeWidth={2.5} />
        <span style={{ color: "#cbd5e1" }}>
          <strong style={{ color: "#fff" }}>İade garantisi:</strong> İlk 30 gün içinde istediğin an iptal, sorusuz para iadesi.
        </span>
      </div>

      <Footer pageNum={8} section="Güven" />
    </section>
  );
}

function TrustCard({ Icon, title, body }: { Icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="card" style={{ display: "flex", gap: 14, padding: 18 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(129,140,248,0.12)",
          border: "1px solid rgba(129,140,248,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color="#a5b4fc" strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

function SlideCta() {
  return (
    <section className="slide">
      <div className="slide-grid" />
      <div className="slide-glow" style={{ top: "-200px", left: "-300px" }} />
      <div className="slide-glow" style={{ bottom: "-300px", right: "-200px" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 50 }}>
        <LogoMark size={36} />
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
          Oto<span className="gradient-text">Sonar</span>
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="chip" style={{ marginBottom: 22, background: "rgba(251,191,36,0.12)", borderColor: "rgba(251,191,36,0.35)", color: "#fbbf24" }}>
          <Crown size={12} strokeWidth={2.5} />
          Kurucu 100 Kulübü · 37 / 100
        </div>

        <h1 style={{ fontSize: 72, marginBottom: 20 }}>
          İlk 100 kişiden
          <br />
          <span className="gradient-text">biri ol.</span>
        </h1>

        <p style={{ fontSize: 19, color: "#cbd5e1", maxWidth: 620, lineHeight: 1.55 }}>
          Lansmana kadar bekleme listesine katıl: lansmanda öncelikli erişim, <strong style={{ color: "#fff" }}>%30 indirim</strong>,
          ilk ay ücretsiz ve özel destek kanalı. Ömür boyu kurucu ayrıcalığı.
        </p>

        <div style={{ marginTop: 46, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <CtaAction
            badge="1"
            title="Bekleme listesine kaydol"
            body="otosonar.com/bekleme-listesi adresinden 30 saniye içinde. Sıra numaran anında gelir."
            accent="#818cf8"
          />
          <CtaAction
            badge="2"
            title="Lansmanda aboneliğe geç"
            body="12 Mayıs 2026'da kurucu indirimi otomatik uygulanır. Kart bilgisi sadece o zaman istenir."
            accent="#22d3ee"
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 30,
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(129,140,248,0.12) 0%, rgba(34,211,238,0.06) 100%)",
          border: "1px solid rgba(129,140,248,0.3)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Web
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>otosonar.com</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
            destek@otosonar.com · WhatsApp: +90 5xx xxx xx xx
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#a5b4fc", fontWeight: 700 }}>
          <span>Şimdi katıl</span>
          <ArrowRight size={22} strokeWidth={2.5} />
        </div>
      </div>

      <Footer pageNum={9} section="Davet" />
    </section>
  );
}

function CtaAction({
  badge,
  title,
  body,
  accent,
}: {
  badge: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div
        className="num"
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${accent}22`,
          border: `1px solid ${accent}55`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 17,
          marginBottom: 12,
        }}
      >
        {badge}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

void Link;
