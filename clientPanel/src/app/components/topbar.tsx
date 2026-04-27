interface TopbarProps {
  selectedService?: string | null;
}

const serviceLabels: Record<string, string> = {
  'growth-hub': 'Growth & Hub',
  'social-media': 'Sosyal Medya Yönetimi',
  'media-hub': 'Medya Hub',
  'meta-ads': 'Meta ADS',
  'tiktok-ads': 'TikTok ADS',
  'google-ads': 'Google ADS',
  'amazon-ads': 'Amazon ADS',
  'web-app': 'Web APP',
  'mobile-app': 'Mobil APP',
  'landing-pages': 'Landing Pages',
  'web-mobile-design': 'Web & Mobil Tasarımlar',
  'technical-support': 'Teknik Destek',
  'seo-audit': 'SEO Denetimi',
};

export function Topbar({ selectedService }: TopbarProps) {
  return (
    <div className="h-20 bg-[#131313] border-b border-white/[0.08] px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-white text-xl">
            {selectedService ? serviceLabels[selectedService] : 'Merhaba, Ahmet'}
          </h1>
          <p className="text-sm text-[#A0A0A0]">
            {selectedService ? 'Servis performansı ve yönetimi' : 'Social Tech ile ortaklığınıza hoş geldiniz'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-white">Ahmet Yılmaz</div>
            <div className="text-xs text-[#A0A0A0]">Acme E-ticaret</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF] flex items-center justify-center">
            <span className="text-black">AY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
