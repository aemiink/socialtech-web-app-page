import { CalendarDays, Facebook, Instagram, Linkedin, Mail, MessageCircle, Package2, X, Youtube } from "lucide-react";
import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";

import logoImage from "../../../assets/28d6c1698c390e901d670fea04f3d952314f5313.png";
import ActionButton from "./ActionButton";
import { getFooterLinkTarget } from "./footerLinks";

const usefulLinks = ["Anasayfa", "Müşteriler", "Bize Ulaşın", "Kariyer & Staj", "Portfolyo & Projeler", "Bloglar"];

const serviceLinks = [
  "Growth & Hub",
  "Sosyal Medya",
  "Dijital Pazarlama",
  "Web Sitesi Geliştirme",
  "Mobil Uygulama Geliştirme",
  "Reklam Yönetimi",
  "Amazon ADS Yönetimi",
  "Web Teknik Destek",
];

function isActiveLink(pathname: string, label: string) {
  const target = getFooterLinkTarget(label);

  return target.to ? pathname === target.to || pathname.startsWith(`${target.to}/`) : false;
}

function FooterLinkColumn({ title, links }: { title: string; links: string[] }) {
  const { pathname } = useLocation();

  return (
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-6 space-y-3 text-sm text-white/62">
        {links.map((link) => {
          const target = getFooterLinkTarget(link);
          const className = isActiveLink(pathname, link) ? "text-[#aaff01]" : "transition hover:text-[#aaff01]";

          return (
            <li key={link}>
              {target.to ? (
                <Link className={className} to={target.to}>
                  {link}
                </Link>
              ) : (
                <a className={className} href={target.href}>
                  {link}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SocialIconLink({ children }: { children: ReactNode }) {
  return (
    <a className="rounded-md border border-white/10 p-2 text-white/72 transition hover:text-[#aaff01]" href="#top">
      {children}
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-16" id="footer">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="grid gap-12 xl:grid-cols-[1.1fr_0.6fr_0.8fr_0.95fr]">
          <div>
            <img alt="Social Tech" className="h-12 w-auto object-contain" src={logoImage} />
            <p className="mt-6 max-w-[360px] text-sm leading-7 text-white/64">
              Pazarlama bütçenizden daha fazla sonuçlar elde etmek istiyorsanız, yeni partneriniz olmak için fazlasıyla hazırız!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <SocialIconLink>
                <Facebook className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Instagram className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Youtube className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Linkedin className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <Mail className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink>
                <X className="h-4 w-4" />
              </SocialIconLink>
            </div>
          </div>

          <FooterLinkColumn links={usefulLinks} title="Faydalı Linkler" />
          <FooterLinkColumn links={serviceLinks} title="Ürün ve Hizmetler" />

          <div className="flex flex-col gap-4">
            <ActionButton accent="violet" filled icon={<CalendarDays className="h-4 w-4" />} label="Online Toplantı Planla" to="/iletisim#contact-form" />
            <ActionButton accent="lime" filled icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp Destek Hattı" to="/iletisim#contact-form" />
            <ActionButton accent="cyan" filled icon={<Package2 className="h-4 w-4" />} label="Dijital Yolda Büyüme" to="/iletisim#contact-form" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
          <p>Copyright © 2025 SOCIAL TECH Reklam ve Teknoloji A.Ş</p>
          <div className="flex flex-wrap gap-5">
            <a href="#top">Gizlilik Politikası</a>
            <a href="#top">Mesafeli Satış Sözleşmesi</a>
            <a href="#top">K.V.K.K</a>
            <a href="#top">Çerez Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
