import { DollarSign, Users, MousePointerClick, TrendingUp, TrendingDown, MessageSquare, AlertCircle, CheckCircle, Clock, Target, Image, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../../components/button';
import { AutomationPreview } from '../../components/automation-preview';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  useGetOwnMetaAdsCampaignsQuery,
  useGetOwnMetaAdsConfigQuery,
  useGetOwnMetaAdsSummaryQuery,
} from '../../features/metaAds/metaAdsApi';

const chartData = [
  { date: '20 Nis', ctr: 3.8, cpa: 95 },
  { date: '21 Nis', ctr: 3.5, cpa: 102 },
  { date: '22 Nis', ctr: 3.3, cpa: 97 },
  { date: '23 Nis', ctr: 3.2, cpa: 94 },
  { date: '24 Nis', ctr: 3.1, cpa: 92 },
  { date: '25 Nis', ctr: 3.0, cpa: 89 },
  { date: '26 Nis', ctr: 3.2, cpa: 91 },
];

const clientActions = [
  { type: 'approval', title: 'Yeni kampanya görselleri onay bekliyor', priority: 'high' },
  { type: 'feedback', title: 'Bütçe artışı için geri bildiriminiz gerekli', priority: 'medium' },
];

const funnelCampaigns = [
  { stage: 'TOF', campaigns: 2, spend: '₺18K', ctr: '3.2%' },
  { stage: 'MOF', campaigns: 1, spend: '₺5.5K', ctr: '2.8%' },
  { stage: 'BOF', campaigns: 1, spend: '₺8K', ctr: '4.1%' },
];

const creativeTests = [
  { name: 'UGC Video - Hook A', ctr: '4.2%', hookScore: 92, status: 'Winner', statusColor: 'green' },
  { name: 'Carousel - Product Focus', ctr: '3.8%', hookScore: 88, status: 'Winner', statusColor: 'green' },
  { name: 'Static Image - Lifestyle', ctr: '2.1%', hookScore: 65, status: 'Testing', statusColor: 'blue' },
  { name: 'Video - Feature Demo', ctr: '1.8%', hookScore: 58, status: 'Fatigue', statusColor: 'orange' },
];

const pixelStatus = [
  { metric: 'Pixel Aktif', status: true, value: 'Meta Pixel (ID: 2847...)', icon: CheckCircle },
  { metric: 'Purchase Event', status: true, value: 'Çalışıyor', icon: CheckCircle },
  { metric: 'Lead Event', status: true, value: 'Çalışıyor', icon: CheckCircle },
  { metric: 'Event Match Quality', status: true, value: '8.2/10', icon: Zap },
];

