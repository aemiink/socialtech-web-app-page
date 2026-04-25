import { ActionButton, ArrowRight, CalendarDays, ChartColumn, Code2, Facebook, Globe, HeroBackdrop, Instagram, Layers3, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MonitorSmartphone, Package2, Search, SectionHeading, ServiceCard, Smartphone, Sparkles, Wrench, X, Youtube, amazonIcon, focusFeatures, focusIllustration, getFooterLinkTarget, googleAdsIcon, growthHubIcon, hubIcon, logoImage, metaIcon, navItems, principles, serviceGroups, tiktokIcon } from "../../ServicesHome.shared";

export default function PrinciplesSection() {
  return (
    <section className="bg-[#222325] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Social Tech?" prefix="Neden" />
          <p className="mx-auto mt-8 max-w-[880px] text-center text-lg leading-8 text-white/74">
            İşlerimizi yaparken en ince ayrıntıyı atlamadan, analiz, ölçümleme ve veri ile çalışıyoruz.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item) => (
              <article
                key={item.title}
                className="rounded-[18px] bg-[#b5ff15] px-6 py-7 text-[#13160d] shadow-[0_18px_56px_rgba(0,0,0,0.22)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[#b5ff15]">
                  <ChartColumn className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#1a1f12]/80">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
  );
}
