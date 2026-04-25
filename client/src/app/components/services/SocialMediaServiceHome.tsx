import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Facebook,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquareText,
  Package2,
  Palette,
  Reply,
  Users,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import stepMeetingImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.webp";
import stepAccountImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.webp";
import stepDashboardImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import socialStartIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import socialProIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import socialBrandIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";
import socialFacebookIcon from "../../../assets/e85560ced236146567089e9e207b21cb74f94c95.png";
import socialInstagramIcon from "../../../assets/e0029c37d99a6a8e289a793abaaf02984f19717b.png";
import socialLinkedinIcon from "../../../assets/1c1a20c7d8c2a14e8d97dd68e316412e56d2450f.png";
import socialYoutubeIcon from "../../../assets/f89bf8640ce3923c3ad0dcc795f0662e2923a50f.png";
import socialTiktokIcon from "../../../assets/7d47dd30db922c5fc58659809a3e1d956b9dd2a4.png";
import socialWhatsappIcon from "../../../assets/100df1ea0b5537c2a776132fa6b5f2184d8ffc8e.png";
import socialSnapchatIcon from "../../../assets/ee893046d93b786d05f5b1cb76d451b4f7a0f95c.png";
import socialPinterestIcon from "../../../assets/9fc2a7e67129638bedcf545812f1b84bbfbdb7c9.png";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import SiteHeader from "../site/SiteHeader";
import { getFooterLinkTarget } from "../site/footerLinks";

type JourneyCardData = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  tone: "lime" | "light" | "violet";
};

