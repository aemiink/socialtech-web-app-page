import { DollarSign, Users, MousePointerClick, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../components/button';

const kpiData = [
  { title: 'Potansiyel Müşteriler', value: '147', change: 23.5, icon: Users, sparkline: [30, 50, 70, 60, 85, 75, 95], explanation: 'Meta kampanyalarından güçlü artış' },
  { title: 'ROAS', value: '4.8x', change: 12.3, icon: TrendingUp, sparkline: [50, 55, 60, 70, 75, 85, 100], explanation: 'Hedefin üzerinde performans' },
  { title: 'Tıklama Oranı', value: '3.2%', change: -5.4, icon: MousePointerClick, sparkline: [80, 75, 70, 65, 60, 55, 50], explanation: 'Reklam yorgunluğu tespit edildi' },
  { title: 'Toplam Harcama', value: '₺28,450', change: 8.1, icon: DollarSign, sparkline: [40, 60, 45, 80, 65, 90, 100], explanation: 'Planlanan bütçe dahilinde' },
];

const weeklyActivity = [
  { count: '3', label: 'görsel yayınlandı', icon: CheckCircle },
  { count: '2', label: 'kampanya optimize edildi', icon: TrendingUp },
  { count: '41', label: 'potansiyel müşteri oluşturuldu', icon: Users },
];

const clientActions = [
  { type: 'approval', title: 'Instagram Story serisi onay bekliyor', deadline: '2 gün', priority: 'high' },
  { type: 'input', title: 'Mayıs kampanyası için ürün fotoğrafları gerekli', deadline: '5 gün', priority: 'medium' },
  { type: 'approval', title: 'Blog içeriği inceleme bekliyor', deadline: '3 gün', priority: 'low' },
];

const activityTimeline = [
  { time: '2 saat önce', action: 'Ajans yorumu ekledi', detail: 'Yaz Kampanyası performans analizi' },
  { time: '5 saat önce', action: 'Yeni görsel yüklendi', detail: 'Instagram Reels - Ürün tanıtımı' },
  { time: '1 gün önce', action: 'Kampanya optimize edildi', detail: 'Meta - Yeniden hedefleme bütçesi artırıldı' },
  { time: '2 gün önce', action: 'Haftalık rapor oluşturuldu', detail: 'Nisan 3. hafta performans özeti' },
];

export function OverviewPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Genel Bakış</h1>
        <p className="text-[#A0A0A0]">Social Tech ile çalışmanızın özeti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08] hover:border-[#AAFF01]/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <span className="text-[#A0A0A0] text-sm">{kpi.title}</span>
              <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-[#AAFF01]" />
              </div>
            </div>
            <div className="text-3xl text-white mb-2">{kpi.value}</div>
            <div className="flex items-center gap-2 mb-3">
              {kpi.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#ff4444]" />
              )}
              <span className={kpi.change >= 0 ? 'text-[#AAFF01] text-sm' : 'text-[#ff4444] text-sm'}>
                {kpi.change >= 0 ? '+' : ''}{kpi.change}%
              </span>
            </div>
            <p className="text-xs text-[#A0A0A0]">{kpi.explanation}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Bu Hafta</h2>
          <div className="space-y-4">
            {weeklyActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#AAFF01]" />
                </div>
                <div>
                  <div className="text-2xl text-white">{item.count}</div>
                  <div className="text-sm text-[#A0A0A0]">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Bu hafta tıklama oranında hafif bir düşüş gözlemledik. Bunun temel sebebi, mevcut görsellerde kullanıcı yorgunluğu.
                Önümüzdeki hafta için 3 yeni görsel konsepti hazırladık ve teste başlayacağız.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Buna rağmen, potansiyel müşteri kalitesi ve ROAS hedeflerimizin üzerinde. Yeniden hedefleme kampanyamız özellikle
                güçlü sonuçlar veriyor - dönüşüm oranı %18 arttı.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Elif Yılmaz - Hesap Yöneticisi</span>
                <span className="ml-auto">26 Nisan 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Sizden Beklenenler</h2>
          <div className="space-y-3">
            {clientActions.map((action, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        action.type === 'approval'
                          ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                          : 'bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20'
                      }`}>
                        {action.type === 'approval' ? 'Onay Gerekli' : 'Bilgi Gerekli'}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${
                        action.priority === 'high' ? 'text-[#ff4444]' : 'text-[#A0A0A0]'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {action.deadline}
                      </span>
                    </div>
                    <p className="text-white text-sm">{action.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {action.type === 'approval' ? (
                    <>
                      <Button variant="primary" className="flex-1 justify-center text-sm py-2">
                        Onayla
                      </Button>
                      <Button variant="secondary" className="flex-1 justify-center text-sm py-2">
                        Revizyon İste
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" className="w-full justify-center text-sm py-2">
                      Yükle
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Aktivite Akışı</h2>
          <div className="space-y-4">
            {activityTimeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#AAFF01]"></div>
                  {i < activityTimeline.length - 1 && (
                    <div className="w-px h-full bg-white/[0.08] my-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-[#A0A0A0] mb-1">{item.time}</p>
                  <p className="text-white text-sm mb-1">{item.action}</p>
                  <p className="text-[#A0A0A0] text-xs">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
