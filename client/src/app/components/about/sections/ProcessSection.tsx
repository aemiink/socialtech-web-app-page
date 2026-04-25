import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function ProcessSection() {
  return (
    <section className="bg-[#111214] py-24" id="process">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Bizim Gücümüz" prefix="Süreç" />

          <div className="mt-16 grid gap-6 xl:grid-cols-4">
            {processSteps.map((item) => (
              <ProcessCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>
  );
}
