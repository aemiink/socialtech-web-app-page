# Social Tech Web Platform

Bu repo, Social Tech Reklam ve Teknoloji markasi icin hazirlanan iki ayri React/Vite uygulamasini barindirir:

- `client`: Public marketing web sitesi. Marka, servisler, otomasyonlar, case study'ler, iletisim funnel'i ve paket sayfalarini kullaniciya sunar.
- `clientPanel`: Social Tech musterileri icin ozel client visibility paneli. Musterinin satin aldigi hizmetleri, raporlari, onaylari, toplantilari, faturalari ve aksiyonlarini tek panelde izletir.

Repo public bir SaaS urunu degildir. Ana odak, Social Tech ajansinin hem dis yuzunu hem de musteriye sundugu operasyon gorunurlugunu ayni tasarim diliyle yonetmektir.

## Proje Yapisi

```text
socialtech-web-app-sonunda/
  client/
    src/
    package.json
    vite.config.ts
  clientPanel/
    src/
    package.json
    vite.config.ts
  README.md
```

## Teknoloji Stack'i

Iki uygulama da modern React/Vite stack'i ile gelistirildi.

- `React 18`: Component tabanli UI mimarisi.
- `Vite 6`: Dev server, production build ve asset bundling.
- `React Router 7`: Public site tarafinda route yapisi ve lazy page loading.
- `Tailwind CSS 4`: Utility-first stil sistemi.
- `@tailwindcss/vite`: Tailwind/Vite entegrasyonu.
- `lucide-react`: Ikon sistemi.
- `Radix UI`: UI primitive dependency seti.
- `MUI`: Dependency olarak mevcut; ana tasarim dili custom Tailwind componentleri uzerinden ilerler.
- `recharts`: Dashboard chart ve grafik ihtiyaclari.
- `motion`: Animasyon ihtiyaclari icin dependency olarak mevcut.
- `Poppins`: Global font ailesi.

## Calistirma

Public web sitesi:

```bash
cd client
npm install
npm run dev
```

Client panel:

```bash
cd clientPanel
npm install
npm run dev
```

Production build:

```bash
cd client
npm run build

cd ../clientPanel
npm run build
```

Build ciktilari ilgili uygulamanin `dist/` klasorune uretilir.

## Public Web Sitesi: `client`

`client`, Social Tech'in pazarlama ve lead toplama web sitesidir.

Temel amaclari:

- Social Tech'in hizmetlerini ve konumlandirmasini anlatmak.
- Kullanici yolculugunu servis sayfalarindan iletisim formuna tasimak.
- Paket, case study, musteriler, otomasyonlar ve iletisim sayfalarini funnel mantigiyla baglamak.
- SEO ve performans icin route bazli lazy loading kullanmak.
- Marka tasarim dilini koyu zemin, neon lime `#aaff01`, violet accent ve glass navbar ile tutarli hale getirmek.

### Public Site Giriş Noktalari

- `client/src/main.tsx`: React root render.
- `client/src/app/App.tsx`: RouterProvider ve scroll davranisi.
- `client/src/app/routes.tsx`: Tum route haritasi.
- `client/src/app/components/layout/AppLayout.tsx`: Global layout.
- `client/src/app/components/site/SiteHeader.tsx`: Navbar ve hizmetler menusu.
- `client/src/app/components/site/SiteFooter.tsx`: Footer ve CTA linkleri.
- `client/src/styles/index.css`: Global CSS girisi.
- `client/src/styles/theme.css`: Tema tokenlari, animasyonlar ve base stiller.
- `client/src/styles/fonts.css`: Poppins font importu.

### Public Site Route Haritasi

| Route | Sayfa |
| --- | --- |
| `/` | Landing page |
| `/hakkimizda` | Hakkimizda |
| `/hizmetler` | Hizmetler overview |
| `/otomasyonlar` | Otomasyonlar |
| `/musteriler` | Musteriler |
| `/iletisim` | Iletisim |
| `/kariyer` | Kariyer ve staj |
| `/calismalar` | Case study listesi |
| `/calisma-detaylari` | Varsayilan case study detay |
| `/calismalar/:id` | Slug bazli case study detay |
| `/hizmetler/buyume-hub` | Growth Hub |
| `/hizmetler/sosyal-medya` | Sosyal medya hizmeti |
| `/hizmetler/web-uygulama` | Web uygulama |
| `/hizmetler/mobil-uygulama` | Mobil uygulama |
| `/hizmetler/karsilama-sayfasi` | Landing page hizmeti |
| `/hizmetler/web-tasarim` | Web tasarim |
| `/hizmetler/dijital-pazarlama-hub` | Dijital pazarlama hub |
| `/hizmetler/meta-reklamlari` | Meta Ads |
| `/hizmetler/google-reklamlari` | Google Ads |
| `/hizmetler/tiktok-reklamlari` | TikTok Ads |
| `/hizmetler/amazon-reklamlari` | Amazon Ads |
| `/hizmetler/web-teknik-destek` | Web teknik destek |
| `/hizmetler/seo` | SEO denetimi |

