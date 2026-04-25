import { ActionButton, BarChart3, CalendarDays, Check, Code2, Facebook, FaqCard, Gauge, Globe, HeroBackdrop, Instagram, Layers3, Link, Linkedin, Mail, Menu, MessageCircle, Package2, PanelsTopLeft, Rocket, Search, SectionHeading, ShieldCheck, Sparkles, Users, ValueCard, Wrench, X, Youtube, customWindowIcon, faqItems, getFooterLinkTarget, interfaceIcon, lightningIcon, logoImage, meetingIcon, navItems, panelIcon, platforms, productIllustration, seoIcon, shopifyIcon, speedIcon, valueCards, wixIcon, wooIcon, wordpressIcon, workflow } from "../../WebAppServiceHome.shared";

export default function FaqSection() {
  return (
    <section className="bg-[#151515] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="border-l-4 border-[#8a38f5] pl-5">
            <h2 className="text-[34px] font-bold text-white md:text-[42px]">Sıkça Sorulan Sorular</h2>
            <p className="mt-4 text-lg text-[#8a38f5]">Web tasarımı hakkında merak edilen ve sık sorulan sorular</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {faqItems.map((item) => (
              <FaqCard key={item.question} {...item} />
            ))}
          </div>
        </div>
      </section>
  );
}
