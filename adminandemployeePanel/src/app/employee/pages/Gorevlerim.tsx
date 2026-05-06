import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Progress } from "../../components/ui/progress";
import { CheckSquare, AlertCircle, Clock, FileText } from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  useGetTasksQuery,
  useToggleTaskTodoMutation,
} from "../../features/tasks/tasksApi";
import type { Task, TaskTodo, TasksListQuery } from "../../features/tasks/tasksTypes";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
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
  const [todoActionError, setTodoActionError] = useState<string | null>(null);
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
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();

  if (!canReadAssignedTasks) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Atanmış görevleri görüntüleme yetkiniz bulunmuyor.
      </Card>
    );
  }

  const assignedTasks = tasksResponse?.data ?? [];
  const kpis = calculateTaskKpis(assignedTasks);
  const metricValue = (value: number) => (isLoading || isError ? "—" : value);

  async function handleTodoToggle(task: Task, todo: TaskTodo) {
    setTodoActionError(null);

    try {
      await toggleTaskTodo({
        taskId: task.id,
        todoId: todo.id,
        body: { isCompleted: !todo.isCompleted },
      }).unwrap();
    } catch (error) {
      setTodoActionError(extractApiErrorMessage(error, "Todo durumu güncellenemedi."));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Görevlerim</h1>
        <p className="text-[#A0A0A0]">Bana atanan görevler</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          icon={<CheckSquare className="w-5 h-5 text-[#AAFF01]" />}
          label="Bugünkü Görev"
          value={metricValue(kpis.today)}
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          label="Geciken Görev"
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
          label="İncelemede"
          value={metricValue(kpis.review)}
        />
        <MetricCard
          icon={<CheckSquare className="w-5 h-5 text-[#AAFF01]" />}
          label="Tamamlanan"
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

      {!isLoading && !isError && assignedTasks.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Atama kapsamınızda görev bulunmuyor.
        </Card>
      )}

      {!isLoading && !isError && assignedTasks.length > 0 && (
        <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Görev</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Proje</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">İlerleme</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Deadline</th>
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
                      <TaskTodoPreview
                        task={task}
                        disabled={isTogglingTodo}
                        onToggle={(todo) => void handleTodoToggle(task, todo)}
                      />
                    </td>
                    <td className="p-4 text-sm">{getTaskClientName(task)}</td>
                    <td className="p-4 text-sm">{task.project?.name ?? "—"}</td>
                    <td className="p-4">
                      <Badge className={getPriorityBadgeClass(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="min-w-28">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[#A0A0A0]">
                          <span>{getTaskCompletionLabel(task)}</span>
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

function TaskTodoPreview({
  task,
  disabled,
  onToggle,
}: {
  task: Task;
  disabled: boolean;
  onToggle: (todo: TaskTodo) => void;
}) {
  const todos = getTaskTodos(task);

  if (todos.length === 0) {
    return <p className="mt-2 text-xs text-[#A0A0A0]">Todo yok</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      {todos.slice(0, 3).map((todo) => (
        <label key={todo.id} className="flex items-center gap-2 text-xs text-[#D8D8D8]">
          <Checkbox
            checked={todo.isCompleted}
            onCheckedChange={() => onToggle(todo)}
            disabled={disabled}
            className="border-white/[0.18] data-[state=checked]:border-[#AAFF01] data-[state=checked]:bg-[#AAFF01] data-[state=checked]:text-[#131313]"
            aria-label={`${todo.title} durumunu değiştir`}
          />
          <span className={todo.isCompleted ? "line-through text-[#A0A0A0]" : ""}>
            {todo.title}
          </span>
        </label>
      ))}
      {todos.length > 3 && (
        <p className="text-xs text-[#A0A0A0]">+{todos.length - 3} todo daha</p>
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

function calculateTaskKpis(tasks: Task[]): TaskKpis {
  return {
    today: tasks.filter((task) => isTaskDueToday(task)).length,
    overdue: tasks.filter(isTaskOverdue).length,
    dueThisWeek: tasks.filter((task) => isTaskDueThisWeek(task)).length,
    review: tasks.filter((task) => task.status === "REVIEW").length,
    done: tasks.filter((task) => task.status === "DONE").length,
  };
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
