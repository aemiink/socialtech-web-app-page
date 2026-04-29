import { useEffect, useMemo, useState } from "react";
import { Eye, Search, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { extractApiErrorMessage } from "../features/adminUsers/adminUsersUtils";
import {
  useGetAdminAuditLogsQuery,
  useLazyGetAdminAuditLogQuery,
} from "../features/auditLogs/auditLogsApi";
import type {
  AdminAuditLog,
  AuditEntityType,
  AuditLogAction,
  AuditLogSortBy,
  AuditLogSortOrder,
} from "../features/auditLogs/auditLogsTypes";
import {
  AUDIT_ENTITY_TYPE_OPTIONS,
  AUDIT_LOG_ACTION_OPTIONS,
  AUDIT_LOG_SORT_OPTIONS,
  formatAuditMetadata,
  formatDateTime,
  getAuditActionLabel,
  getAuditEntityLabel,
} from "../features/auditLogs/auditLogsUtils";

type ActionFilter = AuditLogAction | "ALL";
type EntityTypeFilter = AuditEntityType | "ALL";

const LIMIT_OPTIONS = [10, 20, 50, 100];

export function AuditLogs() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAuditLogs =
    currentUser?.accountType === "ADMIN" &&
    currentUser.role === "ADMIN" &&
    currentUser.permissions.includes("audit_logs.read");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>("ALL");
  const [actorUserId, setActorUserId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<AuditLogSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<AuditLogSortOrder>("desc");

  const [pageError, setPageError] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const [fetchDetail, detailState] = useLazyGetAdminAuditLogQuery();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const isDateRangeInvalid = useMemo(() => {
    if (!dateFrom || !dateTo) {
      return false;
    }

    return new Date(dateFrom).getTime() > new Date(dateTo).getTime();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (isDateRangeInvalid) {
      setPageError("Başlangıç tarihi bitiş tarihinden büyük olamaz.");
    } else {
      setPageError(null);
    }
  }, [isDateRangeInvalid]);

  const query = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      action: actionFilter === "ALL" ? undefined : actionFilter,
      entityType: entityTypeFilter === "ALL" ? undefined : entityTypeFilter,
      actorUserId: actorUserId.trim().length > 0 ? actorUserId.trim() : undefined,
      targetUserId: targetUserId.trim().length > 0 ? targetUserId.trim() : undefined,
      dateFrom: dateFrom ? toStartOfDayIso(dateFrom) : undefined,
      dateTo: dateTo ? toEndOfDayIso(dateTo) : undefined,
      search: search.trim().length > 0 ? search.trim() : undefined,
    }),
    [
      actionFilter,
      actorUserId,
      dateFrom,
      dateTo,
      entityTypeFilter,
      limit,
      page,
      search,
      sortBy,
      sortOrder,
      targetUserId,
    ],
  );

  const {
    data: listResponse,
    error: listError,
    isError: isListError,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminAuditLogsQuery(query, {
    skip: !canReadAuditLogs || isDateRangeInvalid,
  });

  const logs = listResponse?.data ?? [];
  const meta = listResponse?.meta ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  useEffect(() => {
    if (listResponse && listResponse.meta.totalPages > 0 && page > listResponse.meta.totalPages) {
      setPage(listResponse.meta.totalPages);
    }
  }, [listResponse, page]);

  const openDetail = (logId: string) => {
    setSelectedLogId(logId);
    setIsDetailOpen(true);
    void fetchDetail(logId);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedLogId(null);
  };

  const selectedDetail =
    detailState.data && detailState.data.id === selectedLogId
      ? detailState.data
      : null;

  if (!canReadAuditLogs) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">İşlem Geçmişi</h1>
        <p className="text-sm text-[#A0A0A0]">
          Yönetim işlemlerinin audit log kayıtları
        </p>
      </div>

      {pageError && (
        <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {pageError}
        </Card>
      )}

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Label htmlFor="audit-search" className="mb-2 block text-xs text-[#A0A0A0]">
              Arama
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
              <Input
                id="audit-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Aksiyon, varlık tipi veya varlık ID ara..."
                className="border-white/[0.08] bg-[#202020] pl-10 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Aksiyon</Label>
            <Select
              value={actionFilter}
              onValueChange={(value: ActionFilter) => {
                setActionFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Aksiyonlar</SelectItem>
                {AUDIT_LOG_ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {getAuditActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Varlık Tipi</Label>
            <Select
              value={entityTypeFilter}
              onValueChange={(value: EntityTypeFilter) => {
                setEntityTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Varlıklar</SelectItem>
                {AUDIT_ENTITY_TYPE_OPTIONS.map((entityType) => (
                  <SelectItem key={entityType} value={entityType}>
                    {getAuditEntityLabel(entityType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Sıralama</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={sortBy}
                onValueChange={(value: AuditLogSortBy) => {
                  setSortBy(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_LOG_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortOrder}
                onValueChange={(value: AuditLogSortOrder) => {
                  setSortOrder(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Azalan</SelectItem>
                  <SelectItem value="asc">Artan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label htmlFor="audit-actor" className="mb-2 block text-xs text-[#A0A0A0]">
              Actor User ID
            </Label>
            <Input
              id="audit-actor"
              value={actorUserId}
              onChange={(event) => {
                setActorUserId(event.target.value);
                setPage(1);
              }}
              placeholder="UUID"
              className="border-white/[0.08] bg-[#202020]"
            />
          </div>
          <div>
            <Label htmlFor="audit-target" className="mb-2 block text-xs text-[#A0A0A0]">
              Target User ID
            </Label>
            <Input
              id="audit-target"
              value={targetUserId}
              onChange={(event) => {
                setTargetUserId(event.target.value);
                setPage(1);
              }}
              placeholder="UUID"
              className="border-white/[0.08] bg-[#202020]"
            />
          </div>
          <div>
            <Label htmlFor="audit-date-from" className="mb-2 block text-xs text-[#A0A0A0]">
              Başlangıç Tarihi
            </Label>
            <Input
              id="audit-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="border-white/[0.08] bg-[#202020]"
            />
          </div>
          <div>
            <Label htmlFor="audit-date-to" className="mb-2 block text-xs text-[#A0A0A0]">
              Bitiş Tarihi
            </Label>
            <Input
              id="audit-date-to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="border-white/[0.08] bg-[#202020]"
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#202020]">
              <TableRow className="border-white/[0.06] hover:bg-[#202020]">
                <TableHead className="px-4 py-3 text-[#A0A0A0]">Aksiyon</TableHead>
                <TableHead className="px-4 py-3 text-[#A0A0A0]">Varlık</TableHead>
                <TableHead className="px-4 py-3 text-[#A0A0A0]">Entity ID</TableHead>
                <TableHead className="px-4 py-3 text-[#A0A0A0]">Actor</TableHead>
                <TableHead className="px-4 py-3 text-[#A0A0A0]">Target</TableHead>
                <TableHead className="px-4 py-3 text-[#A0A0A0]">IP</TableHead>
                <TableHead className="px-4 py-3 text-[#A0A0A0]">Tarih</TableHead>
                <TableHead className="px-4 py-3 text-right text-[#A0A0A0]">Detay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow className="border-white/[0.06]">
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-[#A0A0A0]">
                    Audit log kayıtları yükleniyor...
                  </TableCell>
                </TableRow>
              )}

              {isListError && !isLoading && (
                <TableRow className="border-white/[0.06]">
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-red-300">
                    {extractApiErrorMessage(
                      listError,
                      "Audit log kayıtları alınamadı. Lütfen tekrar deneyin.",
                    )}
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => refetch()}>
                        Tekrar Dene
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isListError && logs.length === 0 && (
                <TableRow className="border-white/[0.06]">
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-[#A0A0A0]">
                    Filtrelere uygun audit log kaydı bulunamadı.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !isListError &&
                logs.map((log) => (
                  <TableRow key={log.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                    <TableCell className="px-4 py-3 text-white">
                      {getAuditActionLabel(log.action)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {getAuditEntityLabel(log.entityType)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {shortenId(log.entityId)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {shortenId(log.actorUserId)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {shortenId(log.targetUserId)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">{log.ipAddress ?? "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          void openDetail(log.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Detay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#A0A0A0]">
            Sayfa {meta.page} / {Math.max(meta.totalPages, 1)} · Toplam {meta.total} kayıt
            {isFetching && <span className="ml-2 text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[110px] border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} / sayfa
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!meta.hasPreviousPage || isFetching}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!meta.hasNextPage || isFetching}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={(open) => (!open ? closeDetail() : undefined)}>
        <DialogContent className="max-h-[80vh] overflow-auto border-white/[0.08] bg-[#1A1A1A] text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Log Detayı</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              İşlem kaydı detayları ve sanitize metadata
            </DialogDescription>
          </DialogHeader>

          {(detailState.isLoading || detailState.isFetching) && (
            <Card className="border-white/[0.08] bg-[#202020] p-4 text-[#A0A0A0]">
              Detay yükleniyor...
            </Card>
          )}

          {detailState.isError && selectedLogId && (
            <Card className="border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {extractApiErrorMessage(
                detailState.error,
                "Audit log detayı alınamadı. Lütfen tekrar deneyin.",
              )}
              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    void fetchDetail(selectedLogId);
                  }}
                >
                  Tekrar Dene
                </Button>
              </div>
            </Card>
          )}

          {selectedDetail && <AuditLogDetailContent log={selectedDetail} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuditLogDetailContent({ log }: { log: AdminAuditLog }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoItem label="Aksiyon" value={getAuditActionLabel(log.action)} />
        <InfoItem label="Varlık Tipi" value={getAuditEntityLabel(log.entityType)} />
        <InfoItem label="Entity ID" value={log.entityId ?? "—"} mono />
        <InfoItem label="Actor User ID" value={log.actorUserId ?? "—"} mono />
        <InfoItem label="Target User ID" value={log.targetUserId ?? "—"} mono />
        <InfoItem label="Target Client Profile ID" value={log.targetClientProfileId ?? "—"} mono />
        <InfoItem label="IP Adresi" value={log.ipAddress ?? "—"} />
        <InfoItem label="User Agent" value={log.userAgent ?? "—"} />
        <InfoItem label="Tarih" value={formatDateTime(log.createdAt)} />
      </div>

      <Card className="border-white/[0.06] bg-[#202020] p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-[#A0A0A0]">
          <ShieldAlert className="h-4 w-4 text-[#AAFF01]" />
          Sanitize Metadata
        </div>
        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-all rounded-md bg-[#131313] p-3 text-xs text-[#DCDCDC]">
          {formatAuditMetadata(log.metadata)}
        </pre>
      </Card>
    </div>
  );
}

function InfoItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card className="border-white/[0.06] bg-[#202020] p-3">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className={`mt-1 text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>
        {value}
      </p>
    </Card>
  );
}

function shortenId(value: string | null): string {
  if (!value) {
    return "—";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function toStartOfDayIso(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00.000`).toISOString();
}

function toEndOfDayIso(dateValue: string): string {
  return new Date(`${dateValue}T23:59:59.999`).toISOString();
}
