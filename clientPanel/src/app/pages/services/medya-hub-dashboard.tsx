import { DollarSign, Users, TrendingUp, Target, Megaphone, Search, Video, ShoppingCart, ArrowRight, AlertCircle } from 'lucide-react';
import { AutomationPreview } from '../../components/automation-preview';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const stats = [
  { title: 'Toplam Harcama', value: '₺42K', change: '+12%', icon: DollarSign, color: 'blue' },
  { title: 'Toplam Lead', value: '325', change: '+18%', icon: Users, color: 'green' },
  { title: 'Blended ROAS', value: '3.8x', change: '+0.4', icon: TrendingUp, color: 'green' },
  { title: 'Blended CPA', value: '₺129', change: '-8%', icon: Target, color: 'green' },
  { title: 'Aktif Kanal', value: '4', change: '+1', icon: Megaphone, color: 'purple' },
];

const channelPerformance = [
  {
    channel: 'Meta Ads',
    icon: Megaphone,
    spend: '₺18,000',
    leads: 147,
    cpa: '₺122',
    roas: '4.8x',
    status: 'Scaling',
    statusColor: 'green'
  },
  {
    channel: 'Google Ads',
    icon: Search,
    spend: '₺12,000',
    conversions: 89,
    cpa: '₺135',
    roas: '3.9x',
    status: 'Testing',
    statusColor: 'blue'
  },
  {
    channel: 'TikTok Ads',
    icon: Video,
    spend: '₺8,000',
    leads: 67,
    cpa: '₺119',
    roas: '3.2x',
    status: 'Improving',
    statusColor: 'orange'
  },
  {
    channel: 'Amazon Ads',
    icon: ShoppingCart,
    spend: '₺4,000',
    sales: 22,
    acos: '18%',
    roas: '5.6x',
    status: 'Testing',
    statusColor: 'blue'
  },
];

const budgetData = [
  { name: 'Meta Ads', value: 43, color: '#AAFF01' },
  { name: 'Google Ads', value: 29, color: '#00D4FF' },
  { name: 'TikTok Ads', value: 19, color: '#7B61FF' },
  { name: 'Amazon Ads', value: 9, color: '#FFA726' },
];

const funnelSteps = [
  { step: 'Traffic', value: '124K', icon: Users },
  { step: 'Click', value: '8,420', icon: ArrowRight },
  { step: 'Lead', value: '325', icon: Target },
  { step: 'Sale', value: '89', icon: DollarSign },
];

const creativeTests = [
  { creative: 'Hook A - Problem-first', channel: 'Meta', ctr: '2.8%', status: 'Winner' },
  { creative: 'Hook B - Benefit-first', channel: 'TikTok', ctr: '3.1%', status: 'Winner' },
  { creative: 'Copy Variant 1', channel: 'Google', ctr: '4.2%', status: 'Testing' },
  { creative: 'UGC Video', channel: 'Meta', ctr: '2.4%', status: 'Testing' },
];

export function MediaHubDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Medya Hub</h1>
        <p className="text-[#A0A0A0]">Tüm reklam kanallarının birleşik yönetimi</p>
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
        <h2 className="text-xl text-white mb-4">Omnichannel Performans Haritası</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelPerformance.map((channel, i) => {
            const statusColors = {
              green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
              orange: 'bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20',
            };
            return (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                      <channel.icon className="w-5 h-5 text-[#AAFF01]" />
                    </div>
                    <h3 className="text-white font-medium">{channel.channel}</h3>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Harcama</span>
                    <span className="text-white">{channel.spend}</span>
                  </div>
                  {channel.leads && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0]">Lead</span>
                      <span className="text-white">{channel.leads}</span>
                    </div>
                  )}
                  {channel.conversions && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0]">Dönüşüm</span>
                      <span className="text-white">{channel.conversions}</span>
                    </div>
                  )}
                  {channel.sales && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0]">Satış</span>
                      <span className="text-white">{channel.sales}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">{channel.acos ? 'ACOS' : 'CPA'}</span>
                    <span className="text-white">{channel.acos || channel.cpa}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">ROAS</span>
                    <span className="text-[#AAFF01]">{channel.roas}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg border text-xs text-center ${statusColors[channel.statusColor as keyof typeof statusColors]}`}>
                  {channel.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Bütçe Dağılımı</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                labelStyle={{ color: '#A0A0A0' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: '#A0A0A0', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Funnel & Dönüşüm Yapısı</h2>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={i}>
                <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-[#AAFF01]" />
                    </div>
                    <span className="text-white">{step.step}</span>
                  </div>
                  <div className="text-xl text-[#AAFF01]">{step.value}</div>
                </div>
                {i < funnelSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-[#A0A0A0] rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Kreatif & Copy Yönlendirmesi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creativeTests.map((test, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-1 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                  {test.channel}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  test.status === 'Winner'
                    ? 'bg-[#AAFF01]/10 text-[#AAFF01]'
                    : 'bg-[#00D4FF]/10 text-[#00D4FF]'
                }`}>
                  {test.status}
                </span>
              </div>
              <h3 className="text-white text-sm mb-2">{test.creative}</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#A0A0A0]">CTR</span>
                <span className="text-lg text-[#AAFF01]">{test.ctr}</span>
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
                Bu hafta omnichannel stratejimiz mükemmel sonuçlar verdi. Meta Ads'te ROAS hedefini aştık ve
                scaling fazına geçtik. TikTok tarafında yeni hook testleri performansı yukarı taşıdı.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Google Ads bütçesini %20 artırıyoruz çünkü search kampanyaları çok verimli çalışıyor.
                Amazon'da ise ACOS oranımız hedefin altında, ölçeklendirme için hazırız.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <Target className="w-4 h-4" />
                <span>4 kanal senkronize çalışıyor • Blended ROAS hedefin üzerinde</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Mehmet Öz - Medya Hub Lideri</span>
                <span className="ml-auto">27 Nisan 2026</span>
              </div>
            </div>
          </div>
        </div>

        <AutomationPreview />
      </div>
    </div>
  );
}
