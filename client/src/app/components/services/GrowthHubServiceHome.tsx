import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Package2,
  X,
  Youtube,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import PackageFeatureBullet from "../site/PackageFeatureBullet";
import PaymentLogos from "../site/PaymentLogos";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import meetingImage from "../../../assets/9f6ffebad46d464dd5e391ce71a41f2027994a17.webp";
import accountImage from "../../../assets/2691e81d30a6e9a87ebef5c9c67236616cd226ae.webp";
import dashboardImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import nextStepImage from "../../../assets/1e5af86c00392bb0fe92a555e4fb3ee9c958a179.webp";
import flashIcon from "../../../assets/7f91547c4b7f13742e55cdac63b5c8ef8f7abc39.png";
import growthIcon from "../../../assets/82312ba45b1ac3e92f1b25a1dca8320c66ded7dd.png";
import targetIcon from "../../../assets/656b5acd143474c028060d2be3e3d099e011b7c5.png";
import launchPackageIcon from "../../../assets/10b5332e3454775fe1e3e6d7a10d4f5e09ccd17d.png";
import growthPackageIcon from "../../../assets/2519a3a2e3cc0d11e6fbd9187b747dfca3581898.png";
import scalePackageIcon from "../../../assets/a5987d169558dd87ca74caf7bcc1512b1706b5e7.png";

const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

const journeyCards = [
  {
    eyebrow: "Üye Olun ve",
    title: "Önce Ekibimizle Bir Toplantı Yapın!",
    description:
      "Sistem üzerinden marka/influencer hesabınızı oluşturun ve sizin için oluşturulan ekibimizle hemen bir toplantı planlayın.",
    image: meetingImage,
    tone: "lime" as const,
  },
  {
    eyebrow: "Toplantıdan sonra",
    title: "Marka hesabınız ile Satın Alım Yapın!",
    description:
      "Toplantı sonrası sistemimizi kullanarak sizler için oluşturulmuş olan linkten satın alımınızı gerçekleştirin.",
    image: accountImage,
    tone: "light" as const,
  },
  {
    eyebrow: "Her Türlü Paylaşımı",
    title: "Sistem Üzerinden Onaylayın, Paylaşalım!",
    description:
      "Toplantıda konuşulan talepler doğrultusunda hazırlanan içeriklerinizi sistem üzerinden onaylayın.",
    image: dashboardImage,
    tone: "violet" as const,
  },
];

const stats = [
  {
    title: "Uzun Vade = Doğru Sonuç",
    body:
      "Rekabetçi stratejiler uzun vadelidir ve sabır gerektirir. Gerçek bir marka olmanın yolu ise değer yaratmak ve bu değeri doğru şekilde hedef kitlenize sunabilen bir partner ile çalışmak.",
  },
  {
    title: "%64",
    body: "B2B müşterilerinin %64’ü daha önceden satın alım yaptıkları firmaları tercih ettiğini söylüyor.",
  },
  {
    title: "%78",
    body: "Günümüzdeki B2B satışlarının %78’lik bir oranı dijital etkileşimler üzerinden gerçekleşiyor.",
  },
];

const channelCards = [
  {
    title: "Markanızı Güçlendirin!",
    description: "Dijital pazarlama ile markanıza güçlendirin ve sektörel rekabet gücünüzü artırın.",
    icon: flashIcon,
  },
  {
    title: "Satışlarınızı Arttırın",
    description: "Dijital pazarlama yoluyla daha çok ürün ve hizmet satın, verilerin gücünü kullanın.",
    icon: growthIcon,
  },
  {
    title: "Hedef Kitlenize Ulaşın",
    description: "Dijital pazarlama ile hedef kitlenizi anlayın ve iletişim bağınızı güçlendirin.",
    icon: targetIcon,
  },
];

