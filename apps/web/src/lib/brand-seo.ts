export type BrandInfo = {
  slug: string;
  displayName: string;
  tagline: string;
  overview: string;
  commonModels: string;
  knownIssues: string;
  buyingWindow: string;
};

export type ModelInfo = {
  brandSlug: string;
  modelSlug: string;
  displayName: string;
  brandDisplayName: string;
  summary: string;
  commonIssues: string;
  bestYears: string;
  typicalKm: string;
  matchQuery: string;
};

export const BRANDS: BrandInfo[] = [
  {
    slug: "bmw",
    displayName: "BMW",
    tagline: "Sürücü odaklı Alman premium sedan ve SUV serisi",
    overview:
      "BMW Türkiye pazarında premium segmentin en çok tercih edilen markalarından biridir. Özellikle 3 Serisi ve 5 Serisi sedanlar ticari kullanıma müsait konfor ve sürüş dengesi sunar. Türkiye'de ikinci el BMW ikili bir profile sahiptir: düzgün servis geçmişi olan örnekler piyasa değerinin üstünde satılırken, bakımsız veya km oynamış örnekler tavan yaparak fiyat kırılımına yol açar.",
    commonModels:
      "En çok karşılaşılan modeller: 3.20i, 5.20i, 5.20d, 320d, 520d, X1, X3, X5. Dizel seçenekleri şehirlerarası kullanıcıları, benzinli otomatik seçenekleri şehir içi konfor öncelikli sürücüleri hedefler. SUV tarafında X3 premium orta segmentin Türkiye'deki en güçlü oyuncularından biridir.",
    knownIssues:
      "N47 dizel motorlarda zincir problemi (2008–2012), B47 motorlarda EGR sorunları, N20 benzinli motorda zincir germe ünitesi arızası en sık bildirilen konulardır. ZF otomatik şanzımanın 80–100 bin km aralığında yağ değişimi ihmal edildiğinde kickdown sorunları, DSC sensör arızaları ve yüksek basınç pompası tıkanmaları da dikkat edilmesi gereken noktalardır.",
    buyingWindow:
      "BMW alımında ideal pencere 3–5 yaş, 80–120 bin km arasıdır. Bu aralıkta ilk kredi dönemi bitmiş, ÖTV avantajı kaybolmuş araçlar pazar değerinin altında fiyatlanır. 7 yaş ve üstü örneklerde mutlaka yetkili servis geçmişi ve periyodik bakım kayıtları talep edilmeli.",
  },
  {
    slug: "mercedes-benz",
    displayName: "Mercedes-Benz",
    tagline: "Konfor ve prestij odaklı Alman premium markası",
    overview:
      "Mercedes-Benz Türkiye'de prestij segmentinin en güçlü markasıdır. C-Serisi ve E-Serisi sedanlar hem bireysel kullanıcılar hem de üst düzey kurumsal kullanım için tercih edilir. Mercedes ikinci el pazarı nispeten istikrarlıdır — değer tutuculuğu BMW ve Audi'ye göre daha yüksektir, özellikle E-Serisi 7+ yaş örneklerde pazar değeri nispeten sabit kalır.",
    commonModels:
      "Türkiye'de en çok rastlanan modeller: C180, C200, E200, E220d, GLA, GLC, A180, A200. E-Serisi dizel varyantlar özellikle sürüş konforu ve yakıt verimliliği açısından öne çıkar. Kompakt segmentte A-Serisi genç kullanıcılar için giriş noktasıdır.",
    knownIssues:
      "OM651 dizel motorlarda yüksek basınç pompası arızaları, 2011–2016 arası 7G-Tronic şanzımanda tutuş sorunları, hava yastığı kontrol modülü arızaları ve Airmatic süspansiyon (üst modellerde) pahalı bakım gerektiren başlıca konulardır. A-Serisi ve GLA'da DCT şanzımanın agresif sürüşte ömrü kısalır.",
    buyingWindow:
      "Mercedes ikinci el alımında 4–6 yaş aralığı en dengelidir. E220d gibi orta segmentte 100 bin km üstü bakımsız araçlardan uzak durulmalı; C-Serisi'nde AMG paketli versiyonlar %15 daha fazla değer tutar. Servis geçmişinin yetkili bayide olması kritiktir.",
  },
  {
    slug: "audi",
    displayName: "Audi",
    tagline: "Teknoloji ve tasarım öncelikli Alman premium markası",
    overview:
      "Audi Türkiye'de teknoloji ve iç mekan kalitesiyle öne çıkar. A3, A4 ve A6 segmenti düzenli alıcı kitlesine sahipken, SUV tarafında Q3 ve Q5 aileler için güçlü seçeneklerdir. Audi'nin ikinci el pazarında karakteristik özelliği, quattro 4×4 sistemli örneklerin %10–15 daha pahalı olmasıdır.",
    commonModels:
      "En yaygın modeller: A3 Sportback, A4 1.4 TFSI / 2.0 TDI, A6 2.0 TDI, Q3, Q5. A3 bireysel kullanıcıların giriş seviyesi tercihi, A6 ise üst düzey kurumsal kullanımda belirleyici konumdadır.",
    knownIssues:
      "EA888 2.0 TFSI motorlarında yağ tüketimi (özellikle 2010–2014), DSG şanzımanda 7-speed wet clutch ünitesi arızaları, timing zinciri germe ünitesi problemleri ve quattro sistem aktarım kaplinlerinde aşınma öne çıkan noktalardır. Elektronik sistem arızaları (MMI, park sensörleri) da ikinci el bakımda bütçeye eklenmelidir.",
    buyingWindow:
      "Audi alımında 3–5 yaş aralığı en verimli penceredir. 2018+ modeller yeni nesil yazılım ve emisyon kontrol sistemleriyle daha az sorunludur. Özellikle A4 2.0 TDI ve Q5 2.0 TDI örneklerde SmartIQ 2026 verisine göre amortisman eğrisi bu aralıkta en düşüktür.",
  },
  {
    slug: "volkswagen",
    displayName: "Volkswagen",
    tagline: "Alman mühendislik kalitesini orta segmente taşıyan halk markası",
    overview:
      "Volkswagen Türkiye'de orta segmentin en köklü markalarından biridir. Passat, Polo, Golf ve Tiguan yıllardır istikrarlı alıcı tabanına sahiptir. Passat özellikle kurumsal kullanımda ve aile aracı olarak en çok tercih edilen sedanlardan biridir — ikinci el pazarında değer tutuculuğu yüksektir.",
    commonModels:
      "En yaygın modeller: Passat 1.6 TDI / 2.0 TDI, Polo 1.0 TSI / 1.4 TDI, Golf 1.4 TSI / 1.6 TDI, Tiguan 1.4 TSI / 2.0 TDI, T-Roc. Passat dizel varyantlar otoyol kullanımında, Polo ise şehir içi kullanımda değer görür.",
    knownIssues:
      "1.4 TSI motorlarda zincir sorunu (özellikle 2008–2014 bloklarında), DQ200 kuru kavramalı DSG şanzımanda 70–100 bin km aralığında kavrama arızaları, 2.0 TDI CR motorlarda EGR ve DPF tıkanmaları bilinen problemlerdir. Passat'ta ikinci el alımda servis geçmişi ve zincir değişim kaydı kritik doğrulanması gereken unsurlardır.",
    buyingWindow:
      "Volkswagen ikinci el alımında en ideal pencere 4–6 yaş, 90–140 bin km aralığıdır. Dizel varyantlar uzun ömürlüdür ancak 160 bin km sonrası turbo yenileme, enjektör bakımı gibi operasyonlar maliyet çıkarabilir. Polo ve Golf kısa sürüş profiline sahip şehir kullanıcıları için düşük km örnekler tercih edilmelidir.",
  },
  {
    slug: "toyota",
    displayName: "Toyota",
    tagline: "Japon güvenilirliğinin Türkiye'deki en güçlü temsilcisi",
    overview:
      "Toyota güvenilirlik bakımından Türkiye ikinci el pazarının lideridir. Corolla, Yaris, RAV4 ve C-HR modelleri özellikle hibrit varyantlarıyla son yıllarda pazarın en çok aranan araçları arasına girdi. Toyota'nın karakteristik avantajı, yıllar ve km ilerledikçe bakım maliyetinin Alman markalara göre belirgin şekilde düşük kalmasıdır.",
    commonModels:
      "En çok rastlanan modeller: Corolla 1.6, Corolla Hybrid, Yaris, C-HR Hybrid, RAV4 Hybrid. Corolla Hybrid son yıllarda Türkiye'nin en çok satan otomobil modellerinden biri olup ikinci el fiyat istikrarı yüksektir.",
    knownIssues:
      "Toyota'nın bilinen sorunları nispeten azdır. 1.4 D-4D dizelde DPF tıkanmaları ana konudur. Hibrit varyantlarda bataryanın 8–10 yıl veya 200 bin km sonrası performans düşüşü bir faktördür ancak genellikle garantinin kapsadığı bir noktaya kadar sorunsuzdur. Debriyaj bakımı eski manuel Corolla'larda klasik bir bakım kalemidir.",
    buyingWindow:
      "Toyota ikinci el alımında Alman markalara göre daha geniş bir yaş aralığı uygundur. 5–8 yaş ve 100–160 bin km aralığı bile verimli kullanım sağlar. Hibrit varyantlarda ilk batarya garanti süresi dolmamış örneklere öncelik vermek mantıklıdır.",
  },
  {
    slug: "honda",
    displayName: "Honda",
    tagline: "Motor mühendisliğiyle öne çıkan dayanıklı Japon markası",
    overview:
      "Honda Türkiye'de Toyota'ya göre daha dar bir alıcı tabanına sahip olsa da Civic ve CR-V modelleri ikinci el pazarında güçlü konumunu korur. Honda motorlarının uzun ömürlü olması ve nispeten basit mekanik yapısı, 200.000+ km aracı güvenle kullanabilmeyi mümkün kılar.",
    commonModels:
      "En çok rastlanan modeller: Civic Sedan 1.6 i-DTEC / 1.5 VTEC Turbo, CR-V 1.6 i-DTEC, City 1.5, HR-V. Civic dizel varyant, otoyol kullanıcısı profilinin en güvendiği modellerden biridir.",
    knownIssues:
      "1.6 i-DTEC dizelde zamanla hassaslaşan EGR valfı, CVT şanzımanın (benzinli versiyonlarda) yağ değişimi ihmalinde kısalan ömrü ve i-VTEC motorlarda üst tarafta ufak sekizlemelerin zamanında giderilmemesi bakım maliyeti çıkarabilir. Civic 1.5 VTEC Turbo motorda yakıt-yağ karışımı sorunu bazı piyasada gözlenmiştir.",
    buyingWindow:
      "Honda için 4–7 yaş ve 100–150 bin km aralığı en dengeli alım penceresidir. 10. nesil Civic (2016+) iç kalite ve elektronik altyapı bakımından önceki nesillerden belirgin şekilde öndedir.",
  },
  {
    slug: "renault",
    displayName: "Renault",
    tagline: "Türkiye'de köklü yerel üretim ve servis ağı",
    overview:
      "Renault Türkiye'de hem yerel üretimi hem de en geniş yetkili servis ağıyla bireysel alıcının güvendiği markalardan biridir. Megane, Clio, Captur ve Symbol (artık üretimi sonlanan) modelleri ikinci el pazarının en hareketli bölümünü oluşturur. Servis ve parça maliyetinin düşüklüğü Renault'u özellikle genç ve ilk araç sahipleri için çekici kılar.",
    commonModels:
      "En yaygın modeller: Megane IV 1.5 dCi / 1.2 TCe, Clio IV–V 1.5 dCi / 0.9 TCe, Captur 1.5 dCi, Kadjar 1.5 dCi. Megane dizel varyant yıllardır en çok satan orta segment modellerden biridir.",
    knownIssues:
      "1.5 dCi dizel motorlarında zamanla ortaya çıkan enjektör arızaları, EDC çift kavramalı şanzımanda (7-speed DC4) mekanik yorulma, EGR valfi ve DPF tıkanmaları bilinen konulardır. 0.9 TCe benzinli turbolu motorlarda yağ tüketimi bazı örneklerde yüksektir.",
    buyingWindow:
      "Renault ikinci el alımında 3–5 yaş ve 80–130 bin km aralığı en verimli noktadır. Megane IV'te model-içi versiyon farkları fiyata %20'ye varan etki yapar — donanım paketi (Icon, Touch) doğrulanmalı, orijinal aksesuarlar listesi mutlaka kontrol edilmelidir.",
  },
  {
    slug: "fiat",
    displayName: "Fiat",
    tagline: "Ekonomik ve pratik şehir aracı segmentinin lideri",
    overview:
      "Fiat Türkiye'de uzun yıllardır halkın markası olarak konumlanır. Egea, Linea, Doblò ve 500 ikinci el pazarının en hareketli modelleri arasındadır. Egea özellikle ilk araç alıcıları, şirket filoları ve taksi pazarında baskın bir tercih olup ikinci el likiditesi yüksektir.",
    commonModels:
      "En yaygın modeller: Egea Sedan 1.3 MultiJet / 1.4 Fire / 1.6 E-Torq, Linea 1.3 MultiJet, Doblò 1.3 / 1.6 MultiJet, Fiorino, 500 1.2. Egea hem bireysel hem ticari kullanım için orta segmentin önemli modelidir.",
    knownIssues:
      "1.3 MultiJet dizel motorda turbo arızaları 150 bin km sonrası, 1.6 E-Torq benzinli motorda termostat ve triger sorunları, Doblò ailesinde debriyaj ömrünün kısa olması bilinen konulardır. Eski Fiat modellerinde elektrik sistemi arızaları (özellikle pencere ve klima) yaygın bir servis maliyeti kalemidir.",
    buyingWindow:
      "Fiat'ta 3–5 yaş ve 60–100 bin km aralığı düşük bakım maliyetiyle alım için en mantıklı penceredir. Egea 1.6 MultiJet taksi kullanımı ağırlıklı olduğundan 150 bin km üstü örneklerde km doğrulaması özellikle önemlidir.",
  },
];

