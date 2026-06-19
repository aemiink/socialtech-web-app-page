import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Code,
  Layers,
  ListChecks,
  MessageCircle,
  Play,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { ClientTaskStatus } from "../../features/tasks/tasksTypes";
import { useGetClientTasksQuery } from "../../features/tasks/tasksApi";
import type {
  WorkspaceRevisionStatus,
  WorkspaceSourceSprint,
} from "../../features/webAppWorkspace/webAppWorkspaceTypes";
import { useGetWebAppWorkspaceQuery } from "../../features/webAppWorkspace/webAppWorkspaceApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTurkishDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 border-l-2 ${color}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
          <Icon className="h-4 w-4 text-[#CFCFCF]" />
        </div>
      </div>
      {loading ? (
        <SkeletonBlock className="h-8 w-16" />
      ) : (
        <p className="text-3xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

const REVISION_STATUS_CONFIG: Record<WorkspaceRevisionStatus, { label: string; className: string }> = {
  REQUESTED:       { label: "Talep Edildi",       className: "border-amber-400/25 bg-amber-400/10 text-amber-300" },
  ACKNOWLEDGED:    { label: "Görüldü",             className: "border-[#00D4FF]/25 bg-[#00D4FF]/10 text-[#00D4FF]" },
  IN_PROGRESS:     { label: "Devam Ediyor",        className: "border-[#7B61FF]/25 bg-[#7B61FF]/10 text-[#9B85FF]" },
  READY_FOR_REVIEW:{ label: "İncelemeye Hazır",    className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300" },
  APPROVED:        { label: "Onaylandı",           className: "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#AAFF01]" },
  REJECTED:        { label: "Reddedildi",          className: "border-red-400/25 bg-red-400/10 text-red-300" },
  CANCELLED:       { label: "İptal",               className: "border-white/[0.12] bg-white/[0.04] text-[#606060]" },
};

const TASK_STATUS_CONFIG: Record<ClientTaskStatus, { label: string; count: number; color: string; bg: string }> = {
  TODO:        { label: "Yapılacak",     count: 0, color: "text-[#A0A0A0]", bg: "border-white/[0.10] bg-white/[0.04]" },
  IN_PROGRESS: { label: "Devam Ediyor", count: 0, color: "text-[#7B61FF]",  bg: "border-[#7B61FF]/20 bg-[#7B61FF]/[0.07]" },
  REVIEW:      { label: "İncelemede",   count: 0, color: "text-amber-300",  bg: "border-amber-400/20 bg-amber-400/[0.07]" },
  BLOCKED:     { label: "Engelleyici",  count: 0, color: "text-red-300",    bg: "border-red-400/20 bg-red-400/[0.07]" },
  DONE:        { label: "Tamamlanan",   count: 0, color: "text-[#AAFF01]",  bg: "border-[#AAFF01]/20 bg-[#AAFF01]/[0.07]" },
};

const PROJECT_STATUS_BADGE: Record<string, string> = {
  ACTIVE:      "bg-[#AAFF01]/10 border-[#AAFF01]/25 text-[#AAFF01]",
  IN_PROGRESS: "bg-[#00D4FF]/10 border-[#00D4FF]/25 text-[#00D4FF]",
  ON_HOLD:     "bg-amber-400/10 border-amber-400/25 text-amber-300",
  COMPLETED:   "bg-white/[0.05] border-white/[0.12] text-[#A0A0A0]",
  PLANNING:    "bg-[#7B61FF]/10 border-[#7B61FF]/25 text-[#9B85FF]",
};

const PROJECT_PRIORITY_BADGE: Record<string, string> = {
  URGENT: "bg-red-400/10 border-red-400/25 text-red-300",
  HIGH:   "bg-amber-400/10 border-amber-400/25 text-amber-300",
  MEDIUM: "bg-[#00D4FF]/10 border-[#00D4FF]/25 text-[#00D4FF]",
  LOW:    "bg-white/[0.05] border-white/[0.12] text-[#A0A0A0]",
};

type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

const SPRINT_STATUS_CONFIG: Record<SprintStatus, { label: string; className: string }> = {
  PLANNED:   { label: "Planlandı",     className: "border-white/[0.15] bg-white/[0.05] text-[#A0A0A0]" },
  ACTIVE:    { label: "Aktif",         className: "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#AAFF01]" },
  COMPLETED: { label: "Tamamlandı",   className: "border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#00D4FF]" },
  CANCELLED: { label: "İptal",        className: "border-red-400/20 bg-red-400/[0.05] text-red-400/70" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function WebAppDashboard({ projectId }: { projectId?: string | null }) {
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useGetClientTasksQuery(projectId ? { projectId } : undefined);

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useGetWebAppWorkspaceQuery(
    { projectId: projectId ?? "", tabKey: "OVERVIEW" },
    { skip: !projectId },
  );

  const isLoading = isTasksLoading || isWorkspaceLoading;
  const isError   = isTasksError || isWorkspaceError;

  const scopedTasks = tasks.filter((t) => !projectId || t.projectId === projectId);

  // Sprint data
  const sprints: WorkspaceSourceSprint[] = workspace?.sourceOfTruth?.sprints ?? [];
  const activeSprint  = sprints.find((s) => s.status === "ACTIVE") ?? null;

  // A task counts as "effectively done" when its status is DONE
  // OR when all its todos are checked (progressPercent === 100) — matching Sprint Durumu logic.
  const isEffectivelyDone = (t: { status: string; progressPercent: number }) =>
    t.status === "DONE" || (t.progressPercent >= 100 && t.status !== "BLOCKED");

  // Progress: scope to active sprint tasks if available, else all tasks
  const sprintTasks = activeSprint
    ? scopedTasks.filter((t) => (t as { sprintId?: string | null }).sprintId === activeSprint.id)
    : scopedTasks;
  const progressBase    = sprintTasks.length > 0 ? sprintTasks : scopedTasks;
  const completedTasks  = progressBase.filter(isEffectivelyDone).length;
  const inProgressTasks = scopedTasks.filter((t) => t.status === "IN_PROGRESS" && !isEffectivelyDone(t)).length;
  const blockedTasks    = scopedTasks.filter((t) => t.status === "BLOCKED").length;
  const progress        = progressBase.length > 0
    ? Math.round((completedTasks / progressBase.length) * 100)
    : 0;

  // Status breakdown chips — mirror the same effective-done logic so counts are consistent
  const statusCounts = (Object.keys(TASK_STATUS_CONFIG) as ClientTaskStatus[]).map((status) => ({
    status,
    ...TASK_STATUS_CONFIG[status],
    count:
      status === "DONE"
        ? scopedTasks.filter(isEffectivelyDone).length
        : status === "IN_PROGRESS"
        ? scopedTasks.filter((t) => t.status === "IN_PROGRESS" && !isEffectivelyDone(t)).length
        : scopedTasks.filter((t) => t.status === status && !isEffectivelyDone(t)).length,
  }));

  const project       = workspace?.project;
  const latestRevs    = (workspace?.revisions ?? []).slice(0, 5);
  const latestMsgs    = (workspace?.messages  ?? []).filter((m) => !m.isInternal).slice(0, 5);

  return (
    <div className="space-y-6 p-8">
      {/* Page header */}
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">Web Uygulama Geliştirme</h1>
        <p className="text-[#A0A0A0]">Proje ilerleme ve iş durumu görünümü</p>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          Veri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </div>
      )}

      {/* No-project state */}
      {!projectId && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1A1A1A] py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Layers className="h-8 w-8 text-[#404040]" />
          </div>
          <p className="text-sm font-medium text-[#A0A0A0]">Proje seçilmedi</p>
          <p className="mt-1 text-xs text-[#606060]">Bu görünümü kullanmak için lütfen bir proje seçin.</p>
        </div>
      )}

      {/* Hero project card */}
      {project && (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#101010] p-8">
          {/* Ambient blur */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#AAFF01]/[0.04] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-[#7B61FF]/[0.06] blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {project.status && PROJECT_STATUS_BADGE[project.status] && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${PROJECT_STATUS_BADGE[project.status]}`}>
                    {project.status === "ACTIVE" ? "Aktif" :
                     project.status === "IN_PROGRESS" ? "Devam Ediyor" :
                     project.status === "ON_HOLD" ? "Beklemede" :
                     project.status === "COMPLETED" ? "Tamamlandı" :
                     project.status === "PLANNING" ? "Planlama" : project.status}
                  </span>
                )}
                {project.priority && PROJECT_PRIORITY_BADGE[project.priority] && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${PROJECT_PRIORITY_BADGE[project.priority]}`}>
                    {project.priority === "URGENT" ? "Acil" :
                     project.priority === "HIGH" ? "Yüksek" :
                     project.priority === "MEDIUM" ? "Orta" : "Düşük"}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
              {project.description && (
                <p className="mt-2 text-sm text-[#A0A0A0]">{project.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-[#A0A0A0]">
              {project.startDate && (
                <span>Başlangıç: {formatTurkishDate(project.startDate)}</span>
              )}
              {project.dueDate && (
                <span className="text-amber-300">Son Tarih: {formatTurkishDate(project.dueDate)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={ListChecks}    label="Toplam Görev"  value={scopedTasks.length} color="border-l-[#00D4FF]" loading={isLoading} />
        <KpiCard icon={CheckCircle2}  label="Tamamlanan"    value={completedTasks}     color="border-l-[#AAFF01]" loading={isLoading} />
        <KpiCard icon={Play}          label="Devam Eden"    value={inProgressTasks}    color="border-l-[#7B61FF]" loading={isLoading} />
        <KpiCard icon={AlertTriangle} label="Engelleyici"   value={blockedTasks}       color="border-l-[#FFA726]" loading={isLoading} />
      </div>

      {/* Progress bar */}
      {projectId && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#A0A0A0]" />
              <span className="text-sm font-medium text-[#CFCFCF]">
                {activeSprint ? `Sprint İlerlemesi · ${activeSprint.name}` : "Proje İlerlemesi"}
              </span>
            </div>
            <span className="text-lg font-bold text-[#AAFF01]">%{progress}</span>
          </div>
          {isLoading ? (
            <SkeletonBlock className="h-2 w-full" />
          ) : (
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-2 rounded-full bg-[#AAFF01] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Status breakdown */}
          {!isLoading && scopedTasks.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {statusCounts.map(({ status, label, count, color, bg }) => (
                <div key={status} className={`rounded-xl border ${bg} px-3 py-2 text-center`}>
                  <p className={`text-lg font-bold ${color}`}>{count}</p>
                  <p className="mt-0.5 text-[11px] text-[#A0A0A0]">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sprint list */}
      {projectId && !isWorkspaceLoading && sprints.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#A0A0A0]" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#CFCFCF]">Sprintler</h3>
            </div>
            <span className="text-xs text-[#606060]">{sprints.length} sprint</span>
          </div>
          <div className="space-y-2">
            {sprints.map((sprint) => {
              const isActive    = sprint.status === "ACTIVE";
              const isCompleted = sprint.status === "COMPLETED";
              const cfg = SPRINT_STATUS_CONFIG[sprint.status as SprintStatus] ?? SPRINT_STATUS_CONFIG.PLANNED;
              return (
                <div
                  key={sprint.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isActive
                      ? "border-[#AAFF01]/20 bg-[#AAFF01]/[0.03]"
                      : isCompleted
                      ? "border-[#00D4FF]/10 bg-[#00D4FF]/[0.02]"
                      : "border-white/[0.08] bg-[#202020]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white">{sprint.name}</p>
                        {isActive && (
                          <span className="inline-block h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-[#AAFF01]" />
                        )}
                        {isCompleted && (
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-[#00D4FF]" />
                        )}
                      </div>
                      {sprint.goal && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-[#A0A0A0]">{sprint.goal}</p>
                      )}
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#606060]">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {formatTurkishDate(sprint.startDate)} – {formatTurkishDate(sprint.endDate)}
                        </span>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sprint empty state (only when project exists and workspace loaded) */}
      {projectId && !isWorkspaceLoading && sprints.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] px-5 py-4">
          <Zap className="h-4 w-4 flex-shrink-0 text-[#404040]" />
          <p className="text-sm text-[#606060]">Henüz sprint oluşturulmamış.</p>
        </div>
      )}

      {/* Project links */}
      {(project?.repositoryUrl || project?.figmaProjectUrl) && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-sm font-semibold text-[#CFCFCF] uppercase tracking-wide">Proje Bağlantıları</h3>
          <div className="flex flex-wrap gap-3">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/[0.10] bg-[#202020] px-4 py-3 text-sm text-white transition-colors hover:border-white/20 hover:bg-[#252525]"
              >
                <Code className="h-4 w-4 text-[#A0A0A0]" />
                GitHub Repo
              </a>
            )}
            {project.figmaProjectUrl && (
              <a
                href={project.figmaProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/[0.10] bg-[#202020] px-4 py-3 text-sm text-white transition-colors hover:border-white/20 hover:bg-[#252525]"
              >
                <Layers className="h-4 w-4 text-[#A0A0A0]" />
                Figma Prototipi
              </a>
            )}
          </div>
        </div>
      )}

      {/* Revisions + Messages */}
      {projectId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent revisions */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Son Revizyonlar</h2>
              <CalendarDays className="h-4 w-4 text-[#A0A0A0]" />
            </div>

            {isWorkspaceLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                    <SkeletonBlock className="mb-2 h-4 w-3/4" />
                    <SkeletonBlock className="h-3 w-1/4" />
                  </div>
                ))}
              </div>
            )}

            {!isWorkspaceLoading && latestRevs.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <CalendarDays className="mb-2 h-8 w-8 text-[#303030]" />
                <p className="text-sm text-[#A0A0A0]">Revizyon kaydı bulunmuyor.</p>
              </div>
            )}

            <div className="space-y-2">
              {latestRevs.map((revision) => {
                const cfg = REVISION_STATUS_CONFIG[revision.status];
                return (
                  <div key={revision.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">{revision.title}</p>
                      <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                      {revision.task?.code && (
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px]">
                          {revision.task.code}
                        </span>
                      )}
                      <Clock className="h-3 w-3" />
                      <span>{formatRelative(revision.requestedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent messages */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Son Mesajlar</h2>
              <MessageCircle className="h-4 w-4 text-[#A0A0A0]" />
            </div>

            {isWorkspaceLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                    <SkeletonBlock className="mb-2 h-3 w-1/3" />
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="mt-1 h-4 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {!isWorkspaceLoading && latestMsgs.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <MessageCircle className="mb-2 h-8 w-8 text-[#303030]" />
                <p className="text-sm text-[#A0A0A0]">Henüz mesaj bulunmuyor.</p>
              </div>
            )}

            <div className="space-y-2">
              {latestMsgs.map((msg) => {
                const author = msg.author?.displayName ?? "Social Tech Ekibi";
                const isAgency = msg.author?.role === "EMPLOYEE" || msg.author?.role === "ADMIN";
                return (
                  <div key={msg.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#7B61FF]/20 text-[10px] font-bold text-[#9B85FF]">
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-[#CFCFCF]">{author}</span>
                      {isAgency && (
                        <span className="rounded-full border border-[#7B61FF]/25 bg-[#7B61FF]/10 px-2 py-0.5 text-[10px] text-[#9B85FF]">
                          Ajans
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-[#606060]">{formatRelative(msg.createdAt)}</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-[#CFCFCF]">{msg.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
