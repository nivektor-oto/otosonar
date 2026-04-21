import nodemailer, { type Transporter } from "nodemailer";
import { logError } from "@/lib/error-log";

let cached: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cached) return cached;

  const gmailUser = process.env.GMAIL_USER ?? "nivektorna@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (gmailPass) {
    cached = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
    return cached;
  }

  if (process.env.RESEND_API_KEY) {
    cached = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    });
    return cached;
  }

  return null;
}

export function isEmailReady(): boolean {
  return getTransporter() !== null;
}

interface SendInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(input: SendInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "email_not_configured" };

  const from =
    process.env.EMAIL_FROM ??
    `OtoSonar <${process.env.GMAIL_USER ?? "nivektorna@gmail.com"}>`;

  try {
    const info = await t.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? stripHtml(input.html),
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    await logError(err, { path: "email.sendEmail", metadata: { to: input.to.slice(0, 60) } });
    return { ok: false, error: (err as Error).message };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function verifyEmailTemplate(link: string, userName: string): { subject: string; html: string } {
  return {
    subject: "OtoSonar — E-posta adresini doğrula",
    html: emailShell(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#10b981;">E-posta doğrulama</h1>
      <p>Merhaba ${escapeHtml(userName)},</p>
      <p>OtoSonar'a hoş geldin. Hesabını aktive etmek için aşağıdaki butona bas:</p>
      <p style="margin:28px 0;">
        <a href="${link}" style="background:#10b981;color:#000;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          E-postayı doğrula
        </a>
      </p>
      <p style="font-size:12px;color:#94a3b8;">Buton çalışmazsa linki kopyala: <br/><code style="word-break:break-all;">${link}</code></p>
      <p style="font-size:11px;color:#64748b;">Bu bağlantı 24 saat geçerli. Sen istemediysen bu maili yok say.</p>
    `),
  };
}

export function passwordResetTemplate(link: string, userName: string): { subject: string; html: string } {
  return {
    subject: "OtoSonar — Şifre sıfırlama linki",
    html: emailShell(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#10b981;">Şifre sıfırlama</h1>
      <p>Merhaba ${escapeHtml(userName)},</p>
      <p>Şifreni sıfırlamak için aşağıdaki linke tıkla:</p>
      <p style="margin:28px 0;">
        <a href="${link}" style="background:#10b981;color:#000;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          Şifremi sıfırla
        </a>
      </p>
      <p style="font-size:12px;color:#94a3b8;">Bağlantı 60 dakika geçerli. Talep etmediysen bu maili yok say ve şifreni değiştirmene gerek yok.</p>
    `),
  };
}

export function welcomeTemplate(userName: string, customerNumber: number): { subject: string; html: string } {
  const code = `OS-${String(customerNumber).padStart(6, "0")}`;
  return {
    subject: `OtoSonar — Hoş geldin, müşteri no: ${code}`,
    html: emailShell(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#10b981;">Hoş geldin ${escapeHtml(userName)}!</h1>
      <p>Müşteri numaran: <b style="font-family:monospace;color:#10b981;">${code}</b></p>
      <p>Başlamak için:</p>
      <ul style="padding-left:16px;line-height:1.8;">
        <li><a href="https://otosonar.com/analiz" style="color:#10b981;">Yeni ilan analizi</a></li>
        <li><a href="https://otosonar.com/hasar-tespit" style="color:#10b981;">Fotoğraftan hasar tespiti</a></li>
        <li><a href="https://otosonar.com/quiz" style="color:#10b981;">Persona quiz — hangi paket sana uyar</a></li>
        <li><a href="https://otosonar.com/davet" style="color:#10b981;">Arkadaş davet et, +30 gün Plus kazan</a></li>
      </ul>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;">Sorun yaşarsan bu e-postayı yanıtla.</p>
    `),
  };
}

function emailShell(body: string): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;color:#e5e7eb;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#12121a;border:1px solid #1f1f2e;border-radius:16px;padding:32px;">
      ${body}
    </div>
    <div style="text-align:center;font-size:11px;color:#64748b;margin-top:20px;">
      OtoSonar · <a href="https://otosonar.com" style="color:#64748b;">otosonar.com</a> · © ${new Date().getFullYear()} NiVector
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
