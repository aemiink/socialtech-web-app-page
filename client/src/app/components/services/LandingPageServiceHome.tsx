import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  CalendarDays,
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
import photoshopIcon from "../../../assets/a3de08031b9f85a9f9727b45980157fd6355c073.png";
import illustratorIcon from "../../../assets/58f77f624371049002598eeb7cdd1d1f5d7a23d1.png";
import designIcon from "../../../assets/a40fe3d757147e38682e79fcea9f480b98b0e79a.png";
import codeIcon from "../../../assets/73ff1c552c8cb8973c90bb6519ca5c8c5ef118c2.png";
import analyticsIcon from "../../../assets/fb795c627e786f6ced3eb3a9abcf56f87ac50782.png";
import signalIcon from "../../../assets/bdba9a05aa72c45d8482085a8da2010ff2b146f0.png";
import starterPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import proPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import { getFooterLinkTarget } from "../site/footerLinks";

type ValueCardData = {
  title: string;
  description: string;
  icon: string;
};

type PackageData = {
  name: string;
  description: string;
  price: string;
  suffix: string;
  note: string;
  cta: string;
  icon: string;
  accent: "cyan" | "lime" | "violet";
  badge?: string;
  features: string[];
};

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const toolIcons = [
  { label: "UI Kit", icon: designIcon },
  { label: "Görsel Tasarım", icon: photoshopIcon },
  { label: "Vektör Sistem", icon: illustratorIcon },
];

const valueCards: ValueCardData[] = [
  {
    title: "Modern Tasarım",
    description: "Güncel tasarım trendlerini takip eden, estetik ve işlevsel çözümler.",
    icon: designIcon,
  },
  {
    title: "UX Odaklı Yaklaşım",
    description: "Kullanıcı deneyimini merkeze alan, test edilmiş tasarım prensipleri.",
    icon: analyticsIcon,
  },
  {
    title: "Hızlı Teslimat",
    description: "Belirlenen sürelere uygun, kaliteden ödün vermeden hızlı çalışma.",
    icon: codeIcon,
  },
  {
    title: "Sürekli İletişim",
    description: "Proje boyunca şeffaf ve sürekli iletişim, düzenli geri bildirim.",
    icon: signalIcon,
  },
];

const workflow: ValueCardData[] = [
  {
    title: "Keşif & Analiz",
    description: "İhtiyaçlarınızı dinliyor, hedef kitlenizi ve rekabeti analiz ediyoruz.",
    icon: analyticsIcon,
  },
  {
    title: "Strateji & Planlama",
    description: "Tasarım stratejisi oluşturuyor, wireframe ve kullanıcı akışları hazırlıyoruz.",
    icon: codeIcon,
  },
  {
    title: "Tasarım & Akış",
    description: "Yüksek kaliteli görseller ve tıklama rotası net arayüz akışları oluşturuyoruz.",
    icon: designIcon,
  },
  {
    title: "Test & Teslimat",
    description: "Kullanıcı testleri yapıyor, optimize edip tüm dosyaları teslim ediyoruz.",
    icon: signalIcon,
  },
];

const packageCards: PackageData[] = [
  {
    name: "Tasarım Paketi",
    description: "Yeni başlayanlar ve küçük işletmeler için ideal paket.",
    price: "12.500 ₺",
    suffix: "/ proje",
    note: "5-7 iş günü içinde teslim edilen hızlı tasarım başlangıcı.",
    cta: "Hızlıca Yayına Al",
    icon: starterPackageIcon,
    accent: "cyan",
    features: [
      "5 sayfa UI tasarımı",
      "Responsive (mobil + desktop)",
      "Basit marka rehberi",
      "2 revize hakkı",
      "Kaynak tasarım dosyaları",
      "Hızlı destek (48 saat)",
      "Etkileşim akışı",
    ],
  },
  {
    name: "Tasarım & Akış Paketi",
    description: "Büyüyen işletmeler için kapsamlı tasarım çözümü.",
    price: "24.900 ₺",
    suffix: "/ tek seferlik",
    note: "7-10 iş günü içinde marka, akış ve arayüz sistemi birlikte teslim edilir.",
    cta: "Dönüşüm Odaklı Sayfa İstiyorum",
    icon: proPackageIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "15 sayfa UI/UX tasarımı",
      "Responsive + tablet optimizasyon",
      "Detaylı marka kimliği paketi",
      "Kullanıcı akış haritası",
      "5 revize hakkı",
      "Tüm kaynak dosyalar",
      "Öncelikli destek (24 saat)",
      "1 ay ücretsiz güncelleme",
      "Etkileşim akışı",
    ],
  },
  {
    name: "Tasarım & Akış+ Paketi",
    description: "Büyük ölçekli projeler için tam hizmet paketi.",
    price: "45.900 ₺",
    suffix: "/ tek seferlik",
    note: "10-14 iş günü içinde kapsamlı design system ve optimizasyon paketi.",
    cta: "Satış Sistemi Kuralım",
    icon: scalePackageIcon,
    accent: "violet",
    features: [
      "Sınırsız sayfa tasarımı",
      "Tüm platformlar için optimizasyon",
      "Kapsamlı design system",
      "Akış testi ve kullanım kontrolleri",
      "Sınırsız revize",
      "Animasyon ve mikroetkileşimler",
      "7/24 özel destek",
      "3 ay ücretsiz güncelleme",
    ],
  },
];

