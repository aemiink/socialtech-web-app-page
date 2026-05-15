import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  BadgePercent,
  BarChart3,
  Boxes,
  CalendarDays,
  Facebook,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Package2,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Target,
  Trophy,
  X,
  Youtube,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import amazonIcon from "../../../assets/c522312a5748c7b7f98f6a7c5116f935fa925f9c.png";
import dashboardImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import meetingImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.webp";
import accountImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.webp";
import starterPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import growthPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const signalCards = [
  {
    title: "Raf Görünürlüğü",
    description: "Ürününüz doğru aramada, doğru teklif ve doğru mesajla görünür hale gelir.",
    icon: Store,
  },
  {
    title: "Karlı Sepet",
    description: "Sadece tıklama değil; ACOS, TACOS ve sepet karlılığı birlikte izlenir.",
    icon: ShoppingCart,
  },
  {
    title: "Savunma & Fetih",
    description: "Kendi marka kelimelerinizi korurken rakip aramalarında kontrollü büyürüz.",
    icon: ShieldCheck,
  },
];

export const systemSteps = [
  {
    title: "Retail Readiness",
    description: "Ürün sayfanız reklam almaya hazır mı? Görsel, başlık, yorum, stok ve Buy Box kontrol edilir.",
    icon: PackageCheck,
  },
  {
    title: "Keyword Haritası",
    description: "Kategori, rakip, long-tail ve marka kelimeleri ayrı kampanya mimarilerine ayrılır.",
    icon: Search,
  },
  {
    title: "Kampanya Mimarisi",
    description: "Sponsored Products, Sponsored Brands ve Sponsored Display akışları tek plana bağlanır.",
    icon: Layers3,
  },
  {
    title: "Karlı Ölçekleme",
    description: "Kazanan ASIN, kelime ve kreatifler bütçe kaydırmalarıyla büyütülür.",
    icon: BarChart3,
  },
];

export const featureItems = [
  { label: "Seller / Vendor reklam hesabı kurulumu", icon: Store },
  { label: "Sponsored Products kampanyaları", icon: Package2 },
  { label: "Sponsored Brands & Store yönlendirmesi", icon: Trophy },
  { label: "Sponsored Display remarketing", icon: Target },
  { label: "Negatif kelime ve arama terimi temizliği", icon: Search },
  { label: "ACOS / TACOS takip sistemi", icon: BarChart3 },
  { label: "Rakip ASIN hedefleme", icon: Boxes },
  { label: "Fiyat, stok ve Buy Box kontrol listesi", icon: ShieldCheck },
  { label: "Haftalık optimizasyon & raporlama", icon: CalendarDays },
];

export const playbookCards = [
  {
    eyebrow: "Aşama 01",
    title: "Ürünü Reklama Hazırlarız",
    description:
      "Amazon’da reklamdan önce sayfa güven verir mi bakarız. Başlık, görsel, yorum, fiyat ve stok birlikte değerlendirilir.",
    image: meetingImage,
  },
  {
    eyebrow: "Aşama 02",
    title: "Arama Niyetini Haritalarız",
    description:
      "Marka, kategori, rakip ve problem bazlı aramaları ayırır; her niyete özel kampanya yapısı kurarız.",
    image: accountImage,
  },
  {
    eyebrow: "Aşama 03",
    title: "Kazananı Ölçekleriz",
    description:
      "Dönüşüm getiren ASIN, kelime ve kampanya kırılımlarını büyütür; bütçeyi verimsiz alanlardan çekeriz.",
    image: dashboardImage,
  },
];

export const metricCards = [
  { value: "ACOS", label: "Reklam maliyetinin satışa oranı" },
  { value: "TACOS", label: "Toplam satış içinde reklam etkisi" },
  { value: "CVR", label: "Tıklamanın satın almaya dönüşümü" },
  { value: "Buy Box", label: "Reklamın satışa bağlanma zemini" },
];

