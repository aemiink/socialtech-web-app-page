import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  BarChart2,
  ExternalLink,
  FolderKanban,
  Globe,
  KeyRound,
  MonitorCheck,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { Task, TaskStatus } from "../../features/tasks/tasksTypes";
import {
  formatDate,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskCompletionPercent,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
} from "../../features/tasks/tasksUtils";
import {
  useGetAssignedClientSeoAuditConfigQuery,
  useGetAssignedClientSeoAuditSummaryQuery,
} from "../../features/clients/clientsApi";
import type {
  AdminClientSeoAuditConfig,
  AdminSeoAuditSummary,
} from "../../features/clients/clientsTypes";
import { useAppSelector } from "../../store/hooks";

type Tab =
  | "overview"
  | "technical-issues"
  | "keywords"
  | "page-speed"
  | "index-status"
  | "search-console"
  | "action-plan";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Genel Bakış", icon: FolderKanban },
  { id: "technical-issues", label: "Teknik Hatalar", icon: AlertTriangle },
  { id: "keywords", label: "Anahtar Kelimeler", icon: KeyRound },
  { id: "page-speed", label: "Sayfa Hızı", icon: Zap },
  { id: "index-status", label: "Dizin Durumu", icon: MonitorCheck },
  { id: "search-console", label: "Search Console", icon: BarChart2 },
  { id: "action-plan", label: "Aksiyon Planı", icon: TrendingUp },
];

