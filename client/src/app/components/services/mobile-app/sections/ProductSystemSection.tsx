import { ActionButton, BellRing, CapabilityCard, CloudCog, Code2, Facebook, FeatureCard, Fingerprint, Gauge, HeroBackdrop, HighlightTitle, Instagram, Layers3, Link, Linkedin, Mail, MonitorSmartphone, PackageCard, PackageFeatureBullet, PaymentLogos, PhoneVisual, RadioTower, ShieldCheck, Smartphone, Store, Youtube, capabilityCards, getFooterLinkTarget, growthPackageIcon, logoImage, packages, processSteps, productLayers, scalePackageIcon, starterPackageIcon } from "../../MobileAppServiceHome.shared";

export default function ProductSystemSection() {
  return (
    <section className="bg-[#0b0d11] py-24" id="system">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Ürün Sistemidir" prefix="Mobil Uygulama Bir" />
          <p className="mx-auto mt-8 max-w-[840px] text-center text-lg leading-8 text-white/68">
            App tarafını yalnızca ekran tasarımı veya kodlama işi gibi görmüyoruz. Kullanıcı, veri, bildirim, panel ve büyüme hedefi aynı masada planlanır.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {productLayers.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
  );
}
