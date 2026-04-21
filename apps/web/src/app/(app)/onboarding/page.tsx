"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { toast } from "sonner";

type Step = 0 | 1 | 2 | 3 | 4;
type UserType = "buyer" | "dealer" | null;
type DealerVolume = "small" | "medium" | "large" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [userType, setUserType] = useState<UserType>(null);
  const [volume, setVolume] = useState<DealerVolume>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");

  const recommendedTier = getRecommendedTier(userType, volume);

  const goNext = () => setStep((s) => (Math.min(4, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(0, s - 1) as Step));

  return (
    <main className="min-h-screen bg-bg text-white flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <LogoMark size={24} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
          </Link>
          <div className="text-xs text-slate-400 tabular-nums">
            Adım {step + 1} / 5
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 w-full flex-1">
        <ProgressBar step={step} />

        <div className="mt-10 animate-fade-in" key={step}>
          {step === 0 && (
            <StepWelcome
              onBuyer={() => {
                setUserType("buyer");
                goNext();
              }}
              onDealer={() => {
                setUserType("dealer");
                goNext();
              }}
            />
          )}
          {step === 1 && userType === "dealer" && (
            <StepDealerVolume
              onPick={(v) => {
                setVolume(v);
                goNext();
              }}
            />
          )}
          {step === 1 && userType === "buyer" && (
            <StepBuyerPreferences onNext={goNext} />
          )}
          {step === 2 && (
            <StepRecommendation
              tier={recommendedTier}
              userType={userType}
              onNext={goNext}
            />
          )}
          {step === 3 && (
            <StepAccount
              fullName={fullName}
              email={email}
              phone={phone}
              onChange={(field, v) => {
                if (field === "fullName") setFullName(v);
                if (field === "email") setEmail(v);
                if (field === "phone") setPhone(v);
              }}
              onNext={() => {
                toast.success("Hesap oluşturuldu 🎉", {
                  description: "Deneme süren başladı.",
                });
                goNext();
              }}
            />
          )}
          {step === 4 && (
            <StepFinish
              tier={recommendedTier}
              userType={userType}
              email={email}
              onStart={() => router.push("/analiz")}
            />
          )}

          {step > 0 && step < 4 && (
            <button
              onClick={goBack}
              className="mt-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden /> Geri
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function getRecommendedTier(
  userType: UserType,
  volume: DealerVolume
): "Plus" | "Pro" | "Max" {
  if (userType === "buyer") return "Pro";
  if (volume === "small") return "Plus";
  if (volume === "medium") return "Pro";
  if (volume === "large") return "Max";
  return "Pro";
}

function ProgressBar({ step }: { step: Step }) {
  const pct = ((step + 1) / 5) * 100;
  return (
    <div
      className="h-1.5 w-full bg-panel rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={step + 1}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-label="Kurulum ilerlemesi"
    >
      <div
        className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StepWelcome({
  onBuyer,
  onDealer,
}: {
  onBuyer: () => void;
  onDealer: () => void;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent mb-5">
        <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} /> Hoş geldin
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
        Başlayalım mı?
      </h1>
      <p className="text-slate-400 mb-10">
        OtoSonar&apos;ı senin için en iyi şekilde hazırlayabilmemiz için birkaç
        soru soracağız.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onBuyer}
          className="card card-interactive text-left group flex flex-col items-start"
        >
          <div className="icon-badge mb-4">
            <Car className="w-5 h-5" aria-hidden strokeWidth={1.75} />
          </div>
          <div className="font-semibold text-lg mb-1">Binecek araba alacağım</div>
          <div className="text-sm text-slate-400 leading-relaxed flex-1">
            İlanları analiz et, gerçek fiyatı öğren, dolandırılma riskini sıfırla.
          </div>
          <div className="mt-4 text-accent text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Alıcı olarak devam <ArrowRight className="w-4 h-4" aria-hidden />
          </div>
        </button>
        <button
          onClick={onDealer}
          className="card card-interactive text-left group flex flex-col items-start"
        >
          <div className="icon-badge mb-4">
            <Briefcase className="w-5 h-5" aria-hidden strokeWidth={1.75} />
          </div>
          <div className="font-semibold text-lg mb-1">
            Araç ticareti ile uğraşıyorum
          </div>
          <div className="text-sm text-slate-400 leading-relaxed flex-1">
            Günde 5 fırsat, marketplace, toplu analiz — galerici için tasarlandı.
          </div>
          <div className="mt-4 text-accent text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Galerici olarak devam{" "}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </div>
        </button>
      </div>
    </div>
  );
}

function StepDealerVolume({ onPick }: { onPick: (v: DealerVolume) => void }) {
  const options: { key: DealerVolume; label: string; hint: string }[] = [
    { key: "small", label: "Ayda < 5 araç", hint: "Yeni başlıyorum veya küçük galeriyim" },
    { key: "medium", label: "Ayda 5 - 20 araç", hint: "Oturmuş orta ölçekli galeriyim" },
    { key: "large", label: "Ayda 20+ araç", hint: "Büyük galeri / filo / zincirim" },
  ];
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
        Aylık kaç araç alıp satıyorsun?
      </h2>
      <p className="text-slate-400 mb-8">
        Sana en uygun paketi önerebilmemiz için bu bilgiye ihtiyacımız var.
      </p>
      <div className="space-y-3">
        {options.map((o, i) => (
          <button
            key={o.key}
            onClick={() => onPick(o.key)}
            className="w-full card card-interactive text-left flex items-center justify-between group animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div>
              <div className="font-semibold text-lg">{o.label}</div>
              <div className="text-sm text-slate-400">{o.hint}</div>
            </div>
            <ArrowRight
              className="w-5 h-5 text-accent transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBuyerPreferences({ onNext }: { onNext: () => void }) {
  const [budget, setBudget] = useState<string>("");
  const [brands, setBrands] = useState<string>("");
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
        Araç tercihlerin?
      </h2>
      <p className="text-slate-400 mb-8">
        Sana uygun fırsatları bulabilmemiz için.
      </p>
      <div className="space-y-4">
        <Field label="Bütçen (TL)">
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Örn. 500.000 - 800.000"
            className="input"
            autoComplete="off"
          />
        </Field>
        <Field label="İlgilendiğin markalar">
          <input
            value={brands}
            onChange={(e) => setBrands(e.target.value)}
            placeholder="Örn. Volkswagen, BMW, Toyota"
            className="input"
            autoComplete="off"
          />
        </Field>
      </div>
      <button onClick={onNext} className="btn-primary mt-8 w-full">
        Devam <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
      </button>
    </div>
  );
}

function StepRecommendation({
  tier,
  userType,
  onNext,
}: {
  tier: "Plus" | "Pro" | "Max";
  userType: UserType;
  onNext: () => void;
}) {
  const data = {
    Plus: {
      price: userType === "dealer" ? "799" : "99",
      items: [
        userType === "dealer" ? "50 analiz / ay" : "25 analiz / ay",
        "Temel VIN sorgu",
        "Fiyat tahmini",
      ],
    },
    Pro: {
      price: userType === "dealer" ? "1.599" : "249",
      items: [
        "Sınırsız analiz",
        "Günde 20 fırsat bildirimi",
        "Marketplace erişimi",
        "Km/boya oynama uyarısı",
        userType === "dealer" ? "WhatsApp bot" : "Aile paylaşımı",
      ],
    },
    Max: {
      price: userType === "dealer" ? "3.499" : "449",
      items: [
        "Tüm Pro özellikleri",
        "AI sahtecilik alarmı",
        "Plaka takip",
        userType === "dealer" ? "Komisyoncu araçları" : "Aile 3 kullanıcı",
        userType === "dealer" ? "API erişimi" : "Öncelikli destek",
        userType === "dealer" ? "Marketplace komisyon %50 indirim" : "",
      ].filter(Boolean),
    },
  }[tier];

  const headline =
    tier === "Pro"
      ? "En uygun paketin 🎯"
      : tier === "Max"
      ? "Sana Max öneriyoruz"
      : "Sana Plus öneriyoruz";

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
        {headline}
      </h2>
      <p className="text-slate-400 mb-8">
        {tier === "Max"
          ? "Ölçeğin için özel tasarlanmış Max paket, her kuruşunu fazlasıyla geri kazandıracak."
          : tier === "Pro"
          ? "En çok tercih edilen paket — işinin büyüklüğüne tam oturuyor."
          : "Başlangıç için harika — büyüdükçe yükseltebilirsin."}
      </p>

      <div className="card border-2 border-accent shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_20px_50px_rgba(99,102,241,0.2)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-2xl font-bold tracking-tight">{tier}</div>
            <div className="text-xs text-slate-400 mt-1">
              {userType === "dealer" ? "Galerici" : "Bireysel"} paket
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black gradient-text tabular-nums">
              {data.price}
            </div>
            <div className="text-xs text-slate-400">TL / ay</div>
          </div>
        </div>
        <ul className="space-y-2 mb-5">
          {data.items.map((it) => (
            <li key={it} className="flex items-start gap-2 text-sm">
              <Check
                className="w-4 h-4 text-accent mt-0.5 shrink-0"
                aria-hidden
                strokeWidth={2.5}
              />
              <span>{it}</span>
            </li>
          ))}
        </ul>
        <div className="text-xs text-slate-400 italic border-t border-border pt-3">
          🎁 İlk 3 gün ücretsiz · kredi kartı gerekmez · istediğin zaman iptal
        </div>
      </div>

      <button onClick={onNext} className="btn-primary mt-8 w-full">
        {tier} ile devam et{" "}
        <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
      </button>
    </div>
  );
}

function StepAccount({
  fullName,
  email,
  phone,
  onChange,
  onNext,
}: {
  fullName: string;
  email: string;
  phone: string;
  onChange: (field: "fullName" | "email" | "phone", v: string) => void;
  onNext: () => void;
}) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const nameValid = fullName.trim().length > 2;
  const valid = nameValid && emailValid && phoneValid;
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
        Son adım — hesap oluştur
      </h2>
      <p className="text-slate-400 mb-8">
        Hiçbir ücret çekilmeyecek, sadece deneme başlatılıyor.
      </p>
      <div className="space-y-4">
        <Field label="Ad Soyad veya Firma Adı">
          <input
            value={fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Örn. Mehmet Yılmaz"
            className="input"
            aria-invalid={fullName.length > 0 && !nameValid}
            autoComplete="name"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="ornek@email.com"
            className="input"
            aria-invalid={email.length > 0 && !emailValid}
            autoComplete="email"
          />
          {email.length > 0 && !emailValid && (
            <p className="text-xs text-danger mt-1.5">Geçerli bir email adresi girin</p>
          )}
        </Field>
        <Field label="Telefon">
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+90 5xx xxx xx xx"
            className="input"
            aria-invalid={phone.length > 0 && !phoneValid}
            autoComplete="tel"
          />
        </Field>
      </div>
      <button
        onClick={onNext}
        disabled={!valid}
        className="btn-primary mt-8 w-full"
      >
        Hesabı Oluştur{" "}
        <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
      </button>
      <p className="text-xs text-slate-400 mt-4 text-center">
        Devam ederek{" "}
        <Link href="/sozlesme" className="underline hover:text-white">
          Üyelik Sözleşmesi
        </Link>{" "}
        ve{" "}
        <Link href="/kvkk" className="underline hover:text-white">
          KVKK Aydınlatma Metni
        </Link>
        &apos;ni kabul etmiş sayılırsın.
      </p>
    </div>
  );
}

function StepFinish({
  tier,
  userType,
  email,
  onStart,
}: {
  tier: "Plus" | "Pro" | "Max";
  userType: UserType;
  email: string;
  onStart: () => void;
}) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-success/15 border-2 border-success/40 flex items-center justify-center mb-6 animate-fade-up">
        <Check className="w-10 h-10 text-success" strokeWidth={3} aria-hidden />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 animate-fade-up [animation-delay:80ms]">
        Hoş geldin! 🎉
      </h2>
      <p className="text-slate-400 mb-8 animate-fade-up [animation-delay:160ms]">
        <span className="text-white font-semibold">{tier}</span> paketi deneme
        süren başladı. İlk analizinle tanış.
      </p>
      <div className="card text-left mb-8 animate-fade-up [animation-delay:240ms]">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-semibold">
          Hesap bilgileri
        </div>
        <div className="text-sm space-y-1.5">
          <div>
            <span className="text-slate-400">Email:</span>{" "}
            <span className="font-medium">{email}</span>
          </div>
          <div>
            <span className="text-slate-400">Tür:</span>{" "}
            <span className="font-medium">
              {userType === "dealer" ? "Galerici" : "Bireysel"}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Paket:</span>{" "}
            <span className="font-medium">{tier} (deneme)</span>
          </div>
        </div>
      </div>
      <button
        onClick={onStart}
        className="btn-primary w-full animate-fade-up [animation-delay:320ms]"
      >
        İlk Aracımı Analiz Et{" "}
        <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs text-slate-400 mb-2 font-semibold">{label}</div>
      {children}
    </label>
  );
}
