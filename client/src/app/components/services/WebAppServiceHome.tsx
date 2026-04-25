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

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
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
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler", active: true },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const valueCards = [
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

const workflow = [
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

const platforms = [shopifyIcon, wooIcon, wordpressIcon, wixIcon, lightningIcon, customWindowIcon];

const faqItems = [
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
          const className = index === 3 ? "text-[#b5ff15]" : "transition hover:text-[#b5ff15]";

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

function ValueCard({
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

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-lg bg-white/12 p-7">
      <h3 className="text-[22px] font-bold leading-tight text-white">{question}</h3>
      <p className="mt-4 text-sm leading-6 text-white/70">{answer}</p>
    </article>
  );
}

export default function WebAppServiceHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <SiteHeader />
      <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111111" />

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
              <ActionButton accent="violet" label="İletişime Geç" to="/iletisim" />
              <ActionButton accent="lime" label="Giriş Yap" />
            </div>

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="mx-6 rounded-lg border border-white/10 bg-[#0d1019]/95 p-5 backdrop-blur lg:hidden">
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

        <div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">Web Uygulamaları</span>
          <h1 className="mt-7 max-w-[980px] text-[34px] font-bold leading-tight text-white md:text-[60px]">
            Fikirden Ürüne
            <br />
            Web Uygulamaları İnşa Ediyoruz
          </h1>
          <p className="mt-7 max-w-[760px] text-base leading-8 text-white/78 md:text-xl">
            Sadece web sitesi değil;
            <span className="mx-2 font-semibold text-[#b5ff15]">iş hedeflerinize hizmet eden ölçeklenebilir web ürünleri</span>
            geliştiriyoruz.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[260px]" href="#footer" label="Ücretsiz Ön Görüşme Planlayın" />
            <ActionButton accent="violet" className="min-w-[260px]" href="#brief" label="Projenizi Anlatın" />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#070809_0%,#aaff01_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="grid gap-8 rounded-lg bg-[#070809] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:grid-cols-[0.92fr_1.08fr] lg:p-9">
            <div className="space-y-4">
              {valueCards.map((card) => (
                <ValueCard key={card.title} {...card} />
              ))}
            </div>

            <div className="rounded-lg border border-white/8 bg-[linear-gradient(135deg,rgba(6,8,11,0.98),rgba(18,22,18,0.88))] px-6 py-8 md:px-10">
              <div className="flex flex-col items-start gap-8 md:flex-row">
                <div className="w-full max-w-[190px] shrink-0 rounded-lg border border-white/8 bg-black/36 p-4">
                  <img alt="Web uygulaması mimarisi" className="w-full object-contain" src={productIllustration} />
                </div>
                <div className="flex-1">
                  <h2 className="text-[32px] font-bold leading-tight text-[#b5ff15]">
                    Bir Web Sitesinden
                    <br />
                    Fazlasını İnşa Ediyoruz
                  </h2>
                  <div className="mt-6 space-y-5 text-base leading-8 text-white/76 md:text-lg">
                    <p>
                      Geliştirdiğimiz her proje; sadece bir arayüz değil, iş hedeflerinize hizmet eden ölçeklenebilir bir web ürünüdür.
                    </p>
                    <p>
                      Tasarım, performans ve yönetilebilirlik tek bir sistemde birlikte düşünülür.
                    </p>
                  </div>
                  <ul className="mt-8 space-y-3 text-sm text-white/76 md:text-base">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-[#b5ff15]" />
                      <span>İhtiyaca göre mimariler, hazır kalıplar değil</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-[#b5ff15]" />
                      <span>Uzun vadeli geliştirilebilirlik</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-[#b5ff15]" />
                      <span>Yönetilebilir ve ölçeklenebilir yapılar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-lg bg-[#070809] p-6 lg:p-8">
            <h2 className="text-[28px] font-bold text-[#b5ff15]">Nasıl Çalışıyoruz?</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-lg bg-white/12 p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/66">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.42fr_1fr]" id="brief">
            <div className="rounded-lg bg-[linear-gradient(180deg,#070809_0%,#8a38f5_100%)] p-8">
              <img alt="" className="h-16 w-16 object-contain" src={meetingIcon} />
              <h2 className="mt-8 text-[30px] font-bold leading-tight text-white">
                Bir Uzmanla
                <br />
                Projenizi Konuşun
              </h2>
              <ActionButton accent="lime" className="mt-8" href="#footer" label="Ücretsiz Ön Görüşme Planlayın" />
            </div>

            <div className="rounded-lg bg-[linear-gradient(135deg,#221633_0%,#8a38f5_100%)] p-8">
              <h2 className="text-[28px] font-bold text-white">İhtiyaca Göre Platform Seçiyoruz</h2>
              <p className="mt-2 text-[30px] font-bold italic leading-tight text-[#b5ff15]">
                Tema değil, hedef odaklı teknoloji geliştiriyoruz!
              </p>
              <p className="mt-6 max-w-[860px] text-base leading-7 text-white/76">
                WordPress, Shopify, Webflow, Squarespace, Woo, Ikas ve Wix gibi popüler platformların yanı sıra özelleştirilmiş altyapılar oluşturuyoruz.
              </p>
              <div className="mt-8 flex flex-wrap gap-5">
                {platforms.map((icon, index) => (
                  <div
                    key={index}
                    className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#b5ff15]/20 bg-[#10140f]"
                  >
                    <img alt="" className="h-7 w-7 object-contain" src={icon} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#151515] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="border-l-4 border-[#8a38f5] pl-5">
            <h2 className="text-[34px] font-bold text-white md:text-[42px]">Sıkça Sorulan Sorular</h2>
            <p className="mt-4 text-lg text-[#8a38f5]">Web tasarımı hakkında merak edilen ve sık sorulan sorular</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {faqItems.map((item) => (
              <FaqCard key={item.question} {...item} />
            ))}
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
              links={["Growth & Hub", "Sosyal Medya", "Dijital Pazarlama", "Web Uygulaması Geliştirme", "Mobil Uygulama Geliştirme", "Reklam Yönetimi", "Web Teknik Destek"]}
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
