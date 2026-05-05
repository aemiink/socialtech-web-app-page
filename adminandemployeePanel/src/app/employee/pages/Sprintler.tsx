import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useGetDeliverySprintsQuery } from "../../features/delivery/deliveryApi";
import {
  getDeliverySprintStatusBadgeClass,
  getDeliverySprintStatusLabel,
} from "../../features/delivery/deliveryUtils";
import { formatDate } from "../../features/projects/projectsUtils";
import { extractApiErrorMessage } from "../../features/tasks/tasksUtils";

export function Sprintler() {
  const { data, error, isError, isLoading, refetch } = useGetDeliverySprintsQuery();
  const sprints = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Sprintler</h1>
        <p className="text-[#A0A0A0]">Atandığınız proje kapsamındaki sprintler</p>
      </div>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Sprintler yükleniyor...
        </Card>
      )}

      {isError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(error, "Sprintler alınamadı.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isError && sprints.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Sprint bulunmuyor.
        </Card>
      )}

      {!isLoading && !isError && sprints.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold">{sprint.name}</h3>
                    <Badge className={getDeliverySprintStatusBadgeClass(sprint.status)}>
                      {getDeliverySprintStatusLabel(sprint.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#A0A0A0]">
                    {sprint.project?.clientProfile?.companyName ?? "—"} · {sprint.project?.name ?? "—"}
                  </p>
                  {sprint.goal && <p className="mt-2 text-sm text-[#D8D8D8]">{sprint.goal}</p>}
                </div>
                <div className="text-right text-xs text-[#A0A0A0]">
                  <p>{formatDate(sprint.startDate)}</p>
                  <p>— {formatDate(sprint.endDate)}</p>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#A0A0A0]">
                  {sprint.taskCounts.completed}/{sprint.taskCounts.total} tamamlandı
                </span>
                <span className="text-[#d8ff8f]">%{sprint.progressPercent}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[#AAFF01]"
                  style={{ width: `${sprint.progressPercent}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
