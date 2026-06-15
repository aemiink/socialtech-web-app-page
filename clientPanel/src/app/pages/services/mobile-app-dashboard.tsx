import { AlertCircle, Bell, Bug, CheckCircle, Rocket, Smartphone } from 'lucide-react';
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
  { title: 'Proje İlerlemesi', value: '%58', note: 'UX ve geliştirme paralel ilerliyor', icon: Rocket },
  { title: 'Tamamlanan Ekranlar', value: '12/18', note: '5 ekran onay bekliyor', icon: Smartphone },
  { title: 'Açık Hata', value: '6', note: 'test paketi içinde takipte', icon: Bug, tone: 'violet' as const },
  { title: 'Test Paketi Durumu', value: 'Beta 0.8', note: 'son paket hazırlandı', icon: CheckCircle },
  { title: 'Mağaza Hazırlığı', value: '%40', note: 'bilgi ve görsel bekliyor', icon: Bell, tone: 'blue' as const },
];

const screenStatus = [
  { title: 'Giriş / Kayıt', status: 'Onaylandı', note: 'Kayıt ve giriş akışı test edildi.' },
  { title: 'Ana Sayfa', status: 'Revizyon', note: 'Kart yoğunluğu azaltılıyor.', tone: 'violet' as const },
  { title: 'Profil', status: 'Tasarımda', note: 'Kullanıcı bilgileri ve tercih akışı şekilleniyor.', tone: 'blue' as const },
  { title: 'Bildirimler', status: 'Testte', note: 'Push senaryoları cihaz bazlı kontrol ediliyor.', tone: 'violet' as const },
  { title: 'Yönetim Paneli', status: 'Devam', note: 'Rol ve içerik yönetimi modülleri bağlanıyor.', tone: 'blue' as const },
];

const technicalStatus = [
  { title: 'API Bağlantıları', status: 'Devam', note: 'Auth ve profil endpointleri tamamlandı.', tone: 'blue' as const },
  { title: 'Yönetim Paneli', status: 'Kurulum', note: 'Kullanıcı yönetimi ve içerik akışı netleştiriliyor.', tone: 'violet' as const },
  { title: 'Push Bildirim Kurulumu', status: 'Testte', note: 'Hoş geldin, teklif ve hatırlatma senaryoları ayrıştırıldı.' },
  { title: 'Hata Takibi', status: 'Aktif', note: 'Beta paketi cihaz hataları izleniyor.' },
];

export function MobileAppDashboard() {
  return (
    <div className="p-8 space-y-6">
      <DashboardHeader
        title="Mobil APP Proje Paneli"
        description="Mobil uygulama ekranları, API bağlantıları, test build ve store hazırlığı için müşteri görünürlük ekranı."
      />

      <KpiGrid items={kpis} />

      <ProgressPath
        title="Mobile Product Progress"
        subtitle="UX Flow → UI Screens → Development → Testing → Store Submission hattında güncel ilerleme."
        phases={['UX Flow', 'UI Screens', 'Development', 'Testing', 'Store Submission']}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusGrid title="App Screen Status" description="Ekran bazlı onay, revizyon ve geliştirme durumu." items={screenStatus} />
        <StatusGrid title="API & Admin Panel Status" description="Uygulamanın servis bağlantıları ve yönetim tarafı." items={technicalStatus} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AgencyComment author="Derya Kılıç - Mobil Ürün Sorumlusu">
            <p>
              Uygulama akışı sağlıklı ilerliyor. Kritik ekranlar netleşti; test build sonrası crash ve cihaz uyumluluğu tarafını birlikte kontrol edeceğiz.
            </p>
            <p>
              Store hazırlığı için uygulama adı, ikon, ekran görüntüsü ve gizlilik politikası bilgileri tamamlandığında yayına hazırlık temposu hızlanacak.
            </p>
          </AgencyComment>
        </div>

        <ClientActions
          items={[
            { title: 'Ekran tasarımlarını onaylayın', dueDate: '29 Nis', priority: 'Acil' },
            { title: 'Store bilgilerini ve ikon dosyasını gönderin', dueDate: '2 May', priority: 'Orta' },
            { title: 'Test build geri bildirimlerini paylaşın', dueDate: '5 May', priority: 'Normal' },
          ]}
        />
      </div>

      <ActivityTimeline
        items={[
          'Login/Register akışı tamamlandı',
          'Push bildirim senaryoları test listesine alındı',
          'Beta test paketi hata takibiyle paylaşıldı',
        ]}
      />

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">Test Paketi ve Hata Takibi</h2>
            <p className="text-sm text-[#A0A0A0]">
              Son test paketi cihaz uyumluluğu, hata takibi ve müşteri geri bildirimleri için açık. Kritik hatalar ayrıştırıldığında mağaza gönderim listesine geçeceğiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
