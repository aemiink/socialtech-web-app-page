import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { hasUserPermission, selectCurrentUser } from "../../features/auth/authSelectors";
import {
  useGetAssignedClientAmazonAdsCampaignsQuery,
  useGetAssignedClientAmazonAdsConfigQuery,
  useGetAssignedClientAmazonAdsInsightsQuery,
  useGetAssignedClientAmazonAdsProductsQuery,
  useGetAssignedClientAmazonAdsSummaryQuery,
  useGetClientsQuery,
  useSyncAssignedClientAmazonAdsMutation,
} from "../../features/clients/clientsApi";
import type {
  AmazonAdsCampaignSummary,
  AmazonAdsInsightItem,
  AmazonAdsProductSummary,
  ClientProfile,
  ClientsListQuery,
} from "../../features/clients/clientsTypes";
import { extractApiErrorMessage, formatClientDateTime } from "../../features/clients/clientsUtils";
import {
  useCreateProjectWorkspaceMessageMutation,
  useGetProjectWorkspaceMessagesQuery,
  useGetProjectsQuery,
} from "../../features/projects/projectsApi";
import { useCreateTaskMutation, useGetTasksQuery, useToggleTaskTodoMutation, useUpdateTaskMutation } from "../../features/tasks/tasksApi";
import type { CreateTaskRequest, Task, TaskTodo } from "../../features/tasks/tasksTypes";
import { useAppSelector } from "../../store/hooks";

type WorkspaceMode = "social" | "performance" | "designer";

export type AmazonAdsWorkspaceView =
  | "overview"
  | "campaigns"
  | "products"
  | "search-terms"
  | "reports"
  | "approvals"
  | "creative";

type AmazonAdsWorkspaceProps = {
  initialView?: AmazonAdsWorkspaceView;
};

const ASSIGNED_CLIENTS_QUERY: ClientsListQuery = {
  status: "ACTIVE",
  limit: 100,
  sortBy: "name",
  sortOrder: "asc",
};

const VIEW_LABELS: Record<AmazonAdsWorkspaceView, string> = {
  overview: "Özet",
  campaigns: "Kampanyalar",
  products: "Ürünler / ASIN",
  "search-terms": "Arama Terimleri",
  reports: "Raporlar",
  approvals: "Onaylar",
  creative: "Kreatif",
};

const ROLE_VIEWS: Record<WorkspaceMode, readonly AmazonAdsWorkspaceView[]> = {
  social: ["overview", "campaigns", "search-terms", "reports", "approvals"],
  performance: ["overview", "campaigns", "products", "search-terms", "reports", "approvals"],
  designer: ["overview", "creative", "approvals", "reports"],
};

const ROLE_LABELS: Record<WorkspaceMode, string> = {
  social: "Social Media Specialist",
  performance: "Performance Specialist",
  designer: "Designer",
};

const ROLE_DEFAULT_VIEW: Record<WorkspaceMode, AmazonAdsWorkspaceView> = {
  social: "campaigns",
  performance: "products",
  designer: "creative",
};

const ROLE_APPROVAL_TYPE: Record<WorkspaceMode, CreateTaskRequest["approvalType"]> = {
  social: "AMAZON_ADS_CAMPAIGN_APPROVAL",
  performance: "AMAZON_ADS_BUDGET_CHANGE_APPROVAL",
  designer: "AMAZON_ADS_CREATIVE_APPROVAL",
};