### Public Site Mimari Mantigi

Public site feature bazli component yapisi kullanir.

```text
client/src/app/
  pages/
  components/
    landing/
      LandingHome.tsx
      sections/
    about/
    contact/
    automations/
    services/
    portfolio/
    site/
    ui/
```

Sayfa dosyalari bilincli olarak ince tutulur. Page componentleri ilgili feature `Home` componentini render eder. Sayfa icindeki buyuk bolumler `sections/` altinda ayrilir.

Bu yapi su avantajlari saglar:

- Route dosyalari sade kalir.
- Sayfa bolumleri okunabilir ve tekrar kullanilabilir olur.
- Design system ve UI parcalari merkezi sekilde gelistirilir.
- Ileride Next.js gibi bir mimariye gecis daha kontrollu olur.

### Public Site Yapilan Ana Gelistirmeler

- Landing page full-width yapildi.
- Global font Poppins olarak ayarlandi.
- Buton kontrastlari ve hover davranislari duzenlendi.
- Navbar fixed hale getirildi, scroll durumunda glass arka plan eklendi.
- Hizmetlerimiz icin dropdown/mega menu eklendi.
- Route'lar Turkcelestirildi.
- Sayfa degisimlerinde scroll'un en uste alinmasi saglandi.
- Iletisim sayfasi olusturuldu ve CTA'lar forma baglandi.
- Footer linkleri gercek route'lara baglandi.
- Odeme logolari gorsel grid sistemiyle duzenlendi.
- Paket feature listelerinde marka ikonlu bullet sistemi kuruldu.
- Otomasyonlar sayfasi olusturuldu.
- Growth Hub, sosyal medya, web app, landing page, web tasarim, reklam ve teknik destek servis sayfalari tasarim diline uyarlandi.
- Case study sayfalari daha gercekci proje anlatimina cekildi.
- Hero yapilari, CTA'lar, kartlar ve responsive tasarimlar yeniden duzenlendi.
- Kullanilmayan asset ve buyuk gorsel problemi icin gorsel optimizasyonlari yapildi.

## Client Panel: `clientPanel`

`clientPanel`, Social Tech musterileri icin ozel bir gorunurluk panelidir. Bu panel public SaaS gibi dusunulmez; amaci musteriye ajans operasyonunun anlasilir ve guven veren bir ozetini gostermektir.

Panel su sorulara cevap verir:

- Hangi hizmetler aktif?
- Hangi kampanyalar, icerikler veya teslimler onay bekliyor?
- Ajans bu hafta ne yapti?
- Musteriden ne bekleniyor?
- Raporlar, toplantilar, faturalama ve ayarlar nerede?
- Her servis icin o servise ozel metrikler ve is akislari nasil ilerliyor?

### Client Panel Giriş Noktalari

- `clientPanel/src/main.tsx`: React root render.
- `clientPanel/src/app/App.tsx`: Secili servis ve secili sekme state yonetimi.
- `clientPanel/src/app/components/sidebar.tsx`: Servise ozel sidebar.
- `clientPanel/src/app/components/topbar.tsx`: Secili servis adini gosteren ust bar.
- `clientPanel/src/app/pages/service-selection.tsx`: 13 aktif hizmetin secildigi ekran.
- `clientPanel/src/app/pages/service-tab-page.tsx`: Servis sekmelerini gercek ekran hissiyle render eden ana renderer.
- `clientPanel/src/app/data/service-pages.ts`: Servis/sekme icerik verisi.
- `clientPanel/src/app/lib/client-actions.ts`: Buton aksiyonlari, local action history ve dosya ciktilari.
- `clientPanel/src/app/components/client-action-center.tsx`: Islem merkezi ve toast sistemi.

### Client Panel State/Routing Mantigi

Client panelde browser URL routing yerine uygulama ici state kullanilir.

```text
selectedService -> hangi hizmet paneli acik?
currentPage     -> sidebar'da hangi sekme acik?
```

Akis:

```text
ServiceSelectionPage
  -> service seçilir
  -> App selectedService ve currentPage state'ini gunceller
  -> Sidebar servise ozel menuyu gosterir
  -> Topbar secili hizmet adini gosterir
  -> dashboard veya tab page render edilir
```

Bu tercih panelin su anki kapsaminda yeterlidir. Ileride gercek URL ihtiyaci dogarsa React Router ile `/panel/:serviceId/:tabId` gibi bir yapıya gecilebilir.

### Aktif Servisler

Panelde tam 13 aktif servis vardir. Hicbiri locked/disabled gosterilmez.

