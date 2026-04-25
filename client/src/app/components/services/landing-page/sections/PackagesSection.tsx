import { ActionButton, CalendarDays, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, SectionHeading, ValueCard, WorkflowCard, X, Youtube, analyticsIcon, codeIcon, designIcon, getFooterLinkTarget, illustratorIcon, logoImage, navItems, packageCards, photoshopIcon, proPackageIcon, scalePackageIcon, signalIcon, starterPackageIcon, toolIcons, valueCards, workflow } from "../../LandingPageServiceHome.shared";

export default function PackagesSection() {
  return (
    <section className="bg-[#151515] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[980px] text-center text-lg leading-8 text-white/72">
            Landing Page için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için
            sayfamızı ziyaret etmeyi unutmayın!
          </p>

          <PaymentLogos />

          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packageCards.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-[980px] text-center text-base leading-8 text-white/72 md:text-lg">
            Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
            <Link className="mx-2 font-bold text-[#b5ff15] underline" to="/iletisim#contact-form">
              formu
            </Link>
            doldurun, beraber karar verelim!
          </p>
        </div>
      </section>
  );
}
