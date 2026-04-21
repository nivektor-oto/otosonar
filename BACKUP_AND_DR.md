# OtoSonar — Yedekleme ve Felaket Kurtarma (DR) Planı

**Son güncelleme:** 2026-04-21
**RPO hedefi:** 24 saat
**RTO hedefi:** 4 saat

---

## 1. Neyi Yedekliyoruz

| Katman | Sistem | Yedekleme tipi | Frekans |
|--------|--------|---------------|---------|
| Veritabanı | Neon Postgres (Frankfurt) | PITR (point-in-time-recovery) | Sürekli, 7 gün geri alma |
| Veritabanı | Neon branches | Manuel snapshot | Haftalık (pazar gecesi) |
| Kod | GitHub (nivektor-oto/otosonar) | Git mirror | Her push |
| Env config | Vercel env + `/home/aller/Desktop/NIVECTOR_BILGILER.md` | Manuel | Her değişiklikte |
| Statik içerik | `public/` (Vercel build artifact) | Git + Vercel | Her deploy |
| Marketing PDF | `public/sunum.pdf` | Git LFS değil, regular | Her değişiklikte |

---

## 2. Neon Postgres Yedekleme

Neon otomatik olarak **7 günlük PITR** sağlar (free tier). Paid tier 30 güne çıkar.

### Manuel snapshot (haftalık)

```bash
# Neon CLI yoksa: curl + API
export NEON_API_TOKEN="$(grep napi_ /home/aller/Desktop/NIVECTOR_BILGILER.md | awk '{print $NF}' | tr -d '`')"
export NEON_PROJECT_ID="curly-cherry-33268340"

# Yeni branch oluştur (snapshot görevi görür)
curl -X POST "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" \
  -H "Authorization: Bearer $NEON_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"branch\": {\"name\": \"backup-$(date +%Y-%m-%d)\"}}"
```

Bu branch'ler "snapshot" gibi davranır; istediğin zaman branch'ten yeni bir DB kopyası çıkarabilirsin.

### PITR ile zaman geri alma

Neon console'da proje → **Restore** → tarih/saat seç → yeni branch olarak aç → connection string'i prod ile değiştir.

### Logical backup (felaket durumu için, hedef sisteme bağımsız)

```bash
DATABASE_URL="$(cat /tmp/neon-direct.txt)"
pg_dump --no-owner --no-acl --format=custom --file="/home/aller/backups/otosonar-$(date +%Y-%m-%d).dump" "$DATABASE_URL"
```

**Öneri:** bu komutu her pazar 03:00'te crontab'a ekle:

```cron
0 3 * * 0 DATABASE_URL="$(cat /tmp/neon-direct.txt)" pg_dump --no-owner --no-acl --format=custom --file="/home/aller/backups/otosonar-$(date +\%Y-\%m-\%d).dump" "$DATABASE_URL" 2>>/home/aller/backups/pg_dump.log
```

7 günden eski dumps otomatik silinsin:

```cron
0 4 * * 0 find /home/aller/backups -name "otosonar-*.dump" -mtime +30 -delete
```

---

## 3. Kod Yedekleme

GitHub ana kopya. İkincil koruma için haftalık mirror:

```bash
cd /home/aller/backups/
git clone --mirror https://github.com/nivektor-oto/otosonar.git "otosonar-mirror-$(date +%Y-%m-%d).git"
```

GitHub Archive (account-wide):  `gh api user/repos | jq -r '.[].clone_url' | xargs -I{} git clone --mirror {}`

---

## 4. Env / Credential Yedekleme

**Ana kopya:** `/home/aller/Desktop/NIVECTOR_BILGILER.md` (chmod 600)

**İkincil kopyalar (öneri):**
1. Şifreli USB (GPG ile encrypt et): `gpg -c NIVECTOR_BILGILER.md` → `NIVECTOR_BILGILER.md.gpg`
2. Bitwarden / 1Password secure note
3. Vercel env UI'ından okunabilir (sadece tokenlar orada)

**DİKKAT:** Bu dosyayı asla Git'e commit etme, cloud drive'a senkronize etme.

---

## 5. Felaket Senaryoları

### Senaryo A: Vercel hesap askıya alındı
- **Tahmini süre:** 1-2 saat
- **Adım:**
  1. Cloudflare DNS'te A record'u yeni hosting IP'sine çevir (ör. Fly.io, Render)
  2. Yeni host'ta Next.js deploy (kaynak: GitHub)
  3. Env'leri yeni host'a kopyala
  4. SSL otomatik (Cloudflare proxied=true ise)

### Senaryo B: Neon veritabanı bozuldu/erişilemiyor
- **Tahmini süre:** 30 dk (PITR) / 2 saat (pg_restore)
- **Adım:**
  1. Neon console → PITR → en son sağlıklı noktaya geri dön → yeni branch olarak aç
  2. Vercel env'de DATABASE_URL ve DIRECT_URL'yi yeni branch'in connection string'iyle değiştir
  3. Redeploy
  4. Alternatif: `pg_restore --clean --dbname=$NEW_DB /home/aller/backups/otosonar-<son>.dump`

### Senaryo C: Domain ele geçirildi / Cloudflare hesap kaybı
- **Tahmini süre:** 4-24 saat
- **Adım:**
  1. Cloudflare destek ile iletişim (abuse@cloudflare.com)
  2. 2FA recovery code kullan (Bitwarden'da sakla)
  3. Geçici olarak `otosonar.vercel.app` subdomain'inden hizmet ver
  4. Kurtarma sonrası tüm API tokenları revoke + yeniden üret

### Senaryo D: AI provider kesildi (Gemini + Anthropic aynı anda down)
- **Tahmini süre:** provider-down süresi
- **Mitigasyon:** `ai.ts` zaten iki provider fallback yapıyor. İkisi de down olursa UI "AI geçici olarak kullanılamıyor" mesajı gösterir — analiz kuyruğa alınmaz, kullanıcı kaybı minimal.
- **İzleme:** Hata oranı %10'u geçerse `/yonetici/ops` sayfasında kırmızı alarm.

### Senaryo E: Laptop çalındı / bozuldu
- **Tahmini süre:** 2 saat
- **Adım:**
  1. GitHub / Vercel / Cloudflare / Neon tokenlarını revoke et
  2. Yeni tokenlar üret
  3. Yeni laptop'ta repo clone + env restore (`NIVECTOR_BILGILER.md`'nin GPG kopyasından)
  4. Cron agent sistemi yeniden kur (`agentler/cron/run-agent.sh`)
- **Site etkisi:** 0. Site Vercel + Neon'da bağımsız çalışıyor; laptop sadece dev ortamı.

### Senaryo F: Sunucudaki tüm cron agent'ları kapandı
- **Etkisi:** yeni Dev/QA/CEO heartbeat üretilmez. Canlı ürün etkilenmez.
- **Onarım:** `systemctl --user restart otosonar-cron` veya `crontab -e` ile cron satırlarını geri ekle.

---

## 6. İzleme ve Alarm

Mevcut:
- **Uptime:** `/yonetici/ops` → son 24h event sayısı; 0 ise bir sorun var
- **Hata oranı:** `/yonetici/ops` → fingerprint dağılımı
- **Churn risk:** günde 1 kez `topRiskUsers()` çalıştır, yüksek riskte e-posta at

Eklenecek (launch sonrası):
- **UptimeRobot** (ücretsiz): `https://otosonar.com/api/auth/me` endpoint'ini 5 dk'da 1 ping
- **Telegram alarm:** `ErrorLog.count > 100/hour` olursa Nina botuna mesaj
- **Statuspage:** status.otosonar.com (launch sonrası)

