import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  MousePointerClick,
  Package2,
  Radar,
  Search,
  TrendingUp,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import journeyMeetingImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.webp";
import journeyAccountImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.webp";
import journeyDashboardImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import campaignIcon from "../../../assets/20b545e325c1fc86b38c36656bdc928249b39d46.png";
import messageIcon from "../../../assets/ee91d4126ebf0bdfd37b879f86b9839c287bc57a.png";
import reportIcon from "../../../assets/fcf622c22ef809497405a6660ea02eb1e5f5413a.png";
import funnelIcon from "../../../assets/3b88aa7f8e7ac3a09e3f1acb949227f9ab751fd9.png";
import chartIcon from "../../../assets/8dacb8994760db1a7aa98d47687dce9f55539c78.png";
import usersIcon from "../../../assets/b5bc57e22da71da488d6b9fa0268f7575c1723db.png";
import calendarIcon from "../../../assets/23657017fdc0a77a72af39e7b0ed443979cbaad6.png";
import dashboardIcon from "../../../assets/d407dea157c52e067680066f8673e56861aa712d.png";
import metaIcon from "../../../assets/d43da89db0c2a2b78870fab297e0e0f98b68f495.png";
import googleIcon from "../../../assets/e80c12d7d243fc323a8867f2a6a3263de1df33ec.png";
import tiktokIcon from "../../../assets/454c2b753d70ef1472d3f48eedc56f175ba222ed.png";
import amazonIcon from "../../../assets/e2bade60eed0030d6f1fd1267fcf625413e69dd1.png";
import strategyIcon from "../../../assets/86807eaf476a19fe8cbcf24fa2b6cf397effa13f.png";
import graphIcon from "../../../assets/1a1264ec57c6d1d57d8418dc6d762ca9bf928bce.png";
import targetIcon from "../../../assets/a903539906664b9108e6ace0fad3471aee423915.png";
import searchIcon from "../../../assets/593a305cc9e6eee5b1dfd1dde5725e2ef2aa18bd.png";
import fastIcon from "../../../assets/d52d33bba0d97eb37756e8118a5a7a7a5f66327c.png";
import gaugeIcon from "../../../assets/0e435bae15483a5150108eaa499b08c062eeee4c.png";
import googleStructureIcon from "../../../assets/0464b2c3bd79d9b55b1e8548a3e35c638bbc2b40.png";
import googleTestIcon from "../../../assets/feeed10e065d5fc6320f0698debed36be07caad4.png";
import googleAdsIcon from "../../../assets/c3e3451feb75472ce9b04e3bcba2f1ba3ab66f34.png";
import googleReportIcon from "../../../assets/555456237a98b7b32406ead4541bd98a1b30fe4b.png";
import metaStructureIcon from "../../../assets/3864c0434c3ac460593c0467cdf6362f5e6a7a44.png";
import metaTestIcon from "../../../assets/bd3a6d4989b819ebf260ec3d84dc9dbf42bf58c2.png";
import metaAdsIcon from "../../../assets/c4de41dc2fe87fc3e58805ddb85ffd1b95496cca.png";
import metaReportIcon from "../../../assets/e35ae1ab9ab3d9ade0494e90bffa2ed5867e98b9.png";
import starterPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import growthPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import { getFooterLinkTarget } from "../site/footerLinks";

export type PaidAdsVariant = "digital-marketing-hub" | "google-ads" | "meta-ads" | "tiktok-ads";

export type TileData = {
  title: string;
  description: string;
  icon: string;
};

export type FeatureData = {
  label: string;
  icon: string;
};

export type PackageData = {
  name: string;
  description: string;
  price: string;
  suffix?: string;
  note: string;
  cta: string;
  icon: string;
  accent: "cyan" | "lime" | "violet";
  badge?: string;
  features: string[];
};

export type HeroVisualData = {
  platform: string;
  icon: string;
  shelfLabel: string;
  channels: string[];
  searchRows: [string, string][];
  primaryMetric: string;
  primaryLabel: string;
  secondaryMetric: string;
  secondaryLabel: string;
};

export type VariantData = {
  badge: string;
  heroTitle: ReactNode;
  heroText: ReactNode;
  primaryCta: string;
  heroVisual: HeroVisualData;
  intro: {
    prefix: string;
    highlight: string;
    description: string;
    tone: "lime" | "violet";
    cards: TileData[];
  };
  journey: boolean;
  features: {
    title: string;
    highlight: string;
    description: string;
    tone: "lime" | "violet";
    items: FeatureData[];
  };
  platforms?: TileData[];
  process: {
    prefix: string;
    highlight: string;
    description?: string;
    cards: TileData[];
    splitIntro?: TileData[];
  };
  packages: {
    description: string;
    cards: PackageData[];
    footer: ReactNode;
  };
};

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const defaultAdFeatures: FeatureData[] = [
  { label: "Kampanya Kurulumu", icon: campaignIcon },
  { label: "A/B Testleri", icon: messageIcon },
  { label: "Haftalık / Aylık Raporlama", icon: reportIcon },
  { label: "Funnel & Dönüşüm Yapısı", icon: funnelIcon },
  { label: "Bütçe Optimizasyonu", icon: chartIcon },
  { label: "Meta Business Yönetimi", icon: usersIcon },
  { label: "Kreatif & Metin Yönlendirme", icon: calendarIcon },
  { label: "Pixel & Event Takibi", icon: chartIcon },
  { label: "Özel Dashboard", icon: dashboardIcon },
];

