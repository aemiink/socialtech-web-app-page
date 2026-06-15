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
  useGetProjectFileFolderAssigneesQuery,
  useGetProjectFileFoldersQuery,
  useGetProjectFilesQuery,
  useGetProjectRepositoryQuery,
  useUpdateProjectFileFolderAssigneesMutation,
} from "../features/projects/projectsApi";
import type { ProjectFileVisibility } from "../features/projects/projectsTypes";
import {
  useCreateTaskMutation,
  useCreateTaskWorkNoteMutation,
  useCreateTaskTodoMutation,
  useGetRelatedTaskCommitsQuery,
  useDeleteTaskTodoMutation,
  useGetTaskQuery,
  usePrepareTaskCodeMutation,
  useToggleTaskTodoMutation,
  useUpdateTaskTodoMutation,
} from "../features/tasks/tasksApi";
import type { Task } from "../features/tasks/tasksTypes";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
  getDesignApprovalSetupForTask,
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
  const canToggleTaskTodos = hasUserPermission(currentUser, [
    "tasks.manage.any",
    "tasks.manage",
    "tasks.todos.manage.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
  ]);
  const canReadRepository = hasUserPermission(currentUser, [
    "integrations.github.read.any",
    "integrations.github.manage.any",
    "integrations.github.read.assigned",
  ]);
  const canPrepareCode =
    currentUser?.role === "DEVELOPER" ||
    currentUser?.role === "PROJECT_MANAGER" ||
    currentUser?.role === "ADMIN";
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
  const [workNoteDraft, setWorkNoteDraft] = useState("");
  const [workNoteFeedback, setWorkNoteFeedback] = useState<string | null>(null);
  const [prepareCodeFeedback, setPrepareCodeFeedback] = useState<string | null>(null);
  const [designFolderId, setDesignFolderId] = useState<string>("");
  const [designFolderFeedback, setDesignFolderFeedback] = useState<string | null>(null);
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [designFileDescription, setDesignFileDescription] = useState("");
  const [designFileVisibility, setDesignFileVisibility] = useState<ProjectFileVisibility>("INTERNAL");
  const [designUploadFeedback, setDesignUploadFeedback] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [approvalTaskFeedback, setApprovalTaskFeedback] = useState<string | null>(null);
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
  const isDesignTask = useMemo(() => isDesignTaskType(task), [task]);
  const designProjectFolderName = useMemo(
    () => (task ? buildProjectFolderName(task) : ""),
    [task],
  );
  const legacyDesignTaskFolderName = useMemo(
    () => (task ? buildLegacyDesignTaskFolderName(task) : ""),
    [task],
  );
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
  const uploadedDesignFiles = designFilesResponse?.data ?? [];

  const [createApprovalTask, { isLoading: isCreatingApprovalTask }] = useCreateTaskMutation();
  const [createProjectFileFolder, { isLoading: isCreatingDesignFolder }] = useCreateProjectFileFolderMutation();
  const [updateProjectFileFolderAssignees, { isLoading: isAssigningDesignFolder }] =
    useUpdateProjectFileFolderAssigneesMutation();
  const [createProjectFileUploadSignature, { isLoading: isCreatingDesignUploadSignature }] =
    useCreateProjectFileUploadSignatureMutation();
  const [completeProjectFileUpload, { isLoading: isCompletingDesignUpload }] =
    useCompleteProjectFileUploadMutation();
  const [deleteProjectFile, { isLoading: isDeletingDesignFile }] = useDeleteProjectFileMutation();
  const [createTaskTodo, { isLoading: isCreatingTodo }] = useCreateTaskTodoMutation();
  const [createTaskWorkNote, { isLoading: isCreatingWorkNote }] = useCreateTaskWorkNoteMutation();
  const [prepareTaskCode, { isLoading: isPreparingCode }] = usePrepareTaskCodeMutation();
  const [updateTaskTodo, { isLoading: isUpdatingTodo }] = useUpdateTaskTodoMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [deleteTaskTodo, { isLoading: isDeletingTodo }] = useDeleteTaskTodoMutation();

  useEffect(() => {
    if (!isDesignTask || !task?.id) {
      setDesignFolderId("");
      setDesignFolderFeedback(null);
      setDesignFiles([]);
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
    const normalizedTaskFolderName = designTaskFolderName.trim().toLowerCase();
    const normalizedLegacyTaskFolderName = legacyDesignTaskFolderName.trim().toLowerCase();
    const existing = projectFolders.find((folder) => {
      const normalizedFolderName = folder.name.trim().toLowerCase();
      return (
        normalizedFolderName === normalizedTaskFolderName ||
        normalizedFolderName === normalizedLegacyTaskFolderName
      );
    });
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
        if (designProjectFolderName.trim()) {
          await createProjectFileFolder({
            projectId: task.projectId,
            name: designProjectFolderName,
          }).unwrap();
        }

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
    designProjectFolderName,
    designTaskFolderName,
    isDesignTask,
    legacyDesignTaskFolderName,
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
  const isTodoMutating = isCreatingTodo || isUpdatingTodo || isTogglingTodo || isDeletingTodo;
  const savedWorkNotes = getTaskWorkNotes(taskDetail);

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
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length === 0) return;
    setDesignFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...dropped.filter((f) => !existing.has(f.name))];
    });
  }

  function handleDesignFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    setDesignFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...selected.filter((f) => !existing.has(f.name))];
    });
    if (designFileInputRef.current) {
      designFileInputRef.current.value = "";
    }
  }

  function removeDesignFile(fileName: string) {
    setDesignFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  async function createApprovalTaskForDesignFile(
    referenceFileId: string,
    fileTitle: string,
    approvalType: NonNullable<ReturnType<typeof getDesignApprovalSetupForTask>>["approvalType"],
  ): Promise<boolean> {
    if (!task?.projectId) {
      return false;
    }

    try {
      await createApprovalTask({
        projectId: task.projectId,
        title: `Müşteri onayı: ${task.title} • ${fileTitle}`,
        description: task.description ?? "Designer tarafından müşteri onayına gönderildi.",
        status: "REVIEW",
        priority: task.priority,
        type: "REVISION",
        workstream: "UI_INTEGRATION",
        dueDate: task.dueDate,
        approvalRequired: true,
        approvalType,
        approvalStatus: "PENDING",
        referenceProjectFileId: referenceFileId,
        campaignRef: task.campaignRef,
        adSetRef: task.adSetRef,
        adRef: task.adRef,
      }).unwrap();
      return true;
    } catch {
      return false;
    }
  }

  async function ensureDesignFolderForUpload(): Promise<string | null> {
    if (!taskDetail.projectId || !isDesignTask || !canManageProjectFiles) {
      return null;
    }

    if (designFolderId) {
      return designFolderId;
    }

    const normalizedFolderName = designTaskFolderName.trim().toLowerCase();
    const normalizedLegacyFolderName = legacyDesignTaskFolderName.trim().toLowerCase();
    const existingFolder = projectFolders.find(
      (folder) => {
        const normalizedName = folder.name.trim().toLowerCase();
        return (
          normalizedName === normalizedFolderName ||
          normalizedName === normalizedLegacyFolderName
        );
      },
    );
    if (existingFolder) {
      setDesignFolderId(existingFolder.id);
      return existingFolder.id;
    }

    if (!designTaskFolderName.trim()) {
      return null;
    }

    try {
      if (designProjectFolderName.trim()) {
        await createProjectFileFolder({
          projectId: taskDetail.projectId,
          name: designProjectFolderName,
        }).unwrap();
      }

      const createdFolder = await createProjectFileFolder({
        projectId: taskDetail.projectId,
        name: designTaskFolderName,
      }).unwrap();
      setDesignFolderId(createdFolder.id);
      setDesignFolderFeedback("Klasör otomatik oluşturuldu, dosya yükleyebilirsiniz.");
      return createdFolder.id;
    } catch (error) {
      setDesignFolderFeedback(
        extractApiErrorMessage(error, "Görev klasörü otomatik oluşturulamadı."),
      );
      return null;
    }
  }

  async function handleDesignFileUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskDetail.projectId || !isDesignTask) return;
    const resolvedFolderId = await ensureDesignFolderForUpload();
    if (!resolvedFolderId) {
      setDesignUploadFeedback("Önce görev için klasör oluşturulmalı.");
      return;
    }
    if (designFiles.length === 0) {
      setDesignUploadFeedback("Yüklenecek dosyaları seçin.");
      return;
    }

    setDesignUploadFeedback(null);
    setUploadProgress({ done: 0, total: designFiles.length });
    let lastFileId: string | null = null;
    const approvalSetup = getDesignApprovalSetupForTask(task);
    const hasApprovalPermission =
      approvalSetup !== null &&
      currentUser?.permissions.includes(approvalSetup.permission) === true;
    const shouldCreateApprovalPerUpload =
      hasApprovalPermission && designFileVisibility === "CLIENT_VISIBLE";
    let createdApprovalCount = 0;
    let failedApprovalCount = 0;

    for (const file of designFiles) {
      try {
        const signature = await createProjectFileUploadSignature({
          projectId: taskDetail.projectId,
          fileName: file.name,
          title: file.name,
          description: designFileDescription.trim() || null,
          mimeType: file.type || "application/octet-stream",
          bytes: file.size,
          category: "BRAND_ASSET",
          visibility: designFileVisibility,
          folderId: resolvedFolderId,
          approvalRequired: shouldCreateApprovalPerUpload,
          approvalType: shouldCreateApprovalPerUpload ? approvalSetup?.approvalType : null,
          approvalStatus: shouldCreateApprovalPerUpload ? "PENDING" : null,
        }).unwrap();

        const formData = new FormData();
        formData.set("file", file);
        formData.set("api_key", signature.apiKey);
        formData.set("timestamp", String(signature.timestamp));
        formData.set("signature", signature.signature);
        formData.set("public_id", signature.publicId);
        if (signature.assetFolder) formData.set("asset_folder", signature.assetFolder);
        if (signature.overwrite) formData.set("overwrite", "true");

        const uploadResponse = await fetch(signature.uploadUrl, { method: "POST", body: formData });
        if (!uploadResponse.ok) {
          let msg = "Cloudinary yüklemesi başarısız.";
          try {
            const errJson = (await uploadResponse.json()) as { error?: { message?: string } };
            if (errJson.error?.message) msg = `Cloudinary yüklemesi başarısız: ${errJson.error.message}`;
          } catch { /* keep generic */ }
          throw new Error(msg);
        }

        const uploadJson = (await uploadResponse.json()) as {
          secure_url: string;
          resource_type: string;
          format?: string;
          bytes: number;
        };

        const uploadedFile = await completeProjectFileUpload({
          projectId: taskDetail.projectId,
          originalFileName: file.name,
          title: file.name,
          description: designFileDescription.trim() || null,
          publicId: signature.publicId,
          secureUrl: uploadJson.secure_url,
          resourceType: uploadJson.resource_type ?? "raw",
          format: uploadJson.format ?? null,
          bytes: uploadJson.bytes ?? file.size,
          mimeType: file.type || "application/octet-stream",
          category: "BRAND_ASSET",
          visibility: designFileVisibility,
          folderId: resolvedFolderId,
          approvalRequired: shouldCreateApprovalPerUpload,
          approvalType: shouldCreateApprovalPerUpload ? approvalSetup?.approvalType : null,
          approvalStatus: shouldCreateApprovalPerUpload ? "PENDING" : null,
        }).unwrap();

        lastFileId = uploadedFile.id;
        if (shouldCreateApprovalPerUpload && approvalSetup) {
          const approvalCreated = await createApprovalTaskForDesignFile(
            uploadedFile.id,
            uploadedFile.title,
            approvalSetup.approvalType,
          );
          if (approvalCreated) {
            createdApprovalCount += 1;
          } else {
            failedApprovalCount += 1;
          }
        }
        setUploadProgress((prev) => prev ? { ...prev, done: prev.done + 1 } : null);
      } catch (error) {
        setDesignUploadFeedback(extractApiErrorMessage(error, `${file.name} yüklenemedi.`));
        setUploadProgress(null);
        return;
      }
    }

    setDesignFiles([]);
    setDesignFileDescription("");
    setUploadProgress(null);
    const count = designFiles.length;
    const uploadSummary = `${count} dosya yüklendi.`;
    if (!shouldCreateApprovalPerUpload) {
      setDesignUploadFeedback(uploadSummary);
    } else if (failedApprovalCount === 0) {
      setDesignUploadFeedback(`${uploadSummary} ${createdApprovalCount} dosya için ayrı müşteri onay penceresi açıldı.`);
    } else {
      setDesignUploadFeedback(
        `${uploadSummary} ${createdApprovalCount} onay penceresi açıldı, ${failedApprovalCount} dosya için onay oluşturulamadı.`,
      );
    }
    if (lastFileId) {
      setApprovalTaskFeedback(null);
    }
    await refetchDesignFiles();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  async function handleSendApprovalFromDetail() {
    const approvalSetup = getDesignApprovalSetupForTask(task);
    if (!approvalSetup || !task?.projectId) return;
    setApprovalTaskFeedback(null);

    const filesForApproval = uploadedDesignFiles.filter(
      (file) => file.visibility === "CLIENT_VISIBLE" && file.approvalStatus !== "PENDING",
    );
    if (filesForApproval.length === 0) {
      setApprovalTaskFeedback("Onaya gönderilecek yeni client-visible dosya bulunmuyor.");
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    for (const file of filesForApproval) {
      const created = await createApprovalTaskForDesignFile(
        file.id,
        file.title,
        approvalSetup.approvalType,
      );
      if (created) {
        successCount += 1;
      } else {
        failedCount += 1;
      }
    }

    if (failedCount === 0) {
      setApprovalTaskFeedback(`${successCount} dosya müşteri onayına gönderildi.`);
    } else {
      setApprovalTaskFeedback(
        `${successCount} dosya müşteri onayına gönderildi, ${failedCount} dosya için onay oluşturulamadı.`,
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

        {canManageTasks && (
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
              <option value="INTERNAL">Şirket İçi</option>
              <option value="CLIENT_VISIBLE">Müşteriye Açık</option>
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
                      disabled={!canToggleTaskTodos || isTodoMutating}
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
                          {todo.visibility === "CLIENT_VISIBLE" ? "Müşteriye Açık" : "Şirket İçi"}
                        </span>
                      </div>
                    )}
                  </div>

                  {canManageTasks && (
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
                Atanan kişi veya proje yöneticisi olarak şirkete iç not bırakabilirsiniz.
              </p>
            </div>
            <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
              Şirket içi
            </Badge>
          </div>

          <Textarea
            value={workNoteDraft}
            onChange={(event) => {
              setWorkNoteDraft(event.target.value);
              setWorkNoteFeedback(null);
            }}
            className="min-h-32 border-white/[0.08] bg-[#202020]"
            placeholder="Tasarım, revizyon, test, yayın veya entegrasyon sırasında yapılanları yazın..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#A0A0A0]">
              {task.code && <p>Task Kodu: <span className="font-mono text-white">{task.code}</span></p>}
              {task.branchName && <p>Önerilen Branch: <span className="font-mono text-white">{task.branchName}</span></p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {canPrepareCode ? (
                <Button type="button" variant="outline" onClick={() => void handlePrepareCode()} disabled={isPreparingCode}>
                  Kod Hazırlığı
                </Button>
              ) : null}
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
                  ) : !designFolderId ? (
                    <p className="mt-2 text-xs text-[#A0A0A0]">
                      Klasör hazırlanıyor, birkaç saniye sonra otomatik aktif olur.
                    </p>
                  ) : null}
                  {task.assigneeUserId ? (
                    <p className="mt-2 text-xs text-[#A0A0A0]">
                      Atanan çalışan için klasör erişimi otomatik senkronlanır.
                    </p>
                  ) : null}
                </div>

                <form onSubmit={(event) => void handleDesignFileUpload(event)} className="space-y-3">
                  <Input
                    value={designFileDescription}
                    onChange={(event) => setDesignFileDescription(event.target.value)}
                    placeholder="Kısa açıklama (opsiyonel, tüm dosyalara uygulanır)"
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
                    <option value="INTERNAL">Şirket İçi</option>
                    <option value="CLIENT_VISIBLE">Müşteriye Açık</option>
                  </select>

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
                      Dosyaları sürükleyip bırakın veya{" "}
                      <button
                        type="button"
                        className="text-[#AAFF01] underline"
                        onClick={() => designFileInputRef.current?.click()}
                      >
                        seçmek için tıklayın
                      </button>
                      {" "}(çoklu seçim desteklenir).
                    </p>
                    <input
                      ref={designFileInputRef}
                      className="hidden"
                      type="file"
                      multiple
                      onChange={handleDesignFileInputChange}
                    />
                  </div>

                  {designFiles.length > 0 && (
                    <div className="space-y-1.5">
                      {designFiles.map((f) => (
                        <div key={f.name} className="flex items-center justify-between rounded-md border border-white/[0.08] bg-[#202020] px-3 py-2">
                          <span className="min-w-0 truncate text-xs text-white">{f.name}</span>
                          <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                            <span className="text-xs text-[#A0A0A0]">{Math.round(f.size / 1024)} KB</span>
                            <button
                              type="button"
                              className="text-[#A0A0A0] hover:text-red-300"
                              onClick={() => removeDesignFile(f.name)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                    disabled={
                      designFiles.length === 0 ||
                      isCreatingDesignUploadSignature ||
                      isCompletingDesignUpload ||
                      uploadProgress !== null
                    }
                  >
                    <UploadCloud className="h-4 w-4" />
                    {uploadProgress
                      ? `Yükleniyor ${uploadProgress.done}/${uploadProgress.total}...`
                      : `${designFiles.length > 0 ? `${designFiles.length} Dosyayı` : "Dosyaları"} Yükle`}
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
                  {!isFetchingDesignFiles && uploadedDesignFiles.length === 0 ? (
                    <p className="rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-3 text-sm text-[#A0A0A0]">
                      Bu görev klasöründe henüz dosya yok.
                    </p>
                  ) : null}
                  {uploadedDesignFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#202020] px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{file.title}</p>
                        <p className="mt-1 text-xs text-[#A0A0A0]">
                          {file.originalFileName} · {Math.round(file.bytes / 1024)} KB · {file.visibility}
                        </p>
                        {file.approvalRequired ? (
                          <p className="mt-1 text-xs text-[#A0A0A0]">
                            Onay: {getProjectFileApprovalLabel(file.approvalStatus)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.approvalRequired ? (
                          <Badge
                            variant="outline"
                            className={getProjectFileApprovalBadgeClass(file.approvalStatus)}
                          >
                            {getProjectFileApprovalLabel(file.approvalStatus)}
                          </Badge>
                        ) : null}
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
                  {(() => {
                    const hasFiles = uploadedDesignFiles.length > 0;
                    if (!hasFiles) return null;

                    const approvalSetup = getDesignApprovalSetupForTask(task);
                    const hasPermission =
                      approvalSetup !== null &&
                      currentUser?.permissions.includes(approvalSetup.permission) === true;

                    if (approvalSetup === null) {
                      return (
                        <div className="mt-3 rounded-lg border border-white/[0.08] bg-[#202020] p-3">
                          <p className="text-xs text-[#A0A0A0]">
                            Bu hizmet türü ({task.project?.serviceKey ?? "tanımsız"}) için müşteri onay akışı
                            desteklenmiyor. Onay süreci yalnızca Growth Hub, Meta Ads, TikTok Ads, Amazon Ads ve
                            Sosyal Medya projelerinde kullanılabilir.
                          </p>
                        </div>
                      );
                    }

                    if (!hasPermission) {
                      return (
                        <div className="mt-3 rounded-lg border border-white/[0.08] bg-[#202020] p-3">
                          <p className="text-xs text-[#A0A0A0]">
                            Dosyaları müşteri onayına göndermek için bu hizmette onay oluşturma izniniz
                            bulunmuyor.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="mt-3 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/5 p-3">
                        <p className="mb-2 text-xs text-[#A0A0A0]">
                          Client visible yüklenen her dosya için ayrı onay penceresi otomatik açılır.
                          Eski dosyalar için dilerseniz aşağıdaki butonla toplu onay görevi oluşturabilirsiniz.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                          disabled={isCreatingApprovalTask}
                          onClick={() => void handleSendApprovalFromDetail()}
                        >
                          {isCreatingApprovalTask ? "Gönderiliyor..." : "Müşteri Onayına Gönder"}
                        </Button>
                        {approvalTaskFeedback ? (
                          <p className={`mt-2 text-xs ${approvalTaskFeedback.includes("oluşturulamadı") || approvalTaskFeedback.includes("hata") ? "text-red-300" : "text-[#d2ff8a]"}`}>
                            {approvalTaskFeedback}
                          </p>
                        ) : null}
                      </div>
                    );
                  })()}
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
          label="Teslim Tarihi"
          value={`${formatDate(task.dueDate)}${isTaskOverdue(task) ? " (Gecikmiş)" : ""}`}
        />
        <InfoCard label="Proje ID" value={task.projectId} mono />
        <InfoCard label="Assignee User ID" value={task.assigneeUserId ?? "—"} mono />
        <InfoCard label="Oluşturulma" value={formatDateTime(task.createdAt)} />
        <InfoCard label="Güncellenme" value={formatDateTime(task.updatedAt)} />
      </div>
    </div>
  );
}

function isDesignTaskType(task: Task | undefined): boolean {
  if (!task) {
    return false;
  }
  return task.workstream === "UI_INTEGRATION" || task.type === "REVISION";
}

function buildProjectFolderName(task: Task): string {
  const projectLabel = normalizeFolderSegment(
    task.project?.name ?? task.project?.slug ?? shortId(task.projectId),
  );
  return `PROJECT-${projectLabel}`.slice(0, 80);
}

function buildLegacyDesignTaskFolderName(task: Task): string {
  const code = task.code?.trim();
  const codePrefix = code && code.length > 0 ? code : shortId(task.id);
  const normalizedTitle = normalizeFolderSegment(task.title);
  const raw = `DESIGN-${codePrefix} - ${normalizedTitle}`;
  return raw.slice(0, 120);
}

function buildDesignTaskFolderName(task: Task): string {
  const projectFolderName = buildProjectFolderName(task);
  const taskFolderName = buildLegacyDesignTaskFolderName(task);
  const raw = `${projectFolderName}/${taskFolderName}`;
  return raw.slice(0, 180);
}

function normalizeFolderSegment(value: string): string {
  const normalized = value
    .replace(/[\\\/]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 0 ? normalized : "Untitled";
}

function getProjectFileApprovalLabel(status: string | null | undefined): string {
  if (status === "PENDING") return "Onay Bekliyor";
  if (status === "APPROVED") return "Onaylandı";
  if (status === "ACKNOWLEDGED") return "Onaylandı";
  if (status === "CHANGES_REQUESTED") return "Revizyon İstendi";
  if (status === "REJECTED") return "Reddedildi";
  return "Onay Akışı";
}

function getProjectFileApprovalBadgeClass(status: string | null | undefined): string {
  if (status === "PENDING") return "border-[#FFA726]/30 bg-[#FFA726]/10 text-[#FFA726]";
  if (status === "APPROVED" || status === "ACKNOWLEDGED") {
    return "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d6ff93]";
  }
  if (status === "CHANGES_REQUESTED") return "border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#9CEEFF]";
  if (status === "REJECTED") return "border-red-500/40 bg-red-500/10 text-red-200";
  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
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
