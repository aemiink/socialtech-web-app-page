import type { PaidAdsVariant } from "../../PaidAdsServiceHome.shared";
import { ActionButton, ArrowUpRight, BarChart3, CalendarDays, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, Link, Linkedin, Mail, Menu, MessageCircle, MousePointerClick, Package2, PackageCard, PackageFeatureBullet, PaidAdsHeroVisual, PaymentLogos, ProcessCard, Radar, Search, SectionHeading, TileCard, TrendingUp, X, Youtube, amazonIcon, analyticsIconFallback, calendarIcon, campaignIcon, chartIcon, dashboardIcon, defaultAdFeatures, fastIcon, funnelIcon, gaugeIcon, getFooterLinkTarget, googleAdsIcon, googleFeatures, googleIcon, googlePackages, googleReportIcon, googleStructureIcon, googleTestIcon, graphIcon, growthPackageIcon, journeyAccountImage, journeyCards, journeyDashboardImage, journeyMeetingImage, logoImage, mediaHubPackage, messageIcon, metaAdsIcon, metaIcon, metaPackages, metaReportIcon, metaStructureIcon, metaTestIcon, navItems, reportIcon, scalePackageIcon, searchIcon, starterPackageIcon, strategyIcon, targetIcon, tiktokFeatures, tiktokIcon, tiktokPackages, usersIcon, variants } from "../../PaidAdsServiceHome.shared";

export default function HeroSection({ variant }: { variant: PaidAdsVariant }) {
  const data = variants[variant];
  return (
    <section className="relative isolate flex min-h-[940px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111111" />

<div className="relative z-10 mx-auto grid min-h-[790px] w-full max-w-[1540px] items-center gap-14 px-6 pb-24 pt-24 text-center lg:grid-cols-[0.92fr_0.88fr] lg:px-10 lg:pt-28 lg:text-left">
          <div className="mx-auto flex max-w-[760px] flex-col items-center lg:mx-0 lg:items-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1.5 text-xs font-extrabold text-[#121212]">
              <img alt="" className="h-4 w-4 object-contain" src={data.heroVisual.icon} />
              {data.badge}
            </span>
            <h1 className="mt-7 max-w-[860px] text-[40px] font-medium leading-tight tracking-tight text-white md:text-[68px]">{data.heroTitle}</h1>
            <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/76 md:text-xl">{data.heroText}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <ActionButton accent="lime" className="min-w-[260px]" to="/iletisim#contact-form" label={data.primaryCta} />
              <ActionButton accent="violet" className="min-w-[260px]" href="#packages" label="Paketleri İncele" />
            </div>
          </div>

          <PaidAdsHeroVisual visual={data.heroVisual} />
        </div>
      </section>
  );
}