export const googleFeatures: FeatureData[] = [
  { label: "Google Ads hesap kurulumu", icon: campaignIcon },
  { label: "Reklam metni & uzantı", icon: messageIcon },
  { label: "Sürekli optimizasyon", icon: reportIcon },
  { label: "Anahtar kelime & rakip analizi", icon: funnelIcon },
  { label: "Teklif stratejileri (CPC / CPA)", icon: chartIcon },
  { label: "Aylık performans raporu", icon: usersIcon },
  { label: "Search & Display kampanyaları", icon: calendarIcon },
  { label: "Dönüşüm & GA4 entegrasyonu", icon: chartIcon },
  { label: "Özel Dashboard", icon: dashboardIcon },
];

export const tiktokFeatures: FeatureData[] = [
  { label: "TikTok Ads hesap kurulumu", icon: campaignIcon },
  { label: "Hook & açılış optimizasyonu", icon: messageIcon },
  { label: "Sürekli optimizasyon", icon: reportIcon },
  { label: "Kampanya & hedefleme yapısı", icon: funnelIcon },
  { label: "A/B testleri", icon: chartIcon },
  { label: "Aylık performans raporu", icon: usersIcon },
  { label: "Video kreatif yönlendirmesi", icon: calendarIcon },
  { label: "Pixel & event entegrasyonu", icon: chartIcon },
  { label: "Özel Dashboard", icon: dashboardIcon },
];

export const journeyCards = [
  {
    eyebrow: "Üye Olun ve",
    title: "Önce Ekibimizle Bir Toplantı Yapın!",
    description:
      "Sistem üzerinden marka/influencer hesabınızı oluşturun ve sizin için oluşturulan ekibinizle hemen bir toplantı planlayın.",
    image: journeyMeetingImage,
    tone: "lime" as const,
  },
  {
    eyebrow: "Toplantıdan sonra",
    title: "Marka hesabınız ile Satın Alım Yapın!",
    description: "Toplantı sonrası sistemimizi kullanarak sizler için oluşturulmuş olan linkten satın alımınızı gerçekleştirin.",
    image: journeyAccountImage,
    tone: "light" as const,
  },
  {
    eyebrow: "Her Türlü Paylaşımı",
    title: "Sistem Üzerinden Onaylayın, Paylaşalım!",
    description:
      "Toplantıda konuşulan talepler doğrultusunda hazırlanan içerikleri dashboard'unuzda sunar, onayınızdan sonra yayına alırız.",
    image: journeyDashboardImage,
    tone: "violet" as const,
  },
];

export const mediaHubPackage: PackageData = {
  name: "Medya Hub Paketi",
  description:
    "Dijitalde var olmak yetmez; büyümek gerekir. Reklam süreçlerinizi ölçeklenebilir hale getirir.",
  price: "39.000 ₺",
  suffix: "/ ay",
  note: "Tüm reklam kanalları tek strateji, tek rapor ve tek hedefte birleşir.",
  cta: "Büyüme Görüşmesi",
  icon: scalePackageIcon,
  accent: "violet",
  badge: "Tek paket tüm reklamlar",
  features: [
    "Meta + Google + TikTok + Amazon Ads yönetimi",
    "Kanal bazlı strateji planlama",
    "Funnel & dönüşüm yapısı",
    "Kreatif & metin yönlendirme",
    "A/B testleri",
    "Haftalık optimizasyon",
    "Pixel & event entegrasyonları",
    "Tek panel performans takibi",
    "Tek genel performans raporu",
    "1 haftalık öncelikli strateji toplantısı",
  ],
};

