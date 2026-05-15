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
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import starterPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import growthPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";

export const productLayers = [
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

export const capabilityCards = [
  { title: "Kullanıcı Hesabı", description: "Giriş, üyelik, rol ve izin akışları.", icon: Fingerprint },
  { title: "App Store Yayını", description: "Yayın hazırlığı, sürüm notu ve store kontrolü.", icon: Store },
  { title: "API Entegrasyonları", description: "CRM, ödeme, stok, ERP veya özel servis bağlantıları.", icon: Layers3 },
  { title: "Performans Takibi", description: "Event, crash, funnel ve davranış metrikleri.", icon: Gauge },
  { title: "Güvenlik Katmanı", description: "Veri, oturum ve erişim güvenliği için temiz mimari.", icon: ShieldCheck },
  { title: "Canlı Gelişim", description: "Yayından sonra sprint bazlı iyileştirme ve büyütme.", icon: RadioTower },
];

export const processSteps = [
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

export const packages = [
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

export function HighlightTitle({
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

export function PhoneVisual() {
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

export function FeatureCard({ title, description, icon: Icon }: (typeof productLayers)[number]) {
  return (
    <article className="rounded-[28px] border border-[#8a38f5]/70 bg-[#0a0c10] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#aaff01]/70">
      <Icon className="h-12 w-12 text-[#aaff01]" />
      <h3 className="mt-7 text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-white/68">{description}</p>
    </article>
  );
}

export function CapabilityCard({ title, description, icon: Icon }: (typeof capabilityCards)[number]) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.055] p-6">
      <Icon className="h-9 w-9 text-[#aaff01]" />
      <h3 className="mt-5 text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
    </article>
  );
}

export function PackageCard({ pack }: { pack: (typeof packages)[number] }) {
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
        to="/iletisim#contact-form"
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


export { ActionButton, BellRing, CloudCog, Code2, Facebook, Fingerprint, Gauge, HeroBackdrop, Instagram, Layers3, Link, Linkedin, Mail, MonitorSmartphone, PackageFeatureBullet, PaymentLogos, RadioTower, ShieldCheck, Smartphone, Store, Youtube, getFooterLinkTarget, growthPackageIcon, logoImage, scalePackageIcon, starterPackageIcon };
