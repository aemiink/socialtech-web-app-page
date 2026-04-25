import { ActionButton, ArrowRight, CalendarDays, ChartColumn, Code2, Facebook, Globe, HeroBackdrop, Instagram, Layers3, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MonitorSmartphone, Package2, Search, SectionHeading, ServiceCard, Smartphone, Sparkles, Wrench, X, Youtube, amazonIcon, focusFeatures, focusIllustration, getFooterLinkTarget, googleAdsIcon, growthHubIcon, hubIcon, logoImage, metaIcon, navItems, principles, serviceGroups, tiktokIcon } from "../../ServicesHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex items-center justify-center overflow-hidden bg-[#040607]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(106,117,124,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(106,117,124,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        <HeroBackdrop fadeColor="#232425" />

<div className="relative z-10 mx-auto grid w-full max-w-[1540px] items-center gap-12 px-6 pb-24 pt-24 text-center lg:min-h-[820px] lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:pt-28 lg:text-left">
          <div className="mx-auto flex max-w-[620px] flex-col items-center lg:mx-0 lg:items-start">
            <h1 className="text-[38px] font-bold leading-tight tracking-tight text-white md:text-[64px]">
              Dijitalde Tek Bir Hizmet Yetmez.
              <br />
              Biz Sistem Kurarız.
            </h1>
            <p className="mt-8 max-w-[560px] text-base leading-8 text-white/74 md:text-xl">
              Social Tech, markalar için tekil işler değil;
              <span className="mx-2 font-semibold text-[#b5ff15]">birbirini besleyen dijital büyüme sistemleri</span>
              inşa eder.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <ActionButton accent="lime" className="min-w-[240px]" to="/iletisim#contact-form" label="Hangisi Bana Uygun?" />
              <ActionButton accent="violet" className="min-w-[240px]" href="#modules" label="Hizmetleri Keşfet" />
            </div>
          </div>

          <div className="relative mx-auto h-[560px] w-full max-w-[760px]">
            <div className="absolute inset-x-6 top-6 rounded-[34px] border border-[#aaff01]/24 bg-[#111820] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
              <div className="rounded-[22px] bg-white px-5 py-4 text-[#101820]">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/42">büyüme sistemi</p>
                <p className="mt-1 text-xl font-extrabold">Büyüme modülleri tek panelde</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {["Strateji", "Reklam", "Web", "Rapor"].map((item) => (
                  <div key={item} className="rounded-[18px] bg-[#232f3e] px-4 py-6 text-center">
                    <p className="text-2xl font-extrabold text-[#aaff01]">{item}</p>
                    <p className="mt-1 text-[11px] text-white/55">modül</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[22px] bg-[#0b1016] p-5">
                {["Hedef belirleme", "Kanal kurulumu", "Ölçümleme", "Optimizasyon"].map((item) => (
                  <div key={item} className="mb-3 flex items-center justify-between rounded-xl bg-white/7 px-4 py-3 text-sm">
                    <span className="text-white/82">{item}</span>
                    <span className="font-extrabold text-[#aaff01]">aktif</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-5 left-0 rounded-[26px] border border-white/10 bg-[#232f3e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
              <p className="text-xs text-white/54">sistem gücü</p>
              <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">4x</p>
            </div>
            <div className="absolute bottom-0 right-0 rounded-[26px] border border-[#aaff01]/25 bg-[#0b1016] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-xs text-white/54">ölçüm</p>
              <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">canlı</p>
            </div>
          </div>
        </div>
      </section>
  );
}
