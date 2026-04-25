import type { PaidAdsVariant } from "../../PaidAdsServiceHome.shared";
import { ActionButton, ArrowUpRight, BarChart3, CalendarDays, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, Link, Linkedin, Mail, Menu, MessageCircle, MousePointerClick, Package2, PackageCard, PackageFeatureBullet, PaidAdsHeroVisual, PaymentLogos, ProcessCard, Radar, Search, SectionHeading, TileCard, TrendingUp, X, Youtube, amazonIcon, analyticsIconFallback, calendarIcon, campaignIcon, chartIcon, dashboardIcon, defaultAdFeatures, fastIcon, funnelIcon, gaugeIcon, getFooterLinkTarget, googleAdsIcon, googleFeatures, googleIcon, googlePackages, googleReportIcon, googleStructureIcon, googleTestIcon, graphIcon, growthPackageIcon, journeyAccountImage, journeyCards, journeyDashboardImage, journeyMeetingImage, logoImage, mediaHubPackage, messageIcon, metaAdsIcon, metaIcon, metaPackages, metaReportIcon, metaStructureIcon, metaTestIcon, navItems, reportIcon, scalePackageIcon, searchIcon, starterPackageIcon, strategyIcon, targetIcon, tiktokFeatures, tiktokIcon, tiktokPackages, usersIcon, variants } from "../../PaidAdsServiceHome.shared";

export default function IntroSection({ variant }: { variant: PaidAdsVariant }) {
  const data = variants[variant];
  const introGrid =
    data.intro.cards.length === 4
      ? "mx-auto mt-14 grid max-w-[1180px] gap-8 md:grid-cols-2 xl:grid-cols-4"
      : "mx-auto mt-14 grid max-w-[860px] gap-8 md:grid-cols-3";
  return (
    <section className="bg-[linear-gradient(180deg,#151515_0%,#222222_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
          <SectionHeading center highlight={data.intro.highlight} highlightTone={data.intro.tone} prefix={data.intro.prefix} />
          <p className="mx-auto mt-8 max-w-[780px] text-base leading-7 text-white/70 md:text-lg">{data.intro.description}</p>
          <div className={introGrid}>
            {data.intro.cards.map((card) => (
              <TileCard key={card.title} {...card} tone={data.intro.tone} />
            ))}
          </div>
        </div>
      </section>
  );
}
