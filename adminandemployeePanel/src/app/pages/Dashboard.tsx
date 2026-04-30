import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  FolderKanban,
  ListChecks,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { extractApiErrorMessage } from "../features/adminUsers/adminUsersUtils";
import { useGetAdminSummaryQuery } from "../features/dashboard/dashboardApi";
import {
  EMPTY_ADMIN_SUMMARY,
  formatDashboardDateTime,
  formatDashboardMetric,
} from "../features/dashboard/dashboardUtils";

export function Dashboard() {
  const {
    data: summaryResponse,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminSummaryQuery();

  const summary = summaryResponse ?? EMPTY_ADMIN_SUMMARY;
  const isUpdating = isFetching && !isLoading;

  const kpis = [
    {
      label: "Toplam Kullanıcı",
      value: formatDashboardMetric(summary.users.total, isLoading, isError),
      icon: Users,
      color: "text-white",
    },
    {
      label: "Toplam Çalışan",
      value: formatDashboardMetric(summary.users.employees, isLoading, isError),
      icon: Users,
      color: "text-[#AAFF01]",
    },
    {
      label: "Aktif Kullanıcı",
      value: formatDashboardMetric(summary.users.active, isLoading, isError),
      icon: CheckCircle,
      color: "text-white",
    },
    {
      label: "Pasif Kullanıcı",
      value: formatDashboardMetric(summary.users.inactive, isLoading, isError),
      icon: Clock,
      color: "text-orange-400",
    },
    {
      label: "Toplam Müşteri",
      value: formatDashboardMetric(summary.clients.total, isLoading, isError),
      icon: Building2,
      color: "text-white",
    },
    {
      label: "Toplam Proje",
      value: formatDashboardMetric(summary.projects.total, isLoading, isError),
      icon: FolderKanban,
      color: "text-white",
    },
    {
      label: "Devam Eden Proje",
      value: formatDashboardMetric(summary.projects.inProgress, isLoading, isError),
      icon: FolderKanban,
      color: "text-[#AAFF01]",
    },
    {
      label: "Toplam Görev",
      value: formatDashboardMetric(summary.tasks.total, isLoading, isError),
      icon: ListChecks,
      color: "text-white",
    },
    {
      label: "Bloklanan Görev",
      value: formatDashboardMetric(summary.tasks.blocked, isLoading, isError),
      icon: AlertCircle,
      color: "text-red-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-[#A0A0A0]">
            KPI kartları admin summary API verilerinden gelir.
          </p>
        </div>
        <Button type="button" variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Yenile
        </Button>
      </div>

      {isError && (
        <Card className="border-orange-500/30 bg-orange-500/10 p-5">
          <div className="mb-3 flex items-center gap-2 text-orange-200">
            <ShieldAlert className="h-5 w-5" />
            <span className="font-medium">Dashboard özeti yüklenemedi</span>
          </div>
          <p className="text-sm text-orange-100">
            {extractApiErrorMessage(error, "Admin summary verisi alınamadı.")}
          </p>
        </Card>
      )}

      <Card className="border-white/[0.06] bg-gradient-to-br from-[#1A1A1A] to-[#202020] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Operasyon Özeti</h2>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              Son audit kaydı: {formatDashboardDateTime(summary.auditLogs.lastActionAt)}
            </p>
            <p className="mt-1 text-xs text-[#7D7D7D]">
              Son güncelleme: {formatDashboardDateTime(summary.meta.generatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#AAFF01] text-[#131313]">
              Toplam Audit Log:{" "}
              {formatDashboardMetric(summary.auditLogs.total, isLoading, isError)}
            </Badge>
            {isUpdating && (
              <Badge variant="outline" className="text-[#d2ff8a]">
                Güncelleniyor
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className={`rounded-lg bg-white/5 p-2 ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-semibold text-white">{kpi.value}</div>
              <div className="text-sm text-[#A0A0A0]">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Proje Durumu</h3>
          <div className="space-y-3 text-sm">
            <SummaryRow
              label="Planlandı"
              value={formatDashboardMetric(summary.projects.planned, isLoading, isError)}
            />
            <SummaryRow
              label="Devam Eden"
              value={formatDashboardMetric(summary.projects.inProgress, isLoading, isError)}
            />
            <SummaryRow
              label="Tamamlanan"
              value={formatDashboardMetric(summary.projects.completed, isLoading, isError)}
            />
            <SummaryRow
              label="Beklemede"
              value={formatDashboardMetric(summary.projects.onHold, isLoading, isError)}
            />
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Görev Durumu</h3>
          <div className="space-y-3 text-sm">
            <SummaryRow
              label="Yapılacak"
              value={formatDashboardMetric(summary.tasks.todo, isLoading, isError)}
            />
            <SummaryRow
              label="İncelemede"
              value={formatDashboardMetric(summary.tasks.review, isLoading, isError)}
            />
            <SummaryRow
              label="Devam Eden"
              value={formatDashboardMetric(summary.tasks.inProgress, isLoading, isError)}
            />
            <SummaryRow
              label="Tamamlanan"
              value={formatDashboardMetric(summary.tasks.done, isLoading, isError)}
            />
            <SummaryRow
              label="Bloklanan"
              value={formatDashboardMetric(summary.tasks.blocked, isLoading, isError)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <span className="text-[#A0A0A0]">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
