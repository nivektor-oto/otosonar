import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { marketResearch } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const inputSchema = z
  .object({
    brand: z.string().min(1).max(60),
    model: z.string().max(60).optional(),
    yearMin: z.number().int().min(1980).max(2027).optional(),
    yearMax: z.number().int().min(1980).max(2027).optional(),
    budgetMin: z.number().int().min(0).max(50_000_000).optional(),
    budgetMax: z.number().int().min(0).max(50_000_000).optional(),
    fuelType: z.string().max(30).optional(),
    city: z.string().max(60).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type application/json olmalı" },
      { status: 415 }
    );
  }

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI servisi yapılandırılmamış" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Giriş bilgileri geçersiz. En azından marka girilmeli." },
      { status: 400 }
    );
  }

  try {
    // emsalCount lib içinde computeMarketAggregates tarafından hesaplanıyor.
    const { result, meta } = await marketResearch(parsed.data);
    return NextResponse.json({
      success: true,
      result,
      meta: {
        ...meta,
        provider: "otosonar",
        model: "otosonar-ai-v1",
        timestamp: new Date().toISOString(),
        emsalCount: meta.emsalCount ?? 0,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
    console.error("[market] error:", msg);
    const userMessage = /HTTP 5\d\d|UNAVAILABLE|overloaded|timeout|429/i.test(msg)
      ? "AI geçici olarak meşgul. Birkaç saniye sonra tekrar deneyin."
      : "Araştırma başarısız oldu.";
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
