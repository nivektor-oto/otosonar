# OtoSonar Chrome Extension

Sahibinden.com ve arabam.com ilan sayfalarına "OtoSonar ile analiz et" butonu ekler.

## Yükleme (geliştirici modu)

1. `chrome://extensions` aç
2. Sağ üstten **Geliştirici modu**'nu aç
3. **Paketlenmemiş uzantı yükle** → bu klasörü seç
4. Herhangi bir sahibinden/arabam ilanını aç
5. Sağ altta yeşil buton belir

## İkonlar

`icon-16.png`, `icon-48.png`, `icon-128.png` dosyalarını `/apps/web/public/` altındaki
`icon-192.png`'yi yeniden boyutlandırarak oluşturabilirsin:

```bash
cd chrome-extension
for s in 16 48 128; do
  magick ../apps/web/public/icon-192.png -resize ${s}x${s} icon-${s}.png
done
```

## Chrome Web Store yayını

Chrome Web Store Developer account + $5 kayıt ücreti gerekir. Launch sonrası 1-2. hafta planlanıyor.

## Geliştirme

`content.js` içindeki `extractListing()` fonksiyonu sahibinden ve arabam'ın DOM yapısına
göre ilan verilerini çeker. Sayfalar güncellendiğinde selector'lar da güncellenmeli.