| Service ID | Servis |
| --- | --- |
| `growth-hub` | Growth & Hub |
| `social-media` | Sosyal Medya Yonetimi |
| `media-hub` | Medya Hub |
| `meta-ads` | Meta ADS |
| `tiktok-ads` | TikTok ADS |
| `google-ads` | Google ADS |
| `amazon-ads` | Amazon ADS |
| `web-app` | Web APP |
| `mobile-app` | Mobil APP |
| `landing-pages` | Landing Pages |
| `web-mobile-design` | Web & Mobil Tasarimlar |
| `technical-support` | Teknik Destek |
| `seo-audit` | SEO Denetimi |

### Dashboard Mapping

Her servis kendi dashboard componentine gider.

| Service ID | Dashboard Component |
| --- | --- |
| `growth-hub` | `GrowthHubDashboard` |
| `social-media` | `SocialMediaDashboard` |
| `media-hub` | `MediaHubDashboard` |
| `meta-ads` | `MetaAdsDashboard` |
| `tiktok-ads` | `TikTokAdsDashboard` |
| `google-ads` | `GoogleAdsDashboard` |
| `amazon-ads` | `AmazonAdsDashboard` |
| `web-app` | `WebAppDashboard` |
| `mobile-app` | `MobileAppDashboard` |
| `landing-pages` | `LandingPagesDashboard` |
| `web-mobile-design` | `WebMobileDesignDashboard` |
| `technical-support` | `TechnicalSupportDashboard` |
| `seo-audit` | `SeoAuditDashboard` |

### Sidebar ve Sekme Yapisi

Her servisin sidebar'i servise ozeldir. Ornegin:

- Sosyal medya servisi icerik takvimi, onay bekleyenler, yayinlanan icerikler, DM/yorumlar, rakip analizi ve trend notlari gosterir.
- Meta ADS servisi kampanyalar, reklam setleri, kreatifler, kitleler, Pixel & Events, funnel ve optimizasyon notlari gosterir.
- Web APP servisi proje yol haritasi, sprint durumu, UI/UX, frontend, backend/API, admin panel, test/yayin, revizyonlar ve dosyalar gosterir.
- Teknik destek servisi destek talepleri, acik isler, cozulen isler, bakim, guvenlik, yedekleme, guncellemeler ve aktivite logu gosterir.
- SEO denetimi servisi audit, teknik hatalar, anahtar kelimeler, sayfa hizi, index durumu, Search Console, rakip analizi ve aksiyon plani gosterir.

Shared tablar:

- `Raporlar`
- `Toplantilar`
- `Faturalama`
- `Ayarlar`

Bu shared tablar tum servislerde bulunur ve client-facing bilgi verir.

### Sekme Renderer Mantigi

Ilk panel iterasyonunda sekmeler ayni generic template ile gorunuyordu. Sonraki sprintte `service-tab-page.tsx` daha gercekci ekran tipleri uretecek sekilde gelistirildi.

Tab ID'ye gore farkli workspace tipleri render edilir:

- Growth control center
- Icerik takvimi
- Onay masasi
- Yayinlanan icerik grid'i
- DM & yorum inbox
- Rakip/trend/keyword insight ekrani
- Kampanya cockpit'i
- Butce ve performans karsilastirmasi
- Funnel/UX flow map
- Kreatif/prototip galeri
- SEO/teknik checklist
- Sprint/project board
- Destek ticket panosu
- Brief formu
- Teslim dosyalari ekrani

Bu sayede her sekme ayni template gibi degil, yaptigi ise uygun bir panel gibi gorunur.

### Client Action Sistemi

Paneldeki butonlar sadece statik prototip degildir. Merkezi aksiyon sistemi vardir.

Ana dosyalar:

- `clientPanel/src/app/lib/client-actions.ts`
- `clientPanel/src/app/components/client-action-center.tsx`
- `clientPanel/src/app/components/button.tsx`

Butonlar otomatik olarak aksiyon tipini algilar:

- Onayla
- Revizyon iste
- Yorum ekle
- Raporu incele
- PDF/dosya indir
- Toplantiya katil
- Degisiklikleri kaydet
- Talep gonder
- Goruntule/ac/incele
- Kullanici davet et
- Yeni kayit olustur

Butona tiklandiginda:

- Islem merkezi toast gosterir.
- Aksiyon local history'ye kaydedilir.
- Onay ekranlarinda kart statusu degisir.
- Destek talebi ekraninda yeni ticket acik isler kolonuna duser.
- Rapor/indir aksiyonlari local `.txt` cikti dosyasi olusturur.

Backend entegrasyonu yoktur; bu katman su an front-end seviyesinde musteri portalinin gercek calisiyormus hissini verir.

### Automation Preview Kurali

