import { type FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Link2Off,
  RefreshCw,
  RotateCcw,
  TestTube2,
  Video,
  Wrench,
} from "lucide-react";
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
  extractApiErrorMessage,
  formatClientDateTime,
  getClientStatusBadgeClass,
  getClientStatusLabel,
} from "../features/clients/clientsUtils";
import {
  useDisconnectAdminClientTikTokAdsMutation,
  useGetAdminTikTokAdsClientsQuery,
  useGetAdminTikTokAdsSyncLogsQuery,
  useRetryAdminClientTikTokAdsSyncMutation,
  useSyncAdminClientTikTokAdsMutation,
  useTestAdminClientTikTokAdsConnectionMutation,
  useUpdateAdminClientTikTokAdsConfigMutation,
} from "../features/tiktokAds/tiktokAdsApi";
import type {
  AdminTikTokAdsClientListItem,
  TikTokAdsSyncStatus,
} from "../features/tiktokAds/tiktokAdsTypes";
import {
  getTikTokAdsConnectionStatusBadgeClass,
  getTikTokAdsConnectionStatusLabel,
} from "../features/tiktokAds/tiktokAdsTypes";
import { useAppSelector } from "../store/hooks";

type ConfigFormState = {
  advertiserId: string;
  businessCenterId: string;
  pixelId: string;
  advertiserName: string;
  currency: string;
  timezone: string;
};

const initialConfigForm: ConfigFormState = {
  advertiserId: "",
  businessCenterId: "",
  pixelId: "",
  advertiserName: "",
  currency: "",
  timezone: "",
};

