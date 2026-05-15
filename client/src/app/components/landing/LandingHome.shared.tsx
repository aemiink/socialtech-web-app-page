import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Package2,
  Plus,
  Search,
  Share2,
  Smartphone,
  Star,
  X,
  Youtube,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import projectInstagramStory from "../../../assets/f4ec847bb1ec1b27fd4a2842a4e930bd1bc501ab.webp";
import projectWebLanding from "../../../assets/a9d5346d10fbc3273e93e817ca98937f4bf09d7a.webp";
import projectInstagramPosts from "../../../assets/90f28dbedc4eb333bc83f5943cd6c1ef73617d87.webp";
import aboutBackImage from "../../../assets/5ed8f400caa5014730ebf7a12da1567fe8d681f1.webp";
import aboutFrontImage from "../../../assets/9e5f7ad16c0d59e3f4ef0266505f0976a41d55bc.webp";
import trustBannerImage from "../../../assets/d66d403f3b68db2e5dedb81961508f5cf25a1d58.webp";
import blogWireframeImage from "../../../assets/b180e00e08f5659eea7cb564d44ce4b577244437.webp";
import blogSeoImage from "../../../assets/c5f0ad0a25f5f070c7404384352ca5dc9460331e.webp";
import blogEcommerceImage from "../../../assets/2a4556d55251a48bc607f0696b65efb4a8117133.webp";
import avatarSue from "../../../assets/573ad1f39f6055a34e7171ec9bb627fdf05cf003.webp";
import avatarJhon from "../../../assets/4e64811246c2bda815c83e5aa067453ff586901e.webp";
import avatarRobbie from "../../../assets/dd23378db022480fe43081e8f5774a27c17b0a9d.webp";
import iconDigitalMarketing from "../../../assets/68dd4a4fc4783dc83cbb2467ace3baf4d5b9a15d.png";
import iconAws from "../../../assets/3ac04e4c13757378e2740d66ab0ee4804511697a.png";
import iconGoogleAds from "../../../assets/e849124adaf316f4fe59ff0ddf0cc15fd75d72df.png";
import iconMeta from "../../../assets/65e1a43c4dce73a01c24356c3586bfbf475832d6.png";
import iconContent from "../../../assets/20b545e325c1fc86b38c36656bdc928249b39d46.png";
import iconGraphicDesign from "../../../assets/be523df670567b834e3f83391a7f3842ff19ab01.png";
import iconLaunch from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import iconGrowth from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import iconScale from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const services = [
  {
    title: "Dijital Pazarlama",
    description:
      "Dijital pazarlamayı parça parça değil, tek bir büyüme sistemi olarak ele alıyoruz. Strateji, performans ve optimizasyon süreçlerini entegre şekilde yönetiyoruz.",
    cta: "Sistemi İncele",
    to: "/hizmetler/dijital-pazarlama-hub",
    icon: (
      <img
        alt="Dijital pazarlama"
        className="h-12 w-12 object-contain"
        src={iconDigitalMarketing}
      />
    ),
  },
  {
    title: "Sosyal Medya Reklamları",
    description:
      "Veriye dayalı reklam stratejileriyle bütçenizi kontrol altına alır, ölçülebilir sonuçlar üretiriz. Her kampanya net hedefler ve sürekli optimizasyonla ilerler.",
    cta: "Nasıl Çalışıyoruz?",
    to: "/hizmetler/google-reklamlari",
    icon: (
      <div className="flex items-center gap-3">
        <img alt="AWS" className="h-11 w-11 object-contain" src={iconAws} />
        <img alt="Google Ads" className="h-11 w-11 object-contain" src={iconGoogleAds} />
        <img alt="Meta" className="h-11 w-11 object-contain" src={iconMeta} />
      </div>
    ),
  },
  {
    title: "İçerik Stratejisi",
    description:
      "Veriye dayalı içerik stratejileriyle içeriğinizi kontrollü olarak ölçekler, satışa dönüşen bir kurguya dönüştürürüz. Her hedefe özel içerik optimizasyonu kurarız.",
    cta: "Stratejiyi Gör",
    to: "/hizmetler/sosyal-medya",
    icon: (
      <img
        alt="İçerik stratejisi"
        className="h-12 w-12 object-contain"
        src={iconContent}
      />
    ),
  },
  {
    title: "Grafik Tasarımı",
    description:
      "Markanızın dijital dünyadaki görsel dilini güçlendirir, tasarımı bir propaganda aracına dönüştürürüz. Her tasarım dönüşüm için kurgulanır.",
    cta: "Örnekleri İncele",
    to: "/hizmetler/web-tasarim",
    icon: (
      <img
        alt="Grafik tasarımı"
        className="h-12 w-12 object-contain"
        src={iconGraphicDesign}
      />
    ),
  },
  {
    title: "Sosyal Medya Yönetimi",
    description:
      "Sosyal medyayı yalnızca içerik paylaşımı olarak değil, markanızın dijital büyüme kanallarından biri olarak ele alıyoruz.",
    cta: "Nasıl Çalışıyoruz?",
    to: "/hizmetler/sosyal-medya",
    icon: <Share2 className="h-12 w-12 text-[#b5ff15]" />,
  },
  {
    title: "Web Uygulamaları",
    description:
      "İş süreçlerinizi dijitalleştiren, ölçeklenebilir ve performans odaklı web uygulamaları geliştiriyoruz.",
    cta: "Detayları Gör",
    to: "/hizmetler/web-uygulama",
    icon: <MonitorSmartphone className="h-12 w-12 text-[#b5ff15]" />,
  },
  {
    title: "Mobil Uygulamalar",
    description:
      "Kullanıcıya kurulan sürekli temas noktası olarak gördüğümüz mobil uygulamalarla markanızı dijital ekosisteme taşıyoruz.",
    cta: "Detayları Gör",
    to: "/hizmetler/mobil-uygulama",
    icon: <Smartphone className="h-12 w-12 text-[#b5ff15]" />,
  },
];

