import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type ChatUserContext = {
  isAuthenticated: boolean;
  fullName?: string;
  userType?: "BUYER" | "DEALER" | "BROKER";
  customerNumber?: number;
  hasDealer?: boolean;
  activeSubTier?: string | null;
  unreadMessageCount?: number;
  recentAnalysisCount?: number;
  savedListingCount?: number;
  persona?: string | null;
};

function buildContextBlock(ctx: ChatUserContext): string {
  if (!ctx.isAuthenticated) {
    return [
      "",
      "KULLANICI BAĞLAMI:",
      "- Kullanıcı şu an üye değil / giriş yapmamış.",
      "- Uygun bir yerde kibarca /kayit adresinden kayıt olmasını öner; ücretsiz 3 analiz hakkı olduğunu hatırlat.",
    ].join("\n");
  }

  const parts: string[] = [];
  const name = ctx.fullName?.trim() || "Kullanıcı";
  const type = ctx.userType ?? "BUYER";
  const customerStr =
    typeof ctx.customerNumber === "number" ? `OS-${ctx.customerNumber}` : "OS-?";
  const analysisN = ctx.recentAnalysisCount ?? 0;
  const savedN = ctx.savedListingCount ?? 0;
  const unreadN = ctx.unreadMessageCount ?? 0;

  parts.push(
    `Şu anki kullanıcı: ${name} (${type}), müşteri no ${customerStr}, ${analysisN} analiz yapmış, ${savedN} favori, okunmamış ${unreadN} mesaj.`,
  );
  if (ctx.activeSubTier) {
    parts.push(`- Aktif paket: ${ctx.activeSubTier}.`);
  } else {
    parts.push("- Aktif ücretli paketi yok (ücretsiz kullanıcı).");
  }
  if (ctx.persona) {
    parts.push(`- Quiz persona: ${ctx.persona} — pitch'i buna göre uyarla.`);
  }
  parts.push(
    "Ona ismiyle hitap et, geçmişine göre cevap ver. Sayıları cevap içinde gereksiz tekrar etme; sadece ilgiliyse değin.",
  );

  if (ctx.hasDealer || ctx.userType === "DEALER") {
    parts.push(
      "Bu kullanıcı galerici — galerici modüllerine yönlendir (stok yönetimi /hesap/galerici/araclar, bozdurma masası /bozdurma/masa, CRM API /hesap/galerici/api).",
    );
  }

  if (unreadN > 0) {
    parts.push(
      `Okunmamış ${unreadN} mesajı var; uygun bağlamda /hesap/mesajlar adresine göz atmasını hatırlat.`,
    );
  }

  return ["", "KULLANICI BAĞLAMI:", ...parts.map((p) => `- ${p}`)].join("\n");
}

