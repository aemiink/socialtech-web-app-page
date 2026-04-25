import { ActionButton, CalendarDays, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, SectionHeading, ValueCard, WorkflowCard, X, Youtube, analyticsIcon, codeIcon, designIcon, getFooterLinkTarget, illustratorIcon, logoImage, navItems, packageCards, photoshopIcon, proPackageIcon, scalePackageIcon, signalIcon, starterPackageIcon, toolIcons, valueCards, workflow } from "../../LandingPageServiceHome.shared";

export default function CtaSection() {
  return (
    <section className="bg-[#111111] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
          <SectionHeading center highlight="Bugün Başlayalım!" prefix="Projenize" />
          <p className="mx-auto mt-8 max-w-[920px] text-lg leading-8 text-white/70">
            Markanızı güçlendirecek profesyonel tasarımlar için hemen iletişime geçin. İlk konsültasyon ücretsiz!
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[280px]" to="/iletisim#contact-form" label="Ücretsiz Konsültasyon İste" />
            <ActionButton accent="violet" className="min-w-[240px]" to="/iletisim#contact-form" label="WhatsApp'a Git" />
          </div>
        </div>
      </section>
  );
}
