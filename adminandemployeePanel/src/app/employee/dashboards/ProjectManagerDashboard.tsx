import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import { extractApiErrorMessage } from "../../features/tasks/tasksUtils";

export function ProjectManagerDashboard() {
  const { data: clientsResponse, isLoading, isError, error } = useGetClientsQuery({
    status: "ACTIVE",
    limit: 50,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const { data: projectsResponse } = useGetProjectsQuery();
  const { data: tasksResponse } = useGetTasksQuery();

  const clients = clientsResponse?.data ?? [];
  const projects = projectsResponse?.data ?? [];
  const tasks = tasksResponse?.data ?? [];
  const openTasks = tasks.filter((task) => task.status !== "DONE").length;

  if (isLoading) {
    return <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-[#A0A0A0]">Project manager özeti yükleniyor...</Card>;
  }

  if (isError) {
    return <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">{extractApiErrorMessage(error, "Project manager özeti alınamadı.")}</Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Project Manager Dashboard</h1>
        <p className="text-[#A0A0A0]">Atanmış müşteri ve hizmet operasyon özeti</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Aktif Müşteri" value={String(clients.length)} />
        <MetricCard label="Aktif Proje" value={String(projects.length)} />
        <MetricCard label="Açık Görev" value={String(openTasks)} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Öncelikli Müşteriler</h3>
          <Button asChild variant="outline" size="sm">
            <Link to="/employee/musterilerim">Tüm Müşteriler</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {clients.slice(0, 6).map((client) => (
            <div key={client.id} className="rounded-lg border border-white/[0.06] bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white">{client.companyName}</p>
                  <p className="text-xs text-[#A0A0A0]">{client.slug}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(client.purchasedServices ?? []).slice(0, 3).map((service) => (
                    <Badge key={`${client.id}-${service.serviceKey}`} variant="outline" className="text-[10px]">
                      {service.serviceKey}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/employee/project-manager/clients/${client.id}`}>Operasyonu Aç</Link>
                </Button>
              </div>
            </div>
          ))}
          {clients.length === 0 ? <p className="text-sm text-[#A0A0A0]">Atanmış aktif müşteri bulunmuyor.</p> : null}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <p className="text-sm text-[#A0A0A0]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </Card>
  );
}
