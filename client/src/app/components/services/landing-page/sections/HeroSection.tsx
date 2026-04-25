import { ActionButton, CalendarDays, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, SectionHeading, ValueCard, WorkflowCard, X, Youtube, analyticsIcon, codeIcon, designIcon, getFooterLinkTarget, illustratorIcon, logoImage, navItems, packageCards, photoshopIcon, proPackageIcon, scalePackageIcon, signalIcon, starterPackageIcon, toolIcons, valueCards, workflow } from "../../LandingPageServiceHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111111" />

<div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">UI/UX Tasarım</span>
          <h1 className="mt-7 max-w-[980px] text-[34px] font-medium leading-tight text-white md:text-[56px]">
            Markanızı Görsel Olarak
            <br />
            <span className="font-extrabold">Öne Çıkaran Tasarımlar</span>
          </h1>
          <p className="mt-7 max-w-[900px] text-base leading-8 text-white/78 md:text-xl">
            Modern, kullanıcı odaklı ve markanızın hikayesini anlatan özel tasarım çözümleri sunuyoruz.
            <span className="mx-2 font-extrabold text-[#b5ff15]">
              UI/UX tasarımından marka kimliğine kadar tüm görsel ihtiyaçlarınız
            </span>
            için yanınızdayız.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[280px]" to="/iletisim#contact-form" label="Ücretsiz Konsültasyon İste" />
            <ActionButton accent="violet" className="min-w-[240px]" href="#packages" label="Paketleri İncele" />
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {toolIcons.map((tool) => (
              <div key={tool.label} className="flex h-20 w-20 items-center justify-center rounded-lg bg-black/20 backdrop-blur">
                <img alt={tool.label} className="h-14 w-14 object-contain" src={tool.icon} />
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}