export function TikTokAdsAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadTikTokAds = hasAdminPermission(currentUser, ["tiktokAds.config.read.any"]);
  const canManageTikTokAds = hasAdminPermission(currentUser, ["tiktokAds.config.manage.any"]);

  const {
    data: response,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminTikTokAdsClientsQuery(undefined, {
    skip: !canReadTikTokAds,
  });
  const {
    data: syncLogsResponse,
    error: syncLogsError,
    isError: isSyncLogsError,
    isLoading: isSyncLogsLoading,
  } = useGetAdminTikTokAdsSyncLogsQuery(
    { limit: 20 },
    {
      skip: !canReadTikTokAds,
    },
  );
  const [updateTikTokAdsConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientTikTokAdsConfigMutation();
  const [testTikTokAdsConnection, { isLoading: isTestingConnection }] =
    useTestAdminClientTikTokAdsConnectionMutation();
  const [syncTikTokAds, { isLoading: isSyncing }] = useSyncAdminClientTikTokAdsMutation();
  const [retryTikTokAdsSync, { isLoading: isRetryingSync }] =
    useRetryAdminClientTikTokAdsSyncMutation();
  const [disconnectTikTokAds, { isLoading: isDisconnecting }] =
    useDisconnectAdminClientTikTokAdsMutation();

  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configTarget, setConfigTarget] = useState<AdminTikTokAdsClientListItem | null>(null);
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
  const isMutating =
    isUpdatingConfig || isTestingConnection || isSyncing || isRetryingSync || isDisconnecting;

  const kpis = useMemo(
    () => [
      { label: "TikTok Ads Müşteri", value: meta?.total ?? 0 },
      { label: "Connected", value: meta?.connected ?? 0 },
      { label: "Hatalı Bağlantı", value: meta?.error ?? 0 },
      { label: "Bekleyen Onay", value: meta?.pendingApprovals ?? 0 },
    ],
    [meta],
  );

  function openConfigDialog(client: AdminTikTokAdsClientListItem) {
    setPageMessage(null);
    setConfigTarget(client);
    setConfigForm({
      advertiserId: client.ids.advertiserId ?? "",
      businessCenterId: client.ids.businessCenterId ?? "",
      pixelId: client.ids.pixelId ?? "",
      advertiserName: client.account.advertiserName ?? "",
      currency: client.settings.currency ?? "",
      timezone: client.settings.timezone ?? "",
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

  function normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async function handleConfigSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configTarget || !canManageTikTokAds || isUpdatingConfig) {
      return;
    }

    setPageMessage(null);

    try {
      await updateTikTokAdsConfig({
        clientId: configTarget.client.id,
        data: {
          advertiserId: normalizeOptionalText(configForm.advertiserId),
          businessCenterId: normalizeOptionalText(configForm.businessCenterId),
          pixelId: normalizeOptionalText(configForm.pixelId),
          advertiserName: normalizeOptionalText(configForm.advertiserName),
          currency: normalizeOptionalText(configForm.currency),
          timezone: normalizeOptionalText(configForm.timezone),
        },
      }).unwrap();
      closeConfigDialog();
      setPageMessage({ type: "success", text: "TikTok Ads konfigürasyonu güncellendi." });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "TikTok Ads konfigürasyonu güncellenemedi."),
      });
    }
  }

  async function runClientAction(
    clientId: string,
    runner: () => Promise<void>,
    successMessage: string,
    fallbackErrorMessage: string,
  ) {
    setPageMessage(null);
    setActiveClientActionId(clientId);
    try {
      await runner();
      setPageMessage({ type: "success", text: successMessage });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, fallbackErrorMessage),
      });
    } finally {
      setActiveClientActionId(null);
    }
  }

  async function handleTestConnection(client: AdminTikTokAdsClientListItem) {
    if (!canManageTikTokAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await testTikTokAdsConnection({
          clientId: client.client.id,
          data: {
            ...(client.ids.advertiserId ? { advertiserId: client.ids.advertiserId } : {}),
          },
        }).unwrap();
      },
      `${client.client.companyName} için bağlantı testi başarılı.`,
      "TikTok Ads bağlantı testi başarısız.",
    );
  }

  async function handleManualSync(client: AdminTikTokAdsClientListItem) {
    if (!canManageTikTokAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await syncTikTokAds({
          clientId: client.client.id,
        }).unwrap();
      },
      `${client.client.companyName} için TikTok Ads senkronizasyonu tamamlandı.`,
      "TikTok Ads senkronizasyonu çalıştırılamadı.",
    );
  }

  async function handleRetrySync(client: AdminTikTokAdsClientListItem) {
    if (!canManageTikTokAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await retryTikTokAdsSync({
          clientId: client.client.id,
        }).unwrap();
      },
      `${client.client.companyName} için retry senkronizasyonu tamamlandı.`,
      "Retry senkronizasyonu çalıştırılamadı.",
    );
  }

  async function handleDisconnect(client: AdminTikTokAdsClientListItem) {
    if (!canManageTikTokAds || isMutating) {
      return;
    }

    if (!window.confirm(`${client.client.companyName} için TikTok Ads bağlantısı kesilsin mi?`)) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await disconnectTikTokAds({ clientId: client.client.id }).unwrap();
      },
      `${client.client.companyName} için TikTok Ads bağlantısı kesildi.`,
      "TikTok Ads bağlantısı kesilemedi.",
    );
  }

  if (!canReadTikTokAds) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        TikTok Ads admin panelini görüntülemek için `tiktokAds.config.read.any` izni gereklidir.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">TikTok Ads Yönetimi</h1>
          <p className="text-sm text-[#A0A0A0]">
            TikTok Ads satın alımı olan müşterilerin bağlantı, sync ve performans durumlarını yönetin.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => refetch()}
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
          <h2 className="text-lg font-semibold text-white">TikTok Ads Müşteri Listesi</h2>
          {dateRange ? (
            <p className="text-xs text-[#A0A0A0]">
              Rapor aralığı: {dateRange.since} - {dateRange.until}
            </p>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm text-[#A0A0A0]">TikTok Ads müşterileri yükleniyor...</p> : null}
        {isListError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(listError, "TikTok Ads müşteri listesi alınamadı.")}
          </p>
        ) : null}
        {!isLoading && !isListError && listItems.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">TikTok Ads hizmeti olan müşteri bulunmuyor.</p>
        ) : null}

        {!isLoading && !isListError && listItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Service</th>
                  <th className="py-3 pr-3">Bağlantı</th>
                  <th className="py-3 pr-3">Performans</th>
                  <th className="py-3 pr-3">Video</th>
                  <th className="py-3 pr-3">Son Sync</th>
                  <th className="py-3 pr-3">Atanan Çalışanlar</th>
                  <th className="py-3">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {listItems.map((item) => {
                  const isRowActionLoading =
                    activeClientActionId === item.client.id && isMutating;

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
                          Token: {item.hasToken ? "Kayıtlı" : "Kayıtlı Değil"}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge className={getTikTokAdsConnectionStatusBadgeClass(item.connectionStatus)}>
                          {getTikTokAdsConnectionStatusLabel(item.connectionStatus)}
                        </Badge>
                        <p className="mt-2 text-xs text-[#A0A0A0]">
                          Advertiser: {item.ids.advertiserId ?? "-"}
                        </p>
                        {item.syncError ? (
                          <p className="mt-2 text-xs text-red-300">{item.syncError}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-white">{formatCurrency(item.spendSummary.spend)}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.spendSummary.impressions.toLocaleString("tr-TR")} gösterim
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.spendSummary.clicks.toLocaleString("tr-TR")} tıklama
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="flex items-center gap-1 text-sm text-white">
                          <Video className="h-3.5 w-3.5 text-[#AAFF01]" />
                          {item.spendSummary.videoViews.toLocaleString("tr-TR")}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.spendSummary.conversions.toLocaleString("tr-TR")} dönüşüm
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          CPA {formatCurrency(item.spendSummary.costPerConversion)}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-sm text-[#DADADA]">
                        {formatClientDateTime(item.lastSyncAt)}
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
                            disabled={!canManageTikTokAds || isRowActionLoading}
                            title={canManageTikTokAds ? undefined : "Config yönetimi için yetki gerekir."}
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
                            disabled={!canManageTikTokAds || isRowActionLoading}
                            title={canManageTikTokAds ? undefined : "Bağlantı testi için yetki gerekir."}
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
                            disabled={!canManageTikTokAds || isRowActionLoading}
                            title={canManageTikTokAds ? undefined : "Sync çalıştırmak için yetki gerekir."}
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
                            disabled={!canManageTikTokAds || isRowActionLoading}
                            title={canManageTikTokAds ? undefined : "Disconnect için yetki gerekir."}
                          >
                            <Link2Off className="h-3.5 w-3.5" />
                            Disconnect
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
          <h2 className="text-lg font-semibold text-white">Bağlantı / Sync Uyarıları</h2>
          <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-200">
            {failedClients.length} müşteri
          </span>
        </div>

        {failedClients.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Aktif bağlantı veya sync hatası yok.</p>
        ) : (
          <div className="space-y-3">
            {failedClients.map((client) => (
              <div
                key={client.client.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-white">
                    <AlertTriangle className="h-4 w-4 text-red-200" />
                    {client.client.companyName}
                  </p>
                  <p className="text-xs text-red-200">{client.syncError ?? "Bağlantı durumu hatalı."}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 border-red-500/30 text-red-200 hover:bg-red-500/10"
                  onClick={() => {
                    void handleRetrySync(client);
                  }}
                  disabled={!canManageTikTokAds || isMutating}
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
              Toplam: {syncLogsMeta.total} · Failed: {syncLogsMeta.failed} · Running:{" "}
              {syncLogsMeta.running} · Skipped: {syncLogsMeta.skipped}
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
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Durum</th>
                  <th className="py-3 pr-3">Tetikleyici</th>
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
                    <td className="py-3 pr-3 text-xs text-[#DADADA]">{formatSyncTrigger(row.trigger)}</td>
                    <td className="py-3 pr-3 text-xs text-[#DADADA]">
                      {formatClientDateTime(row.startedAt)}
                    </td>
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

      <Dialog open={configTarget !== null} onOpenChange={(open) => (!open ? closeConfigDialog() : undefined)}>
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>TikTok Ads Config Düzenle</DialogTitle>
            <DialogDescription className="sr-only">
              TikTok Ads hesap kimlikleri ve raporlama ayarları.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleConfigSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tiktok-ads-advertiser-id">Advertiser ID</Label>
                <Input
                  id="tiktok-ads-advertiser-id"
                  value={configForm.advertiserId}
                  onChange={(event) => updateConfigField("advertiserId", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok-ads-business-center-id">Business Center ID</Label>
                <Input
                  id="tiktok-ads-business-center-id"
                  value={configForm.businessCenterId}
                  onChange={(event) => updateConfigField("businessCenterId", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok-ads-pixel-id">Pixel ID</Label>
                <Input
                  id="tiktok-ads-pixel-id"
                  value={configForm.pixelId}
                  onChange={(event) => updateConfigField("pixelId", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok-ads-advertiser-name">Advertiser Name</Label>
                <Input
                  id="tiktok-ads-advertiser-name"
                  value={configForm.advertiserName}
                  onChange={(event) => updateConfigField("advertiserName", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok-ads-currency">Currency</Label>
                <Input
                  id="tiktok-ads-currency"
                  value={configForm.currency}
                  onChange={(event) => updateConfigField("currency", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok-ads-timezone">Timezone</Label>
                <Input
                  id="tiktok-ads-timezone"
                  value={configForm.timezone}
                  onChange={(event) => updateConfigField("timezone", event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeConfigDialog} disabled={isUpdatingConfig}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={!canManageTikTokAds || isUpdatingConfig}
              >
                Config Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getServiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
    PAUSED: "Duraklatıldı",
    SUSPENDED: "Askıya Alındı",
  };
  return labels[status] ?? status;
}

function getServiceStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    ACTIVE: "bg-[#AAFF01]/20 text-[#AAFF01]",
    INACTIVE: "bg-gray-500/20 text-gray-300",
    PAUSED: "bg-yellow-500/20 text-yellow-300",
    SUSPENDED: "bg-red-500/20 text-red-300",
  };
  return classes[status] ?? "bg-gray-500/20 text-gray-300";
}

function getSyncStatusLabel(status: TikTokAdsSyncStatus): string {
  const labels: Record<TikTokAdsSyncStatus, string> = {
    RUNNING: "Çalışıyor",
    SUCCESS: "Başarılı",
    FAILED: "Hatalı",
    PARTIAL: "Kısmi",
    SKIPPED: "Atlandı",
  };
  return labels[status] ?? status;
}

function getSyncStatusClassName(status: TikTokAdsSyncStatus): string {
  const classes: Record<TikTokAdsSyncStatus, string> = {
    RUNNING: "bg-blue-500/15 text-blue-200",
    SUCCESS: "bg-[#AAFF01]/15 text-[#AAFF01]",
    FAILED: "bg-red-500/15 text-red-200",
    PARTIAL: "bg-yellow-500/15 text-yellow-200",
    SKIPPED: "bg-white/[0.08] text-[#DADADA]",
  };
  return classes[status] ?? "bg-white/[0.08] text-[#DADADA]";
}

function formatSyncTrigger(trigger: string | null): string {
  if (!trigger) {
    return "—";
  }

  return trigger.replace(/_/g, " ");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}
