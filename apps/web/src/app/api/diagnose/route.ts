import { NextResponse } from "next/server";
import { z } from "zod";
import { diagnose } from "@/lib/diagnose";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { isFeatureEnabled, featureDisabledResponse } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  brand: z.string().min(2).max(40),
  model: z.string().min(1).max(80),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  km: z.number().int().min(0).max(1_500_000).optional(),
  fuelType: z.string().max(30).optional(),
  engineSize: z.string().max(20).optional(),
  problem: z.string().min(10).max(2000),
  imagesBase64: z
    .array(z.object({ data: z.string().min(1), mime: z.string().min(1) }))
    .max(3)
    .optional(),
}).strict();

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  if (!isFeatureEnabled("AI_DIAGNOSIS_ENABLED")) {
    return featureDisabledResponse("AI_DIAGNOSIS_ENABLED");
  }

  const ip = await getClientIp();
  const rl = await checkRateLimit(`diagnose:ip:${ip}`, 15, 600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let payload: unknown;

  if (contentType.includes("multipart/form-data")) {
    try {
      const fd = await req.formData();
      const getStr = (k: string) => {
        const v = fd.get(k);
        return typeof v === "string" && v.length > 0 ? v : undefined;
      };
      const yearStr = getStr("year");
      const kmStr = getStr("km");
      const images: Array<{ data: string; mime: string }> = [];
      for (const key of ["photo1", "photo2", "photo3"]) {
        const f = fd.get(key);
        if (!f || typeof f === "string") continue;
        const file = f as File;
        if (file.size === 0) continue;
        if (file.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { success: false, error: "image_too_large", field: key },
            { status: 400 },
          );
        }
        if (!ALLOWED_MIMES.has(file.type)) {
          return NextResponse.json(
            { success: false, error: "invalid_image_mime", field: key, mime: file.type },
            { status: 400 },
          );
        }
        const buf = Buffer.from(await file.arrayBuffer());
        images.push({ data: buf.toString("base64"), mime: file.type });
      }
      payload = {
        brand: getStr("brand"),
        model: getStr("model"),
        year: yearStr ? Number(yearStr) : undefined,
        km: kmStr ? Number(kmStr) : undefined,
        fuelType: getStr("fuelType"),
        engineSize: getStr("engineSize"),
        problem: getStr("problem"),
        imagesBase64: images.length > 0 ? images : undefined,
      };
    } catch {
      return NextResponse.json({ success: false, error: "invalid_form" }, { status: 400 });
    }
  } else {
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
    }
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { result, provider: _provider, durationMs } = await diagnose(parsed.data);
    void _provider;
    return NextResponse.json({ success: true, result, meta: { provider: "otosonar", model: "otosonar-ai-v1", durationMs } });
  } catch (err) {
    await logError(err, { path: "/api/diagnose" });
    return NextResponse.json({ success: false, error: "diagnose_failed" }, { status: 500 });
  }
}
