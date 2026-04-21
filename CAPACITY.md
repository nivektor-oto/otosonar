# OtoSonar — Sistem Kapasite Analizi

**Son güncelleme:** 2026-04-21

## TL;DR

| Tier | Aktif kullanıcı (ay) | Durum |
|------|---------------------|-------|
| 0–200 | Mevcut free tier yeterli | ✅ Bedava |
| 200–1,500 | Gemini limit sıkışır, Anthropic fallback devreye girer | ⚠️ AI maliyeti artar |
| 1,500–5,000 | Vercel Hobby sınırı, Neon compute saati sınırı | ⚠️ Pro tier gerek |
| 5,000+ | Tam Pro setup + Pro Neon + Resend + Redis | 💰 ~$150/ay altyapı |

**Bugünkü kapasite:** 500–1,500 aktif Plus kullanıcı (ücretsiz katman) / 50–200 aktif Max kullanıcı.

---

## Altyapı bileşenleri ve limitler

### 1. Vercel Hosting (Hobby tier — mevcut)

| Kaynak | Limit | 1 kullanıcı ort. | Teorik kapasite |
|--------|-------|------------------|-----------------|
| Bandwidth | 100 GB/ay | 30 MB/ay | ~3,300 aktif user |
| Serverless execution | 100 GB-hours/ay | 0.02 GB-h/user | ~5,000 aktif user |
| Function invocations | 1,000,000/ay | 150 req/user | ~6,600 aktif user |
| Cron jobs | 1 job günlük max | ✓ uyuyor | — |

**Darboğaz:** Bandwidth (3.3K user) ilk sınıra varır.

### 2. Neon Postgres (Free tier — mevcut)

| Kaynak | Limit | Kullanım |
|--------|-------|----------|
| Storage | 0.5 GB | ~5-10M row kapasitesi |
| Compute time | 190 saat/ay (endpoint aktif kaldığı süre) | Auto-suspend aktif |
| Connections | 10 concurrent | pooler kullanılıyor |
| Branches | 10 | backup snapshot için |

**Kritik not:** 190 saat compute limit. Sürekli aktif endpoint gün=24h × 30 = 720 saat. Auto-suspend (5 dk inactivity) devrede → kullanıcı sayısına göre değişir.
- 100 aktif user → ~50 saat/ay tutar
- 500 user → ~120 saat
- 1,500 user → limit aşar → Pro ($19/ay) gerek

### 3. AI Provider: Gemini 2.5 Flash (Free tier)

| Kaynak | Limit |
|--------|-------|
| Request/gün | 1,500 |
| Input token/dk | 1M |
| Output token/dk | 250K |

**Kullanım modeli:**
- Plus kullanıcı: 25 analiz/ay = 0.8/gün × 1500 = **1,800 Plus user** kapasitesi
- Pro kullanıcı: sınırsız → konservatif 60/ay = 2/gün = **750 Pro user**
- Max kullanıcı: + hasar AI + plaka OCR → ek 15/ay = 2.5/gün toplam = **600 Max user**

**Fallback:** Gemini bitince Anthropic Haiku devreye girer (ücretli, ~$0.0008/analiz).

### 4. Cloudflare (Free tier)

| Kaynak | Limit |
|--------|-------|
| DNS requests | Sınırsız |
| Bandwidth | Sınırsız (Free plan) |
| DDoS koruma | Evet |

Darboğaz yok.

---

## Kullanıcı başına kaynak tüketimi

### Bireysel Plus (99 TL/ay, 25 analiz)
- Neon: ~200 ms/analiz × 25 = 5s compute
- Gemini: 25 request × ~12K token = 300K token
- Bandwidth: PWA + HTML + analiz ~30 MB/ay
- **Altyapı maliyeti user başına:** ~0.4 TL/ay (break-even 99 TL'yi rahatça karşılar)

### Pro (249 TL/ay, sınırsız)
- Ort. 60 analiz/ay → altyapı ~1 TL/ay
- Marj: %99

### Galerici Bayi Pro (1599 TL/ay, fleet + trade-in)
- Ort. 300 analiz/ay + API erişimi
- Altyapı: ~5 TL/ay
- Marj: %99.7

**Not:** Gerçek maliyet AI token ve Neon CPU saatinden gelir. Kullanıcı başına %1'in altında.

---

## Büyüme Senaryoları

### 100 aktif kullanıcı (1. ay)
- Free tier her yerden ✅
- Aylık maliyet: ~0 TL (domain dışında)
- MRR: ~10K TL (hedef 50K'nın %20'si)

### 500 aktif (3. ay)
- Free tier hala yeterli ✅
- Gemini ~400 req/gün (limit 1500)
- Neon compute ~100 saat (limit 190)
- MRR: ~50K-90K TL

### 1,500 aktif (6. ay)
- ⚠️ Neon Pro gerekir ($19/ay)
- ⚠️ Gemini ücretli tier'a geçiş ($10-30/ay)
- ⚠️ Resend email ($20/ay)
- Aylık altyapı: ~$50-100/ay (~1500-3000 TL)
- MRR: ~250-400K TL (~hedef %50)

### 5,000 aktif (12. ay)
- Vercel Pro $20/ay × user-based + bandwidth ekle
- Neon Pro tier $19/ay + compute ek
- Redis (rate limit durability için): Upstash Free → Pay-as-go
- CDN cache optimizasyonu
- Altyapı: ~$200-400/ay
- MRR: ~2M-4M TL

---

## Bugünkü limitler — net rakam

**1 makine kaç kullanıcıya hizmet eder?**
- Teorik üst sınır: **2,000–2,500 aktif kullanıcı/ay** (free tier + tasarım limiti)
- Konforlu operasyon: **500 aktif Plus + 100 Pro + 20 Max + 10 Galerici** = ~630 ödeme yapan müşteri
- Bu senaryoda MRR: 99×500 + 249×100 + 449×20 + 1599×10 ≈ **100K TL/ay** (hedef %50 giderilmiş)

---

## Kritik uyarılar

1. **Gemini API key ücretsiz tier kota dolarsa:** Anthropic fallback devreye girer ama her analiz ~$0.0008 tutar. 10K/ay analizde $8 = ~250 TL.

2. **Neon compute limiti aşıldığında:** Endpoint suspend olur, analiz 500 döner. Pro plan $19/ay satın alınmalı.

3. **Vercel bandwidth limitine yaklaşınca:** 80% geldiğinde Vercel e-posta atar, 100%'de hız düşer ve sonunda durur. Pro plan'a geçiş anlık.

4. **Cron laptop kapalıyken:** Vercel Cron çalışır (daily), yerel crontab değil. Hobby tier günde 1 kez.

---

## Müşteri kayıt sistemi

- Her yeni signup'ta `User.customerNumber` auto-increment → `OS-000001`, `OS-000002`...
- `/yonetici/musteriler` sayfasından arama + filtreleme + CSV export
- Otomatik cron: her gece 02:00 `/home/aller/Desktop/otosonar-musteriler.csv` senkronlanır (chmod 600)
- Müşteri ayrıntıları tüm DB tablolarında tutulur (User + Dealer + Subscription + Analysis history)

---

## Ölçüm araçları

- `/yonetici/ops` → toplam user/dealer/sub/ödeme/event sayıları + son 20 hata + churn risk
- Cron temizliği: eski hata kayıtları 30 gün, analytics 180 gün sonra silinir
- Müşteri CSV'si haftada 1 e-postaya atılabilir (e-posta bağlandığında)
