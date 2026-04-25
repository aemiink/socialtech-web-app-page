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

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
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

type ServiceCardData = {
  title: string;
  description: string;
  icon: ReactNode;
  to?: string;
  href?: string;
};

type ServiceGroup = {
  id: "social" | "web" | "support";
  label: string;
  icon: ReactNode;
  cards: ServiceCardData[];
};

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const serviceGroups: ServiceGroup[] = [
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

const principles = [
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

const focusFeatures = [
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
      <h2 className="text-[30px] font-bold leading-tight tracking-tight text-white md:text-[42px]">
        {prefix}
        <span className="mx-2 inline-block -rotate-[1.4deg] bg-[#b5ff15] px-3 py-1 text-black">
          {highlight}
        </span>
      </h2>
    </div>
  );
}

function ServiceCard({ title, description, icon, to, href }: ServiceCardData) {
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

export default function ServicesHome() {
  const [activeGroup, setActiveGroup] = useState<ServiceGroup["id"]>("social");

  const currentGroup = serviceGroups.find((group) => group.id === activeGroup) ?? serviceGroups[0];
  const gridClass =
    currentGroup.cards.length === 2
      ? "mx-auto max-w-[760px] grid gap-6 md:grid-cols-2"
      : currentGroup.cards.length === 4
        ? "grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        : "grid gap-6 md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="min-h-screen bg-[#050816] text-white" id="top">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[20rem] h-[24rem] w-[24rem] rounded-full bg-[#b5ff15]/10 blur-[140px]" />
        <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-[#8a38f5]/16 blur-[140px]" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#00a2e5]/8 blur-[180px]" />
      </div>

      <section className="relative isolate flex items-center justify-center overflow-hidden bg-[#040607]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(106,117,124,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(106,117,124,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        <HeroBackdrop fadeColor="#232425" />

<div className="relative z-10 mx-auto grid w-full max-w-[1540px] items-center gap-12 px-6 pb-24 pt-24 text-center lg:min-h-[820px] lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:pt-28 lg:text-left">
          <div className="mx-auto flex max-w-[620px] flex-col items-center lg:mx-0 lg:items-start">
            <h1 className="text-[38px] font-bold leading-tight tracking-tight text-white md:text-[64px]">
              Dijitalde Tek Bir Hizmet Yetmez.
              <br />
              Biz Sistem Kurarız.
            </h1>
            <p className="mt-8 max-w-[560px] text-base leading-8 text-white/74 md:text-xl">
              Social Tech, markalar için tekil işler değil;
              <span className="mx-2 font-semibold text-[#b5ff15]">birbirini besleyen dijital büyüme sistemleri</span>
              inşa eder.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <ActionButton accent="lime" className="min-w-[240px]" to="/iletisim#contact-form" label="Hangisi Bana Uygun?" />
              <ActionButton accent="violet" className="min-w-[240px]" href="#modules" label="Hizmetleri Keşfet" />
            </div>
          </div>

          <div className="relative mx-auto h-[560px] w-full max-w-[760px]">
            <div className="absolute inset-x-6 top-6 rounded-[34px] border border-[#aaff01]/24 bg-[#111820] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
              <div className="rounded-[22px] bg-white px-5 py-4 text-[#101820]">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/42">büyüme sistemi</p>
                <p className="mt-1 text-xl font-extrabold">Büyüme modülleri tek panelde</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {["Strateji", "Reklam", "Web", "Rapor"].map((item) => (
                  <div key={item} className="rounded-[18px] bg-[#232f3e] px-4 py-6 text-center">
                    <p className="text-2xl font-extrabold text-[#aaff01]">{item}</p>
                    <p className="mt-1 text-[11px] text-white/55">modül</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[22px] bg-[#0b1016] p-5">
                {["Hedef belirleme", "Kanal kurulumu", "Ölçümleme", "Optimizasyon"].map((item) => (
                  <div key={item} className="mb-3 flex items-center justify-between rounded-xl bg-white/7 px-4 py-3 text-sm">
                    <span className="text-white/82">{item}</span>
                    <span className="font-extrabold text-[#aaff01]">aktif</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-5 left-0 rounded-[26px] border border-white/10 bg-[#232f3e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
              <p className="text-xs text-white/54">sistem gücü</p>
              <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">4x</p>
            </div>
            <div className="absolute bottom-0 right-0 rounded-[26px] border border-[#aaff01]/25 bg-[#0b1016] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-xs text-white/54">ölçüm</p>
              <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">canlı</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#232425_0%,#aaff01_100%)] py-24" id="modules">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Büyüme Modülleri Sunuyoruz" prefix="Hizmet Değil," />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/80">
            Her hizmet tek başına alınabilir, ama birlikte alındığında sistem kurar. Ölçülür, raporlanır, optimize edilir.
            Aşağıdan size uygun olan hizmeti bulabilir, sistemi inceleyebilirsiniz.
          </p>

          <div className="mt-16 rounded-[42px] bg-black px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.34)] md:px-8 md:py-10">
            <div className="mx-auto max-w-[1140px] rounded-[14px] bg-[#555555] p-2">
              <div className="grid gap-2 md:grid-cols-3">
                {serviceGroups.map((group) => (
                  <button
                    key={group.id}
                    className={`flex items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-sm font-medium transition ${
                      activeGroup === group.id ? "bg-[#b5ff15] text-[#142000]" : "text-white/90 hover:bg-white/10"
                    }`}
                    onClick={() => setActiveGroup(group.id)}
                    type="button"
                  >
                    {group.icon}
                    <span>{group.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <div className={gridClass}>
                {currentGroup.cards.map((card) => (
                  <ServiceCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#222325] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Social Tech?" prefix="Neden" />
          <p className="mx-auto mt-8 max-w-[880px] text-center text-lg leading-8 text-white/74">
            İşlerimizi yaparken en ince ayrıntıyı atlamadan, analiz, ölçümleme ve veri ile çalışıyoruz.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item) => (
              <article
                key={item.title}
                className="rounded-[18px] bg-[#b5ff15] px-6 py-7 text-[#13160d] shadow-[0_18px_56px_rgba(0,0,0,0.22)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                  <ChartColumn className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#1a1f12]/80">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#242424_0%,#171717_100%)] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
          <div className="relative mx-auto w-full max-w-[720px]">
            <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_center,rgba(138,56,245,0.18),transparent_52%)] blur-[60px]" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[#171b20] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <img alt="Doğru yapı odaklı servisler" className="w-full object-cover" src={focusIllustration} />
            </div>
          </div>

          <div>
            <h2 className="text-[34px] font-medium leading-tight text-white md:text-[48px]">
              Teknolojiye değil
              <span className="mt-3 block w-fit -rotate-[1deg] bg-[#b5ff15] px-4 py-2 font-bold tracking-tight text-black">
                Doğru Yapıya Odaklanırız
              </span>
            </h2>
            <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/72">
              Geliştirdiğimiz tüm servisler, rastgele araçlar veya tekil çözümlerden oluşmaz. Her hizmet için; planlama,
              ölçümleme, optimizasyon ve ölçeklenebilirlik odaklı bir sistem yaklaşımı benimseriz. Kullandığımız teknoloji
              altyapısı ve çalışma metodolojimiz sayesinde, yalnızca hizmet sunmaz; veriye dayalı, sürdürülebilir ve büyümeye
              hizmet eden dijital sistemler kurarız.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {focusFeatures.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="border-t border-white/16 pt-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-[14px] bg-white/8 p-3 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-white/76"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
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
            <ActionButton accent="lime" className="min-w-[250px]" to="/iletisim#contact-form" label="Ücretsiz Ön Görüşme" />
            <ActionButton accent="violet" className="min-w-[250px]" href="#modules" label="Hizmetleri İncele" />
          </div>
        </div>
      </section>

</div>
  );
}
