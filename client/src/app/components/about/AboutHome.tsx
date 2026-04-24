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

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import manifestoIllustration from "../../../assets/2451c6f130ea0918f38f6002b1e6ebfc1c2f99df.png";
import manifestoMockup from "../../../assets/dff7469f9313f17f27e9efb8174ceb54235acb08.png";
import manifestoMetrics from "../../../assets/cbe607eb3f54ad7b61aafcae8659f361cfea1078.png";
import manifestoSpeed from "../../../assets/fa5f8979fb13ea6b9e298585ab60ae5cacffecdf.png";
import manifestoWeb from "../../../assets/cc3a73b6f38cea421b8743c49f0f128183d4c187.png";
import processStepOneImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.png";
import processStepTwoImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.png";
import processStepThreeImage from "../../../assets/d407dea157c52e067680066f8673e56861aa712d.png";
import processStepFourImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.png";
import socialFacebookIcon from "../../../assets/e85560ced236146567089e9e207b21cb74f94c95.png";
import socialInstagramIcon from "../../../assets/e0029c37d99a6a8e289a793abaaf02984f19717b.png";
import socialLinkedinIcon from "../../../assets/1c1a20c7d8c2a14e8d97dd68e316412e56d2450f.png";
import socialYoutubeIcon from "../../../assets/f89bf8640ce3923c3ad0dcc795f0662e2923a50f.png";
import socialTiktokIcon from "../../../assets/7d47dd30db922c5fc58659809a3e1d956b9dd2a4.png";
import socialWhatsappIcon from "../../../assets/100df1ea0b5537c2a776132fa6b5f2184d8ffc8e.png";
import socialSnapchatIcon from "../../../assets/ee893046d93b786d05f5b1cb76d451b4f7a0f95c.png";
import socialPinterestIcon from "../../../assets/9fc2a7e67129638bedcf545812f1b84bbfbdb7c9.png";
import toolFigmaIcon from "../../../assets/464ced20317afa1aaf01c1b14334b6991902da40.png";
import toolPhotoshopIcon from "../../../assets/a3de08031b9f85a9f9727b45980157fd6355c073.png";
import toolIllustratorIcon from "../../../assets/58f77f624371049002598eeb7cdd1d1f5d7a23d1.png";
import toolWooCommerceIcon from "../../../assets/f16185c3fccdbc09b48f3936735bf25fbd2b91a2.png";
import toolWordPressIcon from "../../../assets/a56dc130860c00dd18ef049f57bc6aed87db0f63.png";
import toolWixIcon from "../../../assets/f7749653a3663ed07e43018262e3b49114327c4a.png";
import toolQuickModeIcon from "../../../assets/6b28e6372b5679aecd6606305bad3b4544d5fb47.png";
import toolWindowIcon from "../../../assets/3d207c82e4a8ece2497d77ec0e54505c5671a4a7.png";
import toolShopifyIcon from "../../../assets/cc24a5c5ac0319bdeacf0c74b1781b13e57edb85.png";
import ActionButton from "../site/ActionButton";
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda", active: true },
];

