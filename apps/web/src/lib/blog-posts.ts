export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  coverEmoji?: string;
  readingMinutes: number;
  bodyMarkdown: string;
  keywords: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ikinci-el-arac-alirken-10-kural",
    title: "İkinci El Araç Alırken Bilmeniz Gereken 10 Kural",
    excerpt:
      "Galeriye gitmeden önce hazırlanmanız gereken 10 madde: bütçe planından km kontrolüne, evrak listesinden test sürüşüne kadar pratik bir alım rehberi.",
    publishedAt: "2026-03-08",
    author: "OtoSonar Ekibi",
    coverEmoji: "🚗",
    readingMinutes: 8,
    keywords: [
      "ikinci el araç",
      "araç alırken dikkat edilecekler",
      "ikinci el araç rehberi",
      "2 el araba alma",
      "otosonar",
    ],
    bodyMarkdown: `İkinci el araç piyasası Türkiye'de hem en canlı hem de en fazla hata yapılan alanların başında geliyor. Bir aracı aldıktan sonra "keşke" demek istemiyorsanız, bu 10 kuralı aklınızda tutmanız işinizi ciddi biçimde kolaylaştırır.

## 1. Toplam maliyeti hesaplayın, sadece etiket fiyatını değil

Araç fiyatı, sahip olma maliyetinin yalnızca bir parçasıdır. Kasko, trafik sigortası, MTV, yakıt tüketimi, periyodik bakım aralıkları ve parça fiyatları toplam bütçenin bir parçasıdır. Özellikle premium segmentte (BMW, Mercedes, Audi) bir küçük bakım 15–25 bin TL'yi kolayca bulabilir.

## 2. Pazar fiyatını önce siz bilin

Pazarlığa girmeden önce o modelin, o yılın, o km aralığındaki gerçek pazar değerini öğrenin. [OtoSonar analiz aracı](/analiz) ile ilan linkini yapıştırıp saniyeler içinde emsal değeri görebilirsiniz. "Satıcı ne istiyor" değil "gerçek değer ne" sorusu ile başlayın.

## 3. Km manipülasyonuna karşı 3 kaynak kuralı

Kilometre bilgisini asla tek kaynaktan doğrulamayın. TRAMER sorgusu, servis geçmişi (yetkili servis kayıtları) ve periyodik muayene kayıtları — bu üçü birbiriyle tutarlı olmalı. Boşluk varsa, aracı almayın.

## 4. Boya kontrolünü profesyonel cihazla yapın

Gözle bakarak boya tespit etmek zordur. Boya kalınlık ölçer cihazları (paint meter) artık 2.000 TL altına iniyor, ya kendiniz alın ya da ekspertize 400–600 TL vererek yaptırın. 120 mikron üstü değerler genelde boyalı paneli işaret eder.

## 5. Şasi numarasını mutlaka eşleştirin

Ruhsattaki şasi numarası ile motor bölmesindeki, kapı çerçevesindeki ve araç gövdesindeki şasi numarasının birebir aynı olması gerekir. Tek bir karakter farkı bile ciddi bir kırmızı bayraktır.

## 6. Test sürüşü en az 20 dakika olmalı

2 dakikalık bir dönüş yeterli değildir. Motoru soğukken çalıştırıp dinleyin, sonra trafik içinde direksiyon titreşimi, fren balata durumu, şanzıman geçişleri ve rölantiyi 20+ dakika test edin. Klima, far, silecek, kapı kilitleri — her şeyi tek tek deneyin.

## 7. Servis geçmişini talep edin

**Servis geçmişi olmayan araç, geçmişi olmayan insana benzer.** Yetkili servis kayıtları, özel servis faturaları veya en azından parça değişim faturaları olmalı. Yoksa fiyatın %10–15 altında almayı hedefleyin, çünkü içine ne girdiğini bilmiyorsunuz.

## 8. Hasar geçmişini TRAMER ile doğrulayın

TRAMER sorgusu (e-Devlet üzerinden) aracın bildirimli kaza geçmişini gösterir. Ağır hasarlı, pert veya çalıntı kaydı çıkan araçtan uzak durun. Düşük tutarlı tampon darbeleri normaldir ancak şasi müdahalesi kesin veto sebebidir.

## 9. Pazarlık sizin için hazırlık ister

Pazarlık duygusal değil, kanıt üzerinden yapılır. Eksikleri liste olarak çıkarın: "sol arka çamurluk boyalı (–10 bin TL), 2 lastik yeni değil (–3 bin TL), bakım kitabı kısmen eksik (–5 bin TL)". Bu yöntemle 40–60 bin TL pazarlık açmak realistiktir.

## 10. Noter işlemini aynı gün bitirin

Parayı ödediğiniz gün satış noterden yapılmalıdır. "Hafta sonu noter kapalı, pazartesi yaparız" demeyin — o arada çıkabilecek olası hukuki sorunlar size yansır. Eğer satıcı bugün notere girmeye direniyorsa, işlemden çekilmeye hazır olun.

## Özet

İkinci el araç alımı bir sabır, araştırma ve kanıt işidir. Duygusal kararlar bu piyasada çok pahalıya patlar. Kendinizi hazırlayın, pazar değerini önceden bilin, fiziksel ve evrak kontrolünü atlamayın.

Hazır hissediyorsanız ücretsiz denemek için [OtoSonar'a kayıt olun](/kayit) ve ilk 3 analizinizi ücretsiz kullanın.`,
  },
  {
    slug: "galericiden-arac-almak-guvenli-mi",
    title: "Galericiden Araç Almak Güvenli mi? Risk-Fayda Analizi",
    excerpt:
      "Galericiden almanın avantajları ve riskleri, sahibinden alım ile karşılaştırması, doğrulanmış galerici nasıl ayırt edilir — pratik bir değerlendirme.",
    publishedAt: "2026-03-12",
    author: "OtoSonar Ekibi",
    coverEmoji: "🏪",
    readingMinutes: 7,
    keywords: [
      "galeriden araç almak",
      "galerici güvenli mi",
      "sahibinden vs galerici",
      "ikinci el galeri",
      "oto galeri",
    ],
    bodyMarkdown: `Türkiye'de ikinci el pazarın yaklaşık yarısı galericiler üzerinden dönüyor. Peki galericiden araç almak güvenli midir, yoksa sahibinden alıp doğrudan satıcıyla görüşmek mi daha akıllıca? Kısa cevap: **ikisi de olabilir, önemli olan karşınızdaki tarafın kim olduğunu bilmek.**

## Galericiden Almanın Avantajları

### Daha geniş stok, tek lokasyonda karşılaştırma
Birkaç saat içinde 15–20 aracı aynı anda görebilirsiniz. Sahibinden ilanlarında 20 ev gezmek günler alır.

### Garanti seçenekleri
Kurumsal galericiler genelde 1–3 ay arası motor-şanzıman garantisi sunar. Sahibinden satışta bu garanti yoktur; "sattım, bitti" kuralı geçerlidir.

### Finansman kolaylığı
Kredi, takas ve peşin + taksit kombinasyonları galericide daha kolay kurulur. Sahibinden satışta banka ile doğrudan siz uğraşırsınız.

### Noter süreci daha hızlı
İşini bilen galerici noter randevusunu, evrakları ve prosedürü aynı gün halleder. Özel satışta bu koordinasyonu sizin yapmanız gerekir.

## Galericiden Almanın Riskleri

### Fiyat marjı doğal olarak daha yüksek
Galerici aldığı aracı 20–60 bin TL kâr koymadan satmaz. Bu doğaldır — işletme, vergi, kira, personel maliyetleri vardır. Ama bunun anlamı şudur: **sahibinden almak her zaman 40–80 bin TL daha avantajlıdır.**

### Aracın geçmişine tam hakim değillerdir
Galericilerin %70'i aracı takas veya başka galericiden almıştır. Önceki sahibini, kullanım alışkanlığını, kaza geçmişini tam bilmez. "Bilmiyorum, geldi geçti" cevabı çok yaygındır.

### "Sıfıra yakın" iddiası gerçeği yansıtmayabilir
"Tertemiz, boyasız, değişensiz" gibi cümleler satış konuşmasıdır. Kontrol edip doğrulamadan asla kabul etmeyin. [OtoSonar ile ilanı yapıştırıp analiz yapmak](/analiz) ilk kontrol adımınız olsun.

### Km oynaması riski her iki tarafta da var
Yaygın yanılgı: "galericide km oynamaz". Gerçek: hem sahibinden hem galericide km oynaması görülür, hatta galericide bazen daha organize yapılır çünkü cihaz erişimi kolaydır.

## Güvenilir Galerici Nasıl Ayırt Edilir?

- **MADOR ve OYDER üyeliği**: Sektör derneklerine üyelik baz güvenilirlik göstergesidir.
- **Google yorumları**: 50+ yorumu olan, ortalama puanı 4.3 üstü galerici genelde güvenlidir.
- **Fiziksel adres**: Ev adresi üzerinden işlem yapan, sabit gallerisi olmayan satıcılardan uzak durun.
- **Vergi levhası**: İstemekten çekinmeyin. Göstermekte tereddüt eden galerici bir sinyal veriyordur.
- **Sözleşme kalitesi**: İyi galerici 2 sayfalık düzgün bir satış sözleşmesi hazırlar; kötü galerici ruhsat devriyle işi bitirmek ister.

## Sahibinden mi Galerici mi? Durum Bazlı Karar

| Durum | Öneri |
|-------|-------|
| Fiyat hassasiyetiniz yüksekse | Sahibinden |
| İlk araç alıyorsunuz, süreci bilmiyorsunuz | Kurumsal galerici |
| Takas yapmanız gerekiyor | Galerici |
| Araçtan iyi anlıyorsanız + sabırlıysanız | Sahibinden |
| Garanti isteniyorsa | Galerici |
| Kredi kullanılacaksa | Galerici (süreç hızlı) |

## Özet

Galericiden araç almak güvenli midir? Doğru galericiden, doğrulanmış evraklarla, bağımsız analizle destekleyerek alıyorsanız evet. "Babam biliyor, kefilim var" tarzı hamasi satış konuşmalarına kanmazsanız galerici aslında hayatınızı kolaylaştırır.

Her iki durumda da aracı bağımsız kontrole tabi tutun. [OtoSonar'a ücretsiz kayıt olun](/kayit), ilanı analiz edin, sonra görüşmeye gidin.`,
  },
  {
    slug: "arac-alirken-hangi-belgeler-istenmeli",
    title: "Araç Alırken Hangi Belgeler İstenmeli? Evrak Kontrol Listesi",
    excerpt:
      "Ruhsat, TRAMER, e-Devlet sorguları, servis kayıtları — ikinci el araç alımında istemeniz gereken tüm evrakların tam listesi ve neyi doğrulamanız gerektiği.",
    publishedAt: "2026-03-18",
    author: "OtoSonar Ekibi",
    coverEmoji: "📄",
    readingMinutes: 7,
    keywords: [
      "araç evrak kontrol",
      "ikinci el araç belgeler",
      "TRAMER sorgu",
      "araç alırken istenmesi gereken evraklar",
      "ruhsat kontrolü",
    ],
    bodyMarkdown: `İkinci el araç alımında fiziksel kontroller kadar evrak kontrolü de önemlidir — hatta bazı durumlarda daha önemlidir. Boyalı bir panel 8 bin TL, ama üstünde rehin olan bir araç sizi aylarca avukat masrafına sokabilir. İşte eksiksiz evrak kontrol listesi.

## 1. Araç Ruhsatı (Tescil Belgesi)

Zorunlu. Bakılacak noktalar:

- **Sahip adı** satıcıyla birebir aynı mı?
- **Şasi numarası** araç üzerindeki numarayla aynı mı?
- **Motor numarası** eşleşiyor mu?
- **Son tescil tarihi** — araç kaç kez el değiştirmiş?
- **Plaka tarihi** — aracın tescil ili ile satıcının şehri aynı mı? Değilse neden?

Ruhsatsız araç satılmaz. "Fotokopisi var, aslı noterde" bahanesi oyalamacadır.

## 2. Kimlik ve Vekaletname (gerekiyorsa)

Satıcı ruhsat sahibi değilse vekaletname şarttır. Vekaletnamenin:

- Noter onaylı olduğunu
- Satış yetkisi verdiğini (sadece "kullanma" değil)
- Süresinin dolmadığını doğrulayın.

Kimlik T.C. kimlik kartı ile karşılaştırılmalı.

## 3. TRAMER Hasar Raporu

e-Devlet üzerinden "Sigorta Hasar Sorgulama" ile çekilir. Kontrol:

- Pert kaydı var mı? (**Pert çıkarsa kesin veto**)
- Ağır hasar kaydı kaç kez?
- Toplam hasar bedeli aracın piyasa değerinin %30'unu aşıyor mu?
- Son 2 yıl içinde yeni hasar var mı?

Küçük bir tampon darbesi (3–5 bin TL) normaldir. 30 bin TL üstü kayıtlar detaylı incelenmeli.

## 4. Trafik Cezası ve MTV Borç Sorgusu

e-Devlet "Motorlu Taşıtlar Vergi Borcu Sorgulama" ve "Trafik Cezası Sorgulama" üzerinden. Ödenmemiş MTV araç üstünde kalır — satın alsanız da borç size geçer. Noter zaten çoğu durumda ödenmeden devir yapmaz ama siz önceden kontrol edin.

## 5. Rehin / Haciz Sorgusu

e-Devlet "Araç Rehin Sorgulama" ile. Banka rehni, SGK haczi, icra haczi olan araç satılamaz. Görünse bile noter devir yapmayacaktır. Önceden öğrenip zaman kaybetmeyin.

## 6. Periyodik Muayene Raporu

Araç muayeneden geçti mi, ne zaman, sonucu nedir? **"Hafif kusurlu" ifadesi aracın bazı eksikleri olduğunu gösterir.** Son muayene raporunu TÜVTÜRK üzerinden doğrulayın.

## 7. Servis Kayıtları

Yetkili servis geçmişi olan araçlar %5–10 daha değerlidir. Servis defteri fiziksel olmasa bile servisin kayıt sistemine şasi numarasıyla sorulabilir. BMW için BMW Türkiye, Mercedes için Mercedes-Benz Türkiye bayilerinden yardım alınabilir.

## 8. Kasko Eksper Raporu (varsa)

Bazı araçlarda satıcı elinde güncel kasko eksper raporu vardır. Bu altın değerinde bir belgedir — aracın o tarihteki durumu fotoğraflı olarak kayıtlıdır.

## 9. Lastik ve Fren Faturası (varsa)

4 lastik değişimi 20–30 bin TL tutar. Son 1 yılda değişmiş lastik faturası pazarlıkta sizin lehinizedir (değişmesi gerekmez).

## 10. Önceki Satın Alma Sözleşmesi veya Faturası

Kurumsal alımlarda satıcının aracı nereden ve kaça aldığı faturasını görmek güven artırır. Özellikle galerici iseniz bu rutin bir istektir.

## Pratik Kontrol Listesi (Görüşmeye Giderken)

- Telefonunuzda [OtoSonar analizi](/analiz) hazır olsun
- e-Devlet mobil uygulamasında TRAMER ve rehin sorgusu yapılmış olsun
- Boya kalınlık ölçer (veya ekspertiz randevusu) hazır olsun
- Ruhsat ve kimlik fotoğrafı kontrol edilmiş olsun

## Özet

Evrak kontrolü bir saatlik iştir ama sizi yıllarca sürecek hukuki sorunlardan korur. "Tanıdık satıyor, evrak ne gerek var" demeyin — arkadaşınız bile olsa belge belgedir.

Tüm bu süreci daha hızlı yapmak için [OtoSonar'a kayıt olup](/kayit) analiz aracını deneyebilirsiniz.`,
  },
  {
    slug: "boya-degisen-arac-deger-kaybi",
    title: "Boya-Değişen Araç Değer Kaybı: 1, 2, 3+ Parça Karşılaştırma",
    excerpt:
      "Boyalı veya değişen parçası olan aracın piyasa değeri ne kadar düşer? 1, 2, 3+ parça senaryolarının karşılaştırmalı analizi ve pazarlık rehberi.",
    publishedAt: "2026-03-25",
    author: "OtoSonar Ekibi",
    coverEmoji: "🎨",
    readingMinutes: 6,
    keywords: [
      "boyalı araç değer kaybı",
      "değişen parça değer kaybı",
      "boya değişen araç fiyatı",
      "oto ekspertiz",
      "araç boya analizi",
    ],
    bodyMarkdown: `Bir aracın boyalı veya değişen parçası olması doğrudan piyasa değerini etkiler. Ama *ne kadar* etkiler? "Hafif boyalı" ile "tüm paneller değişen" arasında büyük fark var. İşte Türkiye 2026 pazarında gerçek rakamlar.

## Önce Tanımları Netleştirelim

**Boyalı:** Orjinal fabrika boyası dışında bir boya uygulanmış panel.

**Lokal boya:** Panelin sadece bir bölümünün boyanması (10–20 cm alan).

**Değişen:** Panelin komple sökülüp yenisiyle değiştirilmesi.

**Çekmiş:** Sac panelde darbe sonrası düzeltme işlemi (macun atılmış).

Hepsi aynı şey değildir. Çekmiş > Lokal boya > Tam boya > Değişen sırasıyla daha az riskten daha fazla riske giderler.

## Değer Kaybı Aralıkları (2026 Pazar Gözlemleri)

### Tamamen orjinal (sıfır boya, sıfır değişen)
Referans değerdir — piyasa değerinin tam karşılığı. Nadir bulunan bir durumdur, özellikle 5+ yaş üstü araçlarda.

### 1 panel boyalı (tampon hariç)
**Ortalama %2–4 değer kaybı.** Tampon boyası Türkiye'de normal kabul edilir, hatta beklenir. Ama çamurluk, kapı veya bagaj kapağı gibi bir panel boyalıysa %2–4 aralığında düşüş makul.

### 2 panel boyalı
**Ortalama %5–8 değer kaybı.** Burada "aynı tarafta mı?" sorusu önemli. Her ikisi de sol tarafta ise bir çarpma hikayesi var demektir — değer kaybı %8'e yakın. Farklı taraflarda ise %5 civarı.

### 3+ panel boyalı
**Ortalama %10–15 değer kaybı.** Artık aracın kaza geçmişi olma ihtimali çok yüksektir. TRAMER kayıtlarıyla mutlaka eşleştirin.

### 1 panel değişen (tampon dışı)
**Ortalama %8–12 değer kaybı.** Değişen panel, sac kesip kaynak yapıldığı için şasi bütünlüğünü potansiyel olarak etkiler. Fiyat açısından ciddi düşüşe sebep olur.

### 2+ panel değişen
**Ortalama %15–25 değer kaybı.** Bu noktada araç "kazalı" kategorisindedir. Kasko primleri yükselir, pert veya ağır hasar kaydı olma ihtimali yüksektir.

### Şasi müdahalesi (çekilmiş şasi)
**%25–40 değer kaybı, bazen satılamaz bile.** Şasi düzeltme işlemi olmuş araç yeniden satışta ciddi sorun yaşar. Uzak durulmalı.

## Pazarlıkta Nasıl Kullanılır?

Boya kalınlık ölçer cihazla veya ekspertiz raporuyla belgelenen boya durumu pazarlıkta sizin en güçlü kozunuzdur. Örnek:

> "İlanda 'tertemiz boyasız' yazıyor. Ama ekspertiz 2 panelde boya tespit etti, 1 panelde macun izi var. Piyasa değerinden %7 düşüş bekliyorum — yaklaşık 65 bin TL. Teklifim 1.180.000 TL."

Somut sayılarla yapılan pazarlık duygusal pazarlığa göre 3 kat daha başarılıdır.

## Neden "Tampon Boyası Normal" Deniyor?

Ön ve arka tamponlar plastik malzemeden üretildiği için kolayca çizilir. Türkiye'de park yapma kültürü nedeniyle tamponların %70'i ömrünün bir aşamasında boyanır. Bu yüzden tampon boyası pazarda değer kaybı olarak görülmez. Ancak tampon *değişmişse* durum farklıdır — hafif bir kaza göstergesidir.

## Hızlı Karar Tablosu

| Durum | Satın Al? |
|-------|-----------|
| Sadece tampon boyalı | Evet, pazarlık yapmaya gerek yok |
| 1 panel + tampon boyalı | Evet, %2–3 pazarlık yap |
| 2 panel boyalı | Şartlı evet, %5–7 pazarlık yap |
| 3+ panel boyalı | TRAMER'i kontrol et, şüphelen |
| 1 değişen parça | Detaylı ekspertiz sonrası karar ver |
| 2+ değişen | Genellikle hayır |
| Şasi müdahalesi | Kesinlikle hayır |

## Özet

Boya-değişen durumu aracı almaman gerektiği anlamına gelmez — **doğru fiyata almaman gerektiği** anlamına gelir. [OtoSonar'ın fotoğraftan boya analiz özelliği](/analiz) ile ilanın fotoğraflarına bakarak bile ön bir değerlendirme yapabilirsiniz. Kesin sonuç için hâlâ fiziksel ölçüm şart.

Hemen denemek isterseniz [ücretsiz hesap açın](/kayit).`,
  },
  {
    slug: "km-oynamis-araci-5-saniyede-anla",
    title: "Km Oynamış Aracı 5 Saniyede Nasıl Anlarsın?",
    excerpt:
      "Kilometre manipülasyonunu evrak ve fiziksel ipuçlarıyla ayırt etme rehberi: servis kayıtları, debriyaj-pedal aşınması, TRAMER'de 'km' kontrolü ve daha fazlası.",
    publishedAt: "2026-04-02",
    author: "OtoSonar Ekibi",
    coverEmoji: "⏱️",
    readingMinutes: 6,
    keywords: [
      "km oynamış araç",
      "kilometre manipülasyonu",
      "araç km kontrolü",
      "km düşürülmüş araç",
      "ikinci el araç km",
    ],
    bodyMarkdown: `Türkiye'de ikinci el araç piyasasının en yaygın sahtekârlıklarından biri kilometre oynamasıdır. Tahminen piyasadaki araçların %15–20'sinde bir şekilde km müdahalesi vardır. İyi haber: çoğu manipülasyon 5 saniyede yakalanabilir. İşte nasıl.

## 1. Km ve Model Yılı Eşleşmesi

Türkiye'de ortalama yıllık kullanım 15.000–25.000 km arasıdır. Hızlı kontrol:

- 2018 model bir araç 2026'da 80.000 km ise: **şüpheli**. (8 yıl × ortalama 20.000 = 160.000 km beklenir)
- 2020 model bir araç 2026'da 60.000 km ise: makul ama ticari araçta değil, özel kullanımda.
- 2022 model bir araç 2026'da 200.000 km ise: **çok şüpheli**, ticari kullanım belirgin.

Sayılar tutmuyorsa detaylı kontrol yap.

## 2. TRAMER ve Muayene Kayıtlarındaki Km Tarihçesi

Her yıllık muayenede km kaydedilir. Ayrıca TRAMER hasar bildirimlerinde de km yazar. Bu kayıtları sırala:

- 2021 muayene: 85.000 km
- 2022 muayene: 110.000 km
- 2023 hasar bildirimi: 145.000 km
- Şu anki km: 98.000 km ❌

Bu senaryoda 2023'te araç 145.000 km iken, 2026'da 98.000 km gösteriyorsa km kesinlikle düşürülmüş.

## 3. Servis Geçmişi Km Değerleri

Yetkili servis sisteminde her bakımda km kaydedilir. BMW, Mercedes, Audi gibi premium markalarda bu kayıtlar merkezi olarak tutulur, şasi numarasıyla sorgulanabilir. Km geri gitmişse kayıtlardan anlaşılır.

## 4. Fiziksel İpuçları

### Debriyaj pedalı
Manuel araçlarda 150.000 km üstü pedaldaki kauçuk kaplama yıpranmış olur. Eğer aracın km'si 80.000 görünüyor ama pedalın lastiği eski-parlak-cilalanmış görünüyorsa, şüphelen.

### Direksiyon simidi
Dir parlaklığı ve aşınma noktaları km'yi ele verir. 100.000 km altındaki araçta dir simidinde aşınma az olmalıdır.

### Vites topuzu
Özellikle deri topuzlarda aşınma ve eskime km ile paralel gider. 50.000 km'de vites topuzunun dikişleri açılmış olmamalı.

### Şoför koltuğu yan bolsteri
Araca inip-binerken şoför koltuğunun yan kısmı yıpranır. 100.000 km'de hafif izler normal, ciddi yıpranma şüphelidir.

### Pedal kauçukları
Fren ve gaz pedalı kauçukları km ile doğrudan ilişkilidir. Yenilenmiş pedal kauçuğu genelde km oynamasının habercisidir.

## 5. OBD ile Kontrol

Bazı araçlarda km verisi sadece kilometre panelinde değil, ECU (motor kontrol ünitesi) ve şanzıman bilgisayarında da kaydedilir. Gelişmiş OBD cihazlarıyla bu kayıtlar karşılaştırılabilir. Panelde 80.000 km ama ECU'da 165.000 km yazıyorsa durum nettir.

Bir mobil tamirci veya ekspertiz servisi bu kontrolü 150–300 TL'ye yapar.

## 6. İlan Metni Uyarı Sinyalleri

[OtoSonar'ın ilan analiz motoru](/analiz), ilan açıklamasında km manipülasyon ihtimalini artıran ifadeleri yakalar:

- "Km azdır" (nesnel değildir, şüphe verici)
- "Profesyonel kullanım" (genelde yüksek km saklama çabası)
- "Günlük kısa mesafe" (plakanın şehirle uyumunu kontrol et)
- "Her şey orjinal" ama servis geçmişi yok (çelişkili)
- Km değeri çok yuvarlak (100.000, 150.000, 200.000)

## 7. "Kitabı Hem Araba Hem Fatura" Teknigi

Yetkili servisi olan araçlarda **dijital servis defteri** de vardır. Sahibinden satıcılar genelde bu kaydı bilmez. "Servis defteri yok ama bakımlarını yaptırdım" diyen satıcıya, "markanın çağrı merkezini arayıp şasi numarasından kayıt çektirebilir miyiz?" sorusuyla blöf yapabilirsiniz. Gerçekten bakımsız araca sahip olanlar genelde geri çekilir.

## Özet

Kilometre oynamış araç kazası olan araçtan daha risklidir — çünkü aracın mekanik aşınma seviyesini tahmin edemezsiniz. Ağır yıpranmış bir motoru "az kullanılmış" zannederek satın almak yıllık 80–120 bin TL ek bakım maliyeti demektir.

İlanın km tutarlılığını 30 saniyede otomatik analiz etmek için [OtoSonar'a ücretsiz kayıt olun](/kayit) ve "Km Sinyali" skorunu görün.`,
  },
  {
    slug: "dizel-benzin-hibrit-2026-rehberi",
    title: "Dizel mi Benzin mi Hibrit mi? 2026 Türkiye Pazarı İçin Karar Rehberi",
    excerpt:
      "2026 Türkiye koşullarında dizel, benzin ve hibrit araçların toplam sahip olma maliyeti, kullanım alanı ve gelecek değer tahminleri — doğru yakıt tipini seçme rehberi.",
    publishedAt: "2026-04-09",
    author: "OtoSonar Ekibi",
    coverEmoji: "⛽",
    readingMinutes: 8,
    keywords: [
      "dizel mi benzin mi",
      "hibrit araç",
      "yakıt tipi karşılaştırma",
      "2026 araç alım",
      "hangi yakıt türü",
    ],
    bodyMarkdown: `"Dizel mi, benzin mi, hibrit mi?" sorusu 2026 Türkiye'sinde eskisine göre çok daha karmaşık bir hale geldi. ÖTV değişiklikleri, yakıt fiyatlarındaki oynaklık ve ikinci el pazarındaki yeni trendler her seçeneği farklı şekilde etkiliyor. İşte sizin kullanım profilinize en uygun kararı vermeniz için bir rehber.

## Dizel: Kimlerin Seçmesi Mantıklı?

Dizel araçlar 2026'da hâlâ canlılığını koruyor ama konumu değişti. Eskiden "orta segmentin kralı" olan dizel, şimdi daha spesifik bir kitleye hitap ediyor.

### Avantajları
- **Yakıt verimliliği:** Şehir dışı ve otoyolda benzine göre %20–30 daha az yakıt tüketir.
- **Yüksek tork:** Yüklü araç (aile SUV'u, karavan, ticari kullanım) için ideal.
- **Uzun motor ömrü:** Doğru bakımda 400–500 bin km'ye kadar problemsiz çalışır.
- **İkinci el değer tutuculuğu:** Özellikle SUV segmentinde hâlâ güçlü.

### Dezavantajları
- **Şehir içi kısa sürüşte DPF (partikül filtre) sorunu:** 10–15 km altı sürüşler dizelin en büyük düşmanıdır. DPF tıkanması 15–40 bin TL maliyet.
- **Adblue maliyeti:** Modern Euro 6 dizellerde Adblue tüketimi vardır.
- **ÖTV ve MTV:** 1.6 altı dizellerde makul, 2.0+ dizellerde ciddi yüksek.
- **Şehir trafiği geleceği:** Avrupa'daki düşük emisyon bölge eğilimi Türkiye'ye de gelebilir.

### Dizel kim için uygun?
- Yıllık 30.000+ km yapıyorsanız
- Şehirlerarası yolculuk ağırlıklı kullanıyorsanız
- SUV veya karavan kullanacaksanız

## Benzin: Ortalamanın Çözümü

Benzinli araçlar 2026'da hem uygun fiyatlı ikinci el seçenek olarak hem de düşük km kullanım profilinde anlamlı.

### Avantajları
- **Düşük giriş fiyatı:** Aynı modelin benzin versiyonu dizele göre 80–150 bin TL ucuzdur.
- **Kısa sürüş dostu:** Şehir içi günlük kullanımda sorun çıkarmaz.
- **Basit bakım:** DPF, Adblue, yüksek basınç pompası gibi karmaşık parçalar yok.
- **Sessiz ve titreşimsiz:** Sürüş konforu daha yüksek.

### Dezavantajları
- **Yüksek yakıt tüketimi:** Şehir içi 8–12 L, otoyol 6–8 L aralığı.
- **Turbo benzinli motorlarda zincir problemi:** 1.0 ve 1.4 TSI grubu motorlarında 100 bin km sonrası zincir sesi yaygın.
- **Rezidual değer benzinle dizelden düşük:** Aynı yaş/km'de benzin araç dizelden %5–8 daha ucuza satılır.

### Benzin kim için uygun?
- Yıllık 15.000 km altı kullananlar için
- Şehir içi kısa mesafe yolculuk için
- İlk araç alanlar ve teknik bilgisi sınırlı olanlar için

## Hibrit: 2026'nın Yükselen Yıldızı

Hibrit araçlar Türkiye'de 2023 sonrasında ÖTV avantajı kalktıktan sonra bile popülerliğini koruyor. Toyota, Honda ve Hyundai bu alanda agresif ilerliyor.

### Avantajları
- **Şehir içi yakıt tüketimi:** 4–6 L seviyesine iner. Benzinden %40 tasarruf.
- **Motor aşınması düşük:** Elektrik motoru kalkışlarda devreye girdiği için içten yanmalı motor daha az çalışır.
- **Sessiz kalkış, konforlu sürüş.**
- **Vergi avantajı:** Bazı hibrit kategorilerinde hâlâ ÖTV indirimi var.

### Dezavantajları
- **Giriş fiyatı yüksek:** Benzin versiyonuna göre 250–450 bin TL pahalı.
- **Batarya ömrü belirsizliği:** 10 yıl / 150.000 km sonrası batarya değişim maliyeti 80–200 bin TL.
- **Servis ağı sınırlı:** Her ilde yetkili servis yok, küçük şehirlerde sorun.
- **İkinci el piyasası yeni:** Değer tutuculuğu henüz net değil.

### Hibrit kim için uygun?
- Şehir içi yoğun kullanım (günlük 40+ km) yapanlar
- Yıllık 20.000–30.000 km aralığında sürücüler
- Düşük yakıt ve emisyon değerlerini öncelikleyenler
- Büyük şehirde (İstanbul, Ankara, İzmir) yaşayanlar

## Toplam Maliyet (5 Yıl) Kabaca Karşılaştırması

Aynı segmentteki orta sınıf bir sedan için 5 yıllık toplam maliyet tahmini (satın alma fiyatı dahil):

| Tip | Giriş | Yakıt | Bakım | Değer Kaybı | Toplam |
|-----|-------|-------|-------|-------------|--------|
| Benzin 1.4 | 1.200K | 180K | 60K | 350K | 1.790K |
| Dizel 1.6 | 1.380K | 130K | 90K | 380K | 1.980K |
| Hibrit 1.8 | 1.500K | 110K | 70K | 420K | 2.100K |

*Bu tablo OtoSonar modelinin 2026 tahminidir; araç modeli, kullanım profili ve pazar dalgalanmalarına göre değişir.*

## Hızlı Karar Akışı

1. **Yıllık km <15.000 mü?** → Benzin seç
2. **Yıllık km 15.000–30.000, ağırlıklı şehir içi mi?** → Hibrit seç
3. **Yıllık km 30.000+, şehirlerarası mı?** → Dizel seç
4. **Ticari kullanım veya SUV mu istiyorsun?** → Dizel seç
5. **Çevre ve konfor öncelikli mi?** → Hibrit seç

## Özet

2026'da "tek doğru seçenek" yok. Kullanım profilinize uyan aracı seçin, sonra o kategoride [OtoSonar ile](/analiz) emsal değer analizi yapın. Yanlış yakıt seçimi 5 yılda 200–300 bin TL farka mal olabilir.

Hemen karar vermek için ilanınızı yapıştırın, yakıt tipine göre gerçek toplam maliyeti saniyeler içinde görün. [Ücretsiz kayıt olun](/kayit).`,
  },
];

export function getPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
