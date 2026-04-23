// Server-authoritative quiz scoring. Clients send only their raw answer
// letters; persona + recommended tier are computed here so they cannot be
// forged.
//
// The on-screen quiz (see app/(app)/quiz/page.tsx) has 5 questions, each
// with options a/b/c/d mapped to (persona, points). We reproduce that map
// here, server-side. If the quiz ever grows extra free-form inputs
// (budget number, multi-select pain points, etc.) extend QuizAnswers and
// scoreQuiz — do not move scoring back to the client.

export type QuizAnswerLetter = "a" | "b" | "c" | "d";

export type QuizPersona = "novice" | "casual" | "pro" | "dealer";

// Tiers the rest of the app uses. The Prisma `Tier` enum only has
// PLUS/PRO/MAX; FREE is represented as "FREE" in quizResult JSON because
// there is no free subscription row, and BAYI_PRO is legacy-compatible
// wording used by existing UI copy.
export type QuizRecommendedTier = "FREE" | "PLUS" | "PRO" | "MAX" | "BAYI_PRO";

export type QuizAnswers = {
  // Raw per-question answers, length must equal QUIZ_QUESTION_COUNT.
  answers: QuizAnswerLetter[];
  // Optional hints that override scoring (future-proofing, not yet
  // collected by the UI). Left optional so the existing client keeps
  // working untouched.
  userType?: "buyer" | "dealer";
  volume?: "small" | "medium" | "large";
  painPoints?: string[];
  budget?: number;
};

export type QuizVerdict = {
  persona: QuizPersona;
  recommendedTier: QuizRecommendedTier;
  reason: string;
  pitch: string;
  // Echo-back of the sanitized answers so /api/quiz can persist them.
  answers: QuizAnswerLetter[];
};

export const QUIZ_QUESTION_COUNT = 5;

// Mirror of QUESTIONS[i].scoreMap in the client page. Keep in sync.
const SCORE_MAP: Array<Record<QuizAnswerLetter, { type: QuizPersona; points: number }>> = [
  {
    a: { type: "novice", points: 2 },
    b: { type: "casual", points: 2 },
    c: { type: "casual", points: 1 },
    d: { type: "pro", points: 2 },
  },
  {
    a: { type: "novice", points: 3 },
    b: { type: "casual", points: 2 },
    c: { type: "pro", points: 2 },
    d: { type: "dealer", points: 3 },
  },
  {
    a: { type: "novice", points: 1 },
    b: { type: "casual", points: 1 },
    c: { type: "pro", points: 2 },
    d: { type: "dealer", points: 2 },
  },
  {
    a: { type: "novice", points: 2 },
    b: { type: "casual", points: 2 },
    c: { type: "pro", points: 2 },
    d: { type: "dealer", points: 3 },
  },
  {
    a: { type: "novice", points: 1 },
    b: { type: "casual", points: 1 },
    c: { type: "pro", points: 1 },
    d: { type: "dealer", points: 3 },
  },
];

const TIER_BY_PERSONA: Record<QuizPersona, QuizRecommendedTier> = {
  novice: "PLUS",
  casual: "PRO",
  pro: "MAX",
  dealer: "BAYI_PRO",
};

const COPY: Record<QuizPersona, { reason: string; pitch: string }> = {
  novice: {
    reason:
      "Cevaplarına göre ikinci el dünyasına yeni giriyorsun ve güvenli bir başlangıç arıyorsun. Plus paketi sana yol gösterir.",
    pitch:
      "Ayda 25 AI analizi, gizli kaza ve emsal fiyat uyarıları, ilan linkini yapıştır 8 saniyede karar ver.",
  },
  casual: {
    reason:
      "Belli bir tecrüben var ve ciddi bir alım yapmak üzeresin; detaylı raporlara ihtiyacın var. Pro paketi ölçüne uygun.",
    pitch:
      "Sınırsız analiz, PDF rapor indirme, pazarlık skoru ve emsal trend — araç seçerken tek başına kalma.",
  },
  pro: {
    reason:
      "Aracı iyi tanıyorsun, AI sana iş yükünü kaldıran bir asistan olmalı. Max paket tam olarak bunu yapar.",
    pitch:
      "Plaka OCR, hasar AI, sınırsız rapor, öncelikli destek — şüpheli ilanı saniyede eleyip zamanını kazan.",
  },
  dealer: {
    reason:
      "Galerici profiline uyuyorsun — stok, bozdurma masası ve CRM API'si olmadan verim alamazsın. Bayi Pro sana göre.",
    pitch:
      "Trade-in masası, fleet yönetimi, CRM API, açık arttırma entegrasyonu — kâr işletim sistemine tam erişim.",
  },
};

function toLetter(v: unknown): QuizAnswerLetter | null {
  if (v === "a" || v === "b" || v === "c" || v === "d") return v;
  return null;
}

export function sanitizeAnswers(input: unknown): QuizAnswerLetter[] | null {
  if (!Array.isArray(input)) return null;
  if (input.length !== QUIZ_QUESTION_COUNT) return null;
  const out: QuizAnswerLetter[] = [];
  for (const v of input) {
    const l = toLetter(v);
    if (!l) return null;
    out.push(l);
  }
  return out;
}

export function scoreQuiz(a: QuizAnswers): QuizVerdict {
  const answers = a.answers;
  const totals: Record<QuizPersona, number> = {
    novice: 0,
    casual: 0,
    pro: 0,
    dealer: 0,
  };
  for (let i = 0; i < answers.length && i < SCORE_MAP.length; i++) {
    const entry = SCORE_MAP[i][answers[i]];
    if (entry) totals[entry.type] += entry.points;
  }

  // Hard overrides from optional structured hints. A self-declared
  // dealer with large volume should always land on the top tier even if
  // the multiple-choice answers are noisy.
  let persona: QuizPersona;
  if (a.userType === "dealer") {
    persona = "dealer";
  } else {
    const ranked = (Object.entries(totals) as Array<[QuizPersona, number]>).sort(
      (x, y) => y[1] - x[1],
    );
    persona = ranked[0][0];
  }

  let recommendedTier = TIER_BY_PERSONA[persona];

  // Refinement rules described in spec:
  //  - dealer + large → MAX (highest consumer tier); dealer personas map
  //    to BAYI_PRO by default which already implies the top bundle for
  //    galericiler in UI copy. We also expose MAX when the user says
  //    they self-serve small and just want analiz.
  //  - buyer + high budget + pro flags → PLUS at minimum, PRO if pro
  //    signals dominate.
  if (a.userType === "dealer") {
    if (a.volume === "large") recommendedTier = "MAX";
    else if (a.volume === "medium") recommendedTier = "PRO";
    else if (a.volume === "small") recommendedTier = "PRO";
  } else if (a.userType === "buyer") {
    const highBudget = typeof a.budget === "number" && a.budget > 1_500_000;
    const proFlags = (a.painPoints ?? []).some((p) =>
      ["ocr", "hasar-ai", "trend-raporu", "pazarlik"].includes(p),
    );
    if (highBudget && proFlags) recommendedTier = "PLUS";
    else if (persona === "novice") recommendedTier = "FREE";
  }

  const copy = COPY[persona];
  return {
    persona,
    recommendedTier,
    reason: copy.reason,
    pitch: copy.pitch,
    answers,
  };
}
