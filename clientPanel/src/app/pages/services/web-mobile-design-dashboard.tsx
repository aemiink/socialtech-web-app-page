import { useMemo } from 'react';
import { CheckCircle, Clock, ExternalLink, Grid, Layers, MonitorSmartphone, Palette, PenTool } from 'lucide-react';
import {
  ActivityTimeline,
  AgencyComment,
  ClientActions,
  DashboardHeader,
  KpiGrid,
  StatusGrid,
} from '../../components/dashboard-widgets';
import { useGetClientProjectFilesQuery } from '../../features/projectFiles/projectFilesApi';
import type { ProjectFile } from '../../features/projectFiles/projectFilesTypes';
import { useGetClientTasksQuery } from '../../features/tasks/tasksApi';
import type { ClientTask, ClientTaskPriority, ClientTaskStatus } from '../../features/tasks/tasksTypes';
import { useGetOwnWebMobileDesignSummaryQuery } from '../../features/webMobileDesign/webMobileDesignApi';

type WebMobileDesignDashboardProps = {
  projectId?: string | null;
};

type Tone = 'lime' | 'violet' | 'blue' | 'red' | 'muted';

type DesignPhase = {
  label: string;
  keywords: string[];
};

type DesignPhaseStatus = DesignPhase & {
  status: 'DONE' | 'IN_PROGRESS' | 'PLANNED';
};

const DESIGN_PHASES: DesignPhase[] = [
  { label: 'Wireframe', keywords: ['wireframe', 'taslak', 'akış', 'flow', 'ux'] },
  { label: 'UI Design', keywords: ['ui', 'arayüz', 'ekran', 'tasarım', 'screen'] },
  { label: 'Responsive', keywords: ['responsive', 'mobil', 'tablet', 'breakpoint'] },
  { label: 'Prototype', keywords: ['prototype', 'prototip', 'figma'] },
  { label: 'Delivery', keywords: ['teslim', 'export', 'style guide', 'design system'] },
];