const manifestoPoints = [
  {
    title: "Strateji + Uygulama birlikte",
    description:
      "Sadece strateji hazırlamakla kalmıyor, onu canlıya alıp büyüme ritmine sokuyoruz.",
    icon: manifestoMockup,
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

const thoughtCards = [
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

const capabilities = [
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

const processSteps = [
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

const whyUs = [
  { title: "Ajans değil ürün mantığı", icon: Blocks },
  { title: "Tek merkezden yönetim", icon: Globe },
  { title: "Gerçek KPI'lar", icon: Target },
  { title: "Uzun vadeli iş ortaklığı", icon: ShieldCheck },
  { title: "Ölçeklenebilir sistemler", icon: Gauge },
];

const socialIcons = [
  socialFacebookIcon,
  socialInstagramIcon,
  socialWhatsappIcon,
  socialYoutubeIcon,
  socialTiktokIcon,
  socialLinkedinIcon,
  socialSnapchatIcon,
  socialPinterestIcon,
];

const toolIcons = [
  toolFigmaIcon,
  toolPhotoshopIcon,
  toolIllustratorIcon,
  toolShopifyIcon,
  toolWooCommerceIcon,
  toolWordPressIcon,
  toolWixIcon,
  toolQuickModeIcon,
  toolWindowIcon,
];

function SectionHeading({
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

function ProcessCard({
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

export default function AboutHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050816] text-white" id="top">
      <SiteHeader />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[18rem] h-[26rem] w-[26rem] rounded-full bg-[#b5ff15]/10 blur-[140px]" />
        <div className="absolute right-[-10rem] top-[28rem] h-[24rem] w-[24rem] rounded-full bg-[#8a38f5]/16 blur-[140px]" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-[#00a2e5]/8 blur-[160px]" />
      </div>

      <section className="relative isolate min-h-[860px] overflow-hidden bg-[#050607]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(170,255,1,0.16),transparent_30%),radial-gradient(circle_at_76%_28%,rgba(138,56,245,0.18),transparent_30%),linear-gradient(135deg,#050607_0%,#111317_48%,#030405_100%)]" />
        <div className="absolute left-[-9rem] top-28 h-[28rem] w-[28rem] rounded-full border border-[#aaff01]/18" />
        <div className="absolute right-[-10rem] top-8 h-[34rem] w-[34rem] rounded-full border border-[#aaff01]/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#101411] to-transparent" />

        <header className="hidden">
          <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between gap-6 px-6 py-6 lg:px-10">
            <Link className="shrink-0" to="/">
              <img alt="Social Tech" className="h-10 w-auto object-contain md:h-12" src={logoImage} />
            </Link>

            <nav className="hidden items-center gap-10 text-sm lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  className={item.active ? "text-[#b5ff15]" : "text-white/76 transition hover:text-[#b5ff15]"}
                  to={item.to}
                >
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

        <div className="relative z-10 mx-auto flex min-h-[740px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-20 pt-16 text-center lg:px-10">
          <h1 className="max-w-[860px] text-[36px] font-bold leading-tight tracking-tight text-white md:text-[58px]">
            Dijitalde Görünür Olmak Yetmez
            <br />
            Sistem Kurmak Gerekir
          </h1>
          <p className="mt-8 max-w-[760px] text-base leading-8 text-white/74 md:text-xl">
            Social Tech, markalar için sadece hizmet sunmaz;
            <span className="mx-2 font-semibold text-[#b5ff15]">ölçülebilir büyüme üreten dijital sistemler</span>
            inşa eder.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[240px]" href="#cta" label="Bizimle Tanışın" />
            <ActionButton accent="violet" className="min-w-[240px]" href="#process" label="Nasıl Çalışıyoruz?" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#111513_0%,#9edb00_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Dijital Ürün Ortağınızız" prefix="Ajans Değil," />

          <div className="mt-16 grid gap-8 rounded-[34px] bg-[#070809] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:grid-cols-[0.92fr_1.08fr] lg:p-9">
            <div className="space-y-4">
              {manifestoPoints.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[16px] border border-white/10 bg-[linear-gradient(135deg,rgba(38,41,43,0.96),rgba(23,24,25,0.92))] px-5 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-[12px] bg-black/40 p-3">
                      <img alt={item.title} className="h-11 w-11 object-contain" src={item.icon} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/66">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(6,8,11,0.98),rgba(18,22,18,0.88))] px-6 py-8 md:px-10">
              <div className="flex flex-col items-start gap-8 md:flex-row">
                <div className="w-full max-w-[220px] shrink-0 rounded-[24px] border border-white/8 bg-black/40 p-4">
                  <img alt="Social Tech yaklaşımı" className="w-full object-contain" src={manifestoIllustration} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[34px] font-bold leading-tight tracking-tight text-[#b5ff15]">
                    Bir ajanstan daha fazlası
                    <br />
                    işlerinizin tam kalbinde
                  </h3>
                  <div className="mt-6 space-y-5 text-base leading-8 text-white/76 md:text-lg">
                    <p>
                      Social Tech; web, pazarlama ve teknoloji disiplinlerini tek merkezden yöneten bir dijital büyüme ekibidir.
                    </p>
                    <p>
                      Bizim için başarı; güzel tasarım değil, satış üreten, ölçeklenebilir ve sürdürülebilir sistemler kurmaktır.
                    </p>
                  </div>
                  <ul className="mt-8 space-y-3 text-sm text-white/76 md:text-base">
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#b5ff15]" />
                      <span>İhtiyaca göre mimariler, hazır kalıplar değil</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#b5ff15]" />
                      <span>Uzun vadeli geliştirilebilirlik ve bakım kolaylığı</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#b5ff15]" />
                      <span>Yönetilebilir ve ölçeklenebilir dijital yapılar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#111214_0%,#18101f_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Düşünüyoruz?" prefix="Nasıl" />
          <p className="mx-auto mt-8 max-w-[780px] text-center text-lg leading-8 text-white/72">
            İşlerimizi yaparken en ince ayrıntıyı atlamadan, analiz, ölçümleme ve veri ile çalışıyoruz.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {thoughtCards.map((item) => (
              <article
                key={item.title}
                className="rounded-[18px] border border-[#aaff01]/20 bg-[#aaff01] p-6 text-[#11160b] shadow-[0_20px_56px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#202716]/78">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#1d132a_0%,#8a38f5_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ne İnşa Ediyoruz?" prefix="Markalar İçin" />
          <p className="mx-auto mt-8 max-w-[900px] text-center text-lg leading-8 text-white/76">
            Her hizmet, tek başına değil; sistemin bir parçası olarak ele alınır.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[14px] border border-white/12 bg-white/10 px-5 py-5 backdrop-blur"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-[12px] bg-white/10 p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#111214] py-24" id="process">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Bizim Gücümüz" prefix="Süreç" />

          <div className="mt-16 grid gap-6 xl:grid-cols-4">
            {processSteps.map((item) => (
              <ProcessCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#111214_0%,#8a38f5_100%)] py-18">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center accent="violet" highlight="SocialTech?" prefix="Neden" />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {whyUs.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="flex items-center gap-4 rounded-[16px] border border-white/12 bg-black/14 px-5 py-5 backdrop-blur"
                >
                  <div className="rounded-full bg-white/10 p-3 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white/86">{item.title}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#141414] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Doğru Yapıya Odaklanırız" prefix="Araçlara Değil," />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/72">
            IKA, Webflow, Shopify ya da custom. Web sitelerinizde, sosyal medya ve reklamlarınız için ihtiyaca göre doğru teknolojiyi seçeriz.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {socialIcons.map((icon, index) => (
              <div
                key={index}
                className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#b5ff15]/20 bg-[#10140f]"
              >
                <img alt="" className="h-6 w-6 object-contain" src={icon} />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {toolIcons.map((icon, index) => (
              <div
                key={index}
                className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#b5ff15]/20 bg-[#10140f]"
              >
                <img alt="" className="h-7 w-7 object-contain" src={icon} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-[radial-gradient(circle_at_top,rgba(181,255,21,0.92)_0%,rgba(139,204,0,0.92)_44%,rgba(11,13,10,1)_100%)] py-24"
        id="cta"
      >
        <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
          <SectionHeading center highlight="Hazır mısınız?" prefix="Bizimle Çalışmaya" />
          <p className="mx-auto mt-6 max-w-[760px] text-lg leading-8 text-[#101708]/74">
            Sizi tanımadan teklif sunmuyoruz. Önce dinliyor, sonra çözüyoruz.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[250px]" href="#footer" label="Ücretsiz Ön Görüşme" />
            <ActionButton accent="violet" className="min-w-[250px]" to="/hizmetler" label="Hizmetleri İncele" />
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
                  <Facebook className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Instagram className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Youtube className="h-4 w-4" />
                </a>
                <a className="rounded-md border border-white/10 p-2 hover:text-[#b5ff15]" href="#top">
                  <Linkedin className="h-4 w-4" />
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

            <div className="flex flex-col gap-4">
              <ActionButton
                accent="violet"
                filled
                icon={<CalendarDays className="h-4 w-4" />}
                label="Online Toplantı Planla"
              />
              <ActionButton
                accent="lime"
                filled
                icon={<MessageCircle className="h-4 w-4" />}
                label="WhatsApp Destek Hattı"
              />
              <ActionButton
                accent="cyan"
                filled
                icon={<Package2 className="h-4 w-4" />}
                label="Dijital Yolda Büyüme"
              />
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
