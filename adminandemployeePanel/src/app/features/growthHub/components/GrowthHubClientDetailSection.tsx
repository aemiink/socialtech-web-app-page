import { type ReactNode, useState } from "react";
import { Edit3, RefreshCw } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { useGetAdminAssignmentsQuery } from "../../adminAssignments/adminAssignmentsApi";
import { hasAdminPermission, selectCurrentUser } from "../../auth/authSelectors";
import { getBackendRoleLabel } from "../../auth/roleMapping";
import { useUpdateAdminClientGrowthHubConfigMutation } from "../../clients/clientsApi";
import type { UpdateAdminClientGrowthHubConfigRequest } from "../../clients/clientsTypes";
import { extractApiErrorMessage } from "../../clients/clientsUtils";
import {
  useGetAdminGrowthHubClientActivityQuery,
  useGetAdminGrowthHubClientConfigQuery,
  useGetAdminGrowthHubClientSummaryQuery,
} from "../growthHubApi";
import { GrowthHubConfigDialog } from "./GrowthHubConfigDialog";
import {
  formatGrowthHubCurrency,
  formatGrowthHubDateTime,
  formatGrowthHubNumber,
  formatGrowthHubRatio,
  getGrowthHubActionTypeLabel,
  getGrowthHubActivityTypeLabel,
  getGrowthHubChannelStatusLabel,
  getGrowthHubGoalLabel,
  getGrowthHubServiceLabel,
  getGrowthHubStatusTone,
  getGrowthHubSummaryStateLabel,
} from "../growthHubUtils";
import { useAppSelector } from "../../../store/hooks";

type GrowthHubClientDetailSectionProps = {
  clientProfileId: string;
};

