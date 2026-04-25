import { ActionButton, BellRing, CapabilityCard, CloudCog, Code2, Facebook, FeatureCard, Fingerprint, Gauge, HeroBackdrop, HighlightTitle, Instagram, Layers3, Link, Linkedin, Mail, MonitorSmartphone, PackageCard, PackageFeatureBullet, PaymentLogos, PhoneVisual, RadioTower, ShieldCheck, Smartphone, Store, Youtube, capabilityCards, getFooterLinkTarget, growthPackageIcon, logoImage, packages, processSteps, productLayers, scalePackageIcon, starterPackageIcon } from "../../MobileAppServiceHome.shared";

export default function ProcessSection() {
  return (
    <section className="bg-[#111317] py-24">
        <div className="mx-auto w-full max-w-[1540px] rounded-[34px] border border-white/10 bg-black p-8 shadow-[0_30px_100px_rgba(0,0,0,0.32)] lg:p-12">
          <HighlightTitle highlight="Çalışıyoruz?" prefix="Nasıl" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <article className="rounded-[22px] bg-[#222629] p-7" key={step.title}>
                <span className="text-sm font-black text-[#aaff01]">{step.step}</span>
                <h3 className="mt-5 text-xl font-extrabold text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/62">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
  );
}