Automation Preview her yerde gosterilmez. Sadece otomasyonun hizmet vaadiyle dogrudan iliskili oldugu servislerde vardir:

- Growth & Hub
- Sosyal Medya Yonetimi
- Medya Hub
- Meta ADS
- TikTok ADS
- Google ADS

Su servislerde gosterilmez:

- Amazon ADS
- Web APP
- Mobil APP
- Landing Pages
- Web & Mobil Tasarimlar
- Teknik Destek
- SEO Denetimi

### Client Panel Yapilan Ana Gelistirmeler

- 13 aktif servis karti olusturuldu.
- Tum servisler icin dashboard mapping duzeltildi.
- `Mobil APP`, `Landing Pages`, `Web & Mobil Tasarimlar` icin ayri dashboardlar eklendi.
- Topbar servis etiketleri duzeltildi.
- Servise ozel sidebar yapisi kuruldu.
- Placeholder sayfa davranisi kaldirildi.
- Tum sidebar sekmeleri anlamli icerik gosterir hale getirildi.
- Sekmeler islevlerine gore farkli workspace gorunumleriyle tasarlandi.
- Automation Preview sadece ilgili hizmetlerde birakildi.
- Shared pages guclendirildi: raporlar, toplantilar, faturalama, ayarlar.
- Butonlar islevlendirildi.
- Islem merkezi, toast ve local action history eklendi.
- Rapor/indirme aksiyonlari local dosya uretir hale getirildi.

## Tasarim Dili

Iki uygulama ayni marka hissiyatini tasir:

- Koyu premium yuzeyler.
- Neon lime ana aksan: `#aaff01`.
- Violet yardimci aksan: `#7B61FF` veya public sitede `#8a38f5`.
- Cyan yardimci sinyal rengi.
- Yuvarlatilmis kartlar.
- Glass/blur arka planlar.
- Poppins font.
- Yuksek kontrast CTA'lar.
- Ajans odakli, musteriye guven veren mikro copy.

Panel tarafinda dil ozellikle client-facing tutulur. Internal/developer jargon yerine su dil kullanilir:

- Ajans Yorumu
- Sizden Beklenenler
- Son Aktiviteler
- Onay Bekleyenler
- Raporu Incele
- Revizyon Iste
- Dosyalari Goruntule

## Performans ve Build Notlari

Her iki uygulama Vite ile build edilir. Son buildlerde clientPanel icin Vite buyuk chunk uyarisi vermektedir. Bu hata degildir, ancak ileride iyilestirilebilir.

Onerilen performans gelistirmeleri:

- `clientPanel` icin dashboard ve sekme renderer'larini lazy import etmek.
- Recharts ve Radix gibi agir dependency'leri manual chunklara ayirmak.
- Public site tarafinda kritik gorseller icin responsive image stratejisi eklemek.
- Font self-hosting dusunmek.
- Kullanilmayan shadcn/Radix primitive'lerini temizlemek.

## Bilinen Eksikler ve Sonraki Sprint Fikirleri

Backend entegrasyonu:

- Form submit, CRM, e-posta, webhook veya veritabani entegrasyonu yok.
- Client panel action history localStorage uzerinden calisir.
- Rapor indirme su an front-end generated `.txt` cikti uretir; gercek PDF endpoint'i eklenebilir.

Routing:

- Public site React Router ile route bazli calisir.
- Client panel state bazli calisir; ileride URL tabanli servis/sekme route'lari eklenebilir.

Auth:

- Client panelde gercek login/auth yok.
- Kullanici ve yetki ekrani UI seviyesindedir.

Data:

- Dashboard verileri statiktir.
- Ileride API/CRM/ads platformlari ile dinamik hale getirilebilir.

## Bakim Checklist'i

Yeni bir degisiklikten sonra kontrol edilmesi onerilir:

- `cd client && npm run build`
- `cd clientPanel && npm run build`
- Header/footer linkleri dogru route'a gidiyor mu?
- CTA'lar `/iletisim#contact-form` hedefine gidiyor mu?
- Public site mobil gorunumde okunabilir mi?
- Client panelde 13 servis karti dogru dashboard'a aciliyor mu?
- Sidebar sekmeleri placeholder yerine anlamli ekran gosteriyor mu?
- Automation Preview sadece ilgili servislerde mi?
- Islem Merkezi buton aksiyonlarini kaydediyor mu?
- Build ciktisinda sadece beklenen chunk uyarilari mi var?

## Kisa Ozet

Bu repo, Social Tech icin hem public pazarlama sitesini hem de musteriye ozel operasyon panelini kapsayan iki parcali bir front-end platformudur.

`client`, dis dunyaya donuk conversion odakli web sitesidir.

`clientPanel`, musteriye hizmet, onay, rapor, toplantı, faturalama ve ajans aksiyonlarini gorunur kilan dark premium dashboard uygulamasidir.
