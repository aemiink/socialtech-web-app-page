import { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, FeaturePill, HeroBackdrop, HeroSection, HeroVisual, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, MetricCard, Package2, PackageCard, PackageCheck, PackageFeatureBullet, PlaybookCard, Search, ShieldCheck, ShoppingCart, SignalCard, Store, SystemStep, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, featureItems, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, metricCards, navItems, packages, playbookCards, scalePackageIcon, signalCards, starterPackageIcon, systemSteps } from "../../AmazonAdsServiceHome.shared";

export default function FeaturesSection() {
  return (
    <section className="bg-[#171717] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <h2 className="text-center text-[34px] font-extrabold leading-tight text-white md:text-[46px]">
            Amazon Ads Paketinin
            <span className="block italic text-[#aaff01]">Hizmet Özellikleri</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[780px] text-center text-lg leading-8 text-white/72">
            Satın alacağınız Amazon reklam yönetimi; kampanya kurulumundan ürün sayfası önerilerine kadar uçtan uca sistem mantığıyla oluşturulur.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureItems.map((item) => (
              <FeaturePill key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>
  );
}
