import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { TasksListQuery } from "../../features/tasks/tasksTypes";
import {
  extractApiErrorMessage,
  formatDate,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskClientName,
  getTaskCompletionLabel,
  getTaskCompletionPercent,
  getTaskEnvironmentLabel,
  getTaskSeverityBadgeClass,
  getTaskSeverityLabel,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  getTaskTypeBadgeClass,
  getTaskTypeLabel,
  getTaskWorkstreamBadgeClass,
  getTaskWorkstreamLabel,
} from "../../features/tasks/tasksUtils";
import { useAppSelector } from "../../store/hooks";

type DeveloperTasksPageProps = {
  title: string;
  description: string;
  query: TasksListQuery;
  showBugFields?: boolean;
};

export function DeveloperTasksPage({
  title,
  description,
  query,
  showBugFields = false,
}: DeveloperTasksPageProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAssignedTasks =
    currentUser?.accountType === "EMPLOYEE" &&
    currentUser.permissions.includes("tasks.read.assigned");
  const scopedQuery: TasksListQuery =
    currentUser?.id && currentUser.accountType === "EMPLOYEE"
      ? { ...query, assigneeUserId: currentUser.id }
      : query;

  const { data, error, isError, isLoading, refetch } = useGetTasksQuery(scopedQuery, {
    skip: !canReadAssignedTasks,
  });

  if (!canReadAssignedTasks) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfayı görüntüleme yetkiniz bulunmuyor.
      </Card>
    );
  }

  const tasks = data?.data ?? [];
  const total = tasks.length;
  const open = tasks.filter((task) => task.status !== "DONE").length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const highRisk = tasks.filter(
    (task) => task.priority === "URGENT" || task.severity === "CRITICAL",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
        <p className="text-[#A0A0A0]">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Toplam" value={total} />
        <MetricCard label="Açık" value={open} valueClassName="text-orange-300" />
        <MetricCard label="Tamamlanan" value={done} valueClassName="text-[#d8ff8f]" />
        <MetricCard label="Yüksek Risk" value={highRisk} valueClassName="text-red-300" />
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

      {!isLoading && !isError && tasks.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Bu kategori için görev bulunmuyor.
        </Card>
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Görev</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Müşteri / Proje</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Taksonomi</th>
                  {showBugFields && (
                    <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">
                      Ortam / Severity
                    </th>
                  )}
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">İlerleme</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Deadline</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-white/[0.06] align-top hover:bg-white/5">
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          {task.code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {task.code}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="max-w-[420px] text-sm text-[#A0A0A0]">{task.description}</p>
                        )}
                        {task.sprint?.name && (
                          <p className="text-xs text-[#A0A0A0]">Sprint: {task.sprint.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{getTaskClientName(task)}</p>
                      <p className="text-xs text-[#A0A0A0]">{task.project?.name ?? "—"}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getTaskTypeBadgeClass(task.type)}>
                          {getTaskTypeLabel(task.type)}
                        </Badge>
                        <Badge className={getTaskWorkstreamBadgeClass(task.workstream)}>
                          {getTaskWorkstreamLabel(task.workstream)}
                        </Badge>
                        <Badge className={getPriorityBadgeClass(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                    </td>
                    {showBugFields && (
                      <td className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-[#E5E5E5]">
                            {task.environment ? getTaskEnvironmentLabel(task.environment) : "—"}
                          </p>
                          {task.severity ? (
                            <Badge className={getTaskSeverityBadgeClass(task.severity)}>
                              {getTaskSeverityLabel(task.severity)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-[#A0A0A0]">Severity yok</span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="min-w-28">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[#A0A0A0]">
                          <span>{getTaskCompletionLabel(task)}</span>
                          <span>%{getTaskCompletionPercent(task)}</span>
                        </div>
                        <Progress value={getTaskCompletionPercent(task)} className="h-2" />
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{formatDate(task.dueDate)}</td>
                    <td className="p-4">
                      <Badge className={getTaskStatusBadgeClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </Badge>
                      <div className="mt-3">
                        <Button asChild type="button" size="sm" variant="outline">
                          <Link to={`/employee/gorevlerim/${task.id}`}>Detay</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-2 text-sm text-[#A0A0A0]">{label}</div>
      <div className={`text-2xl font-semibold ${valueClassName}`}>{value}</div>
    </Card>
  );
}
