import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import {
  getCurrentUser,
  hashIp,
  verifyPassword,
  USER_COOKIE,
} from "@/lib/user-auth";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-log";
import { featureDisabledResponse, isFeatureEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const maxDuration = 30;

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

const deleteSchema = z.object({
  password: z.string().min(1),
  confirmPhrase: z.string(),
  reason: z.string().trim().max(500).optional(),
});

const REQUIRED_PHRASE = "HESABIMI SİL";

export async function POST(req: Request) {
  if (!isFeatureEnabled("KVKK_ACCOUNT_DELETE_ENABLED")) {
    return featureDisabledResponse("KVKK_ACCOUNT_DELETE_ENABLED");
  }

  const ip = await getClientIp();
  const rl = await checkRateLimit(`kvkk-delete:ip:${ip}`, 5, 3600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

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
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation" }, { status: 400 });
  }

  if (parsed.data.confirmPhrase.trim() !== REQUIRED_PHRASE) {
    return NextResponse.json(
      { success: false, error: "confirm_phrase_mismatch" },
      { status: 400 },
    );
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { success: false, error: "no_password_on_account" },
      { status: 400 },
    );
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    await checkRateLimit(`kvkk-delete-fail:user:${user.id}`, 5, 3600);
    return NextResponse.json(
      { success: false, error: "password_invalid" },
      { status: 401 },
    );
  }

  const h = await headers();
  const ua = h.get("user-agent") ?? null;
  const userIdHash = sha256(user.id);
  const emailHash = sha256(user.email.toLowerCase());

  try {
    await prisma.kvkkRequest.create({
      data: {
        type: "DELETE",
        userIdHash,
        emailHash,
        ipHash: hashIp(ip),
        userAgent: ua?.slice(0, 500) ?? null,
        reason: parsed.data.reason ?? null,
      },
    });

    // Cascade on User removes: sessions, dealer, broker, subscriptions,
    // analyses, analysisFeedbacks, priceAlerts, savedListings,
    // buyerPreferences, conversations (both sides), sentMessages,
    // and any other records with onDelete: Cascade declared in schema.
    await prisma.user.delete({ where: { id: user.id } });

    const store = await cookies();
    store.set(USER_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    await logError(err, { path: "/api/account/delete", metadata: { userIdHash } });
    return NextResponse.json({ success: false, error: "delete_failed" }, { status: 500 });
  }
}
