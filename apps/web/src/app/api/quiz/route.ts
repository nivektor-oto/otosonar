import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  persona: z.enum(["novice", "casual", "pro", "dealer"]),
  recommendedTier: z.enum(["PLUS", "PRO", "MAX", "BAYI_PRO"]),
  answers: z.array(z.string()).max(20),
}).strict();

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "validation" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      quizResult: {
        persona: parsed.data.persona,
        recommendedTier: parsed.data.recommendedTier,
        answers: parsed.data.answers,
        completedAt: new Date().toISOString(),
      } as never,
    },
  });

  return NextResponse.json({ success: true });
}
