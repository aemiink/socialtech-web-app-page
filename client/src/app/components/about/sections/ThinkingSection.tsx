import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function ThinkingSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#111214_0%,#18101f_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Düşünüyoruz?" prefix="Nasıl" />
          <p className="mx-auto mt-8 max-w-[780px] text-center text-lg leading-8 text-white/72">
            İşlerimizi yaparken en ince ayrıntıyı atlamadan, analiz, ölçümleme ve veri ile çalışıyoruz.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {thoughtCards.map((item) => (
              <article
                key={item.title}
                className="rounded-[18px] border border-[#aaff01]/20 bg-[#aaff01] p-6 text-[#11160b] shadow-[0_20px_56px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#202716]/78">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
  );
}
