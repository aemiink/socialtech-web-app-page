import { useMemo } from "react";
import { AlertCircle, Clock, RefreshCw, Users } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import type { ClientsListQuery } from "../../features/clients/clientsTypes";
import {
  extractApiErrorMessage,
  formatClientDate,
  formatClientDateTime,
  getClientStatusBadgeClass,
  getClientStatusLabel,
} from "../../features/clients/clientsUtils";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useAppSelector } from "../../store/hooks";
import { Link } from "react-router";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";

const ASSIGNED_CLIENTS_LIMIT = 100;

export function Musterilerim() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAssignedClients =
    currentUser?.accountType === "EMPLOYEE" &&
    currentUser.permissions.includes("clients.read.assigned");

  const clientsQuery = useMemo<ClientsListQuery>(
    () => ({
      status: "ACTIVE",
      limit: ASSIGNED_CLIENTS_LIMIT,
      sortBy: "name",
      sortOrder: "asc",
    }),
    [],
  );

  const {
    data: clientsResponse,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetClientsQuery(clientsQuery, { skip: !canReadAssignedClients });

  if (!canReadAssignedClients) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Atanmış müşteri listesini görüntüleme yetkiniz bulunmuyor.
      </Card>
    );
  }

  const clients = clientsResponse?.data ?? [];
  const { data: projectsResponse } = useGetProjectsQuery();
  const { data: tasksResponse } = useGetTasksQuery();
  const projects = projectsResponse?.data ?? [];
  const tasks = tasksResponse?.data ?? [];
  const totalClients = clientsResponse?.meta.total ?? clients.length;
  const recentlyUpdatedCount = clients.filter((client) =>
    isWithinLastDays(client.updatedAt, 30),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Müşterilerim</h1>
          <p className="text-[#A0A0A0]">Aktif atamalarınıza bağlı müşteri profilleri</p>
        </div>
        <Button type="button" variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">
            {isLoading || isError ? "—" : totalClients}
          </div>
        </Card>
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Son 30 Gün Güncellenen</span>
          </div>
          <div className="text-2xl font-semibold">
            {isLoading || isError ? "—" : recentlyUpdatedCount}
          </div>
        </Card>
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <span className="text-sm text-[#A0A0A0]">Liste Durumu</span>
          </div>
          <div className="text-2xl font-semibold">
            {isFetching && !isLoading ? "Güncelleniyor" : "Hazır"}
          </div>
        </Card>
      </div>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Müşteriler yükleniyor...
        </Card>
      )}

      {isError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(error, "Müşteriler alınamadı.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isError && clients.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Henüz atanmış aktif müşteri bulunmuyor.
        </Card>
      )}

      {!isLoading && !isError && clients.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {clients.map((client) => {
            const clientProjects = projects.filter((project) => project.clientProfileId === client.id);
            const openTasks = tasks.filter(
              (task) => task.project?.clientProfile?.id === client.id && task.status !== "DONE",
            );
            return (
              <Card key={client.id} className="border-white/[0.06] bg-[#1A1A1A] p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{client.companyName}</h3>
                    <p className="text-xs text-[#A0A0A0]">{client.contactEmail ?? "—"}</p>
                  </div>
                  <Badge className={getClientStatusBadgeClass(client.status)}>
                    {getClientStatusLabel(client.status)}
                  </Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {(client.purchasedServices ?? []).map((service) => (
                    <Badge key={`${client.id}-${service.serviceKey}`} variant="outline" className="text-xs">
                      {service.serviceKey}
                    </Badge>
                  ))}
                  {(client.purchasedServices ?? []).length === 0 ? (
                    <span className="text-xs text-[#A0A0A0]">Satın alınan hizmet bulunmuyor</span>
                  ) : null}
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded border border-white/[0.06] bg-white/5 p-2">
                    <p className="text-[#A0A0A0]">Aktif Proje</p>
                    <p className="text-white">{clientProjects.length}</p>
                  </div>
                  <div className="rounded border border-white/[0.06] bg-white/5 p-2">
                    <p className="text-[#A0A0A0]">Açık Task</p>
                    <p className="text-white">{openTasks.length}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#A0A0A0]">Güncelleme: {formatClientDateTime(client.updatedAt)}</p>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/employee/project-manager/clients/${client.id}`}>Müşteri Operasyonu</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function isWithinLastDays(value: string, days: number): boolean {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);

  return date >= threshold;
}
