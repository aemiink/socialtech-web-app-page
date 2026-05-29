import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { selectCurrentUser, hasUserPermission } from "../../features/auth/authSelectors";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import type { ClientProfile } from "../../features/clients/clientsTypes";
import { extractApiErrorMessage } from "../../features/clients/clientsUtils";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import type { Project } from "../../features/projects/projectsTypes";
import {
  useCreateClientSocialMediaPostMutation,
  useCancelSocialMediaPostMutation,
  useDeleteSocialMediaPostMutation,
  useGetClientSocialMediaPostsQuery,
  useMarkSocialMediaPostPublishedMutation,
  useScheduleSocialMediaPostMutation,
  useUpdateSocialMediaPostMutation,
} from "../../features/socialMedia/socialMediaApi";
import type {
  CreateSocialMediaPostRequest,
  SocialMediaPlatform,
  SocialMediaPost,
  SocialMediaPostStatus,
  SocialMediaPostType,
  UpdateSocialMediaPostRequest,
} from "../../features/socialMedia/socialMediaTypes";
import {
  formatSocialMediaDateTime,
  fromDateTimeLocalValue,
  getSocialMediaPlatformLabel,
  getSocialMediaPostStatusBadgeClass,
  getSocialMediaPostStatusLabel,
  getSocialMediaPostTypeLabel,
  SOCIAL_MEDIA_PLATFORM_OPTIONS,
  SOCIAL_MEDIA_POST_STATUS_OPTIONS,
  SOCIAL_MEDIA_POST_TYPE_OPTIONS,
  toDateTimeLocalValue,
} from "../../features/socialMedia/socialMediaUtils";
import { useAppSelector } from "../../store/hooks";

type SocialMediaContentCalendarProps = {
  scope: "admin" | "employee";
};

type FormState = {
  title: string;
  caption: string;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  scheduledAt: string;
  publishedAt: string;
  externalPostUrl: string;
  externalPostId: string;
  projectId: string;
  clientVisible: boolean;
};

const INITIAL_FORM_STATE: FormState = {
  title: "",
  caption: "",
  platform: "INSTAGRAM",
  type: "FEED",
  status: "DRAFT",
  scheduledAt: "",
  publishedAt: "",
  externalPostUrl: "",
  externalPostId: "",
  projectId: "",
  clientVisible: true,
};

type PublishingActionState =
  | {
      mode: "schedule";
      post: SocialMediaPost;
      scheduledAt: string;
      clientVisible: boolean;
    }
  | {
      mode: "publish";
      post: SocialMediaPost;
      publishedAt: string;
      externalPostUrl: string;
      externalPostId: string;
    };

const READ_POST_PERMISSIONS = ["socialMedia.posts.read.any", "socialMedia.posts.read.assigned"] as const;
const MANAGE_POST_PERMISSIONS = [
  "socialMedia.posts.manage.any",
  "socialMedia.posts.manage.assigned",
] as const;
const CLIENT_READ_PERMISSIONS = ["clients.read", "clients.read.assigned"] as const;

