import { ActionButton, BellRing, CapabilityCard, CloudCog, Code2, Facebook, FeatureCard, Fingerprint, Gauge, HeroBackdrop, HighlightTitle, Instagram, Layers3, Link, Linkedin, Mail, MonitorSmartphone, PackageCard, PackageFeatureBullet, PaymentLogos, PhoneVisual, RadioTower, ShieldCheck, Smartphone, Store, Youtube, capabilityCards, getFooterLinkTarget, growthPackageIcon, logoImage, packages, processSteps, productLayers, scalePackageIcon, starterPackageIcon } from "../../MobileAppServiceHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[940px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111317" />

        <div className="relative z-10 mx-auto grid min-h-[900px] w-full max-w-[1540px] items-center gap-14 px-6 pb-24 pt-28 text-center lg:grid-cols-[0.94fr_0.9fr] lg:px-10 lg:pt-32 lg:text-left">
          <div className="mx-auto flex max-w-[760px] flex-col items-center lg:mx-0 lg:items-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1.5 text-xs font-extrabold text-[#11160b]">
              <Smartphone className="h-4 w-4" />
              Mobil Uygulama
            </span>
            <h1 className="mt-7 max-w-[900px] text-[40px] font-medium leading-tight tracking-tight text-white md:text-[68px]">
              Sadece app değil,
              <span className="block font-extrabold text-[#aaff01]">kullanıcı alışkanlığı inşa ediyoruz.</span>
            </h1>
            <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/76 md:text-xl">
              Mobil uygulamanızı fikirden yayına; panel, API, bildirim, analitik ve büyüme döngüsüyle birlikte tasarlıyoruz. Amacımız indirilen bir uygulama değil,
              <span className="mx-2 font-extrabold text-[#aaff01]">tekrar tekrar kullanılan bir ürün.</span>
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <ActionButton accent="lime" className="min-w-[260px]" href="#packages" label="Paketleri İncele" />
              <ActionButton accent="violet" className="min-w-[260px]" href="#system" label="Sistemi Gör" />
            </div>
          </div>

          <PhoneVisual />
        </div>
      </section>
  );
}
