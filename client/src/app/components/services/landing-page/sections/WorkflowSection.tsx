import { ActionButton, CalendarDays, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, SectionHeading, ValueCard, WorkflowCard, X, Youtube, analyticsIcon, codeIcon, designIcon, getFooterLinkTarget, illustratorIcon, logoImage, navItems, packageCards, photoshopIcon, proPackageIcon, scalePackageIcon, signalIcon, starterPackageIcon, toolIcons, valueCards, workflow } from "../../LandingPageServiceHome.shared";

export default function WorkflowSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#111111_0%,#282828_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="rounded-lg bg-[#070809] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:p-8">
            <h2 className="text-[30px] font-bold text-[#b5ff15] md:text-[36px]">Nasıl Çalışıyoruz?</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((item) => (
                <WorkflowCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
