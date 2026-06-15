import { CheckCircle, Grid, Layers, MonitorSmartphone, Palette, PenTool } from 'lucide-react';
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
  { title: 'Tasarlanan Ekran', value: '24', note: 'masaüstü, mobil ve tablet', icon: MonitorSmartphone },
  { title: 'UX Akışı', value: '%90', note: 'ana path netleşti', icon: Layers },
  { title: 'Revizyon Sayısı', value: '2', note: 'aktif müşteri notu', icon: PenTool, tone: 'violet' as const },
  { title: 'Tasarım Sistemi', value: '%80', note: 'bileşen seti ilerliyor', icon: Palette },
  { title: 'Onay Durumu', value: '18/24', note: 'ekran onaylı', icon: CheckCircle, tone: 'blue' as const },
];

const gallery = [
  { title: 'Masaüstü Önizlemesi', status: 'Onaylandı', note: 'Ana açılış sayfası ve panel ekranları tamamlandı.' },
  { title: 'Mobil Önizleme', status: 'Revizyon', note: 'CTA alanları daha net hale getiriliyor.', tone: 'violet' as const },
  { title: 'Tablet Önizlemesi', status: 'Testte', note: 'Kırılım noktaları ve kart yoğunluğu kontrol ediliyor.', tone: 'blue' as const },
];

const checklist = [
  { title: 'Renkler', status: 'Hazır', note: 'Marka neon lime ve koyu yüzey tokenları tanımlı.' },
  { title: 'Tipografi', status: 'Hazır', note: 'Başlık, gövde ve mikro metin ölçekleri net.' },
  { title: 'Butonlar', status: 'Hazır', note: 'Birincil, ikincil ve sade varyantlar hazır.' },
  { title: 'Formlar', status: 'Devam', note: 'Hata ve başarı durumları tamamlanıyor.', tone: 'blue' as const },
  { title: 'Kartlar', status: 'Hazır', note: 'Panel ve içerik kartları bileşenleşti.' },
  { title: 'Bileşenler', status: 'Devam', note: 'Teslim paketine eklenecek set olgunlaştırılıyor.', tone: 'violet' as const },
];

export function WebMobileDesignDashboard() {
  return (
    <div className="p-8 space-y-6">
      <DashboardHeader
        title="Web ve Mobil Tasarımlar Paneli"
        description="Arayüz/deneyim üretimi, responsive ekranlar, tasarım sistemi, prototip ve revizyon sürecinin müşteri görünümü."
      />

      <KpiGrid items={kpis} />

      <ProgressPath
        title="Design Progress"
        subtitle="Wireframe → UI Design → Responsive → Prototype → Delivery hattında ekran ve onay süreci."
        phases={['Wireframe', 'UI Design', 'Responsive', 'Prototype', 'Delivery']}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusGrid title="Screen Gallery" description="Desktop, mobile ve tablet önizleme kartları." items={gallery} />
        <StatusGrid title="Tasarım Sistemi Kontrol Listesi" description="Marka tutarlılığı için kontrol edilen tasarım yapı taşları." items={checklist} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AgencyComment author="Ece Yıldırım - UI/UX Lead">
            <p>
              Tasarım sistemi ve ekran dili tutarlı ilerliyor. Desktop tarafı güçlü, mobil tarafında CTA alanlarını daha kısa ve karar odaklı hale getiriyoruz.
            </p>
            <p>
              Prototip üzerinden akış testleri tamamlandığında teslim dosyalarını tek pakette paylaşacağız. Revizyonları ekran bazlı tuttuğumuz için süreç daha hızlı ilerliyor.
            </p>
          </AgencyComment>
        </div>

        <ClientActions
          items={[
            { title: 'UI ekranlarını onaylayın', dueDate: '29 Nis', priority: 'Acil' },
            { title: 'Revizyon notlarını ekran bazlı bırakın', dueDate: '1 May', priority: 'Orta' },
            { title: 'Teslim dosyalarını kontrol edin', dueDate: '5 May', priority: 'Normal' },
          ]}
        />
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
            <Grid className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white">UX Flow Map</h2>
            <p className="text-sm text-[#A0A0A0]">Entry → Browse → Action → Conversion akışı.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {['Entry', 'Browse', 'Action', 'Conversion'].map((step) => (
            <div key={step} className="rounded-xl border border-white/[0.08] bg-[#202020] p-5 text-center">
              <div className="text-[#AAFF01] text-sm mb-2">{step}</div>
              <div className="text-white text-sm">Kullanıcı karar yolculuğu</div>
            </div>
          ))}
        </div>
      </div>

      <ActivityTimeline
        items={[
          'Responsive breakpoint kontrolü tamamlandı',
          'Design system button ve form state’leri güncellendi',
          'Prototype test notları teslim dosyasına eklendi',
        ]}
      />
    </div>
  );
}
