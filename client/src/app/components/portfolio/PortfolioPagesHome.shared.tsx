import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Code2,
  Facebook,
  Handshake,
  ImageUp,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Package2,
  Rocket,
  Search,
  Star,
  Target,
  UserRoundCheck,
  Workflow,
  X as XIcon,
} from "lucide-react";
import ActionButton from "../site/ActionButton";
import HeroBackdrop from "../site/HeroBackdrop";
import { getFooterLinkTarget } from "../site/footerLinks";

import logoImage from "../../../assets/branding/yatay-logo.svg";
import careerWomanImage from "../../../assets/991188e8e509b67c1ff6ac7a5eaf1b433f87e95e.webp";
import careerManImage from "../../../assets/74b30c061ad09e20c8b32c6622fe5bba17d10ca1.webp";
import caseMarketplaceImage from "../../../assets/2a4556d55251a48bc607f0696b65efb4a8117133.webp";
import caseAutomationImage from "../../../assets/19ee8247f296710692b313a59485eb0258d8e3b8.webp";
import caseCreativeImage from "../../../assets/b180e00e08f5659eea7cb564d44ce4b577244437.webp";
import stepbagLogo from "../../../assets/1da609174c8279af605ceae4765e62f302108fc8.png";
import jewelleryLogo from "../../../assets/59e8e6639c98ab2e3bd51c651b9f6595c768f8e6.png";
import ambarLogo from "../../../assets/aba79dde89b06d325d921966e3a4cc54806e48b1.png";
import msDigitalLogo from "../../../assets/83003c5d78963a8d36ea47cb5269ace617c52a0c.png";
import sapientiusLogo from "../../../assets/014e6b1d53b1b355d5e14e69e017154869d94ea3.png";
import kLogo from "../../../assets/98858b20365095da51bfb77ebf790d2e093f3c6f.png";
import sivasMatbaaLogo from "../../../assets/ffad7d3244a2a3efff7f37f7c8d6ed6e9dd2996e.png";
import taksiLogo from "../../../assets/c23dd3c3a7e2ac1f113a214529e907ec6e2a5849.png";
import avatarSue from "../../../assets/573ad1f39f6055a34e7171ec9bb627fdf05cf003.webp";
import avatarJhon from "../../../assets/4e64811246c2bda815c83e5aa067453ff586901e.webp";
import avatarRobbie from "../../../assets/dd23378db022480fe43081e8f5774a27c17b0a9d.webp";
import trustBannerImage from "../../../assets/d66d403f3b68db2e5dedb81961508f5cf25a1d58.webp";
import structureImage from "../../../assets/5e20f8ba4c40fbc150b631266aed6ef04a12a35e.webp";

export type PageKind = "career" | "case-study" | "case-detail" | "customers";

export const navItems = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetlerimiz", to: "/hizmetler" },
  { label: "Çalışmalarımız", to: "/calismalar" },
  { label: "Hakkımızda", to: "/hakkimizda" },
];

export const cultureCards = [
  {
    title: "Öğrenme Odaklı Kültür",
    description: "Gerçek projeler, gerçek sorumluluklar.",
    icon: <ImageUp className="h-9 w-9" />,
  },
  {
    title: "Sistemli Çalışma",
    description: "Kaos değil; net süreçler ve hedefler.",
    icon: <Workflow className="h-9 w-9" />,
  },
  {
    title: "Gelişime Açık Alan",
    description: "Fikir üretmek, denemek ve büyümek teşvik edilir.",
    icon: <Rocket className="h-9 w-9" />,
  },
  {
    title: "Şeffaf & Samimi İletişim",
    description: "Hiyerarşiden çok iş birliği.",
    icon: <Handshake className="h-9 w-9" />,
  },
];

export const formFields = [
  "Ad-Soyad",
  "Telefon",
  "E-Posta",
  "Başvuru Turu",
  "Başvurduğun Pozisyon",
  "Ajans Deneyimin Var mı?",
  "Yabancı Dil Seviyen?",
  "En Sevdiğin Aktivite",
  "Kendini Anlat (Sadece 1 Cümle)",
  "Linkedin veya Portfolyo Linki",
];

