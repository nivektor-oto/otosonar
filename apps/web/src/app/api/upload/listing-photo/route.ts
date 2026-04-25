import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 415 });
  }

  // Auth pre-check (handleUpload yine onBeforeGenerateToken'da bakar ama
  // erken dönerek attacker'a infra hatası leak etmiyoruz).
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {
        // no-op for now
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    // Asla raw error message dönme — env/infra leak'i.
    await logError(e, { path: "/api/upload/listing-photo", userId: user.id });
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
