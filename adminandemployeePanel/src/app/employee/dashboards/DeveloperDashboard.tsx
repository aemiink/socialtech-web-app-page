import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useGetDeliverySummaryQuery } from "../../features/delivery/deliveryApi";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import {
  getDeliveryReleaseStatusBadgeClass,
  getDeliveryReleaseStatusLabel,
  getDeliverySprintStatusBadgeClass,
  getDeliverySprintStatusLabel,
} from "../../features/delivery/deliveryUtils";
import { formatDate } from "../../features/projects/projectsUtils";
import { getTaskStatusBadgeClass, getTaskStatusLabel, extractApiErrorMessage } from "../../features/tasks/tasksUtils";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";

export function DeveloperDashboard() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data, error, isError, isLoading } = useGetDeliverySummaryQuery();
  const { data: assignedClients } = useGetClientsQuery(
    { limit: 5, page: 1 },
    { skip: !currentUser },
  );

  if (isLoading) {
    return (
      <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
        Developer özeti yükleniyor...
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        {extractApiErrorMessage(error, "Developer özeti alınamadı.")}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Developer Dashboard</h1>
        <p className="text-[#A0A0A0]">Gerçek delivery operasyon özeti</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <MetricCard label="Açık Task" value={data.assignedOpenTasks} />
        <MetricCard label="Kritik Bug" value={data.criticalBugs} valueClassName="text-red-300" />
        <MetricCard label="Aktif Sprint" value={data.activeSprints} />
        <MetricCard label="Test Kuyruğu" value={data.testingQueue} valueClassName="text-orange-300" />
        <MetricCard label="Bu Sprint Biten" value={data.completedThisSprint} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <h3 className="mb-3 text-lg font-semibold">Size Atanan Müşteriler</h3>
        {assignedClients?.data?.length ? (
          <div className="flex flex-wrap gap-2">
            {assignedClients.data.map((client) => (
              <Badge key={client.id} variant="outline">
                {client.companyName}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#A0A0A0]">
            Henüz size atanmış müşteri görünmüyor. Atama yapıldıysa oturumu yenileyin.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-lg font-semibold">Aktif Sprintler</h3>
          <div className="space-y-3">
            {data.activeSprintCards.map((sprint) => (
              <div key={sprint.id} className="rounded-lg border border-white/[0.06] bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{sprint.name}</p>
                    <p className="text-xs text-[#A0A0A0]">
                      {sprint.project?.clientProfile?.companyName ?? "—"} · {sprint.project?.name ?? "—"}
                    </p>
                  </div>
                  <Badge className={getDeliverySprintStatusBadgeClass(sprint.status)}>
                    {getDeliverySprintStatusLabel(sprint.status)}
                  </Badge>
                </div>
                <div className="mb-2 flex items-center justify-between text-xs text-[#A0A0A0]">
                  <span>{sprint.taskCounts.completed}/{sprint.taskCounts.total} task</span>
                  <span>%{sprint.progressPercent}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[#AAFF01]" style={{ width: `${sprint.progressPercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-lg font-semibold">Kritik Buglar</h3>
          <div className="space-y-3">
            {data.criticalBugCards.map((task) => (
              <div key={task.id} className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-[#f0c9c9]">
                  {task.project?.clientProfile?.companyName ?? "—"} · {task.project?.name ?? "—"}
                </p>
                <div className="mt-2">
                  <Badge className={getTaskStatusBadgeClass(task.status)}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-lg font-semibold">Bugünkü Tasklar</h3>
          <div className="space-y-3">
            {data.todaysTasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-white/[0.06] bg-white/5 p-4">
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">
                  {task.project?.clientProfile?.companyName ?? "—"} · Deadline {formatDate(task.dueDate)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-lg font-semibold">Release Kuyruğu</h3>
          <div className="space-y-3">
            {data.releaseQueue.map((release) => (
              <div key={release.id} className="rounded-lg border border-white/[0.06] bg-white/5 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="font-medium">{release.title}</p>
                  <Badge className={getDeliveryReleaseStatusBadgeClass(release.status)}>
                    {getDeliveryReleaseStatusLabel(release.status)}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0]">
                  {release.project?.clientProfile?.companyName ?? "—"} · {release.project?.name ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
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
