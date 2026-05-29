import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  Code,
  Download,
  Eye,
  FileText,
  Gauge,
  Grid,
  Image,
  Layers,
  LineChart,
  Link,
  MessageSquare,
  MousePointerClick,
  Package,
  Palette,
  PlayCircle,
  Search,
  Send,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '../components/button';
import { getServiceTabContent, ServiceTabContent } from '../data/service-pages';
import {
  useGetOwnMetaAdsAdSetsQuery,
  useGetOwnMetaAdsAdsQuery,
  useGetOwnMetaAdsCampaignsQuery,
  useGetOwnMetaAdsConfigQuery,
  useGetOwnMetaAdsInsightsQuery,
  useGetOwnMetaAdsPixelStatusQuery,
  useGetOwnMetaAdsReportsQuery,
  useGetOwnMetaAdsSummaryQuery,
} from '../features/metaAds/metaAdsApi';
import type { MetaAdsCampaign, MetaAdsInsightItem, MetaAdsReportItem } from '../features/metaAds/metaAdsTypes';
import {
  useExportOwnTikTokAdsReportMutation,
  useGetOwnTikTokAdsCampaignsQuery,
  useGetOwnTikTokAdsConfigQuery,
  useGetOwnTikTokAdsInsightsQuery,
  useGetOwnTikTokAdsReportsQuery,
  useGetOwnTikTokAdsSummaryQuery,
} from '../features/tiktokAds/tiktokAdsApi';
import type {
  TikTokAdsCampaign,
  TikTokAdsInsightItem,
  TikTokAdsReportExportFormat,
  TikTokAdsReportItem,
} from '../features/tiktokAds/tiktokAdsTypes';
import {
  useExportOwnAmazonAdsReportMutation,
  useGetOwnAmazonAdsCampaignsQuery,
  useGetOwnAmazonAdsConfigQuery,
  useGetOwnAmazonAdsInsightsQuery,
  useGetOwnAmazonAdsProductsQuery,
  useGetOwnAmazonAdsReportsQuery,
  useGetOwnAmazonAdsSummaryQuery,
} from '../features/amazonAds/amazonAdsApi';
import type {
  AmazonAdsCampaignSummary,
  AmazonAdsInsightItem,
  AmazonAdsProductSummary,
  AmazonAdsProductType,
  AmazonAdsReportExportFormat,
  AmazonAdsReportItem,
} from '../features/amazonAds/amazonAdsTypes';
import {
  useGetOwnSocialMediaCalendarQuery,
  useGetOwnSocialMediaConfigQuery,
  useGetOwnSocialMediaInsightsQuery,
  useGetOwnSocialMediaPostsQuery,
  useGetOwnSocialMediaReportsQuery,
  useGetOwnSocialMediaSummaryQuery,
} from '../features/socialMedia/socialMediaApi';
import type {
  SocialMediaCreativeAsset,
  SocialMediaInsightsResponse,
  SocialMediaPost,
  SocialMediaReportsResponse,
  SocialMediaSummary,
} from '../features/socialMedia/socialMediaTypes';
import {
  formatSocialMediaDate,
  getSocialMediaGoalLabel,
  getSocialMediaPlatformLabel,
  getSocialMediaPostStatusLabel,
  getSocialMediaPostTypeLabel,
  getSocialMediaReportStatusLabel,
  getSocialMediaReportTypeLabel,
  getSocialMediaSummaryStateLabel,
  getSocialMediaStatusTone,
  groupPostsByDay,
} from '../features/socialMedia/socialMediaUtils';
import type { ProjectFile } from '../features/projectFiles/projectFilesTypes';
import { useGetClientProjectFilesQuery } from '../features/projectFiles/projectFilesApi';
import { useGetClientTasksQuery, useUpdateClientTaskApprovalMutation } from '../features/tasks/tasksApi';
import type {
  ClientTask,
  ClientTaskMetaAdsApprovalStatus,
  ClientTaskPriority,
  ClientTaskStatus,
  ClientTaskType,
  ClientTaskWorkstream,
} from '../features/tasks/tasksTypes';
import {
  webAppWorkspaceApi,
  useCreateWebAppWorkspaceRevisionMutation,
  useCreateWebAppWorkspaceMessageMutation,
  useGetWebAppWorkspaceQuery,
  useUpdateWebAppWorkspaceRevisionStatusMutation,
} from '../features/webAppWorkspace/webAppWorkspaceApi';
import type {
  WorkspaceMessage,
  WorkspaceProjectSummary,
  WorkspaceRevision,
  WorkspaceRevisionStatus,
  WorkspaceSection,
  WorkspaceSourceFile,
  WorkspaceSourceOfTruth,
  WorkspaceSourceRelease,
  WorkspaceSourceSprint,
  WorkspaceSourceTask,
  WorkspaceTabKey,
} from '../features/webAppWorkspace/webAppWorkspaceTypes';
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from '../features/webAppWorkspace/workspaceSocket';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAccessToken, selectCurrentUser } from '../features/auth/authSelectors';
import { runClientAction } from '../lib/client-actions';

interface ServiceTabPageProps {
  serviceId: string;
  tabId: string;
  projectId?: string | null;
}

type ViewKind =
  | 'growth'
  | 'calendar'
  | 'approval'
  | 'published'
  | 'inbox'
  | 'insights'
  | 'campaigns'
  | 'performance'
  | 'funnel'
  | 'creative'
  | 'diagnostics'
  | 'project'
  | 'support'
  | 'brief'
  | 'delivery';

const statusTone = {
  good: 'border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]',
  info: 'border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]',
  violet: 'border-[#7B61FF]/20 bg-[#7B61FF]/10 text-[#7B61FF]',
  warn: 'border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]',
  danger: 'border-[#ff4444]/20 bg-[#ff4444]/10 text-[#ff4444]',
};

const cardClass = 'bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]';
const innerClass = 'bg-[#202020] rounded-xl p-4 border border-white/[0.08]';

export function ServiceTabPage({ serviceId, tabId, projectId }: ServiceTabPageProps) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const isWebAppService = serviceId === "web-app";
  const workspaceTabKey = mapTabIdToWorkspaceTabKey(tabId);
  const viewKind = getViewKind(serviceId, tabId);
  const shouldUseWorkspace = isWebAppService && Boolean(projectId);
  const shouldUseTaskBasedRevisions = !isWebAppService && tabId === "revisions";
  const { data: workspaceData, isLoading: workspaceLoading } = useGetWebAppWorkspaceQuery(
    { projectId: projectId ?? '', tabKey: workspaceTabKey },
    { skip: !shouldUseWorkspace },
  );
  const { data: taskBasedRevisions = [], isLoading: taskBasedRevisionsLoading } = useGetClientTasksQuery(
    projectId ? { projectId, type: "REVISION" } : { type: "REVISION" },
    { skip: !shouldUseTaskBasedRevisions },
  );
  const [createWorkspaceMessage, { isLoading: isSendingWorkspaceMessage }] = useCreateWebAppWorkspaceMessageMutation();
  const [createWorkspaceRevision, { isLoading: isCreatingWorkspaceRevision }] =
    useCreateWebAppWorkspaceRevisionMutation();
  const [updateWorkspaceRevisionStatus, { isLoading: isUpdatingWorkspaceRevision }] =
    useUpdateWebAppWorkspaceRevisionStatusMutation();
  const [revisionTitle, setRevisionTitle] = useState("");
  const [revisionDescription, setRevisionDescription] = useState("");
  const [revisionResponseNote, setRevisionResponseNote] = useState<Record<string, string>>({});
  const [revisionActionError, setRevisionActionError] = useState<string | null>(null);
  const lastWorkspaceSequenceRef = useRef(0);
  const scopedTaskBasedRevisions = useMemo(
    () =>
      taskBasedRevisions.filter((task) => {
        const matchesProject = !projectId || task.projectId === projectId;
        const matchesService = !task.projectServiceId || task.projectServiceId === serviceId;
        return matchesProject && matchesService;
      }),
    [projectId, serviceId, taskBasedRevisions],
  );

  const handleWorkspaceMessageSend = async (message: string, parentMessageId?: string) => {
    if (!projectId || !message.trim()) {
      return;
    }

    await createWorkspaceMessage({
      projectId,
      tabKey: workspaceTabKey,
      body: message.trim(),
      parentMessageId,
    }).unwrap();
  };

  const handleWorkspaceRevisionCreate = async () => {
    if (!projectId || revisionTitle.trim().length < 2 || revisionDescription.trim().length < 2) {
      return;
    }
    try {
      setRevisionActionError(null);
      await createWorkspaceRevision({
        projectId,
        title: revisionTitle.trim(),
        description: revisionDescription.trim(),
        cacheTabKey: workspaceTabKey,
      }).unwrap();
      setRevisionTitle("");
      setRevisionDescription("");
    } catch {
      setRevisionActionError("Revizyon talebi gönderilemedi.");
    }
  };

  const handleWorkspaceRevisionDecision = async (
    revisionId: string,
    status: WorkspaceRevisionStatus,
  ) => {
    if (!projectId) {
      return;
    }
    try {
      setRevisionActionError(null);
      if (status !== "APPROVED" && status !== "REJECTED") {
        setRevisionActionError("Bu revizyon için sadece onay veya red aksiyonu destekleniyor.");
        return;
      }
      await updateWorkspaceRevisionStatus({
        projectId,
        revisionId,
        status,
        note: revisionResponseNote[revisionId]?.trim() || undefined,
        cacheTabKey: workspaceTabKey,
      }).unwrap();
      setRevisionResponseNote((prev) => {
        if (!(revisionId in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[revisionId];
        return next;
      });
    } catch {
      setRevisionActionError("Revizyon durumu güncellenemedi.");
    }
  };

  useEffect(() => {
    if (!shouldUseWorkspace || !projectId || !accessToken) {
      return;
    }

    const socket = createWorkspaceSocket(accessToken);
    const joinPayload = { projectId, tabKey: workspaceTabKey };

    socket.emit('project:join', joinPayload);
    const onWorkspaceUpdate = (event: WorkspaceUpdateEvent) => {
      if (event.projectId !== projectId) {
        return;
      }
      if (event.sequence <= lastWorkspaceSequenceRef.current) {
        return;
      }
      lastWorkspaceSequenceRef.current = event.sequence;
      const payload = event.payload ?? {};
      const revision = (payload.revision ?? null) as WorkspaceRevision | null;
      const message = (payload.message ?? null) as WorkspaceMessage | null;

      if (event.event === 'message.created' && message) {
        dispatch(
          webAppWorkspaceApi.util.updateQueryData('getWebAppWorkspace', { projectId, tabKey: workspaceTabKey }, (draft) => {
            const exists = draft.messages?.some((item) => item.id === message.id);
            if (!exists) {
              draft.messages = [message, ...(draft.messages ?? [])];
            }
          }),
        );
        return;
      }

      if (event.event === 'revision.created' && revision) {
        dispatch(
          webAppWorkspaceApi.util.updateQueryData('getWebAppWorkspace', { projectId, tabKey: workspaceTabKey }, (draft) => {
            const exists = draft.revisions?.some((item) => item.id === revision.id);
            if (!exists) {
              draft.revisions = [revision, ...(draft.revisions ?? [])];
            }
          }),
        );
        return;
      }

      if (event.event === 'revision.updated' && revision) {
        dispatch(
          webAppWorkspaceApi.util.updateQueryData('getWebAppWorkspace', { projectId, tabKey: workspaceTabKey }, (draft) => {
            const target = draft.revisions?.find((item) => item.id === revision.id);
            if (target) {
              Object.assign(target, revision);
            }
          }),
        );
      }
    };

    socket.on('workspace:update', onWorkspaceUpdate);

    return () => {
      socket.emit('project:leave', joinPayload);
      socket.off('workspace:update', onWorkspaceUpdate);
      socket.disconnect();
    };
  }, [accessToken, dispatch, projectId, shouldUseWorkspace, workspaceTabKey]);

  if (isWebAppService) {
    return (
      <WebAppWorkspaceTab
        tabId={tabId}
        projectId={projectId}
        workspaceLoading={workspaceLoading}
        sections={workspaceData?.sections ?? []}
        projectSummary={workspaceData?.project}
        sourceOfTruth={workspaceData?.sourceOfTruth}
        messages={workspaceData?.messages ?? []}
        revisions={workspaceData?.revisions ?? []}
        isSendingWorkspaceMessage={isSendingWorkspaceMessage}
        isCreatingWorkspaceRevision={isCreatingWorkspaceRevision}
        isUpdatingWorkspaceRevision={isUpdatingWorkspaceRevision}
        revisionTitle={revisionTitle}
        revisionDescription={revisionDescription}
        revisionResponseNote={revisionResponseNote}
        revisionActionError={revisionActionError}
        currentUserId={currentUser?.id ?? null}
        onSendMessage={handleWorkspaceMessageSend}
        onChangeRevisionTitle={setRevisionTitle}
        onChangeRevisionDescription={setRevisionDescription}
        onChangeRevisionResponseNote={(revisionId: string, note: string) =>
          setRevisionResponseNote((prev) => ({ ...prev, [revisionId]: note }))
        }
        onCreateRevision={handleWorkspaceRevisionCreate}
        onUpdateRevisionStatus={handleWorkspaceRevisionDecision}
      />
    );
  }

  const content = getServiceTabContent(serviceId, tabId);

  if (serviceId === "meta-ads" && tabId !== "service-dashboard") {
    return <MetaAdsServiceTab tabId={tabId} content={content} />;
  }

  if (serviceId === "tiktok-ads" && tabId !== "service-dashboard") {
    return <TikTokAdsServiceTab tabId={tabId} content={content} />;
  }

  if (serviceId === "amazon-ads" && tabId !== "service-dashboard") {
    return <AmazonAdsServiceTab tabId={tabId} content={content} />;
  }

  if (serviceId === "social-media" && tabId !== "service-dashboard") {
    return (
      <div className="p-8 space-y-6">
        <SocialMediaClientWorkspace tabId={tabId} />
      </div>
    );
  }

  if (shouldUseTaskBasedRevisions) {
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <SmartKpis content={content} tabId={tabId} />
        <TaskBasedRevisionPanel
          serviceId={serviceId}
          projectId={projectId}
          tasks={scopedTaskBasedRevisions}
          isLoading={taskBasedRevisionsLoading}
        />
        <ActionFooter content={content} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />
      <SmartKpis content={content} tabId={tabId} />
      {renderWorkspace(viewKind, content, serviceId, tabId, projectId)}
      {shouldUseWorkspace ? (
        <WorkspaceConversationPanel
          messages={workspaceData?.messages ?? []}
          isLoading={workspaceLoading}
          isSending={isSendingWorkspaceMessage}
          onSend={handleWorkspaceMessageSend}
        />
      ) : null}
      {shouldUseWorkspace && tabId.includes('revision') ? (
        <WorkspaceRevisionPanel
          revisions={workspaceData?.revisions ?? []}
          isCreating={isCreatingWorkspaceRevision}
          isUpdating={isUpdatingWorkspaceRevision}
          revisionTitle={revisionTitle}
          revisionDescription={revisionDescription}
          revisionResponseNote={revisionResponseNote}
          revisionActionError={revisionActionError}
          currentUserId={currentUser?.id ?? null}
          onChangeRevisionTitle={setRevisionTitle}
          onChangeRevisionDescription={setRevisionDescription}
          onChangeRevisionResponseNote={(revisionId, note) =>
            setRevisionResponseNote((prev) => ({ ...prev, [revisionId]: note }))
          }
          onCreateRevision={handleWorkspaceRevisionCreate}
          onUpdateRevisionStatus={handleWorkspaceRevisionDecision}
        />
      ) : null}
      <ActionFooter content={content} />
    </div>
  );
}

function WebAppWorkspaceTab({
  tabId,
  projectId,
  workspaceLoading,
  sections,
  projectSummary,
  sourceOfTruth,
  messages,
  revisions,
  isSendingWorkspaceMessage,
  isCreatingWorkspaceRevision,
  isUpdatingWorkspaceRevision,
  revisionTitle,
  revisionDescription,
  revisionResponseNote,
  revisionActionError,
  currentUserId,
  onSendMessage,
  onChangeRevisionTitle,
  onChangeRevisionDescription,
  onChangeRevisionResponseNote,
  onCreateRevision,
  onUpdateRevisionStatus,
}: {
  tabId: string;
  projectId?: string | null;
  workspaceLoading: boolean;
  sections: WorkspaceSection[];
  projectSummary?: WorkspaceProjectSummary;
  sourceOfTruth?: WorkspaceSourceOfTruth;
  messages: WorkspaceMessage[];
  revisions: WorkspaceRevision[];
  isSendingWorkspaceMessage: boolean;
  isCreatingWorkspaceRevision: boolean;
  isUpdatingWorkspaceRevision: boolean;
  revisionTitle: string;
  revisionDescription: string;
  revisionResponseNote: Record<string, string>;
  revisionActionError: string | null;
  currentUserId: string | null;
  onSendMessage: (message: string, parentMessageId?: string) => Promise<void>;
  onChangeRevisionTitle: (value: string) => void;
  onChangeRevisionDescription: (value: string) => void;
  onChangeRevisionResponseNote: (revisionId: string, note: string) => void;
  onCreateRevision: () => Promise<void>;
  onUpdateRevisionStatus: (revisionId: string, status: WorkspaceRevisionStatus) => Promise<void>;
}) {
  const tasks = sourceOfTruth?.tasks ?? [];
  const sprints = sourceOfTruth?.sprints ?? [];
  const releases = sourceOfTruth?.releases ?? [];
  const files = sourceOfTruth?.files ?? [];
  const tabTasks = useMemo(() => filterWorkspaceTasksByTab(tabId, tasks), [tabId, tasks]);

  return (
    <div className="p-8 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#101010] p-8">
        <h1 className="text-3xl text-white">Web APP Çalışma Alanı</h1>
        <p className="mt-2 text-[#A0A0A0]">Sekme: {tabId}</p>
        {projectSummary?.name ? (
          <p className="mt-1 text-sm text-[#d7d7d7]">Proje: {projectSummary.name}</p>
        ) : null}
      </div>
      {!projectId ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          Bu sekme için proje seçimi yapılmadı.
        </div>
      ) : null}
      {projectId && projectSummary ? <WorkspaceProjectLinksPanel project={projectSummary} /> : null}
      {workspaceLoading && projectId ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          İçerikler yükleniyor...
        </div>
      ) : null}
      {projectId && !workspaceLoading ? (
        <WebAppSourceOfTruthPanel
          tabId={tabId}
          tasks={tabTasks}
          allTasks={tasks}
          sprints={sprints}
          releases={releases}
          files={files}
        />
      ) : null}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
            <h2 className="text-xl text-white">{section.title}</h2>
            {section.description ? <p className="mt-2 text-sm text-[#A0A0A0]">{section.description}</p> : null}
            <div className="mt-4 space-y-3">
              {(section.items ?? []).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                  <p className="text-white">{item.title}</p>
                  {item.body ? <p className="mt-2 text-sm text-[#CFCFCF]">{item.body}</p> : null}
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#AAFF01] hover:underline"
                    >
                      Kaynağı Aç
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              ))}
              {(section.items ?? []).length === 0 ? (
                <p className="text-sm text-[#A0A0A0]">Bu bölümde henüz içerik yok.</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {projectId ? (
        <WorkspaceConversationPanel
          messages={messages}
          isLoading={workspaceLoading}
          isSending={isSendingWorkspaceMessage}
          onSend={onSendMessage}
        />
      ) : null}
      {projectId && tabId.includes("revision") ? (
        <WorkspaceRevisionPanel
          revisions={revisions}
          isCreating={isCreatingWorkspaceRevision}
          isUpdating={isUpdatingWorkspaceRevision}
          revisionTitle={revisionTitle}
          revisionDescription={revisionDescription}
          revisionResponseNote={revisionResponseNote}
          revisionActionError={revisionActionError}
          currentUserId={currentUserId}
          onChangeRevisionTitle={onChangeRevisionTitle}
          onChangeRevisionDescription={onChangeRevisionDescription}
          onChangeRevisionResponseNote={onChangeRevisionResponseNote}
          onCreateRevision={onCreateRevision}
          onUpdateRevisionStatus={onUpdateRevisionStatus}
        />
      ) : null}
    </div>
  );
}

