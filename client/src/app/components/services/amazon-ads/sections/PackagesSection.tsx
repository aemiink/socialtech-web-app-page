import { ActionButton, BadgePercent, BarChart3, Boxes, CalendarDays, Facebook, FeaturePill, HeroBackdrop, HeroSection, HeroVisual, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, MetricCard, Package2, PackageCard, PackageCheck, PackageFeatureBullet, PlaybookCard, Search, ShieldCheck, ShoppingCart, SignalCard, Store, SystemStep, Target, Trophy, X, Youtube, accountImage, amazonIcon, dashboardImage, featureItems, getFooterLinkTarget, growthPackageIcon, logoImage, meetingImage, metricCards, navItems, packages, playbookCards, scalePackageIcon, signalCards, starterPackageIcon, systemSteps } from "../../AmazonAdsServiceHome.shared";

export default function PackagesSection() {
  return (
    <section className="bg-[#111317] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <h2 className="text-center text-[34px] font-extrabold leading-tight text-white md:text-[46px]">
            Hedeflerinize Göre
            <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">Amazon Paketleri</span>
          </h2>
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/72">
            Amazon’da reklam bütçesi, ürün sayfası ve karlılık birlikte yönetilmelidir. Paketleri katalog hacminize, kategori rekabetine ve büyüme hedefinize göre netleştiriyoruz.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-lg font-extrabold text-white/82">
            <span>Sponsored Products</span>
            <span className="text-[#aaff01]">Sponsored Brands</span>
            <span>Sponsored Display</span>
            <span className="text-[#aaff01]">Store</span>
            <span>DSP Ready</span>
          </div>
          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packages.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>
          <p className="mx-auto mt-14 max-w-[900px] text-center text-lg leading-8 text-white/76">
            Amazon’da hangi paketin size uygun olduğunu bilmiyorsanız hemen
            <Link className="mx-2 font-extrabold text-[#aaff01] underline" to="/iletisim#contact-form">
              formu
            </Link>
            doldurun; kategori, katalog ve bütçe yapınıza göre birlikte karar verelim.
          </p>
        </div>
      </section>
  );
}
