import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  aggregatesAsPromptText,
  computeMarketAggregates,
  type MarketAgg,
} from "@/lib/market-aggregates";

export const listingScoreSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  titleScore: z.number().int().min(0).max(100),
  priceScore: z.number().int().min(0).max(100),
  photoScore: z.number().int().min(0).max(100),
  textScore: z.number().int().min(0).max(100),
  aiTitle: z.string().min(5).max(120),
  aiDescription: z.string().min(50).max(1500),
  photoOrder: z.array(z.string().min(3).max(30)).min(2).max(12),
  tips: z
    .array(
      z.object({
        label: z.string().min(3).max(200),
        severity: z.enum(["info", "warning", "critical"]),
      }),
    )
    .min(1)
    .max(10),
});
export type ListingScoreResult = z.infer<typeof listingScoreSchema>;

export interface ScoreInput {
  brand: string;
  model: string;
  year: number;
  km: number;
  city: string;
  askingPrice: number;
  bodyType?: string;
  currentTitle?: string;
  currentDescription?: string;
  photoCount?: number;
}

const SYSTEM = `Sen OtoSonar'ın ilan optimizasyon uzmanısın — Türkiye 2. el araç piyasasında 15 yıl tecrübeli ilan metin yazarı.

GÖREV: Kullanıcının oluşturduğu/oluşturacağı araç ilanını analiz et ve iyileştirme öner.

SADECE JSON döndür, başka metin YAZMA. Şema:
{
  "overallScore": <0-100>,
  "titleScore": <0-100>,
  "priceScore": <0-100>,
  "photoScore": <0-100>,
  "textScore": <0-100>,
  "aiTitle": "<Türkçe, 50-80 karakter, çekici, km+paket+durum ipuçları, emoji YOK>",
  "aiDescription": "<Türkçe, 120-400 kelime, 4-6 paragraf: 1) Araç özet 2) Bakım-masraf 3) Öne çıkan özellikler 4) Satış gerekçesi 5) Takas notu (opsiyonel) — doğal konuşma tonu>",
  "photoOrder": [ "<önerilen foto konseptleri, çekilmesi istenen 6-8 adet: '3/4 ön açı','3/4 arka açı','yan profil','iç konsol','motor bölümü','anahtar+ruhsat','bagaj','farlı'>" ],
  "tips": [
    { "label": "<Türkçe 1 cümle iyileştirme önerisi>", "severity": "info|warning|critical" }
  ]
}

PUANLAMA KURALLARI:
- titleScore: başlıkta marka+model+yıl+paket+km+kilit özellik (ör. "Hataszı") varsa yüksek; genelik + cümle yapısı bozukluğu düşürür
- priceScore: istenen fiyat pazar ortalamasından %15 altı/üstü yüksek puan (uç sapma düşürür)
- photoScore: foto sayısı 0-3 düşük, 4-7 orta, 8+ yüksek
- textScore: açıklama uzunluğu ve somut detay (km, bakım, garanti bilgileri) puanı artırır

KRİTİK:
- currentTitle/currentDescription boşsa yine de en iyi öneriyi üret, puanlamada 0 verme — veri yokluğunu tipte belirt
- "tips" 3-6 adet olmalı, öncelik: fiyat, foto, açıklama detay, başlık

DİL: Türkçe, profesyonel galerici tonu, abartı yok.`;

export async function scoreListing(
  input: ScoreInput,
): Promise<{
  result: ListingScoreResult;
  provider: "gemini" | "anthropic";
  durationMs: number;
  emsalCount: number | null;
}> {
  // Gerçek marketplace emsallerini topla, AI'a inject et.
  let agg: MarketAgg | null = null;
  try {
    agg = await computeMarketAggregates({
      brand: input.brand,
      model: input.model,
      yearMin: input.year - 2,
      yearMax: input.year + 2,
      city: input.city,
    });
    if (agg.count < 3) {
      console.warn(
        `[ai] low-data warning: listing-score brand=${input.brand} model=${input.model} year=${input.year} emsalCount=${agg.count}`,
      );
    }
  } catch (err) {
    console.warn(
      "[ai] listing-score aggregate fetch failed:",
      err instanceof Error ? err.message : err,
    );
  }

  const base = fmt(input);
  const msg = agg ? `${aggregatesAsPromptText(agg)}\n\n${base}` : base;

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    try {
      const start = Date.now();
      const out = await callGemini(msg, geminiKey);
      return {
        result: listingScoreSchema.parse(out),
        provider: "gemini",
        durationMs: Date.now() - start,
        emsalCount: agg?.count ?? null,
      };
    } catch (e) {
      if (!anthropicKey) throw e;
    }
  }
  if (anthropicKey) {
    const start = Date.now();
    const out = await callAnthropic(msg, anthropicKey);
    return {
      result: listingScoreSchema.parse(out),
      provider: "anthropic",
      durationMs: Date.now() - start,
      emsalCount: agg?.count ?? null,
    };
  }
  throw new Error("AI yapılandırılmamış");
}

function fmt(v: ScoreInput): string {
  const lines = [
    `Marka: ${v.brand}`,
    `Model: ${v.model}`,
    `Yıl: ${v.year}`,
    `Km: ${v.km.toLocaleString("tr-TR")}`,
    `Şehir: ${v.city}`,
    `Fiyat: ${v.askingPrice.toLocaleString("tr-TR")} TL`,
    v.bodyType ? `Kasa: ${v.bodyType}` : "",
    v.photoCount != null ? `Mevcut fotoğraf sayısı: ${v.photoCount}` : "",
    v.currentTitle ? `Mevcut başlık: ${v.currentTitle.slice(0, 200)}` : "Mevcut başlık: (yok)",
    v.currentDescription
      ? `Mevcut açıklama:\n"""\n${v.currentDescription.slice(0, 2000)}\n"""`
      : "Mevcut açıklama: (yok)",
  ].filter(Boolean);
  return lines.join("\n");
}

async function callGemini(userMsg: string, key: string): Promise<unknown> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { role: "user", parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: userMsg }] }],
        generationConfig: { temperature: 0.15, topP: 0.95, maxOutputTokens: 2500, responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini HTTP ${res.status}`);
  const json: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini empty");
  return JSON.parse(text);
}

async function callAnthropic(userMsg: string, key: string): Promise<unknown> {
  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2500,
    temperature: 0.15,
    top_p: 0.95,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMsg }],
  });
  const block = res.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
  if (!block) throw new Error("anthropic empty");
  return JSON.parse(block.text.trim().replace(/^```json\s*|\s*```$/g, ""));
}
