import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Code2,
  Facebook,
  Handshake,
  ImageUp,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Package2,
  Rocket,
  Search,
  Star,
  Target,
  UserRoundCheck,
  Workflow,
  X as XIcon,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import careerWomanImage from "../../../assets/991188e8e509b67c1ff6ac7a5eaf1b433f87e95e.webp";
import careerManImage from "../../../assets/74b30c061ad09e20c8b32c6622fe5bba17d10ca1.webp";
import blogSapImage from "../../../assets/fbc4090b516bf34c0d7009bf7a5312e602dcc56e.png";
import stepbagLogo from "../../../assets/1da609174c8279af605ceae4765e62f302108fc8.png";
import jewelleryLogo from "../../../assets/59e8e6639c98ab2e3bd51c651b9f6595c768f8e6.png";
import ambarLogo from "../../../assets/aba79dde89b06d325d921966e3a4cc54806e48b1.png";
import msDigitalLogo from "../../../assets/83003c5d78963a8d36ea47cb5269ace617c52a0c.png";
import sapientiusLogo from "../../../assets/014e6b1d53b1b355d5e14e69e017154869d94ea3.png";
import kLogo from "../../../assets/98858b20365095da51bfb77ebf790d2e093f3c6f.png";
import sivasMatbaaLogo from "../../../assets/ffad7d3244a2a3efff7f37f7c8d6ed6e9dd2996e.png";
import taksiLogo from "../../../assets/c23dd3c3a7e2ac1f113a214529e907ec6e2a5849.png";
import avatarSue from "../../../assets/573ad1f39f6055a34e7171ec9bb627fdf05cf003.webp";
import avatarJhon from "../../../assets/4e64811246c2bda815c83e5aa067453ff586901e.webp";
import avatarRobbie from "../../../assets/dd23378db022480fe43081e8f5774a27c17b0a9d.webp";
import trustBannerImage from "../../../assets/d66d403f3b68db2e5dedb81961508f5cf25a1d58.webp";
import structureImage from "../../../assets/5e20f8ba4c40fbc150b631266aed6ef04a12a35e.webp";

type PageKind = "career" | "case-study" | "case-detail" | "customers";

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const cultureCards = [
  {
    title: "Öğrenme Odaklı Kültür",
    description: "Gerçek projeler, gerçek sorumluluklar.",
    icon: <ImageUp className="h-9 w-9" />,
  },
  {
    title: "Sistemli Çalışma",
    description: "Kaos değil; net süreçler ve hedefler.",
    icon: <Workflow className="h-9 w-9" />,
  },
  {
    title: "Gelişime Açık Alan",
    description: "Fikir üretmek, denemek ve büyümek teşvik edilir.",
    icon: <Rocket className="h-9 w-9" />,
  },
  {
    title: "Şeffaf & Samimi İletişim",
    description: "Hiyerarşiden çok iş birliği.",
    icon: <Handshake className="h-9 w-9" />,
  },
];

const formFields = [
  "Ad-Soyad",
  "Telefon",
  "E-Posta",
  "Başvuru Turu",
  "Başvurduğun Pozisyon",
  "Ajans Deneyimin Var mı?",
  "Yabancı Dil Seviyen?",
  "En Sevdiğin Aktivite",
  "Kendini Anlat (Sadece 1 Cümle)",
  "Linkedin veya Portfolyo Linki",
];

const blogPosts = [
  {
    title: "Boosting ABAP Performance: Tips and Techniques for Efficient Coding",
    categories: "ABAP",
    date: "27.07.2025",
    author: "Enes Malik Yüksek",
  },
  {
    title: "Getting Started with ABAP CDS Views: A Step-by-Step Introduction",
    categories: "SAP, ABAP",
    date: "27.07.2025",
    author: "Enes Malik Yüksek",
  },
  {
    title: "Debugging in ABAP: A Practical Guide for Finding and Fixing Bugs",
    categories: "SAP, ABAP",
    date: "26.07.2025",
    author: "Enes Malik Yüksek",
  },
];

