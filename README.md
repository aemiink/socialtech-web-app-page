# Social Tech Web App

Social Tech Web App, Social Tech Reklam ve Teknoloji markasi icin hazirlanan modern, full-width, conversion odakli bir pazarlama web sitesidir. Proje; dijital ajans hizmetlerini, otomasyon tekliflerini, case study akisini, iletisim funnel'ini ve servis detay sayfalarini tek bir React/Vite uygulamasi icinde toplar.

Bu README, repodaki mevcut yazilim mimarisini, kullanilan teknolojileri, sayfa organizasyonunu ve bugune kadar yapilan ana gelistirmeleri aciklar.

## Proje Ozeti

Uygulama tek bir client uygulamasindan olusur:

```text
socialtech-web-app-sonunda/
  client/
    src/
    public veya dist ciktilari
    package.json
    vite.config.ts
```

Ana hedefler:

- Social Tech markasinin dijital buyume, reklam, web, teknik destek ve otomasyon hizmetlerini anlatmak.
- Kullanici yolculugunu servis sayfalarindan iletisim formuna tasimak.
- Paket, case study, musteri, otomasyon ve iletisim sayfalarini funnel mantigiyla baglamak.
- Sayfa bazli lazy loading ile chunk boyutunu kontrol altinda tutmak.
- Tasarim dilini neon lime `#aaff01`, violet `#8a38f5`, koyu yuzeyler ve glass/sticky navbar uzerine kurmak.

## Teknoloji Stack'i

Proje su teknolojilerle gelistirildi:

- `React 18`: UI katmani ve component tabanli sayfa yapisi.
- `Vite 6`: Development server, build pipeline ve asset bundling.
- `React Router 7`: Route tanimlari, nested layout ve lazy page loading.
- `Tailwind CSS 4`: Utility-first styling, responsive tasarim ve hizli layout uretimi.
- `@tailwindcss/vite`: Tailwind'in Vite entegrasyonu.
- `lucide-react`: Icon sistemi.
- `Radix UI`: UI primitive dependency seti. `client/src/app/components/ui` altinda cok sayida primitive component bulunur.
- `MUI`: Paketlerde dependency olarak mevcut, ancak ana tasarim dili agirlikli olarak Tailwind ve custom componentlerle ilerler.
- `motion`: Animasyon ihtiyaclari icin dependency olarak mevcut.
- `Google Fonts / Poppins`: Global font importu `client/src/styles/fonts.css` icinde tanimli.

## Calistirma

Komutlar `client` klasoru icinden calistirilir:

```bash
cd client
npm install
npm run dev
```

Production build:

```bash
cd client
npm run build
```

Build ciktisi:

```text
client/dist/
```

## Uygulama Giris Noktalari

Ana dosyalar:

- `client/src/main.tsx`: React root render islemi.
- `client/src/app/App.tsx`: RouterProvider ve route degisimlerinde scroll davranisi.
- `client/src/app/routes.tsx`: Tum route haritasi ve lazy page loading.
- `client/src/styles/index.css`: Global stil girisi.
- `client/src/styles/theme.css`: Tema tokenlari, animasyonlar, base stiller.
- `client/src/styles/fonts.css`: Poppins font importu.

`App.tsx` icinde route degisimlerinde sayfanin en uste alinmasi ve hash ile hedef section'a gidilmesi icin manuel scroll kontrolu vardir. Bu, `/iletisim#contact-form` gibi CTA linklerinin dogru calismasini saglar.

## Route Haritasi

Tum route'lar `client/src/app/routes.tsx` icinde tanimlidir. Sayfalar lazy import edilir.

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

## Layout Mimarisi

Proje global layout mantigi ile calisir:

```text
App
  RouterProvider
    AppLayout
      SiteHeader
      Outlet
      SiteFooter
```

Ana layout dosyalari:

- `client/src/app/components/layout/AppLayout.tsx`
- `client/src/app/components/site/SiteHeader.tsx`
- `client/src/app/components/site/SiteFooter.tsx`

Header ozellikleri:

- Fixed navbar.
- Scroll olunca glass/blur arka plan.
- Hizmetlerimiz menusu icin dropdown mega menu.
- Desktop ve mobile menu ayrimi.
- Iletisime gec CTA'si `/iletisim#contact-form` hedefine baglidir.

Footer ozellikleri:

- Faydalı linkler ve urun/hizmet linkleri route'lara baglidir.
- CTA butonlari ile iletisim formuna yonlendirme yapilir.
- `footerLinks.ts` ile label-to-route eslesmesi merkezi tutulur.

