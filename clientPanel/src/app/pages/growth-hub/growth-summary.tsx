import { TrendingUp, AlertCircle, CheckCircle, Target, Activity } from 'lucide-react';

const healthCards = [
  { area: 'Strateji', score: 95, status: 'excellent', risk: 'Yok' },
  { area: 'Sosyal Medya', score: 88, status: 'good', risk: 'Düşük' },
  { area: 'Reklamlar', score: 92, status: 'excellent', risk: 'Yok' },
  { area: 'Tasarım', score: 87, status: 'good', risk: 'Düşük' },
  { area: 'Raporlama', score: 96, status: 'excellent', risk: 'Yok' },
];

const channelContribution = [
  { channel: 'Meta Ads', leads: 147, percentage: 45, trend: '+18%' },
  { channel: 'Google Ads', leads: 89, percentage: 27, trend: '+12%' },
  { channel: 'Organik Sosyal', leads: 56, percentage: 17, trend: '+28%' },
  { channel: 'Email', leads: 35, percentage: 11, trend: '+8%' },
];

const weekProgress = [
  { task: '16 içerik planlandı ve onaylandı', completed: true },
  { task: '4 yeni kreatif tasarlandı', completed: true },
  { task: '2 kampanya optimize edildi', completed: true },
  { task: '1 aylık rapor yayınlandı', completed: true },
  { task: '3 müşteri toplantısı gerçekleştirildi', completed: true },
];

const risks = [
  { risk: 'TikTok kampanya performansı beklentinin altında', severity: 'medium', action: 'Hook testleri devrede' },
  { risk: 'Landing page yükleme hızı optimize edilmeli', severity: 'low', action: 'Teknik ekip üzerinde çalışıyor' },
];

const nextActions = [
  { action: 'Yeni UGC kreatif setini devreye al', priority: 'high', date: '28 Nis' },
  { action: 'Google Ads bütçesini %15 artır', priority: 'high', date: '1 May' },
  { action: 'Retargeting kitlelerini genişlet', priority: 'medium', date: '3 May' },
];

export function GrowthSummaryPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Growth Özeti</h1>
        <p className="text-[#A0A0A0]">Genel büyüme sağlığı ve kanal performansı</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Genel Growth Sağlığı</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {healthCards.map((card, i) => {
            const statusColors = {
              excellent: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              good: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
            };
            return (
              <div key={i} className={`rounded-xl p-4 border ${statusColors[card.status as keyof typeof statusColors]}`}>
                <div className="text-2xl font-medium mb-2">{card.score}%</div>
                <div className="text-sm mb-1">{card.area}</div>
                <div className="text-xs opacity-70">Risk: {card.risk}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Kanal Katkısı (Lead Bazında)</h2>
          <div className="space-y-4">
            {channelContribution.map((ch, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">{ch.channel}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#AAFF01] text-sm">{ch.leads} lead</span>
                    <span className="text-xs text-[#A0A0A0]">{ch.trend}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#202020] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#AAFF01] to-[#7B61FF]"
                    style={{ width: `${ch.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Bu Haftaki İlerleme</h2>
          <div className="space-y-3">
            {weekProgress.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#202020] rounded-xl p-3">
                <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0" />
                <span className="text-white text-sm">{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-[#FFA726]" />
            <h2 className="text-xl text-white">Growth Riskleri</h2>
          </div>
          <div className="space-y-3">
            {risks.map((r, i) => {
              const severityColors = {
                high: 'bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444]/20',
                medium: 'bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20',
                low: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
              };
              return (
                <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded border ${severityColors[r.severity as keyof typeof severityColors]}`}>
                      {r.severity === 'high' ? 'Yüksek' : r.severity === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                  <p className="text-white text-sm mb-2">{r.risk}</p>
                  <p className="text-[#A0A0A0] text-xs">Aksiyon: {r.action}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#AAFF01]" />
            <h2 className="text-xl text-white">Önerilen Aksiyonlar</h2>
          </div>
          <div className="space-y-3">
            {nextActions.map((action, i) => {
              const priorityColors = {
                high: 'bg-[#ff4444]/10 text-[#ff4444]',
                medium: 'bg-[#FFA726]/10 text-[#FFA726]',
                low: 'bg-[#00D4FF]/10 text-[#00D4FF]',
              };
              return (
                <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${priorityColors[action.priority as keyof typeof priorityColors]}`}>
                      {action.priority === 'high' ? 'Yüksek' : action.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">{action.date}</span>
                  </div>
                  <p className="text-white text-sm">{action.action}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Genel growth sağlığınız mükemmel durumda. Tüm kanallar senkronize çalışıyor ve hedeflerin
              üzerinde performans gösteriyoruz. Meta Ads ve organik sosyal medya tarafında çok güçlü sonuçlar alıyoruz.
            </p>
            <p className="text-[#A0A0A0] text-sm mb-4">
              TikTok kampanyalarındaki performans düşüklüğü için hook testlerini genişlettik. Landing page
              hızı optimizasyonu devam ediyor. Önümüzdeki hafta yeni kreatif setlerini devreye alacağız.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
              <span>Elif Yılmaz - Growth Lead</span>
              <span className="ml-auto">27 Nisan 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