function SectionHeading({
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

function ValueCard({ title, description, icon }: ValueCardData) {
  return (
    <article className="rounded-lg bg-[#b5ff15] p-7 text-center text-black shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
        <img alt="" className="h-9 w-9 object-contain" src={icon} />
      </div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-black/68">{description}</p>
    </article>
  );
}

function WorkflowCard({ title, description, icon }: ValueCardData) {
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
        <span className={`pb-1 text-lg font-bold ${tones.price}`}>{suffix}</span>
      </div>
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>*Tek seferlik • Sözleşmeli • Tasarım teslimi dahil</p>
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

export default function LandingPageServiceHome() {

  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111111" />

<div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">UI/UX Tasarım</span>
          <h1 className="mt-7 max-w-[980px] text-[34px] font-medium leading-tight text-white md:text-[56px]">
            Markanızı Görsel Olarak
            <br />
            <span className="font-extrabold">Öne Çıkaran Tasarımlar</span>
          </h1>
          <p className="mt-7 max-w-[900px] text-base leading-8 text-white/78 md:text-xl">
            Modern, kullanıcı odaklı ve markanızın hikayesini anlatan özel tasarım çözümleri sunuyoruz.
            <span className="mx-2 font-extrabold text-[#b5ff15]">
              UI/UX tasarımından marka kimliğine kadar tüm görsel ihtiyaçlarınız
            </span>
            için yanınızdayız.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[280px]" to="/iletisim#contact-form" label="Ücretsiz Konsültasyon İste" />
            <ActionButton accent="violet" className="min-w-[240px]" href="#packages" label="Paketleri İncele" />
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {toolIcons.map((tool) => (
              <div key={tool.label} className="flex h-20 w-20 items-center justify-center rounded-lg bg-black/20 backdrop-blur">
                <img alt={tool.label} className="h-14 w-14 object-contain" src={tool.icon} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#070809_0%,#242424_50%,#070809_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Gerçeğe Geçmiyor mu?" prefix="Web Siteniz için Fikirleriniz Var ama" />
          <p className="mx-auto mt-8 max-w-[980px] text-center text-lg leading-8 text-white/70">
            Tasarım sürecimizde fark yaratan özelliklerle fikirlerinizi hayata geçireceğiz. Web sitenizi kodlatmadan önce
            tasarımınızı oluşturun!
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {valueCards.map((card) => (
              <ValueCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#151515] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[980px] text-center text-lg leading-8 text-white/72">
            Landing Page için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için
            sayfamızı ziyaret etmeyi unutmayın!
          </p>

          <PaymentLogos />

          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packageCards.map((card) => (
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

      <section className="bg-[linear-gradient(180deg,#111111_0%,#282828_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="rounded-lg bg-[#070809] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:p-8">
            <h2 className="text-[30px] font-bold text-[#b5ff15] md:text-[36px]">Nasıl Çalışıyoruz?</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((item) => (
                <WorkflowCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
          <SectionHeading center highlight="Bugün Başlayalım!" prefix="Projenize" />
          <p className="mx-auto mt-8 max-w-[920px] text-lg leading-8 text-white/70">
            Markanızı güçlendirecek profesyonel tasarımlar için hemen iletişime geçin. İlk konsültasyon ücretsiz!
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[280px]" to="/iletisim#contact-form" label="Ücretsiz Konsültasyon İste" />
            <ActionButton accent="violet" className="min-w-[240px]" to="/iletisim#contact-form" label="WhatsApp'a Git" />
          </div>
        </div>
      </section>

</div>
  );
}
