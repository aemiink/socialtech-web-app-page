import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Users,
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
import {
  useCreateAssignedClientMetaAdsReportMutation,
  useGetAssignedClientMetaAdsAdCreativesQuery,
  useGetAssignedClientMetaAdsAdSetsQuery,
  useGetAssignedClientMetaAdsAdsQuery,
  useGetAssignedClientMetaAdsAiCommentaryQuery,
  useGetAssignedClientMetaAdsAudiencesQuery,
  useGetAssignedClientMetaAdsCampaignsQuery,
  useGetAssignedClientMetaAdsPixelStatusQuery,
  useGetAssignedClientMetaAdsPixelStatsQuery,
  useGetAssignedClientMetaAdsReportsQuery,
  useGetAssignedClientMetaAdsSummaryQuery,
  useUpdateAssignedMetaAdsReportMutation,
} from "../../features/metaAds/metaAdsApi";
import type {
  MetaAdsAdCreative,
  MetaAdsAdSetAudience,
  MetaAdsAiCommentary,
  MetaAdsInsightItem,
  MetaAdsPixelChecklistItem,
  MetaAdsPixelStatsResponse,
  MetaAdsReportItem,
  MetaAdsReportStatus,
  MetaAdsReportType,
} from "../../features/metaAds/metaAdsTypes";
import {
  useGetProjectsQuery,
  useGetProjectWorkspaceMessagesQuery,
  useCreateProjectWorkspaceMessageMutation,
} from "../../features/projects/projectsApi";
import { extractApiErrorMessage } from "../../features/projects/projectsUtils";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useToggleTaskTodoMutation,
  useUpdateTaskMutation,
} from "../../features/tasks/tasksApi";
import type { CreateTaskRequest, Task, TaskTodo } from "../../features/tasks/tasksTypes";
import { useAppSelector } from "../../store/hooks";

type WorkspaceMode = "social" | "performance" | "designer";

export type MetaAdsWorkspaceView =
  | "overview"
  | "campaigns"
  | "performance"
  | "kitleler"
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
  overview: "Genel Bakış",
  campaigns: "Kampanyalar",
  performance: "Performans",
  kitleler: "Kitleler",
  creatives: "Kreatifler",
  reports: "Raporlar",
  approvals: "Onaylar",
  pixel: "Pixel",
};

const VIEW_DESCRIPTIONS: Record<MetaAdsWorkspaceView, string> = {
  overview: "Harcama, CTR, sonuç ve ROAS özeti",
  campaigns: "Kampanya listesi, bütçe ve performans özeti",
  performance: "Reklam seti analizi ve optimizasyon notları",
  kitleler: "Hedef kitle tanımları, yaş/cinsiyet/ilgi alanları",
  creatives: "Kreatif önizleme, hook skoru ve CTR karşılaştırması",
  reports: "Rapor oluşturma, geçmiş ve ajans notları",
  approvals: "Onay talepleri ve durum takibi",
  pixel: "Meta Pixel bağlantısı ve olay durumu",
};