export const caseStudies = [
  {
    slug: "nev-jewellery-growth-sistemi",
    title: "NEV Jewellery için 90 Günde Ölçülebilir Growth Sistemi",
    categories: "E-Ticaret, Meta Ads, Growth Hub",
    date: "12.03.2026",
    author: "Social Tech Growth Team",
    client: "NEV Jewellery",
    industry: "Takı & Aksesuar",
    duration: "90 gün",
    image: caseMarketplaceImage,
    summary:
      "Dağınık kampanya yapısı, düşük dönüşüm oranı ve manuel müşteri takibini tek bir büyüme sisteminde topladık.",
    metrics: [
      { value: "4.8x", label: "ROAS" },
      { value: "-38%", label: "Satın alma maliyeti" },
      { value: "+71%", label: "Online satış hacmi" },
    ],
    services: ["Growth Hub", "Meta Ads", "Landing Page", "PromptAnalysis"],
    challenge: [
      "Reklam kampanyaları ürün gruplarına göre ayrılmadığı için bütçe kazanan ürünlere hızlı aktarılamıyordu.",
      "Web sitesi ve sosyal kanallarda aynı ürün için farklı mesajlar kullanılıyor, marka algısı zayıflıyordu.",
      "WhatsApp ve Instagram DM üzerinden gelen satın alma sinyalleri düzenli takip edilemiyordu.",
    ],
    solution: [
      "Ürün gruplarını karlılık, stok ve talep verisine göre ayrıştırıp Meta kampanya mimarisini yeniden kurduk.",
      "PromptAnalysis ile rakip, kreatif ve teklif analizini çıkarıp hangi ürünlerin hangi vaatle öne çıkacağını belirledik.",
      "Landing page ve WhatsApp yönlendirmelerini tek funnel yapısına bağlayıp sıcak lead takibini kolaylaştırdık.",
    ],
    results: [
      "En yüksek potansiyelli ürün gruplarında bütçe kaydırmaları haftalık optimizasyon ritmine bağlandı.",
      "Marka dili sosyal medya, reklam ve ürün sayfasında tek tona çekildi.",
      "Satın almaya yakın kullanıcılar ayrı segmentlenerek tekrar iletişim kurguları oluşturuldu.",
    ],
  },
  {
    slug: "sivas-matbaa-whatsapp-otomasyon",
    title: "Sivas Matbaa için WhatsApp Odaklı Teklif Otomasyonu",
    categories: "Yerel İşletme, Google Ads, WhatsApp Otomasyonu",
    date: "04.02.2026",
    author: "Social Tech Automation Team",
    client: "Sivas Matbaa",
    industry: "Baskı & Matbaa",
    duration: "45 gün",
    image: caseAutomationImage,
    summary:
      "Teklif isteyen müşterilerin kaybolmasını önleyen, sıcaklığı etiketleyen ve satış ekibine aksiyon listesi veren bir WhatsApp akışı kurduk.",
    metrics: [
      { value: "<2 dk", label: "İlk cevap süresi" },
      { value: "+46%", label: "Nitelikli teklif talebi" },
      { value: "-31%", label: "Boşa giden reklam harcaması" },
    ],
    services: ["Google Ads", "PromptWhatsApp", "Web Teknik Destek", "Ölçümleme"],
    challenge: [
      "Reklamdan gelen müşteriler WhatsApp’a düşüyor fakat talep türü, aciliyet ve bütçe ayrımı manuel yapılıyordu.",
      "Fiyat, teslim süresi ve ürün ölçüsü gibi tekrar eden sorular satış ekibinin zamanını tüketiyordu.",
      "Google Ads tarafında hangi arama terimlerinin gerçek teklif talebi ürettiği net izlenemiyordu.",
    ],
    solution: [
      "PromptWhatsApp akışıyla kullanıcıdan ürün tipi, adet, teslim tarihi ve görsel örnek bilgisi alacak konuşma ağacı kurduk.",
      "Lead’leri Cold, Warm ve Hot olarak etiketleyip satış ekibine öncelikli takip listesi oluşturduk.",
      "Google Ads dönüşümlerini WhatsApp aksiyonlarıyla eşleştirip düşük niyetli arama terimlerini temizledik.",
    ],
    results: [
      "Sık sorulan sorular otomatik karşılandığı için satış ekibi gerçek tekliflere odaklandı.",
      "Acil teslimat isteyen ve kurumsal baskı potansiyeli olan kullanıcılar ayrı segmentte takip edildi.",
      "Reklam bütçesi daha çok teklif talebi üreten kelime gruplarına aktarıldı.",
    ],
  },
  {
    slug: "stepbag-pazaryeri-icerik-sistemi",
    title: "Stepbag için Pazaryeri ve Sosyal İçerik Üretim Sistemi",
    categories: "Pazaryeri, İçerik Otomasyonu, Sosyal Medya",
    date: "18.01.2026",
    author: "Social Tech Creative Team",
    client: "Stepbag",
    industry: "Çanta & Aksesuar",
    duration: "60 gün",
    image: caseCreativeImage,
    summary:
      "Ürün açıklamaları, vitrin görselleri ve sosyal medya postlarını Brand DNA ile tutarlı hale getiren içerik sistemi kurduk.",
    metrics: [
      { value: "+54%", label: "Ürün kartı tıklanma oranı" },
      { value: "+29%", label: "Sepete ekleme oranı" },
      { value: "-70%", label: "İçerik üretim süresi" },
    ],
    services: ["PromptIMG", "PromptVisual", "Sosyal Medya", "Pazaryeri Optimizasyonu"],
    challenge: [
      "Pazaryeri ürün açıklamaları farklı kişiler tarafından yazıldığı için marka dili tutarlı görünmüyordu.",
      "Ürün görselleri teknik olarak net olsa da kampanya ve vitrin kullanımında yeterince dikkat çekmiyordu.",
      "Sosyal medya içerikleriyle pazaryeri ürün vaatleri arasında güçlü bir bağ kurulamıyordu.",
    ],
    solution: [
      "Brand DNA dokümanını çıkarıp ürün faydası, hedef kitle ve yasaklı dil kurallarını otomasyonlara tanımladık.",
      "PromptIMG ile ürün açıklaması, kısa sosyal medya metni ve kampanya başlıklarını tek sistemden ürettik.",
      "PromptVisual ile ürün fotoğraflarından marka diline uygun gerçekçi vitrin görselleri oluşturduk.",
    ],
    results: [
      "Pazaryeri ve sosyal medya içerikleri aynı vaat etrafında birleşti.",
      "Yeni ürün girişlerinde açıklama ve görsel hazırlama süresi ciddi şekilde kısaldı.",
      "Satın alma niyeti güçlü ürünlerde görsel varyasyon testleri daha hızlı yapılabilir hale geldi.",
    ],
  },
];

