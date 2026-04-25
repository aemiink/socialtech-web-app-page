import { useState } from "react";
import { ActionButton, ArrowRight, CalendarDays, ChartColumn, Code2, Facebook, Globe, HeroBackdrop, Instagram, Layers3, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MonitorSmartphone, Package2, Search, SectionHeading, ServiceCard, Smartphone, Sparkles, Wrench, X, Youtube, amazonIcon, focusFeatures, focusIllustration, getFooterLinkTarget, googleAdsIcon, growthHubIcon, hubIcon, logoImage, metaIcon, navItems, principles, serviceGroups, tiktokIcon } from "../../ServicesHome.shared";

export default function ModulesSection() {
  const [activeGroup, setActiveGroup] = useState("social");
  const currentGroup = serviceGroups.find((group) => group.id === activeGroup) ?? serviceGroups[0];
  const gridClass =
    currentGroup.cards.length === 2
      ? "mx-auto max-w-[760px] grid gap-6 md:grid-cols-2"
      : currentGroup.cards.length === 4
        ? "grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        : "grid gap-6 md:grid-cols-2 xl:grid-cols-4";
  return (
    <section className="bg-[linear-gradient(180deg,#232425_0%,#aaff01_100%)] py-24" id="modules">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Büyüme Modülleri Sunuyoruz" prefix="Hizmet Değil," />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/80">
            Her hizmet tek başına alınabilir, ama birlikte alındığında sistem kurar. Ölçülür, raporlanır, optimize edilir.
            Aşağıdan size uygun olan hizmeti bulabilir, sistemi inceleyebilirsiniz.
          </p>

          <div className="mt-16 rounded-[42px] bg-black px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.34)] md:px-8 md:py-10">
            <div className="mx-auto max-w-[1140px] rounded-[14px] bg-[#555555] p-2">
              <div className="grid gap-2 md:grid-cols-3">
                {serviceGroups.map((group) => (
                  <button
                    key={group.id}
                    className={`flex items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-sm font-medium transition ${
                      activeGroup === group.id ? "bg-[#b5ff15] text-[#142000]" : "text-white/90 hover:bg-white/10"
                    }`}
                    onClick={() => setActiveGroup(group.id)}
                    type="button"
                  >
                    {group.icon}
                    <span>{group.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <div className={gridClass}>
                {currentGroup.cards.map((card) => (
                  <ServiceCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
