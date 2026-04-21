import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, revokeSession, verifySessionCookie } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  const payload = verifySessionCookie(token);
  if (payload) await revokeSession(payload.sid);

  const res = NextResponse.json({ success: true });
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