export const blogPosts = caseStudies;

export const latestBlogs = caseStudies.map((post) => ({
  ...post,
  compactTitle:
    post.title.length > 60 ? `${post.title.slice(0, 58)}...` : post.title,
}));

export const brandGroups = [
  {
    title: "Startup'lar",
    logos: [{ src: stepbagLogo, alt: "Stepbag" }],
  },
  {
    title: "E-Ticaret Firmaları",
    logos: [
      { src: jewelleryLogo, alt: "NEV Jewellery" },
      { src: ambarLogo, alt: "Ambar" },
    ],
  },
  {
    title: "Kurumsal İşletmeler",
    logos: [
      { src: msDigitalLogo, alt: "MS Digital" },
      { src: sapientiusLogo, alt: "Sapientius" },
      { src: kLogo, alt: "Kurumsal marka" },
    ],
  },
  {
    title: "Yerel & Global İşletmeler",
    logos: [
      { src: sivasMatbaaLogo, alt: "Sivas Matbaa" },
      { src: taksiLogo, alt: "Sivas Taksi" },
    ],
  },
];

export const testimonials = [
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

export const structureItems = [
  {
    title: "Teknik Detay",
    description: "Alt yapınız kurulur, ya da hazır altyapınız düzenlenir.",
    icon: <Code2 className="h-8 w-8" />,
  },
  {
    title: "Reklam ve Yönetim",
    description: "Sosyal medyanız yönetilir, reklamlarınız tek bir yerden kontrol edilir.",
    icon: <BarChart3 className="h-8 w-8" />,
  },
  {
    title: "Custom Web Çözümleri",
    description: "Size özel kompozisyon, özel entegrasyonlarla marka web sitesi geliştiriyoruz.",
    icon: <Workflow className="h-8 w-8" />,
  },
  {
    title: "Teknik Sorunlar",
    description: "Kod ve sunucu sorunlarınız çözülür.",
    icon: <BriefcaseBusiness className="h-8 w-8" />,
  },
];

export function HighlightTitle({
  prefix,
  highlight,
  suffix,
  center = false,
  accent = "lime",
}: {
  prefix: string;
  highlight: string;
  suffix?: string;
  center?: boolean;
  accent?: "lime" | "violet";
}) {
  const highlightClass =
    accent === "violet"
      ? "bg-[#8a38f5] text-black"
      : "bg-[#b5ff15] text-black";

  return (
    <h2
      className={`text-[30px] font-extrabold leading-tight tracking-tight text-white md:text-[42px] ${
        center ? "text-center" : ""
      }`}
    >
      {prefix}{" "}
      <span className={`inline-block -rotate-1 px-3 py-1 ${highlightClass}`}>
        {highlight}
      </span>
      {suffix ? ` ${suffix}` : ""}
    </h2>
  );
}

export function HeroSection({ kind }: { kind: PageKind }) {
  const isCareer = kind === "career";
  const isCustomers = kind === "customers";

  return (
    <section className="relative isolate flex min-h-[760px] items-center justify-center overflow-hidden bg-[#050607] md:min-h-[880px]">
      <HeroBackdrop fadeColor="#17191b" />

      <div className="relative z-10 mx-auto flex min-h-[640px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-20 pt-16 text-center lg:px-10">
        {isCareer ? (
          <>
            <h1 className="max-w-[880px] text-[34px] font-medium leading-tight tracking-tight text-white md:text-[56px]">
              Birlikte Üreten
              <br />
              <span className="font-extrabold">Birlikte Büyüyen Bir Ekip</span>
            </h1>
            <p className="mt-7 max-w-[660px] text-base leading-8 text-white/78 md:text-xl">
              Social Tech’te kariyer;
              <span className="mx-2 font-extrabold text-[#b5ff15]">sadece bir pozisyon değil,</span>
              öğrenme, üretme ve büyüme sürecidir.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ActionButton accent="violet" className="min-w-[260px]" href="#application" label="Açık Pozisyonlar" />
              <ActionButton accent="lime" className="min-w-[260px]" href="#culture" label="Bizi Tanıyın" />
            </div>
          </>
        ) : isCustomers ? (
          <>
            <h1 className="max-w-[900px] text-[34px] font-medium leading-tight tracking-tight text-white md:text-[56px]">
              Birlikte Çalışan Değil
              <br />
              <span className="font-extrabold">Birlikte Büyüyen Markalar</span>
            </h1>
            <p className="mt-7 max-w-[820px] text-base leading-8 text-white/78 md:text-xl">
              Social Tech olarak;
              <span className="mx-2 font-extrabold text-[#8a38f5]">startup’lardan kurumsal markalara kadar</span>
              ölçeklenebilir dijital sistemler kurduğumuz markalarla uzun vadeli iş ortaklıkları geliştiriyoruz.
            </p>
            <div className="mt-8 grid gap-3 text-center text-sm font-semibold text-white/86 sm:grid-cols-3">
              {["Uzun vadeli iş ortaklığı", "Şeffaf süreç & raporlama", "Ölçülebilir sonuçlar"].map((item) => (
                <span key={item} className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-[#b5ff15]" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ActionButton accent="violet" className="min-w-[260px]" to="/calismalar" label="Projeleri İncele" />
              <ActionButton accent="lime" className="min-w-[260px]" to="/iletisim#contact-form" label="Bizimle Çalışın" />
            </div>
          </>
        ) : (
          <>
            <h1 className="max-w-[860px] text-[34px] font-medium leading-tight tracking-tight text-white md:text-[56px]">
              Gerçek Problemler
              <br />
              <span className="font-extrabold">Gerçek Dijital Sistemler</span>
            </h1>
            <p className="mt-7 max-w-[760px] text-base leading-8 text-white/78 md:text-xl">
              Her case; strateji,
              <span className="mx-2 font-extrabold">uygulama ve ölçümleme adımlarının bir araya geldiği,</span>
              sonuç odaklı bir dijital projedir.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ActionButton accent="violet" className="min-w-[260px]" href="#case-list" label="Projeleri İncele" />
              <ActionButton accent="lime" className="min-w-[260px]" to="/iletisim#contact-form" label="Bizimle Çalışın" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function CtaBand({ accent = "lime" }: { accent?: "lime" | "violet" }) {
  const classes =
    accent === "violet"
      ? "bg-[radial-gradient(circle_at_center,rgba(138,56,245,0.78),rgba(36,9,74,1))]"
      : "bg-[radial-gradient(circle_at_center,rgba(181,255,21,0.94),rgba(77,111,0,1))]";

  return (
    <section className={`${classes} py-24`}>
      <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
        <HighlightTitle accent={accent} center highlight="Hazır mısınız?" prefix="Bizimle Çalışmaya" />
        <p className="mt-6 text-lg text-white/86">Sizi tanımadan teklif sunmuyoruz. Önce dinliyor, sonra çözüyoruz.</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <ActionButton accent={accent === "violet" ? "violet" : "lime"} className="min-w-[260px]" to="/iletisim#contact-form" label="Ücretsiz Ön Görüşme" />
          <ActionButton accent="violet" className="min-w-[260px]" to="/hizmetler" label="Hizmetleri İncele" />
        </div>
      </div>
    </section>
  );
}

export function CareerHome() {

  return (
    <div className="min-h-screen bg-[#121416] text-white" id="top">
      <HeroSection kind="career" />

      <section className="bg-[#151719] py-24" id="culture">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Çalışmalısın?" prefix="Neden Social Tech’te" />
          <p className="mx-auto mt-8 max-w-[720px] text-center text-lg leading-8 text-white/72">
            İşlerimizi yaparken en ince ayrıntıyı atlamadan, analiz ölçümleme ve veri ile çalışıyoruz!
          </p>
          <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {cultureCards.map((card) => (
              <article key={card.title} className="rounded-[14px] bg-[#b5ff15] p-8 text-center text-black shadow-[0_24px_70px_rgba(181,255,21,0.14)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                  {card.icon}
                </div>
                <h3 className="mt-7 text-xl font-extrabold">{card.title}</h3>
                <p className="mx-auto mt-3 max-w-[220px] text-sm leading-6 text-black/70">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17191b] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[1fr_0.95fr] lg:px-10">
          <div>
            <p className="text-[32px] font-light leading-tight text-white md:text-[48px]">Yenilikçi Bir Kariyer</p>
            <div className="mt-2 inline-block -rotate-1 bg-[#b5ff15] px-3 py-1">
              <span className="text-[34px] font-extrabold leading-tight text-black md:text-[52px]">Deneyimi Seni Bekliyor!</span>
            </div>
            <div className="mt-12 max-w-[720px] space-y-6 text-lg font-semibold leading-8 text-white">
              <p>Büyüyen ekibimize harika insanlar arıyoruz.</p>
              <p className="font-medium text-white/76">
                Dijital pazarlamanın kurallarını birlikte yazalım. Dil, din, ırk ve yönelim farklılıklarını bir kenara bırakarak sadece sahip olduğun yeteneklerle ilgileniyoruz.
              </p>
              <p>Eğer hâlâ kararlıysan aramıza katılmak ve pazarlama kariyerinde güzel bir başlangıç yapmak için sakın geç kalma!</p>
            </div>
          </div>

          <div className="relative mx-auto min-h-[440px] w-full max-w-[620px]">
            <div className="absolute left-4 top-20 h-[340px] w-[260px] overflow-hidden rounded-[38px] bg-[#bdf1ff] shadow-[0_30px_80px_rgba(0,0,0,0.28)] md:left-16 md:w-[310px]">
              <img alt="Social Tech ekip üyesi" className="h-full w-full object-cover object-top" src={careerWomanImage} />
            </div>
            <div className="absolute right-2 top-0 h-[410px] w-[300px] overflow-hidden rounded-[38px] bg-[#f4a3e9] shadow-[0_30px_80px_rgba(0,0,0,0.38)] md:w-[350px]">
              <img alt="Social Tech ekip üyesi" className="h-full w-full object-cover object-top" src={careerManImage} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#17191b] pb-24" id="application">
        <div className="mx-auto w-full max-w-[1180px] px-6">
          <form
            className="rounded-[44px] bg-[#4d7608] px-6 py-10 shadow-[0_34px_90px_rgba(0,0,0,0.28)] md:px-16 md:py-16"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {formFields.map((field, index) => (
                <label key={field} className={index > 7 ? "md:col-span-2" : ""}>
                  <span className="sr-only">{field}</span>
                  <input
                    className="h-16 w-full rounded-[8px] border border-black/20 bg-black px-6 text-base text-white outline-none transition placeholder:text-white/36 focus:border-[#b5ff15]"
                    placeholder={field}
                    type={field.includes("E-Posta") ? "email" : "text"}
                  />
                </label>
              ))}
            </div>

            <label className="mt-8 flex items-start gap-4 text-white">
              <input className="mt-1 h-5 w-5 accent-[#b5ff15]" type="checkbox" />
              <span>
                <span className="block text-xl font-bold">Gizlilik ve KVKK Şartlarını kabul ediyorum.</span>
                <span className="mt-3 block text-sm leading-6 text-white/78">
                  Bu formu göndererek, Social Tech Reklam ve Teknoloji A.Ş. tarafından iletilen Gizlilik Politikası ve KVKK Metni’ni okuyup anladım. Kişisel verilerimin 6698 sayılı KVKK Kanunu’na göre işlenmesini ve şirketin dışından hizmet aldığı üçüncü kişilere aktarılmasını kabul ediyorum.
                </span>
              </span>
            </label>

            <button className="mt-8 h-16 w-full rounded-[8px] bg-black text-base font-semibold text-white transition hover:bg-[#b5ff15] hover:text-black" type="submit">
              Başvuruyu Gönder
            </button>
          </form>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}

export function BlogSidebar() {
  return (
    <aside className="self-start rounded-[26px] border border-[#aaff01]/18 bg-[linear-gradient(145deg,rgba(170,255,1,0.10),rgba(8,10,12,0.96)_34%,rgba(0,0,0,0.98))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] lg:sticky lg:top-28">
      <div>
        <h3 className="text-[26px] font-black text-[#aaff01]">Ara</h3>
        <div className="mt-3 border-t border-[#aaff01]/34" />
        <label className="mt-5 flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/42 px-4 text-white/50 transition focus-within:border-[#aaff01]/60">
          <Search className="h-4 w-4 text-[#aaff01]" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-white/46" placeholder="Vaka ara..." />
        </label>
      </div>

      <div className="mt-8">
        <h3 className="text-[26px] font-black text-[#aaff01]">Kategoriler</h3>
        <div className="mt-3 border-t border-[#aaff01]/34" />
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-extrabold text-white">
          {["ALL", "E-Ticaret", "Otomasyon", "Reklam", "Pazaryeri"].map((category) => (
            <p key={category} className="rounded-full border border-[#aaff01]/18 bg-[#aaff01]/8 px-3 py-1.5 text-white/80">
              {category}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-[26px] font-black text-[#aaff01]">Son Vakalar</h3>
        <div className="mt-3 border-t border-[#aaff01]/34" />
        <div className="mt-5 space-y-4">
          {latestBlogs.map((post) => (
            <Link
              key={post.title}
              className="grid grid-cols-[58px_1fr] gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-3 transition hover:border-[#aaff01]/42 hover:bg-[#aaff01]/8"
              to={`/calismalar/${post.slug}`}
            >
              <img alt="" className="h-[58px] w-[58px] rounded-xl object-cover" src={post.image} />
              <span>
                <span className="block text-sm font-extrabold leading-5 text-[#aaff01]">{post.compactTitle}</span>
                <span className="mt-1 block text-[11px] text-white/70">{post.date}</span>
                <span className="block text-[11px] text-white/70">By {post.author}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function CaseStudyHome() {

  return (
    <div className="min-h-screen bg-[#191b1d] text-white" id="top">
      <HeroSection kind="case-study" />

      <main className="bg-[#1a1c1e] py-24" id="case-list">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="mx-auto max-w-[760px] text-center">
            <HighlightTitle center highlight="Göreceksiniz?" prefix="Bu Sayfada Ne" />
            <p className="mt-8 text-lg leading-8 text-white/72">
              Case Studies sayfası; yalnızca tamamlanan işleri değil, problemleri nasıl ele aldığımızı ve hangi sistemlerle çözdüğümüzü gösterir.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Her proje; tekil bir iş değil, tekrar edilebilir bir yaklaşımın örneğidir.
            </p>
          </div>

          <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-20">
              {blogPosts.map((post) => (
                <article key={post.title} className="group rounded-[32px] border border-white/10 bg-[#121416] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.22)] md:p-6">
                  <Link className="block overflow-hidden rounded-[26px] bg-[#26313b]" to={`/calismalar/${post.slug}`}>
                    <img alt={post.title} className="h-[280px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[420px]" src={post.image} />
                  </Link>
                  <div className="mt-8 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.14em] text-[#aaff01]">
                    <span>{post.industry}</span>
                    <span>•</span>
                    <span>{post.duration}</span>
                  </div>
                  <h2 className="mt-4 max-w-[860px] text-[28px] font-semibold leading-tight text-white md:text-[38px]">
                    <Link to={`/calismalar/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-5 max-w-[820px] text-base leading-7 text-white/68 md:text-lg">{post.summary}</p>
                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    {post.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-[18px] bg-white/[0.06] p-5">
                        <p className="text-[30px] font-extrabold text-[#aaff01]">{metric.value}</p>
                        <p className="mt-1 text-sm text-white/62">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.services.map((service) => (
                      <span key={service} className="rounded-full border border-[#aaff01]/24 px-3 py-1 text-xs font-bold text-white/72">
                        {service}
                      </span>
                    ))}
                  </div>
                </article>
              ))}

              <div className="flex items-center justify-center gap-4 pt-4">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#aaff01] text-black" type="button">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button key={page} className="h-12 w-12 rounded-full bg-[#aaff01] text-lg font-extrabold text-black" type="button">
                    {page}
                  </button>
                ))}
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#aaff01] text-black" type="button">
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            <BlogSidebar />
          </div>
        </div>
      </main>

    </div>
  );
}

export function ArticleDivider() {
  return <div className="my-10 border-t border-white/52" />;
}

export function CodeBlock() {
  return (
    <pre className="overflow-x-auto rounded-[18px] bg-[#373944] p-6 text-sm leading-6 text-white/82">
      <code>{`Ölçümleme Planı
- Kaynak: Meta / Google / WhatsApp
- Event: Lead, Qualified Lead, Purchase
- Segment: Cold, Warm, Hot
- Rapor: Haftalık aksiyon listesi + kanal bazlı bütçe önerisi`}</code>
    </pre>
  );
}

export function CaseStudyDetailsHome() {
  const { id } = useParams();
  const currentCase = caseStudies.find((caseItem) => caseItem.slug === id) ?? caseStudies[0];

  return (
    <div className="min-h-screen bg-[#17191b] text-white" id="top">
      <HeroSection kind="case-detail" />

      <main className="bg-[#17191b] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
          <article>
            <img alt={currentCase.title} className="h-[300px] w-full rounded-[24px] object-cover md:h-[460px]" src={currentCase.image} />
            <p className="mt-10 text-sm font-semibold text-white/80 md:text-base">
              {currentCase.client} | {currentCase.date} | {currentCase.categories}
            </p>
            <h1 className="mt-6 max-w-[980px] text-[30px] font-medium leading-tight text-[#aaff01] md:text-[42px]">
              {currentCase.title}
            </h1>
            <div className="mt-8 border-t border-[#aaff01]/70" />

            <p className="mt-10 text-base leading-7 text-white/86 md:text-lg">
              {currentCase.summary}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {currentCase.metrics.map((metric) => (
                <div key={metric.label} className="rounded-[20px] border border-[#aaff01]/24 bg-[#0f1214] p-6">
                  <p className="text-[34px] font-extrabold text-[#aaff01]">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/64">{metric.label}</p>
                </div>
              ))}
            </div>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-2xl font-extrabold text-white">Başlangıç Problemi</h2>
              {currentCase.challenge.map((item) => (
                <p key={item} className="rounded-[18px] bg-white/[0.055] p-5">{item}</p>
              ))}
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-2xl font-extrabold text-white">Kurulan Sistem</h2>
              {currentCase.solution.map((item) => (
                <div key={item} className="flex gap-4 rounded-[18px] bg-[#aaff01]/10 p-5">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[#aaff01]" />
                  <p>{item}</p>
                </div>
              ))}
              <CodeBlock />
            </section>

            <ArticleDivider />
            <section className="space-y-5 text-base leading-7 text-white/86 md:text-lg">
              <h2 className="text-2xl font-extrabold text-white">Sonuç ve Öğrenimler</h2>
              {currentCase.results.map((item) => (
                <div key={item} className="flex gap-4">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#aaff01]" />
                  <p>{item}</p>
                </div>
              ))}
            </section>

            <ArticleDivider />
            <section className="rounded-[26px] border border-[#aaff01]/24 bg-[#10140c] p-7">
              <h2 className="text-2xl font-extrabold text-white">Kullanılan Servisler</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {currentCase.services.map((service) => (
                  <span key={service} className="rounded-full bg-[#aaff01] px-4 py-2 text-sm font-extrabold text-black">
                    {service}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-base leading-7 text-white/72">
                Bu vaka tekil bir kampanya başarısından çok; reklam, içerik, web ve otomasyon adımlarını aynı ölçümleme düzenine bağlamanın örneğidir.
              </p>
            </section>

            <div className="mt-10">
              <ActionButton accent="lime" label="Benzer Sistemi Konuşalım" to="/iletisim#contact-form" />
            </div>
          </article>

          <BlogSidebar />
        </div>
      </main>

    </div>
  );
}

export function BrandShowcase() {
  return (
    <section className="bg-[linear-gradient(180deg,#17191b_0%,#8a38f5_100%)] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <HighlightTitle accent="violet" center highlight="Markalar" prefix="Bize Güvenen" />
        <div className="mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          {brandGroups.map((group) => (
            <article key={group.title} className="text-center">
              <span className="inline-block bg-[#8a38f5] px-3 py-2 text-lg font-extrabold text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                {group.title}
              </span>
              <div className="mt-9 flex min-h-[160px] flex-col items-center justify-center gap-8">
                {group.logos.map((logo) => (
                  <img key={logo.alt} alt={logo.alt} className="max-h-[80px] max-w-[230px] object-contain" src={logo.src} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewCard({ name, company, detail, avatar }: (typeof testimonials)[number]) {
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

export function TestimonialsSection() {
  return (
    <section className="bg-[#050608] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <HighlightTitle accent="violet" center highlight="Yorumları" prefix="Kullanıcılarımızdan Social Tech" />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </div>

        <div className="mt-14 grid overflow-hidden rounded-[24px] border border-[#8a38f5]/70 bg-[#4c1d83] shadow-[0_24px_70px_rgba(0,0,0,0.3)] lg:grid-cols-[360px_1fr]">
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
            <ActionButton accent="violet" className="mt-8 self-start" label="Trustpilot'a Göz At" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StructureSection() {
  return (
    <section className="bg-[#17191b] py-24">
      <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="relative">
          <img alt="Teknoloji altyapısı" className="mx-auto w-full max-w-[620px]" src={structureImage} />
        </div>
        <div>
          <p className="text-[34px] font-light leading-tight text-white md:text-[50px]">Teknolojiye değil</p>
          <div className="mt-2 inline-block -rotate-1 bg-[#8a38f5] px-3 py-1">
            <span className="text-[34px] font-extrabold leading-tight text-black md:text-[52px]">Doğru Yapıya Odaklanırız</span>
          </div>
          <p className="mt-10 max-w-[760px] text-lg leading-8 text-white/74">
            Geliştirdiğimiz tüm servisler, rastgele araçlar veya tekil çözümlerden oluşmaz. Her hizmet için; planlama, ölçümleme, optimizasyon ve ölçeklenebilirlik odaklı bir sistem yaklaşımı benimseriz. Kullandığımız teknoloji altyapısı ve çalışma metodolojimiz sayesinde, yalnızca hizmet sunmaz; veriye dayalı, sürdürülebilir ve büyümeye hizmet eden dijital sistemler kurarız.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {structureItems.map((item) => (
              <article key={item.title} className="border-t border-white/16 pt-6">
                <div className="flex gap-4">
                  <div className="text-white">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/66">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CustomersHome() {

  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <HeroSection kind="customers" />
      <BrandShowcase />
      <TestimonialsSection />
      <StructureSection />
      <CtaBand accent="violet" />
    </div>
  );
}


export { ActionButton, ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, Check, Code2, Facebook, Handshake, HeroBackdrop, ImageUp, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, Package2, Rocket, Search, Star, Target, UserRoundCheck, Workflow, XIcon, ambarLogo, avatarJhon, avatarRobbie, avatarSue, caseAutomationImage, caseCreativeImage, caseMarketplaceImage, careerManImage, careerWomanImage, getFooterLinkTarget, jewelleryLogo, kLogo, logoImage, msDigitalLogo, sapientiusLogo, sivasMatbaaLogo, stepbagLogo, structureImage, taksiLogo, trustBannerImage, useState };
