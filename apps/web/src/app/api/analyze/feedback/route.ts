import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OUTCOMES = ["BOUGHT", "SKIPPED", "UNDECIDED"] as const;
const ACCURACIES = ["CORRECT", "WRONG", "PARTIAL"] as const;

const patchSchema = z
  .object({
    feedbackId: z.string().cuid(),
    outcome: z.enum(OUTCOMES).optional(),
    accuracy: z.enum(ACCURACIES).optional(),
    actualPrice: z.number().int().min(0).max(50_000_000).optional(),
    expertiseOk: z.boolean().optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { feedbackId, ...patch } = parsed.data;

  try {
    const existing = await prisma.analysisFeedback.findUnique({ where: { id: feedbackId } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
    }

    const hasAnswer = patch.outcome || patch.accuracy;
    await prisma.analysisFeedback.update({
      where: { id: feedbackId },
      data: {
        ...patch,
        answeredAt: hasAnswer ? new Date() : existing.answeredAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    await logError(err, { path: "/api/analyze/feedback" });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
