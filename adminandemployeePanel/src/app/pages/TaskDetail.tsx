import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, CheckSquare, Download, FolderOpen, Github, Plus, Trash2, UploadCloud } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { ClientApprovalRequestDialog } from "../features/clientApprovals/ClientApprovalRequestDialog";
import type {
  ClientApprovalComposerPreset,
  ClientApprovalContextOption,
} from "../features/clientApprovals/clientApprovalsTypes";
import { useAppSelector } from "../store/hooks";
import {
  hasAdminPermission,
  hasUserPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import {
  useCompleteProjectFileUploadMutation,
  useCreateProjectFileFolderMutation,
  useCreateProjectFileUploadSignatureMutation,
  useDeleteProjectFileMutation,
  useGetProjectAssigneeCandidatesQuery,
  useGetProjectFileFolderAssigneesQuery,
  useGetProjectFileFoldersQuery,
  useGetProjectFilesQuery,
  useGetProjectRepositoryQuery,
  useUpdateProjectFileFolderAssigneesMutation,
} from "../features/projects/projectsApi";
import type { ProjectFileVisibility } from "../features/projects/projectsTypes";
import { useGetDeliverySprintsQuery } from "../features/delivery/deliveryApi";
import {
  useCreateTaskWorkNoteMutation,
  useCreateTaskTodoMutation,
  useGetRelatedTaskCommitsQuery,
  useDeleteTaskTodoMutation,
  useGetTaskQuery,
  usePrepareTaskCodeMutation,
  useToggleTaskTodoMutation,
  useUpdateTaskMutation,
  useUpdateTaskTodoMutation,
} from "../features/tasks/tasksApi";
import type { Task, TaskStatus, UpdateTaskRequest } from "../features/tasks/tasksTypes";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
  getTaskCompletion,
  getTaskCompletionLabel,
  getTaskCompletionPercent,
  getTaskWorkNotes,
  getTaskTodos,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskAssigneeName,
  getTaskClientName,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  isTaskOverdue,
  isUuid,
  shortId,
} from "../features/tasks/tasksUtils";
import { useCreateClientApprovalMutation } from "../features/clientApprovals/clientApprovalsApi";

