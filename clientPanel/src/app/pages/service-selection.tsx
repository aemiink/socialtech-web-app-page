import {
  TrendingUp,
  MessageSquare,
  Video,
  Megaphone,
  Search,
  ShoppingCart,
  Code,
  Smartphone,
  FileText,
  Palette,
  Headphones,
  BarChart3,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import type { ServiceId } from '../data/service-pages';

interface Service {
  id: ServiceId;
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'active' | 'inactive';
  metrics?: { label: string; value: string }[];
}

const services: Service[] = [
  {
    id: 'growth-hub',
    title: 'Growth & Hub',
    description: 'Büyüme stratejisi, sosyal medya, reklamlar ve raporlama',
    icon: TrendingUp,
    status: 'active',
    metrics: [{ label: 'Toplam Lead', value: '247' }, { label: 'ROAS', value: '4.2x' }]
  },
  {
    id: 'social-media',
    title: 'Sosyal Medya Yönetimi',
    description: 'İçerik planlama, üretim, DM yönetimi ve rakip analizi',
    icon: MessageSquare,
    status: 'active',
    metrics: [{ label: 'Yayınlanan', value: '18' }, { label: 'Bekleyen', value: '3' }]
  },
  {
    id: 'media-hub',
    title: 'Medya Hub',
    description: 'Tüm reklam kanallarının birleşik yönetimi',
    icon: Video,
    status: 'active',
    metrics: [{ label: 'Toplam Harcama', value: '₺42K' }, { label: 'Blended ROAS', value: '3.8x' }]
  },
  {
    id: 'meta-ads',
    title: 'Meta ADS',
    description: 'Facebook ve Instagram reklam kampanyaları',
    icon: Megaphone,
    status: 'active',
    metrics: [{ label: 'ROAS', value: '4.8x' }, { label: 'Lead', value: '147' }]
  },
  {
    id: 'tiktok-ads',
    title: 'TikTok ADS',
    description: 'TikTok reklam kampanyaları ve UGC içerik',
    icon: Video,
    status: 'active',
    metrics: [{ label: 'CTR', value: '2.4%' }, { label: 'CPA', value: '₺95' }]
  },
  {
    id: 'google-ads',
    title: 'Google ADS',
    description: 'Arama, Display ve Performance Max kampanyaları',
    icon: Search,
    status: 'active',
    metrics: [{ label: 'Dönüşüm', value: '89' }, { label: 'CPA', value: '₺124' }]
  },
  {
    id: 'amazon-ads',
    title: 'Amazon ADS',
    description: 'Amazon Sponsored Products, Brands ve Display',
    icon: ShoppingCart,
    status: 'active',
    metrics: [{ label: 'ACOS', value: '18%' }, { label: 'Satış', value: '₺22K' }]
  },
  {
    id: 'web-app',
    title: 'Web APP',
    description: 'Web uygulama geliştirme ve SEO yapısı',
    icon: Code,
    status: 'active',
    metrics: [{ label: 'İlerleme', value: '%65' }, { label: 'Sprint', value: '3/5' }]
  },
  {
    id: 'mobile-app',
    title: 'Mobil APP',
    description: 'iOS ve Android uygulama geliştirme',
    icon: Smartphone,
    status: 'active',
    metrics: [{ label: 'Ekranlar', value: '12/18' }, { label: 'Build', value: 'Beta' }]
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    description: 'Dönüşüm odaklı açılış sayfaları',
    icon: FileText,
    status: 'active',
    metrics: [{ label: 'Aktif', value: '3' }, { label: 'CVR', value: '3.2%' }]
  },
  {
    id: 'web-mobile-design',
    title: 'Web & Mobil Tasarımlar',
    description: 'UI/UX tasarım, design system ve prototip',
    icon: Palette,
    status: 'active',
    metrics: [{ label: 'Ekranlar', value: '24' }, { label: 'Revizyon', value: '2' }]
  },
  {
    id: 'technical-support',
    title: 'Teknik Destek',
    description: 'Bakım, güvenlik, backup ve teknik destek',
    icon: Headphones,
    status: 'active',
    metrics: [{ label: 'Açık Talep', value: '2' }, { label: 'Uptime', value: '99.9%' }]
  },
  {
    id: 'seo-audit',
    title: 'SEO Denetimi',
    description: 'SEO audit, teknik SEO ve anahtar kelime optimizasyonu',
    icon: BarChart3,
    status: 'active',
    metrics: [{ label: 'SEO Skor', value: '94%' }, { label: 'Trafik', value: '+28%' }]
  }
];

interface ServiceSelectionPageProps {
  onServiceSelect: (serviceId: ServiceId) => void;
  onLogout: () => void;
  clientName: string;
  companyName: string;
  availableServiceIds: ServiceId[];
}

export function ServiceSelectionPage({
  onServiceSelect,
  onLogout,
  clientName,
  companyName,
  availableServiceIds,
}: ServiceSelectionPageProps) {
  const availableServiceIdSet = new Set<ServiceId>(availableServiceIds);
  const purchasedActiveServices = services.filter(
    (service) => service.status === 'active' && availableServiceIdSet.has(service.id),
  );
  const activeServices = purchasedActiveServices.length;

  return (
    <div className="min-h-screen bg-[#131313] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl text-white mb-2">Hangi hizmet panelini görüntülemek istiyorsunuz?</h1>
            <p className="text-[#A0A0A0] text-lg">Aktif hizmetlerinizin detaylarına göz atın</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-3">
            <div className="text-right">
              <div className="text-sm text-white">{clientName}</div>
              <div className="text-xs text-[#A0A0A0]">{companyName}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-sm text-[#A0A0A0] transition-all hover:border-[#AAFF01]/30 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-[#AAFF01] mb-1">{activeServices}</div>
            <div className="text-sm text-[#A0A0A0]">Aktif Hizmet</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-[#FFA726] mb-1">{activeServices > 0 ? '5' : '0'}</div>
            <div className="text-sm text-[#A0A0A0]">Bekleyen Onay</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-white mb-1">{activeServices > 0 ? '15 Nis' : '-'}</div>
            <div className="text-sm text-[#A0A0A0]">Son Rapor</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-white mb-1">{activeServices > 0 ? '2 May' : '-'}</div>
            <div className="text-sm text-[#A0A0A0]">Sonraki Toplantı</div>
          </div>
        </div>

        {activeServices === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.04]">
              <BarChart3 className="h-7 w-7 text-[#A0A0A0]" />
            </div>
            <h2 className="mb-2 text-2xl text-white">Aktif hizmet bulunmuyor</h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#A0A0A0]">
              Bu hesap için aktif satın alınmış hizmet görünmüyor. Yeni bir hizmet aktif olduğunda panel burada listelenecek.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {purchasedActiveServices.map((service) => {
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                onClick={() => onServiceSelect(service.id)}
                className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08] hover:border-[#AAFF01]/40 hover:shadow-[0_0_30px_rgba(170,255,1,0.1)] cursor-pointer transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-[#AAFF01]/10">
                  <Icon className="w-7 h-7 text-[#AAFF01]" />
                </div>

                <h3 className="text-lg text-white mb-2">{service.title}</h3>
                <p className="text-[#A0A0A0] text-xs mb-4 leading-relaxed">{service.description}</p>

                {service.metrics && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {service.metrics.map((metric, i) => (
                      <div key={i} className="bg-[#202020] rounded-lg p-2">
                        <div className="text-sm text-white">{metric.value}</div>
                        <div className="text-xs text-[#A0A0A0]">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs px-3 py-1 rounded-lg bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20">
                    Aktif
                  </span>
                  <span className="text-[#AAFF01] text-sm">→</span>
                </div>
              </button>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
