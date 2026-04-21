import { NextResponse } from "next/server";
import { getFounderSession } from "@/lib/founder-auth";
import { listAll } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const rows = await listAll(10000);

  const headers = [
    "queueNumber",
    "createdAt",
    "email",
    "fullName",
    "userType",
    "city",
    "referralSource",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.queueNumber),
        csvEscape(r.createdAt.toISOString()),
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
