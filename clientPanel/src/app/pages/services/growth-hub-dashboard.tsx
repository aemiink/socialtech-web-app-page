import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  useGetClientGrowthHubActionsQuery,
  useGetClientGrowthHubActivityQuery,
  useGetClientGrowthHubChannelsQuery,
  useGetClientGrowthHubConfigQuery,
  useGetClientGrowthHubSummaryQuery,
  useGetClientGrowthHubWeeklyNotesQuery,
} from "../../features/growthHub/growthHubApi";
import type {
  GrowthHubActionItem,
  GrowthHubActivityItem,
  GrowthHubChannelSummary,
  GrowthHubConfig,
  GrowthHubSummary,
  GrowthHubWeeklyNote,
} from "../../features/growthHub/growthHubTypes";
import {
  calculateGrowthHealthScore,
  formatGrowthHubCompactNumber,
  formatGrowthHubCurrency,
  formatGrowthHubDate,
  formatGrowthHubDateRange,
  formatGrowthHubNumber,
  formatGrowthHubRatio,
  getGrowthHubActionTypeLabel,
  getGrowthHubActionStatusLabel,
  getGrowthHubActivityTypeLabel,
  getGrowthHubChannelStatusLabel,
  getGrowthHubGoalLabel,
  getGrowthHubServiceLabel,
  getGrowthHubSourceStatusLabel,
  getGrowthHubStatusTone,
  getGrowthHubSummaryStateLabel,
} from "../../features/growthHub/growthHubUtils";

const cardClass = "bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]";
const innerClass = "bg-[#202020] rounded-xl p-4 border border-white/[0.08]";

type StatCardTone = "green" | "blue" | "purple" | "orange" | "red";

type StatCard = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: StatCardTone;
};

const statToneMap: Record<StatCardTone, { bg: string; text: string }> = {
  green: { bg: "bg-[#AAFF01]/10", text: "text-[#AAFF01]" },
  blue: { bg: "bg-[#00D4FF]/10", text: "text-[#00D4FF]" },
  purple: { bg: "bg-[#7B61FF]/10", text: "text-[#7B61FF]" },
  orange: { bg: "bg-[#FFA726]/10", text: "text-[#FFA726]" },
  red: { bg: "bg-[#ff4444]/10", text: "text-[#ff4444]" },
};