export const packages = [
  {
    name: "Marketplace Start",
    description: "Amazon’da ilk reklam sistemini kurmak isteyen markalar için başlangıç paketi.",
    price: "16.900 ₺",
    suffix: "/ proje",
    note: "Ürün sayfası hazır olan markalar için hızlı başlangıç paketi.",
    cta: "Amazon'a Başlayalım",
    icon: starterPackageIcon,
    accent: "cyan" as const,
    features: [
      "Amazon Ads hesap kontrolü",
      "Retail readiness mini denetimi",
      "10 anahtar kelime grubu",
      "Sponsored Products kurulumu",
      "Negatif kelime listesi",
      "İlk 14 gün optimizasyon",
      "Başlangıç performans raporu",
    ],
  },
  {
    name: "Amazon Growth Engine",
    description: "Satış, karlılık ve pazar payını birlikte büyütmek isteyen markalar için ana büyüme sistemi.",
    price: "29.900 ₺",
    suffix: "/ ay",
    note: "Düzenli katalog, stok ve fiyat yönetimi olan markalar için önerilir.",
    cta: "Growth Engine Kurulsun",
    icon: growthPackageIcon,
    accent: "lime" as const,
    badge: "En karlı ölçek",
    features: [
      "Full kampanya mimarisi",
      "Sponsored Products + Brands + Display",
      "Rakip ASIN hedefleme",
      "Search term mining",
      "ACOS / TACOS dashboard",
      "Haftalık bütçe optimizasyonu",
      "Kreatif & ürün sayfası önerileri",
      "Aylık strateji görüşmesi",
      "Detaylı performans raporu",
    ],
  },
  {
    name: "Category Domination",
    description: "Bir kategoride görünürlüğünü agresif ama kontrollü büyütmek isteyen markalar için.",
    price: "İletişime Geçin*",
    note: "Yüksek hacimli katalog ve rekabetçi kategoriler için özel planlanır.",
    cta: "Kategori Stratejisi Planla",
    icon: scalePackageIcon,
    accent: "violet" as const,
    features: [
      "Kategori ve rakip haritası",
      "Çoklu ASIN kampanya yapısı",
      "Brand defense + conquest stratejisi",
      "Ürün sayfası dönüşüm danışmanlığı",
      "Store & Sponsored Brands kurgusu",
      "Gelişmiş remarketing",
      "Haftalık strateji sprinti",
      "Yönetim kuruluna uygun raporlama",
    ],
  },
];

