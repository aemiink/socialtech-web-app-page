import { TrendingUp, Target, Users, FileText, BarChart3, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AutomationPreview } from '../../components/automation-preview';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: 'Toplam Lead', value: '247', change: '+23%', icon: Users, color: 'green' },
  { title: 'Reklam Harcaması', value: '₺42K', change: '+12%', icon: BarChart3, color: 'blue' },
  { title: 'ROAS', value: '4.2x', change: '+0.3', icon: TrendingUp, color: 'green' },
  { title: 'Yayınlanan İçerik', value: '18', change: '+5', icon: FileText, color: 'purple' },
  { title: 'Bekleyen Onay', value: '3', change: '-2', icon: Clock, color: 'orange' },
];

const healthCards = [
  { title: 'Strateji', status: 'excellent', score: '95%', icon: Target },
  { title: 'Sosyal Medya', status: 'good', score: '88%', icon: Users },
  { title: 'Reklamlar', status: 'excellent', score: '92%', icon: TrendingUp },
  { title: 'Tasarım', status: 'good', score: '87%', icon: FileText },
  { title: 'Raporlama', status: 'excellent', score: '96%', icon: BarChart3 },
];

const weeklySummary = [
  { task: '16 içerik planlandı', status: 'completed' },
  { task: '4 kreatif hazırlandı', status: 'completed' },
  { task: '2 kampanya optimize edildi', status: 'completed' },
  { task: '1 rapor yayınlandı', status: 'completed' },
];

const channelPerformance = [
  { channel: 'Meta Ads', spend: '₺18K', leads: '147', roas: '4.8x', status: 'scaling' },
  { channel: 'Google Ads', spend: '₺12K', leads: '89', roas: '3.9x', status: 'testing' },
  { channel: 'Instagram', reach: '124K', engagement: '8.4%', followers: '+342', status: 'growing' },
  { channel: 'Website', visitors: '12.4K', cvr: '3.2%', leads: '397', status: 'optimizing' },
];

const clientActions = [
  { action: 'Bekleyen içerikleri onayla', priority: 'high', dueDate: '28 Nis' },
  { action: 'Aylık raporu incele', priority: 'medium', dueDate: '30 Nis' },
  { action: 'Eksik marka varlıklarını gönder', priority: 'low', dueDate: '5 May' },
];

const recentActivity = [
  { time: '2 saat önce', activity: 'Meta Ads kampanyası optimize edildi', type: 'ads' },
  { time: '5 saat önce', activity: 'Instagram içeriği yayınlandı', type: 'social' },
  { time: '1 gün önce', activity: 'Haftalık rapor hazırlandı', type: 'report' },
  { time: '2 gün önce', activity: 'Yeni kreatif tasarımları onaylandı', type: 'design' },
];

const leadTrendData = [
  { date: '21 Nis', leads: 28 },
  { date: '22 Nis', leads: 35 },
  { date: '23 Nis', leads: 32 },
  { date: '24 Nis', leads: 41 },
  { date: '25 Nis', leads: 38 },
  { date: '26 Nis', leads: 45 },
  { date: '27 Nis', leads: 42 },
];

