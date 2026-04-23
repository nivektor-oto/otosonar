import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { scoreQuiz, sanitizeAnswers } from "@/lib/quiz-logic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The client sends only the raw answer letters. Any `persona` or
// `recommendedTier` keys on the payload are ignored — scoring happens
// here, server-side, so the recommendation can't be forged. Optional
// structured hints (userType / volume / budget / painPoints) are
// accepted for future UI iterations; unknown keys are rejected.
const schema = z
  .object({
    answers: z.array(z.string()).min(1).max(20),
    userType: z.enum(["buyer", "dealer"]).optional(),
    volume: z.enum(["small", "medium", "large"]).optional(),
    budget: z.number().int().nonnegative().max(100_000_000).optional(),
    painPoints: z.array(z.string().max(40)).max(20).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  const answers = sanitizeAnswers(parsed.data.answers);
  if (!answers) {
    return NextResponse.json({ success: false, error: "answers_shape" }, { status: 400 });
  }

  const verdict = scoreQuiz({
    answers,
    userType: parsed.data.userType,
    volume: parsed.data.volume,
    budget: parsed.data.budget,
    painPoints: parsed.data.painPoints,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      quizResult: {
        persona: verdict.persona,
        recommendedTier: verdict.recommendedTier,
        reason: verdict.reason,
        pitch: verdict.pitch,
        answers: verdict.answers,
        completedAt: new Date().toISOString(),
      } as never,
    },
  });

  return NextResponse.json({
    success: true,
    persona: verdict.persona,
    recommendedTier: verdict.recommendedTier,
    reason: verdict.reason,
    pitch: verdict.pitch,
  });
}
