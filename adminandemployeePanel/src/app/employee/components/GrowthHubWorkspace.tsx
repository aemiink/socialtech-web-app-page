import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  hasUserPermission,
  selectCurrentEmployeeRole,
  selectCurrentUser,
} from "../../features/auth/authSelectors";
import {
  useCreateAssignedGrowthHubActionMutation,
  useCreateAssignedGrowthHubWeeklyNoteMutation,
  useDeleteAssignedGrowthHubActionMutation,
  useGetAssignedGrowthHubClientActivityQuery,
  useGetAssignedGrowthHubClientActionsQuery,
  useGetAssignedGrowthHubClientSummaryQuery,
  useGetAssignedGrowthHubClientWeeklyNotesQuery,
  useGetAssignedGrowthHubClientsQuery,
  useUpdateAssignedGrowthHubActionMutation,
  useUpdateAssignedGrowthHubWeeklyNoteMutation,
} from "../../features/growthHub/growthHubApi";
import { GrowthHubActionNotePanel } from "../../features/growthHub/components/GrowthHubActionNotePanel";
import {
  formatGrowthHubCompactNumber,
  formatGrowthHubCurrency,
  formatGrowthHubDateTime,
  formatGrowthHubNumber,
  formatGrowthHubRatio,
  getGrowthHubActionTypeLabel,
  getGrowthHubActivityTypeLabel,
  getGrowthHubChannelStatusLabel,
  getGrowthHubServiceLabel,
  getGrowthHubStatusTone,
  getGrowthHubSummaryStateLabel,
} from "../../features/growthHub/growthHubUtils";
import { useAppSelector } from "../../store/hooks";
import { extractApiErrorMessage } from "../../features/clients/clientsUtils";

