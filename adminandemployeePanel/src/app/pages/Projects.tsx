import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle, Clock, FolderKanban, Plus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  hasAdminPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import { useGetClientsQuery } from "../features/clients/clientsApi";
import type { ClientProfile, ClientsListQuery, ServiceKey } from "../features/clients/clientsTypes";
import {
  getActivePurchasedServiceKeys,
  getServiceLabel,
} from "../features/clients/clientsUtils";
import {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "../features/projects/projectsApi";
import type {
  CreateProjectRequest,
  Priority,
  Project,
  ProjectsListQuery,
  ProjectStatus,
} from "../features/projects/projectsTypes";
import {
  PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  extractApiErrorMessage,
  formatDate,
  formatDateInput,
  getPriorityBadgeClass,
  getPriorityLabel,
  getProjectClientName,
  getProjectProgress,
  getProjectServiceLabel,
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
  toNullableText,
} from "../features/projects/projectsUtils";
import { useAppSelector } from "../store/hooks";

type ProjectStatusFilter = ProjectStatus | "ALL";
type PriorityFilter = Priority | "ALL";

type ProjectFormState = {
  clientProfileId: string;
  serviceKey: ServiceKey | "";
  repositoryUrl: string;
  figmaProjectUrl: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
};

type ProjectFormField = keyof ProjectFormState;
type ProjectFormValue = ProjectFormState[ProjectFormField];

const initialProjectForm: ProjectFormState = {
  clientProfileId: "",
  serviceKey: "",
  repositoryUrl: "",
  figmaProjectUrl: "",
  name: "",
  description: "",
  status: "PLANNED",
  priority: "MEDIUM",
  startDate: "",
  dueDate: "",
};

const CLIENT_PICKER_LIMIT = 8;
const SEARCH_DEBOUNCE_MS = 275;

export function Projects() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canManageProjects = hasAdminPermission(currentUser, [
    "projects.manage.any",
    "projects.manage",
  ]);

  const [clientFilterSelection, setClientFilterSelection] = useState<ClientProfile | null>(null);
  const [clientProfileIdFilter, setClientProfileIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");

  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectFormState>(initialProjectForm);
  const [createSelectedClient, setCreateSelectedClient] = useState<ClientProfile | null>(null);
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<ProjectFormState | null>(null);
  const [editSelectedClient, setEditSelectedClient] = useState<ClientProfile | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const query = useMemo<ProjectsListQuery>(
    () => ({
      clientProfileId: clientProfileIdFilter || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
    }),
    [clientProfileIdFilter, priorityFilter, statusFilter],
  );

  const {
    data: projectsResponse,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetProjectsQuery(query);

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const projects = projectsResponse?.data ?? [];
  const meta = projectsResponse?.meta ?? {
    page: 1,
    limit: projects.length,
    total: projects.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const inProgressCount = projects.filter((project) => project.status === "IN_PROGRESS").length;
  const plannedCount = projects.filter((project) => project.status === "PLANNED").length;
  const completedCount = projects.filter((project) => project.status === "COMPLETED").length;
  const urgentCount = projects.filter((project) => project.priority === "URGENT").length;
  const mutating = isCreating || isUpdating;

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageSuccess(null);
    setPageError(null);
    setClientProfileIdFilter(clientFilterSelection?.id ?? "");
  };

  const resetFilters = () => {
    setClientFilterSelection(null);
    setClientProfileIdFilter("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setPageError(null);
    setPageSuccess(null);
  };

  const openCreateDialog = () => {
    setPageError(null);
    setPageSuccess(null);
    setCreateSubmitError(null);
    setCreateForm(initialProjectForm);
    setCreateSelectedClient(null);
    setIsCreateOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
    setCreateSubmitError(null);
    setCreateForm(initialProjectForm);
    setCreateSelectedClient(null);
  };

  const updateCreateForm = (field: ProjectFormField, value: ProjectFormValue) => {
    setCreateSubmitError(null);
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditForm = (field: ProjectFormField, value: ProjectFormValue) => {
    setEditSubmitError(null);
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const selectCreateClient = (client: ClientProfile) => {
    setCreateSubmitError(null);
    setCreateSelectedClient(client);
    setCreateForm((prev) => ({
      ...prev,
      clientProfileId: client.id,
      serviceKey: keepValidServiceSelection(client, prev.serviceKey),
    }));
  };

  const clearCreateClient = () => {
    setCreateSubmitError(null);
    setCreateSelectedClient(null);
    setCreateForm((prev) => ({ ...prev, clientProfileId: "", serviceKey: "" }));
  };

  const selectEditClient = (client: ClientProfile) => {
    setEditSubmitError(null);
    setEditSelectedClient(client);
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            clientProfileId: client.id,
            serviceKey: keepValidServiceSelection(client, prev.serviceKey),
          }
        : prev,
    );
  };

  const clearEditClient = () => {
    setEditSubmitError(null);
    setEditSelectedClient(null);
    setEditForm((prev) => (prev ? { ...prev, clientProfileId: "", serviceKey: "" } : prev));
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateSubmitError(null);
    setPageSuccess(null);

    const validationMessage = validateProjectForm(createForm);
    if (validationMessage) {
      setCreateSubmitError(validationMessage);
      return;
    }

    try {
      await createProject(buildProjectPayload(createForm)).unwrap();
      closeCreateDialog();
      setPageSuccess("Proje başarıyla oluşturuldu.");
    } catch (error) {
      setCreateSubmitError(
        extractApiErrorMessage(error, "Proje oluşturulamadı. Lütfen tekrar deneyin."),
      );
    }
  };

  const openEditDialog = (project: Project) => {
    setPageError(null);
    setPageSuccess(null);
    setEditSubmitError(null);
    setEditTarget(project);
    setEditForm(projectToForm(project));
    setEditSelectedClient(project.clientProfile ? projectClientToClientProfile(project.clientProfile) : null);
  };

  const closeEditDialog = () => {
    setEditTarget(null);
    setEditForm(null);
    setEditSelectedClient(null);
    setEditSubmitError(null);
  };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget || !editForm) {
      return;
    }

    setEditSubmitError(null);
    setPageSuccess(null);

    const validationMessage = validateProjectForm(editForm);
    if (validationMessage) {
      setEditSubmitError(validationMessage);
      return;
    }

    try {
      await updateProject({ id: editTarget.id, body: buildProjectPayload(editForm) }).unwrap();
      closeEditDialog();
      setPageSuccess("Proje bilgileri güncellendi.");
    } catch (error) {
      setEditSubmitError(
        extractApiErrorMessage(error, "Proje güncellenemedi. Lütfen tekrar deneyin."),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Projeler</h1>
          <p className="text-sm text-[#A0A0A0]">Backend Projects API üzerinden proje takibi</p>
        </div>
        <Button
          type="button"
          className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          onClick={openCreateDialog}
          disabled={!canManageProjects}
          title={canManageProjects ? undefined : "Bu işlem için proje yönetim yetkisi gerekir."}
        >
          <Plus className="h-4 w-4" />
          Yeni Proje Oluştur
        </Button>
      </div>

      {pageError && (
        <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {pageError}
        </Card>
      )}

      {pageSuccess && (
        <Card className="border-[#AAFF01]/30 bg-[#AAFF01]/10 p-4 text-sm text-[#d2ff8a]">
          {pageSuccess}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <MetricCard icon={<FolderKanban className="h-5 w-5 text-[#AAFF01]" />} label="Toplam" value={meta.total} />
        <MetricCard icon={<Clock className="h-5 w-5 text-orange-400" />} label="Devam Eden" value={inProgressCount} />
        <MetricCard icon={<FolderKanban className="h-5 w-5 text-[#AAFF01]" />} label="Planlandı" value={plannedCount} />
        <MetricCard icon={<CheckCircle className="h-5 w-5 text-[#AAFF01]" />} label="Tamamlanan" value={completedCount} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5 text-red-300" />} label="Acil" value={urgentCount} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <ClientPicker
              idPrefix="project-client-filter"
              label="Müşteri"
              selectedClient={clientFilterSelection}
              selectedClientId={clientFilterSelection?.id ?? ""}
              onSelect={setClientFilterSelection}
              onClear={() => setClientFilterSelection(null)}
              disabled={false}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Durum</Label>
            <Select value={statusFilter} onValueChange={(value: ProjectStatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getProjectStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Öncelik</Label>
            <Select value={priorityFilter} onValueChange={(value: PriorityFilter) => setPriorityFilter(value)}>
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Öncelikler</SelectItem>
                {PRIORITY_OPTIONS.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" variant="outline" className="flex-1">
              Filtrele
            </Button>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Temizle
            </Button>
          </div>
        </form>
      </Card>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Projeler yükleniyor...
        </Card>
      )}

      {isListError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(listError, "Proje listesi alınamadı. Lütfen tekrar deneyin.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isListError && projects.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Filtrelere uygun proje bulunamadı.
        </Card>
      )}

      {!isLoading && !isListError && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => {
            const progress = getProjectProgress(project.status);

            return (
              <Card
                key={project.id}
                className="border-white/[0.06] bg-[#1A1A1A] p-6 transition-colors hover:bg-white/[0.04]"
              >
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                      <Badge className={getProjectStatusBadgeClass(project.status)}>
                        {getProjectStatusLabel(project.status)}
                      </Badge>
                      <Badge className={getPriorityBadgeClass(project.priority)}>
                        {getPriorityLabel(project.priority)}
                      </Badge>
                      {project.serviceKey && (
                        <Badge variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
                          {getProjectServiceLabel(project)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#A0A0A0]">
                      <span>{getProjectClientName(project)}</span>
                      <span>•</span>
                      <span>{project.slug}</span>
                      <span>•</span>
                      <span>Güncelleme: {formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(project)}
                      disabled={!canManageProjects || mutating}
                    >
                      Düzenle
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/projeler/${project.id}`}>Detay</Link>
                    </Button>
                  </div>
                </div>

                {project.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-[#D8D8D8]">{project.description}</p>
                )}

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <ProjectInfo label="Başlangıç" value={formatDate(project.startDate)} />
                  <ProjectInfo label="Deadline" value={formatDate(project.dueDate)} />
                  <ProjectInfo label="Müşteri Profil ID" value={project.clientProfileId} />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">Durum ilerlemesi</span>
                    <span className="text-sm font-medium text-white">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !isListError && isFetching && (
        <p className="text-xs text-[#d2ff8a]">Proje listesi güncelleniyor...</p>
      )}

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? openCreateDialog() : closeCreateDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Yeni Proje Oluştur</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Proje kaydı backend Projects API üzerinden oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
            {createSubmitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {createSubmitError}
              </div>
            )}
            <ProjectFormFields
              idPrefix="create-project"
              form={createForm}
              selectedClient={createSelectedClient}
              onChange={updateCreateForm}
              onClientSelect={selectCreateClient}
              onClientClear={clearCreateClient}
              disabled={isCreating}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateDialog} disabled={isCreating}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isCreating}
              >
                {isCreating ? "Oluşturuluyor..." : "Proje Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editTarget && editForm)}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Proje Güncelle</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Proje adı değişirse backend müşteri kapsamına göre slug bilgisini yeniden üretir.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4" noValidate>
              {editSubmitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {editSubmitError}
                </div>
              )}
              <ProjectFormFields
                idPrefix="edit-project"
                form={editForm}
                selectedClient={editSelectedClient}
                onChange={updateEditForm}
                onClientSelect={selectEditClient}
                onClientClear={clearEditClient}
                disabled={isUpdating}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isUpdating}>
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-3">
        {icon}
        <span className="text-sm text-[#A0A0A0]">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </Card>
  );
}

function ProjectInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs text-[#A0A0A0]">{label}</p>
      <p className="truncate text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function ProjectFormFields({
  idPrefix,
  form,
  selectedClient,
  onChange,
  onClientSelect,
  onClientClear,
  disabled,
}: {
  idPrefix: string;
  form: ProjectFormState;
  selectedClient: ClientProfile | null;
  onChange: (field: ProjectFormField, value: ProjectFormValue) => void;
  onClientSelect: (client: ClientProfile) => void;
  onClientClear: () => void;
  disabled: boolean;
}) {
  const serviceOptions = getServiceOptions(selectedClient, form.serviceKey);
  const requiresRepository = isCodeService(form.serviceKey);
  const requiresFigma = isDesignService(form.serviceKey);

  return (
    <>
      <div className="space-y-2">
        <ClientPicker
          idPrefix={`${idPrefix}-client`}
          label="Müşteri"
          selectedClient={selectedClient}
          selectedClientId={form.clientProfileId}
          onSelect={onClientSelect}
          onClear={onClientClear}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label>Hizmet</Label>
        <Select
          value={form.serviceKey || "NONE"}
          onValueChange={(value) => onChange("serviceKey", value === "NONE" ? "" : value as ServiceKey)}
          disabled={disabled || serviceOptions.length === 0}
        >
          <SelectTrigger className="border-white/[0.08] bg-[#202020]">
            <SelectValue placeholder="Hizmet seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Hizmet seçilmedi</SelectItem>
            {serviceOptions.map((serviceKey) => (
              <SelectItem key={serviceKey} value={serviceKey}>
                {getServiceLabel(serviceKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClient && serviceOptions.length === 0 && (
          <p className="text-xs text-[#A0A0A0]">Seçili müşterinin aktif hizmeti bulunmuyor.</p>
        )}
        {requiresRepository && (
          <div className="rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs text-orange-100">
            WEB_APP ve MOBILE_APP projelerinde GitHub repository linki zorunludur.
          </div>
        )}
        {requiresFigma && (
          <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-100">
            WEB_MOBILE_DESIGN projelerinde Figma linki zorunludur. Prototip linki girerseniz proje
            detayında embed olarak gösterilir.
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-repository-url`}>GitHub Repository Linki</Label>
        <Input
          id={`${idPrefix}-repository-url`}
          value={form.repositoryUrl}
          onChange={(event) => onChange("repositoryUrl", event.target.value)}
          className="border-white/[0.08] bg-[#202020]"
          placeholder="https://github.com/org/repo"
          disabled={disabled}
        />
        <p className="text-xs text-[#A0A0A0]">
          WEB_APP ve MOBILE_APP projelerinde zorunludur. Tokenlı entegrasyon için proje detayında
          repository bağlantısı ayrıca yönetilebilir.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-figma-url`}>Figma Linki</Label>
        <Input
          id={`${idPrefix}-figma-url`}
          value={form.figmaProjectUrl}
          onChange={(event) => onChange("figmaProjectUrl", event.target.value)}
          className="border-white/[0.08] bg-[#202020]"
          placeholder="https://www.figma.com/file/... veya https://www.figma.com/proto/..."
          disabled={disabled}
        />
        <p className="text-xs text-[#A0A0A0]">
          UI tasarım dosyası linki girerseniz “Figma ile aç” butonu, prototip linki girerseniz
          detay ekranında embedded önizleme gösterilir.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Proje Adı</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="border-white/[0.08] bg-[#202020]"
          placeholder="Growth Hub Launch"
          required
          minLength={2}
          maxLength={160}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Açıklama</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          className="min-h-24 border-white/[0.08] bg-[#202020]"
          placeholder="Proje kapsamı ve notları"
          maxLength={2000}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Durum</Label>
          <Select
            value={form.status}
            onValueChange={(value: ProjectStatus) => onChange("status", value)}
            disabled={disabled}
          >
            <SelectTrigger className="border-white/[0.08] bg-[#202020]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {getProjectStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Öncelik</Label>
          <Select
            value={form.priority}
            onValueChange={(value: Priority) => onChange("priority", value)}
            disabled={disabled}
          >
            <SelectTrigger className="border-white/[0.08] bg-[#202020]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-start-date`}>Başlangıç</Label>
          <Input
            id={`${idPrefix}-start-date`}
            type="date"
            value={form.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            className="border-white/[0.08] bg-[#202020]"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-due-date`}>Deadline</Label>
          <Input
            id={`${idPrefix}-due-date`}
            type="date"
            value={form.dueDate}
            onChange={(event) => onChange("dueDate", event.target.value)}
            className="border-white/[0.08] bg-[#202020]"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}

function ClientPicker({
  idPrefix,
  label,
  selectedClient,
  selectedClientId,
  onSelect,
  onClear,
  disabled,
}: {
  idPrefix: string;
  label: string;
  selectedClient: ClientProfile | null;
  selectedClientId: string;
  onSelect: (client: ClientProfile) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const clientQuery = useMemo<ClientsListQuery>(
    () => ({
      status: "ACTIVE",
      limit: CLIENT_PICKER_LIMIT,
      search: search.length > 0 ? search : undefined,
    }),
    [search],
  );

  const {
    data: clientsResponse,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetClientsQuery(clientQuery);

  const clients = clientsResponse?.data ?? [];
  const selectedLabel = selectedClient?.companyName ?? (selectedClientId ? shortClientId(selectedClientId) : null);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-search`}>{label}</Label>
      <Input
        id={`${idPrefix}-search`}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        className="border-white/[0.08] bg-[#202020]"
        placeholder="Müşteri ara..."
        disabled={disabled}
      />

      {selectedLabel && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-2">
          <div className="min-w-0">
            <Badge className="mb-1 bg-[#AAFF01] text-[#131313]">Seçili</Badge>
            <p className="truncate text-sm font-medium text-white">{selectedLabel}</p>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={onClear} disabled={disabled}>
            Temizle
          </Button>
        </div>
      )}

      <div className="rounded-md border border-white/[0.06] bg-[#202020]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-xs text-[#A0A0A0]">
          <span>Aktif müşteriler</span>
          {isFetching && !isLoading && <span>Güncelleniyor...</span>}
        </div>
        {isLoading && <div className="px-3 py-3 text-sm text-[#A0A0A0]">Müşteriler yükleniyor...</div>}
        {!isLoading && isError && (
          <div className="space-y-2 px-3 py-3 text-sm text-red-200">
            <p>{extractApiErrorMessage(error, "Müşteri adayları alınamadı.")}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}
        {!isLoading && !isError && clients.length === 0 && (
          <div className="px-3 py-3 text-sm text-[#A0A0A0]">
            {search ? "Aramaya uygun aktif müşteri bulunamadı." : "Aktif müşteri bulunamadı."}
          </div>
        )}
        {!isLoading && !isError && clients.length > 0 && (
          <div className="divide-y divide-white/[0.06]">
            {clients.map((client) => {
              const isSelected = selectedClientId === client.id;

              return (
                <button
                  key={client.id}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected ? "bg-[#AAFF01]/10" : ""
                  }`}
                  onClick={() => onSelect(client)}
                  disabled={disabled}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {client.companyName}
                    </span>
                    <span className="block truncate text-xs text-[#A0A0A0]">
                      {client.slug}
                    </span>
                  </span>
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={isSelected ? "bg-[#AAFF01] text-[#131313]" : undefined}
                  >
                    {isSelected ? "Seçili" : "Seç"}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function shortClientId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

function validateProjectForm(form: ProjectFormState): string | null {
  if (!form.clientProfileId.trim()) {
    return "Müşteri seçimi gereklidir.";
  }

  if (form.name.trim().length < 2) {
    return "Proje adı en az 2 karakter olmalıdır.";
  }

  if (
    isCodeService(form.serviceKey) &&
    form.repositoryUrl.trim().length === 0
  ) {
    return "WEB_APP ve MOBILE_APP projelerinde GitHub repository linki zorunludur.";
  }

  if (isDesignService(form.serviceKey) && form.figmaProjectUrl.trim().length === 0) {
    return "WEB_MOBILE_DESIGN projelerinde Figma linki zorunludur.";
  }

  if (form.startDate && form.dueDate && form.startDate > form.dueDate) {
    return "Deadline başlangıç tarihinden önce olamaz.";
  }

  return null;
}

function buildProjectPayload(form: ProjectFormState): CreateProjectRequest {
  return {
    clientProfileId: form.clientProfileId.trim(),
    ...(form.serviceKey ? { serviceKey: form.serviceKey } : {}),
    repositoryUrl: toNullableText(form.repositoryUrl),
    figmaProjectUrl: toNullableText(form.figmaProjectUrl),
    name: form.name.trim(),
    description: toNullableText(form.description),
    status: form.status,
    priority: form.priority,
    startDate: form.startDate || null,
    dueDate: form.dueDate || null,
  };
}

function projectToForm(project: Project): ProjectFormState {
  return {
    clientProfileId: project.clientProfileId,
    serviceKey: project.serviceKey ?? "",
    repositoryUrl: project.repositoryUrl ?? "",
    figmaProjectUrl: project.figmaProjectUrl ?? "",
    name: project.name,
    description: project.description ?? "",
    status: project.status,
    priority: project.priority,
    startDate: formatDateInput(project.startDate),
    dueDate: formatDateInput(project.dueDate),
  };
}

function projectClientToClientProfile(client: Project["clientProfile"]): ClientProfile | null {
  if (!client) {
    return null;
  }

  return {
    id: client.id,
    slug: client.slug,
    companyName: client.companyName,
    contactEmail: client.contactEmail,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
    purchasedServices: client.purchasedServices,
  };
}

function keepValidServiceSelection(client: ClientProfile, selectedServiceKey: ServiceKey | ""): ServiceKey | "" {
  if (!selectedServiceKey) {
    return "";
  }

  return getServiceOptions(client, selectedServiceKey).includes(selectedServiceKey)
    ? selectedServiceKey
    : "";
}

function isCodeService(serviceKey: ServiceKey | ""): boolean {
  return serviceKey === "web-app" || serviceKey === "mobile-app";
}

function isDesignService(serviceKey: ServiceKey | ""): boolean {
  return serviceKey === "web-mobile-design";
}

function getServiceOptions(
  client: ClientProfile | null,
  selectedServiceKey: ServiceKey | "",
): ServiceKey[] {
  const activeServiceKeys = client ? getActivePurchasedServiceKeys(client) : [];

  if (selectedServiceKey && !activeServiceKeys.includes(selectedServiceKey)) {
    return [...activeServiceKeys, selectedServiceKey];
  }

  return activeServiceKeys;
}
