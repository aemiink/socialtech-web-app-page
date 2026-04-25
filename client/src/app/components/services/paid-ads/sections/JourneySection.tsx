import type { PaidAdsVariant } from "../../PaidAdsServiceHome.shared";
import { ActionButton, ArrowUpRight, BarChart3, CalendarDays, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, Link, Linkedin, Mail, Menu, MessageCircle, MousePointerClick, Package2, PackageCard, PackageFeatureBullet, PaidAdsHeroVisual, PaymentLogos, ProcessCard, Radar, Search, SectionHeading, TileCard, TrendingUp, X, Youtube, amazonIcon, analyticsIconFallback, calendarIcon, campaignIcon, chartIcon, dashboardIcon, defaultAdFeatures, fastIcon, funnelIcon, gaugeIcon, getFooterLinkTarget, googleAdsIcon, googleFeatures, googleIcon, googlePackages, googleReportIcon, googleStructureIcon, googleTestIcon, graphIcon, growthPackageIcon, journeyAccountImage, journeyCards, journeyDashboardImage, journeyMeetingImage, logoImage, mediaHubPackage, messageIcon, metaAdsIcon, metaIcon, metaPackages, metaReportIcon, metaStructureIcon, metaTestIcon, navItems, reportIcon, scalePackageIcon, searchIcon, starterPackageIcon, strategyIcon, targetIcon, tiktokFeatures, tiktokIcon, tiktokPackages, usersIcon, variants } from "../../PaidAdsServiceHome.shared";

export default function JourneySection({ variant }: { variant: PaidAdsVariant }) {
  const data = variants[variant];
  return data.journey ? (
    <section className="bg-[#111111] py-10">
      <div className="mx-auto grid w-full max-w-[1540px] gap-8 px-6 lg:grid-cols-3 lg:px-10">
        {journeyCards.map((card) => (
          <JourneyCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  ) : null;
}
