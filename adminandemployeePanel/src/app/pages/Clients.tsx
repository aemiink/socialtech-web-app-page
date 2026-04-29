import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { useGetClientsQuery } from "../features/clients/clientsApi";
import type {
  ClientProfile,
  ClientStatus,
  ClientsSortOrder,
  ClientsListQuery,
  ClientsSortBy,
} from "../features/clients/clientsTypes";
import {
  CLIENT_STATUS_OPTIONS,
  extractApiErrorMessage,
  formatClientDate,
  formatClientDateTime,
  getClientStatusBadgeClass,
  getClientStatusLabel,
  shortId,
} from "../features/clients/clientsUtils";

const CLIENT_SORT_OPTIONS: Array<{ value: ClientsSortBy; label: string }> = [
  { value: "name", label: "Firma" },
  { value: "slug", label: "Portal Slug" },
  { value: "status", label: "Durum" },
  { value: "createdAt", label: "Oluşturulma" },
  { value: "updatedAt", label: "Güncellenme" },
];

type ClientStatusFilter = ClientStatus | "ALL";

export function Clients() {
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<ClientsSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<ClientsSortOrder>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const clientsQuery = useMemo<ClientsListQuery>(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      search: searchInput.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    }),
    [limit, page, searchInput, sortBy, sortOrder, statusFilter],
  );

  const {
    data: clientsResponse,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetClientsQuery(clientsQuery);

  const clients = clientsResponse?.data ?? [];
  const meta = clientsResponse?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  };

  const hasActiveFilters = searchInput.trim().length > 0 || statusFilter !== "ALL";
  const activeOnPageCount = clients.filter((client) => client.status === "ACTIVE").length;
  const recentActivityCount = clients.filter(
    (client) => isDateInCurrentMonth(client.createdAt) || isWithinLastDays(client.updatedAt, 30),
  ).length;

  const kpiCards = [
    {
      label: "Toplam Müşteri",
      value: getMetricValue(meta.total, isLoading, isListError),
      icon: Users,
      color: "text-white",
    },
    {
      label: "Sayfadaki Kayıt",
      value: getMetricValue(clients.length, isLoading, isListError),
      icon: Building2,
      color: "text-[#AAFF01]",
    },
    {
      label: "Aktif (Sayfa)",
      value: getMetricValue(activeOnPageCount, isLoading, isListError),
      icon: UserPlus,
      color: "text-blue-400",
    },
    {
      label: "Son 30 Gün (Sayfa)",
      value: getMetricValue(recentActivityCount, isLoading, isListError),
      icon: Calendar,
      color: "text-orange-400",
    },
  ];

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Müşteriler</h1>
          <p className="text-sm text-[#A0A0A0]">
            Backend Clients API üzerinden sayfalı müşteri profilleri
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          disabled
          title="Müşteri oluşturma endpoint'i henüz bu ekrana bağlanmadı."
        >
          <UserPlus className="h-4 w-4" />
          Yeni Müşteri Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className={`rounded-lg bg-white/5 p-2 ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isFetching && !isLoading && (
                  <span className="text-xs text-[#d2ff8a]">Güncelleniyor</span>
                )}
              </div>
              <div className="mb-1 text-2xl font-semibold text-white">{kpi.value}</div>
              <div className="text-sm text-[#A0A0A0]">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_170px_140px_120px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
            <Input
              id="client-search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                resetToFirstPage();
              }}
              placeholder="Firma veya slug ara..."
              className="border-white/[0.06] bg-[#202020] pl-10 text-white"
            />
          </div>

          <SelectControl
            ariaLabel="Durum filtresi"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as ClientStatusFilter);
              resetToFirstPage();
            }}
          >
            <option value="ALL">Tüm Durumlar</option>
            {CLIENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {getClientStatusLabel(status)}
              </option>
            ))}
          </SelectControl>

          <SelectControl
            ariaLabel="Sıralama alanı"
            value={sortBy}
            onChange={(value) => {
              setSortBy(value as ClientsSortBy);
              resetToFirstPage();
            }}
          >
            {CLIENT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectControl>

          <SelectControl
            ariaLabel="Sıralama yönü"
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value as ClientsSortOrder);
              resetToFirstPage();
            }}
          >
            <option value="asc">Artan</option>
            <option value="desc">Azalan</option>
          </SelectControl>

          <SelectControl
            ariaLabel="Sayfa boyutu"
            value={String(limit)}
            onChange={(value) => {
              setLimit(Number(value));
              resetToFirstPage();
            }}
          >
            <option value="10">10 / sayfa</option>
            <option value="20">20 / sayfa</option>
            <option value="50">50 / sayfa</option>
          </SelectControl>

          <div className="flex flex-wrap gap-2">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setStatusFilter("ALL");
                  resetToFirstPage();
                }}
                className="gap-1"
              >
                <X className="h-3 w-3" />
                Temizle
              </Button>
            )}

            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Müşteri listesi yükleniyor...
        </Card>
      )}

      {isListError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(listError, "Müşteri listesi alınamadı. Lütfen tekrar deneyin.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isListError && clients.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          {hasActiveFilters ? "Filtrelere uygun müşteri bulunamadı." : "Henüz müşteri kaydı bulunmuyor."}
        </Card>
      )}

      {!isLoading && !isListError && clients.length > 0 && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Firma</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Portal Slug</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Oluşturulma</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Güncellenme</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Kayıt ID</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-white/[0.06] transition-colors hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{client.companyName}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {client.slug}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-[#D8D8D8]">
                      <Badge className={getClientStatusBadgeClass(client.status)}>
                        {getClientStatusLabel(client.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{formatClientDate(client.createdAt)}</td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{formatClientDateTime(client.updatedAt)}</td>
                    <td className="p-4 font-mono text-sm text-[#A0A0A0]">{shortId(client.id)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Eye className="h-4 w-4" />
                          Önizle
                        </Button>
                        <Link to={`/musteriler/${client.id}`}>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                          >
                            Detay
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationFooter
            meta={meta}
            isFetching={isFetching}
            onPrevious={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNext={() => setPage((currentPage) => currentPage + 1)}
          />
        </Card>
      )}

      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-[500px] border-l border-white/[0.06] bg-[#1A1A1A]">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl text-white">{selectedClient.companyName}</SheetTitle>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className={getClientStatusBadgeClass(selectedClient.status)}>
                    {getClientStatusLabel(selectedClient.status)}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {selectedClient.slug}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-white/[0.06] bg-[#202020] p-4">
                    <p className="mb-1 text-xs text-[#A0A0A0]">Oluşturulma</p>
                    <p className="text-sm font-semibold text-white">
                      {formatClientDate(selectedClient.createdAt)}
                    </p>
                  </Card>
                  <Card className="border-white/[0.06] bg-[#202020] p-4">
                    <p className="mb-1 text-xs text-[#A0A0A0]">Son Güncelleme</p>
                    <p className="text-sm font-semibold text-white">
                      {formatClientDateTime(selectedClient.updatedAt)}
                    </p>
                  </Card>
                </div>

                <Card className="border-white/[0.06] bg-[#202020] p-4">
                  <p className="mb-2 text-xs text-[#A0A0A0]">Müşteri Kayıt ID</p>
                  <p className="break-all font-mono text-sm text-white">{selectedClient.id}</p>
                </Card>

                <div className="border-t border-white/[0.06] pt-4">
                  <Link to={`/musteriler/${selectedClient.id}`}>
                    <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                      Müşteri Detayına Git
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SelectControl({
  ariaLabel,
  value,
  onChange,
  children,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
    >
      {children}
    </select>
  );
}

function PaginationFooter({
  meta,
  isFetching,
  onPrevious,
  onNext,
}: {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const startRecord = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endRecord = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 text-sm text-[#A0A0A0]">
      <span>
        {startRecord}-{endRecord} / {meta.total} kayıt
      </span>
      <div className="flex items-center gap-3">
        <span>
          Sayfa {meta.page} / {meta.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!meta.hasPreviousPage || isFetching}
            onClick={onPrevious}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!meta.hasNextPage || isFetching}
            onClick={onNext}
            className="gap-1"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getMetricValue(value: number, isLoading: boolean, isError: boolean): string {
  if (isError) {
    return "--";
  }

  if (isLoading) {
    return "...";
  }

  return value.toLocaleString("tr-TR");
}

function isDateInCurrentMonth(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isWithinLastDays(value: string, days: number): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const differenceMs = Date.now() - date.getTime();
  return differenceMs >= 0 && differenceMs <= days * 86_400_000;
}
