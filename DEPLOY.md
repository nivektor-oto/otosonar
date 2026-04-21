# OtoSonar — Deploy Rehberi

## Gerekli hesaplar

- [x] **Cloudflare** — domain aldın (otosonar.com)
- [ ] **GitHub** — kod repo'su
- [ ] **Vercel** — hosting
- [ ] **Neon** — Postgres database

## Adım adım deploy

### 1) GitHub repo oluştur

1. https://github.com/new → Repository name: `otosonar` → Private → Create
2. Yeni repo sayfasından **HTTPS URL**'i kopyala (örn: `https://github.com/<kullanici>/otosonar.git`)

### 2) Local repo'yu GitHub'a push et

Terminalden (laptop'ta):

```bash
cd /home/aller/Desktop/otosonar
git init
git add .
git commit -m "Initial commit — OtoSonar MVP"
git branch -M main
git remote add origin <GITHUB_URL>
git push -u origin main
```

### 3) Vercel'e bağla

1. https://vercel.com/new → "Import from GitHub" → `otosonar` repo'yu seç
2. Framework: Next.js (otomatik algılar)
3. Root Directory: `apps/web` değil — **projenin kökü** (Vercel monorepo'yu otomatik çözer via vercel.json)
4. "Deploy" tıklama — ENV variables'ları ekleyene kadar bekle

### 4) Neon Postgres oluştur

1. https://neon.tech → New project → Region: **Frankfurt** (Türkiye'ye en yakın)
2. Connection string'i kopyala (örn: `postgresql://neondb_owner:xxx@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`)
3. **Pooled** + **Direct** iki URL'i not al

### 5) Vercel Env Variables ekle

Vercel → Project → Settings → Environment Variables. Aşağıdakileri ekle:

| Variable | Değer | Environment |
|----------|-------|-------------|
| `GEMINI_API_KEY` | `.env.local`'dan kopyala | Production, Preview |
| `DATABASE_URL` | Neon pooled | Production, Preview |
| `DIRECT_URL` | Neon direct | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://otosonar.com` | Production |
| `FOUNDER_EMAIL` | `kurucu@otosonar.com` | Production |
| `FOUNDER_PASSWORD` | `.env.local`'dan kopyala | Production |
| `FOUNDER_SESSION_SECRET` | `.env.local`'dan kopyala | Production |

**Önemli:** `.env.local` dosyasındaki gerçek değerleri terminaldan oku:

```bash
cat /home/aller/Desktop/otosonar/apps/web/.env.local
```

### 6) Redeploy

Vercel → Deployments → Latest → "..." menu → "Redeploy" (env yüklendikten sonra)

### 7) Cloudflare DNS kur

1. Cloudflare dashboard → otosonar.com domain → DNS
2. Vercel'den bekleyen domain doğrulaması alınca:
   - `A` record: `@` → `76.76.21.21` (Vercel default)
   - `CNAME` record: `www` → `cname.vercel-dns.com`
3. Vercel → Project → Settings → Domains → "otosonar.com" + "www.otosonar.com" ekle
4. Vercel otomatik SSL kurar (1-3 dakika)

### 8) Prisma migration

DB hazırlandıktan sonra:

```bash
cd /home/aller/Desktop/otosonar
pnpm --filter db exec prisma generate
pnpm --filter db exec prisma db push
```

## Test

```bash
# Production sitesi
curl -I https://otosonar.com
# → HTTP/2 200

# API
curl -X POST https://otosonar.com/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userType":"buyer","kvkkConsent":true}'
```

## Kurucu giriş (production)

URL: `https://otosonar.com/yonetici`
Credentials: `.env.local`'daki `FOUNDER_EMAIL` + `FOUNDER_PASSWORD`

## Sorun giderme

- **Build fail:** Vercel log'u oku, genellikle env eksik
- **DB connection error:** `DATABASE_URL` + `DIRECT_URL` ikisini de ekle
- **Domain aktif değil:** DNS propagation 5-60dk sürer, Vercel SSL otomatik
- **AI 500:** `GEMINI_API_KEY` eksik veya kotalarda
