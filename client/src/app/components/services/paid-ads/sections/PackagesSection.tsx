import type { PaidAdsVariant } from "../../PaidAdsServiceHome.shared";
import { ActionButton, ArrowUpRight, BarChart3, CalendarDays, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, Link, Linkedin, Mail, Menu, MessageCircle, MousePointerClick, Package2, PackageCard, PackageFeatureBullet, PaidAdsHeroVisual, PaymentLogos, ProcessCard, Radar, Search, SectionHeading, TileCard, TrendingUp, X, Youtube, amazonIcon, analyticsIconFallback, calendarIcon, campaignIcon, chartIcon, dashboardIcon, defaultAdFeatures, fastIcon, funnelIcon, gaugeIcon, getFooterLinkTarget, googleAdsIcon, googleFeatures, googleIcon, googlePackages, googleReportIcon, googleStructureIcon, googleTestIcon, graphIcon, growthPackageIcon, journeyAccountImage, journeyCards, journeyDashboardImage, journeyMeetingImage, logoImage, mediaHubPackage, messageIcon, metaAdsIcon, metaIcon, metaPackages, metaReportIcon, metaStructureIcon, metaTestIcon, navItems, reportIcon, scalePackageIcon, searchIcon, starterPackageIcon, strategyIcon, targetIcon, tiktokFeatures, tiktokIcon, tiktokPackages, usersIcon, variants } from "../../PaidAdsServiceHome.shared";

export default function PackagesSection({ variant }: { variant: PaidAdsVariant }) {
  const data = variants[variant];
  const packageGrid =
    data.packages.cards.length === 1
      ? "mx-auto mt-16 grid max-w-[460px] gap-8"
      : "mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]";
  return (
    <section className="bg-[#111111] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-base leading-7 text-white/72 md:text-lg">
            {data.packages.description}
          </p>

          <PaymentLogos />

          <div className={packageGrid}>
            {data.packages.cards.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-[980px] text-center text-base leading-8 text-white/72 md:text-lg">
            {data.packages.footer}
          </p>
        </div>
      </section>
  );
}