export function HeroVisual() {
  return (
    <div className="relative mx-auto h-[540px] w-full max-w-[620px]">
      <div className="absolute inset-x-8 top-0 rounded-[34px] border border-[#aaff01]/28 bg-[#111820] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 text-[#101820]">
          <div className="flex items-center gap-3">
            <img alt="Amazon" className="h-9 w-9 object-contain" src={amazonIcon} />
            <div>
              <p className="text-xs font-bold text-black/48">Sponsored shelf</p>
              <p className="text-lg font-extrabold">Akıllı Termos 750ml</p>
            </div>
          </div>
          <span className="rounded-full bg-[#aaff01] px-3 py-1 text-xs font-extrabold text-black">#1</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {["SP", "SB", "SD"].map((item) => (
            <div key={item} className="rounded-[18px] bg-[#232f3e] px-4 py-5 text-center">
              <p className="text-2xl font-extrabold text-[#aaff01]">{item}</p>
              <p className="mt-1 text-[11px] text-white/55">campaign</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] bg-[#0b1016] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Search term mining</span>
            <span className="text-xs text-[#aaff01]">live</span>
          </div>
          {[
            ["kamp termosu", "7.8 ACOS"],
            ["çelik matara", "12.4 ACOS"],
            ["ofis termos", "9.1 ACOS"],
          ].map(([keyword, metric]) => (
            <div key={keyword} className="mb-3 flex items-center justify-between rounded-xl bg-white/7 px-4 py-3 text-sm">
              <span>{keyword}</span>
              <span className="font-extrabold text-[#aaff01]">{metric}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 rounded-[26px] border border-white/10 bg-[#232f3e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <p className="text-xs text-white/54">TACOS</p>
        <p className="mt-1 text-4xl font-extrabold text-[#aaff01]">%8.4</p>
        <p className="mt-2 text-xs text-white/62">toplam satış etkisi</p>
      </div>

      <div className="absolute bottom-0 right-0 rounded-[26px] border border-[#aaff01]/25 bg-[#0b1016] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-xs text-white/54">Buy Box</p>
        <p className="mt-1 text-4xl font-extrabold text-[#aaff01]">%96</p>
        <p className="mt-2 text-xs text-white/62">reklam hazır</p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[940px] items-center justify-center overflow-hidden bg-[#050607]">
      <HeroBackdrop fadeColor="#111111" />

      <div className="relative z-10 mx-auto grid min-h-[790px] w-full max-w-[1540px] items-center gap-14 px-6 pb-24 pt-24 text-center lg:grid-cols-[0.92fr_0.88fr] lg:px-10 lg:pt-28 lg:text-left">
        <div className="mx-auto flex max-w-[760px] flex-col items-center lg:mx-0 lg:items-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1.5 text-xs font-extrabold text-[#121212]">
            <img alt="" className="h-4 w-4 object-contain" src={amazonIcon} />
            Amazon Ads
          </span>
          <h1 className="mt-7 max-w-[860px] text-[40px] font-medium leading-tight tracking-tight text-white md:text-[68px]">
            Amazon’da sadece görünmeyin,
            <span className="block font-extrabold text-[#aaff01]">satın almaya yakın müşteriyi yakalayın.</span>
          </h1>
          <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/76 md:text-xl">
            Amazon reklamlarını arama niyeti, ürün sayfası kalitesi, Buy Box durumu ve karlılık metrikleriyle birlikte yönetiyoruz. Hedefimiz tıklama değil;
            <span className="mx-2 font-extrabold text-[#aaff01]">karlı pazar yeri büyümesi.</span>
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <ActionButton accent="lime" className="min-w-[260px]" href="#packages" label="Paketleri İncele" />
            <ActionButton accent="violet" className="min-w-[260px]" href="#system" label="Sistemi Gör" />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

export function SignalCard({ title, description, icon: Icon }: (typeof signalCards)[number]) {
  return (
    <article className="rounded-[24px] border border-[#aaff01]/18 bg-[#121820] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#aaff01] text-[#111820]">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-7 text-[26px] font-extrabold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-white/68">{description}</p>
    </article>
  );
}

export function SystemStep({ title, description, icon: Icon }: (typeof systemSteps)[number]) {
  return (
    <article className="rounded-[20px] bg-white/8 p-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#aaff01]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-6 text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/66">{description}</p>
    </article>
  );
}

export function FeaturePill({ label, icon: Icon }: (typeof featureItems)[number]) {
  return (
    <div className="flex items-center gap-4 rounded-[12px] bg-white/12 px-5 py-4 text-white">
      <Icon className="h-6 w-6 shrink-0 text-[#aaff01]" />
      <span className="text-sm font-bold md:text-base">{label}</span>
    </div>
  );
}

export function PlaybookCard({ eyebrow, title, description, image }: (typeof playbookCards)[number]) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-white/10 bg-[#171717] shadow-[0_28px_80px_rgba(0,0,0,0.25)]">
      <img alt={title} className="h-[230px] w-full object-cover" src={image} />
      <div className="p-8">
        <span className="text-sm font-extrabold text-[#aaff01]">{eyebrow}</span>
        <h3 className="mt-3 text-[25px] font-extrabold leading-tight text-white">{title}</h3>
        <p className="mt-4 text-sm leading-6 text-white/66">{description}</p>
      </div>
    </article>
  );
}

export function MetricCard({ value, label }: (typeof metricCards)[number]) {
  return (
    <article className="rounded-[22px] border border-[#aaff01]/20 bg-[#0b1016] p-7">
      <p className="text-[34px] font-extrabold text-[#aaff01]">{value}</p>
      <p className="mt-3 text-sm leading-6 text-white/68">{label}</p>
    </article>
  );
}

export function PackageCard({
  name,
  description,
  price,
  suffix,
  note,
  cta,
  icon,
  accent,
  badge,
  features,
}: (typeof packages)[number]) {
  const tones = {
    cyan: {
      shell: "bg-[linear-gradient(180deg,#11a5d5_0%,#13212a_100%)] text-white",
      title: "text-white",
      body: "text-white/74",
      price: "text-white",
      button: "cyan" as const,
      check: "text-white",
    },
    lime: {
      shell: "bg-[#aaff01] text-black xl:scale-105",
      title: "text-black",
      body: "text-black/74",
      price: "text-black",
      button: "lime" as const,
      check: "text-black",
    },
    violet: {
      shell: "bg-[linear-gradient(180deg,#8a38f5_0%,#17151f_100%)] text-white",
      title: "text-white",
      body: "text-white/74",
      price: "text-white",
      button: "violet" as const,
      check: "text-white",
    },
  }[accent];

  return (
    <article className={`relative overflow-hidden rounded-[18px] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.32)] ${tones.shell}`}>
      {badge ? (
        <div className="absolute right-[-54px] top-10 rotate-45 bg-[#1c1c1c] px-16 py-2 text-sm font-extrabold italic text-[#aaff01]">
          {badge}
        </div>
      ) : null}
      <img alt="" className="h-14 w-14 object-contain" src={icon} />
      <h3 className={`mt-8 text-[26px] font-extrabold italic ${tones.title}`}>{name}</h3>
      <p className={`mt-5 text-sm leading-6 ${tones.body}`}>{description}</p>
      <div className="mt-8 flex flex-wrap items-end gap-2">
        <span className={`text-[42px] font-extrabold leading-none ${tones.price}`}>{price}</span>
        {suffix ? <span className={`pb-1 text-lg font-bold ${tones.price}`}>{suffix}</span> : null}
      </div>
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>*Katalog hacmine göre final kapsam netleşir.</p>
      <ActionButton accent={tones.button} className="mt-7 w-full justify-center" label={cta} to="/iletisim#contact-form" />
      <ul className="mt-8 space-y-4">
        {features.map((feature) => (
          <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${tones.body}`}>
            <PackageFeatureBullet className="mt-0.5 h-5 w-5 shrink-0" tone={accent === "lime" ? "dark" : "light"} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className={`mt-8 text-xs leading-5 ${tones.body}`}>
        <span className="font-extrabold">Not:</span> {note}
      </p>
    </article>
  );
}


export { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, HeroBackdrop, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PackageCheck, PackageFeatureBullet, Search, ShieldCheck, ShoppingCart, Store, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, scalePackageIcon, starterPackageIcon, useState };
