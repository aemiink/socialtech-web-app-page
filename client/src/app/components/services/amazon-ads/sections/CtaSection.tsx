import { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, FeaturePill, HeroBackdrop, HeroSection, HeroVisual, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, MetricCard, Package2, PackageCard, PackageCheck, PackageFeatureBullet, PlaybookCard, Search, ShieldCheck, ShoppingCart, SignalCard, Store, SystemStep, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, featureItems, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, metricCards, navItems, packages, playbookCards, scalePackageIcon, signalCards, starterPackageIcon, systemSteps } from "../../AmazonAdsServiceHome.shared";

export default function CtaSection() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,rgba(170,255,1,0.28),#101316_72%)] py-24">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center px-6 text-center">
          <img alt="Amazon Ads" className="h-20 w-20 object-contain" src={amazonIcon} />
          <h2 className="mt-8 text-[34px] font-extrabold leading-tight text-white md:text-[46px]">
            Ürünleriniz rafta beklemesin.
            <span className="block text-[#aaff01]">Doğru aramada öne çıksın.</span>
          </h2>
          <p className="mt-6 max-w-[760px] text-lg leading-8 text-white/76">
            Amazon Ads hesabınızı, sadece kampanya paneli değil; kategori payı, karlılık ve marka savunması sistemi olarak ele alalım.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[260px]" to="/iletisim#contact-form" label="Amazon Analizi İste" />
            <ActionButton accent="violet" className="min-w-[260px]" to="/hizmetler/dijital-pazarlama-hub" label="Medya Hub'ı Gör" />
          </div>
        </div>
      </section>
  );
}
