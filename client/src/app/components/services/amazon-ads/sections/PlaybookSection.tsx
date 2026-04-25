import { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, FeaturePill, HeroBackdrop, HeroSection, HeroVisual, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, MetricCard, Package2, PackageCard, PackageCheck, PackageFeatureBullet, PlaybookCard, Search, ShieldCheck, ShoppingCart, SignalCard, Store, SystemStep, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, featureItems, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, metricCards, navItems, packages, playbookCards, scalePackageIcon, signalCards, starterPackageIcon, systemSteps } from "../../AmazonAdsServiceHome.shared";

export default function PlaybookSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#171717_0%,#0b0d11_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[34px] font-extrabold leading-tight text-white md:text-[46px]">
                Pazaryeri büyümesini
                <span className="block text-[#aaff01]">3 sprintte başlatıyoruz.</span>
              </h2>
              <p className="mt-6 max-w-[760px] text-lg leading-8 text-white/72">
                İlk gün reklam açıp beklemiyoruz. Önce zemini kontrol ediyor, sonra kampanya mimarisini kuruyor, kazanan sinyalleri ölçekliyoruz.
              </p>
            </div>
            <ActionButton accent="lime" href="#packages" label="Paketlere Git" />
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {playbookCards.map((card) => (
              <PlaybookCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
  );
}
