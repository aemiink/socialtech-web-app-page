import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, Megaphone, MessageSquare, RefreshCw, ShieldAlert, Upload, Zap } from "lucide-react";
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
import {
  useCreateAssignedClientMetaAdsReportMutation,
  useGetAssignedClientMetaAdsAdSetsQuery,
  useGetAssignedClientMetaAdsCampaignsQuery,
  useGetAssignedClientMetaAdsPixelStatusQuery,
  useGetAssignedClientMetaAdsReportsQuery,
  useGetAssignedClientMetaAdsSummaryQuery,
  useUpdateAssignedMetaAdsReportMutation,
} from "../../features/metaAds/metaAdsApi";
import type {
  MetaAdsReportItem,
  MetaAdsReportStatus,
  MetaAdsReportType,
} from "../../features/metaAds/metaAdsTypes";
import { useGetProjectsQuery, useGetProjectWorkspaceMessagesQuery } from "../../features/projects/projectsApi";
import { extractApiErrorMessage } from "../../features/projects/projectsUtils";
import { useCreateTaskMutation, useGetTasksQuery, useToggleTaskTodoMutation, useUpdateTaskMutation } from "../../features/tasks/tasksApi";
import type { CreateTaskRequest, Task, TaskTodo } from "../../features/tasks/tasksTypes";
import { useCreateProjectWorkspaceMessageMutation } from "../../features/projects/projectsApi";
import { useAppSelector } from "../../store/hooks";

type WorkspaceMode = "social" | "performance" | "designer";

export type MetaAdsWorkspaceView =
  | "overview"
  | "campaigns"
  | "performance"
  | "creatives"
  | "reports"
  | "approvals"
  | "pixel";

type MetaAdsWorkspaceProps = {
  initialView?: MetaAdsWorkspaceView;
};

type ReportDraftFormState = {
  periodStart: string;
  periodEnd: string;
  type: MetaAdsReportType;
  summary: string;
  publishNow: boolean;
  requestAcknowledgement: boolean;
};

const ASSIGNED_CLIENTS_QUERY: ClientsListQuery = {
  status: "ACTIVE",
  limit: 100,
  sortBy: "name",
  sortOrder: "asc",
};

const VIEW_LABELS: Record<MetaAdsWorkspaceView, string> = {
  overview: "Özet",
  campaigns: "Kampanyalar",
  performance: "Performans",
  creatives: "Kreatifler",
  reports: "Raporlar",
  approvals: "Onaylar",
  pixel: "Pixel",
};

const ROLE_VIEWS: Record<WorkspaceMode, readonly MetaAdsWorkspaceView[]> = {
  social: ["overview", "campaigns", "reports", "approvals"],
  performance: ["overview", "campaigns", "performance", "reports", "approvals", "pixel"],
  designer: ["overview", "creatives", "approvals", "reports"],
};

const ROLE_LABELS: Record<WorkspaceMode, string> = {
  social: "Social Media Specialist",
  performance: "Performance Specialist",
  designer: "Designer",
};

const ROLE_DEFAULT_VIEW: Record<WorkspaceMode, MetaAdsWorkspaceView> = {
  social: "campaigns",
  performance: "performance",
  designer: "creatives",
};

const ROLE_APPROVAL_TYPE: Record<WorkspaceMode, CreateTaskRequest["approvalType"]> = {
  social: "META_ADS_CAMPAIGN_APPROVAL",
  performance: "META_ADS_BUDGET_CHANGE_APPROVAL",
  designer: "META_ADS_CREATIVE_APPROVAL",
};

const REPORT_TYPE_OPTIONS: Array<{ value: MetaAdsReportType; label: string }> = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "CAMPAIGN_PERFORMANCE", label: "Campaign" },
  { value: "CREATIVE_PERFORMANCE", label: "Creative" },
  { value: "BUDGET_RECOMMENDATION", label: "Budget" },
];

const INITIAL_REPORT_FORM: ReportDraftFormState = {
  periodStart: "",
  periodEnd: "",
  type: "WEEKLY",
  summary: "",
  publishNow: false,
  requestAcknowledgement: false,
};