export const googlePackages: PackageData[] = [
  {
    name: "Marka Bilinirliği Paketi",
    description: "Yeni başlayanlar ve küçük işletmeler için ideal paket.",
    price: "12.500 ₺",
    suffix: "/ proje",
    note: "Google tarafında kontrollü başlangıç isteyen markalar için.",
    cta: "Hızlıca Yayına Al",
    icon: starterPackageIcon,
    accent: "cyan",
    features: [
      "Google Ads & Google Business hesabı kurulumu",
      "Search kampanyası (marka + temel anahtar kelimeler)",
      "Temel metin & uzantı yapılandırması",
      "Temel anahtar kelime & rakip analizi",
      "Negatif anahtar kelime kurulumu",
      "Temel dönüşüm takibi",
      "Aylık performans raporu",
    ],
  },
  {
    name: "Satış Odaklı Büyüme Paketi",
    description: "Satış, form veya lead odaklı çalışan Google Ads'ten düzenli dönüşüm almak isteyen markalar.",
    price: "24.900 ₺",
    suffix: "/ tek seferlik",
    note: "Satış ve lead akışını ölçülebilir kampanya sistemine bağlar.",
    cta: "Dönüşüm Odaklı Sayfa İstiyorum",
    icon: growthPackageIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Search + Display kampanya yapısı",
      "Satın alma niyeti yüksek anahtar kelime grupları",
      "A/B testli reklam metinleri",
      "Reklam uzantıları",
      "Gelişmiş negatif anahtar kelime yönetimi",
      "Teklif stratejileri (CPC / CPA)",
      "GA4 & dönüşüm entegrasyonu",
      "Haftalık optimizasyon & bütçe yönetimi",
      "Detaylı performans takibi",
      "Landing page öneri raporu",
    ],
  },
  {
    name: "Reklam Performans+ Paketi",
    description: "Büyük ölçekli projeler için tam hizmet paketi.",
    price: "45.900 ₺",
    suffix: "/ tek seferlik",
    note: "Yüksek hacimli Google Ads hesapları için derin optimizasyon.",
    cta: "Satış Sistemi Kuralım",
    icon: scalePackageIcon,
    accent: "violet",
    features: [
      "Çok kampanyalı Search yapısı",
      "Display & remarketing kampanyaları",
      "Funnel bazlı Google Ads stratejisi",
      "Sürekli metin & copy testleri",
      "Günlük optimizasyon & ölçekleme",
      "ROAS / CPA odaklı bütçe yönetimi",
      "Özel dashboard & özel seviye raporlama",
      "Öncelikli destek & strateji görüşmeleri",
    ],
  },
];

export const metaPackages: PackageData[] = [
  {
    name: "Marka Bilinirliği Paketi",
    description: "Meta Ads'e yeni başlayanlar veya küçük bütçeyle deneme yapmak isteyen markalar.",
    price: "14.900 ₺",
    suffix: "/ ay",
    note: "Meta reklam düzeni, temiz ve profesyonel görünür.",
    cta: "Tanışma Görüşmesi",
    icon: starterPackageIcon,
    accent: "cyan",
    features: [
      "Meta Business & Ads hesabı kurulumu",
      "Kampanya + temel funnel yapısı",
      "2-3 kreatif test süreci",
      "Temel hedef kitle ayarları",
      "Pixel & dönüşüm kontrolü",
      "Aylık performans raporu",
      "Aylık raporlama (Reklam ve Strateji)",
    ],
  },
  {
    name: "Satış Odaklı Büyüme Paketi",
    description: "Dijitalde var olmak yetmez; büyümek gerekir. Reklam süreçlerinizi ölçeklenebilir hale getirir.",
    price: "27.500 ₺",
    suffix: "/ ay",
    note: "Büyümeyi reklam sisteminin merkezine alan markalar için.",
    cta: "Büyüme Görüşmesi",
    icon: growthPackageIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Gelişmiş kampanya & funnel kurulumu",
      "A/B testli kreatif ve hedef kitle yapısı",
      "Haftalık optimizasyon ve bütçe yönetimi",
      "Meta Pixel & event optimizasyonu",
      "Detaylı performans takibi",
      "Haftalık not + aylık detaylı rapor",
      "2 haftada bir online toplantı",
    ],
  },
  {
    name: "Reklam Performans+ Paketi",
    description: "ROAS & ölçekleme odaklı yüksek bütçeli, performans ve büyüme hedefleyen markalar için ideal paket.",
    price: "İletişime Geçin*",
    note: "Sosyal medya bir vitrin değil, güçlü bir marka kanalıdır.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: scalePackageIcon,
    accent: "violet",
    features: [
      "Çok kampanyalı gelişmiş yapı",
      "Funnel bazlı reklam stratejisi",
      "Sürekli kreatif & copy testleri",
      "Günlük optimizasyon & ölçekleme",
      "ROAS ve CPA odaklı bütçe yönetimi",
      "Özel dashboard & ileri seviye raporlama",
    ],
  },
];