export function GrowthHubDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Growth & Hub</h1>
        <p className="text-[#A0A0A0]">Büyüme stratejisi, sosyal medya, reklamlar ve raporlama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const colorMap = {
            green: { bg: 'bg-[#AAFF01]/10', text: 'text-[#AAFF01]' },
            blue: { bg: 'bg-[#00D4FF]/10', text: 'text-[#00D4FF]' },
            purple: { bg: 'bg-[#7B61FF]/10', text: 'text-[#7B61FF]' },
            orange: { bg: 'bg-[#FFA726]/10', text: 'text-[#FFA726]' },
          };
          const colors = colorMap[stat.color as keyof typeof colorMap];

          return (
            <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
              <div className={`text-3xl ${colors.text} mb-1`}>{stat.value}</div>
              <div className="text-sm text-[#A0A0A0]">{stat.change} bu hafta</div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Büyüme Sağlığı Genel Bakış</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {healthCards.map((card, i) => {
            const statusColors = {
              excellent: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              good: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
            };
            return (
              <div key={i} className={`rounded-xl p-4 border ${statusColors[card.status as keyof typeof statusColors]}`}>
                <div className="flex items-center justify-between mb-3">
                  <card.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{card.score}</span>
                </div>
                <div className="text-sm">{card.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Haftalık Büyüme Özeti</h2>
          <div className="space-y-3">
            {weeklySummary.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#202020] rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0" />
                <span className="text-white">{item.task}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Lead Trendi (Son 7 Gün)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={leadTrendData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AAFF01" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#AAFF01" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="date" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                labelStyle={{ color: '#A0A0A0' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#AAFF01" fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Kanal Performansı</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelPerformance.map((channel, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">{channel.channel}</h3>
                <span className="text-xs px-2 py-1 rounded bg-[#AAFF01]/10 text-[#AAFF01]">
                  {channel.status}
                </span>
              </div>
              <div className="space-y-2">
                {channel.spend && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Harcama</span>
                    <span className="text-white">{channel.spend}</span>
                  </div>
                )}
                {channel.leads && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Lead</span>
                    <span className="text-white">{channel.leads}</span>
                  </div>
                )}
                {channel.roas && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">ROAS</span>
                    <span className="text-[#AAFF01]">{channel.roas}</span>
                  </div>
                )}
                {channel.reach && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Erişim</span>
                    <span className="text-white">{channel.reach}</span>
                  </div>
                )}
                {channel.engagement && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Etkileşim</span>
                    <span className="text-white">{channel.engagement}</span>
                  </div>
                )}
                {channel.followers && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Takipçi</span>
                    <span className="text-[#AAFF01]">{channel.followers}</span>
                  </div>
                )}
                {channel.visitors && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Ziyaretçi</span>
                    <span className="text-white">{channel.visitors}</span>
                  </div>
                )}
                {channel.cvr && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Dönüşüm</span>
                    <span className="text-white">{channel.cvr}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Bu hafta büyüme metriklerinde güçlü bir performans gördük. Meta Ads kampanyalarımız ROAS hedeflerini
                aştı ve yeni lead kalitesi oldukça yüksek. Sosyal medya tarafında organik erişimimiz %28 arttı.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Önümüzdeki hafta yeni kreatif testlerini devreye alacağız ve Google Ads bütçesini %15 artırıyoruz.
                İçerik takviminizde 3 onay bekleyen post var, bunları incelemenizi rica ediyoruz.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>Tüm sistemler çalışıyor • Hedeflerde ilerliyoruz</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Elif Yılmaz - Growth Lead</span>
                <span className="ml-auto">27 Nisan 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Müşteri Aksiyonları</h2>
          <div className="space-y-3">
            {clientActions.map((item, i) => {
              const priorityColors = {
                high: 'bg-[#ff4444]/10 text-[#ff4444]',
                medium: 'bg-[#FFA726]/10 text-[#FFA726]',
                low: 'bg-[#00D4FF]/10 text-[#00D4FF]',
              };
              return (
                <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                      {item.priority === 'high' ? 'Acil' : item.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">{item.dueDate}</span>
                  </div>
                  <p className="text-white text-sm">{item.action}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Son Aktiviteler</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => {
              const typeColors = {
                ads: 'bg-[#AAFF01]/10 text-[#AAFF01]',
                social: 'bg-[#7B61FF]/10 text-[#7B61FF]',
                report: 'bg-[#00D4FF]/10 text-[#00D4FF]',
                design: 'bg-[#FF6B9D]/10 text-[#FF6B9D]',
              };
              return (
                <div key={i} className="flex items-start gap-3 bg-[#202020] rounded-xl p-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[item.type as keyof typeof typeColors].replace('/10', '')}`}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm mb-1">{item.activity}</p>
                    <span className="text-xs text-[#A0A0A0]">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AutomationPreview />
      </div>
    </div>
  );
}
