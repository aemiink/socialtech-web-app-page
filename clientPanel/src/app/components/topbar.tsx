import { LogOut } from 'lucide-react';

interface TopbarProps {
  selectedService?: string | null;
  clientName: string;
  companyName: string;
  initials: string;
  onLogout: () => void;
}

const serviceLabels: Record<string, string> = {
  'growth-hub': 'Büyüme Merkezi',
  'social-media': 'Sosyal Medya Yönetimi',
  'media-hub': 'Medya Hub',
  'meta-ads': 'Meta Reklamları',
  'tiktok-ads': 'TikTok Reklamları',
  'google-ads': 'Google Reklamları',
  'amazon-ads': 'Amazon Reklamları',
  'web-app': 'Web Uygulama',
  'mobile-app': 'Mobil Uygulama',
  'landing-pages': 'Açılış Sayfaları',
  'web-mobile-design': 'Web & Mobil Tasarımlar',
  'technical-support': 'Teknik Destek',
  'seo-audit': 'SEO Denetimi',
};

export function Topbar({ selectedService, clientName, companyName, initials, onLogout }: TopbarProps) {
  return (
    <div className="h-14 bg-[#131313] border-b border-border px-6 flex items-center justify-between">
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
        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-sm text-[#A0A0A0] transition-all hover:border-[#AAFF01]/30 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Çıkış
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-white">{clientName}</div>
            <div className="text-xs text-[#A0A0A0]">{companyName}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF] flex items-center justify-center">
            <span className="text-black">{initials}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
