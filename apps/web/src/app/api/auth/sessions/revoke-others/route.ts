import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { USER_COOKIE, getCurrentUser, verifySessionCookie } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  const payload = verifySessionCookie(token);
  const currentSessionId = payload?.sid;

  await prisma.userSession.updateMany({
    where: {
      userId: user.id,
      revokedAt: null,
      ...(currentSessionId ? { NOT: { id: currentSessionId } } : {}),
    },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
