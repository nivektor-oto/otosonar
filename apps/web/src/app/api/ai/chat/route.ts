/**
 * /api/ai/chat — Global AI Asistan endpoint'i.
 *
 * Sayfaya gömülü <AIAssistant /> komponenti tarafından çağrılır. Kullanıcının
 * site içinde her sayfada açabildiği yardımcı asistanı sürer:
 *  - Araç değerleme yardımı, satıcıya sorulacak sorular, KVKK soruları,
 *    site özelliklerinin nasıl çalıştığı vb.
 *
 * Mimari:
 *  - Birincil sağlayıcı: GEMINI_API_KEY (gemini-2.5-flash) — düşük gecikme.
 *  - Yedek sağlayıcı: ANTHROPIC_API_KEY (claude-haiku-4-5) — birincil patladığında.
 *  - Misafir kullanıcılara da açık (rate limit ile sınırlı).
 *  - 3.parti marka adlarını çıktıdan sansürler ("OtoSonar AI" yazar).
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const bodySchema = z
  .object({
    messages: z.array(messageSchema).min(1).max(20),
    contextHint: z.string().max(500).optional(),
  })
  .strict();

const SYSTEM_PROMPT = `Sen OtoSonar'ın resmi AI asistanısın. OtoSonar = Türkiye'nin yapay zekâ destekli ikinci el otomotiv değerleme + alıcı korumalı pazaryeri.
Görevlerin: kullanıcı sorularını yanıtla (araç değerleme, satıcıya sorulacak sorular, ekspertiz uyarıları, KVKK ve site özellikleri). KISA, NET, eylem-odaklı cevap ver. Markdown bullet kullan.
Yapma: 3.taraf marka adlarını söyleme (Gemini, Claude, OpenAI, Google AI vs). Gerçek olmayan rakam uydurma. Kişiselleştirilmiş finansal/hukuki tavsiye verme.`;

const BRAND_LEAK_REGEX = /\b(Gemini|Claude|OpenAI|Anthropic|Google\s*AI|GPT-?\d*|ChatGPT|Bard)\b/gi;

function censorBrandLeak(text: string): string {
  return text.replace(BRAND_LEAK_REGEX, "OtoSonar AI");
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function buildContextualSystemPrompt(contextHint: string | undefined, isAuth: boolean): string {
  const lines: string[] = [SYSTEM_PROMPT];
  if (contextHint && contextHint.trim().length > 0) {
    lines.push(
      `\nKullanıcı şu an bu sayfa/bağlamda: "${contextHint.replace(/[\r\n]+/g, " ").slice(0, 300)}". Cevabı bu bağlama uygun ver, gereksiz yere başka konulara sapma.`,
    );
  }
  lines.push(
    `\nKullanıcı durumu: ${isAuth ? "Üye (giriş yapmış)" : "Misafir (henüz üye değil)"}.`,
  );
  return lines.join("\n");
}

async function callGemini(
  systemPrompt: string,
  history: ChatTurn[],
  apiKey: string,
): Promise<string> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 1200,
        thinkingConfig: { thinkingBudget: 0 },
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      ],
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || text.trim().length === 0) {
    throw new Error("Gemini boş cevap döndü");
  }
  return text;
}

async function callGeminiWithRetry(
  systemPrompt: string,
  history: ChatTurn[],
  apiKey: string,
  maxRetries = 1,
): Promise<{ text: string; retried: number }> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const text = await callGemini(systemPrompt, history, apiKey);
      return { text, retried: attempt };
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const transient = /HTTP 5\d\d|429|UNAVAILABLE|overloaded|timeout/i.test(msg);
      if (!transient || attempt >= maxRetries) throw e;
      const delay = 400 * Math.pow(2, attempt) + Math.random() * 250;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

async function callAnthropic(
  systemPrompt: string,
  history: ChatTurn[],
  apiKey: string,
): Promise<string> {
  const client = new Anthropic({ apiKey, timeout: 55_000 });
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1200,
    temperature: 0.4,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text" || !block.text.trim()) {
    throw new Error("Anthropic boş cevap döndü");
  }
  return block.text;
}

export async function POST(req: Request) {
  const startTime = Date.now();

  // 1. JSON body parse + Zod
  let body: z.infer<typeof bodySchema>;
  try {
    const raw = await req.json();
    body = bodySchema.parse(raw);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof z.ZodError ? "invalid_input" : "invalid_json" },
      { status: 400 },
    );
  }

  // 2. Auth (opsiyonel — misafir de kullanabilir)
  let userId: string | null = null;
  try {
    const user = await getCurrentUser();
    userId = user?.id ?? null;
  } catch {
    // Auth çekilemezse misafir gibi devam et.
    userId = null;
  }

  // 3. Rate limit. Üye → 30/10dk; misafir → 5/gün (IP başına).
  const ip = await getClientIp();
  if (userId) {
    const rl = await checkRateLimit(`ai-chat:${userId}`, 30, 600);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limited", retryAt: rl.resetsAt.toISOString() },
        { status: 429 },
      );
    }
  } else {
    const rl = await checkRateLimit(`ai-chat:guest:${ip}`, 5, 86_400);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "guest_quota_exhausted", retryAt: rl.resetsAt.toISOString() },
        { status: 429 },
      );
    }
  }

  // 4. Son mesaj user'dan gelmeli (asistana mesaj yollamayız).
  const last = body.messages[body.messages.length - 1];
  if (last.role !== "user") {
    return NextResponse.json({ error: "last_message_must_be_user" }, { status: 400 });
  }

  // 5. AI çağrısı.
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!geminiKey && !anthropicKey) {
    await logError(new Error("AI_NOT_CONFIGURED"), {
      path: "/api/ai/chat",
      level: "ERROR",
      userId: userId ?? undefined,
    });
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const systemPrompt = buildContextualSystemPrompt(body.contextHint, !!userId);

  let raw: string | null = null;
  if (geminiKey) {
    try {
      const { text } = await callGeminiWithRetry(systemPrompt, body.messages, geminiKey);
      raw = text;
    } catch (e) {
      const msg = e instanceof Error ? e.message.slice(0, 200) : String(e);
      if (!anthropicKey) {
        await logError(e, {
          path: "/api/ai/chat",
          level: "ERROR",
          userId: userId ?? undefined,
          metadata: { provider: "gemini", note: "no_fallback" },
        });
        return NextResponse.json({ error: "ai_failed" }, { status: 502 });
      }
      console.warn(`[ai-chat] gemini_fail fallback=anthropic err=${msg}`);
    }
  }

  if (raw === null && anthropicKey) {
    try {
      raw = await callAnthropic(systemPrompt, body.messages, anthropicKey);
    } catch (e) {
      await logError(e, {
        path: "/api/ai/chat",
        level: "ERROR",
        userId: userId ?? undefined,
        metadata: { provider: "anthropic" },
      });
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
  }

  if (raw === null) {
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }

  // 6. Marka sızıntısı sansürü (3.parti AI isimleri).
  const message = censorBrandLeak(raw).trim();
  const durationMs = Date.now() - startTime;
  return NextResponse.json({ ok: true, message, durationMs });
}
