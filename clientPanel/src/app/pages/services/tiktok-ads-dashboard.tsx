import { useMemo, useState } from 'react';
import {
  Clock,
  DollarSign,
  Eye,
  MousePointerClick,
  Play,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../../components/button';
import { AutomationPreview } from '../../components/automation-preview';
import {
  useGetOwnTikTokAdsCampaignsQuery,
  useGetOwnTikTokAdsConfigQuery,
  useGetOwnTikTokAdsInsightsQuery,
  useGetOwnTikTokAdsSummaryQuery,
  useSyncOwnTikTokAdsMutation,
} from '../../features/tiktokAds/tiktokAdsApi';
import { useGetClientTasksQuery } from '../../features/tasks/tasksApi';
import type { TikTokAdsCampaign, TikTokAdsInsightItem } from '../../features/tiktokAds/tiktokAdsTypes';
import type { ClientTask } from '../../features/tasks/tasksTypes';

type DashboardStatusCopy = {
  kind: 'connected' | 'pending' | 'issue';
  title: string;
  description: string;
};

function buildChartData(insights: TikTokAdsInsightItem[]) {
  return [...insights]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      views: item.videoViews,
      vtr: parseFloat(item.vtr.toFixed(2)),
    }));
}

function buildHookRows(rows: TikTokAdsInsightItem[]) {
  return [...rows]
    .sort((left, right) => right.videoCompletionRate - left.videoCompletionRate)
    .slice(0, 4)
    .map((row, index) => ({
      name: row.entityName ?? `Video ${row.entityId.slice(-6)}`,
      retention: `${row.videoCompletionRate.toFixed(1)}%`,
      ctr: `${row.ctr.toFixed(1)}%`,
      status: index === 0 && row.videoCompletionRate >= 45 ? 'Winner' : row.videoCompletionRate < 20 ? 'İyileştir' : 'Testing',
      statusColor: index === 0 && row.videoCompletionRate >= 45 ? 'green' : row.videoCompletionRate < 20 ? 'orange' : 'blue',
    }));
}

function buildVideoCreativeRows(rows: TikTokAdsInsightItem[]) {
  return [...rows]
    .sort((left, right) => right.videoViews - left.videoViews)
    .slice(0, 8)
    .map((row) => ({
      id: row.id,
      name: row.entityName ?? `Creative ${row.entityId.slice(-6)}`,
      ctr: `${row.ctr.toFixed(1)}%`,
      vtr: `${row.vtr.toFixed(1)}%`,
      conversions: row.conversions,
      videoViews: formatInteger(row.videoViews),
    }));
}

function buildAudienceNotes(adGroups: TikTokAdsInsightItem[], summary?: { vtr: number; ctr: number; conversions: number }) {
  const notes: Array<{ insight: string; type: 'audience' | 'content' | 'discovery' }> = [];
  const topAudience = [...adGroups].sort((left, right) => right.conversions - left.conversions)[0];

  if (topAudience) {
    notes.push({
      insight: `${topAudience.entityName ?? 'En iyi ad group'} ${formatInteger(topAudience.conversions)} dönüşüm ve ${formatPercent(topAudience.vtr)} VTR üretti.`,
      type: 'audience',
    });
  }

  if (summary) {
    notes.push({
      insight: `Genel VTR ${formatPercent(summary.vtr)}; hook ve ilk 6 saniye kalitesi izlenmeye devam ediyor.`,
      type: 'content',
    });
    notes.push({
      insight: `${formatInteger(summary.conversions)} dönüşüm üretildi; CTR ${formatPercent(summary.ctr)} seviyesinde.`,
      type: 'discovery',
    });
  }

  return notes.slice(0, 3);
}

