"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Answer = "a" | "b" | "c" | "d";
type Persona = "novice" | "casual" | "pro" | "dealer";
type Tier = "FREE" | "PLUS" | "PRO" | "MAX" | "BAYI_PRO";

interface Question {
  q: string;
  options: Record<Answer, string>;
}

const QUESTIONS: Question[] = [
  {
    q: "2. el araç alırken seni en çok hangi duygu korkutur?",
    options: {
      a: "Gizli kaza/tramer kaydı",
      b: "Piyasanın çok üstünde fiyat ödemek",
      c: "Km saatinin oynanmış olması",
      d: "Korkmam, anlarım",
    },
  },
  {
    q: "Son 3 yıl içinde kaç 2. el araç aldın?",
    options: { a: "Hiç", b: "1", c: "2-5", d: "5+" },
  },
  {
    q: "Sahibinden ilanına baktığında ilk hangisine odaklanırsın?",
    options: {
      a: "Fotoğraflar",
      b: "Km/yıl",
      c: "Satıcının değişen parçalar beyanı",
      d: "Emsal fiyat karşılaştırması",
    },
  },
  {
    q: "Ayda kaç araç analiz ediyorsun?",
    options: { a: "Aklıma geldiğinde 1 tane", b: "5-10", c: "20-50", d: "100+" },
  },
  {
    q: "Bütçen?",
    options: {
      a: "400K TL altı",
      b: "400-800K TL",
      c: "800K-1.5M TL",
      d: "Galerici ekibim var, stok yönetiyorum",
    },
  },
];

const TITLE: Record<Persona, string> = {
  novice: "Meraklı Alıcı",
  casual: "Bilinçli Alıcı",
  pro: "Tecrübeli Avcı",
  dealer: "Galerici Profili",
};

const TIER_LABEL: Record<Tier, string> = {
  FREE: "Ücretsiz",
  PLUS: "Plus",
  PRO: "Pro",
  MAX: "Max",
  BAYI_PRO: "Bayi Pro",
};

interface Verdict {
  persona: Persona;
  recommendedTier: Tier;
  reason: string;
  pitch: string;
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const finished = step >= QUESTIONS.length;

  useEffect(() => {
    if (!finished || verdict || submitting) return;
    let aborted = false;
    setSubmitting(true);
    setSubmitError(null);
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    })
      .then(async (r) => {
        const data: unknown = await r.json().catch(() => null);
        if (aborted) return;
        if (
          r.ok &&
          data &&
          typeof data === "object" &&
          "success" in data &&
          (data as { success?: boolean }).success
        ) {
          const d = data as Verdict & { success: true };
          setVerdict({
            persona: d.persona,
            recommendedTier: d.recommendedTier,
            reason: d.reason,
            pitch: d.pitch,
          });
        } else {
          setSubmitError("Sonuç alınamadı, tekrar dene.");
        }
      })
      .catch(() => {
        if (!aborted) setSubmitError("Bağlantı hatası, tekrar dene.");
      })
      .finally(() => {
        if (!aborted) setSubmitting(false);
      });
    return () => {
      aborted = true;
    };
  }, [finished, verdict, submitting, answers]);

  if (finished) {
    return (
      <main className="px-4 py-16 text-neutral-100">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          {submitting && !verdict && (
            <p className="text-sm text-neutral-400">Sonuç hesaplanıyor...</p>
          )}
          {submitError && !verdict && (
            <div className="space-y-3">
              <p className="text-sm text-red-400">{submitError}</p>
              <button
                onClick={() => {
                  setAnswers([]);
                  setStep(0);
                  setVerdict(null);
                  setSubmitError(null);
                }}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
              >
                Baştan başla
              </button>
            </div>
          )}
          {verdict && (
            <>
              <h1 className="text-3xl font-bold">Sen: {TITLE[verdict.persona]}</h1>
              <p className="text-sm text-neutral-400">{verdict.reason}</p>
              <div className="rounded-2xl border border-emerald-700/40 bg-emerald-900/10 p-6">
                <div className="text-xs text-emerald-300">Önerilen paket</div>
                <div className="mt-2 text-2xl font-bold">
                  {TIER_LABEL[verdict.recommendedTier]}
                </div>
                <div className="mt-3 text-left text-sm text-neutral-300">
                  {verdict.pitch}
                </div>
              </div>
              <Link
                href="/kayit"
                className="inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                {TIER_LABEL[verdict.recommendedTier]}&apos;a başla
              </Link>
              <button
                onClick={() => {
                  setAnswers([]);
                  setStep(0);
                  setVerdict(null);
                  setSubmitError(null);
                }}
                className="mx-auto block text-xs text-neutral-500 hover:underline"
              >
                Tekrar yap
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  const q = QUESTIONS[step];
  return (
    <main className="px-4 py-16 text-neutral-100">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-xs text-neutral-500">
          {step + 1} / {QUESTIONS.length}
        </div>
        <h1 className="text-2xl font-bold">{q.q}</h1>
        <div className="space-y-2">
          {(Object.keys(q.options) as Answer[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setAnswers([...answers, key]);
                setStep(step + 1);
              }}
              className="block w-full rounded-xl border border-neutral-800 bg-[#12121a] p-4 text-left text-sm transition hover:border-emerald-500 hover:bg-[#151522]"
            >
              <b className="mr-2 text-emerald-400">{key.toUpperCase()}.</b>
              {q.options[key]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
