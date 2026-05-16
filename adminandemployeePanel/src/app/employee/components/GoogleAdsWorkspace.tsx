import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, BarChart3, MessageSquare, RefreshCw, Search, Target, Zap } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { hasUserPermission, selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import type { ClientProfile, ClientsListQuery } from "../../features/clients/clientsTypes";
import {
  useGetAssignedClientGoogleAdsAdGroupsQuery,
  useGetAssignedClientGoogleAdsCampaignsQuery,
  useGetAssignedClientGoogleAdsConversionsQuery,
  useGetAssignedClientGoogleAdsKeywordsQuery,
  useGetAssignedClientGoogleAdsSearchTermsQuery,
  useGetAssignedClientGoogleAdsSummaryQuery,
  useSyncAssignedClientGoogleAdsMutation,
} from "../../features/googleAds/googleAdsApi";
import { useCreateProjectWorkspaceMessageMutation, useGetProjectWorkspaceMessagesQuery, useGetProjectsQuery } from "../../features/projects/projectsApi";
import { extractApiErrorMessage } from "../../features/projects/projectsUtils";
import { useCreateTaskMutation, useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { CreateTaskRequest, Task } from "../../features/tasks/tasksTypes";
import { useAppSelector } from "../../store/hooks";

type WorkspaceMode = "performance" | "project-manager" | "designer";

export type GoogleAdsWorkspaceView =
  | "overview"
  | "campaigns"
  | "keywords"
  | "search-terms"
  | "reports"
  | "approvals"
  | "tasks"
  | "messages"
  | "design";

type GoogleAdsWorkspaceProps = {
  initialView?: GoogleAdsWorkspaceView;
};

const ASSIGNED_CLIENTS_QUERY: ClientsListQuery = {
  status: "ACTIVE",
  limit: 100,
  sortBy: "name",
  sortOrder: "asc",
};

const VIEW_LABELS: Record<GoogleAdsWorkspaceView, string> = {
  overview: "Özet",
  campaigns: "Kampanyalar",
  keywords: "Anahtar Kelimeler",
  "search-terms": "Arama Terimleri",
  reports: "Raporlar",
  approvals: "Onaylar",
  tasks: "Görevler",
  messages: "Mesajlar",
  design: "Kreatifler",
};

const ROLE_VIEWS: Record<WorkspaceMode, readonly GoogleAdsWorkspaceView[]> = {
  performance: ["overview", "campaigns", "keywords", "search-terms", "reports", "approvals"],
  "project-manager": ["overview", "campaigns", "reports", "approvals", "tasks", "messages"],
  designer: ["overview", "design", "approvals", "reports"],
};

const ROLE_LABELS: Record<WorkspaceMode, string> = {
  performance: "Performance Specialist",
  "project-manager": "Project Manager",
  designer: "Designer",
};

const ROLE_DEFAULT_VIEW: Record<WorkspaceMode, GoogleAdsWorkspaceView> = {
  performance: "overview",
  "project-manager": "tasks",
  designer: "design",
};

const GOOGLE_ADS_APPROVAL_TYPE_OPTIONS: Array<{
  value: NonNullable<CreateTaskRequest["approvalType"]>;
  label: string;
}> = [
  { value: "GOOGLE_ADS_CAMPAIGN_APPROVAL", label: "Campaign Launch" },
  { value: "GOOGLE_ADS_BUDGET_CHANGE_APPROVAL", label: "Budget Change" },
  { value: "GOOGLE_ADS_KEYWORD_PLAN_APPROVAL", label: "Keyword Plan" },
  { value: "GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT", label: "Report Acknowledgement" },
  { value: "GOOGLE_ADS_STRATEGY_APPROVAL", label: "Strategy Approval" },
  { value: "GOOGLE_ADS_CREATIVE_APPROVAL", label: "Creative Approval" },
];

const ROLE_DEFAULT_APPROVAL_TYPE: Record<WorkspaceMode, NonNullable<CreateTaskRequest["approvalType"]>> = {
  performance: "GOOGLE_ADS_BUDGET_CHANGE_APPROVAL",
  "project-manager": "GOOGLE_ADS_CAMPAIGN_APPROVAL",
  designer: "GOOGLE_ADS_CREATIVE_APPROVAL",
};

export function GoogleAdsWorkspace({ initialView = "overview" }: GoogleAdsWorkspaceProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const workspaceMode = resolveWorkspaceMode(currentUser?.role);

  const canReadAssignedClients = hasUserPermission(currentUser, ["clients.read.assigned"]);
  const canReadGoogleAdsConfig = hasUserPermission(currentUser, ["googleAds.config.read.assigned"]);
  const canReadGoogleAdsReporting = hasUserPermission(currentUser, ["googleAds.reporting.read.assigned"]);
  const canManageGoogleAdsNotes = hasUserPermission(currentUser, ["googleAds.notes.manage.assigned"]);
  const canCreateGoogleAdsApprovals = hasUserPermission(currentUser, ["googleAds.approvals.create.assigned"]);
  const canReadGoogleAdsSync = hasUserPermission(currentUser, ["googleAds.sync.read.assigned"]);
  const canManageGoogleAdsRecommendations = hasUserPermission(currentUser, [
    "googleAds.recommendations.manage.assigned",
  ]);
  const canReadTasks = hasUserPermission(currentUser, ["tasks.read.assigned"]);
  const canManageTasks = hasUserPermission(currentUser, ["tasks.manage.assigned"]);
  const canInteractWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.interact.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.manage.any",
  ]);
  const canManageFiles = hasUserPermission(currentUser, [
    "projects.files.manage.assigned",
    "projects.files.manage.any",
  ]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeView, setActiveView] = useState<GoogleAdsWorkspaceView>(initialView);
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedApprovalType, setSelectedApprovalType] = useState<
    NonNullable<CreateTaskRequest["approvalType"]>
  >("GOOGLE_ADS_CAMPAIGN_APPROVAL");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: clientsResponse, isLoading: isClientsLoading, isFetching: isClientsFetching } =
    useGetClientsQuery(ASSIGNED_CLIENTS_QUERY, {
      skip: !canReadAssignedClients,
    });

  const googleAdsClients = useMemo(
    () => filterGoogleAdsClients(clientsResponse?.data ?? []),
    [clientsResponse?.data],
  );

  useEffect(() => {
    if (googleAdsClients.length === 0) {
      if (selectedClientId.length > 0) {
        setSelectedClientId("");
      }

      return;
    }

    if (selectedClientId.length === 0) {
      setSelectedClientId(googleAdsClients[0].id);
      return;
    }

    if (!googleAdsClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(googleAdsClients[0].id);
    }
  }, [googleAdsClients, selectedClientId]);

  const selectedClient = useMemo(
    () => googleAdsClients.find((client) => client.id === selectedClientId) ?? null,
    [googleAdsClients, selectedClientId],
  );

  const shouldSkipReportingQueries = !canReadGoogleAdsReporting || selectedClientId.length === 0;

  const { data: summary, isLoading: isSummaryLoading } = useGetAssignedClientGoogleAdsSummaryQuery(
    { clientId: selectedClientId },
    { skip: shouldSkipReportingQueries },
  );
  const { data: campaigns, isLoading: isCampaignsLoading } = useGetAssignedClientGoogleAdsCampaignsQuery(
    { clientId: selectedClientId, query: { limit: 8 } },
    { skip: shouldSkipReportingQueries },
  );
  const { data: keywords } = useGetAssignedClientGoogleAdsKeywordsQuery(
    { clientId: selectedClientId, query: { limit: 10 } },
    { skip: shouldSkipReportingQueries },
  );
  const { data: searchTerms } = useGetAssignedClientGoogleAdsSearchTermsQuery(
    { clientId: selectedClientId, query: { limit: 10 } },
    { skip: shouldSkipReportingQueries },
  );
  const { data: conversions } = useGetAssignedClientGoogleAdsConversionsQuery(
    { clientId: selectedClientId, query: { limit: 8 } },
    { skip: shouldSkipReportingQueries },
  );
  const { data: adGroups } = useGetAssignedClientGoogleAdsAdGroupsQuery(
    { clientId: selectedClientId, query: { limit: 12 } },
    { skip: shouldSkipReportingQueries },
  );

  const { data: projectsResponse } = useGetProjectsQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 },
  );

  const googleAdsProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((project) => project.serviceKey === "google-ads"),
    [projectsResponse?.data],
  );

  const googleAdsProjectId = googleAdsProjects[0]?.id ?? null;

  const { data: tasksResponse } = useGetTasksQuery(
    selectedClientId.length > 0 ? { clientProfileId: selectedClientId } : undefined,
    { skip: selectedClientId.length === 0 || !canReadTasks },
  );

  const googleAdsProjectIds = useMemo(
    () => new Set(googleAdsProjects.map((project) => project.id)),
    [googleAdsProjects],
  );

  const googleAdsTasks = useMemo(
    () => (tasksResponse?.data ?? []).filter((task) => googleAdsProjectIds.has(task.projectId)),
    [tasksResponse?.data, googleAdsProjectIds],
  );

  const approvalTasks = useMemo(
    () =>
      googleAdsTasks.filter(
        (task) => task.approvalRequired || task.status === "REVIEW" || task.type === "REVISION",
      ),
    [googleAdsTasks],
  );
  const pendingApprovalTasks = useMemo(
    () => approvalTasks.filter((task) => task.approvalStatus === "PENDING"),
    [approvalTasks],
  );
  const approvalHistoryTasks = useMemo(
    () => approvalTasks.filter((task) => task.approvalStatus && task.approvalStatus !== "PENDING"),
    [approvalTasks],
  );

  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    {
      projectId: googleAdsProjectId ?? "",
      tabKey: "MESSAGES",
    },
    {
      skip: !canInteractWorkspace || !googleAdsProjectId,
    },
  );

  const [syncGoogleAds, { isLoading: isSyncing }] = useSyncAssignedClientGoogleAdsMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [createWorkspaceMessage, { isLoading: isCreatingMessage }] =
    useCreateProjectWorkspaceMessageMutation();

  useEffect(() => {
    if (!workspaceMode) {
      return;
    }

    setSelectedApprovalType(ROLE_DEFAULT_APPROVAL_TYPE[workspaceMode]);
  }, [workspaceMode]);

  if (!workspaceMode) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu rol için Google Ads employee workspace tanımlı değil.
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

  if (!canReadGoogleAdsConfig) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Google Ads yapılandırmasını görüntülemek için `googleAds.config.read.assigned` izni gereklidir.
      </Card>
    );
  }

  if (!canReadGoogleAdsReporting) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Google Ads raporlarını görüntülemek için `googleAds.reporting.read.assigned` izni gereklidir.
      </Card>
    );
  }

  const allowedViews = ROLE_VIEWS[workspaceMode];
  const currentView = allowedViews.includes(activeView) ? activeView : ROLE_DEFAULT_VIEW[workspaceMode];

  const conversionValue = conversions?.data.reduce((total, item) => total + (item.conversionValue ?? 0), 0) ?? 0;
  const lowCtrRows = (adGroups?.data ?? []).filter((item) => item.ctr < 1.2);
  const busiestCampaign = campaigns?.data[0] ?? null;
  const isActionBusy = isSyncing || isCreatingTask || isCreatingMessage;

  async function handleCreateTask(
    action: "optimization" | "report" | "approval" | "recommendation" | "report-ack",
  ) {
    if (!googleAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Bu müşteri için `serviceKey=GOOGLE_ADS` proje bulunamadı.",
      });
      return;
    }

    const fallbackTitle =
      action === "optimization"
        ? "Google Ads optimization task"
        : action === "report"
          ? "Google Ads reporting task"
          : action === "report-ack"
            ? "Google Ads report acknowledgement request"
          : action === "approval"
            ? "Google Ads approval request"
            : "Google Ads recommendation";

    const isApprovalRequest = action === "approval" || action === "report-ack";
    const approvalType =
      action === "report-ack" ? "GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT" : selectedApprovalType;
    const taskTypeByAction: Record<typeof action, CreateTaskRequest["type"]> = {
      optimization: "FEATURE",
      report: "FEATURE",
      approval: "REVISION",
      recommendation: "FEATURE",
      "report-ack": "QA",
    };

    if (isApprovalRequest && !canCreateGoogleAdsApprovals) {
      setFeedback({
        type: "error",
        text: "Onay talebi için `googleAds.approvals.create.assigned` izni gereklidir.",
      });
      return;
    }

    const body: CreateTaskRequest = {
      projectId: googleAdsProjectId,
      title: taskTitle.trim().length > 0 ? taskTitle.trim() : fallbackTitle,
      description: noteBody.trim().length > 0 ? noteBody.trim() : undefined,
      status: isApprovalRequest ? "REVIEW" : "TODO",
      priority: isApprovalRequest ? "HIGH" : "MEDIUM",
      type: taskTypeByAction[action],
      workstream: "FULLSTACK",
      approvalRequired: isApprovalRequest,
      approvalType: isApprovalRequest ? approvalType : undefined,
      approvalStatus: isApprovalRequest ? "PENDING" : undefined,
    };

    try {
      setActiveAction(action);
      setFeedback(null);
      await createTask(body).unwrap();
      setTaskTitle("");
      if (action !== "report") {
        setNoteBody("");
      }
      setFeedback({ type: "success", text: "Google Ads görevi oluşturuldu." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Google Ads görevi oluşturulamadı."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateWorkspaceNote() {
    if (!googleAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Bu müşteri için `serviceKey=GOOGLE_ADS` proje bulunamadı.",
      });
      return;
    }

    if (!noteBody.trim()) {
      setFeedback({ type: "error", text: "Not içeriği boş olamaz." });
      return;
    }

    try {
      setActiveAction("note");
      setFeedback(null);
      await createWorkspaceMessage({
        projectId: googleAdsProjectId,
        tabKey: "MESSAGES",
        body: noteBody.trim(),
        isInternal: true,
      }).unwrap();
      setNoteBody("");
      setFeedback({ type: "success", text: "Google Ads notu eklendi." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Google Ads notu eklenemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleSendMessage() {
    if (!googleAdsProjectId) {
      setFeedback({
        type: "error",
        text: "Bu müşteri için `serviceKey=GOOGLE_ADS` proje bulunamadı.",
      });
      return;
    }

    if (!messageBody.trim()) {
      setFeedback({ type: "error", text: "Mesaj boş olamaz." });
      return;
    }

    try {
      setActiveAction("message");
      setFeedback(null);
      await createWorkspaceMessage({
        projectId: googleAdsProjectId,
        tabKey: "MESSAGES",
        body: messageBody.trim(),
        isInternal: false,
      }).unwrap();
      setMessageBody("");
      setFeedback({ type: "success", text: "Müşteri mesajı gönderildi." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Mesaj gönderilemedi."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleSync() {
    if (!selectedClientId) {
      return;
    }

    try {
      setActiveAction("sync");
      setFeedback(null);
      await syncGoogleAds({ clientId: selectedClientId }).unwrap();
      setFeedback({ type: "success", text: "Google Ads sync tamamlandı." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(error, "Google Ads sync başlatılamadı."),
      });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Google Ads Service Workspace</p>
            <h1 className="text-2xl font-semibold text-white">{ROLE_LABELS[workspaceMode]} Workspace</h1>
            <p className="text-sm text-[#A0A0A0]">
              Workspace sadece assigned client + ACTIVE GOOGLE_ADS service + `serviceKey=GOOGLE_ADS` project
              scope'unda çalışır.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-white/[0.12] bg-transparent text-white"
            onClick={() => void handleSync()}
            disabled={!canReadGoogleAdsSync || isSyncing || !selectedClientId}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
        </div>
      </Card>

      {feedback ? (
        <Card
          className={
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 p-4 text-red-200"
          }
        >
          {feedback.text}
        </Card>
      ) : null}

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/[0.14] text-[#D8D8D8]">Assigned Google Ads Clients</Badge>
          <Badge variant="outline" className="border-white/[0.14] text-[#D8D8D8]">
            {googleAdsClients.length} müşteri
          </Badge>
          {isClientsLoading || isClientsFetching ? (
            <Badge variant="outline" className="border-white/[0.14] text-[#A0A0A0]">
              Yükleniyor...
            </Badge>
          ) : null}
        </div>

        {googleAdsClients.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">
            Assigned scope içinde `ACTIVE GOOGLE_ADS` servisi olan müşteri bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {googleAdsClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  className={`rounded-lg px-3 py-2 text-sm border transition-colors ${
                    selectedClientId === client.id
                      ? "bg-[#AAFF01]/10 border-[#AAFF01]/30 text-[#DFFF9E]"
                      : "bg-[#131313] border-white/[0.08] text-[#A0A0A0] hover:text-white"
                  }`}
                >
                  {client.companyName}
                </button>
              ))}
            </div>
            {selectedClient ? (
              <p className="text-xs text-[#A0A0A0]">Aktif müşteri: {selectedClient.companyName}</p>
            ) : null}
          </div>
        )}
      </Card>

      {googleAdsClients.length > 0 ? (
        <>
          <Card className="border-white/[0.08] bg-[#1A1A1A] p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {allowedViews.map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`rounded-lg px-3 py-2 text-sm border transition-colors ${
                    currentView === view
                      ? "bg-[#AAFF01]/10 border-[#AAFF01]/30 text-[#DFFF9E]"
                      : "bg-[#131313] border-white/[0.08] text-[#A0A0A0] hover:text-white"
                  }`}
                >
                  {VIEW_LABELS[view]}
                </button>
              ))}
            </div>

            {currentView === "overview" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <MetricCard label="Spend" value={summary ? formatCurrency(summary.cost) : "—"} />
                  <MetricCard
                    label="Dönüşüm"
                    value={summary ? formatNumber(summary.conversions) : "—"}
                  />
                  <MetricCard label="CTR" value={summary ? `%${summary.ctr.toFixed(2)}` : "—"} />
                  <MetricCard
                    label="Conversion Value"
                    value={formatCurrency(conversionValue)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="border-white/[0.08] bg-[#131313] p-4">
                    <h3 className="font-medium text-white">Performance & Optimization</h3>
                    <p className="mt-2 text-sm text-[#A0A0A0]">
                      {busiestCampaign
                        ? `${busiestCampaign.name} kampanyası en yüksek spend ile öne çıkıyor.`
                        : "Henüz kampanya verisi yok."}
                    </p>
                    <p className="mt-2 text-sm text-[#A0A0A0]">
                      Düşük CTR anomalisi: {lowCtrRows.length} satır
                    </p>
                  </Card>

                  <Card className="border-white/[0.08] bg-[#131313] p-4">
                    <h3 className="font-medium text-white">Öneriler & Notlar</h3>
                    <p className="mt-2 text-sm text-[#A0A0A0]">
                      Optimization note ve recommendation aksiyonları bu panelden task olarak açılabilir.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleCreateTask("optimization")}
                        disabled={!canManageTasks || isActionBusy}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Optimization Task
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-white/[0.14] bg-transparent text-white"
                        onClick={() => void handleCreateTask("recommendation")}
                        disabled={!canManageGoogleAdsRecommendations || !canManageTasks || isActionBusy}
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Recommendation
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}

            {currentView === "campaigns" ? (
              <div className="space-y-3">
                <h3 className="font-medium text-white">Kampanya Performansı</h3>
                {isCampaignsLoading ? (
                  <p className="text-sm text-[#A0A0A0]">Kampanyalar yükleniyor...</p>
                ) : (campaigns?.data ?? []).length === 0 ? (
                  <p className="text-sm text-[#A0A0A0]">Kampanya verisi bulunamadı.</p>
                ) : (
                  <div className="space-y-2">
                    {(campaigns?.data ?? []).map((campaign) => (
                      <Card key={campaign.id} className="border-white/[0.08] bg-[#131313] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-white">{campaign.name}</p>
                            <p className="text-xs text-[#A0A0A0]">
                              {campaign.channelType} • {campaign.status}
                            </p>
                          </div>
                          <div className="text-right text-xs text-[#A0A0A0]">
                            <p>Spend: {formatCurrency(campaign.cost)}</p>
                            <p>Clicks: {formatNumber(campaign.clicks)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {currentView === "keywords" ? (
              <div className="space-y-3">
                <h3 className="font-medium text-white">Anahtar Kelime Performansı</h3>
                {(keywords?.data ?? []).length === 0 ? (
                  <p className="text-sm text-[#A0A0A0]">Anahtar kelime verisi bulunamadı.</p>
                ) : (
                  <div className="space-y-2">
                    {(keywords?.data ?? []).slice(0, 8).map((row) => (
                      <Card key={row.id} className="border-white/[0.08] bg-[#131313] p-3">
                        <p className="text-sm font-medium text-white">{row.keywordText}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {row.matchType} • CTR %{row.ctr.toFixed(2)} • Cost {formatCurrency(row.cost)}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {currentView === "search-terms" ? (
              <div className="space-y-3">
                <h3 className="font-medium text-white">Arama Terimleri</h3>
                {(searchTerms?.data ?? []).length === 0 ? (
                  <p className="text-sm text-[#A0A0A0]">Arama terimi verisi bulunamadı.</p>
                ) : (
                  <div className="space-y-2">
                    {(searchTerms?.data ?? []).slice(0, 8).map((row) => (
                      <Card key={row.id} className="border-white/[0.08] bg-[#131313] p-3">
                        <p className="text-sm font-medium text-white">{row.searchTerm}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          Clicks {formatNumber(row.clicks)} • Conversions {formatNumber(row.conversions)}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {currentView === "reports" ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Raporlama</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Campaign summary, search terms ve conversion snapshot bilgileri rapor prep için kullanılabilir.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="border-white/[0.08] bg-[#131313] p-4">
                    <p className="text-sm text-[#A0A0A0]">Toplam conversion value</p>
                    <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(conversionValue)}</p>
                  </Card>
                  <Card className="border-white/[0.08] bg-[#131313] p-4">
                    <p className="text-sm text-[#A0A0A0]">Son sync</p>
                    <p className="mt-1 text-lg font-semibold text-white">{formatDateTime(summary?.lastSyncAt)}</p>
                  </Card>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleCreateTask("report")}
                    disabled={!canManageTasks || isActionBusy}
                  >
                    Rapor Task Oluştur
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/[0.14] bg-transparent text-white"
                    onClick={() => void handleCreateTask("report-ack")}
                    disabled={!canManageTasks || !canCreateGoogleAdsApprovals || isActionBusy}
                  >
                    Report Ack Talebi
                  </Button>
                </div>
              </div>
            ) : null}

            {currentView === "approvals" ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Onaylar</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Pending approvals: {pendingApprovalTasks.length}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="google-ads-approval-type">Onay tipi</Label>
                  <select
                    id="google-ads-approval-type"
                    value={selectedApprovalType}
                    onChange={(event) =>
                      setSelectedApprovalType(
                        event.target.value as NonNullable<CreateTaskRequest["approvalType"]>,
                      )
                    }
                    className="w-full rounded-md border border-white/[0.12] bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-[#AAFF01]/40"
                  >
                    {GOOGLE_ADS_APPROVAL_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={() => void handleCreateTask("approval")}
                  disabled={!canCreateGoogleAdsApprovals || !canManageTasks || isActionBusy}
                >
                  Onay Talebi Oluştur
                </Button>
                {pendingApprovalTasks.length === 0 ? (
                  <p className="text-sm text-[#A0A0A0]">Bekleyen onay kaydı bulunmuyor.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingApprovalTasks.slice(0, 8).map((task) => (
                      <ApprovalTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
                {approvalHistoryTasks.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Onay Geçmişi</p>
                    {approvalHistoryTasks.slice(0, 8).map((task) => (
                      <ApprovalTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentView === "tasks" ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Project / Task Workspace</h3>
                <div className="space-y-2">
                  <Label htmlFor="google-ads-task-title">Task Başlığı</Label>
                  <Input
                    id="google-ads-task-title"
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="Örn: Haftalık bütçe pacing kontrolü"
                  />
                  <Button
                    type="button"
                    onClick={() => void handleCreateTask("optimization")}
                    disabled={!canManageTasks || isActionBusy}
                  >
                    Task Oluştur
                  </Button>
                </div>
                <div className="space-y-2">
                  {googleAdsTasks.length === 0 ? (
                    <p className="text-sm text-[#A0A0A0]">Google Ads scope'unda görev bulunamadı.</p>
                  ) : (
                    googleAdsTasks.slice(0, 8).map((task) => <TaskRow key={task.id} task={task} />)
                  )}
                </div>
              </div>
            ) : null}

            {currentView === "messages" ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Client Messages</h3>
                <div className="space-y-2">
                  {(workspaceMessages ?? []).length === 0 ? (
                    <p className="text-sm text-[#A0A0A0]">Bu proje için mesaj bulunmuyor.</p>
                  ) : (
                    (workspaceMessages ?? []).slice(0, 8).map((message) => (
                      <Card key={message.id} className="border-white/[0.08] bg-[#131313] p-3 text-sm text-[#D8D8D8]">
                        {message.body}
                      </Card>
                    ))
                  )}
                </div>
                <Textarea
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="Müşteriye yanıt bırakın"
                />
                <Button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={!canInteractWorkspace || isActionBusy}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mesaj Gönder
                </Button>
              </div>
            ) : null}

            {currentView === "design" ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Creative / Design Assets</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Display asset talepleri, onay bekleyen kreatifler ve client-visible tasarım paylaşımları.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleCreateTask("approval")}
                    disabled={!canCreateGoogleAdsApprovals || !canManageTasks || isActionBusy}
                  >
                    Design Approval Request
                  </Button>
                  {googleAdsProjectId ? (
                    <Button asChild type="button" variant="outline" className="border-white/[0.14] bg-transparent text-white">
                      <Link to={`/employee/dosyalar?projectId=${googleAdsProjectId}&serviceKey=GOOGLE_ADS`}>
                        Kreatif Asset Yükle
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/[0.14] bg-transparent text-white"
                      disabled
                    >
                      Kreatif Asset Yükle
                    </Button>
                  )}
                </div>
                {!canManageFiles ? (
                  <p className="text-xs text-orange-300">
                    `projects.files.manage.assigned` izni olmadan dosya yükleme aksiyonları pasif kalır.
                  </p>
                ) : null}
              </div>
            ) : null}
          </Card>

          <Card className="border-white/[0.08] bg-[#1A1A1A] p-5 space-y-3">
            <h3 className="font-medium text-white">Optimization Notes</h3>
            <Textarea
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="Optimization notu veya anomaly değerlendirmesi"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/[0.14] bg-transparent text-white"
                onClick={() => void handleCreateWorkspaceNote()}
                disabled={!canManageGoogleAdsNotes || !canInteractWorkspace || isActionBusy}
              >
                <Search className="mr-2 h-4 w-4" />
                Note Kaydet
              </Button>
              <Button
                type="button"
                onClick={() => void handleCreateTask("optimization")}
                disabled={!canManageTasks || isActionBusy}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Task Oluştur
              </Button>
            </div>
            <p className="text-xs text-[#A0A0A0]">
              Aktif işlem: {activeAction ?? "yok"} • Summary loading: {isSummaryLoading ? "evet" : "hayır"}
            </p>
          </Card>
        </>
      ) : null}

      {!canReadGoogleAdsSync ? (
        <Card className="border-orange-500/30 bg-orange-500/10 p-4 text-orange-200 text-sm">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          Sync aksiyonu için `googleAds.sync.read.assigned` izni gereklidir.
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-white/[0.08] bg-[#131313] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-[#A0A0A0]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <Card className="border-white/[0.08] bg-[#131313] p-3">
      <p className="text-sm font-medium text-white">{task.title}</p>
      <p className="text-xs text-[#A0A0A0]">
        {task.status} • {task.priority}
      </p>
    </Card>
  );
}

function ApprovalTaskCard({ task }: { task: Task }) {
  return (
    <Card className="border-white/[0.08] bg-[#131313] p-3">
      <p className="text-sm font-medium text-white">{task.title}</p>
      <p className="text-xs text-[#A0A0A0]">
        {task.status} • {task.type} • approval: {task.approvalRequired ? "yes" : "no"}
      </p>
      {task.approvalType ? (
        <p className="mt-1 text-xs text-[#D7FFC2]">
          Tip: {getGoogleAdsApprovalTypeLabel(task.approvalType)}
        </p>
      ) : null}
      {task.approvalStatus ? (
        <p className="mt-1 text-xs text-[#A0A0A0]">
          Durum: {getGoogleAdsApprovalStatusLabel(task.approvalStatus)}
        </p>
      ) : null}
      {task.approvalResponseNote ? (
        <p className="mt-1 text-xs text-orange-200">Not: {task.approvalResponseNote}</p>
      ) : null}
    </Card>
  );
}

function getGoogleAdsApprovalTypeLabel(value: string): string {
  const option = GOOGLE_ADS_APPROVAL_TYPE_OPTIONS.find((item) => item.value === value);
  if (option) {
    return option.label;
  }

  return value.replace("GOOGLE_ADS_", "").replace(/_/g, " ");
}

function getGoogleAdsApprovalStatusLabel(value: string): string {
  if (value === "PENDING") {
    return "Müşteri Aksiyonu Bekleniyor";
  }
  if (value === "APPROVED") {
    return "Onaylandı";
  }
  if (value === "ACKNOWLEDGED") {
    return "Okundu";
  }
  if (value === "CHANGES_REQUESTED") {
    return "Revizyon İstendi";
  }
  if (value === "REJECTED") {
    return "Reddedildi";
  }
  return value;
}

function resolveWorkspaceMode(role: string | undefined): WorkspaceMode | null {
  if (role === "PERFORMANCE_SPECIALIST") {
    return "performance";
  }

  if (role === "PROJECT_MANAGER") {
    return "project-manager";
  }

  if (role === "DESIGNER") {
    return "designer";
  }

  return null;
}

function filterGoogleAdsClients(clients: ClientProfile[]): ClientProfile[] {
  return clients.filter((client) =>
    (client.purchasedServices ?? []).some(
      (service) => service.serviceKey === "google-ads" && service.status === "ACTIVE",
    ),
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
