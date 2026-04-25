import { ActionButton, ArrowRight, BarChart3, CalendarDays, CalendarRange, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, LayoutDashboard, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MessageSquareText, Package2, PackageCard, PackageFeatureBullet, Palette, PaymentLogos, Reply, SectionHeading, Users, X, Youtube, featureTiles, getFooterLinkTarget, journeyCards, logoImage, navItems, packageCards, socialBrandIcon, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialProIcon, socialSnapchatIcon, socialStartIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, stepAccountImage, stepDashboardImage, stepMeetingImage } from "../../SocialMediaServiceHome.shared";

export default function JourneySection() {
  return (
    <section className="bg-[#161616] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] gap-8 px-6 lg:grid-cols-3 lg:px-10">
          {journeyCards.map((card) => (
            <JourneyCard key={card.title} {...card} />
          ))}
        </div>
      </section>
  );
}
