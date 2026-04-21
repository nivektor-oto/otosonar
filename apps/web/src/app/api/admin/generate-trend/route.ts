import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReport, currentPeriod } from "@/lib/trend-report";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
}).strict();

// Admin-only — authorized via ADMIN_SECRET header. Cron can call with same secret.
export async function POST(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try { body = await req.json().catch(() => ({})); } catch {}
  const parsed = schema.safeParse(body);
  const period = parsed.success && parsed.data.period ? parsed.data.period : currentPeriod();

  try {
    await generateReport(period);
    return NextResponse.json({ success: true, period });
  } catch (err) {
    await logError(err, { path: "/api/admin/generate-trend", metadata: { period } });
    return NextResponse.json({ success: false, error: "generate_failed" }, { status: 500 });
  }
}