---

## 7. DR Test Takvimi

| Test | Frekans | Sorumlu |
|------|---------|---------|
| Neon PITR restore (test branch) | Her ay 1. pazartesi | Kurucu |
| pg_dump → pg_restore roundtrip | Her 3 ay | Kurucu |
| Cloudflare DNS failover (Vercel → yedek host) | Her 6 ay | Kurucu + Dev agent |
| Laptop kayıp tatbikatı (başka bilgisayardan deploy) | Her 6 ay | Kurucu |

---

## 8. Acil Durum Kontaktları

| Kaynak | Kontakt | Yanıt SLA |
|--------|---------|-----------|
| Vercel | support.vercel.com | 24h (Hobby), 4h (Pro) |
| Neon | support.neon.tech | 24-48h (free) |
| Cloudflare | abuse@cloudflare.com / support | 24h |
| Domain registrar | Cloudflare Registrar support | 24h |
| Google / Gemini | cloud.google.com/support | N/A free tier |
| Anthropic | support@anthropic.com | 24-48h |

Tüm tokenların güncel durumu için: `/home/aller/Desktop/NIVECTOR_BILGILER.md`

---

## 9. "Gün 0" Checklist

Eğer sıfırdan toparlamak gerekirse sıra:

1. [ ] GitHub repo clone (yeni makineye)
2. [ ] `NIVECTOR_BILGILER.md`'den env'leri restore et
3. [ ] Neon son sağlıklı PITR branch'ine bağlan
4. [ ] Vercel deploy tetikle (`vercel --prod`)
5. [ ] Cloudflare DNS A record doğrula
6. [ ] `/api/auth/me` 401 dönüyor mu? → giriş yap → 200 → sağlıklı
7. [ ] Analitik: son 24h'de yeni event akıyor mu?
8. [ ] Hata oranı: artmış mı? → `/yonetici/ops`
9. [ ] Telegram'a "site ayakta" mesajı gönder

---

**Not:** Bu doküman canlıdır. Her DR eventinden sonra güncellenir.
