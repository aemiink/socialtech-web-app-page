import { ActionButton, ArrowRight, CalendarDays, ChannelsSection, Check, Facebook, HeroBackdrop, HeroSection, Instagram, JourneyCard, Link, Linkedin, Mail, Menu, MessageCircle, NextStepSection, Package2, PackageCard, PackageFeatureBullet, PackagesSection, PaymentLogos, SectionTitle, StatCard, X, Youtube, accountImage, channelCards, dashboardImage, flashIcon, getFooterLinkTarget, growthIcon, growthPackageIcon, journeyCards, launchPackageIcon, logoImage, meetingImage, navItems, nextStepImage, packageCards, scalePackageIcon, stats, targetIcon } from "../../GrowthHubServiceHome.shared";

export default function JourneySection() {
  return (
    <section className="bg-[#111317] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-10 px-6 lg:grid-cols-3 lg:px-10">
          {journeyCards.map((card) => (
            <JourneyCard key={card.title} {...card} />
          ))}
        </div>
      </section>
  );
}