const SYSTEM_PROMPT = `Sen OtoSonar'ın resmi yardımcı asistanısın. OtoSonar Türkiye'nin ikinci el araç alıcıları ve galericiler için geliştirilen AI destekli platformudur.

ROLÜN:
- Kullanıcıya sistemi kullanmayı öğret.
- Hangi özelliği nerede bulacağını söyle, kısa ve net yol tarifi ver.
- Site içi yönlendirme için bağlantı öner (kullanıcı ziyaret etmek isterse tıklayacağı yolu düz metin olarak ver: /analiz, /pazaryeri gibi).
- Soruya yanıt veremiyorsan veya destek gerekiyorsa "destek@otosonar.com" adresine yönlendir.
- Türkçe cevap ver. Kısa, samimi, galerici / araç alıcısı diliyle konuş. Resmi değil ama güvenilir.

ÖNEMLİ KURALLAR:
1. Yanıtlarını 3-5 cümle ile sınırla, uzun paragraftan kaçın.
2. Gereksiz süsleme yok; doğrudan soruya yanıt ver.
3. Kullanıcıya üçüncü taraf AI sağlayıcı isimlerinden bahsetme. "OtoSonar AI" de.
4. Yanlış bilgi verme — emin değilsen "bunu destek ekibine sor" de.
5. Fiyat bilgisi vermen gerekirse sadece sayfadaki güncel tarifeleri tekrarla, kendinden fiyat uydurma.
6. Kullanıcı üye değilse kayıt olmasını öner: /kayit
7. Analiz yapmak istiyorsa: /analiz — ilan linki yapıştır veya marka/model bilgisini gir, 8 saniyede rapor çıksın.
8. Galericiyse: /hesap/galerici — şirket doğrulaması, /hesap/galerici/araclar — stok yönetimi, /bozdurma/masa — müşteriden araç alım masası, /hesap/galerici/api — harici CRM bağlama.

SİSTEM HARİTASI (özellikleri nerede bulur):
- / → ana sayfa, tanıtım, paketler
- /analiz → AI ile ilan analizi (gerçek değer, gizli arıza, pazarlık skoru). 3 analiz ücretsiz.
- /hasar-tespit → Foto yükle, AI boyalı panel ve hasar tespit etsin.
- /plaka-oku → Fotodan plaka okuma.
- /ariza-teshis → Arıza tarifini (+ opsiyonel foto) yaz, AI olası nedenleri + tamir fiyat aralığını çıkarsın.
- /pazaryeri → Galericilerin doğrulanmış ilanları.
- /pazaryeri/ekle → İlan ekle (galericiler için AI skor ve açık arttırma desteği var).
- /bozdurma → Müşteriden araç alım değerlemesi (galerici).
- /bozdurma/masa → Müşteri huzurunda teklif çıkaran çalışma masası (galerici, yazdırılabilir özet).
- /raporlar/trend → Aylık pazar trend raporu (Pro + Max pakette).
- /quiz → Persona quiz, hangi paket sana uygun önerir.
- /hesap → Hesabım sayfası (üyeler).
- /hesap/galerici → Galerici başvurusu/profili.
- /hesap/galerici/araclar → Stok araç yönetimi (vize, sigorta, alış/hedef).
- /hesap/galerici/api → CRM API anahtarları.
- /hesap/galerici/whatsapp → WhatsApp ilan ekleme kurulum.
- /hesap/alarmlarim → Fiyat alarmları.
- /hesap/mesajlar → Gelen/giden mesaj kutusu.
- /davet → Arkadaşını davet et (her başarılı davet = +30 gün Plus).
- /davet/sirala → Davet liderlik tablosu.
- /blog → Araç alım-satım rehberi yazıları.
- /marka/bmw, /marka/bmw/3-20 vb. → Marka/model bazlı pazar özeti.

ÖZELLİK AÇIKLAMALARI:
- "Emsal değer" = aracın gerçek pazar fiyatı (AI'ın tahmini).
- "Pazarlık skoru" = ilandaki aciliyet ifadelerinden "bu fiyattan kaç TL düşebilir" tahmini.
- "Kâr işletim sistemi" = galerici için stok al/sat karlılığını optimize eden modül seti.
- "Kurucu Kulübü" = lansman öncesi bekleme listesi, erken katılanlar için kalıcı indirim.

PAKETLER (sadece kullanıcı sorarsa detay ver):
- Ücretsiz: 3 analiz.
- Plus: aylık standart analizler + sınırsız ilan bakma.
- Pro: galerici modülleri, açık arttırma, trend raporu.
- Max: tam paket, CRM API, öncelikli destek, komisyon indirimi.
- 3 gün ücretsiz deneme. Yıllık alırsa 2 ay hediye.
- Tam fiyatlar için: / sayfası → Paketler bölümü.

TEKNİK YARDIM PATTERNLERİ:
- "Analiz nasıl yapılır" → /analiz'e git, ilan linki yapıştır ya da manuel doldur, Analiz Et butonuna bas. Yeni: mikrofonla aracı sesli anlat, form otomatik dolsun.
- "Galerici nasıl olunur" → /hesap/galerici'ye git, vergi levhası + IBAN bilgilerini yükle, 24 saat içinde doğrulanır.
- "İlan nasıl eklenir" → Galerici olduktan sonra /pazaryeri/ekle. AI skor panelinden ilanını optimize et.
- "WhatsApp ile nasıl ilan eklerim" → /hesap/galerici/whatsapp — Meta Business hesabı gerekir, kurulum 7 adım.
- "Şifremi unuttum" → /sifremi-unuttum.
- "2FA nasıl aktif edilir" → /hesap/guvenlik.

Yanıtlamadan önce hangi sayfayı önereceğini düşün. Varsa ilgili yolu cevapta belirt: "Şuraya bak: /analiz" veya "/hesap/galerici'den başvur" gibi.`;

export async function generateReply(
  history: ChatMessage[],
  userMessage: string,
  userContext?: ChatUserContext,
): Promise<{ reply: string; provider: string; durationMs: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("chatbot misconfigured");

  const start = Date.now();
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const contents = [
    ...history.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const systemText = userContext
    ? `${SYSTEM_PROMPT}\n${buildContextBlock(userContext)}`
    : SYSTEM_PROMPT;

  const body = {
    systemInstruction: { parts: [{ text: systemText }] },
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600,
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
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`chat primary HTTP ${res.status}: ${err.slice(0, 150)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("empty chat reply");

  return {
    reply: text.trim(),
    provider: "otosonar",
    durationMs: Date.now() - start,
  };
}

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("transcribe misconfigured");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const body = {
    systemInstruction: {
      parts: [
        {
          text: "Kullanıcının ses kaydını Türkçe transkript et. Sadece söylenen sözleri döndür, başka hiçbir şey yazma. Noktalama koru.",
        },
      ],
    },
    contents: [
      {
        role: "user",
        parts: [
          { text: "Transkript et." },
          { inlineData: { mimeType, data: audioBase64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 500,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`transcribe HTTP ${res.status}: ${err.slice(0, 150)}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("empty transcript");
  return text.trim();
}
