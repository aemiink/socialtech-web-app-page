import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function ToolsSection() {
  return (
    <section className="bg-[#141414] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Doğru Yapıya Odaklanırız" prefix="Araçlara Değil," />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/72">
            IKA, Webflow, Shopify ya da custom. Web sitelerinizde, sosyal medya ve reklamlarınız için ihtiyaca göre doğru teknolojiyi seçeriz.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {socialIcons.map((icon, index) => (
              <div
                key={index}
                className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#b5ff15]/20 bg-[#10140f]"
              >
                <img alt="" className="h-6 w-6 object-contain" src={icon} />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {toolIcons.map((icon, index) => (
              <div
                key={index}
                className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#b5ff15]/20 bg-[#10140f]"
              >
                <img alt="" className="h-7 w-7 object-contain" src={icon} />
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}
