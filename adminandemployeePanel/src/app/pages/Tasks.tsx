import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CheckSquare, Clock, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import {
  hasAdminPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import { useGetAdminUsersQuery } from "../features/adminUsers/adminUsersApi";
import type {
  AdminUser,
  AdminUsersListQuery,
} from "../features/adminUsers/adminUsersTypes";
import { getRoleLabel } from "../features/adminUsers/adminUsersUtils";
import { useGetProjectsQuery } from "../features/projects/projectsApi";
import type { Priority, Project } from "../features/projects/projectsTypes";
import { PRIORITY_OPTIONS } from "../features/projects/projectsUtils";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "../features/tasks/tasksApi";
import type {
  CreateTaskRequest,
  Task,
  TasksListQuery,
  TaskStatus,
} from "../features/tasks/tasksTypes";
import {
  TASK_STATUS_OPTIONS,
  extractApiErrorMessage,
  formatDate,
  formatDateInput,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskAssigneeName,
  getTaskClientName,
  getTaskDueLabel,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  isTaskOverdue,
  shortId,
  toNullableText,
} from "../features/tasks/tasksUtils";
import { useAppSelector } from "../store/hooks";

type TaskStatusFilter = TaskStatus | "ALL";
type PriorityFilter = Priority | "ALL";

type TaskFormState = {
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeUserId: string;
  dueDate: string;
};

type TaskFormField = keyof TaskFormState;
type TaskFormValue = TaskFormState[TaskFormField];

const initialTaskForm: TaskFormState = {
  projectId: "",
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  assigneeUserId: "",
  dueDate: "",
};

const EMPLOYEE_PICKER_LIMIT = 8;
const SEARCH_DEBOUNCE_MS = 275;

type AssigneeSelection = {
  id: string;
  displayName: string | null;
  roleLabel: string | null;
};

export function Tasks() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canManageTasks = hasAdminPermission(currentUser, [
    "tasks.manage.any",
    "tasks.manage",
  ]);

  const [projectIdFilter, setProjectIdFilter] = useState("ALL");
  const [assigneeFilterSelection, setAssigneeFilterSelection] =
    useState<AssigneeSelection | null>(null);
  const [assigneeUserIdFilter, setAssigneeUserIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");

  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormState>(initialTaskForm);
  const [createSelectedAssignee, setCreateSelectedAssignee] =
    useState<AssigneeSelection | null>(null);
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskFormState | null>(null);
  const [editSelectedAssignee, setEditSelectedAssignee] =
    useState<AssigneeSelection | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const query = useMemo<TasksListQuery>(
    () => ({
      projectId: projectIdFilter === "ALL" ? undefined : projectIdFilter,
      assigneeUserId: assigneeUserIdFilter || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
    }),
    [assigneeUserIdFilter, priorityFilter, projectIdFilter, statusFilter],
  );

  const {
    data: tasksResponse,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetTasksQuery(query);

  const { data: projectsResponse, isLoading: isProjectsLoading } = useGetProjectsQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const tasks = tasksResponse?.data ?? [];
  const projects = projectsResponse?.data ?? [];
  const meta = tasksResponse?.meta ?? {
    page: 1,
    limit: tasks.length,
    total: tasks.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const todoCount = tasks.filter((task) => task.status === "TODO").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const reviewCount = tasks.filter((task) => task.status === "REVIEW").length;
  const overdueCount = tasks.filter(isTaskOverdue).length;
  const mutating = isCreating || isUpdating;

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageSuccess(null);
    setPageError(null);
    setAssigneeUserIdFilter(assigneeFilterSelection?.id ?? "");
  };

  const resetFilters = () => {
    setProjectIdFilter("ALL");
    setAssigneeFilterSelection(null);
    setAssigneeUserIdFilter("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setPageError(null);
    setPageSuccess(null);
  };

  const openCreateDialog = () => {
    setPageError(null);
    setPageSuccess(null);
    setCreateSubmitError(null);
    setCreateSelectedAssignee(null);
    setCreateForm({
      ...initialTaskForm,
      projectId: projectIdFilter === "ALL" ? "" : projectIdFilter,
    });
    setIsCreateOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
    setCreateSubmitError(null);
    setCreateForm(initialTaskForm);
    setCreateSelectedAssignee(null);
  };

  const updateCreateForm = (field: TaskFormField, value: TaskFormValue) => {
    setCreateSubmitError(null);
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditForm = (field: TaskFormField, value: TaskFormValue) => {
    setEditSubmitError(null);
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const selectCreateAssignee = (employee: AdminUser) => {
    setCreateSubmitError(null);
    setCreateSelectedAssignee(employeeToAssigneeSelection(employee));
    setCreateForm((prev) => ({ ...prev, assigneeUserId: employee.id }));
  };

  const clearCreateAssignee = () => {
    setCreateSubmitError(null);
    setCreateSelectedAssignee(null);
    setCreateForm((prev) => ({ ...prev, assigneeUserId: "" }));
  };

  const selectEditAssignee = (employee: AdminUser) => {
    setEditSubmitError(null);
    setEditSelectedAssignee(employeeToAssigneeSelection(employee));
    setEditForm((prev) => (prev ? { ...prev, assigneeUserId: employee.id } : prev));
  };

  const clearEditAssignee = () => {
    setEditSubmitError(null);
    setEditSelectedAssignee(null);
    setEditForm((prev) => (prev ? { ...prev, assigneeUserId: "" } : prev));
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateSubmitError(null);
    setPageSuccess(null);

    const validationMessage = validateTaskForm(createForm);
    if (validationMessage) {
      setCreateSubmitError(validationMessage);
      return;
    }

    try {
      await createTask(buildTaskPayload(createForm)).unwrap();
      closeCreateDialog();
      setPageSuccess("Görev başarıyla oluşturuldu.");
    } catch (error) {
      setCreateSubmitError(
        extractApiErrorMessage(error, "Görev oluşturulamadı. Lütfen tekrar deneyin."),
      );
    }
  };

  const openEditDialog = (task: Task) => {
    setPageError(null);
    setPageSuccess(null);
    setEditSubmitError(null);
    setEditTarget(task);
    setEditForm(taskToForm(task));
    setEditSelectedAssignee(task.assignee ? taskAssigneeToSelection(task.assignee) : null);
  };

  const closeEditDialog = () => {
    setEditTarget(null);
    setEditForm(null);
    setEditSelectedAssignee(null);
    setEditSubmitError(null);
  };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget || !editForm) {
      return;
    }

    setEditSubmitError(null);
    setPageSuccess(null);

    const validationMessage = validateTaskForm(editForm);
    if (validationMessage) {
      setEditSubmitError(validationMessage);
      return;
    }

    try {
      await updateTask({ id: editTarget.id, body: buildTaskPayload(editForm) }).unwrap();
      closeEditDialog();
      setPageSuccess("Görev bilgileri güncellendi.");
    } catch (error) {
      setEditSubmitError(
        extractApiErrorMessage(error, "Görev güncellenemedi. Lütfen tekrar deneyin."),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Görevler</h1>
          <p className="text-sm text-[#A0A0A0]">Backend Tasks API üzerinden görev takibi</p>
        </div>
        <Button
          type="button"
          className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          onClick={openCreateDialog}
          disabled={!canManageTasks}
          title={canManageTasks ? undefined : "Bu işlem için görev yönetim yetkisi gerekir."}
        >
          <Plus className="h-4 w-4" />
          Yeni Görev Oluştur
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
        <MetricCard icon={<CheckSquare className="h-5 w-5 text-[#AAFF01]" />} label="Toplam" value={meta.total} />
        <MetricCard icon={<Clock className="h-5 w-5 text-[#AAFF01]" />} label="Yapılacak" value={todoCount} />
        <MetricCard icon={<Clock className="h-5 w-5 text-orange-400" />} label="Devam Eden" value={inProgressCount} />
        <MetricCard icon={<AlertCircle className="h-5 w-5 text-blue-300" />} label="İncelemede" value={reviewCount} />
        <MetricCard icon={<AlertCircle className="h-5 w-5 text-red-300" />} label="Geciken" value={overdueCount} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-3 2xl:grid-cols-6">
          <div className="2xl:col-span-2">
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Proje</Label>
            <Select value={projectIdFilter} onValueChange={setProjectIdFilter} disabled={isProjectsLoading}>
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Projeler</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="2xl:col-span-2">
            <EmployeePicker
              idPrefix="task-assignee-filter"
              label="Atanan Çalışan"
              selectedAssignee={assigneeFilterSelection}
              selectedAssigneeId={assigneeFilterSelection?.id ?? ""}
              onSelect={(employee) => setAssigneeFilterSelection(employeeToAssigneeSelection(employee))}
              onClear={() => setAssigneeFilterSelection(null)}
              disabled={false}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Durum</Label>
            <Select value={statusFilter} onValueChange={(value: TaskStatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                {TASK_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getTaskStatusLabel(status)}
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
          <div className="flex items-end gap-2 2xl:col-span-6">
            <Button type="submit" variant="outline">
              Filtrele
            </Button>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Temizle
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
        <Table>
          <TableHeader className="bg-[#202020]">
            <TableRow className="border-white/[0.06] hover:bg-[#202020]">
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Görev</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Müşteri</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Proje</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Atanan</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Öncelik</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Deadline</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Durum</TableHead>
              <TableHead className="px-4 py-3 text-right text-[#A0A0A0]">Aksiyonlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="border-white/[0.06]">
                <TableCell colSpan={8} className="px-4 py-8 text-center text-[#A0A0A0]">
                  Görevler yükleniyor...
                </TableCell>
              </TableRow>
            )}

            {isListError && !isLoading && (
              <TableRow className="border-white/[0.06]">
                <TableCell colSpan={8} className="px-4 py-8 text-center text-red-300">
                  {extractApiErrorMessage(listError, "Görev listesi alınamadı. Lütfen tekrar deneyin.")}
                  <div className="mt-3">
                    <Button type="button" variant="outline" onClick={() => refetch()}>
                      Tekrar Dene
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isListError && tasks.length === 0 && (
              <TableRow className="border-white/[0.06]">
                <TableCell colSpan={8} className="px-4 py-8 text-center text-[#A0A0A0]">
                  Filtrelere uygun görev bulunamadı.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isListError &&
              tasks.map((task) => (
                <TableRow key={task.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                  <TableCell className="max-w-[320px] px-4 py-3">
                    <div className="font-medium text-white">{task.title}</div>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-[#A0A0A0]">{task.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-white">{getTaskClientName(task)}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-[#A0A0A0]">
                    {task.project?.name ?? shortId(task.projectId)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-white">{getTaskAssigneeName(task)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge className={getPriorityBadgeClass(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium text-white">{formatDate(task.dueDate)}</p>
                      <p className={`text-xs ${isTaskOverdue(task) ? "text-red-300" : "text-[#A0A0A0]"}`}>
                        {getTaskDueLabel(task)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge className={getTaskStatusBadgeClass(task.status)}>
                      {getTaskStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(task)}
                        disabled={!canManageTasks || mutating}
                      >
                        Düzenle
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/gorevler/${task.id}`}>Detay</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && !isListError && isFetching && (
        <p className="text-xs text-[#d2ff8a]">Görev listesi güncelleniyor...</p>
      )}

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? openCreateDialog() : closeCreateDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Görev kaydı backend Tasks API üzerinden oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
            {createSubmitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {createSubmitError}
              </div>
            )}
            <TaskFormFields
              idPrefix="create-task"
              form={createForm}
              projects={projects}
              selectedAssignee={createSelectedAssignee}
              onChange={updateCreateForm}
              onAssigneeSelect={selectCreateAssignee}
              onAssigneeClear={clearCreateAssignee}
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
                {isCreating ? "Oluşturuluyor..." : "Görev Oluştur"}
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
            <DialogTitle>Görev Güncelle</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Atanan kullanıcı ID boş bırakılırsa görev ataması kaldırılır.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4" noValidate>
              {editSubmitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {editSubmitError}
                </div>
              )}
              <TaskFormFields
                idPrefix="edit-task"
                form={editForm}
                projects={projects}
                selectedAssignee={editSelectedAssignee}
                onChange={updateEditForm}
                onAssigneeSelect={selectEditAssignee}
                onAssigneeClear={clearEditAssignee}
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
  icon: ReactNode;
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

function TaskFormFields({
  idPrefix,
  form,
  projects,
  selectedAssignee,
  onChange,
  onAssigneeSelect,
  onAssigneeClear,
  disabled,
}: {
  idPrefix: string;
  form: TaskFormState;
  projects: Project[];
  selectedAssignee: AssigneeSelection | null;
  onChange: (field: TaskFormField, value: TaskFormValue) => void;
  onAssigneeSelect: (employee: AdminUser) => void;
  onAssigneeClear: () => void;
  disabled: boolean;
}) {
  const projectOptions = getProjectOptions(projects, form.projectId);

  return (
    <>
      <div className="space-y-2">
        <Label>Proje</Label>
        <Select
          value={form.projectId}
          onValueChange={(value) => onChange("projectId", value)}
          disabled={disabled || projectOptions.length === 0}
        >
          <SelectTrigger className="border-white/[0.08] bg-[#202020]">
            <SelectValue placeholder="Proje seçin" />
          </SelectTrigger>
          <SelectContent>
            {projectOptions.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Görev Başlığı</Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          className="border-white/[0.08] bg-[#202020]"
          placeholder="Kampanya optimizasyonu"
          required
          minLength={2}
          maxLength={180}
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
          placeholder="Görev kapsamı ve notları"
          maxLength={2000}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Durum</Label>
          <Select
            value={form.status}
            onValueChange={(value: TaskStatus) => onChange("status", value)}
            disabled={disabled}
          >
            <SelectTrigger className="border-white/[0.08] bg-[#202020]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {getTaskStatusLabel(status)}
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
          <EmployeePicker
            idPrefix={`${idPrefix}-assignee`}
            label="Atanan Çalışan"
            selectedAssignee={selectedAssignee}
            selectedAssigneeId={form.assigneeUserId}
            onSelect={onAssigneeSelect}
            onClear={onAssigneeClear}
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

function EmployeePicker({
  idPrefix,
  label,
  selectedAssignee,
  selectedAssigneeId,
  onSelect,
  onClear,
  disabled,
}: {
  idPrefix: string;
  label: string;
  selectedAssignee: AssigneeSelection | null;
  selectedAssigneeId: string;
  onSelect: (employee: AdminUser) => void;
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

  const employeeQuery = useMemo<AdminUsersListQuery>(
    () => ({
      accountType: "EMPLOYEE",
      isActive: true,
      limit: EMPLOYEE_PICKER_LIMIT,
      search: search.length > 0 ? search : undefined,
    }),
    [search],
  );

  const {
    data: employeesResponse,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminUsersQuery(employeeQuery);

  const employees = (employeesResponse?.data ?? []).filter(
    (employee) => employee.accountType === "EMPLOYEE" && employee.status === "ACTIVE",
  );
  const selectedLabel = selectedAssignee
    ? formatAssigneeSelection(selectedAssignee)
    : selectedAssigneeId
      ? shortId(selectedAssigneeId)
      : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-search`}>{label}</Label>
      <Input
        id={`${idPrefix}-search`}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        className="border-white/[0.08] bg-[#202020]"
        placeholder="Çalışan ara..."
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
          <span>Aktif çalışanlar</span>
          {isFetching && !isLoading && <span>Güncelleniyor...</span>}
        </div>
        {isLoading && <div className="px-3 py-3 text-sm text-[#A0A0A0]">Çalışanlar yükleniyor...</div>}
        {!isLoading && isError && (
          <div className="space-y-2 px-3 py-3 text-sm text-red-200">
            <p>{extractApiErrorMessage(error, "Çalışan adayları alınamadı.")}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}
        {!isLoading && !isError && employees.length === 0 && (
          <div className="px-3 py-3 text-sm text-[#A0A0A0]">
            {search ? "Aramaya uygun aktif çalışan bulunamadı." : "Aktif çalışan bulunamadı."}
          </div>
        )}
        {!isLoading && !isError && employees.length > 0 && (
          <div className="divide-y divide-white/[0.06]">
            {employees.map((employee) => {
              const isSelected = selectedAssigneeId === employee.id;

              return (
                <button
                  key={employee.id}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected ? "bg-[#AAFF01]/10" : ""
                  }`}
                  onClick={() => onSelect(employee)}
                  disabled={disabled}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {employee.displayName?.trim() || shortId(employee.id)}
                    </span>
                    <span className="block truncate text-xs text-[#A0A0A0]">
                      {getRoleLabel(employee.role)}
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

function employeeToAssigneeSelection(employee: AdminUser): AssigneeSelection {
  return {
    id: employee.id,
    displayName: employee.displayName,
    roleLabel: getRoleLabel(employee.role),
  };
}

function taskAssigneeToSelection(assignee: Task["assignee"]): AssigneeSelection | null {
  if (!assignee) {
    return null;
  }

  return {
    id: assignee.id,
    displayName: assignee.displayName,
    roleLabel: getRoleLabel(assignee.role),
  };
}

function formatAssigneeSelection(assignee: AssigneeSelection): string {
  const displayName = assignee.displayName?.trim() || shortId(assignee.id);
  return assignee.roleLabel ? `${displayName} (${assignee.roleLabel})` : displayName;
}

function getProjectOptions(projects: Project[], selectedProjectId: string): Project[] {
  if (!selectedProjectId || projects.some((project) => project.id === selectedProjectId)) {
    return projects;
  }

  return [
    ...projects,
    {
      id: selectedProjectId,
      clientProfileId: "",
      name: shortId(selectedProjectId),
      slug: selectedProjectId,
      description: null,
      status: "PLANNED",
      priority: "MEDIUM",
      startDate: null,
      dueDate: null,
      createdAt: "",
      updatedAt: "",
      clientProfile: null,
    },
  ];
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

function validateTaskForm(form: TaskFormState): string | null {
  if (!form.projectId.trim()) {
    return "Proje seçimi gereklidir.";
  }

  if (!isValidUuid(form.projectId)) {
    return "Proje ID geçerli bir UUID olmalıdır.";
  }

  if (form.title.trim().length < 2) {
    return "Görev başlığı en az 2 karakter olmalıdır.";
  }

  return null;
}

function buildTaskPayload(form: TaskFormState): CreateTaskRequest {
  return {
    projectId: form.projectId.trim(),
    title: form.title.trim(),
    description: toNullableText(form.description),
    status: form.status,
    priority: form.priority,
    assigneeUserId: toNullableText(form.assigneeUserId),
    dueDate: form.dueDate || null,
  };
}

function taskToForm(task: Task): TaskFormState {
  return {
    projectId: task.projectId,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assigneeUserId: task.assigneeUserId ?? "",
    dueDate: formatDateInput(task.dueDate),
  };
}
