import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Facebook,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquareText,
  Package2,
  Palette,
  Reply,
  Users,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import stepMeetingImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.webp";
import stepAccountImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.webp";
import stepDashboardImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import socialStartIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import socialProIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import socialBrandIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";
import socialFacebookIcon from "../../../assets/e85560ced236146567089e9e207b21cb74f94c95.png";
import socialInstagramIcon from "../../../assets/e0029c37d99a6a8e289a793abaaf02984f19717b.png";
import socialLinkedinIcon from "../../../assets/1c1a20c7d8c2a14e8d97dd68e316412e56d2450f.png";
import socialYoutubeIcon from "../../../assets/f89bf8640ce3923c3ad0dcc795f0662e2923a50f.png";
import socialTiktokIcon from "../../../assets/7d47dd30db922c5fc58659809a3e1d956b9dd2a4.png";
import socialWhatsappIcon from "../../../assets/100df1ea0b5537c2a776132fa6b5f2184d8ffc8e.png";
import socialSnapchatIcon from "../../../assets/ee893046d93b786d05f5b1cb76d451b4f7a0f95c.png";
import socialPinterestIcon from "../../../assets/9fc2a7e67129638bedcf545812f1b84bbfbdb7c9.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import { getFooterLinkTarget } from "../site/footerLinks";

export type JourneyCardData = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  tone: "lime" | "light" | "violet";
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

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const socialIcons = [
  socialFacebookIcon,
  socialInstagramIcon,
  socialLinkedinIcon,
  socialYoutubeIcon,
  socialTiktokIcon,
  socialWhatsappIcon,
  socialSnapchatIcon,
  socialPinterestIcon,
];

export const journeyCards: JourneyCardData[] = [
  {
    eyebrow: "Üye Olun ve",
    title: "Önce Ekibimizle Bir Toplantı Yapın!",
    description:
      "Sistem üzerinden marka ya da influencer hesabınızı oluşturun ve sizin için oluşturulan ekibinizle hemen bir toplantı planlayın.",
    image: stepMeetingImage,
    tone: "lime",
  },
  {
    eyebrow: "Toplantıdan sonra",
    title: "Marka hesabınız ile Satın Alım Yapın!",
    description:
      "Toplantı sonrası sistemimizi kullanarak sizler için oluşturulmuş olan linkten satın alımınızı gerçekleştirin.",
    image: stepAccountImage,
    tone: "light",
  },
  {
    eyebrow: "Her Türlü Paylaşımı",
    title: "Sistem Üzerinden Onaylayın, Paylaşalım!",
    description:
      "Konuşulan talepler doğrultusunda hazırlanan içerikler dashboard'unuzda sunulsun; ister onaylayın ister revize isteyin.",
    image: stepDashboardImage,
    tone: "violet",
  },
];

export const featureTiles = [
  { label: "Özel Tasarımlar", icon: Palette },
  { label: "DM Yanıtlanma", icon: MessageSquareText },
  { label: "Reklam Yönetimi", icon: Megaphone },
  { label: "Yorumları Cevaplama", icon: Reply },
  { label: "Rakip Analizleri", icon: BarChart3 },
  { label: "Toplantılar", icon: Users },
  { label: "Paylaşım Takvimi", icon: CalendarRange },
  { label: "Özel Raporlar", icon: BarChart3 },
  { label: "Özel Dashboard", icon: LayoutDashboard },
];

export const packageCards: PackageData[] = [
  {
    name: "Social Start Paketi",
    description:
      "İşletmenizin sosyal medyadaki ilk adımını sağlam atması için tasarlandı. Düzenli içerik, doğru mesaj ve profesyonel görünümle markanızı dijital dünyaya hazır hale getirir.",
    price: "17.499 ₺",
    suffix: "/ ay",
    note: "Sosyal medya düzenli, temiz ve profesyonel görünür.",
    cta: "Başlamaya Hazırım",
    icon: socialStartIcon,
    accent: "cyan",
    features: [
      "Platform seçimi & kurulum",
      "Aylık içerik planı (12-16 post)",
      "Görsel tasarım (şablon + markaya uygun)",
      "Caption & hashtag stratejisi",
      "Haftalık paylaşım",
      "Temel DM & yorum takibi",
      "Aylık performans özeti",
    ],
  },
  {
    name: "Social Pro Paketi",
    description:
      "Sosyal medya ve içerik süreçlerinizi büyüme odaklı bir sisteme dönüştürür. Etkileşimi artıran içerikler ve detaylı analizlerle markanızı bir üst seviyeye taşır.",
    price: "27.500 ₺",
    suffix: "/ ay",
    note: "Marka konuşulur, etkileşim artar, topluluk oluşur.",
    cta: "Büyüme Görüşmesi",
    icon: socialProIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Social Start içeriğinin tamamı",
      "Aylık 20-24 içerik",
      "Reel & video içerik kurgusu",
      "Etkileşim odaklı içerik konseptleri",
      "DM & yorum yönetimi",
      "Rakip & trend analizi",
      "Story paylaşımları",
      "Aylık detaylı rapor",
    ],
  },
  {
    name: "Social Brand+ Plus",
    description:
      "Marka algısı, itibar ve sürdürülebilir büyüme için tasarlandı. Sosyal medyayı markanızın en güçlü iletişim kanalına dönüştürür.",
    price: "İletişime Geçin*",
    note: "Sosyal medya bir vitrin değil, güçlü bir marka kanalıdır.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: socialBrandIcon,
    accent: "violet",
    features: [
      "Social Pro içeriğinin tamamı",
      "Aylık 30+ içerik",
      "Story & highlight yönetimi",
      "Kriz & itibar yönetimi",
      "Influencer / iş birliği danışmanlığı",
      "Reklam içeriği için kreatif destek",
      "Haftalık performans takibi",
      "Aylık strateji toplantısı",
    ],
  },
];

export function SectionHeading({
  prefix,
  highlight,
  center = false,
  highlightClassName = "bg-[#b5ff15] text-black",
}: {
  prefix: string;
  highlight: string;
  center?: boolean;
  highlightClassName?: string;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight text-white md:text-[42px]">
        {prefix}
        <span className={`mx-2 inline-block rotate-[-1deg] px-3 py-1 ${highlightClassName}`}>
          {highlight}
        </span>
      </h2>
    </div>
  );
}

export function JourneyCard({ eyebrow, title, description, image, tone }: JourneyCardData) {
  const tones = {
    lime: "bg-[#b5ff15] text-[#13170a]",
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

export function FeatureTile({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/12 px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-white/10 p-3 text-white">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{label}</h3>
      </div>
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
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>
        *Aylık • Aylık sözleşmeli • İstediğiniz zaman iptal
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


export { ActionButton, ArrowRight, BarChart3, CalendarDays, CalendarRange, Facebook, HeroBackdrop, Instagram, LayoutDashboard, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MessageSquareText, Package2, PackageFeatureBullet, Palette, PaymentLogos, Reply, Users, X, Youtube, getFooterLinkTarget, logoImage, socialBrandIcon, socialFacebookIcon, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialProIcon, socialSnapchatIcon, socialStartIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, stepAccountImage, stepDashboardImage, stepMeetingImage, useState };
