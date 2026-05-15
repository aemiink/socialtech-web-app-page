import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  BarChart3,
  CalendarDays,
  Check,
  Code2,
  Facebook,
  Gauge,
  Globe,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Package2,
  PanelsTopLeft,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import productIllustration from "../../../assets/83cc49f17772c91d9271f333870b3c09d4d21aa4.webp";
import interfaceIcon from "../../../assets/dff7469f9313f17f27e9efb8174ceb54235acb08.png";
import seoIcon from "../../../assets/cbe607eb3f54ad7b61aafcae8659f361cfea1078.png";
import speedIcon from "../../../assets/fa5f8979fb13ea6b9e298585ab60ae5cacffecdf.png";
import panelIcon from "../../../assets/cc3a73b6f38cea421b8743c49f0f128183d4c187.png";
import meetingIcon from "../../../assets/36b34f4a2291e3a31de2afbe58d3823ebdc1e730.png";
import shopifyIcon from "../../../assets/cc24a5c5ac0319bdeacf0c74b1781b13e57edb85.png";
import wooIcon from "../../../assets/f16185c3fccdbc09b48f3936735bf25fbd2b91a2.png";
import wordpressIcon from "../../../assets/a56dc130860c00dd18ef049f57bc6aed87db0f63.png";
import wixIcon from "../../../assets/f7749653a3663ed07e43018262e3b49114327c4a.png";
import lightningIcon from "../../../assets/6b28e6372b5679aecd6606305bad3b4544d5fb47.png";
import customWindowIcon from "../../../assets/3d207c82e4a8ece2497d77ec0e54505c5671a4a7.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import { getFooterLinkTarget } from "../site/footerLinks";

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const valueCards = [
  {
    title: "Ürün Odaklı Arayüzler",
    description: "Sadece güzel görünen değil, kullanıcıyı aksiyona götüren arayüzler tasarlarız.",
    icon: interfaceIcon,
  },
  {
    title: "Arama Motorlarına Hazır Mimari",
    description: "SEO sonradan eklenmez, altyapının parçası olarak inşa edilir.",
    icon: seoIcon,
  },
  {
    title: "Yüksek Performanslı Yapılar",
    description: "Hız, güvenlik ve stabilite ölçeklenebilir web ürünlerinin temelidir.",
    icon: speedIcon,
  },
  {
    title: "Özel Yönetim Panelleri",
    description: "İçeriğinizi, kullanıcılarınızı ve verilerinizi tek merkezden yönetin.",
    icon: panelIcon,
  },
];

export const workflow = [
  {
    title: "Keşif & Hedefleme",
    description: "İşinizi, hedefinizi ve teknik ihtiyaçları netleştiriyoruz.",
    icon: Search,
  },
  {
    title: "Mimari & Tasarım",
    description: "Ürüne uygun altyapı ve arayüzü planlıyoruz.",
    icon: PanelsTopLeft,
  },
  {
    title: "Geliştirme & Test",
    description: "Performans, SEO ve güvenlik testleriyle geliştiriyoruz.",
    icon: Code2,
  },
  {
    title: "Yayın & Ölçekleme",
    description: "Canlıya alıyor, büyümeye hazır hale getiriyoruz.",
    icon: Rocket,
  },
];

export const platforms = [shopifyIcon, wooIcon, wordpressIcon, wixIcon, lightningIcon, customWindowIcon];

export const faqItems = [
  {
    question: "Neden Profesyonel Web Uygulaması?",
    answer:
      "Profesyonel web uygulamaları sadece bir arayüz değil; iş süreçlerini dijitale taşıyan, ölçeklenebilir ve sürdürülebilir sistemlerdir. Doğru mimari performans, güvenlik ve büyüme açısından uzun vadeli avantaj sağlar.",
  },
  {
    question: "Web Uygulaması Geliştirirken Nelere Önemli?",
    answer:
      "Web uygulamasının iş hedeflerine hizmet etmesi, kullanıcı deneyiminin sade ve akıcı olması, performanslı çalışması ve gelecekte geliştirilebilir bir mimariye sahip olması gerekir.",
  },
  {
    question: "Web Uygulamasının Temel Amacı Nedir?",
    answer:
      "Temel amaç manuel süreçleri otomatikleştirmek, veriyi anlamlı hale getirmek ve kullanıcıların belirli aksiyonları kolayca almasını sağlamaktır.",
  },
  {
    question: "Web Uygulamasını Nasıl Yöneteceğim?",
    answer:
      "Proje sonunda size özel bir yönetim paneli sunulur. Ekibiniz için kullanım ve yönetim eğitimi verilir; teknik detaylara takılmadan sistemi yönetebilirsiniz.",
  },
  {
    question: "Web Uygulamaları SEO'ya Uygun mu?",
    answer:
      "Web uygulamaları SEO uyumlu şekilde geliştirilebilir. Performans, içerik yapısı ve kullanıcı davranışları teknik altyapıyla birlikte ele alınır.",
  },
  {
    question: "Web Uygulaması Geliştirme Süresi Ne Kadar?",
    answer:
      "Kapsama göre değişir. Basit uygulamalar 3-4 hafta içinde tamamlanabilirken, daha kompleks özel çözümler 6-10 hafta sürebilir.",
  },
  {
    question: "Satış Sonrası Destek Sunuyor Musunuz?",
    answer:
      "Evet. Yayına alma sonrası belirli bir süre teknik destek sağlıyoruz. Uzun vadeli bakım, geliştirme ve ölçekleme için destek paketleri de sunabiliyoruz.",
  },
  {
    question: "Fiyatlandırma Nasıl Yapılıyor? Aylık mı?",
    answer:
      "Web uygulamaları genellikle proje bazlı fiyatlandırılır. Sürekli geliştirme, bakım veya SaaS benzeri yapılar için aylık ya da periyodik model de uygulanabilir.",
  },
  {
    question: "Web Uygulamasının Teknik Desteği Ücretli mi?",
    answer:
      "İlk destek süresi projeye dahildir. Sonrasında ihtiyaçlarınıza göre bakım ve destek paketleri sunulur.",
  },
  {
    question: "Hazır Platform mu, Custom Web Uygulaması mı?",
    answer:
      "İhtiyaca göre karar veriyoruz. İşiniz hazır platformlarla çözülebiliyorsa bunu söyleriz; özel iş akışları ve entegrasyonlar gerekiyorsa custom web uygulaması geliştiririz.",
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
      <h2 className="text-[30px] font-bold leading-tight text-white md:text-[42px]">
        {prefix}
        <span className="mx-2 inline-block rotate-[-1deg] bg-[#b5ff15] px-3 py-1 text-black">
          {highlight}
        </span>
      </h2>
    </div>
  );
}

export function ValueCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/12 p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-black/40 p-3">
          <img alt="" className="h-10 w-10 object-contain" src={icon} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/66">{description}</p>
        </div>
      </div>
    </article>
  );
}

export function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-lg bg-white/12 p-7">
      <h3 className="text-[22px] font-bold leading-tight text-white">{question}</h3>
      <p className="mt-4 text-sm leading-6 text-white/70">{answer}</p>
    </article>
  );
}


export { ActionButton, BarChart3, CalendarDays, Check, Code2, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PanelsTopLeft, Rocket, Search, ShieldCheck, Sparkles, Users, Wrench, X, Youtube, customWindowIcon, getFooterLinkTarget, interfaceIcon, lightningIcon, logoImage, meetingIcon, panelIcon, productIllustration, seoIcon, shopifyIcon, speedIcon, useState, wixIcon, wooIcon, wordpressIcon };