export function GrowthHubDashboard() {
  const summaryQuery = useGetClientGrowthHubSummaryQuery();
  const configQuery = useGetClientGrowthHubConfigQuery();
  const channelsQuery = useGetClientGrowthHubChannelsQuery();
  const actionsQuery = useGetClientGrowthHubActionsQuery();
  const weeklyNotesQuery = useGetClientGrowthHubWeeklyNotesQuery();
  const activityQuery = useGetClientGrowthHubActivityQuery();

  const summary = summaryQuery.data ?? null;
  const config = configQuery.data ?? summary?.config ?? null;
  const channels = channelsQuery.data?.data ?? summary?.channels ?? [];
  const actions = actionsQuery.data?.data ?? summary?.actions ?? [];
  const weeklyNotes = weeklyNotesQuery.data?.data ?? [];
  const latestWeeklyNote = weeklyNotes[0] ?? null;
  const activity = activityQuery.data?.data ?? summary?.activity ?? [];
  const isLoading =
    summaryQuery.isLoading ||
    configQuery.isLoading ||
    channelsQuery.isLoading ||
    actionsQuery.isLoading ||
    weeklyNotesQuery.isLoading ||
    activityQuery.isLoading;
  const isError =
    summaryQuery.isError ||
    configQuery.isError ||
    channelsQuery.isError ||
    actionsQuery.isError ||
    weeklyNotesQuery.isError ||
    activityQuery.isError;

  if (isLoading) {
    return (
      <PageShell>
        <StatePanel
          icon={Clock}
          title="Growth Hub verileri yükleniyor"
          description="KPI, kanal, aksiyon ve aktivite özetleri API üzerinden hazırlanıyor."
        />
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell>
        <StatePanel
          icon={AlertCircle}
          title="Growth Hub verileri alınamadı"
          description="Şu anda Growth Hub API yanıtı okunamıyor. Lütfen kısa süre sonra tekrar deneyin."
          tone="danger"
        />
      </PageShell>
    );
  }

  if (!summary) {
    return (
      <PageShell>
        <StatePanel
          icon={BarChart3}
          title="Growth Hub verisi yok"
          description="Bu müşteri için Growth Hub tarafında henüz gösterilebilir veri yok."
        />
      </PageShell>
    );
  }

  const healthScore = calculateGrowthHealthScore(summary, channels);
  const stats = buildStats(summary, actions, activity);
  const generatedAt =
    summary.meta.lastUpdatedAt ??
    summary.meta.generatedAt ??
    channelsQuery.data?.meta.generatedAt ??
    actionsQuery.data?.meta.generatedAt ??
    activityQuery.data?.meta.generatedAt ??
    null;

  return (
    <PageShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl text-white">Growth & Hub</h1>
          <p className="text-[#A0A0A0]">Büyüme stratejisi, sosyal medya, reklamlar ve raporlama</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-4 py-3 text-sm text-[#A0A0A0]">
          <span className="text-white">{getGrowthHubSummaryStateLabel(summary.state)}</span>
          <span className="mx-2 text-white/30">/</span>
          {formatGrowthHubDateRange(summary.dateRange.since, summary.dateRange.until)}
        </div>
      </div>

      {!summary.service.hasActiveService ? (
        <StatePanel
          icon={AlertCircle}
          title="Aktif Growth Hub hizmeti bulunmuyor"
          description="Bu panel yalnızca aktif Growth Hub satın alınmış hizmeti olan müşterilerde veri gösterir."
          tone="warning"
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <KpiCard key={stat.title} stat={stat} />
        ))}
      </div>

      <section className={cardClass}>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl text-white">Büyüme Sağlığı Genel Bakış</h2>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs ${getGrowthHubStatusTone(summary.state)}`}>
            {getGrowthHubSummaryStateLabel(summary.state)}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <HealthTile icon={Target} label="Growth Sağlığı" value={`${healthScore}%`} tone={summary.state} />
          <HealthTile icon={BarChart3} label="Aktif Kanal" value={formatGrowthHubNumber(summary.metrics.activeChannels)} tone="READY" />
          <HealthTile icon={Clock} label="Bekleyen Onay" value={formatGrowthHubNumber(summary.metrics.pendingApprovals)} tone={summary.metrics.pendingApprovals > 0 ? "RISK" : "READY"} />
          <HealthTile icon={AlertCircle} label="Geciken İş" value={formatGrowthHubNumber(summary.metrics.overdueTasks)} tone={summary.metrics.overdueTasks > 0 ? "RISK" : "READY"} />
          <HealthTile icon={Activity} label="Kaynak Sayısı" value={formatGrowthHubNumber(summary.meta.sources.length)} tone="OPTIMIZE" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklySummary summary={summary} config={config} activity={activity} weeklyNote={latestWeeklyNote} />
        <LeadTrendState summary={summary} />
      </div>

      <ChannelPerformance channels={channels} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AgencyComment summary={summary} config={config} weeklyNote={latestWeeklyNote} generatedAt={generatedAt} />
        <ClientActions actions={actions} />
      </div>

      <RecentActivity activity={activity} />
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6 p-8">{children}</div>;
}

function KpiCard({ stat }: { stat: StatCard }) {
  const colors = statToneMap[stat.tone];
  const Icon = stat.icon;

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="text-sm text-[#A0A0A0]">{stat.title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
      <div className={`mb-1 text-3xl ${colors.text}`}>{stat.value}</div>
      <div className="text-sm text-[#A0A0A0]">{stat.note}</div>
    </div>
  );
}

function StatePanel({
  icon: Icon,
  title,
  description,
  tone = "info",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "info" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-[#ff4444]/20 bg-[#ff4444]/10 text-[#ff4444]"
      : tone === "warning"
        ? "border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]"
        : "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]";

  return (
    <div className={`${cardClass} flex items-start gap-4`}>
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="mb-1 text-xl text-white">{title}</h2>
        <p className="text-sm leading-relaxed text-[#A0A0A0]">{description}</p>
      </div>
    </div>
  );
}

function HealthTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: GrowthHubSummary["state"] | GrowthHubChannelSummary["status"];
}) {
  return (
    <div className={`rounded-xl border p-4 ${getGrowthHubStatusTone(tone)}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{value}</span>
      </div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

function WeeklySummary({
  summary,
  config,
  activity,
  weeklyNote,
}: {
  summary: GrowthHubSummary;
  config: GrowthHubConfig | null;
  activity: GrowthHubActivityItem[];
  weeklyNote: GrowthHubWeeklyNote | null;
}) {
  const focus = weeklyNote?.nextFocus ?? getNextFocus(summary);
  const note = weeklyNote?.summary ?? config?.notes ?? summary.config?.notes ?? null;

  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Haftalık Büyüme Özeti</h2>
      <div className="space-y-3">
        <SummaryLine icon={CheckCircle} text={`${formatGrowthHubNumber(activity.length)} görünür aktivite kaydı güncellendi`} />
        <SummaryLine icon={Target} text={`Ana hedef: ${getGrowthHubGoalLabel(config?.primaryGoal ?? summary.config?.primaryGoal ?? null)}`} />
        <SummaryLine icon={TrendingUp} text={focus} />
        {note ? (
          <div className={innerClass}>
            <p className="mb-2 text-sm text-[#A0A0A0]">
              {weeklyNote ? `${formatGrowthHubDate(weeklyNote.weekStart)} haftası` : "Ajans notu"}
            </p>
            <p className="text-sm leading-relaxed text-white">{note}</p>
            {weeklyNote?.nextFocus ? (
              <p className="mt-3 text-sm leading-relaxed text-[#D8D8D8]">
                Sonraki odak: {weeklyNote.nextFocus}
              </p>
            ) : null}
          </div>
        ) : (
          <EmptyState text="Haftalık ajans notu henüz bağlanmadı." />
        )}
      </div>
    </section>
  );
}

function SummaryLine({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#202020] p-4">
      <Icon className="h-5 w-5 flex-shrink-0 text-[#AAFF01]" />
      <span className="text-white">{text}</span>
    </div>
  );
}

function LeadTrendState({ summary }: { summary: GrowthHubSummary }) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Lead Trendi (Son 7 Gün)</h2>
      <div className="flex min-h-[200px] flex-col justify-between rounded-xl border border-dashed border-white/[0.12] bg-[#202020] p-5">
        <div>
          <p className="mb-2 text-sm text-[#A0A0A0]">Trend verisi henüz bağlanmadı</p>
          <p className="text-sm leading-relaxed text-[#D8D8D8]">
            Günlük trend serisi hazır olduğunda bu alan toplam lead ritmini grafik olarak gösterecek.
          </p>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="text-3xl text-[#AAFF01]">{formatGrowthHubNumber(summary.metrics.totalLeads)}</div>
            <div className="text-xs text-[#A0A0A0]">Toplam lead</div>
          </div>
          <div className="text-right text-xs text-[#A0A0A0]">
            {formatGrowthHubDateRange(summary.dateRange.since, summary.dateRange.until)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChannelPerformance({ channels }: { channels: GrowthHubChannelSummary[] }) {
  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl text-white">Kanal Performansı</h2>
        <span className="text-sm text-[#A0A0A0]">{formatGrowthHubNumber(channels.length)} kanal</span>
      </div>
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => (
            <ChannelCard key={channel.serviceKey} channel={channel} />
          ))}
        </div>
      ) : (
        <EmptyState text="Aktif Growth Hub kanalı bulunmuyor." />
      )}
    </section>
  );
}

function ChannelCard({ channel }: { channel: GrowthHubChannelSummary }) {
  const metricLabel = getPrimaryMetricLabel(channel);
  const metricValue = getPrimaryMetricValue(channel);

  return (
    <div className={innerClass}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-white">{getGrowthHubServiceLabel(channel.serviceKey)}</h3>
          <p className="mt-1 text-xs text-[#A0A0A0]">{getGrowthHubSourceStatusLabel(channel.sourceStatus)}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs ${getGrowthHubStatusTone(channel.status)}`}>
          {getGrowthHubChannelStatusLabel(channel.status)}
        </span>
      </div>
      <div className="space-y-2">
        <MetricRow label="Harcama" value={formatGrowthHubCurrency(channel.metrics.spend)} />
        <MetricRow label={metricLabel} value={metricValue} />
        <MetricRow label="ROAS" value={formatGrowthHubRatio(channel.metrics.roas)} accent />
        <MetricRow label="Açık iş" value={formatGrowthHubNumber(channel.openTasks)} />
        <MetricRow label="Onay" value={formatGrowthHubNumber(channel.pendingApprovals)} />
      </div>
      {channel.metrics.sourceRecords === 0 ? (
        <p className="mt-3 text-xs text-[#A0A0A0]">
          {channel.sourceStatus === "ACTIVE_MODULE" ? "Bu kanal için henüz rapor yok" : getGrowthHubSourceStatusLabel(channel.sourceStatus)}
        </p>
      ) : null}
    </div>
  );
}

function MetricRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-[#A0A0A0]">{label}</span>
      <span className={accent ? "text-[#AAFF01]" : "text-white"}>{value}</span>
    </div>
  );
}

