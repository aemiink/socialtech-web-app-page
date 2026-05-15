import { useState } from "react";
import { Link } from "react-router";
import {
  Blocks,
  Bot,
  BrainCircuit,
  CalendarDays,
  ChartColumn,
  Facebook,
  Gauge,
  Globe,
  Instagram,
  LayoutDashboard,
  LayoutTemplate,
  Layers3,
  Linkedin,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  Package2,
  PencilRuler,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import manifestoIllustration from "../../../assets/2451c6f130ea0918f38f6002b1e6ebfc1c2f99df.webp";
import manifestoPanelIcon from "../../../assets/dff7469f9313f17f27e9efb8174ceb54235acb08.png";
import manifestoMetrics from "../../../assets/cbe607eb3f54ad7b61aafcae8659f361cfea1078.png";
import manifestoSpeed from "../../../assets/fa5f8979fb13ea6b9e298585ab60ae5cacffecdf.png";
import manifestoWeb from "../../../assets/cc3a73b6f38cea421b8743c49f0f128183d4c187.png";
import processStepOneImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.webp";
import processStepTwoImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.webp";
import processStepThreeImage from "../../../assets/d407dea157c52e067680066f8673e56861aa712d.png";
import processStepFourImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import socialFacebookIcon from "../../../assets/e85560ced236146567089e9e207b21cb74f94c95.png";
import socialInstagramIcon from "../../../assets/e0029c37d99a6a8e289a793abaaf02984f19717b.png";
import socialLinkedinIcon from "../../../assets/1c1a20c7d8c2a14e8d97dd68e316412e56d2450f.png";
import socialYoutubeIcon from "../../../assets/f89bf8640ce3923c3ad0dcc795f0662e2923a50f.png";
import socialTiktokIcon from "../../../assets/7d47dd30db922c5fc58659809a3e1d956b9dd2a4.png";
import socialWhatsappIcon from "../../../assets/100df1ea0b5537c2a776132fa6b5f2184d8ffc8e.png";
import socialSnapchatIcon from "../../../assets/ee893046d93b786d05f5b1cb76d451b4f7a0f95c.png";
import socialPinterestIcon from "../../../assets/9fc2a7e67129638bedcf545812f1b84bbfbdb7c9.png";
import toolPhotoshopIcon from "../../../assets/a3de08031b9f85a9f9727b45980157fd6355c073.png";
import toolIllustratorIcon from "../../../assets/58f77f624371049002598eeb7cdd1d1f5d7a23d1.png";
import toolWooCommerceIcon from "../../../assets/f16185c3fccdbc09b48f3936735bf25fbd2b91a2.png";
import toolWordPressIcon from "../../../assets/a56dc130860c00dd18ef049f57bc6aed87db0f63.png";
import toolWixIcon from "../../../assets/f7749653a3663ed07e43018262e3b49114327c4a.png";
import toolQuickModeIcon from "../../../assets/6b28e6372b5679aecd6606305bad3b4544d5fb47.png";
import toolWindowIcon from "../../../assets/3d207c82e4a8ece2497d77ec0e54505c5671a4a7.png";
import toolShopifyIcon from "../../../assets/cc24a5c5ac0319bdeacf0c74b1781b13e57edb85.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import { getFooterLinkTarget } from "../site/footerLinks";

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda", active: true },
];

export const manifestoPoints = [
  {
    title: "Strateji + Uygulama birlikte",
    description:
      "Sadece strateji hazırlamakla kalmıyor, onu canlıya alıp büyüme ritmine sokuyoruz.",
    icon: manifestoPanelIcon,
  },
  {
    title: "Ölçümleme olmadan iş yapmayız",
    description:
      "Her kanal, her sistem ve her kampanya net KPI'lar ve okunabilir raporlarla ilerler.",
    icon: manifestoMetrics,
  },
  {
    title: "Her işin bir hedefi vardır",
    description:
      "Her üretim, rastgele görünmek için değil; satış, dönüşüm ve sistem performansı için yapılır.",
    icon: manifestoSpeed,
  },
  {
    title: "Özel yönetim panelleri",
    description:
      "İçeriklerinizi, kullanıcılarınızı ve verilerinizi tek merkezde yönetebileceğiniz yapılar kuruyoruz.",
    icon: manifestoWeb,
  },
];

export const thoughtCards = [
  {
    title: "Tasarım bir araçtır, amaç değil",
    description: "Tasarımı görünürlük için değil, hedefe hizmet eden bir sistem parçası olarak ele alırız.",
  },
  {
    title: "Ölçülemeyen şey büyütülemez",
    description: "Her projede veri, rapor ve sürekli izlenen KPI'lar vardır.",
  },
  {
    title: "Sistem kurmadan çıkış olmaz",
    description: "Her işte süreç, sorumluluk ve tekrar üretilebilir bir yapı kurarız.",
  },
  {
    title: "Kopya çözüm yok",
    description: "Hazır şablon değil, ihtiyaca göre çalışan bir mimari tasarlarız.",
  },
];

