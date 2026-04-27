import { Activity, BarChart3, CheckCircle, FileText, MousePointerClick, Rocket } from 'lucide-react';
import {
  ActivityTimeline,
  AgencyComment,
  ClientActions,
  DashboardHeader,
  KpiGrid,
  ProgressPath,
  StatusGrid,
} from '../../components/dashboard-widgets';

const kpis = [
  { title: 'Sayfa İlerlemesi', value: '%76', note: 'tracking ve yayın hazırlığı', icon: Rocket },
  { title: 'Form Leadleri', value: '124', note: 'son 30 gün', icon: FileText },
  { title: 'Conversion Rate', value: '%5.8', note: '+1.1 puan iyileşme', icon: MousePointerClick },
  { title: 'Page Speed', value: '91', note: 'mobil performans skoru', icon: BarChart3, tone: 'blue' as const },
  { title: 'Açık Revizyon', value: '2', note: 'copy ve mobil tasarım', icon: Activity, tone: 'violet' as const },
];

const conversionStructure = [
  { title: 'Ad Traffic', status: 'Hazır', note: 'Meta ve Google kampanyaları doğru UTM ile bağlanacak.' },
  { title: 'Landing Page', status: 'Devam', note: 'Hero, sosyal kanıt ve teklif blokları son revizyonda.', tone: 'blue' as const },
  { title: 'Form', status: 'Testte', note: 'Lead bildirimi ve alan validasyonları kontrol ediliyor.', tone: 'violet' as const },
  { title: 'Lead', status: 'Aktif', note: 'CRM/WhatsApp bilgilendirme akışı hazır.' },
];

const reviewStatus = [
  { title: 'Copy & CTA Review', status: 'Onay Bekliyor', note: 'Ana headline ve buton metni için son yorum bekliyoruz.', tone: 'violet' as const },
  { title: 'Desktop Design Preview', status: 'Onaylandı', note: 'Masaüstü tasarım hazır.' },
  { title: 'Mobile Design Preview', status: 'Revizyon', note: 'Form alanları daha kısa ve net hale getiriliyor.', tone: 'blue' as const },
  { title: 'Tracking & Form Status', status: 'Testte', note: 'Pixel, GA4 event ve form notification kontrol ediliyor.', tone: 'violet' as const },
];

export function LandingPagesDashboard() {
  return (
    <div className="p-8 space-y-6">
      <DashboardHeader
        title="Landing Pages Dönüşüm Paneli"
        description="Reklam trafiğini forma ve satış fırsatına taşıyan landing page üretim sürecinin müşteri görünümü."
      />

      <KpiGrid items={kpis} />

      <ProgressPath
        title="Landing Page Build Progress"
        subtitle="Brief → Copy → Design → Development → Tracking → Publish hattında üretim ve onay akışı."
        phases={['Brief', 'Copy', 'Design', 'Development', 'Tracking']}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusGrid title="Conversion Structure" description="Trafikten lead'e giden yapının net kontrol listesi." items={conversionStructure} />
        <StatusGrid title="Copy, Design & Tracking Review" description="Onay bekleyen ve test edilen dönüşüm parçaları." items={reviewStatus} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AgencyComment author="Mert Aksoy - Conversion Lead">
            <p>
              Landing page’in dönüşüm omurgası güçlü. Tek teklif, net CTA, kısa form ve güven öğelerini aynı akışta tutuyoruz.
            </p>
            <p>
              Bu hafta ana odağımız mobil form sürtünmesini azaltmak ve tracking testlerini tamamlamak. Yayına çıktığında reklam trafiğini doğru eventlerle ölçebileceğiz.
            </p>
          </AgencyComment>
        </div>

        <ClientActions
          items={[
            { title: 'Copy varyantını onaylayın', dueDate: '28 Nis', priority: 'Acil' },
            { title: 'Tasarım önizlemesine yorum bırakın', dueDate: '30 Nis', priority: 'Orta' },
            { title: 'Eksik marka varlıklarını gönderin', dueDate: '2 May', priority: 'Normal' },
          ]}
        />
      </div>

      <ActivityTimeline
        items={[
          'Hero copy ve CTA varyantı hazırlandı',
          'Mobil tasarım revizyonu işlendi',
          'Form event testi yayın öncesi kontrole alındı',
        ]}
      />

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white">Desktop / Mobile Design Preview</h2>
            <p className="text-sm text-[#A0A0A0]">Canlı önizleme linkleri yayın öncesi onay için bu alanda takip edilir.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Desktop Preview', 'Mobile Preview'].map((item) => (
            <div key={item} className="h-40 rounded-xl bg-gradient-to-br from-[#AAFF01]/10 to-[#7B61FF]/10 border border-white/[0.08] flex items-center justify-center">
              <span className="text-white">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
