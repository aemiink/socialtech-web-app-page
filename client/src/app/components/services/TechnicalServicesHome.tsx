import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  CalendarDays,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Package2,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import shopifyIcon from "../../../assets/cc24a5c5ac0319bdeacf0c74b1781b13e57edb85.png";
import wooIcon from "../../../assets/f16185c3fccdbc09b48f3936735bf25fbd2b91a2.png";
import wordpressIcon from "../../../assets/a56dc130860c00dd18ef049f57bc6aed87db0f63.png";
import wixIcon from "../../../assets/f7749653a3663ed07e43018262e3b49114327c4a.png";
import lightningIcon from "../../../assets/6b28e6372b5679aecd6606305bad3b4544d5fb47.png";
import seoAuditImage from "../../../assets/f42ac26471dca5c89a85a3e3dc7b0c438dd4c892.webp";
import seoTeamImage from "../../../assets/966aba04ea26ec594f20dcd37e22f3e10bdf8676.webp";
import seoRecipeImage from "../../../assets/5e20f8ba4c40fbc150b631266aed6ef04a12a35e.webp";
import designIcon from "../../../assets/20b545e325c1fc86b38c36656bdc928249b39d46.png";
import replyIcon from "../../../assets/3b88aa7f8e7ac3a09e3f1acb949227f9ab751fd9.png";
import calendarIcon from "../../../assets/23657017fdc0a77a72af39e7b0ed443979cbaad6.png";
import analyticsIcon from "../../../assets/8dacb8994760db1a7aa98d47687dce9f55539c78.png";
import reportIcon from "../../../assets/fcf622c22ef809497405a6660ea02eb1e5f5413a.png";
import postAdsIcon from "../../../assets/1e827fc71443a6e6dbe1ac2c9e88501f155556d6.png";
import usersIcon from "../../../assets/b5bc57e22da71da488d6b9fa0268f7575c1723db.png";
import dashboardIcon from "../../../assets/d407dea157c52e067680066f8673e56861aa712d.png";
import searchIcon from "../../../assets/7f5493feafbba83421b1bfb9510d8ce56d4985e6.png";
import fastIcon from "../../../assets/a7af62df6859771fcfd2ca6caf82b2dfdea6e805.png";
import gaugeIcon from "../../../assets/4414eb29a58502ea7e9315bbf5bc5df67d32977f.png";
import browserSearchIcon from "../../../assets/f48c3db36b4a0a62f0f23a8bf27dfde8bc0dbde6.png";
import flowIcon from "../../../assets/8a445f00303e63056c265238012bf7c67ee427c6.png";
import webDesignIcon from "../../../assets/e286e71f4104220d9b84dc32e59dfcf7ccb315cb.png";
import technicalIcon from "../../../assets/c3e752f3bec6548ce6df1d08fe28d4ce348ff1cf.png";
import starterPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import proPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import { getFooterLinkTarget } from "../site/footerLinks";

export type TechnicalServicesVariant = "seo" | "web-technic";

type TileData = {
  title: string;
  description: string;
  icon: string;
};

type FeatureGroup = {
  title: string;
  items: TileData[];
};

