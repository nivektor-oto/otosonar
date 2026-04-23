import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { generateApiKey } from "@/lib/dealer-api-key";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  label: z.string().min(1).max(80),
}).strict();

async function getDealerForUser(userId: string) {
  return prisma.dealer.findUnique({ where: { userId } });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await getDealerForUser(user.id);
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  const keys = await prisma.dealerApiKey.findMany({
    where: { dealerId: dealer.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      prefix: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
      requestsCount: true,
    },
  });
  return NextResponse.json({ success: true, keys });
}

export async function POST(req: Request) {
  if (!isFeatureEnabled("CRM_API_ENABLED")) {
    return featureDisabledResponse("CRM_API_ENABLED");
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const dealer = await getDealerForUser(user.id);
  if (!dealer) return NextResponse.json({ success: false, error: "dealer_required" }, { status: 403 });

  const ip = await getClientIp();
  const rl = await checkRateLimit(`api-keys.create:user:${user.id}:${ip}`, 10, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  try {
    const { raw, hash, prefix } = generateApiKey();
    const created = await prisma.dealerApiKey.create({
      data: {
        dealerId: dealer.id,
        label: parsed.data.label,
        keyHash: hash,
        prefix,
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, raw, id: created.id });
  } catch (err) {
    await logError(err, { path: "/api/dealer/api-keys", userId: user.id });
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
