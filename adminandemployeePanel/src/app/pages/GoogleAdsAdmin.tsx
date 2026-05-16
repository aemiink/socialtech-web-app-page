import { useMemo, useState } from "react";
import { BadgeCheck, Link2Off, RefreshCw, RotateCcw, TestTube2, Wrench } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { hasAdminPermission, selectCurrentUser } from "../features/auth/authSelectors";
import {
  useDisconnectAdminClientGoogleAdsMutation,
  useGetAdminGoogleAdsSyncLogsQuery,
  useRetryAdminClientGoogleAdsSyncMutation,
  useGetAdminGoogleAdsClientsQuery,
  useSyncAdminClientGoogleAdsMutation,
  useTestAdminClientGoogleAdsConnectionMutation,
  useUpdateAdminClientGoogleAdsConfigMutation,
} from "../features/clients/clientsApi";
import type {
  AdminGoogleAdsClientListItem,
  GoogleAdsConnectionStatus,
  GoogleAdsSyncStatus,
} from "../features/clients/clientsTypes";
import {
  extractApiErrorMessage,
  formatClientDateTime,
  getClientStatusBadgeClass,
  getClientStatusLabel,
  getGoogleAdsConnectionStatusBadgeClass,
  getGoogleAdsConnectionStatusLabel,
} from "../features/clients/clientsUtils";
import { useCreateTaskMutation } from "../features/tasks/tasksApi";
import { useAppSelector } from "../store/hooks";

type ConfigFormState = {
  customerId: string;
  managerCustomerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  connectionStatus: GoogleAdsConnectionStatus;
};

const initialConfigForm: ConfigFormState = {
  customerId: "",
  managerCustomerId: "",
  descriptiveName: "",
  currencyCode: "",
  timeZone: "",
  connectionStatus: "NOT_CONNECTED",
};

const connectionStatusOptions: GoogleAdsConnectionStatus[] = [
  "NOT_CONNECTED",
  "PENDING",
  "CONNECTED",
  "ERROR",
  "DISCONNECTED",
];

