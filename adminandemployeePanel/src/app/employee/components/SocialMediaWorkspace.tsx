import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  Calendar,
  FileText,
  Image,
  MessageSquare,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { hasUserPermission, selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import type { ClientProfile, ClientsListQuery } from "../../features/clients/clientsTypes";
import { extractApiErrorMessage } from "../../features/projects/projectsUtils";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import type { Project } from "../../features/projects/projectsTypes";
import {
  useGetClientSocialMediaPostsQuery,
  useGetClientSocialMediaSummaryQuery,
  useUpdateSocialMediaPostMutation,
} from "../../features/socialMedia/socialMediaApi";
import type {
  SocialMediaCreativeAsset,
  SocialMediaPost,
  SocialMediaSummary,
  SocialMediaSummaryPost,
} from "../../features/socialMedia/socialMediaTypes";
import {
  formatSocialMediaDateTime,
  getSocialMediaGoalLabel,
  getSocialMediaPlatformLabel,
  getSocialMediaPostStatusBadgeClass,
  getSocialMediaPostStatusLabel,
  getSocialMediaPostTypeLabel,
  getSocialMediaSummaryStateLabel,
} from "../../features/socialMedia/socialMediaUtils";
import { useCreateTaskMutation, useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { CreateTaskRequest, Task } from "../../features/tasks/tasksTypes";
import { useAppSelector } from "../../store/hooks";
import { cn } from "../../components/ui/utils";
import { SocialMediaContentCalendar } from "./SocialMediaContentCalendar";

type WorkspaceMode = "social" | "designer" | "manager";

export type SocialMediaWorkspaceView =
  | "overview"
  | "calendar"
  | "posts"
  | "creatives"
  | "approvals"
  | "reports"
  | "messages";

type SocialMediaWorkspaceProps = {
  initialView?: SocialMediaWorkspaceView;
};

const ASSIGNED_CLIENTS_QUERY: ClientsListQuery = {
  status: "ACTIVE",
  limit: 100,
  sortBy: "name",
  sortOrder: "asc",
};

const VIEW_LABELS: Record<SocialMediaWorkspaceView, string> = {
  overview: "Özet",
  calendar: "İçerik Takvimi",
  posts: "Postlar",
  creatives: "Kreatifler",
  approvals: "Onaylar",
  reports: "Raporlar",
  messages: "Mesajlar",
};

const ROLE_VIEWS: Record<WorkspaceMode, readonly SocialMediaWorkspaceView[]> = {
  social: ["overview", "calendar", "posts", "approvals", "reports", "messages"],
  designer: ["overview", "calendar", "creatives", "approvals", "posts"],
  manager: ["overview", "calendar", "posts", "creatives", "approvals", "reports", "messages"],
};

const ROLE_LABELS: Record<WorkspaceMode, string> = {
  social: "Social Media Specialist",
  designer: "Designer",
  manager: "Project Manager",
};

const ROLE_DEFAULT_VIEW: Record<WorkspaceMode, SocialMediaWorkspaceView> = {
  social: "calendar",
  designer: "creatives",
  manager: "overview",
};

const SOCIAL_MEDIA_APPROVAL_TASK: Pick<
  CreateTaskRequest,
  "status" | "priority" | "type" | "workstream" | "approvalRequired" | "approvalStatus"
> = {
  status: "REVIEW",
  priority: "HIGH",
  type: "REVISION",
  workstream: "FULLSTACK",
  approvalRequired: true,
  approvalStatus: "PENDING",
};

const SOCIAL_MEDIA_APPROVAL_TYPE_LABELS: Record<NonNullable<CreateTaskRequest["approvalType"]>, string> = {
  META_ADS_CAMPAIGN_APPROVAL: "Meta Ads Campaign",
  META_ADS_CREATIVE_APPROVAL: "Meta Ads Creative",
  META_ADS_BUDGET_CHANGE_APPROVAL: "Meta Ads Budget Change",
  META_ADS_REPORT_ACKNOWLEDGEMENT: "Meta Ads Report",
  META_ADS_STRATEGY_APPROVAL: "Meta Ads Strategy",
  TIKTOK_ADS_CAMPAIGN_APPROVAL: "TikTok Ads Campaign",
  TIKTOK_ADS_VIDEO_CREATIVE_APPROVAL: "TikTok Ads Video Creative",
  TIKTOK_ADS_HOOK_TEST_APPROVAL: "TikTok Ads Hook Test",
  TIKTOK_ADS_UGC_SCRIPT_APPROVAL: "TikTok Ads UGC Script",
  TIKTOK_ADS_BUDGET_CHANGE_APPROVAL: "TikTok Ads Budget Change",
  TIKTOK_ADS_REPORT_ACKNOWLEDGEMENT: "TikTok Ads Report",
  AMAZON_ADS_CAMPAIGN_APPROVAL: "Amazon Ads Campaign",
  AMAZON_ADS_BUDGET_CHANGE_APPROVAL: "Amazon Ads Budget Change",
  AMAZON_ADS_REPORT_ACKNOWLEDGEMENT: "Amazon Ads Report",
  AMAZON_ADS_STRATEGY_APPROVAL: "Amazon Ads Strategy",
  AMAZON_ADS_CREATIVE_APPROVAL: "Amazon Ads Creative",
  AMAZON_ADS_PRODUCT_PROMOTION_APPROVAL: "Amazon Ads Product Promotion",
  AMAZON_ADS_SEARCH_TERM_ACTION_APPROVAL: "Amazon Ads Search Term Action",
  SOCIAL_MEDIA_POST_APPROVAL: "Social Media Post",
  SOCIAL_MEDIA_CREATIVE_APPROVAL: "Social Media Creative",
  SOCIAL_MEDIA_CAPTION_APPROVAL: "Social Media Caption",
  SOCIAL_MEDIA_CALENDAR_APPROVAL: "Social Media Calendar",
  SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT: "Social Media Report",
};

export function SocialMediaWorkspace({ initialView = "overview" }: SocialMediaWorkspaceProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const workspaceMode = resolveWorkspaceMode(currentUser?.role);
  const allowedViews = ROLE_VIEWS[workspaceMode];

  const canReadAssignedClients = hasUserPermission(currentUser, ["clients.read.assigned"]);
  const canReadSummary = hasUserPermission(currentUser, ["socialMedia.summary.read.assigned"]);
  const canReadPosts = hasUserPermission(currentUser, ["socialMedia.posts.read.assigned"]);
  const canManagePosts = hasUserPermission(currentUser, ["socialMedia.posts.manage.assigned"]);
  const canManageCreatives = hasUserPermission(currentUser, [
    "socialMedia.creatives.manage.assigned",
    "socialMedia.posts.assets.manage.assigned",
    "projects.files.manage.assigned",
  ]);
  const canCreateApprovals = hasUserPermission(currentUser, [
    "socialMedia.approvals.create.assigned",
  ]);
  const canManageReports = hasUserPermission(currentUser, [
    "socialMedia.reports.manage.assigned",
    "reports.manage",
  ]);
  const canManageNotes = hasUserPermission(currentUser, ["socialMedia.notes.manage.assigned"]);
  const canReadTasks = hasUserPermission(currentUser, ["tasks.read.assigned"]);
  const canReadProjects = hasUserPermission(currentUser, ["projects.read.assigned"]);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<SocialMediaWorkspaceView>(
    allowedViews.includes(initialView) ? initialView : ROLE_DEFAULT_VIEW[workspaceMode],
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ROLE_VIEWS[workspaceMode].includes(activeView)) {
      setActiveView(ROLE_DEFAULT_VIEW[workspaceMode]);
    }
  }, [activeView, workspaceMode]);

  const clientsQuery = useGetClientsQuery(ASSIGNED_CLIENTS_QUERY, {
    skip: !canReadAssignedClients,
  });

  const socialMediaClients = useMemo(
    () => (clientsQuery.data?.data ?? []).filter(hasActiveSocialMediaService),
    [clientsQuery.data?.data],
  );

  useEffect(() => {
    if (!selectedClientId && socialMediaClients.length > 0) {
      setSelectedClientId(socialMediaClients[0].id);
      return;
    }

    if (
      selectedClientId &&
      !socialMediaClients.some((client) => client.id === selectedClientId)
    ) {
      setSelectedClientId(socialMediaClients[0]?.id ?? null);
    }
  }, [selectedClientId, socialMediaClients]);

  const selectedClient = socialMediaClients.find((client) => client.id === selectedClientId) ?? null;

  const summaryQuery = useGetClientSocialMediaSummaryQuery(selectedClientId ?? "", {
    skip: !selectedClientId || !canReadSummary,
  });
  const postsQuery = useGetClientSocialMediaPostsQuery(
    { clientId: selectedClientId ?? "", query: { limit: 100 } },
    { skip: !selectedClientId || !canReadPosts },
  );
  const projectsQuery = useGetProjectsQuery(
    selectedClientId ? { clientProfileId: selectedClientId } : undefined,
    { skip: !selectedClientId || !canReadProjects },
  );
  const tasksQuery = useGetTasksQuery(
    selectedClientId ? { clientProfileId: selectedClientId, status: "REVIEW" } : undefined,
    { skip: !selectedClientId || !canReadTasks },
  );
  const [createTask, createTaskState] = useCreateTaskMutation();
  const [updateSocialMediaPost, updatePostState] = useUpdateSocialMediaPostMutation();

  const projects = useMemo(
    () => (projectsQuery.data?.data ?? []).filter((project) => project.serviceKey === "social-media"),
    [projectsQuery.data?.data],
  );
  const projectIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects]);
  const firstProject = projects[0] ?? null;
  const posts = postsQuery.data?.data ?? [];
  const summary = summaryQuery.data ?? null;
  const approvalPosts = posts.filter((post) =>
    post.status === "WAITING_APPROVAL" || post.status === "REVISION_REQUIRED",
  );
  const designPosts = posts.filter((post) =>
    post.status === "DESIGN" || post.status === "REVISION_REQUIRED",
  );
  const approvalTasks = (tasksQuery.data?.data ?? []).filter(
    (task) => task.approvalRequired && projectIds.has(task.projectId),
  );

  const isBusy =
    clientsQuery.isFetching ||
    summaryQuery.isFetching ||
    postsQuery.isFetching ||
    projectsQuery.isFetching ||
    tasksQuery.isFetching;

  async function handleRefresh() {
    await clientsQuery.refetch();

    if (selectedClientId && canReadSummary) {
      await summaryQuery.refetch();
    }

    if (selectedClientId && canReadPosts) {
      await postsQuery.refetch();
    }

    if (selectedClientId && canReadTasks) {
      await tasksQuery.refetch();
    }
  }

  async function handleCreateApprovalRequest() {
    if (!firstProject) {
      setActionMessage("Social Media projesi bulunamadı.");
      return;
    }

    setActionMessage(null);

    try {
      await createTask({
        ...SOCIAL_MEDIA_APPROVAL_TASK,
        projectId: firstProject.id,
        title: "Social Media onay talebi",
        description: `${selectedClient?.companyName ?? "Müşteri"} için içerik takvimi onayı bekliyor.`,
        approvalType: "SOCIAL_MEDIA_CALENDAR_APPROVAL",
      }).unwrap();
      setActionMessage("Onay talebi oluşturuldu.");
      if (canReadTasks) {
        await tasksQuery.refetch();
      }
    } catch (error) {
      setActionMessage(extractApiErrorMessage(error, "Onay talebi oluşturulamadı."));
    }
  }

  async function handleCreatePostApprovalRequest(post: SocialMediaPost) {
    const projectId = post.projectId ?? firstProject?.id ?? null;

    if (!selectedClientId || !projectId) {
      setActionMessage("Social Media projesi bulunamadı.");
      return;
    }

    setActionMessage(null);

    try {
      const createdTask = await createTask({
        ...SOCIAL_MEDIA_APPROVAL_TASK,
        projectId,
        title: `${post.title} onayı`,
        description: [
          `${selectedClient?.companyName ?? "Müşteri"} için Social Media post onayı bekliyor.`,
          `Platform: ${getSocialMediaPlatformLabel(post.platform)}`,
          post.caption ? `Caption: ${post.caption}` : null,
          post.scheduledAt ? `Plan: ${formatSocialMediaDateTime(post.scheduledAt)}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        approvalType: "SOCIAL_MEDIA_POST_APPROVAL",
      }).unwrap();

      await updateSocialMediaPost({
        id: post.id,
        clientId: selectedClientId,
        body: {
          approvalTaskId: createdTask.id,
          status: "WAITING_APPROVAL",
          clientVisible: true,
        },
      }).unwrap();

      setActionMessage("Post müşteri onayına gönderildi.");
      if (canReadTasks) {
        await tasksQuery.refetch();
      }
      if (canReadPosts) {
        await postsQuery.refetch();
      }
    } catch (error) {
      setActionMessage(extractApiErrorMessage(error, "Post onay talebi oluşturulamadı."));
    }
  }

  const hasReadAccess = canReadAssignedClients && canReadSummary && canReadPosts;

  if (!hasReadAccess) {
    return (
      <div className="space-y-6 p-6">
        <Card className="rounded-lg border-red-400/30 bg-red-500/10 p-6 text-red-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-semibold">Social Media Workspace</h1>
              <p className="mt-2 text-sm text-red-100/80">
                Bu alan için assigned Social Media okuma yetkisi gerekiyor.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#F7F7F7]">Social Media Workspace</h1>
            <Badge className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]">
              {ROLE_LABELS[workspaceMode]}
            </Badge>
            {summary ? (
              <Badge className="border-[#AAFF01]/30 bg-[#AAFF01]/15 text-[#AAFF01]">
                {getSocialMediaSummaryStateLabel(summary.state)}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 max-w-3xl text-sm text-[#BDBDBD]">
            Atanmış müşterilerin içerik takvimi, kreatif durumu ve onay akışı.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="h-10 min-w-[240px] rounded-md border border-white/[0.12] bg-[#181818] px-3 text-sm text-[#F7F7F7] outline-none"
            value={selectedClientId ?? ""}
            onChange={(event) => setSelectedClientId(event.target.value || null)}
            disabled={socialMediaClients.length === 0}
            aria-label="Social Media müşterisi"
          >
            {socialMediaClients.length === 0 ? (
              <option value="">Müşteri yok</option>
            ) : null}
            {socialMediaClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={handleRefresh} disabled={isBusy}>
            <RefreshCw className={cn("h-4 w-4", isBusy && "animate-spin")} aria-hidden="true" />
            Yenile
          </Button>
        </div>
      </div>

      {clientsQuery.isError ? (
        <Notice tone="danger" message={extractApiErrorMessage(clientsQuery.error, "Müşteriler alınamadı.")} />
      ) : null}
      {summaryQuery.isError ? (
        <Notice tone="danger" message={extractApiErrorMessage(summaryQuery.error, "Social Media özeti alınamadı.")} />
      ) : null}
      {actionMessage ? <Notice tone="neutral" message={actionMessage} /> : null}

      {selectedClient ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Planlı Post" value={summary?.metrics.plannedPosts ?? 0} />
          <MetricCard label="Tasarımda" value={summary?.metrics.inDesignPosts ?? 0} />
          <MetricCard label="Onay Bekleyen" value={summary?.metrics.pendingApprovals ?? 0} />
          <MetricCard label="Kreatif Asset" value={summary?.metrics.creativeAssets ?? 0} />
          <MetricCard label="Açık Todo" value={summary?.metrics.openTodos ?? 0} />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {allowedViews.map((view) => (
          <Button
            key={view}
            variant={activeView === view ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView(view)}
          >
            {getViewIcon(view)}
            {VIEW_LABELS[view]}
          </Button>
        ))}
      </div>

      {!selectedClient ? (
        <EmptyPanel
          title="Assigned Social Media müşterisi yok"
          description="Aktif Social Media servisi olan atanmış müşteri bulunamadı."
        />
      ) : null}

      {selectedClient && activeView === "overview" ? (
        <OverviewPanel
          client={selectedClient}
          summary={summary}
          projects={projects}
          posts={posts}
          canManagePosts={canManagePosts}
          onOpenCalendar={() => setActiveView("calendar")}
        />
      ) : null}

      {selectedClient && activeView === "calendar" ? (
        <SocialMediaContentCalendar scope="employee" />
      ) : null}

      {selectedClient && activeView === "posts" ? (
        <PostsPanel
          posts={posts}
          canManagePosts={canManagePosts}
          onOpenCalendar={() => setActiveView("calendar")}
        />
      ) : null}

      {selectedClient && activeView === "creatives" ? (
        <CreativesPanel
          assets={summary?.creativeAssets ?? []}
          designPosts={designPosts}
          canManageCreatives={canManageCreatives}
        />
      ) : null}

      {selectedClient && activeView === "approvals" ? (
        <ApprovalsPanel
          posts={approvalPosts}
          tasks={approvalTasks}
          hasProject={Boolean(firstProject)}
          canCreateApprovals={canCreateApprovals}
          isCreating={createTaskState.isLoading || updatePostState.isLoading}
          onCreateApproval={handleCreateApprovalRequest}
          onCreatePostApproval={handleCreatePostApprovalRequest}
        />
      ) : null}

      {selectedClient && activeView === "reports" ? (
        <ReportsPanel
          summary={summary}
          canManageReports={canManageReports}
          canManageNotes={canManageNotes}
        />
      ) : null}

      {selectedClient && activeView === "messages" ? (
        <MessagesPanel
          client={selectedClient}
          canManageNotes={canManageNotes}
        />
      ) : null}
    </div>
  );
}

function OverviewPanel({
  client,
  summary,
  projects,
  posts,
  canManagePosts,
  onOpenCalendar,
}: {
  client: ClientProfile;
  summary: SocialMediaSummary | null;
  projects: Project[];
  posts: SocialMediaPost[];
  canManagePosts: boolean;
  onOpenCalendar: () => void;
}) {
  const config = summary?.config ?? null;
  const upcomingPosts = summary?.contentPlan.upcomingPosts ?? [];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#F7F7F7]">{client.companyName}</h2>
            <p className="mt-1 text-sm text-[#BDBDBD]">
              {config?.instagramUsername ?? "Instagram hesabı tanımlı değil"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenCalendar}>
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Takvimi Aç
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <InfoRow label="Ana Hedef" value={getSocialMediaGoalLabel(config?.primaryGoal ?? null)} />
          <InfoRow label="Frekans" value={config?.contentFrequency ?? "Tanımlı değil"} />
          <InfoRow label="Ton" value={config?.toneOfVoice ?? "Tanımlı değil"} />
          <InfoRow label="Aktif Proje" value={String(projects.length)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(config?.hashtags ?? []).slice(0, 8).map((hashtag) => (
            <Badge key={hashtag} className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]">
              {hashtag}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#F7F7F7]">Yaklaşan İçerikler</h2>
          <Badge className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]">
            {posts.length} post
          </Badge>
        </div>
        <div className="mt-4 space-y-3">
          {upcomingPosts.length > 0 ? (
            upcomingPosts.slice(0, 4).map((post) => <SummaryPostRow key={post.id} post={post} />)
          ) : (
            <p className="text-sm text-[#BDBDBD]">Yaklaşan görünür içerik bulunamadı.</p>
          )}
        </div>
        {!canManagePosts ? (
          <p className="mt-4 text-xs text-[#8F8F8F]">
            Post oluşturma ve düzenleme için assigned manage yetkisi gerekiyor.
          </p>
        ) : null}
      </Card>
    </section>
  );
}

function PostsPanel({
  posts,
  canManagePosts,
  onOpenCalendar,
}: {
  posts: SocialMediaPost[];
  canManagePosts: boolean;
  onOpenCalendar: () => void;
}) {
  return (
    <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#F7F7F7]">Post Yönetimi</h2>
          <p className="mt-1 text-sm text-[#BDBDBD]">Caption, durum ve yayın planı takibi.</p>
        </div>
        <Button onClick={onOpenCalendar} disabled={!canManagePosts}>
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Takvimde Yönet
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {posts.length > 0 ? (
          posts.map((post) => <PostRow key={post.id} post={post} />)
        ) : (
          <p className="text-sm text-[#BDBDBD]">Post bulunamadı.</p>
        )}
      </div>
    </Card>
  );
}

function CreativesPanel({
  assets,
  designPosts,
  canManageCreatives,
}: {
  assets: SocialMediaCreativeAsset[];
  designPosts: SocialMediaPost[];
  canManageCreatives: boolean;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F7F7F7]">Kreatif İşler</h2>
            <p className="mt-1 text-sm text-[#BDBDBD]">Tasarım ve revizyon durumundaki içerikler.</p>
          </div>
          {canManageCreatives ? (
            <Button asChild>
              <Link to="/employee/dosyalar">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Creative Asset Yükle
              </Link>
            </Button>
          ) : (
            <Button disabled>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Creative Asset Yükle
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {designPosts.length > 0 ? (
            designPosts.map((post) => <PostRow key={post.id} post={post} />)
          ) : (
            <p className="text-sm text-[#BDBDBD]">Tasarım bekleyen post bulunamadı.</p>
          )}
        </div>
      </Card>

      <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
        <h2 className="text-lg font-semibold text-[#F7F7F7]">Asset Havuzu</h2>
        <div className="mt-4 space-y-3">
          {assets.length > 0 ? (
            assets.map((asset) => <CreativeAssetRow key={asset.id} asset={asset} />)
          ) : (
            <p className="text-sm text-[#BDBDBD]">Kreatif asset bulunamadı.</p>
          )}
        </div>
      </Card>
    </section>
  );
}

function ApprovalsPanel({
  posts,
  tasks,
  hasProject,
  canCreateApprovals,
  isCreating,
  onCreateApproval,
  onCreatePostApproval,
}: {
  posts: SocialMediaPost[];
  tasks: Task[];
  hasProject: boolean;
  canCreateApprovals: boolean;
  isCreating: boolean;
  onCreateApproval: () => void;
  onCreatePostApproval: (post: SocialMediaPost) => void;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#F7F7F7]">Onay Bekleyen İçerikler</h2>
            <p className="mt-1 text-sm text-[#BDBDBD]">Client approval ve revizyon kuyruğu.</p>
          </div>
          <Button
            onClick={onCreateApproval}
            disabled={!canCreateApprovals || !hasProject || isCreating}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Onay Talebi Oluştur
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostApprovalRow
                key={post.id}
                post={post}
                canCreateApprovals={canCreateApprovals}
                isCreating={isCreating}
                onCreatePostApproval={onCreatePostApproval}
              />
            ))
          ) : (
            <p className="text-sm text-[#BDBDBD]">Onay bekleyen içerik bulunamadı.</p>
          )}
        </div>
      </Card>

      <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
        <h2 className="text-lg font-semibold text-[#F7F7F7]">Açık Onay Taskları</h2>
        <div className="mt-4 space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => <ApprovalTaskRow key={task.id} task={task} />)
          ) : (
            <p className="text-sm text-[#BDBDBD]">Açık onay taskı bulunamadı.</p>
          )}
        </div>
      </Card>
    </section>
  );
}

function ReportsPanel({
  summary,
  canManageReports,
  canManageNotes,
}: {
  summary: SocialMediaSummary | null;
  canManageReports: boolean;
  canManageNotes: boolean;
}) {
  return (
    <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#F7F7F7]">Rapor Hazırlığı</h2>
          <p className="mt-1 text-sm text-[#BDBDBD]">İçerik performansı ve weekly note hazırlığı.</p>
        </div>
        <Button disabled={!canManageReports || !canManageNotes}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          Rapor Notu Hazırla
        </Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <InfoRow label="Yayınlanan" value={String(summary?.metrics.publishedPosts ?? 0)} />
        <InfoRow label="Onay Bekleyen" value={String(summary?.metrics.pendingApprovals ?? 0)} />
        <InfoRow label="Son Güncelleme" value={formatSocialMediaDateTime(summary?.meta.lastUpdatedAt ?? null)} />
      </div>
    </Card>
  );
}

function MessagesPanel({
  client,
  canManageNotes,
}: {
  client: ClientProfile;
  canManageNotes: boolean;
}) {
  return (
    <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#F7F7F7]">Mesajlar / Notlar</h2>
          <p className="mt-1 text-sm text-[#BDBDBD]">{client.companyName} için Social Media not akışı.</p>
        </div>
        <Button disabled={!canManageNotes}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Mesaj Cevapla
        </Button>
      </div>
      <p className="mt-5 text-sm text-[#BDBDBD]">Henüz Social Media notu yok.</p>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#181818] p-4">
      <p className="text-xs uppercase text-[#8F8F8F]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#F7F7F7]">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-3">
      <p className="text-xs text-[#8F8F8F]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#F7F7F7]">{value}</p>
    </div>
  );
}

function PostRow({ post }: { post: SocialMediaPost }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-medium text-[#F7F7F7]">{post.title}</h3>
          <p className="mt-1 text-sm text-[#BDBDBD]">
            {getSocialMediaPlatformLabel(post.platform)} · {getSocialMediaPostTypeLabel(post.type)}
          </p>
        </div>
        <Badge className={getSocialMediaPostStatusBadgeClass(post.status)}>
          {getSocialMediaPostStatusLabel(post.status)}
        </Badge>
      </div>
      {post.caption ? (
        <p className="mt-3 line-clamp-2 text-sm text-[#D7D7D7]">{post.caption}</p>
      ) : null}
      <p className="mt-3 text-xs text-[#8F8F8F]">
        Plan: {formatSocialMediaDateTime(post.scheduledAt)}
      </p>
    </div>
  );
}

function PostApprovalRow({
  post,
  canCreateApprovals,
  isCreating,
  onCreatePostApproval,
}: {
  post: SocialMediaPost;
  canCreateApprovals: boolean;
  isCreating: boolean;
  onCreatePostApproval: (post: SocialMediaPost) => void;
}) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
      <PostRow post={post} />
      <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.08] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-[#8F8F8F]">
          {post.approvalTaskId ? "Bu içerik için approval task bağlı." : "Post/caption müşteri onayı bekliyor."}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreatePostApproval(post)}
          disabled={!canCreateApprovals || isCreating || Boolean(post.approvalTaskId)}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Post Onayına Gönder
        </Button>
      </div>
    </div>
  );
}

function SummaryPostRow({ post }: { post: SocialMediaSummaryPost }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-[#F7F7F7]">{post.title}</h3>
          <p className="mt-1 text-sm text-[#BDBDBD]">
            {getSocialMediaPlatformLabel(post.platform)} · {formatSocialMediaDateTime(post.scheduledAt)}
          </p>
        </div>
        <Badge className={getSocialMediaPostStatusBadgeClass(post.status)}>
          {getSocialMediaPostStatusLabel(post.status)}
        </Badge>
      </div>
    </div>
  );
}

function CreativeAssetRow({ asset }: { asset: SocialMediaCreativeAsset }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-[#F7F7F7]">{asset.title}</h3>
          <p className="mt-1 text-sm text-[#BDBDBD]">
            {asset.category} · {asset.project.name}
          </p>
        </div>
        <Badge className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]">
          {asset.approvalStatus ?? "PENDING"}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-[#8F8F8F]">
        Güncellendi: {formatSocialMediaDateTime(asset.updatedAt)}
      </p>
    </div>
  );
}

function ApprovalTaskRow({ task }: { task: Task }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-[#F7F7F7]">{task.title}</h3>
          <p className="mt-1 text-sm text-[#BDBDBD]">{task.project?.name ?? "Social Media projesi"}</p>
        </div>
        <Badge className="border-amber-400/40 bg-amber-500/15 text-amber-200">
          {task.approvalStatus ?? "PENDING"}
        </Badge>
      </div>
      {task.approvalType ? (
        <p className="mt-2 text-xs text-[#8F8F8F]">
          Onay tipi: {SOCIAL_MEDIA_APPROVAL_TYPE_LABELS[task.approvalType] ?? task.approvalType}
        </p>
      ) : null}
      {task.approvalResponseNote ? (
        <p className="mt-2 rounded-md border border-orange-400/30 bg-orange-500/10 p-3 text-sm text-orange-100">
          Revizyon notu: {task.approvalResponseNote}
        </p>
      ) : null}
    </div>
  );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-lg border-white/[0.08] bg-[#181818] p-6">
      <h2 className="text-lg font-semibold text-[#F7F7F7]">{title}</h2>
      <p className="mt-2 text-sm text-[#BDBDBD]">{description}</p>
    </Card>
  );
}

function Notice({ tone, message }: { tone: "neutral" | "danger"; message: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-sm",
        tone === "danger"
          ? "border-red-400/30 bg-red-500/10 text-red-100"
          : "border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]",
      )}
    >
      {message}
    </div>
  );
}

function getViewIcon(view: SocialMediaWorkspaceView) {
  if (view === "calendar") {
    return <Calendar className="h-4 w-4" aria-hidden="true" />;
  }

  if (view === "creatives") {
    return <Image className="h-4 w-4" aria-hidden="true" />;
  }

  if (view === "reports" || view === "approvals" || view === "posts") {
    return <FileText className="h-4 w-4" aria-hidden="true" />;
  }

  if (view === "messages") {
    return <MessageSquare className="h-4 w-4" aria-hidden="true" />;
  }

  return null;
}

function hasActiveSocialMediaService(client: ClientProfile): boolean {
  return Boolean(
    client.purchasedServices?.some(
      (service) => service.serviceKey === "social-media" && service.status === "ACTIVE",
    ),
  );
}

function resolveWorkspaceMode(role: string | null | undefined): WorkspaceMode {
  if (role === "PROJECT_MANAGER") {
    return "manager";
  }

  if (role === "DESIGNER") {
    return "designer";
  }

  return "social";
}