export const MODELS: ModelInfo[] = [
  {
    brandSlug: "bmw",
    modelSlug: "3-20",
    displayName: "3.20",
    brandDisplayName: "BMW",
    summary:
      "BMW 3.20 (320i/320d) Türkiye'de premium orta segment sedanın en güçlü temsilcisidir. F30 (2012–2019) ve G20 (2019+) nesilleri ikinci el pazarında belirgin şekilde farklılaşır: G20 nesli önemli teknoloji sıçraması getirir.",
    commonIssues:
      "F30 320d'de zincir germe ünitesi arızası (özellikle 2012–2015 arası N47 motor), ZF 8HP şanzımanda yağ değişimi ihmal edilmişse kickdown problemi, B47 motorunda (2016+) EGR valfi tıkanması en sık karşılaşılan sorunlardır. Benzinli 320i N20 motorunda zincir ve yüksek basınç pompası sorunu da dikkat gerektirir.",
    bestYears:
      "F30 ikinci el için en dengeli yıllar 2016–2019 (LCI makyajlı versiyon ve B47 motor). 2015 öncesi modellerde servis geçmişi kritik. G20 nesli için 2020+ araçlar en güvenli pencere.",
    typicalKm:
      "Türkiye'de BMW 3.20 için 5 yaşında 80–100 bin km, 10 yaşında 160–200 bin km makul aralıktır. Bu rakamların çok altındaki ilanlarda km doğrulaması özellikle kritiktir.",
    matchQuery: "3.20",
  },
  {
    brandSlug: "bmw",
    modelSlug: "5-20",
    displayName: "5.20",
    brandDisplayName: "BMW",
    summary:
      "BMW 5.20 (520i/520d) üst-orta segment sedanın premium kulvarının dengeli modelidir. F10 (2010–2017), G30 (2017–2023) ve G60 (2023+) nesilleriyle gelir — özellikle 520d motoru Türkiye'de otoyol ağırlıklı sürücülerin favorisidir.",
    commonIssues:
      "F10 520d N47 motorda zincir sorunu (2012 öncesi), G30 B47 motorda EGR ve AdBlue sistem arızaları, hava yastığı sensör modülü problemleri ve ZF 8HP şanzımanın yağ bakımı ihmalinde ortaya çıkan sorunlar öne çıkar. Elektronik sistem arızaları (iDrive, adaptive cruise) yaş ilerledikçe bütçe gerektirir.",
    bestYears:
      "F10 nesli için 2015–2017 (LCI), G30 nesli için 2019+ yılları en dengeli örnekleri barındırır. Her iki nesilde de M Sport paketli örnekler %10–15 daha değerli.",
    typicalKm:
      "5.20 için 5 yaşında 90–120 bin km, 8 yaşında 150–180 bin km makul görülür. 200 bin km üstü örneklerde turbo ve enjektör bakım durumu detaylı incelenmelidir.",
    matchQuery: "5.20",
  },
  {
    brandSlug: "bmw",
    modelSlug: "x3",
    displayName: "X3",
    brandDisplayName: "BMW",
    summary:
      "BMW X3 premium orta segment SUV'un Türkiye pazarındaki en güçlü modellerinden biridir. F25 (2010–2017) ve G01 (2017+) nesilleriyle farklı kullanıcı profillerine hitap eder.",
    commonIssues:
      "F25 X3 xDrive 20d modelinde N47 motor zincir sorunu, transfer kutusu motoru (servo) arızaları, panoramik tavan su sızıntıları ve EGR valfi problemleri görülür. G01 nesli B47D20 motorda AdBlue enjektör tıkanması ve DPF sorunları bakım kalemleridir.",
    bestYears:
      "F25 için 2015–2017 (LCI), G01 için 2019+ en dengeli yıllar. xDrive varyantlar 2WD versiyonlara göre %10 daha yüksek fiyatlanır.",
    typicalKm:
      "X3 için 5 yaşında 80–110 bin km, 8 yaşında 140–180 bin km normal aralıktır.",
    matchQuery: "X3",
  },
  {
    brandSlug: "mercedes-benz",
    modelSlug: "c-serisi",
    displayName: "C Serisi",
    brandDisplayName: "Mercedes-Benz",
    summary:
      "Mercedes C Serisi premium orta segment sedanın prestij odaklı temsilcisidir. W204 (2007–2014), W205 (2014–2021) ve W206 (2021+) nesilleriyle ikinci el pazarının hareketli kesimini oluşturur.",
    commonIssues:
      "W205 C200'da M274 motor zincir germe sorunu, 9G-Tronic şanzımanda nadir vitesten vitese geçiş problemleri, W204'te OM651 dizel motorda yüksek basınç pompası arızaları ve Airmatic süspansiyonlu versiyonlarda hava yastığı değişim maliyeti başlıca konulardır.",
    bestYears:
      "W205 için 2017–2020 (LCI makyaj ve EQ Boost versiyonlar), W204 için 2012–2014 en dengeli yıllar. AMG paketli C200 örnekler standart versiyona göre %15 daha değerli.",
    typicalKm:
      "C Serisi için 5 yaşında 80–110 bin km, 8 yaşında 140–180 bin km beklenir. Taksi veya VIP shuttle kullanımlı örnekler km değeri olarak yüksek olabilir.",
    matchQuery: "C",
  },
  {
    brandSlug: "mercedes-benz",
    modelSlug: "e-serisi",
    displayName: "E Serisi",
    brandDisplayName: "Mercedes-Benz",
    summary:
      "Mercedes E Serisi üst-orta segmentin prestij bayrağıdır. W212 (2009–2016), W213 (2016–2023) ve W214 (2023+) nesilleri Türkiye'de özellikle kurumsal üst düzey kullanımda tercih edilir.",
    commonIssues:
      "W213 E220d'de OM654 dizel motor yüksek basınç pompası sorunu, Airmatic süspansiyonda hava yastığı sızıntıları, W212 E250 CGI motorda zincir germe ünitesi problemi en bilinen konulardır. MBUX ve COMAND sistemlerinde yaş aldıkça yazılım yenileme maliyetleri ortaya çıkar.",
    bestYears:
      "W213 için 2018–2020 (LCI makyaj sonrası), W212 için 2014–2016 en dengeli pencereler. AMG donanım paketli E220d örnekler ikinci el pazarında çok aranır.",
    typicalKm:
      "E Serisi için 5 yaşında 100–130 bin km, 8 yaşında 170–210 bin km makul aralıktır. VIP shuttle ağır kullanımı olan örneklerde km değeri aldatıcı olabilir.",
    matchQuery: "E",
  },
  {
    brandSlug: "audi",
    modelSlug: "a4",
    displayName: "A4",
    brandDisplayName: "Audi",
    summary:
      "Audi A4 premium orta segment sedanın Teknoloji-odaklı seçeneğidir. B8 (2008–2015), B9 (2015–2023) ve yeni B10 (2023+) nesilleriyle ikinci el pazarında güçlü bir arz bulunur.",
    commonIssues:
      "B8 A4 2.0 TFSI motorda yağ tüketimi (özellikle 2010–2014), DSG DQ250 şanzımanda yağ bakımı ihmalinde kickdown problemi, B9 2.0 TDI motorda EGR valfi tıkanması, MMI elektronik arızaları bilinen konulardır. Quattro versiyonlarda transfer kutusu bakımı da dikkat gerektirir.",
    bestYears:
      "B8 için 2013–2015 (makyaj sonrası), B9 için 2017+ yılları en uygun pencere. S-Line donanım paketli versiyonlar daha değerli ve daha iyi donatılmıştır.",
    typicalKm:
      "A4 için 5 yaşında 80–110 bin km, 8 yaşında 140–180 bin km normal aralıktır.",
    matchQuery: "A4",
  },
  {
    brandSlug: "audi",
    modelSlug: "q5",
    displayName: "Q5",
    brandDisplayName: "Audi",
    summary:
      "Audi Q5 premium orta segment SUV'un teknoloji ve konfor odaklı modelidir. 8R (2008–2017) ve FY (2017+) nesilleri ikinci el pazarında istikrarlı bir alıcı kitlesine sahiptir.",
    commonIssues:
      "8R Q5 2.0 TFSI motorda yağ tüketimi sorunu, 2.0 TDI motorda EGR ve AdBlue modülü arızaları, tiptronic ve S-Tronic şanzımanda yağ değişim ihmalleri, panoramik tavan sızıntıları başlıca konulardır. FY nesli elektronik yük daha yüksek olduğundan yaş aldıkça MMI arızaları maliyet çıkarır.",
    bestYears:
      "8R için 2014–2016 (makyaj sonrası), FY için 2019+ yılları en ideal pencere. Quattro versiyonlar standart 2WD'ye göre %10–15 daha pahalı.",
    typicalKm:
      "Q5 için 5 yaşında 80–110 bin km, 8 yaşında 140–180 bin km makul aralıktır.",
    matchQuery: "Q5",
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "passat",
    displayName: "Passat",
    brandDisplayName: "Volkswagen",
    summary:
      "Volkswagen Passat Türkiye'de orta-üst segment sedanın en köklü modelidir. B7 (2010–2015), B8 (2015–2023) ve B9 (2023+) nesilleri ikinci el pazarının en yoğun arz bölümüdür.",
    commonIssues:
      "B7 ve B8 Passat 1.4 TSI motorda zincir germe ünitesi sorunu, DQ200 DSG kuru kavramalı şanzımanda 80–100 bin km aralığında kavrama arızaları, 2.0 TDI CR motorda EGR ve DPF tıkanmaları en bilinen sorunlardır. 1.8 TSI motorlarda piston segman yağ yakma sorunu da belgelenmiştir.",
    bestYears:
      "B7 için 2013–2015 (son dönem üretim), B8 için 2017–2020 en dengeli yıllar. 2.0 TDI DSG kombinasyonu ikinci el pazarında en likit seçenektir.",
    typicalKm:
      "Passat için 5 yaşında 100–140 bin km, 8 yaşında 160–220 bin km makul aralıktır. Kurumsal filo kullanımlı örnekler yüksek km ile karşılaşılabilir ve servis geçmişi dikkatle doğrulanmalıdır.",
    matchQuery: "Passat",
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "polo",
    displayName: "Polo",
    brandDisplayName: "Volkswagen",
    summary:
      "Volkswagen Polo küçük segmentin premium tarafını temsil eder. MK5 (2009–2017), MK6 (2017+) nesilleriyle Türkiye'de özellikle şehir içi kullanım profili olan sürücülerin tercihidir.",
    commonIssues:
      "MK5 Polo 1.2 TSI motorda zincir germe sorunu, DSG DQ200 şanzımanda kavrama arızaları, 1.4 TDI CR motorda enjektör sorunları ve elektrik sistemi arızaları (pencere motorları, klima kontrol ünitesi) en bilinen sorunlardır. MK6'da elektronik sistem arızaları yaş ilerledikçe maliyet çıkarır.",
    bestYears:
      "MK5 için 2014–2017 (makyaj sonrası), MK6 için 2019+ yılları en uygun pencere.",
    typicalKm:
      "Polo için 5 yaşında 60–90 bin km, 8 yaşında 110–150 bin km normal aralıktır. Şehir içi kullanım profilinde km düşük olabilir.",
    matchQuery: "Polo",
  },
  {
    brandSlug: "toyota",
    modelSlug: "corolla",
    displayName: "Corolla",
    brandDisplayName: "Toyota",
    summary:
      "Toyota Corolla Türkiye'nin en güvenilir orta segment sedan modelidir. E170 (2013–2018) ve E210 (2018+) nesilleri — özellikle 2018 sonrası Corolla Hybrid — ikinci el pazarının en likit araçları arasındadır.",
    commonIssues:
      "Corolla'nın bilinen sorunları oldukça azdır. 1.4 D-4D dizelde DPF tıkanmaları (kısa mesafeli şehir kullanımı profilinde), 1.6 Dual VVT-i motorda zamanla triger problemi, hibrit varyantlarda 8 yıl sonrası batarya performans düşüşü ana konulardır. Manuel varyantlarda debriyaj bakımı standart bakım kalemidir.",
    bestYears:
      "E170 için 2015–2018, E210 için 2019+ yılları en dengeli pencere. Hibrit varyant batarya garantisi devam eden (2019+) örnekler ikinci el pazarında en güvenli seçimdir.",
    typicalKm:
      "Corolla için 5 yaşında 90–130 bin km, 8 yaşında 160–200 bin km makul aralıktır. Taksi ve filo kullanımlı örnekler yüksek km gösterebilir.",
    matchQuery: "Corolla",
  },
  {
    brandSlug: "toyota",
    modelSlug: "c-hr",
    displayName: "C-HR",
    brandDisplayName: "Toyota",
    summary:
      "Toyota C-HR kompakt SUV segmentin genç ve tasarım odaklı modelidir. Özellikle Hybrid versiyonu 2017 sonrası Türkiye'de yoğun ilgi gören araçlardan biri oldu.",
    commonIssues:
      "C-HR'ın bilinen sorunları azdır. Hibrit sistemin 8 yıl sonrası batarya performans eğrisi izlenmeli, CVT şanzımanda yağ bakımı ihmal edilmemelidir. Sesli sistem ve multimedya arızaları modele özgü olmamakla birlikte bazı örneklerde bildirilmiştir.",
    bestYears:
      "2019+ yılları (makyaj sonrası) iç teknoloji yenilenmiş örnekleri barındırır ve ikinci el pazarında daha likittir.",
    typicalKm:
      "C-HR için 5 yaşında 70–100 bin km, 7 yaşında 110–150 bin km normal aralıktır.",
    matchQuery: "C-HR",
  },
  {
    brandSlug: "honda",
    modelSlug: "civic",
    displayName: "Civic",
    brandDisplayName: "Honda",
    summary:
      "Honda Civic orta segment sedanın dayanıklı Japon temsilcisidir. 9. nesil (2012–2015), 10. nesil (2016–2021) ve 11. nesil (2022+) Civic Türkiye'de bireysel kullanıcının güvendiği modellerdir.",
    commonIssues:
      "10. nesil Civic 1.5 VTEC Turbo motorda yakıt-yağ karışımı sorunu (özellikle kısa şehir içi sürüşlerde), 1.6 i-DTEC dizelde EGR valfi tıkanmaları, CVT şanzımanda yağ bakımı ihmal edildiğinde kayış aşınması başlıca konulardır. 11. nesilde yeni L15C7 motor daha sorunsuzdur.",
    bestYears:
      "10. nesil için 2018–2020 yılları (makyaj sonrası), 9. nesil için 2014–2015 en dengeli yıllar.",
    typicalKm:
      "Civic için 5 yaşında 80–120 bin km, 8 yaşında 140–190 bin km makul aralıktır. Özel kullanım profili korunan örnekler daha düşük km gösterebilir.",
    matchQuery: "Civic",
  },
  {
    brandSlug: "honda",
    modelSlug: "cr-v",
    displayName: "CR-V",
    brandDisplayName: "Honda",
    summary:
      "Honda CR-V orta segment SUV'un dayanıklılık odaklı temsilcisidir. 4. nesil (2012–2017) ve 5. nesil (2017+) Türkiye'de aile kullanımı için güvenli bir seçim olarak öne çıkar.",
    commonIssues:
      "CR-V 1.6 i-DTEC dizelde EGR ve DPF sorunları, CVT şanzımanda yağ bakımı ihmal ile gelen kayış aşınması, 4WD aktarım sisteminde yağ değişim ihmalinde görülen diferansiyel yıpranması bilinen konulardır. 5. nesilde 1.5 VTEC Turbo motordaki yakıt-yağ karışımı sorunu Civic'le ortaktır.",
    bestYears:
      "5. nesil için 2019+ (makyaj sonrası ve motor yazılım güncellemeleriyle), 4. nesil için 2015–2017 en dengeli yıllar.",
    typicalKm:
      "CR-V için 5 yaşında 90–130 bin km, 8 yaşında 150–200 bin km makul aralıktır.",
    matchQuery: "CR-V",
  },
  {
    brandSlug: "renault",
    modelSlug: "megane",
    displayName: "Megane",
    brandDisplayName: "Renault",
    summary:
      "Renault Megane Türkiye'de orta segmentin en çok satan modellerinden biridir. Megane III (2008–2016) ve Megane IV (2016–2023) nesilleri ikinci el pazarının en hareketli kesimindedir. Megane IV sedan Türkiye pazarında özellikle aile ve ilk araç alıcıları için güçlü bir seçenek olmaya devam ediyor.",
    commonIssues:
      "Megane III 1.5 dCi motorda enjektör arızaları (özellikle 2010–2013), Megane IV'te EDC çift kavramalı şanzımanda mekanik yorulma, 0.9 TCe benzinli motorda yağ tüketimi sorunu başlıca konulardır. EGR valfi ve DPF tıkanmaları dizel varyantlarda standart bakım kalemidir.",
    bestYears:
      "Megane IV için 2018–2020 yılları, Megane III için 2013–2015 en dengeli pencere. Icon ve Touch gibi üst donanım paketli versiyonlar %15 daha değerlidir.",
    typicalKm:
      "Megane için 5 yaşında 90–130 bin km, 8 yaşında 150–200 bin km makul aralıktır. Filo kullanımlı örnekler yüksek km ile karşılaşılabilir.",
    matchQuery: "Megane",
  },
  {
    brandSlug: "renault",
    modelSlug: "clio",
    displayName: "Clio",
    brandDisplayName: "Renault",
    summary:
      "Renault Clio B segmentin Türkiye'deki en köklü modellerinden biridir. Clio IV (2012–2019) ve Clio V (2019+) nesilleri özellikle genç sürücüler ve ilk araç alıcıları için güçlü bir seçenektir.",
    commonIssues:
      "Clio IV 1.5 dCi motorda enjektör arızaları, EDC DC4 şanzımanda mekanik yorulma, 0.9 TCe benzinli motorda yağ tüketimi ve bobin sorunları bilinen konulardır. Clio V'te multimedya sistemi ve elektronik yük daha yüksek olduğundan yaş aldıkça bu tarafta maliyet çıkabilir.",
    bestYears:
      "Clio IV için 2016–2019 (makyaj sonrası), Clio V için 2020+ yılları en uygun pencere.",
    typicalKm:
      "Clio için 5 yaşında 70–100 bin km, 8 yaşında 120–160 bin km normal aralıktır.",
    matchQuery: "Clio",
  },
  {
    brandSlug: "fiat",
    modelSlug: "egea",
    displayName: "Egea",
    brandDisplayName: "Fiat",
    summary:
      "Fiat Egea Türkiye'nin en çok satan sedanlarından biridir. 2015'ten beri üretilen model bireysel kullanım, kurumsal filo ve taksi pazarında baskın bir konuma sahiptir. İkinci el likiditesi son derece yüksek, her bütçeye hitap eden bir seçenektir.",
    commonIssues:
      "Egea 1.3 MultiJet dizel motorda turbo arızaları (özellikle 150 bin km üstü), 1.6 E-Torq benzinli motorda termostat arızaları ve triger ürünü arızaları, otomatik şanzımanlı versiyonlarda (Easy Dualogic) vites geçiş sorunları bilinen konulardır. Manuel varyantlarda debriyaj bakımı standart kalemdir.",
    bestYears:
      "Egea için 2018–2021 yılları (makyaj sonrası donanımla) en dengeli pencere. 2023+ yeni makyajlı versiyonlar donanım olarak belirgin şekilde iyidir.",
    typicalKm:
      "Egea için 5 yaşında 100–150 bin km, 7 yaşında 150–220 bin km makul aralıktır. Taksi kullanımlı örnekler 300 bin km'ye rahat ulaşır — km doğrulaması kritik.",
    matchQuery: "Egea",
  },
  {
    brandSlug: "fiat",
    modelSlug: "doblo",
    displayName: "Doblò",
    brandDisplayName: "Fiat",
    summary:
      "Fiat Doblò Türkiye'de kompakt MPV / hafif ticari segmentin en köklü modelidir. Aile kullanımı, küçük ölçekli ticari taşımacılık ve kısa mesafe kargo için yaygın tercih edilir. İkinci el likiditesi özellikle hafif ticari tarafta çok yüksektir.",
    commonIssues:
      "Doblò 1.3 MultiJet motorda turbo arızaları (yüksek km sonrası), 1.6 MultiJet motorda EGR valfi tıkanmaları, debriyaj ömrünün kısa olması (özellikle yüklü kullanımda), elektrik sistemi (pencere, klima) arızaları bilinen konulardır.",
    bestYears:
      "2015–2019 yılları (makyaj sonrası), sonrasında 2020+ yeni nesil gövde tasarımı ve donanım iyileştirmeleriyle daha dengeli. 1.6 MultiJet dizel varyant ticari kullanıcılar için en tercih edilen motordur.",
    typicalKm:
      "Doblò için 5 yaşında 120–170 bin km, 7 yaşında 180–240 bin km makul aralıktır. Kargo ve kurye kullanımlı örnekler çok yüksek km gösterir, bu durum normaldir ancak bakım kayıtları kritik.",
    matchQuery: "Doblò",
  },
];

export function getBrand(slug: string): BrandInfo | null {
  const norm = slug.toLowerCase();
  return BRANDS.find((b) => b.slug === norm) ?? null;
}

export function getModel(brandSlug: string, modelSlug: string): ModelInfo | null {
  const bn = brandSlug.toLowerCase();
  const mn = modelSlug.toLowerCase();
  return MODELS.find((m) => m.brandSlug === bn && m.modelSlug === mn) ?? null;
}

export function modelsByBrand(brandSlug: string): ModelInfo[] {
  const bn = brandSlug.toLowerCase();
  return MODELS.filter((m) => m.brandSlug === bn);
}