export function GoogleAdsAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadConfigAny = hasAdminPermission(currentUser, ["googleAds.config.read.any"]);
  const canReadReportingAny = hasAdminPermission(currentUser, ["googleAds.reporting.read.any"]);
  const canReadGoogleAds = canReadConfigAny && canReadReportingAny;
  const canManageGoogleAds = hasAdminPermission(currentUser, ["googleAds.config.manage.any"]);
  const canRunSync = hasAdminPermission(currentUser, ["googleAds.sync.run.any"]);
  const canManageApprovals =
    hasAdminPermission(currentUser, ["googleAds.approvals.manage.any"]) &&
    hasAdminPermission(currentUser, ["tasks.manage.any"]);

  const {
    data: response,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminGoogleAdsClientsQuery(undefined, {
    skip: !canReadGoogleAds,
  });
  const {
    data: syncLogsResponse,
    error: syncLogsError,
    isError: isSyncLogsError,
    isLoading: isSyncLogsLoading,
    refetch: refetchSyncLogs,
  } = useGetAdminGoogleAdsSyncLogsQuery(
    {
      limit: 20,
    },
    {
      skip: !canReadGoogleAds,
    },
  );

  const [updateGoogleAdsConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientGoogleAdsConfigMutation();
  const [testGoogleAdsConnection, { isLoading: isTestingConnection }] =
    useTestAdminClientGoogleAdsConnectionMutation();
  const [syncGoogleAds, { isLoading: isSyncing }] = useSyncAdminClientGoogleAdsMutation();
  const [retryGoogleAdsSync, { isLoading: isRetryingSync }] =
    useRetryAdminClientGoogleAdsSyncMutation();
  const [disconnectGoogleAds, { isLoading: isDisconnecting }] =
    useDisconnectAdminClientGoogleAdsMutation();
  const [createTask, { isLoading: isCreatingApproval }] = useCreateTaskMutation();

  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [configTarget, setConfigTarget] = useState<AdminGoogleAdsClientListItem | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(initialConfigForm);
  const [activeClientActionId, setActiveClientActionId] = useState<string | null>(null);

  const listItems = response?.data ?? [];
  const meta = response?.meta;
  const dateRange = response?.dateRange;
  const syncLogs = syncLogsResponse?.data ?? [];
  const syncLogsMeta = syncLogsResponse?.meta;

  const failedClients = useMemo(
    () => listItems.filter((item) => item.connectionStatus === "ERROR" || Boolean(item.syncError)),
    [listItems],
  );

  const latestSyncLogByClientId = useMemo(() => {
    const map = new Map<string, (typeof syncLogs)[number]>();
    for (const row of syncLogs) {
      if (!map.has(row.clientProfileId)) {
        map.set(row.clientProfileId, row);
      }
    }
    return map;
  }, [syncLogs]);

  const lastSuccessfulSyncByClientId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of syncLogs) {
      if (row.status === "SUCCESS" || row.status === "PARTIAL") {
        if (!map.has(row.clientProfileId)) {
          map.set(row.clientProfileId, row.finishedAt ?? row.startedAt);
        }
      }
    }
    return map;
  }, [syncLogs]);

  const isMutating =
    isUpdatingConfig ||
    isTestingConnection ||
    isSyncing ||
    isRetryingSync ||
    isDisconnecting ||
    isCreatingApproval;

  const kpis = useMemo(
    () => [
      { label: "Google Ads Müşteri", value: meta?.total ?? 0 },
      { label: "Connected", value: meta?.connected ?? 0 },
      { label: "Hatalı Bağlantı", value: meta?.error ?? 0 },
      { label: "Bekleyen Onay", value: meta?.pendingApprovals ?? 0 },
    ],
    [meta],
  );

  function openConfigDialog(client: AdminGoogleAdsClientListItem) {
    setPageMessage(null);
    setConfigTarget(client);
    setConfigForm({
      customerId: client.account.customerId ?? "",
      managerCustomerId: client.account.managerCustomerId ?? "",
      descriptiveName: client.account.descriptiveName ?? "",
      currencyCode: client.account.currencyCode ?? "",
      timeZone: client.account.timeZone ?? "",
      connectionStatus: client.connectionStatus,
    });
  }

  function closeConfigDialog() {
    if (isUpdatingConfig) {
      return;
    }

    setConfigTarget(null);
    setConfigForm(initialConfigForm);
  }

  function updateConfigField(field: keyof ConfigFormState, value: string) {
    setConfigForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function runClientAction(
    clientId: string,
    action: () => Promise<void>,
    successMessage: string,
    fallbackErrorMessage: string,
  ) {
    setPageMessage(null);
    setActiveClientActionId(clientId);

    try {
      await action();
      setPageMessage({
        type: "success",
        text: successMessage,
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, fallbackErrorMessage),
      });
    } finally {
      setActiveClientActionId(null);
    }
  }

  async function handleConfigSave() {
    if (!configTarget || !canManageGoogleAds || isUpdatingConfig) {
      return;
    }

    await runClientAction(
      configTarget.client.id,
      async () => {
        await updateGoogleAdsConfig({
          clientId: configTarget.client.id,
          body: {
            customerId: normalizeOptionalText(configForm.customerId),
            managerCustomerId: normalizeOptionalText(configForm.managerCustomerId),
            descriptiveName: normalizeOptionalText(configForm.descriptiveName),
            currencyCode: normalizeOptionalText(configForm.currencyCode)?.toUpperCase() ?? null,
            timeZone: normalizeOptionalText(configForm.timeZone),
            connectionStatus: configForm.connectionStatus,
          },
        }).unwrap();
      },
      `${configTarget.client.companyName} için Google Ads config kaydedildi.`,
      "Google Ads config güncellenemedi.",
    );

    closeConfigDialog();
  }

  async function handleTestConnection(client: AdminGoogleAdsClientListItem) {
    if (!canManageGoogleAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await testGoogleAdsConnection({
          clientId: client.client.id,
          body: {
            ...(client.account.customerId ? { customerId: client.account.customerId } : {}),
            ...(client.account.managerCustomerId
              ? { managerCustomerId: client.account.managerCustomerId }
              : {}),
            requiredScopes: ["https://www.googleapis.com/auth/adwords"],
          },
        }).unwrap();
      },
      `${client.client.companyName} için Google Ads bağlantı testi başarılı.`,
      "Google Ads bağlantı testi başarısız oldu.",
    );
  }

  async function handleManualSync(client: AdminGoogleAdsClientListItem) {
    if (!canRunSync || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await syncGoogleAds({ clientId: client.client.id }).unwrap();
      },
      `${client.client.companyName} için Google Ads sync çalıştırıldı.`,
      "Google Ads sync başlatılamadı.",
    );
  }

  async function handleRetrySync(client: AdminGoogleAdsClientListItem) {
    if (!canRunSync || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await retryGoogleAdsSync({ clientId: client.client.id }).unwrap();
      },
      `${client.client.companyName} için retry sync çalıştırıldı.`,
      "Retry sync başlatılamadı.",
    );
  }

  async function handleDisconnect(client: AdminGoogleAdsClientListItem) {
    if (!canManageGoogleAds || isMutating) {
      return;
    }

    if (!window.confirm(`${client.client.companyName} için Google Ads bağlantısı kesilsin mi?`)) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await disconnectGoogleAds({ clientId: client.client.id }).unwrap();
      },
      `${client.client.companyName} için Google Ads bağlantısı kesildi.`,
      "Google Ads bağlantısı kesilemedi.",
    );
  }

  async function handleCreateApprovalRequest(client: AdminGoogleAdsClientListItem) {
    if (!canManageApprovals || isMutating) {
      return;
    }

    const projectId = client.actionContext.googleAdsProjectId;
    if (!projectId) {
      setPageMessage({
        type: "error",
        text: `${client.client.companyName} için GOOGLE_ADS servis projesi bulunamadı.`,
      });
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await createTask({
          projectId,
          title: `Google Ads Onay Talebi - ${client.client.companyName}`,
          description:
            "FAZ-05 admin Google Ads panelinden oluşturulan onay talebi. Müşteri revizyon/onay geri bildirimi bekleniyor.",
          status: "REVIEW",
          priority: "MEDIUM",
          type: "REVISION",
          workstream: "FULLSTACK",
          approvalRequired: true,
          approvalStatus: "PENDING",
        }).unwrap();
      },
      `${client.client.companyName} için onay talebi oluşturuldu.`,
      "Onay talebi oluşturulamadı.",
    );
  }

  if (!canReadGoogleAds) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Google Ads admin paneli için `googleAds.config.read.any` ve `googleAds.reporting.read.any`
        izinleri gereklidir.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Google Ads Yönetimi</h1>
          <p className="text-sm text-[#A0A0A0]">
            Google Ads satın alımı olan müşterilerin bağlantı, sync ve onay durumlarını yönetin.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            void Promise.all([refetch(), refetchSyncLogs()]);
          }}
          disabled={isLoading || isFetching}
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </Button>
      </div>

      {pageMessage ? (
        <Card
          className={
            pageMessage.type === "success"
              ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 p-4 text-sm text-[#d8ff8f]"
              : "border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          }
        >
          {pageMessage.text}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <p className="text-sm text-[#A0A0A0]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Google Ads Müşteri Listesi</h2>
          {dateRange ? (
            <p className="text-xs text-[#A0A0A0]">
              Rapor aralığı: {dateRange.since} - {dateRange.until}
            </p>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm text-[#A0A0A0]">Google Ads müşterileri yükleniyor...</p> : null}
        {isListError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(listError, "Google Ads müşteri listesi alınamadı.")}
          </p>
        ) : null}
        {!isLoading && !isListError && listItems.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Google Ads hizmeti olan müşteri bulunmuyor.</p>
        ) : null}

        {!isLoading && !isListError && listItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Service</th>
                  <th className="py-3 pr-3">Bağlantı</th>
                  <th className="py-3 pr-3">Cost / Conversion</th>
                  <th className="py-3 pr-3">Son Sync</th>
                  <th className="py-3 pr-3">Bekleyen Onay</th>
                  <th className="py-3 pr-3">Atanan Çalışanlar</th>
                  <th className="py-3">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {listItems.map((item) => {
                  const isRowActionLoading = activeClientActionId === item.client.id && isMutating;
                  const latestSyncLog = latestSyncLogByClientId.get(item.client.id) ?? null;
                  const lastSuccessfulSyncAt = lastSuccessfulSyncByClientId.get(item.client.id) ?? null;
                  const apiStatus = resolveApiStatusFromSyncLog(latestSyncLog?.status ?? null);

                  return (
                    <tr key={item.client.id} className="border-b border-white/[0.04] align-top">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-white">{item.client.companyName}</p>
                        <p className="text-xs text-[#A0A0A0]">{item.client.slug}</p>
                        <Badge className={`mt-2 ${getClientStatusBadgeClass(item.client.status)}`}>
                          {getClientStatusLabel(item.client.status)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge className={getServiceStatusBadgeClass(item.serviceStatus)}>
                          {getServiceStatusLabel(item.serviceStatus)}
                        </Badge>
                        <p className="mt-2 text-xs text-[#A0A0A0]">
                          Refresh Token: {item.hasRefreshToken ? "Kayıtlı" : "Kayıtlı Değil"}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge className={getGoogleAdsConnectionStatusBadgeClass(item.connectionStatus)}>
                          {getGoogleAdsConnectionStatusLabel(item.connectionStatus)}
                        </Badge>
                        <p className="mt-2">
                          <span className={`rounded-md px-2 py-1 text-xs ${getApiStatusClassName(apiStatus)}`}>
                            API: {getApiStatusLabel(apiStatus)}
                          </span>
                        </p>
                        {item.syncError ? (
                          <p className="mt-2 text-xs text-red-300">{item.syncError}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-white">
                          {formatCurrency(item.summary.cost, item.account.currencyCode)}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.summary.impressions.toLocaleString("tr-TR")} gösterim
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.summary.clicks.toLocaleString("tr-TR")} tıklama
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.summary.conversions.toFixed(2)} dönüşüm
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-sm text-[#DADADA]">
                        <p>Son deneme: {formatClientDateTime(item.lastSyncAt)}</p>
                        <p className="mt-1 text-xs text-[#A0A0A0]">
                          Son başarılı: {formatClientDateTime(lastSuccessfulSyncAt)}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-md bg-white/5 px-2 py-1 text-sm text-white">
                          {item.pendingApprovals}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        {item.assignedEmployees.length === 0 ? (
                          <p className="text-xs text-[#A0A0A0]">Atama bulunmuyor</p>
                        ) : (
                          <div className="space-y-1">
                            {item.assignedEmployees.slice(0, 2).map((employee) => (
                              <p key={employee.userId} className="text-xs text-[#DADADA]">
                                {(employee.displayName?.trim() || employee.email)} ({employee.scope})
                              </p>
                            ))}
                            {item.assignedEmployees.length > 2 ? (
                              <p className="text-xs text-[#A0A0A0]">
                                +{item.assignedEmployees.length - 2} kişi daha
                              </p>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => openConfigDialog(item)}
                            disabled={!canManageGoogleAds || isRowActionLoading}
                            title={canManageGoogleAds ? undefined : "Config yönetimi için yetki gerekir."}
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            Config
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              void handleTestConnection(item);
                            }}
                            disabled={!canManageGoogleAds || isRowActionLoading}
                            title={canManageGoogleAds ? undefined : "Bağlantı testi için yetki gerekir."}
                          >
                            <TestTube2 className="h-3.5 w-3.5" />
                            Test
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              void handleManualSync(item);
                            }}
                            disabled={!canRunSync || isRowActionLoading}
                            title={canRunSync ? undefined : "Sync çalıştırmak için yetki gerekir."}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Sync
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1 border-red-500/30 text-red-200 hover:bg-red-500/10"
                            onClick={() => {
                              void handleDisconnect(item);
                            }}
                            disabled={!canManageGoogleAds || isRowActionLoading}
                            title={canManageGoogleAds ? undefined : "Disconnect için yetki gerekir."}
                          >
                            <Link2Off className="h-3.5 w-3.5" />
                            Disconnect
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="gap-1 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                            onClick={() => {
                              void handleCreateApprovalRequest(item);
                            }}
                            disabled={!canManageApprovals || isRowActionLoading}
                            title={
                              canManageApprovals ? undefined : "Onay talebi oluşturma yetkisi gerekir."
                            }
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Onay Talebi
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Başarısız Sync Müşterileri</h2>
          <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-200">
            {failedClients.length} müşteri
          </span>
        </div>

        {failedClients.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Aktif başarısız sync kaydı yok.</p>
        ) : (
          <div className="space-y-3">
            {failedClients.map((client) => (
              <div
                key={client.client.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3"
              >
                <div>
                  <p className="font-medium text-white">{client.client.companyName}</p>
                  <p className="text-xs text-red-200">{client.syncError ?? "Bilinmeyen bağlantı hatası."}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 border-red-500/30 text-red-200 hover:bg-red-500/10"
                  onClick={() => {
                    void handleRetrySync(client);
                  }}
                  disabled={!canRunSync || isMutating}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Sync Logları</h2>
          {syncLogsMeta ? (
            <p className="text-xs text-[#A0A0A0]">
              Toplam: {syncLogsMeta.total} · Failed: {syncLogsMeta.failed} · Running: {syncLogsMeta.running} ·
              Skipped: {syncLogsMeta.skipped}
            </p>
          ) : null}
        </div>

        {isSyncLogsLoading ? <p className="text-sm text-[#A0A0A0]">Sync logları yükleniyor...</p> : null}
        {isSyncLogsError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(syncLogsError, "Sync logları alınamadı.")}
          </p>
        ) : null}
        {!isSyncLogsLoading && !isSyncLogsError && syncLogs.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Henüz sync log kaydı oluşmadı.</p>
        ) : null}

        {!isSyncLogsLoading && !isSyncLogsError && syncLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Durum</th>
                  <th className="py-3 pr-3">Başlangıç</th>
                  <th className="py-3 pr-3">Süre</th>
                  <th className="py-3 pr-3">Kayıt</th>
                  <th className="py-3 pr-3">API Call</th>
                  <th className="py-3">Hata Nedeni</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.04] align-top">
                    <td className="py-3 pr-3 text-sm text-white">{row.clientCompanyName}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${getSyncStatusClassName(row.status)}`}
                      >
                        {getSyncStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-[#DADADA]">{formatClientDateTime(row.startedAt)}</td>
                    <td className="py-3 pr-3 text-xs text-[#DADADA]">
                      {row.durationMs !== null ? `${Math.max(Math.round(row.durationMs / 1000), 0)} sn` : "—"}
                    </td>
                    <td className="py-3 pr-3 text-xs text-[#DADADA]">{row.recordsFetched ?? "—"}</td>
                    <td className="py-3 pr-3 text-xs text-[#DADADA]">{row.apiCallCount ?? "—"}</td>
                    <td className="py-3 text-xs text-red-200">{row.errorMessage ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Dialog open={Boolean(configTarget)} onOpenChange={(open) => (!open ? closeConfigDialog() : undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Google Ads Config Düzenle</DialogTitle>
            <DialogDescription>
              {configTarget
                ? `${configTarget.client.companyName} müşterisi için Google Ads bağlantı alanlarını güncelleyin.`
                : "Google Ads config düzenle"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="google-admin-customer-id">Customer ID</Label>
              <Input
                id="google-admin-customer-id"
                value={configForm.customerId}
                onChange={(event) => updateConfigField("customerId", event.target.value)}
                placeholder="123-456-7890"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="google-admin-manager-customer-id">Manager Customer ID</Label>
              <Input
                id="google-admin-manager-customer-id"
                value={configForm.managerCustomerId}
                onChange={(event) => updateConfigField("managerCustomerId", event.target.value)}
                placeholder="999-888-7777"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="google-admin-account-name">Account Name</Label>
              <Input
                id="google-admin-account-name"
                value={configForm.descriptiveName}
                onChange={(event) => updateConfigField("descriptiveName", event.target.value)}
                placeholder="Acme Google Ads"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="google-admin-currency">Currency</Label>
              <Input
                id="google-admin-currency"
                value={configForm.currencyCode}
                onChange={(event) => updateConfigField("currencyCode", event.target.value)}
                placeholder="TRY"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="google-admin-timezone">Timezone</Label>
              <Input
                id="google-admin-timezone"
                value={configForm.timeZone}
                onChange={(event) => updateConfigField("timeZone", event.target.value)}
                placeholder="Europe/Istanbul"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="google-admin-connection-status">Connection Status</Label>
              <select
                id="google-admin-connection-status"
                className="h-10 w-full rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
                value={configForm.connectionStatus}
                onChange={(event) =>
                  updateConfigField("connectionStatus", event.target.value as GoogleAdsConnectionStatus)
                }
              >
                {connectionStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getGoogleAdsConnectionStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeConfigDialog} disabled={isUpdatingConfig}>
              Vazgeç
            </Button>
            <Button
              type="button"
              className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
              onClick={() => {
                void handleConfigSave();
              }}
              disabled={isUpdatingConfig || !canManageGoogleAds}
            >
              {isUpdatingConfig ? "Kaydediliyor..." : "Config Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type GoogleAdsApiBadgeStatus = "HEALTHY" | "ISSUE" | "THROTTLED" | "UNKNOWN";

function getSyncStatusLabel(status: GoogleAdsSyncStatus): string {
  if (status === "RUNNING") {
    return "Running";
  }
  if (status === "SUCCESS") {
    return "Success";
  }
  if (status === "FAILED") {
    return "Failed";
  }
  if (status === "PARTIAL") {
    return "Partial";
  }
  return "Skipped";
}

function getSyncStatusClassName(status: GoogleAdsSyncStatus): string {
  if (status === "SUCCESS") {
    return "bg-[#AAFF01]/15 text-[#d2ff8a]";
  }
  if (status === "FAILED") {
    return "bg-red-500/15 text-red-200";
  }
  if (status === "RUNNING") {
    return "bg-blue-500/15 text-blue-200";
  }
  if (status === "PARTIAL") {
    return "bg-yellow-500/15 text-yellow-200";
  }
  return "bg-white/[0.06] text-[#DADADA]";
}

function resolveApiStatusFromSyncLog(status: GoogleAdsSyncStatus | null): GoogleAdsApiBadgeStatus {
  if (status === "SUCCESS") {
    return "HEALTHY";
  }
  if (status === "PARTIAL" || status === "FAILED") {
    return "ISSUE";
  }
  if (status === "SKIPPED") {
    return "THROTTLED";
  }
  return "UNKNOWN";
}

function getApiStatusLabel(status: GoogleAdsApiBadgeStatus): string {
  if (status === "HEALTHY") {
    return "Sağlıklı";
  }
  if (status === "ISSUE") {
    return "Uyarı";
  }
  if (status === "THROTTLED") {
    return "Rate-Limited";
  }
  return "Bekleniyor";
}

function getApiStatusClassName(status: GoogleAdsApiBadgeStatus): string {
  if (status === "HEALTHY") {
    return "bg-[#AAFF01]/15 text-[#d2ff8a]";
  }
  if (status === "ISSUE") {
    return "bg-red-500/15 text-red-200";
  }
  if (status === "THROTTLED") {
    return "bg-yellow-500/15 text-yellow-200";
  }
  return "bg-white/[0.06] text-[#DADADA]";
}

function getServiceStatusBadgeClass(status: string): string {
  if (status === "ACTIVE") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "PAUSED") {
    return "border-yellow-400/40 bg-yellow-500/15 text-yellow-200";
  }

  if (status === "SUSPENDED") {
    return "bg-red-600 text-white";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

function getServiceStatusLabel(status: string): string {
  if (status === "ACTIVE") {
    return "ACTIVE";
  }
  if (status === "PAUSED") {
    return "PAUSED";
  }
  if (status === "SUSPENDED") {
    return "SUSPENDED";
  }

  return "INACTIVE";
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatCurrency(value: number, currencyCode: string | null | undefined): string {
  const normalizedCurrency = currencyCode?.trim().toUpperCase() || "TRY";
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    }).format(value);
  }
}