function WorkspaceProjectLinksPanel({ project }: { project: WorkspaceProjectSummary }) {
  const figmaKind = detectFigmaLinkKind(project.figmaProjectUrl);
  const figmaEmbedUrl = buildFigmaEmbedUrl(project.figmaProjectUrl);

  if (!project.repositoryUrl && !project.figmaProjectUrl) {
    return null;
  }

  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Proje Linkleri</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {project.repositoryUrl ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <p className="text-sm text-white">GitHub Repository</p>
            <p className="mt-1 truncate text-xs text-[#A0A0A0]">{project.repositoryUrl}</p>
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#AAFF01] hover:underline"
            >
              Repo’yu Aç
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
        {project.figmaProjectUrl ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <p className="text-sm text-white">Figma</p>
            <p className="mt-1 truncate text-xs text-[#A0A0A0]">{project.figmaProjectUrl}</p>
            <a
              href={project.figmaProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#AAFF01] hover:underline"
            >
              Figma ile Aç
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </div>
      {figmaKind === "prototype" && figmaEmbedUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08]">
          <iframe
            title="Figma Prototype"
            src={figmaEmbedUrl}
            className="h-[420px] w-full border-0 bg-[#101010]"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}

function WebAppSourceOfTruthPanel({
  tabId,
  tasks,
  allTasks,
  sprints,
  releases,
  files,
}: {
  tabId: string;
  tasks: WorkspaceSourceTask[];
  allTasks: WorkspaceSourceTask[];
  sprints: WorkspaceSourceSprint[];
  releases: WorkspaceSourceRelease[];
  files: WorkspaceSourceFile[];
}) {
  if (tabId === "project-roadmap") {
    return <RoadmapSourcePanel sprints={sprints} releases={releases} />;
  }

  if (tabId === "sprint-status") {
    return <SprintStatusSourcePanel tasks={allTasks} sprints={sprints} />;
  }

  if (tabId === "test-deploy") {
    return (
      <div className="space-y-4">
        <ReleaseSourcePanel releases={releases} />
        <TaskSourcePanel title="Test & Yayın Görevleri" tasks={tasks} emptyText="Test/Yayın görevi bulunmuyor." />
      </div>
    );
  }

  if (tabId === "files" || tabId === "delivery-files") {
    return <WorkspaceSourceFilesPanel files={files} />;
  }

  if (["frontend", "backend-api", "admin-panel", "ui-ux", "revisions"].includes(tabId)) {
    return <TaskSourcePanel title="Operasyon Görevleri" tasks={tasks} emptyText="Bu sekme için görev bulunmuyor." />;
  }

  if (tasks.length > 0) {
    return <TaskSourcePanel title="Güncel Görevler" tasks={tasks} emptyText="Görev bulunmuyor." />;
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
      Bu sekme için henüz roadmap/task/release verisi bulunmuyor.
    </div>
  );
}

function TaskSourcePanel({
  title,
  tasks,
  emptyText,
}: {
  title: string;
  tasks: WorkspaceSourceTask[];
  emptyText: string;
}) {
  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">{title}</h2>
      {tasks.length === 0 ? <p className="text-sm text-[#A0A0A0]">{emptyText}</p> : null}
      <div className="space-y-3">
        {tasks.slice(0, 12).map((task) => (
          <div key={task.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                {task.type ?? "TASK"}
              </span>
              {task.workstream ? (
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {task.workstream}
                </span>
              ) : null}
              {task.severity ? (
                <span className="rounded border border-[#FFA726]/20 bg-[#FFA726]/10 px-2 py-1 text-[11px] text-[#FFA726]">
                  {task.severity}
                </span>
              ) : null}
              {task.environment ? (
                <span className="rounded border border-[#7B61FF]/20 bg-[#7B61FF]/10 px-2 py-1 text-[11px] text-[#7B61FF]">
                  {task.environment}
                </span>
              ) : null}
              <span className={`rounded border px-2 py-1 text-[11px] ${getTaskStatusTone(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-white">{task.title}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#A0A0A0]">
              <span>Öncelik: {task.priority}</span>
              {task.code ? <span>Kod: {task.code}</span> : null}
              {task.sprint?.name ? <span>Sprint: {task.sprint.name}</span> : null}
              {task.assignee?.displayName ? <span>Atanan: {task.assignee.displayName}</span> : null}
              {task.dueDate ? <span>Teslim: {new Date(task.dueDate).toLocaleDateString("tr-TR")}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapSourcePanel({
  sprints,
  releases,
}: {
  sprints: WorkspaceSourceSprint[];
  releases: WorkspaceSourceRelease[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className={cardClass}>
        <h2 className="mb-4 text-xl text-white">Sprint Roadmap</h2>
        {sprints.length === 0 ? <p className="text-sm text-[#A0A0A0]">Henüz sprint planı bulunmuyor.</p> : null}
        <div className="space-y-3">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
              <p className="text-white">{sprint.name}</p>
              {sprint.goal ? <p className="mt-1 text-xs text-[#d7d7d7]">Hedef: {sprint.goal}</p> : null}
              <p className="mt-1 text-xs text-[#A0A0A0]">
                {new Date(sprint.startDate).toLocaleDateString("tr-TR")} - {new Date(sprint.endDate).toLocaleDateString("tr-TR")}
              </p>
              <span className={`mt-2 inline-flex rounded border px-2 py-1 text-[11px] ${getSprintStatusTone(sprint.status)}`}>
                {sprint.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <ReleaseSourcePanel releases={releases} />
    </div>
  );
}

function SprintStatusSourcePanel({
  tasks,
  sprints,
}: {
  tasks: WorkspaceSourceTask[];
  sprints: WorkspaceSourceSprint[];
}) {
  const counts = useMemo(
    () => ({
      total: tasks.length,
      done: tasks.filter((task) => task.status === "DONE").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      blocked: tasks.filter((task) => task.status === "BLOCKED").length,
    }),
    [tasks],
  );

  const progress = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
  const tasksBySprint = useMemo(() => {
    const bucket = new Map<string, WorkspaceSourceTask[]>();
    for (const task of tasks) {
      const key = task.sprint?.id ?? "UNASSIGNED";
      const list = bucket.get(key) ?? [];
      list.push(task);
      bucket.set(key, list);
    }
    return bucket;
  }, [tasks]);

  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Sprint Durumu</h2>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricPill label="Toplam" value={String(counts.total)} />
        <MetricPill label="Tamamlanan" value={String(counts.done)} />
        <MetricPill label="Devam Eden" value={String(counts.inProgress)} />
        <MetricPill label="Blocked" value={String(counts.blocked)} />
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#121212]">
        <div className="h-full rounded-full bg-[#AAFF01]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mb-4 text-xs text-[#A0A0A0]">Sprint tamamlanma oranı: %{progress}</p>
      {sprints.length > 0 ? (
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm text-white">{sprint.name}</p>
                <span className={`rounded border px-2 py-1 text-[11px] ${getSprintStatusTone(sprint.status)}`}>
                  {sprint.status}
                </span>
              </div>
              {sprint.goal ? <p className="text-xs text-[#d7d7d7]">Hedef: {sprint.goal}</p> : null}
              <p className="mt-1 text-xs text-[#A0A0A0]">
                {new Date(sprint.startDate).toLocaleDateString("tr-TR")} - {new Date(sprint.endDate).toLocaleDateString("tr-TR")}
              </p>
              <p className="mt-1 text-xs text-[#A0A0A0]">
                Görev: {(tasksBySprint.get(sprint.id) ?? []).length}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {tasksBySprint.get("UNASSIGNED")?.length ? (
        <div className="mb-5 rounded-xl border border-[#FFA726]/20 bg-[#FFA726]/10 p-3 text-xs text-[#FFA726]">
          Sprint’e atanmamış görev: {tasksBySprint.get("UNASSIGNED")?.length}
        </div>
      ) : null}
      <TaskSourcePanel title="Sprint Görevleri" tasks={tasks} emptyText="Sprint görevi bulunmuyor." />
    </div>
  );
}

function ReleaseSourcePanel({ releases }: { releases: WorkspaceSourceRelease[] }) {
  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Release / Yayın Planı</h2>
      {releases.length === 0 ? <p className="text-sm text-[#A0A0A0]">Henüz release planı bulunmuyor.</p> : null}
      <div className="space-y-3">
        {releases.slice(0, 10).map((release) => (
          <div key={release.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded border border-[#7B61FF]/20 bg-[#7B61FF]/10 px-2 py-1 text-[11px] text-[#7B61FF]">
                {release.environment}
              </span>
              <span className={`rounded border px-2 py-1 text-[11px] ${getReleaseStatusTone(release.status)}`}>
                {release.status}
              </span>
              {release.approvalStatus ? (
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {release.approvalStatus}
                </span>
              ) : null}
            </div>
            <p className="text-white">{release.title}</p>
            <p className="mt-1 text-xs text-[#A0A0A0]">
              Versiyon: {release.version ?? "—"} • Planlanan: {release.scheduledAt ? new Date(release.scheduledAt).toLocaleString("tr-TR") : "—"} •
              Yayın: {release.deployedAt ? new Date(release.deployedAt).toLocaleString("tr-TR") : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspaceSourceFilesPanel({ files }: { files: WorkspaceSourceFile[] }) {
  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Müşteriye Açık Dosyalar</h2>
      {files.length === 0 ? <p className="text-sm text-[#A0A0A0]">Bu projede henüz dosya paylaşılmamış.</p> : null}
      <div className="space-y-3">
        {files.slice(0, 12).map((file) => (
          <div key={file.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {file.folder?.name ? (
                <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                  {file.folder.name}
                </span>
              ) : null}
              <span className="rounded border border-white/[0.16] px-2 py-1 text-[11px] text-[#CFCFCF]">
                {file.category ?? "GENEL"}
              </span>
            </div>
            <p className="text-white">{file.title}</p>
            <p className="mt-1 text-xs text-[#A0A0A0]">{file.originalFileName}</p>
            <a
              href={file.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#AAFF01] hover:underline"
            >
              Dosyayı Görüntüle
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspaceRevisionPanel({
  revisions,
  isCreating,
  isUpdating,
  revisionTitle,
  revisionDescription,
  revisionResponseNote,
  revisionActionError,
  currentUserId,
  onChangeRevisionTitle,
  onChangeRevisionDescription,
  onChangeRevisionResponseNote,
  onCreateRevision,
  onUpdateRevisionStatus,
}: {
  revisions: WorkspaceRevision[];
  isCreating: boolean;
  isUpdating: boolean;
  revisionTitle: string;
  revisionDescription: string;
  revisionResponseNote: Record<string, string>;
  revisionActionError: string | null;
  currentUserId: string | null;
  onChangeRevisionTitle: (value: string) => void;
  onChangeRevisionDescription: (value: string) => void;
  onChangeRevisionResponseNote: (revisionId: string, note: string) => void;
  onCreateRevision: () => Promise<void>;
  onUpdateRevisionStatus: (revisionId: string, status: WorkspaceRevisionStatus) => Promise<void>;
}) {
  const getAllowedTransitions = (revision: WorkspaceRevision): WorkspaceRevisionStatus[] => {
    const requesterId = revision.requestedByUserId ?? revision.requestedBy?.id ?? null;
    if (!currentUserId || requesterId !== currentUserId) {
      return [];
    }
    if (revision.status === "READY_FOR_REVIEW") {
      return ["APPROVED", "REJECTED"];
    }
    return [];
  };

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl text-white">Revizyon Durumları</h2>
        <span className="text-xs text-[#A0A0A0]">WEB_APP workspace lifecycle</span>
      </div>
      <div className="mb-4 space-y-3 rounded-xl border border-white/[0.08] bg-[#202020] p-3">
        <p className="text-sm text-white">Yeni revizyon talebi oluştur</p>
        <input
          className="h-10 w-full rounded-md border border-white/[0.12] bg-[#141414] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/50"
          value={revisionTitle}
          onChange={(event) => onChangeRevisionTitle(event.target.value)}
          placeholder="Revizyon başlığı"
        />
        <textarea
          value={revisionDescription}
          onChange={(event) => onChangeRevisionDescription(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-white/[0.12] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#AAFF01]/50"
          placeholder="Revizyon talebini detaylandırın"
        />
        <Button
          variant="primary"
          className={`w-full justify-center text-sm ${isCreating ? "pointer-events-none opacity-60" : ""}`}
          onClick={() => void onCreateRevision()}
        >
          {isCreating ? "Gönderiliyor..." : "Revizyon Talebi Oluştur"}
        </Button>
        {revisionActionError ? <p className="text-xs text-red-300">{revisionActionError}</p> : null}
      </div>
      <div className="space-y-3">
        {revisions.slice(0, 8).map((revision) => (
          <div key={revision.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-white">{revision.title}</p>
              <span className={`rounded border px-2 py-1 text-[11px] ${getRevisionStatusTone(revision.status)}`}>
                {revision.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#d7d7d7]">{revision.description}</p>
            <p className="mt-1 text-xs text-[#A0A0A0]">
              {new Date(revision.requestedAt).toLocaleString('tr-TR')}
            </p>
            {revision.assignedTo?.displayName ? (
              <p className="mt-1 text-xs text-[#A0A0A0]">Atanan: {revision.assignedTo.displayName}</p>
            ) : null}
            {getAllowedTransitions(revision).length > 0 ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={revisionResponseNote[revision.id] ?? ""}
                  onChange={(event) => onChangeRevisionResponseNote(revision.id, event.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-white/[0.12] bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#AAFF01]/50"
                  placeholder="Opsiyonel not"
                />
                <div className="flex flex-wrap gap-2">
                  {getAllowedTransitions(revision).map((status) => (
                    <Button
                      key={`${revision.id}-${status}`}
                      variant={status === "APPROVED" ? "primary" : "secondary"}
                      className={`text-xs ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
                      onClick={() => void onUpdateRevisionStatus(revision.id, status)}
                    >
                      {status === "APPROVED"
                        ? "Onayla"
                        : status === "REJECTED"
                          ? "Revizyon İste"
                          : "Talebi İptal Et"}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {revisions.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Bu sekme için revizyon kaydı bulunmuyor.</p>
        ) : null}
      </div>
    </div>
  );
}

function TaskBasedRevisionPanel({
  serviceId,
  projectId,
  tasks,
  isLoading,
}: {
  serviceId: string;
  projectId?: string | null;
  tasks: ClientTask[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className={cardClass}>
        <h2 className="mb-3 text-xl text-white">Revizyon Görevleri</h2>
        <p className="text-sm text-[#A0A0A0]">Revizyon görevleri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-xl text-white">Revizyon Görevleri</h2>
      <p className="mb-4 text-xs text-[#A0A0A0]">
        WEB_APP dışındaki servislerde revizyonlar görev tabanlı gösterilir.
      </p>
      {tasks.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">
          {projectId
            ? "Bu proje için revizyon görevi bulunmuyor."
            : `${getServiceLabel(serviceId)} için revizyon görevi bulunmuyor.`}
        </p>
      ) : null}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded border px-2 py-1 text-[11px] ${getClientTaskStatusTone(task.status)}`}>
                {getClientTaskStatusLabel(task.status)}
              </span>
              <span className={`rounded border px-2 py-1 text-[11px] ${getClientTaskPriorityTone(task.priority)}`}>
                {getClientTaskPriorityLabel(task.priority)}
              </span>
              {task.type ? (
                <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                  {getClientTaskTypeLabel(task.type)}
                </span>
              ) : null}
              {task.workstream ? (
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {getClientTaskWorkstreamLabel(task.workstream)}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-white">{task.title}</p>
            {task.description ? <p className="mt-1 text-xs text-[#d7d7d7]">{task.description}</p> : null}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#A0A0A0]">
              <span>Proje: {task.projectName ?? "—"}</span>
              {task.sprint?.name ? <span>Sprint: {task.sprint.name}</span> : null}
              {task.dueDate ? <span>Teslim: {new Date(task.dueDate).toLocaleDateString("tr-TR")}</span> : null}
              <span>İlerleme: %{task.progressPercent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaAdsServiceTab({
  tabId,
  content,
}: {
  tabId: string;
  content: ServiceTabContent;
}) {
  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
  } = useGetOwnMetaAdsConfigQuery();
  const isConnected = config?.connectionStatus === "CONNECTED";
  const shouldSkipReportingQueries = !isConnected;

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetOwnMetaAdsSummaryQuery(undefined, { skip: shouldSkipReportingQueries });
  const {
    data: campaignsResponse,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
  } = useGetOwnMetaAdsCampaignsQuery({ limit: 24 }, { skip: shouldSkipReportingQueries });
  const {
    data: adSetsResponse,
    isLoading: isAdSetsLoading,
    isError: isAdSetsError,
  } = useGetOwnMetaAdsAdSetsQuery({ limit: 60 }, { skip: shouldSkipReportingQueries });
  const {
    data: adsResponse,
    isLoading: isAdsLoading,
    isError: isAdsError,
  } = useGetOwnMetaAdsAdsQuery({ limit: 60 }, { skip: shouldSkipReportingQueries });
  const {
    data: insightsResponse,
    isLoading: isInsightsLoading,
    isError: isInsightsError,
  } = useGetOwnMetaAdsInsightsQuery(
    { level: "ACCOUNT", limit: 60 },
    { skip: shouldSkipReportingQueries },
  );
  const {
    data: pixelStatus,
    isLoading: isPixelLoading,
    isError: isPixelError,
  } = useGetOwnMetaAdsPixelStatusQuery(undefined, { skip: shouldSkipReportingQueries });
  const {
    data: reportsResponse,
    isLoading: isReportsLoading,
    isError: isReportsError,
  } = useGetOwnMetaAdsReportsQuery(
    { limit: 20 },
    { skip: !isConnected || tabId !== "meta-reports" },
  );
  const {
    data: approvalTasks = [],
    isLoading: isApprovalsLoading,
    isError: isApprovalsError,
  } = useGetClientTasksQuery(
    { approvalRequired: true },
    { skip: !isConnected || tabId !== "approvals" },
  );
  const [updateClientTaskApproval, { isLoading: isUpdatingApproval }] =
    useUpdateClientTaskApprovalMutation();
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);

  const campaigns = campaignsResponse?.data ?? [];
  const adSets = adSetsResponse?.data ?? [];
  const ads = adsResponse?.data ?? [];
  const reports = reportsResponse?.data ?? [];
  const metaAdsApprovalTasks = useMemo(
    () =>
      approvalTasks
        .filter((task) => task.projectServiceId === "meta-ads"),
    [approvalTasks],
  );
  const pendingApprovalRows = useMemo(
    () => metaAdsApprovalTasks.filter((task) => task.approvalStatus === "PENDING").slice(0, 10),
    [metaAdsApprovalTasks],
  );
  const approvalHistoryRows = useMemo(
    () =>
      metaAdsApprovalTasks
        .filter((task) => task.approvalStatus && task.approvalStatus !== "PENDING")
        .slice(0, 10),
    [metaAdsApprovalTasks],
  );
  const approvalProjectId = pendingApprovalRows[0]?.projectId ?? metaAdsApprovalTasks[0]?.projectId ?? null;
  const {
    data: approvalCreativeFilesResponse,
    isLoading: isApprovalCreativeFilesLoading,
    isError: isApprovalCreativeFilesError,
  } = useGetClientProjectFilesQuery(
    {
      projectId: approvalProjectId ?? "",
      category: "ADS_CREATIVE",
      approvalRequired: true,
    },
    { skip: tabId !== "approvals" || !approvalProjectId },
  );
  const pendingApprovalCreativeFiles = useMemo(
    () =>
      (approvalCreativeFilesResponse?.data ?? [])
        .filter((file) => file.approvalStatus === "PENDING")
        .slice(0, 6),
    [approvalCreativeFilesResponse?.data],
  );
  const notes = useMemo(() => buildMetaAdsAgencyNotes(summary, campaigns), [summary, campaigns]);
  const lastSyncAt =
    summary?.lastSyncAt ??
    campaignsResponse?.lastSyncAt ??
    insightsResponse?.lastSyncAt ??
    pixelStatus?.lastSyncAt ??
    config?.lastSyncAt ??
    null;

  const handleMetaAdsApprovalDecision = async (
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => {
    if (isUpdatingApproval) {
      return;
    }

    setActiveApprovalTaskId(task.id);
    try {
      await updateClientTaskApproval({
        taskId: task.id,
        body: {
          approvalStatus,
          approvalResponseNote: approvalResponseNote?.trim() || undefined,
        },
      }).unwrap();
      const feedback = getApprovalDecisionFeedback(task.title, approvalStatus);
      runClientAction(feedback.message, feedback.action);
    } catch {
      runClientAction(`${task.title} onayı güncellenemedi`, "comment");
    } finally {
      setActiveApprovalTaskId(null);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="p-8">
        <MetaAdsStatePanel title="Meta bağlantısı kontrol ediliyor..." />
      </div>
    );
  }

  if (isConfigError) {
    return (
      <div className="p-8">
        <MetaAdsStatePanel
          title="Meta bağlantı bilgileri alınamadı"
          description="Lütfen biraz sonra tekrar deneyin."
          tone="error"
        />
      </div>
    );
  }

  if (!isConnected) {
    const connectionNotice = getClientMetaAdsConnectionNotice(config?.connectionStatus);
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <MetaAdsStatePanel
          title={connectionNotice.title}
          description={connectionNotice.description}
          tone={connectionNotice.tone}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricPill label="Harcama" value={formatMetaCurrency(summary?.spend ?? 0)} />
        <MetricPill label="Gösterim" value={formatMetaInteger(summary?.impressions ?? 0)} />
        <MetricPill label="Tıklama" value={formatMetaInteger(summary?.clicks ?? 0)} />
        <MetricPill label="CTR" value={formatMetaPercent(summary?.ctr ?? 0)} />
        <MetricPill label="Sonuç" value={formatMetaInteger(summary?.results ?? 0)} />
        <MetricPill
          label="ROAS"
          value={summary?.roas !== null && summary?.roas !== undefined ? `${summary.roas.toFixed(2)}x` : "—"}
        />
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-xs text-[#A0A0A0]">
        Veriler Meta’dan alınmıştır. Son senkron:{" "}
        <span className="text-white">
          {lastSyncAt ? new Date(lastSyncAt).toLocaleString("tr-TR") : "Henüz senkron yok"}
        </span>
      </div>

      {tabId === "campaigns" ? (
        <MetaAdsEntityGrid
          title="Kampanyalar"
          loading={isCampaignsLoading || isSummaryLoading}
          isError={isCampaignsError || isSummaryError}
          rows={campaigns}
          emptyMessage="Seçili tarih aralığında kampanya verisi bulunamadı."
        />
      ) : null}

      {tabId === "ad-sets" ? (
        <MetaAdsInsightGrid
          title="Reklam Setleri"
          loading={isAdSetsLoading}
          isError={isAdSetsError}
          rows={adSets}
          emptyMessage="Reklam seti verisi bulunamadı."
        />
      ) : null}

      {tabId === "creatives" ? (
        <MetaAdsInsightGrid
          title="Reklamlar / Kreatifler"
          loading={isAdsLoading}
          isError={isAdsError}
          rows={ads}
          emptyMessage="Reklam/kreatif verisi bulunamadı."
        />
      ) : null}

      {tabId === "audiences" ? (
        <MetaAdsAudiencePanel rows={adSets} loading={isAdSetsLoading} isError={isAdSetsError} />
      ) : null}

      {tabId === "pixel-events" ? (
        <MetaAdsPixelPanel data={pixelStatus} loading={isPixelLoading} isError={isPixelError} />
      ) : null}

      {tabId === "meta-reports" ? (
        <MetaAdsReportPanel rows={reports} loading={isReportsLoading} isError={isReportsError} />
      ) : null}

      {tabId === "agency-notes" ? (
        <MetaAdsAgencyNotesPanel notes={notes} loading={isCampaignsLoading || isSummaryLoading} />
      ) : null}

      {tabId === "approvals" ? (
        <MetaAdsApprovalsPanel
          tasks={pendingApprovalRows}
          history={approvalHistoryRows}
          creativeFiles={pendingApprovalCreativeFiles}
          loading={isApprovalsLoading || isApprovalCreativeFilesLoading}
          isError={isApprovalsError || isApprovalCreativeFilesError}
          isActionLoading={isUpdatingApproval}
          activeTaskId={activeApprovalTaskId}
          onDecision={handleMetaAdsApprovalDecision}
        />
      ) : null}
    </div>
  );
}

function TikTokAdsServiceTab({
  tabId,
  content,
}: {
  tabId: string;
  content: ServiceTabContent;
}) {
  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
  } = useGetOwnTikTokAdsConfigQuery();
  const isConnected = config?.connectionStatus === "CONNECTED";
  const shouldSkipReportingQueries = !isConnected;

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetOwnTikTokAdsSummaryQuery(undefined, { skip: shouldSkipReportingQueries });
  const {
    data: campaignsResponse,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
  } = useGetOwnTikTokAdsCampaignsQuery({ limit: 24 }, { skip: shouldSkipReportingQueries });
  const {
    data: campaignInsightsResponse,
  } = useGetOwnTikTokAdsInsightsQuery(
    { level: "CAMPAIGN", limit: 60 },
    { skip: shouldSkipReportingQueries },
  );
  const {
    data: adGroupInsightsResponse,
    isLoading: isAdGroupsLoading,
    isError: isAdGroupsError,
  } = useGetOwnTikTokAdsInsightsQuery(
    { level: "ADGROUP", limit: 60 },
    { skip: shouldSkipReportingQueries },
  );
  const {
    data: adInsightsResponse,
    isLoading: isAdsLoading,
    isError: isAdsError,
  } = useGetOwnTikTokAdsInsightsQuery(
    { level: "AD", limit: 60 },
    { skip: shouldSkipReportingQueries },
  );
  const {
    data: tiktokReportsResponse,
    isLoading: isTikTokReportsLoading,
    isError: isTikTokReportsError,
  } = useGetOwnTikTokAdsReportsQuery(
    { limit: 20 },
    { skip: !isConnected || tabId !== "optimization-notes" },
  );
  const [exportTikTokReport, { isLoading: isExportingTikTokReport }] =
    useExportOwnTikTokAdsReportMutation();
  const {
    data: ugcTasks = [],
    isLoading: isUgcTasksLoading,
    isError: isUgcTasksError,
  } = useGetClientTasksQuery(undefined, { skip: !isConnected || tabId !== "ugc-scripts" });
  const [updateClientTaskApproval, { isLoading: isUpdatingApproval }] =
    useUpdateClientTaskApprovalMutation();
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);
  const [activeTikTokReportExportId, setActiveTikTokReportExportId] = useState<string | null>(null);

  const campaigns = campaignsResponse?.data ?? [];
  const adGroups = adGroupInsightsResponse?.data ?? [];
  const ads = adInsightsResponse?.data ?? [];
  const tiktokReports = tiktokReportsResponse?.data ?? [];
  const tiktokTasks = useMemo(
    () =>
      ugcTasks
        .filter((task) => task.projectServiceId === "tiktok-ads" && !task.approvalRequired)
        .slice(0, 12),
    [ugcTasks],
  );
  const tiktokApprovalTasks = useMemo(
    () => ugcTasks.filter((task) => task.projectServiceId === "tiktok-ads" && task.approvalRequired),
    [ugcTasks],
  );
  const pendingTikTokApprovalRows = useMemo(
    () => tiktokApprovalTasks.filter((task) => task.approvalStatus === "PENDING").slice(0, 10),
    [tiktokApprovalTasks],
  );
  const tiktokApprovalHistoryRows = useMemo(
    () =>
      tiktokApprovalTasks
        .filter((task) => task.approvalStatus && task.approvalStatus !== "PENDING")
        .slice(0, 10),
    [tiktokApprovalTasks],
  );
  const tiktokApprovalProjectId =
    pendingTikTokApprovalRows[0]?.projectId ?? tiktokApprovalTasks[0]?.projectId ?? null;
  const {
    data: tiktokApprovalCreativeFilesResponse,
    isLoading: isTikTokApprovalCreativeFilesLoading,
    isError: isTikTokApprovalCreativeFilesError,
  } = useGetClientProjectFilesQuery(
    {
      projectId: tiktokApprovalProjectId ?? "",
      category: "ADS_CREATIVE",
      approvalRequired: true,
    },
    { skip: tabId !== "ugc-scripts" || !tiktokApprovalProjectId },
  );
  const pendingTikTokApprovalCreativeFiles = useMemo(
    () =>
      (tiktokApprovalCreativeFilesResponse?.data ?? [])
        .filter((file) => file.approvalStatus === "PENDING")
        .slice(0, 6),
    [tiktokApprovalCreativeFilesResponse?.data],
  );
  const notes = useMemo(
    () => buildTikTokAgencyNotes(summary, campaigns, ads),
    [summary, campaigns, ads],
  );
  const lastSyncAt =
    summary?.lastSyncAt ??
    campaignsResponse?.lastSyncAt ??
    campaignInsightsResponse?.lastSyncAt ??
    config?.lastSyncAt ??
    null;

  const handleTikTokApprovalDecision = async (
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => {
    if (isUpdatingApproval) {
      return;
    }

    setActiveApprovalTaskId(task.id);
    try {
      await updateClientTaskApproval({
        taskId: task.id,
        body: {
          approvalStatus,
          approvalResponseNote: approvalResponseNote?.trim() || undefined,
        },
      }).unwrap();
      const feedback = getApprovalDecisionFeedback(task.title, approvalStatus);
      runClientAction(feedback.message, feedback.action);
    } catch {
      runClientAction(`${task.title} onayı güncellenemedi`, "comment");
    } finally {
      setActiveApprovalTaskId(null);
    }
  };

  const handleTikTokReportExport = async (
    report: TikTokAdsReportItem,
    format: TikTokAdsReportExportFormat,
  ) => {
    if (isExportingTikTokReport) {
      return;
    }

    setActiveTikTokReportExportId(report.id);
    try {
      const body = await exportTikTokReport({ reportId: report.id, format }).unwrap();
      downloadTikTokAdsReportFile(report, format, body);
      runClientAction(`TikTok Ads raporu ${format.toUpperCase()} olarak indirildi`, "report");
    } catch {
      runClientAction("TikTok Ads raporu indirilemedi", "comment");
    } finally {
      setActiveTikTokReportExportId(null);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="p-8">
        <MetaAdsStatePanel title="TikTok Ads bağlantısı kontrol ediliyor..." />
      </div>
    );
  }

  if (isConfigError) {
    return (
      <div className="p-8">
        <MetaAdsStatePanel
          title="TikTok Ads bağlantı bilgileri alınamadı"
          description="Lütfen biraz sonra tekrar deneyin."
          tone="error"
        />
      </div>
    );
  }

  if (!isConnected) {
    const connectionNotice = getClientTikTokAdsConnectionNotice(config?.connectionStatus);
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <MetaAdsStatePanel
          title={connectionNotice.title}
          description={connectionNotice.description}
          tone={connectionNotice.tone}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricPill label="Harcama" value={formatTikTokCurrency(summary?.spend ?? 0)} />
        <MetricPill label="Video İzlenme" value={formatTikTokInteger(summary?.videoViews ?? 0)} />
        <MetricPill label="Tıklama" value={formatTikTokInteger(summary?.clicks ?? 0)} />
        <MetricPill label="CTR" value={formatTikTokPercent(summary?.ctr ?? 0)} />
        <MetricPill label="VTR" value={formatTikTokPercent(summary?.vtr ?? 0)} />
        <MetricPill label="Dönüşüm" value={formatTikTokInteger(summary?.conversions ?? 0)} />
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-xs text-[#A0A0A0]">
        Veriler TikTok Ads snapshot API yüzeyinden alınmıştır. Son senkron:{" "}
        <span className="text-white">
          {lastSyncAt ? new Date(lastSyncAt).toLocaleString("tr-TR") : "Henüz senkron yok"}
        </span>
      </div>

      {tabId === "campaigns" ? (
        <TikTokCampaignGrid
          rows={campaigns}
          loading={isCampaignsLoading || isSummaryLoading}
          isError={isCampaignsError || isSummaryError}
        />
      ) : null}

      {tabId === "video-creatives" ? (
        <TikTokInsightGrid
          title="Video Kreatifler"
          rows={ads}
          loading={isAdsLoading}
          isError={isAdsError}
          emptyMessage="Video kreatif verisi bulunamadı."
        />
      ) : null}

      {tabId === "hook-tests" ? (
        <TikTokHookPanel rows={ads} loading={isAdsLoading} isError={isAdsError} />
      ) : null}

      {tabId === "audiences" ? (
        <TikTokAudiencePanel rows={adGroups} loading={isAdGroupsLoading} isError={isAdGroupsError} />
      ) : null}

      {tabId === "pixel-events" ? (
        <TikTokPixelPanel
          advertiserId={config?.advertiserId ?? null}
          summary={summary}
          lastSyncAt={lastSyncAt}
          loading={isSummaryLoading}
          isError={isSummaryError}
        />
      ) : null}

      {tabId === "ugc-scripts" ? (
        <div className="space-y-6">
          <TikTokUgcScriptsPanel
            rows={tiktokTasks}
            loading={isUgcTasksLoading}
            isError={isUgcTasksError}
          />
          <MetaAdsApprovalsPanel
            serviceLabel="TikTok Ads"
            tasks={pendingTikTokApprovalRows}
            history={tiktokApprovalHistoryRows}
            creativeFiles={pendingTikTokApprovalCreativeFiles}
            loading={isUgcTasksLoading || isTikTokApprovalCreativeFilesLoading}
            isError={isUgcTasksError || isTikTokApprovalCreativeFilesError}
            isActionLoading={isUpdatingApproval}
            activeTaskId={activeApprovalTaskId}
            onDecision={handleTikTokApprovalDecision}
          />
        </div>
      ) : null}

      {tabId === "optimization-notes" ? (
        <div className="space-y-6">
          <TikTokAdsReportPanel
            rows={tiktokReports}
            loading={isTikTokReportsLoading}
            isError={isTikTokReportsError}
            exportingReportId={activeTikTokReportExportId}
            isExporting={isExportingTikTokReport}
            onExport={handleTikTokReportExport}
          />
          <TikTokOptimizationNotesPanel notes={notes} loading={isCampaignsLoading || isAdsLoading || isSummaryLoading} />
        </div>
      ) : null}
    </div>
  );
}

function AmazonAdsServiceTab({
  tabId,
  content,
}: {
  tabId: string;
  content: ServiceTabContent;
}) {
  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
  } = useGetOwnAmazonAdsConfigQuery();
  const isConnected = config?.connectionStatus === "CONNECTED";
  const shouldSkipReportingQueries = !isConnected;

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetOwnAmazonAdsSummaryQuery(undefined, { skip: shouldSkipReportingQueries });
  const {
    data: campaignsResponse,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
  } = useGetOwnAmazonAdsCampaignsQuery({ limit: 60 }, { skip: shouldSkipReportingQueries });
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useGetOwnAmazonAdsProductsQuery({ limit: 60 }, { skip: shouldSkipReportingQueries });
  const {
    data: searchTermInsightsResponse,
    isLoading: isInsightsLoading,
    isError: isInsightsError,
  } = useGetOwnAmazonAdsInsightsQuery(
    { level: "SEARCH_TERM", limit: 300 },
    { skip: shouldSkipReportingQueries },
  );
  const {
    data: amazonReportsResponse,
    isLoading: isAmazonReportsLoading,
    isError: isAmazonReportsError,
  } = useGetOwnAmazonAdsReportsQuery(
    { limit: 40 },
    { skip: shouldSkipReportingQueries },
  );
  const [exportAmazonReport, { isLoading: isExportingAmazonReport }] =
    useExportOwnAmazonAdsReportMutation();
  const {
    data: approvalTasks = [],
    isLoading: isApprovalsLoading,
    isError: isApprovalsError,
  } = useGetClientTasksQuery(
    { approvalRequired: true },
    { skip: !isConnected || tabId !== "approvals" },
  );
  const [updateClientTaskApproval, { isLoading: isUpdatingApproval }] =
    useUpdateClientTaskApprovalMutation();
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);
  const [activeAmazonReportExportId, setActiveAmazonReportExportId] = useState<string | null>(null);

  const campaigns = campaignsResponse?.data ?? [];
  const sponsoredProductsCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.adProduct === "SPONSORED_PRODUCTS"),
    [campaigns],
  );
  const sponsoredBrandsCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.adProduct === "SPONSORED_BRANDS"),
    [campaigns],
  );
  const sponsoredDisplayCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.adProduct === "SPONSORED_DISPLAY"),
    [campaigns],
  );
  const products = productsResponse?.data ?? [];
  const amazonReports = amazonReportsResponse?.data ?? [];
  const searchTermInsights = searchTermInsightsResponse?.data ?? [];
  const keywordRows = useMemo(() => buildAmazonKeywordRows(searchTermInsights), [searchTermInsights]);
  const targetRows = useMemo(() => buildAmazonTargetRows(searchTermInsights), [searchTermInsights]);
  const searchTermRows = useMemo(
    () => buildAmazonSearchTermRows(searchTermInsights),
    [searchTermInsights],
  );
  const currencyCode = config?.currencyCode ?? "TRY";
  const notes = useMemo(
    () => buildAmazonAgencyNotes(summary, campaigns, products, searchTermRows, currencyCode),
    [summary, campaigns, products, searchTermRows, currencyCode],
  );
  const amazonApprovalTasks = useMemo(
    () => approvalTasks.filter((task) => task.projectServiceId === "amazon-ads"),
    [approvalTasks],
  );
  const pendingApprovalRows = useMemo(
    () => amazonApprovalTasks.filter((task) => task.approvalStatus === "PENDING").slice(0, 10),
    [amazonApprovalTasks],
  );
  const approvalHistoryRows = useMemo(
    () =>
      amazonApprovalTasks
        .filter((task) => task.approvalStatus && task.approvalStatus !== "PENDING")
        .slice(0, 10),
    [amazonApprovalTasks],
  );
  const approvalProjectId = pendingApprovalRows[0]?.projectId ?? amazonApprovalTasks[0]?.projectId ?? null;
  const {
    data: approvalCreativeFilesResponse,
    isLoading: isApprovalCreativeFilesLoading,
    isError: isApprovalCreativeFilesError,
  } = useGetClientProjectFilesQuery(
    {
      projectId: approvalProjectId ?? "",
      category: "ADS_CREATIVE",
      approvalRequired: true,
    },
    { skip: tabId !== "approvals" || !approvalProjectId },
  );
  const pendingApprovalCreativeFiles = useMemo(
    () =>
      (approvalCreativeFilesResponse?.data ?? [])
        .filter((file) => file.approvalStatus === "PENDING")
        .slice(0, 6),
    [approvalCreativeFilesResponse?.data],
  );
  const lastSyncAt =
    summary?.lastSyncAt ??
    campaignsResponse?.lastSyncAt ??
    productsResponse?.lastSyncAt ??
    searchTermInsightsResponse?.lastSyncAt ??
    config?.lastSyncAt ??
    null;

  const handleAmazonApprovalDecision = async (
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => {
    if (isUpdatingApproval) {
      return;
    }

    setActiveApprovalTaskId(task.id);
    try {
      await updateClientTaskApproval({
        taskId: task.id,
        body: {
          approvalStatus,
          approvalResponseNote: approvalResponseNote?.trim() || undefined,
        },
      }).unwrap();
      const feedback = getApprovalDecisionFeedback(task.title, approvalStatus);
      runClientAction(feedback.message, feedback.action);
    } catch {
      runClientAction(`${task.title} onayı güncellenemedi`, "comment");
    } finally {
      setActiveApprovalTaskId(null);
    }
  };

  const handleAmazonReportExport = async (
    report: AmazonAdsReportItem,
    format: AmazonAdsReportExportFormat,
  ) => {
    if (isExportingAmazonReport) {
      return;
    }

    setActiveAmazonReportExportId(report.id);
    try {
      const body = await exportAmazonReport({ reportId: report.id, format }).unwrap();
      downloadAmazonAdsReportFile(report, format, body);
      runClientAction(`Amazon Ads raporu ${format.toUpperCase()} olarak indirildi`, "report");
    } catch {
      runClientAction("Amazon Ads raporu indirilemedi", "comment");
    } finally {
      setActiveAmazonReportExportId(null);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="p-8">
        <MetaAdsStatePanel title="Amazon Ads bağlantısı kontrol ediliyor..." />
      </div>
    );
  }

  if (isConfigError) {
    return (
      <div className="p-8">
        <MetaAdsStatePanel
          title="Amazon Ads bağlantı bilgileri alınamadı"
          description="Lütfen biraz sonra tekrar deneyin."
          tone="error"
        />
      </div>
    );
  }

  if (!isConnected) {
    const connectionNotice = getClientAmazonAdsConnectionNotice(config?.connectionStatus);
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <MetaAdsStatePanel
          title={connectionNotice.title}
          description={connectionNotice.description}
          tone={connectionNotice.tone}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricPill label="Harcama" value={formatAmazonCurrency(summary?.spend ?? 0, currencyCode)} />
        <MetricPill label="Gösterim" value={formatAmazonInteger(summary?.impressions ?? 0)} />
        <MetricPill label="Tıklama" value={formatAmazonInteger(summary?.clicks ?? 0)} />
        <MetricPill label="Satış" value={formatAmazonCurrency(summary?.sales ?? 0, currencyCode)} />
        <MetricPill label="ACOS" value={formatAmazonPercent(summary?.acos ?? 0)} />
        <MetricPill
          label="ROAS"
          value={summary?.roas !== undefined ? `${summary.roas.toFixed(2)}x` : "—"}
        />
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-xs text-[#A0A0A0]">
        Veriler Amazon Ads API üzerinden alınmıştır. Son senkron:{" "}
        <span className="text-white">
          {lastSyncAt ? new Date(lastSyncAt).toLocaleString("tr-TR") : "Henüz senkron yok"}
        </span>
      </div>

      {tabId === "sponsored-products" ? (
        <AmazonCampaignGrid
          title="Sponsored Products Kampanyaları"
          rows={sponsoredProductsCampaigns}
          loading={isCampaignsLoading || isSummaryLoading}
          isError={isCampaignsError || isSummaryError}
          emptyMessage="Sponsored Products kampanya verisi bulunamadı."
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "sponsored-brands" ? (
        <AmazonCampaignGrid
          title="Sponsored Brands Kampanyaları"
          rows={sponsoredBrandsCampaigns}
          loading={isCampaignsLoading || isSummaryLoading}
          isError={isCampaignsError || isSummaryError}
          emptyMessage="Sponsored Brands kampanya verisi bulunamadı."
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "sponsored-display" ? (
        <AmazonCampaignGrid
          title="Sponsored Display Kampanyaları"
          rows={sponsoredDisplayCampaigns}
          loading={isCampaignsLoading || isSummaryLoading}
          isError={isCampaignsError || isSummaryError}
          emptyMessage="Sponsored Display kampanya verisi bulunamadı."
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "campaigns" ? (
        <AmazonCampaignGrid
          title="Amazon Ads Kampanyaları"
          rows={campaigns}
          loading={isCampaignsLoading || isSummaryLoading}
          isError={isCampaignsError || isSummaryError}
          emptyMessage="Seçili tarih aralığında kampanya verisi bulunamadı."
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "products-asin" ? (
        <AmazonProductGrid
          rows={products}
          loading={isProductsLoading}
          isError={isProductsError}
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "keywords" ? (
        <AmazonKeywordGrid
          rows={keywordRows}
          loading={isInsightsLoading}
          isError={isInsightsError}
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "targeting" ? (
        <AmazonTargetingGrid
          rows={targetRows}
          loading={isInsightsLoading}
          isError={isInsightsError}
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "search-terms" ? (
        <AmazonSearchTermGrid
          rows={searchTermRows}
          loading={isInsightsLoading}
          isError={isInsightsError}
          currencyCode={currencyCode}
        />
      ) : null}

      {tabId === "amazon-reports" ? (
        <AmazonAdsReportPanel
          rows={amazonReports}
          loading={isAmazonReportsLoading}
          isError={isAmazonReportsError}
          exportingReportId={activeAmazonReportExportId}
          isExporting={isExportingAmazonReport}
          onExport={handleAmazonReportExport}
        />
      ) : null}

      {tabId === "agency-notes" ? (
        <MetaAdsAgencyNotesPanel notes={notes} loading={isSummaryLoading || isCampaignsLoading} />
      ) : null}

      {tabId === "approvals" ? (
        <MetaAdsApprovalsPanel
          serviceLabel="Amazon Ads"
          tasks={pendingApprovalRows}
          history={approvalHistoryRows}
          creativeFiles={pendingApprovalCreativeFiles}
          loading={isApprovalsLoading || isApprovalCreativeFilesLoading}
          isError={isApprovalsError || isApprovalCreativeFilesError}
          isActionLoading={isUpdatingApproval}
          activeTaskId={activeApprovalTaskId}
          onDecision={handleAmazonApprovalDecision}
        />
      ) : null}
    </div>
  );
}

function TikTokCampaignGrid({
  rows,
  loading,
  isError,
}: {
  rows: TikTokAdsCampaign[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Kampanyalar yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Kampanyalar alınamadı"
        description="TikTok Ads kampanya raporu şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Seçili tarih aralığında kampanya verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.map((campaign) => (
        <div key={campaign.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-white">{campaign.name}</h3>
            <span className="rounded border border-[#7B61FF]/20 bg-[#7B61FF]/10 px-2 py-1 text-xs text-[#7B61FF]">
              {campaign.objective}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricPill label="Spend" value={formatTikTokCurrency(campaign.spend)} />
            <MetricPill label="CTR" value={formatTikTokPercent(campaign.ctr)} />
            <MetricPill label="VTR" value={formatTikTokInteger(campaign.videoViews)} />
            <MetricPill label="CPA" value={formatTikTokCurrency(campaign.costPerConversion)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokInsightGrid({
  title,
  rows,
  loading,
  isError,
  emptyMessage,
}: {
  title: string;
  rows: TikTokAdsInsightItem[];
  loading: boolean;
  isError: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title={`${title} yükleniyor...`} />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title={`${title} alınamadı`}
        description="TikTok Ads insight verisi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title={emptyMessage} tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 14).map((row) => (
        <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm text-white">{row.entityName ?? row.entityId}</p>
            <span className="text-xs text-[#A0A0A0]">{new Date(row.date).toLocaleDateString("tr-TR")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <MetricPill label="İzlenme" value={formatTikTokInteger(row.videoViews)} />
            <MetricPill label="CTR" value={formatTikTokPercent(row.ctr)} />
            <MetricPill label="VTR" value={formatTikTokPercent(row.vtr)} />
            <MetricPill label="Dönüşüm" value={formatTikTokInteger(row.conversions)} />
            <MetricPill label="CPA" value={formatTikTokCurrency(row.costPerConversion)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokHookPanel({
  rows,
  loading,
  isError,
}: {
  rows: TikTokAdsInsightItem[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Hook testleri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Hook testleri alınamadı"
        description="Ad-level insight verisi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  const hookRows = [...rows]
    .sort((left, right) => right.videoCompletionRate - left.videoCompletionRate)
    .slice(0, 10);

  if (hookRows.length === 0) {
    return <MetaAdsStatePanel title="Hook testi için kreatif verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {hookRows.map((row, index) => (
        <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white">{row.entityName ?? row.entityId}</p>
            <span className={`rounded border px-2 py-1 text-[11px] ${
              index === 0
                ? "border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]"
                : "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]"
            }`}>
              {index === 0 ? "Winning hook" : "Test"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricPill label="6sn İzlenme" value={formatTikTokInteger(row.videoViews6s)} />
            <MetricPill label="Tamamlama" value={formatTikTokPercent(row.videoCompletionRate)} />
            <MetricPill label="VTR" value={formatTikTokPercent(row.vtr)} />
            <MetricPill label="CTR" value={formatTikTokPercent(row.ctr)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokAudiencePanel({
  rows,
  loading,
  isError,
}: {
  rows: TikTokAdsInsightItem[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Kitle verileri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Kitle verileri alınamadı"
        description="Ad group kırılımı şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Kitle/ad group verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.slice(0, 10).map((row) => (
        <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <p className="text-white">{row.entityName ?? "Audience Segment"}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MetricPill label="Reach" value={formatTikTokInteger(row.reach)} />
            <MetricPill label="VTR" value={formatTikTokPercent(row.vtr)} />
            <MetricPill label="Conversion" value={formatTikTokInteger(row.conversions)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokPixelPanel({
  advertiserId,
  summary,
  lastSyncAt,
  loading,
  isError,
}: {
  advertiserId: string | null;
  summary:
    | {
        conversions: number;
        conversionRate: number;
        lastSyncAt: string | null;
      }
    | undefined;
  lastSyncAt: string | null;
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Pixel/Event durumu yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Pixel/Event durumu alınamadı"
        description="TikTok Ads özet verisi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  const hasConversionSignal = (summary?.conversions ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
        <h3 className="mb-3 text-white">Kurulum</h3>
        <div className="space-y-2 text-sm">
          <p className="text-[#A0A0A0]">Advertiser ID: <span className="text-white">{advertiserId ?? "—"}</span></p>
          <p className="text-[#A0A0A0]">
            Event Sinyali:{" "}
            <span className={hasConversionSignal ? "text-[#AAFF01]" : "text-[#FFA726]"}>
              {hasConversionSignal ? "Dönüşüm sinyali var" : "Dönüşüm sinyali bekleniyor"}
            </span>
          </p>
          <p className="text-[#A0A0A0]">
            Conversion Rate: <span className="text-white">{formatTikTokPercent(summary?.conversionRate ?? 0)}</span>
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
        <h3 className="mb-3 text-white">Takip Durumu</h3>
        <p className="text-sm text-[#A0A0A0]">
          Son snapshot:{" "}
          <span className="text-white">
            {lastSyncAt ? new Date(lastSyncAt).toLocaleString("tr-TR") : "Henüz senkron yok"}
          </span>
        </p>
        <p className="mt-2 text-sm text-[#A0A0A0]">
          Dedicated pixel-status endpoint Faz 4 kapsamında yok; bu panel conversion snapshot sinyaliyle güvenli durum gösterir.
        </p>
      </div>
    </div>
  );
}

function TikTokUgcScriptsPanel({
  rows,
  loading,
  isError,
}: {
  rows: ClientTask[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="UGC/script görevleri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="UGC/script görevleri alınamadı"
        description="Client-visible görevler şu anda okunamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Bekleyen UGC/script görevi bulunmuyor." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.map((task) => (
        <div key={task.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-white">{task.title}</p>
            <span className={`rounded border px-2 py-1 text-[11px] ${getClientTaskStatusTone(task.status)}`}>
              {getClientTaskStatusLabel(task.status)}
            </span>
          </div>
          {task.description ? <p className="text-sm text-[#A0A0A0]">{task.description}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricPill label="Öncelik" value={task.priority} />
            <MetricPill
              label="Bitiş"
              value={task.dueDate ? new Date(task.dueDate).toLocaleDateString("tr-TR") : "—"}
            />
            <MetricPill label="İlerleme" value={`${task.progressPercent}%`} />
            <MetricPill label="Todo" value={`${task.completion?.completedTodos ?? 0}/${task.completion?.totalTodos ?? 0}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokOptimizationNotesPanel({
  notes,
  loading,
}: {
  notes: string[];
  loading: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Optimizasyon notları hazırlanıyor..." />;
  }

  if (notes.length === 0) {
    return <MetaAdsStatePanel title="Optimizasyon notu için yeterli veri bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#d7d7d7]">
          {note}
        </div>
      ))}
    </div>
  );
}

function MetaAdsEntityGrid({
  title,
  loading,
  isError,
  rows,
  emptyMessage,
}: {
  title: string;
  loading: boolean;
  isError: boolean;
  rows: MetaAdsCampaign[];
  emptyMessage: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title={`${title} yükleniyor...`} />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title={`${title} alınamadı`}
        description="Rapor verisi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title={emptyMessage} tone="muted" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.map((campaign) => (
        <div key={campaign.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-white">{campaign.name}</h3>
            <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-xs text-[#AAFF01]">
              {campaign.objective}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MetricPill label="Spend" value={formatMetaCurrency(campaign.spend)} />
            <MetricPill label="CTR" value={formatMetaPercent(campaign.ctr)} />
            <MetricPill label="ROAS" value={campaign.roas !== null ? `${campaign.roas.toFixed(2)}x` : "—"} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetaAdsInsightGrid({
  title,
  loading,
  isError,
  rows,
  emptyMessage,
}: {
  title: string;
  loading: boolean;
  isError: boolean;
  rows: MetaAdsInsightItem[];
  emptyMessage: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title={`${title} yükleniyor...`} />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title={`${title} alınamadı`}
        description="Rapor verisi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title={emptyMessage} tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 14).map((row) => (
        <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm text-white">{row.entityName ?? row.entityId ?? "N/A"}</p>
            <span className="text-xs text-[#A0A0A0]">{new Date(row.date).toLocaleDateString("tr-TR")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricPill label="Spend" value={formatMetaCurrency(row.spend)} />
            <MetricPill label="CTR" value={formatMetaPercent(row.ctr)} />
            <MetricPill label="Result" value={formatMetaInteger(row.results)} />
            <MetricPill label="ROAS" value={row.roas !== null ? `${row.roas.toFixed(2)}x` : "—"} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetaAdsAudiencePanel({
  rows,
  loading,
  isError,
}: {
  rows: MetaAdsInsightItem[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Kitle verileri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Kitle verileri alınamadı"
        description="Ad set kırılımı şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Kitle segment verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.slice(0, 8).map((row) => (
        <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <p className="text-white">{row.entityName ?? "Audience Segment"}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MetricPill label="Reach" value={formatMetaInteger(row.reach)} />
            <MetricPill label="CTR" value={formatMetaPercent(row.ctr)} />
            <MetricPill label="Result" value={formatMetaInteger(row.results)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetaAdsPixelPanel({
  data,
  loading,
  isError,
}: {
  data: {
    adAccountId: string | null;
    pixelId: string | null;
    eventStatus: string;
    setupWarning: string | null;
    syncError: string | null;
    lastInsightAt: string | null;
  } | undefined;
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Pixel/Event durumu yükleniyor..." />;
  }

  if (isError || !data) {
    return (
      <MetaAdsStatePanel
        title="Pixel/Event durumu alınamadı"
        description="Lütfen tekrar deneyin."
        tone="error"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
        <h3 className="mb-3 text-white">Kurulum</h3>
        <div className="space-y-2 text-sm">
          <p className="text-[#A0A0A0]">Ad Account: <span className="text-white">{data.adAccountId ?? "—"}</span></p>
          <p className="text-[#A0A0A0]">Pixel ID: <span className="text-white">{data.pixelId ?? "—"}</span></p>
          <p className="text-[#A0A0A0]">Event Durumu: <span className="text-white">{data.eventStatus}</span></p>
          <p className="text-[#A0A0A0]">
            Son Event Verisi:{" "}
            <span className="text-white">
              {data.lastInsightAt ? new Date(data.lastInsightAt).toLocaleString("tr-TR") : "Yok"}
            </span>
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
        <h3 className="mb-3 text-white">Uyarılar</h3>
        {data.setupWarning ? <p className="text-sm text-[#FFA726]">{data.setupWarning}</p> : null}
        {data.syncError ? <p className="mt-2 text-sm text-[#ff8e8e]">{data.syncError}</p> : null}
        {!data.setupWarning && !data.syncError ? (
          <p className="text-sm text-[#AAFF01]">Konfigürasyon ve event akışı sağlıklı görünüyor.</p>
        ) : null}
      </div>
    </div>
  );
}

function MetaAdsReportPanel({
  rows,
  loading,
  isError,
}: {
  rows: MetaAdsReportItem[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Rapor listesi yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Raporlar alınamadı"
        description="Meta Ads rapor listesi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Yayınlanmış rapor bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const hasMetricsSnapshot = row.metricsSnapshot !== null;

        return (
          <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {getMetaAdsReportTypeLabel(row.type)}
                </span>
                <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                  {getMetaAdsReportStatusLabel(row.status)}
                </span>
              </div>
              <span className="text-xs text-[#A0A0A0]">
                {new Date(row.periodStart).toLocaleDateString("tr-TR")} -{" "}
                {new Date(row.periodEnd).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <p className="text-sm text-white">{row.summary ?? "Rapor özeti girilmedi."}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#A0A0A0] md:grid-cols-3">
              <p>Yayın: {row.publishedAt ? new Date(row.publishedAt).toLocaleString("tr-TR") : "Taslak"}</p>
              <p>Onay: {getMetaAdsReportAcknowledgementLabel(row.acknowledgementStatus)}</p>
              <p>Snapshot: {hasMetricsSnapshot ? "Var" : "Yok"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TikTokAdsReportPanel({
  rows,
  loading,
  isError,
  exportingReportId,
  isExporting,
  onExport,
}: {
  rows: TikTokAdsReportItem[];
  loading: boolean;
  isError: boolean;
  exportingReportId: string | null;
  isExporting: boolean;
  onExport: (row: TikTokAdsReportItem, format: TikTokAdsReportExportFormat) => void;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="TikTok Ads rapor listesi yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="TikTok Ads raporları alınamadı"
        description="TikTok Ads rapor listesi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Yayınlanmış TikTok Ads raporu bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const hasMetricsSnapshot = row.metricsSnapshot !== null;

        return (
          <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {getTikTokAdsReportTypeLabel(row.type)}
                </span>
                <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                  {getTikTokAdsReportStatusLabel(row.status)}
                </span>
              </div>
              <span className="text-xs text-[#A0A0A0]">
                {new Date(row.periodStart).toLocaleDateString("tr-TR")} -{" "}
                {new Date(row.periodEnd).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <p className="text-sm text-white">{row.summary ?? "Rapor özeti girilmedi."}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#A0A0A0] md:grid-cols-3">
              <p>Yayın: {row.publishedAt ? new Date(row.publishedAt).toLocaleString("tr-TR") : "Taslak"}</p>
              <p>Onay: {getTikTokAdsReportAcknowledgementLabel(row.acknowledgementStatus)}</p>
              <p>Snapshot: {hasMetricsSnapshot ? "Var" : "Yok"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="text-xs"
                disabled={isExporting}
                onClick={() => onExport(row, "csv")}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                {exportingReportId === row.id ? "İndiriliyor..." : "CSV"}
              </Button>
              <Button
                variant="secondary"
                className="text-xs"
                disabled={isExporting}
                onClick={() => onExport(row, "json")}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                JSON
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function downloadTikTokAdsReportFile(
  report: TikTokAdsReportItem,
  format: TikTokAdsReportExportFormat,
  body: string,
) {
  if (typeof URL.createObjectURL !== "function") {
    return;
  }

  const mimeType = format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
  const blob = new Blob([body], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tiktok-ads-report-${report.periodEnd.slice(0, 10)}-${report.id}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getMetaAdsReportTypeLabel(type: MetaAdsReportItem["type"]): string {
  if (type === "WEEKLY") {
    return "Haftalık";
  }
  if (type === "MONTHLY") {
    return "Aylık";
  }
  if (type === "CAMPAIGN_PERFORMANCE") {
    return "Kampanya Performansı";
  }
  if (type === "CREATIVE_PERFORMANCE") {
    return "Kreatif Performansı";
  }
  if (type === "BUDGET_RECOMMENDATION") {
    return "Bütçe Önerisi";
  }
  return type;
}

function getMetaAdsReportStatusLabel(status: MetaAdsReportItem["status"]): string {
  if (status === "DRAFT") {
    return "Taslak";
  }
  if (status === "PUBLISHED") {
    return "Yayında";
  }
  if (status === "ARCHIVED") {
    return "Arşiv";
  }
  return status;
}

function getMetaAdsReportAcknowledgementLabel(
  status: MetaAdsReportItem["acknowledgementStatus"],
): string {
  if (status === "NOT_REQUESTED") {
    return "Talep Yok";
  }
  if (status === "PENDING") {
    return "Müşteri Onayı Bekliyor";
  }
  if (status === "ACKNOWLEDGED") {
    return "Onaylandı";
  }
  if (status === "CHANGES_REQUESTED") {
    return "Revizyon İstendi";
  }
  return status;
}

function getTikTokAdsReportTypeLabel(type: TikTokAdsReportItem["type"]): string {
  if (type === "WEEKLY") {
    return "Haftalık";
  }
  if (type === "MONTHLY") {
    return "Aylık";
  }
  if (type === "CAMPAIGN_PERFORMANCE") {
    return "Kampanya Performansı";
  }
  if (type === "CREATIVE_PERFORMANCE") {
    return "Kreatif Performansı";
  }
  if (type === "BUDGET_RECOMMENDATION") {
    return "Bütçe Önerisi";
  }
  return type;
}

function getTikTokAdsReportStatusLabel(status: TikTokAdsReportItem["status"]): string {
  if (status === "DRAFT") {
    return "Taslak";
  }
  if (status === "PUBLISHED") {
    return "Yayında";
  }
  if (status === "ARCHIVED") {
    return "Arşiv";
  }
  return status;
}

function getTikTokAdsReportAcknowledgementLabel(
  status: TikTokAdsReportItem["acknowledgementStatus"],
): string {
  if (status === "NOT_REQUESTED") {
    return "Talep Yok";
  }
  if (status === "PENDING") {
    return "Müşteri Onayı Bekliyor";
  }
  if (status === "ACKNOWLEDGED") {
    return "Onaylandı";
  }
  if (status === "CHANGES_REQUESTED") {
    return "Revizyon İstendi";
  }
  return status;
}

function getAmazonAdsReportTypeLabel(type: AmazonAdsReportItem["type"]): string {
  if (type === "WEEKLY") {
    return "Haftalık";
  }
  if (type === "MONTHLY") {
    return "Aylık";
  }
  if (type === "SPONSORED_PRODUCTS_PERFORMANCE") {
    return "SP Performans";
  }
  if (type === "SPONSORED_BRANDS_PERFORMANCE") {
    return "SB Performans";
  }
  if (type === "SPONSORED_DISPLAY_PERFORMANCE") {
    return "SD Performans";
  }
  if (type === "PRODUCT_PERFORMANCE") {
    return "Ürün Performansı";
  }
  if (type === "SEARCH_TERMS") {
    return "Search Terms";
  }
  if (type === "BUDGET_RECOMMENDATION") {
    return "Bütçe Önerisi";
  }
  if (type === "ACOS_OPTIMIZATION") {
    return "ACOS Optimizasyonu";
  }
  return type;
}

function getAmazonAdsReportStatusLabel(status: AmazonAdsReportItem["status"]): string {
  if (status === "DRAFT") {
    return "Taslak";
  }
  if (status === "PUBLISHED") {
    return "Yayında";
  }
  if (status === "ARCHIVED") {
    return "Arşiv";
  }
  return status;
}

function getAmazonAdsReportAcknowledgementLabel(
  status: AmazonAdsReportItem["acknowledgementStatus"],
): string {
  if (status === "NOT_REQUESTED") {
    return "Talep Yok";
  }
  if (status === "PENDING") {
    return "Müşteri Onayı Bekliyor";
  }
  if (status === "ACKNOWLEDGED") {
    return "Onaylandı";
  }
  if (status === "CHANGES_REQUESTED") {
    return "Revizyon İstendi";
  }
  return status;
}

function MetaAdsAgencyNotesPanel({
  notes,
  loading,
}: {
  notes: string[];
  loading: boolean;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Ajans notları hazırlanıyor..." />;
  }

  if (notes.length === 0) {
    return <MetaAdsStatePanel title="Ajans notu için yeterli veri bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#d7d7d7]">
          {note}
        </div>
      ))}
    </div>
  );
}

function MetaAdsApprovalsPanel({
  serviceLabel = "Meta Ads",
  tasks,
  history,
  creativeFiles,
  loading,
  isError,
  isActionLoading,
  activeTaskId,
  onDecision,
}: {
  serviceLabel?: string;
  tasks: ClientTask[];
  history: ClientTask[];
  creativeFiles: ProjectFile[];
  loading: boolean;
  isError: boolean;
  isActionLoading: boolean;
  activeTaskId: string | null;
  onDecision: (
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => Promise<void>;
}) {
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  if (loading) {
    return <MetaAdsStatePanel title="Onay kuyruğu yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Onay kuyruğu alınamadı"
        description="Revizyon görevleri şu anda okunamıyor."
        tone="error"
      />
    );
  }

  if (tasks.length === 0 && creativeFiles.length === 0 && history.length === 0) {
    return <MetaAdsStatePanel title="Bekleyen onay bulunmuyor." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
        <p className="text-sm text-white">Bekleyen {serviceLabel} onayı: {tasks.length}</p>
      </div>
      {creativeFiles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-white">Kreatif Önizleme</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {creativeFiles.map((file) => (
              <div key={file.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-3">
                <p className="mb-2 text-sm text-white">{file.title}</p>
                {file.mimeType.startsWith("image/") ? (
                  <img
                    src={file.secureUrl}
                    alt={file.title}
                    className="mb-2 h-40 w-full rounded-lg object-cover"
                  />
                ) : file.mimeType.startsWith("video/") ? (
                  <video
                    className="mb-2 h-40 w-full rounded-lg object-cover"
                    controls
                    src={file.secureUrl}
                  />
                ) : null}
                <div className="flex items-center justify-between gap-2 text-xs text-[#A0A0A0]">
                  <span>{file.originalFileName}</span>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => window.open(file.secureUrl, "_blank", "noopener,noreferrer")}
                  >
                    Görüntüle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {tasks.map((task) => (
        <div key={task.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-white">{task.title}</p>
            <span className={`rounded border px-2 py-1 text-[11px] ${getClientTaskStatusTone(task.status)}`}>
              {getClientTaskStatusLabel(task.status)}
            </span>
          </div>
          {task.approvalType ? (
            <p className="mb-2 text-xs text-[#A0A0A0]">
              Onay tipi: {formatAdsApprovalType(task.approvalType)}
            </p>
          ) : null}
          {task.description ? <p className="text-sm text-[#A0A0A0]">{task.description}</p> : null}
          <textarea
            className="mt-3 min-h-20 w-full rounded-xl border border-white/[0.08] bg-[#151515] p-3 text-sm text-white outline-none focus:border-[#AAFF01]/40"
            placeholder="Revizyon notu (isteğe bağlı)"
            value={decisionNotes[task.id] ?? ""}
            onChange={(event) =>
              setDecisionNotes((prev) => ({
                ...prev,
                [task.id]: event.target.value,
              }))
            }
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="primary"
              className="text-xs"
              disabled={isActionLoading}
              onClick={() => {
                const primaryStatus = task.approvalType?.endsWith("REPORT_ACKNOWLEDGEMENT")
                  ? "ACKNOWLEDGED"
                  : "APPROVED";
                void onDecision(task, primaryStatus, decisionNotes[task.id]);
              }}
            >
              {activeTaskId === task.id
                ? "Kaydediliyor..."
                : task.approvalType?.endsWith("REPORT_ACKNOWLEDGEMENT")
                  ? "Okudum"
                  : "Onayla"}
            </Button>
            <Button
              variant="secondary"
              className="text-xs"
              disabled={isActionLoading || (decisionNotes[task.id]?.trim().length ?? 0) < 2}
              onClick={() => void onDecision(task, "CHANGES_REQUESTED", decisionNotes[task.id])}
            >
              Revizyon İste
            </Button>
          </div>
        </div>
      ))}
      {history.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-white">Onay Geçmişi</p>
          {history.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-white/[0.08] bg-[#171717] p-3 text-xs text-[#A0A0A0]"
            >
              <p className="text-sm text-white">{task.title}</p>
              <p>Durum: {task.approvalStatus ?? "—"}</p>
              {task.approvalResponseNote ? <p>Not: {task.approvalResponseNote}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type AmazonKeywordRow = {
  keywordText: string;
  matchType: string | null;
  campaignName: string | null;
  adGroupName: string | null;
  spend: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
};

type AmazonTargetRow = {
  targetType: string;
  targetExpression: string;
  campaignName: string | null;
  adGroupName: string | null;
  spend: number;
  sales: number;
  clicks: number;
  orders: number;
  acos: number;
  roas: number;
};

type AmazonSearchTermRow = {
  searchTerm: string;
  campaignName: string | null;
  adGroupName: string | null;
  keywordOrTarget: string | null;
  spend: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
};

function AmazonCampaignGrid({
  title,
  rows,
  loading,
  isError,
  emptyMessage,
  currencyCode,
}: {
  title: string;
  rows: AmazonAdsCampaignSummary[];
  loading: boolean;
  isError: boolean;
  emptyMessage: string;
  currencyCode: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title={`${title} yükleniyor...`} />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title={`${title} alınamadı`}
        description="Amazon Ads kampanya raporu şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title={emptyMessage} tone="muted" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.slice(0, 24).map((campaign) => (
        <div key={`${campaign.adProduct ?? "UNKNOWN"}-${campaign.id}`} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-white">{campaign.name}</h3>
            <span className="rounded border border-[#7B61FF]/20 bg-[#7B61FF]/10 px-2 py-1 text-xs text-[#7B61FF]">
              {formatAmazonAdProduct(campaign.adProduct)}
            </span>
          </div>
          <p className="mb-3 text-xs text-[#A0A0A0]">Durum: {campaign.status}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricPill label="Spend" value={formatAmazonCurrency(campaign.spend, currencyCode)} />
            <MetricPill label="Sales" value={formatAmazonCurrency(campaign.sales, currencyCode)} />
            <MetricPill label="ACOS" value={formatAmazonPercent(campaign.acos)} />
            <MetricPill label="ROAS" value={`${campaign.roas.toFixed(2)}x`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AmazonProductGrid({
  rows,
  loading,
  isError,
  currencyCode,
}: {
  rows: AmazonAdsProductSummary[];
  loading: boolean;
  isError: boolean;
  currencyCode: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Ürün / ASIN verileri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Ürün / ASIN verileri alınamadı"
        description="Amazon Ads ürün raporu şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Ürün/ASIN verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 24).map((row, index) => (
        <div key={`${row.asin ?? row.sku ?? "product"}-${index}`} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm text-white">{row.title ?? row.asin ?? row.sku ?? "Ürün"}</p>
            <span className="text-xs text-[#A0A0A0]">
              ASIN: {row.asin ?? "—"} {row.sku ? `• SKU: ${row.sku}` : ""}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricPill label="Spend" value={formatAmazonCurrency(row.spend, currencyCode)} />
            <MetricPill label="Sales" value={formatAmazonCurrency(row.sales, currencyCode)} />
            <MetricPill label="Orders" value={formatAmazonInteger(row.orders)} />
            <MetricPill label="ROAS" value={`${row.roas.toFixed(2)}x`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AmazonKeywordGrid({
  rows,
  loading,
  isError,
  currencyCode,
}: {
  rows: AmazonKeywordRow[];
  loading: boolean;
  isError: boolean;
  currencyCode: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Anahtar kelime verileri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Anahtar kelime verileri alınamadı"
        description="Amazon Ads keyword raporu şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Anahtar kelime verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 30).map((row) => (
        <div key={`${row.keywordText}-${row.matchType ?? "ANY"}-${row.campaignName ?? "campaign"}`} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white">{row.keywordText}</p>
            <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
              {row.matchType ?? "MATCH_TIPI_YOK"}
            </span>
          </div>
          <p className="mb-2 text-xs text-[#A0A0A0]">
            {row.campaignName ?? "Kampanya bilgisi yok"} {row.adGroupName ? `• ${row.adGroupName}` : ""}
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <MetricPill label="Spend" value={formatAmazonCurrency(row.spend, currencyCode)} />
            <MetricPill label="Clicks" value={formatAmazonInteger(row.clicks)} />
            <MetricPill label="Sales" value={formatAmazonCurrency(row.sales, currencyCode)} />
            <MetricPill label="Orders" value={formatAmazonInteger(row.orders)} />
            <MetricPill label="ACOS" value={formatAmazonPercent(row.acos)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AmazonTargetingGrid({
  rows,
  loading,
  isError,
  currencyCode,
}: {
  rows: AmazonTargetRow[];
  loading: boolean;
  isError: boolean;
  currencyCode: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Targeting verileri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Targeting verileri alınamadı"
        description="Amazon Ads targeting raporu şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Targeting verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 30).map((row) => (
        <div key={`${row.targetExpression}-${row.campaignName ?? "campaign"}`} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white">{row.targetExpression}</p>
            <span className="rounded border border-[#FFA726]/20 bg-[#FFA726]/10 px-2 py-1 text-[11px] text-[#FFA726]">
              {row.targetType}
            </span>
          </div>
          <p className="mb-2 text-xs text-[#A0A0A0]">
            {row.campaignName ?? "Kampanya bilgisi yok"} {row.adGroupName ? `• ${row.adGroupName}` : ""}
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <MetricPill label="Spend" value={formatAmazonCurrency(row.spend, currencyCode)} />
            <MetricPill label="Sales" value={formatAmazonCurrency(row.sales, currencyCode)} />
            <MetricPill label="Orders" value={formatAmazonInteger(row.orders)} />
            <MetricPill label="ACOS" value={formatAmazonPercent(row.acos)} />
            <MetricPill label="ROAS" value={`${row.roas.toFixed(2)}x`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AmazonSearchTermGrid({
  rows,
  loading,
  isError,
  currencyCode,
}: {
  rows: AmazonSearchTermRow[];
  loading: boolean;
  isError: boolean;
  currencyCode: string;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Arama terimi verileri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Arama terimi verileri alınamadı"
        description="Amazon Ads search term raporu şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Arama terimi verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 30).map((row) => (
        <div key={`${row.searchTerm}-${row.campaignName ?? "campaign"}-${row.adGroupName ?? "adgroup"}`} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white">{row.searchTerm}</p>
            <span className="text-xs text-[#A0A0A0]">{row.keywordOrTarget ?? "Keyword/Target yok"}</span>
          </div>
          <p className="mb-2 text-xs text-[#A0A0A0]">
            {row.campaignName ?? "Kampanya bilgisi yok"} {row.adGroupName ? `• ${row.adGroupName}` : ""}
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <MetricPill label="Spend" value={formatAmazonCurrency(row.spend, currencyCode)} />
            <MetricPill label="Clicks" value={formatAmazonInteger(row.clicks)} />
            <MetricPill label="Sales" value={formatAmazonCurrency(row.sales, currencyCode)} />
            <MetricPill label="Orders" value={formatAmazonInteger(row.orders)} />
            <MetricPill label="ACOS" value={formatAmazonPercent(row.acos)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AmazonAdsReportPanel({
  rows,
  loading,
  isError,
  exportingReportId,
  isExporting,
  onExport,
}: {
  rows: AmazonAdsReportItem[];
  loading: boolean;
  isError: boolean;
  exportingReportId: string | null;
  isExporting: boolean;
  onExport: (row: AmazonAdsReportItem, format: AmazonAdsReportExportFormat) => void;
}) {
  if (loading) {
    return <MetaAdsStatePanel title="Amazon Ads rapor listesi yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Amazon Ads raporları alınamadı"
        description="Amazon Ads rapor listesi şu anda ulaşılamıyor."
        tone="error"
      />
    );
  }

  if (rows.length === 0) {
    return <MetaAdsStatePanel title="Yayınlanmış Amazon Ads raporu bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const hasMetricsSnapshot = row.metricsSnapshot !== null;

        return (
          <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {getAmazonAdsReportTypeLabel(row.type)}
                </span>
                <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                  {getAmazonAdsReportStatusLabel(row.status)}
                </span>
              </div>
              <span className="text-xs text-[#A0A0A0]">
                {new Date(row.periodStart).toLocaleDateString("tr-TR")} -{" "}
                {new Date(row.periodEnd).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <p className="text-sm text-white">{row.summary ?? "Rapor özeti girilmedi."}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#A0A0A0] md:grid-cols-3">
              <p>Yayın: {row.publishedAt ? new Date(row.publishedAt).toLocaleString("tr-TR") : "Taslak"}</p>
              <p>Onay: {getAmazonAdsReportAcknowledgementLabel(row.acknowledgementStatus)}</p>
              <p>Snapshot: {hasMetricsSnapshot ? "Var" : "Yok"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="text-xs"
                disabled={isExporting}
                onClick={() => onExport(row, "csv")}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                {exportingReportId === row.id ? "İndiriliyor..." : "CSV"}
              </Button>
              <Button
                variant="secondary"
                className="text-xs"
                disabled={isExporting}
                onClick={() => onExport(row, "json")}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                JSON
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function downloadAmazonAdsReportFile(
  report: AmazonAdsReportItem,
  format: AmazonAdsReportExportFormat,
  body: string,
) {
  if (typeof URL.createObjectURL !== "function") {
    return;
  }

  const mimeType = format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
  const blob = new Blob([body], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `amazon-ads-report-${report.periodEnd.slice(0, 10)}-${report.id}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildAmazonKeywordRows(rows: AmazonAdsInsightItem[]): AmazonKeywordRow[] {
  const grouped = new Map<string, AmazonKeywordRow>();

  for (const row of rows) {
    const keywordText = row.keywordText?.trim();
    if (!keywordText) {
      continue;
    }

    const key = [
      keywordText.toLowerCase(),
      row.matchType?.toUpperCase() ?? "",
      row.campaignName ?? "",
      row.adGroupName ?? "",
    ].join("|");
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        keywordText,
        matchType: row.matchType,
        campaignName: row.campaignName,
        adGroupName: row.adGroupName,
        spend: row.spend,
        clicks: row.clicks,
        sales: row.sales,
        orders: row.orders,
        acos: 0,
        roas: 0,
      });
      continue;
    }

    existing.spend += row.spend;
    existing.clicks += row.clicks;
    existing.sales += row.sales;
    existing.orders += row.orders;
  }

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      acos: calculateAcos(row.spend, row.sales),
      roas: calculateRoas(row.sales, row.spend),
    }))
    .sort((left, right) => right.spend - left.spend);
}

function buildAmazonTargetRows(rows: AmazonAdsInsightItem[]): AmazonTargetRow[] {
  const grouped = new Map<string, AmazonTargetRow>();

  for (const row of rows) {
    const targetExpression = row.targeting?.trim();
    if (!targetExpression) {
      continue;
    }

    const targetType = inferAmazonTargetType(targetExpression, row.keywordType);
    const key = [targetExpression.toLowerCase(), row.campaignName ?? "", row.adGroupName ?? ""].join("|");
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        targetType,
        targetExpression,
        campaignName: row.campaignName,
        adGroupName: row.adGroupName,
        spend: row.spend,
        sales: row.sales,
        clicks: row.clicks,
        orders: row.orders,
        acos: 0,
        roas: 0,
      });
      continue;
    }

    existing.spend += row.spend;
    existing.sales += row.sales;
    existing.clicks += row.clicks;
    existing.orders += row.orders;
  }

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      acos: calculateAcos(row.spend, row.sales),
      roas: calculateRoas(row.sales, row.spend),
    }))
    .sort((left, right) => right.spend - left.spend);
}

function buildAmazonSearchTermRows(rows: AmazonAdsInsightItem[]): AmazonSearchTermRow[] {
  return rows
    .map((row) => {
      const searchTerm = row.searchTerm?.trim() || row.entityName?.trim() || row.entityId.trim();
      if (!searchTerm) {
        return null;
      }

      return {
        searchTerm,
        campaignName: row.campaignName,
        adGroupName: row.adGroupName,
        keywordOrTarget: row.keywordText ?? row.targeting ?? null,
        spend: row.spend,
        clicks: row.clicks,
        sales: row.sales,
        orders: row.orders,
        acos: row.acos,
        roas: row.roas,
      };
    })
    .filter((row): row is AmazonSearchTermRow => row !== null)
    .sort((left, right) => right.spend - left.spend);
}

function inferAmazonTargetType(targetExpression: string, keywordType: string | null): string {
  const normalizedExpression = targetExpression.toLowerCase();
  const normalizedKeywordType = keywordType?.toLowerCase() ?? "";

  if (normalizedExpression.includes("asin") || /b0[a-z0-9]{8}/i.test(targetExpression)) {
    return "ASIN";
  }

  if (normalizedExpression.includes("category")) {
    return "CATEGORY";
  }

  if (normalizedKeywordType.includes("auto")) {
    return "AUTO_TARGET";
  }

  return "TARGETING";
}

function calculateAcos(spend: number, sales: number): number {
  if (sales <= 0) {
    return 0;
  }
  return (spend / sales) * 100;
}

function calculateRoas(sales: number, spend: number): number {
  if (spend <= 0) {
    return 0;
  }
  return sales / spend;
}

function MetaAdsStatePanel({
  title,
  description,
  tone = "default",
}: {
  title: string;
  description?: string;
  tone?: "default" | "error" | "muted";
}) {
  const toneClass =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : tone === "muted"
        ? "border-white/[0.08] bg-[#1A1A1A] text-[#A0A0A0]"
        : "border-white/[0.08] bg-[#1A1A1A] text-[#A0A0A0]";

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-sm">{title}</p>
      {description ? <p className="mt-1 text-xs">{description}</p> : null}
    </div>
  );
}

function getClientMetaAdsConnectionNotice(connectionStatus: string | undefined): {
  title: string;
  description: string;
  tone: "default" | "error" | "muted";
} {
  if (connectionStatus === "PENDING") {
    return {
      title: "Veriler hazırlanıyor",
      description: "Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.",
      tone: "muted",
    };
  }

  if (connectionStatus === "ERROR" || connectionStatus === "DISCONNECTED") {
    return {
      title: "Bağlantı problemi var",
      description: "Bağlantı problemi var, ekibimiz ilgileniyor.",
      tone: "error",
    };
  }

  return {
    title: "Meta Ads bağlantısı aktif değil",
    description: "Bu hizmetin verileri sadece aktif bağlantı sonrası görüntülenebilir.",
    tone: "muted",
  };
}

function buildMetaAdsAgencyNotes(
  summary: {
    spend: number;
    ctr: number;
    roas: number | null;
    results: number;
  } | undefined,
  campaigns: MetaAdsCampaign[],
): string[] {
  const notes: string[] = [];
  if (summary) {
    notes.push(
      `Toplam ${formatMetaCurrency(summary.spend)} harcama ile ${formatMetaInteger(summary.results)} sonuç üretildi.`,
    );
    notes.push(`Ortalama CTR ${formatMetaPercent(summary.ctr)} seviyesinde seyrediyor.`);
    if (summary.roas !== null) {
      notes.push(`Toplam ROAS ${summary.roas.toFixed(2)}x; bütçe dağılımı bu skora göre optimize ediliyor.`);
    }
  }

  const topCampaign = campaigns[0];
  if (topCampaign) {
    notes.push(
      `${topCampaign.name} kampanyası ${formatMetaCurrency(topCampaign.spend)} harcama ile en yüksek hacmi taşıyor.`,
    );
  }

  return notes.slice(0, 4);
}

function getClientTikTokAdsConnectionNotice(connectionStatus: string | undefined): {
  title: string;
  description: string;
  tone: "default" | "error" | "muted";
} {
  if (connectionStatus === "PENDING") {
    return {
      title: "Veriler hazırlanıyor",
      description: "Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.",
      tone: "muted",
    };
  }

  if (connectionStatus === "ERROR" || connectionStatus === "DISCONNECTED") {
    return {
      title: "Bağlantı problemi var",
      description: "Bağlantı problemi var, ekibimiz ilgileniyor.",
      tone: "error",
    };
  }

  return {
    title: "TikTok Ads bağlantısı aktif değil",
    description: "Bu hizmetin verileri sadece aktif bağlantı sonrası görüntülenebilir.",
    tone: "muted",
  };
}

function getClientAmazonAdsConnectionNotice(connectionStatus: string | undefined): {
  title: string;
  description: string;
  tone: "default" | "error" | "muted";
} {
  if (connectionStatus === "PENDING") {
    return {
      title: "Veriler hazırlanıyor",
      description: "Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.",
      tone: "muted",
    };
  }

  if (connectionStatus === "ERROR" || connectionStatus === "DISCONNECTED") {
    return {
      title: "Bağlantı problemi var",
      description: "Bağlantı problemi var, ekibimiz ilgileniyor.",
      tone: "error",
    };
  }

  return {
    title: "Amazon Ads bağlantısı aktif değil",
    description: "Bu hizmetin verileri sadece aktif bağlantı sonrası görüntülenebilir.",
    tone: "muted",
  };
}

function buildTikTokAgencyNotes(
  summary:
    | {
        spend: number;
        videoViews: number;
        ctr: number;
        vtr: number;
        conversions: number;
        costPerConversion: number;
      }
    | undefined,
  campaigns: TikTokAdsCampaign[],
  ads: TikTokAdsInsightItem[],
): string[] {
  const notes: string[] = [];

  if (summary) {
    notes.push(
      `${formatTikTokCurrency(summary.spend)} harcama ile ${formatTikTokInteger(summary.videoViews)} video izlenmesi ve ${formatTikTokInteger(summary.conversions)} dönüşüm üretildi.`,
    );
    notes.push(
      `Ortalama VTR ${formatTikTokPercent(summary.vtr)}, CTR ${formatTikTokPercent(summary.ctr)} ve CPA ${formatTikTokCurrency(summary.costPerConversion)} seviyesinde.`,
    );
  }

  const topCampaign = campaigns[0];
  if (topCampaign) {
    notes.push(
      `${topCampaign.name} kampanyası ${formatTikTokCurrency(topCampaign.spend)} harcama ile en yüksek kampanya hacmini taşıyor.`,
    );
  }

  const topCreative = [...ads].sort((left, right) => right.videoCompletionRate - left.videoCompletionRate)[0];
  if (topCreative) {
    notes.push(
      `${topCreative.entityName ?? topCreative.entityId} kreatifi ${formatTikTokPercent(topCreative.videoCompletionRate)} video tamamlama oranıyla hook tarafında öne çıkıyor.`,
    );
  }

  return notes.slice(0, 4);
}

function buildAmazonAgencyNotes(
  summary:
    | {
        spend: number;
        sales: number;
        acos: number;
        roas: number;
        orders: number;
      }
    | undefined,
  campaigns: AmazonAdsCampaignSummary[],
  products: AmazonAdsProductSummary[],
  searchTerms: AmazonSearchTermRow[],
  currencyCode: string,
): string[] {
  const notes: string[] = [];

  if (summary) {
    notes.push(
      `${formatAmazonCurrency(summary.spend, currencyCode)} harcama ile ${formatAmazonCurrency(summary.sales, currencyCode)} satış ve ${formatAmazonInteger(summary.orders)} sipariş üretildi.`,
    );
    notes.push(
      `Ortalama ACOS ${formatAmazonPercent(summary.acos)} ve ROAS ${summary.roas.toFixed(2)}x seviyesinde ilerliyor.`,
    );
  }

  const topCampaign = campaigns[0];
  if (topCampaign) {
    notes.push(
      `${topCampaign.name} kampanyası ${formatAmazonCurrency(topCampaign.spend, currencyCode)} harcama ile en yüksek hacmi taşıyor.`,
    );
  }

  const topProduct = products[0];
  if (topProduct) {
    notes.push(
      `${topProduct.title ?? topProduct.asin ?? "Ürün"} ürününde ROAS ${topProduct.roas.toFixed(2)}x seviyesinde.`,
    );
  }

  const highAcosTerm = searchTerms.find((row) => row.acos >= 40);
  if (highAcosTerm) {
    notes.push(
      `${highAcosTerm.searchTerm} arama teriminde ACOS ${formatAmazonPercent(highAcosTerm.acos)} seviyesinde; negatifleme veya bid düşürme takibi önerilir.`,
    );
  }

  return notes.slice(0, 4);
}

function formatTikTokCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTikTokInteger(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTikTokPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMetaCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMetaInteger(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMetaPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatAmazonCurrency(value: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${formatAmazonInteger(value)} ${currencyCode || "TRY"}`;
  }
}

function formatAmazonInteger(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAmazonPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatAmazonAdProduct(value: AmazonAdsProductType | null): string {
  if (value === "SPONSORED_PRODUCTS") {
    return "Sponsored Products";
  }
  if (value === "SPONSORED_BRANDS") {
    return "Sponsored Brands";
  }
  if (value === "SPONSORED_DISPLAY") {
    return "Sponsored Display";
  }
  return "Amazon Ads";
}

function getApprovalDecisionFeedback(
  taskTitle: string,
  approvalStatus: ClientTaskMetaAdsApprovalStatus,
): { message: string; action: "approve" | "revision" | "comment" } {
  if (approvalStatus === "APPROVED") {
    return {
      message: `${taskTitle} onaylandı`,
      action: "approve",
    };
  }

  if (approvalStatus === "ACKNOWLEDGED") {
    return {
      message: `${taskTitle} okundu olarak işaretlendi`,
      action: "approve",
    };
  }

  if (approvalStatus === "CHANGES_REQUESTED" || approvalStatus === "REJECTED") {
    return {
      message: `${taskTitle} revizyona gönderildi`,
      action: "revision",
    };
  }

  return {
    message: `${taskTitle} onayı güncellendi`,
    action: "comment",
  };
}

function formatAdsApprovalType(value: string): string {
  return value
    .replace("META_ADS_", "")
    .replace("TIKTOK_ADS_", "")
    .replace("AMAZON_ADS_", "")
    .replace("SOCIAL_MEDIA_", "SOCIAL MEDIA ")
    .replace(/_/g, " ");
}

function getClientTaskStatusLabel(status: ClientTaskStatus): string {
  const labels: Record<ClientTaskStatus, string> = {
    TODO: 'Yapilacak',
    IN_PROGRESS: 'Devam Ediyor',
    REVIEW: 'Incelemede',
    DONE: 'Tamamlandi',
    BLOCKED: 'Bloke',
  };
  return labels[status] ?? status;
}

function getClientTaskStatusTone(status: ClientTaskStatus): string {
  if (status === 'DONE') return statusTone.good;
  if (status === 'IN_PROGRESS' || status === 'REVIEW') return statusTone.info;
  if (status === 'BLOCKED') return statusTone.danger;
  return statusTone.violet;
}

function getClientTaskPriorityLabel(priority: ClientTaskPriority): string {
  const labels: Record<ClientTaskPriority, string> = {
    LOW: 'Dusuk',
    MEDIUM: 'Orta',
    HIGH: 'Yuksek',
    URGENT: 'Acil',
  };
  return labels[priority] ?? priority;
}

function getClientTaskPriorityTone(priority: ClientTaskPriority): string {
  if (priority === 'URGENT') return statusTone.danger;
  if (priority === 'HIGH') return statusTone.warn;
  if (priority === 'MEDIUM') return statusTone.info;
  return statusTone.violet;
}

function getClientTaskTypeLabel(type: ClientTaskType): string {
  const labels: Record<ClientTaskType, string> = {
    FEATURE: 'Feature',
    BUG: 'Bug',
    REVISION: 'Revizyon',
    QA: 'QA',
    DEPLOYMENT: 'Yayin',
    MAINTENANCE: 'Bakim',
  };
  return labels[type] ?? type;
}

function getClientTaskWorkstreamLabel(workstream: ClientTaskWorkstream): string {
  const labels: Record<ClientTaskWorkstream, string> = {
    FRONTEND: 'Frontend',
    BACKEND: 'Backend / API',
    FULLSTACK: 'Fullstack',
    QA: 'QA',
    DEVOPS: 'DevOps',
    UI_INTEGRATION: 'UI Integration',
  };
  return labels[workstream] ?? workstream;
}

function getServiceLabel(serviceId: string): string {
  return serviceId.replace(/-/g, ' ').toUpperCase();
}

function getRevisionStatusTone(status: WorkspaceRevisionStatus): string {
  if (status === "APPROVED") return statusTone.good;
  if (status === "READY_FOR_REVIEW") return statusTone.info;
  if (status === "REJECTED" || status === "CANCELLED") return statusTone.danger;
  if (status === "IN_PROGRESS") return statusTone.violet;
  return statusTone.warn;
}

function mapTabIdToWorkspaceTabKey(tabId: string): WorkspaceTabKey {
  if (tabId === 'messages' || tabId === 'soru-cevap' || tabId.includes('question') || tabId.includes('message')) {
    return 'MESSAGES';
  }
  if (tabId === 'reports') return 'REPORTS';
  if (tabId === 'meetings') return 'MEETINGS';
  if (tabId === 'delivery-files' || tabId === 'files') return 'FILES';
  if (tabId === 'test-deploy') return 'DELIVERY';
  if (tabId.includes('revision')) return 'REVISIONS';
  if (['project-roadmap', 'sprint-status', 'frontend', 'backend-api', 'admin-panel'].includes(tabId)) {
    return 'TASKS';
  }
  if (tabId === 'ui-ux') return 'CONTENT';
  if (tabId.includes('task') || tabId.includes('sprint')) return 'TASKS';
  if (tabId.includes('content') || tabId.includes('copy') || tabId.includes('design')) return 'CONTENT';
  return 'OVERVIEW';
}

function filterWorkspaceTasksByTab(tabId: string, tasks: WorkspaceSourceTask[]): WorkspaceSourceTask[] {
  if (tabId === "frontend") {
    return tasks.filter((task) => task.workstream === "FRONTEND");
  }

  if (tabId === "backend-api") {
    return tasks.filter((task) => task.workstream === "BACKEND");
  }

  if (tabId === "admin-panel") {
    return tasks.filter(
      (task) =>
        task.workstream === "FULLSTACK" ||
        task.workstream === "BACKEND" ||
        includesText(task.title, "admin"),
    );
  }

  if (tabId === "ui-ux") {
    return tasks.filter(
      (task) => task.workstream === "UI_INTEGRATION" || task.type === "REVISION" || task.type === "FEATURE",
    );
  }

  if (tabId === "test-deploy") {
    return tasks.filter(
      (task) => task.type === "DEPLOYMENT" || task.type === "QA" || task.workstream === "DEVOPS" || task.workstream === "QA",
    );
  }

  if (tabId === "revisions") {
    return tasks.filter((task) => task.type === "REVISION");
  }

  return tasks;
}

function includesText(value: string | null | undefined, keyword: string): boolean {
  if (!value) {
    return false;
  }
  return value.toLowerCase().includes(keyword.toLowerCase());
}

function getTaskStatusTone(status: string): string {
  if (status === "DONE") return statusTone.good;
  if (status === "IN_PROGRESS" || status === "REVIEW") return statusTone.info;
  if (status === "BLOCKED") return statusTone.danger;
  return statusTone.violet;
}

function getSprintStatusTone(status: string): string {
  if (status === "COMPLETED") return statusTone.good;
  if (status === "ACTIVE") return statusTone.info;
  if (status === "CANCELLED") return statusTone.danger;
  return statusTone.violet;
}

function getReleaseStatusTone(status: string): string {
  if (status === "DEPLOYED") return statusTone.good;
  if (status === "READY" || status === "TESTING") return statusTone.info;
  if (status === "FAILED" || status === "ROLLED_BACK") return statusTone.danger;
  return statusTone.violet;
}

function detectFigmaLinkKind(url: string | null | undefined): "prototype" | "ui" | null {
  if (!url) {
    return null;
  }
  const normalized = url.toLowerCase();
  if (!normalized.includes("figma.com/")) {
    return null;
  }
  return normalized.includes("figma.com/proto/") ? "prototype" : "ui";
}

function buildFigmaEmbedUrl(url: string | null | undefined): string | null {
  if (!url || detectFigmaLinkKind(url) !== "prototype") {
    return null;
  }
  return `https://www.figma.com/embed?embed_host=socialtech-client&url=${encodeURIComponent(url)}`;
}

function getViewKind(serviceId: string, tabId: string): ViewKind {
  if (['growth-summary', 'weekly-actions', 'channels'].includes(tabId)) return 'growth';
  if (['content-calendar'].includes(tabId)) return 'calendar';
  if (['pending-approvals', 'content-approvals', 'copywriting', 'wireframe', 'revisions', 'ugc-scripts', 'ad-copies'].includes(tabId)) return 'approval';
  if (['published-content'].includes(tabId)) return 'published';
  if (['dm-comments'].includes(tabId)) return 'inbox';
  if (['competitor-analysis', 'trend-notes', 'keywords', 'negative-keywords', 'audiences', 'search-terms', 'asin-targeting'].includes(tabId)) return 'insights';
  if (['campaigns', 'search-campaigns', 'sponsored-products', 'sponsored-brands', 'sponsored-display', 'meta-ads', 'google-ads', 'tiktok-ads', 'amazon-ads'].includes(tabId)) return 'campaigns';
  if (['channel-performance', 'budget-distribution', 'ad-sets', 'acos-tacos'].includes(tabId)) return 'performance';
  if (['funnel-structure', 'app-flow', 'ux-flow', 'project-roadmap'].includes(tabId)) return 'funnel';
  if (['creatives', 'video-creatives', 'hook-tests', 'design', 'ui-screens', 'screens', 'prototype'].includes(tabId)) return 'creative';
  if (['seo-audit', 'technical-issues', 'page-speed', 'index-status', 'search-console', 'pixel-events', 'conversions', 'form-tracking', 'retail-readiness', 'security', 'backup', 'maintenance', 'updates'].includes(tabId)) return 'diagnostics';
  if (['sprint-status', 'frontend', 'backend-api', 'admin-panel', 'test-deploy', 'api-admin', 'push-notifications', 'test-build', 'store-readiness', 'development', 'publish-status', 'ab-tests', 'responsive-design', 'design-system'].includes(tabId)) return 'project';
  if (['support-requests', 'open-tasks', 'resolved-tasks', 'activity-log'].includes(tabId)) return 'support';
  if (['brief-target'].includes(tabId)) return 'brief';
  if (['files', 'delivery-files'].includes(tabId)) return 'delivery';
  if (serviceId === 'technical-support') return 'support';
  return 'project';
}

function PageHero({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#101010] p-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#AAFF01]/10 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#7B61FF]/10 blur-3xl" />
      <div className="relative max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-1 text-xs text-[#AAFF01] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {content.serviceName}
          <span className="text-[#A0A0A0]">/</span>
          <span className="text-white/80">{tabId}</span>
        </div>
        <h1 className="text-3xl text-white mb-3">{content.title}</h1>
        <p className="text-[#A0A0A0] leading-relaxed max-w-3xl">{content.description}</p>
      </div>
    </div>
  );
}

function SmartKpis({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const icons = [BarChart3, Target, Activity, CheckCircle];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {content.kpis.map((kpi, index) => {
        const Icon = icons[index % icons.length];

        return (
          <div key={`${tabId}-${kpi.label}`} className={`${cardClass} hover:border-[#AAFF01]/20 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#A0A0A0] text-sm">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 border border-[#AAFF01]/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#AAFF01]" />
              </div>
            </div>
            <div className="text-3xl text-white mb-1">{kpi.value}</div>
            <p className="text-sm text-[#A0A0A0]">{kpi.note}</p>
          </div>
        );
      })}
    </div>
  );
}

function renderWorkspace(
  kind: ViewKind,
  content: ServiceTabContent,
  serviceId: string,
  tabId: string,
  projectId?: string | null,
) {
  if (serviceId === 'social-media') {
    return <SocialMediaClientWorkspace tabId={tabId} />;
  }

  switch (kind) {
    case 'growth':
      return <GrowthWorkspace content={content} />;
    case 'calendar':
      return <CalendarWorkspace content={content} />;
    case 'approval':
      return <ApprovalWorkspace content={content} tabId={tabId} />;
    case 'published':
      return <PublishedWorkspace content={content} />;
    case 'inbox':
      return <InboxWorkspace content={content} />;
    case 'insights':
      return <InsightWorkspace content={content} tabId={tabId} />;
    case 'campaigns':
      return <CampaignWorkspace content={content} serviceId={serviceId} tabId={tabId} />;
    case 'performance':
      return <PerformanceWorkspace content={content} tabId={tabId} />;
    case 'funnel':
      return <FunnelWorkspace content={content} tabId={tabId} />;
    case 'creative':
      return <CreativeWorkspace content={content} tabId={tabId} />;
    case 'diagnostics':
      return <DiagnosticsWorkspace content={content} tabId={tabId} />;
    case 'project':
      return <ProjectWorkspace content={content} tabId={tabId} />;
    case 'support':
      return <SupportWorkspace content={content} tabId={tabId} />;
    case 'brief':
      return <BriefWorkspace content={content} />;
    case 'delivery':
      return <DeliveryWorkspace content={content} projectId={projectId} />;
    default:
      return <ProjectWorkspace content={content} tabId={tabId} />;
  }
}

function SocialMediaClientWorkspace({ tabId }: { tabId: string }) {
  const isCalendarTab = tabId === 'content-calendar';
  const isPostListTab = tabId === 'pending-approvals' || tabId === 'published-content';
  const isApprovalTab = tabId === 'pending-approvals' || tabId === 'approvals';
  const isPerformanceTab = tabId === 'performance';
  const isReportsTab = tabId === 'reports';
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetOwnSocialMediaSummaryQuery();
  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
  } = useGetOwnSocialMediaConfigQuery();
  const {
    data: calendarData,
    isLoading: calendarLoading,
    isError: calendarError,
  } = useGetOwnSocialMediaCalendarQuery({ limit: 80 }, { skip: !isCalendarTab });
  const {
    data: listPosts = [],
    isLoading: postsLoading,
    isError: postsError,
  } = useGetOwnSocialMediaPostsQuery({ limit: 80 }, { skip: !isPostListTab });
  const {
    data: insightsResponse,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useGetOwnSocialMediaInsightsQuery({ limit: 50 }, { skip: !isPerformanceTab });
  const {
    data: reportsResponse,
    isLoading: socialReportsLoading,
    isError: socialReportsError,
  } = useGetOwnSocialMediaReportsQuery({ limit: 20 }, { skip: !isReportsTab });
  const {
    data: approvalTasks = [],
    isLoading: approvalsLoading,
    isError: approvalsError,
  } = useGetClientTasksQuery(
    { approvalRequired: true },
    { skip: !isApprovalTab },
  );
  const [updateClientTaskApproval, { isLoading: approvalActionLoading }] =
    useUpdateClientTaskApprovalMutation();

  const posts = isCalendarTab
    ? filterSocialMediaTabPosts('content-calendar', calendarData?.posts ?? [])
    : filterSocialMediaTabPosts(tabId, listPosts);
  const socialApprovalTasks = useMemo(
    () => approvalTasks.filter((task) => task.projectServiceId === 'social-media' && task.approvalRequired),
    [approvalTasks],
  );
  const pendingApprovalTasks = useMemo(
    () => socialApprovalTasks.filter((task) => task.approvalStatus === 'PENDING').slice(0, 10),
    [socialApprovalTasks],
  );
  const approvalHistoryTasks = useMemo(
    () =>
      socialApprovalTasks
        .filter((task) => task.approvalStatus && task.approvalStatus !== 'PENDING')
        .slice(0, 8),
    [socialApprovalTasks],
  );
  const isLoading =
    summaryLoading ||
    configLoading ||
    (isCalendarTab && calendarLoading) ||
    (isPostListTab && postsLoading) ||
    (isPerformanceTab && insightsLoading) ||
    (isReportsTab && socialReportsLoading) ||
    (isApprovalTab && approvalsLoading);
  const isError =
    summaryError ||
    configError ||
    (isCalendarTab && calendarError) ||
    (isPostListTab && postsError) ||
    (isPerformanceTab && insightsError) ||
    (isReportsTab && socialReportsError) ||
    (isApprovalTab && approvalsError);

  const handleApprovalDecision = async (
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => {
    setActiveApprovalTaskId(task.id);
    try {
      await updateClientTaskApproval({
        taskId: task.id,
        body: {
          approvalStatus,
          approvalResponseNote: approvalResponseNote?.trim() || undefined,
        },
      }).unwrap();
      const feedback = getApprovalDecisionFeedback(task.title, approvalStatus);
      runClientAction(feedback.message, feedback.action);
    } catch {
      runClientAction(`${task.title} onayı güncellenemedi`, 'comment');
    } finally {
      setActiveApprovalTaskId(null);
    }
  };

  if (isLoading) {
    return <SocialMediaWorkspaceStatus title="Sosyal medya verileri yükleniyor" description="Görünür kayıtlar hazırlanıyor." />;
  }

  if (isError) {
    return <SocialMediaWorkspaceStatus title="Sosyal medya verileri alınamadı" description="Bu sekme şu anda görüntülenemiyor." />;
  }

  if (isCalendarTab) {
    const groups = groupPostsByDay(posts).slice(0, 7);
    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className={`${cardClass} xl:col-span-3`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl text-white mb-1">İçerik Takvimi</h2>
              <p className="text-sm text-[#A0A0A0]">Portalda görünür yayın planı.</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded border ${statusTone.info}`}>{posts.length} içerik</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.day} className="min-h-44 rounded-2xl border border-white/[0.08] bg-[#131313] p-3">
                  <div className="text-xs text-[#A0A0A0] mb-3">{group.day}</div>
                  <div className="space-y-2">
                    {group.posts.slice(0, 4).map((post) => (
                      <div key={post.id} className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                        <span className={`text-[11px] px-2 py-1 rounded border ${getSocialMediaStatusTone(post.status)}`}>
                          {getSocialMediaPostStatusLabel(post.status)}
                        </span>
                        <p className="text-white text-sm mt-3 line-clamp-2">{post.title}</p>
                        <p className="text-xs text-[#A0A0A0] mt-2">
                          {getSocialMediaPlatformLabel(post.platform)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-7 rounded-2xl border border-white/[0.08] bg-[#131313] p-6 text-sm text-[#A0A0A0]">
                Takvimde gösterilecek görünür içerik bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <div className={`${cardClass} space-y-4`}>
          <h2 className="text-xl text-white">Yayın Özeti</h2>
          {[
            ['Planlanan', posts.filter((post) => post.status === 'SCHEDULED').length],
            ['Onay Akışı', posts.filter((post) => ['WAITING_APPROVAL', 'REVISION_REQUIRED', 'DESIGN'].includes(post.status)).length],
            ['Yayınlanan', posts.filter((post) => post.status === 'PUBLISHED').length],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
              <span className="text-white text-sm">{label}</span>
              <span className="text-sm text-[#AAFF01]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tabId === 'pending-approvals' || tabId === 'approvals') {
    const postApprovals = filterSocialMediaTabPosts('pending-approvals', listPosts);
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${cardClass} xl:col-span-2`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl text-white mb-1">Onay Akışı</h2>
              <p className="text-sm text-[#A0A0A0]">Müşteri görünür postlar ve onay görevleri.</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded border ${statusTone.warn}`}>
              {postApprovals.length + pendingApprovalTasks.length} kayıt
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postApprovals.length > 0 ? (
              postApprovals.map((post) => <SocialMediaClientPostCard key={post.id} post={post} />)
            ) : (
              <div className="md:col-span-2 rounded-xl bg-[#202020] p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
                Onay bekleyen görünür post yok.
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <MetaAdsApprovalsPanel
            serviceLabel="Social Media"
            tasks={pendingApprovalTasks}
            history={approvalHistoryTasks}
            creativeFiles={[]}
            loading={false}
            isError={false}
            isActionLoading={approvalActionLoading}
            activeTaskId={activeApprovalTaskId}
            onDecision={handleApprovalDecision}
          />
        </div>
      </div>
    );
  }

  if (tabId === 'creatives') {
    return <SocialMediaCreativesWorkspace assets={summary?.creativeAssets ?? []} />;
  }

  if (tabId === 'agency-notes' || tabId === 'trend-notes') {
    return (
      <SocialMediaAgencyNotesWorkspace
        note={config?.notes ?? summary?.config?.notes ?? null}
        frequency={config?.contentFrequency ?? summary?.config?.contentFrequency ?? null}
        goal={getSocialMediaGoalLabel(config?.primaryGoal ?? summary?.config?.primaryGoal ?? null)}
        tone={config?.toneOfVoice ?? summary?.config?.toneOfVoice ?? null}
        hashtags={config?.hashtags ?? summary?.config?.hashtags ?? []}
      />
    );
  }

  if (isPerformanceTab) {
    return <SocialMediaPerformanceWorkspace insightsResponse={insightsResponse ?? null} summary={summary} />;
  }

  if (isReportsTab) {
    return <SocialMediaReportsWorkspace reportsResponse={reportsResponse ?? null} />;
  }

  if (tabId === 'dm-comments' || tabId === 'competitor-analysis') {
    return <SocialMediaUnavailableWorkspace tabId={tabId} summary={summary} />;
  }

  const title = tabId === 'published-content' ? 'Yayınlanan İçerikler' : 'Onay Akışı';
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">{title}</h2>
            <p className="text-sm text-[#A0A0A0]">Müşteri görünürlüğü açık kayıtlar.</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.violet}`}>{posts.length} içerik</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.length > 0 ? (
            posts.map((post) => <SocialMediaClientPostCard key={post.id} post={post} />)
          ) : (
            <div className="md:col-span-2 rounded-xl bg-[#202020] p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
              Bu bölüm için görünür içerik yok.
            </div>
          )}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Durum Dağılımı</h2>
        {buildStatusSummary(posts).map((item) => (
          <div key={item.status} className="mb-3 flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-sm text-white">{getSocialMediaPostStatusLabel(item.status)}</span>
            <span className="text-sm text-[#AAFF01]">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialMediaClientPostCard({ post }: { post: SocialMediaPost }) {
  return (
    <div className={innerClass}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="min-w-0 break-words text-white text-sm">{post.title}</h3>
        <span className={`shrink-0 text-xs px-2 py-1 rounded border ${getSocialMediaStatusTone(post.status)}`}>
          {getSocialMediaPostStatusLabel(post.status)}
        </span>
      </div>
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[#A0A0A0]">Platform</span>
          <span className="text-white text-right">{getSocialMediaPlatformLabel(post.platform)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#A0A0A0]">Format</span>
          <span className="text-white text-right">{getSocialMediaPostTypeLabel(post.type)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#A0A0A0]">Tarih</span>
          <span className="text-white text-right">{formatSocialMediaDate(post.scheduledAt ?? post.publishedAt)}</span>
        </div>
      </div>
      {post.caption ? <p className="line-clamp-3 text-sm text-[#A0A0A0]">{post.caption}</p> : null}
      {post.externalPostUrl ? (
        <a
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#AAFF01]/30 px-3 py-2 text-xs text-[#AAFF01] transition hover:border-[#AAFF01]/70 hover:text-[#C6FF4A]"
          href={post.externalPostUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Link className="h-3.5 w-3.5" />
          Dış yayını aç
        </a>
      ) : null}
    </div>
  );
}

function SocialMediaCreativesWorkspace({ assets }: { assets: SocialMediaCreativeAsset[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-white mb-1">Kreatifler</h2>
            <p className="text-sm text-[#A0A0A0]">Müşteri görünür Social Media assetleri.</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.info}`}>{assets.length} dosya</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.length > 0 ? (
            assets.map((asset) => <SocialMediaCreativeCard key={asset.id} asset={asset} />)
          ) : (
            <div className="md:col-span-2 rounded-xl bg-[#202020] p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
              Paylaşılan kreatif dosya yok.
            </div>
          )}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Kapsam</h2>
        <p className="text-sm text-[#A0A0A0]">
          Bu alanda yalnızca client-visible dosyalar ve Social Media projesine bağlı kreatifler gösterilir.
        </p>
      </div>
    </div>
  );
}

function SocialMediaCreativeCard({ asset }: { asset: SocialMediaCreativeAsset }) {
  return (
    <a
      href={asset.secureUrl}
      target="_blank"
      rel="noreferrer"
      className={`${innerClass} block transition-colors hover:border-[#AAFF01]/30`}
    >
      <div className="mb-3 h-40 overflow-hidden rounded-xl border border-white/[0.08] bg-[#131313]">
        {asset.mimeType.startsWith('image/') ? (
          <img src={asset.secureUrl} alt="" className="h-full w-full object-cover" />
        ) : asset.mimeType.startsWith('video/') ? (
          <video src={asset.secureUrl} className="h-full w-full object-cover" muted />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileText className="h-6 w-6 text-[#AAFF01]" />
          </div>
        )}
      </div>
      <h3 className="text-sm text-white">{asset.title}</h3>
      <p className="mt-2 text-xs text-[#A0A0A0]">{asset.project.name || asset.category}</p>
    </a>
  );
}

function SocialMediaAgencyNotesWorkspace({
  note,
  frequency,
  goal,
  tone,
  hashtags,
}: {
  note: string | null;
  frequency: string | null;
  goal: string;
  tone: string | null;
  hashtags: string[];
}) {
  const rows = [
    ['İçerik Ritmi', frequency ?? 'Tanımlı değil'],
    ['Ana Hedef', goal],
    ['Marka Tonu', tone ?? 'Tanımlı değil'],
    ['Hashtag Seti', hashtags.length > 0 ? hashtags.join(', ') : 'Tanımlı değil'],
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-4">Ajans Notları</h2>
        {note ? (
          <p className="text-sm leading-relaxed text-[#d7d7d7]">{note}</p>
        ) : (
          <p className="text-sm text-[#A0A0A0]">Ajans notu paylaşıldığında burada görünecek.</p>
        )}
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Strateji Alanları</h2>
        <div className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/[0.08] bg-[#202020] p-3">
              <p className="text-xs text-[#A0A0A0]">{label}</p>
              <p className="mt-1 break-words text-sm text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialMediaPerformanceWorkspace({
  insightsResponse,
  summary,
}: {
  insightsResponse: SocialMediaInsightsResponse | null;
  summary: SocialMediaSummary | null | undefined;
}) {
  const meta = insightsResponse?.meta ?? null;
  const insights = insightsResponse?.data ?? [];
  const totals = meta?.totals;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-white mb-1">Performans</h2>
            <p className="text-sm text-[#A0A0A0]">Yayın sonrası görünür Social Media metrikleri.</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.info}`}>
            {insights.length} snapshot
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {[
            ['Impression', totals?.impressions ?? 0],
            ['Reach', totals?.reach ?? 0],
            ['Engagement', `${formatCompactNumber(totals?.engagementRate ?? 0)}%`],
            ['Yayınlanan', summary?.metrics.publishedPosts ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
              <p className="text-xs text-[#A0A0A0]">{label}</p>
              <p className="mt-2 text-2xl text-white">{typeof value === 'number' ? formatCompactNumber(value) : value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.length > 0 ? (
            insights.slice(0, 6).map((insight) => (
              <div key={insight.id} className={innerClass}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm text-white">{insight.post.title}</h3>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      {getSocialMediaPlatformLabel(insight.platform)} · {formatSocialMediaDate(insight.date)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>
                    {formatCompactNumber(insight.engagementRate)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#A0A0A0]">
                  <span>Reach {formatCompactNumber(insight.reach)}</span>
                  <span>Like {formatCompactNumber(insight.likes)}</span>
                  <span>Click {formatCompactNumber(insight.clicks)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 rounded-xl bg-[#202020] p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
              Henüz client-visible performans snapshot yok.
            </div>
          )}
        </div>
      </div>

      <div className={`${cardClass} space-y-5`}>
        <div>
          <h2 className="text-xl text-white mb-4">Top Postlar</h2>
          <div className="space-y-3">
            {(meta?.topPosts ?? []).length > 0 ? (
              meta?.topPosts.map((post) => (
                <div key={post.postId} className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                  <p className="text-sm text-white">{post.title}</p>
                  <p className="mt-1 text-xs text-[#A0A0A0]">
                    {getSocialMediaPlatformLabel(post.platform)} · {formatCompactNumber(post.engagementScore)} etkileşim
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A0A0A0]">Top post verisi henüz yok.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl text-white mb-4">Platform Dağılımı</h2>
          <div className="space-y-3">
            {(meta?.platformBreakdown ?? []).map((item) => (
              <div key={item.key} className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white">{item.key}</span>
                  <span className="text-[#AAFF01]">{formatCompactNumber(item.engagementRate)}%</span>
                </div>
              </div>
            ))}
            {(meta?.platformBreakdown ?? []).length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Platform kırılımı henüz yok.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialMediaReportsWorkspace({
  reportsResponse,
}: {
  reportsResponse: SocialMediaReportsResponse | null;
}) {
  const reports = reportsResponse?.data ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-white mb-1">Raporlar</h2>
            <p className="text-sm text-[#A0A0A0]">Ajans tarafından yayınlanan Social Media raporları.</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.violet}`}>
            {reports.length} rapor
          </span>
        </div>

        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className={innerClass}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-white">{getSocialMediaReportTypeLabel(report.type)}</h3>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      {formatSocialMediaDate(report.periodStart)} - {formatSocialMediaDate(report.periodEnd)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>
                    {getSocialMediaReportStatusLabel(report.status)}
                  </span>
                </div>
                {report.summary ? (
                  <p className="mt-4 text-sm leading-relaxed text-[#D7D7D7]">{report.summary}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-1 rounded border ${statusTone.info}`}>
                    {report.acknowledgementStatus === 'NOT_REQUESTED'
                      ? 'Bilgilendirme'
                      : `Onay: ${report.acknowledgementStatus}`}
                  </span>
                  {report.publishedAt ? (
                    <span className="px-2 py-1 rounded border border-white/[0.08] text-[#A0A0A0]">
                      Yayın: {formatSocialMediaDate(report.publishedAt)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-[#202020] p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
              Henüz yayınlanmış Social Media raporu yok.
            </div>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Rapor Özeti</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-sm text-[#A0A0A0]">Yayınlandı</span>
            <span className="text-sm text-white">{reportsResponse?.meta.published ?? 0}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-sm text-[#A0A0A0]">Client-visible</span>
            <span className="text-sm text-white">{reportsResponse?.meta.clientVisible ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialMediaUnavailableWorkspace({
  tabId,
  summary,
}: {
  tabId: string;
  summary: SocialMediaSummary | null | undefined;
}) {
  const tabLabel = getSocialMediaUnavailableTabLabel(tabId);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-2">{tabLabel}</h2>
        <p className="text-sm text-[#A0A0A0]">
          Bu sekme için henüz Social Media API veri kaynağı aktif değil. Mock içerik gösterilmiyor.
        </p>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Panel Durumu</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-[#A0A0A0]">Durum</span>
            <span className="text-white">{summary ? getSocialMediaSummaryStateLabel(summary.state) : 'Hazırlanıyor'}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-[#A0A0A0]">Görünür İçerik</span>
            <span className="text-white">{summary?.metrics.plannedPosts ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialMediaWorkspaceStatus({ title, description }: { title: string; description: string }) {
  return (
    <div className={cardClass}>
      <p className="text-white">{title}</p>
      <p className="mt-1 text-sm text-[#A0A0A0]">{description}</p>
    </div>
  );
}

function filterSocialMediaTabPosts(tabId: string, posts: SocialMediaPost[]): SocialMediaPost[] {
  if (tabId === 'content-calendar') {
    return posts.filter((post) => post.status === 'SCHEDULED' || post.status === 'PUBLISHED');
  }

  if (tabId === 'published-content') {
    return posts.filter((post) => post.status === 'PUBLISHED');
  }

  if (tabId === 'pending-approvals') {
    return posts.filter((post) => ['WAITING_APPROVAL', 'REVISION_REQUIRED', 'DESIGN'].includes(post.status));
  }

  return posts;
}

function buildStatusSummary(posts: SocialMediaPost[]): Array<{ status: SocialMediaPost['status']; count: number }> {
  const summary = posts.reduce<Partial<Record<SocialMediaPost['status'], number>>>((accumulator, post) => {
    accumulator[post.status] = (accumulator[post.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(summary).map(([status, count]) => ({
    status: status as SocialMediaPost['status'],
    count: count ?? 0,
  }));
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value);
}

function getSocialMediaUnavailableTabLabel(tabId: string): string {
  const labels: Record<string, string> = {
    'dm-comments': 'DM & Yorumlar',
    'competitor-analysis': 'Rakip Analizi',
    performance: 'Performans',
    reports: 'Raporlar',
  };

  return labels[tabId] ?? 'Social Media Sekmesi';
}

function GrowthWorkspace({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">Growth Control Center</h2>
            <p className="text-sm text-[#A0A0A0]">Kanal katkısı, riskler ve haftalık aksiyonlar birlikte okunur.</p>
          </div>
          <Button variant="secondary" icon={TrendingUp}>Growth Raporu</Button>
        </div>
        <div className="space-y-5">
          {content.table.rows.map((row, index) => (
            <div key={row.join('-')} className={innerClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
                  </div>
                  <div>
                    <p className="text-white">{row[0]}</p>
                    <p className="text-xs text-[#A0A0A0]">{row[1]} • {row[2]}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.good : statusTone.violet}`}>
                  {row[3] || 'Takip'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#131313] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#AAFF01] to-[#7B61FF]" style={{ width: `${78 - index * 9}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Sonraki Önerilen Aksiyonlar</h2>
        {content.clientActions.map((action, index) => (
          <div key={action} className="rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#AAFF01]" />
              <span className="text-xs text-[#AAFF01]">Aksiyon {index + 1}</span>
            </div>
            <p className="text-white text-sm mb-3">{action}</p>
            <Button variant={index === 0 ? 'primary' : 'secondary'} className="text-xs px-3 py-2">İncele</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarWorkspace({ content }: { content: ServiceTabContent }) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const posts = ['Reels', 'Story', 'Post', 'Carousel', 'Live', 'Story', 'Rapor'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className={`${cardClass} xl:col-span-3`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">İçerik Takvimi</h2>
            <p className="text-sm text-[#A0A0A0]">Haftalık yayın planı, format ve onay durumu.</p>
          </div>
          <Button variant="secondary" icon={CalendarDays}>Aylık Takvim</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((day, index) => (
            <div key={day} className="min-h-44 rounded-2xl border border-white/[0.08] bg-[#131313] p-3">
              <div className="text-xs text-[#A0A0A0] mb-3">{day}</div>
              <div className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                <span className={`text-xs px-2 py-1 rounded border ${index % 2 === 0 ? statusTone.good : statusTone.violet}`}>
                  {posts[index]}
                </span>
                <p className="text-white text-sm mt-3">{content.table.rows[index % content.table.rows.length]?.[0] || 'İçerik planı'}</p>
                <p className="text-xs text-[#A0A0A0] mt-2">{index % 2 === 0 ? 'Planlandı' : 'Onay bekliyor'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Yayın Özeti</h2>
        {['3 Reels', '4 Story', '2 Post', '1 Carousel'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-white text-sm">{item}</span>
            <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const labels = tabId.includes('copy') ? ['Headline', 'CTA', 'Section Copy'] : tabId.includes('wireframe') ? ['Wireframe', 'Feedback', 'Approval'] : ['Visual', 'Caption', 'Platform'];
  const [itemStatuses, setItemStatuses] = useState<Record<string, 'Onaylandı' | 'Revizyon İstendi' | 'Yorum Eklendi'>>({});

  const updateItem = (itemId: string, status: 'Onaylandı' | 'Revizyon İstendi' | 'Yorum Eklendi') => {
    setItemStatuses((current) => ({ ...current, [itemId]: status }));
    runClientAction(`${itemId} - ${status}`, status === 'Onaylandı' ? 'approve' : status === 'Revizyon İstendi' ? 'revision' : 'comment');
  };

  const approveAll = () => {
    const nextStatus = content.table.rows.slice(0, 4).reduce<Record<string, 'Onaylandı'>>((acc, row) => {
      acc[row[0]] = 'Onaylandı';
      return acc;
    }, {});
    setItemStatuses((current) => ({ ...current, ...nextStatus }));
    runClientAction(`${content.title} - Toplu Onay`, 'approve');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">Onay Masası</h2>
            <p className="text-sm text-[#A0A0A0]">Onay, revizyon ve yorum akışı burada ilerler.</p>
          </div>
          <Button variant="primary" icon={CheckCircle} onClick={approveAll}>Toplu Onayla</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.table.rows.slice(0, 4).map((row, index) => (
            <div key={row.join('-')} className={innerClass}>
              <div className="h-32 rounded-xl bg-gradient-to-br from-[#AAFF01]/10 via-[#7B61FF]/10 to-[#202020] border border-white/[0.08] mb-4 flex items-center justify-center">
                <Image className="w-8 h-8 text-[#AAFF01]" />
              </div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white text-sm">{row[0]}</h3>
                <span className={`text-xs px-2 py-1 rounded border ${
                  itemStatuses[row[0]] === 'Onaylandı'
                    ? statusTone.good
                    : itemStatuses[row[0]] === 'Revizyon İstendi'
                      ? statusTone.warn
                      : itemStatuses[row[0]] === 'Yorum Eklendi'
                        ? statusTone.info
                        : statusTone.violet
                }`}>
                  {itemStatuses[row[0]] || 'Onay Bekliyor'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {labels.map((label, labelIndex) => (
                  <div key={label} className="flex justify-between gap-4 text-sm">
                    <span className="text-[#A0A0A0]">{label}</span>
                    <span className="text-white text-right">{row[labelIndex] || row[0]}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" className="text-xs px-3 py-2" onClick={() => updateItem(row[0], 'Onaylandı')}>Onayla</Button>
                <Button variant="secondary" className="text-xs px-3 py-2" onClick={() => updateItem(row[0], 'Revizyon İstendi')}>Revizyon İste</Button>
                <Button variant="ghost" className="text-xs px-3 py-2" onClick={() => updateItem(row[0], 'Yorum Eklendi')}>Yorum</Button>
              </div>
              {index === 0 && <p className="text-xs text-[#AAFF01] mt-3">Ajans önerisi: bu versiyon yayın için hazır.</p>}
            </div>
          ))}
        </div>
      </div>
      <CommentRail content={content} />
    </div>
  );
}

function PublishedWorkspace({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">Yayınlanan İçerik Grid’i</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.table.rows.slice(0, 6).map((row, index) => (
            <div key={row.join('-')} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#202020]">
              <div className="h-40 bg-gradient-to-br from-[#AAFF01]/20 to-[#7B61FF]/20 flex items-center justify-center">
                <PlayCircle className="w-10 h-10 text-white" />
              </div>
              <div className="p-4">
                <h3 className="text-white text-sm mb-3">{row[0]}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <MetricPill label="Reach" value={row[1] || '12K'} />
                  <MetricPill label="Eng." value={row[2] || '%7.4'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">En İyi Performans</h2>
        <div className="rounded-2xl bg-[#AAFF01] p-5 text-black mb-4">
          <p className="text-sm opacity-70">Best content</p>
          <p className="text-2xl mt-1">{content.table.rows[0]?.[0] || 'Reels içeriği'}</p>
          <p className="text-sm mt-3">Tekrar kullanılabilir kreatif açı yakalandı.</p>
        </div>
        <Button variant="secondary" icon={FileText}>Performansı Aç</Button>
      </div>
    </div>
  );
}

function InboxWorkspace({ content }: { content: ServiceTabContent }) {
  const messages = ['Fiyat bilgisi alabilir miyim?', 'Sipariş süresi nedir?', 'Kampanya devam ediyor mu?', 'Ürün ölçüsü var mı?'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">DM & Yorum Inbox</h2>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>Yanıt tonu aktif</span>
        </div>
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={message} className="flex gap-3 rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm">Müşteri mesajı #{index + 1}</p>
                  <span className="text-xs text-[#A0A0A0]">{index + 2} dk önce</span>
                </div>
                <p className="text-sm text-[#A0A0A0] mb-3">{message}</p>
                <div className="rounded-lg bg-[#131313] p-3 text-sm text-white">
                  Önerilen yanıt: Merhaba, yardımcı olalım. Size en doğru bilgi için ilgili ürün linkini ve detayları iletiyoruz.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">FAQ Özeti</h2>
        {content.table.rows.slice(0, 4).map((row) => (
          <div key={row.join('-')} className="mb-3 rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <p className="text-white text-sm">{row[0]}</p>
            <p className="text-xs text-[#A0A0A0] mt-1">{row[1] || 'Yanıtlandı'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const isKeyword = tabId.includes('keyword') || tabId.includes('search') || tabId.includes('asin');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl text-white mb-1">{isKeyword ? 'Analiz Tablosu' : 'Fırsat Haritası'}</h2>
            <p className="text-sm text-[#A0A0A0]">Karar verilecek alanlar aksiyon durumuna göre sıralanır.</p>
          </div>
          <Button variant="secondary" icon={Search}>Filtrele</Button>
        </div>
        <ResponsiveTable rows={content.table.rows} columns={isKeyword ? ['Terim', 'Hacim/Spend', 'Sonuç', 'Aksiyon'] : content.table.columns} />
      </div>
      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Opportunity Notes</h2>
        {content.sections[0]?.items.slice(0, 4).map((item, index) => (
          <div key={item} className="rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#AAFF01]" />
              <span className="text-xs text-[#AAFF01]">Skor {9 - index}/10</span>
            </div>
            <p className="text-white text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignWorkspace({ content, serviceId, tabId }: { content: ServiceTabContent; serviceId: string; tabId: string }) {
  const channel = tabId.includes('amazon') || serviceId === 'amazon-ads' ? 'ACOS' : tabId.includes('google') ? 'CPA' : tabId.includes('tiktok') ? 'VTR' : 'ROAS';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {content.table.rows.slice(0, 3).map((row, index) => (
          <div key={row.join('-')} className={cardClass}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white mb-1">{row[0]}</h3>
                <p className="text-xs text-[#A0A0A0]">{row[1] || 'Aktif kampanya'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.good : statusTone.info}`}>
                {row[3] || 'Aktif'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <MetricPill label="Bütçe" value={row[1] || '₺8.4K'} />
              <MetricPill label={channel} value={row[2] || '4.2x'} />
              <MetricPill label="Durum" value={row[3] || 'Scale'} />
            </div>
            <div className="h-2 rounded-full bg-[#131313] overflow-hidden">
              <div className="h-full rounded-full bg-[#AAFF01]" style={{ width: `${70 + index * 8}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">Optimizasyon Notları</h2>
          <Button variant="primary" icon={Zap}>Aksiyonları Gör</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.sections.flatMap((section) => section.items).slice(0, 6).map((item) => (
            <div key={item} className={innerClass}>
              <LineChart className="w-5 h-5 text-[#AAFF01] mb-3" />
              <p className="text-white text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformanceWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">{tabId.includes('budget') ? 'Bütçe Dağılımı' : 'Performans Karşılaştırması'}</h2>
        <div className="space-y-4">
          {content.table.rows.map((row, index) => (
            <div key={row.join('-')} className={innerClass}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white">{row[0]}</p>
                <p className="text-[#AAFF01]">{row[2] || row[1]}</p>
              </div>
              <div className="h-3 rounded-full bg-[#131313] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#AAFF01] to-[#7B61FF]" style={{ width: `${82 - index * 10}%` }} />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">{row[3] || 'Öneri takipte'}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Önerilen Kaydırma</h2>
        <div className="rounded-2xl bg-[#AAFF01] p-5 text-black">
          <p className="text-sm opacity-70">Budget signal</p>
          <p className="text-3xl mt-1">+%12</p>
          <p className="text-sm mt-3">En verimli kanala kontrollü bütçe aktarımı öneriliyor.</p>
        </div>
      </div>
    </div>
  );
}

function FunnelWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const steps = tabId.includes('roadmap') ? ['Plan', 'Design', 'Develop', 'Test', 'Launch'] : tabId.includes('ux') || tabId.includes('flow') ? ['Entry', 'Browse', 'Action', 'Conversion'] : ['Awareness', 'Consideration', 'Conversion', 'Retention'];

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-6">Akış Haritası</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step} className="relative rounded-2xl bg-[#202020] border border-white/[0.08] p-5">
              <div className="w-11 h-11 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-[#AAFF01]" />
              </div>
              <h3 className="text-white mb-2">{step}</h3>
              <p className="text-xs text-[#A0A0A0]">{content.sections[0]?.items[index] || 'Akış noktası takipte'}</p>
              {index < steps.length - 1 && <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAFF01]" />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponsiveTable rows={content.table.rows} columns={content.table.columns} />
        <CommentRail content={content} />
      </div>
    </div>
  );
}

function CreativeWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const isVideo = tabId.includes('video') || tabId.includes('hook') || tabId.includes('prototype');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">{isVideo ? 'Video / Prototype Grid' : 'Kreatif Galeri'}</h2>
          <Button variant="secondary" icon={Eye}>Önizle</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="rounded-2xl overflow-hidden bg-[#202020] border border-white/[0.08]">
              <div className="h-40 bg-gradient-to-br from-[#AAFF01]/15 to-[#7B61FF]/20 flex items-center justify-center">
                {isVideo ? <PlayCircle className="w-10 h-10 text-[#AAFF01]" /> : <Palette className="w-10 h-10 text-[#AAFF01]" />}
              </div>
              <div className="p-4">
                <h3 className="text-white text-sm mb-3">{content.table.rows[index % content.table.rows.length]?.[0] || `Varyant ${index + 1}`}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <MetricPill label={isVideo ? 'VTR' : 'CTR'} value={index % 2 === 0 ? '%42' : '%3.1'} />
                  <MetricPill label="Durum" value={index % 3 === 0 ? 'Winner' : 'Testing'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Revision Tracker</h2>
        {content.clientActions.map((action, index) => (
          <div key={action} className={innerClass}>
            <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.warn : statusTone.good}`}>{index === 0 ? 'Bekliyor' : 'İşlendi'}</span>
            <p className="text-white text-sm mt-3">{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagnosticsWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const icon = tabId.includes('security') ? Shield : tabId.includes('speed') ? Gauge : tabId.includes('backup') ? Package : Activity;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">Kontrol Listesi</h2>
          <Button variant="secondary" icon={FileText}>Detay Rapor</Button>
        </div>
        <div className="space-y-3">
          {content.sections.flatMap((section) => section.items).slice(0, 8).map((item, index) => {
            const Icon = icon;
            return (
              <div key={item} className="flex items-center justify-between gap-4 rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#AAFF01]" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{item}</p>
                    <p className="text-xs text-[#A0A0A0]">{index % 3 === 0 ? 'Müşteri onayı bekliyor' : 'Social Tech kontrolünde'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${index % 3 === 0 ? statusTone.warn : statusTone.good}`}>
                  {index % 3 === 0 ? 'Aksiyon' : 'Sağlıklı'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Health Score</h2>
        <div className="h-48 rounded-full border-[18px] border-[#AAFF01]/70 flex items-center justify-center mb-5">
          <div className="text-center">
            <div className="text-5xl text-white">94</div>
            <div className="text-sm text-[#A0A0A0]">/ 100</div>
          </div>
        </div>
        <p className="text-sm text-[#A0A0A0]">{content.agencyComment}</p>
      </div>
    </div>
  );
}

function ProjectWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const columns = ['Planlandı', 'Devam Ediyor', 'İncelemede', 'Tamamlandı'];
  const icon = tabId.includes('backend') || tabId.includes('api') ? Code : tabId.includes('design') ? Palette : Wrench;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-5">Operasyon Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((column, columnIndex) => (
            <div key={column} className="rounded-2xl bg-[#131313] border border-white/[0.08] p-4 min-h-72">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm">{column}</h3>
                <span className="text-xs text-[#A0A0A0]">{columnIndex + 1}</span>
              </div>
              <div className="space-y-3">
                {content.sections.flatMap((section) => section.items).slice(columnIndex, columnIndex + 2).map((item) => {
                  const Icon = icon;
                  return (
                    <div key={`${column}-${item}`} className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                      <Icon className="w-4 h-4 text-[#AAFF01] mb-2" />
                      <p className="text-white text-sm">{item}</p>
                      <p className="text-xs text-[#A0A0A0] mt-2">Ajans takibinde</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponsiveTable rows={content.table.rows} columns={content.table.columns} />
        <CommentRail content={content} />
      </div>
    </div>
  );
}

function SupportWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const isForm = tabId === 'support-requests';
  const [submittedTickets, setSubmittedTickets] = useState<string[]>([]);

  const submitTicket = () => {
    const title = `Yeni destek talebi #${submittedTickets.length + 1}`;
    setSubmittedTickets((current) => [title, ...current]);
    runClientAction(title, 'submit');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {isForm && (
        <div className={cardClass}>
          <h2 className="text-xl text-white mb-4">Yeni Destek Talebi</h2>
          {['Talep başlığı', 'Kategori', 'Öncelik', 'Kısa açıklama'].map((field) => (
            <div key={field} className="mb-3">
              <label className="text-xs text-[#A0A0A0]">{field}</label>
              <div className="mt-2 h-11 rounded-xl bg-[#202020] border border-white/[0.08]" />
            </div>
          ))}
          <Button variant="primary" icon={Send} className="w-full justify-center" onClick={submitTicket}>Talebi Gönder</Button>
        </div>
      )}
      <div className={`${cardClass} ${isForm ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
        <h2 className="text-xl text-white mb-5">{isForm ? 'Mevcut Talepler' : 'Ticket Board'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Açık', 'İşlemde', 'Çözüldü'].map((column, columnIndex) => (
            <div key={column} className="rounded-2xl bg-[#131313] border border-white/[0.08] p-4">
              <h3 className="text-white mb-4">{column}</h3>
              {columnIndex === 0 && submittedTickets.map((ticket, index) => (
                <div key={ticket} className="rounded-xl bg-[#202020] p-4 border border-[#AAFF01]/20 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>Yeni</span>
                    <span className="text-xs text-[#A0A0A0]">#{2900 + index}</span>
                  </div>
                  <p className="text-white text-sm">{ticket}</p>
                  <p className="text-xs text-[#A0A0A0] mt-2">Social Tech ekibine iletildi.</p>
                </div>
              ))}
              {content.table.rows.slice(0, 3).map((row, index) => (
                <div key={`${column}-${row.join('-')}-${index}`} className="rounded-xl bg-[#202020] p-4 border border-white/[0.08] mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded border ${columnIndex === 2 ? statusTone.good : columnIndex === 1 ? statusTone.info : statusTone.warn}`}>
                      {column}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">#{2840 + index}</span>
                  </div>
                  <p className="text-white text-sm">{row[0]}</p>
                  <p className="text-xs text-[#A0A0A0] mt-2">{row[1] || 'Son güncelleme bugün'}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefWorkspace({ content }: { content: ServiceTabContent }) {
  const fields = ['Campaign goal', 'Target audience', 'Offer', 'CTA', 'Brand notes'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">Brief & Hedef Formu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={field} className={innerClass}>
              <label className="text-xs text-[#A0A0A0]">{field}</label>
              <p className="text-white mt-2">{content.sections[0]?.items[index] || 'Netleştirildi'}</p>
            </div>
          ))}
        </div>
      </div>
      <CommentRail content={content} />
    </div>
  );
}

function DeliveryWorkspace({ content, projectId: externalProjectId }: { content: ServiceTabContent; projectId?: string | null }) {
  const { data: tasks } = useGetClientTasksQuery();
  const projectOptions = Array.from(
    new Map(
      (tasks ?? [])
        .filter((task) => task.projectId)
        .map((task) => [task.projectId as string, { id: task.projectId as string, name: task.projectName ?? "Proje" }]),
    ).values(),
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const internalProjectId = selectedProjectId || null;
  const projectId = externalProjectId ?? internalProjectId ?? projectOptions[0]?.id ?? null;
  const { data: filesResponse, isLoading } = useGetClientProjectFilesQuery(
    { projectId: projectId ?? "" },
    { skip: !projectId },
  );
  const files = filesResponse?.data ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">Teslim Dosyaları</h2>
        {!externalProjectId && projectOptions.length > 1 && (
          <div className="mb-4">
            <label className="text-xs text-[#A0A0A0] mb-2 block">Proje Seçimi</label>
            <select
              className="w-full rounded-lg border border-white/[0.12] bg-[#202020] px-3 py-2 text-sm text-white"
              value={projectId ?? ""}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        )}
        {isLoading && <p className="text-sm text-[#A0A0A0]">Dosyalar yükleniyor...</p>}
        {!isLoading && files.length === 0 && (
          <p className="text-sm text-[#A0A0A0]">Müşteriye açık teslim dosyası bulunmuyor.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={file.id} className={innerClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#AAFF01]" />
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${index < 2 ? statusTone.good : statusTone.info}`}>
                  {index < 2 ? 'Hazır' : 'Güncel'}
                </span>
              </div>
              <h3 className="text-white mb-2">{file.title}</h3>
              <p className="text-xs text-[#A0A0A0] mb-4">{file.originalFileName}</p>
              <Button
                variant="secondary"
                className="text-xs px-3 py-2"
                icon={Link}
                onClick={() => window.open(file.secureUrl, "_blank", "noopener,noreferrer")}
              >
                Görüntüle
              </Button>
            </div>
          ))}
        </div>
      </div>
      <CommentRail content={content} />
    </div>
  );
}

function ActionFooter({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          {content.timeline.map((item, index) => (
            <div key={item} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#AAFF01]" />
                {index < content.timeline.length - 1 && <div className="w-px h-10 bg-white/[0.08] mt-2" />}
              </div>
              <div>
                <p className="text-white text-sm">{item}</p>
                <p className="text-xs text-[#A0A0A0] mt-1">Social Tech tarafından güncellendi</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Sizden Beklenenler</h2>
        <div className="space-y-3">
          {content.clientActions.map((action, index) => (
            <div key={action} className={innerClass}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.good : statusTone.violet}`}>
                  {index === 0 ? 'Öncelikli' : 'Takip'}
                </span>
                <span className="text-xs text-[#A0A0A0] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Bu hafta
                </span>
              </div>
              <p className="text-white text-sm mb-3">{action}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="text-xs px-3 py-2">Onayla</Button>
                <Button variant="ghost" className="text-xs px-3 py-2">Yorum Ekle</Button>
                <Button variant="ghost" className="text-xs px-3 py-2">Revizyon İste</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceConversationPanel({
  messages,
  isLoading,
  isSending,
  onSend,
}: {
  messages: Array<{
    id: string;
    parentMessageId?: string | null;
    body: string;
    createdAt: string;
    author?: { displayName?: string | null } | null;
  }>;
  isLoading: boolean;
  isSending: boolean;
  onSend: (message: string, parentMessageId?: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const tree = useMemo(() => {
    const buckets = new Map<string, Array<{
      id: string;
      parentMessageId?: string | null;
      body: string;
      createdAt: string;
      author?: { displayName?: string | null } | null;
    }>>();
    for (const message of messages) {
      const key = message.parentMessageId ?? "root";
      const list = buckets.get(key) ?? [];
      list.push(message);
      buckets.set(key, list);
    }
    return buckets;
  }, [messages]);

  const submitMessage = async () => {
    if (!draft.trim() || isSending) {
      return;
    }

    await onSend(draft, replyParentId ?? undefined);
    setDraft('');
    setReplyParentId(null);
  };

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl text-white">Soru / Cevap Paneli</h2>
        <span className="text-xs text-[#A0A0A0]">Proje bazlı</span>
      </div>
      {isLoading ? <p className="mb-4 text-sm text-[#A0A0A0]">Mesajlar yükleniyor...</p> : null}
      {!isLoading && messages.length === 0 ? (
        <p className="mb-4 text-sm text-[#A0A0A0]">Henüz mesaj yok. İlk soruyu buradan iletebilirsiniz.</p>
      ) : null}
      <div className="mb-4 max-h-56 space-y-3 overflow-y-auto pr-1">
        {(tree.get("root") ?? []).map((message) => (
          <ThreadNode key={message.id} message={message} tree={tree} onReply={setReplyParentId} depth={0} />
        ))}
      </div>
      <div className="space-y-3">
        {replyParentId ? (
          <p className="text-xs text-[#d8ff8f]">
            Yanıt modu aktif: {replyParentId.slice(0, 8)}...
          </p>
        ) : null}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/[0.12] bg-[#202020] p-3 text-sm text-white outline-none focus:border-[#AAFF01]/50"
          placeholder="Ekibe iletmek istediğiniz soruyu yazın..."
        />
        <Button
          variant="primary"
          icon={Send}
          className={`w-full justify-center text-sm ${isSending ? 'pointer-events-none opacity-60' : ''}`}
          onClick={() => void submitMessage()}
        >
          {isSending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
        </Button>
        {replyParentId ? (
          <Button variant="ghost" className="w-full justify-center text-sm" onClick={() => setReplyParentId(null)}>
            Yanıtı İptal Et
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ThreadNode({
  message,
  tree,
  onReply,
  depth,
}: {
  message: {
    id: string;
    parentMessageId?: string | null;
    body: string;
    createdAt: string;
    author?: { displayName?: string | null } | null;
  };
  tree: Map<string, Array<{
    id: string;
    parentMessageId?: string | null;
    body: string;
    createdAt: string;
    author?: { displayName?: string | null } | null;
  }>>;
  onReply: (id: string) => void;
  depth: number;
}) {
  const replies = tree.get(message.id) ?? [];
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-3" style={{ marginLeft: `${depth * 14}px` }}>
        <p className="text-sm text-white">{message.body}</p>
        <p className="mt-1 text-xs text-[#A0A0A0]">
          {(message.author?.displayName || 'Social Tech')} • {new Date(message.createdAt).toLocaleString('tr-TR')}
        </p>
        <Button variant="ghost" className="mt-1 h-7 px-2 text-xs" onClick={() => onReply(message.id)}>
          Yanıtla
        </Button>
      </div>
      {replies.map((reply) => (
        <ThreadNode key={reply.id} message={reply} tree={tree} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
}

function CommentRail({ content }: { content: ServiceTabContent }) {
  return (
    <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#AAFF01]" />
        <h2 className="text-xl text-white">Ajans Yorumu</h2>
      </div>
      <p className="text-sm text-[#A0A0A0] leading-relaxed mb-5">{content.agencyComment}</p>
      <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]" />
        <span>Social Tech Ekibi</span>
      </div>
    </div>
  );
}

function ResponsiveTable({ rows, columns }: { rows: string[][]; columns: string[] }) {
  return (
    <div className={cardClass}>
      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        <div className="grid grid-cols-4 bg-[#131313]">
          {columns.slice(0, 4).map((column) => (
            <div key={column} className="px-4 py-3 text-xs text-[#A0A0A0] border-b border-white/[0.08]">
              {column}
            </div>
          ))}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={`${row[0]}-${rowIndex}`} className="grid grid-cols-4 bg-[#202020] border-b border-white/[0.06] last:border-b-0">
            {row.slice(0, 4).map((cell, cellIndex) => (
              <div key={`${cell}-${cellIndex}`} className={`px-4 py-4 text-sm ${cellIndex === 0 ? 'text-white' : 'text-[#A0A0A0]'}`}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#131313] p-2">
      <div className="text-xs text-[#A0A0A0]">{label}</div>
      <div className="text-sm text-white mt-1">{value}</div>
    </div>
  );
}