export function MetaAdsDashboard() {
  const { data: ownMetaAdsConfig, isLoading, isError } = useGetOwnMetaAdsConfigQuery();
  const connectionStatus = ownMetaAdsConfig?.connectionStatus ?? 'NOT_CONNECTED';
  const statusCopy = getClientConnectionCopy(connectionStatus, isError);
  const shouldSkipReportingQueries = statusCopy.kind !== 'connected';
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetOwnMetaAdsSummaryQuery(undefined, { skip: shouldSkipReportingQueries });
  const {
    data: campaignsResponse,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
  } = useGetOwnMetaAdsCampaignsQuery({ limit: 6 }, { skip: shouldSkipReportingQueries });

  const displayKpiData = summary
    ? [
        { title: 'ROAS', value: summary.roas !== null ? `${summary.roas.toFixed(2)}x` : '—', change: 0, icon: TrendingUp },
        { title: 'Tıklama Oranı', value: `${summary.ctr.toFixed(2)}%`, change: 0, icon: MousePointerClick },
        { title: 'Harcama', value: formatCurrency(summary.spend), change: 0, icon: DollarSign },
        { title: 'Sonuçlar', value: formatInteger(summary.results), change: 0, icon: Users },
      ]
    : [];

  const displayCampaigns = campaignsResponse && campaignsResponse.data.length > 0
    ? campaignsResponse.data.map((campaign) => ({
        name: campaign.name,
        budget: formatCurrency(campaign.spend),
        roas: campaign.roas !== null ? `${campaign.roas.toFixed(2)}x` : '—',
        ctr: `${campaign.ctr.toFixed(2)}%`,
        cpa: campaign.results > 0 ? formatCurrency(campaign.spend / campaign.results) : '—',
        status: normalizeCampaignStatusLabel(campaign.effectiveStatus),
        statusColor: campaign.effectiveStatus === 'ACTIVE' ? 'green' : 'blue',
        objective: campaign.objective,
        comment: buildCampaignComment(campaign),
      }))
    : [];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08] text-[#A0A0A0]">
          Meta bağlantı durumu yükleniyor...
        </div>
      </div>
    );
  }

  if (statusCopy.kind !== 'connected') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl text-white mb-2">Meta Ads</h1>
          <p className="text-[#A0A0A0]">Facebook ve Instagram reklam performansı</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-2">{statusCopy.title}</h2>
          <p className="text-[#A0A0A0] text-sm">{statusCopy.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Meta Ads</h1>
          <p className="text-[#A0A0A0]">Facebook ve Instagram reklam performansı</p>
        </div>
      </div>

      {(isSummaryLoading || isCampaignsLoading) ? (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
          Meta Ads raporu güncelleniyor...
        </div>
      ) : null}
      {(isSummaryError || isCampaignsError) ? (
        <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/30 text-sm text-red-200">
          Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin.
        </div>
      ) : null}

      {!isSummaryLoading && !isSummaryError && !summary ? (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
          Seçili tarih aralığı için özet rapor verisi bulunamadı.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayKpiData.map((kpi, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-start justify-between mb-4">
              <span className="text-[#A0A0A0] text-sm">{kpi.title}</span>
              <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-[#AAFF01]" />
              </div>
            </div>
            <div className="text-3xl text-white mb-2">{kpi.value}</div>
            <div className="flex items-center gap-2">
              {kpi.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#ff4444]" />
              )}
              <span className={kpi.change >= 0 ? 'text-[#AAFF01] text-sm' : 'text-[#ff4444] text-sm'}>
                {kpi.change >= 0 ? '+' : ''}{kpi.change}%
              </span>
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
            <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Bu hafta Meta kampanyalarında güçlü performans gözlemledik. Özellikle UGC (kullanıcı kaynaklı içerik) formatı
              standart ürün fotoğraflarından %240 daha iyi sonuç veriyor. Yeniden hedefleme kampanyamız olağanüstü - 6.2x ROAS
              ile en karlı kampanyamız.
            </p>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Soğuk kitle testinde henüz erken aşamadayız. 2 hafta daha veri topladıktan sonra optimize edeceğiz.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
              <span>Elif Yılmaz - Meta Ads Uzmanı</span>
              <span className="ml-auto">27 Nisan 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">CTR Trendi</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                <Line type="monotone" dataKey="ctr" stroke="#AAFF01" strokeWidth={2} name="CTR %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">CPA Trendi</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                <Line type="monotone" dataKey="cpa" stroke="#7B61FF" strokeWidth={2} name="CPA ₺" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Funnel Görünümü</h2>
          <div className="space-y-3">
            {funnelCampaigns.map((funnel, i) => (
              <div key={i}>
                <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#AAFF01]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{funnel.stage}</h3>
                        <span className="text-xs text-[#A0A0A0]">{funnel.campaigns} kampanya</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-white">{funnel.spend}</div>
                      <div className="text-xs text-[#A0A0A0]">Harcama</div>
                    </div>
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-[#AAFF01]">{funnel.ctr}</div>
                      <div className="text-xs text-[#A0A0A0]">CTR</div>
                    </div>
                  </div>
                </div>
                {i < funnelCampaigns.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-[#A0A0A0] rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Kreatif Test Panosu</h2>
          <div className="space-y-3">
            {creativeTests.map((creative, i) => {
              const statusColors = {
                green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
                blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
                orange: 'bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20',
              };
              return (
                <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-[#7B61FF]" />
                      <h3 className="text-white text-sm">{creative.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${statusColors[creative.statusColor as keyof typeof statusColors]}`}>
                      {creative.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-[#AAFF01]">{creative.ctr}</div>
                      <div className="text-xs text-[#A0A0A0]">CTR</div>
                    </div>
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-white">{creative.hookScore}</div>
                      <div className="text-xs text-[#A0A0A0]">Hook Skoru</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Pixel & Event Takibi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pixelStatus.map((item, i) => (
            <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.status ? 'bg-[#AAFF01]/10' : 'bg-[#ff4444]/10'
                }`}>
                  <item.icon className={`w-5 h-5 ${item.status ? 'text-[#AAFF01]' : 'text-[#ff4444]'}`} />
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
        <div className="lg:col-span-2">
          <h2 className="text-2xl text-white mb-4">Kampanyalar</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayCampaigns.map((campaign, i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl text-white">{campaign.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                      {campaign.objective}
                    </span>
                  </div>
                  <span className="text-[#A0A0A0] text-sm">Bütçe: {campaign.budget}</span>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm ${
                  campaign.statusColor === 'green'
                    ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                    : 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                }`}>
                  {campaign.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#202020] rounded-lg p-3 text-center">
                  <div className="text-lg text-white">{campaign.roas}</div>
                  <div className="text-xs text-[#A0A0A0]">ROAS</div>
                </div>
                <div className="bg-[#202020] rounded-lg p-3 text-center">
                  <div className="text-lg text-white">{campaign.ctr}</div>
                  <div className="text-xs text-[#A0A0A0]">CTR</div>
                </div>
                <div className="bg-[#202020] rounded-lg p-3 text-center">
                  <div className="text-lg text-white">{campaign.cpa}</div>
                  <div className="text-xs text-[#A0A0A0]">CPA</div>
                </div>
              </div>

              <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white">{campaign.comment}</p>
                </div>
              </div>
            </div>
          ))}
            {!isCampaignsLoading && !isCampaignsError && displayCampaigns.length === 0 ? (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08] text-sm text-[#A0A0A0] lg:col-span-2">
                Kampanya verisi bulunamadı.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-xl text-white mb-4">Sizden Beklenenler</h2>
            <div className="space-y-3">
              {clientActions.map((action, i) => (
                <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        action.type === 'approval'
                          ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                          : 'bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20'
                      }`}>
                        {action.type === 'approval' ? 'Onay Gerekli' : 'Geri Bildirim'}
                      </span>
                      <p className="text-white text-sm mt-2">{action.title}</p>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full justify-center text-sm py-2">
                    {action.type === 'approval' ? 'İncele ve Onayla' : 'Geri Bildirim Ver'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <AutomationPreview />
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeCampaignStatusLabel(status: string): string {
  if (status === 'ACTIVE') {
    return 'Active';
  }

  if (status === 'PAUSED') {
    return 'Paused';
  }

  return status;
}

function buildCampaignComment(campaign: { roas: number | null; ctr: number; results: number }): string {
  if (campaign.roas !== null && campaign.roas >= 3) {
    return 'Bu kampanya güçlü dönüşüm performansı üretiyor; mevcut kreatif varyantları korunmalı.';
  }

  if (campaign.ctr >= 2 && campaign.results > 0) {
    return 'Kampanya dengeli ilerliyor, bir sonraki iterasyonda kreatif testleri ile optimize edilebilir.';
  }

  return 'Bu kampanya test aşamasında; kitle ve kreatif kombinasyonları optimize ediliyor.';
}

function getClientConnectionCopy(connectionStatus: string, hasQueryError: boolean): {
  kind: 'connected' | 'pending' | 'issue';
  title: string;
  description: string;
} {
  if (hasQueryError) {
    return {
      kind: 'issue',
      title: 'Bağlantıda sorun var',
      description: 'Bağlantıda sorun var, ekibimiz ilgileniyor.',
    };
  }

  if (connectionStatus === 'CONNECTED') {
    return {
      kind: 'connected',
      title: 'Bağlantı aktif',
      description: 'Meta Ads bağlantısı aktif.',
    };
  }

  if (connectionStatus === 'PENDING') {
    return {
      kind: 'pending',
      title: 'Bağlantı bekleniyor',
      description: 'Bağlantı bekleniyor, ekibimiz kurulumu tamamlıyor.',
    };
  }

  return {
    kind: 'issue',
    title: 'Bağlantıda sorun var',
    description: 'Bağlantıda sorun var, ekibimiz ilgileniyor.',
  };
}
