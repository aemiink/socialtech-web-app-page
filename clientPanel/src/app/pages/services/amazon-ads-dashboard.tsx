import { ShoppingCart, DollarSign, TrendingUp, Package, Star, AlertCircle, CheckCircle, Target, Search, Eye } from 'lucide-react';

const stats = [
  { title: 'ACOS', value: '18%', change: '-4%', icon: Target, color: 'green' },
  { title: 'TACOS', value: '12%', change: '-2%', icon: TrendingUp, color: 'green' },
  { title: 'Satışlar', value: '₺22.4K', change: '+28%', icon: DollarSign, color: 'green' },
  { title: 'Dönüşüm', value: '3.8%', change: '+0.6%', icon: ShoppingCart, color: 'green' },
  { title: 'Buy Box', value: '94%', change: '+2%', icon: Star, color: 'purple' },
];

const campaigns = [
  {
    type: 'Sponsored Products',
    spend: '₺2,800',
    sales: '₺15,400',
    acos: '18.2%',
    icon: Package
  },
  {
    type: 'Sponsored Brands',
    spend: '₺800',
    sales: '₺4,800',
    acos: '16.7%',
    icon: Star
  },
  {
    type: 'Sponsored Display',
    spend: '₺400',
    sales: '₺2,200',
    acos: '18.2%',
    icon: Eye
  },
];

const searchTerms = [
  { term: 'premium kablosuz kulaklık', spend: '₺420', sales: '₺2,240', acos: '18.8%', action: 'Scale', actionColor: 'green' },
  { term: 'bluetooth kulaklık', spend: '₺380', sales: '₺1,900', acos: '20.0%', action: 'Keep', actionColor: 'blue' },
  { term: 'ucuz kulaklık', spend: '₺180', sales: '₺360', acos: '50.0%', action: 'Negate', actionColor: 'red' },
  { term: 'noise cancelling headphone', spend: '₺290', sales: '₺1,740', acos: '16.7%', action: 'Scale', actionColor: 'green' },
  { term: 'kulaklık tavsiye', spend: '₺120', sales: '₺240', acos: '50.0%', action: 'Negate', actionColor: 'red' },
];

const asinTargeting = [
  { asin: 'B08X...', competitor: 'Rakip Ürün A', impressions: '12.4K', clicks: '284', cvr: '4.2%' },
  { asin: 'B09Y...', competitor: 'Rakip Ürün B', impressions: '8.7K', clicks: '192', cvr: '3.8%' },
  { asin: 'B07Z...', competitor: 'Rakip Ürün C', impressions: '6.2K', clicks: '148', cvr: '3.1%' },
];

const retailReadiness = [
  { item: 'Title Optimizasyonu', status: true },
  { item: 'A+ İçerik', status: true },
  { item: 'Ürün Görselleri (7/7)', status: true },
  { item: 'Rekabetçi Fiyatlandırma', status: true },
  { item: 'Müşteri Yorumları (4.6★)', status: true },
  { item: 'Stok Durumu', status: true },
  { item: 'Buy Box Sahibi', status: true },
  { item: 'Sponsored Brands Video', status: false },
];

const clientActions = [
  { action: 'Ürün görsellerini güncelle', priority: 'medium', dueDate: '30 Nis' },
  { action: 'Fiyatlandırma ve stok kontrolü', priority: 'high', dueDate: '28 Nis' },
  { action: 'Keyword genişletmesini onayla', priority: 'medium', dueDate: '2 May' },
];

export function AmazonAdsDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Amazon Ads</h1>
        <p className="text-[#A0A0A0]">Amazon Sponsored Products, Brands ve Display</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const colorMap = {
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
        <h2 className="text-xl text-white mb-4">Amazon Kampanya Genel Bakışı</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((campaign, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFA726]/10 flex items-center justify-center">
                  <campaign.icon className="w-5 h-5 text-[#FFA726]" />
                </div>
                <h3 className="text-white font-medium">{campaign.type}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Harcama</span>
                  <span className="text-white">{campaign.spend}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Satış</span>
                  <span className="text-white">{campaign.sales}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">ACOS</span>
                  <span className="text-[#AAFF01]">{campaign.acos}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Search Term Mining</h2>
        <p className="text-sm text-[#A0A0A0] mb-4">Arama terimi performans analizi</p>
        <div className="space-y-2">
          {searchTerms.map((st, i) => {
            const actionColors = {
              green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
              red: 'bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444]/20',
            };
            return (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#7B61FF]" />
                    <h3 className="text-white text-sm">{st.term}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${actionColors[st.actionColor as keyof typeof actionColors]}`}>
                    {st.action}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-[#A0A0A0]">Harcama</div>
                    <div className="text-sm text-white">{st.spend}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0]">Satış</div>
                    <div className="text-sm text-white">{st.sales}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0]">ACOS</div>
                    <div className={`text-sm ${parseFloat(st.acos) < 25 ? 'text-[#AAFF01]' : 'text-[#ff4444]'}`}>
                      {st.acos}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">ASIN Targeting</h2>
          <p className="text-sm text-[#A0A0A0] mb-4">Rakip ürün hedefleme performansı</p>
          <div className="space-y-3">
            {asinTargeting.map((asin, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#FFA726]" />
                      <span className="text-white text-sm font-medium">{asin.competitor}</span>
                    </div>
                    <span className="text-xs text-[#A0A0A0]">ASIN: {asin.asin}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{asin.impressions}</div>
                    <div className="text-xs text-[#A0A0A0]">Gösterim</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-white">{asin.clicks}</div>
                    <div className="text-xs text-[#A0A0A0]">Tık</div>
                  </div>
                  <div className="bg-[#131313] rounded-lg p-2">
                    <div className="text-sm text-[#AAFF01]">{asin.cvr}</div>
                    <div className="text-xs text-[#A0A0A0]">CVR</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Retail Readiness Checklist</h2>
          <div className="space-y-2">
            {retailReadiness.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-[#202020] rounded-xl p-3 border border-white/[0.08]">
                <span className="text-white text-sm">{item.item}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.status ? 'bg-[#AAFF01]/10' : 'bg-[#A0A0A0]/10'
                }`}>
                  {item.status ? (
                    <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#A0A0A0]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Bu hafta Amazon kampanyalarımızda ACOS hedefinin altında performans gösterdik. Sponsored Products
                kampanyası en yüksek satış hacmini getiriyor. Buy Box oranınız %94 ile mükemmel seviyede.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Search term mining analizinde bazı düşük performanslı terimleri negatif kelime listesine ekledik.
                ASIN targeting ile rakip ürünlerden kaliteli trafik çekiyoruz. Önümüzdeki hafta A+ content güncellemesi
                planlıyoruz.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>ACOS %18 • Buy Box %94 • Retail Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Selin Yıldız - Amazon Ads Uzmanı</span>
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
        </div>
      </div>
    </div>
  );
}
