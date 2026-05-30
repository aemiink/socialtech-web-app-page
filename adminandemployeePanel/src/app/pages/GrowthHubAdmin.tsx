import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useGetAdminAssignmentsQuery } from "../features/adminAssignments/adminAssignmentsApi";
import { hasAdminPermission, selectCurrentUser } from "../features/auth/authSelectors";
import { getBackendRoleLabel } from "../features/auth/roleMapping";
import { useUpdateAdminClientGrowthHubConfigMutation } from "../features/clients/clientsApi";
import type { UpdateAdminClientGrowthHubConfigRequest } from "../features/clients/clientsTypes";
import { extractApiErrorMessage } from "../features/clients/clientsUtils";
import { GrowthHubActionNotePanel } from "../features/growthHub/components/GrowthHubActionNotePanel";
import { GrowthHubConfigDialog } from "../features/growthHub/components/GrowthHubConfigDialog";
import {
  useCreateAdminGrowthHubActionMutation,
  useCreateAdminGrowthHubReportMutation,
  useCreateAdminGrowthHubWeeklyNoteMutation,
  useConvertAdminGrowthHubRecommendationToTaskMutation,
  useDeleteAdminGrowthHubActionMutation,
  useGenerateAdminGrowthHubRecommendationsMutation,
  useGetAdminGrowthHubClientActionsQuery,
  useGetAdminGrowthHubClientRecommendationsQuery,
  useGetAdminGrowthHubClientReportsQuery,
  useGetAdminGrowthHubClientWeeklyNotesQuery,
  useGetAdminGrowthHubClientsQuery,
  usePublishAdminGrowthHubReportMutation,
  useUpdateAdminGrowthHubActionMutation,
  useUpdateAdminGrowthHubRecommendationMutation,
  useUpdateAdminGrowthHubReportMutation,
  useUpdateAdminGrowthHubWeeklyNoteMutation,
} from "../features/growthHub/growthHubApi";
import type { GrowthHubChannelSummary } from "../features/growthHub/growthHubTypes";
import {
  formatGrowthHubCompactNumber,
  formatGrowthHubCurrency,
  formatGrowthHubDateTime,
  formatGrowthHubNumber,
  formatGrowthHubRatio,
  getGrowthHubChannelStatusLabel,
  getGrowthHubGoalLabel,
  getGrowthHubServiceLabel,
  getGrowthHubStatusTone,
  getGrowthHubSummaryStateLabel,
} from "../features/growthHub/growthHubUtils";
import { useAppSelector } from "../store/hooks";