function matchesKeywords(task: Task, keywords: string[]): boolean {
  const text = `${task.title} ${task.description ?? ""}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

function filterTasksByTab(tabId: Tab, tasks: Task[]): Task[] {
  switch (tabId) {
    case "technical-issues":
      return tasks.filter((t) =>
        matchesKeywords(t, ["teknik", "hata", "error", "broken", "404", "redirect"]),
      );
    case "keywords":
      return tasks.filter((t) =>
        matchesKeywords(t, ["keyword", "anahtar", "kelime", "sıralama", "ranking"]),
      );
    case "page-speed":
      return tasks.filter((t) =>
        matchesKeywords(t, ["hız", "speed", "core web vitals", "lcp", "cls", "fid", "inp"]),
      );
    case "index-status":
      return tasks.filter((t) =>
        matchesKeywords(t, ["index", "dizin", "crawl", "sitemap", "robots"]),
      );
    case "search-console":
      return tasks.filter((t) =>
        matchesKeywords(t, ["search console", "gsc", "impression", "click", "ctr"]),
      );
    case "action-plan":
      return tasks.filter((t) => t.status !== "DONE");
    default:
      return tasks;
  }
}

export function SEOAuditCalismaAlani() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const { data: projectsResponse, isLoading: projectsLoading } = useGetProjectsQuery();

  const seoProjects = useMemo(
    () =>
      (projectsResponse?.data ?? []).filter((p) => p.serviceKey === "seo-audit"),
    [projectsResponse?.data],
  );

  const clientIds = useMemo(
    () => [...new Set(seoProjects.map((p) => p.clientProfileId).filter(Boolean))],
    [seoProjects],
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
        (task) => task.project?.serviceKey === "seo-audit",
      ),
    [tasksResponse?.data],
  );

  const clientTasks = useMemo(
    () =>
      activeClientId
        ? allTasks.filter((task) => {
            const project = seoProjects.find((p) => p.id === task.projectId);
            return project?.clientProfileId === activeClientId;
          })
        : allTasks,
    [activeClientId, allTasks, seoProjects],
  );

  const { data: config, isLoading: configLoading } =
    useGetAssignedClientSeoAuditConfigQuery(activeClientId, {
      skip: !activeClientId,
    });

  const { data: summary, isLoading: summaryLoading } =
    useGetAssignedClientSeoAuditSummaryQuery(activeClientId, {
      skip: !activeClientId,
    });

  const openTasks = clientTasks.filter((t) => t.status !== "DONE").length;
  const doneTasks = clientTasks.filter((t) => t.status === "DONE").length;
  const technicalErrors = clientTasks.filter((t) =>
    matchesKeywords(t, ["teknik", "hata", "error", "broken"]),
  ).length;
  const pendingActions = clientTasks.filter((t) => t.approvalStatus === "PENDING").length;
  const progressPercent =
    clientTasks.length > 0 ? Math.round((doneTasks / clientTasks.length) * 100) : 0;

  const isLoading = projectsLoading || tasksLoading || configLoading || summaryLoading;

  const tabTasks = useMemo(
    () => (activeTab === "overview" ? clientTasks : filterTasksByTab(activeTab, clientTasks)),
    [activeTab, clientTasks],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">SEO Audit</h1>
          <p className="text-[#A0A0A0]">
            Teknik SEO analizi, anahtar kelime takibi ve arama performansı yönetimi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {config?.siteUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={config.siteUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Siteye Git
              </a>
            </Button>
          ) : null}
          {config?.searchConsolePropertyUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={config.searchConsolePropertyUrl} target="_blank" rel="noreferrer">
                <Search className="mr-2 h-4 w-4" />
                Search Console
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
                const project = seoProjects.find((p) => p.clientProfileId === clientId);
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
        <KpiCard
          icon={Globe}
          label="SEO Skoru"
          value={isLoading ? "—" : config?.lastAuditScore !== null && config?.lastAuditScore !== undefined ? `${config.lastAuditScore}` : "—"}
          accent="lime"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Teknik Hata"
          value={isLoading ? "—" : String(technicalErrors)}
          accent={technicalErrors > 0 ? "amber" : "muted"}
        />
        <KpiCard
          icon={FolderKanban}
          label="Açık Görev"
          value={isLoading ? "—" : String(openTasks)}
          accent="blue"
        />
        <KpiCard
          icon={TrendingUp}
          label="Aksiyon"
          value={isLoading ? "—" : String(pendingActions)}
          accent={pendingActions > 0 ? "violet" : "muted"}
        />
      </div>

      {/* Progress */}
      {clientTasks.length > 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-[#A0A0A0]">Görev İlerlemesi</span>
            <span className="text-sm font-semibold text-[#AAFF01]">%{progressPercent}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#A0A0A0]">
            <span>Açık: {openTasks}</span>
            <span>Tamamlanan: {doneTasks}/{clientTasks.length}</span>
            <span>Anahtar Kelime: {config?.targetKeywords?.length ?? 0}</span>
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
              {tab.id === "technical-issues" && technicalErrors > 0 ? (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                  {technicalErrors}
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
          clientTasks={clientTasks}
          isLoading={isLoading}
        />
      ) : (
        <TaskListTab
          tabId={activeTab}
          tasks={tabTasks}
          isLoading={tasksLoading}
          onRefetch={() => void refetchTasks()}
        />
      )}
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
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}
      >
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
  clientTasks,
  isLoading,
}: {
  config: AdminClientSeoAuditConfig | null;
  summary: AdminSeoAuditSummary | null;
  clientTasks: Task[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingCard message="SEO audit verileri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* SEO Config */}
      {config ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AAFF01]/10">
              <Search className="h-4 w-4 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">SEO Konfigürasyonu</h2>
              <p className="text-xs text-[#A0A0A0]">Site URL, audit sıklığı ve hedef anahtar kelimeler</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {config.auditFrequency ? (
              <InfoItem label="Audit Sıklığı" value={config.auditFrequency} />
            ) : null}
            {config.lastAuditScore !== null ? (
              <InfoItem
                label="Son Audit Skoru"
                value={String(config.lastAuditScore)}
                highlight
              />
            ) : null}
            {config.targetKeywords.length > 0 ? (
              <InfoItem
                label="Hedef Kelime"
                value={`${config.targetKeywords.length} adet`}
              />
            ) : null}
            {config.gaPropertyId ? (
              <InfoItem label="GA Mülk ID" value={config.gaPropertyId} />
            ) : null}
          </div>

          {config.siteUrl ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={config.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-3 py-2.5 text-sm text-[#AAFF01] hover:bg-[#AAFF01]/10 transition-colors"
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-xs">{config.siteUrl}</span>
              </a>
              {config.searchConsolePropertyUrl ? (
                <a
                  href={config.searchConsolePropertyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <BarChart2 className="h-4 w-4 shrink-0" />
                  <span>Search Console</span>
                </a>
              ) : null}
            </div>
          ) : null}

          {config.targetKeywords.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">
                Hedef Anahtar Kelimeler
              </p>
              <div className="flex flex-wrap gap-2">
                {config.targetKeywords.slice(0, 12).map((kw) => (
                  <span
                    key={kw}
                    className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-[#A0A0A0]"
                  >
                    {kw}
                  </span>
                ))}
                {config.targetKeywords.length > 12 ? (
                  <span className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-[#A0A0A0]">
                    +{config.targetKeywords.length - 12} daha
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {config.notes ? (
            <p className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-[#A0A0A0]">
              {config.notes}
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* Summary from API */}
      {summary ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Hizmet Özeti</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatBox label="Toplam Görev" value={summary.taskStats.total} color="white" />
            <StatBox label="Devam Ediyor" value={summary.taskStats.inProgress} color="blue" />
            <StatBox label="Tamamlanan" value={summary.taskStats.done} color="lime" />
            <StatBox label="İlerleme" value={`%${summary.progressPercent}`} color="amber" />
          </div>

          {summary.recentTasks.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">
                Son Görevler
              </p>
              <div className="space-y-2">
                {summary.recentTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{task.title}</p>
                      {task.dueDate ? (
                        <p className="mt-0.5 text-xs text-[#A0A0A0]">{formatDate(task.dueDate)}</p>
                      ) : null}
                    </div>
                    <Badge className={getTaskStatusBadgeClass(task.status as TaskStatus)}>
                      {getTaskStatusLabel(task.status as TaskStatus)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* Local tasks fallback */}
      {!summary && clientTasks.length > 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Atanmış Görevler</h2>
          <div className="space-y-3">
            {clientTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <p className="truncate text-sm text-white">{task.title}</p>
                <Badge className={getTaskStatusBadgeClass(task.status)}>
                  {getTaskStatusLabel(task.status)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!summary && clientTasks.length === 0 && !isLoading ? (
        <EmptyCard
          title="Görev bulunamadı"
          description="Bu müşteri için SEO audit görevi henüz atanmamış."
        />
      ) : null}
    </div>
  );
}

function TaskListTab({
  tabId,
  tasks,
  isLoading,
  onRefetch,
}: {
  tabId: Tab;
  tasks: Task[];
  isLoading: boolean;
  onRefetch: () => void;
}) {
  if (isLoading) {
    return <LoadingCard message="Görevler yükleniyor..." />;
  }

  const tabLabels: Record<Tab, string> = {
    "overview": "Genel Bakış",
    "technical-issues": "teknik hata",
    "keywords": "anahtar kelime görevi",
    "page-speed": "sayfa hızı görevi",
    "index-status": "dizin durumu görevi",
    "search-console": "search console görevi",
    "action-plan": "aksiyon",
  };

  if (tasks.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onRefetch}>
            Yenile
          </Button>
        </div>
        <EmptyCard
          title={`${tabLabels[tabId] ?? "Görev"} bulunamadı`}
          description="Bu kategoride görüntülenecek görev yok."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#A0A0A0]">{tasks.length} görev listeleniyor</span>
        <Button variant="ghost" size="sm" onClick={onRefetch}>
          Yenile
        </Button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="border-white/[0.06] bg-[#1A1A1A] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{task.title}</p>
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
                  {task.project?.name ?? "SEO Audit projesi"}
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
    </div>
  );
}

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className={`mt-1 text-sm font-medium ${highlight ? "text-[#AAFF01]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: "lime" | "amber" | "blue" | "white";
}) {
  const colorClass = {
    lime: "text-[#AAFF01]",
    amber: "text-amber-400",
    blue: "text-blue-400",
    white: "text-white",
  }[color];

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-[#A0A0A0]">{label}</p>
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