export const tiktokPackages: PackageData[] = [
  {
    name: "Keşif & Başlangıç Paketi",
    description: "TikTok Ads'e yeni başlayanlar veya küçük bütçeyle deneme yapmak isteyen markalar.",
    price: "13.500 ₺",
    suffix: "/ ay",
    note: "TikTok algoritmasına uygun hızlı test ve öğrenme paketi.",
    cta: "Tanışma Görüşmesi",
    icon: starterPackageIcon,
    accent: "cyan",
    features: [
      "TikTok Business & Ads hesabı kurulumu",
      "Kampanya + temel funnel yapısı",
      "2-3 kreatif test süreci",
      "Temel hedef kitle ayarları",
      "Pixel & dönüşüm kontrolü",
      "Aylık performans raporu",
      "Aylık raporlama (Reklam ve Strateji)",
    ],
  },
  {
    name: "Satış Odaklı Büyüme Paketi",
    description: "Dijitalde var olmak yetmez; büyümek gerekir. Reklam süreçlerinizi ölçeklenebilir hale getirir.",
    price: "26.900 ₺",
    suffix: "/ ay",
    note: "TikTok'ta kreatif testleri satış sistemine bağlamak isteyenler için.",
    cta: "Büyüme Görüşmesi",
    icon: growthPackageIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Gelişmiş kampanya & funnel kurulumu",
      "A/B testli kreatif ve hedef kitle yapısı",
      "Haftalık optimizasyon ve bütçe yönetimi",
      "Meta Pixel & event optimizasyonu",
      "Detaylı performans takibi",
      "Haftalık not + aylık detaylı rapor",
      "2 haftada bir online toplantı",
    ],
  },
  {
    name: "Reklam Performans+ Paketi",
    description: "ROAS & ölçekleme odaklı yüksek bütçeli, performans ve büyüme hedefleyen markalar için ideal paket.",
    price: "İletişime Geçin*",
    note: "Yüksek hacimli hesaplarda kreatif ve bütçe optimizasyonu.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: scalePackageIcon,
    accent: "violet",
    features: [
      "Çok kampanyalı gelişmiş yapı",
      "Funnel bazlı reklam stratejisi",
      "Sürekli kreatif & copy testleri",
      "Günlük optimizasyon & ölçekleme",
      "ROAS ve CPA odaklı bütçe yönetimi",
      "Özel dashboard & ileri seviye raporlama",
    ],
  },
];

export const analyticsIconFallback = reportIcon;

