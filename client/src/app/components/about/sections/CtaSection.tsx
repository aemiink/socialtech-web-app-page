import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function CtaSection() {
  return (
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
            <ActionButton accent="violet" className="min-w-[250px]" to="/hizmetler" label="Hizmetleri İncele" />
          </div>
        </div>
      </section>
  );
}
