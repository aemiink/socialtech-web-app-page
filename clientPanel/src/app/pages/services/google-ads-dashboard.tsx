import { MousePointerClick, DollarSign, Users, Target, Search, TrendingUp, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { AutomationPreview } from '../../components/automation-preview';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: 'Arama CTR', value: '4.2%', change: '+1.8%', icon: MousePointerClick, color: 'green' },
  { title: 'CPA', value: '₺135', change: '-15%', icon: DollarSign, color: 'green' },
  { title: 'Dönüşümler', value: '89', change: '+22%', icon: Users, color: 'green' },
  { title: 'CPC', value: '₺3.20', change: '-8%', icon: Target, color: 'green' },
  { title: 'Harcama', value: '₺12K', change: '+10%', icon: TrendingUp, color: 'blue' },
];

const campaigns = [
  {
    name: 'Search - Brand Keywords',
    budget: '₺4,500',
    conversions: 42,
    cpa: '₺107',
    ctr: '5.8%',
    status: 'Excellent',
    statusColor: 'green'
  },
  {
    name: 'Search - Generic Keywords',
    budget: '₺5,200',
    conversions: 35,
    cpa: '₺148',
    ctr: '3.4%',
    status: 'Optimizing',
    statusColor: 'blue'
  },
  {
    name: 'Performance Max',
    budget: '₺2,300',
    conversions: 12,
    cpa: '₺192',
    ctr: '2.1%',
    status: 'Testing',
    statusColor: 'blue'
  },
];

const keywordPerformance = [
  { keyword: 'premium web tasarım', intent: 'Commercial', cpc: '₺4.20', conversions: 18, status: 'Active' },
  { keyword: 'kurumsal web sitesi fiyat', intent: 'Transactional', cpc: '₺5.80', conversions: 24, status: 'Active' },
  { keyword: 'web tasarım ajansı', intent: 'Informational', cpc: '₺2.40', conversions: 8, status: 'Active' },
  { keyword: 'seo uyumlu web tasarım', intent: 'Commercial', cpc: '₺3.90', conversions: 15, status: 'Active' },
  { keyword: 'ucuz web tasarım', intent: 'Transactional', cpc: '₺1.80', conversions: 2, status: 'Paused' },
];

const negativeKeywords = [
  'ücretsiz web sitesi',
  'bedava web tasarım',
  'kendi kendine yapma',
  'hazır şablon',
];

const adCopyTests = [
  { variant: 'Headline A: Premium Web Tasarım Ajansı', ctr: '5.2%', status: 'Winner', impressions: '12.4K' },
  { variant: 'Headline B: SEO Uyumlu Web Tasarım', ctr: '4.8%', status: 'Testing', impressions: '9.8K' },
];

const conversionTracking = [
  { metric: 'GA4 Kurulumu', status: 'active', value: 'Aktif' },
  { metric: 'Conversion Tag', status: 'active', value: 'Çalışıyor' },
  { metric: 'Lead Form Takibi', status: 'active', value: 'Çalışıyor' },
  { metric: 'Call Tracking', status: 'inactive', value: 'Pasif' },
];

const clientActions = [
  { action: 'Landing page önerilerini incele', priority: 'medium', dueDate: '29 Nis' },
  { action: 'Yeni ad copy varyantlarını onayla', priority: 'high', dueDate: '28 Nis' },
];

const chartData = [
  { date: '21 Nis', conversions: 10 },
  { date: '22 Nis', conversions: 14 },
  { date: '23 Nis', conversions: 11 },
  { date: '24 Nis', conversions: 16 },
  { date: '25 Nis', conversions: 13 },
  { date: '26 Nis', conversions: 15 },
  { date: '27 Nis', conversions: 12 },
];