export function GrowthHubAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadOverview = hasAdminPermission(currentUser, [
    "growthHub.summary.read.any",
    "growthHub.config.read.any",
  ]);
  const canManageConfig = hasAdminPermission(currentUser, ["growthHub.config.manage.any"]);
  const canManageActions = hasAdminPermission(currentUser, ["growthHub.actions.manage.any"]);
  const canManageNotes = hasAdminPermission(currentUser, ["growthHub.notes.manage.any"]);
  const canReadReports = hasAdminPermission(currentUser, ["growthHub.reports.read.any"]);
  const canManageReports = hasAdminPermission(currentUser, ["growthHub.reports.manage.any"]);
  const canReadRecommendations = hasAdminPermission(currentUser, [
    "growthHub.recommendations.read.any",
  ]);
  const canManageRecommendations = hasAdminPermission(currentUser, [
    "growthHub.recommendations.manage.any",
  ]);
  const {
    data: response,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminGrowthHubClientsQuery(undefined, {
    skip: !canReadOverview,
  });
  const [updateGrowthHubConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientGrowthHubConfigMutation();
  const [selectedClientId, setSelectedClientId] = useState("");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const listItems = response?.data ?? [];
  const selectedClient = useMemo(
    () => listItems.find((item) => item.client.id === selectedClientId) ?? listItems[0] ?? null,
    [listItems, selectedClientId],
  );
  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
  } = useGetAdminAssignmentsQuery(
    { clientProfileId: selectedClient?.client.id ?? "", isActive: true },
    { skip: !selectedClient },
  );
  const {
    data: actionResponse,
    isLoading: isActionsLoading,
  } = useGetAdminGrowthHubClientActionsQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient,
  });
  const {
    data: weeklyNoteResponse,
    isLoading: isWeeklyNotesLoading,
  } = useGetAdminGrowthHubClientWeeklyNotesQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient,
  });
  const {
    data: reportsResponse,
    isLoading: isReportsLoading,
  } = useGetAdminGrowthHubClientReportsQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient || !canReadReports,
  });
  const {
    data: recommendationsResponse,
    isLoading: isRecommendationsLoading,
  } = useGetAdminGrowthHubClientRecommendationsQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient || !canReadRecommendations,
  });
  const [createAction] = useCreateAdminGrowthHubActionMutation();
  const [updateAction] = useUpdateAdminGrowthHubActionMutation();
  const [deleteAction] = useDeleteAdminGrowthHubActionMutation();
  const [createWeeklyNote] = useCreateAdminGrowthHubWeeklyNoteMutation();
  const [updateWeeklyNote] = useUpdateAdminGrowthHubWeeklyNoteMutation();
  const [createReport] = useCreateAdminGrowthHubReportMutation();
  const [updateReport] = useUpdateAdminGrowthHubReportMutation();
  const [publishReport] = usePublishAdminGrowthHubReportMutation();
  const [generateRecommendations] = useGenerateAdminGrowthHubRecommendationsMutation();
  const [updateRecommendation] = useUpdateAdminGrowthHubRecommendationMutation();
  const [convertRecommendationToTask] = useConvertAdminGrowthHubRecommendationToTaskMutation();
  const selectedActions = actionResponse?.data ?? selectedClient?.actions ?? [];
  const selectedWeeklyNotes = weeklyNoteResponse?.data ?? [];
  const selectedReports = reportsResponse?.data ?? [];
  const selectedRecommendations = recommendationsResponse?.data ?? [];

  useEffect(() => {
    if (listItems.length === 0) {
      if (selectedClientId) {
        setSelectedClientId("");
      }
      return;
    }

    if (!selectedClientId || !listItems.some((item) => item.client.id === selectedClientId)) {
      setSelectedClientId(listItems[0].client.id);
    }
  }, [listItems, selectedClientId]);

  async function handleConfigSubmit(payload: UpdateAdminClientGrowthHubConfigRequest) {
    if (!selectedClient || !canManageConfig) {
      return;
    }

    setConfigError(null);
    setPageMessage(null);

    try {
      await updateGrowthHubConfig({
        clientId: selectedClient.client.id,
        body: payload,
      }).unwrap();
      setConfigDialogOpen(false);
      setPageMessage({ type: "success", text: "Growth Hub config güncellendi." });
    } catch (mutationError) {
      setConfigError(extractApiErrorMessage(mutationError, "Growth Hub config güncellenemedi."));
    }
  }

  if (!canReadOverview) {
    return (
      <div className="p-6">
        <Card className="border-white/[0.08] bg-[#171717] p-6 text-white">
          <h1 className="text-xl font-semibold">Growth Hub Admin</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">Bu ekran için Growth Hub admin yetkisi gerekiyor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-[#AAFF01]">Admin Paneli</p>
          <h1 className="text-3xl font-semibold text-white">Growth Hub Operasyonları</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            Growth Hub hizmeti alan müşterileri, risk seviyelerini ve operasyonel aksiyonları tek ekranda yönetin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={isFetching} onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button type="button" disabled={!selectedClient || !canManageConfig} onClick={() => setConfigDialogOpen(true)}>
            <Edit3 className="h-4 w-4" />
            Config Düzenle
          </Button>
        </div>
      </div>

      {pageMessage ? (
        <Card
          className={`p-4 text-sm ${
            pageMessage.type === "success"
              ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d8ff8f]"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {pageMessage.text}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OverviewMetricCard icon={<Users className="h-5 w-5" />} label="Growth Hub Müşteri" value={response?.meta.total ?? 0} />
        <OverviewMetricCard icon={<TrendingUp className="h-5 w-5" />} label="Hazır" value={response?.meta.ready ?? 0} />
        <OverviewMetricCard icon={<AlertTriangle className="h-5 w-5" />} label="Risk" value={response?.meta.risk ?? 0} />
        <OverviewMetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Scale" value={response?.meta.scale ?? 0} />
        <OverviewMetricCard icon={<Loader2 className="h-5 w-5" />} label="Onay Bekleyen" value={response?.meta.pendingApprovals ?? 0} />
      </div>

      {isLoading ? (
        <StatusPanel
          title="Growth Hub müşterileri yükleniyor"
          description="Global Growth Hub listesi hazırlanıyor."
          tone="neutral"
        />
      ) : null}

      {isError ? (
        <StatusPanel
          title="Growth Hub verisi alınamadı"
          description={extractApiErrorMessage(error, "Growth Hub listesi yüklenemedi.")}
          tone="error"
        />
      ) : null}

      {!isLoading && !isError && listItems.length === 0 ? (
        <StatusPanel
          title="Growth Hub müşterisi bulunamadı"
          description="Aktif GROWTH_HUB purchased service'e sahip müşteri yok."
          tone="neutral"
        />
      ) : null}

      {!isLoading && !isError && listItems.length > 0 && selectedClient ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="border-white/[0.08] bg-[#171717] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Growth Hub Müşterileri</h2>
                <p className="text-sm text-[#A0A0A0]">Risk, kanal ve aksiyon görünürlüğü</p>
              </div>
              <Badge variant="outline">{listItems.length} kayıt</Badge>
            </div>

            <div className="space-y-3">
              {listItems.map((item) => (
                <button
                  key={item.client.id}
                  type="button"
                  onClick={() => setSelectedClientId(item.client.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    item.client.id === selectedClient.client.id
                      ? "border-[#AAFF01]/40 bg-[#AAFF01]/10"
                      : "border-white/[0.08] bg-black/20 hover:border-white/[0.16]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{item.client.name}</p>
                        <Badge className={getGrowthHubStatusTone(item.state)}>
                          {getGrowthHubSummaryStateLabel(item.state)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#A0A0A0]">{item.client.slug}</p>
                    </div>
                    <div className="text-right text-sm text-[#D6D6D6]">
                      <p>{item.metrics.activeChannels} aktif kanal</p>
                      <p>{item.metrics.pendingApprovals} onay bekliyor</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#CFCFCF] md:grid-cols-3">
                    <span>Açık görev: {formatGrowthHubNumber(item.metrics.openTasks)}</span>
                    <span>Lead: {formatGrowthHubCompactNumber(item.metrics.totalLeads)}</span>
                    <span>ROAS: {formatGrowthHubRatio(item.metrics.blendedRoas)}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/[0.08] bg-[#171717] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#AAFF01]">Seçili müşteri</p>
                  <h2 className="text-2xl font-semibold text-white">{selectedClient.client.name}</h2>
                  <p className="mt-1 text-sm text-[#A0A0A0]">
                    Son güncelleme: {formatGrowthHubDateTime(selectedClient.meta.lastUpdatedAt)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/musteriler/${selectedClient.client.id}`}>Client Detail</Link>
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Config</p>
                  <p className="mt-2 text-sm text-white">
                    Goal: {getGrowthHubGoalLabel(selectedClient.config?.primaryGoal ?? null)}
                  </p>
                  <p className="mt-1 text-sm text-[#D6D6D6]">
                    Reporting day: {selectedClient.config?.reportingDay ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-[#D6D6D6]">
                    Revenue hedefi: {typeof selectedClient.config?.targetRevenue === "number"
                      ? formatGrowthHubCurrency(selectedClient.config.targetRevenue)
                      : "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Operasyon</p>
                  <p className="mt-2 text-sm text-white">
                    Açık görev: {formatGrowthHubNumber(selectedClient.metrics.openTasks)}
                  </p>
                  <p className="mt-1 text-sm text-[#D6D6D6]">
                    Overdue: {formatGrowthHubNumber(selectedClient.metrics.overdueTasks)}
                  </p>
                  <p className="mt-1 text-sm text-[#D6D6D6]">
                    Pending approvals: {formatGrowthHubNumber(selectedClient.metrics.pendingApprovals)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" disabled={!canManageNotes}>
                  Weekly Note
                </Button>
                <Button type="button" variant="outline" disabled={!canManageActions}>
                  Approval Request
                </Button>
                <Button type="button" variant="outline" disabled>
                  Report Publish
                </Button>
              </div>
              <p className="mt-2 text-xs text-[#7A7A7A]">
                Approval create ve report publish akışları Faz 7 ile tamamlanacak.
              </p>
            </Card>

            <Card className="border-white/[0.08] bg-[#171717] p-5">
              <h3 className="text-lg font-semibold text-white">Kanal Özeti</h3>
              <div className="mt-4 space-y-3">
                {selectedClient.channels.length > 0 ? (
                  selectedClient.channels.map((channel) => (
                    <div key={channel.serviceKey} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{getGrowthHubServiceLabel(channel.serviceKey)}</p>
                          <p className="text-xs text-[#A0A0A0]">
                            Skor {channel.healthScore}% • {channel.pendingApprovals} onay • {channel.openTasks} açık görev
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getGrowthHubStatusTone(channel.status)}>
                            {getGrowthHubChannelStatusLabel(channel.status)}
                          </Badge>
                          <Badge className={getChannelRiskTone(channel.riskLevel)}>
                            {getChannelRiskLabel(channel.riskLevel)} risk
                          </Badge>
                          <Button asChild size="sm" variant="outline">
                            <Link to={getAdminChannelDetailPath(channel, selectedClient.client.id)}>
                              Detay
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#A0A0A0]">Henüz kanal özeti bulunmuyor.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/[0.08] bg-[#171717] p-5">
              <h3 className="text-lg font-semibold text-white">Atanan Ekip ve Aksiyonlar</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Aktif atamalar</p>
                  {isAssignmentsLoading ? (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Atamalar yükleniyor...</p>
                  ) : assignments.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                          <p className="text-sm text-white">
                            {assignment.employee.displayName ?? assignment.employee.email}
                          </p>
                          <p className="text-xs text-[#A0A0A0]">
                            {getBackendRoleLabel(assignment.employee.role)} • {assignment.scope}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Aktif assignment bulunmuyor.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Öncelikli aksiyonlar</p>
                  {selectedActions.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedActions.slice(0, 4).map((action) => (
                        <div key={action.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                          <p className="text-sm text-white">{action.title}</p>
                          <p className="text-xs text-[#A0A0A0]">
                            {getGrowthHubServiceLabel(action.serviceKey)} • {formatGrowthHubDateTime(action.dueAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Bekleyen Growth Hub aksiyonu bulunmuyor.</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-white/[0.08] bg-[#171717] p-5">
              <h3 className="text-lg font-semibold text-white">Growth Actions ve Weekly Notes</h3>
              <div className="mt-4">
                <GrowthHubActionNotePanel
                  actions={selectedActions}
                  weeklyNotes={selectedWeeklyNotes}
                  reports={selectedReports}
                  recommendations={selectedRecommendations}
                  canManageActions={canManageActions}
                  canManageNotes={canManageNotes}
                  canManageReports={canManageReports}
                  canManageRecommendations={canManageRecommendations}
                  isActionsLoading={isActionsLoading}
                  isNotesLoading={isWeeklyNotesLoading}
                  isReportsLoading={isReportsLoading}
                  isRecommendationsLoading={isRecommendationsLoading}
                  onCreateAction={(body) =>
                    createAction({ clientId: selectedClient.client.id, body }).unwrap().then(() => undefined)
                  }
                  onUpdateAction={(actionId, body) =>
                    updateAction({ actionId, clientId: selectedClient.client.id, body }).unwrap().then(() => undefined)
                  }
                  onDeleteAction={(actionId) =>
                    deleteAction({ actionId, clientId: selectedClient.client.id }).unwrap().then(() => undefined)
                  }
                  onCreateWeeklyNote={(body) =>
                    createWeeklyNote({ clientId: selectedClient.client.id, body }).unwrap().then(() => undefined)
                  }
                  onUpdateWeeklyNote={(noteId, body) =>
                    updateWeeklyNote({ noteId, clientId: selectedClient.client.id, body }).unwrap().then(() => undefined)
                  }
                  onCreateReport={(body) =>
                    createReport({ clientId: selectedClient.client.id, body }).unwrap().then(() => undefined)
                  }
                  onUpdateReport={(reportId, body) =>
                    updateReport({ reportId, clientId: selectedClient.client.id, body }).unwrap().then(() => undefined)
                  }
                  onPublishReport={(reportId, requestAcknowledgement) =>
                    publishReport({ reportId, clientId: selectedClient.client.id, requestAcknowledgement })
                      .unwrap()
                      .then(() => undefined)
                  }
                  onGenerateRecommendations={() =>
                    generateRecommendations({ clientId: selectedClient.client.id })
                      .unwrap()
                      .then(() => undefined)
                  }
                  onUpdateRecommendation={(recommendationId, body) =>
                    updateRecommendation({
                      recommendationId,
                      clientId: selectedClient.client.id,
                      body,
                    })
                      .unwrap()
                      .then(() => undefined)
                  }
                  onConvertRecommendationToTask={(recommendationId) =>
                    convertRecommendationToTask({
                      recommendationId,
                      clientId: selectedClient.client.id,
                    })
                      .unwrap()
                      .then(() => undefined)
                  }
                />
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <GrowthHubConfigDialog
        open={configDialogOpen}
        title="Growth Hub Config Düzenle"
        description="Primary goal, hedefler ve operasyon notlarını güncelleyin."
        config={selectedClient?.config ?? null}
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
    </div>
  );
}

function getAdminChannelDetailPath(channel: GrowthHubChannelSummary, clientId: string): string {
  switch (channel.serviceKey) {
    case "META_ADS":
      return "/meta-ads";
    case "TIKTOK_ADS":
      return "/tiktok-ads";
    case "AMAZON_ADS":
      return "/amazon-ads";
    case "SOCIAL_MEDIA":
      return "/social-media";
    default:
      return `/musteriler/${clientId}`;
  }
}

function getChannelRiskTone(riskLevel: GrowthHubChannelSummary["riskLevel"]): string {
  if (riskLevel === "HIGH") return "border-red-500/30 bg-red-500/10 text-red-200";
  if (riskLevel === "MEDIUM") return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
}

function getChannelRiskLabel(riskLevel: GrowthHubChannelSummary["riskLevel"]): string {
  if (riskLevel === "HIGH") return "Yüksek";
  if (riskLevel === "MEDIUM") return "Orta";
  return "Düşük";
}

type OverviewMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function OverviewMetricCard({ icon, label, value }: OverviewMetricCardProps) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#A0A0A0]">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{formatGrowthHubNumber(value)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-[#AAFF01]">
          {icon}
        </div>
      </div>
    </Card>
  );
}

type StatusPanelProps = {
  title: string;
  description: string;
  tone: "neutral" | "error";
};

function StatusPanel({ title, description, tone }: StatusPanelProps) {
  return (
    <Card
      className={`p-6 ${
        tone === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-white/[0.08] bg-[#171717] text-white"
      }`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className={`mt-2 text-sm ${tone === "error" ? "text-red-200" : "text-[#A0A0A0]"}`}>{description}</p>
    </Card>
  );
}
