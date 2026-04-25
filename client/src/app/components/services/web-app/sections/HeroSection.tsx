import { ActionButton, BarChart3, CalendarDays, Check, Code2, Facebook, FaqCard, Gauge, Globe, HeroBackdrop, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PanelsTopLeft, Rocket, Search, SectionHeading, ShieldCheck, Sparkles, Users, ValueCard, Wrench, X, Youtube, customWindowIcon, faqItems, getFooterLinkTarget, interfaceIcon, lightningIcon, logoImage, meetingIcon, navItems, panelIcon, platforms, productIllustration, seoIcon, shopifyIcon, speedIcon, valueCards, wixIcon, wooIcon, wordpressIcon, workflow } from "../../WebAppServiceHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111111" />

<div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">Web Uygulamaları</span>
          <h1 className="mt-7 max-w-[980px] text-[34px] font-bold leading-tight text-white md:text-[60px]">
            Fikirden Ürüne
            <br />
            Web Uygulamaları İnşa Ediyoruz
          </h1>
          <p className="mt-7 max-w-[760px] text-base leading-8 text-white/78 md:text-xl">
            Sadece web sitesi değil;
            <span className="mx-2 font-semibold text-[#b5ff15]">iş hedeflerinize hizmet eden ölçeklenebilir web ürünleri</span>
            geliştiriyoruz.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[260px]" to="/iletisim#contact-form" label="Ücretsiz Ön Görüşme Planlayın" />
            <ActionButton accent="violet" className="min-w-[260px]" to="/iletisim#contact-form" label="Projenizi Anlatın" />
          </div>
        </div>
      </section>
  );
}