export const SERVICE_SLIDE_DELAY_MS = 3500;

export function getVisibleServiceCount() {
  if (typeof window === "undefined") {
    return 4;
  }

  if (window.innerWidth >= 1280) {
    return 4;
  }

  if (window.innerWidth >= 768) {
    return 2;
  }

  return 1;
}

export const projects = [
  {
    title: "Instagram Hikayeleri",
    tags: ["dijital", "sosyal medya"],
    image: projectInstagramStory,
  },
  {
    title: "Web Siteler ve Landing Page'ler",
    tags: ["dijital", "web app"],
    image: projectWebLanding,
  },
  {
    title: "Instagram Postları",
    tags: ["dijital", "sosyal medya"],
    image: projectInstagramPosts,
  },
];

export const packageCards = [
  {
    name: "Launch Paketi",
    description:
      "İşletmenizi dijital dönüşümün ilk adımına atlatın. Sosyal medya ve reklam yönetimiyle pazarlama dünyasına girişinizi yapın.",
    price: "34.000 ₺",
    suffix: "/ ay",
    note:
      "Launch paketi hızlı ölçekleme için değil, sağlam bir dijital temel oluşturmak için tasarlanmıştır.",
    accent: "cyan" as const,
    icon: iconLaunch,
    cta: "Tanışma Görüşmesi",
    features: [
      "Strateji ve kurulum",
      "Sosyal medya yönetimi (2 kanal)",
      "Reklam ve performans (9.000 ₺ max bütçe)",
      "Tasarım desteği (4 tasarım)",
      "Aylık raporlama",
    ],
  },
  {
    name: "Growth Paketi",
    description:
      "Dijitalde var olmak yetmez, büyümek gerekir. Sosyal medya ve reklam süreçlerinizi ölçeklenebilir hale getirin.",
    price: "49.000 ₺",
    suffix: "/ ay",
    note:
      "Büyümeyi şansa bırakmak istemeyen markalar için. Strateji, içerik ve reklam tek sistemde birleşir.",
    accent: "lime" as const,
    featured: true,
    badge: "En çok tercih edilen",
    icon: iconGrowth,
    cta: "Büyüme Görüşmesi",
    features: [
      "Aylık büyüme stratejisi + sürekli optimizasyon",
      "Sosyal medya yönetimi (3 kanal)",
      "16 içerik + performans takibi",
      "Meta ve Google Ads yönetimi",
      "Tasarım ve kreatif destek",
      "Website inceleme, CTA ve CRO dokunuşları",
      "Haftalık raporlar, 2 haftada bir online görüşme",
    ],
  },
  {
    name: "Scale Paketi",
    description:
      "Artık sadece büyümek değil, büyümeyi yönetmek gerekiyor. Scale paketi, markanız için sürdürülebilir ölçekleme sunar.",
    price: "İletişime Geçin*",
    note:
      "Scale paketi, her marka için uygun değildir. Yüksek hacimli ve sürdürülebilir büyüme hedefleyen markalar için tasarlanmıştır.",
    accent: "violet" as const,
    icon: iconScale,
    cta: "Özel Ölçekleme Görüşmesi",
    features: [
      "Özel büyüme stratejisi",
      "Genişletilmiş kanal yönetimi",
      "Gelişmiş reklam & performans yönetimi",
      "İleri seviye içerik & kreatif süreçler",
      "Dönüşüm & sistem optimizasyonu",
      "Stratejik iletişim & yönetim",
    ],
  },
];

