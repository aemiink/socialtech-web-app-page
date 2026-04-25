import { ActionButton, ArrowRight, BarChart3, CalendarDays, CalendarRange, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, LayoutDashboard, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MessageSquareText, Package2, PackageCard, PackageFeatureBullet, Palette, PaymentLogos, Reply, SectionHeading, Users, X, Youtube, featureTiles, getFooterLinkTarget, journeyCards, logoImage, navItems, packageCards, socialBrandIcon, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialProIcon, socialSnapchatIcon, socialStartIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, stepAccountImage, stepDashboardImage, stepMeetingImage } from "../../SocialMediaServiceHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#111111" />

<div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
          <span className="rounded-full bg-[#b5ff15] px-4 py-1 text-xs font-bold text-[#102000]">Sosyal Medya</span>
          <h1 className="mt-7 max-w-[940px] text-[34px] font-bold leading-tight text-white md:text-[60px]">
            Sosyal Medya Yönetimini
            <br />
            Büyüme Sistemine Dönüştürün
          </h1>
          <p className="mt-7 max-w-[720px] text-base leading-8 text-white/78 md:text-xl">
            Sosyal medyayı,
            <span className="mx-2 font-semibold text-[#b5ff15]">marka bilinirliğinden satışa giden bir büyüme</span>
            sistemine dönüştürüyoruz.
          </p>
          <ActionButton accent="lime" className="mt-10" href="#packages" label="Paketleri İnceleyin" />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            {socialIcons.map((icon, index) => (
              <a key={index} className="transition hover:-translate-y-1" href="#packages">
                <img alt="" className="h-8 w-8 object-contain" src={icon} />
              </a>
            ))}
          </div>
        </div>
      </section>
  );
}