## Component Organizasyonu

Uygulama feature bazli component mimarisi kullanir. Her buyuk sayfa kendi klasoru altinda `Home` dosyasi, data/shared dosyalari ve section componentleriyle ayrilir.

Genel pattern:

```text
components/
  landing/
    LandingHome.tsx
    LandingHome.shared.tsx
    sections/
      HeroSection.tsx
      IntroSection.tsx
      DigitalSolutionsSection.tsx
      ...
```

Bu sayede `Home` dosyalari sadece sayfa iskeletini kurar; icerik ve bolumler okunabilir parcalara ayrilir.

Ana component gruplari:

- `components/landing`: Ana sayfa.
- `components/about`: Hakkimizda sayfasi.
- `components/contact`: Iletisim sayfasi, form ve gorusme akisi.
- `components/automations`: Otomasyonlar sayfasi.
- `components/services`: Tum servis detay sayfalari ve overview.
- `components/portfolio`: Musteriler, kariyer, case study listesi ve detaylari.
- `components/site`: Site genelinde kullanilan header, footer, button, hero backdrop, payment logos gibi ortak componentler.
- `components/ui`: Radix/shadcn benzeri UI primitive componentleri.

## Sayfa Mimarisi

Sayfa dosyalari `client/src/app/pages` altindadir. Page dosyalari bilincli olarak ince tutulur ve ilgili feature componentini render eder.

Ornek:

```tsx
import AutomationHome from "../components/automations/AutomationHome";

export default function AutomationsPage() {
  return <AutomationHome />;
}
```

Bu yaklasim su avantajlari saglar:

- Route dosyalari sade kalir.
- Sayfa mantigi feature klasorlerinde toplanir.
- Section bazli gelistirme ve refactor kolaylasir.
- Ileride Next.js veya baska bir routing mimarisine gecis daha kontrollu olur.

## Ortak Site Componentleri

`client/src/app/components/site` altinda tekrar kullanilan site componentleri vardir:

- `ActionButton.tsx`: Lime, violet ve cyan accent destekleyen CTA butonu.
- `HeroBackdrop.tsx`: Ortak hero arka plan glow/orb sistemi.
- `PaymentLogos.tsx`: Paket bolumlerinde kullanilan odeme logolari grid sistemi.
- `PackageFeatureBullet.tsx`: Paket ozellik listesi icin ikonlu bullet.
- `SiteHeader.tsx`: Navbar ve hizmetler dropdown.
- `SiteFooter.tsx`: Footer linkleri ve CTA bloklari.
- `footerLinks.ts`: Footer link label eslestirmeleri.

## Tasarim Sistemi

Gorsel dil:

- Ana renk: `#aaff01`
- Yardimci mor: `#8a38f5`
- Yardimci mavi/cyan: `#00a2e5`
- Arka planlar: siyah, koyu gri, koyu gradient yuzeyler.
- Tipografi: Poppins.
- Genel hissiyat: modern dijital ajans, neon teknoloji, koyu zemin, yuksek kontrast CTA.

`theme.css` icinde marka tokenlari:

```css
--st-lime: #aaff01;
--st-violet: #8a38f5;
--st-cyan: #00a2e5;
--st-surface: rgba(8, 11, 23, 0.82);
```

Hero arka planlarinda animasyonlu orb/glow efektleri kullanilir. `prefers-reduced-motion` durumunda animasyonlar kapatilir.

## Dönüşüm ve Funnel Yaklasimi

Site, kullaniciyi servis bilgisinden iletisim aksiyonuna tasimak icin tasarlandi.

Uygulanan funnel yaklasimlari:

- CTA butonlari genel olarak `/iletisim#contact-form` hedefine yonlendirilir.
- Paket kartlari, servis detaylari ve case study detaylari iletisime baglanir.
- Case study sayfalari problem, sistem, sonuc ve kullanilan servisler formatina cekildi.
- Otomasyonlar sayfasi yeni pozisyonlama icin ayri bir funnel girisi olarak eklendi.
- Footer ve header butonlari ile iletisim akisi her sayfadan ulasilabilir hale getirildi.

Gelecekte gelistirilebilecek funnel katmanlari:

- Formda kaynak sayfaya gore otomatik konu secimi.
- Paket CTA'sindan gelen kullanicilar icin ozellestirilmis form metni.
- Case study slug'ina gore formda hidden context tasima.
- Analytics/event tracking.
- CRM veya form backend entegrasyonu.

## Yapilan Ana Gelistirmeler

Projede bugune kadar yapilan temel gelistirmeler:

- Landing page full-width hale getirildi.
- Global font Poppins olarak ayarlandi.
- Buton kontrastlari ve hover davranislari duzenlendi.
- Navbar fixed yapildi ve scroll durumunda glass arka plan eklendi.
- Hizmetlerimiz dropdown mega menu eklendi.
- Tum route'lar Turkcelestirildi.
- Sayfa degisimlerinde scroll'un en uste alinmasi saglandi.
- Iletisim sayfasi section bazli olarak olusturuldu.
- Navbar ve CTA linkleri iletisim formuna baglandi.
- Paketlerde odeme logolari gorsel grid ile duzenlendi.
- Paket ozellik listelerinde marka ikonlu bullet yapisi kullanildi.
- Landing page servis kartlari otomatik kayan carousel mantigina cekildi.
- Hakkimizda, hizmetler, servis detaylari, musteriler, kariyer ve case study sayfalari gorsel referanslara gore yeniden tasarlandi.
- Google Ads, Meta Ads, TikTok Ads ve Amazon Ads sayfalari ortak hero/component mantigina yaklastirildi.
- Mobil uygulama sayfasi eklendi.
- Otomasyonlar sayfasi eklendi.
- Case study icerikleri gercekci pazarlama/otomasyon vakalarina donusturuldu.
- Sidebar renkleri marka paletiyle tutarli hale getirildi.
- Kullanilmayan bazi gorseller temizlendi ve kullanilan gorsellerin bir kismi WebP formatina cekildi.
- Tum buyuk sayfalar section bazli component yapisina ayrildi.

## Otomasyonlar Sayfasi

`/otomasyonlar` sayfasi, Social Tech'in reklam ajansi pozisyonundan otomasyon destekli buyume partneri pozisyonuna gecisini anlatir.

Sayfadaki ana otomasyonlar:

- `PromptIMG by Social Tech MDA`: Brand DNA ile pazar yeri ve sosyal medya metinleri uretir.
- `PromptVisual by Social Tech MDA`: Urun gorsellerini marka diline uygun vitrin gorsellerine donusturur.
- `PromptAnalysis by Social Tech MDA`: Instagram Ads, profil ve web analizini rakiplerle karsilastirir.
- `PromptWhatsApp by Social Tech MDA`: 7/24 cevap, lead sicakligi etiketleme ve WhatsApp mesajlasma akisi sunar.
- `PromptCommander by Social Tech MDA`: Instagram DM ve yorum tetikleyici otomasyonlari kurar.

Sayfa yapisi:

```text
components/automations/
  AutomationHome.tsx
  AutomationSectionTitle.tsx
  automationData.ts
  sections/
    HeroSection.tsx
    ValueSection.tsx
    AutomationGridSection.tsx
    BrandDnaSection.tsx
    AccessSection.tsx
    RoadmapSection.tsx
    CtaSection.tsx
```

## Case Study Yapisi

Case study icerikleri `PortfolioPagesHome.shared.tsx` icindeki `caseStudies` verisiyle beslenir.

Mevcut ornek vakalar:

- `NEV Jewellery`: Growth Hub, Meta Ads ve PromptAnalysis.
- `Sivas Matbaa`: Google Ads ve PromptWhatsApp.
- `Stepbag`: PromptIMG, PromptVisual ve pazaryeri icerik sistemi.

Case study detay route'u:

```text
/calismalar/:id
```

Ornek:

```text
/calismalar/nev-jewellery-growth-sistemi
```

Detay sayfasi su yapida ilerler:

- Hero.
- Kapak gorseli.
- Musteri, tarih, kategori bilgisi.
- Ozet.
- Metrikler.
- Baslangic problemi.
- Kurulan sistem.
- Sonuc ve ogrenimler.
- Kullanilan servisler.
- Iletisim CTA'si.

## Servis Sayfalari

Servisler `components/services` altinda toplanir. Her servis kendi section klasorune sahiptir.

Servis gruplari:

- Overview: `services/overview`
- Growth Hub: `services/growth-hub`
- Social Media: `services/social-media`
- Web App: `services/web-app`
- Mobile App: `services/mobile-app`
- Landing Page: `services/landing-page`
- Amazon Ads: `services/amazon-ads`
- Paid Ads varyantlari: `services/paid-ads`
- Technical ve SEO: `services/technical`

Paid ads varyantlari ayni component setini kullanarak Google, Meta, TikTok ve Digital Marketing Hub sayfalarini besler.

## Asset Stratejisi

Gorseller `client/src/assets` altinda tutulur. Projede PNG, WebP ve SVG dosyalari bulunur.

