import { useState } from 'react';
import { DollarSign, Users, MousePointerClick, TrendingUp, TrendingDown, MessageSquare, AlertCircle, CheckCircle, Clock, Target, Image, ArrowRight, Zap, XCircle, WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '../../components/button';
import { AutomationPreview } from '../../components/automation-preview';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  useGetOwnMetaAdsCampaignsQuery,
  useGetOwnMetaAdsAdSetsQuery,
  useGetOwnMetaAdsConfigQuery,
  useGetOwnMetaAdsInsightsQuery,
  useGetOwnMetaAdsPixelStatusQuery,
  useGetOwnMetaAdsReportsQuery,
  useGetOwnMetaAdsSummaryQuery,
  useSyncOwnMetaAdsMutation,
} from '../../features/metaAds/metaAdsApi';
import { useGetClientTasksQuery } from '../../features/tasks/tasksApi';
import type { MetaAdsInsightItem } from '../../features/metaAds/metaAdsTypes';
import type { ClientTask } from '../../features/tasks/tasksTypes';

const TOF_OBJECTIVES = new Set(['AWARENESS', 'REACH', 'VIDEO_VIEWS', 'BRAND_AWARENESS', 'OUTCOME_AWARENESS']);
const MOF_OBJECTIVES = new Set(['TRAFFIC', 'ENGAGEMENT', 'APP_INSTALLS', 'POST_ENGAGEMENT', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT']);
const BOF_OBJECTIVES = new Set(['CONVERSIONS', 'CATALOG_SALES', 'STORE_TRAFFIC', 'LEAD_GENERATION', 'OUTCOME_SALES', 'OUTCOME_LEADS']);

type FunnelStage = 'TOF' | 'MOF' | 'BOF';

function classifyObjective(objective: string): FunnelStage {
  const upper = objective.toUpperCase();
  if (TOF_OBJECTIVES.has(upper)) return 'TOF';
  if (MOF_OBJECTIVES.has(upper)) return 'MOF';
  if (BOF_OBJECTIVES.has(upper)) return 'BOF';
  return 'BOF';
}

function buildFunnelData(campaigns: Array<{ objective: string; spend: number; ctr: number }>) {
  const stages: Record<FunnelStage, { campaigns: number; spend: number; ctrSum: number }> = {
    TOF: { campaigns: 0, spend: 0, ctrSum: 0 },
    MOF: { campaigns: 0, spend: 0, ctrSum: 0 },
    BOF: { campaigns: 0, spend: 0, ctrSum: 0 },
  };

  for (const c of campaigns) {
    const stage = classifyObjective(c.objective);
    stages[stage].campaigns += 1;
    stages[stage].spend += c.spend;
    stages[stage].ctrSum += c.ctr;
  }

  return (['TOF', 'MOF', 'BOF'] as FunnelStage[])
    .filter((s) => stages[s].campaigns > 0)
    .map((s) => ({
      stage: s,
      campaigns: stages[s].campaigns,
      spend: formatCurrency(stages[s].spend),
      ctr: `${stages[s].campaigns > 0 ? (stages[s].ctrSum / stages[s].campaigns).toFixed(1) : '0.0'}%`,
    }));
}

function buildChartData(insights: MetaAdsInsightItem[]) {
  return insights.map((item) => ({
    date: new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    ctr: parseFloat(item.ctr.toFixed(2)),
    cpa: item.results > 0 ? parseFloat((item.spend / item.results).toFixed(0)) : null,
  }));
}

function buildCreativeTestRows(adsets: Array<{ id: string; entityName: string | null; ctr: number; spend: number }>) {
  if (adsets.length === 0) return [];
  const sorted = [...adsets].sort((a, b) => b.ctr - a.ctr);
  const maxCtr = sorted[0]?.ctr ?? 0;

  return sorted.map((adset, idx) => {
    const hookScore = maxCtr > 0 ? Math.round((adset.ctr / maxCtr) * 100) : 0;
    let status: string;
    let statusColor: 'green' | 'blue' | 'orange';

    if (idx === 0 && adset.ctr >= 2) {
      status = 'Winner';
      statusColor = 'green';
    } else if (adset.ctr < 1) {
      status = 'Fatigue';
      statusColor = 'orange';
    } else {
      status = 'Testing';
      statusColor = 'blue';
    }

    return {
      name: adset.entityName ?? `AdSet ${adset.id.slice(-6)}`,
      ctr: `${adset.ctr.toFixed(1)}%`,
      hookScore,
      status,
      statusColor,
    };
  });
}

function buildPixelStatusRows(pixelData: {
  pixelId: string | null;
  adAccountId: string | null;
  eventStatus: string;
  setupWarning: string | null;
  lastInsightAt: string | null;
}) {
  const pixelActive = pixelData.pixelId !== null;
  const eventActive = pixelData.eventStatus === 'ACTIVE';

  return [
    {
      metric: 'Pixel Aktif',
      status: pixelActive,
      value: pixelActive ? `Meta Pixel (ID: ${pixelData.pixelId?.slice(0, 8)}...)` : 'Bağlı değil',
      Icon: pixelActive ? CheckCircle : XCircle,
    },
    {
      metric: 'Event Durumu',
      status: eventActive,
      value: eventActive ? 'Çalışıyor' : (pixelData.eventStatus === 'NOT_CONFIGURED' ? 'Yapılandırılmamış' : 'Veri Yok'),
      Icon: eventActive ? CheckCircle : WifiOff,
    },
    {
      metric: 'Ad Account',
      status: pixelData.adAccountId !== null,
      value: pixelData.adAccountId ? `Aktif (${pixelData.adAccountId.slice(-6)})` : 'Bağlı değil',
      Icon: pixelData.adAccountId ? CheckCircle : XCircle,
    },
    {
      metric: 'Son Insight',
      status: pixelData.lastInsightAt !== null,
      value: pixelData.lastInsightAt
        ? new Date(pixelData.lastInsightAt).toLocaleDateString('tr-TR')
        : 'Henüz yok',
      Icon: pixelData.lastInsightAt ? Zap : Clock,
    },
  ];
}

export function MetaAdsDashboard() {
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const { data: ownMetaAdsConfig, isLoading, isError } = useGetOwnMetaAdsConfigQuery();
  const connectionStatus = ownMetaAdsConfig?.connectionStatus ?? 'NOT_CONNECTED';
  const statusCopy = getClientConnectionCopy(connectionStatus, isError);
  const shouldSkipReportingQueries = statusCopy.kind !== 'connected';

  const [syncOwnMetaAds, { isLoading: isSyncing }] = useSyncOwnMetaAdsMutation();

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetOwnMetaAdsSummaryQuery(undefined, { skip: shouldSkipReportingQueries });

  const {
    data: campaignsResponse,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
    refetch: refetchCampaigns,
  } = useGetOwnMetaAdsCampaignsQuery({ limit: 6 }, { skip: shouldSkipReportingQueries });

  const { data: insightsResponse } = useGetOwnMetaAdsInsightsQuery(
    { level: 'ACCOUNT', limit: 14 },
    { skip: shouldSkipReportingQueries },
  );

  const { data: adSetsResponse } = useGetOwnMetaAdsAdSetsQuery(
    { limit: 8 },
    { skip: shouldSkipReportingQueries },
  );

  const { data: pixelStatusData } = useGetOwnMetaAdsPixelStatusQuery(
    undefined,
    { skip: shouldSkipReportingQueries },
  );

  const { data: reportsResponse } = useGetOwnMetaAdsReportsQuery(
    { status: 'PUBLISHED', limit: 1 },
    { skip: shouldSkipReportingQueries },
  );

  const { data: pendingTasksResponse } = useGetClientTasksQuery(
    { approvalRequired: true, approvalStatus: 'PENDING' },
    { skip: shouldSkipReportingQueries },
  );

  const lastSyncAt = summary?.lastSyncAt ?? campaignsResponse?.lastSyncAt ?? ownMetaAdsConfig?.lastSyncAt ?? null;

  async function handleSyncRefresh() {
    if (isSyncing) return;
    try {
      const response = await syncOwnMetaAds(undefined).unwrap();
      if (response.syncStatus === 'SKIPPED') {
        setSyncMessage(response.skippedReason ?? 'Veriler çok kısa süre önce güncellendi.');
      } else {
        setSyncMessage('Veriler güncellendi.');
      }
      await Promise.all([refetchSummary(), refetchCampaigns()]);
    } catch {
      setSyncMessage('Bağlantı problemi var, ekibimiz ilgileniyor.');
    }
  }

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
        name: campaign.name.replace(/_/g, " "),
        budget: formatCurrency(campaign.spend),
        spend: campaign.spend,
        roas: campaign.roas !== null ? `${campaign.roas.toFixed(2)}x` : '—',
        ctr: `${campaign.ctr.toFixed(2)}%`,
        cpa: campaign.results > 0 ? formatCurrency(campaign.spend / campaign.results) : '—',
        status: normalizeCampaignStatusLabel(campaign.effectiveStatus),
        statusColor: campaign.effectiveStatus === 'ACTIVE' ? 'green' : 'blue',
        objective: formatMetaObjective(campaign.objective),
        comment: buildCampaignComment(campaign),
      }))
    : [];

  const chartData = insightsResponse && insightsResponse.data.length > 0
    ? buildChartData(insightsResponse.data)
    : [];

  const funnelCampaigns = campaignsResponse && campaignsResponse.data.length > 0
    ? buildFunnelData(campaignsResponse.data)
    : [];

  const creativeTests = adSetsResponse && adSetsResponse.data.length > 0
    ? buildCreativeTestRows(adSetsResponse.data)
    : [];

  const pixelStatusRows = pixelStatusData
    ? buildPixelStatusRows(pixelStatusData)
    : [];

  const pendingApprovalTasks: ClientTask[] = pendingTasksResponse
    ? pendingTasksResponse.filter((t) => t.approvalRequired && t.approvalStatus === 'PENDING')
    : [];

  const latestReport = reportsResponse?.data?.[0] ?? null;

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

  const kpiBorderColors = ['border-l-[#AAFF01]', 'border-l-[#00D4FF]', 'border-l-[#7B61FF]', 'border-l-[#FFA726]'];
  const kpiIconColors = ['text-[#AAFF01]', 'text-[#00D4FF]', 'text-[#7B61FF]', 'text-[#FFA726]'];
  const kpiBgColors = ['bg-[#AAFF01]/10', 'bg-[#00D4FF]/10', 'bg-[#7B61FF]/10', 'bg-[#FFA726]/10'];

  const totalSpend = campaignsResponse?.data.reduce((sum, c) => sum + c.spend, 0) ?? 0;

  return (
    <div className="p-8 space-y-6">
      {/* Hero section */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1A1A1A] to-[#202020] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#AAFF01]/10">
              <Wifi className="h-6 w-6 text-[#AAFF01]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Meta Ads</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#AAFF01]/10 px-2 py-0.5 text-xs text-[#AAFF01] border border-[#AAFF01]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#AAFF01]" />
                  Bağlı
                </span>
                <span className="text-xs text-[#A0A0A0]">Facebook &amp; Instagram reklam performansı</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="secondary"
              className="flex items-center gap-2 text-sm"
              onClick={() => void handleSyncRefresh()}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Güncelleniyor...' : 'Senkron Et'}
            </Button>
            <span className="text-xs text-[#A0A0A0]">
              Son güncelleme:{' '}
              <span className="text-white">
                {lastSyncAt ? new Date(lastSyncAt).toLocaleString('tr-TR') : 'Henüz yok'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {syncMessage ? (
        <div className="rounded-2xl border border-[#AAFF01]/20 bg-[#AAFF01]/5 p-4 text-sm text-[#DADADA]">
          {syncMessage}
        </div>
      ) : null}

      {(isSummaryLoading || isCampaignsLoading) ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#A0A0A0]">
          Meta Ads raporu güncelleniyor...
        </div>
      ) : null}

      {(isSummaryError || isCampaignsError) ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin.
        </div>
      ) : null}

      {!isSummaryLoading && !isSummaryError && !summary ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#A0A0A0]">
          Seçili tarih aralığı için özet rapor verisi bulunamadı.
        </div>
      ) : null}

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayKpiData.map((kpi, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 border-l-4 ${kpiBorderColors[i] ?? 'border-l-white/20'}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">{kpi.title}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpiBgColors[i] ?? 'bg-white/10'}`}>
                <kpi.icon className={`h-4 w-4 ${kpiIconColors[i] ?? 'text-white'}`} />
              </div>
            </div>
            <div className="text-4xl font-semibold text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      {latestReport ? (
        <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-white mb-2">Ajans Raporu</h2>
              {latestReport.summary ? (
                <p className="text-[#A0A0A0] text-sm mb-4 whitespace-pre-wrap">{latestReport.summary}</p>
              ) : (
                <p className="text-[#A0A0A0] text-sm mb-4">
                  {latestReport.periodStart} — {latestReport.periodEnd} dönemi raporu yayınlandı.
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <Clock className="w-4 h-4" />
                <span>
                  {latestReport.publishedAt
                    ? new Date(latestReport.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : ''}
                </span>
                <span className="ml-auto px-2 py-0.5 rounded bg-[#AAFF01]/10 text-[#AAFF01] text-xs border border-[#AAFF01]/20">
                  {latestReport.type === 'WEEKLY' ? 'Haftalık' : latestReport.type === 'MONTHLY' ? 'Aylık' : latestReport.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">CTR Trendi</h2>
            <span className="rounded-full bg-[#AAFF01]/10 px-2 py-0.5 text-xs text-[#AAFF01]">Son 14 gün</span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#202020',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="ctr" stroke="#AAFF01" strokeWidth={2} dot={false} name="CTR %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-[#A0A0A0]">
              Henüz günlük insight verisi yok.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">CPA Trendi</h2>
            <span className="rounded-full bg-[#7B61FF]/10 px-2 py-0.5 text-xs text-[#7B61FF]">Son 14 gün</span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#202020',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="cpa" stroke="#7B61FF" strokeWidth={2} dot={false} name="CPA ₺" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-[#A0A0A0]">
              CPA verisi için yeterli dönüşüm kaydı yok.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Funnel Görünümü</h2>
          {funnelCampaigns.length > 0 ? (
            <div className="space-y-3">
              {funnelCampaigns.map((funnel, i) => (
                <div key={funnel.stage}>
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
                        <div className="text-xs text-[#A0A0A0]">Ort. CTR</div>
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
          ) : (
            <div className="flex items-center justify-center h-32 text-[#A0A0A0] text-sm">
              Funnel verisi için aktif kampanya bulunamadı.
            </div>
          )}
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Kreatif Test Panosu</h2>
          {creativeTests.length > 0 ? (
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
                      <span className={`text-xs px-2 py-1 rounded border ${statusColors[creative.statusColor]}`}>
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
                        <div className="text-xs text-[#A0A0A0]">Performans Skoru</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-[#A0A0A0] text-sm">
              AdSet verisi henüz yok.
            </div>
          )}
        </div>
      </div>

      {pixelStatusRows.length > 0 ? (
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Pixel & Event Takibi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pixelStatusRows.map((item, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.status ? 'bg-[#AAFF01]/10' : 'bg-[#ff4444]/10'
                  }`}>
                    <item.Icon className={`w-5 h-5 ${item.status ? 'text-[#AAFF01]' : 'text-[#ff4444]'}`} />
                  </div>
                  <div>
                    <div className="text-[#A0A0A0] text-xs mb-1">{item.metric}</div>
                    <div className="text-white text-sm">{item.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pixelStatusData?.setupWarning ? (
            <div className="mt-4 bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20 text-sm text-yellow-200">
              {pixelStatusData.setupWarning}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Campaigns + sticky sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-white">Kampanyalar</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {displayCampaigns.map((campaign, i) => {
              const spendPct = totalSpend > 0 ? Math.round((campaign.spend / totalSpend) * 100) : 0;
              return (
                <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${campaign.statusColor === 'green' ? 'bg-[#AAFF01]' : 'bg-[#00D4FF]'}`} />
                        <h3 className="truncate text-sm font-medium text-white">{campaign.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#7B61FF]/10 px-1.5 py-0.5 text-[11px] text-[#7B61FF]">
                          {campaign.objective}
                        </span>
                        <span className={`rounded border px-1.5 py-0.5 text-[11px] ${
                          campaign.statusColor === 'green'
                            ? 'border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]'
                            : 'border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-sm font-semibold text-white">{campaign.budget}</span>
                  </div>

                  {/* Spend bar */}
                  <div className="mb-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#AAFF01]"
                        style={{ width: `${Math.min(spendPct, 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 text-[11px] text-[#A0A0A0]">{spendPct}% toplam harcama</span>
                  </div>

                  {/* Metrics */}
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[#202020] p-2.5 text-center">
                      <div className="text-sm font-semibold text-[#AAFF01]">{campaign.roas}</div>
                      <div className="text-[11px] text-[#A0A0A0]">ROAS</div>
                    </div>
                    <div className="rounded-lg bg-[#202020] p-2.5 text-center">
                      <div className="text-sm font-semibold text-[#00D4FF]">{campaign.ctr}</div>
                      <div className="text-[11px] text-[#A0A0A0]">CTR</div>
                    </div>
                    <div className="rounded-lg bg-[#202020] p-2.5 text-center">
                      <div className="text-sm font-semibold text-white">{campaign.cpa}</div>
                      <div className="text-[11px] text-[#A0A0A0]">CPA</div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#AAFF01]" />
                      <p className="text-xs text-[#d7d7d7]">{campaign.comment}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {!isCampaignsLoading && !isCampaignsError && displayCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0] lg:col-span-2">
                Kampanya verisi bulunamadı.
              </div>
            ) : null}
          </div>
        </div>

        {/* Sticky right sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
            <h2 className="mb-4 text-base font-semibold text-white">Sizden Beklenenler</h2>
            {pendingApprovalTasks.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovalTasks.map((task) => {
                  const isApproval = task.approvalType !== null && task.approvalType !== undefined;
                  return (
                    <div key={task.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        isApproval
                          ? 'border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]'
                          : 'border-[#7B61FF]/20 bg-[#7B61FF]/10 text-[#7B61FF]'
                      }`}>
                        {isApproval ? 'Onay Gerekli' : 'Geri Bildirim'}
                      </span>
                      <p className="mt-2 text-sm text-white">{task.title}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-[#A0A0A0]">
                Şu anda bekleyen onay görevi yok.
              </div>
            )}
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

const META_OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_TRAFFIC: "Trafik",
  OUTCOME_ENGAGEMENT: "Etkileşim",
  OUTCOME_AWARENESS: "Farkındalık",
  OUTCOME_LEADS: "Lead",
  OUTCOME_SALES: "Satış",
  OUTCOME_APP_PROMOTION: "Uygulama",
  LINK_CLICKS: "Link Tıklamaları",
  POST_ENGAGEMENT: "Gönderi Etkileşimi",
  REACH: "Erişim",
  BRAND_AWARENESS: "Marka Bilinirliği",
  VIDEO_VIEWS: "Video Görüntüleme",
  CONVERSIONS: "Dönüşüm",
  APP_INSTALLS: "Uygulama Yükleme",
  LEAD_GENERATION: "Lead Üretimi",
  MESSAGES: "Mesajlar",
  CATALOG_SALES: "Katalog Satışı",
};

function formatMetaObjective(objective: string): string {
  return META_OBJECTIVE_LABELS[objective] ?? objective.replace(/^OUTCOME_/, "").replace(/_/g, " ");
}

function normalizeCampaignStatusLabel(status: string): string {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'PAUSED') return 'Paused';
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
    return { kind: 'issue', title: 'Bağlantıda sorun var', description: 'Bağlantıda sorun var, ekibimiz ilgileniyor.' };
  }
  if (connectionStatus === 'CONNECTED') {
    return { kind: 'connected', title: 'Bağlantı aktif', description: 'Meta Ads bağlantısı aktif.' };
  }
  if (connectionStatus === 'PENDING') {
    return { kind: 'pending', title: 'Veriler hazırlanıyor', description: 'Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.' };
  }
  return { kind: 'issue', title: 'Bağlantıda sorun var', description: 'Bağlantıda sorun var, ekibimiz ilgileniyor.' };
}
