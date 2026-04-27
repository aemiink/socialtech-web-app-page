import { Users, Heart, Eye, TrendingUp, Check, X, MessageSquare, Calendar, AlertCircle, MessageCircle, Clock, Target } from 'lucide-react';
import { Button } from '../../components/button';
import { AutomationPreview } from '../../components/automation-preview';

const kpiData = [
  { title: 'Erişim', value: '124.5K', change: 18.3, icon: Eye },
  { title: 'Etkileşim', value: '8,420', change: 12.7, icon: Heart },
  { title: 'Takipçi', value: '12,340', change: 5.2, icon: Users },
  { title: 'Etkileşim Oranı', value: '6.8%', change: 8.9, icon: TrendingUp },
];

const dmCommentStats = [
  { metric: 'Yanıtlanan DM', value: '47', time: 'Ort. 12 dk', icon: MessageCircle },
  { metric: 'Yanıtlanan Yorum', value: '128', time: 'Ort. 8 dk', icon: MessageSquare },
  { metric: 'Bekleyen Yanıt', value: '5', time: '-', icon: Clock },
];

const competitorInsights = [
  { type: 'trend', title: 'Video format trendleri', insight: 'Rakipler carousel yerine reels formatına ağırlık verdi', icon: TrendingUp },
  { type: 'competitor', title: 'Rakip aktivite', insight: 'Ana rakip yeni kampanya başlattı - UGC ağırlıklı', icon: Users },
  { type: 'recommendation', title: 'Önerilen açı', insight: 'Müşteri hikayelerine odaklanarak fark yaratabilirsiniz', icon: Target },
];

const pendingContent = [
  {
    title: 'Yaz Koleksiyonu - Carousel',
    platform: 'Instagram',
    objective: 'Etkileşim',
    scheduledDate: '28 Nisan'
  },
  {
    title: 'Müşteri Hikayesi Video',
    platform: 'TikTok',
    objective: 'Erişim',
    scheduledDate: '29 Nisan'
  },
];

const publishedContent = [
  { title: 'Perde Arkası - Üretim', platform: 'Instagram Story', engagement: '892', date: '25 Nisan' },
  { title: 'Ürün Tanıtım Reels', platform: 'Instagram', engagement: '2.4K', date: '24 Nisan' },
  { title: 'İpucu Carousel', platform: 'LinkedIn', engagement: '567', date: '23 Nisan' },
];

export function SocialMediaDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Sosyal Medya</h1>
        <p className="text-[#A0A0A0]">İçerik performansı ve yönetimi</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white">Onay Bekleyen İçerikler</h2>
            <span className="px-2 py-1 rounded bg-[#FFA726]/10 text-[#FFA726] text-xs">
              {pendingContent.length} beklemede
            </span>
          </div>
          <div className="space-y-3">
            {pendingContent.map((content, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white mb-2">{content.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                        {content.platform}
                      </span>
                      <span className="text-xs text-[#A0A0A0] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {content.scheduledDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" icon={Check} className="flex-1 justify-center text-sm py-2">
                    Onayla
                  </Button>
                  <Button variant="secondary" icon={X} className="flex-1 justify-center text-sm py-2">
                    Revizyon
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Yayınlanan İçerikler</h2>
          <div className="space-y-3">
            {publishedContent.map((content, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white mb-1">{content.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                        {content.platform}
                      </span>
                      <span className="text-xs text-[#A0A0A0]">{content.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-[#AAFF01]">{content.engagement}</div>
                    <div className="text-xs text-[#A0A0A0]">etkileşim</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">DM & Yorum Yönetimi</h2>
          <div className="grid grid-cols-1 gap-3">
            {dmCommentStats.map((stat, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-[#AAFF01]" />
                  </div>
                  <span className="text-white">{stat.metric}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl text-[#AAFF01]">{stat.value}</div>
                  <div className="text-xs text-[#A0A0A0]">{stat.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Rakip & Trend Notları</h2>
          <div className="space-y-3">
            {competitorInsights.map((insight, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center flex-shrink-0">
                    <insight.icon className="w-4 h-4 text-[#7B61FF]" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-medium mb-1">{insight.title}</h3>
                    <p className="text-[#A0A0A0] text-xs">{insight.insight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">İçerik Takvimi</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-[#A0A0A0] mb-2">{day}</div>
                <div className={`h-24 rounded-lg border border-white/[0.08] ${
                  i < 5 ? 'bg-[#202020]' : 'bg-transparent'
                } flex items-center justify-center text-xs text-[#A0A0A0]`}>
                  {i === 0 && '2 gönderi'}
                  {i === 2 && '1 gönderi'}
                  {i === 4 && '3 gönderi'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AutomationPreview />
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">Sosyal Medya Uzmanı Yorumu</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Bu hafta Instagram Reels'lerimiz olağanüstü performans gösterdi. Organik erişim %86 arttı.
              Kısa video formatı takipçilerinizle çok daha güçlü bağ kuruyor. Story içeriklerinden 3 kat daha fazla
              etkileşim alıyoruz.
            </p>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Önümüzdeki hafta için kullanıcı kaynaklı içerik (UGC) stratejisi uygulayacağız. Müşteri görüşlerini
              içeren 5 yeni video hazırlandı, onayınızı bekliyorlar.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
              <span>Ayşe Kara - Sosyal Medya Uzmanı</span>
              <span className="ml-auto">27 Nisan 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