type PackageData = {
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

type FaqData = {
  question: string;
  answer: string;
};

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const platformIcons = [
  { label: "Shopify", icon: shopifyIcon },
  { label: "WooCommerce", icon: wooIcon },
  { label: "WordPress", icon: wordpressIcon },
  { label: "Wix", icon: wixIcon },
  { label: "Hızlı mod", icon: lightningIcon },
];

const seoProblems: TileData[] = [
  { title: "Az Organik Trafik", description: "Arama görünürlüğünüz beklenen seviyede değilse teknik kök nedenleri buluruz.", icon: designIcon },
  { title: "Düşük Arama Hacmi", description: "Anahtar kelime fırsatlarını ve eksik sayfa yapılarını analiz ederiz.", icon: analyticsIcon },
  { title: "Yavaş Yüklenen Sayfalar", description: "Performans sorunlarını Core Web Vitals odağıyla önceliklendiririz.", icon: postAdsIcon },
  { title: "Yinelenen İçerikler", description: "Kopya içerik, canonical ve indeksleme çakışmalarını temizleriz.", icon: replyIcon },
  { title: "Sayfa Kod Hataları", description: "Schema, meta, heading ve HTML problemlerini raporlarız.", icon: analyticsIcon },
  { title: "Yüksek Hemen Çıkma", description: "Teknik deneyim sorunlarını görünür ve çözülebilir hale getiririz.", icon: usersIcon },
  { title: "Hatalı Yönlendirmeler", description: "301, 404 ve zincir yönlendirme problemlerini düzeltiriz.", icon: calendarIcon },
  { title: "SEO Saldırıları", description: "Spam backlink ve negatif SEO risklerini takip ederiz.", icon: reportIcon },
  { title: "Search Console Hataları", description: "Tarama, kapsam ve dizin sorunlarını düzenli izleriz.", icon: dashboardIcon },
];

const seoRecipeTiles: TileData[] = [
  { title: "Index Sorunları", description: "Sorunlu web sayfalarını iyileştirelim.", icon: browserSearchIcon },
  { title: "Site Mimarisi", description: "Site kritik problemleri çözüyoruz.", icon: flowIcon },
  { title: "Deneyim Sorunları", description: "Deneyim hatalarını giderelim.", icon: technicalIcon },
  { title: "Teknik Sorunlar", description: "Kod ve sunucu sorunlarını çözelim.", icon: webDesignIcon },
];

const seoPackages: PackageData[] = [
  {
    name: "SEO Başlangıç Paketi",
    description: "Teknik audit veya başlangıç seviyesinde SEO desteği isteyen markalar.",
    price: "13.500 ₺",
    suffix: "/ ay",
    note: "Teknik SEO problemlerini görünür hale getiren başlangıç planı.",
    cta: "Tanışma Görüşmesi",
    icon: starterPackageIcon,
    accent: "cyan",
    features: [
      "HTML site takibi",
      "SEO denetim raporu (aylık)",
      "Rakip SEO analizi",
      "Sayfa hızı optimizasyonu",
      "Tarama ve index denetimi",
      "Search Console hata kontrolü",
      "Öncelikli aksiyon listesi",
    ],
  },
  {
    name: "SEO Gelişmiş Paketi",
    description: "Düzenli SEO takibi, teknik iyileştirme ve büyüme isteyen markalar için.",
    price: "26.900 ₺",
    suffix: "/ ay",
    note: "Minimum 3 ay kullanım önerilir; teknik reçete her ay güncellenir.",
    cta: "Büyüme Görüşmesi",
    icon: proPackageIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Gelişmiş SEO takibi",
      "SEO denetim raporu (haftalık)",
      "Rakip SEO analizi",
      "Teknik optimizasyon",
      "Tarama ve index denetimi",
      "İçerik teknik uyumluluğu",
      "Site hızı optimizasyonu",
      "Schema & Rich Snippet önerileri",
      "Aylık aksiyon planı",
    ],
  },
  {
    name: "White Label",
    description: "ROAS & ölçekleme odaklı teknik destek, performans ve büyüme hedefleyen markalar için özel paket.",
    price: "İletişime Geçin*",
    note: "Ajanslar ve ekipler için markasız teknik SEO destek çözümü.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: scalePackageIcon,
    accent: "violet",
    features: [
      "Ajanslara özel çalışma",
      "White label raporlar",
      "Markasız teknik doküman",
      "Gelişmiş teknik analiz",
      "SEO destek reçetesi",
      "Öncelikli danışmanlık",
      "Aylık koordinasyon",
    ],
  },
];

const webProcess: TileData[] = [
  { title: "Talep & İnceleme", description: "Mevcut siteyi analiz ederiz.", icon: searchIcon },
  { title: "Sorun & İhtiyaç Tespiti", description: "Hız, hata, SEO, güvenlik ve kullanıcı deneyimini inceleriz.", icon: fastIcon },
  { title: "Müdahale Optimizasyon", description: "Onaylanan işlemleri uygularız.", icon: gaugeIcon },
  { title: "Teslim & Süreklilik", description: "Teslim ve süreklilik için geri dönüş sağlarız.", icon: gaugeIcon },
];

