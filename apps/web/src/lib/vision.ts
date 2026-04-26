/**
 * Vision wrapper (primary + fallback) — hasar tespiti + plaka OCR + ruhsat OCR.
 * `/api/damage-detect`, `/api/plate-ocr` ve `/api/ruhsat-ocr` tarafından kullanılır.
 */
import Anthropic from "@anthropic-ai/sdk";
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

// ============================================================
// Ruhsat OCR (araç ruhsatından alan çıkarma) — Anthropic Vision
// ============================================================

export const ruhsatSchema = z.object({
  plate: z.string().max(20).nullable(),
  brand: z.string().max(40).nullable(),
  model: z.string().max(80).nullable(),
  year: z.number().int().min(1950).max(2035).nullable(),
  variant: z.string().max(80).nullable(),
  vin: z.string().max(30).nullable(),
  motorNumber: z.string().max(40).nullable(),
  engineCc: z.number().int().min(50).max(20000).nullable(),
  fuelType: z.enum(["benzin", "dizel", "lpg", "hybrid", "elektrik"]).nullable(),
  color: z.string().max(40).nullable(),
  registrationDate: z.string().max(10).nullable(), // YYYY-MM-DD
  inspectionDueAt: z.string().max(10).nullable(), // YYYY-MM-DD
  ownerName: z.string().max(120).nullable(),
  vehicleClass: z.string().max(40).nullable(), // Otomobil / Kamyonet / Motosiklet
  netWeightKg: z.number().int().min(0).max(10000).nullable(),
  maxLoadKg: z.number().int().min(0).max(50000).nullable(),
  seatCount: z.number().int().min(1).max(60).nullable(),
  confidence: z.number().min(0).max(1),
  notes: z.string().max(500).nullable(),
});

export type RuhsatResult = z.infer<typeof ruhsatSchema>;

const RUHSAT_PROMPT = `Sen OtoSonar'ın Türk araç ruhsatı OCR uzmanısın. Verilen fotoğraf bir Türkiye araç ruhsatıdır (yeni format e-Devlet ruhsatı veya eski mavi/kırmızı karne).

GÖREV: Ruhsattaki tüm önemli alanları oku ve aşağıdaki JSON şemasına uygun çıktı üret.

ALAN EŞLEME (Türkçe ruhsat → JSON anahtarı):
- Plaka No / Tescil Plakası → plate (format: "34 ABC 123")
- Markası / Marka → brand (örn: "Renault", "BMW", "Toyota" — sadece marka, model değil)
- Tipi / Ticari Adı / Model → model (örn: "Megane", "320i", "Corolla")
- Model Yılı → year (4 haneli)
- Tip / Versiyon / Donanım → variant (varsa, örn: "Touch Plus")
- Şasi No / VIN → vin (17 karakterli alfanumerik)
- Motor No → motorNumber
- Motor Hacmi (cm³) → engineCc (sadece sayı, örn: 1598)
- Yakıt Türü → fuelType ("benzin"/"dizel"/"lpg"/"hybrid"/"elektrik" — Türkçe değer eşle)
- Rengi → color
- İlk Tescil Tarihi / Tescil Tarihi → registrationDate (YYYY-MM-DD formatına çevir; "12.05.2018" → "2018-05-12")
- Muayene Geçerlilik Sonu / Fenni Muayene Tarihi → inspectionDueAt (YYYY-MM-DD)
- Sahibi / Adı Soyadı → ownerName (kişi/kurum adı)
- Cinsi / Sınıfı → vehicleClass ("Otomobil", "Kamyonet", "Motosiklet" vb.)
- Net Ağırlık (kg) → netWeightKg
- İstiap Haddi (kg) → maxLoadKg
- Koltuk Adedi → seatCount

KURALLAR:
1. Bir alan ruhsatta yoksa veya okunamıyorsa o alanın değeri null olmalı (boş string değil).
2. Tarih formatı KESİNLİKLE YYYY-MM-DD (ISO). Türkçe ruhsatlar genelde DD.MM.YYYY yazar — ÇEVİR.
3. Plaka format: il kodu + boşluk + harfler + boşluk + rakamlar ("34 ABC 123").
4. Yakıt türünü normalize et: "Benzinli"→"benzin", "Motorin"→"dizel", "LPG"/"Bi-Yakıt"→"lpg", "Hibrit"→"hybrid", "Elektrikli"→"elektrik". Tanımsızsa null.
5. confidence: 0-1 arası genel okuma güveni. Bulanık/eksik fotoğrafsa düşür.
6. notes: kısa not (örn: "muayene tarihi okunamadı", "ruhsat fotoğrafı bulanık") — yoksa null.
7. Ruhsat değilse veya araç ruhsatı tespit edilemezse confidence=0 ver, plate=null, notes="ruhsat tespit edilemedi".

SADECE JSON döndür, başka metin yok:
{
  "plate": "34 ABC 123" | null,
  "brand": "..." | null,
  "model": "..." | null,
  "year": 2020 | null,
  "variant": "..." | null,
  "vin": "..." | null,
  "motorNumber": "..." | null,
  "engineCc": 1598 | null,
  "fuelType": "benzin"|"dizel"|"lpg"|"hybrid"|"elektrik"|null,
  "color": "..." | null,
  "registrationDate": "YYYY-MM-DD" | null,
  "inspectionDueAt": "YYYY-MM-DD" | null,
  "ownerName": "..." | null,
  "vehicleClass": "..." | null,
  "netWeightKg": 1200 | null,
  "maxLoadKg": 500 | null,
  "seatCount": 5 | null,
  "confidence": 0.0-1.0,
  "notes": "..." | null
}`;

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Ruhsat OCR JSON parse başarısız");
    return JSON.parse(m[0]);
  }
}

export async function readRuhsat(
  imageBase64: string,
  imageMime: "image/jpeg" | "image/png" | "image/webp",
): Promise<{ result: RuhsatResult; model: string; durationMs: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const start = Date.now();
  const client = new Anthropic({ apiKey, timeout: 55_000 });

  // 1 retry on transient errors
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        temperature: 0,
        system: [{ type: "text", text: RUHSAT_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: imageMime, data: imageBase64 } },
              { type: "text", text: "Bu Türk araç ruhsatını oku ve JSON üret." },
            ],
          },
        ],
      });
      const block = response.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") throw new Error("vision boş cevap");
      const raw = extractJson(block.text);
      const parsed = ruhsatSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          "Ruhsat parse failed: " + JSON.stringify(parsed.error.flatten()).slice(0, 300),
        );
      }
      return { result: parsed.data, model: "otosonar-ai-v1", durationMs: Date.now() - start };
    } catch (e) {
      lastErr = e;
      // retry only on overload / 5xx
      const msg = e instanceof Error ? e.message : String(e);
      if (!/(overload|529|503|429|timeout|ETIMEDOUT)/i.test(msg)) break;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("ruhsat OCR failed");
}
