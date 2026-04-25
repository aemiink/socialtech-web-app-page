import { ActionButton, Blocks, Bot, BrainCircuit, CalendarDays, ChartColumn, Facebook, Gauge, Globe, HeroBackdrop, Instagram, Layers3, LayoutDashboard, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, Package2, PencilRuler, ProcessCard, Search, SectionHeading, ShieldCheck, Sparkles, Target, Workflow, X, Youtube, capabilities, getFooterLinkTarget, logoImage, manifestoIllustration, manifestoMetrics, manifestoPanelIcon, manifestoPoints, manifestoSpeed, manifestoWeb, navItems, processStepFourImage, processStepOneImage, processStepThreeImage, processStepTwoImage, processSteps, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialSnapchatIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, thoughtCards, toolIcons, toolIllustratorIcon, toolPhotoshopIcon, toolQuickModeIcon, toolShopifyIcon, toolWindowIcon, toolWixIcon, toolWooCommerceIcon, toolWordPressIcon, whyUs } from "../AboutHome.shared";

export default function ManifestoSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#111513_0%,#9edb00_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Dijital Ürün Ortağınızız" prefix="Ajans Değil," />

          <div className="mt-16 grid gap-8 rounded-[34px] bg-[#070809] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:grid-cols-[0.92fr_1.08fr] lg:p-9">
            <div className="space-y-4">
              {manifestoPoints.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[16px] border border-white/10 bg-[linear-gradient(135deg,rgba(38,41,43,0.96),rgba(23,24,25,0.92))] px-5 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-[12px] bg-black/40 p-3">
                      <img alt={item.title} className="h-11 w-11 object-contain" src={item.icon} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/66">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(6,8,11,0.98),rgba(18,22,18,0.88))] px-6 py-8 md:px-10">
              <div className="flex flex-col items-start gap-8 md:flex-row">
                <div className="w-full max-w-[220px] shrink-0 rounded-[24px] border border-white/8 bg-black/40 p-4">
                  <img alt="Social Tech yaklaşımı" className="w-full object-contain" src={manifestoIllustration} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[34px] font-bold leading-tight tracking-tight text-[#b5ff15]">
                    Bir ajanstan daha fazlası
                    <br />
                    işlerinizin tam kalbinde
                  </h3>
                  <div className="mt-6 space-y-5 text-base leading-8 text-white/76 md:text-lg">
                    <p>
                      Social Tech; web, pazarlama ve teknoloji disiplinlerini tek merkezden yöneten bir dijital büyüme ekibidir.
                    </p>
                    <p>
                      Bizim için başarı; güzel tasarım değil, satış üreten, ölçeklenebilir ve sürdürülebilir sistemler kurmaktır.
                    </p>
                  </div>
                  <ul className="mt-8 space-y-3 text-sm text-white/76 md:text-base">
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#b5ff15]" />
                      <span>İhtiyaca göre mimariler, hazır kalıplar değil</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#b5ff15]" />
                      <span>Uzun vadeli geliştirilebilirlik ve bakım kolaylığı</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#b5ff15]" />
                      <span>Yönetilebilir ve ölçeklenebilir dijital yapılar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
