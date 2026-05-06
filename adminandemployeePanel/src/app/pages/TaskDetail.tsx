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
  const [workNoteDraft, setWorkNoteDraft] = useState("");
  const [workNoteFeedback, setWorkNoteFeedback] = useState<string | null>(null);
  const [prepareCodeFeedback, setPrepareCodeFeedback] = useState<string | null>(null);
  const [designFolderId, setDesignFolderId] = useState<string>("");
  const [designFolderFeedback, setDesignFolderFeedback] = useState<string | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFileTitle, setDesignFileTitle] = useState("");
  const [designFileDescription, setDesignFileDescription] = useState("");
  const [designFileVisibility, setDesignFileVisibility] = useState<ProjectFileVisibility>("INTERNAL");
  const [designUploadFeedback, setDesignUploadFeedback] = useState<string | null>(null);
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

      await completeProjectFileUpload({
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

      setDesignFile(null);
      setDesignFileTitle("");
      setDesignFileDescription("");
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
                      disabled={!canManageTasks || isTodoMutating}
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
