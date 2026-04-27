import { TrendingUp, Search, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const kpiData = [
  { title: 'Organik Trafik', value: '24,542', change: 34.2, icon: Eye },
  { title: 'Anahtar Kelimeler', value: '247', change: 12.8, icon: Search },
  { title: 'Site Sağlığı', value: '94%', change: 8.3, icon: CheckCircle },
  { title: 'Domain Otoritesi', value: '42', change: 15.7, icon: TrendingUp },
];

const keywordRankings = [
  { keyword: 'dijital pazarlama ajansı', position: 3, change: 2, volume: '1.2K' },
  { keyword: 'instagram reklam yönetimi', position: 5, change: -1, volume: '890' },
  { keyword: 'sosyal medya yönetimi', position: 8, change: 3, volume: '2.1K' },
  { keyword: 'google ads uzmanı', position: 12, change: 5, volume: '720' },
];

const recentOptimizations = [
  { title: 'Blog içerik optimizasyonu', date: '24 Nisan', status: 'completed' },
  { title: 'Teknik SEO iyileştirmeleri', date: '22 Nisan', status: 'completed' },
  { title: 'Backlink oluşturma kampanyası', date: '20 Nisan', status: 'in-progress' },
];

const trafficData = [
  { date: '20 Nis', traffic: 18200 },
  { date: '21 Nis', traffic: 19500 },
  { date: '22 Nis', traffic: 21000 },
  { date: '23 Nis', traffic: 22400 },
  { date: '24 Nis', traffic: 23100 },
  { date: '25 Nis', traffic: 24200 },
  { date: '26 Nis', traffic: 24542 },
];

export function SeoAuditDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">SEO</h1>
        <p className="text-[#A0A0A0]">Arama motoru optimizasyonu performansı</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-start justify-between mb-4">
              <span className="text-[#A0A0A0] text-sm">{kpi.title}</span>
              <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-[#AAFF01]" />
              </div>
            </div>
            <div className="text-3xl text-white mb-2">{kpi.value}</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
              <span className="text-[#AAFF01] text-sm">+{kpi.change}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">SEO Uzmanı Yorumu</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Bu ay organik trafikte güçlü artış gözlemledik. Özellikle "dijital pazarlama" kategorisindeki
              anahtar kelimelerimiz üst sıralara yükseldi. Blog içerik stratejimiz çok iyi sonuç veriyor.
            </p>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Teknik SEO iyileştirmeleri site hızını %28 artırdı. Google Core Web Vitals skorlarımız tüm sayfalarda
              yeşil seviyede. Backlink kampanyamız devam ediyor - kaliteli sitelerden 12 yeni link aldık.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
              <span>Mehmet Kaya - SEO Uzmanı</span>
              <span className="ml-auto">27 Nisan 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Organik Trafik Trendi</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#202020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="traffic" stroke="#AAFF01" strokeWidth={2} name="Ziyaretçi" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Anahtar Kelime Sıralamaları</h2>
          <div className="space-y-3">
            {keywordRankings.map((keyword, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{keyword.keyword}</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${keyword.change > 0 ? 'text-[#AAFF01]' : 'text-[#ff4444]'}`} />
                    <span className={keyword.change > 0 ? 'text-[#AAFF01]' : 'text-[#ff4444]'}>
                      {keyword.change > 0 ? '+' : ''}{keyword.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                  <span>Sıra: #{keyword.position}</span>
                  <span>Arama Hacmi: {keyword.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Son Optimizasyonlar</h2>
          <div className="space-y-3">
            {recentOptimizations.map((opt, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  {opt.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#FFA726] flex-shrink-0 mt-0.5"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white mb-1">{opt.title}</h3>
                    <p className="text-sm text-[#A0A0A0]">{opt.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    opt.status === 'completed'
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01]'
                      : 'bg-[#FFA726]/10 text-[#FFA726]'
                  }`}>
                    {opt.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Teknik Sorunlar</h2>
          <div className="space-y-3">
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white mb-1">Sayfa Hızı</h3>
                  <p className="text-sm text-[#A0A0A0]">Tüm sayfalar yeşil seviyede</p>
                </div>
              </div>
            </div>
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white mb-1">Mobil Uyumluluk</h3>
                  <p className="text-sm text-[#A0A0A0]">100% optimize</p>
                </div>
              </div>
            </div>
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white mb-1">SSL Sertifikası</h3>
                  <p className="text-sm text-[#A0A0A0]">Aktif ve güncel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SeoAuditDashboard as SEODashboard };
