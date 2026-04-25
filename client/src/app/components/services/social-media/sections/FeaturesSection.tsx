import { ActionButton, ArrowRight, BarChart3, CalendarDays, CalendarRange, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, LayoutDashboard, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MessageSquareText, Package2, PackageCard, PackageFeatureBullet, Palette, PaymentLogos, Reply, SectionHeading, Users, X, Youtube, featureTiles, getFooterLinkTarget, journeyCards, logoImage, navItems, packageCards, socialBrandIcon, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialProIcon, socialSnapchatIcon, socialStartIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, stepAccountImage, stepDashboardImage, stepMeetingImage } from "../../SocialMediaServiceHome.shared";

export default function FeaturesSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#08090b_0%,#672bb5_100%)] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading
            center
            highlight="Hizmet Özellikleri"
            highlightClassName="bg-transparent px-0 text-[#b5ff15]"
            prefix="Sosyal Medya Paketinin"
          />
          <p className="mx-auto mt-8 max-w-[820px] text-center text-lg leading-8 text-white/72">
            Satın alacağınız sosyal medya paketinin özellikleri aşağıdaki ihtiyaçlara göre oluşturulmuştur.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureTiles.map((tile) => {
              const Icon = tile.icon;

              return <FeatureTile key={tile.label} icon={<Icon className="h-6 w-6" />} label={tile.label} />;
            })}
          </div>
        </div>
      </section>
  );
}
