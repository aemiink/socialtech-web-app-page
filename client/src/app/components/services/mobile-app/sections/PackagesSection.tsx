import { ActionButton, BellRing, CapabilityCard, CloudCog, Code2, Facebook, FeatureCard, Fingerprint, Gauge, HeroBackdrop, HighlightTitle, Instagram, Layers3, Link, Linkedin, Mail, MonitorSmartphone, PackageCard, PackageFeatureBullet, PaymentLogos, PhoneVisual, RadioTower, ShieldCheck, Smartphone, Store, Youtube, capabilityCards, getFooterLinkTarget, growthPackageIcon, logoImage, packages, processSteps, productLayers, scalePackageIcon, starterPackageIcon } from "../../MobileAppServiceHome.shared";

export default function PackagesSection() {
  return (
    <section className="bg-[#111111] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <HighlightTitle center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[820px] text-center text-lg leading-8 text-white/68">
            Mobil ürünün kapsamı hedefe göre değişir. Bu yüzden paketleri başlangıç, ürünleşme ve ölçekleme ihtiyacına göre ayırdık.
          </p>
          <div className="mt-10">
            <PaymentLogos />
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {packages.map((pack) => (
              <PackageCard key={pack.name} pack={pack} />
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-[920px] text-center text-lg font-semibold leading-8 text-white/78">
            Eğer hangi paket size uygun bilmiyorsanız hemen
            <Link className="mx-2 font-black text-[#aaff01] underline" to="/iletisim#contact-form">
              formu
            </Link>
            doldurun, beraber karar verelim.
          </p>
        </div>
      </section>
  );
}