export function GoogleAdsDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Google Ads</h1>
        <p className="text-[#A0A0A0]">Arama, Display ve Performance Max kampanyaları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const colorMap = {
            green: { bg: 'bg-[#AAFF01]/10', text: 'text-[#AAFF01]' },
            blue: { bg: 'bg-[#00D4FF]/10', text: 'text-[#00D4FF]' },
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
        <h2 className="text-xl text-white mb-4">Kampanya Genel Bakışı</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((campaign, i) => {
            const statusColors = {
              green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
            };
            return (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-medium">{campaign.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded border ${statusColors[campaign.statusColor as keyof typeof statusColors]}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-[#A0A0A0] text-sm">Bütçe: {campaign.budget}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{campaign.conversions}</div>
                    <div className="text-xs text-[#A0A0A0]">Dönüşüm</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{campaign.cpa}</div>
                    <div className="text-xs text-[#A0A0A0]">CPA</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-[#AAFF01]">{campaign.ctr}</div>
                    <div className="text-xs text-[#A0A0A0]">CTR</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Anahtar Kelime Performansı</h2>
          <div className="space-y-2">
            {keywordPerformance.map((kw, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#7B61FF]" />
                    <h3 className="text-white text-sm">{kw.keyword}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    kw.status === 'Active'
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01]'
                      : 'bg-[#A0A0A0]/10 text-[#A0A0A0]'
                  }`}>
                    {kw.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-[#A0A0A0]">Intent</div>
                    <div className="text-sm text-white">{kw.intent}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0]">CPC</div>
                    <div className="text-sm text-white">{kw.cpc}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0]">Dönüşüm</div>
                    <div className="text-sm text-[#AAFF01]">{kw.conversions}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Dönüşüm Trendi</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="date" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                labelStyle={{ color: '#A0A0A0' }}
              />
              <Area type="monotone" dataKey="conversions" stroke="#00D4FF" fillOpacity={1} fill="url(#colorConversions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Negatif Kelime Güncellemeleri</h2>
          <p className="text-sm text-[#A0A0A0] mb-4">Temizlenen arama terimleri</p>
          <div className="flex flex-wrap gap-2">
            {negativeKeywords.map((kw, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#202020] rounded-lg px-3 py-2 border border-white/[0.08]">
                <XCircle className="w-4 h-4 text-[#ff4444]" />
                <span className="text-white text-sm">{kw}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Ad Copy A/B Testi</h2>
          <div className="space-y-3">
            {adCopyTests.map((test, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#7B61FF]" />
                    <h3 className="text-white text-sm">{test.variant}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    test.status === 'Winner'
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                      : 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                  }`}>
                    {test.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-[#AAFF01]">{test.ctr}</div>
                    <div className="text-xs text-[#A0A0A0]">CTR</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{test.impressions}</div>
                    <div className="text-xs text-[#A0A0A0]">Gösterim</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Dönüşüm Takibi</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {conversionTracking.map((item, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.status === 'active' ? 'bg-[#AAFF01]/10' : 'bg-[#A0A0A0]/10'
                }`}>
                  {item.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#A0A0A0]" />
                  )}
                </div>
                <div>
                  <div className="text-[#A0A0A0] text-xs mb-1">{item.metric}</div>
                  <div className="text-white text-sm">{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Bu hafta Google Search kampanyalarımız mükemmel sonuçlar verdi. Brand keyword'ler %5.8 CTR ile
                beklentilerin üzerinde. CPA'yı %15 düşürmeyi başardık.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Generic keyword testinde bazı terimleri negatif kelime listesine ekledik. Bu sayede alakasız tıklamaları
                elediğimiz için dönüşüm kalitesi arttı. Önümüzdeki hafta Performance Max kampanyasına bütçe artışı planlıyoruz.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>Tüm conversion tracking çalışıyor • CPA hedefin altında</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Burak Aydın - Google Ads Uzmanı</span>
                <span className="ml-auto">27 Nisan 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-xl text-white mb-4">Müşteri Aksiyonları</h2>
            <div className="space-y-3">
              {clientActions.map((item, i) => {
                const priorityColors = {
                  high: 'bg-[#ff4444]/10 text-[#ff4444]',
                  medium: 'bg-[#FFA726]/10 text-[#FFA726]',
                };
                return (
                  <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                        {item.priority === 'high' ? 'Acil' : 'Orta'}
                      </span>
                      <span className="text-xs text-[#A0A0A0]">{item.dueDate}</span>
                    </div>
                    <p className="text-white text-sm">{item.action}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <AutomationPreview />
        </div>
      </div>
    </div>
  );
}
