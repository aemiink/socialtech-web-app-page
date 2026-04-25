import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import {
  BarChart3,
  ChevronDown,
  Code2,
  Megaphone,
  Menu,
  Wrench,
  X,
} from "lucide-react";
import ActionButton from "./ActionButton";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";

type ServiceMenuGroup = {
  id: string;
  label: string;
  icon: ReactNode;
  links: Array<{
    title: string;
    description: string;
    to: string;
  }>;
};

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Otomasyonlar", to: "/otomasyonlar" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const serviceMenuGroups: ServiceMenuGroup[] = [
  {
    id: "growth",
    label: "Büyüme & Reklam",
    icon: <Megaphone className="h-4 w-4" />,
    links: [
      {
        title: "Otomasyonlar",
        description: "Brand DNA, WhatsApp, DM, görsel ve analiz otomasyonlarını paket sistemine bağlayın.",
        to: "/otomasyonlar",
      },
      {
        title: "Growth & Hub",
        description: "Dijital büyüme stratejisi, kanal yönetimi ve ölçümleme sistemi.",
        to: "/hizmetler/buyume-hub",
      },
      {
        title: "Dijital Pazarlama Hub",
        description: "Meta, Google, TikTok ve Amazon reklamlarını tek plan altında yönetin.",
        to: "/hizmetler/dijital-pazarlama-hub",
      },
      {
        title: "Sosyal Medya Yönetimi",
        description: "İçerik, topluluk, raporlama ve marka iletişimini büyüme sistemine bağlayın.",
        to: "/hizmetler/sosyal-medya",
      },
      {
        title: "Amazon Ads",
        description: "Pazar yeri görünürlüğünü satış ve karlılık metrikleriyle ölçekleyin.",
        to: "/hizmetler/amazon-reklamlari",
      },
    ],
  },
  {
    id: "ads",
    label: "Performans Kanalları",
    icon: <BarChart3 className="h-4 w-4" />,
    links: [
      {
        title: "Google Ads",
        description: "Arama niyeti yüksek kullanıcıları ölçülebilir dönüşüm akışına alın.",
        to: "/hizmetler/google-reklamlari",
      },
      {
        title: "Meta Ads",
        description: "Funnel, kreatif test ve bütçe optimizasyonuyla satışa dönen reklam yapısı.",
        to: "/hizmetler/meta-reklamlari",
      },
      {
        title: "TikTok Ads",
        description: "Hook, UGC ve keşfet akışını performans kampanyasına dönüştürün.",
        to: "/hizmetler/tiktok-reklamlari",
      },
    ],
  },
  {
    id: "product",
    label: "Web & Ürün",
    icon: <Code2 className="h-4 w-4" />,
    links: [
      {
        title: "Web Uygulamaları",
        description: "Fikirden ürüne, ölçeklenebilir ve yönetilebilir web sistemleri.",
        to: "/hizmetler/web-uygulama",
      },
      {
        title: "Mobil Uygulama",
        description: "iOS ve Android için ürün odaklı mobil deneyim ve büyüme altyapısı.",
        to: "/hizmetler/mobil-uygulama",
      },
      {
        title: "Landing Page / UI-UX",
        description: "Satış ve lead üretmek için hızlı, net ve ölçülebilir arayüzler.",
        to: "/hizmetler/karsilama-sayfasi",
      },
      {
        title: "Web Tasarım",
        description: "Marka kimliğini, görsel sistemi ve modern arayüz dilini tek akışta kurun.",
        to: "/hizmetler/web-tasarim",
      },
    ],
  },
  {
    id: "technical",
    label: "Teknik Destek",
    icon: <Wrench className="h-4 w-4" />,
    links: [
      {
        title: "SEO Denetimi",
        description: "Teknik SEO, performans ve görünürlük problemlerini ortaya çıkarın.",
        to: "/hizmetler/seo",
      },
      {
        title: "Web Teknik Destek",
        description: "Bakım, hız optimizasyonu, güvenlik ve sürdürülebilir teknik destek.",
        to: "/hizmetler/web-teknik-destek",
      },
    ],
  },
];