const webFeatureGroups: FeatureGroup[] = [
  {
    title: "Teknik Destek",
    items: [
      { title: "Sunucu bakımı", description: "", icon: designIcon },
      { title: "Yedekleme", description: "", icon: replyIcon },
      { title: "Güvenlik", description: "", icon: calendarIcon },
      { title: "Hata düzeltme", description: "", icon: reportIcon },
    ],
  },
  {
    title: "İçerik & Yönetim",
    items: [
      { title: "Metin değişiklikleri", description: "", icon: analyticsIcon },
      { title: "Sayfa ekleme", description: "", icon: analyticsIcon },
      { title: "CMS güncellemeleri", description: "", icon: reportIcon },
      { title: "Mail / e-posta kurulumu", description: "", icon: analyticsIcon },
    ],
  },
  {
    title: "Performans & Büyüme",
    items: [
      { title: "Hız optimizasyonu", description: "", icon: postAdsIcon },
      { title: "SEO teknik düzenlemeler", description: "", icon: usersIcon },
      { title: "Database düzenleme", description: "", icon: dashboardIcon },
      { title: "Plugin / entegrasyon", description: "", icon: analyticsIcon },
    ],
  },
];

const webPackages: PackageData[] = [
  {
    name: "Başlangıç Destek Paketi",
    description: "Her ay 2 kez teknik destek talebinde bulunabilir ve sitenizin 5 adet sayfasında güncelleme ve değişiklik yaptırabilirsiniz.",
    price: "9.900 ₺",
    suffix: "+ KDV",
    note: "Küçük bakım ve düzenli kontrol ihtiyacı olan siteler için.",
    cta: "Tanışma Görüşmesi",
    icon: starterPackageIcon,
    accent: "cyan",
    features: [
      "Ayda 2 kez destek talebi",
      "5 adet sayfa güncelleme",
      "Düzenli bakım & kontroller",
      "Telefon ve e-posta desteği",
    ],
  },
  {
    name: "Profesyonel Destek Paketi",
    description: "Her ay 5 kez teknik destek talebinde bulunabilir ve sitenizin 10 tane sayfasında güncelleme ve değişiklik yaptırabilirsiniz.",
    price: "26.900 ₺",
    suffix: "/ ay",
    note: "Büyüyen siteler için operasyonel destek ve düzenli müdahale paketi.",
    cta: "Büyüme Görüşmesi",
    icon: proPackageIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Ayda 5 kez destek talebi",
      "10 adet sayfa güncelleme",
      "Düzenli bakım & kontroller",
      "Telefon, e-posta ve online toplantı",
    ],
  },
  {
    name: "İleri Seviye Destek Paketi",
    description: "Her ay 7 kez teknik destek talebinde bulunabilir ve sitenizin 15 tane sayfasında güncelleme ve değişiklik yaptırabilirsiniz.",
    price: "İletişime Geçin*",
    note: "Yoğun operasyon ve çok sayfalı siteler için özel teknik destek.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: scalePackageIcon,
    accent: "violet",
    features: [
      "Ayda 7 kez destek talebi",
      "15 adet sayfa güncelleme",
      "Düzenli bakım & kontroller",
      "Telefon, e-posta ve online toplantı",
    ],
  },
];

const seoFaqs: FaqData[] = [
  {
    question: "SEO Denetim Çalışması Ne Kadar Sürüyor?",
    answer:
      "Sitenin büyüklüğüne ve teknik sorunların derinliğine göre değişir. İlk analiz genellikle birkaç gün içinde çıkar, uygulama planı ise önceliklendirilmiş şekilde ilerler.",
  },
  {
    question: "Google Sıralamalarımızı Yükseltecek mi?",
    answer:
      "SEO denetimi, sıralamayı etkileyen teknik ve içerik sorunlarını görünür kılar. Garanti vermez; ancak arama motorlarının sitenizi daha sağlıklı anlamasını sağlar.",
  },
  {
    question: "Google Sıralamalarımız Yükselecek mi?",
    answer:
      "Teknik altyapı, içerik ve kullanıcı deneyimi iyileştirildiğinde yükselme potansiyeli artar. Süreç düzenli takip ve uygulama ister.",
  },
  {
    question: "SEO Denetim Hizmetinin Avantajları",
    answer:
      "Sitenin teknik, içerik ve performans zayıflıklarını ortaya çıkarır; ekiplerin neyi hangi sırayla düzelteceğini netleştirir.",
  },
  {
    question: "SEO Denetiminin Amacı Nedir?",
    answer:
      "Mevcut SEO durumunu ölçmek, sorunları önceliklendirmek ve arama görünürlüğünü artıracak uygulanabilir bir yol haritası oluşturmaktır.",
  },
  {
    question: "White Label SEO Denetim Hizmeti Nedir?",
    answer:
      "Ajansların kendi markası altında müşterilerine sunabileceği teknik SEO denetim ve raporlama hizmetidir.",
  },
  {
    question: "SEO Denetim Hizmeti Fiyatları",
    answer:
      "Fiyatlar sitenin ölçeği, sayfa sayısı, teknik borç ve raporlama ihtiyacına göre değişir. Paketler düzenli kontrol ve destek kapsamına göre ayrılır.",
  },
  {
    question: "White Label Seo Denetimi Nasıl Çalışır?",
    answer:
      "Ajans veya ekip ihtiyaçları iletir; teknik denetim yapılır, rapor hazırlanır ve uygulanabilir aksiyonlar marka bağımsız şekilde sunulur.",
  },
];