export function AmazonAdsWorkspace({ initialView = "overview" }: AmazonAdsWorkspaceProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const workspaceMode = resolveWorkspaceMode(currentUser?.role);

  const canReadAssignedClients = hasUserPermission(currentUser, ["clients.read.assigned"]);
  const canReadAmazonAdsConfig = hasUserPermission(currentUser, ["amazonAds.config.read.assigned"]);
  const canReadAmazonAdsReporting = hasUserPermission(currentUser, ["amazonAds.reporting.read.assigned"]);
  const canRunAmazonAdsSync = hasUserPermission(currentUser, ["amazonAds.sync.read.assigned"]);
  const canManageAmazonAdsNotes = hasUserPermission(currentUser, ["amazonAds.notes.manage.assigned"]);
  const canCreateAmazonAdsApprovals = hasUserPermission(currentUser, ["amazonAds.approvals.create.assigned"]);
  const canManageAmazonAdsRecommendations = hasUserPermission(currentUser, [
    "amazonAds.recommendations.manage.assigned",
    "amazonAds.notes.manage.assigned",
  ]);
  const canReadTasks = hasUserPermission(currentUser, ["tasks.read.assigned"]);
  const canCreateTask = hasUserPermission(currentUser, ["tasks.manage.assigned"]);
  const canUpdateTask = hasUserPermission(currentUser, ["tasks.update.assigned", "tasks.update.own"]);
  const canManageProjectFiles = hasUserPermission(currentUser, [
    "projects.files.manage.assigned",
    "projects.files.manage.any",
  ]);
  const canManageAmazonProductCollaboration = hasUserPermission(currentUser, [
    "amazonAds.productCollaboration.manage.assigned",
    "projects.files.manage.any",
  ]);
  const canManageFiles = canManageProjectFiles && canManageAmazonProductCollaboration;
  const canInteractWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.interact.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.manage.any",
  ]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeView, setActiveView] = useState<AmazonAdsWorkspaceView>(initialView);
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

  const amazonAdsClients = useMemo(
    () => filterAmazonAdsClients(clientsResponse?.data ?? []),
    [clientsResponse?.data],
  );

  useEffect(() => {
    if (amazonAdsClients.length === 0) {
      if (selectedClientId.length > 0) {
        setSelectedClientId("");
      }
      return;
    }

    if (selectedClientId.length === 0) {
      setSelectedClientId(amazonAdsClients[0].id);
      return;
    }

    if (!amazonAdsClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(amazonAdsClients[0].id);
    }
  }, [amazonAdsClients, selectedClientId]);

  const selectedClient = useMemo(
    () => amazonAdsClients.find((client) => client.id === selectedClientId) ?? null,
    [amazonAdsClients, selectedClientId],
  );

  const shouldSkipAmazonQueries =
    !canReadAmazonAdsConfig || !canReadAmazonAdsReporting || selectedClientId.length === 0;

  const { data: config, isLoading: isConfigLoading, isError: isConfigError } =
    useGetAssignedClientAmazonAdsConfigQuery(
      { clientId: selectedClientId },
      { skip: selectedClientId.length === 0 || !canReadAmazonAdsConfig },
    );
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } =
    useGetAssignedClientAmazonAdsSummaryQuery(
      { clientId: selectedClientId },
      { skip: shouldSkipAmazonQueries },
    );
  const { data: campaigns, isLoading: isCampaignsLoading, isError: isCampaignsError } =
    useGetAssignedClientAmazonAdsCampaignsQuery(
      { clientId: selectedClientId, query: { limit: 12 } },
      { skip: shouldSkipAmazonQueries },
    );
  const { data: products, isLoading: isProductsLoading, isError: isProductsError } =
    useGetAssignedClientAmazonAdsProductsQuery(
      { clientId: selectedClientId, query: { limit: 12 } },
      { skip: shouldSkipAmazonQueries },
    );
  const { data: searchTerms, isLoading: isSearchTermsLoading, isError: isSearchTermsError } =
    useGetAssignedClientAmazonAdsInsightsQuery(
      { clientId: selectedClientId, query: { level: "SEARCH_TERM", limit: 12 } },
      { skip: shouldSkipAmazonQueries },
    );

  const { data: projectsResponse } = useGetProjectsQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 },
  );
  const amazonAdsProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((project) => project.serviceKey === "amazon-ads"),
    [projectsResponse?.data],
  );
  const amazonAdsProjectId = amazonAdsProjects[0]?.id ?? null;

  const { data: tasksResponse } = useGetTasksQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 || !canReadTasks },
  );
  const amazonAdsProjectIds = useMemo(
    () => new Set(amazonAdsProjects.map((project) => project.id)),
    [amazonAdsProjects],
  );
  const amazonAdsTasks = useMemo(
    () => (tasksResponse?.data ?? []).filter((task) => amazonAdsProjectIds.has(task.projectId)),
    [tasksResponse?.data, amazonAdsProjectIds],
  );
  const approvalTasks = useMemo(
    () =>
      amazonAdsTasks.filter(
        (task) => task.approvalRequired || task.status === "REVIEW" || task.type === "REVISION",
      ),
    [amazonAdsTasks],
  );

  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    {
      projectId: amazonAdsProjectId ?? "",
      tabKey: "MESSAGES",
    },
    {
      skip: !canInteractWorkspace || !amazonAdsProjectId,
    },
  );

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [createWorkspaceMessage, { isLoading: isCreatingMessage }] =
    useCreateProjectWorkspaceMessageMutation();
  const [syncAssignedAmazonAds, { isLoading: isSyncingAssignedAmazonAds }] =
    useSyncAssignedClientAmazonAdsMutation();

  if (!workspaceMode) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu rol için Amazon Ads employee workspace tanımlı değil.
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

  if (!canReadAmazonAdsConfig || !canReadAmazonAdsReporting) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Amazon Ads workspace için `amazonAds.config.read.assigned` ve `amazonAds.reporting.read.assigned`
        izinleri gereklidir.
      </Card>
    );
  }

  const allowedViews = ROLE_VIEWS[workspaceMode];
  const currentView = allowedViews.includes(activeView)
    ? activeView
    : ROLE_DEFAULT_VIEW[workspaceMode];
  const hasAmazonAdsProject = Boolean(amazonAdsProjectId);
  const isActionBusy =
    isCreatingTask ||
    isUpdatingTask ||
    isTogglingTodo ||
    isCreatingMessage ||
    isSyncingAssignedAmazonAds;

  async function handleSyncAssignedAmazonAds() {
    if (!selectedClientId) {
      return;
    }

    if (!canRunAmazonAdsSync) {
      setFeedback({
        type: "error",
        text: "Amazon Ads sync çalıştırmak için yetkiniz yok.",
      });
      return;
    }

    setFeedback(null);
    setActiveAction("sync");
    try {
      const response = await syncAssignedAmazonAds({ clientId: selectedClientId }).unwrap();
      setFeedback({
        type: "success",
        text:
          response.syncStatus === "SKIPPED"
            ? "Son senkron çok yeni."
            : "Amazon Ads sync tamamlandı.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Amazon Ads sync çalıştırılamadı."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateRoleTask(
    action: "creative" | "optimization" | "report" | "approval" | "recommendation",
  ) {
    if (!amazonAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Bu müşteri için `serviceKey=AMAZON_ADS` proje bulunamadı.",
      });
      return;
    }

    if (action !== "approval" && action !== "recommendation" && !canCreateTask) {
      setFeedback({
        type: "error",
        text: "Görev oluşturma yetkiniz yok. `tasks.manage.assigned` izni gereklidir.",
      });
      return;
    }

    if (action === "approval" && !canCreateAmazonAdsApprovals) {
      setFeedback({
        type: "error",
        text: "Onay talebi için `amazonAds.approvals.create.assigned` izni gereklidir.",
      });
      return;
    }

    if (action === "recommendation" && !canManageAmazonAdsRecommendations) {
      setFeedback({
        type: "error",
        text: "Öneri kaydı için `amazonAds.recommendations.manage.assigned` izni gereklidir.",
      });
      return;
    }

    const fallbackTitleByAction: Record<typeof action, string> = {
      creative: "Amazon Ads Kreatif Görevi",
      optimization: "Amazon Ads Optimizasyon Notu",
      report: "Amazon Ads Rapor Hazırlığı",
      approval: "Amazon Ads Onay Talebi",
      recommendation: "Amazon Ads Performans Önerisi",
    };
    const approvalType = workspaceMode ? ROLE_APPROVAL_TYPE[workspaceMode] : "AMAZON_ADS_CAMPAIGN_APPROVAL";

    const taskBody: CreateTaskRequest = {
      projectId: amazonAdsProjectId,
      title: taskTitle.trim().length > 0 ? taskTitle.trim() : fallbackTitleByAction[action],
      description: taskDescription.trim().length > 0 ? taskDescription.trim() : null,
      status: action === "approval" ? "REVIEW" : "TODO",
      priority: action === "approval" || action === "recommendation" ? "HIGH" : "MEDIUM",
      type: action === "approval" ? "REVISION" : action === "report" ? "QA" : "FEATURE",
      approvalRequired: action === "approval",
      approvalType: action === "approval" ? approvalType : undefined,
      approvalStatus: action === "approval" ? "PENDING" : undefined,
      workstream:
        action === "creative"
          ? "UI_INTEGRATION"
          : action === "report"
            ? "QA"
            : "BACKEND",
    };

    setFeedback(null);
    setActiveAction(action);
    try {
      await createTask(taskBody).unwrap();
      setTaskTitle("");
      setTaskDescription("");
      setFeedback({
        type: "success",
        text: "Amazon Ads workspace üzerinden görev oluşturuldu.",
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
    if (!amazonAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Amazon Ads notu için proje bulunamadı.",
      });
      return;
    }

    if (!canInteractWorkspace || !canManageAmazonAdsNotes) {
      setFeedback({
        type: "error",
        text: "Not eklemek için workspace etkileşim izni gerekir.",
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
        projectId: amazonAdsProjectId,
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
    if (!amazonAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Müşteri mesajı için proje bulunamadı.",
      });
      return;
    }

    if (!canInteractWorkspace) {
      setFeedback({
        type: "error",
        text: "Müşteri mesajı için workspace etkileşim izni gerekir.",
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
        projectId: amazonAdsProjectId,
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
        text: "Todo güncellemek için task update izni gerekir.",
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
          <h1 className="mb-1 text-2xl font-semibold">Amazon Ads Workspace</h1>
          <p className="text-sm text-[#A0A0A0]">
            {ROLE_LABELS[workspaceMode]} için assigned Amazon Ads operasyon ekranı
          </p>
        </div>
        <Badge variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
          {ROLE_LABELS[workspaceMode]}
        </Badge>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 grow">
            <Label htmlFor="amazon-ads-client">Amazon Ads Müşterilerim</Label>
            <select
              id="amazon-ads-client"
              className="mt-2 h-10 w-full rounded-md border border-white/[0.12] bg-[#131313] px-3 text-sm text-white"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
              disabled={isClientsLoading || amazonAdsClients.length === 0}
            >
              {amazonAdsClients.length === 0 ? (
                <option value="">Amazon Ads müşteri bulunamadı</option>
              ) : (
                amazonAdsClients.map((client) => (
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
            onClick={() => void handleSyncAssignedAmazonAds()}
            disabled={!selectedClientId || !canRunAmazonAdsSync || isActionBusy}
            title={canRunAmazonAdsSync ? undefined : "Bu işlem için Amazon Ads sync izni gerekir."}
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

      {!isClientsLoading && !isClientsError && amazonAdsClients.length === 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          Assigned scope içinde `ACTIVE AMAZON_ADS` servisi olan müşteri bulunmuyor.
        </Card>
      ) : null}

      {selectedClient ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard
              label="Toplam Harcama"
              value={summary ? formatCurrency(summary.spend, config?.settings.currencyCode) : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="Toplam Satış"
              value={summary ? formatCurrency(summary.sales, config?.settings.currencyCode) : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="ACOS"
              value={summary ? `%${summary.acos.toFixed(2)}` : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="ROAS"
              value={summary ? `${summary.roas.toFixed(2)}x` : "—"}
              loading={isSummaryLoading}
            />
          </div>

          {(isConfigError || isSummaryError || isCampaignsError || isProductsError || isSearchTermsError) ? (
            <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Amazon Ads read-model endpointlerinden biri okunamadı. Assigned scope ve bağlantı durumunu
              kontrol edin.
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
                currencyCode={config?.settings.currencyCode}
              />
            ) : null}

            {currentView === "products" ? (
              <ProductsSection
                products={products?.data ?? []}
                isLoading={isProductsLoading}
                currencyCode={config?.settings.currencyCode}
              />
            ) : null}

            {currentView === "search-terms" ? (
              <SearchTermsSection
                insights={searchTerms?.data ?? []}
                isLoading={isSearchTermsLoading}
                currencyCode={config?.settings.currencyCode}
              />
            ) : null}

            {currentView === "reports" ? (
              <ReportsSection
                summaryDateLabel={
                  summary ? `${summary.dateRange.since} - ${summary.dateRange.until}` : "—"
                }
                summary={summary}
                canManageAmazonAdsNotes={canManageAmazonAdsNotes}
                canCreateTask={canCreateTask}
                hasAmazonAdsProject={hasAmazonAdsProject}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                noteBody={noteBody}
                setNoteBody={setNoteBody}
                reportTasks={amazonAdsTasks.filter((task) => task.type === "QA")}
                onCreateInternalNote={() => void handleCreateInternalNote()}
                onCreateReportTask={() => void handleCreateRoleTask("report")}
                currencyCode={config?.settings.currencyCode}
              />
            ) : null}

            {currentView === "approvals" ? (
              <ApprovalsSection
                approvalTasks={approvalTasks}
                canCreateApproval={canCreateAmazonAdsApprovals && hasAmazonAdsProject}
                canUpdateTask={canUpdateTask}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onCreateApprovalRequest={() => void handleCreateRoleTask("approval")}
                onAdvanceTaskStatus={(task) => void handleAdvanceTaskStatus(task)}
              />
            ) : null}

            {currentView === "creative" ? (
              <CreativeSection
                tasks={amazonAdsTasks}
                canManageFiles={canManageFiles}
                canCreateTask={canCreateTask}
                hasAmazonAdsProject={hasAmazonAdsProject}
                amazonAdsProjectId={amazonAdsProjectId}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                canUpdateTask={canUpdateTask}
                onCreateCreativeTask={() => void handleCreateRoleTask("creative")}
                onToggleTodo={(taskId, todo) => void handleToggleTodo(taskId, todo)}
              />
            ) : null}
          </Card>

          {(workspaceMode === "social" || currentView === "overview") ? (
            <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Social Aksiyonları</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="amazon-ads-task-title">Campaign / Search Term Task</Label>
                  <Input
                    id="amazon-ads-task-title"
                    placeholder="Örn: Search term negative keyword önerisi"
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
                      onClick={() => void handleCreateRoleTask("optimization")}
                      disabled={!canCreateTask || !hasAmazonAdsProject || isActionBusy}
                    >
                      Task Oluştur
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCreateRoleTask("report")}
                      disabled={!canCreateTask || !hasAmazonAdsProject || isActionBusy}
                    >
                      Rapor Task'ı Aç
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="amazon-ads-client-reply">Müşteri Mesajı Cevapla</Label>
                  <Textarea
                    id="amazon-ads-client-reply"
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
                    disabled={!canInteractWorkspace || !hasAmazonAdsProject || isActionBusy}
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
                  <Label htmlFor="amazon-ads-note">Optimization Note</Label>
                  <Textarea
                    id="amazon-ads-note"
                    placeholder="Anomali bulgusu, ACOS/ROAS önerisi..."
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                      onClick={() => void handleCreateInternalNote()}
                      disabled={!canManageAmazonAdsNotes || !hasAmazonAdsProject || isActionBusy}
                    >
                      Note Ekle
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCreateRoleTask("recommendation")}
                      disabled={!canManageAmazonAdsRecommendations || !hasAmazonAdsProject || isActionBusy}
                    >
                      Performance Önerisi
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Budget / Campaign Approval</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void handleCreateRoleTask("approval")}
                    disabled={!canCreateAmazonAdsApprovals || !hasAmazonAdsProject || isActionBusy}
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
                  disabled={!canManageFiles}
                >
                  <Link
                    to={amazonAdsProjectId
                      ? `/employee/dosyalar?projectId=${amazonAdsProjectId}&serviceKey=AMAZON_ADS`
                      : "/employee/dosyalar"}
                  >
                    <Upload className="h-4 w-4" />
                    Creative Asset Yükle
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCreateRoleTask("creative")}
                  disabled={!canCreateTask || !hasAmazonAdsProject || isActionBusy}
                >
                  Creative Task Aç
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCreateRoleTask("approval")}
                  disabled={!canCreateAmazonAdsApprovals || !hasAmazonAdsProject || isActionBusy}
                >
                  Design Approval Task
                </Button>
              </div>
              <p className="mt-3 text-xs text-[#A0A0A0]">
                Connection: {config?.connectionStatus ?? "NOT_CONNECTED"} · Son sync:{" "}
                {formatClientDateTime(config?.lastSyncAt ?? null)}
              </p>
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
  currencyCode,
}: {
  campaigns: AmazonAdsCampaignSummary[];
  isLoading: boolean;
  currencyCode?: string | null;
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
        <div key={campaign.id} className="rounded-lg border border-white/[0.08] bg-white/5 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Search className="h-4 w-4 text-[#AAFF01]" />
            <p className="text-sm font-medium text-white">{campaign.name}</p>
            <Badge variant="outline">{formatAdProduct(campaign.adProduct)}</Badge>
            <Badge variant="outline">{campaign.status}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-[#D8D8D8] md:grid-cols-4">
            <span>Spend: {formatCurrency(campaign.spend, currencyCode)}</span>
            <span>Sales: {formatCurrency(campaign.sales, currencyCode)}</span>
            <span>ACOS: %{campaign.acos.toFixed(2)}</span>
            <span>ROAS: {campaign.roas.toFixed(2)}x</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsSection({
  products,
  isLoading,
  currencyCode,
}: {
  products: AmazonAdsProductSummary[];
  isLoading: boolean;
  currencyCode?: string | null;
}) {
  if (isLoading) {
    return <p className="text-sm text-[#A0A0A0]">Ürün / ASIN verileri yükleniyor...</p>;
  }

  if (products.length === 0) {
    return <p className="text-sm text-[#A0A0A0]">Ürün performans verisi bulunamadı.</p>;
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={`${product.asin ?? "asin"}-${product.sku ?? "sku"}-${index}`} className="rounded border border-white/[0.08] bg-white/5 p-3">
          <div className="mb-2 text-sm text-white">
            {product.title ?? "Başlıksız Ürün"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#D8D8D8] md:grid-cols-5">
            <span>ASIN: {product.asin ?? "—"}</span>
            <span>SKU: {product.sku ?? "—"}</span>
            <span>Sales: {formatCurrency(product.sales, currencyCode)}</span>
            <span>ACOS: %{product.acos.toFixed(2)}</span>
            <span>ROAS: {product.roas.toFixed(2)}x</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchTermsSection({
  insights,
  isLoading,
  currencyCode,
}: {
  insights: AmazonAdsInsightItem[];
  isLoading: boolean;
  currencyCode?: string | null;
}) {
  if (isLoading) {
    return <p className="text-sm text-[#A0A0A0]">Search term verileri yükleniyor...</p>;
  }

  if (insights.length === 0) {
    return <p className="text-sm text-[#A0A0A0]">Search term verisi bulunamadı.</p>;
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <div key={insight.id} className="rounded border border-white/[0.08] bg-white/5 p-3">
          <div className="mb-2 text-sm text-white">
            {insight.searchTerm ?? insight.keywordText ?? insight.entityName ?? "Search term"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#D8D8D8] md:grid-cols-5">
            <span>Spend: {formatCurrency(insight.spend, currencyCode)}</span>
            <span>Sales: {formatCurrency(insight.sales, currencyCode)}</span>
            <span>Orders: {insight.orders.toLocaleString("tr-TR")}</span>
            <span>ACOS: %{insight.acos.toFixed(2)}</span>
            <span>ROAS: {insight.roas.toFixed(2)}x</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsSection({
  summaryDateLabel,
  summary,
  canManageAmazonAdsNotes,
  canCreateTask,
  hasAmazonAdsProject,
  isActionBusy,
  activeAction,
  noteBody,
  setNoteBody,
  reportTasks,
  onCreateInternalNote,
  onCreateReportTask,
  currencyCode,
}: {
  summaryDateLabel: string;
  summary: {
    spend: number;
    sales: number;
    orders: number;
    clicks: number;
    acos: number;
    roas: number;
  } | undefined;
  canManageAmazonAdsNotes: boolean;
  canCreateTask: boolean;
  hasAmazonAdsProject: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  noteBody: string;
  setNoteBody: (value: string) => void;
  reportTasks: Task[];
  onCreateInternalNote: () => void;
  onCreateReportTask: () => void;
  currencyCode?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Raporlar</h3>
        <p className="text-xs text-[#A0A0A0]">Rapor aralığı: {summaryDateLabel}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 text-xs text-[#D8D8D8] md:grid-cols-3">
        <span>Spend: {summary ? formatCurrency(summary.spend, currencyCode) : "—"}</span>
        <span>Sales: {summary ? formatCurrency(summary.sales, currencyCode) : "—"}</span>
        <span>Orders: {summary ? summary.orders.toLocaleString("tr-TR") : "—"}</span>
      </div>
      <h4 className="text-sm font-semibold text-white">Ajans Notları</h4>
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
          disabled={!canManageAmazonAdsNotes || !hasAmazonAdsProject || isActionBusy}
        >
          {activeAction === "note" ? "Gönderiliyor..." : "Ajans Notu Ekle"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCreateReportTask}
          disabled={!canCreateTask || !hasAmazonAdsProject || isActionBusy}
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
  canCreateApproval,
  canUpdateTask,
  isActionBusy,
  activeAction,
  onCreateApprovalRequest,
  onAdvanceTaskStatus,
}: {
  approvalTasks: Task[];
  canCreateApproval: boolean;
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
          disabled={!canCreateApproval || isActionBusy}
        >
          {activeAction === "approval" ? "Oluşturuluyor..." : "Onay Talebi Oluştur"}
        </Button>
      </div>
      {approvalTasks.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Bekleyen onay task bulunmuyor.</p>
      ) : null}
      <div className="space-y-2">
        {approvalTasks.map((task) => (
          <div key={task.id} className="rounded border border-white/[0.08] bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-white">{task.title}</p>
                <p className="text-xs text-[#A0A0A0]">
                  {task.approvalType ? formatApprovalType(task.approvalType) : "APPROVAL"} · {task.status}
                </p>
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
            {task.todos?.length ? (
              <p className="text-xs text-[#D8D8D8]">Todo: {task.todos.length}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreativeSection({
  tasks,
  canManageFiles,
  canCreateTask,
  hasAmazonAdsProject,
  amazonAdsProjectId,
  isActionBusy,
  activeAction,
  canUpdateTask,
  onCreateCreativeTask,
  onToggleTodo,
}: {
  tasks: Task[];
  canManageFiles: boolean;
  canCreateTask: boolean;
  hasAmazonAdsProject: boolean;
  amazonAdsProjectId: string | null;
  isActionBusy: boolean;
  activeAction: string | null;
  canUpdateTask: boolean;
  onCreateCreativeTask: () => void;
  onToggleTodo: (taskId: string, todo: TaskTodo) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Creative / Brand Asset</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          type="button"
          size="sm"
          className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          disabled={!canManageFiles}
        >
          <Link
            to={amazonAdsProjectId
              ? `/employee/dosyalar?projectId=${amazonAdsProjectId}&serviceKey=AMAZON_ADS`
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
          disabled={!canCreateTask || !hasAmazonAdsProject || isActionBusy}
        >
          {activeAction === "creative" ? "Oluşturuluyor..." : "Creative Task Aç"}
        </Button>
      </div>
      <div className="space-y-2">
        {tasks
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
                onCheckedChange={() => onToggleTodo(taskId, todo)}
                disabled={!canUpdateTask || isActionBusy}
              />
              <span>{todo.title}</span>
            </label>
          ))}
        {tasks.length === 0 ? (
          <p className="text-xs text-[#A0A0A0]">
            Kreatif task kaydı bulunmuyor.
          </p>
        ) : null}
      </div>
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

function filterAmazonAdsClients(clients: ClientProfile[]): ClientProfile[] {
  return clients.filter((client) =>
    (client.purchasedServices ?? []).some(
      (service) => service.serviceKey === "amazon-ads" && service.status === "ACTIVE",
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

function formatCurrency(value: number, currencyCode?: string | null): string {
  const normalizedCurrency =
    typeof currencyCode === "string" && currencyCode.trim().length === 3
      ? currencyCode.trim().toUpperCase()
      : "TRY";

  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    }).format(value);
  }
}

function formatAdProduct(value: string | null): string {
  if (value === "SPONSORED_PRODUCTS") {
    return "Sponsored Products";
  }

  if (value === "SPONSORED_BRANDS") {
    return "Sponsored Brands";
  }

  if (value === "SPONSORED_DISPLAY") {
    return "Sponsored Display";
  }

  return "UNKNOWN";
}

function formatApprovalType(value: string): string {
  return value
    .replace("TIKTOK_ADS_", "")
    .replace("META_ADS_", "")
    .replace("AMAZON_ADS_", "")
    .replace(/_/g, " ");
}