export function TikTokAdsDashboard() {
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const { data: tikTokConfig, isLoading: configLoading, isError: configError } = useGetOwnTikTokAdsConfigQuery();
  const connectionStatus = tikTokConfig?.connectionStatus ?? 'NOT_CONNECTED';
  const statusCopy = getClientConnectionCopy(connectionStatus, configError);
  const shouldSkipReportingQueries = statusCopy.kind !== 'connected';

  const [syncOwnTikTokAds, { isLoading: isSyncing }] = useSyncOwnTikTokAdsMutation();

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetOwnTikTokAdsSummaryQuery(undefined, { skip: shouldSkipReportingQueries });

  const {
    data: campaignsResponse,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
    refetch: refetchCampaigns,
  } = useGetOwnTikTokAdsCampaignsQuery({ limit: 6 }, { skip: shouldSkipReportingQueries });

  const { data: accountInsightsResponse } = useGetOwnTikTokAdsInsightsQuery(
    { level: 'ACCOUNT', limit: 14 },
    { skip: shouldSkipReportingQueries },
  );
  const { data: adGroupInsightsResponse } = useGetOwnTikTokAdsInsightsQuery(
    { level: 'ADGROUP', limit: 8 },
    { skip: shouldSkipReportingQueries },
  );
  const { data: adInsightsResponse } = useGetOwnTikTokAdsInsightsQuery(
    { level: 'AD', limit: 8 },
    { skip: shouldSkipReportingQueries },
  );
  const { data: clientTasks = [] } = useGetClientTasksQuery(undefined, { skip: shouldSkipReportingQueries });

  const campaigns = campaignsResponse?.data ?? [];
  const adInsights = adInsightsResponse?.data ?? [];
  const adGroupInsights = adGroupInsightsResponse?.data ?? [];
  const accountInsights = accountInsightsResponse?.data ?? [];
  const lastSyncAt =
    summary?.lastSyncAt ??
    campaignsResponse?.lastSyncAt ??
    accountInsightsResponse?.lastSyncAt ??
    tikTokConfig?.lastSyncAt ??
    null;

  async function handleSyncRefresh() {
    if (isSyncing) {
      return;
    }

    try {
      const response = await syncOwnTikTokAds(undefined).unwrap();
      if (response.syncStatus === 'SKIPPED') {
        setSyncMessage(response.skippedReason ?? 'Veriler çok kısa süre önce güncellendi.');
      } else {
        setSyncMessage('TikTok Ads verileri güncellendi.');
      }
      await Promise.all([refetchSummary(), refetchCampaigns()]);
    } catch {
      setSyncMessage('Bağlantı problemi var, ekibimiz ilgileniyor.');
    }
  }

  const displayKpiData = summary
    ? [
        { title: 'Video İzlenme', value: formatInteger(summary.videoViews), icon: Eye },
        { title: 'CTR', value: formatPercent(summary.ctr), icon: MousePointerClick },
        { title: 'CPA', value: formatCurrency(summary.costPerConversion), icon: DollarSign },
        { title: 'VTR', value: formatPercent(summary.vtr), icon: Play },
        { title: 'Dönüşüm', value: formatInteger(summary.conversions), icon: Users },
      ]
    : [];

  const displayCampaigns = campaigns.map((campaign) => ({
    ...campaign,
    statusLabel: normalizeCampaignStatusLabel(campaign.status),
    statusColor: campaign.status === 'ENABLE' || campaign.status === 'ACTIVE' ? 'green' : 'blue',
    comment: buildCampaignComment(campaign),
  }));

  const chartData = buildChartData(accountInsights);
  const hookPerformance = buildHookRows(adInsights);
  const videoCreatives = buildVideoCreativeRows(adInsights);
  const audienceNotes = useMemo(
    () => buildAudienceNotes(adGroupInsights, summary),
    [adGroupInsights, summary],
  );
  const clientActions: ClientTask[] = clientTasks
    .filter((task) => task.projectServiceId === 'tiktok-ads')
    .slice(0, 4);

  if (configLoading) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          TikTok Ads bağlantı durumu yükleniyor...
        </div>
      </div>
    );
  }

  if (statusCopy.kind !== 'connected') {
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="mb-2 text-3xl text-white">TikTok Ads</h1>
          <p className="text-[#A0A0A0]">TikTok reklam kampanyaları ve UGC içerik</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="mb-2 text-xl text-white">{statusCopy.title}</h2>
          <p className="text-sm text-[#A0A0A0]">{statusCopy.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl text-white">TikTok Ads</h1>
          <p className="text-[#A0A0A0]">TikTok reklam kampanyaları ve UGC içerik</p>
        </div>
        <Button variant="secondary" className="text-sm" onClick={() => void handleSyncRefresh()} disabled={isSyncing}>
          {isSyncing ? 'Güncelleniyor...' : 'Yenile'}
        </Button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#A0A0A0]">
        Son güncelleme:{' '}
        <span className="text-white">
          {lastSyncAt ? new Date(lastSyncAt).toLocaleString('tr-TR') : 'Henüz senkron yok'}
        </span>
      </div>

      {syncMessage ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#DADADA]">
          {syncMessage}
        </div>
      ) : null}

      {isSummaryLoading || isCampaignsLoading ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#A0A0A0]">
          TikTok Ads raporu güncelleniyor...
        </div>
      ) : null}

      {isSummaryError || isCampaignsError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin.
        </div>
      ) : null}

      {!isSummaryLoading && !isSummaryError && !summary ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#A0A0A0]">
          Seçili tarih aralığı için TikTok Ads özet verisi bulunamadı.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {displayKpiData.map((stat) => (
          <div key={stat.title} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-start justify-between">
              <span className="text-sm text-[#A0A0A0]">{stat.title}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AAFF01]/10">
                <stat.icon className="h-5 w-5 text-[#AAFF01]" />
              </div>
            </div>
            <div className="mb-1 text-3xl text-white">{stat.value}</div>
            <div className="text-sm text-[#A0A0A0]">Son snapshot</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 text-xl text-white">Kampanya Durumu</h2>
        {displayCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {displayCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="mb-1 text-white">{campaign.name}</h3>
                    <span className="rounded bg-[#7B61FF]/10 px-2 py-0.5 text-xs text-[#7B61FF]">
                      {campaign.objective}
                    </span>
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  <MetricMini label="Harcama" value={formatCurrency(campaign.spend)} />
                  <MetricMini label="CPA" value={formatCurrency(campaign.costPerConversion)} />
                  <MetricMini label="VTR" value={formatPercent(summary?.vtr ?? 0)} highlight />
                </div>
                <div className={`rounded-lg border px-3 py-1 text-center text-xs ${
                  campaign.statusColor === 'green'
                    ? 'border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]'
                    : 'border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]'
                }`}>
                  {campaign.statusLabel}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#A0A0A0]">Kampanya verisi bulunamadı.</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="mb-4 text-xl text-white">Hook Performans Panosu</h2>
          <p className="mb-4 text-xs text-[#A0A0A0]">İlk saniye ve video tamamlama sinyalleri</p>
          {hookPerformance.length > 0 ? (
            <div className="space-y-3">
              {hookPerformance.map((hook) => (
                <div key={hook.name} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm text-white">{hook.name}</h3>
                    <span className={`rounded border px-2 py-1 text-xs ${
                      hook.statusColor === 'green'
                        ? 'border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]'
                        : hook.statusColor === 'orange'
                          ? 'border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]'
                          : 'border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]'
                    }`}>
                      {hook.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricMini label="Retention" value={hook.retention} highlight />
                    <MetricMini label="CTR" value={hook.ctr} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-[#A0A0A0]">
              Hook performansı için ad-level insight bekleniyor.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="mb-4 text-xl text-white">Video Performans Trendi</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tiktokColorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" stroke="#A0A0A0" fontSize={12} />
                <YAxis stroke="#A0A0A0" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#A0A0A0' }}
                />
                <Area type="monotone" dataKey="views" stroke="#7B61FF" fillOpacity={1} fill="url(#tiktokColorViews)" name="Video İzlenme" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-[#A0A0A0]">
              Günlük video trendi için account insight bekleniyor.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 text-xl text-white">Video Kreatif Grid</h2>
        {videoCreatives.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {videoCreatives.map((video) => (
              <div key={video.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-[#131313]">
                  <Video className="h-9 w-9 text-[#7B61FF]" />
                </div>
                <h3 className="mb-3 text-sm text-white">{video.name}</h3>
                <div className="space-y-2">
                  <MetricLine label="CTR" value={video.ctr} highlight />
                  <MetricLine label="VTR" value={video.vtr} />
                  <MetricLine label="İzlenme" value={video.videoViews} />
                  <MetricLine label="Dönüşüm" value={String(video.conversions)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#A0A0A0]">Ad-level kreatif verisi henüz yok.</div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 text-xl text-white">Kitle & Keşif Notları</h2>
        {audienceNotes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {audienceNotes.map((note) => (
              <div key={note.insight} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                <div className="flex items-start gap-2">
                  <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7B61FF]" />
                  <p className="text-sm text-white">{note.insight}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#A0A0A0]">Kitle notları için ad group insight bekleniyor.</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#AAFF01]/20 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 p-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#AAFF01]/20">
              <Zap className="h-5 w-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="mb-2 text-xl text-white">Ajans Yorumu</h2>
              <p className="mb-4 text-sm text-[#A0A0A0]">
                {buildAgencyComment(summary, campaigns)}
              </p>
              <div className="mb-4 flex items-center gap-2 text-sm text-[#AAFF01]">
                <TrendingUp className="h-4 w-4" />
                <span>Video performansı ve dönüşüm kalitesi günlük snapshot verileriyle takip ediliyor.</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <Clock className="h-4 w-4" />
                <span>{lastSyncAt ? new Date(lastSyncAt).toLocaleDateString('tr-TR') : 'Henüz senkron yok'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="mb-4 text-xl text-white">Müşteri Aksiyonları</h2>
          {clientActions.length > 0 ? (
            <div className="space-y-3">
              {clientActions.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded px-2 py-1 text-xs ${getPriorityClass(item.priority)}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('tr-TR') : 'Tarih yok'}
                    </span>
                  </div>
                  <p className="text-sm text-white">{item.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A0A0A0]">Şu anda TikTok Ads için bekleyen aksiyon yok.</p>
          )}
        </div>
      </div>

      <AutomationPreview />
    </div>
  );
}

function MetricMini({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-[#131313] p-2">
      <div className={`text-sm ${highlight ? 'text-[#AAFF01]' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-[#A0A0A0]">{label}</div>
    </div>
  );
}

function MetricLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[#A0A0A0]">{label}</span>
      <span className={highlight ? 'text-[#AAFF01]' : 'text-white'}>{value}</span>
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

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function normalizeCampaignStatusLabel(status: string): string {
  if (status === 'ENABLE' || status === 'ACTIVE') return 'Aktif';
  if (status === 'DISABLE' || status === 'PAUSED') return 'Duraklatıldı';
  return status;
}

function buildCampaignComment(campaign: TikTokAdsCampaign): string {
  if (campaign.conversions > 0 && campaign.costPerConversion > 0) {
    return `${formatCurrency(campaign.costPerConversion)} CPA ile dönüşüm üretiyor; video varyasyonları bu kampanyadan beslenebilir.`;
  }
  if (campaign.ctr >= 2) {
    return `CTR ${formatPercent(campaign.ctr)}; kitle ve hook kombinasyonu test için anlamlı sinyal veriyor.`;
  }
  return 'Bu kampanya öğrenme/test aşamasında; hook ve kreatif kombinasyonları izleniyor.';
}

function buildAgencyComment(summary: { spend: number; videoViews: number; vtr: number; conversions: number } | undefined, campaigns: TikTokAdsCampaign[]): string {
  if (!summary) {
    return 'TikTok Ads verileri ilk senkron sonrası burada yorumlanacak.';
  }

  const topCampaign = [...campaigns].sort((left, right) => right.spend - left.spend)[0];
  const base = `${formatCurrency(summary.spend)} harcama ile ${formatInteger(summary.videoViews)} video izlenmesi ve ${formatInteger(summary.conversions)} dönüşüm üretildi. Ortalama VTR ${formatPercent(summary.vtr)}.`;

  if (!topCampaign) {
    return base;
  }

  return `${base} En yüksek hacmi ${topCampaign.name} kampanyası taşıyor; yeni UGC varyasyonları bu sinyale göre önceliklendirilebilir.`;
}

function getClientConnectionCopy(connectionStatus: string, hasQueryError: boolean): DashboardStatusCopy {
  if (hasQueryError) {
    return {
      kind: 'issue',
      title: 'Bağlantıda sorun var',
      description: 'Bağlantı problemi var, ekibimiz ilgileniyor.',
    };
  }
  if (connectionStatus === 'CONNECTED') {
    return {
      kind: 'connected',
      title: 'Bağlantı aktif',
      description: 'TikTok Ads bağlantısı aktif.',
    };
  }
  if (connectionStatus === 'PENDING') {
    return {
      kind: 'pending',
      title: 'Veriler hazırlanıyor',
      description: 'Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.',
    };
  }
  return {
    kind: 'issue',
    title: 'Bağlantıda sorun var',
    description: 'Bağlantı problemi var, ekibimiz ilgileniyor.',
  };
}

function getPriorityLabel(priority: ClientTask['priority']): string {
  if (priority === 'URGENT') return 'Acil';
  if (priority === 'HIGH') return 'Yüksek';
  if (priority === 'MEDIUM') return 'Orta';
  return 'Düşük';
}

function getPriorityClass(priority: ClientTask['priority']): string {
  if (priority === 'URGENT' || priority === 'HIGH') return 'bg-[#ff4444]/10 text-[#ff4444]';
  if (priority === 'MEDIUM') return 'bg-[#FFA726]/10 text-[#FFA726]';
  return 'bg-[#00D4FF]/10 text-[#00D4FF]';
}
