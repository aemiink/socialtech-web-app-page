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
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Portal Slug</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">İletişim</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Oluşturulma</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Güncelleme</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-white/[0.06] transition-colors hover:bg-white/5"
                  >
                    <td className="p-4 font-medium text-white">{client.companyName}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {client.slug}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">
                      {client.contactEmail ?? "—"}
                    </td>
                    <td className="p-4">
                      <Badge className={getClientStatusBadgeClass(client.status)}>
                        {getClientStatusLabel(client.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">
                      {formatClientDate(client.createdAt)}
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">
                      {formatClientDateTime(client.updatedAt)}
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

function isWithinLastDays(value: string, days: number): boolean {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);

  return date >= threshold;
}