const ROLE_VIEWS: Record<WorkspaceMode, readonly MetaAdsWorkspaceView[]> = {
  social: ["overview", "campaigns", "reports", "approvals"],
  performance: ["overview", "campaigns", "performance", "kitleler", "reports", "approvals", "pixel"],
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

const ADSET_NOTE_PREFIX = "[adset-note:";

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
      if (selectedClientId.length > 0) setSelectedClientId("");
      return;
    }
    if (selectedClientId.length === 0) {
      setSelectedClientId(metaAdsClients[0].id);
      return;
    }
    if (!metaAdsClients.some((c) => c.id === selectedClientId)) {
      setSelectedClientId(metaAdsClients[0].id);
    }
  }, [metaAdsClients, selectedClientId]);

  const selectedClient = useMemo(
    () => metaAdsClients.find((c) => c.id === selectedClientId) ?? null,
    [metaAdsClients, selectedClientId],
  );

  const skip = !canReadMetaAds || selectedClientId.length === 0;

  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } =
    useGetAssignedClientMetaAdsSummaryQuery({ clientId: selectedClientId }, { skip });

  const { data: campaigns, isLoading: isCampaignsLoading } =
    useGetAssignedClientMetaAdsCampaignsQuery(
      { clientId: selectedClientId, query: { limit: 20 } },
      { skip },
    );

  const { data: adSets, isLoading: isAdSetsLoading } =
    useGetAssignedClientMetaAdsAdSetsQuery(
      { clientId: selectedClientId, query: { limit: 20 } },
      { skip },
    );

  const { data: adInsights, isLoading: isAdInsightsLoading } =
    useGetAssignedClientMetaAdsAdsQuery(
      { clientId: selectedClientId, query: { limit: 100 } },
      { skip },
    );

  const { data: pixelStatus, isLoading: isPixelLoading } =
    useGetAssignedClientMetaAdsPixelStatusQuery({ clientId: selectedClientId }, { skip });

  const { data: adCreatives, isLoading: isCreativesLoading, isError: isCreativesError, refetch: refetchCreatives } =
    useGetAssignedClientMetaAdsAdCreativesQuery({ clientId: selectedClientId }, { skip });

  const { data: audiences, isLoading: isAudiencesLoading, isError: isAudiencesError, refetch: refetchAudiences } =
    useGetAssignedClientMetaAdsAudiencesQuery({ clientId: selectedClientId }, { skip });

  const { data: aiCommentary, isLoading: isAiCommentaryLoading } =
    useGetAssignedClientMetaAdsAiCommentaryQuery({ clientId: selectedClientId }, { skip });

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
      { skip: skip || !canReadMetaAdsReports },
    );

  const { data: projectsResponse } = useGetProjectsQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 },
  );
  const metaAdsProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((p) => p.serviceKey === "meta-ads"),
    [projectsResponse?.data],
  );
  const metaAdsProjectId = metaAdsProjects[0]?.id ?? null;

  const { data: tasksResponse } = useGetTasksQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 || !canReadTasks },
  );
  const metaAdsProjectIds = useMemo(() => new Set(metaAdsProjects.map((p) => p.id)), [metaAdsProjects]);
  const metaAdsTasks = useMemo(
    () => (tasksResponse?.data ?? []).filter((t) => metaAdsProjectIds.has(t.projectId)),
    [tasksResponse?.data, metaAdsProjectIds],
  );
  const approvalTasks = useMemo(
    () => metaAdsTasks.filter((t) => t.approvalRequired || t.status === "REVIEW" || t.type === "REVISION"),
    [metaAdsTasks],
  );

  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    { projectId: metaAdsProjectId ?? "", tabKey: "MESSAGES" },
    { skip: !canInteractWorkspace || !metaAdsProjectId },
  );

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [createMetaAdsReport, { isLoading: isCreatingReport }] = useCreateAssignedClientMetaAdsReportMutation();
  const [updateMetaAdsReport, { isLoading: isUpdatingReport }] = useUpdateAssignedMetaAdsReportMutation();
  const [createWorkspaceMessage, { isLoading: isCreatingMessage }] = useCreateProjectWorkspaceMessageMutation();

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

  const allowedViews = ROLE_VIEWS[workspaceMode];
  const currentView = allowedViews.includes(activeView) ? activeView : ROLE_DEFAULT_VIEW[workspaceMode];

  const hasMetaAdsProject = Boolean(metaAdsProjectId);
  const reportRows = reportsResponse?.data ?? [];
  const reportMeta = reportsResponse?.meta;
  const isActionBusy =
    isCreatingTask || isUpdatingTask || isTogglingTodo ||
    isCreatingMessage || isCreatingReport || isUpdatingReport;

  async function handleCreateRoleTask(action: "creative" | "optimization" | "report" | "approval") {
    if (!metaAdsProjectId) {
      setFeedback({ type: "error", text: "Bu müşteri için META_ADS proje bulunamadı." });
      return;
    }
    if (!canCreateTask) {
      setFeedback({ type: "error", text: "Görev oluşturma yetkiniz yok." });
      return;
    }
    const fallbackTitle: Record<typeof action, string> = {
      creative: "Kreatif / Copy Görevi",
      optimization: "Optimizasyon Notu",
      report: "Meta Ads Rapor Hazırlığı",
      approval: "Meta Ads Onay Talebi",
    };
    const taskBody: CreateTaskRequest = {
      projectId: metaAdsProjectId,
      title: taskTitle.trim().length > 0 ? taskTitle.trim() : fallbackTitle[action],
      description: taskDescription.trim().length > 0 ? taskDescription.trim() : null,
      status: action === "approval" ? "REVIEW" : "TODO",
      priority: action === "approval" ? "HIGH" : "MEDIUM",
      type: action === "approval" ? "REVISION" : action === "report" ? "QA" : "FEATURE",
      approvalRequired: action === "approval",
      approvalType: action === "approval" ? ROLE_APPROVAL_TYPE[workspaceMode ?? "social"] : undefined,
      approvalStatus: action === "approval" ? "PENDING" : undefined,
      workstream:
        action === "creative" ? "UI_INTEGRATION" :
        action === "optimization" ? "BACKEND" :
        action === "report" ? "QA" : "FULLSTACK",
    };
    setFeedback(null);
    setActiveAction(action);
    try {
      await createTask(taskBody).unwrap();
      setTaskTitle("");
      setTaskDescription("");
      setFeedback({ type: "success", text: "Görev oluşturuldu." });
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Görev oluşturulamadı.") });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateInternalNote() {
    if (!metaAdsProjectId || !canInteractWorkspace) return;
    if (noteBody.trim().length === 0) {
      setFeedback({ type: "error", text: "Not alanı boş bırakılamaz." });
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
      setFeedback({ type: "success", text: "Ajans notu eklendi." });
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Not gönderilemedi.") });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleAdSetNote(adSetId: string, adSetName: string | null, noteText: string) {
    if (!metaAdsProjectId || !canInteractWorkspace || !noteText.trim()) return;
    await createWorkspaceMessage({
      projectId: metaAdsProjectId,
      tabKey: "MESSAGES",
      body: `${ADSET_NOTE_PREFIX}${adSetId}] ${adSetName ?? adSetId}: ${noteText.trim()}`,
      isInternal: true,
    }).unwrap();
  }

  async function handleReplyToClient() {
    if (!metaAdsProjectId || !canInteractWorkspace) return;
    if (replyBody.trim().length === 0) {
      setFeedback({ type: "error", text: "Mesaj alanı boş bırakılamaz." });
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
      setFeedback({ type: "success", text: "Müşteri mesajı gönderildi." });
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Mesaj gönderilemedi.") });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateReportDraft() {
    if (!canManageMetaAdsNotes || !metaAdsProjectId) return;
    if (!reportForm.periodStart || !reportForm.periodEnd) {
      setFeedback({ type: "error", text: "Başlangıç/bitiş tarihleri zorunludur." });
      return;
    }
    setFeedback(null);
    setActiveAction("create-report");
    try {
      await createMetaAdsReport({
        clientId: selectedClientId,
        body: {
          projectId: metaAdsProjectId,
          periodStart: new Date(`${reportForm.periodStart}T00:00:00.000Z`).toISOString(),
          periodEnd: new Date(`${reportForm.periodEnd}T23:59:59.999Z`).toISOString(),
          type: reportForm.type,
          summary: reportForm.summary.trim().length > 0 ? reportForm.summary.trim() : undefined,
          clientVisible: reportForm.publishNow || undefined,
          requestAcknowledgement: reportForm.requestAcknowledgement || undefined,
        },
      }).unwrap();
      setReportForm(INITIAL_REPORT_FORM);
      setFeedback({ type: "success", text: "Rapor taslağı kaydedildi." });
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Rapor kaydedilemedi.") });
    } finally {
      setActiveAction(null);
    }
  }

  async function handlePublishReport(reportId: string) {
    if (!canManageMetaAdsNotes) return;
    setFeedback(null);
    setActiveAction(`publish-${reportId}`);
    try {
      await updateMetaAdsReport({
        reportId,
        body: { status: "PUBLISHED", clientVisible: true, requestAcknowledgement: reportPublishAckToggle || undefined },
      }).unwrap();
      setFeedback({ type: "success", text: "Rapor yayınlandı." });
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Rapor yayınlanamadı.") });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleAdvanceTaskStatus(task: Task) {
    if (!canUpdateTask) return;
    const nextStatus = resolveNextTaskStatus(task.status);
    if (!nextStatus) return;
    setFeedback(null);
    setActiveAction(task.id);
    try {
      await updateTask({ id: task.id, body: { status: nextStatus } }).unwrap();
      setFeedback({ type: "success", text: `${task.title} → ${nextStatus}` });
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Task güncellenemedi.") });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleToggleTodo(taskId: string, todo: TaskTodo) {
    if (!canUpdateTask) return;
    setActiveAction(todo.id);
    try {
      await toggleTaskTodo({ taskId, todoId: todo.id, body: { isCompleted: !todo.isCompleted } }).unwrap();
    } catch (error) {
      setFeedback({ type: "error", text: extractApiErrorMessage(error, "Todo güncellenemedi.") });
    } finally {
      setActiveAction(null);
    }
  }

  const syncLabel = summary?.lastSyncAt
    ? new Date(summary.lastSyncAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })
    : null;

  const adSetNotes = useMemo(
    () =>
      workspaceMessages
        .filter((m) => m.body?.startsWith(ADSET_NOTE_PREFIX))
        .map((m) => {
          const match = m.body.match(/^\[adset-note:([^\]]+)\] /);
          return match ? { adSetId: match[1], body: m.body, createdAt: m.createdAt } : null;
        })
        .filter((n): n is { adSetId: string; body: string; createdAt: string } => n !== null),
    [workspaceMessages],
  );

  return (
    <div className="flex min-h-0 flex-col gap-5">
      {/* Header */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-white">Meta Ads Workspace</h1>
          <p className="truncate text-sm text-[#A0A0A0]">
            {ROLE_LABELS[workspaceMode]} · {VIEW_DESCRIPTIONS[currentView]}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 border-[#AAFF01]/30 text-[#d2ff8a]">
          {ROLE_LABELS[workspaceMode]}
        </Badge>
      </div>

      {/* Client Selector */}
      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 grow basis-52">
            <Label className="text-xs text-[#A0A0A0]">Meta Ads Müşterisi</Label>
            <select
              className="mt-1.5 h-9 w-full min-w-0 rounded-md border border-white/[0.12] bg-[#131313] px-3 text-sm text-white"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={isClientsLoading || metaAdsClients.length === 0}
            >
              {metaAdsClients.length === 0 ? (
                <option value="">Meta Ads müşteri bulunamadı</option>
              ) : (
                metaAdsClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))
              )}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => refetchClients()}
            disabled={isClientsLoading || isClientsFetching}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Yenile
          </Button>
        </div>
        {isClientsError ? (
          <p className="mt-2 text-xs text-red-300">
            {extractApiErrorMessage(clientsError, "Müşteri listesi alınamadı.")}
          </p>
        ) : null}
      </Card>

      {/* Feedback */}
      {feedback ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d8ff8f]"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {!isClientsLoading && metaAdsClients.length === 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          Assigned scope içinde aktif META_ADS servisi olan müşteri bulunamadı.
        </Card>
      ) : null}

      {selectedClient ? (
        <>
          {/* Metric Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard
              icon={<TrendingUp className="h-3.5 w-3.5 text-[#AAFF01]" />}
              label="Harcama"
              value={summary ? formatCurrency(summary.spend) : "—"}
              loading={isSummaryLoading}
              accent="green"
            />
            <MetricCard
              icon={<BarChart2 className="h-3.5 w-3.5 text-blue-400" />}
              label="Gösterim"
              value={summary ? fmtNum(summary.impressions) : "—"}
              loading={isSummaryLoading}
              accent="blue"
            />
            <MetricCard
              icon={<MousePointerClick className="h-3.5 w-3.5 text-cyan-400" />}
              label="Tıklama"
              value={summary ? fmtNum(summary.clicks) : "—"}
              loading={isSummaryLoading}
              accent="cyan"
            />
            <MetricCard
              icon={<Target className="h-3.5 w-3.5 text-purple-400" />}
              label="CTR"
              value={summary ? `${summary.ctr.toFixed(2)}%` : "—"}
              loading={isSummaryLoading}
              accent="purple"
            />
            <MetricCard
              icon={<Trophy className="h-3.5 w-3.5 text-yellow-400" />}
              label="Sonuç"
              value={summary ? fmtNum(summary.results) : "—"}
              loading={isSummaryLoading}
              accent="yellow"
            />
            <MetricCard
              icon={<Zap className="h-3.5 w-3.5 text-orange-400" />}
              label="ROAS"
              value={summary?.roas != null ? `${summary.roas.toFixed(2)}x` : "—"}
              loading={isSummaryLoading}
              accent="orange"
            />
          </div>

          {syncLabel ? (
            <p className="text-xs text-[#505050]">Son senkron: {syncLabel}</p>
          ) : null}

          {isSummaryError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Meta Ads özet verisi okunamadı. Bağlantı durumunu kontrol edin.
            </div>
          ) : null}

          {/* View Tabs */}
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {allowedViews.map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                title={VIEW_DESCRIPTIONS[view]}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  currentView === view
                    ? "bg-[#AAFF01] text-[#131313]"
                    : "border border-white/[0.10] bg-white/[0.04] text-[#A0A0A0] hover:border-white/20 hover:text-white"
                }`}
              >
                {VIEW_LABELS[view]}
              </button>
            ))}
          </div>

          {/* Main View */}
          <Card className="min-w-0 border-white/[0.06] bg-[#1A1A1A] p-5">
            {currentView === "overview" ? (
              <OverviewSection
                campaigns={campaigns?.data ?? []}
                adSets={adSets?.data ?? []}
                isCampaignsLoading={isCampaignsLoading}
                isAdSetsLoading={isAdSetsLoading}
                summary={summary ?? null}
              />
            ) : null}

            {currentView === "campaigns" ? (
              <CampaignSection
                campaigns={campaigns?.data ?? []}
                totalSpend={summary?.spend ?? 0}
                isLoading={isCampaignsLoading}
              />
            ) : null}

            {currentView === "performance" ? (
              <PerformanceSection
                adSetInsights={adSets?.data ?? []}
                tasks={metaAdsTasks}
                adSetNotes={adSetNotes}
                isLoading={isAdSetsLoading}
                canUpdateTask={canUpdateTask}
                canInteractWorkspace={canInteractWorkspace}
                hasMetaAdsProject={hasMetaAdsProject}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onAdvanceTaskStatus={(t) => void handleAdvanceTaskStatus(t)}
                onAddAdSetNote={(id, name, text) => handleAdSetNote(id, name, text)}
              />
            ) : null}

            {currentView === "kitleler" ? (
              <AudiencesSection
                audiences={audiences?.data ?? []}
                isLoading={isAudiencesLoading}
                isError={isAudiencesError}
                onRefresh={() => void refetchAudiences()}
              />
            ) : null}

            {currentView === "creatives" ? (
              <CreativeSection
                creatives={adCreatives?.data ?? []}
                adInsights={adInsights?.data ?? []}
                isLoading={isCreativesLoading || isAdInsightsLoading}
                isError={isCreativesError}
                canManageFiles={canManageFiles && canManageMetaAdsCreatives}
                canCreateTask={canCreateTask}
                hasMetaAdsProject={hasMetaAdsProject}
                metaAdsProjectId={metaAdsProjectId}
                tasks={metaAdsTasks}
                isActionBusy={isActionBusy}
                activeAction={activeAction}
                onCreateCreativeTask={() => void handleCreateRoleTask("creative")}
                onRefresh={() => void refetchCreatives()}
              />
            ) : null}

            {currentView === "reports" ? (
              <ReportsSection
                summaryDateLabel={summary ? `${summary.dateRange.since} – ${summary.dateRange.until}` : "—"}
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
                onPublishReport={(id) => void handlePublishReport(id)}
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
                onAdvanceTaskStatus={(t) => void handleAdvanceTaskStatus(t)}
              />
            ) : null}

            {currentView === "pixel" ? (
              <PixelSection pixelStatus={pixelStatus} isLoading={isPixelLoading} clientId={selectedClientId} />
            ) : null}
          </Card>

          {/* Role Action Panels */}
          {workspaceMode === "social" ? (
            <SocialActionsPanel
              taskTitle={taskTitle}
              setTaskTitle={setTaskTitle}
              taskDescription={taskDescription}
              setTaskDescription={setTaskDescription}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              lastMessage={workspaceMessages[0]?.body ?? null}
              canCreateTask={canCreateTask}
              canInteractWorkspace={canInteractWorkspace}
              hasMetaAdsProject={hasMetaAdsProject}
              isActionBusy={isActionBusy}
              activeAction={activeAction}
              onCreateTask={() => void handleCreateRoleTask("creative")}
              onCreateReportTask={() => void handleCreateRoleTask("report")}
              onReply={() => void handleReplyToClient()}
            />
          ) : null}

          {workspaceMode === "performance" ? (
            <PerformanceActionsPanel
              noteBody={noteBody}
              setNoteBody={setNoteBody}
              approvalCount={approvalTasks.length}
              canInteractWorkspace={canInteractWorkspace}
              canCreateTask={canCreateTask}
              canCreateApprovals={canCreateMetaAdsApprovals}
              hasMetaAdsProject={hasMetaAdsProject}
              isActionBusy={isActionBusy}
              activeAction={activeAction}
              onAddNote={() => void handleCreateInternalNote()}
              onOptimizationTask={() => void handleCreateRoleTask("optimization")}
              onApprovalTask={() => void handleCreateRoleTask("approval")}
            />
          ) : null}

          {workspaceMode === "designer" ? (
            <DesignerActionsPanel
              metaAdsProjectId={metaAdsProjectId}
              tasks={metaAdsTasks}
              canManageFiles={canManageFiles && canManageMetaAdsCreatives}
              canCreateTask={canCreateTask}
              canCreateApprovals={canCreateMetaAdsApprovals}
              canUpdateTask={canUpdateTask}
              hasMetaAdsProject={hasMetaAdsProject}
              isActionBusy={isActionBusy}
              activeAction={activeAction}
              onApprovalTask={() => void handleCreateRoleTask("approval")}
              onToggleTodo={(taskId, todo) => void handleToggleTodo(taskId, todo)}
            />
          ) : null}
        </>
      ) : null}

      {!skip && (
        <WorkspaceAiCommentaryPanel commentary={aiCommentary ?? null} loading={isAiCommentaryLoading} activeView={currentView} />
      )}

      <div className="flex items-start gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-xs text-[#505050]">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>Workspace sadece assigned client + ACTIVE META_ADS service + serviceKey=META_ADS project verisini kullanır.</p>
      </div>
    </div>
  );
}

/* ──────────────── Metric Card ──────────────── */
function MetricCard({
  icon, label, value, loading, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
  accent: "green" | "blue" | "cyan" | "purple" | "yellow" | "orange";
}) {
  const border = {
    green: "border-l-[#AAFF01]",
    blue: "border-l-blue-400",
    cyan: "border-l-cyan-400",
    purple: "border-l-purple-400",
    yellow: "border-l-yellow-400",
    orange: "border-l-orange-400",
  }[accent];

  return (
    <Card className={`border-l-2 border-white/[0.06] bg-[#1A1A1A] p-3 ${border}`}>
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wide text-[#606060]">{label}</span>
      </div>
      <p className="text-base font-semibold text-white">
        {loading ? <span className="text-sm text-[#404040]">—</span> : value}
      </p>
    </Card>
  );
}

/* ──────────────── Overview Section ──────────────── */
function OverviewSection({
  campaigns,
  adSets,
  isCampaignsLoading,
  isAdSetsLoading,
  summary,
}: {
  campaigns: Array<{ id: string; name: string; objective: string; spend: number; ctr: number; roas: number | null; impressions: number; clicks: number; results: number; effectiveStatus: string }>;
  adSets: Array<{ id: string; entityName: string | null; spend: number; cpm: number; ctr: number; costPerResult: number }>;
  isCampaignsLoading: boolean;
  isAdSetsLoading: boolean;
  summary: { spend: number; impressions: number; clicks: number; ctr: number; results: number; roas: number | null } | null;
}) {
  const topCampaigns = campaigns.slice(0, 3);
  const topAdSets = adSets.slice(0, 3);
  const totalSpend = summary?.spend ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">En Yüksek Harcama — Kampanyalar</h3>
        {isCampaignsLoading ? <SkeletonList count={3} /> : null}
        {!isCampaignsLoading && topCampaigns.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Kampanya verisi yok.</p>
        ) : null}
        <div className="space-y-2">
          {topCampaigns.map((c) => (
            <div key={c.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="mb-2 flex min-w-0 items-center gap-2">
                <Megaphone className="h-3.5 w-3.5 shrink-0 text-[#AAFF01]" />
                <span className="min-w-0 truncate text-sm font-medium text-white">{c.name}</span>
                <StatusBadge status={c.effectiveStatus} />
              </div>
              <div className="mb-2">
                <SpendBar spend={c.spend} total={totalSpend} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <StatCell label="Harcama" value={formatCurrency(c.spend)} />
                <StatCell label="CTR" value={`${c.ctr.toFixed(2)}%`} />
                <StatCell label="ROAS" value={c.roas != null ? `${c.roas.toFixed(2)}x` : "—"} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Öne Çıkan Reklam Setleri</h3>
        {isAdSetsLoading ? <SkeletonList count={3} /> : null}
        {!isAdSetsLoading && topAdSets.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Reklam seti verisi yok.</p>
        ) : null}
        <div className="space-y-2">
          {topAdSets.map((s) => (
            <div key={s.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <span className="min-w-0 truncate text-sm text-white">{s.entityName ?? "Ad Set"}</span>
              <div className="flex shrink-0 gap-4 text-xs">
                <StatCell label="Spend" value={formatCurrency(s.spend)} />
                <StatCell label="CTR" value={`${s.ctr.toFixed(2)}%`} />
                <StatCell label="CPM" value={s.cpm.toFixed(2)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Campaign Section ──────────────── */
function CampaignSection({
  campaigns,
  totalSpend,
  isLoading,
}: {
  campaigns: Array<{
    id: string; name: string; objective: string; status: string; effectiveStatus: string;
    spend: number; impressions: number; clicks: number; ctr: number; cpc: number;
    results: number; roas: number | null;
  }>;
  totalSpend: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Kampanyalar</h3>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Kampanyalar</h3>
        <span className="text-xs text-[#606060]">{campaigns.length} kampanya</span>
      </div>
      {campaigns.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Kampanya verisi bulunamadı.</p>
      ) : null}
      {campaigns.map((c) => (
        <div key={c.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#161616]">
          {/* Top accent bar */}
          <div
            className={`h-0.5 w-full ${
              c.effectiveStatus === "ACTIVE"
                ? "bg-gradient-to-r from-[#AAFF01] to-[#AAFF01]/30"
                : "bg-white/10"
            }`}
          />
          <div className="p-4">
            <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
              <Megaphone className="h-4 w-4 shrink-0 text-[#AAFF01]" />
              <span className="min-w-0 truncate font-medium text-white">{c.name}</span>
              <StatusBadge status={c.effectiveStatus} />
              <span className="ml-auto shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#A0A0A0]">
                {c.objective.replace(/_/g, " ")}
              </span>
            </div>

            {/* Spend bar */}
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#606060]">Harcama payı</span>
                <span className="text-[#A0A0A0]">
                  {formatCurrency(c.spend)} / {formatCurrency(totalSpend || c.spend)}
                </span>
              </div>
              <SpendBar spend={c.spend} total={totalSpend || c.spend} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <StatCell label="Harcama" value={formatCurrency(c.spend)} highlight />
              <StatCell label="Gösterim" value={fmtNum(c.impressions)} />
              <StatCell label="Tıklama" value={fmtNum(c.clicks)} />
              <StatCell label="CTR" value={`${c.ctr.toFixed(2)}%`} highlight />
              <StatCell label="CPC" value={c.cpc.toFixed(2)} />
              <StatCell label="ROAS" value={c.roas != null ? `${c.roas.toFixed(2)}x` : "—"} highlight={c.roas != null && c.roas > 1} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Performance Section ──────────────── */
function PerformanceSection({
  adSetInsights,
  tasks,
  adSetNotes,
  isLoading,
  canUpdateTask,
  canInteractWorkspace,
  hasMetaAdsProject,
  isActionBusy,
  activeAction,
  onAdvanceTaskStatus,
  onAddAdSetNote,
}: {
  adSetInsights: Array<{
    id: string; entityId: string | null; entityName: string | null;
    spend: number; cpm: number; ctr: number; costPerResult: number;
    impressions: number; clicks: number; reach: number; frequency: number;
  }>;
  tasks: Task[];
  adSetNotes: Array<{ adSetId: string; body: string; createdAt: string }>;
  isLoading: boolean;
  canUpdateTask: boolean;
  canInteractWorkspace: boolean;
  hasMetaAdsProject: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  onAdvanceTaskStatus: (task: Task) => void;
  onAddAdSetNote: (id: string, name: string | null, text: string) => Promise<void>;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-white">Performans & Optimizasyon</h3>
      <p className="text-xs text-[#606060]">
        Reklam seti analizi · Her set için optimizasyon notu ekleyebilirsiniz
      </p>

      {isLoading ? <SkeletonList count={3} height="h-28" /> : null}
      {!isLoading && adSetInsights.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Reklam seti içgörüsü bulunamadı.</p>
      ) : null}

      {adSetInsights.map((insight) => (
        <AdSetCard
          key={insight.id}
          insight={insight}
          notes={adSetNotes.filter((n) => n.adSetId === (insight.entityId ?? insight.id))}
          canInteractWorkspace={canInteractWorkspace && hasMetaAdsProject}
          isActionBusy={isActionBusy}
          onAddNote={(text) => onAddAdSetNote(insight.entityId ?? insight.id, insight.entityName, text)}
        />
      ))}

      {tasks.length > 0 ? (
        <div className="space-y-2 border-t border-white/[0.06] pt-4">
          <p className="text-xs font-medium text-[#A0A0A0]">Görevler</p>
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3"
            >
              <div className="min-w-0">
                <p className="min-w-0 truncate text-sm text-white">{task.title}</p>
                <p className="text-xs text-[#606060]">{task.status}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 text-xs"
                onClick={() => onAdvanceTaskStatus(task)}
                disabled={!canUpdateTask || !resolveNextTaskStatus(task.status) || isActionBusy}
              >
                {activeAction === task.id ? "..." : "İlerle"}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ──────────────── Ad Set Card with inline notes ──────────────── */
function AdSetCard({
  insight,
  notes,
  canInteractWorkspace,
  isActionBusy,
  onAddNote,
}: {
  insight: {
    id: string; entityId: string | null; entityName: string | null;
    spend: number; cpm: number; ctr: number; costPerResult: number;
    impressions: number; clicks: number; reach: number; frequency: number;
  };
  notes: Array<{ adSetId: string; body: string; createdAt: string }>;
  canInteractWorkspace: boolean;
  isActionBusy: boolean;
  onAddNote: (text: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveNote() {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await onAddNote(noteText.trim());
      setNoteText("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#161616]">
      <div className="p-4">
        <div className="mb-3 flex min-w-0 items-center gap-2">
          <Zap className="h-4 w-4 shrink-0 text-[#AAFF01]" />
          <span className="min-w-0 truncate font-medium text-white">
            {insight.entityName ?? "Ad Set"}
          </span>
          <button
            type="button"
            className="ml-auto shrink-0 text-[#606060] hover:text-[#A0A0A0]"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          <StatCell label="Harcama" value={formatCurrency(insight.spend)} highlight />
          <StatCell label="CPM" value={insight.cpm.toFixed(2)} />
          <StatCell label="CTR" value={`${insight.ctr.toFixed(2)}%`} highlight />
          <StatCell label="CPA" value={insight.costPerResult > 0 ? insight.costPerResult.toFixed(2) : "—"} />
        </div>

        {expanded ? (
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 sm:grid-cols-4">
            <StatCell label="Gösterim" value={fmtNum(insight.impressions)} />
            <StatCell label="Tıklama" value={fmtNum(insight.clicks)} />
            <StatCell label="Erişim" value={fmtNum(insight.reach)} />
            <StatCell label="Frekans" value={insight.frequency.toFixed(2)} />
          </div>
        ) : null}
      </div>

      {/* Notes section */}
      <div className="border-t border-white/[0.06] bg-white/[0.015] px-4 py-3">
        {notes.length > 0 ? (
          <div className="mb-2 space-y-1">
            {notes.map((n, i) => (
              <p key={i} className="text-xs text-[#A0A0A0]">
                <span className="mr-1 text-[#606060]">
                  {new Date(n.createdAt).toLocaleDateString("tr-TR")}:
                </span>
                {n.body.replace(/^\[adset-note:[^\]]+\] [^:]+: /, "")}
              </p>
            ))}
          </div>
        ) : null}
        {canInteractWorkspace ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Optimizasyon notu ekle..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleSaveNote(); }}
              className="min-w-0 grow rounded-md border border-white/[0.10] bg-[#131313] px-3 py-1.5 text-xs text-white placeholder-[#505050] focus:outline-none focus:ring-1 focus:ring-[#AAFF01]/30"
              disabled={saving || isActionBusy}
            />
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-[#AAFF01]/20 text-[#d8ff8f] hover:bg-[#AAFF01]/30 text-xs"
              onClick={() => void handleSaveNote()}
              disabled={!noteText.trim() || saving || isActionBusy}
            >
              {saving ? "..." : "Kaydet"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ──────────────── Audiences Section ──────────────── */
function AudiencesSection({
  audiences,
  isLoading,
  isError,
  onRefresh,
}: {
  audiences: MetaAdsAdSetAudience[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Hedef Kitleler</h3>
          <p className="text-xs text-[#A0A0A0]">
            Her reklam setinin hedef kitle ve demografik ayarları
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5 text-xs"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {isLoading ? <SkeletonList count={4} height="h-32" /> : null}
      {!isLoading && isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Kitle verisi çekilemedi. Token geçerliliğini ve `ads_read` iznini kontrol edin.
        </div>
      ) : null}
      {!isLoading && !isError && audiences.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.10] py-12 text-center">
          <Users className="h-8 w-8 text-[#404040]" />
          <p className="text-sm text-[#A0A0A0]">Kitle verisi bulunamadı.</p>
        </div>
      ) : null}

      {!isLoading && !isError && audiences.length > 0 ? (
        <div className="space-y-3">
          {audiences.map((audience) => (
            <AudienceCard key={audience.adSetId} audience={audience} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AudienceCard({ audience }: { audience: MetaAdsAdSetAudience }) {
  const hasAudienceData =
    audience.interests.length > 0 ||
    audience.customAudiences.length > 0 ||
    audience.lookalikeAudiences.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#161616]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Target className="h-4 w-4 shrink-0 text-[#AAFF01]" />
          <span className="min-w-0 truncate font-medium text-white">
            {audience.adSetName ?? audience.adSetId}
          </span>
          <StatusBadge status={audience.effectiveStatus ?? audience.status ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Demographics */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-[#606060]">Demografik</p>
          <div className="space-y-1 text-xs text-[#D8D8D8]">
            {audience.ageMin != null || audience.ageMax != null ? (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#606060]" />
                <span>
                  Yaş: {audience.ageMin ?? "—"} – {audience.ageMax ?? "—"}
                </span>
              </div>
            ) : (
              <span className="text-[#505050]">Yaş bilgisi yok</span>
            )}
            {audience.genders.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[#606060]">Cinsiyet:</span>
                <span>{audience.genders.join(", ")}</span>
              </div>
            ) : (
              <span className="text-[#505050]">Tüm cinsiyetler</span>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-[#606060]">Konum</p>
          {audience.countries.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {audience.countries.map((c) => (
                <span key={c} className="flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#A0A0A0]">
                  <Globe className="h-3 w-3" />
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-[#505050]">Konum bilgisi yok</span>
          )}
        </div>

        {/* Audiences */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-[#606060]">Kitle & İlgiler</p>
          {!hasAudienceData ? (
            <span className="text-xs text-[#505050]">Özel kitle tanımı yok</span>
          ) : (
            <div className="space-y-1">
              {audience.customAudiences.slice(0, 3).map((ca, i) => (
                <p key={i} className="flex items-center gap-1 text-xs text-[#A0A0A0]">
                  <Users className="h-3 w-3 shrink-0 text-blue-400" />
                  <span className="truncate">{ca}</span>
                </p>
              ))}
              {audience.lookalikeAudiences.slice(0, 2).map((la, i) => (
                <p key={i} className="flex items-center gap-1 text-xs text-[#A0A0A0]">
                  <Users className="h-3 w-3 shrink-0 text-purple-400" />
                  <span className="truncate">{la}</span>
                </p>
              ))}
              {audience.interests.slice(0, 4).map((interest, i) => (
                <p key={i} className="flex items-center gap-1 text-xs text-[#A0A0A0]">
                  <MapPin className="h-3 w-3 shrink-0 text-[#606060]" />
                  <span className="truncate">{interest}</span>
                </p>
              ))}
              {audience.interests.length > 4 ? (
                <p className="text-[10px] text-[#505050]">+{audience.interests.length - 4} ilgi alanı</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Creative Section ──────────────── */
function CreativeSection({
  creatives,
  adInsights,
  isLoading,
  isError,
  canManageFiles,
  canCreateTask,
  hasMetaAdsProject,
  metaAdsProjectId,
  tasks,
  isActionBusy,
  activeAction,
  onCreateCreativeTask,
  onRefresh,
}: {
  creatives: MetaAdsAdCreative[];
  adInsights: MetaAdsInsightItem[];
  isLoading: boolean;
  isError: boolean;
  canManageFiles: boolean;
  canCreateTask: boolean;
  hasMetaAdsProject: boolean;
  metaAdsProjectId: string | null;
  tasks: Task[];
  isActionBusy: boolean;
  activeAction: string | null;
  onCreateCreativeTask: () => void;
  onRefresh: () => void;
}) {
  /* Join creatives with ad insights by adId */
  const enriched = useMemo(() => {
    const insightsByAdId = new Map<string, MetaAdsInsightItem>();
    for (const insight of adInsights) {
      if (insight.entityId && !insightsByAdId.has(insight.entityId)) {
        insightsByAdId.set(insight.entityId, insight);
      }
    }
    return creatives.map((c) => ({
      creative: c,
      insight: insightsByAdId.get(c.adId) ?? null,
    }));
  }, [creatives, adInsights]);

  /* Hook score = CTR proxy. Sort by CTR desc */
  const ranked = useMemo(
    () =>
      [...enriched].sort((a, b) => {
        const aCtr = a.insight?.ctr ?? 0;
        const bCtr = b.insight?.ctr ?? 0;
        return bCtr - aCtr;
      }),
    [enriched],
  );

  const avgCtr = useMemo(() => {
    const ctrs = ranked.map((r) => r.insight?.ctr ?? 0).filter((c) => c > 0);
    return ctrs.length > 0 ? ctrs.reduce((a, b) => a + b, 0) / ctrs.length : 0;
  }, [ranked]);

  const winner = ranked[0];
  const winnerCtr = winner?.insight?.ctr ?? 0;
  const hasWinner = winnerCtr > 0 && avgCtr > 0 && winnerCtr >= avgCtr * 1.5;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Kreatifler</h3>
          <p className="text-xs text-[#A0A0A0]">
            Kreatif önizleme · Hook skoru (CTR) · Dönüşüm karşılaştırması
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button asChild size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs" disabled={!canManageFiles}>
            <Link to={metaAdsProjectId ? `/employee/dosyalar?projectId=${metaAdsProjectId}&serviceKey=META_ADS` : "/employee/dosyalar"}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Asset Yükle
            </Link>
          </Button>
          <Button type="button" size="sm" variant="outline" className="text-xs" onClick={onCreateCreativeTask}
            disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}>
            {activeAction === "creative" ? "Oluşturuluyor..." : "Creative Task Aç"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-white/[0.04]" />)}
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Kreatif verisi çekilemedi. Meta access token'ın geçerliliğini kontrol edin.
        </div>
      ) : null}

      {!isLoading && !isError && creatives.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.10] py-12 text-center">
          <ImageIcon className="h-8 w-8 text-[#404040]" />
          <p className="text-sm text-[#A0A0A0]">Reklam kreatifleri bulunamadı.</p>
          <p className="text-xs text-[#606060]">Sync yapın veya token'ı yenileyin.</p>
        </div>
      ) : null}

      {!isLoading && !isError && ranked.length > 0 ? (
        <>
          {/* Creative Test Panel */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Kreatif Test Panosu</h4>
              {hasWinner ? (
                <span className="rounded-full bg-[#AAFF01]/20 px-2 py-0.5 text-[10px] text-[#AAFF01]">
                  Kazanan belirlendi
                </span>
              ) : avgCtr > 0 ? (
                <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] text-yellow-300">
                  Test devam ediyor
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              {ranked.slice(0, 5).map(({ creative, insight }, idx) => {
                const ctr = insight?.ctr ?? 0;
                const maxCtr = ranked[0]?.insight?.ctr ?? 1;
                const barWidth = maxCtr > 0 ? (ctr / maxCtr) * 100 : 0;
                const isTop = idx === 0 && hasWinner;

                return (
                  <div key={creative.adId} className="flex min-w-0 items-center gap-3">
                    <span className={`w-5 shrink-0 text-center text-xs font-bold ${isTop ? "text-yellow-400" : "text-[#606060]"}`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="min-w-0 truncate text-xs text-[#D8D8D8]">
                          {creative.adName ?? creative.adId}
                        </span>
                        <span className="ml-auto shrink-0 text-xs font-medium text-white">
                          {ctr > 0 ? `${ctr.toFixed(2)}%` : "—"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className={`h-full rounded-full transition-all ${isTop ? "bg-[#AAFF01]" : "bg-white/30"}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    {insight ? (
                      <div className="shrink-0 space-y-0.5 text-right text-[10px] text-[#606060]">
                        <div>{formatCurrency(insight.spend)}</div>
                        <div>{fmtNum(insight.results)} sonuç</div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {avgCtr > 0 ? (
              <p className="mt-3 text-[10px] text-[#505050]">
                Ort. CTR: {avgCtr.toFixed(2)}% · Kazanan eşiği: ort. CTR × 1.5
              </p>
            ) : null}
          </div>

          {/* Creative Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.map(({ creative, insight }, idx) => (
              <CreativeCard
                key={creative.adId}
                creative={creative}
                insight={insight}
                rank={idx + 1}
                isWinner={idx === 0 && hasWinner}
              />
            ))}
          </div>
        </>
      ) : null}

      {tasks.length > 0 ? (
        <div className="border-t border-white/[0.06] pt-4">
          <p className="mb-2 text-xs font-medium text-[#A0A0A0]">Creative Görevler ({tasks.length})</p>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                <p className="min-w-0 truncate text-sm text-white">{task.title}</p>
                <Badge variant="outline" className="shrink-0 text-[10px]">{task.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreativeCard({
  creative,
  insight,
  rank,
  isWinner,
}: {
  creative: MetaAdsAdCreative;
  insight: MetaAdsInsightItem | null;
  rank: number;
  isWinner: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const isActive = creative.effectiveStatus === "ACTIVE";

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-[#161616] transition-all hover:border-white/20 ${
        isWinner
          ? "border-[#AAFF01]/40"
          : isActive
            ? "border-white/[0.08]"
            : "border-white/[0.04] opacity-60"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1E1E1E]">
        {creative.thumbnailUrl && !imgError ? (
          <img
            src={creative.thumbnailUrl}
            alt={creative.adName ?? "Creative"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-[#303030]" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute left-2 top-2 flex gap-1">
          {isWinner ? (
            <span className="flex items-center gap-1 rounded-full bg-[#AAFF01]/90 px-2 py-0.5 text-[10px] font-medium text-[#131313]">
              <Trophy className="h-2.5 w-2.5" /> Kazanan
            </span>
          ) : (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isActive ? "bg-[#AAFF01]/20 text-[#AAFF01]" : "bg-white/10 text-[#A0A0A0]"
            }`}>
              #{rank}
            </span>
          )}
        </div>

        {/* Hook score badge */}
        {insight?.ctr ? (
          <div className="absolute right-2 top-2">
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              Hook: {insight.ctr.toFixed(2)}%
            </span>
          </div>
        ) : null}

        {creative.callToActionType ? (
          <div className="absolute bottom-2 left-2">
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              {creative.callToActionType.replace(/_/g, " ")}
            </span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-white" title={creative.adName ?? undefined}>
          {creative.adName ?? "—"}
        </p>
        {creative.title ? (
          <p className="mt-0.5 truncate text-xs text-[#A0A0A0]">{creative.title}</p>
        ) : null}
        {creative.body ? (
          <p className="mt-1 line-clamp-2 text-xs text-[#606060]">{creative.body}</p>
        ) : null}

        {/* Metrics */}
        {insight ? (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-2">
            <MicroStat label="Harcama" value={formatCurrency(insight.spend)} />
            <MicroStat label="CTR" value={`${insight.ctr.toFixed(2)}%`} />
            <MicroStat label="Sonuç" value={fmtNum(insight.results)} />
          </div>
        ) : null}

        {creative.thumbnailUrl && !imgError ? (
          <a
            href={creative.thumbnailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#505050] hover:text-[#A0A0A0]"
          >
            <ExternalLink className="h-3 w-3" />
            Görseli aç
          </a>
        ) : null}
      </div>
    </div>
  );
}

/* ──────────────── Reports Section ──────────────── */
function ReportsSection({
  summaryDateLabel, noteBody, setNoteBody, canInteractWorkspace, canReadMetaAdsReports,
  canManageMetaAdsNotes, canCreateMetaAdsApprovals, reportRows, reportMeta, reportForm,
  setReportForm, reportStatusFilter, setReportStatusFilter, reportTypeFilter, setReportTypeFilter,
  reportPublishAckToggle, setReportPublishAckToggle, isReportsLoading, isReportsError,
  isActionBusy, activeAction, onCreateInternalNote, onCreateReportDraft, onPublishReport,
}: {
  summaryDateLabel: string;
  noteBody: string;
  setNoteBody: (v: string) => void;
  canInteractWorkspace: boolean;
  canReadMetaAdsReports: boolean;
  canManageMetaAdsNotes: boolean;
  canCreateMetaAdsApprovals: boolean;
  reportRows: MetaAdsReportItem[];
  reportMeta: { total: number; draft: number; published: number; clientVisible: number } | undefined;
  reportForm: ReportDraftFormState;
  setReportForm: (updater: (prev: ReportDraftFormState) => ReportDraftFormState) => void;
  reportStatusFilter: MetaAdsReportStatus | "ALL";
  setReportStatusFilter: (v: MetaAdsReportStatus | "ALL") => void;
  reportTypeFilter: MetaAdsReportType | "ALL";
  setReportTypeFilter: (v: MetaAdsReportType | "ALL") => void;
  reportPublishAckToggle: boolean;
  setReportPublishAckToggle: (v: boolean) => void;
  isReportsLoading: boolean;
  isReportsError: boolean;
  isActionBusy: boolean;
  activeAction: string | null;
  onCreateInternalNote: () => void;
  onCreateReportDraft: () => void;
  onPublishReport: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white">Raporlar & Ajans Notları</h3>
        <p className="text-xs text-[#A0A0A0]">Rapor aralığı: {summaryDateLabel}</p>
      </div>

      {/* Filters */}
      <div className="flex min-w-0 flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-[#606060]">Status</Label>
          <select className="h-8 rounded-md border border-white/[0.12] bg-[#131313] px-2 text-xs text-white"
            value={reportStatusFilter}
            onChange={(e) => setReportStatusFilter(e.target.value as MetaAdsReportStatus | "ALL")}>
            <option value="ALL">Tümü</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#606060]">Tip</Label>
          <select className="h-8 rounded-md border border-white/[0.12] bg-[#131313] px-2 text-xs text-white"
            value={reportTypeFilter}
            onChange={(e) => setReportTypeFilter(e.target.value as MetaAdsReportType | "ALL")}>
            <option value="ALL">Tümü</option>
            {REPORT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
          <input type="checkbox" className="h-3.5 w-3.5 accent-[#AAFF01]"
            checked={reportPublishAckToggle} onChange={(e) => setReportPublishAckToggle(e.target.checked)} />
          Ack iste
        </label>
        {reportMeta ? (
          <span className="text-xs text-[#606060]">
            {reportMeta.total} rapor · {reportMeta.draft} draft · {reportMeta.published} published
          </span>
        ) : null}
      </div>

      {/* New Report Form */}
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs font-medium text-[#A0A0A0]">Yeni Rapor Oluştur</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-[#606060]">Başlangıç</Label>
            <Input type="date" className="h-8 text-xs" value={reportForm.periodStart}
              onChange={(e) => setReportForm((p) => ({ ...p, periodStart: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#606060]">Bitiş</Label>
            <Input type="date" className="h-8 text-xs" value={reportForm.periodEnd}
              onChange={(e) => setReportForm((p) => ({ ...p, periodEnd: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#606060]">Tip</Label>
            <select className="h-8 w-full rounded-md border border-white/[0.12] bg-[#131313] px-2 text-xs text-white"
              value={reportForm.type}
              onChange={(e) => setReportForm((p) => ({ ...p, type: e.target.value as MetaAdsReportType }))}>
              {REPORT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-3 text-xs text-[#A0A0A0]">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[#AAFF01]" checked={reportForm.publishNow}
                onChange={(e) => setReportForm((p) => ({ ...p, publishNow: e.target.checked }))} />
              Yayınla
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[#AAFF01]" checked={reportForm.requestAcknowledgement}
                onChange={(e) => setReportForm((p) => ({ ...p, requestAcknowledgement: e.target.checked }))} />
              Ack
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#606060]">Özet</Label>
          <Input className="h-8 text-xs" value={reportForm.summary}
            onChange={(e) => setReportForm((p) => ({ ...p, summary: e.target.value }))}
            placeholder="Haftalık performans özeti..." />
        </div>
        <Button type="button" size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs"
          onClick={onCreateReportDraft} disabled={!canManageMetaAdsNotes || isActionBusy}>
          {activeAction === "create-report" ? "Kaydediliyor..." : "Taslak Kaydet"}
        </Button>
      </div>

      {/* Report List */}
      {!canReadMetaAdsReports ? (
        <p className="text-xs text-orange-300">Report listesi için `metaAds.reporting.read.assigned` izni gereklidir.</p>
      ) : null}
      {isReportsLoading ? <p className="text-xs text-[#A0A0A0]">Yükleniyor...</p> : null}
      {isReportsError ? <p className="text-xs text-red-300">Rapor listesi alınamadı.</p> : null}
      {!isReportsLoading && !isReportsError && reportRows.length === 0 ? (
        <p className="text-xs text-[#A0A0A0]">Seçili filtre için rapor bulunamadı.</p>
      ) : null}
      {!isReportsLoading && !isReportsError && reportRows.length > 0 ? (
        <div className="space-y-2">
          {reportRows.map((report) => (
            <div key={report.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {report.type} · {report.periodStart.slice(0, 10)} – {report.periodEnd.slice(0, 10)}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{report.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">{report.acknowledgementStatus}</Badge>
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" className="shrink-0 text-xs"
                  onClick={() => onPublishReport(report.id)}
                  disabled={report.status === "PUBLISHED" || !canManageMetaAdsNotes || (reportPublishAckToggle && !canCreateMetaAdsApprovals) || isActionBusy}>
                  {activeAction === `publish-${report.id}` ? "..." : "Publish"}
                </Button>
              </div>
              {report.summary ? <p className="mt-2 text-xs text-[#A0A0A0]">{report.summary}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Internal Note */}
      <div className="space-y-2 border-t border-white/[0.06] pt-4">
        <Label className="text-xs text-[#606060]">Ajans Notu</Label>
        <Textarea placeholder="Kampanya değerlendirme notu..." value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)} className="min-h-[72px] resize-none text-sm" />
        <Button type="button" size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs"
          onClick={onCreateInternalNote} disabled={!canInteractWorkspace || isActionBusy}>
          {activeAction === "note" ? "Gönderiliyor..." : "Ajans Notu Ekle"}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────── Approvals Section ──────────────── */
function ApprovalsSection({
  approvalTasks, canCreateTask, canUpdateTask, isActionBusy, activeAction,
  onCreateApprovalRequest, onAdvanceTaskStatus,
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
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Onay Talepleri</h3>
          <p className="text-xs text-[#606060]">{approvalTasks.length} bekleyen onay</p>
        </div>
        <Button type="button" size="sm" className="shrink-0 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs"
          onClick={onCreateApprovalRequest} disabled={!canCreateTask || isActionBusy}>
          {activeAction === "approval" ? "Oluşturuluyor..." : "Onay Talebi Oluştur"}
        </Button>
      </div>
      {approvalTasks.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Bekleyen approval task bulunmuyor.</p>
      ) : null}
      <div className="space-y-2">
        {approvalTasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="min-w-0 truncate text-sm text-white">{task.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                  {task.approvalType ? (
                    <Badge variant="outline" className="text-[10px]">
                      {task.approvalType.replace("META_ADS_", "").replace(/_/g, " ")}
                    </Badge>
                  ) : null}
                  {task.approvalStatus ? (
                    <Badge variant="outline" className="text-[10px]">{task.approvalStatus}</Badge>
                  ) : null}
                </div>
                {task.approvalResponseNote ? (
                  <p className="text-xs text-orange-200">Not: {task.approvalResponseNote}</p>
                ) : null}
              </div>
              <Button type="button" size="sm" variant="outline" className="shrink-0 text-xs"
                disabled={!canUpdateTask || !resolveNextTaskStatus(task.status) || isActionBusy}
                onClick={() => onAdvanceTaskStatus(task)}>
                {activeAction === task.id ? "..." : "İlerle"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Pixel Section ──────────────── */
function PixelChecklistRow({ item }: { item: MetaAdsPixelChecklistItem }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 shrink-0">
        {item.status === "ok" ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#AAFF01]/20 text-[#AAFF01]">✓</span>
        ) : item.status === "warning" ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FFA726]/20 text-[10px] text-[#FFA726]">!</span>
        ) : (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8e8e]/20 text-[10px] text-[#ff8e8e]">✕</span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{item.label}</p>
        {item.detail && <p className="mt-0.5 text-xs text-[#A0A0A0]">{item.detail}</p>}
      </div>
    </div>
  );
}

function PixelSection({
  pixelStatus,
  isLoading,
  clientId,
}: {
  pixelStatus: { connectionStatus: string; adAccountId: string | null; pixelId: string | null; lastInsightAt: string | null; eventStatus: string; setupWarning: string | null; syncError: string | null } | undefined;
  isLoading: boolean;
  clientId: string;
}) {
  const { data: stats, isLoading: isStatsLoading } = useGetAssignedClientMetaAdsPixelStatsQuery(
    { clientId },
    { skip: !clientId || isLoading },
  );

  if (isLoading) return <p className="text-sm text-[#A0A0A0]">Pixel durumu yükleniyor...</p>;
  if (!pixelStatus) return <p className="text-sm text-[#A0A0A0]">Pixel durumu bulunamadı.</p>;

  const healthColor = !stats ? "#A0A0A0" : stats.healthLevel === "good" ? "#AAFF01" : stats.healthLevel === "warning" ? "#FFA726" : "#ff8e8e";
  const maxCount = stats ? Math.max(...stats.events.map((e) => e.count), 1) : 1;

  return (
    <div className="space-y-4">
      {/* Health header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-4">
          {isStatsLoading ? (
            <div className="h-14 w-14 animate-pulse rounded-full bg-white/[0.08]" />
          ) : stats ? (
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx="28" cy="28" r="22" fill="none" stroke={healthColor} strokeWidth="6"
                  strokeDasharray={`${(stats.healthScore / 100) * 138.2} 138.2`} strokeLinecap="round" />
              </svg>
              <span className="text-sm font-bold" style={{ color: healthColor }}>{stats.healthScore}</span>
            </div>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-white">
              {stats ? (stats.pixelName ?? pixelStatus.pixelId ?? "—") : (pixelStatus.pixelId ?? "—")}
            </p>
            <p className="text-xs text-[#606060]">Pixel ID</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div><p className="text-[#606060]">Bağlantı</p><Badge variant="outline" className="mt-1">{pixelStatus.connectionStatus}</Badge></div>
          <div><p className="text-[#606060]">Ad Account</p><p className="mt-1 font-mono text-[#A0A0A0]">{pixelStatus.adAccountId ?? "—"}</p></div>
          <div><p className="text-[#606060]">Son Ateşleme</p><p className="mt-1 text-[#A0A0A0]">{stats?.lastFiredAt ? new Date(stats.lastFiredAt).toLocaleDateString("tr-TR") : "—"}</p></div>
        </div>
      </div>

      {/* Checklist + Events */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#606060]">Kurulum Kontrol Listesi</p>
          {isStatsLoading ? (
            <div className="space-y-3 pt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-white/[0.08]" />
                  <div className="h-3 w-36 animate-pulse rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ) : stats && stats.checklist.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {stats.checklist.map((item) => <PixelChecklistRow key={item.key} item={item} />)}
            </div>
          ) : (
            <>
              {pixelStatus.setupWarning && <p className="text-xs text-[#FFA726]">{pixelStatus.setupWarning}</p>}
              {pixelStatus.syncError && <p className="text-xs text-[#ff8e8e]">{pixelStatus.syncError}</p>}
              {!pixelStatus.setupWarning && !pixelStatus.syncError && (
                <p className="text-xs text-[#AAFF01]">Konfigürasyon sağlıklı görünüyor.</p>
              )}
            </>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#606060]">Son 7 Gün — Eventler</p>
          {isStatsLoading ? (
            <div className="space-y-3 pt-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-1.5 animate-pulse rounded-full bg-white/[0.04]" style={{ width: `${70 - i * 15}%` }} />
                </div>
              ))}
            </div>
          ) : stats && stats.events.length > 0 ? (
            <div className="space-y-3">
              {stats.events.map((ev) => (
                <div key={ev.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#d7d7d7]">{ev.name}</span>
                    <span className="tabular-nums text-[#606060]">{ev.count.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <div className="h-1.5 rounded-full bg-[#AAFF01]" style={{ width: `${(ev.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#A0A0A0]">
              {pixelStatus.eventStatus === "NOT_CONFIGURED" ? "Pixel ID tanımlı değil." : "Son 7 günde event bulunamadı."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Role Action Panels ──────────────── */
function SocialActionsPanel({
  taskTitle, setTaskTitle, taskDescription, setTaskDescription, replyBody, setReplyBody,
  lastMessage, canCreateTask, canInteractWorkspace, hasMetaAdsProject, isActionBusy, activeAction,
  onCreateTask, onCreateReportTask, onReply,
}: {
  taskTitle: string; setTaskTitle: (v: string) => void;
  taskDescription: string; setTaskDescription: (v: string) => void;
  replyBody: string; setReplyBody: (v: string) => void;
  lastMessage: string | null;
  canCreateTask: boolean; canInteractWorkspace: boolean; hasMetaAdsProject: boolean;
  isActionBusy: boolean; activeAction: string | null;
  onCreateTask: () => void; onCreateReportTask: () => void; onReply: () => void;
}) {
  return (
    <Card className="min-w-0 border-white/[0.06] bg-[#1A1A1A] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Social Aksiyonları</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Label className="text-xs text-[#606060]">Creative / Copy Task</Label>
          <Input placeholder="Görevi başlıkla tanımla..." value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)} className="h-9" />
          <Textarea placeholder="Açıklama (opsiyonel)" value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)} className="min-h-[64px] resize-none" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs"
              onClick={onCreateTask} disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}>
              Task Oluştur
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs"
              onClick={onCreateReportTask} disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}>
              Rapor Task'ı Aç
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-xs text-[#606060]">Müşteriye Cevap</Label>
          <Textarea placeholder="Müşteriye gönderilecek yanıt..." value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)} className="min-h-[64px] resize-none" />
          <Button type="button" size="sm" variant="outline" className="gap-2 text-xs"
            onClick={onReply} disabled={!canInteractWorkspace || !hasMetaAdsProject || isActionBusy}>
            <MessageSquare className="h-3.5 w-3.5" /> Mesaj Gönder
          </Button>
          {lastMessage ? (
            <p className="truncate text-xs text-[#505050]">Son: {lastMessage.slice(0, 80)}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function PerformanceActionsPanel({
  noteBody, setNoteBody, approvalCount, canInteractWorkspace, canCreateTask, canCreateApprovals,
  hasMetaAdsProject, isActionBusy, activeAction, onAddNote, onOptimizationTask, onApprovalTask,
}: {
  noteBody: string; setNoteBody: (v: string) => void;
  approvalCount: number; canInteractWorkspace: boolean; canCreateTask: boolean;
  canCreateApprovals: boolean; hasMetaAdsProject: boolean; isActionBusy: boolean;
  activeAction: string | null;
  onAddNote: () => void; onOptimizationTask: () => void; onApprovalTask: () => void;
}) {
  return (
    <Card className="min-w-0 border-white/[0.06] bg-[#1A1A1A] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Performance Aksiyonları</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Label className="text-xs text-[#606060]">Optimization Note</Label>
          <Textarea placeholder="Optimizasyon notu veya anomali bulgusu..." value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)} className="min-h-[64px] resize-none" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs"
              onClick={onAddNote} disabled={!canInteractWorkspace || !hasMetaAdsProject || isActionBusy}>
              {activeAction === "note" ? "Gönderiliyor..." : "Note Ekle"}
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs"
              onClick={onOptimizationTask} disabled={!canCreateTask || !hasMetaAdsProject || isActionBusy}>
              Optimization Task Aç
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-xs text-[#606060]">Budget / Campaign Change Approval</Label>
          <Button type="button" size="sm" variant="outline" className="gap-2 text-xs"
            onClick={onApprovalTask} disabled={!canCreateTask || !canCreateApprovals || !hasMetaAdsProject || isActionBusy}>
            <AlertCircle className="h-3.5 w-3.5" /> Onay Talebi Oluştur
          </Button>
          <p className="text-xs text-[#505050]">Bekleyen: {approvalCount} approval</p>
        </div>
      </div>
    </Card>
  );
}

function DesignerActionsPanel({
  metaAdsProjectId, tasks, canManageFiles, canCreateTask, canCreateApprovals,
  canUpdateTask, hasMetaAdsProject, isActionBusy, activeAction,
  onApprovalTask, onToggleTodo,
}: {
  metaAdsProjectId: string | null; tasks: Task[];
  canManageFiles: boolean; canCreateTask: boolean; canCreateApprovals: boolean;
  canUpdateTask: boolean; hasMetaAdsProject: boolean; isActionBusy: boolean;
  activeAction: string | null;
  onApprovalTask: () => void;
  onToggleTodo: (taskId: string, todo: TaskTodo) => void;
}) {
  return (
    <Card className="min-w-0 border-white/[0.06] bg-[#1A1A1A] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Designer Aksiyonları</h3>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 text-xs" disabled={!canManageFiles}>
          <Link to={metaAdsProjectId ? `/employee/dosyalar?projectId=${metaAdsProjectId}&serviceKey=META_ADS` : "/employee/dosyalar"}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Kreatif Asset Yükle
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="text-xs" disabled={!canManageFiles}>
          <Link to="/employee/teslim-dosyalari">Client Visible Paylaş</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" className="text-xs"
          onClick={onApprovalTask} disabled={!canCreateTask || !canCreateApprovals || !hasMetaAdsProject || isActionBusy}>
          Design Approval Task
        </Button>
      </div>
      {tasks.length > 0 ? (
        <div className="mt-4 space-y-2">
          {tasks
            .flatMap((t) => (t.todos ?? []).slice(0, 1).map((todo) => ({ taskId: t.id, todo })))
            .slice(0, 4)
            .map(({ taskId, todo }) => (
              <label key={todo.id} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm">
                <Checkbox checked={todo.isCompleted}
                  onCheckedChange={() => onToggleTodo(taskId, todo)}
                  disabled={!canUpdateTask || isActionBusy} />
                <span className="min-w-0 truncate">{todo.title}</span>
              </label>
            ))}
        </div>
      ) : null}
    </Card>
  );
}

/* ──────────────── Small helpers ──────────────── */
function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wide text-[#606060]">{label}</span>
      <span className={`font-medium text-xs ${highlight ? "text-white" : "text-[#A0A0A0]"}`}>{value}</span>
    </div>
  );
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <span className="block text-[10px] text-[#606060]">{label}</span>
      <span className="text-xs font-medium text-[#D8D8D8]">{value}</span>
    </div>
  );
}

function SpendBar({ spend, total }: { spend: number; total: number }) {
  const pct = total > 0 ? Math.min((spend / total) * 100, 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#AAFF01] to-[#AAFF01]/50 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "ACTIVE" ? "bg-[#AAFF01]/20 text-[#AAFF01]" :
    status === "PAUSED" ? "bg-yellow-400/15 text-yellow-300" :
    "bg-white/[0.08] text-[#A0A0A0]";
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {status}
    </span>
  );
}

function SkeletonList({ count, height = "h-20" }: { count: number; height?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} animate-pulse rounded-xl bg-white/[0.04]`} />
      ))}
    </div>
  );
}

/* ──────────────── Logic helpers ──────────────── */
function resolveWorkspaceMode(role: string | undefined): WorkspaceMode | null {
  if (role === "SOCIAL_MEDIA_SPECIALIST") return "social";
  if (role === "PERFORMANCE_SPECIALIST") return "performance";
  if (role === "DESIGNER") return "designer";
  return null;
}

function filterMetaAdsClients(clients: ClientProfile[]): ClientProfile[] {
  return clients.filter((c) =>
    (c.purchasedServices ?? []).some((s) => s.serviceKey === "meta-ads" && s.status === "ACTIVE"),
  );
}

function resolveNextTaskStatus(status: Task["status"]): Task["status"] | null {
  if (status === "TODO") return "IN_PROGRESS";
  if (status === "IN_PROGRESS") return "REVIEW";
  if (status === "REVIEW") return "DONE";
  return null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtNum(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

const WORKSPACE_VIEW_SECTION: Partial<Record<MetaAdsWorkspaceView, { label: string; key: keyof MetaAdsAiCommentary }>> = {
  campaigns: { label: "Kampanya Yorumu", key: "campaignHighlights" },
  kitleler: { label: "Kitle Yorumu", key: "audienceInsights" },
  creatives: { label: "Kreatif Yorumu", key: "creativeInsights" },
  performance: { label: "Performans Yorumu", key: "campaignHighlights" },
};

function WorkspaceAiCommentaryPanel({
  commentary,
  loading,
  activeView,
}: {
  commentary: MetaAdsAiCommentary | null;
  loading: boolean;
  activeView: MetaAdsWorkspaceView;
}) {
  const section = WORKSPACE_VIEW_SECTION[activeView];

  return (
    <div className="rounded-2xl border border-[#AAFF01]/20 bg-[#1A1A1A] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#AAFF01]" />
        <h3 className="text-sm font-semibold text-white">SocialTechAgent Yorumu</h3>
        {commentary?.isHeuristic && (
          <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#A0A0A0]">Heuristik</span>
        )}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="h-2.5 w-24 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : commentary ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 lg:col-span-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#AAFF01]/70">
              {section ? section.label : "Genel Analiz"}
            </p>
            <p className="text-xs leading-relaxed text-[#d7d7d7]">
              {section ? String(commentary[section.key]) : commentary.generalAnalysis}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#AAFF01]/70">Öneriler</p>
            <ul className="space-y-1.5">
              {commentary.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#A0A0A0]">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#AAFF01]" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#A0A0A0]">Analiz için yeterli veri bekleniyor.</p>
      )}
    </div>
  );
}