const packageCards = [
  {
    name: "Launch Paketi",
    description:
      "İşletmenizi dijital dönüşümün ilk adımına atlatın. Sosyal medya ve yönetimi, pazarlama dünyasına girişinizi yapın.",
    price: "34.000 ₺",
    suffix: "/ ay",
    cta: "Tanışma Görüşmesi",
    note:
      "Launch paketi hızlı ölçekleme için değil, sağlam bir dijital temel oluşturmak için tasarlanmıştır.",
    accent: "cyan" as const,
    icon: launchPackageIcon,
    features: [
      "Strateji & kurulum",
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
    cta: "Büyüme Görüşmesi",
    note:
      "Büyümeyi şansa bırakmak istemeyen markalar için. Strateji, içerik ve reklam tek sistemde birleşir.",
    accent: "lime" as const,
    featured: true,
    badge: "En Çok Tercih Edilen",
    icon: growthPackageIcon,
    features: [
      "Strateji ve yönetim",
      "Sosyal medya yönetimi (3 kanal)",
      "16 içerik + performans takibi",
      "Reklam yönetimi",
      "Tasarım ve kreatif destek",
      "Web dönüşüm desteği",
      "Raporlama ve iletişim",
    ],
  },
  {
    name: "Scale Paketi",
    description:
      "Artık sadece büyümek değil, büyümeyi yönetmek gerekiyor. Scale paketi markanız için sürdürülebilir ölçekleme sunar.",
    price: "İletişime Geçin*",
    cta: "Özel Ölçekleme Görüşmesi",
    note:
      "Scale paketi her marka için uygun değildir. Yüksek hacimli ve sürdürülebilir büyüme hedefleyen markalar için tasarlanmıştır.",
    accent: "violet" as const,
    icon: scalePackageIcon,
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

function SectionTitle({
  prefix,
  highlight,
  suffix,
  center = true,
  accent = "lime",
}: {
  prefix: string;
  highlight: string;
  suffix?: string;
  center?: boolean;
  accent?: "lime" | "violet";
}) {
  return (
    <h2 className={`text-[30px] font-extrabold leading-tight text-white md:text-[42px] ${center ? "text-center" : ""}`}>
      {prefix}{" "}
      <span className={`inline-block -rotate-1 px-3 py-1 text-black ${accent === "lime" ? "bg-[#b5ff15]" : "bg-[#8a38f5]"}`}>
        {highlight}
      </span>
      {suffix ? ` ${suffix}` : ""}
    </h2>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate flex items-center justify-center overflow-hidden bg-[#050607]">
      <div className="relative mx-auto min-h-[520px] w-full max-w-none overflow-hidden md:min-h-[590px]">
        <HeroBackdrop fadeColor="#060708" />
        <div className="relative z-10 mx-auto flex min-h-[520px] w-full max-w-[1540px] flex-col items-center justify-center px-6 text-center md:min-h-[590px] lg:px-10">
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-extrabold text-[#102000]">
            Growth & Hub
          </span>
          <h1 className="mt-6 max-w-[980px] text-[34px] font-extrabold leading-tight text-white md:text-[50px]">
            Dijital Büyümenin Gücünü Keşfedin
          </h1>
          <p className="mt-5 max-w-[740px] text-base leading-7 text-white/82 md:text-xl">
            B2B startup’lar ve içerik üreticileri için,
            <span className="mx-2 font-extrabold text-[#b5ff15]">ölçülebilir büyüme sağlayan dijital pazarlama</span>
            stratejileri.
          </p>
          <ActionButton accent="lime" className="mt-10 min-w-[250px]" href="#packages" label="Paketleri İnceleyin" />
        </div>
      </div>
    </section>
  );
}

function JourneyCard({ eyebrow, title, description, image, tone }: (typeof journeyCards)[number]) {
  const shell = {
    lime: "bg-[#6fa000] text-black",
    light: "bg-[#a7a7a7] text-[#1b1b1b]",
    violet: "bg-[#642baa] text-white",
  }[tone];
  const body = tone === "violet" ? "text-white/76" : "text-black/72";

  return (
    <article className={`rounded-[12px] border border-white/12 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.24)] ${shell}`}>
      <p className="text-lg font-medium opacity-80">{eyebrow}</p>
      <h2 className="mt-3 text-[26px] font-extrabold leading-tight md:text-[30px]">{title}</h2>
      <p className={`mt-5 text-sm leading-6 ${body}`}>{description}</p>
      <img alt={title} className="mt-9 h-[210px] w-full rounded-[10px] object-cover" src={image} />
    </article>
  );
}

function StatCard({ title, body }: (typeof stats)[number]) {
  const isFormula = title.includes("=");

  return (
    <article className="rounded-[10px] border border-white/12 bg-black p-7 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <h3 className="text-[26px] font-extrabold leading-tight md:text-[32px]">
        {isFormula ? (
          <>
            <span className="text-[#b5ff15]">Uzun Vade</span>
            <span className="text-white"> = </span>
            <span className="text-[#8a38f5]">Doğru Sonuç</span>
          </>
        ) : (
          <span className="text-[#b5ff15]">{title}</span>
        )}
      </h3>
      <p className="mt-4 text-sm leading-6 text-white/72">{body}</p>
    </article>
  );
}

function NextStepSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#060708_0%,#2a2a2c_100%)] py-24">
      <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div className="space-y-7">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="mx-auto max-w-[720px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <img alt="" className="h-36 w-36 object-contain md:h-48 md:w-48" src={nextStepImage} />
            <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[42px]">
              Bir Sonraki Adımı
              <br />
              <span className="text-[#b5ff15]">Atmaya Hazır mısınız?</span>
            </h2>
          </div>
          <div className="mt-12 space-y-8 text-base leading-8 text-white/78 md:text-xl">
            <p className="flex gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-[#b5ff15]" />
              Dijital pazarlama, güçlü bir stratejiler ile doğru kullanıldığında markalara başarı getirmekte fazlasıyla cüretkardır.
            </p>
            <p className="flex gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-[#b5ff15]" />
              Kaliteli müşteri ve yüksek satış elde etmenin tek yolu, kitleniz neredeyse sizi orada hedef kitlenizle buluşturan güçlü bir dijital pazarlama ajansı ile çalışmaktan geçiyor.
            </p>
          </div>
          <ActionButton accent="lime" className="mt-12" to="/hizmetler" label="Hizmetlerimizi Keşfedin" />
        </div>
      </div>
    </section>
  );
}

function ChannelsSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#2a2a2c_0%,#6626bb_100%)] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <h2 className="text-center text-[30px] font-extrabold leading-tight text-white md:text-[42px]">
          Dijital Pazarlama Kanallarınız
          <br />
          <span className="italic text-[#b5ff15]">Tek Merkezden Yönetilsin!</span>
        </h2>
        <p className="mx-auto mt-7 max-w-[860px] text-center text-lg leading-8 text-white/76">
          Tek merkezden ve planlı bir stratejiyle yönetilen dijital kanallarla hedef kitlenize daha kolay ulaşın.
        </p>
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {channelCards.map((card) => (
            <article key={card.title} className="rounded-[10px] bg-white/16 p-9 shadow-[0_22px_70px_rgba(0,0,0,0.18)]">
              <img alt="" className="h-16 w-16 object-contain" src={card.icon} />
              <h3 className="mt-8 text-[26px] font-extrabold text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/72">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({
  name,
  description,
  price,
  suffix,
  cta,
  note,
  accent,
  icon,
  features,
  featured,
  badge,
}: (typeof packageCards)[number]) {
  const tones = {
    cyan: {
      shell: "bg-[linear-gradient(180deg,#11a5d5_0%,#13212a_100%)] text-white",
      title: "text-white",
      body: "text-white/74",
      price: "text-white",
      button: "cyan" as const,
      check: "text-white",
    },
    lime: {
      shell: "bg-[#82c400] text-black xl:scale-105",
      title: "text-black",
      body: "text-black/74",
      price: "text-black",
      button: "lime" as const,
      check: "text-black",
    },
    violet: {
      shell: "bg-[linear-gradient(180deg,#8a38f5_0%,#17151f_100%)] text-white",
      title: "text-white",
      body: "text-white/74",
      price: "text-white",
      button: "violet" as const,
      check: "text-white",
    },
  }[accent];

  return (
    <article className={`relative overflow-hidden rounded-[18px] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.32)] ${tones.shell}`}>
      {featured && badge ? (
        <div className="absolute right-[-54px] top-10 rotate-45 bg-[#1c1c1c] px-16 py-2 text-sm font-extrabold italic text-[#b5ff15]">
          {badge}
        </div>
      ) : null}
      <img alt="" className="h-14 w-14 object-contain" src={icon} />
      <h3 className={`mt-8 text-[26px] font-extrabold italic ${tones.title}`}>{name}</h3>
      <p className={`mt-5 text-sm leading-6 ${tones.body}`}>{description}</p>
      <div className="mt-8 flex flex-wrap items-end gap-2">
        <span className={`text-[42px] font-extrabold leading-none ${tones.price}`}>{price}</span>
        {suffix ? <span className={`pb-1 text-lg font-bold ${tones.price}`}>{suffix}</span> : null}
      </div>
      <p className={`mt-2 text-[11px] font-medium ${tones.body}`}>*Aylık • Sözleşmeli • İstediğiniz zaman iptal</p>
      <ActionButton accent={tones.button} className="mt-7 w-full justify-center" label={cta} to="/iletisim#contact-form" />
      <ul className="mt-8 space-y-4">
        {features.map((feature) => (
          <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${tones.body}`}>
            <PackageFeatureBullet className="mt-0.5 h-5 w-5 shrink-0" tone={accent === "lime" ? "dark" : "light"} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className={`mt-8 text-xs leading-5 ${tones.body}`}>
        <span className="font-extrabold">Not:</span> {note}
      </p>
    </article>
  );
}

function PackagesSection() {
  return (
    <section className="bg-[#111317] py-24" id="packages">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <SectionTitle highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
        <p className="mx-auto mt-8 max-w-[940px] text-center text-lg leading-8 text-white/72">
          Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için sayfamızı ziyaret etmeyi unutmayın!
        </p>
        <PaymentLogos />
        <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
          {packageCards.map((card) => (
            <PackageCard key={card.name} {...card} />
          ))}
        </div>
        <div className="mt-14 text-center text-base leading-8 text-white/78 md:text-lg">
          <p>Çoğu marka Launch ile başlar, Growth ile büyür ve Scale ile sistemi kurar.</p>
          <p>
            Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
            <Link className="mx-2 font-extrabold text-[#b5ff15] underline" to="/iletisim#contact-form">
              formu
            </Link>
            doldurun, beraber karar verelim!
          </p>
        </div>
      </div>
    </section>
  );
}

export default function GrowthHubServiceHome() {

  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <HeroSection />

      <section className="bg-[#111317] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-10 px-6 lg:grid-cols-3 lg:px-10">
          {journeyCards.map((card) => (
            <JourneyCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <NextStepSection />
      <ChannelsSection />
      <PackagesSection />
    </div>
  );
}
