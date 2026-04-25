import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function CapabilitiesSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#1d132a_0%,#8a38f5_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ne İnşa Ediyoruz?" prefix="Markalar İçin" />
          <p className="mx-auto mt-8 max-w-[900px] text-center text-lg leading-8 text-white/76">
            Her hizmet, tek başına değil; sistemin bir parçası olarak ele alınır.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[14px] border border-white/12 bg-white/10 px-5 py-5 backdrop-blur"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-[12px] bg-white/10 p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
  );
}
