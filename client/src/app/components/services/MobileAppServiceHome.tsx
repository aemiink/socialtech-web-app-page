import { Link } from "react-router";
import {
  BellRing,
  CloudCog,
  Code2,
  Facebook,
  Fingerprint,
  Gauge,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  MonitorSmartphone,
  RadioTower,
  ShieldCheck,
  Smartphone,
  Store,
  Youtube,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import starterPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import growthPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";

const productLayers = [
  {
    title: "iOS & Android Deneyimi",
    description: "Markanızın ana aksiyonlarını sade, hızlı ve kullanıcının eline yakışan bir mobil akışa dönüştürürüz.",
    icon: Smartphone,
  },
  {
    title: "PWA & Hibrit Mimari",
    description: "Bütçe ve hız hedefinize göre native, hibrit veya PWA seçeneklerini doğru yerde konumlandırırız.",
    icon: MonitorSmartphone,
  },
  {
    title: "Panel & Yönetim Katmanı",
    description: "İçerik, kullanıcı, sipariş, talep veya bildirimleri tek panelden yönetebileceğiniz altyapı kurarız.",
    icon: CloudCog,
  },
  {
    title: "Bildirim & Retention",
    description: "Push, segmentasyon ve tekrar kullanım akışlarıyla uygulamayı indirilip unutulan bir ikon olmaktan çıkarırız.",
    icon: BellRing,
  },
];

const capabilityCards = [
  { title: "Kullanıcı Hesabı", description: "Giriş, üyelik, rol ve izin akışları.", icon: Fingerprint },
  { title: "App Store Yayını", description: "Yayın hazırlığı, sürüm notu ve store kontrolü.", icon: Store },
  { title: "API Entegrasyonları", description: "CRM, ödeme, stok, ERP veya özel servis bağlantıları.", icon: Layers3 },
  { title: "Performans Takibi", description: "Event, crash, funnel ve davranış metrikleri.", icon: Gauge },
  { title: "Güvenlik Katmanı", description: "Veri, oturum ve erişim güvenliği için temiz mimari.", icon: ShieldCheck },
  { title: "Canlı Gelişim", description: "Yayından sonra sprint bazlı iyileştirme ve büyütme.", icon: RadioTower },
];

const processSteps = [
  {
    step: "01",
    title: "Ürün Haritası",
    description: "Fikri, kullanıcı aksiyonlarını ve ilk canlı sürüm kapsamını birlikte netleştiriyoruz.",
  },
  {
    step: "02",
    title: "UX Akışı",
    description: "Ekranları değil; kullanıcının ilk açılıştan dönüşüme kadar ilerlediği rotayı tasarlıyoruz.",
  },
  {
    step: "03",
    title: "Geliştirme",
    description: "Panel, API, app ve analitik katmanlarını tek sistem gibi çalışacak şekilde kuruyoruz.",
  },
  {
    step: "04",
    title: "Yayın & Ölçek",
    description: "Store süreçlerini tamamlayıp davranış verisine göre yeni sürümleri planlıyoruz.",
  },
];

const packages = [
  {
    name: "Başlangıç App Paketi",
    description: "Fikrini hızlıca test etmek isteyen markalar için yalın mobil ürün başlangıcı.",
    price: "19.900 ₺",
    suffix: "/ proje",
    note: "*Tek seferlik başlangıç kapsamı.",
    cta: "Başlangıç Planı Al",
    icon: starterPackageIcon,
    accent: "cyan" as const,
    features: [
      "4-6 temel ekran tasarımı",
      "Kullanıcı giriş / kayıt akışı",
      "Basit yönetim paneli",
      "Tek platform yayın hazırlığı",
      "Temel event ölçümleme",
    ],
  },
  {
    name: "Ürünleşen App Paketi",
    description: "İlk sürümden ciddi ürüne geçmek isteyen ekipler için panel, API ve büyüme altyapısı.",
    price: "44.900 ₺",
    suffix: "/ proje",
    note: "*Kapsam, entegrasyon yoğunluğuna göre netleştirilir.",
    cta: "Ürün Görüşmesi",
    icon: growthPackageIcon,
    accent: "lime" as const,
    badge: "En Çok Tercih Edilen",
    features: [
      "UX akışı ve ekran mimarisi",
      "iOS / Android hibrit geliştirme",
      "Admin panel ve API katmanı",
      "Push bildirim altyapısı",
      "App Store / Play Store yayına hazırlık",
      "Crash, event ve funnel takibi",
      "2 sprint iyileştirme desteği",
    ],
  },
  {
    name: "Scale App Paketi",
    description: "Yoğun kullanıcı, özel entegrasyon ve uzun vadeli ürün geliştirme ihtiyacı olan markalar için.",
    price: "İletişime Geçin*",
    suffix: "",
    note: "*Kurumsal kapsam, güvenlik ve sprint yapısına göre planlanır.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: scalePackageIcon,
    accent: "violet" as const,
    features: [
      "Özel mobil ürün stratejisi",
      "Çoklu rol ve yetki yönetimi",
      "Gelişmiş entegrasyon mimarisi",
      "Performans ve güvenlik optimizasyonu",
      "Sürüm yol haritası ve sprint yönetimi",
      "Ürün analitiği ve büyüme raporu",
    ],
  },
];

function HighlightTitle({
  prefix,
  highlight,
  suffix,
  center = false,
}: {
  prefix: string;
  highlight: string;
  suffix?: string;
  center?: boolean;
}) {
  return (
    <h2 className={`${center ? "mx-auto text-center" : ""} max-w-[920px] text-[32px] font-extrabold leading-tight text-white md:text-[48px]`}>
      {prefix}{" "}
      <span className="inline-block rotate-[-1.5deg] bg-[#aaff01] px-2 text-[#101406]">
        {highlight}
      </span>
      {suffix ? ` ${suffix}` : ""}
    </h2>
  );
}

function PhoneVisual() {
  return (
    <div className="relative mx-auto h-[620px] w-full max-w-[540px]">
      <div className="absolute inset-x-10 top-10 h-[520px] rounded-[54px] border border-[#aaff01]/28 bg-[linear-gradient(145deg,rgba(12,16,19,0.98),rgba(23,31,35,0.92))] p-4 shadow-[0_40px_120px_rgba(170,255,1,0.12)]">
        <div className="h-full rounded-[42px] border border-white/10 bg-[#050607] p-5">
          <div className="mx-auto h-2 w-24 rounded-full bg-white/16" />
          <div className="mt-9 rounded-[26px] border border-[#aaff01]/20 bg-[#aaff01] p-5 text-black">
            <p className="text-xs font-black uppercase tracking-[0.28em]">Social App</p>
            <h3 className="mt-4 text-3xl font-black leading-tight">Bugünkü hedefin hazır.</h3>
            <p className="mt-3 text-sm font-semibold text-black/70">3 görev, 2 bildirim, 1 dönüşüm fırsatı.</p>
          </div>
          <div className="mt-5 grid gap-3">
            {["Yeni kullanıcı akışı", "Push kampanyası", "Satış event takibi"].map((item, index) => (
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4" key={item}>
                <div>
                  <p className="text-sm font-bold text-white">{item}</p>
                  <p className="mt-1 text-xs text-white/45">Sprint {index + 1}</p>
                </div>
                <span className="rounded-full bg-[#aaff01]/15 px-3 py-1 text-xs font-black text-[#aaff01]">aktif</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["7.2k", "%41", "4.8"].map((metric, index) => (
              <div className="rounded-2xl bg-white/[0.06] p-4 text-center" key={metric}>
                <p className="text-xl font-black text-[#aaff01]">{metric}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">{["oturum", "retention", "puan"][index]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute left-0 top-28 rounded-[24px] border border-white/10 bg-[#171c20]/90 p-4 shadow-2xl backdrop-blur">
        <BellRing className="h-7 w-7 text-[#aaff01]" />
        <p className="mt-3 text-sm font-extrabold text-white">Push hazır</p>
      </div>
      <div className="absolute bottom-28 right-0 rounded-[24px] border border-[#8a38f5]/35 bg-[#22123d]/90 p-5 shadow-2xl backdrop-blur">
        <Code2 className="h-8 w-8 text-[#c699ff]" />
        <p className="mt-3 text-sm font-extrabold text-white">API bağlı</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon }: (typeof productLayers)[number]) {
  return (
    <article className="rounded-[28px] border border-[#8a38f5]/70 bg-[#0a0c10] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#aaff01]/70">
      <Icon className="h-12 w-12 text-[#aaff01]" />
      <h3 className="mt-7 text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-white/68">{description}</p>
    </article>
  );
}

function CapabilityCard({ title, description, icon: Icon }: (typeof capabilityCards)[number]) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.055] p-6">
      <Icon className="h-9 w-9 text-[#aaff01]" />
      <h3 className="mt-5 text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
    </article>
  );
}

function PackageCard({ pack }: { pack: (typeof packages)[number] }) {
  const palette = {
    cyan: {
      shell: "bg-[linear-gradient(180deg,#139fca,#13252b)] text-white",
      button: "border-[#43d9ff]/60 text-[#43d9ff]",
      note: "text-white/58",
    },
    lime: {
      shell: "bg-[linear-gradient(180deg,#aaff01,#4f7404)] text-[#11160b]",
      button: "border-black/20 bg-black/18 text-[#11160b]",
      note: "text-black/70",
    },
    violet: {
      shell: "bg-[linear-gradient(180deg,#8a38f5,#1a1720)] text-white",
      button: "border-[#c699ff]/50 text-[#c699ff]",
      note: "text-white/58",
    },
  }[pack.accent];

  const isLime = pack.accent === "lime";

  return (
    <article className={`relative overflow-hidden rounded-[26px] p-8 shadow-[0_26px_80px_rgba(0,0,0,0.28)] ${palette.shell}`}>
      {pack.badge ? (
        <div className="absolute right-[-46px] top-8 rotate-45 bg-[#1d1d1d] px-12 py-2 text-center text-xs font-extrabold text-[#aaff01]">
          {pack.badge}
        </div>
      ) : null}
      <img alt="" className="h-12 w-12 object-contain" src={pack.icon} />
      <h3 className="mt-8 text-2xl font-black italic">{pack.name}</h3>
      <p className={`mt-5 text-sm leading-7 ${isLime ? "text-black/72" : "text-white/72"}`}>{pack.description}</p>
      <div className="mt-8">
        <span className="text-5xl font-black tracking-tight">{pack.price}</span>
        {pack.suffix ? <span className="ml-2 text-xl font-black">{pack.suffix}</span> : null}
      </div>
      <p className={`mt-2 text-xs font-bold ${isLime ? "text-black/70" : "text-white/62"}`}>{pack.note}</p>
      <ActionButton
        accent={pack.accent === "violet" ? "violet" : pack.accent === "cyan" ? "cyan" : "lime"}
        className={`mt-7 w-full justify-center ${palette.button}`}
        href="#footer"
        label={pack.cta}
      />
      <ul className="mt-9 space-y-4">
        {pack.features.map((feature) => (
          <li className={`flex items-start gap-3 text-sm font-semibold leading-6 ${isLime ? "text-black/78" : "text-white/78"}`} key={feature}>
            <PackageFeatureBullet className="mt-0.5 h-5 w-5 shrink-0" tone={isLime ? "dark" : "light"} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function FooterLinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-extrabold text-white">{title}</h4>
      <div className="mt-6 flex flex-col gap-3 text-sm text-white/55">
        {links.map((link) => {
          const target = getFooterLinkTarget(link);
          const className = "transition hover:text-[#aaff01]";

          return target.to ? (
            <Link className={className} key={link} to={target.to}>
              {link}
            </Link>
          ) : (
            <a className={className} href={target.href} key={link}>
              {link}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SharedFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-14" id="footer">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.8fr_0.9fr_0.9fr]">
          <div>
            <img alt="Social Tech" className="h-12 w-auto" src={logoImage} />
            <p className="mt-7 max-w-[360px] text-sm leading-7 text-white/55">
              Pazarlama bütçenizden daha fazla sonuç almak için teknoloji, tasarım ve büyüme sistemlerini birlikte kuruyoruz.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-white/72">
              {[Linkedin, Instagram, Youtube, Facebook, Mail].map((Icon, index) => (
                <a className="rounded-md border border-white/10 p-2 transition hover:text-[#aaff01]" href="#top" key={index}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <FooterLinkColumn links={["Anasayfa", "Müşteriler", "Bize Ulaşın", "Kariyer & Staj", "Portfolyo & Projeler", "Bloglar"]} title="Faydalı Linkler" />
          <FooterLinkColumn links={["Growth & Hub", "Sosyal Medya", "Dijital Pazarlama", "Web Uygulaması Geliştirme", "Mobil Uygulama Geliştirme", "Web Teknik Destek"]} title="Ürün ve Hizmetler" />
          <div className="flex flex-col gap-4">
            <ActionButton accent="violet" label="Online Toplantı Planla" />
            <ActionButton accent="lime" label="WhatsApp Destek Hattı" />
            <ActionButton accent="cyan" label="Dijital Yolda Büyüme" />
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

export default function MobileAppServiceHome() {
  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <SiteHeader />
      <section className="relative isolate flex min-h-[940px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111317" />

        <div className="relative z-10 mx-auto grid min-h-[900px] w-full max-w-[1540px] items-center gap-14 px-6 pb-24 pt-28 text-center lg:grid-cols-[0.94fr_0.9fr] lg:px-10 lg:pt-32 lg:text-left">
          <div className="mx-auto flex max-w-[760px] flex-col items-center lg:mx-0 lg:items-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1.5 text-xs font-extrabold text-[#11160b]">
              <Smartphone className="h-4 w-4" />
              Mobil Uygulama
            </span>
            <h1 className="mt-7 max-w-[900px] text-[40px] font-medium leading-tight tracking-tight text-white md:text-[68px]">
              Sadece app değil,
              <span className="block font-extrabold text-[#aaff01]">kullanıcı alışkanlığı inşa ediyoruz.</span>
            </h1>
            <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/76 md:text-xl">
              Mobil uygulamanızı fikirden yayına; panel, API, bildirim, analitik ve büyüme döngüsüyle birlikte tasarlıyoruz. Amacımız indirilen bir uygulama değil,
              <span className="mx-2 font-extrabold text-[#aaff01]">tekrar tekrar kullanılan bir ürün.</span>
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <ActionButton accent="lime" className="min-w-[260px]" href="#packages" label="Paketleri İncele" />
              <ActionButton accent="violet" className="min-w-[260px]" href="#system" label="Sistemi Gör" />
            </div>
          </div>

          <PhoneVisual />
        </div>
      </section>

      <section className="bg-[#0b0d11] py-24" id="system">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Ürün Sistemidir" prefix="Mobil Uygulama Bir" />
          <p className="mx-auto mt-8 max-w-[840px] text-center text-lg leading-8 text-white/68">
            App tarafını yalnızca ekran tasarımı veya kodlama işi gibi görmüyoruz. Kullanıcı, veri, bildirim, panel ve büyüme hedefi aynı masada planlanır.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {productLayers.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#111317,#2a1747_54%,#7f2ff2)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Kuruyoruz?" prefix="Hangi Katmanları" />
          <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilityCards.map((card) => (
              <CapabilityCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111317] py-24">
        <div className="mx-auto w-full max-w-[1540px] rounded-[34px] border border-white/10 bg-black p-8 shadow-[0_30px_100px_rgba(0,0,0,0.32)] lg:p-12">
          <HighlightTitle highlight="Çalışıyoruz?" prefix="Nasıl" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <article className="rounded-[22px] bg-[#222629] p-7" key={step.title}>
                <span className="text-sm font-black text-[#aaff01]">{step.step}</span>
                <h3 className="mt-5 text-xl font-extrabold text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/62">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[820px] text-center text-lg leading-8 text-white/68">
            Mobil ürünün kapsamı hedefe göre değişir. Bu yüzden paketleri başlangıç, ürünleşme ve ölçekleme ihtiyacına göre ayırdık.
          </p>
          <div className="mt-10">
            <PaymentLogos />
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {packages.map((pack) => (
              <PackageCard key={pack.name} pack={pack} />
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-[920px] text-center text-lg font-semibold leading-8 text-white/78">
            Eğer hangi paket size uygun bilmiyorsanız hemen
            <a className="mx-2 font-black text-[#aaff01] underline" href="#footer">
              formu
            </a>
            doldurun, beraber karar verelim.
          </p>
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(170,255,1,0.24),transparent_34%),linear-gradient(180deg,#111317,#8be800)] py-24">
        <div className="mx-auto w-full max-w-[1100px] px-6 text-center lg:px-10">
          <h2 className="text-[34px] font-extrabold leading-tight text-white md:text-[48px]">
            App fikrinizi rafta bekletmeyelim.
            <span className="block text-[#11160b]">İlk sürümü birlikte çıkaralım.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[740px] text-lg leading-8 text-[#162005]/78">
            Sizi tanımadan teklif sunmuyoruz. Önce fikri, kullanıcıyı ve minimum canlıya çıkış kapsamını konuşuyoruz.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <ActionButton accent="violet" className="min-w-[240px]" to="/iletisim" label="Ücretsiz Ön Görüşme" />
            <ActionButton accent="lime" className="min-w-[240px]" href="#packages" label="Paketleri İncele" />
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
}
