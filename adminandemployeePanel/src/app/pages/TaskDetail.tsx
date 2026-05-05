import { FormEvent, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, CheckSquare, Github, Plus, Trash2 } from "lucide-react";
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
  useGetProjectRepositoryQuery,
} from "../features/projects/projectsApi";
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
  const [createTaskTodo, { isLoading: isCreatingTodo }] = useCreateTaskTodoMutation();
  const [createTaskWorkNote, { isLoading: isCreatingWorkNote }] = useCreateTaskWorkNoteMutation();
  const [prepareTaskCode, { isLoading: isPreparingCode }] = usePrepareTaskCodeMutation();
  const [updateTaskTodo, { isLoading: isUpdatingTodo }] = useUpdateTaskTodoMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [deleteTaskTodo, { isLoading: isDeletingTodo }] = useDeleteTaskTodoMutation();

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