export function GrowthHubWorkspace() {
  const currentUser = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectCurrentEmployeeRole);
  const canReadWorkspace = hasUserPermission(currentUser, ["growthHub.summary.read.assigned"]);
  const canReadActions = hasUserPermission(currentUser, ["growthHub.actions.read.assigned"]);
  const canManageActions = hasUserPermission(currentUser, ["growthHub.actions.manage.assigned"]);
  const canManageNotes = hasUserPermission(currentUser, ["growthHub.notes.manage.assigned"]);
  const canCreateApprovals = hasUserPermission(currentUser, ["growthHub.approvals.create.assigned"]);
  const canManageReports = hasUserPermission(currentUser, ["growthHub.reports.manage.assigned"]);
  const {
    data: response,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAssignedGrowthHubClientsQuery(undefined, {
    skip: !canReadWorkspace,
  });
  const [selectedClientId, setSelectedClientId] = useState("");

  const listItems = response?.data ?? [];
  const selectedClient = useMemo(
    () => listItems.find((item) => item.client.id === selectedClientId) ?? listItems[0] ?? null,
    [listItems, selectedClientId],
  );
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetAssignedGrowthHubClientSummaryQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient || !canReadWorkspace,
  });
  const {
    data: activity,
    error: activityError,
    isLoading: isActivityLoading,
    refetch: refetchActivity,
  } = useGetAssignedGrowthHubClientActivityQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient || !canReadWorkspace,
  });
  const {
    data: actionsResponse,
    isLoading: isActionsLoading,
  } = useGetAssignedGrowthHubClientActionsQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient || !canReadActions,
  });
  const {
    data: weeklyNoteResponse,
    isLoading: isWeeklyNotesLoading,
  } = useGetAssignedGrowthHubClientWeeklyNotesQuery(selectedClient?.client.id ?? "", {
    skip: !selectedClient || !canManageNotes,
  });
  const [createAction] = useCreateAssignedGrowthHubActionMutation();
  const [updateAction] = useUpdateAssignedGrowthHubActionMutation();
  const [deleteAction] = useDeleteAssignedGrowthHubActionMutation();
  const [createWeeklyNote] = useCreateAssignedGrowthHubWeeklyNoteMutation();
  const [updateWeeklyNote] = useUpdateAssignedGrowthHubWeeklyNoteMutation();

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

  const selectedSummary = summary ?? null;
  const actionItems = actionsResponse?.data ?? selectedSummary?.actions ?? [];
  const approvalActions = actionItems.filter((item) => item.type !== "REPORT_ACKNOWLEDGEMENT");
  const reportActions = actionItems.filter((item) => item.type === "REPORT_ACKNOWLEDGEMENT");
  const weeklyNotes = weeklyNoteResponse?.data ?? [];
  const messages = activity?.data.filter((item) => item.type === "MESSAGE") ?? [];
  const recentActivity = activity?.data.filter((item) => item.type !== "MESSAGE") ?? [];

  if (!canReadWorkspace) {
    return (
      <div className="p-6">
        <Card className="border-white/[0.08] bg-[#171717] p-6 text-white">
          <h1 className="text-xl font-semibold">Growth Hub Workspace</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">Bu ekran için assigned Growth Hub summary yetkisi gerekiyor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-[#AAFF01]">Employee Workspace</p>
          <h1 className="text-3xl font-semibold text-white">Growth Hub Çalışma Alanı</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            {role === "project-manager"
              ? "Assigned Growth Hub müşterileriniz için kanal, aksiyon, mesaj ve risk görünürlüğü."
              : "Assigned Growth Hub görünürlüğü permission bazlı olarak sunulur."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isFetching}
            onClick={() => {
              void Promise.all([refetch(), refetchSummary(), refetchActivity()]);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button type="button" disabled={!canManageNotes}>
            Weekly Note
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <WorkspaceMetricCard icon={<Users className="h-5 w-5" />} label="Assigned Müşteri" value={response?.meta.total ?? 0} />
        <WorkspaceMetricCard icon={<TrendingUp className="h-5 w-5" />} label="Ready" value={response?.meta.ready ?? 0} />
        <WorkspaceMetricCard icon={<AlertTriangle className="h-5 w-5" />} label="Risk" value={response?.meta.risk ?? 0} />
        <WorkspaceMetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Pending Approval" value={response?.meta.pendingApprovals ?? 0} />
        <WorkspaceMetricCard icon={<MessageSquare className="h-5 w-5" />} label="Mesaj" value={messages.length} />
      </div>

      {isLoading ? (
        <WorkspaceSection title="Growth Hub müşterileri yükleniyor">
          <p className="text-sm text-[#A0A0A0]">Assigned Growth Hub listesi hazırlanıyor.</p>
        </WorkspaceSection>
      ) : null}

      {isError ? (
        <WorkspaceSection title="Growth Hub verisi alınamadı">
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(error, "Growth Hub workspace yüklenemedi.")}
          </p>
        </WorkspaceSection>
      ) : null}

      {!isLoading && !isError && listItems.length === 0 ? (
        <WorkspaceSection title="Assigned Growth Hub müşterisi bulunamadı">
          <p className="text-sm text-[#A0A0A0]">
            Aktif GROWTH_HUB service'i olan ve size atanmış müşteri bulunmuyor.
          </p>
        </WorkspaceSection>
      ) : null}

      {!isLoading && !isError && selectedClient ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <WorkspaceSection title="Assigned Müşteriler">
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{item.client.name}</p>
                      <p className="text-xs text-[#A0A0A0]">{item.client.slug}</p>
                    </div>
                    <Badge className={getGrowthHubStatusTone(item.state)}>
                      {getGrowthHubSummaryStateLabel(item.state)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#D6D6D6] md:grid-cols-3">
                    <span>Kanal: {formatGrowthHubNumber(item.metrics.activeChannels)}</span>
                    <span>Görev: {formatGrowthHubNumber(item.metrics.openTasks)}</span>
                    <span>Lead: {formatGrowthHubCompactNumber(item.metrics.totalLeads)}</span>
                  </div>
                </button>
              ))}
            </div>
          </WorkspaceSection>

          <div className="space-y-6">
            <WorkspaceSection title={selectedClient.client.name}>
              <div className="flex flex-wrap gap-2">
                <Badge className={getGrowthHubStatusTone(selectedClient.state)}>
                  {getGrowthHubSummaryStateLabel(selectedClient.state)}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/employee/project-manager/clients/${selectedClient.client.id}`}>
                    Müşteri Operasyonu
                  </Link>
                </Button>
              </div>

              {isSummaryLoading ? (
                <p className="mt-4 text-sm text-[#A0A0A0]">Detay özeti yükleniyor...</p>
              ) : selectedSummary ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Summary</p>
                    <p className="mt-2 text-sm text-white">
                      Revenue: {formatGrowthHubCurrency(selectedSummary.metrics.totalRevenue)}
                    </p>
                    <p className="mt-1 text-sm text-[#D6D6D6]">
                      ROAS: {formatGrowthHubRatio(selectedSummary.metrics.blendedRoas)}
                    </p>
                    <p className="mt-1 text-sm text-[#D6D6D6]">
                      CPA: {selectedSummary.metrics.blendedCpa > 0 ? formatGrowthHubCurrency(selectedSummary.metrics.blendedCpa) : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Kanallar</p>
                    <div className="mt-2 space-y-2">
                      {selectedSummary.channels.map((channel) => (
                        <div key={channel.serviceKey} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-white">{getGrowthHubServiceLabel(channel.serviceKey)}</span>
                          <Badge className={getGrowthHubStatusTone(channel.status)}>
                            {getGrowthHubChannelStatusLabel(channel.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </WorkspaceSection>

            <WorkspaceSection title="Weekly Actions ve Onaylar">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Weekly Actions</p>
                  {canReadActions && actionItems.length ? (
                    <div className="mt-2 space-y-2">
                      {actionItems.slice(0, 4).map((action) => (
                        <div key={action.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                          <p className="text-sm text-white">{action.title}</p>
                          <p className="text-xs text-[#A0A0A0]">
                            {getGrowthHubActionTypeLabel(action.type)} • {formatGrowthHubDateTime(action.dueAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Weekly action verisi bulunmuyor.</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Onaylar</p>
                  {approvalActions.length ? (
                    <div className="mt-2 space-y-2">
                      {approvalActions.map((action) => (
                        <div key={action.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                          <p className="text-sm text-white">{action.title}</p>
                          <p className="text-xs text-[#A0A0A0]">
                            {getGrowthHubServiceLabel(action.serviceKey)} • {formatGrowthHubDateTime(action.updatedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Onay bekleyen Growth Hub aksiyonu yok.</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" disabled={!canCreateApprovals}>
                      Approval Request
                    </Button>
                    <Button type="button" size="sm" variant="outline" disabled>
                      Task Oluştur
                    </Button>
                  </div>
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Raporlar, Mesajlar ve Aktivite">
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Raporlar</p>
                  {reportActions.length ? (
                    <div className="mt-2 space-y-2">
                      {reportActions.map((action) => (
                        <div key={action.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                          <p className="text-sm text-white">{action.title}</p>
                          <p className="text-xs text-[#A0A0A0]">{formatGrowthHubDateTime(action.updatedAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Client teyidi bekleyen rapor yok.</p>
                  )}
                  <Button type="button" size="sm" className="mt-3" disabled={!canManageReports}>
                    Report Publish
                  </Button>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Mesajlar</p>
                  {messages.length ? (
                    <div className="mt-2 space-y-2">
                      {messages.map((message) => (
                        <div key={message.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                          <p className="text-sm text-white">{message.title}</p>
                          <p className="text-xs text-[#A0A0A0]">{formatGrowthHubDateTime(message.occurredAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Yeni client mesajı bulunmuyor.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Recent Activity</p>
                  {activityError ? (
                    <p className="mt-2 text-sm text-red-300">
                      {extractApiErrorMessage(activityError, "Aktivite alınamadı.")}
                    </p>
                  ) : isActivityLoading ? (
                    <p className="mt-2 text-sm text-[#A0A0A0]">Aktivite yükleniyor...</p>
                  ) : recentActivity.length ? (
                    <div className="mt-2 space-y-2">
                      {recentActivity.slice(0, 4).map((item) => (
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

              <p className="mt-4 text-xs text-[#7A7A7A]">
                Approval create ve report publish mutasyonları Growth Hub Faz 7 ile tamamlanacak.
              </p>
            </WorkspaceSection>

            <WorkspaceSection title="Growth Actions ve Weekly Notes">
              <GrowthHubActionNotePanel
                actions={actionItems}
                weeklyNotes={weeklyNotes}
                canManageActions={canManageActions}
                canManageNotes={canManageNotes}
                isActionsLoading={isActionsLoading}
                isNotesLoading={isWeeklyNotesLoading}
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
              />
            </WorkspaceSection>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type WorkspaceMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function WorkspaceMetricCard({ icon, label, value }: WorkspaceMetricCardProps) {
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

function WorkspaceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
