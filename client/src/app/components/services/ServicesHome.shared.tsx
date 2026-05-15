import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  ChartColumn,
  Code2,
  Facebook,
  Globe,
  Instagram,
  Layers3,
  LayoutTemplate,
  Linkedin,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Package2,
  Search,
  Smartphone,
  Sparkles,
  Wrench,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import focusIllustration from "../../../assets/5e20f8ba4c40fbc150b631266aed6ef04a12a35e.webp";
import growthHubIcon from "../../../assets/68dd4a4fc4783dc83cbb2467ace3baf4d5b9a15d.png";
import metaIcon from "../../../assets/65e1a43c4dce73a01c24356c3586bfbf475832d6.png";
import googleAdsIcon from "../../../assets/5b206b0237faec866dce4fbe8362d34d74185271.png";
import tiktokIcon from "../../../assets/a1de6043ae1c2f3e2f2d6cda834f1928f2d41623.png";
import amazonIcon from "../../../assets/c522312a5748c7b7f98f6a7c5116f935fa925f9c.png";
import hubIcon from "../../../assets/0d460586791bd1107e32f062391c4347fcc9c89a.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import { getFooterLinkTarget } from "../site/footerLinks";

export type ServiceCardData = {
  title: string;
  description: string;
  icon: ReactNode;
  to?: string;
  href?: string;
};

export type ServiceGroup = {
  id: "social" | "web" | "support";
  label: string;
  icon: ReactNode;
  cards: ServiceCardData[];
};

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const serviceGroups: ServiceGroup[] = [
  {
    id: "social",
    label: "Sosyal Medya & Reklam Hizmetleri",
    icon: <Megaphone className="h-4 w-4" />,
    cards: [
      {
        title: "Growth & Hub",
        description:
          "B2B startup'lar ve içerik üreticileri için ölçülebilir büyüme sağlayan dijital pazarlama stratejileri kurduğumuz, büyüme odaklı hizmetler.",
        icon: <img alt="Growth & Hub" className="h-11 w-11 object-contain" src={growthHubIcon} />,
        to: "/hizmetler/buyume-hub",
      },
      {
        title: "Sosyal Medya Yönetimi",
        description:
          "Sosyal medyayı marka bilinirliğinden satışa giden bir büyüme sistemine dönüştürüyoruz. Sosyal medyanız satış gelir kapınız olsun.",
        icon: (
          <div className="flex flex-wrap items-center gap-2">
            <img alt="Meta" className="h-10 w-10 object-contain" src={metaIcon} />
            <img alt="Google Ads" className="h-10 w-10 object-contain" src={googleAdsIcon} />
            <img alt="TikTok" className="h-10 w-10 object-contain" src={tiktokIcon} />
            <img alt="Amazon" className="h-10 w-10 object-contain" src={amazonIcon} />
          </div>
        ),
        to: "/hizmetler/sosyal-medya",
      },
      {
        title: "Medya Hub",
        description:
          "Meta, Google, TikTok ve Amazon reklamlarını ayrı ayrı değil; tek bir strateji, tek bir hedef ve tek panelden yönetilebilir bir yapı içinde birleştiriyoruz.",
        icon: <img alt="Medya Hub" className="h-11 w-11 object-contain" src={hubIcon} />,
        to: "/hizmetler/dijital-pazarlama-hub",
      },
      {
        title: "Meta ADS Yönetimi",
        description:
          "Test edilen, optimize edilen ve satışa dönen Meta reklam sistemleri kuruyoruz. Meta platformunuzu büyüme için bize emanet edin.",
        icon: <img alt="Meta ADS" className="h-11 w-11 object-contain" src={metaIcon} />,
        to: "/hizmetler/meta-reklamlari",
      },
      {
        title: "TikTok ADS Yönetimi",
        description:
          "Dikkat yakalayan kreatiflerle desteklenen, test edilmiş ve optimize edilen TikTok reklam sistemleri kuruyoruz.",
        icon: <img alt="TikTok ADS" className="h-11 w-11 object-contain" src={tiktokIcon} />,
        to: "/hizmetler/tiktok-reklamlari",
      },
      {
        title: "Google ADS Yönetimi",
        description:
          "Arama niyeti yüksek kullanıcıları hedefleyen, ölçülebilir ve optimize edilmiş reklam sistemleriyle talebi satışa çeviriyoruz.",
        icon: <img alt="Google ADS" className="h-11 w-11 object-contain" src={googleAdsIcon} />,
        to: "/hizmetler/google-reklamlari",
      },
      {
        title: "Amazon ADS Yönetimi",
        description:
          "Pazar yeri görünürlüğünü satışa bağlayan Amazon reklam sistemleri kuruyor, marka performansınızı tek plan altında yönetiyoruz.",
        icon: <img alt="Amazon ADS" className="h-11 w-11 object-contain" src={amazonIcon} />,
        to: "/hizmetler/amazon-reklamlari",
      },
    ],
  },
  {
    id: "web",
    label: "Web & Mobil Hizmetler",
    icon: <MonitorSmartphone className="h-4 w-4" />,
    cards: [
      {
        title: "Web Uygulamaları",
        description:
          "Geliştirdiğimiz her proje; yalnızca bir arayüz değil, iş hedeflerinize hizmet eden ölçeklenebilir bir web ürünüdür. Tasarım, performans ve yönetilebilirlik tek sistemde birleşir.",
        icon: <Globe className="h-11 w-11 text-[#b5ff15]" />,
        to: "/hizmetler/web-uygulama",
      },
      {
        title: "Mobil Uygulamalar",
        description:
          "Mobil uygulamaları, kullanıcı deneyimi ve sürdürülebilir geliştirme mantığıyla ele alıyoruz. Kurgudan yayına kadar tek yapıda ilerliyoruz.",
        icon: <Smartphone className="h-11 w-11 text-[#b5ff15]" />,
        to: "/hizmetler/mobil-uygulama",
      },
      {
        title: "Karşılama Sayfaları",
        description:
          "Reklamdan gelen trafiği, ölçülebilir şekilde müşteriye dönüştüren hızlı ve performans odaklı landing page'ler inşa ediyoruz.",
        icon: <LayoutTemplate className="h-11 w-11 text-[#b5ff15]" />,
        to: "/hizmetler/karsilama-sayfasi",
      },
      {
        title: "Web & Mobil Tasarımlar",
        description:
          "Markanızın dijital deneyimini estetik değil, dönüşüm odaklı düşünürüz. UI/UX tasarımında kullanıcı akışını bozmadan güçlü bir görsel dil kurarız.",
        icon: <Layers3 className="h-11 w-11 text-[#b5ff15]" />,
        to: "/hizmetler/web-tasarim",
      },
    ],
  },
  {
    id: "support",
    label: "Teknik Destek Hizmetleri",
    icon: <Wrench className="h-4 w-4" />,
    cards: [
      {
        title: "Teknik Destek",
        description:
          "Teknik destek, bakım ve optimizasyon ile sitenizi hızlandırıyor; hataları gideriyor ve satışa hazır hale getiriyoruz.",
        icon: <Code2 className="h-11 w-11 text-[#b5ff15]" />,
        to: "/hizmetler/web-teknik-destek",
      },
      {
        title: "SEO Denetimi",
        description:
          "SEO denetimi, teknik optimizasyon ve sürekli destek ile mevcut web sitenizi arama görünürlüğü ve performans için hazır hale getiriyoruz.",
        icon: <Search className="h-11 w-11 text-[#b5ff15]" />,
        to: "/hizmetler/seo",
      },
    ],
  },
];

