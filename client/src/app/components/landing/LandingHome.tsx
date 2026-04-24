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
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import projectInstagramStory from "../../../assets/f4ec847bb1ec1b27fd4a2842a4e930bd1bc501ab.png";
import projectWebLanding from "../../../assets/a9d5346d10fbc3273e93e817ca98937f4bf09d7a.png";
import projectInstagramPosts from "../../../assets/90f28dbedc4eb333bc83f5943cd6c1ef73617d87.png";
import aboutBackImage from "../../../assets/5ed8f400caa5014730ebf7a12da1567fe8d681f1.png";
import aboutFrontImage from "../../../assets/9e5f7ad16c0d59e3f4ef0266505f0976a41d55bc.png";
import trustBannerImage from "../../../assets/d66d403f3b68db2e5dedb81961508f5cf25a1d58.png";
import blogWireframeImage from "../../../assets/b180e00e08f5659eea7cb564d44ce4b577244437.png";
import blogSeoImage from "../../../assets/c5f0ad0a25f5f070c7404384352ca5dc9460331e.png";
import blogEcommerceImage from "../../../assets/2a4556d55251a48bc607f0696b65efb4a8117133.png";
import avatarSue from "../../../assets/573ad1f39f6055a34e7171ec9bb627fdf05cf003.png";
import avatarJhon from "../../../assets/4e64811246c2bda815c83e5aa067453ff586901e.png";
import avatarRobbie from "../../../assets/dd23378db022480fe43081e8f5774a27c17b0a9d.png";
import iconDigitalMarketing from "../../../assets/68dd4a4fc4783dc83cbb2467ace3baf4d5b9a15d.png";
import iconAws from "../../../assets/3ac04e4c13757378e2740d66ab0ee4804511697a.png";
import iconGoogleAds from "../../../assets/e849124adaf316f4fe59ff0ddf0cc15fd75d72df.png";
import iconMeta from "../../../assets/65e1a43c4dce73a01c24356c3586bfbf475832d6.png";
import iconContent from "../../../assets/20b545e325c1fc86b38c36656bdc928249b39d46.png";
import iconGraphicDesign from "../../../assets/be523df670567b834e3f83391a7f3842ff19ab01.png";
import iconLaunch from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import iconGrowth from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import iconScale from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const services = [
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

const SERVICE_SLIDE_DELAY_MS = 3500;

function getVisibleServiceCount() {
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

const projects = [
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

const packageCards = [
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

const faqItems = [
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

const blogPosts = [
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

function SectionEyebrow({
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

function ServiceCard({
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

function ProjectCard({
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

function PackageCard({
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
      <ActionButton accent={tones.button} className="mt-7 w-full justify-center" label={cta} />
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

function ReviewCard({
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

function BlogCard({
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

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-6 space-y-3 text-sm text-white/62">
        {links.map((link, index) => {
          const target = getFooterLinkTarget(link);
          const className = index === 0 ? "text-[#b5ff15]" : "transition hover:text-[#b5ff15]";

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

export default function LandingHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [serviceSlide, setServiceSlide] = useState(0);
  const [servicesPaused, setServicesPaused] = useState(false);
  const [visibleServiceCount, setVisibleServiceCount] = useState(getVisibleServiceCount);
  const maxServiceSlide = Math.max(services.length - visibleServiceCount, 0);

  useEffect(() => {
    const updateVisibleCards = () => {
      setVisibleServiceCount(getVisibleServiceCount());
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);

    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  useEffect(() => {
    setServiceSlide((current) => Math.min(current, maxServiceSlide));
  }, [maxServiceSlide]);

  useEffect(() => {
    if (servicesPaused || maxServiceSlide === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setServiceSlide((current) => (current >= maxServiceSlide ? 0 : current + 1));
    }, SERVICE_SLIDE_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [maxServiceSlide, servicesPaused]);

  return (
    <div className="min-h-screen bg-[#050816] text-white" id="top">
      <SiteHeader />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#8a38f5]/20 blur-[140px]" />
        <div className="absolute right-[-9rem] top-[18rem] h-[22rem] w-[22rem] rounded-full bg-[#b5ff15]/10 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[26rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#00a2e5]/10 blur-[160px]" />
      </div>

      <section className="relative isolate min-h-[900px] overflow-hidden bg-[#050607]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(170,255,1,0.16),transparent_30%),radial-gradient(circle_at_76%_28%,rgba(138,56,245,0.18),transparent_30%),linear-gradient(135deg,#050607_0%,#111317_48%,#030405_100%)]" />
        <div className="absolute left-[-9rem] top-28 h-[28rem] w-[28rem] rounded-full border border-[#aaff01]/18" />
        <div className="absolute right-[-10rem] top-8 h-[34rem] w-[34rem] rounded-full border border-[#aaff01]/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050816] to-transparent" />

        <header className="hidden">
          <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between gap-6 px-6 py-6 lg:px-10">
            <Link className="shrink-0" to="/">
              <img alt="Social Tech" className="h-10 w-auto object-contain md:h-12" src={logoImage} />
            </Link>

            <nav className="hidden items-center gap-10 text-sm text-white/76 lg:flex">
              {navItems.map((item) => (
                <Link key={item.label} className="transition hover:text-[#b5ff15]" to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <ActionButton accent="lime" label="Giriş Yap" />
              <ActionButton accent="violet" label="İletişime Geç" to="/iletisim" />
            </div>

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              <Menu className="h-5 w-5" />
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
                  <ActionButton accent="lime" label="Giriş Yap" />
                  <ActionButton accent="violet" label="İletişime Geç" to="/iletisim" />
                </div>
              </div>
            </div>
          ) : null}
        </header>

        <div className="relative z-10 mx-auto flex min-h-[780px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-20 pt-16 text-center lg:px-10">
          <h1 className="max-w-[980px] text-[34px] font-bold leading-tight tracking-tight text-white md:text-[54px]">
            Dijital Büyümeyi Ölçeklenebilir Hale Getiriyoruz
          </h1>
          <p className="mt-8 max-w-[780px] text-base leading-8 text-white/74 md:text-xl">
            Veriye dayalı stratejiler, akıllı teknoloji ve
            <span className="mx-2 font-semibold text-[#b5ff15]">
              ölçülebilir sonuçlarla
            </span>
            markanızı sürdürülebilir şekilde büyütüyoruz.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[280px]" label="Hizmetlerimizi Keşfedin" to="/hizmetler" />
            <ActionButton accent="violet" className="min-w-[280px]" href="#packages" label="Marka Hesabı Oluşturun" />
          </div>
        </div>
      </section>

      <section className="relative bg-[#090b10] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="max-w-[690px]">
            <h2 className="text-[30px] font-bold leading-tight tracking-tight text-white md:text-[42px]">
              Dijital büyümeyi rastlantısal değil
            </h2>
            <div className="mt-3 inline-block -rotate-[1.2deg] bg-[#b5ff15] px-4 py-2">
              <span className="text-[30px] font-bold leading-tight tracking-tight text-black md:text-[42px]">
                sistematik hale getiriyoruz.
              </span>
            </div>
            <div className="mt-10 space-y-7 text-base leading-8 text-white/72 md:text-xl">
              <p>
                Social Tech, markaların dijital dünyada yalnızca görünür olmasını değil, ölçülebilir ve sürdürülebilir şekilde büyümesini hedefler.
              </p>
              <p>
                Bizim için dijital pazarlama; tek seferlik kampanyalar ya da geçici çözümlerden ibaret değildir. Veriye dayalı stratejiler, doğru teknoloji ve net hedeflerle ölçeklenebilir büyüme sistemleri kurarız.
              </p>
              <p>
                Her marka için aynı yöntemle ilerlemiyoruz. Hedeflerinize, mevcut yapınıza ve büyüme önceliklerinize göre ölçeklenebilir bir çalışma modeli kurguluyoruz.
              </p>
            </div>
            <ActionButton accent="lime" className="mt-10" href="#footer" label="Ücretsiz Ön Görüşme Planlayın" />
          </div>

          <div className="relative mx-auto h-[460px] w-full max-w-[620px]">
            <div className="absolute right-0 top-0 h-[300px] w-[74%] overflow-hidden rounded-[28px] bg-black/40 shadow-[0_26px_80px_rgba(0,0,0,0.35)]">
              <img alt="Social Tech toplantı" className="h-full w-full object-cover opacity-60" src={aboutBackImage} />
            </div>
            <div className="absolute bottom-0 left-0 h-[340px] w-[82%] overflow-hidden rounded-[28px] border border-white/8 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
              <img alt="Social Tech ekip çalışması" className="h-full w-full object-cover" src={aboutFrontImage} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111317] py-24" id="services">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow center highlight="Dijital Çözümler" prefix="Hedeflerinize Uygun" />
          <div
            className="-mx-3 mt-14 overflow-hidden py-2"
            onBlurCapture={() => setServicesPaused(false)}
            onFocusCapture={() => setServicesPaused(true)}
            onMouseEnter={() => setServicesPaused(true)}
            onMouseLeave={() => setServicesPaused(false)}
          >
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(-${serviceSlide * (100 / services.length)}%)`,
                width: `${(services.length / visibleServiceCount) * 100}%`,
              }}
            >
              {services.map((service) => (
                <div
                  className="shrink-0 px-3"
                  key={service.title}
                  style={{ width: `${100 / services.length}%` }}
                >
                  <ServiceCard {...service} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxServiceSlide + 1 }).map((_, index) => (
              <button
                aria-label={`${index + 1}. çözüm grubuna geç`}
                className={`h-2.5 rounded-full transition-all ${
                  serviceSlide === index ? "w-8 bg-[#b5ff15]" : "w-2.5 bg-white/18 hover:bg-white/36"
                }`}
                key={index}
                onClick={() => setServiceSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#060708] py-24" id="projects">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SectionEyebrow highlight="Çalışmalar" prefix="Yaptığımız Projeler ve" />
              <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72">
                Ürettiğimiz projeleri inceleyin, yaklaşımımızı yakından görün. Her projede nasıl değer ürettiğimizi keşfedin.
              </p>
            </div>
            <ActionButton accent="lime" className="self-start" label="Behance'de Gözlemleyin" />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#101215] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[900px] text-center text-lg leading-8 text-white/72">
            Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için için sayfamızı ziyaret etmeyi unutmayın!
          </p>

          <PaymentLogos />

          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packageCards.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>

          <div className="mt-12 text-center text-base leading-8 text-white/72 md:text-lg">
            <p>Çoğu marka Launch ile başlar, Growth ile büyür ve Scale ile sistemi kurar.</p>
            <p>
              Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
              <a className="mx-2 font-bold text-[#b5ff15] underline" href="#footer">
                formu
              </a>
              doldurun, beraber karar verelim!
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#050608] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow center highlight="Yorumları" prefix="Kullanıcılarımızdan Social Tech" />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </div>

          <div className="mt-14 grid overflow-hidden rounded-[24px] border border-[#8a38f5]/70 bg-[#5a2499] shadow-[0_24px_70px_rgba(0,0,0,0.3)] lg:grid-cols-[360px_1fr]">
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
              <ActionButton accent="lime" className="mt-8 self-start" label="Trustpilot'a Göz At" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#11190a_0%,#0a0d10_100%)] py-24" id="faq">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SectionEyebrow highlight="Sorular" prefix="Sıkça Sorulan" />
            </div>
            <div className="max-w-[420px]">
              <img alt="Social Tech" className="h-10 w-auto object-contain" src={logoImage} />
              <p className="mt-6 text-sm leading-7 text-white/72">
                Sizden gelen en özel en değerli sorular ve yanıtlarını keşfedin. Aklınızda bir soru kaldıysa bize ulaşın!
              </p>
              <ActionButton accent="lime" className="mt-6" label="Hala Kafanız mı Karışık?" />
            </div>
          </div>

          <div className="mt-14 space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-[12px] border border-[#476b00] bg-[#182306]/80 shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                >
                  <button
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="text-lg font-semibold text-white md:text-[26px]">
                        {item.question}
                      </span>
                      {item.popular ? (
                        <span className="hidden text-sm text-white/60 md:inline">{item.popular}</span>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-white">
                      {isOpen ? <ChevronDown className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-white/8 px-6 pb-6 pt-5 text-base leading-7 text-white/72 md:px-8 md:text-lg">
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0d11] py-24" id="blog">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow highlight="Dijital!" prefix="Kısa, Net:" />
          <p className="mt-6 text-lg leading-8 text-white/72">
            Gerçek projelerden, uygulanabilir pazarlama ve teknoloji yazıları.
          </p>

          <div className="mt-14 grid gap-10 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.title} {...post} />
            ))}
          </div>

          <div className="mt-16 border-t border-[#476b00] pt-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-[22px] font-bold text-white">
                Yeni yazılar yayınlandığında ilk siz haberdar olun.
              </p>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[560px]">
                <label className="flex-1">
                  <span className="sr-only">E-posta adresi</span>
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#b5ff15]/20 bg-[#232323] px-4 py-3 text-white/56">
                    <Search className="h-4 w-4" />
                    <input
                      className="w-full bg-transparent text-sm outline-none placeholder:text-white/36"
                      placeholder="E-Posta Adresiniz..."
                      type="email"
                    />
                  </div>
                </label>
                <ActionButton accent="lime" filled className="justify-center" label="Haberdar Ol!" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-16" id="footer">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="grid gap-12 xl:grid-cols-[1.1fr_0.6fr_0.8fr_0.95fr]">
            <div>
              <img alt="Social Tech" className="h-12 w-auto object-contain" src={logoImage} />
              <p className="mt-6 max-w-[360px] text-sm leading-7 text-white/64">
                Pazarlama bütçenizden daha fazla sonuçlar elde etmek istiyorsanız, yeni partneriniz olmak için fazlasıyla hazırız!
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-white/72">
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Instagram className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Youtube className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Facebook className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Mail className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <X className="h-4 w-4" />
                </a>
              </div>
            </div>

            <FooterLinkColumn
              links={["Anasayfa", "Müşteriler", "Bize Ulaşın", "Kariyer & Staj", "Portfolyo & Projeler", "Bloglar"]}
              title="Faydalı Linkler"
            />
            <FooterLinkColumn
              links={["Sosyal Medya", "Dijital Pazarlama", "Web Sitesi Geliştirme", "Mobil Uygulama Geliştirme", "Reklam Yönetimi", "Web Teknik Destek"]}
              title="Ürün ve Hizmetler"
            />

            <div id="footer-cta">
              <div className="flex flex-col gap-4">
                <ActionButton
                  accent="violet"
                  filled
                  icon={<CalendarDays className="h-4 w-4 text-white" />}
                  label="Online Toplantı Planla"
                />
                <ActionButton
                  accent="lime"
                  filled
                  icon={<MessageCircle className="h-4 w-4 text-[#0e1405]" />}
                  label="WhatsApp Destek Hattı"
                />
                <ActionButton
                  accent="cyan"
                  filled
                  icon={<Package2 className="h-4 w-4 text-white" />}
                  label="Dijital Yolda Büyüme"
                />
              </div>
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
    </div>
  );
}