export function TaskDetail() {
  const { id } = useParams();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const isEmployeeScope = location.pathname.startsWith("/employee/");
  const listPath = isEmployeeScope ? "/employee/gorevlerim" : "/gorevler";
  const canReadTasks = hasUserPermission(currentUser, [
    "tasks.read.any",
    "tasks.manage.any",
    "tasks.read",
    "tasks.read.assigned",
  ]);
  const canManageTasks = hasAdminPermission(currentUser, [
    "tasks.manage.any",
    "tasks.manage",
  ]);
  const canManageAssignedTasks = hasUserPermission(currentUser, ["tasks.manage.assigned"]);
  const canManageTaskDetails = canManageTasks || canManageAssignedTasks;
  const canManageTaskTodos = canManageTasks || hasUserPermission(currentUser, ["tasks.todos.manage.assigned"]);
  const canUpdateOwnTask =
    currentUser?.accountType === "EMPLOYEE" &&
    hasUserPermission(currentUser, ["tasks.update.assigned", "tasks.update.own"]);
  const canManageApprovals = hasUserPermission(currentUser, ["approvals.manage"]);
  const canReadRepository = hasUserPermission(currentUser, [
    "integrations.github.read.any",
    "integrations.github.manage.any",
    "integrations.github.read.assigned",
  ]);
  const canManageProjectFiles = hasUserPermission(currentUser, [
    "projects.files.manage.any",
    "projects.files.manage.assigned",
  ]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoVisibility, setNewTodoVisibility] = useState<"INTERNAL" | "CLIENT_VISIBLE">(
    "INTERNAL",
  );
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState("");
  const [todoActionError, setTodoActionError] = useState<string | null>(null);
  const [taskEditForm, setTaskEditForm] = useState<TaskEditFormState | null>(null);
  const [taskEditFeedback, setTaskEditFeedback] = useState<string | null>(null);
  const [taskEditError, setTaskEditError] = useState<string | null>(null);
  const [workNoteDraft, setWorkNoteDraft] = useState("");
  const [workNoteFeedback, setWorkNoteFeedback] = useState<string | null>(null);
  const [prepareCodeFeedback, setPrepareCodeFeedback] = useState<string | null>(null);
  const [designFolderId, setDesignFolderId] = useState<string>("");
  const [designFolderFeedback, setDesignFolderFeedback] = useState<string | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFileTitle, setDesignFileTitle] = useState("");
  const [designFileDescription, setDesignFileDescription] = useState("");
  const [designFileVisibility, setDesignFileVisibility] = useState<ProjectFileVisibility>("INTERNAL");
  const [designShareMode, setDesignShareMode] = useState<"NONE" | "APPROVAL" | "INFORMATION">("NONE");
  const [designShareMessage, setDesignShareMessage] = useState("");
  const [designUploadFeedback, setDesignUploadFeedback] = useState<string | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalDialogPreset, setApprovalDialogPreset] = useState<ClientApprovalComposerPreset | undefined>(
    undefined,
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const designFileInputRef = useRef<HTMLInputElement | null>(null);
  const ensuredDesignFolderKeyRef = useRef<string | null>(null);
  const syncedDesignFolderAssigneeRef = useRef<string | null>(null);

  const isValidId = typeof id === "string" && isUuid(id);

  const {
    data: task,
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetTaskQuery(id ?? "", {
    skip: !canReadTasks || !isValidId,
  });
  const { data: repository } = useGetProjectRepositoryQuery(task?.projectId ?? "", {
    skip: !canReadRepository || !task?.projectId,
  });
  const { data: relatedCommits } = useGetRelatedTaskCommitsQuery(
    { taskId: task?.id ?? "" },
    { skip: !canReadRepository || !repository || !task?.id },
  );
  const { data: assigneeCandidates = [] } = useGetProjectAssigneeCandidatesQuery(
    task?.projectId ?? "",
    {
      skip: !task?.projectId || (!canManageTaskDetails && !canManageApprovals),
    },
  );
  const { data: deliverySprintsResponse } = useGetDeliverySprintsQuery(
    { projectId: task?.projectId ?? "", limit: 100 },
    {
      skip: !task?.projectId || !canManageTaskDetails,
    },
  );
  const deliverySprints = deliverySprintsResponse?.data ?? [];
  const isDesignTask = useMemo(() => isDesignTaskType(task), [task]);
  const designTaskFolderName = useMemo(
    () => (task ? buildDesignTaskFolderName(task) : ""),
    [task],
  );
  const { data: projectFolders = [] } = useGetProjectFileFoldersQuery(
    { projectId: task?.projectId ?? "" },
    { skip: !task?.projectId || !isDesignTask || !canManageProjectFiles },
  );
  const { data: designFolderAssignees = [] } = useGetProjectFileFolderAssigneesQuery(
    { projectId: task?.projectId ?? "", folderId: designFolderId },
    {
      skip:
        !task?.projectId ||
        !isDesignTask ||
        !canManageProjectFiles ||
        designFolderId.length === 0,
    },
  );
  const { data: designFilesResponse, refetch: refetchDesignFiles, isFetching: isFetchingDesignFiles } = useGetProjectFilesQuery(
    { projectId: task?.projectId ?? "", folderId: designFolderId, limit: 100 },
    {
      skip:
        !task?.projectId ||
        !isDesignTask ||
        !canManageProjectFiles ||
        designFolderId.length === 0,
    },
  );
  const designFiles = designFilesResponse?.data ?? [];
  const approvalContextOptions = useMemo<ClientApprovalContextOption[]>(() => {
    if (!task) {
      return [];
    }

    return [
      {
        key: `task:${task.id}`,
        label: `Görev · ${task.title}`,
        description: task.sprint?.name
          ? `${task.sprint.name} · ${getTaskStatusLabel(task.status)}`
          : getTaskStatusLabel(task.status),
        entityType: "TASK",
        entityId: task.id,
        actionPayload: {
          contextType: "Görev",
          contextLabel: task.title,
          taskId: task.id,
          taskStatus: task.status,
          taskCode: task.code ?? null,
          completionPercent: task.completion?.percent ?? 0,
        },
      },
      ...designFiles.map((file) => ({
        key: `design:${file.id}`,
        label: `Tasarım Dosyası · ${file.title}`,
        description: file.folder?.name
          ? `${file.originalFileName} · ${file.folder.name}`
          : file.originalFileName,
        entityType: "DESIGN_ASSET" as const,
        entityId: file.id,
        actionPayload: {
          contextType: "Tasarım Dosyası",
          contextLabel: file.title,
          projectFileId: file.id,
          fileName: file.originalFileName,
          fileUrl: file.secureUrl,
          folderName: file.folder?.name ?? null,
        },
      })),
    ];
  }, [designFiles, task]);

  const [createProjectFileFolder, { isLoading: isCreatingDesignFolder }] = useCreateProjectFileFolderMutation();
  const [updateProjectFileFolderAssignees, { isLoading: isAssigningDesignFolder }] =
    useUpdateProjectFileFolderAssigneesMutation();
  const [createProjectFileUploadSignature, { isLoading: isCreatingDesignUploadSignature }] =
    useCreateProjectFileUploadSignatureMutation();
  const [completeProjectFileUpload, { isLoading: isCompletingDesignUpload }] =
    useCompleteProjectFileUploadMutation();
  const [deleteProjectFile, { isLoading: isDeletingDesignFile }] = useDeleteProjectFileMutation();
  const [createTaskTodo, { isLoading: isCreatingTodo }] = useCreateTaskTodoMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [createTaskWorkNote, { isLoading: isCreatingWorkNote }] = useCreateTaskWorkNoteMutation();
  const [createClientApproval, { isLoading: isCreatingClientApproval }] = useCreateClientApprovalMutation();
  const [prepareTaskCode, { isLoading: isPreparingCode }] = usePrepareTaskCodeMutation();
  const [updateTaskTodo, { isLoading: isUpdatingTodo }] = useUpdateTaskTodoMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [deleteTaskTodo, { isLoading: isDeletingTodo }] = useDeleteTaskTodoMutation();

  useEffect(() => {
    if (!isDesignTask || !task?.id) {
      setDesignFolderId("");
      setDesignFolderFeedback(null);
      ensuredDesignFolderKeyRef.current = null;
      syncedDesignFolderAssigneeRef.current = null;
      return;
    }

    if (!task.assigneeUserId) {
      syncedDesignFolderAssigneeRef.current = null;
    }
  }, [isDesignTask, task?.id, task?.assigneeUserId]);

  useEffect(() => {
    if (!isDesignTask || !task?.projectId || !canManageProjectFiles || !designTaskFolderName) {
      return;
    }
    const existing = projectFolders.find(
      (folder) => folder.name.trim().toLowerCase() === designTaskFolderName.trim().toLowerCase(),
    );
    if (existing) {
      setDesignFolderId((prev) => (prev === existing.id ? prev : existing.id));
      setDesignFolderFeedback(null);
      return;
    }

    const ensureKey = `${task.id}:${designTaskFolderName}`;
    if (ensuredDesignFolderKeyRef.current === ensureKey) {
      return;
    }
    ensuredDesignFolderKeyRef.current = ensureKey;

    let isCancelled = false;
    (async () => {
      try {
        const createdFolder = await createProjectFileFolder({
          projectId: task.projectId,
          name: designTaskFolderName,
        }).unwrap();
        if (!isCancelled) {
          setDesignFolderId(createdFolder.id);
          setDesignFolderFeedback("Bu tasarım görevi için klasör otomatik oluşturuldu.");
        }
      } catch (error) {
        if (!isCancelled) {
          setDesignFolderFeedback(
            extractApiErrorMessage(error, "Tasarım klasörü otomatik oluşturulamadı."),
          );
          ensuredDesignFolderKeyRef.current = null;
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    canManageProjectFiles,
    createProjectFileFolder,
    designTaskFolderName,
    isDesignTask,
    projectFolders,
    task?.id,
    task?.projectId,
  ]);

  useEffect(() => {
    if (
      !task?.projectId ||
      !designFolderId ||
      !task.assigneeUserId ||
      !canManageProjectFiles ||
      !isDesignTask
    ) {
      return;
    }

    if (designFolderAssignees.length === 0) {
      return;
    }

    const assignee = designFolderAssignees.find(
      (item) => item.id === task.assigneeUserId,
    );
    if (!assignee || assignee.isAssigned) {
      return;
    }

    const syncKey = `${designFolderId}:${task.assigneeUserId}`;
    if (syncedDesignFolderAssigneeRef.current === syncKey) {
      return;
    }
    syncedDesignFolderAssigneeRef.current = syncKey;

    const assignedUserIds = designFolderAssignees
      .filter((item) => item.isAssigned)
      .map((item) => item.id);
    const nextUserIds = Array.from(new Set([...assignedUserIds, task.assigneeUserId]));

    void updateProjectFileFolderAssignees({
      projectId: task.projectId,
      folderId: designFolderId,
      userIds: nextUserIds,
    })
      .unwrap()
      .catch(() => {
        syncedDesignFolderAssigneeRef.current = null;
      });
  }, [
    canManageProjectFiles,
    designFolderAssignees,
    designFolderId,
    isDesignTask,
    task?.assigneeUserId,
    task?.projectId,
    updateProjectFileFolderAssignees,
  ]);

  useEffect(() => {
    if (!task) {
      setTaskEditForm(null);
      return;
    }

    setTaskEditForm(createTaskEditForm(task));
    setTaskEditError(null);
    setTaskEditFeedback(null);
  }, [task]);

  if (!canReadTasks) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz görev kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Görev detayı yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(error, "Görev detayı yüklenemedi. Lütfen tekrar deneyin.")}
          <div className="mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Görev kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  const taskDetail = task;
  const todos = getTaskTodos(taskDetail);
  const completion = getTaskCompletion(taskDetail);
  const completionPercent = getTaskCompletionPercent(taskDetail);
  const canEditOwnTaskStatus = canUpdateOwnTask && taskDetail.assigneeUserId === currentUser?.id;
  const canEditTaskDetails = canManageTaskDetails || canEditOwnTaskStatus;
  const canToggleTodos = canManageTaskTodos || canEditOwnTaskStatus;
  const isTodoMutating = isCreatingTodo || isUpdatingTodo || isTogglingTodo || isDeletingTodo;
  const isTaskEditBusy = isUpdatingTask || isFetching;
  const savedWorkNotes = getTaskWorkNotes(taskDetail);

  async function handleTaskEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskEditForm) {
      return;
    }

    if (canManageTaskDetails && taskEditForm.title.trim().length < 2) {
      setTaskEditError("Görev başlığı en az 2 karakter olmalıdır.");
      return;
    }

    const payload = buildTaskDetailUpdatePayload(taskDetail, taskEditForm, canManageTaskDetails);
    if (!payload) {
      setTaskEditError(null);
      setTaskEditFeedback("Kaydedilecek bir değişiklik bulunmuyor.");
      return;
    }

    try {
      setTaskEditError(null);
      setTaskEditFeedback(null);
      await updateTask({ id: taskDetail.id, body: payload }).unwrap();
      setTaskEditFeedback(
        canManageTaskDetails
          ? "Görev alanları güncellendi."
          : "Görev durumu güncellendi.",
      );
    } catch (error) {
      setTaskEditError(extractApiErrorMessage(error, "Görev alanları güncellenemedi."));
    }
  }

  async function handleCreateTodoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTodoTitle.trim();

    if (!title) {
      setTodoActionError("Todo başlığı gereklidir.");
      return;
    }

    setTodoActionError(null);

    try {
      await createTaskTodo({
        taskId: taskDetail.id,
        body: { title, visibility: newTodoVisibility },
      }).unwrap();
      setNewTodoTitle("");
      setNewTodoVisibility("INTERNAL");
    } catch (error) {
      setTodoActionError(extractApiErrorMessage(error, "Todo eklenemedi."));
    }
  }

  async function handleToggleTodo(todoId: string, isCompleted: boolean) {
    setTodoActionError(null);

    try {
      await toggleTaskTodo({
        taskId: taskDetail.id,
        todoId,
        body: { isCompleted: !isCompleted },
      }).unwrap();
    } catch (error) {
      setTodoActionError(extractApiErrorMessage(error, "Todo durumu güncellenemedi."));
    }
  }

  async function handleUpdateTodo(todoId: string) {
    const title = editingTodoTitle.trim();

    if (!title) {
      setTodoActionError("Todo başlığı gereklidir.");
      return;
    }

    setTodoActionError(null);

    try {
      await updateTaskTodo({ taskId: taskDetail.id, todoId, body: { title } }).unwrap();
      setEditingTodoId(null);
      setEditingTodoTitle("");
    } catch (error) {
      setTodoActionError(extractApiErrorMessage(error, "Todo güncellenemedi."));
    }
  }

  async function handleDeleteTodo(todoId: string) {
    setTodoActionError(null);

    try {
      await deleteTaskTodo({ taskId: taskDetail.id, todoId }).unwrap();
    } catch (error) {
      setTodoActionError(extractApiErrorMessage(error, "Todo silinemedi."));
    }
  }

  async function saveWorkNoteDraft() {
    const note = workNoteDraft.trim();
    if (!note) {
      setWorkNoteFeedback("Not girmeden kaydetme yapılamaz.");
      return;
    }
    try {
      setWorkNoteFeedback(null);
      await createTaskWorkNote({
        taskId: taskDetail.id,
        body: { note },
      }).unwrap();
      setWorkNoteDraft("");
      setWorkNoteFeedback("Çalışma notu göreve kaydedildi.");
    } catch (error) {
      setWorkNoteFeedback(extractApiErrorMessage(error, "Çalışma notu kaydedilemedi."));
    }
  }

  async function handlePrepareCode() {
    try {
      setPrepareCodeFeedback(null);
      const preparedTask = await prepareTaskCode({
        taskId: taskDetail.id,
        body: {
          notes: workNoteDraft.trim() || undefined,
        },
      }).unwrap();
      setPrepareCodeFeedback(
        preparedTask.branchName
          ? `Branch önerisi hazırlandı: ${preparedTask.branchName}`
          : "Task kod hazırlığı tamamlandı.",
      );
    } catch (error) {
      setPrepareCodeFeedback(extractApiErrorMessage(error, "Task kod hazırlığı yapılamadı."));
    }
  }

  function handleDesignFileDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDesignFileDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
  }

  function handleDesignFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (!droppedFile) {
      return;
    }
    setDesignFile(droppedFile);
    if (!designFileTitle.trim()) {
      setDesignFileTitle(droppedFile.name);
    }
  }

  async function handleDesignFileUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskDetail.projectId || !isDesignTask) {
      return;
    }
    if (!designFolderId) {
      setDesignUploadFeedback("Önce görev için klasör oluşturulmalı.");
      return;
    }
    if (!designFile) {
      setDesignUploadFeedback("Yüklenecek dosyayı seçin.");
      return;
    }

    const title = designFileTitle.trim() || designFile.name;

    try {
      setDesignUploadFeedback(null);
      const signature = await createProjectFileUploadSignature({
        projectId: taskDetail.projectId,
        fileName: designFile.name,
        title,
        description: designFileDescription.trim() || null,
        mimeType: designFile.type || "application/octet-stream",
        bytes: designFile.size,
        category: "BRAND_ASSET",
        visibility: designFileVisibility,
        folderId: designFolderId,
      }).unwrap();

      const formData = new FormData();
      formData.set("file", designFile);
      formData.set("api_key", signature.apiKey);
      formData.set("timestamp", String(signature.timestamp));
      formData.set("signature", signature.signature);
      formData.set("public_id", signature.publicId);
      if (signature.overwrite) {
        formData.set("overwrite", "true");
      }

      const uploadResponse = await fetch(signature.uploadUrl, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        let uploadErrorMessage = "Cloudinary upload failed.";
        try {
          const uploadErrorJson = (await uploadResponse.json()) as {
            error?: { message?: string };
          };
          if (uploadErrorJson.error?.message) {
            uploadErrorMessage = `Cloudinary upload failed: ${uploadErrorJson.error.message}`;
          }
        } catch {
          // Keep generic message
        }
        throw new Error(uploadErrorMessage);
      }

      const uploadJson = (await uploadResponse.json()) as {
        secure_url: string;
        resource_type: string;
        format?: string;
        bytes: number;
      };

      const uploadedFile = await completeProjectFileUpload({
        projectId: taskDetail.projectId,
        originalFileName: designFile.name,
        title,
        description: designFileDescription.trim() || null,
        publicId: signature.publicId,
        secureUrl: uploadJson.secure_url,
        resourceType: uploadJson.resource_type ?? "raw",
        format: uploadJson.format ?? null,
        bytes: uploadJson.bytes ?? designFile.size,
        mimeType: designFile.type || "application/octet-stream",
        category: "BRAND_ASSET",
        visibility: designFileVisibility,
        folderId: designFolderId,
      }).unwrap();

      if (
        designFileVisibility === "CLIENT_VISIBLE" &&
        designShareMode !== "NONE" &&
        taskDetail.project?.clientProfileId
      ) {
        const fallbackMessage =
          designShareMode === "APPROVAL"
            ? `${title} tasarım dosyası paylaşıldı. Onayınızı bekliyoruz.`
            : `${title} tasarım dosyası bilgilendirme amaçlı paylaşıldı.`;

        await createClientApproval({
          clientProfileId: taskDetail.project.clientProfileId,
          projectId: taskDetail.projectId,
          type: designShareMode === "APPROVAL" ? "DESIGN_APPROVAL" : "INFORMATION",
          title,
          message: designShareMessage.trim() || fallbackMessage,
          entityType: "PROJECT_FILE",
          entityId: uploadedFile.id,
          requiresExplicitApproval: designShareMode === "APPROVAL",
          actionPayload: {
            clientVisiblePayload: {
              fileId: uploadedFile.id,
              fileTitle: uploadedFile.title,
              fileUrl: uploadedFile.secureUrl,
              category: uploadedFile.category,
            },
          },
        }).unwrap();
      }

      setDesignFile(null);
      setDesignFileTitle("");
      setDesignFileDescription("");
      setDesignShareMessage("");
      setDesignShareMode("NONE");
      setDesignUploadFeedback("Tasarım dosyası yüklendi.");
      await refetchDesignFiles();
    } catch (error) {
      setDesignUploadFeedback(
        extractApiErrorMessage(error, "Tasarım dosyası yüklenemedi."),
      );
    }
  }

  async function handleDeleteDesignFile(fileId: string) {
    if (!taskDetail.projectId) {
      return;
    }
    try {
      setDesignUploadFeedback(null);
      await deleteProjectFile({
        projectId: taskDetail.projectId,
        fileId,
      }).unwrap();
      await refetchDesignFiles();
    } catch (error) {
      setDesignUploadFeedback(
        extractApiErrorMessage(error, "Dosya silinemedi."),
      );
    }
  }

  function openTaskApprovalDialog(mode: "APPROVAL" | "INFORMATION") {
    setApprovalDialogPreset({
      type: mode === "APPROVAL" ? "TASK_APPROVAL" : "INFORMATION",
      requiresExplicitApproval: mode === "APPROVAL",
      title:
        mode === "APPROVAL"
          ? `${taskDetail.title} için müşteri onayı`
          : `${taskDetail.title} hakkında bilgilendirme`,
      contextKey: approvalContextOptions[0]?.key,
    });
    setIsApprovalDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">{task.title}</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              {task.project?.name ?? shortId(task.projectId)} • {getTaskClientName(task)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getTaskStatusBadgeClass(task.status)}>
              {getTaskStatusLabel(task.status)}
            </Badge>
            <Badge className={getPriorityBadgeClass(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
        </div>
        {task.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-[#D8D8D8]">{task.description}</p>
        )}
      </Card>

      {canManageApprovals ? (
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Müşteri Onay / Bilgilendirme</h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                Görev çıktısı veya tasarım dosyası bağlamında müşteriye onay ya da bilgilendirme iletin.
              </p>
            </div>
            <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
              {approvalContextOptions.length} bağlam
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              className="rounded-2xl border border-[#AAFF01]/20 bg-[#AAFF01]/10 p-4 text-left transition hover:bg-[#AAFF01]/15"
              onClick={() => openTaskApprovalDialog("APPROVAL")}
            >
              <p className="text-sm font-semibold text-[#E8FFC2]">Müşteri Onayı İste</p>
              <p className="mt-2 text-xs leading-5 text-[#D7E8B1]">
                Task sonucu veya bağlı tasarım dosyası için açık onay talebi oluşturun.
              </p>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-[#202020] p-4 text-left transition hover:border-white/15 hover:bg-[#242424]"
              onClick={() => openTaskApprovalDialog("INFORMATION")}
            >
              <p className="text-sm font-semibold text-white">Bilgilendirme Gönder</p>
              <p className="mt-2 text-xs leading-5 text-[#A0A0A0]">
                Müşteriye sadece görünür bir bilgilendirme kaydı bırakın, onay zorunlu olmasın.
              </p>
            </button>
          </div>
        </Card>
      ) : null}

      {canEditTaskDetails && taskEditForm ? (
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Görev Düzenleme</h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                {canManageTaskDetails
                  ? "Durum, öncelik, sprint, atama ve temel görev alanlarını güncelleyebilirsiniz."
                  : "Bu görev size atalıysa durumunu ve checklist ilerlemesini güncelleyebilirsiniz."}
              </p>
            </div>
            <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
              {canManageTaskDetails ? "PM / Admin" : "Own Task"}
            </Badge>
          </div>

          <form onSubmit={handleTaskEditSubmit} className="space-y-4">
            {canManageTaskDetails ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="task-edit-title">
                    Görev Başlığı
                  </label>
                  <Input
                    id="task-edit-title"
                    value={taskEditForm.title}
                    onChange={(event) => {
                      setTaskEditForm((prev) =>
                        prev ? { ...prev, title: event.target.value } : prev,
                      );
                      setTaskEditFeedback(null);
                      setTaskEditError(null);
                    }}
                    className="border-white/[0.08] bg-[#202020]"
                    maxLength={180}
                    disabled={isTaskEditBusy}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-white"
                    htmlFor="task-edit-description"
                  >
                    Açıklama
                  </label>
                  <Textarea
                    id="task-edit-description"
                    value={taskEditForm.description}
                    onChange={(event) => {
                      setTaskEditForm((prev) =>
                        prev ? { ...prev, description: event.target.value } : prev,
                      );
                      setTaskEditFeedback(null);
                      setTaskEditError(null);
                    }}
                    className="min-h-24 border-white/[0.08] bg-[#202020]"
                    maxLength={2000}
                    disabled={isTaskEditBusy}
                  />
                </div>
              </>
            ) : null}

            <div className={`grid gap-4 ${canManageTaskDetails ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-1"}`}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white" htmlFor="task-edit-status">
                  Durum
                </label>
                <select
                  id="task-edit-status"
                  value={taskEditForm.status}
                  onChange={(event) => {
                    setTaskEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: event.target.value as TaskStatus,
                          }
                        : prev,
                    );
                    setTaskEditFeedback(null);
                    setTaskEditError(null);
                  }}
                  className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
                  disabled={isTaskEditBusy}
                >
                  {["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"].map((status) => (
                    <option key={status} value={status}>
                      {getTaskStatusLabel(status as TaskStatus)}
                    </option>
                  ))}
                </select>
              </div>

              {canManageTaskDetails ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white" htmlFor="task-edit-priority">
                      Öncelik
                    </label>
                    <select
                      id="task-edit-priority"
                      value={taskEditForm.priority}
                      onChange={(event) => {
                        setTaskEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                priority: event.target.value as Task["priority"],
                              }
                            : prev,
                        );
                        setTaskEditFeedback(null);
                        setTaskEditError(null);
                      }}
                      className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
                      disabled={isTaskEditBusy}
                    >
                      {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                        <option key={priority} value={priority}>
                          {getPriorityLabel(priority as Task["priority"])}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white" htmlFor="task-edit-sprint">
                      Sprint
                    </label>
                    <select
                      id="task-edit-sprint"
                      value={taskEditForm.sprintId}
                      onChange={(event) => {
                        setTaskEditForm((prev) =>
                          prev ? { ...prev, sprintId: event.target.value } : prev,
                        );
                        setTaskEditFeedback(null);
                        setTaskEditError(null);
                      }}
                      className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
                      disabled={isTaskEditBusy}
                    >
                      <option value="">Sprint atanmamış</option>
                      {deliverySprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white" htmlFor="task-edit-due-date">
                      Deadline
                    </label>
                    <Input
                      id="task-edit-due-date"
                      type="date"
                      value={taskEditForm.dueDate}
                      onChange={(event) => {
                        setTaskEditForm((prev) =>
                          prev ? { ...prev, dueDate: event.target.value } : prev,
                        );
                        setTaskEditFeedback(null);
                        setTaskEditError(null);
                      }}
                      className="border-white/[0.08] bg-[#202020]"
                      disabled={isTaskEditBusy}
                    />
                  </div>
                </>
              ) : null}
            </div>

            {canManageTaskDetails ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white" htmlFor="task-edit-assignee">
                  Atanan Çalışan
                </label>
                <select
                  id="task-edit-assignee"
                  value={taskEditForm.assigneeUserId}
                  onChange={(event) => {
                    setTaskEditForm((prev) =>
                      prev ? { ...prev, assigneeUserId: event.target.value } : prev,
                    );
                    setTaskEditFeedback(null);
                    setTaskEditError(null);
                  }}
                  className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
                  disabled={isTaskEditBusy}
                >
                  <option value="">Atama yok</option>
                  {assigneeCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {(candidate.displayName?.trim() || shortId(candidate.id))} ({candidate.role})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {taskEditError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {taskEditError}
              </div>
            ) : null}
            {taskEditFeedback ? (
              <div className="rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-2 text-sm text-[#d2ff8a]">
                {taskEditFeedback}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              {canManageTaskDetails ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isTaskEditBusy}
                  onClick={() => {
                    setTaskEditForm(createTaskEditForm(taskDetail));
                    setTaskEditFeedback(null);
                    setTaskEditError(null);
                  }}
                >
                  Formu Sıfırla
                </Button>
              ) : null}
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isTaskEditBusy}
              >
                {isUpdatingTask ? "Kaydediliyor..." : canManageTaskDetails ? "Değişiklikleri Kaydet" : "Durumu Güncelle"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Todo Listesi</h2>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              {getTaskCompletionLabel(task)} · %{completionPercent}
            </p>
          </div>
          <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
            {completion.completedTodos}/{completion.totalTodos}
          </Badge>
        </div>

        <Progress value={completionPercent} className="mb-5 h-2" />

        {todoActionError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {todoActionError}
          </div>
        )}

        {canManageTaskTodos && (
          <form onSubmit={handleCreateTodoSubmit} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              aria-label="Yeni todo"
              value={newTodoTitle}
              onChange={(event) => setNewTodoTitle(event.target.value)}
              className="border-white/[0.08] bg-[#202020]"
              placeholder="Yeni todo ekle"
              maxLength={180}
              disabled={isTodoMutating}
            />
            <select
              aria-label="Yeni todo görünürlüğü"
              value={newTodoVisibility}
              onChange={(event) =>
                setNewTodoVisibility(event.target.value === "CLIENT_VISIBLE" ? "CLIENT_VISIBLE" : "INTERNAL")
              }
              className="h-10 rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
              disabled={isTodoMutating}
            >
              <option value="INTERNAL">Internal</option>
              <option value="CLIENT_VISIBLE">Client Visible</option>
            </select>
            <Button
              type="submit"
              className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
              disabled={isTodoMutating}
            >
              <Plus className="h-4 w-4" />
              Todo Ekle
            </Button>
          </form>
        )}

        {todos.length === 0 && (
          <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-4 text-sm text-[#A0A0A0]">
            Bu görev için todo bulunmuyor.
          </p>
        )}

        {todos.length > 0 && (
          <div className="divide-y divide-white/[0.06] rounded-lg border border-white/[0.06] bg-[#202020]">
            {todos.map((todo) => {
              const isEditing = editingTodoId === todo.id;

              return (
                <div key={todo.id} className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Checkbox
                      checked={todo.isCompleted}
                      onCheckedChange={() => void handleToggleTodo(todo.id, todo.isCompleted)}
                      disabled={!canToggleTodos || isTodoMutating}
                      className="border-white/[0.18] data-[state=checked]:border-[#AAFF01] data-[state=checked]:bg-[#AAFF01] data-[state=checked]:text-[#131313]"
                      aria-label={`${todo.title} durumunu değiştir`}
                    />
                    {isEditing ? (
                      <Input
                        aria-label="Todo başlığı"
                        value={editingTodoTitle}
                        onChange={(event) => setEditingTodoTitle(event.target.value)}
                        className="border-white/[0.08] bg-[#1A1A1A]"
                        maxLength={180}
                        disabled={isTodoMutating}
                      />
                    ) : (
                      <div className="min-w-0">
                        <span
                          className={`block truncate text-sm ${
                            todo.isCompleted ? "text-[#A0A0A0] line-through" : "text-white"
                          }`}
                        >
                          {todo.title}
                        </span>
                        <span className="mt-1 inline-flex rounded-md border border-white/[0.12] px-2 py-0.5 text-[10px] text-[#A0A0A0]">
                          {todo.visibility === "CLIENT_VISIBLE" ? "Client Visible" : "Internal"}
                        </span>
                      </div>
                    )}
                  </div>

                  {canManageTaskTodos && (
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void handleUpdateTodo(todo.id)}
                            disabled={isTodoMutating}
                          >
                            Kaydet
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTodoId(null);
                              setEditingTodoTitle("");
                            }}
                            disabled={isTodoMutating}
                          >
                            Vazgeç
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTodoId(todo.id);
                              setEditingTodoTitle(todo.title);
                              setTodoActionError(null);
                            }}
                            disabled={isTodoMutating}
                          >
                            Düzenle
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-red-200"
                            onClick={() => void handleDeleteTodo(todo.id)}
                            disabled={isTodoMutating}
                          >
                            <Trash2 className="h-3 w-3" />
                            Sil
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Yapılanlar / Çalışma Notu</h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                Geliştirici veya proje yöneticisi olarak göreve iş notu bırakabilirsiniz.
              </p>
            </div>
            <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
              Internal
            </Badge>
          </div>

          <Textarea
            value={workNoteDraft}
            onChange={(event) => {
              setWorkNoteDraft(event.target.value);
              setWorkNoteFeedback(null);
            }}
            className="min-h-32 border-white/[0.08] bg-[#202020]"
            placeholder="Bug fix, test, deploy veya entegrasyon sırasında yapılanları yazın..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#A0A0A0]">
              {task.code && <p>Task Kodu: <span className="font-mono text-white">{task.code}</span></p>}
              {task.branchName && <p>Önerilen Branch: <span className="font-mono text-white">{task.branchName}</span></p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void handlePrepareCode()} disabled={isPreparingCode}>
                Kod Hazırlığı
              </Button>
              <Button type="button" variant="outline" onClick={() => void saveWorkNoteDraft()} disabled={isCreatingWorkNote}>
                Notu Kaydet
              </Button>
            </div>
          </div>
          {workNoteFeedback && <p className="mt-3 text-sm text-[#d2ff8a]">{workNoteFeedback}</p>}
          {prepareCodeFeedback && <p className="mt-2 text-sm text-[#8dd8ff]">{prepareCodeFeedback}</p>}

          {savedWorkNotes.length > 0 && (
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-5">
              {savedWorkNotes.map((note) => (
                <div key={note.id} className="rounded-lg border border-white/[0.06] bg-[#202020] p-3">
                  <p className="whitespace-pre-wrap text-sm text-[#E5E5E5]">{note.body}</p>
                  <p className="mt-2 text-xs text-[#A0A0A0]">
                    {note.authorName ?? "Ekip"} · {formatDateTime(note.createdAt ?? null)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {isDesignTask ? (
          <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Tasarım Klasörü</h2>
                <p className="mt-1 text-sm text-[#A0A0A0]">
                  Bu tasarım görevi için klasör otomatik açılır ve dosyalar drag&drop ile yüklenir.
                </p>
              </div>
              <FolderOpen className="h-4 w-4 text-[#d2ff8a]" />
            </div>

            {!canManageProjectFiles ? (
              <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-4 text-sm text-[#A0A0A0]">
                Tasarım dosyası yüklemek için proje dosya yönetim yetkisi gerekiyor.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-3">
                  <p className="text-sm text-white">
                    Klasör:{" "}
                    <span className="font-mono text-[#d2ff8a]">
                      {designTaskFolderName || "—"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#A0A0A0]">
                    Proje: {task.project?.name ?? shortId(task.projectId)}
                  </p>
                  {designFolderFeedback ? (
                    <p className="mt-2 text-xs text-[#d2ff8a]">{designFolderFeedback}</p>
                  ) : null}
                  {task.assigneeUserId ? (
                    <p className="mt-2 text-xs text-[#A0A0A0]">
                      Atanan çalışan için klasör erişimi otomatik senkronlanır.
                    </p>
                  ) : null}
                </div>

                <form onSubmit={(event) => void handleDesignFileUpload(event)} className="space-y-3">
                  <Input
                    value={designFileTitle}
                    onChange={(event) => setDesignFileTitle(event.target.value)}
                    placeholder="Dosya başlığı"
                    className="border-white/[0.08] bg-[#202020]"
                  />
                  <Input
                    value={designFileDescription}
                    onChange={(event) => setDesignFileDescription(event.target.value)}
                    placeholder="Kısa açıklama (opsiyonel)"
                    className="border-white/[0.08] bg-[#202020]"
                  />
                  <select
                    value={designFileVisibility}
                    onChange={(event) =>
                      setDesignFileVisibility(
                        event.target.value === "CLIENT_VISIBLE" ? "CLIENT_VISIBLE" : "INTERNAL",
                      )
                    }
                    className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
                  >
                    <option value="INTERNAL">Internal</option>
                    <option value="CLIENT_VISIBLE">Client Visible</option>
                  </select>
                  {designFileVisibility === "CLIENT_VISIBLE" ? (
                    <>
                      <select
                        value={designShareMode}
                        onChange={(event) =>
                          setDesignShareMode(
                            event.target.value as "NONE" | "APPROVAL" | "INFORMATION",
                          )
                        }
                        className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
                      >
                        <option value="NONE">Sadece paylaş (popup yok)</option>
                        <option value="APPROVAL">Müşteri onayı iste</option>
                        <option value="INFORMATION">Sadece bilgilendirme gönder</option>
                      </select>
                      {designShareMode !== "NONE" ? (
                        <Textarea
                          value={designShareMessage}
                          onChange={(event) => setDesignShareMessage(event.target.value)}
                          placeholder="Müşteriye görünecek popup mesajı (boş bırakılırsa varsayılan metin kullanılır)."
                          className="min-h-20 border-white/[0.08] bg-[#202020]"
                        />
                      ) : null}
                    </>
                  ) : null}

                  <div
                    className={`rounded-lg border border-dashed p-4 text-sm transition ${
                      isDragActive
                        ? "border-[#AAFF01] bg-[#AAFF01]/10"
                        : "border-white/[0.2] bg-white/[0.02]"
                    }`}
                    onDragOver={handleDesignFileDragOver}
                    onDragLeave={handleDesignFileDragLeave}
                    onDrop={handleDesignFileDrop}
                  >
                    <p className="text-[#D8D8D8]">
                      Tasarım dosyasını buraya sürükleyip bırakın veya
                      <button
                        type="button"
                        className="ml-1 text-[#AAFF01] underline"
                        onClick={() => designFileInputRef.current?.click()}
                      >
                        seçmek için tıklayın
                      </button>
                      .
                    </p>
                    <input
                      ref={designFileInputRef}
                      className="hidden"
                      type="file"
                      onChange={(event) => setDesignFile(event.target.files?.[0] ?? null)}
                    />
                    {designFile ? (
                      <p className="mt-2 text-xs text-[#A0A0A0]">
                        Seçilen: {designFile.name} ({Math.round(designFile.size / 1024)} KB)
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                    disabled={
                      designFolderId.length === 0 ||
                      !designFile ||
                      isCreatingDesignUploadSignature ||
                      isCompletingDesignUpload ||
                      isCreatingDesignFolder ||
                      isAssigningDesignFolder
                    }
                  >
                    <UploadCloud className="h-4 w-4" />
                    Tasarım Dosyası Yükle
                  </Button>
                  {designUploadFeedback ? (
                    <p className="text-sm text-[#d2ff8a]">{designUploadFeedback}</p>
                  ) : null}
                </form>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Klasördeki Dosyalar</p>
                  {isFetchingDesignFiles ? (
                    <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-3 text-sm text-[#A0A0A0]">
                      Dosyalar güncelleniyor...
                    </p>
                  ) : null}
                  {!isFetchingDesignFiles && designFiles.length === 0 ? (
                    <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-3 text-sm text-[#A0A0A0]">
                      Bu görev klasöründe henüz dosya yok.
                    </p>
                  ) : null}
                  {designFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{file.title}</p>
                        <p className="mt-1 text-xs text-[#A0A0A0]">
                          {file.originalFileName} · {Math.round(file.bytes / 1024)} KB · {file.visibility}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="ghost" asChild>
                          <a href={file.secureUrl} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-200"
                          disabled={isDeletingDesignFile}
                          onClick={() => void handleDeleteDesignFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">İlgili Commitler</h2>
                <p className="mt-1 text-sm text-[#A0A0A0]">
                  Task kodu ve başlığına göre eşleşen commitler
                </p>
              </div>
              <Github className="h-4 w-4 text-[#d2ff8a]" />
            </div>

            {!canReadRepository && (
              <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-4 text-sm text-[#A0A0A0]">
                GitHub görünürlük yetkisi olmayan kullanıcılar için commit listesi gizlidir.
              </p>
            )}

            {canReadRepository && !repository && (
              <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-4 text-sm text-[#A0A0A0]">
                Bu görevin bağlı olduğu projede repository bağlantısı bulunmuyor.
              </p>
            )}

            {canReadRepository && repository && (relatedCommits?.length ?? 0) === 0 && (
              <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-4 text-sm text-[#A0A0A0]">
                Bu görevle ilişkili commit bulunamadı. Eşleştirme task kodu ve başlığa göre yapılır.
              </p>
            )}

            {canReadRepository && repository && (relatedCommits?.length ?? 0) > 0 && (
              <div className="space-y-3">
                {(relatedCommits ?? []).map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.htmlUrl ?? repository.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-white/[0.06] bg-[#202020] p-3 transition-colors hover:border-[#AAFF01]/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white">{commit.message}</p>
                      <Badge variant="outline" className="font-mono text-xs">
                        {commit.shortSha}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-[#A0A0A0]">
                      {commit.githubAuthorLogin ?? commit.authorName ?? "Bilinmeyen geliştirici"} ·{" "}
                      {formatDateTime(commit.committedAt ?? null)}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Atanan" value={getTaskAssigneeName(task)} />
        <InfoCard label="Durum" value={getTaskStatusLabel(task.status)} />
        <InfoCard label="Öncelik" value={getPriorityLabel(task.priority)} />
        <InfoCard
          label="Deadline"
          value={`${formatDate(task.dueDate)}${isTaskOverdue(task) ? " (Gecikmiş)" : ""}`}
        />
        <InfoCard label="Proje ID" value={task.projectId} mono />
        <InfoCard label="Assignee User ID" value={task.assigneeUserId ?? "—"} mono />
        <InfoCard label="Oluşturulma" value={formatDateTime(task.createdAt)} />
        <InfoCard label="Güncellenme" value={formatDateTime(task.updatedAt)} />
      </div>

      {canManageApprovals && task.project?.clientProfileId ? (
        <ClientApprovalRequestDialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
          clientProfileId={task.project.clientProfileId}
          projectId={task.projectId}
          assigneeOptions={assigneeCandidates}
          contextOptions={approvalContextOptions}
          dialogTitle="Müşteri Onayı / Bilgilendirme"
          dialogDescription="Görev veya tasarım dosyası bağlamında müşteriye kayıt oluşturun."
          submitLabel="Müşteriye Gönder"
          preset={approvalDialogPreset}
        />
      ) : null}
    </div>
  );
}

function isDesignTaskType(task: Task | undefined): boolean {
  if (!task) {
    return false;
  }
  return task.workstream === "UI_INTEGRATION" || task.type === "REVISION";
}

function buildDesignTaskFolderName(task: Task): string {
  const code = task.code?.trim();
  const codePrefix = code && code.length > 0 ? code : shortId(task.id);
  const normalizedTitle = task.title.trim().replace(/\s+/g, " ");
  const raw = `DESIGN-${codePrefix} - ${normalizedTitle}`;
  return raw.slice(0, 120);
}

type TaskEditFormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Task["priority"];
  assigneeUserId: string;
  sprintId: string;
  dueDate: string;
};

function createTaskEditForm(task: Task): TaskEditFormState {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assigneeUserId: task.assigneeUserId ?? "",
    sprintId: task.sprintId ?? "",
    dueDate: formatDateInput(task.dueDate),
  };
}

function buildTaskDetailUpdatePayload(
  task: Task,
  form: TaskEditFormState,
  canManageTaskDetails: boolean,
): UpdateTaskRequest | null {
  const nextStatus = form.status;
  const payload: UpdateTaskRequest = {};

  if (nextStatus !== task.status) {
    payload.status = nextStatus;
  }

  if (!canManageTaskDetails) {
    return Object.keys(payload).length > 0 ? payload : null;
  }

  const normalizedTitle = form.title.trim();
  const normalizedDescription = toNullableText(form.description);
  const normalizedAssigneeUserId = toNullableText(form.assigneeUserId);
  const normalizedSprintId = toNullableText(form.sprintId);
  const normalizedDueDate = form.dueDate || null;

  if (normalizedTitle !== task.title) {
    payload.title = normalizedTitle;
  }
  if (normalizedDescription !== task.description) {
    payload.description = normalizedDescription;
  }
  if (form.priority !== task.priority) {
    payload.priority = form.priority;
  }
  if (normalizedAssigneeUserId !== task.assigneeUserId) {
    payload.assigneeUserId = normalizedAssigneeUserId;
  }
  if (normalizedSprintId !== (task.sprintId ?? null)) {
    payload.sprintId = normalizedSprintId;
  }
  if (normalizedDueDate !== (formatDateInput(task.dueDate) || null)) {
    payload.dueDate = normalizedDueDate;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function toNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function formatDateInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
        <CheckSquare className="h-4 w-4 text-[#AAFF01]" />
        {label}
      </div>
      <p className={`text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>{value}</p>
    </Card>
  );
}