Kullanilan yaklasim:

- Fotoğraf agirlikli gorsellerde WebP tercih edildi.
- Logo, ikon ve odeme gorsellerinde PNG/SVG korundu.
- Payment logo gorselleri `PaymentLogos` componentinde grid yapisiyla kullanilir.
- Case study ve servis gorselleri feature shared dosyalarinda import edilir.

Not:

- Asset dosya isimleri buyuk oranda Figma/export hash adlariyla gelmistir.
- Ileride assetleri semantik isimlerle yeniden adlandirmak bakim kolayligi saglar.

## Kod Organizasyon Prensipleri

Bu projede su prensipler hedeflenir:

- Page dosyalari ince kalmali.
- Her buyuk sayfa section'lara bolunmeli.
- Ortak UI/site componentleri `components/site` veya `components/ui` altinda tutulmali.
- Sayfa verileri mumkunse `*.shared.tsx` veya feature data dosyalarinda toplanmali.
- CTA linkleri merkezi funnel hedeflerine baglanmali.
- Yeni route eklenince header, footer ve route map birlikte dusunulmeli.
- Marka rengi olarak ana accent `#aaff01` korunmali.
- Buyuk statik sayfalarda lazy page import pattern'i surdurulmeli.

## Yeni Sayfa Ekleme Rehberi

Yeni bir sayfa eklemek icin onerilen pattern:

```text
client/src/app/pages/NewPage.tsx
client/src/app/components/new-page/NewPageHome.tsx
client/src/app/components/new-page/newPageData.ts
client/src/app/components/new-page/sections/HeroSection.tsx
client/src/app/components/new-page/sections/ContentSection.tsx
client/src/app/components/new-page/sections/CtaSection.tsx
```

Route ekleme:

```tsx
{
  path: "yeni-route",
  lazy: lazyPage(() => import("./pages/NewPage")),
}
```

Gerekiyorsa:

- `SiteHeader` nav item guncellenir.
- `SiteFooter` link listesi guncellenir.
- `footerLinks.ts` label-to-route eslesmesi eklenir.

## Form ve Iletisim Akisi

Iletisim sayfasi `components/contact` altinda section'lara ayrilmistir.

Ana hedef:

```text
/iletisim#contact-form
```

CTA'larin buyuk bolumu bu hedefe yonlendirilir. Su an form front-end seviyesinde kurgulanmistir. Backend, CRM, e-posta veya webhook entegrasyonu ayrica yapilmalidir.

## Build ve Performans Notlari

Vite build sonucunda route bazli lazy chunk'lar uretilir. Bu, tek buyuk bundle yerine sayfa bazli yukleme saglar.

Performans icin mevcut adimlar:

- Sayfalar lazy import edilir.
- Gorsellerin bir kismi WebP formatinda kullanilir.
- Header/footer global, sayfa icerikleri route bazli yuklenir.
- Animasyonlarda `prefers-reduced-motion` kontrolu vardir.

Ileride yapilabilecekler:

- Asset isimlerini semantik hale getirmek.
- Kritik gorseller icin responsive image stratejisi eklemek.
- Form submit backend entegrasyonu yapmak.
- Analytics event tracking eklemek.
- SEO icin metadata, sitemap ve Open Graph katmanini guclendirmek.
- Pazarlama sitesi organik trafik hedefliyorsa Next.js migration degerlendirmek.

## Bilinen Teknik Notlar

- Proje su an React SPA olarak calisir.
- SEO ve metadata ihtiyaclari buyurse Next.js daha uygun olabilir.
- `dist` klasoru build ciktisidir ve build aldikca hash'li dosya adlari degisir.
- `node_modules` repoya dahil edilmemelidir.
- Google Fonts importu dis kaynak uzerinden yapilir. Ileride performans ve gizlilik icin font self-host edilebilir.

## Scriptler

`client/package.json` icindeki scriptler:

```json
{
  "dev": "vite",
  "build": "vite build"
}
```

Kullanim:

```bash
cd client
npm run dev
npm run build
```

## Kisa Bakim Checklist'i

Yeni bir degisiklikten sonra kontrol edilmesi onerilenler:

- `npm run build` basarili mi?
- Yeni route `routes.tsx` icinde tanimli mi?
- Header/footer linkleri gerekiyorsa guncellendi mi?
- CTA'lar dogru hedefe gidiyor mu?
- Mobil gorunumde hero, kartlar ve paketler okunabilir mi?
- Case study ve servis sayfalari iletisim funnel'ina bagli mi?
- Kullanilmayan asset veya import kaldi mi?