export function WebMobileDesignDashboard({ projectId }: WebMobileDesignDashboardProps) {
  const { data: designSummary } = useGetOwnWebMobileDesignSummaryQuery();
  const designConfig = designSummary?.config ?? null;

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetClientTasksQuery(
    projectId ? { projectId } : undefined,
    { skip: !projectId },
  );
  const {
    data: filesResponse,
    isLoading: filesLoading,
    isError: filesError,
  } = useGetClientProjectFilesQuery(
    { projectId: projectId ?? '' },
    { skip: !projectId },
  );
  const files = filesResponse?.data ?? [];
  const stats = useMemo(() => buildDesignStats(tasks, files), [files, tasks]);
  const isLoading = tasksLoading || filesLoading;
  const hasError = tasksError || filesError;
  const kpis = useMemo(
    () => [
      {
        title: 'Tasarlanan Ekran',
        value: String(stats.screenCount),
        note: stats.screenCount > 0 ? 'task ve teslim dosyalarından' : 'henüz görünür ekran yok',
        icon: MonitorSmartphone,
      },
      {
        title: 'UX Akışı',
        value: `%${stats.progressPercent}`,
        note: stats.progressPercent > 0 ? 'canlı task ilerlemesi' : 'task ilerlemesi bekleniyor',
        icon: Layers,
      },
      {
        title: 'Revizyon Sayısı',
        value: String(stats.activeRevisionCount),
        note: stats.activeRevisionCount > 0 ? 'aktif müşteri notu' : 'aktif revizyon yok',
        icon: PenTool,
        tone: 'violet' as const,
      },
      {
        title: 'Tasarım Sistemi',
        value: designConfig?.designSystemStatus === 'COMPLETED'
          ? 'Tamamlandı'
          : designConfig?.designSystemStatus === 'IN_PROGRESS'
          ? 'Devam Ediyor'
          : stats.designSystemStatus,
        note: designConfig?.fontFamily
          ? `${designConfig.fontFamily}${designConfig.gridSystem ? ` · ${designConfig.gridSystem}` : ''}`
          : stats.designSystemNote,
        icon: Palette,
      },
      {
        title: 'Onay Durumu',
        value: stats.approvalLabel,
        note: stats.approvalNote,
        icon: CheckCircle,
        tone: 'blue' as const,
      },
    ],
    [stats, designConfig],
  );

  return (
    <div className="p-8 space-y-6">
      <DashboardHeader
        title="Web ve Mobil Tasarımlar Paneli"
        description="Arayüz/deneyim üretimi, responsive ekranlar, tasarım sistemi, prototip ve revizyon sürecinin müşteri görünümü."
      />

      {/* Design config quick links */}
      {designConfig && (designConfig.figmaFileUrl || designConfig.prototypeUrl || designConfig.styleGuideUrl) ? (
        <div className="flex flex-wrap gap-3">
          {designConfig.figmaFileUrl ? (
            <a
              href={designConfig.figmaFileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-4 py-2.5 text-sm text-[#AAFF01] hover:bg-[#AAFF01]/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Figma Design File
            </a>
          ) : null}
          {designConfig.prototypeUrl ? (
            <a
              href={designConfig.prototypeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Prototype
            </a>
          ) : null}
          {designConfig.styleGuideUrl ? (
            <a
              href={designConfig.styleGuideUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2.5 text-sm text-violet-400 hover:bg-violet-500/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Style Guide
            </a>
          ) : null}
        </div>
      ) : null}

      {!projectId ? (
        <StateCard>
          Bu hizmet için proje oluşturulduğunda tasarım ekranları, revizyonlar ve teslim dosyaları burada canlı görünecek.
        </StateCard>
      ) : null}
      {projectId && isLoading ? <StateCard>Tasarım verileri yükleniyor...</StateCard> : null}
      {projectId && hasError ? (
        <StateCard tone="red">Tasarım projesi verileri alınamadı. Lütfen daha sonra tekrar deneyin.</StateCard>
      ) : null}

      <KpiGrid items={kpis} />

      <DesignProgressPath
        title="Design Progress"
        subtitle="Wireframe -> UI Design -> Responsive -> Prototype -> Delivery hattında ekran ve onay süreci."
        phases={stats.phases}
        progressPercent={stats.progressPercent}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusGrid title="Screen Gallery" description="Desktop, mobile ve tablet önizleme kartları." items={stats.gallery} />
        <StatusGrid title="Tasarım Sistemi Kontrol Listesi" description="Marka tutarlılığı için kontrol edilen tasarım yapı taşları." items={stats.checklist} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AgencyComment author="Social Tech Design Team">
            <p>{stats.agencyCommentPrimary}</p>
            <p>{stats.agencyCommentSecondary}</p>
          </AgencyComment>
        </div>

        {stats.clientActions.length > 0 ? (
          <ClientActions items={stats.clientActions} />
        ) : (
          <NoClientActionsCard />
        )}
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
            <Grid className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white">UX Flow Map</h2>
            <p className="text-sm text-[#A0A0A0]">Entry / Browse / Action / Conversion akışı.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {['Entry', 'Browse', 'Action', 'Conversion'].map((step) => (
            <div key={step} className="rounded-xl border border-white/[0.08] bg-[#202020] p-5 text-center">
              <div className="text-[#AAFF01] text-sm mb-2">{step}</div>
              <div className="text-white text-sm">Kullanıcı karar yolculuğu</div>
            </div>
          ))}
        </div>
      </div>

      <ActivityTimeline items={stats.activity} />
    </div>
  );
}

function DesignProgressPath({
  title,
  subtitle,
  phases,
  progressPercent,
}: {
  title: string;
  subtitle: string;
  phases: DesignPhaseStatus[];
  progressPercent: number;
}) {
  return (
    <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-xl p-6 border border-[#AAFF01]/20">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl text-[#AAFF01]">{progressPercent}%</div>
          <div className="text-xs text-[#A0A0A0]">aktif ilerleme</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {phases.map((phase) => {
          const completed = phase.status === 'DONE';
          const active = phase.status === 'IN_PROGRESS';

          return (
            <div key={phase.label} className="bg-[#131313]/80 rounded-xl p-4 border border-white/[0.08]">
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                completed ? 'bg-[#AAFF01]/15' : active ? 'bg-[#7B61FF]/15' : 'bg-white/[0.05]'
              }`}>
                {completed ? (
                  <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                ) : (
                  <Clock className={`w-5 h-5 ${active ? 'text-[#7B61FF]' : 'text-[#A0A0A0]'}`} />
                )}
              </div>
              <div className="text-sm text-white mb-1">{phase.label}</div>
              <div className="text-xs text-[#A0A0A0]">
                {completed ? 'Tamamlandı' : active ? 'Devam ediyor' : 'Planlandı'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StateCard({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'red' }) {
  return (
    <div className={`rounded-xl border p-4 text-sm ${
      tone === 'red'
        ? 'border-destructive/30 bg-destructive/10 text-destructive'
        : 'border-white/[0.08] bg-[#1A1A1A] text-[#A0A0A0]'
    }`}>
      {children}
    </div>
  );
}

function NoClientActionsCard() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">Sizden Beklenenler</h2>
      <p className="text-sm text-muted-foreground">Şu anda bekleyen müşteri onayı veya revizyon aksiyonu yok.</p>
    </div>
  );
}

function buildDesignStats(tasks: ClientTask[], files: ProjectFile[]) {
  const visibleTasks = tasks.filter((task) => task.visibility === 'CLIENT_VISIBLE' || task.approvalRequired);
  const phaseTasks = visibleTasks.length > 0 ? visibleTasks : tasks;
  const phases = buildPhaseStatuses(phaseTasks, files);
  const progressPercent = calculateProgressPercent(phaseTasks, phases);
  const screenCount = countScreenItems(phaseTasks, files);
  const activeRevisionCount = phaseTasks.filter(
    (task) => task.type === 'REVISION' && !isDoneStatus(task.status),
  ).length;
  const designSystemPhase = phases.find((phase) => phase.label === 'Delivery');
  const approvalTasks = phaseTasks.filter((task) => task.approvalRequired);
  const approvedApprovalTasks = approvalTasks.filter(
    (task) => task.approvalStatus === 'APPROVED' || task.approvalStatus === 'ACKNOWLEDGED',
  );
  const pendingApprovalTasks = approvalTasks.filter((task) => task.approvalStatus === 'PENDING');
  const gallery = buildGallery(files, phaseTasks);
  const checklist = phases.map((phase) => ({
    title: getPhaseChecklistTitle(phase.label),
    status: getPhaseStatusLabel(phase.status),
    note: getPhaseNote(phase, phaseTasks),
    tone: getPhaseTone(phase.status),
  }));
  const clientActions = pendingApprovalTasks.slice(0, 3).map((task) => ({
    title: task.title,
    dueDate: formatShortDate(task.dueDate),
    priority: mapPriority(task.priority),
  }));
  const activity = buildActivity(phaseTasks, files);

  return {
    screenCount,
    progressPercent,
    activeRevisionCount,
    designSystemStatus: getPhaseStatusLabel(designSystemPhase?.status ?? 'PLANNED'),
    designSystemNote:
      designSystemPhase?.status === 'DONE'
        ? 'teslim ve sistem dosyaları hazır'
        : designSystemPhase?.status === 'IN_PROGRESS'
          ? 'bileşen seti ilerliyor'
          : 'design system taskı bekleniyor',
    approvalLabel: approvalTasks.length > 0 ? `${approvedApprovalTasks.length}/${approvalTasks.length}` : '0',
    approvalNote: approvalTasks.length > 0 ? 'ekran onaylı' : 'onay görevi yok',
    phases,
    gallery,
    checklist,
    clientActions,
    activity,
    agencyCommentPrimary:
      phaseTasks.length > 0
        ? `Tasarım operasyonunda ${phaseTasks.length} görünür görev takip ediliyor; genel ilerleme %${progressPercent}.`
        : 'Tasarım operasyonu başlatıldığında görevler ve görünür teslimler bu alana yansıyacak.',
    agencyCommentSecondary:
      files.length > 0
        ? `${files.length} müşteri görünür dosya/prototip paylaşılmış durumda. Revizyon ve onay kararları görev akışı üzerinden izleniyor.`
        : 'Figma/prototip ve teslim dosyaları müşteri görünür olarak paylaşıldığında galeri ve teslim alanları otomatik güncellenecek.',
  };
}

function buildPhaseStatuses(tasks: ClientTask[], files: ProjectFile[]): DesignPhaseStatus[] {
  return DESIGN_PHASES.map((phase) => {
    const relatedTasks = tasks.filter((task) => matchesKeywords(task, phase.keywords));
    const relatedFiles = files.filter((file) => matchesFileKeywords(file, phase.keywords));

    if (relatedTasks.some((task) => isDoneStatus(task.status)) || (relatedTasks.length === 0 && relatedFiles.length > 0)) {
      return { ...phase, status: 'DONE' };
    }

    if (relatedTasks.length > 0) {
      return { ...phase, status: 'IN_PROGRESS' };
    }

    return { ...phase, status: 'PLANNED' };
  });
}

function calculateProgressPercent(tasks: ClientTask[], phases: DesignPhaseStatus[]): number {
  if (tasks.length > 0) {
    const total = tasks.reduce((sum, task) => sum + task.progressPercent, 0);
    return Math.round(total / tasks.length);
  }

  const phaseScore = phases.reduce((sum, phase) => {
    if (phase.status === 'DONE') return sum + 100;
    if (phase.status === 'IN_PROGRESS') return sum + 50;
    return sum;
  }, 0);

  return Math.round(phaseScore / phases.length);
}

function countScreenItems(tasks: ClientTask[], files: ProjectFile[]): number {
  const taskCount = tasks.filter((task) =>
    matchesKeywords(task, ['screen', 'ekran', 'ui', 'wireframe', 'taslak', 'responsive']),
  ).length;
  const fileCount = files.filter((file) =>
    matchesFileKeywords(file, ['screen', 'ekran', 'ui', 'wireframe', 'figma', 'prototype', 'mobil']),
  ).length;

  return Math.max(taskCount, fileCount);
}

function buildGallery(files: ProjectFile[], tasks: ClientTask[]) {
  const fileItems = files.slice(0, 3).map((file) => ({
    title: file.title,
    status: getApprovalStatusLabel(file.approvalStatus),
    note: file.description || file.originalFileName,
    tone: getApprovalTone(file.approvalStatus),
  }));

  if (fileItems.length > 0) {
    return fileItems;
  }

  const taskItems = tasks.filter((task) => matchesKeywords(task, ['screen', 'ekran', 'ui', 'responsive', 'prototype'])).slice(0, 3);
  if (taskItems.length > 0) {
    return taskItems.map((task) => ({
      title: task.title,
      status: getTaskStatusLabel(task.status),
      note: task.description || task.projectName || 'Tasarım görevi',
      tone: getTaskStatusTone(task.status),
    }));
  }

  return [
    {
      title: 'Paylaşılan ekran yok',
      status: 'Bekleniyor',
      note: 'Designer veya proje yöneticisi müşteri görünür dosya paylaştığında burada görünecek.',
      tone: 'muted' as const,
    },
  ];
}

function buildActivity(tasks: ClientTask[], files: ProjectFile[]): string[] {
  const taskActivities = [...tasks]
    .filter((task) => task.updatedAt)
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
    .slice(0, 3)
    .map((task) => `${task.title} güncellendi`);
  const fileActivities = [...files]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, Math.max(0, 3 - taskActivities.length))
    .map((file) => `${file.title} teslim dosyalarına eklendi`);
  const activity = [...taskActivities, ...fileActivities].slice(0, 3);

  return activity.length > 0 ? activity : ['Henüz görünür tasarım aktivitesi yok'];
}

function matchesKeywords(task: ClientTask, keywords: string[]): boolean {
  const haystack = [
    task.title,
    task.description,
    task.campaignRef,
    task.adSetRef,
    task.adRef,
    task.workstream,
    task.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('tr-TR');

  return keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase('tr-TR')));
}

function matchesFileKeywords(file: ProjectFile, keywords: string[]): boolean {
  const haystack = [file.title, file.description, file.originalFileName, file.category, file.mimeType]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('tr-TR');

  return keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase('tr-TR')));
}

function isDoneStatus(status: ClientTaskStatus): boolean {
  return status === 'DONE';
}

function getPhaseChecklistTitle(label: string): string {
  const labels: Record<string, string> = {
    Wireframe: 'Wireframe',
    'UI Design': 'UI Ekranları',
    Responsive: 'Responsive Tasarım',
    Prototype: 'Prototip',
    Delivery: 'Teslim Dosyaları',
  };
  return labels[label] ?? label;
}

function getPhaseStatusLabel(status: DesignPhaseStatus['status']): string {
  if (status === 'DONE') return 'Hazır';
  if (status === 'IN_PROGRESS') return 'Devam';
  return 'Planlandı';
}

function getPhaseTone(status: DesignPhaseStatus['status']): Tone {
  if (status === 'DONE') return 'lime';
  if (status === 'IN_PROGRESS') return 'blue';
  return 'muted';
}

function getPhaseNote(phase: DesignPhaseStatus, tasks: ClientTask[]): string {
  const relatedCount = tasks.filter((task) => matchesKeywords(task, phase.keywords)).length;
  if (relatedCount > 0) {
    return `${relatedCount} canlı görev ile takip ediliyor.`;
  }
  return 'Bu faz için görünür görev bekleniyor.';
}

function getApprovalStatusLabel(status: ProjectFile['approvalStatus'] | ClientTask['approvalStatus']): string {
  if (status === 'APPROVED' || status === 'ACKNOWLEDGED') return 'Onaylandı';
  if (status === 'PENDING') return 'Onayda';
  if (status === 'CHANGES_REQUESTED') return 'Revizyon';
  if (status === 'REJECTED') return 'Reddedildi';
  return 'Güncel';
}

function getApprovalTone(status: ProjectFile['approvalStatus'] | ClientTask['approvalStatus']): Tone {
  if (status === 'APPROVED' || status === 'ACKNOWLEDGED') return 'lime';
  if (status === 'PENDING') return 'blue';
  if (status === 'CHANGES_REQUESTED') return 'violet';
  if (status === 'REJECTED') return 'red';
  return 'muted';
}

function getTaskStatusLabel(status: ClientTaskStatus): string {
  if (status === 'DONE') return 'Tamamlandı';
  if (status === 'REVIEW') return 'İncelemede';
  if (status === 'IN_PROGRESS') return 'Devam';
  if (status === 'BLOCKED') return 'Bloke';
  return 'Planlandı';
}

function getTaskStatusTone(status: ClientTaskStatus): Tone {
  if (status === 'DONE') return 'lime';
  if (status === 'REVIEW') return 'blue';
  if (status === 'IN_PROGRESS') return 'violet';
  if (status === 'BLOCKED') return 'red';
  return 'muted';
}

function mapPriority(priority: ClientTaskPriority): 'Acil' | 'Orta' | 'Normal' {
  if (priority === 'URGENT' || priority === 'HIGH') return 'Acil';
  if (priority === 'MEDIUM') return 'Orta';
  return 'Normal';
}

function formatShortDate(value: string | null): string {
  if (!value) {
    return 'Tarih yok';
  }
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(value));
}
