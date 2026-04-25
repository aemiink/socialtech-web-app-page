import { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, FeaturePill, HeroBackdrop, HeroSection, HeroVisual, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, MetricCard, Package2, PackageCard, PackageCheck, PackageFeatureBullet, PlaybookCard, Search, ShieldCheck, ShoppingCart, SignalCard, Store, SystemStep, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, featureItems, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, metricCards, navItems, packages, playbookCards, scalePackageIcon, signalCards, starterPackageIcon, systemSteps } from "../../AmazonAdsServiceHome.shared";

export default function SystemSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#111820_0%,#232f3e_100%)] py-24" id="system">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-[#aaff01] px-4 py-1 text-xs font-extrabold text-black">Amazon Growth System</span>
              <h2 className="mt-6 text-[34px] font-extrabold leading-tight text-white md:text-[52px]">
                Satışa giden yolu
                <span className="block text-[#aaff01]">arama niyetinden sepete kadar kuruyoruz.</span>
              </h2>
              <p className="mt-7 text-lg leading-8 text-white/72">
                Amazon’da kazanan reklam hesabı, sadece kampanya kurulumuyla oluşmaz. Ürün sayfası, kampanya yapısı, hedefleme ve karlılık metrikleri aynı panelde konuşmalıdır.
              </p>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {metricCards.map((metric) => (
                  <MetricCard key={metric.value} {...metric} />
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-[#aaff01]/20 bg-black/36 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
              <div className="grid gap-5 md:grid-cols-2">
                {systemSteps.map((step) => (
                  <SystemStep key={step.title} {...step} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
