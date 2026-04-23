import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

// /api/analyze route'taki ile AYNI hash algoritması — buradaki değişirse orası da değişmeli.
function computeInputHashFromSnapshot(snap: Record<string, unknown>): string | null {
  const brand = typeof snap.brand === "string" ? snap.brand : null;
  const model = typeof snap.model === "string" ? snap.model : null;
  const year = typeof snap.year === "number" ? snap.year : null;
  const km = typeof snap.km === "number" ? snap.km : null;
  const city = typeof snap.city === "string" ? snap.city : "";
  const fuelType = typeof snap.fuelType === "string" ? snap.fuelType : "";
  const transmission = typeof snap.transmission === "string" ? snap.transmission : "";
  if (!brand || !model || !year || km == null) return null;
  const kmBucket = Math.round(km / 5000) * 5000;
  const parts = [
    brand.trim().toLowerCase(),
    model.trim().toLowerCase(),
    year,
    kmBucket,
    city.trim().toLowerCase(),
    fuelType.trim().toLowerCase(),
    transmission.trim().toLowerCase(),
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

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

    // Negative accuracy → cache invalidate (aynı araç bir daha AI'ya gitsin)
    if (patch.accuracy === "WRONG" || patch.accuracy === "PARTIAL") {
      try {
        const snap = (existing.inputSnapshot ?? {}) as Record<string, unknown>;
        const hash = computeInputHashFromSnapshot(snap);
        if (hash) {
          await prisma.analysisCache.updateMany({
            where: { inputHash: hash, invalidated: false },
            data: { invalidated: true },
          });
        }
      } catch (invErr) {
        console.warn(
          "[feedback] cache invalidation failed:",
          invErr instanceof Error ? invErr.message : invErr
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    await logError(err, { path: "/api/analyze/feedback" });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