function SectionHeading({
  prefix,
  highlight,
  suffix,
  center = false,
}: {
  prefix: string;
  highlight: string;
  suffix?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight text-white md:text-[42px]">
        {prefix ? <span>{prefix} </span> : null}
        <span className="inline-block rotate-[-1deg] bg-[#b5ff15] px-3 py-1 text-black">{highlight}</span>
        {suffix ? <span> {suffix}</span> : null}
      </h2>
    </div>
  );
}

function PlatformStrip() {
  return (
    <div className="mt-10">
      <p className="text-base text-white/72 md:text-lg">Mevcut altyapınızı değiştirmeden çalışıyoruz *</p>
      <div className="mt-5 flex flex-wrap justify-center gap-5">
        {platformIcons.map((platform) => (
          <div key={platform.label} className="flex h-14 w-14 items-center justify-center rounded-lg bg-black/20 md:h-20 md:w-20">
            <img alt={platform.label} className="h-10 w-10 object-contain md:h-14 md:w-14" src={platform.icon} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LimeTile({ title, description, icon }: TileData) {
  return (
    <article className="rounded-lg bg-[#b5ff15] p-7 text-center text-black">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
        <img alt="" className="h-9 w-9 object-contain" src={icon} />
      </div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-black/68">{description}</p>
    </article>
  );
}

function FeatureTile({ title, icon }: TileData) {
  return (
    <article className="rounded-lg bg-white/14 px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-white/10 p-3">
          <img alt="" className="h-6 w-6 object-contain" src={icon} />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
    </article>
  );
}

function PackageCard({ name, description, price, suffix, note, cta, icon, accent, badge, features }: PackageData) {
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
      shell: "from-[#b5ff15] to-[#587f00]",
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
        <div className="absolute right-4 top-4 rotate-[24deg] rounded-md bg-[#303030] px-4 py-2 text-center text-xs font-bold uppercase text-[#b5ff15]">
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
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>*Aylık • Sözleşmeli • İstediğiniz zaman iptal</p>
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

function FaqCard({ question, answer }: FaqData) {
  return (
    <article className="rounded-lg bg-white/12 p-7">
      <h3 className="text-xl font-bold leading-tight text-white">{question}</h3>
      <p className="mt-4 text-sm leading-6 text-white/70">{answer}</p>
    </article>
  );
}

function Hero({ variant }: { variant: TechnicalServicesVariant }) {
  const isSeo = variant === "seo";

  return (
    <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
      <HeroBackdrop fadeColor="#131313" />

      <div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
        <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">
          {isSeo ? "SEO" : "Landing Page"}
        </span>
        <h1 className="mt-7 max-w-[980px] text-[34px] font-medium leading-tight text-white md:text-[56px]">
          {isSeo ? (
            <>
              Web Siteniz Daha Hızlı
              <br />
              <span className="font-extrabold">Daha Güvenli ve Daha Görünür Olsun</span>
            </>
          ) : (
            <>
              Web Siteniz
              <br />
              <span className="font-extrabold">Çalışıyor Ama Yeterli Değil mi?</span>
            </>
          )}
        </h1>
        <p className="mt-7 max-w-[860px] text-base leading-8 text-white/78 md:text-xl">
          {isSeo ? (
            <>
              SEO denetimi,
              <span className="mx-2 font-extrabold text-[#b5ff15]">teknik optimizasyon ve sürekli destek ile</span>
              mevcut web sitenizi satışa ve performansa hazır hale getiriyoruz.
            </>
          ) : (
            <>
              Teknik destek,
              <span className="mx-2 font-extrabold text-[#b5ff15]">bakım ve optimizasyon ile sitenizi hızlandırıyor</span>
              hataları gideriyor ve satışa hazır hale getiriyoruz.
            </>
          )}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ActionButton
            accent="lime"
            className="min-w-[280px]"
            to="/iletisim#contact-form"
            label={isSeo ? "Ücretsiz Teknik Analiz Al" : "Ücretsiz Teknik İnceleme Al"}
          />
          <ActionButton accent="violet" className="min-w-[220px]" href="#packages" label="Paketleri İncele" />
        </div>
        <PlatformStrip />
      </div>
    </section>
  );
}

function SeoContent() {
  return (
    <>
      <section className="bg-[linear-gradient(180deg,#131313_0%,#282828_50%,#131313_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="SEO Hatalarını" prefix="Teknik" suffix="Biz Düşünelim, Siz işinize bakın!" />
          <p className="mx-auto mt-8 max-w-[980px] text-center text-base leading-7 text-white/72 md:text-lg">
            SEO performansını düşüren teknik problemler çoğu zaman fark edilmez. Yavaş siteler, indekslenmeyen sayfalar ve hatalı yapılandırmalar satış kaybına neden olur.
          </p>

          <div className="mt-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <img alt="SEO denetim raporu" className="mx-auto w-full max-w-[620px] object-contain" src={seoAuditImage} />
            <div>
              <h2 className="border-l-4 border-[#b5ff15] pl-5 text-[30px] leading-tight text-white md:text-[42px]">
                <span className="bg-[#b5ff15] px-2 font-bold text-black">SEO Denetim</span> Hizmetini
                <br />
                Neden Kullanmalısınız?
              </h2>
              <p className="mt-8 text-base leading-8 text-white/72 md:text-lg">
                SEO denetim hizmetimiz, web sitenizin teknik altyapısından içerik optimizasyonuna, anahtar kelime analizinden kullanıcı deneyimine kadar her yönüyle incelenmesini kapsar.
              </p>
              <p className="mt-6 text-base leading-8 text-white/72 md:text-lg">
                Deneyimli ekibimiz, web sitenizin performansını ve görünürlüğünü artırmak için kapsamlı bir inceleme yapar ve önceliklendirilmiş çözüm planı sunar.
              </p>
              <ActionButton accent="violet" className="mt-8" href="#packages" label="Paketleri İncele" />
            </div>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h2 className="border-l-4 border-[#b5ff15] pl-5 text-[30px] leading-tight text-white md:text-[42px]">
                SEO Ajansları ve Markalar,
                <br />
                için <span className="bg-[#b5ff15] px-2 font-bold text-black">Özel Bir Çözüm...</span>
              </h2>
              <p className="mt-8 text-base leading-8 text-white/72 md:text-lg">
                Çoğu SEO ajansı veya freelancer teknik geliştirmeleri danışmanlığa dahil etmez. SocialTech tam bu noktada kritik bir soruna çözüm sunuyor.
              </p>
              <ul className="mt-7 space-y-3 text-base text-white/78">
                {["Teknik ekibiniz olarak sorunları çözelim.", "SEO ajansınızla veya ekibinizle ortak çalışalım.", "Başarınız ve büyümeniz için süreçleri hızlandıralım."].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#b5ff15]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ActionButton accent="violet" className="mt-8" href="#packages" label="Paketleri İncele" />
            </div>
            <img alt="SEO ajansı teknik destek" className="mx-auto w-full max-w-[650px] object-contain" src={seoTeamImage} />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#070809_0%,#672bb5_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Tanıdık Mı Geliyor?" prefix="Bu Sorunlar Size" />
          <p className="mx-auto mt-8 max-w-[900px] text-center text-base leading-7 text-white/72 md:text-lg">
            Bu SEO sorunlarından herhangi biri size tanıdık geliyorsa artık doğru ve yetenekli ellerdesiniz!
          </p>
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {seoProblems.map((problem) => (
              <FeatureTile key={problem.title} {...problem} />
            ))}
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <img alt="SEO reçetesi" className="mx-auto w-full max-w-[620px] object-contain" src={seoRecipeImage} />
            <div>
              <h2 className="border-l-4 border-[#b5ff15] pl-5 text-[30px] leading-tight text-white md:text-[42px]">
                100+ SEO Hatasının
                <br />
                <span className="bg-[#b5ff15] px-2 font-bold text-black">Reçetesini Oluşturduk!</span>
              </h2>
              <p className="mt-8 text-base leading-8 text-white/72 md:text-lg">
                Web sitelerinin SEO performansına olumsuz etki eden 100'den fazla problemi belirlediğimiz bir SEO denetleme listemiz var.
              </p>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {seoRecipeTiles.map((tile) => (
                  <article key={tile.title} className="rounded-lg bg-black/18 p-5">
                    <div className="flex items-start gap-4">
                      <img alt="" className="h-9 w-9 object-contain" src={tile.icon} />
                      <div>
                        <h3 className="font-bold text-white">{tile.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/66">{tile.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function WebTechnicContent() {
  return (
    <>
      <section className="bg-[linear-gradient(180deg,#070809_0%,#282828_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="İŞLEYİŞ SÜRECİ" prefix="TEKNİK DESTEK" />
          <p className="mx-auto mt-8 max-w-[860px] text-center text-base leading-7 text-white/72 md:text-lg">
            Teknik destek süreçlerimizi açık, ölçülebilir ve sürdürülebilir şekilde yönetiyoruz.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {webProcess.map((step) => (
              <LimeTile key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#08090b_0%,#672bb5_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="text-center">
            <h2 className="text-[30px] font-bold leading-tight text-white md:text-[42px]">
              Teknik Destek Paketinin
              <br />
              <span className="italic text-[#b5ff15]">Hizmet Özellikleri</span>
            </h2>
            <p className="mx-auto mt-8 max-w-[760px] text-base leading-7 text-white/72 md:text-lg">
              Bu hizmet paketi aşağıdaki iş kalemlerinin tamamını eksiksiz içermektedir.
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {webFeatureGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-6 text-center text-xl font-bold text-white">{group.title}</h3>
                <div className="space-y-5">
                  {group.items.map((item) => (
                    <FeatureTile key={item.title} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PackagesSection({ variant }: { variant: TechnicalServicesVariant }) {
  const isSeo = variant === "seo";
  const cards = isSeo ? seoPackages : webPackages;

  return (
    <section className="bg-[#111111] py-24" id="packages">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <SectionHeading center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
        <p className="mx-auto mt-8 max-w-[1000px] text-center text-base leading-7 text-white/72 md:text-lg">
          {isSeo
            ? "SEO denetim paketlerimizin tamamı satın alım yapmış olduğunuz tarihten itibaren her 30 günde bir yenilenir. Teknik SEO süreçlerinde minimum 3 ay kullanım tavsiye ediyoruz."
            : "Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için sayfamızı ziyaret etmeyi unutmayın!"}
        </p>
        <PaymentLogos />
        <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
          {cards.map((card) => (
            <PackageCard key={card.name} {...card} />
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-[980px] text-center text-base leading-8 text-white/72 md:text-lg">
          Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
          <Link className="mx-2 font-bold text-[#b5ff15] underline" to="/iletisim#contact-form">
            formu
          </Link>
          doldurun, beraber karar verelim!
        </p>
      </div>
    </section>
  );
}

function SeoFaqSection() {
  return (
    <section className="bg-[#151515] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="border-l-4 border-[#8a38f5] pl-5">
          <h2 className="text-[34px] font-bold text-white md:text-[42px]">Sıkça Sorulan Sorular</h2>
          <p className="mt-4 text-lg text-[#8a38f5]">SEO Denetimi Hakkında Sık Sorulan Sorular ve Cevapları</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {seoFaqs.map((faq) => (
            <FaqCard key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TechnicalServicesHome({ variant }: { variant: TechnicalServicesVariant }) {
  const isSeo = variant === "seo";

  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <Hero variant={variant} />
      {isSeo ? <SeoContent /> : <WebTechnicContent />}
      <PackagesSection variant={variant} />
      {isSeo ? <SeoFaqSection /> : null}
    </div>
  );
}
