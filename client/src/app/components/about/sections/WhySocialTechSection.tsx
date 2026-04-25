import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function WhySocialTechSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#111214_0%,#8a38f5_100%)] py-18">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center accent="violet" highlight="SocialTech?" prefix="Neden" />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {whyUs.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="flex items-center gap-4 rounded-[16px] border border-white/12 bg-black/14 px-5 py-5 backdrop-blur"
                >
                  <div className="rounded-full bg-white/10 p-3 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white/86">{item.title}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
  );
}
