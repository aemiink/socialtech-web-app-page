import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Facebook,
  Headphones,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package2,
  Phone,
  RadioTower,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Youtube,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const contactChannels = [
  {
    title: "Online Toplantı",
    description: "Hedefinizi dinleyip en uygun yol haritasını birlikte çıkaralım.",
    action: "Toplantı Planla",
    icon: CalendarDays,
    accent: "violet" as const,
  },
  {
    title: "WhatsApp Hattı",
    description: "Hızlı sorular, ön bilgi ve kısa yönlendirmeler için bize yazın.",
    action: "WhatsApp'a Git",
    icon: MessageCircle,
    accent: "lime" as const,
  },
  {
    title: "Dijital Yol Haritası",
    description: "Markanız için hangi sistemin öncelikli olduğunu birlikte netleştirelim.",
    action: "Brief Gönder",
    icon: LayoutDashboard,
    accent: "cyan" as const,
  },
];

const contactStats = [
  { value: "24s", label: "ilk dönüş hedefi" },
  { value: "30dk", label: "keşif görüşmesi" },
  { value: "3 adım", label: "net yol haritası" },
];

const processSteps = [
  {
    title: "Önce Dinliyoruz",
    description: "Hedefinizi, mevcut kanallarınızı, bütçenizi ve darboğazlarınızı netleştiriyoruz.",
    icon: Headphones,
  },
  {
    title: "Sistemi Haritalıyoruz",
    description: "Tekil hizmet değil, ölçülebilir büyüme için hangi parçaların gerektiğini çıkarıyoruz.",
    icon: Target,
  },
  {
    title: "Aksiyon Planı Sunuyoruz",
    description: "İlk sprint, kanal önceliği ve başarı metriğini anlaşılır bir plana dönüştürüyoruz.",
    icon: BarChart3,
  },
];

const serviceOptions = [
  "Growth & Hub",
  "Sosyal Medya",
  "Dijital Pazarlama",
  "Web Uygulaması",
  "SEO / Teknik Destek",
  "Amazon / Google / Meta / TikTok Ads",
  "Henüz emin değilim",
];