export const principles = [
  {
    title: "Tasarım bir araçtır, amaç değil",
    description: "Tasarım satışa hizmet etmiyorsa yeniden düşünülür, yeniden kurgulanır.",
  },
  {
    title: "Ölçülemeyen şey büyütülemez",
    description: "Her projede veri, rapor ve KPI vardır. Kararları hissiyat değil veri verir.",
  },
  {
    title: "Her projede veri, rapor ve KPI vardır",
    description: "Sistem kurulmadan ölçek olmaz. Her kanal için düzenli ölçüm ve takip gerekir.",
  },
  {
    title: "Kopya çözüm yok",
    description: "Hazır şablon değil, ihtiyaca göre şekillenen bir dijital mimari tasarlarız.",
  },
];

export const focusFeatures = [
  {
    title: "Teknik Detay",
    description: "Alt yapınızı kuralım ya da bozmadan düzenleyelim.",
    tags: ["WordPress", "Shopify"],
    icon: Globe,
  },
  {
    title: "Reklam ve Yönetim",
    description: "Sosyal medyalarınızı ve reklamlarınızı tek merkezden kontrol edelim.",
    tags: ["Meta", "Google ADS", "TikTok"],
    icon: Megaphone,
  },
  {
    title: "Custom Web Çözümleri",
    description: "Komisyonsuz, size özel entegrasyonlarla çalışan web ürünleri geliştiriyoruz.",
    tags: ["Custom", "Dashboard"],
    icon: Layers3,
  },
  {
    title: "Teknik Sorunlar",
    description: "Kod ve sunucu sorunlarını çözerek sisteminizi sürekli hazır tutuyoruz.",
    tags: ["Bakım", "Optimizasyon"],
    icon: Wrench,
  },
];

export function SectionHeading({
  prefix,
  highlight,
  center = false,
}: {
  prefix: string;
  highlight: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight tracking-tight text-white md:text-[42px]">
        {prefix}
        <span className="mx-2 inline-block -rotate-[1.4deg] bg-[#b5ff15] px-3 py-1 text-black">
          {highlight}
        </span>
      </h2>
    </div>
  );
}

export function ServiceCard({ title, description, icon, to, href }: ServiceCardData) {
  const cta = (
    <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold italic text-[#b5ff15]">
      <ArrowRight className="h-4 w-4" />
      <span>Sistemi İncele</span>
    </span>
  );

  return (
    <article className="rounded-[18px] border-2 border-[#8a38f5] bg-[#050607] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(138,56,245,0.18)]">
      <div className="mb-7 min-h-12">{icon}</div>
      <h3 className="text-[22px] font-semibold leading-tight text-white">{title}</h3>
      <p className="mt-5 text-sm leading-6 text-white/72">{description}</p>
      {to ? (
        <Link className="inline-flex" to={to}>
          {cta}
        </Link>
      ) : (
        <a className="inline-flex" href={href}>
          {cta}
        </a>
      )}
    </article>
  );
}


export { ActionButton, ArrowRight, CalendarDays, ChartColumn, Code2, Facebook, Globe, HeroBackdrop, Instagram, Layers3, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MonitorSmartphone, Package2, Search, Smartphone, Sparkles, Wrench, X, Youtube, amazonIcon, focusIllustration, getFooterLinkTarget, googleAdsIcon, growthHubIcon, hubIcon, logoImage, metaIcon, tiktokIcon, useState };
