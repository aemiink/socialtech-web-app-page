import { ActionButton, CalendarDays, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, SectionHeading, ValueCard, WorkflowCard, X, Youtube, analyticsIcon, codeIcon, designIcon, getFooterLinkTarget, illustratorIcon, logoImage, navItems, packageCards, photoshopIcon, proPackageIcon, scalePackageIcon, signalIcon, starterPackageIcon, toolIcons, valueCards, workflow } from "../../LandingPageServiceHome.shared";

export default function ValueSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#070809_0%,#242424_50%,#070809_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Gerçeğe Geçmiyor mu?" prefix="Web Siteniz için Fikirleriniz Var ama" />
          <p className="mx-auto mt-8 max-w-[980px] text-center text-lg leading-8 text-white/70">
            Tasarım sürecimizde fark yaratan özelliklerle fikirlerinizi hayata geçireceğiz. Web sitenizi kodlatmadan önce
            tasarımınızı oluşturun!
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {valueCards.map((card) => (
              <ValueCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
  );
}
