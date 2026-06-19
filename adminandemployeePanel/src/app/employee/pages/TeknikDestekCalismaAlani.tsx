import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  FileText,
  FolderKanban,
  Headphones,
  RefreshCw,
  Shield,
  ShieldCheck,
  Wrench,
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
  useGetAssignedClientTechnicalSupportConfigQuery,
  useGetAssignedClientTechnicalSupportSummaryQuery,
} from "../../features/clients/clientsApi";
import type {
  AdminClientTechnicalSupportConfig,
  AdminTechnicalSupportSummary,
} from "../../features/clients/clientsTypes";
import { useAppSelector } from "../../store/hooks";

type Tab =
  | "overview"
  | "open-tickets"
  | "resolved"
  | "maintenance"
  | "security"
  | "backup"
  | "updates";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Genel Bakış", icon: FolderKanban },
  { id: "open-tickets", label: "Açık Talepler", icon: Headphones },
  { id: "resolved", label: "Çözülenler", icon: CheckCircle },
  { id: "maintenance", label: "Bakım", icon: Wrench },
  { id: "security", label: "Güvenlik", icon: Shield },
  { id: "backup", label: "Yedekleme", icon: FileText },
  { id: "updates", label: "Güncellemeler", icon: RefreshCw },
];

function matchesKeywords(task: Task, keywords: string[]): boolean {
  const text = `${task.title} ${task.description ?? ""}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

function filterTasksByTab(tabId: Tab, tasks: Task[]): Task[] {
  switch (tabId) {
    case "open-tickets":
      return tasks.filter((t) => t.status !== "DONE");
    case "resolved":
      return tasks.filter((t) => t.status === "DONE");
    case "maintenance":
      return tasks.filter((t) => matchesKeywords(t, ["bakım", "maintenance", "periyodik"]));
    case "security":
      return tasks.filter((t) =>
        matchesKeywords(t, ["güvenlik", "security", "ssl", "firewall", "sertifika"]),
      );
    case "backup":
      return tasks.filter((t) =>
        matchesKeywords(t, ["yedek", "backup", "yedekleme", "restore"]),
      );
    case "updates":
      return tasks.filter((t) =>
        matchesKeywords(t, ["güncelleme", "update", "upgrade", "patch"]),
      );
    default:
      return tasks;
  }
}

export function TeknikDestekCalismaAlani() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const { data: projectsResponse, isLoading: projectsLoading } = useGetProjectsQuery();

  const supportProjects = useMemo(
    () =>
      (projectsResponse?.data ?? []).filter((p) => p.serviceKey === "technical-support"),
    [projectsResponse?.data],
  );

  const clientIds = useMemo(
    () => [...new Set(supportProjects.map((p) => p.clientProfileId).filter(Boolean))],
    [supportProjects],
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
        (task) => task.project?.serviceKey === "technical-support",
      ),
    [tasksResponse?.data],
  );

  const clientTasks = useMemo(
    () =>
      activeClientId
        ? allTasks.filter((task) => {
            const project = supportProjects.find((p) => p.id === task.projectId);
            return project?.clientProfileId === activeClientId;
          })
        : allTasks,
    [activeClientId, allTasks, supportProjects],
  );

  const { data: config, isLoading: configLoading } =
    useGetAssignedClientTechnicalSupportConfigQuery(activeClientId, {
      skip: !activeClientId,
    });

  const { data: summary, isLoading: summaryLoading } =
    useGetAssignedClientTechnicalSupportSummaryQuery(activeClientId, {
      skip: !activeClientId,
    });

  const openTickets = clientTasks.filter((t) => t.status !== "DONE").length;
  const resolvedTickets = clientTasks.filter((t) => t.status === "DONE").length;
  const maintenanceTasks = clientTasks.filter((t) =>
    matchesKeywords(t, ["bakım", "maintenance"]),
  ).length;
  const pendingApprovals = clientTasks.filter((t) => t.approvalStatus === "PENDING").length;
  const progressPercent =
    clientTasks.length > 0
      ? Math.round((resolvedTickets / clientTasks.length) * 100)
      : 0;

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
          <h1 className="mb-1 text-2xl font-semibold text-white">Teknik Destek</h1>
          <p className="text-[#A0A0A0]">
            Atanmış müşteri teknik destek talepleri, bakım görevleri ve güvenlik izleme.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {config?.supportPortalUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={config.supportPortalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Destek Portalı
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
                const project = supportProjects.find((p) => p.clientProfileId === clientId);
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
          icon={Headphones}
          label="Açık Talep"
          value={isLoading ? "—" : String(openTickets)}
          accent={openTickets > 0 ? "amber" : "muted"}
        />
        <KpiCard
          icon={CheckCircle}
          label="Çözülen"
          value={isLoading ? "—" : String(resolvedTickets)}
          accent="lime"
        />
        <KpiCard
          icon={Wrench}
          label="Bakım Görevi"
          value={isLoading ? "—" : String(maintenanceTasks)}
          accent="blue"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Onay Bekleyen"
          value={isLoading ? "—" : String(pendingApprovals)}
          accent={pendingApprovals > 0 ? "violet" : "muted"}
        />
      </div>

      {/* Progress */}
      {clientTasks.length > 0 ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-[#A0A0A0]">Çözüm İlerlemesi</span>
            <span className="text-sm font-semibold text-[#AAFF01]">%{progressPercent}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#A0A0A0]">
            <span>Açık: {openTickets}</span>
            <span>Çözülen: {resolvedTickets}/{clientTasks.length}</span>
            <span>Onay Bekleyen: {pendingApprovals}</span>
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
              {tab.id === "open-tickets" && openTickets > 0 ? (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                  {openTickets}
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
  config: AdminClientTechnicalSupportConfig | null;
  summary: AdminTechnicalSupportSummary | null;
  clientTasks: Task[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingCard message="Teknik destek verileri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Support Config */}
      {config ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AAFF01]/10">
              <ShieldCheck className="h-4 w-4 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Destek Konfigürasyonu</h2>
              <p className="text-xs text-[#A0A0A0]">SLA, izleme ve bakım planı bilgileri</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {config.slaLevel ? (
              <InfoItem label="SLA Seviyesi" value={config.slaLevel} />
            ) : null}
            <InfoItem
              label="İzleme"
              value={config.monitoringEnabled ? "Aktif" : "Pasif"}
              highlight={config.monitoringEnabled}
            />
            {config.backupFrequency ? (
              <InfoItem label="Yedekleme" value={config.backupFrequency} />
            ) : null}
            {config.uptimeTarget !== null ? (
              <InfoItem label="Uptime Hedef" value={`%${config.uptimeTarget}`} />
            ) : null}
            {config.maintenanceWindowDay ? (
              <InfoItem
                label="Bakım Günü"
                value={`${config.maintenanceWindowDay}${config.maintenanceWindowTime ? ` ${config.maintenanceWindowTime}` : ""}`}
              />
            ) : null}
          </div>

          {config.supportPortalUrl ? (
            <div className="mt-4">
              <a
                href={config.supportPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-3 py-2.5 text-sm text-[#AAFF01] hover:bg-[#AAFF01]/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">Destek Portalına Git</span>
              </a>
            </div>
          ) : null}

          {config.notes ? (
            <p className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-[#A0A0A0]">
              {config.notes}
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* Summary stats from API */}
      {summary ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Hizmet Özeti</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatBox label="Açık Talep" value={summary.openTicketCount} color="amber" />
            <StatBox label="Çözülen" value={summary.resolvedTicketCount} color="lime" />
            <StatBox label="Toplam Görev" value={summary.taskStats.total} color="white" />
            <StatBox label="İlerleme" value={`%${summary.progressPercent}`} color="blue" />
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
                    <Badge
                      className={getTaskStatusBadgeClass(task.status as TaskStatus)}
                    >
                      {getTaskStatusLabel(task.status as TaskStatus)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* Local tasks if no summary */}
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
          description="Bu müşteri için teknik destek görevi henüz atanmamış."
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
    "open-tickets": "açık talep",
    "resolved": "çözülen görev",
    "maintenance": "bakım görevi",
    "security": "güvenlik görevi",
    "backup": "yedekleme görevi",
    "updates": "güncelleme görevi",
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
                  {task.project?.name ?? "Teknik Destek projesi"}
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