const latestBlogs = blogPosts.map((post) => ({
  ...post,
  compactTitle:
    post.title.length > 60 ? `${post.title.slice(0, 58)}...` : post.title,
}));

const brandGroups = [
  {
    title: "Startup'lar",
    logos: [{ src: stepbagLogo, alt: "Stepbag" }],
  },
  {
    title: "E-Ticaret Firmaları",
    logos: [
      { src: jewelleryLogo, alt: "NEV Jewellery" },
      { src: ambarLogo, alt: "Ambar" },
    ],
  },
  {
    title: "Kurumsal İşletmeler",
    logos: [
      { src: msDigitalLogo, alt: "MS Digital" },
      { src: sapientiusLogo, alt: "Sapientius" },
      { src: kLogo, alt: "Kurumsal marka" },
    ],
  },
  {
    title: "Yerel & Global İşletmeler",
    logos: [
      { src: sivasMatbaaLogo, alt: "Sivas Matbaa" },
      { src: taksiLogo, alt: "Sivas Taksi" },
    ],
  },
];

const testimonials = [
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

const structureItems = [
  {
    title: "Teknik Detay",
    description: "Alt yapınız kurulur, ya da hazır altyapınız düzenlenir.",
    icon: <Code2 className="h-8 w-8" />,
  },
  {
    title: "Reklam ve Yönetim",
    description: "Sosyal medyanız yönetilir, reklamlarınız tek bir yerden kontrol edilir.",
    icon: <BarChart3 className="h-8 w-8" />,
  },
  {
    title: "Custom Web Çözümleri",
    description: "Size özel kompozisyon, özel entegrasyonlarla marka web sitesi geliştiriyoruz.",
    icon: <Workflow className="h-8 w-8" />,
  },
  {
    title: "Teknik Sorunlar",
    description: "Kod ve sunucu sorunlarınız çözülür.",
    icon: <BriefcaseBusiness className="h-8 w-8" />,
  },
];

function HighlightTitle({
  prefix,
  highlight,
  suffix,
  center = false,
  accent = "lime",
}: {
  prefix: string;
  highlight: string;
  suffix?: string;
  center?: boolean;
  accent?: "lime" | "violet";
}) {
  const highlightClass =
    accent === "violet"
      ? "bg-[#8a38f5] text-black"
      : "bg-[#b5ff15] text-black";

  return (
    <h2
      className={`text-[30px] font-extrabold leading-tight tracking-tight text-white md:text-[42px] ${
        center ? "text-center" : ""
      }`}
    >
      {prefix}{" "}
      <span className={`inline-block -rotate-1 px-3 py-1 ${highlightClass}`}>
        {highlight}
      </span>
      {suffix ? ` ${suffix}` : ""}
    </h2>
  );
}

function HeaderNav({
  active,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  active?: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}) {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between gap-6 px-6 py-6 lg:px-10">
        <Link className="shrink-0" to="/">
          <img alt="Social Tech" className="h-10 w-auto object-contain md:h-12" src={logoImage} />
        </Link>

        <nav className="hidden items-center gap-10 text-sm lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              className={
                item.label === active
                  ? "text-[#b5ff15]"
                  : "text-white/76 transition hover:text-[#b5ff15]"
              }
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ActionButton accent="violet" label="İletişime Geç" to="/iletisim" />
          <ActionButton accent="lime" label="Giriş Yap" />
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
        >
          {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="mx-6 rounded-[18px] border border-white/10 bg-[#0d1019]/95 p-5 backdrop-blur lg:hidden">
          <div className="flex flex-col gap-4 text-sm text-white/80">
            {navItems.map((item) => (
              <Link key={item.label} onClick={() => setMobileMenuOpen(false)} to={item.to}>
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3">
              <ActionButton accent="violet" label="İletişime Geç" to="/iletisim" />
              <ActionButton accent="lime" label="Giriş Yap" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection({
  kind,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  kind: PageKind;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}) {
  const isCareer = kind === "career";
  const isCustomers = kind === "customers";

  return (
    <section className="relative isolate flex min-h-[760px] items-center justify-center overflow-hidden bg-[#050607] md:min-h-[880px]">
      <HeroBackdrop fadeColor="#17191b" />
      <SiteHeader />

      <div className="relative z-10 mx-auto flex min-h-[640px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-20 pt-16 text-center lg:px-10">
        {isCareer ? (
          <>
            <h1 className="max-w-[880px] text-[34px] font-medium leading-tight tracking-tight text-white md:text-[56px]">
              Birlikte Üreten
              <br />
              <span className="font-extrabold">Birlikte Büyüyen Bir Ekip</span>
            </h1>
            <p className="mt-7 max-w-[660px] text-base leading-8 text-white/78 md:text-xl">
              Social Tech’te kariyer;
              <span className="mx-2 font-extrabold text-[#b5ff15]">sadece bir pozisyon değil,</span>
              öğrenme, üretme ve büyüme sürecidir.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ActionButton accent="violet" className="min-w-[260px]" href="#application" label="Açık Pozisyonlar" />
              <ActionButton accent="lime" className="min-w-[260px]" href="#culture" label="Bizi Tanıyın" />
            </div>
          </>
        ) : isCustomers ? (
          <>
            <h1 className="max-w-[900px] text-[34px] font-medium leading-tight tracking-tight text-white md:text-[56px]">
              Birlikte Çalışan Değil
              <br />
              <span className="font-extrabold">Birlikte Büyüyen Markalar</span>
            </h1>
            <p className="mt-7 max-w-[820px] text-base leading-8 text-white/78 md:text-xl">
              Social Tech olarak;
              <span className="mx-2 font-extrabold text-[#8a38f5]">startup’lardan kurumsal markalara kadar</span>
              ölçeklenebilir dijital sistemler kurduğumuz markalarla uzun vadeli iş ortaklıkları geliştiriyoruz.
            </p>
            <div className="mt-8 grid gap-3 text-center text-sm font-semibold text-white/86 sm:grid-cols-3">
              {["Uzun vadeli iş ortaklığı", "Şeffaf süreç & raporlama", "Ölçülebilir sonuçlar"].map((item) => (
                <span key={item} className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-[#b5ff15]" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ActionButton accent="violet" className="min-w-[260px]" to="/calismalar" label="Projeleri İncele" />
              <ActionButton accent="lime" className="min-w-[260px]" href="#footer" label="Bizimle Çalışın" />
            </div>
          </>
        ) : (
          <>
            <h1 className="max-w-[860px] text-[34px] font-medium leading-tight tracking-tight text-white md:text-[56px]">
              Gerçek Problemler
              <br />
              <span className="font-extrabold">Gerçek Dijital Sistemler</span>
            </h1>
            <p className="mt-7 max-w-[760px] text-base leading-8 text-white/78 md:text-xl">
              Her case; strateji,
              <span className="mx-2 font-extrabold">uygulama ve ölçümleme adımlarının bir araya geldiği,</span>
              sonuç odaklı bir dijital projedir.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ActionButton accent="violet" className="min-w-[260px]" href="#case-list" label="Projeleri İncele" />
              <ActionButton accent="lime" className="min-w-[260px]" href="#footer" label="Bizimle Çalışın" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FooterLinkColumn({
  title,
  links,
  activeIndex = 0,
}: {
  title: string;
  links: string[];
  activeIndex?: number;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-6 space-y-3 text-sm text-white/62">
        {links.map((link, index) => {
          const target = getFooterLinkTarget(link);
          const className = index === activeIndex ? "text-[#b5ff15]" : "transition hover:text-[#b5ff15]";

          return (
            <li key={link}>
              {target.to ? (
                <Link className={className} to={target.to}>
                  {link}
                </Link>
              ) : (
                <a className={className} href={target.href}>
                  {link}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SocialIconLink({ children }: { children: ReactNode }) {
  return (
    <a className="rounded-md border border-white/10 p-2 text-white/72 transition hover:text-[#b5ff15]" href="#top">
      {children}
    </a>
  );
}

function SharedFooter({ activeLinkIndex = 0 }: { activeLinkIndex?: number }) {
  return (
    <footer className="border-t border-white/10 bg-black py-16" id="footer">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="grid gap-12 xl:grid-cols-[1.1fr_0.6fr_0.8fr_0.95fr]">
          <div>
            <img alt="Social Tech" className="h-12 w-auto object-contain" src={logoImage} />
            <p className="mt-6 max-w-[360px] text-sm leading-7 text-white/64">
              Pazarlama bütçenizden daha fazla sonuçlar elde etmek istiyorsanız, yeni partneriniz olmak için fazlasıyla hazırız!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <SocialIconLink>
                <Facebook className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Instagram className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <XIcon className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Linkedin className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Mail className="h-4 w-4" />
              </SocialIconLink>
            </div>
          </div>

          <FooterLinkColumn
            activeIndex={activeLinkIndex}
            links={["Anasayfa", "Müşteriler", "Bize Ulaşın", "Kariyer & Staj", "Portfolyo & Projeler", "Bloglar"]}
            title="Faydalı Linkler"
          />
          <FooterLinkColumn
            links={[
              "Growth & Hub",
              "Sosyal Medya",
              "Dijital Pazarlama",
              "Web Sitesi Geliştirme",
              "Mobil Uygulama Geliştirme",
              "Reklam Yönetimi",
              "Web Teknik Destek",
            ]}
            title="Ürün ve Hizmetler"
          />

          <div className="flex flex-col gap-4">
            <ActionButton accent="violet" filled icon={<CalendarDays className="h-4 w-4" />} label="Online Toplantı Planla" />
            <ActionButton accent="lime" filled icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp Destek Hattı" />
            <ActionButton accent="cyan" filled icon={<Package2 className="h-4 w-4" />} label="Dijital Yolda Büyüme" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
          <p>Copyright © 2025 SOCIAL TECH Reklam ve Teknoloji A.Ş</p>
          <div className="flex flex-wrap gap-5">
            <a href="#top">Gizlilik Politikası</a>
            <a href="#top">Mesafeli Satış Sözleşmesi</a>
            <a href="#top">K.V.K.K</a>
            <a href="#top">Çerez Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CtaBand({ accent = "lime" }: { accent?: "lime" | "violet" }) {
  const classes =
    accent === "violet"
      ? "bg-[radial-gradient(circle_at_center,rgba(138,56,245,0.78),rgba(36,9,74,1))]"
      : "bg-[radial-gradient(circle_at_center,rgba(181,255,21,0.94),rgba(77,111,0,1))]";

  return (
    <section className={`${classes} py-24`}>
      <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
        <HighlightTitle accent={accent} center highlight="Hazır mısınız?" prefix="Bizimle Çalışmaya" />
        <p className="mt-6 text-lg text-white/86">Sizi tanımadan teklif sunmuyoruz. Önce dinliyor, sonra çözüyoruz.</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <ActionButton accent={accent === "violet" ? "violet" : "lime"} className="min-w-[260px]" href="#footer" label="Ücretsiz Ön Görüşme" />
          <ActionButton accent="violet" className="min-w-[260px]" to="/hizmetler" label="Hizmetleri İncele" />
        </div>
      </div>
    </section>
  );
}

function CareerHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121416] text-white" id="top">
      <HeroSection kind="career" mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <section className="bg-[#151719] py-24" id="culture">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Çalışmalısın?" prefix="Neden Social Tech’te" />
          <p className="mx-auto mt-8 max-w-[720px] text-center text-lg leading-8 text-white/72">
            İşlerimizi yaparken en ince ayrıntıyı atlamadan, analiz ölçümleme ve veri ile çalışıyoruz!
          </p>
          <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {cultureCards.map((card) => (
              <article key={card.title} className="rounded-[14px] bg-[#b5ff15] p-8 text-center text-black shadow-[0_24px_70px_rgba(181,255,21,0.14)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                  {card.icon}
                </div>
                <h3 className="mt-7 text-xl font-extrabold">{card.title}</h3>
                <p className="mx-auto mt-3 max-w-[220px] text-sm leading-6 text-black/70">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17191b] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[1fr_0.95fr] lg:px-10">
          <div>
            <p className="text-[32px] font-light leading-tight text-white md:text-[48px]">Yenilikçi Bir Kariyer</p>
            <div className="mt-2 inline-block -rotate-1 bg-[#b5ff15] px-3 py-1">
              <span className="text-[34px] font-extrabold leading-tight text-black md:text-[52px]">Deneyimi Seni Bekliyor!</span>
            </div>
            <div className="mt-12 max-w-[720px] space-y-6 text-lg font-semibold leading-8 text-white">
              <p>Büyüyen ekibimize harika insanlar arıyoruz.</p>
              <p className="font-medium text-white/76">
                Dijital pazarlamanın kurallarını birlikte yazalım. Dil, din, ırk ve yönelim farklılıklarını bir kenara bırakarak sadece sahip olduğun yeteneklerle ilgileniyoruz.
              </p>
              <p>Eğer hâlâ kararlıysan aramıza katılmak ve pazarlama kariyerinde güzel bir başlangıç yapmak için sakın geç kalma!</p>
            </div>
          </div>

          <div className="relative mx-auto min-h-[440px] w-full max-w-[620px]">
            <div className="absolute left-4 top-20 h-[340px] w-[260px] overflow-hidden rounded-[38px] bg-[#bdf1ff] shadow-[0_30px_80px_rgba(0,0,0,0.28)] md:left-16 md:w-[310px]">
              <img alt="Social Tech ekip üyesi" className="h-full w-full object-cover object-top" src={careerWomanImage} />
            </div>
            <div className="absolute right-2 top-0 h-[410px] w-[300px] overflow-hidden rounded-[38px] bg-[#f4a3e9] shadow-[0_30px_80px_rgba(0,0,0,0.38)] md:w-[350px]">
              <img alt="Social Tech ekip üyesi" className="h-full w-full object-cover object-top" src={careerManImage} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#17191b] pb-24" id="application">
        <div className="mx-auto w-full max-w-[1180px] px-6">
          <form
            className="rounded-[44px] bg-[#4d7608] px-6 py-10 shadow-[0_34px_90px_rgba(0,0,0,0.28)] md:px-16 md:py-16"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {formFields.map((field, index) => (
                <label key={field} className={index > 7 ? "md:col-span-2" : ""}>
                  <span className="sr-only">{field}</span>
                  <input
                    className="h-16 w-full rounded-[8px] border border-black/20 bg-black px-6 text-base text-white outline-none transition placeholder:text-white/36 focus:border-[#b5ff15]"
                    placeholder={field}
                    type={field.includes("E-Posta") ? "email" : "text"}
                  />
                </label>
              ))}
            </div>

            <label className="mt-8 flex items-start gap-4 text-white">
              <input className="mt-1 h-5 w-5 accent-[#b5ff15]" type="checkbox" />
              <span>
                <span className="block text-xl font-bold">Gizlilik ve KVKK Şartlarını kabul ediyorum.</span>
                <span className="mt-3 block text-sm leading-6 text-white/78">
                  Bu formu göndererek, Social Tech Reklam ve Teknoloji A.Ş. tarafından iletilen Gizlilik Politikası ve KVKK Metni’ni okuyup anladım. Kişisel verilerimin 6698 sayılı KVKK Kanunu’na göre işlenmesini ve şirketin dışından hizmet aldığı üçüncü kişilere aktarılmasını kabul ediyorum.
                </span>
              </span>
            </label>

            <button className="mt-8 h-16 w-full rounded-[8px] bg-black text-base font-semibold text-white transition hover:bg-[#b5ff15] hover:text-black" type="submit">
              Başvuruyu Gönder
            </button>
          </form>
        </div>
      </section>

      <CtaBand />
      <SharedFooter activeLinkIndex={3} />
    </div>
  );
}

function BlogSidebar({ tone = "lime" }: { tone?: "lime" | "cyan" }) {
  const titleClass = tone === "cyan" ? "text-[#00b3b9]" : "text-[#b5ff15]";
  const lineClass = tone === "cyan" ? "border-[#00b3b9]" : "border-[#b5ff15]";
  const cardClass = tone === "cyan" ? "bg-[#373944]" : "bg-black";
  const linkClass = tone === "cyan" ? "text-[#00b3b9]" : "text-[#b5ff15]";

  return (
    <aside className={`rounded-[30px] ${cardClass} p-8 shadow-[0_26px_80px_rgba(0,0,0,0.28)] lg:sticky lg:top-8`}>
      <div>
        <h3 className={`text-[30px] font-extrabold ${titleClass}`}>Search</h3>
        <div className={`mt-3 border-t ${lineClass}`} />
        <label className="mt-6 flex h-11 items-center gap-3 rounded-lg bg-white/12 px-4 text-white/50">
          <Search className="h-4 w-4" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-white/46" placeholder="Search Blog..." />
        </label>
      </div>

      <div className="mt-10">
        <h3 className={`text-[30px] font-extrabold ${titleClass}`}>Categories</h3>
        <div className={`mt-3 border-t ${lineClass}`} />
        <div className="mt-5 space-y-2 text-sm font-extrabold text-white">
          {["ALL", "SAP", "ABAP", "ERP"].map((category) => (
            <p key={category}>{category}</p>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className={`text-[30px] font-extrabold ${titleClass}`}>Latest Blog</h3>
        <div className={`mt-3 border-t ${lineClass}`} />
        <div className="mt-6 space-y-6">
          {latestBlogs.map((post) => (
            <Link key={post.title} className="grid grid-cols-[64px_1fr] gap-4" to="/calisma-detaylari">
              <img alt="" className="h-16 w-16 rounded-full object-cover" src={blogSapImage} />
              <span>
                <span className={`block text-sm font-extrabold leading-5 ${linkClass}`}>{post.compactTitle}</span>
                <span className="mt-1 block text-[11px] text-white/70">{post.date}</span>
                <span className="block text-[11px] text-white/70">By {post.author}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CaseStudyHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#191b1d] text-white" id="top">
      <HeroSection kind="case-study" mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="bg-[#1a1c1e] py-24" id="case-list">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="mx-auto max-w-[760px] text-center">
            <HighlightTitle center highlight="Göreceksiniz?" prefix="Bu Sayfada Ne" />
            <p className="mt-8 text-lg leading-8 text-white/72">
              Case Studies sayfası; yalnızca tamamlanan işleri değil, problemleri nasıl ele aldığımızı ve hangi sistemlerle çözdüğümüzü gösterir.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Her proje; tekil bir iş değil, tekrar edilebilir bir yaklaşımın örneğidir.
            </p>
          </div>

          <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-20">
              {blogPosts.map((post) => (
                <article key={post.title} className="group">
                  <Link className="block overflow-hidden rounded-[28px] bg-[#496682]" to="/calisma-detaylari">
                    <img alt={post.title} className="h-[280px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[420px]" src={blogSapImage} />
                  </Link>
                  <h2 className="mt-8 max-w-[860px] text-[28px] font-semibold leading-tight text-white md:text-[38px]">
                    <Link to="/calisma-detaylari">{post.title}</Link>
                  </h2>
                  <p className="mt-3 text-xl font-bold text-[#b5ff15]">{post.categories}</p>
                  <p className="text-xl font-bold text-[#b5ff15]">By {post.author}</p>
                </article>
              ))}

              <div className="flex items-center justify-center gap-4 pt-4">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00b3b9] text-black" type="button">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button key={page} className="h-12 w-12 rounded-full bg-[#b5ff15] text-lg font-extrabold text-black" type="button">
                    {page}
                  </button>
                ))}
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00b3b9] text-black" type="button">
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            <BlogSidebar />
          </div>
        </div>
      </main>

      <SharedFooter activeLinkIndex={4} />
    </div>
  );
}

function ArticleDivider() {
  return <div className="my-10 border-t border-white/52" />;
}

function CodeBlock() {
  return (
    <pre className="overflow-x-auto rounded-[18px] bg-[#373944] p-6 text-sm leading-6 text-white/82">
      <code>{`* Bad Practice
LOOP AT lt_customers INTO ls_customer.
  SELECT * FROM orders INTO lt_orders WHERE customer_id = ls_customer-id.
ENDLOOP.

* Good Practice
SELECT * FROM orders INTO TABLE lt_orders
  FOR ALL ENTRIES IN lt_customers
  WHERE customer_id = lt_customers-id.`}</code>
    </pre>
  );
}

function CaseStudyDetailsHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const title = blogPosts[0].title;

  return (
    <div className="min-h-screen bg-[#17191b] text-white" id="top">
      <HeroSection kind="case-detail" mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="bg-[#17191b] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
          <article>
            <img alt={title} className="h-[300px] w-full rounded-[24px] object-cover md:h-[460px]" src={blogSapImage} />
            <p className="mt-10 text-sm font-semibold text-white/80 md:text-base">Enes Malik Yüksek | 27.07.2025 | SAP</p>
            <h1 className="mt-6 max-w-[940px] text-[30px] font-medium leading-tight text-[#00b3b9] md:text-[42px]">
              {title}
            </h1>
            <div className="mt-8 border-t border-[#00b3b9]" />

            <p className="mt-10 text-base leading-7 text-white/86 md:text-lg">
              In the world of SAP development, writing functional code is only half the job — making it performant is what distinguishes a great ABAP developer. Poorly performing programs can cause serious bottlenecks in business processes, frustrate users, and increase system load.
            </p>

            <ArticleDivider />
            <section className="space-y-4 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-xl font-extrabold text-white">Why ABAP Performance Matters</h2>
              <p>Enterprise systems like SAP are used by thousands of users simultaneously. Inefficient ABAP code can lead to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Longer response times for users</li>
                <li>Higher system resource consumption</li>
                <li>Performance issues in critical business transactions</li>
                <li>Increased maintenance and troubleshooting time</li>
              </ul>
              <p>Optimizing your ABAP code ensures smooth, scalable, and sustainable operations.</p>
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-xl font-extrabold text-white">Key Techniques to Boost ABAP Performance</h2>
              <p><strong>1. Minimize Database Access</strong></p>
              <p>Always use SELECT statements wisely. Avoid SELECT *; instead, specify only needed fields and fetch data in bulk whenever possible.</p>
              <CodeBlock />
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <p><strong>2. Use Appropriate Internal Table Types</strong></p>
              <p>Use SORTED TABLE or HASHED TABLE when appropriate. Avoid unnecessary linear searches; instead, use READ TABLE with key and binary search with sorted tables.</p>
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <p><strong>3. Leverage Parallel Processing</strong></p>
              <p>For long-running background jobs, use parallel processing with CALL FUNCTION STARTING NEW TASK or background RFC where possible.</p>
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <p><strong>4. Use Buffers and Caches</strong></p>
              <p>Use SAP table buffering where applicable and implement local caching logic in global memory for frequently used reference data.</p>
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <p><strong>5. Analyze and Monitor</strong></p>
              <p>Use tools like ST05 SQL Trace, SAT ABAP Runtime Analysis and SE30 to identify expensive operations and optimize them precisely.</p>
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-xl font-extrabold text-white">Bonus Tips</h2>
              <p>Prefer CDS Views and AMDPs for logic pushed down to the HANA DB. Use field-symbols and references to avoid unnecessary copying of large internal tables. Clean up unused variables, loops, and nested logic.</p>
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-xl font-extrabold text-white">Conclusion</h2>
              <p>Writing efficient ABAP code isn’t just about following syntax — it’s about thinking like a performance engineer. By optimizing database access, using the right table structures, and leveraging the tools SAP offers, you can build applications that scale with your business.</p>
              <p>Whether you’re maintaining legacy code or building S/4HANA-ready applications, performance should be a core focus of your development strategy.</p>
            </section>
          </article>

          <BlogSidebar tone="cyan" />
        </div>
      </main>

      <SharedFooter activeLinkIndex={4} />
    </div>
  );
}

function BrandShowcase() {
  return (
    <section className="bg-[linear-gradient(180deg,#17191b_0%,#8a38f5_100%)] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <HighlightTitle accent="violet" center highlight="Markalar" prefix="Bize Güvenen" />
        <div className="mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          {brandGroups.map((group) => (
            <article key={group.title} className="text-center">
              <span className="inline-block bg-[#8a38f5] px-3 py-2 text-lg font-extrabold text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                {group.title}
              </span>
              <div className="mt-9 flex min-h-[160px] flex-col items-center justify-center gap-8">
                {group.logos.map((logo) => (
                  <img key={logo.alt} alt={logo.alt} className="max-h-[80px] max-w-[230px] object-contain" src={logo.src} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ name, company, detail, avatar }: (typeof testimonials)[number]) {
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

function TestimonialsSection() {
  return (
    <section className="bg-[#050608] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <HighlightTitle accent="violet" center highlight="Yorumları" prefix="Kullanıcılarımızdan Social Tech" />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </div>

        <div className="mt-14 grid overflow-hidden rounded-[24px] border border-[#8a38f5]/70 bg-[#4c1d83] shadow-[0_24px_70px_rgba(0,0,0,0.3)] lg:grid-cols-[360px_1fr]">
          <div className="min-h-[240px] overflow-hidden">
            <img alt="Mutlu müşteri" className="h-full w-full object-cover" src={trustBannerImage} />
          </div>
          <div className="flex flex-col justify-center px-8 py-10 md:px-12">
            <h3 className="text-[30px] font-bold tracking-tight text-white">Sonuçları Gözlemleyin!</h3>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="text-[34px] font-extrabold tracking-tight text-[#b5ff15]">4.9 / 5</span>
              <div className="flex gap-1 text-[#b5ff15]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-5 max-w-[560px] text-base leading-7 text-white/80">
              Bizi tercih eden her bir müşterimiz işte bu kadar mutlu! Siz de bizi tercih edin, erişilebilirliğinizi artırın.
            </p>
            <ActionButton accent="violet" className="mt-8 self-start" label="Trustpilot'a Göz At" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StructureSection() {
  return (
    <section className="bg-[#17191b] py-24">
      <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="relative">
          <img alt="Teknoloji altyapısı" className="mx-auto w-full max-w-[620px]" src={structureImage} />
        </div>
        <div>
          <p className="text-[34px] font-light leading-tight text-white md:text-[50px]">Teknolojiye değil</p>
          <div className="mt-2 inline-block -rotate-1 bg-[#8a38f5] px-3 py-1">
            <span className="text-[34px] font-extrabold leading-tight text-black md:text-[52px]">Doğru Yapıya Odaklanırız</span>
          </div>
          <p className="mt-10 max-w-[760px] text-lg leading-8 text-white/74">
            Geliştirdiğimiz tüm servisler, rastgele araçlar veya tekil çözümlerden oluşmaz. Her hizmet için; planlama, ölçümleme, optimizasyon ve ölçeklenebilirlik odaklı bir sistem yaklaşımı benimseriz. Kullandığımız teknoloji altyapısı ve çalışma metodolojimiz sayesinde, yalnızca hizmet sunmaz; veriye dayalı, sürdürülebilir ve büyümeye hizmet eden dijital sistemler kurarız.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {structureItems.map((item) => (
              <article key={item.title} className="border-t border-white/16 pt-6">
                <div className="flex gap-4">
                  <div className="text-white">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/66">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomersHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <HeroSection kind="customers" mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <BrandShowcase />
      <TestimonialsSection />
      <StructureSection />
      <CtaBand accent="violet" />
      <SharedFooter activeLinkIndex={1} />
    </div>
  );
}

export default function PortfolioPagesHome({ kind }: { kind: PageKind }) {
  if (kind === "career") {
    return <CareerHome />;
  }

  if (kind === "case-study") {
    return <CaseStudyHome />;
  }

  if (kind === "case-detail") {
    return <CaseStudyDetailsHome />;
  }

  return <CustomersHome />;
}