function HeaderNav({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
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
            <Link key={item.label} className="text-white/76 transition hover:text-[#aaff01]" to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ActionButton accent="violet" href="#contact-form" label="İletişime Geç" />
          <ActionButton accent="lime" label="Giriş Yap" />
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              <ActionButton accent="violet" href="#contact-form" label="İletişime Geç" />
              <ActionButton accent="lime" label="Giriş Yap" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ContactHeroVisual() {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[650px]">
      <div className="absolute inset-x-6 top-2 rounded-[34px] border border-[#aaff01]/24 bg-[#111820] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 text-[#101820]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#aaff01] text-black">
              <RadioTower className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/42">contact command center</p>
              <p className="text-lg font-extrabold">Yeni görüşme akışı</p>
            </div>
          </div>
          <span className="rounded-full bg-[#aaff01] px-3 py-1 text-xs font-extrabold text-black">online</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {contactStats.map((stat) => (
            <div key={stat.label} className="rounded-[18px] bg-[#232f3e] px-4 py-5 text-center">
              <p className="text-2xl font-extrabold text-[#aaff01]">{stat.value}</p>
              <p className="mt-1 text-[11px] text-white/55">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] bg-[#0b1016] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-[#aaff01]" />
              Brief sinyalleri
            </span>
            <span className="text-xs text-[#aaff01]">hazır</span>
          </div>
          {[
            ["Hedef", "satış / lead / görünürlük"],
            ["Kanal", "web + reklam + sosyal"],
            ["Ölçüm", "dashboard + rapor"],
          ].map(([label, value]) => (
            <div key={label} className="mb-3 flex items-center justify-between rounded-xl bg-white/7 px-4 py-3 text-sm">
              <span className="text-white/82">{label}</span>
              <span className="font-extrabold text-[#aaff01]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 rounded-[26px] border border-white/10 bg-[#232f3e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <p className="flex items-center gap-2 text-xs text-white/54">
          <Clock3 className="h-4 w-4 text-[#aaff01]" />
          ilk temas
        </p>
        <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">hızlı</p>
      </div>

      <div className="absolute bottom-0 right-0 rounded-[26px] border border-[#aaff01]/25 bg-[#0b1016] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="flex items-center gap-2 text-xs text-white/54">
          <ShieldCheck className="h-4 w-4 text-[#aaff01]" />
          yaklaşım
        </p>
        <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">net</p>
      </div>
    </div>
  );
}

function ContactChannelCard({ title, description, action, icon: Icon, accent }: (typeof contactChannels)[number]) {
  const iconClass = {
    lime: "bg-[#aaff01] text-black",
    violet: "bg-[#8a38f5] text-white",
    cyan: "bg-[#00a2e5] text-black",
  }[accent];

  return (
    <article className="group rounded-[26px] border border-white/10 bg-[#171a20] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-2 hover:border-[#aaff01]/40">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-7 text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-white/68">{description}</p>
      <a className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#aaff01]" href="#contact-form">
        {action}
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    </article>
  );
}

function FormField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-white/78">{label}</span>
      <input
        className="mt-3 h-14 w-full rounded-[12px] border border-white/10 bg-black/70 px-4 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function ContactForm() {
  return (
    <form
      className="rounded-[34px] border border-[#aaff01]/16 bg-[#4d7300] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.34)] md:p-10"
      id="contact-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Ad Soyad" placeholder="Ahmet Emin Kaya" />
        <FormField label="Telefon" placeholder="+90 5xx xxx xx xx" type="tel" />
        <FormField label="E-Posta" placeholder="mail@marka.com" type="email" />
        <FormField label="Marka / Şirket" placeholder="Social Tech" />
        <label className="block">
          <span className="text-sm font-bold text-white/78">İlgilendiğiniz Hizmet</span>
          <select className="mt-3 h-14 w-full rounded-[12px] border border-white/10 bg-black/70 px-4 text-sm text-white outline-none transition focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10">
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-white/78">Bütçe Aralığı</span>
          <select className="mt-3 h-14 w-full rounded-[12px] border border-white/10 bg-black/70 px-4 text-sm text-white outline-none transition focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10">
            <option>Henüz net değil</option>
            <option>10.000 ₺ - 30.000 ₺</option>
            <option>30.000 ₺ - 75.000 ₺</option>
            <option>75.000 ₺ ve üzeri</option>
          </select>
        </label>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-bold text-white/78">Kısaca Hedefiniz</span>
        <textarea
          className="mt-3 min-h-[150px] w-full rounded-[12px] border border-white/10 bg-black/70 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/32 focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10"
          placeholder="Markanız şu an nerede, nereye gitmek istiyor? Kısaca anlatın."
        />
      </label>

      <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-white/80">
        <input className="mt-1 h-5 w-5 accent-[#aaff01]" type="checkbox" />
        <span>KVKK ve gizlilik şartlarını okudum, iletişim kurulmasını kabul ediyorum.</span>
      </label>

      <button
        className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-[12px] bg-black px-6 py-4 text-sm font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#aaff01] hover:text-black"
        type="submit"
      >
        Başvuruyu Gönder
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

function ProcessStep({ title, description, icon: Icon }: (typeof processSteps)[number]) {
  return (
    <article className="rounded-[24px] bg-[#25272b] p-7 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-[#aaff01]">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-6 text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/66">{description}</p>
    </article>
  );
}

function FooterLinkColumn({
  title,
  links,
  activeIndex,
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
          const className = index === activeIndex ? "text-[#aaff01]" : "transition hover:text-[#aaff01]";

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
    <a className="rounded-md border border-white/10 p-2 text-white/72 transition hover:text-[#aaff01]" href="#top">
      {children}
    </a>
  );
}

function SharedFooter() {
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
                <Youtube className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Linkedin className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Mail className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <X className="h-4 w-4" />
              </SocialIconLink>
            </div>
          </div>

          <FooterLinkColumn
            activeIndex={2}
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
              "Amazon ADS Yönetimi",
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

export default function ContactHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <section className="relative isolate flex min-h-[940px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111317" />
        <SiteHeader />

        <div className="relative z-10 mx-auto grid min-h-[790px] w-full max-w-[1540px] items-center gap-14 px-6 pb-24 pt-24 text-center lg:grid-cols-[0.92fr_0.88fr] lg:px-10 lg:pt-28 lg:text-left">
          <div className="mx-auto flex max-w-[760px] flex-col items-center lg:mx-0 lg:items-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1.5 text-xs font-extrabold text-[#121212]">
              <MessageCircle className="h-4 w-4" />
              İletişim
            </span>
            <h1 className="mt-7 max-w-[860px] text-[40px] font-medium leading-tight tracking-tight text-white md:text-[68px]">
              İletişime geçin,
              <span className="block font-extrabold text-[#aaff01]">büyüme sisteminizi konuşalım.</span>
            </h1>
            <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/76 md:text-xl">
              Markanızın hedefini, mevcut yapısını ve büyüme önceliğini anlayıp size tekil hizmet değil,
              <span className="mx-2 font-extrabold text-[#aaff01]">uygulanabilir dijital yol haritası</span>
              sunalım.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <ActionButton accent="lime" className="min-w-[260px]" href="#contact-form" label="Formu Doldur" />
              <ActionButton accent="violet" className="min-w-[260px]" href="#channels" label="İletişim Kanalları" />
            </div>
          </div>

          <ContactHeroVisual />
        </div>
      </section>

      <section className="bg-[#111317] py-24" id="channels">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
              Size En Uygun
              <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">Temas Noktasını</span>
              Seçin
            </h2>
            <p className="mt-7 text-lg leading-8 text-white/72">
              Hızlı bir mesaj, detaylı bir brief ya da planlı bir toplantı. Hangisiyle başlarsanız başlayın, aynı netlikle ilerleriz.
            </p>
          </div>
          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {contactChannels.map((channel) => (
              <ContactChannelCard key={channel.title} {...channel} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#111317_0%,#171717_100%)] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div>
            <span className="inline-flex rounded-full bg-[#aaff01] px-4 py-1 text-xs font-extrabold text-black">Başlangıç Brief'i</span>
            <h2 className="mt-6 text-[34px] font-extrabold leading-tight text-white md:text-[52px]">
              Bize biraz markanızdan bahsedin,
              <span className="block text-[#aaff01]">gerisini birlikte netleştirelim.</span>
            </h2>
            <p className="mt-7 text-lg leading-8 text-white/70">
              Bu form satış baskısı için değil; doğru hizmeti, doğru sırayla önermek için var. Cevabınızdan sonra size daha net sorularla döneriz.
            </p>
            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5">
                <Phone className="mt-1 h-6 w-6 shrink-0 text-[#aaff01]" />
                <div>
                  <h3 className="font-extrabold text-white">Telefon / WhatsApp</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">Hızlı dönüş gerektiren konularda WhatsApp üzerinden ilerleyebiliriz.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5">
                <Mail className="mt-1 h-6 w-6 shrink-0 text-[#aaff01]" />
                <div>
                  <h3 className="font-extrabold text-white">E-posta</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">Brief, teklif ve detaylı proje dokümanları için mail akışı daha sağlıklıdır.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5">
                <MapPin className="mt-1 h-6 w-6 shrink-0 text-[#aaff01]" />
                <div>
                  <h3 className="font-extrabold text-white">Konum Bağımsız Çalışma</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">Toplantı, raporlama ve proje yönetimi dijital sistem üzerinden yürür.</p>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="bg-[#111317] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
              Görüşmeden Sonra
              <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">Ne Olacak?</span>
            </h2>
            <p className="mt-7 text-lg leading-8 text-white/72">
              Belirsiz teklif süreçleri yerine; kısa, ölçülebilir ve uygulanabilir bir başlangıç planı çıkarıyoruz.
            </p>
          </div>
          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {processSteps.map((step) => (
              <ProcessStep key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_center,rgba(170,255,1,0.28),#101316_72%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
          <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
            Hazırsanız,
            <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">ilk konuşmayı</span>
            başlatalım.
          </h2>
          <p className="mx-auto mt-6 max-w-[720px] text-lg leading-8 text-white/72">
            Bize hedefinizi yazın. Size hizmet satmaya değil, doğru sistemi kurmaya odaklanalım.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[260px]" href="#contact-form" label="Formu Aç" />
            <ActionButton accent="violet" className="min-w-[260px]" to="/hizmetler" label="Hizmetleri İncele" />
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
}
