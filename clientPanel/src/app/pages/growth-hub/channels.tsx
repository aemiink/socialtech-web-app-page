import { Megaphone, Search, MessageSquare, Globe, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const channels = [
  {
    name: 'Meta Ads',
    icon: Megaphone,
    metrics: {
      spend: '₺18,000',
      leads: 147,
      roas: '4.8x',
      cpa: '₺122',
      status: 'Scaling'
    },
    statusColor: 'green'
  },
  {
    name: 'Google Ads',
    icon: Search,
    metrics: {
      spend: '₺12,000',
      conversions: 89,
      roas: '3.9x',
      cpa: '₺135',
      status: 'Testing'
    },
    statusColor: 'blue'
  },
  {
    name: 'Sosyal Medya',
    icon: MessageSquare,
    metrics: {
      reach: '124K',
      engagement: '8.4%',
      followers: '+342',
      posts: 18,
      status: 'Growing'
    },
    statusColor: 'green'
  },
  {
    name: 'Website',
    icon: Globe,
    metrics: {
      visitors: '12.4K',
      cvr: '3.2%',
      leads: 397,
      bounceRate: '42%',
      status: 'Optimizing'
    },
    statusColor: 'blue'
  },
];

const comparisonData = [
  { date: '21 Nis', metaLeads: 18, googleLeads: 12, organicLeads: 7 },
  { date: '22 Nis', metaLeads: 22, googleLeads: 14, organicLeads: 9 },
  { date: '23 Nis', metaLeads: 20, googleLeads: 11, organicLeads: 8 },
  { date: '24 Nis', metaLeads: 25, googleLeads: 15, organicLeads: 11 },
  { date: '25 Nis', metaLeads: 23, googleLeads: 13, organicLeads: 10 },
  { date: '26 Nis', metaLeads: 27, googleLeads: 16, organicLeads: 12 },
  { date: '27 Nis', metaLeads: 24, googleLeads: 14, organicLeads: 9 },
];

export function ChannelsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Kanallar</h1>
        <p className="text-[#A0A0A0]">Tüm büyüme kanallarının performans özeti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channels.map((channel, i) => {
          const Icon = channel.icon;
          const statusColors = {
            green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
            blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
          };
          return (
            <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#AAFF01]" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{channel.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[channel.statusColor as keyof typeof statusColors]}`}>
                    {channel.metrics.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(channel.metrics).map(([key, value]) => {
                  if (key === 'status') return null;
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0] capitalize">{key}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Kanal Karşılaştırması (Günlük Lead)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={comparisonData}>
            <defs>
              <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#AAFF01" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#AAFF01" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
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
            <Area type="monotone" dataKey="metaLeads" stroke="#AAFF01" fillOpacity={1} fill="url(#colorMeta)" name="Meta Ads" />
            <Area type="monotone" dataKey="googleLeads" stroke="#00D4FF" fillOpacity={1} fill="url(#colorGoogle)" name="Google Ads" />
            <Area type="monotone" dataKey="organicLeads" stroke="#7B61FF" fillOpacity={1} fill="url(#colorOrganic)" name="Organik" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Meta Ads en güçlü lead kanalımız olmaya devam ediyor. ROAS 4.8x ile hedefin çok üzerinde. Google Ads
              tarafında search kampanyalarını test ediyoruz ve sonuçlar ümit verici.
            </p>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Organik sosyal medya %28 büyüme gösterdi. Instagram Reels stratejimiz çok etkili oldu. Website
              dönüşüm oranını artırmak için landing page optimizasyonları devam ediyor.
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