export const testimonials = [
  {
    name: "Sue Smith",
    company: "ABC Jewellery",
    detail: "Growth Paketi · 3 Ay",
    avatar: avatarSue,
  },
  {
    name: "Jhon Doe",
    company: "Shoes & Bag",
    detail: "E-commerce · Scale Süreci",
    avatar: avatarJhon,
  },
  {
    name: "Robbie Keane",
    company: "ASD Kozmetik",
    detail: "Launch Paketi · Yeni Marka",
    avatar: avatarRobbie,
  },
];

export const faqItems = [
  {
    question: "Dijital Pazarlama Nedir?",
    popular: "500+ Kişi Sordu!",
    answer:
      "Dijital pazarlama, markaların online kanallar üzerinden ölçülebilir büyüme sağlamasını amaçlar. Sosyal medya, reklam, içerik ve performans süreçleri birlikte ele alınır.",
  },
  {
    question: "Markam Dijital Pazarlamadan Fayda Sağlar mı?",
    answer:
      "Hedef kitleniz online davranış gösteriyorsa evet. Doğru stratejiyle küçük markalar da büyük markalar kadar etkili şekilde görünürlük ve dönüşüm elde edebilir.",
  },
  {
    question: "Fazla Takipçim/ Abonem Yok, Bu Kötü mü?",
    answer:
      "Hayır. Takipçi sayısı tek başına başarı göstergesi değildir. Bizim için önemli olan doğru kitle, sağlıklı etkileşim ve sürdürülebilir dönüşümdür.",
  },
  {
    question: "Dijital Pazarlamanın Maliyeti Nedir?",
    answer:
      "İhtiyaçlara göre değişir. Bu yüzden önce sizi dinliyor, sonra teklif oluşturuyoruz. Launch, Growth ve Scale paketleri bunun için başlangıç referansı sağlar.",
  },
];

export const blogPosts = [
  {
    title: "Özel Web Tasarımı İçin Şeffaf Fiyatlandırma",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    image: blogWireframeImage,
  },
  {
    title: "Seo Başarısı: Dijital Ortamda Gezinmek",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    image: blogSeoImage,
  },
  {
    title: "E-Ticaret Devrimi: Başarı İçin Stratejiler",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    image: blogEcommerceImage,
  },
];

export function SectionEyebrow({
  prefix,
  highlight,
  suffix = "",
  center = false,
}: {
  prefix: string;
  highlight: string;
  suffix?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight tracking-tight text-white md:text-[42px]">
        {prefix}
        <span className="mx-2 inline-block -rotate-[1.6deg] bg-[#b5ff15] px-3 py-1 text-black">
          {highlight}
        </span>
        {suffix}
      </h2>
    </div>
  );
}