export function SocialMediaContentCalendar({ scope }: SocialMediaContentCalendarProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadPosts = hasUserPermission(currentUser, READ_POST_PERMISSIONS);
  const canManagePosts = hasUserPermission(currentUser, MANAGE_POST_PERMISSIONS);
  const canReadClients = hasUserPermission(currentUser, CLIENT_READ_PERMISSIONS);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [statusFilter, setStatusFilter] = useState<SocialMediaPostStatus | "ALL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<SocialMediaPlatform | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [publishingAction, setPublishingAction] = useState<PublishingActionState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: clientsResponse,
    isLoading: clientsLoading,
    isError: clientsError,
  } = useGetClientsQuery(
    { status: "ACTIVE", limit: 100, sortBy: "name", sortOrder: "asc" },
    { skip: !canReadClients },
  );

  const socialMediaClients = useMemo(
    () => (clientsResponse?.data ?? []).filter(hasActiveSocialMediaService),
    [clientsResponse?.data],
  );

  useEffect(() => {
    if (!selectedClientId && socialMediaClients.length > 0) {
      setSelectedClientId(socialMediaClients[0].id);
      return;
    }

    if (
      selectedClientId &&
      socialMediaClients.length > 0 &&
      !socialMediaClients.some((client) => client.id === selectedClientId)
    ) {
      setSelectedClientId(socialMediaClients[0].id);
    }
  }, [selectedClientId, socialMediaClients]);

  const selectedClient = socialMediaClients.find((client) => client.id === selectedClientId) ?? null;

  const { data: projectsResponse, isLoading: projectsLoading } = useGetProjectsQuery(
    selectedClientId ? { clientProfileId: selectedClientId } : undefined,
    { skip: !selectedClientId || !canReadPosts },
  );

  const socialMediaProjects = useMemo(
    () => (projectsResponse?.data ?? []).filter((project) => project.serviceKey === "social-media"),
    [projectsResponse?.data],
  );

  const query = useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      platform: platformFilter === "ALL" ? undefined : platformFilter,
      q: search.trim() || undefined,
      limit: 100,
    }),
    [platformFilter, search, statusFilter],
  );

  const {
    data: postsResponse,
    isLoading: postsLoading,
    isFetching: postsFetching,
    isError: postsError,
  } = useGetClientSocialMediaPostsQuery(
    { clientId: selectedClientId, query },
    { skip: !selectedClientId || !canReadPosts },
  );

  const [createPost, { isLoading: isCreating }] = useCreateClientSocialMediaPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateSocialMediaPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteSocialMediaPostMutation();
  const [schedulePost, { isLoading: isScheduling }] = useScheduleSocialMediaPostMutation();
  const [markPostPublished, { isLoading: isPublishing }] = useMarkSocialMediaPostPublishedMutation();
  const [cancelPost, { isLoading: isCancelling }] = useCancelSocialMediaPostMutation();

  const posts = postsResponse?.data ?? [];
  const isMutating = isCreating || isUpdating || isDeleting || isScheduling || isPublishing || isCancelling;
  const visiblePosts = posts.filter((post) => post.clientVisible).length;
  const pendingPosts = posts.filter((post) =>
    ["WAITING_APPROVAL", "REVISION_REQUIRED", "DESIGN"].includes(post.status),
  ).length;
  const scheduledPosts = posts.filter((post) => post.status === "SCHEDULED").length;
  const publishedPosts = posts.filter((post) => post.status === "PUBLISHED").length;

  useEffect(() => {
    setEditingPost(null);
    setFormState(INITIAL_FORM_STATE);
    setFormError(null);
    setPublishingAction(null);
    setActionError(null);
  }, [selectedClientId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = formState.title.trim();
    if (!selectedClientId || title.length < 2) {
      setFormError("Başlık en az 2 karakter olmalıdır.");
      return;
    }

    if (formState.status === "SCHEDULED" && !formState.scheduledAt) {
      setFormError("Planlanan içerik için yayın tarihi gereklidir.");
      return;
    }

    const payload: CreateSocialMediaPostRequest | UpdateSocialMediaPostRequest = {
      title,
      caption: formState.caption.trim() || null,
      platform: formState.platform,
      type: formState.type,
      status: formState.status,
      scheduledAt: fromDateTimeLocalValue(formState.scheduledAt),
      publishedAt: fromDateTimeLocalValue(formState.publishedAt),
      externalPostUrl: formState.externalPostUrl.trim() || null,
      externalPostId: formState.externalPostId.trim() || null,
      projectId: formState.projectId || null,
      clientVisible: formState.clientVisible,
    };

    try {
      setFormError(null);
      if (editingPost) {
        await updatePost({ id: editingPost.id, clientId: selectedClientId, body: payload }).unwrap();
      } else {
        await createPost({ clientId: selectedClientId, body: payload as CreateSocialMediaPostRequest }).unwrap();
      }
      setEditingPost(null);
      setFormState(INITIAL_FORM_STATE);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "İçerik kaydedilemedi."));
    }
  };

  const handleEdit = (post: SocialMediaPost) => {
    setEditingPost(post);
    setFormError(null);
    setFormState({
      title: post.title,
      caption: post.caption ?? "",
      platform: post.platform,
      type: post.type,
      status: post.status,
      scheduledAt: toDateTimeLocalValue(post.scheduledAt),
      publishedAt: toDateTimeLocalValue(post.publishedAt),
      externalPostUrl: post.externalPostUrl ?? "",
      externalPostId: post.externalPostId ?? "",
      projectId: post.projectId ?? "",
      clientVisible: post.clientVisible,
    });
  };

  const handleDelete = async () => {
    if (!editingPost || !selectedClientId) {
      return;
    }

    const confirmed = window.confirm("Bu içerik takvimi kaydı silinsin mi?");
    if (!confirmed) {
      return;
    }

    try {
      setFormError(null);
      await deletePost({ id: editingPost.id, clientId: selectedClientId }).unwrap();
      setEditingPost(null);
      setFormState(INITIAL_FORM_STATE);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "İçerik silinemedi."));
    }
  };

  const handleOpenSchedule = (post: SocialMediaPost) => {
    setActionError(null);
    setPublishingAction({
      mode: "schedule",
      post,
      scheduledAt: toDateTimeLocalValue(post.scheduledAt) || getDefaultDateTimeLocalValue(),
      clientVisible: post.clientVisible,
    });
  };

  const handleOpenPublish = (post: SocialMediaPost) => {
    setActionError(null);
    setPublishingAction({
      mode: "publish",
      post,
      publishedAt: toDateTimeLocalValue(post.publishedAt) || getDefaultDateTimeLocalValue(),
      externalPostUrl: post.externalPostUrl ?? "",
      externalPostId: post.externalPostId ?? "",
    });
  };

  const handleSubmitPublishingAction = async () => {
    if (!selectedClientId || !publishingAction) {
      return;
    }

    try {
      setActionError(null);

      if (publishingAction.mode === "schedule") {
        const scheduledAt = fromDateTimeLocalValue(publishingAction.scheduledAt);
        if (!scheduledAt) {
          setActionError("Planlama için geçerli bir tarih seçin.");
          return;
        }

        await schedulePost({
          id: publishingAction.post.id,
          clientId: selectedClientId,
          body: {
            scheduledAt,
            clientVisible: publishingAction.clientVisible,
          },
        }).unwrap();
      } else {
        const publishedAt = fromDateTimeLocalValue(publishingAction.publishedAt);
        if (!publishedAt) {
          setActionError("Yayınlandı bilgisi için geçerli bir tarih seçin.");
          return;
        }

        await markPostPublished({
          id: publishingAction.post.id,
          clientId: selectedClientId,
          body: {
            publishedAt,
            externalPostUrl: publishingAction.externalPostUrl.trim() || null,
            externalPostId: publishingAction.externalPostId.trim() || null,
          },
        }).unwrap();
      }

      setPublishingAction(null);
    } catch (error) {
      setActionError(extractApiErrorMessage(error, "Yayın aksiyonu tamamlanamadı."));
    }
  };

  const handleCancelPost = async (post: SocialMediaPost) => {
    if (!selectedClientId) {
      return;
    }

    const confirmed = window.confirm("Bu içerik yayından/planlamadan iptal edilsin mi?");
    if (!confirmed) {
      return;
    }

    try {
      setActionError(null);
      await cancelPost({ id: post.id, clientId: selectedClientId }).unwrap();
    } catch (error) {
      setActionError(extractApiErrorMessage(error, "İçerik iptal edilemedi."));
    }
  };

  if (!canReadPosts) {
    return (
      <div className="p-6">
        <Card className="border-white/[0.08] bg-[#171717] text-white">
          <CardHeader>
            <CardTitle>Sosyal Medya İçerik Takvimi</CardTitle>
            <CardDescription>Bu ekran için gerekli yetki bulunamadı.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-[#AAFF01]">{scope === "admin" ? "Admin" : "Çalışan"} Paneli</p>
          <h1 className="text-3xl font-semibold text-white">Sosyal Medya İçerik Takvimi</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            İçerik planı, onay görünürlüğü ve yayın durumları.
          </p>
        </div>
        <Badge className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]" variant="outline">
          {postsFetching ? "Güncelleniyor" : `${posts.length} içerik`}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Planlanan" value={scheduledPosts} />
        <MetricCard label="Onay Akışı" value={pendingPosts} />
        <MetricCard label="Müşteri Görünür" value={visiblePosts} />
        <MetricCard label="Yayınlanan" value={publishedPosts} />
      </div>

      <Card className="border-white/[0.08] bg-[#171717] text-white">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <Field label="Müşteri">
            <select
              className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
              disabled={clientsLoading || !canReadClients}
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              <option value="">Müşteri seçin</option>
              {socialMediaClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Durum">
            <select
              className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SocialMediaPostStatus | "ALL")}
            >
              <option value="ALL">Tümü</option>
              {SOCIAL_MEDIA_POST_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getSocialMediaPostStatusLabel(status)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Platform">
            <select
              className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
              value={platformFilter}
              onChange={(event) => setPlatformFilter(event.target.value as SocialMediaPlatform | "ALL")}
            >
              <option value="ALL">Tümü</option>
              {SOCIAL_MEDIA_PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {getSocialMediaPlatformLabel(platform)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Arama">
            <Input
              className="border-white/[0.12] bg-[#111] text-white placeholder:text-[#707070]"
              placeholder="Başlık veya caption"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      {clientsError ? (
        <StatusPanel title="Müşteri listesi alınamadı" description="Aktif social media müşterileri yüklenemedi." />
      ) : null}

      {!clientsLoading && canReadClients && socialMediaClients.length === 0 ? (
        <StatusPanel title="Social Media müşterisi yok" description="Aktif hizmet paketi olan müşteri bulunamadı." />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-white/[0.08] bg-[#171717] text-white">
          <CardHeader>
            <CardTitle>İçerikler</CardTitle>
            <CardDescription>{selectedClient?.companyName ?? "Müşteri seçilmedi"}</CardDescription>
          </CardHeader>
          <CardContent>
            {actionError ? <p className="mb-3 text-sm text-red-300">{actionError}</p> : null}
            {postsLoading ? (
              <StatusPanel
                compact
                title="İçerikler yükleniyor"
                description="Takvim kayıtları hazırlanıyor."
                icon={<Loader2 className="h-4 w-4 animate-spin" />}
              />
            ) : postsError ? (
              <StatusPanel compact title="İçerikler alınamadı" description="Liste endpointi hata döndürdü." />
            ) : posts.length === 0 ? (
              <StatusPanel compact title="Kayıt yok" description="Bu filtrelerle içerik bulunamadı." />
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    project={socialMediaProjects.find((item) => item.id === post.projectId) ?? post.project}
                    canManagePosts={canManagePosts}
                    isActionLoading={isMutating}
                    onEdit={handleEdit}
                    onSchedule={handleOpenSchedule}
                    onMarkPublished={handleOpenPublish}
                    onCancel={handleCancelPost}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-[#171717] text-white">
          <CardHeader>
            <CardTitle>{editingPost ? "İçeriği Güncelle" : "Yeni İçerik"}</CardTitle>
            <CardDescription>
              {editingPost ? "Takvim kaydını düzenle" : "Takvime yeni post ekle"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Başlık">
                <Input
                  className="border-white/[0.12] bg-[#111] text-white placeholder:text-[#707070]"
                  disabled={!canManagePosts || !selectedClientId}
                  value={formState.title}
                  onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Platform">
                  <select
                    className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
                    disabled={!canManagePosts}
                    value={formState.platform}
                    onChange={(event) =>
                      setFormState((state) => ({ ...state, platform: event.target.value as SocialMediaPlatform }))
                    }
                  >
                    {SOCIAL_MEDIA_PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {getSocialMediaPlatformLabel(platform)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Format">
                  <select
                    className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
                    disabled={!canManagePosts}
                    value={formState.type}
                    onChange={(event) =>
                      setFormState((state) => ({ ...state, type: event.target.value as SocialMediaPostType }))
                    }
                  >
                    {SOCIAL_MEDIA_POST_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {getSocialMediaPostTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Durum">
                <select
                  className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
                  disabled={!canManagePosts}
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, status: event.target.value as SocialMediaPostStatus }))
                  }
                >
                  {SOCIAL_MEDIA_POST_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {getSocialMediaPostStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Proje">
                <select
                  className="h-9 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
                  disabled={!canManagePosts || projectsLoading}
                  value={formState.projectId}
                  onChange={(event) => setFormState((state) => ({ ...state, projectId: event.target.value }))}
                >
                  <option value="">Projesiz</option>
                  {socialMediaProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Planlanan Tarih">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white"
                    disabled={!canManagePosts}
                    type="datetime-local"
                    value={formState.scheduledAt}
                    onChange={(event) => setFormState((state) => ({ ...state, scheduledAt: event.target.value }))}
                  />
                </Field>
                <Field label="Yayın Tarihi">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white"
                    disabled={!canManagePosts}
                    type="datetime-local"
                    value={formState.publishedAt}
                    onChange={(event) => setFormState((state) => ({ ...state, publishedAt: event.target.value }))}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="External Post URL">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white placeholder:text-[#707070]"
                    disabled={!canManagePosts}
                    placeholder="https://..."
                    value={formState.externalPostUrl}
                    onChange={(event) =>
                      setFormState((state) => ({ ...state, externalPostUrl: event.target.value }))
                    }
                  />
                </Field>
                <Field label="External Post ID">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white placeholder:text-[#707070]"
                    disabled={!canManagePosts}
                    value={formState.externalPostId}
                    onChange={(event) =>
                      setFormState((state) => ({ ...state, externalPostId: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Caption">
                <Textarea
                  className="min-h-28 border-white/[0.12] bg-[#111] text-white placeholder:text-[#707070]"
                  disabled={!canManagePosts}
                  value={formState.caption}
                  onChange={(event) => setFormState((state) => ({ ...state, caption: event.target.value }))}
                />
              </Field>

              <label className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-[#E5E5E5]">
                <input
                  checked={formState.clientVisible}
                  className="h-4 w-4 accent-[#AAFF01]"
                  disabled={!canManagePosts}
                  type="checkbox"
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, clientVisible: event.target.checked }))
                  }
                />
                Müşteri portalında görünür
              </label>

              {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

              <div className="flex flex-wrap gap-2">
                <Button disabled={!canManagePosts || !selectedClientId || isMutating} type="submit">
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {editingPost ? "Güncelle" : "Ekle"}
                </Button>
                {editingPost ? (
                  <Button
                    disabled={isMutating}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPost(null);
                      setFormState(INITIAL_FORM_STATE);
                      setFormError(null);
                    }}
                  >
                    Vazgeç
                  </Button>
                ) : null}
                {editingPost && canManagePosts ? (
                  <Button disabled={isMutating} type="button" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <PublishingActionDialog
        action={publishingAction}
        error={actionError}
        isLoading={isMutating}
        onChange={setPublishingAction}
        onClose={() => {
          setPublishingAction(null);
          setActionError(null);
        }}
        onSubmit={handleSubmitPublishingAction}
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] text-white">
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-[#A0A0A0]">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#AAFF01]/10">
          <CalendarDays className="h-5 w-5 text-[#AAFF01]" />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase text-[#A0A0A0]">{label}</Label>
      {children}
    </div>
  );
}

function PublishingActionDialog({
  action,
  error,
  isLoading,
  onChange,
  onClose,
  onSubmit,
}: {
  action: PublishingActionState | null;
  error: string | null;
  isLoading: boolean;
  onChange: (action: PublishingActionState | null) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}) {
  if (!action) {
    return null;
  }

  const title = action.mode === "schedule" ? "İçeriği Planla" : "Yayınlandı İşaretle";

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
    >
      <Card className="w-full max-w-lg border-white/[0.12] bg-[#171717] text-white shadow-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{action.post.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit();
            }}
          >
            {action.mode === "schedule" ? (
              <>
                <Field label="Planlanan Yayın Tarihi">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white"
                    disabled={isLoading}
                    type="datetime-local"
                    value={action.scheduledAt}
                    onChange={(event) => onChange({ ...action, scheduledAt: event.target.value })}
                  />
                </Field>
                <label className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-[#E5E5E5]">
                  <input
                    checked={action.clientVisible}
                    className="h-4 w-4 accent-[#AAFF01]"
                    disabled={isLoading}
                    type="checkbox"
                    onChange={(event) => onChange({ ...action, clientVisible: event.target.checked })}
                  />
                  Müşteri takviminde görünür
                </label>
              </>
            ) : (
              <>
                <Field label="Yayın Tarihi">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white"
                    disabled={isLoading}
                    type="datetime-local"
                    value={action.publishedAt}
                    onChange={(event) => onChange({ ...action, publishedAt: event.target.value })}
                  />
                </Field>
                <Field label="External Post URL">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white placeholder:text-[#707070]"
                    disabled={isLoading}
                    placeholder="https://..."
                    value={action.externalPostUrl}
                    onChange={(event) => onChange({ ...action, externalPostUrl: event.target.value })}
                  />
                </Field>
                <Field label="External Post ID">
                  <Input
                    className="border-white/[0.12] bg-[#111] text-white"
                    disabled={isLoading}
                    value={action.externalPostId}
                    onChange={(event) => onChange({ ...action, externalPostId: event.target.value })}
                  />
                </Field>
              </>
            )}

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button disabled={isLoading} type="button" variant="outline" onClick={onClose}>
                Vazgeç
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PostListItem({
  post,
  project,
  canManagePosts,
  isActionLoading,
  onEdit,
  onSchedule,
  onMarkPublished,
  onCancel,
}: {
  post: SocialMediaPost;
  project: Project | null;
  canManagePosts: boolean;
  isActionLoading: boolean;
  onEdit: (post: SocialMediaPost) => void;
  onSchedule: (post: SocialMediaPost) => void;
  onMarkPublished: (post: SocialMediaPost) => void;
  onCancel: (post: SocialMediaPost) => void;
}) {
  const canSchedule = canManagePosts && post.status === "APPROVED";
  const canPublish =
    canManagePosts && (post.status === "APPROVED" || post.status === "SCHEDULED");
  const canCancel =
    canManagePosts && post.status !== "PUBLISHED" && post.status !== "CANCELLED";

  return (
    <div className="rounded-md border border-white/[0.08] bg-[#111] p-4" data-testid={`social-media-post-${post.id}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-base font-medium text-white">{post.title}</h3>
            <Badge className={getSocialMediaPostStatusBadgeClass(post.status)} variant="outline">
              {getSocialMediaPostStatusLabel(post.status)}
            </Badge>
            <Badge className="border-white/[0.12] bg-white/[0.04] text-[#E5E5E5]" variant="outline">
              {getSocialMediaPlatformLabel(post.platform)}
            </Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-[#A0A0A0]">{post.caption || "Caption yok"}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#A0A0A0]">
            <span>{getSocialMediaPostTypeLabel(post.type)}</span>
            <span>{formatSocialMediaDateTime(post.scheduledAt ?? post.publishedAt)}</span>
            <span>{project?.name ?? "Projesiz"}</span>
            <span>{post.assets.length} asset</span>
            <span className="flex items-center gap-1">
              {post.clientVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {post.clientVisible ? "Portalda görünür" : "İç kullanım"}
            </span>
            {post.externalPostUrl ? (
              <a
                className="inline-flex items-center gap-1 text-[#AAFF01] hover:text-[#C6FF4A]"
                href={post.externalPostUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Yayını Aç
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <Button
            disabled={!canSchedule || isActionLoading}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onSchedule(post)}
          >
            <CalendarClock className="h-4 w-4" />
            Planla
          </Button>
          <Button
            disabled={!canPublish || isActionLoading}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onMarkPublished(post)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Yayınlandı İşaretle
          </Button>
          <Button
            disabled={!canCancel || isActionLoading}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onCancel(post)}
          >
            <XCircle className="h-4 w-4" />
            İptal Et
          </Button>
          <Button
            disabled={!canManagePosts || isActionLoading}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onEdit(post)}
          >
            <Edit3 className="h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  description,
  compact = false,
  icon,
}: {
  title: string;
  description: string;
  compact?: boolean;
  icon?: ReactNode;
}) {
  const content = (
    <div className="flex items-center gap-3">
      {icon ? <div className="text-[#AAFF01]">{icon}</div> : null}
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-[#A0A0A0]">{description}</p>
      </div>
    </div>
  );

  if (compact) {
    return <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">{content}</div>;
  }

  return (
    <Card className="border-white/[0.08] bg-[#171717] text-white">
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  );
}

function hasActiveSocialMediaService(client: ClientProfile): boolean {
  return (client.purchasedServices ?? []).some(
    (service) => service.serviceKey === "social-media" && service.status === "ACTIVE",
  );
}

function getDefaultDateTimeLocalValue(): string {
  return toDateTimeLocalValue(new Date().toISOString());
}
