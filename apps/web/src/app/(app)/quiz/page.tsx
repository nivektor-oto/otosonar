"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Answer = "a" | "b" | "c" | "d";
type Persona = "novice" | "casual" | "pro" | "dealer";
type Tier = "PLUS" | "PRO" | "MAX" | "BAYI_PRO";

interface Question {
  q: string;
  options: Record<Answer, string>;
  scoreMap: Record<Answer, { type: Persona; points: number }>;
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
    scoreMap: {
      a: { type: "novice", points: 2 },
      b: { type: "casual", points: 2 },
      c: { type: "casual", points: 1 },
      d: { type: "pro", points: 2 },
    },
  },
  {
    q: "Son 3 yıl içinde kaç 2. el araç aldın?",
    options: { a: "Hiç", b: "1", c: "2-5", d: "5+" },
    scoreMap: {
      a: { type: "novice", points: 3 },
      b: { type: "casual", points: 2 },
      c: { type: "pro", points: 2 },
      d: { type: "dealer", points: 3 },
    },
  },
  {
    q: "Sahibinden ilanına baktığında ilk hangisine odaklanırsın?",
    options: {
      a: "Fotoğraflar",
      b: "Km/yıl",
      c: "Satıcının değişen parçalar beyanı",
      d: "Emsal fiyat karşılaştırması",
    },
    scoreMap: {
      a: { type: "novice", points: 1 },
      b: { type: "casual", points: 1 },
      c: { type: "pro", points: 2 },
      d: { type: "dealer", points: 2 },
    },
  },
  {
    q: "Ayda kaç araç analiz ediyorsun?",
    options: { a: "Aklıma geldiğinde 1 tane", b: "5-10", c: "20-50", d: "100+" },
    scoreMap: {
      a: { type: "novice", points: 2 },
      b: { type: "casual", points: 2 },
      c: { type: "pro", points: 2 },
      d: { type: "dealer", points: 3 },
    },
  },
  {
    q: "Bütçen?",
    options: {
      a: "400K TL altı",
      b: "400-800K TL",
      c: "800K-1.5M TL",
      d: "Galerici ekibim var, stok yönetiyorum",
    },
    scoreMap: {
      a: { type: "novice", points: 1 },
      b: { type: "casual", points: 1 },
      c: { type: "pro", points: 1 },
      d: { type: "dealer", points: 3 },
    },
  },
];

const TIER_MAP: Record<Persona, Tier> = {
  novice: "PLUS",
  casual: "PRO",
  pro: "MAX",
  dealer: "BAYI_PRO",
};

const DESC: Record<Persona, { title: string; pkg: string; why: string }> = {
  novice: { title: "Meraklı Alıcı", pkg: "Plus", why: "Ayda 25 analiz yeter, AI sana yol göstersin." },
  casual: { title: "Bilinçli Alıcı", pkg: "Pro", why: "Sınırsız analiz + rapor indirme." },
  pro: { title: "Tecrübeli Avcı", pkg: "Max", why: "Plaka OCR + hasar AI + öncelikli destek." },
  dealer: { title: "Galerici Profili", pkg: "Bayi Pro", why: "Trade-in + fleet + API erişim." },
};

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [persisted, setPersisted] = useState(false);

  const finished = step >= QUESTIONS.length;

  useEffect(() => {
    if (!finished || persisted) return;
    const totals: Record<Persona, number> = { novice: 0, casual: 0, pro: 0, dealer: 0 };
    answers.forEach((a, i) => {
      const { type, points } = QUESTIONS[i].scoreMap[a];
      totals[type] += points;
    });
    const persona = (Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0]) as Persona;
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        persona,
        recommendedTier: TIER_MAP[persona],
        answers,
      }),
    })
      .catch(() => undefined)
      .finally(() => setPersisted(true));
  }, [finished, persisted, answers]);

  if (finished) {
    const totals: Record<Persona, number> = { novice: 0, casual: 0, pro: 0, dealer: 0 };
    answers.forEach((a, i) => {
      const { type, points } = QUESTIONS[i].scoreMap[a];
      totals[type] += points;
    });
    const persona = (Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0]) as Persona;
    const rec = DESC[persona];

    return (
      <main className="px-4 py-16 text-neutral-100">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <h1 className="text-3xl font-bold">Sen: {rec.title}</h1>
          <p className="text-sm text-neutral-400">{rec.why}</p>
          <div className="rounded-2xl border border-emerald-700/40 bg-emerald-900/10 p-6">
            <div className="text-xs text-emerald-300">Önerilen paket</div>
            <div className="mt-2 text-2xl font-bold">{rec.pkg}</div>
          </div>
          <Link
            href="/kayit"
            className="inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            {rec.pkg}&apos;a başla
          </Link>
          <button
            onClick={() => {
              setAnswers([]);
              setStep(0);
              setPersisted(false);
            }}
            className="mx-auto block text-xs text-neutral-500 hover:underline"
          >
            Tekrar yap
          </button>
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
