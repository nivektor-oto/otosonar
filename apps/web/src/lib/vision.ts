/**
 * Vision wrapper (primary + fallback) — hasar tespiti + plaka OCR.
 * `/api/damage-detect` ve `/api/plate-ocr` tarafından kullanılır.
 */
import { z } from "zod";

const DAMAGE_SEVERITY = ["YOK", "HAFIF", "ORTA", "AGIR"] as const;
const DAMAGE_TYPES = [
  "BOYA",
  "EZIK",
  "CIZIK",
  "KIRIK_CAM",
  "FAR_LAMBA",
  "TAMPON",
  "KAPI",
  "KAPUT_BAGAJ",
  "IC_DOSEME",
  "CERCEVE",
  "DIGER",
] as const;

export const damageSchema = z.object({
  overallSeverity: z.enum(DAMAGE_SEVERITY),
  repairEstimateMinTL: z.number().int().min(0).max(500_000),
  repairEstimateMaxTL: z.number().int().min(0).max(500_000),
  damages: z.array(
    z.object({
      type: z.enum(DAMAGE_TYPES),
      location: z.string().min(1).max(80),
      severity: z.enum(DAMAGE_SEVERITY),
      description: z.string().min(1).max(300),
    })
  ).max(20),
  notes: z.string().max(1000),
});

export type DamageResult = z.infer<typeof damageSchema>;

export const plateSchema = z.object({
  plate: z.string().max(20).nullable(),
  confidence: z.number().min(0).max(1),
  isTurkishFormat: z.boolean(),
  region: z.string().max(60).nullable(),
});

export type PlateResult = z.infer<typeof plateSchema>;

const DAMAGE_PROMPT = `Sen OtoSonar'ın araç hasar tespit uzmanısın. Verilen araç fotoğrafını analiz et.

GÖREV: Araçta görünen tüm hasarları, çizikleri, boya sorunlarını ve tamir gerektiren noktaları tespit et.

ÖNEMLİ:
- Sadece açıkça görülen hasarları raporla (tahmin yok)
- Türkiye 2026 fiyatlarıyla TL cinsinden onarım tahmini
- Hasar yoksa overallSeverity=YOK ve damages=[] döndür

Sadece JSON döndür:
{
  "overallSeverity": "YOK|HAFIF|ORTA|AGIR",
  "repairEstimateMinTL": <integer>,
  "repairEstimateMaxTL": <integer>,
  "damages": [{"type": "...", "location": "...", "severity": "...", "description": "..."}],
  "notes": "genel değerlendirme"
}

type: "BOYA" | "EZIK" | "CIZIK" | "KIRIK_CAM" | "FAR_LAMBA" | "TAMPON" | "KAPI" | "KAPUT_BAGAJ" | "IC_DOSEME" | "CERCEVE" | "DIGER"
severity: "YOK" | "HAFIF" | "ORTA" | "AGIR"`;

const PLATE_PROMPT = `Verilen fotoğraftaki Türkiye plakasını oku.

ÖNEMLİ:
- Türkiye plakası formatı: "34 ABC 123" veya "34 AB 1234" (il kodu + 1-3 harf + 2-4 rakam)
- Plaka görünmüyorsa plate=null ve confidence=0 döndür
- confidence 0-1 arası: ne kadar kesin okuduğun

Sadece JSON döndür:
{
  "plate": "34 ABC 123" veya null,
  "confidence": 0.0-1.0,
  "isTurkishFormat": true/false,
  "region": "İstanbul" veya null (ilk 2 rakama göre)
}`;

async function callGeminiVision(
  prompt: string,
  imageBase64: string,
  imageMime: string,
  apiKey: string,
): Promise<unknown> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const body = {
    systemInstruction: { parts: [{ text: prompt }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: "Aşağıdaki fotoğrafı analiz et." },
          { inlineData: { mimeType: imageMime, data: imageBase64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 2000,
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini vision HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini vision boş cevap");
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Gemini vision JSON parse başarısız");
    return JSON.parse(m[0]);
  }
}

export async function detectDamage(
  imageBase64: string,
  imageMime: string,
): Promise<{ result: DamageResult; model: string; durationMs: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const start = Date.now();
  const raw = await callGeminiVision(DAMAGE_PROMPT, imageBase64, imageMime, apiKey);
  const parsed = damageSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Damage parse failed: " + JSON.stringify(parsed.error.flatten()).slice(0, 200));
  }
  return { result: parsed.data, model: "gemini-2.5-flash", durationMs: Date.now() - start };
}

export async function readPlate(
  imageBase64: string,
  imageMime: string,
): Promise<{ result: PlateResult; model: string; durationMs: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const start = Date.now();
  const raw = await callGeminiVision(PLATE_PROMPT, imageBase64, imageMime, apiKey);
  const parsed = plateSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Plate parse failed: " + JSON.stringify(parsed.error.flatten()).slice(0, 200));
  }
  return { result: parsed.data, model: "gemini-2.5-flash", durationMs: Date.now() - start };
}
