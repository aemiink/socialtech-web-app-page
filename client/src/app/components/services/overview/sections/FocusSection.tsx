import { ActionButton, ArrowRight, CalendarDays, ChartColumn, Code2, Facebook, Globe, HeroBackdrop, Instagram, Layers3, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MonitorSmartphone, Package2, Search, SectionHeading, ServiceCard, Smartphone, Sparkles, Wrench, X, Youtube, amazonIcon, focusFeatures, focusIllustration, getFooterLinkTarget, googleAdsIcon, growthHubIcon, hubIcon, logoImage, metaIcon, navItems, principles, serviceGroups, tiktokIcon } from "../../ServicesHome.shared";

export default function FocusSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#242424_0%,#171717_100%)] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
          <div className="relative mx-auto w-full max-w-[720px]">
            <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_center,rgba(138,56,245,0.18),transparent_52%)] blur-[60px]" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[#171b20] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <img alt="Doğru yapı odaklı servisler" className="w-full object-cover" src={focusIllustration} />
            </div>
          </div>

          <div>
            <h2 className="text-[34px] font-medium leading-tight text-white md:text-[48px]">
              Teknolojiye değil
              <span className="mt-3 block w-fit -rotate-[1deg] bg-[#b5ff15] px-4 py-2 font-bold tracking-tight text-black">
                Doğru Yapıya Odaklanırız
              </span>
            </h2>
            <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/72">
              Geliştirdiğimiz tüm servisler, rastgele araçlar veya tekil çözümlerden oluşmaz. Her hizmet için; planlama,
              ölçümleme, optimizasyon ve ölçeklenebilirlik odaklı bir sistem yaklaşımı benimseriz. Kullandığımız teknoloji
              altyapısı ve çalışma metodolojimiz sayesinde, yalnızca hizmet sunmaz; veriye dayalı, sürdürülebilir ve büyümeye
              hizmet eden dijital sistemler kurarız.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {focusFeatures.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="border-t border-white/16 pt-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-[14px] bg-white/8 p-3 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-white/76"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
  );
}
