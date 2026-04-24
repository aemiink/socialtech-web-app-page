type FooterLinkTarget = {
  href?: string;
  to?: string;
};

const footerLinkTargets: Record<string, FooterLinkTarget> = {
  Anasayfa: { to: "/" },
  "Müşteriler": { to: "/musteriler" },
  "Bize Ulaşın": { to: "/iletisim" },
  "Kariyer & Staj": { to: "/kariyer" },
  "Portfolyo & Projeler": { to: "/calismalar" },
  Bloglar: { to: "/calismalar" },
  "Growth & Hub": { to: "/hizmetler/buyume-hub" },
  "Sosyal Medya": { to: "/hizmetler/sosyal-medya" },
  "Dijital Pazarlama": { to: "/hizmetler/dijital-pazarlama-hub" },
  "Web Sitesi Geliştirme": { to: "/hizmetler/web-uygulama" },
  "Web Uygulaması Geliştirme": { to: "/hizmetler/web-uygulama" },
  "Mobil Uygulama Geliştirme": { to: "/hizmetler/mobil-uygulama" },
  "Mobil Uygulamalar": { to: "/hizmetler/mobil-uygulama" },
  "Reklam Yönetimi": { to: "/hizmetler/dijital-pazarlama-hub" },
  "Amazon ADS Yönetimi": { to: "/hizmetler/amazon-reklamlari" },
  "Amazon Ads": { to: "/hizmetler/amazon-reklamlari" },
  "Web Teknik Destek": { to: "/hizmetler/web-teknik-destek" },
};

export function getFooterLinkTarget(label: string): FooterLinkTarget {
  return footerLinkTargets[label] ?? { href: "#top" };
}