export const capabilities = [
  { title: "Web & UI/UX Tasarım", icon: PencilRuler },
  { title: "Dijital Pazarlama Altyapıları", icon: Megaphone },
  { title: "Otomasyon & Entegrasyon", icon: Workflow },
  { title: "Landing Page", icon: LayoutTemplate },
  { title: "SEO & Teknik Destek", icon: Search },
  { title: "AI Entegrasyonları", icon: Bot },
  { title: "Funnel Sistemleri", icon: Layers3 },
  { title: "Ölçümleme & Dashboard", icon: ChartColumn },
  { title: "Özel Dashboardlar", icon: LayoutDashboard },
];

export const processSteps = [
  {
    step: "1. Adım",
    title: "Analiz & Hedefleme",
    description:
      "İş modelini, kullanıcı davranışını ve büyümeyi besleyen darboğazları birlikte netleştiriyoruz.",
    accent: "lime" as const,
    image: processStepOneImage,
  },
  {
    step: "2. Adım",
    title: "Strateji & Mimari",
    description:
      "Toplanan sorunları sistem taslağına çevirip rol, akış ve öncelikleri görünür hale getiriyoruz.",
    accent: "violet" as const,
    image: processStepTwoImage,
  },
  {
    step: "3. Adım",
    title: "Uygulama & Test",
    description:
      "Üretimi size özel ekranlar, otomasyonlar ve içerik sistemleriyle canlıya alıp sahada test ediyoruz.",
    accent: "cyan" as const,
    image: processStepThreeImage,
  },
  {
    step: "4. Adım",
    title: "Optimizasyon ve Ölçekleme",
    description:
      "Raporlar ve verilerle sistemi düzenli iyileştiriyor, tıkanan alanları birlikte çözüyoruz.",
    accent: "light" as const,
    image: processStepFourImage,
  },
];

export const whyUs = [
  { title: "Ajans değil ürün mantığı", icon: Blocks },
  { title: "Tek merkezden yönetim", icon: Globe },
  { title: "Gerçek KPI'lar", icon: Target },
  { title: "Uzun vadeli iş ortaklığı", icon: ShieldCheck },
  { title: "Ölçeklenebilir sistemler", icon: Gauge },
];

export const socialIcons = [
  socialFacebookIcon,
  socialInstagramIcon,
  socialWhatsappIcon,
  socialYoutubeIcon,
  socialTiktokIcon,
  socialLinkedinIcon,
  socialSnapchatIcon,
  socialPinterestIcon,
];

export const toolIcons = [
  toolPhotoshopIcon,
  toolIllustratorIcon,
  toolShopifyIcon,
  toolWooCommerceIcon,
  toolWordPressIcon,
  toolWixIcon,
  toolQuickModeIcon,
  toolWindowIcon,
];

export function SectionHeading({
  prefix,
  highlight,
  center = false,
  accent = "lime",
}: {
  prefix: string;
  highlight: string;
  center?: boolean;
  accent?: "lime" | "violet";
}) {
  const shell = accent === "violet" ? "bg-[#8a38f5]" : "bg-[#b5ff15]";

  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight tracking-tight text-white md:text-[42px]">
        {prefix}
        <span className={`mx-2 inline-block -rotate-[1.4deg] px-3 py-1 text-black ${shell}`}>
          {highlight}
        </span>
      </h2>
    </div>
  );
}

export function ProcessCard({
  step,
  title,
  description,
  accent,
  image,
}: (typeof processSteps)[number]) {
  const tones = {
    lime: {
      shell: "bg-[#b5ff15] text-[#141a0d]",
      muted: "text-[#1e2614]/76",
    },
    violet: {
      shell: "bg-[#8a38f5] text-white",
      muted: "text-white/76",
    },
    cyan: {
      shell: "bg-[#00a2e5] text-white",
      muted: "text-white/78",
    },
    light: {
      shell: "bg-[#f1f1f1] text-[#1c1c1c]",
      muted: "text-[#1c1c1c]/72",
    },
  }[accent];

  return (
    <article className={`rounded-[22px] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)] ${tones.shell}`}>
      <p className="text-sm font-medium">{step}</p>
      <h3 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">{title}</h3>
      <p className={`mt-4 text-sm leading-6 ${tones.muted}`}>{description}</p>
      <div className="mt-8 overflow-hidden rounded-[18px] border border-black/8 bg-black/10">
        <img alt={title} className="h-[200px] w-full object-cover" src={image} />
      </div>
    </article>
  );
}


export { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, Search, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoSpeed, manifestoWeb, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, socialFacebookIcon, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, useState };
