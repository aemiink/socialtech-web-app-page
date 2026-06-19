import { useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  FolderKanban,
  RotateCcw,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useMeQuery } from '../features/auth/authApi';
import { useGetClientTasksQuery } from '../features/tasks/tasksApi';
import { useGetClientProjectsQuery } from '../features/projects/projectsApi';
import { Button } from '../components/button';
import type { ClientTask } from '../features/tasks/tasksTypes';

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function taskStatusLabel(status: ClientTask['status']): string {
  switch (status) {
    case 'TODO': return 'başlatılmadı';
    case 'IN_PROGRESS': return 'devam ediyor';
    case 'REVIEW': return 'incelemede';
    case 'DONE': return 'tamamlandı';
    case 'BLOCKED': return 'bloke';
    default: return status;
  }
}

function taskKindColor(task: ClientTask): string {
  if (task.approvalRequired) return 'bg-[#AAFF01]';
  if (task.type === 'REVISION') return 'bg-[#7B61FF]';
  if (task.status === 'DONE') return 'bg-[#60A5FA]';
  return 'bg-white/40';
}

export function OverviewPage() {
  const { data: me, isLoading: meLoading } = useMeQuery();
  const { data: tasks = [], isLoading: tasksLoading } = useGetClientTasksQuery();
  const { data: projects = [], isLoading: projectsLoading } = useGetClientProjectsQuery();

  const isLoading = meLoading || tasksLoading || projectsLoading;

  const pendingApprovals = useMemo(
    () => tasks.filter((t) => t.approvalRequired && t.approvalStatus === 'PENDING'),
    [tasks],
  );
  const openTasks = useMemo(() => tasks.filter((t) => t.status !== 'DONE'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === 'DONE'), [tasks]);
  const revisionTasks = useMemo(() => tasks.filter((t) => t.type === 'REVISION' && t.status !== 'DONE'), [tasks]);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentlyDone = useMemo(
    () =>
      doneTasks.filter(
        (t) => t.updatedAt && new Date(t.updatedAt).getTime() > sevenDaysAgo,
      ).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doneTasks],
  );

  const recentActivity = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.updatedAt)
        .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
        .slice(0, 5),
    [tasks],
  );

  const userName = me?.displayName ?? me?.email ?? 'Hoş geldiniz';
  const now = new Date();
  const currentMonth = now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-full bg-[#131313]">
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-8">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/[0.08] p-8 md:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(170,255,1,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 0% 100%, rgba(123,97,255,0.07) 0%, transparent 70%)',
            }}
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#AAFF01]/20 bg-[#AAFF01]/[0.07] px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AAFF01] shadow-[0_0_6px_rgba(170,255,1,0.8)]" />
                <span className="text-xs font-medium text-[#AAFF01]">Tüm sistemler aktif</span>
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                {isLoading ? 'Yükleniyor...' : `Hoş geldiniz, ${userName}`}
              </h1>
              <p className="text-[#BDBDBD] max-w-lg leading-relaxed">
                Social Tech ile büyüme yolculuğunuzun özeti. {currentMonth} dönemi görev ve proje durumunuz aşağıda.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#A0A0A0]">Dönem</p>
              <p className="text-lg font-semibold text-white capitalize">{currentMonth}</p>
              {pendingApprovals.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{pendingApprovals.length} onay bekliyor</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#AAFF01]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Bekleyen onay yok</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={FolderKanban}
            label="Aktif Proje"
            value={isLoading ? '—' : String(projects.length)}
            caption={projects.length > 0 ? `${projects.map((p) => p.serviceKey ?? p.name).slice(0, 2).join(', ')}` : 'Henüz proje yok'}
            accent="lime"
          />
          <KpiCard
            icon={Activity}
            label="Açık Görev"
            value={isLoading ? '—' : String(openTasks.length)}
            caption={openTasks.length > 0 ? `${openTasks.filter((t) => t.status === 'IN_PROGRESS').length} devam ediyor` : 'Tüm görevler tamamlandı'}
            accent="blue"
          />
          <KpiCard
            icon={Clock}
            label="Onay Bekleyen"
            value={isLoading ? '—' : String(pendingApprovals.length)}
            caption={pendingApprovals.length > 0 ? 'Yanıt bekleniyor' : 'Bekleyen onay yok'}
            accent={pendingApprovals.length > 0 ? 'amber' : 'muted'}
          />
          <KpiCard
            icon={CheckCircle}
            label="Tamamlanan"
            value={isLoading ? '—' : String(doneTasks.length)}
            caption={recentlyDone > 0 ? `Bu hafta ${recentlyDone} tamamlandı` : 'Bu hafta tamamlanan yok'}
            accent="lime"
          />
        </div>

        {/* ── Mid Row: Bu Hafta + Sizden Beklenenler ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Bu Hafta */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Bu Hafta</h2>
              <span className="rounded-full bg-[#202020] px-2.5 py-1 text-xs text-[#A0A0A0] border border-white/[0.08]">
                Son 7 gün
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <WeeklyItem
                  count={String(recentlyDone)}
                  label="görev tamamlandı"
                  icon={CheckCircle}
                  accent="green"
                />
                <WeeklyItem
                  count={String(pendingApprovals.length)}
                  label="onay bekleniyor"
                  icon={Clock}
                  accent={pendingApprovals.length > 0 ? 'amber' : 'green'}
                />
                <WeeklyItem
                  count={String(revisionTasks.length)}
                  label="aktif revizyon"
                  icon={RotateCcw}
                  accent={revisionTasks.length > 0 ? 'purple' : 'green'}
                />
              </div>
            )}
          </div>

          {/* Sizden Beklenenler — spans 2 cols */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Sizden Beklenenler</h2>
              {pendingApprovals.length > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4444]/10 text-xs font-bold text-[#ff4444]">
                  {pendingApprovals.length}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
                <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle className="mb-3 h-10 w-10 text-[#AAFF01]/30" />
                <p className="text-sm font-medium text-white/60">Bekleyen aksiyon yok</p>
                <p className="mt-1 text-xs text-white/30">Yeni onay talepleri burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-white/[0.08] bg-[#202020] p-4 transition-colors hover:border-white/[0.14]"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20 px-2.5 py-0.5 text-xs font-medium">
                        Onay Gerekli
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-[#606060]">
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm font-medium text-white leading-snug">{task.title}</p>
                    <div className="flex gap-2">
                      <Button variant="primary" className="flex-1 justify-center text-xs py-2">
                        Onayla
                      </Button>
                      <Button variant="secondary" className="flex-1 justify-center text-xs py-2">
                        Revizyon İste
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length > 4 && (
                  <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] py-2.5 text-xs font-medium text-[#A0A0A0] transition-colors hover:border-white/[0.14] hover:text-white">
                    {pendingApprovals.length - 4} daha görüntüle
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Aktivite Akışı ── */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Aktivite Akışı</h2>
            <button className="flex items-center gap-1 text-xs text-[#A0A0A0] hover:text-white transition-colors">
              Tümü
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-white/40">Henüz aktivite kaydı yok.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {recentActivity.map((task, i) => (
                <div key={task.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${taskKindColor(task)}`} />
                    {i < recentActivity.length - 1 && (
                      <div className="my-1.5 w-px flex-1 bg-white/[0.06]" />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="mb-0.5 text-xs text-[#606060]">{formatRelativeTime(task.updatedAt)}</p>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <p className="mt-0.5 text-xs text-[#A0A0A0]">{taskStatusLabel(task.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 rounded-xl border border-white/[0.06] bg-[#202020] px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#AAFF01]" />
              <span className="h-2 w-2 rounded-full bg-[#7B61FF]" />
              <span className="h-2 w-2 rounded-full bg-[#60A5FA]" />
            </div>
            <p className="text-xs text-[#606060]">Onay Bekleyen · Revizyon · Tamamlanan</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  caption,
  accent = 'muted',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  caption: string;
  accent?: 'lime' | 'blue' | 'amber' | 'muted';
}) {
  const iconStyle = {
    lime: 'bg-[#AAFF01]/10 text-[#AAFF01]',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    muted: 'bg-white/[0.04] text-[#A0A0A0]',
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 transition-all hover:border-white/[0.14] hover:shadow-[0_0_0_1px_rgba(170,255,1,0.08),0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="mb-5 flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">{label}</p>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] ${iconStyle}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mb-3">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
      </div>
      <p className="truncate text-xs text-[#606060]">{caption}</p>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(170,255,1,0.3), transparent)' }}
      />
    </div>
  );
}

function WeeklyItem({
  count,
  label,
  icon: Icon,
  accent,
}: {
  count: string;
  label: string;
  icon: React.ElementType;
  accent: 'green' | 'purple' | 'amber';
}) {
  const styles = {
    green: { wrap: 'bg-[#AAFF01]/10', icon: 'text-[#AAFF01]' },
    purple: { wrap: 'bg-[#7B61FF]/10', icon: 'text-[#9B85FF]' },
    amber: { wrap: 'bg-amber-500/10', icon: 'text-amber-400' },
  }[accent];

  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#202020] border border-white/[0.08] px-4 py-3">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${styles.wrap}`}>
        <Icon className={`h-5 w-5 ${styles.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-white">{count}</p>
        <p className="truncate text-xs text-[#A0A0A0]">{label}</p>
      </div>
    </div>
  );
}

