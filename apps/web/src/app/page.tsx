import Link from "next/link";
import {
  Target,
  Search,
  TrendingUp,
  Camera,
  Zap,
  ShieldAlert,
  Store,
  LineChart,
  Bell,
  type LucideIcon,
  Plus,
  Check,
  ArrowRight,
  MapPin,
  Sparkles,
  ShieldCheck,
  Lock,
  Award,
  CreditCard,
  Smartphone,
  Apple,
} from "lucide-react";
import RoiCalculator from "@/components/roi-calculator";
import { LogoMark, LogoLockup } from "@/components/logo";
import { InstallPrompt } from "@/components/install-prompt";
import { PricingTabs } from "@/components/pricing-tabs";
import { CountdownTimer } from "@/components/countdown-timer";
import { TrustBadges } from "@/components/trust-badges";
import { CompetitionTable } from "@/components/competition-table";
import { HowItWorks } from "@/components/how-it-works";
import { FreeVsPremium } from "@/components/free-vs-premium";
import { MarketplacePreview } from "@/components/marketplace-preview";

type Feature = { Icon: LucideIcon; title: string; desc: string };

const features: Feature[] = [
  {
    Icon: Target,
    title: "Emsal Değer AI",
    desc: "Türkiye 2026 pazar verisi üzerinden makine öğrenmesi ile %8 altı hata payıyla gerçek pazar değeri.",
  },
  {
    Icon: Search,
    title: "Gizli Arıza Tespiti",
    desc: "İlan metnindeki \"motor takırdıyor\", \"klima gaz eksik\" gibi sinyalleri yakalar, tamir bedelini çıkarır.",
  },
  {
    Icon: TrendingUp,
    title: "Pazarlık Skoru",
    desc: "İlandaki aciliyet ifadelerini okur (\"acil\", \"taşınıyorum\"), kaç TL pazarlık şansın var hesaplanır.",
  },
  {
    Icon: Camera,
    title: "Fotoğraftan Hasar AI",
    desc: "Yüksek çözünürlüklü fotoğraflarda boyalı panel, çamurluk değişimi, tampon darbesi tespiti.",
  },
  {
    Icon: Zap,
    title: "Günde 5 Fırsat",
    desc: "Galericilere özel: sistem hedef modellerini tarar, fiyat/değer oranı en iyi 5 aracı WhatsApp'a gönderir.",
  },
  {
    Icon: ShieldAlert,
    title: "Sahte İlan Alarmı",
    desc: "Aynı plakanın farklı şehirlerde listelenmesi, km manipülasyonu ve şüpheli satıcı tespiti.",
  },
  {
    Icon: Store,
    title: "Galerici Marketplace",
    desc: "Doğrulanmış galericilerin kapalı pazarı — şeffaf teklif, açık bid history, güvenli satış rozeti.",
  },
  {
    Icon: LineChart,
    title: "Fiyat Trendleri",
    desc: "Bu model son 6 ayda nasıl değişti? Şimdi almak mı, 2 hafta beklemek mi akıllıca?",
  },
  {
    Icon: Bell,
    title: "Anlık Push Bildirim",
    desc: "Kriterlerine uyan ilan yüklenir yüklenmez bildirim — rakibinden 5 dakika öndesin.",
  },
];

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <Nav />
      <CountdownTimer />
      <Hero />
      <MarketplacePreview />
      <HowItWorks />
      <Features />
      <FreeVsPremium />
      <CompetitionTable />
      <TrustBadges />
      <RoiCalculator />
      <PricingTabs />
      <FAQ />
      <Footer />
      <InstallPrompt />
    </main>
  );
}

