import { Eye, MousePointerClick, DollarSign, Users, Play, TrendingUp, Video, Clock, Target, AlertCircle } from 'lucide-react';
import { AutomationPreview } from '../../components/automation-preview';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetOwnTikTokAdsConfigQuery } from '../../features/tiktokAds/tiktokAdsApi';

const stats = [
  { title: 'Video Görüntüleme', value: '284K', change: '+34%', icon: Eye, color: 'blue' },
  { title: 'CTR', value: '2.4%', change: '+0.8%', icon: MousePointerClick, color: 'green' },
  { title: 'CPA', value: '₺95', change: '-12%', icon: DollarSign, color: 'green' },
  { title: 'VTR', value: '42%', change: '+5%', icon: Play, color: 'purple' },
  { title: 'Lead', value: '67', change: '+18%', icon: Users, color: 'green' },
];

const campaigns = [
  {
    name: 'UGC Tanıtım Kampanyası',
    objective: 'Conversion',
    spend: '₺5,200',
    cpa: '₺88',
    vtr: '48%',
    status: 'Scaling',
    statusColor: 'green'
  },
  {
    name: 'Product Discovery',
    objective: 'Traffic',
    spend: '₺1,800',
    cpa: '₺112',
    vtr: '38%',
    status: 'Testing',
    statusColor: 'blue'
  },
  {
    name: 'Retargeting Audience',
    objective: 'Conversion',
    spend: '₺1,000',
    cpa: '₺76',
    vtr: '52%',
    status: 'Scaling',
    statusColor: 'green'
  },
];

const hookPerformance = [
  { hook: 'Hook 1: Problem Statement', retention: '68%', ctr: '3.2%', status: 'Winner' },
  { hook: 'Hook 2: Product Demo', retention: '45%', ctr: '2.1%', status: 'Testing' },
  { hook: 'Hook 3: UGC Testimonial', retention: '72%', ctr: '3.8%', status: 'Winner' },
];

const videoCreatives = [
  { name: 'UGC Video 1', ctr: '3.8%', watchTime: '18s', conversions: 24, thumbnail: '📱' },
  { name: 'Product Feature Video', ctr: '2.4%', watchTime: '12s', conversions: 15, thumbnail: '✨' },
  { name: 'Before/After Video', ctr: '3.1%', watchTime: '16s', conversions: 19, thumbnail: '🎯' },
  { name: 'Lifestyle Scene', ctr: '2.8%', watchTime: '14s', conversions: 17, thumbnail: '🌟' },
];

const audienceNotes = [
  { insight: 'Kadın, 18-34 yaş arası en yüksek etkileşim', type: 'audience' },
  { insight: 'Problem-solution formatı en iyi performansı veriyor', type: 'content' },
  { insight: 'Hashtag stratejisi organik erişimi %42 artırdı', type: 'discovery' },
];

const clientActions = [
  { action: 'UGC scriptlerini onayla', priority: 'high', dueDate: '28 Nis' },
  { action: 'Ürün videoları gönder', priority: 'medium', dueDate: '30 Nis' },
  { action: 'Hook konseptlerini incele', priority: 'medium', dueDate: '2 May' },
];

const chartData = [
  { date: '21 Nis', views: 32 },
  { date: '22 Nis', views: 38 },
  { date: '23 Nis', views: 35 },
  { date: '24 Nis', views: 45 },
  { date: '25 Nis', views: 42 },
  { date: '26 Nis', views: 51 },
  { date: '27 Nis', views: 48 },
];

export function TikTokAdsDashboard() {
  const { data: tikTokConfig, isLoading: configLoading } = useGetOwnTikTokAdsConfigQuery();

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#A0A0A0] text-sm">Yükleniyor…</p>
      </div>
    );
  }

  if (!tikTokConfig || tikTokConfig.connectionStatus === "NOT_CONNECTED") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-white text-base font-medium">TikTok Ads hesabınız henüz bağlanmadı.</p>
        <p className="text-[#A0A0A0] text-sm text-center max-w-sm">
          Ekibimiz yapılandırmayı tamamladığında verileriniz burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">TikTok Ads</h1>
        <p className="text-[#A0A0A0]">TikTok reklam kampanyaları ve UGC içerik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const colorMap = {
            blue: { bg: 'bg-[#00D4FF]/10', text: 'text-[#00D4FF]' },
            green: { bg: 'bg-[#AAFF01]/10', text: 'text-[#AAFF01]' },
            purple: { bg: 'bg-[#7B61FF]/10', text: 'text-[#7B61FF]' },
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
        <h2 className="text-xl text-white mb-4">Kampanya Durumu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((campaign, i) => {
            const statusColors = {
              green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
            };
            return (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium mb-1">{campaign.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                      {campaign.objective}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{campaign.spend}</div>
                    <div className="text-xs text-[#A0A0A0]">Harcama</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{campaign.cpa}</div>
                    <div className="text-xs text-[#A0A0A0]">CPA</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-[#AAFF01]">{campaign.vtr}</div>
                    <div className="text-xs text-[#A0A0A0]">VTR</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg border text-xs text-center ${statusColors[campaign.statusColor as keyof typeof statusColors]}`}>
                  {campaign.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Hook Performans Panosu</h2>
          <p className="text-xs text-[#A0A0A0] mb-4">İlk 3 saniye performansı</p>
          <div className="space-y-3">
            {hookPerformance.map((hook, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm">{hook.hook}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    hook.status === 'Winner'
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                      : 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                  }`}>
                    {hook.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-[#AAFF01]">{hook.retention}</div>
                    <div className="text-xs text-[#A0A0A0]">Retention</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{hook.ctr}</div>
                    <div className="text-xs text-[#A0A0A0]">CTR</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Video Performans Trendi</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7B61FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="date" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                labelStyle={{ color: '#A0A0A0' }}
              />
              <Area type="monotone" dataKey="views" stroke="#7B61FF" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Video Kreatif Grid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videoCreatives.map((video, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-[#7B61FF]/20 to-[#AAFF01]/20 flex items-center justify-center mb-3">
                <span className="text-4xl">{video.thumbnail}</span>
              </div>
              <h3 className="text-white text-sm mb-3">{video.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A0A0A0]">CTR</span>
                  <span className="text-[#AAFF01]">{video.ctr}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A0A0A0]">İzlenme</span>
                  <span className="text-white">{video.watchTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A0A0A0]">Dönüşüm</span>
                  <span className="text-white">{video.conversions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Kitle & Keşif Notları</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {audienceNotes.map((note, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start gap-2">
                <Target className="w-5 h-5 text-[#7B61FF] flex-shrink-0 mt-0.5" />
                <p className="text-white text-sm">{note.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Bu hafta TikTok kampanyalarımızda UGC (User Generated Content) formatı olağanüstü sonuçlar verdi.
                Hook 3'teki müşteri testimonial videosu %72 retention ile en yüksek performansı gösterdi.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                TikTok algoritması native içerikleri ödüllendiriyor. Önümüzdeki hafta 4 yeni UGC video test edeceğiz.
                Ürün odaklı çekimleri bekliyor olacağız.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <Play className="w-4 h-4" />
                <span>Video performansı hedefin üzerinde • VTR %42</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Can Yıldız - TikTok Ads Uzmanı</span>
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

      <AutomationPreview />
    </div>
  );
}