type PackageData = {
  name: string;
  description: string;
  price: string;
  suffix?: string;
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

const socialIcons = [
  socialFacebookIcon,
  socialInstagramIcon,
  socialLinkedinIcon,
  socialYoutubeIcon,
  socialTiktokIcon,
  socialWhatsappIcon,
  socialSnapchatIcon,
  socialPinterestIcon,
];

const journeyCards: JourneyCardData[] = [
  {
    eyebrow: "Üye Olun ve",
    title: "Önce Ekibimizle Bir Toplantı Yapın!",
    description:
      "Sistem üzerinden marka ya da influencer hesabınızı oluşturun ve sizin için oluşturulan ekibinizle hemen bir toplantı planlayın.",
    image: stepMeetingImage,
    tone: "lime",
  },
  {
    eyebrow: "Toplantıdan sonra",
    title: "Marka hesabınız ile Satın Alım Yapın!",
    description:
      "Toplantı sonrası sistemimizi kullanarak sizler için oluşturulmuş olan linkten satın alımınızı gerçekleştirin.",
    image: stepAccountImage,
    tone: "light",
  },
  {
    eyebrow: "Her Türlü Paylaşımı",
    title: "Sistem Üzerinden Onaylayın, Paylaşalım!",
    description:
      "Konuşulan talepler doğrultusunda hazırlanan içerikler dashboard'unuzda sunulsun; ister onaylayın ister revize isteyin.",
    image: stepDashboardImage,
    tone: "violet",
  },
];

const featureTiles = [
  { label: "Özel Tasarımlar", icon: Palette },
  { label: "DM Yanıtlanma", icon: MessageSquareText },
  { label: "Reklam Yönetimi", icon: Megaphone },
  { label: "Yorumları Cevaplama", icon: Reply },
  { label: "Rakip Analizleri", icon: BarChart3 },
  { label: "Toplantılar", icon: Users },
  { label: "Paylaşım Takvimi", icon: CalendarRange },
  { label: "Özel Raporlar", icon: BarChart3 },
  { label: "Özel Dashboard", icon: LayoutDashboard },
];

const packageCards: PackageData[] = [
  {
    name: "Social Start Paketi",
    description:
      "İşletmenizin sosyal medyadaki ilk adımını sağlam atması için tasarlandı. Düzenli içerik, doğru mesaj ve profesyonel görünümle markanızı dijital dünyaya hazır hale getirir.",
    price: "17.499 ₺",
    suffix: "/ ay",
    note: "Sosyal medya düzenli, temiz ve profesyonel görünür.",
    cta: "Başlamaya Hazırım",
    icon: socialStartIcon,
    accent: "cyan",
    features: [
      "Platform seçimi & kurulum",
      "Aylık içerik planı (12-16 post)",
      "Görsel tasarım (şablon + markaya uygun)",
      "Caption & hashtag stratejisi",
      "Haftalık paylaşım",
      "Temel DM & yorum takibi",
      "Aylık performans özeti",
    ],
  },
  {
    name: "Social Pro Paketi",
    description:
      "Sosyal medya ve içerik süreçlerinizi büyüme odaklı bir sisteme dönüştürür. Etkileşimi artıran içerikler ve detaylı analizlerle markanızı bir üst seviyeye taşır.",
    price: "27.500 ₺",
    suffix: "/ ay",
    note: "Marka konuşulur, etkileşim artar, topluluk oluşur.",
    cta: "Büyüme Görüşmesi",
    icon: socialProIcon,
    accent: "lime",
    badge: "En çok tercih edilen",
    features: [
      "Social Start içeriğinin tamamı",
      "Aylık 20-24 içerik",
      "Reel & video içerik kurgusu",
      "Etkileşim odaklı içerik konseptleri",
      "DM & yorum yönetimi",
      "Rakip & trend analizi",
      "Story paylaşımları",
      "Aylık detaylı rapor",
    ],
  },
  {
    name: "Social Brand+ Plus",
    description:
      "Marka algısı, itibar ve sürdürülebilir büyüme için tasarlandı. Sosyal medyayı markanızın en güçlü iletişim kanalına dönüştürür.",
    price: "İletişime Geçin*",
    note: "Sosyal medya bir vitrin değil, güçlü bir marka kanalıdır.",
    cta: "Özel Ölçekleme Görüşmesi",
    icon: socialBrandIcon,
    accent: "violet",
    features: [
      "Social Pro içeriğinin tamamı",
      "Aylık 30+ içerik",
      "Story & highlight yönetimi",
      "Kriz & itibar yönetimi",
      "Influencer / iş birliği danışmanlığı",
      "Reklam içeriği için kreatif destek",
      "Haftalık performans takibi",
      "Aylık strateji toplantısı",
    ],
  },
];

function SectionHeading({
  prefix,
  highlight,
  center = false,
  highlightClassName = "bg-[#b5ff15] text-black",
}: {
  prefix: string;
  highlight: string;
  center?: boolean;
  highlightClassName?: string;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-[30px] font-bold leading-tight text-white md:text-[42px]">
        {prefix}
        <span className={`mx-2 inline-block rotate-[-1deg] px-3 py-1 ${highlightClassName}`}>
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
          const className = index === 1 ? "text-[#b5ff15]" : "transition hover:text-[#b5ff15]";

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

function JourneyCard({ eyebrow, title, description, image, tone }: JourneyCardData) {
  const tones = {
    lime: "bg-[#b5ff15] text-[#13170a]",
    light: "bg-[#d9d9d9] text-[#181818]",
    violet: "bg-[#8a38f5] text-white",
  }[tone];

  const muted = tone === "violet" ? "text-white/76" : "text-[#171717]/72";

  return (
    <article className={`rounded-lg p-7 ${tones}`}>
      <p className="text-lg font-medium">{eyebrow}</p>
      <h3 className="mt-4 text-[26px] font-bold leading-tight">{title}</h3>
      <p className={`mt-5 text-sm leading-6 ${muted}`}>{description}</p>
      <div className="mt-8 overflow-hidden rounded-lg bg-black/10">
        <img alt={title} className="h-[240px] w-full object-cover" src={image} />
      </div>
    </article>
  );
}

function FeatureTile({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/12 px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-white/10 p-3 text-white">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{label}</h3>
      </div>
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
        {suffix ? <span className={`pb-1 text-lg font-bold ${tones.price}`}>{suffix}</span> : null}
      </div>
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>
        *Aylık • Aylık sözleşmeli • İstediğiniz zaman iptal
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

export default function SocialMediaServiceHome() {
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
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">Sosyal Medya</span>
          <h1 className="mt-7 max-w-[940px] text-[34px] font-bold leading-tight text-white md:text-[60px]">
            Sosyal Medya Yönetimini
            <br />
            Büyüme Sistemine Dönüştürün
          </h1>
          <p className="mt-7 max-w-[720px] text-base leading-8 text-white/78 md:text-xl">
            Sosyal medyayı,
            <span className="mx-2 font-semibold text-[#b5ff15]">marka bilinirliğinden satışa giden bir büyüme</span>
            sistemine dönüştürüyoruz.
          </p>
          <ActionButton accent="lime" className="mt-10" href="#packages" label="Paketleri İnceleyin" />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            {socialIcons.map((icon, index) => (
              <a key={index} className="transition hover:-translate-y-1" href="#packages">
                <img alt="" className="h-8 w-8 object-contain" src={icon} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#161616] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-8 px-6 lg:grid-cols-3 lg:px-10">
          {journeyCards.map((card) => (
            <JourneyCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#08090b_0%,#672bb5_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading
            center
            highlight="Hizmet Özellikleri"
            highlightClassName="bg-transparent px-0 text-[#b5ff15]"
            prefix="Sosyal Medya Paketinin"
          />
          <p className="mx-auto mt-8 max-w-[820px] text-center text-lg leading-8 text-white/72">
            Satın alacağınız sosyal medya paketinin özellikleri aşağıdaki ihtiyaçlara göre oluşturulmuştur.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureTiles.map((tile) => {
              const Icon = tile.icon;

              return <FeatureTile key={tile.label} icon={<Icon className="h-6 w-6" />} label={tile.label} />;
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#151515] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/72">
            Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için
            sayfamızı ziyaret etmeyi unutmayın!
          </p>

          <PaymentLogos />

          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packageCards.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>

          <div className="mt-12 text-center text-base leading-8 text-white/72 md:text-lg">
            <p>
              Sosyal medyada hiç yoksanız <span className="font-bold text-[#00a2e5]">start</span>, sosyal medyanızı büyütmek için
              <span className="mx-2 font-bold text-[#b5ff15]">pro</span>, marka algısı için
              <span className="mx-2 font-bold text-[#8a38f5]">brand+</span> tercih etmelisiniz.
            </p>
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
              links={["Growth & Hub", "Sosyal Medya", "Dijital Pazarlama", "Web Sitesi Geliştirme", "Mobil Uygulama Geliştirme", "Reklam Yönetimi", "Web Teknik Destek"]}
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
