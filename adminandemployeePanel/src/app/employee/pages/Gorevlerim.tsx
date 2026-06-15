import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Progress } from "../../components/ui/progress";
import { CheckSquare, AlertCircle, Clock, FileText, Image, Rocket } from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useToggleTaskTodoMutation,
} from "../../features/tasks/tasksApi";
import type {
  CreateTaskRequest,
  Task,
  TaskApprovalType,
  TaskTodo,
  TasksListQuery,
} from "../../features/tasks/tasksTypes";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
  getDesignApprovalSetupForTask,
  getTaskCompletionLabel,
  getTaskCompletionPercent,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskClientName,
  getTaskTodos,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  isTaskOverdue,
} from "../../features/tasks/tasksUtils";
import { useAppSelector } from "../../store/hooks";

export function Gorevlerim() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isDesignerView = currentUser?.role === "DESIGNER";
  const [todoActionError, setTodoActionError] = useState<string | null>(null);
  const [approvalActionError, setApprovalActionError] = useState<string | null>(null);
  const [approvalActionSuccess, setApprovalActionSuccess] = useState<string | null>(null);
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);
  const canReadAssignedTasks =
    currentUser?.accountType === "EMPLOYEE" &&
    currentUser.permissions.includes("tasks.read.assigned");

  const tasksQuery = useMemo<TasksListQuery>(
    () => ({
      assigneeUserId: currentUser?.id ?? "",
    }),
    [currentUser?.id],
  );

  const {
    data: tasksResponse,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetTasksQuery(tasksQuery, { skip: !canReadAssignedTasks });
  const [toggleTaskTodo] = useToggleTaskTodoMutation();
  const pendingTodoIdsRef = useRef(new Set<string>());
  const [pendingTodoIds, setPendingTodoIds] = useState<ReadonlySet<string>>(new Set());
  const [createTask, { isLoading: isCreatingApprovalTask }] = useCreateTaskMutation();

  if (!canReadAssignedTasks) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Atanmış görevleri görüntüleme yetkiniz bulunmuyor.
      </Card>
    );
  }

  const assignedTasks = tasksResponse?.data ?? [];
  const kpis = calculateTaskKpis(assignedTasks, isDesignerView);
  const metricValue = (value: number) => (isLoading || isError ? "—" : value);
  const emptyStateText = isDesignerView
    ? "Atama kapsamınızda tasarım görevi bulunmuyor."
    : "Atama kapsamınızda görev bulunmuyor.";

  async function handleTodoToggle(task: Task, todo: TaskTodo) {
    if (pendingTodoIdsRef.current.has(todo.id)) return;
    setTodoActionError(null);
    pendingTodoIdsRef.current.add(todo.id);
    setPendingTodoIds(new Set(pendingTodoIdsRef.current));

    try {
      await toggleTaskTodo({
        taskId: task.id,
        todoId: todo.id,
        body: { isCompleted: !todo.isCompleted },
      }).unwrap();
    } catch (error) {
      setTodoActionError(extractApiErrorMessage(error, "Todo durumu güncellenemedi."));
    } finally {
      pendingTodoIdsRef.current.delete(todo.id);
      setPendingTodoIds(new Set(pendingTodoIdsRef.current));
    }
  }

  async function handleSendDesignerApproval(task: Task) {
    setApprovalActionError(null);
    setApprovalActionSuccess(null);

    const approvalSetup = getDesignerApprovalSetup(task);
    if (!approvalSetup) {
      setApprovalActionError("Bu görev için müşteri onay akışı desteklenmiyor.");
      return;
    }

    if (!currentUser?.permissions.includes(approvalSetup.permission)) {
      setApprovalActionError("Müşteri onayı göndermek için gerekli onay izniniz yok.");
      return;
    }

    setActiveApprovalTaskId(task.id);
    try {
      await createTask(buildDesignerApprovalTaskRequest(task, approvalSetup.approvalType)).unwrap();
      setApprovalActionSuccess(`${task.title} müşteri onayına gönderildi.`);
    } catch (error) {
      setApprovalActionError(extractApiErrorMessage(error, "Müşteri onay talebi oluşturulamadı."));
    } finally {
      setActiveApprovalTaskId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">
          {isDesignerView ? "Tasarım Görevlerim" : "Görevlerim"}
        </h1>
        <p className="text-[#A0A0A0]">
          {isDesignerView ? "Kreatif, UI ve revizyon işlerin" : "Bana atanan görevler"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          icon={
            isDesignerView
              ? <Image className="w-5 h-5 text-[#AAFF01]" />
              : <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
          }
          label={isDesignerView ? "Bugünkü Tasarım" : "Bugünkü Görev"}
          value={metricValue(kpis.today)}
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          label={isDesignerView ? "Geciken Teslim" : "Geciken Görev"}
          value={metricValue(kpis.overdue)}
          valueClassName="text-red-500"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-[#AAFF01]" />}
          label="Bu Hafta Teslim"
          value={metricValue(kpis.dueThisWeek)}
        />
        <MetricCard
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          label={isDesignerView ? "Revizyon / Onay" : "İncelemede"}
          value={metricValue(kpis.review)}
        />
        <MetricCard
          icon={
            isDesignerView
              ? <Rocket className="w-5 h-5 text-[#AAFF01]" />
              : <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
          }
          label={isDesignerView ? "Teslim Edilen" : "Tamamlanan"}
          value={metricValue(kpis.done)}
        />
      </div>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Görevler yükleniyor...
        </Card>
      )}

      {isError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(error, "Görevler alınamadı.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {todoActionError && (
        <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {todoActionError}
        </Card>
      )}

      {approvalActionError && (
        <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {approvalActionError}
        </Card>
      )}

      {approvalActionSuccess && (
        <Card className="border-[#AAFF01]/30 bg-[#AAFF01]/10 p-4 text-sm text-[#d2ff8a]">
          {approvalActionSuccess}
        </Card>
      )}

      {!isLoading && !isError && assignedTasks.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          {emptyStateText}
        </Card>
      )}

      {!isLoading && !isError && assignedTasks.length > 0 && (
        <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">
                    {isDesignerView ? "Tasarım Görevi" : "Görev"}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">
                    {isDesignerView ? "Alan / Kanal" : "Proje"}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">
                    {isDesignerView ? "Checklist" : "İlerleme"}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">
                    {isDesignerView ? "Teslim" : "Deadline"}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
                </tr>
              </thead>
              <tbody>
                {assignedTasks.map((task) => (
                  <tr key={task.id} className="border-t border-white/[0.06] hover:bg-white/5">
                    <td className="max-w-[360px] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{task.title}</span>
                        <Badge
                          className={
                            task.assigneeUserId === currentUser?.id
                              ? "bg-[#AAFF01] text-[#131313]"
                              : task.assigneeUserId
                                ? "border-blue-400/40 bg-blue-500/15 text-blue-200"
                                : "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]"
                          }
                        >
                          {task.assigneeUserId === currentUser?.id
                            ? "Bana Atandı"
                            : task.assigneeUserId
                              ? "Ekip Görevi"
                              : "Atanmamış"}
                        </Badge>
                      </div>
                      {isDesignerView && (
                        <DesignerTaskMeta task={task} />
                      )}
                      <TaskTodoPreview
                        task={task}
                        pendingTodoIds={pendingTodoIds}
                        isDesignerView={isDesignerView}
                        onToggle={(todo) => void handleTodoToggle(task, todo)}
                      />
                    </td>
                    <td className="p-4 text-sm">{getTaskClientName(task)}</td>
                    <td className="p-4 text-sm">
                      {isDesignerView ? <DesignerTaskContext task={task} /> : task.project?.name ?? "—"}
                    </td>
                    <td className="space-y-2 p-4">
                      <Badge className={getPriorityBadgeClass(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="min-w-28">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[#A0A0A0]">
                          <span>{getTaskProgressLabel(task, isDesignerView)}</span>
                          <span>%{getTaskCompletionPercent(task)}</span>
                        </div>
                        <Progress value={getTaskCompletionPercent(task)} className="h-2" />
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">
                      <span title={formatDateTime(task.dueDate)}>{formatDate(task.dueDate)}</span>
                      {isTaskOverdue(task) && (
                        <span className="ml-2 text-xs text-red-300">Gecikti</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={getTaskStatusBadgeClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button asChild type="button" size="sm" variant="outline">
                        <Link to={`/employee/gorevlerim/${task.id}`}>Detay</Link>
                      </Button>
                      {isDesignerView ? (
                        <DesignerApprovalAction
                          task={task}
                          currentUserPermissions={currentUser?.permissions ?? []}
                          isLoading={isCreatingApprovalTask && activeApprovalTaskId === task.id}
                          onSendApproval={() => void handleSendDesignerApproval(task)}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!isLoading && !isError && isFetching && (
        <p className="text-xs text-[#d2ff8a]">Görev listesi güncelleniyor...</p>
      )}
    </div>
  );
}

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

function MetricCard({ icon, label, value, valueClassName = "" }: MetricCardProps) {
  return (
    <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm text-[#A0A0A0]">{label}</span>
      </div>
      <div className={`text-2xl font-semibold ${valueClassName}`}>{value}</div>
    </Card>
  );
}

function DesignerTaskMeta({ task }: { task: Task }) {
  const kindLabel = getDesignerTaskKindLabel(task);
  const approvalLabel = getDesignerApprovalLabel(task);
  const note = getDesignerTaskNote(task);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={getDesignerTaskKindBadgeClass(task)}>{kindLabel}</Badge>
        {approvalLabel ? (
          <Badge className="border-blue-400/40 bg-blue-500/15 text-blue-200">{approvalLabel}</Badge>
        ) : null}
      </div>
      {note ? <p className="text-xs text-[#A0A0A0]">{note}</p> : null}
    </div>
  );
}

function DesignerTaskContext({ task }: { task: Task }) {
  const contextLabel = getDesignerContextLabel(task);
  const referenceLabel = getDesignerReferenceLabel(task);

  return (
    <div className="min-w-40">
      <p className="font-medium text-[#E5E5E5]">{contextLabel}</p>
      <p className="mt-1 text-xs text-[#A0A0A0]">{referenceLabel}</p>
    </div>
  );
}

function DesignerApprovalAction({
  task,
  currentUserPermissions,
  isLoading,
  onSendApproval,
}: {
  task: Task;
  currentUserPermissions: string[];
  isLoading: boolean;
  onSendApproval: () => void;
}) {
  const approvalSetup = getDesignerApprovalSetup(task);

  if (!approvalSetup) {
    return null;
  }

  const hasPermission = currentUserPermissions.includes(approvalSetup.permission);
  const isPendingApproval = task.approvalRequired === true && task.approvalStatus === "PENDING";
  const isApproved = task.approvalStatus === "APPROVED" || task.approvalStatus === "ACKNOWLEDGED";
  const disabled = isLoading || isPendingApproval || isApproved || !hasPermission;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="w-full"
      disabled={disabled}
      title={!hasPermission ? "Bu servis için müşteri onayı gönderme izniniz yok." : undefined}
      onClick={onSendApproval}
    >
      {getDesignerApprovalActionLabel({ isLoading, isPendingApproval, isApproved, hasPermission })}
    </Button>
  );
}

function TaskTodoPreview({
  task,
  pendingTodoIds,
  isDesignerView,
  onToggle,
}: {
  task: Task;
  pendingTodoIds: ReadonlySet<string>;
  isDesignerView: boolean;
  onToggle: (todo: TaskTodo) => void;
}) {
  const todos = getTaskTodos(task);

  if (todos.length === 0) {
    return <p className="mt-2 text-xs text-[#A0A0A0]">{isDesignerView ? "Checklist yok" : "Todo yok"}</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      {todos.slice(0, 3).map((todo) => {
        const isPending = pendingTodoIds.has(todo.id);
        const effectiveChecked = isPending ? !todo.isCompleted : todo.isCompleted;
        return (
          <label key={todo.id} className="flex items-center gap-2 text-xs text-[#D8D8D8]">
            <Checkbox
              checked={effectiveChecked}
              onCheckedChange={() => onToggle(todo)}
              disabled={isPending}
              className="border-white/[0.18] data-[state=checked]:border-[#AAFF01] data-[state=checked]:bg-[#AAFF01] data-[state=checked]:text-[#131313]"
              aria-label={`${todo.title} durumunu değiştir`}
            />
            <span className={effectiveChecked ? "line-through text-[#A0A0A0]" : ""}>
              {todo.title}
            </span>
          </label>
        );
      })}
      {todos.length > 3 && (
        <p className="text-xs text-[#A0A0A0]">
          +{todos.length - 3} {isDesignerView ? "checklist maddesi" : "todo"} daha
        </p>
      )}
    </div>
  );
}

type TaskKpis = {
  today: number;
  overdue: number;
  dueThisWeek: number;
  review: number;
  done: number;
};

function calculateTaskKpis(tasks: Task[], isDesignerView: boolean): TaskKpis {
  return {
    today: tasks.filter((task) => isTaskDueToday(task)).length,
    overdue: tasks.filter(isTaskOverdue).length,
    dueThisWeek: tasks.filter((task) => isTaskDueThisWeek(task)).length,
    review: tasks.filter((task) => isDesignerView ? isDesignerReviewTask(task) : task.status === "REVIEW").length,
    done: tasks.filter((task) => task.status === "DONE").length,
  };
}

function getTaskProgressLabel(task: Task, isDesignerView: boolean): string {
  if (!isDesignerView) {
    return getTaskCompletionLabel(task);
  }

  const todos = getTaskTodos(task);
  const total = task.completion?.totalTodos ?? todos.length;
  const completed = task.completion?.completedTodos ?? todos.filter((todo) => todo.isCompleted).length;

  if (total === 0) {
    return "Checklist yok";
  }

  return `${completed}/${total} checklist`;
}

function isDesignerReviewTask(task: Task): boolean {
  return (
    task.status === "REVIEW" ||
    task.approvalStatus === "PENDING" ||
    task.approvalStatus === "CHANGES_REQUESTED"
  );
}

function getDesignerTaskKindLabel(task: Task): string {
  if (task.approvalType?.startsWith("META_ADS")) return "Meta Ads Kreatif";
  if (task.approvalType?.startsWith("TIKTOK_ADS")) return "TikTok Kreatif";
  if (task.approvalType?.startsWith("AMAZON_ADS")) return "Amazon Kreatif";
  if (task.approvalType === "SOCIAL_MEDIA_CAPTION_APPROVAL") return "Caption";
  if (task.approvalType === "SOCIAL_MEDIA_CALENDAR_APPROVAL") return "İçerik Takvimi";
  if (task.approvalType === "SOCIAL_MEDIA_POST_APPROVAL") return "Post / Asset";
  if (task.approvalType === "SOCIAL_MEDIA_CREATIVE_APPROVAL") return "Social Media Kreatif";
  if (task.type === "REVISION" || task.approvalStatus === "CHANGES_REQUESTED") return "Revizyon";
  if (task.workstream === "UI_INTEGRATION") return "UI Tasarım";
  return "Tasarım";
}

function getDesignerTaskKindBadgeClass(task: Task): string {
  if (task.type === "REVISION" || task.approvalStatus === "CHANGES_REQUESTED") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }
  if (task.approvalType?.includes("ADS")) {
    return "border-cyan-400/40 bg-cyan-500/15 text-cyan-200";
  }
  if (task.approvalType?.startsWith("SOCIAL_MEDIA")) {
    return "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200";
  }
  return "border-[#AAFF01]/40 bg-[#AAFF01]/15 text-[#d2ff8a]";
}

function getDesignerApprovalLabel(task: Task): string | null {
  if (!task.approvalRequired && !task.approvalStatus) {
    return null;
  }

  if (task.approvalStatus === "PENDING") return "Onay Bekliyor";
  if (task.approvalStatus === "APPROVED") return "Onaylandı";
  if (task.approvalStatus === "CHANGES_REQUESTED") return "Revizyon İstendi";
  if (task.approvalStatus === "REJECTED") return "Reddedildi";
  if (task.approvalStatus === "ACKNOWLEDGED") return "Görüldü";
  return "Onay Akışı";
}

function getDesignerTaskNote(task: Task): string | null {
  if (task.approvalResponseNote?.trim()) {
    return `Revizyon notu: ${truncateTaskMeta(task.approvalResponseNote.trim())}`;
  }
  if (task.description?.trim()) {
    return `Brief: ${truncateTaskMeta(task.description.trim())}`;
  }
  return null;
}

function getDesignerContextLabel(task: Task): string {
  if (task.approvalType?.startsWith("META_ADS")) return "Meta Ads";
  if (task.approvalType?.startsWith("TIKTOK_ADS")) return "TikTok Ads";
  if (task.approvalType?.startsWith("AMAZON_ADS")) return "Amazon Ads";
  if (task.approvalType?.startsWith("SOCIAL_MEDIA")) return "Social Media";
  if (task.workstream === "UI_INTEGRATION") return "UI / Ürün Tasarımı";
  return getDesignerTaskKindLabel(task);
}

function getDesignerReferenceLabel(task: Task): string {
  if (task.adRef?.trim()) {
    return `Asset: ${task.adRef.trim()}`;
  }
  if (task.adSetRef?.trim()) {
    return `Format: ${task.adSetRef.trim()}`;
  }
  if (task.campaignRef?.trim()) {
    return `Kampanya: ${task.campaignRef.trim()}`;
  }
  if (task.project?.name) {
    return task.project.name;
  }
  return "Referans bekleniyor";
}

function truncateTaskMeta(value: string): string {
  return value.length > 110 ? `${value.slice(0, 107)}...` : value;
}

type DesignerApprovalSetup = {
  approvalType: TaskApprovalType;
  permission: string;
};

function getDesignerApprovalSetup(task: Task): DesignerApprovalSetup | null {
  return getDesignApprovalSetupForTask(task);
}

function buildDesignerApprovalTaskRequest(task: Task, approvalType: TaskApprovalType): CreateTaskRequest {
  return {
    projectId: task.projectId,
    title: `Müşteri onayı: ${task.title}`,
    description: buildDesignerApprovalDescription(task),
    status: "REVIEW",
    priority: task.priority,
    type: "REVISION",
    workstream: "UI_INTEGRATION",
    dueDate: task.dueDate,
    approvalRequired: true,
    approvalType,
    approvalStatus: "PENDING",
    campaignRef: task.campaignRef,
    adSetRef: task.adSetRef,
    adRef: task.adRef,
    referenceProjectFileId: task.referenceProjectFileId,
  };
}

function buildDesignerApprovalDescription(task: Task): string {
  const pieces = [
    task.description?.trim(),
    task.project?.name ? `Proje: ${task.project.name}` : null,
    task.campaignRef ? `Kampanya: ${task.campaignRef}` : null,
    task.adSetRef ? `Format / set: ${task.adSetRef}` : null,
    task.adRef ? `Asset: ${task.adRef}` : null,
  ].filter((piece): piece is string => Boolean(piece));

  return pieces.length > 0
    ? pieces.join("\n")
    : "Designer tarafından müşteri onayına gönderildi.";
}

function getDesignerApprovalActionLabel({
  isLoading,
  isPendingApproval,
  isApproved,
  hasPermission,
}: {
  isLoading: boolean;
  isPendingApproval: boolean;
  isApproved: boolean;
  hasPermission: boolean;
}): string {
  if (isLoading) return "Gönderiliyor...";
  if (isPendingApproval) return "Onayda";
  if (isApproved) return "Onaylandı";
  if (!hasPermission) return "Onay İzni Yok";
  return "Müşteri Onayına Gönder";
}

function isTaskDueToday(task: Task): boolean {
  const dueDate = parseTaskDueDate(task);

  if (!dueDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate.getTime() === today.getTime();
}

function isTaskDueThisWeek(task: Task): boolean {
  const dueDate = parseTaskDueDate(task);

  if (!dueDate) {
    return false;
  }

  const { start, end } = getCurrentWeekRange();
  return dueDate.getTime() >= start.getTime() && dueDate.getTime() <= end.getTime();
}

function parseTaskDueDate(task: Task): Date | null {
  if (!task.dueDate) {
    return null;
  }

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  dueDate.setHours(0, 0, 0, 0);
  return dueDate;
}

function getCurrentWeekRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const day = start.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysSinceMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
