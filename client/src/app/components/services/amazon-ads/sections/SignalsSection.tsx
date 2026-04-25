import { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, FeaturePill, HeroBackdrop, HeroSection, HeroVisual, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, MetricCard, Package2, PackageCard, PackageCheck, PackageFeatureBullet, PlaybookCard, Search, ShieldCheck, ShoppingCart, SignalCard, Store, SystemStep, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, featureItems, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, metricCards, navItems, packages, playbookCards, scalePackageIcon, signalCards, starterPackageIcon, systemSteps } from "../../AmazonAdsServiceHome.shared";

export default function SignalsSection() {
  return (
    <section className="bg-[#0b0d11] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
              Amazon reklamı bir kampanya değil,
              <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">ürün rafı stratejisidir.</span>
            </h2>
            <p className="mt-7 text-lg leading-8 text-white/72">
              Arama sonucu, ürün sayfası, fiyat, yorum, stok ve reklam bütçesi aynı anda çalışmadığında Amazon Ads sadece pahalı tıklama üretir. Biz sistemi birlikte kurarız.
            </p>
          </div>
          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {signalCards.map((card) => (
              <SignalCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
  );
}