export const variants: Record<PaidAdsVariant, VariantData> = {
  "digital-marketing-hub": {
    badge: "Media ADS",
    heroTitle: (
      <>
        Tüm Reklam Kanallarınızı
        <br />
        Tek Bir Büyüme Sisteminde
        <br />
        Büyütün!
      </>
    ),
    heroText: (
      <>
        <span className="font-extrabold text-[#aaff01]">Meta, Google ve TikTok</span> reklamlarını ayrı ayrı değil,
        <span className="mx-2 font-extrabold text-[#aaff01]">tek bir strateji ve tek bir hedefle</span>
        yönetiyoruz.
      </>
    ),
    primaryCta: "Ücretsiz Hesap Analizi",
    heroVisual: {
      platform: "Media Hub",
      icon: targetIcon,
      shelfLabel: "omnichannel command",
      channels: ["Meta", "Google", "TikTok", "Amazon"],
      searchRows: [
        ["Kanal bütçe dengesi", "ROAS 4.2"],
        ["Lead funnel kontrolü", "CPA -18%"],
        ["Kreatif test akışı", "CVR +31%"],
      ],
      primaryMetric: "4 Kanal",
      primaryLabel: "tek strateji",
      secondaryMetric: "Tek KPI",
      secondaryLabel: "büyüme panosu",
    },
    intro: {
      prefix: "Neden",
      highlight: "Media Hub?",
      description: "Neden ayrı hizmetleri satın almak yerine Media Hub almalıyım?",
      tone: "violet",
      cards: [
        { title: "Tek Strateji", description: "Kanallar birbirinden bağımsız değil, beraber besleyecek şekilde çalışır.", icon: strategyIcon },
        { title: "Tek Raporlama", description: "Tüm performans tek ekranda, tek metrikle değerlendirilir.", icon: graphIcon },
        { title: "Tek Hedef", description: "Görünürlük değil, ölçülebilir büyüme ve satış.", icon: targetIcon },
      ],
    },
    journey: true,
    features: {
      title: "Media Hub Paketinin",
      highlight: "Hizmet Özellikleri",
      description: "Satın alacağınız medya hub paketinin özellikleri aşağıdaki gibi oluşturulmuştur.",
      tone: "violet",
      items: defaultAdFeatures,
    },
    platforms: [
      { title: "Meta Ads", description: "Kullanıcı zaten arıyor, biz doğru anda karşısına çıkarız.", icon: metaIcon },
      { title: "Google Ads", description: "Doğru kullanıcıya kısa sürede dönüşüm alırız.", icon: googleIcon },
      { title: "TikTok Ads", description: "Tıklama, dönüşüm ve maliyet net şekilde takip edilir.", icon: tiktokIcon },
      { title: "Amazon Ads", description: "Tıklama, dönüşüm ve maliyet net şekilde takip edilir.", icon: amazonIcon },
    ],
    process: {
      prefix: "Media Hub",
      highlight: "Nasıl Çalışır?",
      cards: [
        { title: "Analiz & Strateji", description: "Tüm kanallar için ortak hedef ve yol haritası belirlenir.", icon: strategyIcon },
        { title: "Kampanya Kurulumu", description: "Her platformda role uygun kampanyalar kurulur.", icon: campaignIcon },
        { title: "Test & Optimizasyon", description: "Veriye göre bütçe ve kreatifler optimize edilir.", icon: chartIcon },
        { title: "Raporlama", description: "Tek panelden kanal bazlı performans izlenir.", icon: reportIcon },
      ],
      splitIntro: [
        { title: "Birden fazla kanalda reklam vermek isteyenler", description: "", icon: campaignIcon },
        { title: "Satış veya lead hedefi olan markalar", description: "", icon: usersIcon },
        { title: "Reklamı deneme değil sistem olarak görenler", description: "", icon: messageIcon },
        { title: "Orta-yüksek bütçeyle ölçeklemek isteyenler", description: "", icon: targetIcon },
      ],
    },
    packages: {
      description: "Media Hub için en iyi hizmeti en uygun fiyata sadece tek pakette sahip olun. Üstelik fiyat olarak en uygun fiyata erişin!",
      cards: [mediaHubPackage],
      footer: (
        <>
          Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
          <Link className="mx-2 font-bold text-[#aaff01] underline" to="/iletisim#contact-form">
            formu
          </Link>
          doldurun, beraber karar verelim!
        </>
      ),
    },
  },
  "google-ads": {
    badge: "Google ADS",
    heroTitle: (
      <>
        Google Ads ile
        <br />
        Satın Almaya Hazır Kullanıcılara
        <br />
        Ulaşın
      </>
    ),
    heroText: (
      <>
        Arama niyeti <span className="font-extrabold text-[#aaff01]">yüksek kullanıcıları hedefleyen, ölçülebilir ve optimize edilmiş</span>
        reklam sistemleri kuruyoruz.
      </>
    ),
    primaryCta: "Ücretsiz Hesap Analizi",
    heroVisual: {
      platform: "Google Ads",
      icon: googleIcon,
      shelfLabel: "search intent engine",
      channels: ["Search", "PMax", "Display"],
      searchRows: [
        ["satın almaya hazır kullanıcı", "CPA -22%"],
        ["hizmet fiyatı araştırması", "CVR +28%"],
        ["rakip marka sorguları", "ROAS 5.1"],
      ],
      primaryMetric: "%92",
      primaryLabel: "yüksek niyet",
      secondaryMetric: "ROAS",
      secondaryLabel: "net takip",
    },
    intro: {
      prefix: "",
      highlight: "GOOGLE ADS ≠ SOSYAL MEDYA",
      description: "Google reklamları ile sosyal medya paketleri / meta reklam paketi aynı şeylerdir farkı gözlemlemek için kartlara göz at!",
      tone: "violet",
      cards: [
        { title: "Yüksek Niyet", description: "Kullanıcı zaten arıyor, biz doğru anda karşısına çıkarız.", icon: searchIcon },
        { title: "Hızlı Sonuç", description: "Doğru kurulumla kısa sürede dönüşüm alınır.", icon: fastIcon },
        { title: "Ölçülebilir Performans", description: "Tıklama, dönüşüm ve maliyet net şekilde takip edilir.", icon: gaugeIcon },
      ],
    },
    journey: true,
    features: {
      title: "Google Reklam (Ads) Paketinin",
      highlight: "Hizmet Özellikleri",
      description: "Satın alacağınız Google Ads paketinin özellikleri aşağıdaki gibi oluşturulmuştur.",
      tone: "lime",
      items: googleFeatures,
    },
    process: {
      prefix: "",
      highlight: "Nasıl Çalışıyoruz?",
      cards: [
        { title: "Anahtar Kelime Analizi", description: "Satın alma niyeti yüksek anahtar kelimeleri belirleriz.", icon: searchIcon },
        { title: "Kampanya & Yapı Kurulumu", description: "Search ve Display kampanyalarını dönüşüm odaklı kurarız.", icon: googleStructureIcon },
        { title: "Test & Optimizasyon Süreci", description: "Anahtar kelime, teklif ve reklam metinlerini optimize ederiz.", icon: googleTestIcon },
        { title: "Raporlama & Ölçekleme", description: "Kazanan kampanyaları büyütür, artırırız.", icon: googleReportIcon },
      ],
    },
    packages: {
      description: "Landing Page için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için sayfamızı ziyaret etmeyi unutmayın!",
      cards: googlePackages,
      footer: (
        <>
          Reklam bütçesi <span className="font-bold text-[#aaff01]">Google'a</span> doğrudan ödenir.
          <br />
          Paket ücretleri yalnızca strateji, kurulum, yönetim ve optimizasyon hizmetlerini kapsar.
        </>
      ),
    },
  },
  "meta-ads": {
    badge: "Meta ADS",
    heroTitle: (
      <>
        Meta Reklamlarını
        <br />
        Ölçeklenebilir Büyüme Sistemine
        <br />
        Dönüştürün
      </>
    ),
    heroText: (
      <>
        Test edilen, optimize edilen ve <span className="font-extrabold text-[#aaff01]">satışa dönen reklam sistemleri</span>
        kuruyoruz.
      </>
    ),
    primaryCta: "Ücretsiz Hesap Analizi",
    heroVisual: {
      platform: "Meta Ads",
      icon: metaIcon,
      shelfLabel: "creative test system",
      channels: ["TOF", "MOF", "BOF"],
      searchRows: [
        ["hook testleri", "CTR +34%"],
        ["funnel retargeting", "CPA -19%"],
        ["kreatif yenileme", "ROAS 3.8"],
      ],
      primaryMetric: "3 Katman",
      primaryLabel: "funnel mimarisi",
      secondaryMetric: "7 Gün",
      secondaryLabel: "test döngüsü",
    },
    intro: {
      prefix: "Meta Reklamları Post Değil,",
      highlight: "Bir Sistemdir",
      description:
        "Meta reklamları, Instagram sayfasının düzeninden veya post paylaşımından sorumlu değildir; sizin satış yapabileceğiniz reklam yönetimidir.",
      tone: "lime",
      cards: [
        { title: "Strateji", description: "Hedef kitle, funnel ve teklif yapısı netleştirilir.", icon: analyticsIconFallback },
        { title: "Test", description: "Kreatifler, copy'ler ve hedeflemeler test edilir.", icon: analyticsIconFallback },
        { title: "Optimizasyon", description: "Veriye göre bütçe ve kampanyalar optimize edilir.", icon: analyticsIconFallback },
        { title: "Ölçekleme", description: "Kazanan kampanyalar kontrollü şekilde büyütülür.", icon: analyticsIconFallback },
      ],
    },
    journey: true,
    features: {
      title: "Meta Reklam (Ads) Paketinin",
      highlight: "Hizmet Özellikleri",
      description: "Satın alacağınız Meta Ads paketinin özellikleri aşağıdaki gibi oluşturulmuştur.",
      tone: "violet",
      items: defaultAdFeatures,
    },
    process: {
      prefix: "",
      highlight: "Nasıl Çalışıyoruz?",
      cards: [
        { title: "Hesap & Hedef Analizi", description: "Reklam hesabını ve büyüme hedeflerini netleştiriyoruz.", icon: metaStructureIcon },
        { title: "Kampanya & Funnel Kurulumu", description: "Dönüşüm odaklı kampanya ve funnel yapısını kurarız.", icon: metaAdsIcon },
        { title: "Test & Optimizasyon Süreci", description: "Veriye göre test edilen reklamları optimize ederiz.", icon: metaTestIcon },
        { title: "Raporlama & Ölçekleme", description: "Kazanan kampanyaları ölçekleriz.", icon: metaReportIcon },
      ],
    },
    packages: {
      description: "Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için sayfamızı ziyaret etmeyi unutmayın!",
      cards: metaPackages,
      footer: (
        <>
          Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
          <Link className="mx-2 font-bold text-[#aaff01] underline" to="/iletisim#contact-form">
            formu
          </Link>
          doldurun, beraber karar verelim!
        </>
      ),
    },
  },
  "tiktok-ads": {
    badge: "Tiktok ADS",
    heroTitle: (
      <>
        TikTok Reklamları ile
        <br />
        Markanızı Keşfe Açın, Yeni Pazarda
        <br />
        Yerinizi Alın!
      </>
    ),
    heroText: (
      <>
        Algoritmaya uygun, <span className="font-extrabold text-[#aaff01]">doğal ve performans odaklı</span> TikTok reklam sistemleri kuruyoruz.
      </>
    ),
    primaryCta: "Ücretsiz Tiktok Ads Analizi",
    heroVisual: {
      platform: "TikTok Ads",
      icon: tiktokIcon,
      shelfLabel: "discovery growth loop",
      channels: ["Hook", "UGC", "Spark"],
      searchRows: [
        ["ilk 3 saniye hook", "VTR +41%"],
        ["keşfet akışı kreatifi", "CPA -16%"],
        ["spark ads testi", "CTR +27%"],
      ],
      primaryMetric: "3 sn",
      primaryLabel: "hook savaşı",
      secondaryMetric: "UGC",
      secondaryLabel: "native kreatif",
    },
    intro: {
      prefix: "",
      highlight: "TIKTOK ADS ≠ KLASİK REKLAM",
      description: "Google reklamları ile sosyal medya paketleri / meta reklam paketi aynı şeylerdir farkı gözlemlemek için kartlara göz at!",
      tone: "lime",
      cards: [
        { title: "Keşif Odaklı", description: "Kullanıcı aramaz, algoritma doğru içeriği doğru kişiye gösterir.", icon: searchIcon },
        { title: "Doğal & Akış içinde", description: "Reklam değil, içerik gibi görünen kampanyalar.", icon: fastIcon },
        { title: "Hızlı Etkileşim", description: "Kısa sürede görünürlük ve geri dönüş.", icon: gaugeIcon },
      ],
    },
    journey: true,
    features: {
      title: "Tiktok Reklam (Ads) Paketinin",
      highlight: "Hizmet Özellikleri",
      description: "Satın alacağınız TikTok Ads paketinin özellikleri aşağıdaki gibi oluşturulmuştur.",
      tone: "violet",
      items: tiktokFeatures,
    },
    process: {
      prefix: "",
      highlight: "Nasıl Çalışıyoruz?",
      cards: [
        { title: "Hesap & Hedef Analizi", description: "Marka, hedef kitle ve içerik potansiyeli analiz edilir.", icon: metaStructureIcon },
        { title: "Kampanya & Kreatif Kurulumu", description: "TikTok formatına uygun kampanya ve kreatif yapı kurulur.", icon: metaAdsIcon },
        { title: "Test & Optimizasyon Süreci", description: "Video, hook ve hedef kitle test edilerek optimize edilir.", icon: metaTestIcon },
        { title: "Raporlama & Ölçekleme", description: "Başarılı içerik bütçe artırılarak büyütülür.", icon: metaReportIcon },
      ],
    },
    packages: {
      description: "Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için sayfamızı ziyaret etmeyi unutmayın!",
      cards: tiktokPackages,
      footer: (
        <>
          Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
          <Link className="mx-2 font-bold text-[#aaff01] underline" to="/iletisim#contact-form">
            formu
          </Link>
          doldurun, beraber karar verelim!
        </>
      ),
    },
  },
};

