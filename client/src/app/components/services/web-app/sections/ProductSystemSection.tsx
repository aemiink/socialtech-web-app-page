import { ActionButton, BarChart3, CalendarDays, Check, Code2, Facebook, FaqCard, Gauge, Globe, HeroBackdrop, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PanelsTopLeft, Rocket, Search, SectionHeading, ShieldCheck, Sparkles, Users, ValueCard, Wrench, X, Youtube, customWindowIcon, faqItems, getFooterLinkTarget, interfaceIcon, lightningIcon, logoImage, meetingIcon, navItems, panelIcon, platforms, productIllustration, seoIcon, shopifyIcon, speedIcon, valueCards, wixIcon, wooIcon, wordpressIcon, workflow } from "../../WebAppServiceHome.shared";

export default function ProductSystemSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#070809_0%,#aaff01_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="grid gap-8 rounded-lg bg-[#070809] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:grid-cols-[0.92fr_1.08fr] lg:p-9">
            <div className="space-y-4">
              {valueCards.map((card) => (
                <ValueCard key={card.title} {...card} />
              ))}
            </div>

            <div className="rounded-lg border border-white/8 bg-[linear-gradient(135deg,rgba(6,8,11,0.98),rgba(18,22,18,0.88))] px-6 py-8 md:px-10">
              <div className="flex flex-col items-start gap-8 md:flex-row">
                <div className="w-full max-w-[190px] shrink-0 rounded-lg border border-white/8 bg-black/36 p-4">
                  <img alt="Web uygulaması mimarisi" className="w-full object-contain" src={productIllustration} />
                </div>
                <div className="flex-1">
                  <h2 className="text-[32px] font-bold leading-tight text-[#b5ff15]">
                    Bir Web Sitesinden
                    <br />
                    Fazlasını İnşa Ediyoruz
                  </h2>
                  <div className="mt-6 space-y-5 text-base leading-8 text-white/76 md:text-lg">
                    <p>
                      Geliştirdiğimiz her proje; sadece bir arayüz değil, iş hedeflerinize hizmet eden ölçeklenebilir bir web ürünüdür.
                    </p>
                    <p>
                      Tasarım, performans ve yönetilebilirlik tek bir sistemde birlikte düşünülür.
                    </p>
                  </div>
                  <ul className="mt-8 space-y-3 text-sm text-white/76 md:text-base">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-[#b5ff15]" />
                      <span>İhtiyaca göre mimariler, hazır kalıplar değil</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-[#b5ff15]" />
                      <span>Uzun vadeli geliştirilebilirlik</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-[#b5ff15]" />
                      <span>Yönetilebilir ve ölçeklenebilir yapılar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-lg bg-[#070809] p-6 lg:p-8">
            <h2 className="text-[28px] font-bold text-[#b5ff15]">Nasıl Çalışıyoruz?</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-lg bg-white/12 p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/66">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.42fr_1fr]" id="brief">
            <div className="rounded-lg bg-[linear-gradient(180deg,#070809_0%,#8a38f5_100%)] p-8">
              <img alt="" className="h-16 w-16 object-contain" src={meetingIcon} />
              <h2 className="mt-8 text-[30px] font-bold leading-tight text-white">
                Bir Uzmanla
                <br />
                Projenizi Konuşun
              </h2>
              <ActionButton accent="lime" className="mt-8" to="/iletisim#contact-form" label="Ücretsiz Ön Görüşme Planlayın" />
            </div>

            <div className="rounded-lg bg-[linear-gradient(135deg,#221633_0%,#8a38f5_100%)] p-8">
              <h2 className="text-[28px] font-bold text-white">İhtiyaca Göre Platform Seçiyoruz</h2>
              <p className="mt-2 text-[30px] font-bold italic leading-tight text-[#b5ff15]">
                Tema değil, hedef odaklı teknoloji geliştiriyoruz!
              </p>
              <p className="mt-6 max-w-[860px] text-base leading-7 text-white/76">
                WordPress, Shopify, Webflow, Squarespace, Woo, Ikas ve Wix gibi popüler platformların yanı sıra özelleştirilmiş altyapılar oluşturuyoruz.
              </p>
              <div className="mt-8 flex flex-wrap gap-5">
                {platforms.map((icon, index) => (
                  <div
                    key={index}
                    className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#b5ff15]/20 bg-[#10140f]"
                  >
                    <img alt="" className="h-7 w-7 object-contain" src={icon} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