export function ServiceCard({
  title,
  description,
  cta,
  icon,
  to,
}: {
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  to?: string;
}) {
  return (
    <article className="h-full rounded-[18px] border border-[#8a38f5]/80 bg-[linear-gradient(180deg,rgba(13,16,24,0.92),rgba(7,9,14,0.92))] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(138,56,245,0.22)]">
      <div className="mb-7 min-h-12">{icon}</div>
      <h3 className="text-[22px] font-semibold text-white">{title}</h3>
      <p className="mt-5 text-sm leading-6 text-white/74">{description}</p>
      <Link className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-[#b5ff15]" to={to ?? "/hizmetler"}>
        <ArrowRight className="h-4 w-4" />
        <span>{cta}</span>
      </Link>
    </article>
  );
}

export function ProjectCard({
  title,
  image,
  tags,
}: {
  title: string;
  image: string;
  tags: string[];
}) {
  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-white/8 bg-black">
      <img
        alt={title}
        className="h-[250px] w-full object-cover opacity-76 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#b5ff15]/50 bg-[#b5ff15]/12 px-3 py-1 text-[11px] font-medium text-[#b5ff15]"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    </article>
  );
}

export function PackageCard({
  name,
  description,
  price,
  suffix,
  note,
  features,
  accent,
  cta,
  icon,
  featured,
  badge,
}: (typeof packageCards)[number]) {
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
      check: "text-white",
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
      check: "text-white",
    },
  }[accent];

  return (
    <article
      className={`relative rounded-[24px] bg-gradient-to-b ${tones.shell} p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-2 ${
        featured ? "scale-100 md:-translate-y-3 md:scale-[1.03]" : ""
      }`}
    >
      {badge ? (
        <div className="absolute right-4 top-4 rotate-[24deg] rounded-md bg-[#303030] px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#b5ff15]">
          {badge}
        </div>
      ) : null}
      <div className={`mb-7 inline-flex rounded-full p-4 ${tones.iconShell}`}>
        <img alt={name} className="h-10 w-10 object-contain" src={icon} />
      </div>
      <h3 className={`text-[28px] font-bold tracking-tight ${tones.title}`}>{name}</h3>
      <p className={`mt-4 max-w-[28rem] text-sm leading-6 ${tones.body}`}>{description}</p>
      <div className="mt-8 flex items-end gap-2">
        <span className={`text-[44px] font-extrabold leading-none tracking-tight ${tones.price}`}>{price}</span>
        {suffix ? <span className={`pb-1 text-lg font-bold ${tones.price}`}>{suffix}</span> : null}
      </div>
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>
        *Aylık • Aylık Sözleşmeli • İstediğiniz zaman iptal
      </p>
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

export function ReviewCard({
  name,
  company,
  detail,
  avatar,
}: (typeof testimonials)[number]) {
  return (
    <article className="rounded-[18px] border border-white/12 bg-[#262626] p-6 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
      <div className="mb-5 flex gap-1 text-[#b5ff15]">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="text-sm leading-6 text-white/76">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis hendrerit dolor magna eget est lorem ipsum dolor sit.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <img alt={name} className="h-14 w-14 rounded-full object-cover" src={avatar} />
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-white/56">{company}</p>
          <p className="text-[11px] text-white/38">{detail}</p>
        </div>
      </div>
    </article>
  );
}

export function BlogCard({
  title,
  description,
  image,
}: (typeof blogPosts)[number]) {
  return (
    <article className="group">
      <div className="overflow-hidden rounded-[18px] border border-white/8">
        <img
          alt={title}
          className="h-[260px] w-full object-cover transition duration-500 group-hover:scale-105"
          src={image}
        />
      </div>
      <h3 className="mt-6 text-[22px] font-bold text-[#b5ff15]">{title}</h3>
      <p className="mt-3 max-w-[28rem] text-sm leading-6 text-white/72">{description}</p>
      <ActionButton accent="lime" className="mt-6" label="Okumaya Devam Et" />
    </article>
  );
}


export { ActionButton, ArrowRight, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageFeatureBullet, PaymentLogos, Plus, Search, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogSeoImage, blogWireframeImage, getFooterLinkTarget, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, projectInstagramPosts, projectInstagramStory, projectWebLanding, trustBannerImage, useEffect, useState };
