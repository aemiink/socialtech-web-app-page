import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clapperboard,
  MessageSquare,
  RefreshCw,
  Upload,
  Video,
  Zap,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { hasUserPermission, selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import type { ClientProfile, ClientsListQuery } from "../../features/clients/clientsTypes";
import { extractApiErrorMessage, formatClientDateTime } from "../../features/clients/clientsUtils";
import { useCreateProjectWorkspaceMessageMutation, useGetProjectsQuery, useGetProjectWorkspaceMessagesQuery } from "../../features/projects/projectsApi";
import {
  useGetAssignedClientTikTokAdsCampaignsQuery,
  useGetAssignedClientTikTokAdsConfigQuery,
  useGetAssignedClientTikTokAdsInsightsQuery,
  useGetAssignedClientTikTokAdsSummaryQuery,
  useSyncAssignedClientTikTokAdsMutation,
} from "../../features/tiktokAds/tiktokAdsApi";
import type {
  TikTokAdsCampaign,
  TikTokAdsConfig,
  TikTokAdsInsightItem,
} from "../../features/tiktokAds/tiktokAdsTypes";
import { useCreateTaskMutation, useGetTasksQuery, useToggleTaskTodoMutation, useUpdateTaskMutation } from "../../features/tasks/tasksApi";
import type { CreateTaskRequest, Task, TaskTodo } from "../../features/tasks/tasksTypes";
import { useAppSelector } from "../../store/hooks";

type WorkspaceMode = "social" | "performance" | "designer";

export type TikTokAdsWorkspaceView =
  | "overview"
  | "campaigns"
  | "performance"
  | "video-creatives"
  | "reports"
  | "approvals"
  | "pixel";

type TikTokAdsWorkspaceProps = {
  initialView?: TikTokAdsWorkspaceView;
};

const ASSIGNED_CLIENTS_QUERY: ClientsListQuery = {
  status: "ACTIVE",
  limit: 100,
  sortBy: "name",
  sortOrder: "asc",
};

const VIEW_LABELS: Record<TikTokAdsWorkspaceView, string> = {
  overview: "Özet",
  campaigns: "Kampanyalar",
  performance: "Performans",
  "video-creatives": "Video Kreatifler",
  reports: "Rapor Notları",
  approvals: "Onaylar",
  pixel: "Pixel",
};

const ROLE_VIEWS: Record<WorkspaceMode, readonly TikTokAdsWorkspaceView[]> = {
  social: ["overview", "campaigns", "video-creatives", "reports", "approvals"],
  performance: ["overview", "campaigns", "performance", "reports", "approvals", "pixel"],
  designer: ["overview", "video-creatives", "approvals", "reports"],
};

const ROLE_LABELS: Record<WorkspaceMode, string> = {
  social: "Social Media Specialist",
  performance: "Performance Specialist",
  designer: "Designer",
};

const ROLE_DEFAULT_VIEW: Record<WorkspaceMode, TikTokAdsWorkspaceView> = {
  social: "campaigns",
  performance: "performance",
  designer: "video-creatives",
};

const ROLE_APPROVAL_TYPE: Record<WorkspaceMode, CreateTaskRequest["approvalType"]> = {
  social: "TIKTOK_ADS_UGC_SCRIPT_APPROVAL",
  performance: "TIKTOK_ADS_BUDGET_CHANGE_APPROVAL",
  designer: "TIKTOK_ADS_VIDEO_CREATIVE_APPROVAL",
};

export function TikTokAdsWorkspace({ initialView = "overview" }: TikTokAdsWorkspaceProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const workspaceMode = resolveWorkspaceMode(currentUser?.role);
  const canReadAssignedClients = hasUserPermission(currentUser, ["clients.read.assigned"]);
  const canReadTikTokAds = hasUserPermission(currentUser, ["tiktokAds.config.read.assigned"]);
  const canRunTikTokAdsSync = hasUserPermission(currentUser, ["tiktokAds.sync.read.assigned"]);
  const canCreateTikTokAdsApprovals = hasUserPermission(currentUser, ["tiktokAds.approvals.create.assigned"]);
  const canManageTikTokAdsCreatives = hasUserPermission(currentUser, ["tiktokAds.creatives.manage.assigned"]);
  const canReadTasks = hasUserPermission(currentUser, ["tasks.read.assigned"]);
  const canCreateTask = hasUserPermission(currentUser, ["tasks.manage.assigned"]);
  const canUpdateTask = hasUserPermission(currentUser, ["tasks.update.assigned", "tasks.update.own"]);
  const canManageFiles = hasUserPermission(currentUser, [
    "projects.files.manage.assigned",
    "projects.files.manage.any",
  ]);
  const canInteractWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.interact.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.manage.any",
  ]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeView, setActiveView] = useState<TikTokAdsWorkspaceView>(initialView);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const {
    data: clientsResponse,
    error: clientsError,
    isError: isClientsError,
    isLoading: isClientsLoading,
    isFetching: isClientsFetching,
    refetch: refetchClients,
  } = useGetClientsQuery(ASSIGNED_CLIENTS_QUERY, { skip: !canReadAssignedClients });

  const tikTokAdsClients = useMemo(
    () => filterTikTokAdsClients(clientsResponse?.data ?? []),
    [clientsResponse?.data],
  );

  useEffect(() => {
    if (tikTokAdsClients.length === 0) {
      if (selectedClientId.length > 0) {
        setSelectedClientId("");
      }
      return;
    }

    if (selectedClientId.length === 0) {
      setSelectedClientId(tikTokAdsClients[0].id);
      return;
    }

    if (!tikTokAdsClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(tikTokAdsClients[0].id);
    }
  }, [tikTokAdsClients, selectedClientId]);

  const selectedClient = useMemo(
    () => tikTokAdsClients.find((client) => client.id === selectedClientId) ?? null,
    [tikTokAdsClients, selectedClientId],
  );

  const shouldSkipTikTokQueries = !canReadTikTokAds || selectedClientId.length === 0;
  const { data: config, isLoading: isConfigLoading, isError: isConfigError } =
    useGetAssignedClientTikTokAdsConfigQuery(
      { clientId: selectedClientId },
      { skip: shouldSkipTikTokQueries },
    );
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } =
    useGetAssignedClientTikTokAdsSummaryQuery(
      { clientId: selectedClientId },
      { skip: shouldSkipTikTokQueries },
    );
  const { data: campaigns, isLoading: isCampaignsLoading, isError: isCampaignsError } =
    useGetAssignedClientTikTokAdsCampaignsQuery(
      { clientId: selectedClientId, query: { limit: 8 } },
      { skip: shouldSkipTikTokQueries },
    );
  const { data: adGroupInsights, isLoading: isAdGroupsLoading, isError: isAdGroupsError } =
    useGetAssignedClientTikTokAdsInsightsQuery(
      { clientId: selectedClientId, query: { level: "ADGROUP", limit: 8 } },
      { skip: shouldSkipTikTokQueries },
    );
  const { data: adInsights, isLoading: isAdsLoading, isError: isAdsError } =
    useGetAssignedClientTikTokAdsInsightsQuery(
      { clientId: selectedClientId, query: { level: "AD", limit: 8 } },
      { skip: shouldSkipTikTokQueries },
    );

  const { data: projectsResponse } = useGetProjectsQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 },
  );
  const tikTokAdsProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((project) => project.serviceKey === "tiktok-ads"),
    [projectsResponse?.data],
  );
  const tikTokAdsProjectId = tikTokAdsProjects[0]?.id ?? null;

  const { data: tasksResponse } = useGetTasksQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 || !canReadTasks },
  );
  const tikTokAdsProjectIds = useMemo(
    () => new Set(tikTokAdsProjects.map((project) => project.id)),
    [tikTokAdsProjects],
  );
  const tikTokAdsTasks = useMemo(
    () => (tasksResponse?.data ?? []).filter((task) => tikTokAdsProjectIds.has(task.projectId)),
    [tasksResponse?.data, tikTokAdsProjectIds],
  );
  const approvalTasks = useMemo(
    () =>
      tikTokAdsTasks.filter(
        (task) => task.approvalRequired || task.status === "REVIEW" || task.type === "REVISION",
      ),
    [tikTokAdsTasks],
  );

  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    {
      projectId: tikTokAdsProjectId ?? "",
      tabKey: "MESSAGES",
    },
    {
      skip: !canInteractWorkspace || !tikTokAdsProjectId,
    },
  );

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [createWorkspaceMessage, { isLoading: isCreatingMessage }] =
    useCreateProjectWorkspaceMessageMutation();
  const [syncAssignedTikTokAds, { isLoading: isSyncingAssignedTikTokAds }] =
    useSyncAssignedClientTikTokAdsMutation();

  if (!workspaceMode) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu rol için TikTok Ads employee workspace tanımlı değil.
      </Card>
    );
  }

  if (!canReadAssignedClients) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Atanmış müşteri listesini görüntüleme yetkiniz bulunmuyor.
      </Card>
    );
  }

  if (!canReadTikTokAds) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        TikTok Ads raporlarını görüntülemek için `tiktokAds.config.read.assigned` izni gereklidir.
      </Card>
    );
  }

  const allowedViews = ROLE_VIEWS[workspaceMode];
  const currentView = allowedViews.includes(activeView)
    ? activeView
    : ROLE_DEFAULT_VIEW[workspaceMode];
  const hasTikTokAdsProject = Boolean(tikTokAdsProjectId);
  const isActionBusy =
    isCreatingTask ||
    isUpdatingTask ||
    isTogglingTodo ||
    isCreatingMessage ||
    isSyncingAssignedTikTokAds;

  async function handleSyncAssignedTikTokAds() {
    if (!selectedClientId) {
      return;
    }

    if (!canRunTikTokAdsSync) {
      setFeedback({
        type: "error",
        text: "TikTok Ads sync çalıştırmak için yetkiniz yok.",
      });
      return;
    }

    setActiveAction("sync");
    try {
      const response = await syncAssignedTikTokAds({ clientId: selectedClientId }).unwrap();
      setFeedback({
        type: "success",
        text:
          response.syncStatus === "SKIPPED"
            ? response.skippedReason ?? "TikTok Ads verileri kısa süre önce güncellendi."
            : "TikTok Ads sync tamamlandı.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "TikTok Ads sync çalıştırılamadı."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateRoleTask(action: "creative" | "optimization" | "report" | "approval") {
    if (!tikTokAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Bu müşteri için `serviceKey=TIKTOK_ADS` proje bulunamadı.",
      });
      return;
    }

    if (action !== "approval" && !canCreateTask) {
      setFeedback({
        type: "error",
        text: "Görev oluşturma yetkiniz yok. `tasks.manage.assigned` izni gereklidir.",
      });
      return;
    }

    if (action === "approval" && !canCreateTikTokAdsApprovals) {
      setFeedback({
        type: "error",
        text: "Approval talebi oluşturmak için `tiktokAds.approvals.create.assigned` izni gereklidir.",
      });
      return;
    }

    const fallbackTitleByAction: Record<typeof action, string> = {
      creative: "TikTok Video Kreatif Görevi",
      optimization: "TikTok Ads Optimizasyon Notu",
      report: "TikTok Ads Rapor Hazırlığı",
      approval: "TikTok Ads Onay Talebi",
    };
    const approvalType = workspaceMode ? ROLE_APPROVAL_TYPE[workspaceMode] : "TIKTOK_ADS_CAMPAIGN_APPROVAL";

    const taskBody: CreateTaskRequest = {
      projectId: tikTokAdsProjectId,
      title: taskTitle.trim().length > 0 ? taskTitle.trim() : fallbackTitleByAction[action],
      description: taskDescription.trim().length > 0 ? taskDescription.trim() : null,
      status: action === "approval" ? "REVIEW" : "TODO",
      priority: action === "approval" ? "HIGH" : "MEDIUM",
      type: action === "approval" ? "REVISION" : action === "report" ? "QA" : "FEATURE",
      approvalRequired: action === "approval",
      approvalType: action === "approval" ? approvalType : undefined,
      approvalStatus: action === "approval" ? "PENDING" : undefined,
      workstream:
        action === "creative"
          ? "UI_INTEGRATION"
          : action === "optimization"
            ? "BACKEND"
            : action === "report"
              ? "QA"
              : "FULLSTACK",
    };

    setFeedback(null);
    setActiveAction(action);
    try {
      await createTask(taskBody).unwrap();
      setTaskTitle("");
      setTaskDescription("");
      setFeedback({
        type: "success",
        text: "TikTok Ads workspace üzerinden görev oluşturuldu.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Görev oluşturulamadı."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateInternalNote() {
    if (!tikTokAdsProjectId) {
      setFeedback({
        type: "error",
        text: "TikTok Ads notu için proje bulunamadı.",
      });
      return;
    }

    if (!canInteractWorkspace) {
      setFeedback({
        type: "error",
        text: "Not paylaşımı için workspace etkileşim izniniz bulunmuyor.",
      });
      return;
    }

    if (noteBody.trim().length === 0) {
      setFeedback({
        type: "error",
        text: "Not alanı boş bırakılamaz.",
      });
      return;
    }

    setFeedback(null);
    setActiveAction("note");
    try {
      await createWorkspaceMessage({
        projectId: tikTokAdsProjectId,
        tabKey: "REPORTS",
        body: noteBody.trim(),
        isInternal: true,
      }).unwrap();
      setNoteBody("");
      setFeedback({
        type: "success",
        text: "Ajans notu workspace'e eklendi.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Ajans notu gönderilemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleReplyToClient() {
    if (!tikTokAdsProjectId) {
      setFeedback({
        type: "error",
        text: "TikTok Ads müşteri mesajı için proje bulunamadı.",
      });
      return;
    }

    if (!canInteractWorkspace) {
      setFeedback({
        type: "error",
        text: "Müşteri mesajı için workspace etkileşim izniniz yok.",
      });
      return;
    }

    if (replyBody.trim().length === 0) {
      setFeedback({
        type: "error",
        text: "Mesaj alanı boş bırakılamaz.",
      });
      return;
    }

    setFeedback(null);
    setActiveAction("reply");
    try {
      await createWorkspaceMessage({
        projectId: tikTokAdsProjectId,
        tabKey: "MESSAGES",
        body: replyBody.trim(),
        isInternal: false,
      }).unwrap();
      setReplyBody("");
      setFeedback({
        type: "success",
        text: "Müşteri mesajı workspace'e gönderildi.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Müşteri mesajı gönderilemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleAdvanceTaskStatus(task: Task) {
    if (!canUpdateTask) {
      setFeedback({
        type: "error",
        text: "Task güncelleme yetkiniz yok.",
      });
      return;
    }

    const nextStatus = resolveNextTaskStatus(task.status);
    if (!nextStatus) {
      return;
    }

    setFeedback(null);
    setActiveAction(task.id);
    try {
      await updateTask({
        id: task.id,
        body: { status: nextStatus },
      }).unwrap();
      setFeedback({
        type: "success",
        text: `${task.title} durumu ${nextStatus} olarak güncellendi.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Task durumu güncellenemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleToggleTodo(taskId: string, todo: TaskTodo) {
    if (!canUpdateTask) {
      setFeedback({
        type: "error",
        text: "Todo güncelleme için task update izni gerekir.",
      });
      return;
    }

    setFeedback(null);
    setActiveAction(todo.id);
    try {
      await toggleTaskTodo({
        taskId,
        todoId: todo.id,
        body: { isCompleted: !todo.isCompleted },
      }).unwrap();
      setFeedback({
        type: "success",
        text: "Task todo güncellendi.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Task todo güncellenemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">TikTok Ads Workspace</h1>
          <p className="text-sm text-[#A0A0A0]">
            {ROLE_LABELS[workspaceMode]} için assigned TikTok Ads operasyon ekranı
          </p>
        </div>
        <Badge variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
          {ROLE_LABELS[workspaceMode]}
        </Badge>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 grow">
            <Label htmlFor="tiktok-ads-client">TikTok Ads Müşterilerim</Label>
            <select
              id="tiktok-ads-client"
              className="mt-2 h-10 w-full rounded-md border border-white/[0.12] bg-[#131313] px-3 text-sm text-white"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
              disabled={isClientsLoading || tikTokAdsClients.length === 0}
            >
              {tikTokAdsClients.length === 0 ? (
                <option value="">TikTok Ads müşteri bulunamadı</option>
              ) : (
                tikTokAdsClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName}
                  </option>
                ))
              )}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => refetchClients()}
            disabled={isClientsLoading || isClientsFetching}
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => void handleSyncAssignedTikTokAds()}
            disabled={!selectedClientId || !canRunTikTokAdsSync || isActionBusy}
            title={canRunTikTokAdsSync ? undefined : "Bu işlem için TikTok Ads sync izni gerekir."}
          >
            <RefreshCw className="h-4 w-4" />
            {activeAction === "sync" ? "Sync..." : "Sync Çalıştır"}
          </Button>
        </div>
        {isClientsLoading ? (
          <p className="mt-3 text-sm text-[#A0A0A0]">Assigned client listesi yükleniyor...</p>
        ) : null}
        {isClientsError ? (
          <p className="mt-3 text-sm text-red-300">
            {extractApiErrorMessage(clientsError, "Müşteri listesi alınamadı.")}
          </p>
        ) : null}
      </Card>

      {feedback ? (
        <Card
          className={
            feedback.type === "success"
              ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 p-4 text-sm text-[#d8ff8f]"
              : "border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          }
        >
          {feedback.text}
        </Card>
      ) : null}

      {!isClientsLoading && !isClientsError && tikTokAdsClients.length === 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          Assigned scope içinde `ACTIVE TIKTOK_ADS` servisi olan müşteri bulunmuyor.
        </Card>
      ) : null}

      {selectedClient ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard
              label="Toplam Harcama"
              value={summary ? formatCurrency(summary.spend) : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="Video Views"
              value={summary ? summary.videoViews.toLocaleString("tr-TR") : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="Dönüşüm"
              value={summary ? summary.conversions.toLocaleString("tr-TR") : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="CPA"
              value={summary ? formatCurrency(summary.costPerConversion) : "—"}
              loading={isSummaryLoading}
            />
          </div>

          {(isConfigError || isSummaryError || isCampaignsError || isAdGroupsError || isAdsError) ? (
            <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              TikTok Ads raporlarından biri okunamadı. Assigned scope ve bağlantı durumunu kontrol edin.
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {allowedViews.map((view) => (
              <Button
                key={view}
                type="button"
                size="sm"
                variant={currentView === view ? "default" : "outline"}
                className={currentView === view ? "bg-[#AAFF01] text-[#131313]" : ""}
                onClick={() => setActiveView(view)}
              >
                {VIEW_LABELS[view]}
              </Button>
            ))}
          </div>

          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            {currentView === "campaigns" || currentView === "overview" ? (
              <CampaignSection
                campaigns={campaigns?.data ?? []}
                isLoading={isCampaignsLoading}
              />
            ) : null}

            {currentView === "performance" ? (
              <PerformanceSection
                insights={adGroupInsights?.data ?? []}
                tasks={tikTokAdsTasks}
                isLoading={isAdGroupsLoading}
                canUpdateTask={canUpdateTask}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onAdvanceTaskStatus={(task) => void handleAdvanceTaskStatus(task)}
              />
            ) : null}

            {currentView === "video-creatives" ? (
              <VideoCreativeSection
                adInsights={adInsights?.data ?? []}
                tasks={tikTokAdsTasks}
                isLoading={isAdsLoading}
                canManageFiles={canManageFiles && canManageTikTokAdsCreatives}
                canCreateTask={canCreateTask}
                hasTikTokAdsProject={hasTikTokAdsProject}
                tikTokAdsProjectId={tikTokAdsProjectId}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onCreateCreativeTask={() => void handleCreateRoleTask("creative")}
              />
            ) : null}

            {currentView === "reports" ? (
              <ReportsSection
                summaryDateLabel={
                  summary ? `${summary.dateRange.since} - ${summary.dateRange.until}` : "—"
                }
                noteBody={noteBody}
                setNoteBody={setNoteBody}
                canInteractWorkspace={canInteractWorkspace}
                canCreateTask={canCreateTask}
                hasTikTokAdsProject={hasTikTokAdsProject}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                reportTasks={tikTokAdsTasks.filter((task) => task.type === "QA")}
                onCreateInternalNote={() => void handleCreateInternalNote()}
                onCreateReportTask={() => void handleCreateRoleTask("report")}
              />
            ) : null}

            {currentView === "approvals" ? (
              <ApprovalsSection
                approvalTasks={approvalTasks}
                canCreateTask={canCreateTikTokAdsApprovals && hasTikTokAdsProject}
                canUpdateTask={canUpdateTask}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onCreateApprovalRequest={() => void handleCreateRoleTask("approval")}
                onAdvanceTaskStatus={(task) => void handleAdvanceTaskStatus(task)}
              />
            ) : null}

            {currentView === "pixel" ? (
              <PixelSection
                config={config}
                isLoading={isConfigLoading}
              />
            ) : null}
          </Card>

          {(workspaceMode === "social" || currentView === "overview") ? (
            <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Social Media Aksiyonları</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="tiktok-ads-task-title">Video / Hook Task</Label>
                  <Input
                    id="tiktok-ads-task-title"
                    placeholder="Örn: İlk 3 saniye hook testi"
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                  />
                  <Textarea
                    placeholder="Task açıklaması"
                    value={taskDescription}
                    onChange={(event) => setTaskDescription(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                      onClick={() => void handleCreateRoleTask("creative")}
                      disabled={!canCreateTask || !hasTikTokAdsProject || isActionBusy}
                    >
                      Task Oluştur
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCreateRoleTask("report")}
                      disabled={!canCreateTask || !hasTikTokAdsProject || isActionBusy}
                    >
                      Rapor Task'ı Aç
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="tiktok-ads-client-reply">Müşteri Mesajı Cevapla</Label>
                  <Textarea
                    id="tiktok-ads-client-reply"
                    placeholder="Müşteriye gönderilecek yanıt..."
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void handleReplyToClient()}
                    disabled={!canInteractWorkspace || !hasTikTokAdsProject || isActionBusy}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Mesaj Gönder
                  </Button>
                  <p className="text-xs text-[#A0A0A0]">
                    Son mesaj:{" "}
                    {workspaceMessages[0]?.body
                      ? workspaceMessages[0].body.slice(0, 96)
                      : "Henüz mesaj yok"}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {(workspaceMode === "performance" || currentView === "overview") ? (
            <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Performance Aksiyonları</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="tiktok-ads-note">Optimization Note</Label>
                  <Textarea
                    id="tiktok-ads-note"
                    placeholder="Optimizasyon notu veya anomali bulgusu..."
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                      onClick={() => void handleCreateInternalNote()}
                      disabled={!canInteractWorkspace || !hasTikTokAdsProject || isActionBusy}
                    >
                      Note Ekle
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCreateRoleTask("optimization")}
                      disabled={!canCreateTask || !hasTikTokAdsProject || isActionBusy}
                    >
                      Optimization Task Aç
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Budget / Hook Test Review</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void handleCreateRoleTask("approval")}
                    disabled={!canCreateTikTokAdsApprovals || !hasTikTokAdsProject || isActionBusy}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Onay Talebi Oluştur
                  </Button>
                  <p className="text-xs text-[#A0A0A0]">
                    Bekleyen onay task sayısı: {approvalTasks.length}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {(workspaceMode === "designer" || currentView === "overview") ? (
            <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Designer Aksiyonları</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  type="button"
                  size="sm"
                  className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                  disabled={!canManageFiles || !canManageTikTokAdsCreatives}
                >
                  <Link
                    to={tikTokAdsProjectId
                      ? `/employee/dosyalar?projectId=${tikTokAdsProjectId}&serviceKey=TIKTOK_ADS`
                      : "/employee/dosyalar"}
                  >
                    <Upload className="h-4 w-4" />
                    Video Asset Yükle
                  </Link>
                </Button>
                <Button
                  asChild
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!canManageFiles || !canManageTikTokAdsCreatives}
                >
                  <Link to="/employee/teslim-dosyalari">Client Visible Paylaş</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCreateRoleTask("approval")}
                  disabled={!canCreateTikTokAdsApprovals || !hasTikTokAdsProject || isActionBusy}
                >
                  Video Approval Task
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {tikTokAdsTasks
                  .flatMap((task) =>
                    (task.todos ?? [])
                      .slice(0, 1)
                      .map((todo) => ({ taskId: task.id, todo })),
                  )
                  .slice(0, 4)
                  .map(({ taskId, todo }) => (
                    <label
                      key={todo.id}
                      className="flex items-center gap-2 rounded border border-white/[0.08] bg-white/5 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={todo.isCompleted}
                        onCheckedChange={() => void handleToggleTodo(taskId, todo)}
                        disabled={!canUpdateTask || isActionBusy}
                      />
                      <span>{todo.title}</span>
                    </label>
                  ))}
                {tikTokAdsTasks.length === 0 ? (
                  <p className="text-xs text-[#A0A0A0]">
                    Todo güncellemek için ilgili TikTok Ads task kaydı bulunmuyor.
                  </p>
                ) : null}
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{loading ? "Yükleniyor..." : value}</p>
    </Card>
  );
}

function CampaignSection({
  campaigns,
  isLoading,
}: {
  campaigns: TikTokAdsCampaign[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-[#A0A0A0]">Kampanya verileri yükleniyor...</p>;
  }

  if (campaigns.length === 0) {
    return <p className="text-sm text-[#A0A0A0]">Kampanya verisi bulunamadı.</p>;
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="rounded-lg border border-white/[0.08] bg-white/5 p-4"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Video className="h-4 w-4 text-[#AAFF01]" />
            <p className="text-sm font-medium text-white">{campaign.name}</p>
            <Badge variant="outline">{campaign.objective}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-[#D8D8D8] md:grid-cols-4">
            <span>Spend: {formatCurrency(campaign.spend)}</span>
            <span>CTR: %{campaign.ctr.toFixed(2)}</span>
            <span>Views: {campaign.videoViews.toLocaleString("tr-TR")}</span>
            <span>CPA: {formatCurrency(campaign.costPerConversion)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformanceSection({
  insights,
  tasks,
  isLoading,
  canUpdateTask,
  isActionBusy,
  activeAction,
  onAdvanceTaskStatus,
}: {
  insights: TikTokAdsInsightItem[];
  tasks: Task[];
  isLoading: boolean;
  canUpdateTask: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  onAdvanceTaskStatus: (task: Task) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Performance & Optimization</h3>
      {isLoading ? <p className="text-sm text-[#A0A0A0]">Ad group içgörüleri yükleniyor...</p> : null}
      {!isLoading && insights.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Ad group içgörüsü bulunamadı.</p>
      ) : null}
      {insights.slice(0, 4).map((insight) => (
        <div key={insight.id} className="rounded border border-white/[0.08] bg-white/5 p-3 text-sm">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#AAFF01]" />
            <span>{insight.entityName ?? "Ad Group"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#D8D8D8] md:grid-cols-5">
            <span>Spend: {formatCurrency(insight.spend)}</span>
            <span>CPM: {insight.cpm.toFixed(2)}</span>
            <span>CTR: %{insight.ctr.toFixed(2)}</span>
            <span>Views: {insight.videoViews.toLocaleString("tr-TR")}</span>
            <span>CPA: {formatCurrency(insight.costPerConversion)}</span>
          </div>
        </div>
      ))}

      <div className="space-y-2">
        {tasks.slice(0, 4).map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/[0.08] p-3">
            <div>
              <p className="text-sm text-white">{task.title}</p>
              <p className="text-xs text-[#A0A0A0]">{task.status}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAdvanceTaskStatus(task)}
              disabled={!canUpdateTask || !resolveNextTaskStatus(task.status) || isActionBusy}
            >
              {activeAction === task.id ? "Güncelleniyor..." : "Durumu İlerle"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoCreativeSection({
  adInsights,
  tasks,
  isLoading,
  canManageFiles,
  canCreateTask,
  hasTikTokAdsProject,
  tikTokAdsProjectId,
  isActionBusy,
  activeAction,
  onCreateCreativeTask,
}: {
  adInsights: TikTokAdsInsightItem[];
  tasks: Task[];
  isLoading: boolean;
  canManageFiles: boolean;
  canCreateTask: boolean;
  hasTikTokAdsProject: boolean;
  tikTokAdsProjectId: string | null;
  isActionBusy: boolean;
  activeAction: string | null;
  onCreateCreativeTask: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Video Creatives & Hooks</h3>
      {isLoading ? <p className="text-sm text-[#A0A0A0]">Ad içgörüleri yükleniyor...</p> : null}
      {!isLoading && adInsights.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Video kreatif verisi bulunamadı.</p>
      ) : null}
      {adInsights.slice(0, 4).map((insight) => (
        <div key={insight.id} className="rounded border border-white/[0.08] bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <Clapperboard className="h-4 w-4 text-[#AAFF01]" />
            {insight.entityName ?? "Video Creative"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#D8D8D8] md:grid-cols-4">
            <span>Views: {insight.videoViews.toLocaleString("tr-TR")}</span>
            <span>2s: {insight.videoViews2s.toLocaleString("tr-TR")}</span>
            <span>6s: {insight.videoViews6s.toLocaleString("tr-TR")}</span>
            <span>VTR: %{insight.vtr.toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          type="button"
          size="sm"
          className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          disabled={!canManageFiles}
        >
          <Link
            to={tikTokAdsProjectId
              ? `/employee/dosyalar?projectId=${tikTokAdsProjectId}&serviceKey=TIKTOK_ADS`
              : "/employee/dosyalar"}
          >
            Video Dosyası Yükle
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCreateCreativeTask}
          disabled={!canCreateTask || !hasTikTokAdsProject || isActionBusy}
        >
          {activeAction === "creative" ? "Oluşturuluyor..." : "Video Task Aç"}
        </Button>
      </div>
      <p className="text-xs text-[#A0A0A0]">TikTok Ads task sayısı: {tasks.length}</p>
    </div>
  );
}

function ReportsSection({
  summaryDateLabel,
  noteBody,
  setNoteBody,
  canInteractWorkspace,
  canCreateTask,
  hasTikTokAdsProject,
  isActionBusy,
  activeAction,
  reportTasks,
  onCreateInternalNote,
  onCreateReportTask,
}: {
  summaryDateLabel: string;
  noteBody: string;
  setNoteBody: (value: string) => void;
  canInteractWorkspace: boolean;
  canCreateTask: boolean;
  hasTikTokAdsProject: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  reportTasks: Task[];
  onCreateInternalNote: () => void;
  onCreateReportTask: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Rapor Notları</h3>
      <p className="text-xs text-[#A0A0A0]">Rapor aralığı: {summaryDateLabel}</p>
      <Textarea
        placeholder="Kampanya değerlendirme notu..."
        value={noteBody}
        onChange={(event) => setNoteBody(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          onClick={onCreateInternalNote}
          disabled={!canInteractWorkspace || !hasTikTokAdsProject || isActionBusy}
        >
          {activeAction === "note" ? "Gönderiliyor..." : "Ajans Notu Ekle"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCreateReportTask}
          disabled={!canCreateTask || !hasTikTokAdsProject || isActionBusy}
        >
          Rapor Task'ı Aç
        </Button>
      </div>
      <div className="space-y-2">
        {reportTasks.slice(0, 4).map((task) => (
          <div key={task.id} className="rounded border border-white/[0.08] p-3">
            <p className="text-sm text-white">{task.title}</p>
            <p className="text-xs text-[#A0A0A0]">{task.status}</p>
          </div>
        ))}
        {reportTasks.length === 0 ? (
          <p className="text-xs text-[#A0A0A0]">Rapor task kaydı bulunmuyor.</p>
        ) : null}
      </div>
    </div>
  );
}

function ApprovalsSection({
  approvalTasks,
  canCreateTask,
  canUpdateTask,
  isActionBusy,
  activeAction,
  onCreateApprovalRequest,
  onAdvanceTaskStatus,
}: {
  approvalTasks: Task[];
  canCreateTask: boolean;
  canUpdateTask: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  onCreateApprovalRequest: () => void;
  onAdvanceTaskStatus: (task: Task) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Onay Talepleri</h3>
        <Button
          type="button"
          size="sm"
          className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          onClick={onCreateApprovalRequest}
          disabled={!canCreateTask || isActionBusy}
        >
          {activeAction === "approval" ? "Oluşturuluyor..." : "Onay Talebi Oluştur"}
        </Button>
      </div>
      {approvalTasks.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Bekleyen approval task bulunmuyor.</p>
      ) : null}
      <div className="space-y-2">
        {approvalTasks.map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/[0.08] p-3">
            <div>
              <p className="text-sm text-white">{task.title}</p>
              <p className="text-xs text-[#A0A0A0]">{task.status}</p>
              {task.approvalType ? (
                <p className="text-xs text-[#A0A0A0]">{formatApprovalType(task.approvalType)}</p>
              ) : null}
              {task.approvalStatus ? (
                <p className="text-xs text-[#A0A0A0]">Approval: {task.approvalStatus}</p>
              ) : null}
              {task.approvalResponseNote ? (
                <p className="text-xs text-orange-200">Not: {task.approvalResponseNote}</p>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canUpdateTask || !resolveNextTaskStatus(task.status) || isActionBusy}
              onClick={() => onAdvanceTaskStatus(task)}
            >
              {activeAction === task.id ? "Güncelleniyor..." : "Status İlerle"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PixelSection({
  config,
  isLoading,
}: {
  config: TikTokAdsConfig | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-[#A0A0A0]">Pixel durumu yükleniyor...</p>;
  }

  if (!config) {
    return <p className="text-sm text-[#A0A0A0]">Pixel durumu bulunamadı.</p>;
  }

  const hasPixel = Boolean(config.pixelId);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Connection: {config.connectionStatus}</Badge>
        <Badge variant="outline">{hasPixel ? "Pixel Configured" : "Pixel Missing"}</Badge>
      </div>
      <p className="text-[#D8D8D8]">Advertiser: {config.advertiserId ?? "—"}</p>
      <p className="text-[#D8D8D8]">Pixel ID: {config.pixelId ?? "—"}</p>
      <p className="text-[#D8D8D8]">Son Sync: {formatClientDateTime(config.lastSyncAt)}</p>
      {config.syncError ? (
        <p className="text-red-300">Sync error: {config.syncError}</p>
      ) : (
        <p className="flex items-center gap-2 text-[#D8D8D8]">
          <CheckCircle2 className="h-4 w-4 text-[#AAFF01]" />
          Aktif sync hatası yok.
        </p>
      )}
    </div>
  );
}

function resolveWorkspaceMode(role: string | undefined): WorkspaceMode | null {
  if (role === "SOCIAL_MEDIA_SPECIALIST") {
    return "social";
  }

  if (role === "PERFORMANCE_SPECIALIST") {
    return "performance";
  }

  if (role === "DESIGNER") {
    return "designer";
  }

  return null;
}

function filterTikTokAdsClients(clients: ClientProfile[]): ClientProfile[] {
  return clients.filter((client) =>
    (client.purchasedServices ?? []).some(
      (service) => service.serviceKey === "tiktok-ads" && service.status === "ACTIVE",
    ),
  );
}

function resolveNextTaskStatus(status: Task["status"]): Task["status"] | null {
  if (status === "TODO") {
    return "IN_PROGRESS";
  }

  if (status === "IN_PROGRESS") {
    return "REVIEW";
  }

  if (status === "REVIEW") {
    return "DONE";
  }

  return null;
}

function formatApprovalType(value: string): string {
  return value.replace("TIKTOK_ADS_", "").replace("META_ADS_", "").replace(/_/g, " ");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}