export function MetaAdsWorkspace({ initialView = "overview" }: MetaAdsWorkspaceProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const workspaceMode = resolveWorkspaceMode(currentUser?.role);
  const canReadAssignedClients = hasUserPermission(currentUser, ["clients.read.assigned"]);
  const canReadMetaAds = hasUserPermission(currentUser, ["metaAds.config.read.assigned"]);
  const canReadMetaAdsReports = hasUserPermission(currentUser, [
    "metaAds.reporting.read.assigned",
    "reports.read",
  ]);
  const canManageMetaAdsNotes = hasUserPermission(currentUser, ["metaAds.notes.manage.assigned"]);
  const canCreateMetaAdsApprovals = hasUserPermission(currentUser, ["metaAds.approvals.create.assigned"]);
  const canManageMetaAdsCreatives = hasUserPermission(currentUser, ["metaAds.creatives.manage.assigned"]);
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

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [activeView, setActiveView] = useState<MetaAdsWorkspaceView>(initialView);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [reportForm, setReportForm] = useState<ReportDraftFormState>(INITIAL_REPORT_FORM);
  const [reportStatusFilter, setReportStatusFilter] = useState<MetaAdsReportStatus | "ALL">("ALL");
  const [reportTypeFilter, setReportTypeFilter] = useState<MetaAdsReportType | "ALL">("ALL");
  const [reportPublishAckToggle, setReportPublishAckToggle] = useState(false);
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

  const metaAdsClients = useMemo(
    () => filterMetaAdsClients(clientsResponse?.data ?? []),
    [clientsResponse?.data],
  );

  useEffect(() => {
    if (metaAdsClients.length === 0) {
      if (selectedClientId.length > 0) {
        setSelectedClientId("");
      }
      return;
    }

    if (selectedClientId.length === 0) {
      setSelectedClientId(metaAdsClients[0].id);
      return;
    }

    if (!metaAdsClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(metaAdsClients[0].id);
    }
  }, [metaAdsClients, selectedClientId]);

  const selectedClient = useMemo(
    () => metaAdsClients.find((client) => client.id === selectedClientId) ?? null,
    [metaAdsClients, selectedClientId],
  );

  const shouldSkipMetaAdsQueries = !canReadMetaAds || selectedClientId.length === 0;
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } =
    useGetAssignedClientMetaAdsSummaryQuery(
      { clientId: selectedClientId },
      { skip: shouldSkipMetaAdsQueries },
    );
  const { data: campaigns, isLoading: isCampaignsLoading, isError: isCampaignsError } =
    useGetAssignedClientMetaAdsCampaignsQuery(
      { clientId: selectedClientId, query: { limit: 8 } },
      { skip: shouldSkipMetaAdsQueries },
    );
  const { data: adSets, isLoading: isAdSetsLoading, isError: isAdSetsError } =
    useGetAssignedClientMetaAdsAdSetsQuery(
      { clientId: selectedClientId, query: { limit: 6 } },
      { skip: shouldSkipMetaAdsQueries },
    );
  const { data: pixelStatus, isLoading: isPixelLoading, isError: isPixelError } =
    useGetAssignedClientMetaAdsPixelStatusQuery(
      { clientId: selectedClientId },
      { skip: shouldSkipMetaAdsQueries },
    );
  const reportQuery = useMemo(
    () => ({
      ...(reportStatusFilter !== "ALL" ? { status: reportStatusFilter } : {}),
      ...(reportTypeFilter !== "ALL" ? { type: reportTypeFilter } : {}),
      limit: 40,
    }),
    [reportStatusFilter, reportTypeFilter],
  );
  const { data: reportsResponse, isLoading: isReportsLoading, isError: isReportsError } =
    useGetAssignedClientMetaAdsReportsQuery(
      { clientId: selectedClientId, query: reportQuery },
      { skip: shouldSkipMetaAdsQueries || !canReadMetaAdsReports },
    );

  const { data: projectsResponse } = useGetProjectsQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 },
  );
  const metaAdsProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((project) => project.serviceKey === "meta-ads"),
    [projectsResponse?.data],
  );
  const metaAdsProjectId = metaAdsProjects[0]?.id ?? null;

  const { data: tasksResponse } = useGetTasksQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 || !canReadTasks },
  );
  const metaAdsProjectIds = useMemo(
    () => new Set(metaAdsProjects.map((project) => project.id)),
    [metaAdsProjects],
  );
  const metaAdsTasks = useMemo(
    () => (tasksResponse?.data ?? []).filter((task) => metaAdsProjectIds.has(task.projectId)),
    [tasksResponse?.data, metaAdsProjectIds],
  );
  const approvalTasks = useMemo(
    () =>
      metaAdsTasks.filter(
        (task) => task.approvalRequired || task.status === "REVIEW" || task.type === "REVISION",
      ),
    [metaAdsTasks],
  );

  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    {
      projectId: metaAdsProjectId ?? "",
      tabKey: "MESSAGES",
    },
    {
      skip: !canInteractWorkspace || !metaAdsProjectId,
    },
  );

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [createMetaAdsReport, { isLoading: isCreatingReport }] = useCreateAssignedClientMetaAdsReportMutation();
  const [updateMetaAdsReport, { isLoading: isUpdatingReport }] = useUpdateAssignedMetaAdsReportMutation();
  const [createWorkspaceMessage, { isLoading: isCreatingMessage }] =
    useCreateProjectWorkspaceMessageMutation();

  if (!workspaceMode) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu rol için Meta Ads employee workspace tanımlı değil.
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

  if (!canReadMetaAds) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Meta Ads raporlarını görüntülemek için `metaAds.config.read.assigned` izni gereklidir.
      </Card>
    );
  }

  const allowedViews = ROLE_VIEWS[workspaceMode];
  const currentView = allowedViews.includes(activeView)
    ? activeView
    : ROLE_DEFAULT_VIEW[workspaceMode];

  const hasMetaAdsProject = Boolean(metaAdsProjectId);
  const reportRows = reportsResponse?.data ?? [];
  const reportMeta = reportsResponse?.meta;
  const isActionBusy =
    isCreatingTask ||
    isUpdatingTask ||
    isTogglingTodo ||
    isCreatingMessage ||
    isCreatingReport ||
    isUpdatingReport;

  async function handleCreateRoleTask(action: "creative" | "optimization" | "report" | "approval") {
    if (!metaAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Bu müşteri için `serviceKey=META_ADS` proje bulunamadı.",
      });
      return;
    }

    if (!canCreateTask) {
      setFeedback({
        type: "error",
        text: "Görev oluşturma yetkiniz yok. `tasks.manage.assigned` izni gereklidir.",
      });
      return;
    }

    if (action === "approval" && !canCreateMetaAdsApprovals) {
      setFeedback({
        type: "error",
        text: "Approval talebi oluşturmak için `metaAds.approvals.create.assigned` izni gereklidir.",
      });
      return;
    }

    const fallbackTitleByAction: Record<typeof action, string> = {
      creative: "Kreatif / Copy Görevi",
      optimization: "Optimizasyon Notu",
      report: "Meta Ads Rapor Hazırlığı",
      approval: "Meta Ads Onay Talebi",
    };
    const approvalType = workspaceMode ? ROLE_APPROVAL_TYPE[workspaceMode] : "META_ADS_CAMPAIGN_APPROVAL";

    const taskBody: CreateTaskRequest = {
      projectId: metaAdsProjectId,
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
        text: "Meta Ads workspace üzerinden görev oluşturuldu.",
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
    if (!metaAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Meta Ads notu için proje bulunamadı.",
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
        projectId: metaAdsProjectId,
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
    if (!metaAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Meta Ads müşteri mesajı için proje bulunamadı.",
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
        projectId: metaAdsProjectId,
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

  function toReportPeriodStartIso(value: string): string {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }

  function toReportPeriodEndIso(value: string): string {
    return new Date(`${value}T23:59:59.999Z`).toISOString();
  }

  async function handleCreateReportDraft() {
    if (!canManageMetaAdsNotes) {
      setFeedback({
        type: "error",
        text: "Rapor taslağı için `metaAds.notes.manage.assigned` izni gereklidir.",
      });
      return;
    }

    if (!metaAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Rapor taslağı için META_ADS proje bulunamadı.",
      });
      return;
    }

    if (!reportForm.periodStart || !reportForm.periodEnd) {
      setFeedback({
        type: "error",
        text: "Rapor başlangıç/bitiş tarihleri zorunludur.",
      });
      return;
    }

    if (reportForm.periodStart > reportForm.periodEnd) {
      setFeedback({
        type: "error",
        text: "Başlangıç tarihi bitiş tarihinden büyük olamaz.",
      });
      return;
    }

    if (reportForm.requestAcknowledgement && !canCreateMetaAdsApprovals) {
      setFeedback({
        type: "error",
        text: "Ack request için `metaAds.approvals.create.assigned` izni gereklidir.",
      });
      return;
    }

    setFeedback(null);
    setActiveAction("create-report");
    try {
      await createMetaAdsReport({
        clientId: selectedClientId,
        body: {
          projectId: metaAdsProjectId,
          periodStart: toReportPeriodStartIso(reportForm.periodStart),
          periodEnd: toReportPeriodEndIso(reportForm.periodEnd),
          type: reportForm.type,
          summary: reportForm.summary.trim().length > 0 ? reportForm.summary.trim() : undefined,
          clientVisible: reportForm.publishNow || undefined,
          requestAcknowledgement: reportForm.requestAcknowledgement || undefined,
        },
      }).unwrap();
      setReportForm(INITIAL_REPORT_FORM);
      setFeedback({
        type: "success",
        text: "Meta Ads rapor taslağı kaydedildi.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Meta Ads raporu kaydedilemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handlePublishReport(reportId: string) {
    if (!canManageMetaAdsNotes) {
      setFeedback({
        type: "error",
        text: "Rapor yayınlamak için `metaAds.notes.manage.assigned` izni gereklidir.",
      });
      return;
    }

    if (reportPublishAckToggle && !canCreateMetaAdsApprovals) {
      setFeedback({
        type: "error",
        text: "Ack request için `metaAds.approvals.create.assigned` izni gereklidir.",
      });
      return;
    }

    setFeedback(null);
    setActiveAction(`publish-${reportId}`);
    try {
      await updateMetaAdsReport({
        reportId,
        body: {
          status: "PUBLISHED",
          clientVisible: true,
          requestAcknowledgement: reportPublishAckToggle || undefined,
        },
      }).unwrap();
      setFeedback({
        type: "success",
        text: "Rapor client görünürlüğüne açıldı.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Rapor yayınlanamadı."),
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
          <h1 className="mb-1 text-2xl font-semibold">Meta Ads Workspace</h1>
          <p className="text-sm text-[#A0A0A0]">
            {ROLE_LABELS[workspaceMode]} için assigned Meta Ads operasyon ekranı
          </p>
        </div>
        <Badge variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
          {ROLE_LABELS[workspaceMode]}
        </Badge>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 grow">
            <Label htmlFor="meta-ads-client">Meta Ads Müşterilerim</Label>
            <select
              id="meta-ads-client"
              className="mt-2 h-10 w-full rounded-md border border-white/[0.12] bg-[#131313] px-3 text-sm text-white"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
              disabled={isClientsLoading || metaAdsClients.length === 0}
            >
              {metaAdsClients.length === 0 ? (
                <option value="">Meta Ads müşteri bulunamadı</option>
              ) : (
                metaAdsClients.map((client) => (
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

      {!isClientsLoading && !isClientsError && metaAdsClients.length === 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          Assigned scope içinde `ACTIVE META_ADS` servisi olan müşteri bulunmuyor.
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
              label="CTR"
              value={summary ? `${summary.ctr.toFixed(2)}%` : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="Sonuç"
              value={summary ? String(summary.results) : "—"}
              loading={isSummaryLoading}
            />
            <MetricCard
              label="ROAS"
              value={summary?.roas !== null && summary?.roas !== undefined ? `${summary.roas.toFixed(2)}x` : "—"}
              loading={isSummaryLoading}
            />
          </div>

          {(isSummaryError || isCampaignsError || isAdSetsError || isPixelError) ? (
            <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Meta Ads raporlarından biri okunamadı. Assigned scope ve bağlantı durumunu kontrol edin.
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
                adSetInsights={adSets?.data ?? []}
                tasks={metaAdsTasks}
                isLoading={isAdSetsLoading}
                canUpdateTask={canUpdateTask}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onAdvanceTaskStatus={(task) => void handleAdvanceTaskStatus(task)}
              />
            ) : null}

            {currentView === "creatives" ? (
              <CreativeSection
                canManageFiles={canManageFiles && canManageMetaAdsCreatives}
                canCreateTask={canCreateTask}
                hasMetaAdsProject={hasMetaAdsProject}
                tasks={metaAdsTasks}
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
                canReadMetaAdsReports={canReadMetaAdsReports}
                canManageMetaAdsNotes={canManageMetaAdsNotes}
                canCreateMetaAdsApprovals={canCreateMetaAdsApprovals}
                reportRows={reportRows}
                reportMeta={reportMeta}
                reportForm={reportForm}
                setReportForm={setReportForm}
                reportStatusFilter={reportStatusFilter}
                setReportStatusFilter={setReportStatusFilter}
                reportTypeFilter={reportTypeFilter}
                setReportTypeFilter={setReportTypeFilter}
                reportPublishAckToggle={reportPublishAckToggle}
                setReportPublishAckToggle={setReportPublishAckToggle}
                isReportsLoading={isReportsLoading}
                isReportsError={isReportsError}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onCreateInternalNote={() => void handleCreateInternalNote()}
                onCreateReportDraft={() => void handleCreateReportDraft()}
                onPublishReport={(reportId) => void handlePublishReport(reportId)}
              />
            ) : null}

            {currentView === "approvals" ? (
              <ApprovalsSection
                approvalTasks={approvalTasks}
                canCreateTask={canCreateTask && canCreateMetaAdsApprovals}
                canUpdateTask={canUpdateTask}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onCreateApprovalRequest={() => void handleCreateRoleTask("approval")}
                onAdvanceTaskStatus={(task) => void handleAdvanceTaskStatus(task)}
              />
            ) : null}

            {currentView === "pixel" ? (
              <PixelSection
                pixelStatus={pixelStatus}
                isLoading={isPixelLoading}
              />
            ) : null}
          </Card>

          {(workspaceMode === "social" || currentView === "overview") ? (
            <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Social Media Aksiyonları</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="meta-ads-task-title">Creative / Copy Task</Label>
                  <Input
                    id="meta-ads-task-title"
                    placeholder="Örn: Yeni kreatif copy testi"
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
                      disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}
                    >
                      Task Oluştur
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCreateRoleTask("report")}
                      disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}
                    >
                      Rapor Task'ı Aç
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="meta-ads-client-reply">Müşteri Mesajı Cevapla</Label>
                  <Textarea
                    id="meta-ads-client-reply"
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
                    disabled={!canInteractWorkspace || !hasMetaAdsProject || isActionBusy}
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
                  <Label htmlFor="meta-ads-note">Optimization Note</Label>
                  <Textarea
                    id="meta-ads-note"
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
                      disabled={!canInteractWorkspace || !hasMetaAdsProject || isActionBusy}
                    >
                      Note Ekle
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCreateRoleTask("optimization")}
                      disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}
                    >
                      Optimization Task Aç
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Budget / Campaign Change Approval</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void handleCreateRoleTask("approval")}
                    disabled={!canCreateTask || !canCreateMetaAdsApprovals || !hasMetaAdsProject || isActionBusy}
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
                  disabled={!canManageFiles || !canManageMetaAdsCreatives}
                >
                  <Link to="/employee/dosyalar">
                    <Upload className="h-4 w-4" />
                    Kreatif Asset Yükle
                  </Link>
                </Button>
                <Button
                  asChild
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!canManageFiles || !canManageMetaAdsCreatives}
                >
                  <Link to="/employee/teslim-dosyalari">Client Visible Paylaş</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCreateRoleTask("approval")}
                  disabled={!canCreateTask || !canCreateMetaAdsApprovals || !hasMetaAdsProject || isActionBusy}
                >
                  Design Approval Task
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {metaAdsTasks
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
                {metaAdsTasks.length === 0 ? (
                  <p className="text-xs text-[#A0A0A0]">
                    Todo güncellemek için ilgili Meta Ads task kaydı bulunmuyor.
                  </p>
                ) : null}
              </div>
            </Card>
          ) : null}
        </>
      ) : null}

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4 text-xs text-[#A0A0A0]">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4" />
          <p>
            Workspace sadece assigned client + ACTIVE META_ADS service + `serviceKey=META_ADS` project
            verisini kullanır. Permission bulunmayan aksiyonlar disabled durumda gösterilir.
          </p>
        </div>
      </Card>
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
  campaigns: Array<{
    id: string;
    name: string;
    objective: string;
    spend: number;
    ctr: number;
    roas: number | null;
  }>;
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
            <Megaphone className="h-4 w-4 text-[#AAFF01]" />
            <p className="text-sm font-medium text-white">{campaign.name}</p>
            <Badge variant="outline">{campaign.objective}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-[#D8D8D8] md:grid-cols-3">
            <span>Spend: {formatCurrency(campaign.spend)}</span>
            <span>CTR: %{campaign.ctr.toFixed(2)}</span>
            <span>ROAS: {campaign.roas !== null ? `${campaign.roas.toFixed(2)}x` : "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformanceSection({
  adSetInsights,
  tasks,
  isLoading,
  canUpdateTask,
  isActionBusy,
  activeAction,
  onAdvanceTaskStatus,
}: {
  adSetInsights: Array<{
    id: string;
    entityName: string | null;
    spend: number;
    cpm: number;
    ctr: number;
    costPerResult: number;
  }>;
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
      {isLoading ? <p className="text-sm text-[#A0A0A0]">Ad set içgörüleri yükleniyor...</p> : null}
      {!isLoading && adSetInsights.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Ad set içgörüsü bulunamadı.</p>
      ) : null}
      {adSetInsights.slice(0, 4).map((insight) => (
        <div key={insight.id} className="rounded border border-white/[0.08] bg-white/5 p-3 text-sm">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#AAFF01]" />
            <span>{insight.entityName ?? "Ad Set"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#D8D8D8] md:grid-cols-4">
            <span>Spend: {formatCurrency(insight.spend)}</span>
            <span>CPM: {insight.cpm.toFixed(2)}</span>
            <span>CTR: %{insight.ctr.toFixed(2)}</span>
            <span>CPA: {insight.costPerResult.toFixed(2)}</span>
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

function CreativeSection({
  canManageFiles,
  canCreateTask,
  hasMetaAdsProject,
  tasks,
  isActionBusy,
  activeAction,
  onCreateCreativeTask,
}: {
  canManageFiles: boolean;
  canCreateTask: boolean;
  hasMetaAdsProject: boolean;
  tasks: Task[];
  isActionBusy: boolean;
  activeAction: string | null;
  onCreateCreativeTask: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Creative Requests & Assets</h3>
      <p className="text-xs text-[#A0A0A0]">
        Designer alanı kreatif task + dosya upload/share aksiyonlarıyla çalışır.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          type="button"
          size="sm"
          className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          disabled={!canManageFiles}
        >
          <Link to="/employee/dosyalar">Kreatif Dosyası Yükle</Link>
        </Button>
        <Button
          asChild
          type="button"
          size="sm"
          variant="outline"
          disabled={!canManageFiles}
        >
          <Link to="/employee/teslim-dosyalari">Client-visible Share</Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCreateCreativeTask}
          disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}
        >
          {activeAction === "creative" ? "Oluşturuluyor..." : "Creative Task Aç"}
        </Button>
      </div>
      <p className="text-xs text-[#A0A0A0]">Meta Ads task sayısı: {tasks.length}</p>
    </div>
  );
}

function ReportsSection({
  summaryDateLabel,
  noteBody,
  setNoteBody,
  canInteractWorkspace,
  canReadMetaAdsReports,
  canManageMetaAdsNotes,
  canCreateMetaAdsApprovals,
  reportRows,
  reportMeta,
  reportForm,
  setReportForm,
  reportStatusFilter,
  setReportStatusFilter,
  reportTypeFilter,
  setReportTypeFilter,
  reportPublishAckToggle,
  setReportPublishAckToggle,
  isReportsLoading,
  isReportsError,
  isActionBusy,
  activeAction,
  onCreateInternalNote,
  onCreateReportDraft,
  onPublishReport,
}: {
  summaryDateLabel: string;
  noteBody: string;
  setNoteBody: (value: string) => void;
  canInteractWorkspace: boolean;
  canReadMetaAdsReports: boolean;
  canManageMetaAdsNotes: boolean;
  canCreateMetaAdsApprovals: boolean;
  reportRows: MetaAdsReportItem[];
  reportMeta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  } | undefined;
  reportForm: ReportDraftFormState;
  setReportForm: (updater: (prev: ReportDraftFormState) => ReportDraftFormState) => void;
  reportStatusFilter: MetaAdsReportStatus | "ALL";
  setReportStatusFilter: (value: MetaAdsReportStatus | "ALL") => void;
  reportTypeFilter: MetaAdsReportType | "ALL";
  setReportTypeFilter: (value: MetaAdsReportType | "ALL") => void;
  reportPublishAckToggle: boolean;
  setReportPublishAckToggle: (value: boolean) => void;
  isReportsLoading: boolean;
  isReportsError: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  onCreateInternalNote: () => void;
  onCreateReportDraft: () => void;
  onPublishReport: (reportId: string) => void;
}) {
  const canDraftReport = canManageMetaAdsNotes;
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Raporlar & Ajans Notları</h3>
      <p className="text-xs text-[#A0A0A0]">Rapor aralığı: {summaryDateLabel}</p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="meta-ads-employee-report-status">Status</Label>
          <select
            id="meta-ads-employee-report-status"
            className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
            value={reportStatusFilter}
            onChange={(event) => setReportStatusFilter(event.target.value as MetaAdsReportStatus | "ALL")}
          >
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta-ads-employee-report-type">Tip</Label>
          <select
            id="meta-ads-employee-report-type"
            className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
            value={reportTypeFilter}
            onChange={(event) => setReportTypeFilter(event.target.value as MetaAdsReportType | "ALL")}
          >
            <option value="ALL">All</option>
            {REPORT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-end gap-2 text-sm text-[#DADADA]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#AAFF01]"
            checked={reportPublishAckToggle}
            onChange={(event) => setReportPublishAckToggle(event.target.checked)}
          />
          Yayında ack iste
        </label>
        <div className="flex items-end text-xs text-[#A0A0A0]">
          {reportMeta
            ? `Toplam: ${reportMeta.total} · Draft: ${reportMeta.draft} · Published: ${reportMeta.published}`
            : "Rapor istatistiği yok"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/[0.08] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="meta-ads-employee-period-start">Dönem Başlangıç</Label>
            <Input
              id="meta-ads-employee-period-start"
              type="date"
              value={reportForm.periodStart}
              onChange={(event) =>
                setReportForm((prev) => ({
                  ...prev,
                  periodStart: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-ads-employee-period-end">Dönem Bitiş</Label>
            <Input
              id="meta-ads-employee-period-end"
              type="date"
              value={reportForm.periodEnd}
              onChange={(event) =>
                setReportForm((prev) => ({
                  ...prev,
                  periodEnd: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-ads-employee-report-draft-type">Rapor Tipi</Label>
            <select
              id="meta-ads-employee-report-draft-type"
              className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
              value={reportForm.type}
              onChange={(event) =>
                setReportForm((prev) => ({
                  ...prev,
                  type: event.target.value as MetaAdsReportType,
                }))
              }
            >
              {REPORT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3 text-sm text-[#DADADA]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#AAFF01]"
                checked={reportForm.publishNow}
                onChange={(event) =>
                  setReportForm((prev) => ({
                    ...prev,
                    publishNow: event.target.checked,
                  }))
                }
              />
              Hemen yayınla
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#AAFF01]"
                checked={reportForm.requestAcknowledgement}
                onChange={(event) =>
                  setReportForm((prev) => ({
                    ...prev,
                    requestAcknowledgement: event.target.checked,
                  }))
                }
              />
              Ack iste
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta-ads-employee-report-summary">Rapor Özeti</Label>
          <Input
            id="meta-ads-employee-report-summary"
            value={reportForm.summary}
            onChange={(event) =>
              setReportForm((prev) => ({
                ...prev,
                summary: event.target.value,
              }))
            }
            placeholder="Örn: Haftalık performans özeti"
          />
        </div>
        <div>
          <Button
            type="button"
            size="sm"
            className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
            onClick={onCreateReportDraft}
            disabled={!canDraftReport || isActionBusy}
          >
            {activeAction === "create-report" ? "Kaydediliyor..." : "Rapor Draft Kaydet"}
          </Button>
        </div>
      </div>

      {!canReadMetaAdsReports ? (
        <p className="text-xs text-orange-300">
          Report listesi için `metaAds.reporting.read.assigned` izni gereklidir.
        </p>
      ) : null}
      {isReportsLoading ? <p className="text-xs text-[#A0A0A0]">Rapor listesi yükleniyor...</p> : null}
      {isReportsError ? <p className="text-xs text-red-300">Rapor listesi alınamadı.</p> : null}
      {!isReportsLoading && !isReportsError && reportRows.length === 0 ? (
        <p className="text-xs text-[#A0A0A0]">Seçili filtre için rapor bulunamadı.</p>
      ) : null}

      {!isReportsLoading && !isReportsError && reportRows.length > 0 ? (
        <div className="space-y-2">
          {reportRows.map((report) => (
            <div key={report.id} className="rounded border border-white/[0.08] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-white">
                    {report.type} · {report.periodStart.slice(0, 10)} - {report.periodEnd.slice(0, 10)}
                  </p>
                  <p className="text-xs text-[#A0A0A0]">
                    Status: {report.status} · Ack: {report.acknowledgementStatus}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onPublishReport(report.id)}
                  disabled={
                    report.status === "PUBLISHED" ||
                    !canManageMetaAdsNotes ||
                    (reportPublishAckToggle && !canCreateMetaAdsApprovals) ||
                    isActionBusy
                  }
                >
                  {activeAction === `publish-${report.id}` ? "Yayınlanıyor..." : "Publish"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-[#DADADA]">{report.summary ?? "Özet yok."}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Textarea
        placeholder="Kampanya değerlendirme notu..."
        value={noteBody}
        onChange={(event) => setNoteBody(event.target.value)}
      />
      <Button
        type="button"
        size="sm"
        className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
        onClick={onCreateInternalNote}
        disabled={!canInteractWorkspace || isActionBusy}
      >
        {activeAction === "note" ? "Gönderiliyor..." : "Ajans Notu Ekle"}
      </Button>
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
                <p className="text-xs text-[#A0A0A0]">
                  {task.approvalType.replace("META_ADS_", "").replace(/_/g, " ")}
                </p>
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
  pixelStatus,
  isLoading,
}: {
  pixelStatus:
    | {
        connectionStatus: string;
        adAccountId: string | null;
        pixelId: string | null;
        lastInsightAt: string | null;
        eventStatus: string;
        setupWarning: string | null;
        syncError: string | null;
      }
    | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-[#A0A0A0]">Pixel durumu yükleniyor...</p>;
  }

  if (!pixelStatus) {
    return <p className="text-sm text-[#A0A0A0]">Pixel durumu bulunamadı.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Connection: {pixelStatus.connectionStatus}</Badge>
        <Badge variant="outline">Event: {pixelStatus.eventStatus}</Badge>
      </div>
      <p className="text-[#D8D8D8]">Ad Account: {pixelStatus.adAccountId ?? "—"}</p>
      <p className="text-[#D8D8D8]">Pixel ID: {pixelStatus.pixelId ?? "—"}</p>
      <p className="text-[#D8D8D8]">Last Insight: {pixelStatus.lastInsightAt ?? "—"}</p>
      {pixelStatus.setupWarning ? (
        <p className="text-orange-300">Setup warning: {pixelStatus.setupWarning}</p>
      ) : null}
      {pixelStatus.syncError ? (
        <p className="text-red-300">Sync error: {pixelStatus.syncError}</p>
      ) : null}
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

function filterMetaAdsClients(clients: ClientProfile[]): ClientProfile[] {
  return clients.filter((client) =>
    (client.purchasedServices ?? []).some(
      (service) => service.serviceKey === "meta-ads" && service.status === "ACTIVE",
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}