function Nav() {
  return (
    <nav
      aria-label="Ana menü"
      className="sticky top-0 z-30 backdrop-blur-lg bg-bg/80 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          aria-label="OtoSonar ana sayfa"
          className="flex items-center gap-2"
        >
          <LogoMark size={28} />
          <span className="text-xl font-black gradient-text">OtoSonar</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/giris"
            className="btn-ghost text-sm hidden sm:inline-flex"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            Ücretsiz Başla
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 bg-glow" aria-hidden />
      <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent mb-6 animate-fade-up">
          <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
          Türkiye'nin ilk AI destekli araç zekası
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight animate-fade-up [animation-delay:80ms]">
          <span className="gradient-text">8 saniyede</span>
          <br className="hidden sm:block" /> aracın gerçek değerini öğren.
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:160ms]">
          <strong className="text-white">Alıcı için:</strong> yanlış aracı almanı engeller.
          <br className="hidden sm:block" />
          <strong className="text-white">Galerici için:</strong> doğru fiyattan alıp daha hızlı satman için <span className="text-accent font-semibold">kâr işletim sistemi</span>.
        </p>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto animate-fade-up [animation-delay:200ms]">
          Sahibinden / arabam.com ilanını yapıştır — gizli arıza, km oynaması, boya değişimi ve gerçek pazar değeri saniyeler içinde.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up [animation-delay:240ms]">
          <Link href="/kayit" className="btn-primary">
            3 Analizi Ücretsiz Dene
            <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </Link>
          <Link href="#pricing" className="btn-ghost">
            Paketlere Bak
          </Link>
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Kredi kartı gerekmez · 30 saniyede kurulum · İstediğin zaman iptal
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Özellikler
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Tek platform, <span className="gradient-text">tüm araç zekası</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Galericiler ve araç alıcıları için saatler süren araştırmayı
            saniyelere indiriyoruz.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card card-interactive animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="icon-badge mb-5">
                <f.Icon className="w-5 h-5" aria-hidden strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-lg mb-2 tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function FAQ() {
  const qa = [
    {
      q: "%92 doğruluk iddiası nasıl hesaplanıyor?",
      a: "2026 1. çeyrekte 8.400 gerçek araç ilanı üzerinde iç test yaptık. Modelin tahmini fiyat ile 30 gün içinde gerçekleşen satış fiyatı kıyaslandı — sapma oranı ortalama %8 altında kaldı. Veri kaynağı: SmartIQ 2026 pazar verisi + iç test veri seti. Raporlarda model güven skoru birlikte gösterilir.",
    },
    {
      q: "30 gün para iade garantisi nasıl çalışır?",
      a: "İlk 30 gün içinde herhangi bir nedenle memnun kalmazsan hesabından tek tıkla iade talebi açarsın. Para kartına veya IBAN'a 3 iş günü içinde döner — soru sormayız, sebep istemeyiz. Koşulsuz.",
    },
    {
      q: "OtoSonar sahibinden.com ve arabam.com ile resmi ortak mı?",
      a: "Hayır, bağımsız bir analiz platformuyuz. Kullanıcılar kendi oturumlarında gezdikleri ilanları Chrome eklentisi veya URL yapıştırma yoluyla analize verir. Verileri hiçbir zaman sitelerin sunucularından kazımayız — kullanıcı kendi gördüğü içeriği bize yönlendirir.",
    },
    {
      q: "Galericiler için gerçek avantajı nedir?",
      a: "OtoSonar, galericinin yanlış aracı almasını engelleyen + doğru fiyattan araç aldıran + stoğu daha hızlı eritmesini sağlayan bir kâr işletim sistemidir. Fiyat öneri modülü (alım / max / hızlı-satış / normal / risk / marj), stok devir tahmini, fırsat tarayıcı ve ilan puanlayıcı dahildir. Pro paket tek bir iyi araç anlaşmasında aylık 30-60 bin TL kazandırır.",
    },
    {
      q: "Ödemeler güvenli mi?",
      a: "Tüm ödemeler PayTR ve İyzico üzerinden alınır. Kart bilgilerin asla bizim sunucumuza değmez — PCI DSS SAQ-A kapsamındayız. 3D Secure zorunludur.",
    },
    {
      q: "KVKK uyumlu musunuz?",
      a: "Evet, VERBIS kayıtlı veri sorumlusuyuz. Vergi levhası ve IBAN gibi hassas veriler ayrı KMS şifreli bucket'ta, application-layer AES-256 şifrelemesiyle saklanır.",
    },
    {
      q: "Chrome Extension güvenli mi? Sahibinden hesabıma erişir mi?",
      a: "Eklenti yalnızca senin tarayıcında, senin oturumunda çalışır. Giriş bilgilerini, şifreni veya oturumunu hiçbir zaman görmez veya bize göndermez. Sadece bakmakta olduğun ilan verisini analize yönlendirir.",
    },
    {
      q: "İptal etmek kolay mı?",
      a: "Tek tıkla hesap panelinden iptal. İade koşulları: ilk 14 gün içinde koşulsuz iade, sonrasında kalan dönem kullanılabilir.",
    },
    {
      q: "Marketplace komisyonu neden 4.000 TL?",
      a: "Platformun gerçek katma değeri burada: güvenli satış rozeti, 7 gün gizli ayıp iade hakkı, ekspertiz entegrasyonu, noter yönlendirme. Max tier aboneleri %50 indirimle 2.000 TL öder.",
    },
  ];
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10">
          Sık sorulan sorular
        </h2>
        <div className="space-y-3">
          {qa.map((it) => (
            <details key={it.q} className="card group">
              <summary className="cursor-pointer font-semibold list-none flex items-center justify-between gap-4">
                <span>{it.q}</span>
                <Plus
                  className="w-5 h-5 text-accent shrink-0 transition-transform group-open:rotate-45"
                  aria-hidden
                  strokeWidth={2.5}
                />
              </summary>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10 text-sm text-slate-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <LogoLockup size={20} />
        <div>© 2026 OtoSonar · NiVector Teknoloji Ltd. Şti.</div>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="/gizlilik" className="hover:text-white transition">
            Gizlilik
          </Link>
          <Link href="/kvkk" className="hover:text-white transition">
            KVKK
          </Link>
          <Link href="/sozlesme" className="hover:text-white transition">
            Üyelik
          </Link>
          <Link href="/cerez" className="hover:text-white transition">
            Çerez
          </Link>
          <a
            href="mailto:destek@otosonar.com"
            className="hover:text-white transition"
          >
            Destek
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin className="w-3 h-3" aria-hidden />
          <span>Konya · Türkiye</span>
        </div>
      </div>
    </footer>
  );
}
