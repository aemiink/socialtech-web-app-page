import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type LucideIcon,
  Activity,
  AlertCircle,
  AlertTriangle,
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
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../components/button';
import { getServiceTabContent, ServiceTabContent } from '../data/service-pages';
import { GrowthHubDashboard } from './services/growth-hub-dashboard';
import {
  useGetOwnMetaAdsAdCreativesQuery,
  useGetOwnMetaAdsAdSetsQuery,
  useGetOwnMetaAdsAdsQuery,
  useGetOwnMetaAdsAiCommentaryQuery,
  useGetOwnMetaAdsAudiencesQuery,
  useGetOwnMetaAdsCampaignsQuery,
  useGetOwnMetaAdsConfigQuery,
  useGetOwnMetaAdsInsightsQuery,
  useGetOwnMetaAdsPixelStatusQuery,
  useGetOwnMetaAdsPixelStatsQuery,
  useGetOwnMetaAdsReportsQuery,
  useGetOwnMetaAdsSummaryQuery,
} from '../features/metaAds/metaAdsApi';
import type { MetaAdsAdCreative, MetaAdsAdSetAudience, MetaAdsAiCommentary, MetaAdsCampaign, MetaAdsInsightItem, MetaAdsPixelChecklistItem, MetaAdsPixelStatsResponse, MetaAdsReportItem } from '../features/metaAds/metaAdsTypes';
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
  SocialMediaInsightItem,
  SocialMediaInsightPostSummary,
  SocialMediaInsightsResponse,
  SocialMediaPlatform,
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
import {
  useGetClientGrowthHubActionsQuery,
  useGetClientGrowthHubChannelsQuery,
  useGetClientGrowthHubSummaryQuery,
  useGetClientGrowthHubWeeklyNotesQuery,
} from '../features/growthHub/growthHubApi';
import type {
  GrowthHubActionItem,
  GrowthHubChannelSummary,
  GrowthHubSummary,
  GrowthHubWeeklyNote,
} from '../features/growthHub/growthHubTypes';
import {
  calculateGrowthHealthScore,
  formatGrowthHubCompactNumber,
  formatGrowthHubCurrency,
  formatGrowthHubDate,
  formatGrowthHubDateRange,
  formatGrowthHubNumber,
  formatGrowthHubRatio,
  getGrowthHubActionPriorityLabel,
  getGrowthHubActionStatusLabel,
  getGrowthHubActionTypeLabel,
  getGrowthHubChannelStatusLabel,
  getGrowthHubGoalLabel,
  getGrowthHubServiceLabel,
  getGrowthHubSourceStatusLabel,
  getGrowthHubStatusTone,
  getGrowthHubSummaryStateLabel,
} from '../features/growthHub/growthHubUtils';
import { useGetOwnWebMobileDesignSummaryQuery } from '../features/webMobileDesign/webMobileDesignApi';
import { useGetOwnTechnicalSupportConfigQuery, useGetOwnTechnicalSupportSummaryQuery } from '../features/technicalSupport/technicalSupportApi';
import { useGetOwnSeoAuditConfigQuery, useGetOwnSeoAuditSummaryQuery } from '../features/seoAudit/seoAuditApi';

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

  if (serviceId === 'growth-hub' && tabId !== 'service-dashboard' && tabId !== 'content-approvals') {
    return <GrowthHubDashboard tabId={tabId} />;
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

  if (serviceId === "web-mobile-design" && tabId !== "service-dashboard") {
    return (
      <WebMobileDesignClientWorkspace
        content={content}
        tabId={tabId}
        projectId={projectId}
        serviceId={serviceId}
      />
    );
  }

  if (serviceId === "technical-support" && tabId !== "service-dashboard") {
    return (
      <TechnicalSupportClientWorkspace
        content={content}
        tabId={tabId}
        projectId={projectId}
        serviceId={serviceId}
      />
    );
  }

  if (serviceId === "seo-audit" && tabId !== "service-dashboard") {
    return (
      <SeoAuditClientWorkspace
        content={content}
        tabId={tabId}
        projectId={projectId}
        serviceId={serviceId}
      />
    );
  }

  if (serviceId === "growth-hub" && tabId === "service-dashboard") {
    return (
      <div className="p-8 space-y-6">
        <GrowthHubClientWorkspace tabId={tabId} />
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
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#AAFF01]/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-[#7B61FF]/[0.06] blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-1 text-xs font-medium text-[#AAFF01]">
              <Sparkles className="w-3 h-3" />
              Web Uygulama
            </span>
            {projectSummary?.name && (
              <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-xs text-[#A0A0A0]">
                {projectSummary.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white">{getWebAppTabLabel(tabId)}</h1>
        </div>
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
          project={projectSummary}
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
  project,
  tasks,
  allTasks,
  sprints,
  releases,
  files,
}: {
  tabId: string;
  project?: WorkspaceProjectSummary;
  tasks: WorkspaceSourceTask[];
  allTasks: WorkspaceSourceTask[];
  sprints: WorkspaceSourceSprint[];
  releases: WorkspaceSourceRelease[];
  files: WorkspaceSourceFile[];
}) {
  if (tabId === "project-roadmap") {
    return <RoadmapSourcePanel project={project} sprints={sprints} releases={releases} tasks={allTasks} files={files} />;
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
                {task.type ? getWorkspaceTaskTypeLabel(task.type) : "Görev"}
              </span>
              {task.workstream ? (
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {getWorkspaceTaskWorkstreamLabel(task.workstream)}
                </span>
              ) : null}
              {task.severity ? (
                <span className="rounded border border-[#FFA726]/20 bg-[#FFA726]/10 px-2 py-1 text-[11px] text-[#FFA726]">
                  {getWorkspaceTaskSeverityLabel(task.severity)}
                </span>
              ) : null}
              {task.environment ? (
                <span className="rounded border border-[#7B61FF]/20 bg-[#7B61FF]/10 px-2 py-1 text-[11px] text-[#7B61FF]">
                  {getWorkspaceEnvironmentLabel(task.environment)}
                </span>
              ) : null}
              <span className={`rounded border px-2 py-1 text-[11px] ${getTaskStatusTone(task.status)}`}>
                {getWorkspaceTaskStatusLabel(task.status)}
              </span>
            </div>
            <p className="text-white">{task.title}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#A0A0A0]">
              <span>Öncelik: {getWorkspacePriorityLabel(task.priority)}</span>
              {task.code ? <span>Kod: {task.code}</span> : null}
              {task.sprint?.name ? <span>Sprint: {task.sprint.name}</span> : null}
              {task.assignee?.displayName ? <span>Atanan: {task.assignee.displayName}</span> : null}
              {task.dueDate ? <span>Teslim: {new Date(task.dueDate).toLocaleDateString("tr-TR")}</span> : null}
            </div>
          </div>
        ))}
        {tasks.length > 12 ? (
          <p className="pt-1 text-center text-xs text-[#A0A0A0]">
            +{tasks.length - 12} görev daha — proje yöneticinizle iletişime geçin
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RoadmapSourcePanel({
  project,
  sprints,
  releases,
  tasks,
  files,
}: {
  project?: WorkspaceProjectSummary;
  sprints: WorkspaceSourceSprint[];
  releases: WorkspaceSourceRelease[];
  tasks: WorkspaceSourceTask[];
  files: WorkspaceSourceFile[];
}) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const tasksBySprint = useMemo(() => {
    const bucket = new Map<string, WorkspaceSourceTask[]>();
    for (const task of tasks) {
      const key = task.sprint?.id ?? task.sprintId ?? "UNASSIGNED";
      const list = bucket.get(key) ?? [];
      list.push(task);
      bucket.set(key, list);
    }
    return bucket;
  }, [tasks]);
  const unassignedTasks = tasksBySprint.get("UNASSIGNED") ?? [];
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedTaskFiles = useMemo(
    () => (selectedTask ? getWorkspaceTaskVisibleFiles(selectedTask, files, project) : []),
    [files, project, selectedTask],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="mb-4 text-xl text-white">Sprint Yol Haritası</h2>
          {sprints.length === 0 ? <p className="text-sm text-[#A0A0A0]">Henüz sprint planı bulunmuyor.</p> : null}
          <div className="space-y-3">
            {sprints.map((sprint) => {
              const sprintTasks = tasksBySprint.get(sprint.id) ?? [];

              return (
                <div key={sprint.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{sprint.name}</p>
                      {sprint.goal ? <p className="mt-1 text-xs text-[#d7d7d7]">Hedef: {sprint.goal}</p> : null}
                      <p className="mt-1 text-xs text-[#A0A0A0]">
                        {new Date(sprint.startDate).toLocaleDateString("tr-TR")} - {new Date(sprint.endDate).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <span className={`inline-flex rounded border px-2 py-1 text-[11px] ${getSprintStatusTone(sprint.status)}`}>
                      {getWorkspaceSprintStatusLabel(sprint.status)}
                    </span>
                  </div>
                  {sprintTasks.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {sprintTasks.map((task) => (
                        <RoadmapTaskButton
                          key={task.id}
                          task={task}
                          isActive={task.id === selectedTaskId}
                          hasVisibleFiles={getWorkspaceTaskVisibleFiles(task, files, project).length > 0}
                          onSelect={() => setSelectedTaskId(task.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-[#A0A0A0]">Bu sprintte henüz görev yok.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <RoadmapTaskFilesPanel task={selectedTask} files={selectedTaskFiles} />
      </div>

      <ReleaseSourcePanel releases={releases} />

      {unassignedTasks.length > 0 ? (
        <div className={cardClass}>
          <h2 className="mb-4 text-xl text-white">Sprint’e Atanmamış Görevler</h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {unassignedTasks.map((task) => (
              <RoadmapTaskButton
                key={task.id}
                task={task}
                isActive={task.id === selectedTaskId}
                hasVisibleFiles={getWorkspaceTaskVisibleFiles(task, files, project).length > 0}
                onSelect={() => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
}

function RoadmapTaskButton({
  task,
  isActive,
  hasVisibleFiles,
  onSelect,
}: {
  task: WorkspaceSourceTask;
  isActive: boolean;
  hasVisibleFiles: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`w-full rounded-lg border p-3 text-left transition ${
        isActive
          ? "border-[#AAFF01]/60 bg-[#AAFF01]/10"
          : "border-white/[0.08] bg-black/20 hover:border-[#AAFF01]/30 hover:bg-[#AAFF01]/5"
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-white">{task.title}</span>
        <span className={`rounded border px-2 py-1 text-[11px] ${getTaskStatusTone(task.status)}`}>
          {getWorkspaceTaskStatusLabel(task.status)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#A0A0A0]">
        {task.code ? <span>{task.code}</span> : null}
        <span>Öncelik: {getWorkspacePriorityLabel(task.priority)}</span>
        {hasVisibleFiles ? (
          <span className="inline-flex items-center gap-1 text-[#AAFF01]">
            <Package className="h-3.5 w-3.5" />
            Dosya var
          </span>
        ) : null}
      </div>
    </button>
  );
}

function RoadmapTaskFilesPanel({
  task,
  files,
}: {
  task: WorkspaceSourceTask | null;
  files: WorkspaceSourceFile[];
}) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [modalFile, setModalFile] = useState<WorkspaceSourceFile | null>(null);
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0] ?? null;

  useEffect(() => {
    setActiveFileId(files[0]?.id ?? null);
    setModalFile(null);
  }, [files, task?.id]);

  return (
    <div className={cardClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl text-white">Göreve Eklenen Dosyalar</h2>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            {task ? task.title : "Roadmap içinden bir görev seçildiğinde dosyalar burada görüntülenir."}
          </p>
        </div>
        {task ? (
          <span className={`rounded border px-2 py-1 text-xs ${getTaskStatusTone(task.status)}`}>
            {getWorkspaceTaskStatusLabel(task.status)}
          </span>
        ) : null}
      </div>
      {!task ? null : files.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Bu görev için müşteriye açık dosya bulunmuyor.</p>
      ) : (
        <div className="space-y-3">
          {activeFile ? (
            <button
              type="button"
              className="block w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#202020] text-left transition hover:border-[#AAFF01]/40"
              onClick={() => setModalFile(activeFile)}
              aria-label={`${activeFile.title} önizlemeyi büyüt`}
            >
              <WorkspaceFilePreview file={activeFile} className="h-72" />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{activeFile.title}</p>
                  <p className="mt-1 truncate text-xs text-[#A0A0A0]">{activeFile.originalFileName}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-[#AAFF01]">
                  <Eye className="h-3.5 w-3.5" />
                  Büyük Önizleme
                </span>
              </div>
            </button>
          ) : null}
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                className={`w-full rounded-xl border p-3 text-left transition ${
                  file.id === activeFile?.id
                    ? "border-[#AAFF01]/50 bg-[#AAFF01]/10"
                    : "border-white/[0.08] bg-[#202020] hover:border-white/[0.16]"
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {file.folder?.name ? (
                    <span className="rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-1 text-[11px] text-[#AAFF01]">
                      {formatWorkspaceFolderLabel(file.folder.name)}
                    </span>
                  ) : null}
                  <span className="rounded border border-white/[0.16] px-2 py-1 text-[11px] text-[#CFCFCF]">
                    {getWorkspaceFileCategoryLabel(file.category)}
                  </span>
                </div>
                <p className="text-sm text-white">{file.title}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">{file.originalFileName}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {modalFile ? <WorkspaceFilePreviewModal file={modalFile} onClose={() => setModalFile(null)} /> : null}
    </div>
  );
}

function getWorkspaceTaskVisibleFiles(
  task: WorkspaceSourceTask,
  projectFiles: WorkspaceSourceFile[],
  project?: WorkspaceProjectSummary,
): WorkspaceSourceFile[] {
  const matchedFiles = projectFiles.filter((file) => isWorkspaceFileLinkedToTask(file, task, project));
  const referenceFile = task.referenceProjectFile;
  if (!referenceFile || referenceFile.visibility !== "CLIENT_VISIBLE") {
    return matchedFiles;
  }

  const projectFile = projectFiles.find((file) => file.id === referenceFile.id);
  const normalizedReferenceFile: WorkspaceSourceFile =
    projectFile ?? {
      id: referenceFile.id,
      title: referenceFile.title,
      category: referenceFile.category ?? "GENEL",
      visibility: referenceFile.visibility,
      originalFileName: referenceFile.originalFileName ?? referenceFile.title,
      secureUrl: referenceFile.secureUrl,
      mimeType: referenceFile.mimeType ?? null,
      createdAt: referenceFile.createdAt ?? "",
      folder: referenceFile.folder ?? null,
    };

  const merged = new Map<string, WorkspaceSourceFile>();
  for (const file of [normalizedReferenceFile, ...matchedFiles]) {
    merged.set(file.id, file);
  }

  return Array.from(merged.values());
}

function isWorkspaceFileLinkedToTask(
  file: WorkspaceSourceFile,
  task: WorkspaceSourceTask,
  project?: WorkspaceProjectSummary,
): boolean {
  if (file.visibility !== "CLIENT_VISIBLE") {
    return false;
  }

  const folderName = normalizeFolderMatchValue(file.folder?.name);
  if (!folderName) {
    return false;
  }

  const candidates = buildWorkspaceTaskFolderCandidates(task, project).map(normalizeFolderMatchValue);
  return candidates.some((candidate) => candidate && (folderName === candidate || folderName.endsWith(`/${candidate}`)));
}

function buildWorkspaceTaskFolderCandidates(
  task: WorkspaceSourceTask,
  project?: WorkspaceProjectSummary,
): string[] {
  const code = task.code?.trim() || task.id.slice(0, 8);
  const title = normalizeFolderSegment(task.title);
  const taskFolderName = `DESIGN-${code} - ${title}`.slice(0, 120);
  const projectLabel = normalizeFolderSegment(project?.name ?? project?.slug ?? project?.id ?? "");
  const projectFolderName = projectLabel ? `PROJECT-${projectLabel}`.slice(0, 80) : "";

  return projectFolderName ? [`${projectFolderName}/${taskFolderName}`.slice(0, 180), taskFolderName] : [taskFolderName];
}

function normalizeFolderSegment(value: string): string {
  const normalized = value.replace(/[\\/]+/g, "-").replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : "Untitled";
}

function normalizeFolderMatchValue(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function WorkspaceFilePreview({
  file,
  className,
}: {
  file: WorkspaceSourceFile;
  className?: string;
}) {
  const previewKind = getWorkspaceFilePreviewKind(file);
  const wrapperClass = `flex w-full items-center justify-center bg-black/30 ${className ?? "h-96"}`;

  if (previewKind === "image") {
    return (
      <div className={wrapperClass}>
        <img src={file.secureUrl} alt={file.title} className="h-full w-full object-contain" loading="lazy" />
      </div>
    );
  }

  if (previewKind === "pdf") {
    return (
      <iframe
        title={`${file.title} önizleme`}
        src={file.secureUrl}
        className={`${className ?? "h-96"} w-full border-0 bg-[#101010]`}
      />
    );
  }

  return (
    <div className={`${wrapperClass} flex-col gap-3 p-6 text-center`}>
      <FileText className="h-10 w-10 text-[#AAFF01]" />
      <div>
        <p className="text-sm text-white">Önizleme desteklenmiyor</p>
        <p className="mt-1 text-xs text-[#A0A0A0]">{file.originalFileName}</p>
      </div>
    </div>
  );
}

function WorkspaceFilePreviewModal({
  file,
  onClose,
}: {
  file: WorkspaceSourceFile;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#151515] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-white">{file.title}</p>
            <p className="mt-1 truncate text-xs text-[#A0A0A0]">{file.originalFileName}</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-white transition hover:border-[#AAFF01]/60 hover:text-[#AAFF01]"
            onClick={onClose}
            aria-label="Önizlemeyi kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <WorkspaceFilePreview file={file} className="h-[78vh]" />
      </div>
    </div>
  );
}

function getWorkspaceFilePreviewKind(file: WorkspaceSourceFile): "image" | "pdf" | "unknown" {
  const mimeType = file.mimeType?.toLowerCase() ?? "";
  const fileName = file.originalFileName.toLowerCase();

  if (mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/.test(fileName)) {
    return "image";
  }

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    return "pdf";
  }

  return "unknown";
}

function SprintStatusSourcePanel({
  tasks,
  sprints,
}: {
  tasks: WorkspaceSourceTask[];
  sprints: WorkspaceSourceSprint[];
}) {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(sprints[0]?.id ?? null);
  const tasksBySprint = useMemo(() => {
    const bucket = new Map<string, WorkspaceSourceTask[]>();
    for (const task of tasks) {
      const key = task.sprint?.id ?? task.sprintId ?? "UNASSIGNED";
      const list = bucket.get(key) ?? [];
      list.push(task);
      bucket.set(key, list);
    }
    return bucket;
  }, [tasks]);
  const selectedSprint = sprints.find((sprint) => sprint.id === selectedSprintId) ?? sprints[0] ?? null;
  const selectedSprintTasks = selectedSprint ? tasksBySprint.get(selectedSprint.id) ?? [] : [];
  const selectedStats = getSprintTaskStats(selectedSprintTasks);
  const totalStats = getSprintTaskStats(tasks);

  useEffect(() => {
    if (sprints.length === 0) {
      setSelectedSprintId(null);
      return;
    }

    if (!selectedSprintId || !sprints.some((sprint) => sprint.id === selectedSprintId)) {
      setSelectedSprintId(sprints[0].id);
    }
  }, [selectedSprintId, sprints]);

  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Sprint Durumu</h2>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricPill label="Toplam Görev" value={String(totalStats.total)} />
        <MetricPill label="Tamamlanan" value={String(totalStats.done)} />
        <MetricPill label="Devam Eden" value={String(totalStats.inProgress)} />
        <MetricPill label="Bloklanan" value={String(totalStats.blocked)} />
      </div>
      {sprints.length > 0 ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sprints.map((sprint) => {
              const sprintTasks = tasksBySprint.get(sprint.id) ?? [];
              const stats = getSprintTaskStats(sprintTasks);
              const isSelected = selectedSprint?.id === sprint.id;

              return (
                <button
                  key={sprint.id}
                  type="button"
                  className={`rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[#AAFF01]/60 bg-[#AAFF01]/10"
                      : "border-white/[0.08] bg-[#202020] hover:border-[#AAFF01]/30"
                  }`}
                  onClick={() => setSelectedSprintId(sprint.id)}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm text-white">{sprint.name}</p>
                    <span className={`rounded border px-2 py-1 text-[11px] ${getSprintStatusTone(sprint.status)}`}>
                      {getWorkspaceSprintStatusLabel(sprint.status)}
                    </span>
                  </div>
                  {sprint.goal ? <p className="mb-2 text-xs text-[#d7d7d7]">Hedef: {sprint.goal}</p> : null}
                  <p className="text-xs text-[#A0A0A0]">
                    {new Date(sprint.startDate).toLocaleDateString("tr-TR")} - {new Date(sprint.endDate).toLocaleDateString("tr-TR")}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#121212]">
                    <div className="h-full rounded-full bg-[#AAFF01]" style={{ width: `${stats.percent}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A0A0A0]">
                    <span>{stats.total} görev</span>
                    <span className="text-[#AAFF01]">%{stats.percent} tamamlandı</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg text-white">{selectedSprint?.name ?? "Sprint seçilmedi"}</h3>
                <p className="mt-1 text-xs text-[#A0A0A0]">
                  Seçili sprint kontrol listesi tamamlanma oranı: %{selectedStats.percent}
                </p>
              </div>
              {selectedSprint ? (
                <span className={`rounded border px-2 py-1 text-xs ${getSprintStatusTone(selectedSprint.status)}`}>
                  {getWorkspaceSprintStatusLabel(selectedSprint.status)}
                </span>
              ) : null}
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#121212]">
              <div className="h-full rounded-full bg-[#AAFF01]" style={{ width: `${selectedStats.percent}%` }} />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricPill label="Görev" value={String(selectedStats.total)} />
              <MetricPill label="Tamamlandı" value={String(selectedStats.done)} />
              <MetricPill label="Sürüyor" value={String(selectedStats.inProgress)} />
              <MetricPill label="Bloklandı" value={String(selectedStats.blocked)} />
            </div>
            {selectedSprintTasks.length > 0 ? (
              <div className="space-y-2">
                {selectedSprintTasks.map((task) => {
                  const taskProgress = getWorkspaceTaskChecklistProgress(task);

                  return (
                    <div key={task.id} className="rounded-lg border border-white/[0.08] bg-black/20 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-white">{task.title}</p>
                        <span className={`rounded border px-2 py-1 text-[11px] ${getTaskStatusTone(task.status)}`}>
                          {getWorkspaceTaskStatusLabel(task.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#A0A0A0]">
                        {task.code ? <span>Kod: {task.code}</span> : null}
                        <span>Öncelik: {getWorkspacePriorityLabel(task.priority)}</span>
                        {task.assignee?.displayName ? <span>Atanan: {task.assignee.displayName}</span> : null}
                        <span>
                          Kontrol listesi: {taskProgress.totalTodos > 0
                            ? `${taskProgress.completedTodos}/${taskProgress.totalTodos}`
                            : "Henüz yok"}
                        </span>
                        <span>İlerleme: %{taskProgress.percent}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#121212]">
                        <div className="h-full rounded-full bg-[#AAFF01]" style={{ width: `${taskProgress.percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#A0A0A0]">Bu sprint için görev bulunmuyor.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#A0A0A0]">Henüz sprint planı bulunmuyor.</p>
      )}
      {tasksBySprint.get("UNASSIGNED")?.length ? (
        <div className="mb-5 rounded-xl border border-[#FFA726]/20 bg-[#FFA726]/10 p-3 text-xs text-[#FFA726]">
          Sprint’e atanmamış görev: {tasksBySprint.get("UNASSIGNED")?.length}
        </div>
      ) : null}
    </div>
  );
}

function ReleaseSourcePanel({ releases }: { releases: WorkspaceSourceRelease[] }) {
  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">Yayın Planı</h2>
      {releases.length === 0 ? <p className="text-sm text-[#A0A0A0]">Henüz yayın planı bulunmuyor.</p> : null}
      <div className="space-y-3">
        {releases.slice(0, 10).map((release) => (
          <div key={release.id} className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded border border-[#7B61FF]/20 bg-[#7B61FF]/10 px-2 py-1 text-[11px] text-[#7B61FF]">
                {getWorkspaceEnvironmentLabel(release.environment)}
              </span>
              <span className={`rounded border px-2 py-1 text-[11px] ${getReleaseStatusTone(release.status)}`}>
                {getWorkspaceReleaseStatusLabel(release.status)}
              </span>
              {release.approvalStatus ? (
                <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-[11px] text-[#00D4FF]">
                  {getWorkspaceApprovalStatusLabel(release.approvalStatus)}
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
                  {formatWorkspaceFolderLabel(file.folder.name)}
                </span>
              ) : null}
              <span className="rounded border border-white/[0.16] px-2 py-1 text-[11px] text-[#CFCFCF]">
                {getWorkspaceFileCategoryLabel(file.category)}
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
        <span className="text-xs text-[#A0A0A0]">Web App iş akışı</span>
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
                {getWorkspaceRevisionStatusLabel(revision.status)}
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
    data: audiencesResponse,
    isLoading: isAudiencesLoading,
    isError: isAudiencesError,
  } = useGetOwnMetaAdsAudiencesQuery(undefined, {
    skip: !isConnected || tabId !== "audiences",
  });
  const {
    data: adCreativesResponse,
    isLoading: isAdCreativesLoading,
    isError: isAdCreativesError,
  } = useGetOwnMetaAdsAdCreativesQuery(undefined, {
    skip: !isConnected || tabId !== "creatives",
  });
  const {
    data: aiCommentary,
    isLoading: isAiCommentaryLoading,
  } = useGetOwnMetaAdsAiCommentaryQuery(undefined, {
    skip: !isConnected,
  });
  const {
    data: pixelStats,
    isLoading: isPixelStatsLoading,
  } = useGetOwnMetaAdsPixelStatsQuery(undefined, {
    skip: !isConnected || tabId !== "pixel-events",
  });
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

  const campaigns = [...(campaignsResponse?.data ?? [])].sort((a, b) => {
    if (a.effectiveStatus === "ACTIVE" && b.effectiveStatus !== "ACTIVE") return -1;
    if (a.effectiveStatus !== "ACTIVE" && b.effectiveStatus === "ACTIVE") return 1;
    return b.spend - a.spend;
  });
  const adSets = [...(adSetsResponse?.data ?? [])].sort((a, b) => b.spend - a.spend);
  const ads = [...(adsResponse?.data ?? [])].sort((a, b) => b.spend - a.spend);
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
      approvalRequired: true,
    },
    { skip: tabId !== "approvals" || !approvalProjectId },
  );
  const pendingApprovalCreativeFiles = useMemo(
    () =>
      mergePreviewFiles(
        approvalCreativeFilesResponse?.data ?? [],
        buildTaskReferencePreviewFiles(metaAdsApprovalTasks),
      ),
    [approvalCreativeFilesResponse?.data, metaAdsApprovalTasks],
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left: main content — 3 cols */}
        <div className="col-span-1 space-y-6 xl:col-span-3">
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
            <MetaAdsCreativesPanel
              creatives={adCreativesResponse?.data ?? []}
              adInsights={ads}
              loading={isAdCreativesLoading || isAdsLoading}
              isError={isAdCreativesError}
            />
          ) : null}

          {tabId === "audiences" ? (
            <MetaAdsAudiencePanel
              audiences={audiencesResponse?.data ?? []}
              loading={isAudiencesLoading}
              isError={isAudiencesError}
            />
          ) : null}

          {tabId === "pixel-events" ? (
            <MetaAdsPixelPanel data={pixelStatus} loading={isPixelLoading} isError={isPixelError} stats={pixelStats ?? null} statsLoading={isPixelStatsLoading} />
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

        {/* Right: AI Commentary + Agency Notes sidebar — 1 col */}
        <div className="col-span-1 space-y-4">
          <MetaAdsAiPanel loading={isAiCommentaryLoading || isCampaignsLoading} commentary={aiCommentary ?? null} tabId={tabId} />
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
            <h3 className="mb-3 text-sm font-medium text-white">Ajans Notları</h3>
            {isCampaignsLoading || isSummaryLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.08]" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.08]" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-xs text-[#A0A0A0]">Ajans notu için yeterli veri bulunamadı.</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note} className="rounded-xl border border-white/[0.08] bg-[#202020] p-3 text-xs text-[#d7d7d7]">
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
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
      approvalRequired: true,
    },
    { skip: tabId !== "ugc-scripts" || !tiktokApprovalProjectId },
  );
  const pendingTikTokApprovalCreativeFiles = useMemo(
    () =>
      mergePreviewFiles(
        tiktokApprovalCreativeFilesResponse?.data ?? [],
        buildTaskReferencePreviewFiles(tiktokApprovalTasks),
      ),
    [tiktokApprovalCreativeFilesResponse?.data, tiktokApprovalTasks],
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
      approvalRequired: true,
    },
    { skip: tabId !== "approvals" || !approvalProjectId },
  );
  const pendingApprovalCreativeFiles = useMemo(
    () =>
      mergePreviewFiles(
        approvalCreativeFilesResponse?.data ?? [],
        buildTaskReferencePreviewFiles(amazonApprovalTasks),
      ),
    [approvalCreativeFilesResponse?.data, amazonApprovalTasks],
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
              {index === 0 ? "En iyi hook" : "Test"}
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
          <p className="text-white">{row.entityName ?? "Kitle segmenti"}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MetricPill label="Erişim" value={formatTikTokInteger(row.reach)} />
            <MetricPill label="VTR" value={formatTikTokPercent(row.vtr)} />
            <MetricPill label="Dönüşüm" value={formatTikTokInteger(row.conversions)} />
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
          <p className="text-[#A0A0A0]">Reklamveren ID: <span className="text-white">{advertiserId ?? "—"}</span></p>
          <p className="text-[#A0A0A0]">
            Event Sinyali:{" "}
            <span className={hasConversionSignal ? "text-[#AAFF01]" : "text-[#FFA726]"}>
              {hasConversionSignal ? "Dönüşüm sinyali var" : "Dönüşüm sinyali bekleniyor"}
            </span>
          </p>
          <p className="text-[#A0A0A0]">
            Dönüşüm Oranı: <span className="text-white">{formatTikTokPercent(summary?.conversionRate ?? 0)}</span>
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
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
              {formatMetaCampaignName(campaign.name)}
            </h3>
            <span className="flex-shrink-0 whitespace-nowrap rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-2 py-0.5 text-xs text-[#AAFF01]">
              {formatMetaObjective(campaign.objective)}
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
  audiences,
  loading,
  isError,
}: {
  audiences: MetaAdsAdSetAudience[];
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
        description="Meta API bağlantısı kontrol ediliyor."
        tone="error"
      />
    );
  }

  if (audiences.length === 0) {
    return <MetaAdsStatePanel title="Kitle segment verisi bulunamadı." tone="muted" />;
  }

  return (
    <div className="space-y-4">
      {audiences.map((audience) => {
        const hasTargeting =
          audience.interests.length > 0 ||
          audience.customAudiences.length > 0 ||
          audience.lookalikeAudiences.length > 0;
        const isActive = audience.effectiveStatus === "ACTIVE" || audience.status === "ACTIVE";

        return (
          <div key={audience.adSetId} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] overflow-hidden">
            <div className="flex min-w-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
              <span className="min-w-0 truncate font-medium text-white">
                {audience.adSetName ?? audience.adSetId}
              </span>
              <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isActive ? "bg-[#AAFF01]/20 text-[#AAFF01]" : "bg-white/[0.08] text-[#A0A0A0]"
              }`}>
                {audience.effectiveStatus ?? audience.status ?? "—"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
              {/* Demographics */}
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide text-[#606060]">Demografik</p>
                <div className="space-y-1.5 text-sm text-[#D8D8D8]">
                  {(audience.ageMin != null || audience.ageMax != null) ? (
                    <p>Yaş: <span className="text-white">{audience.ageMin ?? "—"} – {audience.ageMax ?? "—"}</span></p>
                  ) : (
                    <p className="text-[#505050]">Tüm yaşlar</p>
                  )}
                  {audience.genders.length > 0 ? (
                    <p>Cinsiyet: <span className="text-white">{audience.genders.join(", ")}</span></p>
                  ) : (
                    <p className="text-[#505050]">Tüm cinsiyetler</p>
                  )}
                  {audience.countries.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {audience.countries.map((c) => (
                        <span key={c} className="rounded bg-white/[0.08] px-1.5 py-0.5 text-xs text-[#A0A0A0]">{c}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#505050]">Tüm konumlar</p>
                  )}
                </div>
              </div>

              {/* Custom & Lookalike */}
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide text-[#606060]">Özel Kitleler</p>
                {audience.customAudiences.length === 0 && audience.lookalikeAudiences.length === 0 ? (
                  <p className="text-xs text-[#505050]">Özel kitle tanımı yok</p>
                ) : (
                  <div className="space-y-1">
                    {audience.customAudiences.slice(0, 3).map((ca, i) => (
                      <p key={i} className="truncate text-xs text-[#A0A0A0]">
                        <span className="mr-1 text-blue-400">●</span>{ca}
                      </p>
                    ))}
                    {audience.lookalikeAudiences.slice(0, 2).map((la, i) => (
                      <p key={i} className="truncate text-xs text-[#A0A0A0]">
                        <span className="mr-1 text-purple-400">◆</span>{la}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide text-[#606060]">İlgi Alanları</p>
                {audience.interests.length === 0 ? (
                  <p className="text-xs text-[#505050]">{hasTargeting ? "" : "İlgi alanı hedeflemesi yok"}</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {audience.interests.slice(0, 6).map((interest, i) => (
                      <span key={i} className="rounded-full bg-[#AAFF01]/10 px-2 py-0.5 text-[10px] text-[#AAFF01]">
                        {interest}
                      </span>
                    ))}
                    {audience.interests.length > 6 ? (
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#606060]">
                        +{audience.interests.length - 6}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetaAdsCreativesPanel({
  creatives,
  adInsights,
  loading,
  isError,
}: {
  creatives: MetaAdsAdCreative[];
  adInsights: MetaAdsInsightItem[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Kreatif verileri alınamadı"
        description="Meta API erişimi kontrol ediliyor."
        tone="error"
      />
    );
  }

  if (creatives.length === 0) {
    return <MetaAdsStatePanel title="Kreatif verisi bulunamadı." tone="muted" />;
  }

  const insightsByAdId = new Map<string, MetaAdsInsightItem>();
  for (const insight of adInsights) {
    if (insight.entityId && !insightsByAdId.has(insight.entityId)) {
      insightsByAdId.set(insight.entityId, insight);
    }
  }

  const enriched = creatives.map((c) => ({ creative: c, insight: insightsByAdId.get(c.adId) ?? null }));
  const ranked = [...enriched].sort((a, b) => (b.insight?.ctr ?? 0) - (a.insight?.ctr ?? 0));
  const ctrs = ranked.map((r) => r.insight?.ctr ?? 0).filter((c) => c > 0);
  const avgCtr = ctrs.length > 0 ? ctrs.reduce((a, b) => a + b, 0) / ctrs.length : 0;
  const topCtr = ranked[0]?.insight?.ctr ?? 0;
  const hasWinner = topCtr > 0 && avgCtr > 0 && topCtr >= avgCtr * 1.5;

  return (
    <div className="space-y-5">
      {/* Comparison panel */}
      {ranked.length > 1 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="font-semibold text-white">Kreatif Karşılaştırması</h3>
            {hasWinner ? (
              <span className="rounded-full bg-[#AAFF01]/20 px-2 py-0.5 text-xs text-[#AAFF01]">Kazanan var</span>
            ) : avgCtr > 0 ? (
              <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs text-yellow-300">Test devam ediyor</span>
            ) : null}
          </div>
          <div className="space-y-2.5">
            {ranked.slice(0, 6).map(({ creative, insight }, idx) => {
              const ctr = insight?.ctr ?? 0;
              const maxCtr = ranked[0]?.insight?.ctr ?? 1;
              const barPct = maxCtr > 0 ? (ctr / maxCtr) * 100 : 0;
              const isTop = idx === 0 && hasWinner;
              return (
                <div key={creative.adId} className="flex min-w-0 items-center gap-3">
                  <span className={`w-5 shrink-0 text-center text-xs font-bold ${isTop ? "text-yellow-400" : "text-[#505050]"}`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-xs text-[#D8D8D8]">
                        {creative.adName ?? creative.adId}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-white">
                        {ctr > 0 ? `${ctr.toFixed(2)}%` : "—"}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className={`h-full rounded-full transition-all ${isTop ? "bg-[#AAFF01]" : "bg-white/30"}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                  {insight ? (
                    <span className="w-16 shrink-0 text-right text-[10px] text-[#606060]">
                      {formatMetaCurrency(insight.spend)}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          {avgCtr > 0 ? (
            <p className="mt-3 text-[10px] text-[#505050]">
              {hasWinner
                ? `En iyi kreatif ortalamadan ${((topCtr / avgCtr - 1) * 100).toFixed(0)}% daha yüksek CTR üretiyor.`
                : `Ort. CTR: ${avgCtr.toFixed(2)}% · Kazanan belirlemek için daha fazla veri bekleniyor.`}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Creative grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map(({ creative, insight }, idx) => (
          <MetaAdsCreativeCard
            key={creative.adId}
            creative={creative}
            insight={insight}
            rank={idx + 1}
            isWinner={idx === 0 && hasWinner}
          />
        ))}
      </div>
    </div>
  );
}

function MetaAdsCreativeCard({
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
  const [imgError, setImgError] = React.useState(false);
  const isActive = creative.effectiveStatus === "ACTIVE";

  return (
    <div className={`overflow-hidden rounded-2xl border bg-[#1A1A1A] ${
      isWinner ? "border-[#AAFF01]/40" : isActive ? "border-white/[0.08]" : "border-white/[0.04] opacity-60"
    }`}>
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#222]">
        {creative.thumbnailUrl && !imgError ? (
          <img
            src={creative.thumbnailUrl}
            alt={creative.adName ?? "Creative"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#303030]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <div className="absolute left-2 top-2">
          {isWinner ? (
            <span className="rounded-full bg-[#AAFF01]/90 px-2 py-0.5 text-[10px] font-semibold text-[#131313]">
              🏆 Kazanan
            </span>
          ) : (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isActive ? "bg-[#AAFF01]/20 text-[#AAFF01]" : "bg-white/10 text-[#A0A0A0]"
            }`}>
              #{rank}
            </span>
          )}
        </div>
        {insight?.ctr ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            CTR {insight.ctr.toFixed(2)}%
          </span>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="truncate text-sm font-medium text-white">{creative.adName ?? "—"}</p>
        {creative.title ? <p className="mt-0.5 truncate text-xs text-[#A0A0A0]">{creative.title}</p> : null}
        {creative.body ? <p className="mt-1 line-clamp-2 text-xs text-[#606060]">{creative.body}</p> : null}

        {insight ? (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
            <div className="text-center">
              <p className="text-xs font-medium text-white">{formatMetaCurrency(insight.spend)}</p>
              <p className="text-[10px] text-[#606060]">Harcama</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#AAFF01]">{insight.ctr.toFixed(2)}%</p>
              <p className="text-[10px] text-[#606060]">CTR</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-white">{formatMetaInteger(insight.results)}</p>
              <p className="text-[10px] text-[#606060]">Sonuç</p>
            </div>
          </div>
        ) : null}

        {creative.callToActionType ? (
          <span className="mt-2 inline-block rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#A0A0A0]">
            {creative.callToActionType.replace(/_/g, " ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function PixelHealthScore({ score, level }: { score: number; level: "good" | "warning" | "critical" }) {
  const color = level === "good" ? "#AAFF01" : level === "warning" ? "#FFA726" : "#ff8e8e";
  const label = level === "good" ? "Sağlıklı" : level === "warning" ? "Dikkat" : "Kritik";
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
      </div>
      <div>
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${color}20`, color }}>{label}</span>
        <p className="mt-1.5 text-xs text-[#A0A0A0]">Pixel Sağlık Skoru</p>
      </div>
    </div>
  );
}

function PixelChecklistRow({ item }: { item: MetaAdsPixelChecklistItem }) {
  const icon = item.status === "ok"
    ? <CheckCircle className="h-4 w-4 text-[#AAFF01]" />
    : item.status === "warning"
    ? <AlertTriangle className="h-4 w-4 text-[#FFA726]" />
    : <XCircle className="h-4 w-4 text-[#ff8e8e]" />;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{item.label}</p>
        {item.detail && <p className="mt-0.5 text-xs text-[#A0A0A0]">{item.detail}</p>}
      </div>
    </div>
  );
}

function MetaAdsPixelPanel({
  data,
  loading,
  isError,
  stats,
  statsLoading,
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
  stats: MetaAdsPixelStatsResponse | null;
  statsLoading: boolean;
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

  const maxEventCount = stats ? Math.max(...stats.events.map((e) => e.count), 1) : 1;

  return (
    <div className="space-y-4">
      {/* Health score header */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
        {statsLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="space-y-2">
              <div className="h-6 w-24 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </div>
        ) : stats ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PixelHealthScore score={stats.healthScore} level={stats.healthLevel} />
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#606060]">Pixel ID</p>
                <p className="font-mono text-white">{stats.pixelId ?? data.pixelId ?? "—"}</p>
              </div>
              {stats.pixelName && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#606060]">Pixel Adı</p>
                  <p className="text-white">{stats.pixelName}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#606060]">Son Ateşleme</p>
                <p className="text-white">{stats.lastFiredAt ? new Date(stats.lastFiredAt).toLocaleString("tr-TR") : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#606060]">Ad Account</p>
                <p className="font-mono text-[#A0A0A0]">{data.adAccountId ?? "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 text-sm">
            <div><p className="text-[10px] uppercase tracking-wider text-[#606060]">Pixel ID</p><p className="font-mono text-white">{data.pixelId ?? "—"}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-[#606060]">Ad Account</p><p className="font-mono text-[#A0A0A0]">{data.adAccountId ?? "—"}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-[#606060]">Event Durumu</p><p className="text-white">{data.eventStatus}</p></div>
          </div>
        )}
      </div>

      {/* Checklist + Events grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Setup Checklist */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
          <h3 className="mb-1 text-sm font-semibold text-white">Kurulum Kontrol Listesi</h3>
          {statsLoading ? (
            <div className="mt-3 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-white/[0.08]" />
                  <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ) : stats && stats.checklist.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {stats.checklist.map((item) => (
                <PixelChecklistRow key={item.key} item={item} />
              ))}
            </div>
          ) : (
            <>
              {data.setupWarning && <p className="mt-2 text-sm text-[#FFA726]">{data.setupWarning}</p>}
              {data.syncError && <p className="mt-2 text-sm text-[#ff8e8e]">{data.syncError}</p>}
              {!data.setupWarning && !data.syncError && (
                <p className="mt-2 text-sm text-[#AAFF01]">Konfigürasyon ve event akışı sağlıklı görünüyor.</p>
              )}
            </>
          )}
        </div>

        {/* Event Breakdown */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
          <h3 className="mb-1 text-sm font-semibold text-white">Son 7 Gün — Event Dağılımı</h3>
          {statsLoading ? (
            <div className="mt-3 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-28 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-2 animate-pulse rounded bg-white/[0.04]" style={{ width: `${60 - i * 10}%` }} />
                </div>
              ))}
            </div>
          ) : stats && stats.events.length > 0 ? (
            <div className="mt-3 space-y-3">
              {stats.events.map((ev) => (
                <div key={ev.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#d7d7d7]">{ev.name}</span>
                    <span className="tabular-nums text-[#A0A0A0]">{ev.count.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <div
                      className="h-1.5 rounded-full bg-[#AAFF01]"
                      style={{ width: `${(ev.count / maxEventCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#A0A0A0]">
              {data.eventStatus === "NOT_CONFIGURED" ? "Pixel ID tanımlı değil, event verisi alınamıyor." : "Son 7 günde event verisi bulunamadı."}
            </p>
          )}
        </div>
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

const AI_TAB_SECTION: Record<string, { label: string; key: keyof MetaAdsAiCommentary }> = {
  campaigns: { label: "Kampanya Yorumu", key: "campaignHighlights" },
  audiences: { label: "Kitle Yorumu", key: "audienceInsights" },
  creatives: { label: "Kreatif Yorumu", key: "creativeInsights" },
};

function MetaAdsAiPanel({ loading, commentary, tabId }: { loading: boolean; commentary: MetaAdsAiCommentary | null; tabId: string }) {
  const section = AI_TAB_SECTION[tabId];

  return (
    <div className="rounded-2xl border border-[#AAFF01]/20 bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#AAFF01]" />
        <h3 className="text-sm font-medium text-white">SocialTechAgent Yorumu</h3>
        {commentary?.isHeuristic && (
          <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#A0A0A0]">Heuristik</span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/[0.08]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-3 w-full animate-pulse rounded bg-white/[0.08]" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.08]" />
        </div>
      ) : commentary ? (
        <div className="space-y-4 text-sm">
          {section ? (
            /* Tab-specific section */
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#AAFF01]/70">{section.label}</p>
              <p className="leading-relaxed text-[#d7d7d7]">{String(commentary[section.key])}</p>
            </div>
          ) : (
            /* Genel Bakış / other tabs → genel analiz + öneriler */
            <p className="leading-relaxed text-[#d7d7d7]">{commentary.generalAnalysis}</p>
          )}
          {commentary.recommendations.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#AAFF01]/70">Öneriler</p>
              <ul className="space-y-1.5">
                {commentary.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#A0A0A0]">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#AAFF01]" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#A0A0A0]">Analiz için yeterli veri bekleniyor.</p>
      )}
    </div>
  );
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
              ariaLabel={`${task.title} için onayla`}
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
              ariaLabel={`${task.title} için revizyon iste`}
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

function formatMetaCampaignName(name: string): string {
  return name.replace(/_/g, " ");
}

const META_OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_TRAFFIC: "Trafik",
  OUTCOME_ENGAGEMENT: "Etkileşim",
  OUTCOME_AWARENESS: "Farkındalık",
  OUTCOME_LEADS: "Lead",
  OUTCOME_SALES: "Satış",
  OUTCOME_APP_PROMOTION: "Uygulama",
  LINK_CLICKS: "Link Tıklamaları",
  POST_ENGAGEMENT: "Gönderi Etkileşimi",
  REACH: "Erişim",
  BRAND_AWARENESS: "Marka Bilinirliği",
  VIDEO_VIEWS: "Video Görüntüleme",
  CONVERSIONS: "Dönüşüm",
  APP_INSTALLS: "Uygulama Yükleme",
  LEAD_GENERATION: "Lead Üretimi",
  MESSAGES: "Mesajlar",
  CATALOG_SALES: "Katalog Satışı",
  STORE_VISITS: "Mağaza Ziyareti",
};

function formatMetaObjective(objective: string): string {
  return META_OBJECTIVE_LABELS[objective] ?? objective.replace(/^OUTCOME_/, "").replace(/_/g, " ");
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

function buildTaskReferencePreviewFiles(tasks: ClientTask[]): ProjectFile[] {
  const seen = new Set<string>();
  const result: ProjectFile[] = [];

  for (const task of tasks) {
    const referenceFile = task.referenceProjectFile;
    if (!referenceFile || seen.has(referenceFile.id)) {
      continue;
    }
    seen.add(referenceFile.id);
    result.push({
      id: referenceFile.id,
      projectId: task.projectId ?? "",
      category: referenceFile.category,
      visibility: referenceFile.visibility,
      title: referenceFile.title,
      secureUrl: referenceFile.secureUrl,
      originalFileName: referenceFile.title,
      bytes: 0,
      mimeType: referenceFile.mimeType,
      approvalRequired: referenceFile.approvalRequired,
      approvalStatus: referenceFile.approvalStatus,
      createdAt: task.updatedAt ?? task.approvalRequestedAt ?? new Date().toISOString(),
    });
  }

  return result;
}

type SocialMediaApprovalFolderGroup = {
  key: string;
  folderId: string | null;
  folderName: string;
  posts: SocialMediaPost[];
  pendingTasks: ClientTask[];
  historyTasks: ClientTask[];
  updatedAt: string;
};

function buildSocialMediaApprovalFolders(
  posts: SocialMediaPost[],
  pendingTasks: ClientTask[],
  historyTasks: ClientTask[],
): SocialMediaApprovalFolderGroup[] {
  const pendingTaskById = new Map(pendingTasks.map((task) => [task.id, task]));
  const historyTaskById = new Map(historyTasks.map((task) => [task.id, task]));
  const folderMap = new Map<
    string,
    {
      key: string;
      folderId: string | null;
      folderName: string;
      posts: SocialMediaPost[];
      pendingTaskIds: Set<string>;
      historyTaskIds: Set<string>;
      updatedAt: string;
    }
  >();

  for (const post of posts) {
    const primaryFolder = getSocialMediaPostPrimaryFolder(post);
    const key = primaryFolder.id ? `folder:${primaryFolder.id}` : `post:${post.id}`;
    const group = folderMap.get(key);

    if (group) {
      group.posts.push(post);
      if (new Date(post.updatedAt).getTime() > new Date(group.updatedAt).getTime()) {
        group.updatedAt = post.updatedAt;
      }
      if (post.approvalTaskId && pendingTaskById.has(post.approvalTaskId)) {
        group.pendingTaskIds.add(post.approvalTaskId);
      }
      if (post.approvalTaskId && historyTaskById.has(post.approvalTaskId)) {
        group.historyTaskIds.add(post.approvalTaskId);
      }
      continue;
    }

    folderMap.set(key, {
      key,
      folderId: primaryFolder.id,
      folderName: primaryFolder.name,
      posts: [post],
      pendingTaskIds:
        post.approvalTaskId && pendingTaskById.has(post.approvalTaskId)
          ? new Set([post.approvalTaskId])
          : new Set(),
      historyTaskIds:
        post.approvalTaskId && historyTaskById.has(post.approvalTaskId)
          ? new Set([post.approvalTaskId])
          : new Set(),
      updatedAt: post.updatedAt,
    });
  }

  const linkedTaskIds = new Set<string>();
  for (const group of folderMap.values()) {
    for (const taskId of group.pendingTaskIds) {
      linkedTaskIds.add(taskId);
    }
    for (const taskId of group.historyTaskIds) {
      linkedTaskIds.add(taskId);
    }
  }

  const orphanPendingTasks = pendingTasks.filter((task) => !linkedTaskIds.has(task.id));
  const orphanHistoryTasks = historyTasks.filter((task) => !linkedTaskIds.has(task.id));

  if (orphanPendingTasks.length > 0 || orphanHistoryTasks.length > 0) {
    folderMap.set("orphan-tasks", {
      key: "orphan-tasks",
      folderId: null,
      folderName: "Bağlı Klasör Bulunamadı",
      posts: [],
      pendingTaskIds: new Set(orphanPendingTasks.map((task) => task.id)),
      historyTaskIds: new Set(orphanHistoryTasks.map((task) => task.id)),
      updatedAt:
        orphanPendingTasks[0]?.updatedAt ??
        orphanHistoryTasks[0]?.updatedAt ??
        new Date().toISOString(),
    });
  }

  const groups = Array.from(folderMap.values()).map<SocialMediaApprovalFolderGroup>((group) => ({
    key: group.key,
    folderId: group.folderId,
    folderName: group.folderName,
    posts: group.posts.sort((a, b) => compareIsoDateDesc(a.updatedAt, b.updatedAt)),
    pendingTasks: Array.from(group.pendingTaskIds)
      .map((taskId) => pendingTaskById.get(taskId))
      .filter((task): task is ClientTask => Boolean(task))
      .sort((a, b) => compareIsoDateDesc(a.updatedAt, b.updatedAt)),
    historyTasks: Array.from(group.historyTaskIds)
      .map((taskId) => historyTaskById.get(taskId))
      .filter((task): task is ClientTask => Boolean(task))
      .sort((a, b) => compareIsoDateDesc(a.updatedAt, b.updatedAt)),
    updatedAt: group.updatedAt,
  }));

  return groups.sort((a, b) => {
    if (a.pendingTasks.length > 0 && b.pendingTasks.length === 0) {
      return -1;
    }
    if (a.pendingTasks.length === 0 && b.pendingTasks.length > 0) {
      return 1;
    }
    return compareIsoDateDesc(a.updatedAt, b.updatedAt);
  });
}

function getSocialMediaPostPrimaryFolder(post: SocialMediaPost): { id: string | null; name: string } {
  for (const asset of post.assets) {
    const folder = asset.file?.folder;
    if (folder?.id) {
      return { id: folder.id, name: folder.name || "Onay Klasörü" };
    }
  }

  return {
    id: null,
    name: "Klasör Atanmamış İçerikler",
  };
}

function compareIsoDateDesc(a: string | null | undefined, b: string | null | undefined): number {
  const aValue = a ? new Date(a).getTime() : 0;
  const bValue = b ? new Date(b).getTime() : 0;
  return bValue - aValue;
}

function mergePreviewFiles(primary: ProjectFile[], secondary: ProjectFile[]): ProjectFile[] {
  const merged = new Map<string, ProjectFile>();

  for (const file of [...primary, ...secondary]) {
    if (merged.has(file.id)) {
      continue;
    }
    merged.set(file.id, file);
  }

  return Array.from(merged.values());
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
    TODO: 'Yapılacak',
    IN_PROGRESS: 'Devam ediyor',
    REVIEW: 'İncelemede',
    DONE: 'Tamamlandı',
    BLOCKED: 'Bloklandı',
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
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
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
    FEATURE: 'Özellik',
    BUG: 'Hata',
    REVISION: 'Revizyon',
    QA: 'Kalite kontrol',
    DEPLOYMENT: 'Yayın',
    MAINTENANCE: 'Bakım',
  };
  return labels[type] ?? type;
}

function getClientTaskWorkstreamLabel(workstream: ClientTaskWorkstream): string {
  const labels: Record<ClientTaskWorkstream, string> = {
    FRONTEND: 'Arayüz',
    BACKEND: 'Backend / API',
    FULLSTACK: 'Tam kapsam',
    QA: 'Kalite kontrol',
    DEVOPS: 'Yayın altyapısı',
    UI_INTEGRATION: 'UI entegrasyonu',
  };
  return labels[workstream] ?? workstream;
}

function getServiceLabel(serviceId: string): string {
  return serviceId.replace(/-/g, ' ').toUpperCase();
}

function getWorkspaceRevisionStatusLabel(status: WorkspaceRevisionStatus): string {
  const labels: Record<WorkspaceRevisionStatus, string> = {
    REQUESTED: "Talep edildi",
    ACKNOWLEDGED: "Alındı",
    IN_PROGRESS: "Üzerinde çalışılıyor",
    READY_FOR_REVIEW: "İncelemeye hazır",
    APPROVED: "Onaylandı",
    REJECTED: "Revizyon istendi",
    CANCELLED: "İptal edildi",
  };
  return labels[status] ?? status;
}

function getRevisionStatusTone(status: WorkspaceRevisionStatus): string {
  if (status === "APPROVED") return statusTone.good;
  if (status === "READY_FOR_REVIEW") return statusTone.info;
  if (status === "REJECTED" || status === "CANCELLED") return statusTone.danger;
  if (status === "IN_PROGRESS") return statusTone.violet;
  return statusTone.warn;
}

function getWebAppTabLabel(tabId: string): string {
  const LABELS: Record<string, string> = {
    "overview": "Genel Bakış",
    "project-roadmap": "Proje Yol Haritası",
    "sprint-status": "Sprint Durumu",
    "frontend": "Frontend Geliştirme",
    "backend-api": "Backend / API",
    "admin-panel": "Yönetim Paneli",
    "ui-ux": "UI/UX Tasarım",
    "test-deploy": "Test & Yayın",
    "delivery-files": "Teslim Dosyaları",
    "files": "Dosyalar",
    "messages": "Mesajlar",
    "soru-cevap": "Soru & Cevap",
    "revisions": "Revizyonlar",
    "revision-requests": "Revizyon Talepleri",
    "reports": "Raporlar",
    "meetings": "Toplantılar",
    "content": "İçerik",
    "design": "Tasarım",
    "copywriting": "Metin & Kopya",
  };
  if (LABELS[tabId]) return LABELS[tabId];
  // Fallback: humanize the tabId
  return tabId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

const WEB_MOBILE_DESIGN_TAB_KEYWORDS: Record<string, string[]> = {
  "ux-flow": ["ux", "flow", "akış", "journey", "entry", "conversion"],
  wireframe: ["wireframe", "taslak"],
  "ui-screens": ["ui", "screen", "ekran", "arayüz"],
  "design-system": ["design system", "component", "token", "style guide", "renk", "tipografi"],
  "responsive-design": ["responsive", "mobil", "tablet", "breakpoint"],
  prototype: ["prototype", "prototip", "figma"],
};

function filterWebMobileDesignTasksByTab(tabId: string, tasks: ClientTask[]): ClientTask[] {
  const keywords = WEB_MOBILE_DESIGN_TAB_KEYWORDS[tabId] ?? [];
  const visibleTasks = tasks.filter((task) => task.visibility === "CLIENT_VISIBLE" || task.approvalRequired);

  if (keywords.length === 0) {
    return visibleTasks;
  }

  const matched = visibleTasks.filter((task) => matchesDesignTaskKeywords(task, keywords));
  return matched.length > 0 ? matched : visibleTasks.filter((task) => task.workstream === "UI_INTEGRATION");
}

function filterWebMobileDesignFilesByTab(tabId: string, files: ProjectFile[]): ProjectFile[] {
  const keywords = WEB_MOBILE_DESIGN_TAB_KEYWORDS[tabId] ?? [];

  if (keywords.length === 0) {
    return files;
  }

  const matched = files.filter((file) => matchesDesignFileKeywords(file, keywords));
  return matched.length > 0 ? matched : files;
}

function matchesDesignTaskKeywords(task: ClientTask, keywords: string[]): boolean {
  const haystack = [
    task.title,
    task.description,
    task.campaignRef,
    task.adSetRef,
    task.adRef,
    task.type,
    task.workstream,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase("tr-TR")));
}

function matchesDesignFileKeywords(file: ProjectFile, keywords: string[]): boolean {
  const haystack = [file.title, file.description, file.originalFileName, file.category, file.mimeType]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase("tr-TR")));
}

function getWebMobileDesignTabTitle(tabId: string): string {
  const labels: Record<string, string> = {
    "ux-flow": "UX Akışı",
    wireframe: "Wireframe",
    "ui-screens": "UI Ekranları",
    "design-system": "Tasarım Sistemi",
    "responsive-design": "Responsive Tasarım",
    prototype: "Prototip",
  };

  return labels[tabId] ?? getWebAppTabLabel(tabId);
}

function getSprintTaskStats(tasks: WorkspaceSourceTask[]) {
  const blocked = tasks.filter((task) => task.status === "BLOCKED").length;
  const progressItems = tasks.map(getWorkspaceTaskChecklistProgress);
  const done = progressItems.filter((item, index) => item.percent >= 100 && tasks[index]?.status !== "BLOCKED").length;
  const inProgress = progressItems.filter(
    (item, index) => item.percent > 0 && item.percent < 100 && tasks[index]?.status !== "BLOCKED",
  ).length;
  const totalTodos = progressItems.reduce((sum, item) => sum + item.totalTodos, 0);
  const completedTodos = progressItems.reduce((sum, item) => sum + item.completedTodos, 0);
  const total = tasks.length;

  return {
    total,
    done,
    inProgress,
    blocked,
    completedTodos,
    totalTodos,
    percent: totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100),
  };
}

function getWorkspaceTaskChecklistProgress(task: WorkspaceSourceTask) {
  if (task.completion && Number.isFinite(task.completion.totalTodos)) {
    const totalTodos = Math.max(0, Math.round(task.completion.totalTodos));
    const completedTodos = Math.min(
      totalTodos,
      Math.max(0, Math.round(task.completion.completedTodos)),
    );

    return {
      totalTodos,
      completedTodos,
      percent: totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100),
    };
  }

  const todos = task.todos ?? [];
  if (todos.length > 0) {
    const completedTodos = todos.filter((todo) => todo.isCompleted).length;
    return {
      totalTodos: todos.length,
      completedTodos,
      percent: Math.round((completedTodos / todos.length) * 100),
    };
  }

  return {
    totalTodos: 0,
    completedTodos: 0,
    percent:
      typeof task.progressPercent === "number" && Number.isFinite(task.progressPercent)
        ? Math.min(100, Math.max(0, Math.round(task.progressPercent)))
        : 0,
  };
}

function getWorkspaceTaskStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    TODO: "Yapılacak",
    IN_PROGRESS: "Devam ediyor",
    REVIEW: "İncelemede",
    READY_FOR_REVIEW: "İncelemeye hazır",
    DONE: "Tamamlandı",
    BLOCKED: "Bloklandı",
  };
  return labels[status] ?? status;
}

function getWorkspaceSprintStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNED: "Planlandı",
    ACTIVE: "Aktif",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal edildi",
  };
  return labels[status] ?? status;
}

function getWorkspaceReleaseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNED: "Planlandı",
    READY: "Hazır",
    TESTING: "Test ediliyor",
    DEPLOYED: "Yayında",
    FAILED: "Başarısız",
    ROLLED_BACK: "Geri alındı",
    CANCELLED: "İptal edildi",
  };
  return labels[status] ?? status;
}

function getWorkspaceApprovalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Onay bekliyor",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
    CHANGES_REQUESTED: "Revizyon istendi",
  };
  return labels[status] ?? status;
}

function getWorkspacePriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
    URGENT: "Acil",
  };
  return labels[priority] ?? priority;
}

function getWorkspaceTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FEATURE: "Özellik",
    BUG: "Hata",
    REVISION: "Revizyon",
    QA: "Kalite kontrol",
    DEPLOYMENT: "Yayın",
    MAINTENANCE: "Bakım",
  };
  return labels[type] ?? type;
}

function getWorkspaceTaskWorkstreamLabel(workstream: string): string {
  const labels: Record<string, string> = {
    FRONTEND: "Arayüz",
    BACKEND: "Backend / API",
    FULLSTACK: "Tam kapsam",
    QA: "Kalite kontrol",
    DEVOPS: "Yayın altyapısı",
    UI_INTEGRATION: "UI entegrasyonu",
  };
  return labels[workstream] ?? workstream;
}

function getWorkspaceTaskSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    LOW: "Düşük etki",
    MEDIUM: "Orta etki",
    HIGH: "Yüksek etki",
    CRITICAL: "Kritik",
  };
  return labels[severity] ?? severity;
}

function getWorkspaceEnvironmentLabel(environment: string): string {
  const labels: Record<string, string> = {
    DEVELOPMENT: "Geliştirme",
    STAGING: "Test ortamı",
    PRODUCTION: "Canlı ortam",
  };
  return labels[environment] ?? environment;
}

function getWorkspaceFileCategoryLabel(category: string | null | undefined): string {
  const labels: Record<string, string> = {
    BRAND_ASSET: "Marka dosyası",
    DESIGN: "Tasarım",
    REPORT: "Rapor",
    DELIVERABLE: "Teslim dosyası",
    DOCUMENT: "Doküman",
    CREATIVE: "Kreatif",
  };
  return category ? labels[category] ?? category : "Genel";
}

function formatWorkspaceFolderLabel(folderName: string): string {
  return folderName
    .replace(/^PROJECT-/i, "Proje: ")
    .replace(/\/DESIGN-/i, " / Tasarım görevi: ")
    .replace(/_/g, " ");
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
  if (['approvals', 'pending-approvals', 'content-approvals', 'copywriting', 'wireframe', 'revisions', 'ugc-scripts', 'ad-copies'].includes(tabId)) return 'approval';
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
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#AAFF01]/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-[#7B61FF]/[0.06] blur-3xl" />
      <div className="relative max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-1 text-xs font-medium text-[#AAFF01]">
            <Sparkles className="w-3 h-3" />
            {content.serviceName}
          </span>
          <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-xs text-[#A0A0A0]">
            {tabId}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{content.title}</h1>
        <p className="text-[#A0A0A0] leading-relaxed max-w-3xl">{content.description}</p>
      </div>
    </div>
  );
}

const KPI_ACCENTS = [
  { border: "border-l-[#00D4FF]", color: "#00D4FF", icon: BarChart3 },
  { border: "border-l-[#AAFF01]", color: "#AAFF01", icon: Target },
  { border: "border-l-[#7B61FF]", color: "#7B61FF", icon: Activity },
  { border: "border-l-[#FFA726]", color: "#FFA726", icon: CheckCircle },
];

function SmartKpis({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {content.kpis.map((kpi, index) => {
        const accent = KPI_ACCENTS[index % KPI_ACCENTS.length];
        const Icon = accent.icon;

        return (
          <div
            key={`${tabId}-${kpi.label}`}
            className={`${cardClass} border-l-4 ${accent.border} hover:border-[#AAFF01]/20 transition-all`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: accent.color }} />
              <span className="text-[#A0A0A0] text-sm">{kpi.label}</span>
            </div>
            <div className="text-3xl font-bold text-white mt-3 mb-1">{kpi.value}</div>
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
      return (
        <ApprovalWorkspace
          content={content}
          tabId={tabId}
          serviceId={serviceId}
          projectId={projectId}
        />
      );
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

function WebMobileDesignClientWorkspace({
  content,
  tabId,
  projectId,
  serviceId,
}: {
  content: ServiceTabContent;
  tabId: string;
  projectId?: string | null;
  serviceId: string;
}) {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetClientTasksQuery(projectId ? { projectId } : undefined, { skip: !projectId });
  const {
    data: filesResponse,
    isLoading: filesLoading,
    isError: filesError,
  } = useGetClientProjectFilesQuery({ projectId: projectId ?? "" }, { skip: !projectId });
  const files = filesResponse?.data ?? [];
  const { data: designSummary } = useGetOwnWebMobileDesignSummaryQuery();
  const designConfig = designSummary?.config ?? null;
  const [updateApproval, { isLoading: isUpdatingApproval }] = useUpdateClientTaskApprovalMutation();

  const tabTasks = useMemo(() => filterWebMobileDesignTasksByTab(tabId, tasks), [tabId, tasks]);
  const tabFiles = useMemo(() => filterWebMobileDesignFilesByTab(tabId, files), [tabId, files]);
  const isLoading = tasksLoading || filesLoading;
  const isError = tasksError || filesError;

  const allVisibleTasks = useMemo(
    () => tasks.filter((t) => t.visibility === "CLIENT_VISIBLE" || t.approvalRequired),
    [tasks],
  );

  const realKpis = useMemo(() => {
    const screenCount = Math.max(
      allVisibleTasks.filter((t) =>
        matchesDesignTaskKeywords(t, ["screen", "ekran", "ui", "wireframe", "responsive"]),
      ).length,
      files.filter((f) =>
        matchesDesignFileKeywords(f, ["screen", "ekran", "ui", "figma", "wireframe"]),
      ).length,
    );
    const progressPercent =
      allVisibleTasks.length > 0
        ? Math.round(
            allVisibleTasks.reduce((sum, t) => sum + t.progressPercent, 0) / allVisibleTasks.length,
          )
        : 0;
    const revisionCount = allVisibleTasks.filter(
      (t) => t.type === "REVISION" && t.status !== "DONE",
    ).length;
    const approvalTasks = allVisibleTasks.filter((t) => t.approvalRequired);
    const approvedCount = approvalTasks.filter(
      (t) => t.approvalStatus === "APPROVED" || t.approvalStatus === "ACKNOWLEDGED",
    ).length;
    return [
      {
        label: "Tasarlanan Ekran",
        value: projectId ? String(screenCount) : "-",
        note: projectId
          ? screenCount > 0
            ? "task ve dosyalardan"
            : "henüz görünür ekran yok"
          : "proje bekleniyor",
      },
      {
        label: "İlerleme",
        value: projectId ? `%${progressPercent}` : "-",
        note: projectId
          ? allVisibleTasks.length > 0
            ? "canlı task ilerlemesi"
            : "görev bekleniyor"
          : "proje bekleniyor",
      },
      {
        label: "Revizyon",
        value: projectId ? String(revisionCount) : "-",
        note: projectId
          ? revisionCount > 0
            ? "aktif revizyon"
            : "revizyon yok"
          : "proje bekleniyor",
      },
      {
        label: "Onay Durumu",
        value:
          projectId && approvalTasks.length > 0
            ? `${approvedCount}/${approvalTasks.length}`
            : designConfig?.designSystemStatus === "COMPLETED"
              ? "Tamamlandı"
              : "-",
        note: projectId
          ? approvalTasks.length > 0
            ? "ekran onaylı"
            : "onay görevi yok"
          : "proje bekleniyor",
      },
    ];
  }, [allVisibleTasks, files, designConfig, projectId]);

  const contentWithRealKpis = useMemo(
    () => ({ ...content, kpis: realKpis }),
    [content, realKpis],
  );

  const handleApprove = async (taskId: string) => {
    await updateApproval({ taskId, body: { approvalStatus: "APPROVED" } });
  };
  const handleRequestChanges = async (taskId: string) => {
    await updateApproval({ taskId, body: { approvalStatus: "CHANGES_REQUESTED" } });
  };

  if (tabId === "wireframe") {
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <SmartKpis content={contentWithRealKpis} tabId={tabId} />
        <ApprovalWorkspace content={content} tabId={tabId} serviceId={serviceId} projectId={projectId} />
        <WebMobileDesignActionFooter
          tasks={allVisibleTasks}
          files={files}
          isLoading={isLoading}
          isUpdating={isUpdatingApproval}
          onApprove={(id) => void handleApprove(id)}
          onRequestChanges={(id) => void handleRequestChanges(id)}
        />
      </div>
    );
  }

  if (tabId === "revisions") {
    const revisionTasks = tasks.filter((task) => task.type === "REVISION");
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <SmartKpis content={contentWithRealKpis} tabId={tabId} />
        <TaskBasedRevisionPanel
          serviceId={serviceId}
          projectId={projectId}
          tasks={revisionTasks}
          isLoading={tasksLoading}
        />
        <WebMobileDesignActionFooter
          tasks={allVisibleTasks}
          files={files}
          isLoading={isLoading}
          isUpdating={isUpdatingApproval}
          onApprove={(id) => void handleApprove(id)}
          onRequestChanges={(id) => void handleRequestChanges(id)}
        />
      </div>
    );
  }

  if (tabId === "delivery-files") {
    return (
      <div className="p-8 space-y-6">
        <PageHero content={content} tabId={tabId} />
        <SmartKpis content={contentWithRealKpis} tabId={tabId} />
        <DeliveryWorkspace content={content} projectId={projectId} />
        <WebMobileDesignActionFooter
          tasks={allVisibleTasks}
          files={files}
          isLoading={isLoading}
          isUpdating={isUpdatingApproval}
          onApprove={(id) => void handleApprove(id)}
          onRequestChanges={(id) => void handleRequestChanges(id)}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />
      <SmartKpis content={contentWithRealKpis} tabId={tabId} />
      <WebMobileDesignLivePanel
        content={content}
        tabId={tabId}
        projectId={projectId}
        tasks={tabTasks}
        files={tabFiles}
        isLoading={isLoading}
        isError={isError}
      />
      <WebMobileDesignActionFooter
        tasks={allVisibleTasks}
        files={files}
        isLoading={isLoading}
        isUpdating={isUpdatingApproval}
        onApprove={(id) => void handleApprove(id)}
        onRequestChanges={(id) => void handleRequestChanges(id)}
      />
    </div>
  );
}

function WebMobileDesignLivePanel({
  content,
  tabId,
  projectId,
  tasks,
  files,
  isLoading,
  isError,
}: {
  content: ServiceTabContent;
  tabId: string;
  projectId?: string | null;
  tasks: ClientTask[];
  files: ProjectFile[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (!projectId) {
    return (
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-2">{content.title}</h2>
        <p className="text-sm text-[#A0A0A0]">
          Bu hizmet için proje oluşturulduğunda canlı görevler, prototipler ve teslim dosyaları burada görünecek.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className={cardClass}><p className="text-sm text-[#A0A0A0]">Tasarım verileri yükleniyor...</p></div>;
  }

  if (isError) {
    return <div className={cardClass}><p className="text-sm text-red-300">Tasarım verileri alınamadı.</p></div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl text-white mb-1">{getWebMobileDesignTabTitle(tabId)}</h2>
            <p className="text-sm text-[#A0A0A0]">
              Bu sekme canlı proje görevleri ve müşteri görünür dosyalardan beslenir.
            </p>
          </div>
          <span className={`rounded border px-2 py-1 text-xs ${statusTone.info}`}>
            {tasks.length} görev · {files.length} dosya
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <MiniMetric label="Açık Görev" value={String(tasks.filter((task) => task.status !== "DONE").length)} />
          <MiniMetric label="Tamamlanan" value={String(tasks.filter((task) => task.status === "DONE").length)} />
          <MiniMetric label="Onayda" value={String(tasks.filter((task) => task.approvalStatus === "PENDING").length)} />
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Bu sekme için müşteri görünür görev bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 8).map((task) => (
              <div key={task.id} className={innerClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    {task.description ? <p className="mt-1 text-xs text-[#A0A0A0]">{task.description}</p> : null}
                    <p className="mt-2 text-xs text-[#A0A0A0]">
                      {task.projectName ?? "Tasarım projesi"} · %{task.progressPercent} ilerleme
                    </p>
                  </div>
                  <span className={`rounded border px-2 py-1 text-xs ${getClientTaskStatusTone(task.status)}`}>
                    {getClientTaskStatusLabel(task.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Görünür Dosyalar</h2>
        {files.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Bu sekmeye bağlı müşteri görünür dosya yok.</p>
        ) : (
          <div className="space-y-3">
            {files.slice(0, 6).map((file) => (
              <div key={file.id} className={innerClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{file.title}</p>
                    <p className="mt-1 truncate text-xs text-[#A0A0A0]">{file.originalFileName}</p>
                  </div>
                  <a
                    href={file.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#AAFF01] hover:underline"
                    aria-label={`${file.title} dosyasını aç`}
                  >
                    <Link className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type DesignActivityItem = { label: string; meta: string };

function buildWebMobileDesignActivity(tasks: ClientTask[], files: ProjectFile[]): DesignActivityItem[] {
  const taskItems: DesignActivityItem[] = [...tasks]
    .filter((t) => t.updatedAt)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 3)
    .map((t) => ({
      label: `${t.title} güncellendi`,
      meta: t.updatedAt ? formatWebMobileDesignDate(t.updatedAt) : "Tarih yok",
    }));
  const fileItems: DesignActivityItem[] = [...files]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.max(0, 4 - taskItems.length))
    .map((f) => ({
      label: `${f.title} yüklendi`,
      meta: formatWebMobileDesignDate(f.createdAt),
    }));
  return [...taskItems, ...fileItems].slice(0, 4);
}

function formatWebMobileDesignDate(value: string): string {
  const date = new Date(value);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(date);
}

function WebMobileDesignActionFooter({
  tasks,
  files,
  isLoading,
  isUpdating,
  onApprove,
  onRequestChanges,
}: {
  tasks: ClientTask[];
  files: ProjectFile[];
  isLoading: boolean;
  isUpdating: boolean;
  onApprove: (taskId: string) => void;
  onRequestChanges: (taskId: string) => void;
}) {
  const pendingTasks = tasks.filter(
    (t) => t.approvalRequired && t.approvalStatus === "PENDING",
  );
  const recentActivity = useMemo(() => buildWebMobileDesignActivity(tasks, files), [tasks, files]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Son Aktiviteler</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">
            Henüz görünür aktivite yok. Proje yöneticisi görev yükledikçe burada görünecek.
          </p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#AAFF01]" />
                  {index < recentActivity.length - 1 && (
                    <div className="w-px h-10 bg-white/[0.08] mt-2" />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-xs text-[#A0A0A0] mt-1">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Sizden Beklenenler</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : pendingTasks.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">
            Şu anda bekleyen onay veya revizyon görevi yok.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task, index) => (
              <div key={task.id} className={innerClass}>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      index === 0 ? statusTone.good : statusTone.violet
                    }`}
                  >
                    {index === 0 ? "Öncelikli" : "Takip"}
                  </span>
                  {task.dueDate ? (
                    <span className="text-xs text-[#A0A0A0] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(task.dueDate))}
                    </span>
                  ) : null}
                </div>
                <p className="text-white text-sm mb-1">{task.title}</p>
                {task.description ? (
                  <p className="text-xs text-[#A0A0A0] mb-3 line-clamp-2">{task.description}</p>
                ) : (
                  <div className="mb-3" />
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className={`text-xs px-3 py-2 ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
                    onClick={() => onApprove(task.id)}
                  >
                    Onayla
                  </Button>
                  <Button
                    variant="ghost"
                    className={`text-xs px-3 py-2 ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
                    onClick={() => onRequestChanges(task.id)}
                  >
                    Revizyon İste
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialMediaClientWorkspace({ tabId }: { tabId: string }) {
  const isCalendarTab = tabId === 'content-calendar';
  const isPostListTab = tabId === 'pending-approvals' || tabId === 'published-content';
  const isApprovalTab = tabId === 'pending-approvals' || tabId === 'approvals';
  const isPerformanceTab = tabId === 'performance';
  const isReportsTab = tabId === 'reports';
  const isDMTab = tabId === 'dm-comments';
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
  } = useGetOwnSocialMediaPostsQuery({ limit: 80 }, { skip: !isPostListTab && !isDMTab });
  const {
    data: insightsResponse,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useGetOwnSocialMediaInsightsQuery(
    { limit: isDMTab ? 200 : 50 },
    { skip: !isPerformanceTab && !isDMTab },
  );
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
  const approvalFlowPosts = useMemo(
    () => filterSocialMediaTabPosts('pending-approvals', listPosts),
    [listPosts],
  );
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
  const approvalFolders = useMemo(
    () =>
      buildSocialMediaApprovalFolders(
        approvalFlowPosts,
        pendingApprovalTasks,
        approvalHistoryTasks,
      ),
    [approvalFlowPosts, pendingApprovalTasks, approvalHistoryTasks],
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

  const handleFolderApprovalDecision = async (
    folder: SocialMediaApprovalFolderGroup,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => {
    if (folder.pendingTasks.length === 0) {
      return;
    }

    setActiveApprovalTaskId(folder.key);
    try {
      for (const task of folder.pendingTasks) {
        await updateClientTaskApproval({
          taskId: task.id,
          body: {
            approvalStatus,
            approvalResponseNote: approvalResponseNote?.trim() || undefined,
          },
        }).unwrap();
      }
      const folderLabel = folder.folderName;
      if (approvalStatus === 'APPROVED' || approvalStatus === 'ACKNOWLEDGED') {
        runClientAction(`${folderLabel} klasörü onaylandı`, 'approve');
      } else if (approvalStatus === 'CHANGES_REQUESTED' || approvalStatus === 'REJECTED') {
        runClientAction(`${folderLabel} klasörü revizyona gönderildi`, 'revision');
      } else {
        runClientAction(`${folderLabel} klasör onayı güncellendi`, 'comment');
      }
    } catch {
      runClientAction(`${folder.folderName} klasör onayı güncellenemedi`, 'comment');
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
    const postApprovals = approvalFlowPosts;
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
          <SocialMediaFolderApprovalsPanel
            folders={approvalFolders}
            isLoading={approvalsLoading}
            isError={approvalsError}
            isActionLoading={approvalActionLoading}
            activeFolderKey={activeApprovalTaskId}
            onDecision={handleFolderApprovalDecision}
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

  if (isDMTab) {
    return (
      <SocialMediaDMWorkspace
        summary={summary}
        insights={insightsResponse?.data ?? []}
        isLoading={insightsLoading}
      />
    );
  }

  if (tabId === 'competitor-analysis') {
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
  const folderLabel = getSocialMediaPostPrimaryFolder(post).name;

  return (
    <div className={innerClass}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="min-w-0 break-words text-white text-sm">{post.title}</h3>
        <span className={`shrink-0 text-xs px-2 py-1 rounded border ${getSocialMediaStatusTone(post.status)}`}>
          {getSocialMediaPostStatusLabel(post.status)}
        </span>
      </div>
      <SocialMediaPostMediaPreview post={post} />
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
        <div className="flex justify-between gap-4">
          <span className="text-[#A0A0A0]">Onay klasörü</span>
          <span className="text-white text-right">{folderLabel}</span>
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

function SocialMediaPostMediaPreview({ post }: { post: SocialMediaPost }) {
  const mediaAssets = useMemo(
    () =>
      post.assets
        .map((asset) => asset.file)
        .filter(
          (
            file,
          ): file is NonNullable<SocialMediaPost["assets"][number]["file"]> =>
            Boolean(file && (file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/"))),
        ),
    [post.assets],
  );
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setCarouselIndex(0);
  }, [post.id, post.type, mediaAssets.length]);

  if (mediaAssets.length === 0) {
    return (
      <div className="mb-4 rounded-xl border border-dashed border-white/[0.12] bg-[#161616] p-4 text-xs text-[#8F8F8F]">
        Bu içerik için yüklenmiş önizleme medyası yok.
      </div>
    );
  }

  if (post.type === "CAROUSEL") {
    const boundedIndex = Math.min(carouselIndex, mediaAssets.length - 1);
    const currentAsset = mediaAssets[boundedIndex];
    return (
      <div className="mb-4">
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#151515]">
          <SocialMediaPostAssetPreviewMedia asset={currentAsset} />
          {mediaAssets.length > 1 ? (
            <>
              <button
                className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.15] bg-black/50 text-white transition hover:border-[#AAFF01]/40 hover:text-[#AAFF01] disabled:opacity-40"
                type="button"
                disabled={boundedIndex === 0}
                onClick={() => setCarouselIndex((index) => Math.max(0, index - 1))}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.15] bg-black/50 text-white transition hover:border-[#AAFF01]/40 hover:text-[#AAFF01] disabled:opacity-40"
                type="button"
                disabled={boundedIndex >= mediaAssets.length - 1}
                onClick={() =>
                  setCarouselIndex((index) => Math.min(mediaAssets.length - 1, index + 1))
                }
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-[#A0A0A0]">
          Carousel · {boundedIndex + 1}/{mediaAssets.length}
        </p>
      </div>
    );
  }

  const primaryAsset =
    post.type === "REEL" || post.type === "SHORT_VIDEO"
      ? mediaAssets.find((asset) => asset.mimeType.startsWith("video/")) ?? mediaAssets[0]
      : mediaAssets[0];

  return (
    <div className="mb-4 rounded-xl border border-white/[0.08] bg-[#151515]">
      <SocialMediaPostAssetPreviewMedia asset={primaryAsset} />
      <p className="px-3 pb-3 pt-2 text-xs text-[#A0A0A0]">
        {post.type === "REEL" || post.type === "SHORT_VIDEO" ? "Reel / Video" : "Tekli Gösterim"}
      </p>
    </div>
  );
}

function SocialMediaPostAssetPreviewMedia({
  asset,
}: {
  asset: NonNullable<SocialMediaPost["assets"][number]["file"]>;
}) {
  if (asset.mimeType.startsWith("video/")) {
    return (
      <video
        className="h-52 w-full object-cover"
        controls
        preload="metadata"
        src={asset.secureUrl}
      />
    );
  }

  return (
    <img
      src={asset.secureUrl}
      alt={asset.title}
      className="h-52 w-full object-cover"
      loading="lazy"
    />
  );
}

function SocialMediaFolderApprovalsPanel({
  folders,
  isLoading,
  isError,
  isActionLoading,
  activeFolderKey,
  onDecision,
}: {
  folders: SocialMediaApprovalFolderGroup[];
  isLoading: boolean;
  isError: boolean;
  isActionLoading: boolean;
  activeFolderKey: string | null;
  onDecision: (
    folder: SocialMediaApprovalFolderGroup,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  if (isLoading) {
    return <MetaAdsStatePanel title="Onay klasörleri yükleniyor..." />;
  }

  if (isError) {
    return (
      <MetaAdsStatePanel
        title="Onay klasörleri alınamadı"
        description="Social Media onay akışı şu an görüntülenemiyor."
        tone="error"
      />
    );
  }

  if (folders.length === 0) {
    return <MetaAdsStatePanel title="Onay akışında klasör bulunmuyor." tone="muted" />;
  }

  return (
    <div className="space-y-3">
      {folders.map((folder) => {
        const pendingCount = folder.pendingTasks.length;
        const historyCount = folder.historyTasks.length;
        const latestHistory = folder.historyTasks[0] ?? null;
        const isActiveFolder = activeFolderKey === folder.key;

        return (
          <div key={folder.key} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-white">{folder.folderName}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">
                  {folder.posts.length} içerik · {pendingCount} bekleyen onay · {historyCount} geçmiş
                </p>
              </div>
              <span className={`rounded border px-2 py-1 text-[11px] ${pendingCount > 0 ? statusTone.warn : statusTone.good}`}>
                {pendingCount > 0 ? "Onay Bekliyor" : "Tamamlandı"}
              </span>
            </div>

            <div className="space-y-2">
              {folder.posts.map((post) => (
                <SocialMediaClientPostCard key={post.id} post={post} />
              ))}
            </div>

            {pendingCount > 0 ? (
              <>
                <textarea
                  className="mt-3 min-h-20 w-full rounded-xl border border-white/[0.08] bg-[#151515] p-3 text-sm text-white outline-none focus:border-[#AAFF01]/40"
                  placeholder="Revizyon notu (klasör geneli)"
                  value={notes[folder.key] ?? ""}
                  onChange={(event) =>
                    setNotes((prev) => ({
                      ...prev,
                      [folder.key]: event.target.value,
                    }))
                  }
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    className="text-xs"
                    disabled={isActionLoading}
                    onClick={() =>
                      void onDecision(
                        folder,
                        folder.pendingTasks.every((task) =>
                          Boolean(task.approvalType?.endsWith("REPORT_ACKNOWLEDGEMENT")),
                        )
                          ? "ACKNOWLEDGED"
                          : "APPROVED",
                        notes[folder.key],
                      )
                    }
                  >
                    {isActiveFolder ? "Kaydediliyor..." : "Klasörü Onayla"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    disabled={isActionLoading || (notes[folder.key]?.trim().length ?? 0) < 2}
                    onClick={() => void onDecision(folder, "CHANGES_REQUESTED", notes[folder.key])}
                  >
                    Revizyon İste
                  </Button>
                </div>
              </>
            ) : null}

            {latestHistory?.approvalResponseNote ? (
              <p className="mt-3 rounded-xl border border-orange-400/30 bg-orange-500/10 p-3 text-xs text-orange-100">
                Son not: {latestHistory.approvalResponseNote}
              </p>
            ) : null}
          </div>
        );
      })}
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
            ['Gösterim', totals?.impressions ?? 0],
            ['Erişim', totals?.reach ?? 0],
            ['Etkileşim', `${formatCompactNumber(totals?.engagementRate ?? 0)}%`],
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
                  <span>Erişim {formatCompactNumber(insight.reach)}</span>
                  <span>Beğeni {formatCompactNumber(insight.likes)}</span>
                  <span>Tıklama {formatCompactNumber(insight.clicks)}</span>
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

function SocialMediaDMWorkspace({
  summary,
  insights,
  isLoading,
}: {
  summary: SocialMediaSummary | null | undefined;
  insights: SocialMediaInsightItem[];
  isLoading: boolean;
}) {
  type PostStats = {
    postId: string;
    post: SocialMediaInsightPostSummary;
    platform: SocialMediaPlatform;
    comments: number;
    likes: number;
    shares: number;
  };

  const postStats = useMemo<PostStats[]>(() => {
    const map = new Map<string, PostStats>();
    for (const item of insights) {
      if (!map.has(item.postId)) {
        map.set(item.postId, {
          postId: item.postId,
          post: item.post,
          platform: item.platform,
          comments: 0,
          likes: 0,
          shares: 0,
        });
      }
      const entry = map.get(item.postId)!;
      entry.comments += item.comments;
      entry.likes += item.likes;
      entry.shares += item.shares;
    }
    return Array.from(map.values())
      .filter((s) => s.comments > 0 || s.likes > 0)
      .sort((a, b) => b.comments - a.comments);
  }, [insights]);

  const totalComments = postStats.reduce((sum, s) => sum + s.comments, 0);
  const totalLikes = postStats.reduce((sum, s) => sum + s.likes, 0);

  const platformBg = (platform: SocialMediaPlatform) => {
    if (platform === 'INSTAGRAM') return 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)';
    if (platform === 'FACEBOOK') return '#1877F2';
    return '#444';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl text-white">Yorum & Etkileşim</h2>
            <p className="text-sm text-[#A0A0A0] mt-1">Yayınlanan içeriklere gelen etkileşimler.</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>{totalComments.toLocaleString('tr-TR')} yorum</span>
        </div>
        {isLoading ? (
          <div className="rounded-xl bg-[#202020] p-6 border border-white/[0.08] text-center text-[#A0A0A0] text-sm">
            Yükleniyor…
          </div>
        ) : postStats.length > 0 ? (
          <div className="space-y-3">
            {postStats.slice(0, 15).map((stat) => (
              <div key={stat.postId} className="flex gap-3 rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: platformBg(stat.platform) }}
                >
                  {stat.platform === 'INSTAGRAM' ? 'IG' : stat.platform === 'FACEBOOK' ? 'FB' : stat.platform.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-white text-sm font-medium truncate">{stat.post.title}</p>
                    <span className="text-xs text-[#A0A0A0] flex-shrink-0">
                      {stat.post.publishedAt ? new Date(stat.post.publishedAt).toLocaleDateString('tr-TR') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#A0A0A0] mt-2">
                    <span className="text-[#AAFF01] font-medium flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />{stat.comments.toLocaleString('tr-TR')}
                    </span>
                    <span>{stat.likes.toLocaleString('tr-TR')} beğeni</span>
                    <span>{stat.shares.toLocaleString('tr-TR')} paylaşım</span>
                    {stat.post.externalPostUrl && (
                      <a
                        href={stat.post.externalPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-[#7B61FF] hover:text-[#9f8fff] flex items-center gap-1"
                      >
                        <Link className="w-3 h-3" /> Gör
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-[#202020] p-6 border border-white/[0.08] text-center text-[#A0A0A0] text-sm">
            Henüz etkileşim verisi yok.
          </div>
        )}
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Etkileşim Özeti</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-[#A0A0A0]">Toplam Yorum</span>
            <span className="text-white font-medium">{totalComments.toLocaleString('tr-TR')}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-[#A0A0A0]">Toplam Beğeni</span>
            <span className="text-white font-medium">{totalLikes.toLocaleString('tr-TR')}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-[#A0A0A0]">Etkileşimli Post</span>
            <span className="text-white font-medium">{postStats.length}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-[#A0A0A0]">Durum</span>
            <span className="text-white">{summary ? getSocialMediaSummaryStateLabel(summary.state) : 'Hazırlanıyor'}</span>
          </div>
        </div>
        <p className="text-xs text-[#A0A0A0] mt-4">
          Yorum metinleri Meta Business API üzerinden görüntülenebilir. Bu ekran etkileşim sayılarını göstermektedir.
        </p>
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
    return posts.filter((post) =>
      ['WAITING_APPROVAL', 'REVISION_REQUIRED', 'DESIGN', 'APPROVED'].includes(post.status),
    );
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

function GrowthHubClientWorkspace({ tabId }: { tabId: string }) {
  const isChannelsTab = tabId === 'channels';
  const isWeeklyActionsTab = tabId === 'weekly-actions';

  const { data: summary, isLoading: summaryLoading, isError: summaryError } =
    useGetClientGrowthHubSummaryQuery();
  const { data: channelsResponse, isLoading: channelsLoading, isError: channelsError } =
    useGetClientGrowthHubChannelsQuery(undefined, { skip: !isChannelsTab });
  const { data: actionsResponse, isLoading: actionsLoading, isError: actionsError } =
    useGetClientGrowthHubActionsQuery(undefined, { skip: !isWeeklyActionsTab });
  const { data: weeklyNotesResponse, isLoading: notesLoading, isError: notesError } =
    useGetClientGrowthHubWeeklyNotesQuery(undefined, { skip: !isWeeklyActionsTab });

  const channels = channelsResponse?.data ?? summary?.channels ?? [];
  const actions = actionsResponse?.data ?? summary?.actions ?? [];
  const weeklyNotes = weeklyNotesResponse?.data ?? [];
  const latestNote = weeklyNotes[0] ?? null;

  const isLoading =
    summaryLoading ||
    (isChannelsTab && channelsLoading) ||
    (isWeeklyActionsTab && (actionsLoading || notesLoading));
  const isError =
    summaryError ||
    (isChannelsTab && channelsError) ||
    (isWeeklyActionsTab && (actionsError || notesError));

  if (isLoading) {
    return (
      <div className={`${cardClass} flex items-start gap-4`}>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="mb-1 text-xl text-white">Growth Hub yükleniyor</h2>
          <p className="text-sm text-[#A0A0A0]">Veriler hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className={`${cardClass} flex items-start gap-4`}>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#ff4444]/20 bg-[#ff4444]/10 text-[#ff4444]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="mb-1 text-xl text-white">Veriler alınamadı</h2>
          <p className="text-sm text-[#A0A0A0]">Growth Hub API yanıtı okunamıyor. Kısa süre sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  if (isChannelsTab) {
    return <GrowthHubChannelsTab summary={summary} channels={channels} />;
  }

  if (isWeeklyActionsTab) {
    return <GrowthHubWeeklyActionsTab summary={summary} actions={actions} weeklyNote={latestNote} />;
  }

  return <GrowthHubSummaryTab summary={summary} channels={channels} />;
}

type GrowthHubKpiTone = 'green' | 'blue' | 'purple' | 'orange' | 'red';

const growthHubKpiToneMap: Record<GrowthHubKpiTone, { bg: string; text: string }> = {
  green: { bg: 'bg-[#AAFF01]/10', text: 'text-[#AAFF01]' },
  blue: { bg: 'bg-[#00D4FF]/10', text: 'text-[#00D4FF]' },
  purple: { bg: 'bg-[#7B61FF]/10', text: 'text-[#7B61FF]' },
  orange: { bg: 'bg-[#FFA726]/10', text: 'text-[#FFA726]' },
  red: { bg: 'bg-[#ff4444]/10', text: 'text-[#ff4444]' },
};

function GrowthHubKpiCard({
  label,
  value,
  note,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  tone: GrowthHubKpiTone;
  icon: LucideIcon;
}) {
  const colors = growthHubKpiToneMap[tone];
  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="text-sm text-[#A0A0A0]">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
      <div className={`mb-1 text-3xl ${colors.text}`}>{value}</div>
      <div className="text-sm text-[#A0A0A0]">{note}</div>
    </div>
  );
}

function GrowthHubSummaryTab({
  summary,
  channels,
}: {
  summary: GrowthHubSummary;
  channels: GrowthHubChannelSummary[];
}) {
  const healthScore = calculateGrowthHealthScore(summary, channels);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GrowthHubKpiCard
          label="Toplam Lead"
          value={formatGrowthHubCompactNumber(summary.metrics.totalLeads)}
          note={formatGrowthHubDateRange(summary.dateRange.since, summary.dateRange.until)}
          tone="green"
          icon={Users}
        />
        <GrowthHubKpiCard
          label="Reklam Harcaması"
          value={formatGrowthHubCurrency(summary.metrics.totalSpend)}
          note={`${formatGrowthHubNumber(summary.metrics.activeChannels)} aktif kanal`}
          tone="blue"
          icon={BarChart3}
        />
        <GrowthHubKpiCard
          label="Blended ROAS"
          value={formatGrowthHubRatio(summary.metrics.blendedRoas)}
          note={summary.config?.targetRoas ? `Hedef ${formatGrowthHubRatio(summary.config.targetRoas)}` : 'Hedef tanımlı değil'}
          tone="purple"
          icon={TrendingUp}
        />
        <GrowthHubKpiCard
          label="Bekleyen Onay"
          value={formatGrowthHubNumber(summary.metrics.pendingApprovals)}
          note={`${formatGrowthHubNumber(summary.metrics.overdueTasks)} geciken iş`}
          tone={summary.metrics.pendingApprovals > 0 ? 'orange' : 'green'}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl text-white">Büyüme Özeti</h2>
            <span className={`rounded-full border px-3 py-1 text-xs ${getGrowthHubStatusTone(summary.state)}`}>
              {getGrowthHubSummaryStateLabel(summary.state)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#202020] p-4">
              <Target className="h-5 w-5 flex-shrink-0 text-[#AAFF01]" />
              <span className="text-white">Growth sağlığı: {healthScore}%</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#202020] p-4">
              <TrendingUp className="h-5 w-5 flex-shrink-0 text-[#AAFF01]" />
              <span className="text-white">Ana hedef: {getGrowthHubGoalLabel(summary.config?.primaryGoal ?? null)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#202020] p-4">
              <Activity className="h-5 w-5 flex-shrink-0 text-[#AAFF01]" />
              <span className="text-white">
                {formatGrowthHubNumber(summary.metrics.activeServices)} aktif hizmet,{' '}
                {formatGrowthHubNumber(summary.metrics.activeChannels)} kanal
              </span>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="mb-4 text-xl text-white">Kanal Durumu</h2>
          {channels.length > 0 ? (
            <div className="space-y-2">
              {channels.slice(0, 5).map((channel) => (
                <div key={channel.serviceKey} className="flex items-center justify-between rounded-xl bg-[#202020] p-3">
                  <span className="text-sm text-white">{getGrowthHubServiceLabel(channel.serviceKey)}</span>
                  <span className={`rounded-full border px-2 py-1 text-xs ${getGrowthHubStatusTone(channel.status)}`}>
                    {getGrowthHubChannelStatusLabel(channel.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.12] bg-[#202020] p-4 text-sm text-[#A0A0A0]">
              Aktif kanal bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GrowthHubChannelsTab({
  summary,
  channels,
}: {
  summary: GrowthHubSummary;
  channels: GrowthHubChannelSummary[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-xl text-white">Kanal Performansı</h2>
          <p className="text-sm text-[#A0A0A0]">
            {formatGrowthHubDateRange(summary.dateRange.since, summary.dateRange.until)} &middot;{' '}
            {formatGrowthHubNumber(channels.length)} kanal
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${getGrowthHubStatusTone(summary.state)}`}>
          {getGrowthHubSummaryStateLabel(summary.state)}
        </span>
      </div>

      {channels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <GrowthHubChannelDetailCard key={channel.serviceKey} channel={channel} />
          ))}
        </div>
      ) : (
        <div className={cardClass}>
          <p className="text-sm text-[#A0A0A0]">Aktif Growth Hub kanalı bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}

function GrowthHubChannelDetailCard({ channel }: { channel: GrowthHubChannelSummary }) {
  return (
    <div className={innerClass}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-white">{getGrowthHubServiceLabel(channel.serviceKey)}</h3>
          <p className="mt-1 text-xs text-[#A0A0A0]">{getGrowthHubSourceStatusLabel(channel.sourceStatus)}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs ${getGrowthHubStatusTone(channel.status)}`}>
          {getGrowthHubChannelStatusLabel(channel.status)}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[#A0A0A0]">Skor</span>
          <span className="text-white">{formatGrowthHubNumber(channel.healthScore)}%</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#A0A0A0]">{channel.primaryMetricLabel || 'Lead'}</span>
          <span className="text-white">{formatGrowthHubNumber(channel.primaryMetricValue)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#A0A0A0]">Harcama</span>
          <span className="text-white">{formatGrowthHubCurrency(channel.spend)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#A0A0A0]">ROAS</span>
          <span className="text-[#AAFF01]">{formatGrowthHubRatio(channel.roas || channel.metrics.roas)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#A0A0A0]">Açık iş</span>
          <span className="text-white">{formatGrowthHubNumber(channel.openTasks)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#A0A0A0]">Onay</span>
          <span className={channel.pendingApprovals > 0 ? 'text-[#FFA726]' : 'text-white'}>
            {formatGrowthHubNumber(channel.pendingApprovals)}
          </span>
        </div>
      </div>
    </div>
  );
}

function GrowthHubWeeklyActionsTab({
  summary,
  actions,
  weeklyNote,
}: {
  summary: GrowthHubSummary;
  actions: GrowthHubActionItem[];
  weeklyNote: GrowthHubWeeklyNote | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-white">Haftalık Aksiyonlar</h2>
          <span className="text-sm text-[#A0A0A0]">{formatGrowthHubNumber(actions.length)} aksiyon</span>
        </div>
        {actions.length > 0 ? (
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={`${action.type}-${action.id}`} className={innerClass}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#A0A0A0]">{getGrowthHubActionTypeLabel(action.type)}</span>
                  {action.dueAt ? (
                    <span className="text-xs text-[#A0A0A0]">{formatGrowthHubDate(action.dueAt)}</span>
                  ) : null}
                </div>
                <p className="text-sm text-white">{action.title}</p>
                {action.description ? (
                  <p className="mt-2 text-xs leading-relaxed text-[#D8D8D8]">{action.description}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-1 text-xs ${getGrowthHubActionItemTone(action)}`}>
                    {getGrowthHubActionStatusLabel(action.status)}
                  </span>
                  <span className="text-xs text-[#A0A0A0]">{getGrowthHubActionPriorityLabel(action.priority)}</span>
                  {action.project ? (
                    <span className="text-xs text-[#A0A0A0]">{action.project.name}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.12] bg-[#202020] p-4 text-sm text-[#A0A0A0]">
            Bekleyen müşteri aksiyonu yok.
          </div>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-xl text-white">Haftalık Ajans Notu</h2>
        {weeklyNote ? (
          <div className="space-y-3">
            <p className="text-xs text-[#A0A0A0]">{formatGrowthHubDate(weeklyNote.weekStart)} haftası</p>
            <p className="text-sm leading-relaxed text-white">{weeklyNote.summary}</p>
            {weeklyNote.nextFocus ? (
              <div className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                <p className="mb-1 text-xs text-[#A0A0A0]">Sonraki odak</p>
                <p className="text-sm text-white">{weeklyNote.nextFocus}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.12] bg-[#202020] p-4 text-sm text-[#A0A0A0]">
            Haftalık ajans notu henüz hazırlanmadı.
          </div>
        )}
        {summary.metrics.pendingReportAcknowledgements > 0 ? (
          <div className="mt-4 rounded-xl border border-[#FFA726]/20 bg-[#FFA726]/10 p-3 text-xs text-[#FFA726]">
            {formatGrowthHubNumber(summary.metrics.pendingReportAcknowledgements)} rapor teyidiniz bekliyor.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getGrowthHubActionItemTone(action: GrowthHubActionItem): string {
  if (action.status === 'DONE') return 'bg-[#AAFF01]/10 text-[#AAFF01]';
  if (action.status === 'BLOCKED' || action.status === 'CANCELLED') return 'bg-[#ff4444]/10 text-[#ff4444]';
  if (action.dueAt && new Date(action.dueAt).getTime() < Date.now()) return 'bg-[#ff4444]/10 text-[#ff4444]';
  if (action.type === 'REPORT_ACKNOWLEDGEMENT') return 'bg-[#00D4FF]/10 text-[#00D4FF]';
  if (action.type === 'RELEASE_APPROVAL') return 'bg-[#7B61FF]/10 text-[#7B61FF]';
  return 'bg-[#FFA726]/10 text-[#FFA726]';
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

function ApprovalWorkspace({
  content,
  tabId,
  serviceId,
  projectId,
}: {
  content: ServiceTabContent;
  tabId: string;
  serviceId: string;
  projectId?: string | null;
}) {
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);
  const {
    data: approvalTasks = [],
    isLoading: approvalsLoading,
    isError: approvalsError,
  } = useGetClientTasksQuery(projectId ? { projectId, approvalRequired: true } : { approvalRequired: true });
  const [updateClientTaskApproval, { isLoading: approvalActionLoading }] =
    useUpdateClientTaskApprovalMutation();

  const serviceApprovalTasks = useMemo(
    () =>
      approvalTasks.filter((task) => {
        if (!task.approvalRequired) {
          return false;
        }
        if (task.projectServiceId !== serviceId) {
          return false;
        }
        if (projectId && task.projectId !== projectId) {
          return false;
        }
        return true;
      }),
    [approvalTasks, projectId, serviceId],
  );
  const pendingApprovalTasks = useMemo(
    () => serviceApprovalTasks.filter((task) => task.approvalStatus === "PENDING").slice(0, 12),
    [serviceApprovalTasks],
  );
  const approvalHistoryTasks = useMemo(
    () =>
      serviceApprovalTasks
        .filter((task) => task.approvalStatus && task.approvalStatus !== "PENDING")
        .slice(0, 10),
    [serviceApprovalTasks],
  );
  const referenceFiles = useMemo(
    () => buildTaskReferencePreviewFiles(serviceApprovalTasks),
    [serviceApprovalTasks],
  );

  const handleApprovalDecision = async (
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
    approvalResponseNote?: string,
  ) => {
    if (approvalActionLoading) {
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl text-white mb-1">Onay Masası</h2>
            <p className="text-sm text-[#A0A0A0]">
              Bu hizmete ait müşteri onay görevleri canlı olarak listelenir.
            </p>
          </div>
          <span className={`rounded border px-2 py-1 text-xs ${statusTone.info}`}>
            {pendingApprovalTasks.length} bekleyen
          </span>
        </div>
        <MetaAdsApprovalsPanel
          serviceLabel={getServiceLabel(serviceId)}
          tasks={pendingApprovalTasks}
          history={approvalHistoryTasks}
          creativeFiles={referenceFiles}
          loading={approvalsLoading}
          isError={approvalsError}
          isActionLoading={approvalActionLoading}
          activeTaskId={activeApprovalTaskId}
          onDecision={handleApprovalDecision}
        />
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
                  <MetricPill label="Erişim" value={row[1] || '12K'} />
                  <MetricPill label="Etkileşim" value={row[2] || '%7.4'} />
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

function TechnicalSupportClientWorkspace({
  content,
  tabId,
  projectId,
  serviceId: _serviceId,
}: {
  content: ServiceTabContent;
  tabId: string;
  projectId?: string | null;
  serviceId: string;
}) {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useGetClientTasksQuery(projectId ? { projectId } : undefined, { skip: !projectId });
  const { data: summary, isLoading: summaryLoading } = useGetOwnTechnicalSupportSummaryQuery();
  const { data: config } = useGetOwnTechnicalSupportConfigQuery();

  const isLoading = tasksLoading || summaryLoading;

  const openTickets = tasks.filter((t) => t.status !== "DONE").length;
  const resolvedTickets = tasks.filter((t) => t.status === "DONE").length;
  const progressPercent =
    tasks.length > 0 ? Math.round((resolvedTickets / tasks.length) * 100) : 0;

  const realKpis = useMemo(
    () => [
      {
        label: "Açık Talep",
        value: isLoading ? "-" : String(summary?.openTicketCount ?? openTickets),
        note: "aktif destek talebi",
      },
      {
        label: "Çözülen",
        value: isLoading ? "-" : String(summary?.resolvedTicketCount ?? resolvedTickets),
        note: "çözülen talep",
      },
      {
        label: "SLA",
        value: config?.slaLevel ?? "-",
        note: "hizmet seviye anlaşması",
      },
      {
        label: "Uptime",
        value:
          config?.uptimeTarget !== null && config?.uptimeTarget !== undefined
            ? `%${config.uptimeTarget}`
            : "-",
        note: "hedef kesintisizlik",
      },
    ],
    [isLoading, summary, config, openTickets, resolvedTickets],
  );

  const contentWithRealKpis = useMemo(
    () => ({ ...content, kpis: realKpis }),
    [content, realKpis],
  );

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />
      <SmartKpis content={contentWithRealKpis} tabId={tabId} />
      {config?.supportPortalUrl ? (
        <div className={cardClass}>
          <a
            href={config.supportPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-4 py-3 text-sm text-[#AAFF01] hover:bg-[#AAFF01]/10 transition-colors"
          >
            Destek Portalına Git
          </a>
        </div>
      ) : null}
      {tasks.length > 0 ? (
        <div className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Destek Talepleri</h3>
            <span className="text-sm text-[#A0A0A0]">%{progressPercent} çözüldü</span>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <p className="truncate text-sm text-white">{task.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    task.status === "DONE"
                      ? "bg-[#AAFF01]/10 text-[#AAFF01]"
                      : task.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-white/[0.06] text-[#A0A0A0]"
                  }`}
                >
                  {task.status === "DONE"
                    ? "Çözüldü"
                    : task.status === "IN_PROGRESS"
                      ? "İnceleniyor"
                      : "Bekliyor"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && !projectId ? (
        <div className={cardClass}>
          <p className="text-center text-sm text-[#A0A0A0]">
            Destek talepleri proje bağlantısı gerektirir.
          </p>
        </div>
      ) : null}
      <ActionFooter content={content} />
    </div>
  );
}

function SeoAuditClientWorkspace({
  content,
  tabId,
  projectId,
  serviceId: _serviceId,
}: {
  content: ServiceTabContent;
  tabId: string;
  projectId?: string | null;
  serviceId: string;
}) {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useGetClientTasksQuery(projectId ? { projectId } : undefined, { skip: !projectId });
  const { data: summary, isLoading: summaryLoading } = useGetOwnSeoAuditSummaryQuery();
  const { data: config } = useGetOwnSeoAuditConfigQuery();

  const isLoading = tasksLoading || summaryLoading;

  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progressPercent =
    tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const realKpis = useMemo(
    () => [
      {
        label: "SEO Skoru",
        value:
          config?.lastAuditScore !== null && config?.lastAuditScore !== undefined
            ? String(config.lastAuditScore)
            : "-",
        note: "son audit skoru",
      },
      {
        label: "Hedef Kelime",
        value: isLoading ? "-" : String(config?.targetKeywords?.length ?? 0),
        note: "takip edilen kelime",
      },
      {
        label: "Görev İlerlemesi",
        value: isLoading ? "-" : `%${summary?.progressPercent ?? progressPercent}`,
        note: "canlı görev ilerlemesi",
      },
      {
        label: "Açık Görev",
        value: isLoading ? "-" : String(summary?.taskStats.total ? summary.taskStats.total - summary.taskStats.done : tasks.length - doneTasks),
        note: "tamamlanmayı bekliyor",
      },
    ],
    [isLoading, summary, config, progressPercent, doneTasks, tasks.length],
  );

  const contentWithRealKpis = useMemo(
    () => ({ ...content, kpis: realKpis }),
    [content, realKpis],
  );

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />
      <SmartKpis content={contentWithRealKpis} tabId={tabId} />
      {(config?.siteUrl || config?.searchConsolePropertyUrl) ? (
        <div className={`${cardClass} flex flex-wrap gap-3`}>
          {config.siteUrl ? (
            <a
              href={config.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-4 py-3 text-sm text-[#AAFF01] hover:bg-[#AAFF01]/10 transition-colors"
            >
              Siteyi Aç
            </a>
          ) : null}
          {config.searchConsolePropertyUrl ? (
            <a
              href={config.searchConsolePropertyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              Search Console
            </a>
          ) : null}
        </div>
      ) : null}
      {config?.targetKeywords && config.targetKeywords.length > 0 ? (
        <div className={cardClass}>
          <h3 className="mb-3 text-sm font-semibold text-white">Hedef Anahtar Kelimeler</h3>
          <div className="flex flex-wrap gap-2">
            {config.targetKeywords.slice(0, 15).map((kw) => (
              <span
                key={kw}
                className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-[#A0A0A0]"
              >
                {kw}
              </span>
            ))}
            {config.targetKeywords.length > 15 ? (
              <span className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-[#A0A0A0]">
                +{config.targetKeywords.length - 15} daha
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      {tasks.length > 0 ? (
        <div className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Audit Görevleri</h3>
            <span className="text-sm text-[#A0A0A0]">%{progressPercent} tamamlandı</span>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <p className="truncate text-sm text-white">{task.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    task.status === "DONE"
                      ? "bg-[#AAFF01]/10 text-[#AAFF01]"
                      : task.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-white/[0.06] text-[#A0A0A0]"
                  }`}
                >
                  {task.status === "DONE"
                    ? "Tamamlandı"
                    : task.status === "IN_PROGRESS"
                      ? "Devam Ediyor"
                      : "Bekliyor"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && !projectId ? (
        <div className={cardClass}>
          <p className="text-center text-sm text-[#A0A0A0]">
            SEO audit görevleri proje bağlantısı gerektirir.
          </p>
        </div>
      ) : null}
      <ActionFooter content={content} />
    </div>
  );
}