export function GrowthHubClientDetailSection({
  clientProfileId,
}: GrowthHubClientDetailSectionProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadConfig = hasAdminPermission(currentUser, ["growthHub.config.read.any"]);
  const canReadSummary = hasAdminPermission(currentUser, ["growthHub.summary.read.any"]);
  const canManageConfig = hasAdminPermission(currentUser, ["growthHub.config.manage.any"]);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [updateGrowthHubConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientGrowthHubConfigMutation();
  const {
    data: config,
    error: configErrorState,
    isFetching: isConfigFetching,
    isLoading: isConfigLoading,
    refetch: refetchConfig,
  } = useGetAdminGrowthHubClientConfigQuery(clientProfileId, {
    skip: !canReadConfig,
  });
  const shouldLoadSummary = canReadSummary && (config?.hasActiveService ?? true);
  const {
    data: summary,
    error: summaryErrorState,
    isFetching: isSummaryFetching,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetAdminGrowthHubClientSummaryQuery(clientProfileId, {
    skip: !shouldLoadSummary,
  });
  const {
    data: activity,
    error: activityErrorState,
    isLoading: isActivityLoading,
    refetch: refetchActivity,
  } = useGetAdminGrowthHubClientActivityQuery(clientProfileId, {
    skip: !shouldLoadSummary,
  });
  const { data: assignments = [] } = useGetAdminAssignmentsQuery(
    { clientProfileId, isActive: true },
    { skip: !config?.hasActiveService },
  );

  async function handleConfigSubmit(payload: UpdateAdminClientGrowthHubConfigRequest) {
    setConfigError(null);

    try {
      await updateGrowthHubConfig({
        clientId: clientProfileId,
        body: payload,
      }).unwrap();
      setConfigDialogOpen(false);
    } catch (mutationError) {
      setConfigError(extractApiErrorMessage(mutationError, "Growth Hub config güncellenemedi."));
    }
  }

  if (!canReadConfig && !canReadSummary) {
    return null;
  }

  if (isConfigLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#171717] p-6 text-sm text-[#A0A0A0]">
        Growth Hub bölümü yükleniyor...
      </Card>
    );
  }

  if (config && !config.hasActiveService) {
    return null;
  }

  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Growth Hub Özeti</h2>
          <p className="mt-1 text-sm text-[#A0A0A0]">Growth Hub config, kanal sağlığı ve görünür operasyon durumu</p>
        </div>
        <div className="flex items-center gap-2">
          {(isConfigFetching || isSummaryFetching) ? (
            <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              void Promise.all([refetchConfig(), refetchSummary(), refetchActivity()]);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={!canManageConfig}
            onClick={() => setConfigDialogOpen(true)}
          >
            <Edit3 className="h-4 w-4" />
            Config Düzenle
          </Button>
        </div>
      </div>

      {configErrorState ? (
        <p className="mb-4 text-sm text-red-300">
          {extractApiErrorMessage(configErrorState, "Growth Hub config alınamadı.")}
        </p>
      ) : null}
      {summaryErrorState ? (
        <p className="mb-4 text-sm text-red-300">
          {extractApiErrorMessage(summaryErrorState, "Growth Hub özeti alınamadı.")}
        </p>
      ) : null}
      {activityErrorState ? (
        <p className="mb-4 text-sm text-red-300">
          {extractApiErrorMessage(activityErrorState, "Growth Hub aktivitesi alınamadı.")}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Config ve KPI"
          content={
            <div className="grid gap-3 md:grid-cols-2">
              <MetricCell label="Goal" value={getGrowthHubGoalLabel(config?.primaryGoal ?? summary?.config?.primaryGoal ?? null)} />
              <MetricCell label="State" value={summary ? getGrowthHubSummaryStateLabel(summary.state) : "—"} badgeClass={summary ? getGrowthHubStatusTone(summary.state) : undefined} />
              <MetricCell label="Target Revenue" value={formatGrowthHubCurrency(config?.targetRevenue ?? 0)} />
              <MetricCell label="Target ROAS" value={typeof config?.targetRoas === "number" ? formatGrowthHubRatio(config.targetRoas) : "—"} />
              <MetricCell label="Target Leads" value={typeof config?.targetLeads === "number" ? formatGrowthHubNumber(config.targetLeads) : "—"} />
              <MetricCell label="Reporting Day" value={config?.reportingDay ?? "—"} />
            </div>
          }
        />

        <SectionCard
          title="Operasyon Özeti"
          content={
            summary ? (
              <div className="grid gap-3 md:grid-cols-2">
                <MetricCell label="Aktif Kanal" value={formatGrowthHubNumber(summary.metrics.activeChannels)} />
                <MetricCell label="Açık Görev" value={formatGrowthHubNumber(summary.metrics.openTasks)} />
                <MetricCell label="Pending Approval" value={formatGrowthHubNumber(summary.metrics.pendingApprovals)} />
                <MetricCell label="Toplam Lead" value={formatGrowthHubNumber(summary.metrics.totalLeads)} />
                <MetricCell label="Blended ROAS" value={formatGrowthHubRatio(summary.metrics.blendedRoas)} />
                <MetricCell label="Toplam Revenue" value={formatGrowthHubCurrency(summary.metrics.totalRevenue)} />
              </div>
            ) : (
              <p className="text-sm text-[#A0A0A0]">Growth Hub özeti hazır değil.</p>
            )
          }
        />

        <SectionCard
          title="Kanal Özeti"
          content={
            summary?.channels.length ? (
              <div className="space-y-3">
                {summary.channels.map((channel) => (
                  <div key={channel.serviceKey} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{getGrowthHubServiceLabel(channel.serviceKey)}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {channel.pendingApprovals} onay • {channel.openTasks} açık görev • {channel.overdueTasks} overdue
                        </p>
                      </div>
                      <Badge className={getGrowthHubStatusTone(channel.status)}>
                        {getGrowthHubChannelStatusLabel(channel.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#A0A0A0]">Henüz kanal özeti bulunmuyor.</p>
            )
          }
        />

        <SectionCard
          title="Aksiyonlar ve Aktivite"
          content={
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Aksiyonlar</p>
                {summary?.actions.length ? (
                  <div className="mt-2 space-y-2">
                    {summary.actions.slice(0, 4).map((action) => (
                      <div key={action.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                        <p className="text-sm text-white">{action.title}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {getGrowthHubActionTypeLabel(action.type)} • {getGrowthHubServiceLabel(action.serviceKey)} • {formatGrowthHubDateTime(action.dueAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#A0A0A0]">Bekleyen aksiyon bulunmuyor.</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Recent Activity</p>
                {isActivityLoading ? (
                  <p className="mt-2 text-sm text-[#A0A0A0]">Aktivite yükleniyor...</p>
                ) : activity?.data.length ? (
                  <div className="mt-2 space-y-2">
                    {activity.data.slice(0, 4).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {getGrowthHubActivityTypeLabel(item.type)} • {formatGrowthHubDateTime(item.occurredAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#A0A0A0]">Aktivite kaydı bulunmuyor.</p>
                )}
              </div>
            </div>
          }
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
        <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Atanan ekip ve follow-up</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            {assignments.length ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-white/[0.08] bg-[#131313] p-3">
                  <p className="text-sm text-white">{assignment.employee.displayName ?? assignment.employee.email}</p>
                  <p className="text-xs text-[#A0A0A0]">
                    {getBackendRoleLabel(assignment.employee.role)} • {assignment.scope}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A0A0A0]">Aktif assignment bulunmuyor.</p>
            )}
          </div>
          <div className="space-y-2">
            <Button type="button" disabled>
              Weekly Note Ekle
            </Button>
            <Button type="button" variant="outline" disabled>
              Approval Request Oluştur
            </Button>
            <Button type="button" variant="outline" disabled>
              Report Publish
            </Button>
            <p className="text-xs text-[#7A7A7A]">
              Weekly notes Faz 5, report publish ve approval create akışları Faz 7 follow-up kapsamında tamamlanacak.
            </p>
          </div>
        </div>
      </div>

      <GrowthHubConfigDialog
        open={configDialogOpen}
        title="Growth Hub Config Düzenle"
        description="ClientDetail içinden Growth Hub hedeflerini güncelleyin."
        config={config ?? summary?.config ?? null}
        isSaving={isUpdatingConfig}
        errorMessage={configError}
        onOpenChange={(open) => {
          if (!isUpdatingConfig) {
            setConfigError(null);
            setConfigDialogOpen(open);
          }
        }}
        onSubmit={handleConfigSubmit}
      />
    </Card>
  );
}

function SectionCard({ title, content }: { title: string; content: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{content}</div>
    </div>
  );
}

type MetricCellProps = {
  label: string;
  value: string;
  badgeClass?: string;
};

function MetricCell({ label, value, badgeClass }: MetricCellProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#131313] p-3">
      <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">{label}</p>
      {badgeClass ? (
        <Badge className={`mt-2 ${badgeClass}`}>{value}</Badge>
      ) : (
        <p className="mt-2 text-sm text-white">{value}</p>
      )}
    </div>
  );
}