function isRouteActive(pathname: string, target: string) {
  if (target === "/") {
    return pathname === "/";
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(serviceMenuGroups[0].id);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const activeGroup = serviceMenuGroups.find((group) => group.id === activeGroupId) ?? serviceMenuGroups[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setServicesOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!servicesOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [servicesOpen]);

  const headerSurface = scrolled || servicesOpen || mobileMenuOpen
    ? "border-white/10 bg-[#050607]/76 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
    : "border-transparent bg-transparent";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${headerSurface}`} ref={headerRef}>
      <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link className="shrink-0" to="/">
          <img alt="Social Tech" className="h-10 w-auto object-contain md:h-12" src={logoImage} />
        </Link>

        <nav className="hidden items-center gap-10 text-sm lg:flex">
          {navItems.map((item) => {
            const active = item.label === "Hizmetlerimiz"
              ? location.pathname.startsWith("/hizmetler")
              : isRouteActive(location.pathname, item.to);

            if (item.label === "Hizmetlerimiz") {
              return (
                <button
                  className={`inline-flex items-center gap-2 transition ${active || servicesOpen ? "text-[#aaff01]" : "text-white/76 hover:text-[#aaff01]"}`}
                  key={item.label}
                  onClick={() => setServicesOpen((current) => !current)}
                  type="button"
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 transition ${servicesOpen ? "rotate-180" : ""}`} />
                </button>
              );
            }

            return (
              <Link
                className={active ? "text-[#aaff01]" : "text-white/76 transition hover:text-[#aaff01]"}
                key={item.label}
                to={item.to}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ActionButton accent="violet" label="İletişime Geç" to="/iletisim#contact-form" />
          <ActionButton accent="lime" label="Giriş Yap" />
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
          onClick={() => setMobileMenuOpen((current) => !current)}
          type="button"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {servicesOpen ? (
        <div className="hidden border-t border-white/10 bg-[#050607]/92 backdrop-blur-2xl lg:block">
          <div className="mx-auto grid w-full max-w-[1540px] gap-6 px-10 py-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-3">
              {serviceMenuGroups.map((group) => (
                <button
                  className={`mb-2 flex w-full items-center gap-3 rounded-[16px] px-4 py-4 text-left text-sm font-extrabold transition last:mb-0 ${
                    activeGroupId === group.id ? "bg-[#aaff01] text-black" : "text-white/72 hover:bg-white/8 hover:text-white"
                  }`}
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  type="button"
                >
                  {group.icon}
                  {group.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {activeGroup.links.map((service) => (
                <Link
                  className="group rounded-[22px] border border-white/10 bg-[#111820] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#aaff01]/42 hover:bg-[#141d26]"
                  key={service.title}
                  to={service.to}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-white transition group-hover:text-[#aaff01]">{service.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/62">{service.description}</p>
                    </div>
                    <ChevronDown className="-rotate-90 text-[#aaff01]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {mobileMenuOpen ? (
        <div className="border-t border-white/10 bg-[#050607]/96 px-6 py-5 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col gap-3 text-sm text-white/80">
            {navItems.map((item) => {
              if (item.label === "Hizmetlerimiz") {
                return (
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-3" key={item.label}>
                    <button
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-3 font-extrabold text-[#aaff01]"
                      onClick={() => setServicesOpen((current) => !current)}
                      type="button"
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition ${servicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    {servicesOpen ? (
                      <div className="mt-2 space-y-2">
                        {serviceMenuGroups.flatMap((group) => group.links).map((service) => (
                          <Link className="block rounded-[12px] bg-black/40 px-3 py-3 text-white/76" key={service.title} to={service.to}>
                            {service.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link className="rounded-[14px] px-3 py-3 transition hover:bg-white/8 hover:text-[#aaff01]" key={item.label} to={item.to}>
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-3">
              <ActionButton accent="violet" label="İletişime Geç" to="/iletisim#contact-form" />
              <ActionButton accent="lime" label="Giriş Yap" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
