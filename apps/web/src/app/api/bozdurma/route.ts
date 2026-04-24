import { NextResponse } from "next/server";
import { z } from "zod";
import { buybackAnalysis } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 120;

const inputSchema = z
  .object({
    brand: z.string().min(1).max(60),
    model: z.string().min(1).max(80),
    variant: z.string().max(80).optional(),
    year: z.number().int().min(1970).max(new Date().getFullYear() + 1),
    km: z.number().int().min(0).max(2_000_000),
    fuelType: z.enum(["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik"]).optional(),
    transmission: z.enum(["Manuel", "Otomatik", "Yarı Otomatik"]).optional(),
    city: z.string().max(40).optional(),
    condition: z.enum(["MUKEMMEL", "IYI", "ORTA", "KOTU"]),
    hasDamage: z.boolean().optional(),
    hasPaintChange: z.boolean().optional(),
    hasMajorService: z.boolean().optional(),
    description: z.string().max(3000).optional(),
    customerAskingPrice: z.number().int().min(0).max(50_000_000).optional(),
    targetMarginPct: z.number().min(0.05).max(0.30),
    quickSale: z.boolean().optional(),
  })
  .strict();

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
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

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Giriş bilgileri geçersiz",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    // emsalCount ve emsalListings lib içinde computeMarketAggregates ile hesaplanıyor.
    const { result, meta } = await buybackAnalysis(parsed.data);
    const emsalListings = meta.emsalListings ?? [];
    return NextResponse.json(
      {
        success: true,
        buyback: result,
        emsalListings,
        meta: {
          ...meta,
          provider: "otosonar",
          model: "otosonar-ai-v1",
          emsalCount: meta.emsalCount ?? 0,
          emsalListings,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[bozdurma] failed:", msg);
    const safeDetail = msg
      .replace(/Gemini|Anthropic|Claude|OpenAI|GPT/gi, "AI")
      .slice(0, 200);
    return NextResponse.json(
      { success: false, error: "Analiz başarısız oldu", detail: safeDetail },
      { status: 502 },
    );
  }
}
