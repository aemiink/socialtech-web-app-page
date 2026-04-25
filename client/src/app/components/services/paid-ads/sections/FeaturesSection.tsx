import type { PaidAdsVariant } from "../../PaidAdsServiceHome.shared";
import { ActionButton, ArrowUpRight, BarChart3, CalendarDays, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, Link, Linkedin, Mail, Menu, MessageCircle, MousePointerClick, Package2, PackageCard, PackageFeatureBullet, PaidAdsHeroVisual, PaymentLogos, ProcessCard, Radar, Search, SectionHeading, TileCard, TrendingUp, X, Youtube, amazonIcon, analyticsIconFallback, calendarIcon, campaignIcon, chartIcon, dashboardIcon, defaultAdFeatures, fastIcon, funnelIcon, gaugeIcon, getFooterLinkTarget, googleAdsIcon, googleFeatures, googleIcon, googlePackages, googleReportIcon, googleStructureIcon, googleTestIcon, graphIcon, growthPackageIcon, journeyAccountImage, journeyCards, journeyDashboardImage, journeyMeetingImage, logoImage, mediaHubPackage, messageIcon, metaAdsIcon, metaIcon, metaPackages, metaReportIcon, metaStructureIcon, metaTestIcon, navItems, reportIcon, scalePackageIcon, searchIcon, starterPackageIcon, strategyIcon, targetIcon, tiktokFeatures, tiktokIcon, tiktokPackages, usersIcon, variants } from "../../PaidAdsServiceHome.shared";

export default function FeaturesSection({ variant }: { variant: PaidAdsVariant }) {
  const data = variants[variant];
  const featureBg =
    data.features.tone === "lime"
      ? "bg-[linear-gradient(180deg,#10170b_0%,#aaff01_100%)]"
      : "bg-[linear-gradient(180deg,#08090b_0%,#672bb5_100%)]";
  return (
    <>
      <section className={`${featureBg} py-24`}>
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading
            center
            highlight={data.features.highlight}
            highlightTone={data.features.tone}
            prefix={data.features.title}
          />
          <p className="mx-auto mt-8 max-w-[760px] text-center text-base leading-7 text-white/74 md:text-lg">
            {data.features.description}
          </p>
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.features.items.map((item) => (
              <FeatureTile key={item.label} {...item} tone={data.features.tone} />
            ))}
          </div>

          {data.platforms ? (
            <div className="mx-auto mt-20 max-w-[1280px] rounded-lg bg-[#1b1029] p-8">
              <h2 className="text-[26px] font-bold text-[#8a38f5] md:text-[32px]">Hangi Platformlarda Çalışıyoruz?</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {data.platforms.map((platform) => (
                  <ProcessCard key={platform.title} {...platform} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[#111111] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight={data.process.highlight} highlightTone="violet" prefix={data.process.prefix} />
          {data.process.description ? (
            <p className="mx-auto mt-8 max-w-[760px] text-center text-base leading-7 text-white/70 md:text-lg">
              {data.process.description}
            </p>
          ) : null}

          <div className="mx-auto mt-12 max-w-[1280px] rounded-lg bg-[#070809] p-6 lg:p-8">
            {data.process.splitIntro ? (
              <div className="grid gap-8 lg:grid-cols-[0.82fr_1fr]">
                <div className="space-y-4">
                  {data.process.splitIntro.map((item) => (
                    <article key={item.title} className="rounded-lg bg-white/14 px-5 py-4">
                      <div className="flex items-center gap-4">
                        <img alt="" className="h-8 w-8 object-contain" src={item.icon} />
                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                      </div>
                    </article>
                  ))}
                </div>
                <div>
                  <h3 className="text-[30px] font-bold leading-tight text-white">
                    Media Hub ile
                    <br />
                    Tanışın
                  </h3>
                  <div className="mt-7 grid gap-4 md:grid-cols-2">
                    {data.process.cards.map((item) => (
                      <article key={item.title} className="rounded-lg bg-white/10 p-5">
                        <div className="flex items-start gap-4">
                          <img alt="" className="h-7 w-7 object-contain" src={item.icon} />
                          <div>
                            <h4 className="font-bold text-[#8a38f5]">{item.title}</h4>
                            <p className="mt-2 text-sm leading-6 text-white/68">{item.description}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {data.process.cards.map((item) => (
                  <ProcessCard key={item.title} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
