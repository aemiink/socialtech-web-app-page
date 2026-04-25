import { ActionButton, BellRing, CapabilityCard, CloudCog, Code2, Facebook, FeatureCard, Fingerprint, Gauge, HeroBackdrop, HighlightTitle, Instagram, Layers3, Link, Linkedin, Mail, MonitorSmartphone, PackageCard, PackageFeatureBullet, PaymentLogos, PhoneVisual, RadioTower, ShieldCheck, Smartphone, Store, Youtube, capabilityCards, getFooterLinkTarget, growthPackageIcon, logoImage, packages, processSteps, productLayers, scalePackageIcon, starterPackageIcon } from "../../MobileAppServiceHome.shared";

export default function CtaSection() {
  return (
    <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(170,255,1,0.24),transparent_34%),linear-gradient(180deg,#111317,#8be800)] py-24">
        <div className="mx-auto w-full max-w-[1100px] px-6 text-center lg:px-10">
          <h2 className="text-[34px] font-extrabold leading-tight text-white md:text-[48px]">
            App fikrinizi rafta bekletmeyelim.
            <span className="block text-[#11160b]">İlk sürümü birlikte çıkaralım.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[740px] text-lg leading-8 text-[#162005]/78">
            Sizi tanımadan teklif sunmuyoruz. Önce fikri, kullanıcıyı ve minimum canlıya çıkış kapsamını konuşuyoruz.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <ActionButton accent="violet" className="min-w-[240px]" to="/iletisim#contact-form" label="Ücretsiz Ön Görüşme" />
            <ActionButton accent="lime" className="min-w-[240px]" href="#packages" label="Paketleri İncele" />
          </div>
        </div>
      </section>
  );
}
