import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { addEntry, getStats, waitlistEntrySchema } from "@/lib/waitlist";

export const runtime = "nodejs";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { success: false, error: "content-type application/json olmalı" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Geçersiz JSON" },
      { status: 400 },
    );
  }

  if (body && typeof body === "object" && "website" in body && (body as Record<string, unknown>).website) {
    return NextResponse.json({ success: true, queueNumber: 0, created: false }, { status: 200 });
  }

  const parsed = waitlistEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Form geçersiz",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  const ipHash = ip !== "unknown" ? hashIp(ip) : undefined;

  try {
    const result = await addEntry(parsed.data, ipHash);
    // Email enumeration defense: her iki durumda (new insert + duplicate)
    // byte-level aynı response dönüyor. Saldırgan `created` veya status
    // kodundan listede olup olmadığını anlayamaz. Client UX: kullanıcı iki
    // kez submit'lerse kendi queueNumber'ını görür (sıkıntı değil).
    return NextResponse.json(
      {
        success: true,
        queueNumber: result.record.queueNumber,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[waitlist] persist error", err);
    return NextResponse.json(
      { success: false, error: "Kayıt sırasında hata oluştu" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const stats = await getStats();
  return NextResponse.json({ success: true, stats });
}
