import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  FileImage,
  FolderKanban,
  Layers,
  Link as LinkIcon,
  MonitorSmartphone,
  Palette,
  PenTool,
  RotateCcw,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetProjectFilesQuery, useGetProjectsQuery } from "../../features/projects/projectsApi";
import type { ProjectFile } from "../../features/projects/projectsTypes";
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from "../../features/projects/projectsUtils";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { Task } from "../../features/tasks/tasksTypes";
import {
  formatDate,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskCompletionPercent,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
} from "../../features/tasks/tasksUtils";
import {
  useGetAssignedClientWebMobileDesignConfigQuery,
  useGetAssignedClientWebMobileDesignSummaryQuery,
} from "../../features/clients/clientsApi";
import { useAppSelector } from "../../store/hooks";

type Tab = "overview" | "tasks" | "approvals" | "files" | "revisions";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Genel Bakış", icon: Layers },
  { id: "tasks", label: "Görevler", icon: FolderKanban },
  { id: "approvals", label: "Onaylar", icon: CheckCircle },
  { id: "files", label: "Dosyalar", icon: FileImage },
  { id: "revisions", label: "Revizyonlar", icon: RotateCcw },
];

export function WebMobileDesignCalismaAlani() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const {
    data: projectsResponse,
    isLoading: projectsLoading,
  } = useGetProjectsQuery();

  const designProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((p) => p.serviceKey === "web-mobile-design"),
    [projectsResponse?.data],
  );

  const clientIds = useMemo(
    () => [...new Set(designProjects.map((p) => p.clientProfileId).filter(Boolean))],
    [designProjects],
  );

  const activeClientId = selectedClientId || clientIds[0] || "";

  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    currentUser?.id ? { assigneeUserId: currentUser.id } : undefined,
    { skip: !currentUser?.id },
  );

  const allTasks = useMemo(
    () =>
      (tasksResponse?.data ?? []).filter(
        (task) => task.project?.serviceKey === "web-mobile-design",
      ),
    [tasksResponse?.data],
  );

  const clientTasks = useMemo(
    () =>
      activeClientId
        ? allTasks.filter((task) => {
            const project = designProjects.find((p) => p.id === task.projectId);
            return project?.clientProfileId === activeClientId;
          })
        : allTasks,
    [activeClientId, allTasks, designProjects],
  );

  const activeProject = designProjects.find((p) => p.clientProfileId === activeClientId) ?? null;

  const { data: filesResponse, isLoading: filesLoading } = useGetProjectFilesQuery(
    { projectId: activeProject?.id ?? "", limit: 20 },
    { skip: !activeProject?.id },
  );
  const files = filesResponse?.data ?? [];

  const {
    data: config,
    isLoading: configLoading,
  } = useGetAssignedClientWebMobileDesignConfigQuery(activeClientId, {
    skip: !activeClientId,
  });

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useGetAssignedClientWebMobileDesignSummaryQuery(activeClientId, {
    skip: !activeClientId,
  });

  const openTasks = clientTasks.filter((t) => t.status !== "DONE").length;
  const completedTasks = clientTasks.filter((t) => t.status === "DONE").length;
  const pendingApprovals = clientTasks.filter((t) => t.approvalStatus === "PENDING").length;
  const revisionTasks = clientTasks.filter((t) => t.type === "REVISION");
  const approvalTasks = clientTasks.filter((t) => t.approvalRequired);
  const progressPercent =
    clientTasks.length > 0 ? Math.round((completedTasks / clientTasks.length) * 100) : 0;

  const isLoading = projectsLoading || tasksLoading || configLoading || summaryLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Web & Mobil Tasarım</h1>
          <p className="text-[#A0A0A0]">
            Atanmış müşteri tasarım projeleri, UI görevleri, onaylar ve teslim dosyaları.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeProject?.figmaProjectUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={activeProject.figmaProjectUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Figma
              </a>
            </Button>
          ) : null}
          {config?.figmaFileUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={config.figmaFileUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Design File
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Client selector */}
      {clientIds.length > 1 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-[#A0A0A0]">Müşteri:</span>
            <div className="flex flex-wrap gap-2">
              {clientIds.map((clientId) => {
                const project = designProjects.find((p) => p.clientProfileId === clientId);
                return (
                  <button
                    key={clientId}
                    type="button"
                    onClick={() => setSelectedClientId(clientId)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      activeClientId === clientId
                        ? "border-[#AAFF01]/50 bg-[#AAFF01]/10 text-[#AAFF01]"
                        : "border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {project?.name ?? clientId.slice(0, 8)}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard icon={MonitorSmartphone} label="Proje" value={isLoading ? "—" : String(summary?.projects.length ?? designProjects.length)} accent="lime" />
        <KpiCard icon={FolderKanban} label="Açık Görev" value={isLoading ? "—" : String(openTasks)} accent="blue" />
        <KpiCard icon={CheckCircle} label="Onay Bekleyen" value={isLoading ? "—" : String(pendingApprovals)} accent={pendingApprovals > 0 ? "amber" : "muted"} />
        <KpiCard icon={RotateCcw} label="Revizyon" value={isLoading ? "—" : String(revisionTasks.length)} accent={revisionTasks.length > 0 ? "violet" : "muted"} />
      </div>

      {/* Progress */}
      {clientTasks.length > 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-[#A0A0A0]">Genel İlerleme</span>
            <span className="text-sm font-semibold text-[#AAFF01]">%{progressPercent}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#A0A0A0]">
            <span>Tamamlanan: {completedTasks}/{clientTasks.length}</span>
            <span>Onayda: {pendingApprovals}</span>
            <span>Revizyon: {revisionTasks.length}</span>
          </div>
        </Card>
      ) : null}

      {/* Tabs */}
      <div className="border-b border-white/[0.08]">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#AAFF01] text-[#AAFF01]"
                  : "border-transparent text-[#A0A0A0] hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "approvals" && pendingApprovals > 0 ? (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                  {pendingApprovals}
                </span>
              ) : null}
              {tab.id === "revisions" && revisionTasks.length > 0 ? (
                <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-xs text-violet-400">
                  {revisionTasks.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <OverviewTab
          config={config ?? null}
          summary={summary ?? null}
          projects={summary?.projects ?? designProjects.filter((p) => p.clientProfileId === activeClientId).map((p) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            priority: p.priority,
            figmaProjectUrl: p.figmaProjectUrl ?? null,
            startDate: p.startDate ?? null,
            dueDate: p.dueDate ?? null,
            taskCount: 0,
            fileCount: 0,
          }))}
          isLoading={isLoading}
        />
      ) : null}

      {activeTab === "tasks" ? (
        <TasksTab
          tasks={clientTasks}
          isLoading={tasksLoading}
          onRefetch={() => void refetchTasks()}
        />
      ) : null}

      {activeTab === "approvals" ? (
        <ApprovalsTab tasks={approvalTasks} isLoading={tasksLoading} />
      ) : null}

      {activeTab === "files" ? (
        <FilesTab files={files} isLoading={filesLoading} />
      ) : null}

      {activeTab === "revisions" ? (
        <RevisionsTab tasks={revisionTasks} isLoading={tasksLoading} />
      ) : null}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent = "muted",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "lime" | "blue" | "amber" | "violet" | "muted";
}) {
  const accentClasses = {
    lime: "text-[#AAFF01] bg-[#AAFF01]/10",
    blue: "text-blue-400 bg-blue-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    muted: "text-[#A0A0A0] bg-white/[0.04]",
  };

  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-[#A0A0A0]">{label}</div>
    </Card>
  );
}

function OverviewTab({
  config,
  summary,
  projects,
  isLoading,
}: {
  config: {
    figmaFileUrl: string | null;
    prototypeUrl: string | null;
    styleGuideUrl: string | null;
    designSystemStatus: string;
    primaryColor: string | null;
    secondaryColor: string | null;
    fontFamily: string | null;
    targetPlatforms: string[];
    gridSystem: string | null;
    notes: string | null;
  } | null;
  summary: {
    taskStats: { total: number; done: number; inProgress: number; review: number; blocked: number };
    approvalStats: { total: number; pending: number; approved: number };
    revisionCount: number;
    progressPercent: number;
    recentTasks: Array<{ id: string; title: string; status: string; priority: string; type: string; approvalStatus: string | null; approvalRequired: boolean; dueDate: string | null }>;
    recentFiles: Array<{ id: string; title: string; originalFileName: string; secureUrl: string; visibility: string; mimeType: string; approvalStatus: string | null; createdAt: string }>;
  } | null;
  projects: Array<{ id: string; name: string; status: string; priority: string; figmaProjectUrl: string | null; startDate: string | null; dueDate: string | null; taskCount: number; fileCount: number }>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingCard message="Tasarım verileri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Design Config */}
      {config ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AAFF01]/10">
              <Palette className="h-4 w-4 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Tasarım Konfigürasyonu</h2>
              <p className="text-xs text-[#A0A0A0]">Figma, prototip ve stil kılavuzu linkleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {config.figmaFileUrl ? (
              <a
                href={config.figmaFileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-3 py-2.5 text-sm text-[#AAFF01] hover:bg-[#AAFF01]/10 transition-colors"
              >
                <LinkIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">Figma Design File</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0" />
              </a>
            ) : null}
            {config.prototypeUrl ? (
              <a
                href={config.prototypeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Eye className="h-4 w-4 shrink-0" />
                <span className="truncate">Prototype</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0" />
              </a>
            ) : null}
            {config.styleGuideUrl ? (
              <a
                href={config.styleGuideUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5 text-sm text-violet-400 hover:bg-violet-500/10 transition-colors"
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span className="truncate">Style Guide</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0" />
              </a>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoItem label="Design System" value={
              config.designSystemStatus === "COMPLETED" ? "Tamamlandı" :
              config.designSystemStatus === "IN_PROGRESS" ? "Devam ediyor" :
              "Başlamadı"
            } />
            {config.fontFamily ? <InfoItem label="Yazı Tipi" value={config.fontFamily} /> : null}
            {config.gridSystem ? <InfoItem label="Grid" value={config.gridSystem} /> : null}
            {config.targetPlatforms.length > 0 ? (
              <InfoItem label="Hedef Platform" value={config.targetPlatforms.join(", ")} />
            ) : null}
          </div>

          {config.primaryColor || config.secondaryColor ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-[#A0A0A0]">Marka Renkleri:</span>
              {config.primaryColor ? (
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-full border border-white/10"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <span className="text-xs text-[#A0A0A0]">{config.primaryColor}</span>
                </div>
              ) : null}
              {config.secondaryColor ? (
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-full border border-white/10"
                    style={{ backgroundColor: config.secondaryColor }}
                  />
                  <span className="text-xs text-[#A0A0A0]">{config.secondaryColor}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {config.notes ? (
            <p className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-[#A0A0A0]">
              {config.notes}
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* Projects */}
      {projects.length > 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Projeler</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="min-w-0">
                  <p className="font-medium text-white">{project.name}</p>
                  <p className="mt-0.5 text-xs text-[#A0A0A0]">
                    {project.taskCount} görev · {project.fileCount} dosya
                    {project.dueDate ? ` · Deadline: ${formatDate(project.dueDate)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getProjectStatusBadgeClass(project.status as "PLANNED" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD")}>
                    {getProjectStatusLabel(project.status as "PLANNED" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD")}
                  </Badge>
                  {project.figmaProjectUrl ? (
                    <Button asChild variant="ghost" size="sm">
                      <a href={project.figmaProjectUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyCard title="Proje yok" description="Bu müşteri için henüz Web & Mobile Design projesi oluşturulmamış." />
      )}

      {/* Recent Tasks */}
      {summary && summary.recentTasks.length > 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Son Görevler</h2>
          <div className="space-y-2">
            {summary.recentTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{task.title}</p>
                  {task.dueDate ? (
                    <p className="mt-0.5 text-xs text-[#A0A0A0]">{formatDate(task.dueDate)}</p>
                  ) : null}
                </div>
                <Badge className={getTaskStatusBadgeClass(task.status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED")}>
                  {getTaskStatusLabel(task.status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function TasksTab({
  tasks,
  isLoading,
  onRefetch,
}: {
  tasks: Task[];
  isLoading: boolean;
  onRefetch: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => t.status !== "DONE");
    if (filter === "done") return tasks.filter((t) => t.status === "DONE");
    return tasks;
  }, [tasks, filter]);

  if (isLoading) return <LoadingCard message="Görevler yükleniyor..." />;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              filter === f
                ? "border-[#AAFF01]/50 bg-[#AAFF01]/10 text-[#AAFF01]"
                : "border-white/[0.08] text-[#A0A0A0] hover:text-white"
            }`}
          >
            {f === "all" ? "Tümü" : f === "active" ? "Aktif" : "Tamamlanan"}
            <span className="ml-1.5 text-xs opacity-60">
              {f === "all" ? tasks.length : f === "active"
                ? tasks.filter((t) => t.status !== "DONE").length
                : tasks.filter((t) => t.status === "DONE").length}
            </span>
          </button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onRefetch}>
          Yenile
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyCard title="Görev yok" description="Seçili filtreye uygun görev bulunamadı." />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="border-white/[0.06] bg-[#1A1A1A] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium text-white">{task.title}</p>
                    {task.type === "REVISION" ? (
                      <Badge className="border-violet-500/30 bg-violet-500/10 text-violet-400">
                        Revizyon
                      </Badge>
                    ) : null}
                    {task.approvalRequired && task.approvalStatus === "PENDING" ? (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                        Onay Bekliyor
                      </Badge>
                    ) : null}
                  </div>
                  {task.description ? (
                    <p className="text-sm text-[#A0A0A0] line-clamp-2">{task.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[#A0A0A0]">
                    {task.project?.name ?? "Tasarım projesi"}
                    {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getTaskStatusBadgeClass(task.status)}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                  <Badge className={getPriorityBadgeClass(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-[#A0A0A0]">
                  <span>İlerleme</span>
                  <span>%{getTaskCompletionPercent(task)}</span>
                </div>
                <Progress value={getTaskCompletionPercent(task)} className="h-1.5" />
              </div>
              <div className="mt-3">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/employee/gorevlerim/${task.id}`}>Görevi Aç</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalsTab({
  tasks,
  isLoading,
}: {
  tasks: Task[];
  isLoading: boolean;
}) {
  if (isLoading) return <LoadingCard message="Onaylar yükleniyor..." />;

  const pending = tasks.filter((t) => t.approvalStatus === "PENDING");
  const approved = tasks.filter(
    (t) => t.approvalStatus === "APPROVED" || t.approvalStatus === "ACKNOWLEDGED",
  );
  const changesRequested = tasks.filter((t) => t.approvalStatus === "CHANGES_REQUESTED");

  if (tasks.length === 0) {
    return <EmptyCard title="Onay görevi yok" description="Bu müşteri için henüz onaya gönderilmiş UI ekranı veya tasarım öğesi yok." />;
  }

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {pending.length > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            <Clock className="h-4 w-4" />
            {pending.length} onay bekliyor
          </div>
        ) : null}
        {changesRequested.length > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <RotateCcw className="h-4 w-4" />
            {changesRequested.length} revizyon istendi
          </div>
        ) : null}
        {approved.length > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-2 text-sm text-[#AAFF01]">
            <CheckCircle className="h-4 w-4" />
            {approved.length} onaylandı
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="border-white/[0.06] bg-[#1A1A1A] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-white">{task.title}</p>
                {task.description ? (
                  <p className="mt-1 text-sm text-[#A0A0A0]">{task.description}</p>
                ) : null}
                {task.dueDate ? (
                  <p className="mt-2 text-xs text-[#A0A0A0]">Deadline: {formatDate(task.dueDate)}</p>
                ) : null}
              </div>
              <ApprovalStatusBadge status={task.approvalStatus ?? null} />
            </div>
            <div className="mt-3">
              <Button asChild variant="outline" size="sm">
                <Link to={`/employee/gorevlerim/${task.id}`}>Detayı Aç</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ApprovalStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const configs: Record<string, { label: string; class: string }> = {
    PENDING: { label: "Onay Bekliyor", class: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
    APPROVED: { label: "Onaylandı", class: "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#AAFF01]" },
    ACKNOWLEDGED: { label: "Onaylandı", class: "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#AAFF01]" },
    CHANGES_REQUESTED: { label: "Revizyon İstendi", class: "border-red-500/30 bg-red-500/10 text-red-400" },
    REJECTED: { label: "Reddedildi", class: "border-red-500/30 bg-red-500/10 text-red-400" },
  };
  const config = configs[status] ?? { label: status, class: "border-white/[0.08] text-[#A0A0A0]" };
  return <Badge className={config.class}>{config.label}</Badge>;
}

function FilesTab({
  files,
  isLoading,
}: {
  files: ProjectFile[];
  isLoading: boolean;
}) {
  if (isLoading) return <LoadingCard message="Dosyalar yükleniyor..." />;

  if (files.length === 0) {
    return (
      <EmptyCard
        title="Dosya yok"
        description="Bu projeye henüz tasarım dosyası, Figma dışa aktarımı veya stil kılavuzu eklenmemiş."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
        <Card key={file.id} className="border-white/[0.06] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
            <FileImage className="h-5 w-5 text-[#A0A0A0]" />
          </div>
          <p className="truncate font-medium text-white">{file.title}</p>
          <p className="mt-0.5 truncate text-xs text-[#A0A0A0]">{file.originalFileName}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={file.visibility === "CLIENT_VISIBLE" ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#AAFF01]" : "border-white/[0.08] text-[#A0A0A0]"}>
              {file.visibility === "CLIENT_VISIBLE" ? "Müşteri Görünür" : "Dahili"}
            </Badge>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <a href={file.secureUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Dosyayı Aç
            </a>
          </Button>
        </Card>
      ))}
    </div>
  );
}

function RevisionsTab({
  tasks,
  isLoading,
}: {
  tasks: Task[];
  isLoading: boolean;
}) {
  if (isLoading) return <LoadingCard message="Revizyonlar yükleniyor..." />;

  if (tasks.length === 0) {
    return (
      <EmptyCard
        title="Revizyon görevi yok"
        description="Bu müşteri için aktif revizyon görevi bulunmuyor."
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="border-violet-500/10 bg-[#1A1A1A] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PenTool className="h-4 w-4 text-violet-400 shrink-0" />
                <p className="font-medium text-white">{task.title}</p>
              </div>
              {task.description ? (
                <p className="text-sm text-[#A0A0A0] line-clamp-2 ml-6">{task.description}</p>
              ) : null}
              {task.dueDate ? (
                <p className="mt-2 ml-6 text-xs text-[#A0A0A0]">Deadline: {formatDate(task.dueDate)}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getTaskStatusBadgeClass(task.status)}>
                {getTaskStatusLabel(task.status)}
              </Badge>
              <Badge className={getPriorityBadgeClass(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={getTaskCompletionPercent(task)} className="h-1.5" />
          </div>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link to={`/employee/gorevlerim/${task.id}`}>Revizyonu Aç</Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center">
      <p className="text-sm text-[#A0A0A0]">{message}</p>
    </Card>
  );
}

function EmptyCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-[#A0A0A0]">{description}</p>
    </Card>
  );
}
