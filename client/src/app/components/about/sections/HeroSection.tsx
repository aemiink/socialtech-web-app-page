import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[860px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#101411" />

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
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[240px]" to="/iletisim#contact-form" label="Bizimle Tanışın" />
            <ActionButton accent="violet" className="min-w-[240px]" href="#process" label="Nasıl Çalışıyoruz?" />
          </div>
        </div>
      </section>
  );
}