function AgencyComment({
  summary,
  config,
  weeklyNote,
  generatedAt,
}: {
  summary: GrowthHubSummary;
  config: GrowthHubConfig | null;
  weeklyNote: GrowthHubWeeklyNote | null;
  generatedAt: string | null;
}) {
  const activeConfig = config ?? summary.config;
  const comment = weeklyNote?.summary ?? activeConfig?.notes ?? null;

  return (
    <section className="lg:col-span-2 rounded-2xl border border-[#AAFF01]/20 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#AAFF01]/20">
          <TrendingUp className="h-5 w-5 text-[#AAFF01]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-2 text-xl text-white">Ajans Yorumu</h2>
          {comment ? (
            <p className="mb-4 text-sm leading-relaxed text-[#D8D8D8]">{comment}</p>
          ) : (
            <EmptyState text="Ajans yorumu henüz Growth Hub config kaydına eklenmedi." />
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <MetricPill label="Hedef" value={getGrowthHubGoalLabel(activeConfig?.primaryGoal ?? null)} />
            <MetricPill
              label="Target ROAS"
              value={activeConfig?.targetRoas ? formatGrowthHubRatio(activeConfig.targetRoas) : "Tanımsız"}
            />
            <MetricPill label="Güncellendi" value={formatGrowthHubDate(generatedAt)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#131313] p-3">
      <div className="mb-1 text-xs text-[#A0A0A0]">{label}</div>
      <div className="truncate text-sm text-white">{value}</div>
    </div>
  );
}

function ClientActions({ actions }: { actions: GrowthHubActionItem[] }) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Müşteri Aksiyonları</h2>
      {actions.length > 0 ? (
        <div className="space-y-3">
          {actions.map((item) => (
            <div key={`${item.type}-${item.id}`} className={innerClass}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`rounded px-2 py-1 text-xs ${getActionTone(item)}`}>
                  {getGrowthHubActionTypeLabel(item.type)}
                </span>
                <span className="text-xs text-[#A0A0A0]">{formatGrowthHubDate(item.dueAt ?? item.updatedAt)}</span>
              </div>
              <p className="text-sm text-white">{item.title}</p>
              {item.description ? (
                <p className="mt-2 text-xs leading-relaxed text-[#D8D8D8]">{item.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-[#A0A0A0]">
                {item.project?.name ?? getGrowthHubServiceLabel(item.serviceKey)}
                {item.type === "GROWTH_ACTION" ? ` / ${getGrowthHubActionStatusLabel(item.status)}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="Bekleyen müşteri aksiyonu yok." />
      )}
    </section>
  );
}

function RecentActivity({ activity }: { activity: GrowthHubActivityItem[] }) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className={`${cardClass} lg:col-span-2`}>
        <h2 className="mb-4 text-xl text-white">Son Aktiviteler</h2>
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 rounded-xl bg-[#202020] p-4">
                <div className={`mt-2 h-2 w-2 rounded-full ${getActivityDotClass(item.type)}`} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-white">{item.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${getActivityTone(item.type)}`}>
                      {getGrowthHubActivityTypeLabel(item.type)}
                    </span>
                  </div>
                  <span className="text-xs text-[#A0A0A0]">
                    {getGrowthHubServiceLabel(item.serviceKey)} / {formatGrowthHubDate(item.occurredAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Son aktivite kaydı yok." />
        )}
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-xl text-white">Raporlar</h2>
        <EmptyState text="Yayımlanmış Growth Hub raporu henüz yok." />
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.12] bg-[#202020] p-4 text-sm text-[#A0A0A0]">
      {text}
    </div>
  );
}

function buildStats(
  summary: GrowthHubSummary,
  actions: GrowthHubActionItem[],
  activity: GrowthHubActivityItem[],
): StatCard[] {
  return [
    {
      title: "Toplam Lead",
      value: formatGrowthHubCompactNumber(summary.metrics.totalLeads),
      note: formatGrowthHubDateRange(summary.dateRange.since, summary.dateRange.until),
      icon: Users,
      tone: "green",
    },
    {
      title: "Reklam Harcaması",
      value: formatGrowthHubCurrency(summary.metrics.totalSpend),
      note: `${formatGrowthHubNumber(summary.metrics.activeChannels)} aktif kanal`,
      icon: BarChart3,
      tone: "blue",
    },
    {
      title: "Blended ROAS",
      value: formatGrowthHubRatio(summary.metrics.blendedRoas),
      note: summary.config?.targetRoas ? `Hedef ${formatGrowthHubRatio(summary.config.targetRoas)}` : "Hedef tanımlı değil",
      icon: TrendingUp,
      tone: "purple",
    },
    {
      title: "Bekleyen Onay",
      value: formatGrowthHubNumber(summary.metrics.pendingApprovals),
      note: `${formatGrowthHubNumber(actions.length)} aksiyon listede`,
      icon: Clock,
      tone: summary.metrics.pendingApprovals > 0 ? "orange" : "green",
    },
    {
      title: "Açık İş",
      value: formatGrowthHubNumber(summary.metrics.openTasks),
      note: `${formatGrowthHubNumber(activity.length)} son aktivite`,
      icon: FileText,
      tone: summary.metrics.overdueTasks > 0 ? "red" : "green",
    },
  ];
}

function getNextFocus(summary: GrowthHubSummary): string {
  if (summary.state === "WAITING_CONFIG") {
    return "Sonraki odak: Growth hedef ve raporlama config alanlarını tamamlamak.";
  }

  if (summary.metrics.pendingApprovals > 0) {
    return "Sonraki odak: Bekleyen müşteri onaylarını kapatmak.";
  }

  if (summary.metrics.overdueTasks > 0) {
    return "Sonraki odak: Geciken işleri temizlemek.";
  }

  if (summary.state === "SCALE") {
    return "Sonraki odak: Ölçeklenebilir kanalları kontrollü büyütmek.";
  }

  if (summary.state === "OPTIMIZE") {
    return "Sonraki odak: Kanal performansını hedeflere yaklaştırmak.";
  }

  return "Sonraki odak: Aktif kanalların haftalık ritmini korumak.";
}

function getPrimaryMetricLabel(channel: GrowthHubChannelSummary): string {
  if (channel.metrics.orders > 0) return "Sipariş";
  if (channel.metrics.publishedPosts > 0) return "Yayın";
  if (channel.metrics.engagement > 0) return "Etkileşim";
  if (channel.metrics.conversions > 0) return "Dönüşüm";
  return "Lead";
}

function getPrimaryMetricValue(channel: GrowthHubChannelSummary): string {
  if (channel.metrics.orders > 0) return formatGrowthHubNumber(channel.metrics.orders);
  if (channel.metrics.publishedPosts > 0) return formatGrowthHubNumber(channel.metrics.publishedPosts);
  if (channel.metrics.engagement > 0) return formatGrowthHubNumber(channel.metrics.engagement);
  if (channel.metrics.conversions > 0) return formatGrowthHubNumber(channel.metrics.conversions);
  return formatGrowthHubNumber(channel.metrics.leads);
}

function getActionTone(action: GrowthHubActionItem): string {
  if (action.status === "DONE") {
    return "bg-[#AAFF01]/10 text-[#AAFF01]";
  }

  if (action.status === "BLOCKED" || action.status === "CANCELLED") {
    return "bg-[#ff4444]/10 text-[#ff4444]";
  }

  if (action.dueAt && new Date(action.dueAt).getTime() < Date.now()) {
    return "bg-[#ff4444]/10 text-[#ff4444]";
  }

  if (action.type === "REPORT_ACKNOWLEDGEMENT") {
    return "bg-[#00D4FF]/10 text-[#00D4FF]";
  }

  if (action.type === "RELEASE_APPROVAL") {
    return "bg-[#7B61FF]/10 text-[#7B61FF]";
  }

  return "bg-[#FFA726]/10 text-[#FFA726]";
}

function getActivityTone(type: GrowthHubActivityItem["type"]): string {
  if (type === "TASK") return "border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]";
  if (type === "FILE") return "border-[#7B61FF]/20 bg-[#7B61FF]/10 text-[#7B61FF]";
  if (type === "RELEASE") return "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]";
  return "border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]";
}

function getActivityDotClass(type: GrowthHubActivityItem["type"]): string {
  if (type === "TASK") return "bg-[#AAFF01]";
  if (type === "FILE") return "bg-[#7B61FF]";
  if (type === "RELEASE") return "bg-[#00D4FF]";
  return "bg-[#FFA726]";
}
