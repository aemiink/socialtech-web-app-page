import { CreditCard, CheckCircle, Sparkles, Shield, Zap, Phone } from 'lucide-react';
import { useMeQuery } from '../features/auth/authApi';

const SERVICE_LABELS: Record<string, string> = {
  'meta-ads': 'Meta Ads Yönetimi',
  'tiktok-ads': 'TikTok Ads Yönetimi',
  'amazon-ads': 'Amazon Ads Yönetimi',
  'google-ads': 'Google Ads Yönetimi',
  'social-media': 'Sosyal Medya Yönetimi',
  'growth-hub': 'Growth Hub',
  'web-app': 'Web Uygulama Geliştirme',
  'mobile-app': 'Mobil Uygulama',
  'web-mobile-design': 'Web & Mobil Tasarım',
  'landing-pages': 'Landing Page',
  'seo-audit': 'SEO Denetimi',
  'technical-support': 'Teknik Destek',
  'media-hub': 'Medya Hub',
};

function getServiceLabel(key: string): string {
  return SERVICE_LABELS[key] ?? key;
}

function getServiceIcon(key: string): React.ElementType {
  if (key.includes('ads')) return Zap;
  if (key.includes('social') || key.includes('growth')) return Sparkles;
  return Shield;
}

export function BillingPage() {
  const { data: me, isLoading } = useMeQuery();

  const activeServices = (me?.purchasedServices ?? []).filter(
    (s) => s.status === 'ACTIVE',
  );

  return (
    <div className="min-h-full bg-[#131313]">
      <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Faturalama</h1>
          <p className="text-[#A0A0A0]">Aboneliğiniz ve aktif hizmetleriniz</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Aktif Hizmetler */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Aktif Hizmetler</h2>

            <div className="relative overflow-hidden rounded-xl border border-[#AAFF01]/[0.18] bg-[#202020] p-6">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(170,255,1,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 0% 100%, rgba(123,97,255,0.06) 0%, transparent 60%)',
                }}
              />
              <div className="relative space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#AAFF01]">Social Tech</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">Büyüme Paketi</h3>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 animate-pulse rounded bg-white/10" />
                    ))}
                  </div>
                ) : activeServices.length === 0 ? (
                  <p className="text-sm text-[#A0A0A0]">Aktif hizmet bulunamadı.</p>
                ) : (
                  <ul className="space-y-2">
                    {activeServices.map((service) => {
                      const Icon = getServiceIcon(service.serviceId);
                      return (
                        <li key={service.serviceId} className="flex items-center gap-3">
                          <Icon className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                          <span className="text-sm text-[#CFCFCF]">
                            {getServiceLabel(service.serviceId)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Fatura Durumu */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Fatura Durumu</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#202020] px-4 py-3">
                <span className="text-sm text-[#A0A0A0]">Ödeme Durumu</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#AAFF01]" />
                  <span className="text-sm font-medium text-[#AAFF01]">Aktif</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#202020] px-4 py-3">
                <span className="text-sm text-[#A0A0A0]">Sözleşme</span>
                <span className="text-sm font-medium text-white">Aktif</span>
              </div>
            </div>

            {/* Fatura geçmişi — backend endpoint yok */}
            <div className="rounded-xl border border-dashed border-white/[0.10] bg-[#202020]/50 p-5 text-center space-y-3">
              <CreditCard className="mx-auto h-8 w-8 text-[#A0A0A0]/50" />
              <p className="text-sm font-medium text-white/50">Fatura Geçmişi</p>
              <p className="text-xs text-white/30 leading-relaxed">
                Faturalarınıza ve ödeme geçmişinize ulaşmak için hesap yöneticinizle iletişime geçin.
              </p>
              <a
                href="mailto:info@socialtech.com.tr"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs text-[#A0A0A0] hover:text-white hover:border-white/[0.16] transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Hesap yöneticinize ulaşın
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
