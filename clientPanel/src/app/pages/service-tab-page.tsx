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
import { useGetClientProjectFilesQuery } from '../features/projectFiles/projectFilesApi';
import type { ProjectFile } from '../features/projectFiles/projectFilesTypes';
import { useGetClientTasksQuery } from '../features/tasks/tasksApi';
import type {
  ClientTask,
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
import { approvalsApi } from '../features/approvals/approvalsApi';

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
  const shouldLoadDesignAssets = shouldUseWorkspace && (tabId === "ui-ux" || tabId.includes("design"));
  const shouldUseTaskBasedRevisions = !isWebAppService && tabId === "revisions";
  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    refetch: refetchWorkspace,
  } = useGetWebAppWorkspaceQuery(
    { projectId: projectId ?? '', tabKey: workspaceTabKey },
    { skip: !shouldUseWorkspace },
  );
  const {
    data: designAssetsResponse,
    isLoading: isLoadingDesignAssets,
    isError: isDesignAssetsError,
  } = useGetClientProjectFilesQuery(
    { projectId: projectId ?? "", category: "BRAND_ASSET" },
    { skip: !shouldLoadDesignAssets || !projectId },
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
  const designAssetFiles = useMemo(
    () =>
      (designAssetsResponse?.data ?? []).filter((file) =>
        isImageLikeFile(file.mimeType, file.originalFileName),
      ),
    [designAssetsResponse?.data],
  );

  const handleWorkspaceMessageSend = async (message: string, parentMessageId?: string) => {
    if (!projectId || !message.trim()) {
      return;
    }

    const createdMessage = await createWorkspaceMessage({
      projectId,
      tabKey: workspaceTabKey,
      body: message.trim(),
      parentMessageId,
    }).unwrap();

    dispatch(
      webAppWorkspaceApi.util.updateQueryData(
        "getWebAppWorkspace",
        { projectId, tabKey: workspaceTabKey },
        (draft) => {
          const exists = draft.messages?.some((item) => item.id === createdMessage.id);
          if (!exists) {
            draft.messages = [...(draft.messages ?? []), createdMessage];
          }
        },
      ),
    );
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
      if (event.sequence > lastWorkspaceSequenceRef.current + 1) {
        lastWorkspaceSequenceRef.current = event.sequence;
        void refetchWorkspace();
        return;
      }
      lastWorkspaceSequenceRef.current = event.sequence;
      const payload = event.payload ?? {};
      const revision = (payload.revision ?? null) as WorkspaceRevision | null;
      const message = (payload.message ?? null) as WorkspaceMessage | null;

      if (event.event === 'message.created' && message) {
        if (event.tabKey !== workspaceTabKey) {
          return;
        }
        dispatch(
          webAppWorkspaceApi.util.updateQueryData('getWebAppWorkspace', { projectId, tabKey: workspaceTabKey }, (draft) => {
            const exists = draft.messages?.some((item) => item.id === message.id);
            if (!exists) {
              draft.messages = [...(draft.messages ?? []), message];
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
        return;
      }

      if (
        event.event === 'approval.created' ||
        event.event === 'approval.updated' ||
        event.event === 'approval.cancelled' ||
        event.event === 'approval.responded'
      ) {
        dispatch(approvalsApi.util.invalidateTags([{ type: 'ClientApprovals', id: 'LIST' }]));
        return;
      }
    };

    socket.on('workspace:update', onWorkspaceUpdate);

    return () => {
      socket.emit('project:leave', joinPayload);
      socket.off('workspace:update', onWorkspaceUpdate);
      socket.disconnect();
    };
  }, [accessToken, dispatch, projectId, refetchWorkspace, shouldUseWorkspace, workspaceTabKey]);

  if (isWebAppService) {
    return (
      <WebAppWorkspaceTab
        tabId={tabId}
        projectId={projectId}
        workspaceLoading={workspaceLoading}
        sections={workspaceData?.sections ?? []}
        projectSummary={workspaceData?.project}
        sourceOfTruth={workspaceData?.sourceOfTruth}
        designAssetFiles={designAssetFiles}
        isLoadingDesignAssets={isLoadingDesignAssets}
        isDesignAssetsError={isDesignAssetsError}
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
  designAssetFiles,
  isLoadingDesignAssets,
  isDesignAssetsError,
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
  designAssetFiles: ProjectFile[];
  isLoadingDesignAssets: boolean;
  isDesignAssetsError: boolean;
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
        designAssetFiles={designAssetFiles}
        isLoadingDesignAssets={isLoadingDesignAssets}
        isDesignAssetsError={isDesignAssetsError}
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
  designAssetFiles,
  isLoadingDesignAssets,
  isDesignAssetsError,
}: {
  tabId: string;
  tasks: WorkspaceSourceTask[];
  allTasks: WorkspaceSourceTask[];
  sprints: WorkspaceSourceSprint[];
  releases: WorkspaceSourceRelease[];
  files: WorkspaceSourceFile[];
  designAssetFiles: ProjectFile[];
  isLoadingDesignAssets: boolean;
  isDesignAssetsError: boolean;
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

  if (tabId === "ui-ux") {
    return (
      <div className="space-y-4">
        <WorkspaceDesignGalleryPanel
          files={designAssetFiles}
          isLoading={isLoadingDesignAssets}
          isError={isDesignAssetsError}
        />
        <TaskSourcePanel title="UI/UX Operasyon Görevleri" tasks={tasks} emptyText="Bu sekme için görev bulunmuyor." />
      </div>
    );
  }

  if (["frontend", "backend-api", "admin-panel", "revisions"].includes(tabId)) {
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
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);
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
  const selectedSprintTasks = expandedSprintId ? tasksBySprint.get(expandedSprintId) ?? [] : [];

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
              <button
                type="button"
                onClick={() => setExpandedSprintId((current) => (current === sprint.id ? null : sprint.id))}
                className="w-full text-left"
              >
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
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#A0A0A0]">
                  <span>İlerleme: %{sprint.progressPercent ?? calculateTaskListProgress(tasksBySprint.get(sprint.id) ?? [])}</span>
                  <span>
                    Görev: {sprint.taskCounts?.completed ?? 0}/{sprint.taskCounts?.total ?? (tasksBySprint.get(sprint.id) ?? []).length}
                  </span>
                </div>
              </button>
              {expandedSprintId === sprint.id ? (
                <div className="mt-3 space-y-2 rounded-lg border border-white/[0.08] bg-[#181818] p-3">
                  {(tasksBySprint.get(sprint.id) ?? []).length === 0 ? (
                    <p className="text-xs text-[#A0A0A0]">Bu sprintte görev bulunmuyor.</p>
                  ) : null}
                  {(tasksBySprint.get(sprint.id) ?? []).map((task) => (
                    <div key={task.id} className="rounded-md border border-white/[0.08] bg-[#1F1F1F] px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-white">{task.title}</p>
                        <span className={`rounded border px-2 py-0.5 text-[11px] ${getTaskStatusTone(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#A0A0A0]">
                        <span>İlerleme: %{resolveTaskProgressPercent(task)}</span>
                        {task.completion ? (
                          <span>
                            Todo: {task.completion.completedTodos}/{task.completion.totalTodos}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
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

function WorkspaceDesignGalleryPanel({
  files,
  isLoading,
  isError,
}: {
  files: ProjectFile[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-xl text-white">UI/UX Tasarım Görselleri</h2>
      {isLoading ? <p className="text-sm text-[#A0A0A0]">Tasarım görselleri yükleniyor...</p> : null}
      {isError ? (
        <p className="text-sm text-red-300">Tasarım görselleri şu anda yüklenemedi. Lütfen sayfayı yenileyin.</p>
      ) : null}
      {!isLoading && !isError && files.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">Henüz müşteriyle paylaşılan tasarım görseli yok.</p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => (
          <a
            key={file.id}
            href={file.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#202020] transition-colors hover:border-[#AAFF01]/40"
          >
            <div className="aspect-[16/10] overflow-hidden bg-[#161616]">
              <img
                src={file.secureUrl}
                alt={file.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm text-white">{file.title}</p>
              <p className="truncate text-xs text-[#A0A0A0]">{file.originalFileName}</p>
              <p className="text-xs text-[#8F8F8F]">
                {new Date(file.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </a>
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

function resolveTaskProgressPercent(task: WorkspaceSourceTask): number {
  if (typeof task.progressPercent === "number" && Number.isFinite(task.progressPercent)) {
    return clampPercent(task.progressPercent);
  }
  if (task.completion && Number.isFinite(task.completion.completionPercentage)) {
    return clampPercent(task.completion.completionPercentage);
  }
  if (task.status === "DONE") {
    return 100;
  }
  if (task.status === "REVIEW") {
    return 80;
  }
  if (task.status === "IN_PROGRESS") {
    return 50;
  }
  if (task.status === "BLOCKED") {
    return 20;
  }
  return 0;
}

function calculateTaskListProgress(tasks: WorkspaceSourceTask[]): number {
  if (tasks.length === 0) {
    return 0;
  }
  const total = tasks.reduce((sum, task) => sum + resolveTaskProgressPercent(task), 0);
  return Math.round(total / tasks.length);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isImageLikeFile(mimeType: string | null | undefined, fileName: string | null | undefined): boolean {
  if (mimeType?.startsWith("image/")) {
    return true;
  }
  const normalized = (fileName ?? "").toLowerCase();
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/.test(normalized);
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