export function SectionHeading({
  prefix,
  highlight,
  center = false,
  highlightTone = "lime",
}: {
  prefix: string;
  highlight: string;
  center?: boolean;
  highlightTone?: "lime" | "violet";
}) {
  const highlightClass = highlightTone === "lime" ? "bg-[#aaff01] text-black" : "bg-[#8a38f5] text-white";

  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight text-white md:text-[42px]">
        {prefix ? <span>{prefix} </span> : null}
        <span className={`inline-block rotate-[-1deg] px-3 py-1 ${highlightClass}`}>{highlight}</span>
      </h2>
    </div>
  );
}

export function TileCard({ title, description, icon, tone }: TileData & { tone: "lime" | "violet" }) {
  const shell =
    tone === "lime"
      ? "bg-[#aaff01] text-black"
      : "bg-[linear-gradient(180deg,#8a38f5_0%,#51218f_100%)] text-white";
  const muted = tone === "lime" ? "text-black/66" : "text-white/70";

  return (
    <article className={`rounded-lg p-7 text-center ${shell}`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
        <img alt="" className="h-9 w-9 object-contain" src={icon} />
      </div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className={`mt-3 text-sm leading-6 ${muted}`}>{description}</p>
    </article>
  );
}

export function JourneyCard({
  eyebrow,
  title,
  description,
  image,
  tone,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  tone: "lime" | "light" | "violet";
}) {
  const tones = {
    lime: "bg-[#aaff01] text-[#13170a]",
    light: "bg-[#d9d9d9] text-[#181818]",
    violet: "bg-[#8a38f5] text-white",
  }[tone];

  const muted = tone === "violet" ? "text-white/76" : "text-[#171717]/72";

  return (
    <article className={`rounded-lg p-7 ${tones}`}>
      <p className="text-lg font-medium">{eyebrow}</p>
      <h3 className="mt-4 text-[26px] font-bold leading-tight">{title}</h3>
      <p className={`mt-5 text-sm leading-6 ${muted}`}>{description}</p>
      <div className="mt-8 overflow-hidden rounded-lg bg-black/10">
        <img alt={title} className="h-[240px] w-full object-cover" src={image} />
      </div>
    </article>
  );
}

export function FeatureTile({ label, icon, tone }: FeatureData & { tone: "lime" | "violet" }) {
  const shell = tone === "lime" ? "bg-black/14 text-black" : "bg-white/14 text-white";

  return (
    <article className={`rounded-lg px-6 py-5 ${shell}`}>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-black/20 p-3">
          <img alt="" className="h-6 w-6 object-contain" src={icon} />
        </div>
        <h3 className="text-base font-semibold">{label}</h3>
      </div>
    </article>
  );
}

export function ProcessCard({ title, description, icon }: TileData) {
  return (
    <article className="rounded-lg bg-white/14 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black">
        <img alt="" className="h-8 w-8 object-contain" src={icon} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/66">{description}</p>
    </article>
  );
}

export function PackageCard({ name, description, price, suffix, note, cta, icon, accent, badge, features }: PackageData) {
  const tones = {
    cyan: {
      shell: "from-[#00a2e5] to-[#111823]",
      title: "text-white",
      body: "text-white/84",
      price: "text-white",
      iconShell: "bg-black/24",
      button: "cyan" as const,
      note: "text-white/62",
      feature: "text-white/84",
      check: "text-[#8ce2ff]",
    },
    lime: {
      shell: "from-[#aaff01] to-[#587f00]",
      title: "text-[#11160c]",
      body: "text-[#11160c]/80",
      price: "text-[#11160c]",
      iconShell: "bg-black",
      button: "lime" as const,
      note: "text-[#101505]/78",
      feature: "text-[#12180f]",
      check: "text-[#213500]",
    },
    violet: {
      shell: "from-[#8a38f5] to-[#171122]",
      title: "text-white",
      body: "text-white/82",
      price: "text-white",
      iconShell: "bg-white",
      button: "violet" as const,
      note: "text-white/62",
      feature: "text-white/84",
      check: "text-[#d4bcff]",
    },
  }[accent];

  return (
    <article className={`relative rounded-lg bg-gradient-to-b ${tones.shell} p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]`}>
      {badge ? (
        <div className="absolute right-4 top-4 rotate-[24deg] rounded-md bg-[#303030] px-4 py-2 text-center text-xs font-bold uppercase text-[#aaff01]">
          {badge}
        </div>
      ) : null}
      <div className={`mb-7 inline-flex rounded-full p-4 ${tones.iconShell}`}>
        <img alt={name} className="h-10 w-10 object-contain" src={icon} />
      </div>
      <h3 className={`text-[26px] font-bold leading-tight ${tones.title}`}>{name}</h3>
      <p className={`mt-4 text-sm leading-6 ${tones.body}`}>{description}</p>
      <div className="mt-8 flex flex-wrap items-end gap-2">
        <span className={`text-[42px] font-extrabold leading-none ${tones.price}`}>{price}</span>
        {suffix ? <span className={`pb-1 text-lg font-bold ${tones.price}`}>{suffix}</span> : null}
      </div>
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>*Aylık • Sözleşmeli • Reklam bütçesi hariç</p>
      <ActionButton accent={tones.button} className="mt-7 w-full justify-center" label={cta} to="/iletisim#contact-form" />
      <ul className="mt-8 space-y-4">
        {features.map((feature) => (
          <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${tones.feature}`}>
            <PackageFeatureBullet className="mt-0.5 h-5 w-5 shrink-0" tone={accent === "lime" ? "dark" : "light"} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className={`mt-8 text-xs leading-5 ${tones.note}`}>
        <span className="font-bold">Not:</span> {note}
      </p>
    </article>
  );
}

export function PaidAdsHeroVisual({ visual }: { visual: HeroVisualData }) {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[640px]">
      <div className="absolute inset-x-6 top-2 rounded-[34px] border border-[#aaff01]/24 bg-[#111820] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 text-[#101820]">
          <div className="flex items-center gap-3">
            <img alt={visual.platform} className="h-10 w-10 object-contain" src={visual.icon} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/42">{visual.shelfLabel}</p>
              <p className="text-lg font-extrabold">{visual.platform}</p>
            </div>
          </div>
          <span className="rounded-full bg-[#aaff01] px-3 py-1 text-xs font-extrabold text-black">canlı</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {visual.channels.map((channel) => (
            <div key={channel} className="rounded-[18px] bg-[#232f3e] px-4 py-5 text-center">
              <p className="text-xl font-extrabold text-[#aaff01]">{channel}</p>
              <p className="mt-1 text-[11px] text-white/55">modül</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] bg-[#0b1016] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
              <Radar className="h-4 w-4 text-[#aaff01]" />
              Büyüme sinyali
            </span>
            <span className="text-xs text-[#aaff01]">optimizasyon</span>
          </div>
          {visual.searchRows.map(([keyword, metric]) => (
            <div key={keyword} className="mb-3 flex items-center justify-between rounded-xl bg-white/7 px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-2 text-white/82">
                <Search className="h-4 w-4 text-white/42" />
                {keyword}
              </span>
              <span className="font-extrabold text-[#aaff01]">{metric}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 rounded-[26px] border border-white/10 bg-[#232f3e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <p className="flex items-center gap-2 text-xs text-white/54">
          <MousePointerClick className="h-4 w-4 text-[#aaff01]" />
          {visual.primaryLabel}
        </p>
        <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">{visual.primaryMetric}</p>
      </div>

      <div className="absolute bottom-0 right-0 rounded-[26px] border border-[#aaff01]/25 bg-[#0b1016] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="flex items-center gap-2 text-xs text-white/54">
          <BarChart3 className="h-4 w-4 text-[#aaff01]" />
          {visual.secondaryLabel}
        </p>
        <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">{visual.secondaryMetric}</p>
      </div>

      <div className="absolute right-12 top-[-10px] hidden rotate-6 rounded-[22px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur md:block">
        <p className="flex items-center gap-2 text-sm font-extrabold text-white">
          <TrendingUp className="h-5 w-5 text-[#aaff01]" />
          Ölçekleme döngüsü
          <ArrowUpRight className="h-4 w-4 text-white/54" />
        </p>
      </div>
    </div>
  );
}


export { ActionButton, ArrowUpRight, BarChart3, CalendarDays, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MousePointerClick, Package2, PackageFeatureBullet, PaymentLogos, Radar, Search, TrendingUp, X, Youtube, amazonIcon, calendarIcon, campaignIcon, chartIcon, dashboardIcon, fastIcon, funnelIcon, gaugeIcon, getFooterLinkTarget, googleAdsIcon, googleIcon, googleReportIcon, googleStructureIcon, googleTestIcon, graphIcon, growthPackageIcon, journeyAccountImage, journeyDashboardImage, journeyMeetingImage, logoImage, messageIcon, metaAdsIcon, metaIcon, metaReportIcon, metaStructureIcon, metaTestIcon, reportIcon, scalePackageIcon, searchIcon, starterPackageIcon, strategyIcon, targetIcon, tiktokIcon, useState, usersIcon };
