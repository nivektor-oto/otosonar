import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getFounderSession } from "@/lib/founder-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Rec {
  email: string;
  fullName?: string;
  userType: string;
  city?: string;
  referralSource?: string;
  queueNumber: number;
  createdAt: string;
}

function csvEscape(v: unknown): string {
  const s = v === undefined || v === null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const session = await getFounderSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const file = path.join(process.cwd(), "data", "waitlist.jsonl");
  let rows: Rec[] = [];
  try {
    const raw = await fs.readFile(file, "utf8");
    rows = raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as Rec);
  } catch {
    rows = [];
  }

  const headers = ["queueNumber", "createdAt", "email", "fullName", "userType", "city", "referralSource"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.queueNumber),
        csvEscape(r.createdAt),
        csvEscape(r.email),
        csvEscape(r.fullName),
        csvEscape(r.userType),
        csvEscape(r.city),
        csvEscape(r.referralSource),
      ].join(","),
    );
  }

  const body = lines.join("\n") + "\n";
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
