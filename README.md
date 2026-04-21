# OtoSonar

**AI destekli araç analiz ve galerici marketplace platformu.**

Türkiye ikinci el oto pazarı için Next.js 15 + Gemini 2.5 Flash. Sahibinden ve arabam.com ilanlarını 10 saniyede analiz eder: emsal değer, gizli arıza tespiti, pazarlık skoru, bozdurma hesaplayıcı.

## Özellikler (aktif)

- **Araç analizi** (`/analiz`) — ilan URL'i veya manuel giriş → AI emsal + red flag + pazarlık
- **Pazar araştırma** (`/pazar-arastir`) — marka/model fiyat bandı
- **Bozdurma hesaplayıcı** (`/bozdurma`) — galerici müşteriden araç alımı: max alım + önerilen teklif + stok süresi
- **Bekleme listesi** (`/bekleme-listesi`) — Kurucu 100 Kulübü kayıt
- **Yönetici paneli** (`/yonetici`) — istatistik + CSV export
- **PWA** — iOS/Android "ana ekrana ekle", offline fallback

## Tech stack

- Next.js 15 App Router + React 19 + TypeScript strict
- Tailwind CSS + custom design system
- Gemini 2.5 Flash (primary AI) + Claude Haiku 4.5 (fallback)
- Zod validation (input + output)
- Prisma ORM (Postgres)
- pnpm workspaces

## Yerel geliştirme

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# .env.local içine GEMINI_API_KEY yaz
pnpm --filter web dev
# http://localhost:3000
```

## Deploy

[DEPLOY.md](./DEPLOY.md) — Vercel + Neon + Cloudflare adım adım.

## Proje yapısı

```
otosonar/
├── apps/
│   └── web/                # Next.js app
│       ├── src/
│       │   ├── app/        # App Router pages + API routes
│       │   ├── components/ # React components
│       │   ├── lib/        # AI, auth, utils
│       │   └── styles/     # Tailwind + global CSS
│       └── public/         # Static assets (icons, PDF, manifest)
├── packages/
│   └── db/                 # Prisma schema + client
├── vercel.json             # Deploy config
└── pnpm-workspace.yaml
```

## Kurucu hesap

Production'da `/yonetici` → `.env.local` içindeki `FOUNDER_EMAIL` + `FOUNDER_PASSWORD`.

## Roadmap

12 haftalık plan: `../agentler/agents/otosonar-dev/roadmap.md`

## Lansman

**2026-05-12** — Konya pilot 30 galerici + İlk 100 Kurucu Kulübü.

---

© 2026 NiVector Teknoloji · [otosonar.com](https://otosonar.com)
