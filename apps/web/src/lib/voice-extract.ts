import { z } from "zod";

export const voiceExtractSchema = z.object({
  transcript: z.string().min(1).max(4000),
  extracted: z.object({
    brand: z.string().max(40).optional(),
    model: z.string().max(60).optional(),
    variant: z.string().max(60).optional(),
    year: z.number().int().min(1980).max(2030).optional(),
    km: z.number().int().min(0).max(2_000_000).optional(),
    fuelType: z.enum(["Dizel", "Benzin", "Benzin & LPG", "Hibrit", "Elektrik"]).optional(),
    transmission: z.enum(["Otomatik", "Manuel", "Yarı Otomatik"]).optional(),
    city: z.string().max(40).optional(),
    askingPrice: z.number().int().min(0).max(50_000_000).optional(),
    damageStatus: z.string().max(200).optional(),
  }),
});

export type VoiceExtractResult = z.infer<typeof voiceExtractSchema>;

const VOICE_SYSTEM_PROMPT = `Sen OtoSonar'ın araç bilgisi çıkarım uzmanısın. Kullanıcı bir araç hakkında Türkçe ses kaydı gönderdi. Görevin iki şey:

1. TRANSCRIPT: Kullanıcının söylediklerinin tam Türkçe transkriptini üret.
2. EXTRACT: Transkriptten aşağıdaki yapısal alanları çıkar.

KURALLAR:
- Emin olmadığın alanı UNDEFINED bırak (uydurma yapma).
- Fiyat ile kilometreyi karıştırma. Türk pazarında:
  - Fiyat genelde 200.000 - 5.000.000 TL arasıdır; "bir milyon üç yüz", "850 bin", "1.350.000" gibi ifadeler → askingPrice.
  - Km genelde 20.000 - 400.000 arasıdır; "yüz seksen bin km", "200 bin kilometrede" → km.
  - Sayı + "bin TL" / "lira" → fiyat; sayı + "bin km" / "kilometre" → km.
- "80'li seksen üç" / "2018 model" / "on sekizlik" → year (4 basamaklı).
- Marka normalize: "beyemve" → "BMW", "folksvagın" → "Volkswagen", "mersedes" → "Mercedes-Benz", "renolt" → "Renault", "hyundai/hyundi" → "Hyundai".
- fuelType: kullanıcı "dizel/benzin/LPG/hibrit/elektrik" söylemezse alanı boş bırak. "Benzinli LPG'li", "LPG var", "benzin+LPG" → "Benzin & LPG".
- transmission: "otomatik/düz/yarı otomatik/DSG/tiptronik" → Otomatik veya Manuel veya Yarı Otomatik. DSG, tiptronik, dualogic → Yarı Otomatik.
- damageStatus: "boyasız değişensiz", "2 parça boya", "değişen yok" gibi hasar bilgileri varsa buraya kısaca yaz.
- city: Türkiye ili (İstanbul, Konya, Ankara, İzmir...). Yoksa boş.

SADECE JSON DÖNDÜR:
{
  "transcript": "<kullanıcının tam Türkçe ifadesi>",
  "extracted": {
    "brand": "<marka>",
    "model": "<model>",
    "variant": "<paket/kasa, opsiyonel>",
    "year": <yıl>,
    "km": <km>,
    "fuelType": "Dizel" | "Benzin" | "Benzin & LPG" | "Hibrit" | "Elektrik",
    "transmission": "Otomatik" | "Manuel" | "Yarı Otomatik",
    "city": "<il>",
    "askingPrice": <TL>,
    "damageStatus": "<kısa özet>"
  }
}

Dolduramadığın her alan için alanı ATLA (null yerine atla).`;

export async function extractFromVoice(
  audioBase64: string,
  mimeType: string,
): Promise<{ result: VoiceExtractResult; provider: string; durationMs: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const start = Date.now();
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const body = {
    systemInstruction: { parts: [{ text: VOICE_SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: "Aşağıdaki ses kaydını transkript et ve araç bilgilerini çıkar." },
          { inlineData: { mimeType, data: audioBase64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
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
    throw new Error(`Gemini voice HTTP ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini voice boş cevap döndü");

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Voice extract JSON parse hatası");
    raw = JSON.parse(m[0]);
  }

  const parsed = voiceExtractSchema.parse(raw);
  return {
    result: parsed,
    provider: "gemini-2.5-flash",
    durationMs: Date.now() - start,
  };
}
