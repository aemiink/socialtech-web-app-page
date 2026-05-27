import { type FormEvent, useMemo, useState } from "react";
import { BadgeCheck, Link2Off, RefreshCw, TestTube2, Wrench } from "lucide-react";
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
  useDisconnectAdminClientAmazonAdsMutation,
  useGetAdminAmazonAdsClientsQuery,
  useSyncAdminClientAmazonAdsMutation,
  useTestAdminClientAmazonAdsConnectionMutation,
  useUpdateAdminClientAmazonAdsConfigMutation,
} from "../features/clients/clientsApi";
import type { AdminAmazonAdsClientListItem, AmazonAdsRegion } from "../features/clients/clientsTypes";
import {
  extractApiErrorMessage,
  formatClientDateTime,
  getAmazonAdsConnectionStatusBadgeClass,
  getAmazonAdsConnectionStatusLabel,
  getClientStatusBadgeClass,
  getClientStatusLabel,
} from "../features/clients/clientsUtils";
import { useCreateTaskMutation } from "../features/tasks/tasksApi";
import type { AuthUserProfile } from "../features/auth/authTypes";
import { useAppSelector } from "../store/hooks";

type ConfigFormState = {
  profileId: string;
  advertiserAccountId: string;
  marketplaceId: string;
  region: "" | AmazonAdsRegion;
  countryCode: string;
  currencyCode: string;
  timezone: string;
  accountType: string;
  accountName: string;
};

const initialConfigForm: ConfigFormState = {
  profileId: "",
  advertiserAccountId: "",
  marketplaceId: "",
  region: "",
  countryCode: "",
  currencyCode: "",
  timezone: "",
  accountType: "",
  accountName: "",
};

export function AmazonAdsAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAmazonAds = hasAdminPermission(currentUser, ["amazonAds.config.read.any"]);
  const canManageAmazonAds = hasAdminPermission(currentUser, ["amazonAds.config.manage.any"]);
  const canCreateApproval = hasAllAdminPermissions(currentUser, [
    "amazonAds.approvals.manage.any",
    "tasks.manage.any",
  ]);

  const {
    data: response,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminAmazonAdsClientsQuery(undefined, {
    skip: !canReadAmazonAds,
  });
  const [updateAmazonAdsConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientAmazonAdsConfigMutation();
  const [testAmazonAdsConnection, { isLoading: isTestingConnection }] =
    useTestAdminClientAmazonAdsConnectionMutation();
  const [syncAmazonAds, { isLoading: isSyncing }] = useSyncAdminClientAmazonAdsMutation();
  const [disconnectAmazonAds, { isLoading: isDisconnecting }] =
    useDisconnectAdminClientAmazonAdsMutation();
  const [createTask, { isLoading: isCreatingApproval }] = useCreateTaskMutation();

  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configTarget, setConfigTarget] = useState<AdminAmazonAdsClientListItem | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(initialConfigForm);
  const [activeClientActionId, setActiveClientActionId] = useState<string | null>(null);

  const listItems = response?.data ?? [];
  const meta = response?.meta;
  const dateRange = response?.dateRange;
  const failedClients = useMemo(
    () => listItems.filter((item) => item.connectionStatus === "ERROR" || Boolean(item.syncError)),
    [listItems],
  );
  const isMutating =
    isUpdatingConfig ||
    isTestingConnection ||
    isSyncing ||
    isDisconnecting ||
    isCreatingApproval;

  const kpis = useMemo(
    () => [
      { label: "Amazon Ads Müşteri", value: meta?.total ?? 0 },
      { label: "Connected", value: meta?.connected ?? 0 },
      { label: "Hatalı Bağlantı", value: meta?.error ?? 0 },
      { label: "Bekleyen Onay", value: meta?.pendingApprovals ?? 0 },
    ],
    [meta],
  );

  function openConfigDialog(client: AdminAmazonAdsClientListItem) {
    setPageMessage(null);
    setConfigTarget(client);
    setConfigForm({
      profileId: client.ids.profileId ?? "",
      advertiserAccountId: client.ids.advertiserAccountId ?? "",
      marketplaceId: client.ids.marketplaceId ?? "",
      region: client.settings.region ?? "",
      countryCode: client.settings.countryCode ?? "",
      currencyCode: client.settings.currencyCode ?? "",
      timezone: client.settings.timezone ?? "",
      accountType: client.account.accountType ?? "",
      accountName: client.account.accountName ?? "",
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

  function normalizeOptionalRegion(value: string): AmazonAdsRegion | null {
    if (value === "NA" || value === "EU" || value === "FE") {
      return value;
    }

    return null;
  }

  async function handleConfigSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configTarget || !canManageAmazonAds || isUpdatingConfig) {
      return;
    }

    setPageMessage(null);

    try {
      await updateAmazonAdsConfig({
        clientId: configTarget.client.id,
        body: {
          profileId: normalizeOptionalText(configForm.profileId),
          advertiserAccountId: normalizeOptionalText(configForm.advertiserAccountId),
          marketplaceId: normalizeOptionalText(configForm.marketplaceId),
          region: normalizeOptionalRegion(configForm.region),
          countryCode: normalizeOptionalText(configForm.countryCode),
          currencyCode: normalizeOptionalText(configForm.currencyCode),
          timezone: normalizeOptionalText(configForm.timezone),
          accountType: normalizeOptionalText(configForm.accountType),
          accountName: normalizeOptionalText(configForm.accountName),
        },
      }).unwrap();

      closeConfigDialog();
      setPageMessage({ type: "success", text: "Amazon Ads konfigürasyonu güncellendi." });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "Amazon Ads konfigürasyonu güncellenemedi."),
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

  async function handleTestConnection(client: AdminAmazonAdsClientListItem) {
    if (!canManageAmazonAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await testAmazonAdsConnection({
          clientId: client.client.id,
          body: {
            ...(client.ids.profileId ? { profileId: client.ids.profileId } : {}),
            ...(client.settings.region ? { region: client.settings.region } : {}),
          },
        }).unwrap();
      },
      `${client.client.companyName} için bağlantı testi başarılı.`,
      "Amazon Ads bağlantı testi başarısız oldu.",
    );
  }

  async function handleManualSync(client: AdminAmazonAdsClientListItem) {
    if (!canManageAmazonAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await syncAmazonAds({
          clientId: client.client.id,
        }).unwrap();
      },
      `${client.client.companyName} için manuel sync tamamlandı.`,
      "Amazon Ads sync çalıştırılamadı.",
    );
  }

  async function handleDisconnect(client: AdminAmazonAdsClientListItem) {
    if (!canManageAmazonAds || isMutating) {
      return;
    }

    if (!window.confirm(`${client.client.companyName} için Amazon Ads bağlantısı kesilsin mi?`)) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await disconnectAmazonAds({ clientId: client.client.id }).unwrap();
      },
      `${client.client.companyName} için Amazon Ads bağlantısı kesildi.`,
      "Amazon Ads bağlantısı kesilemedi.",
    );
  }

  async function handleCreateApprovalRequest(client: AdminAmazonAdsClientListItem) {
    if (!canCreateApproval || isMutating) {
      return;
    }

    const projectId = client.actionContext.amazonAdsProjectId;
    if (!projectId) {
      setPageMessage({
        type: "error",
        text: `${client.client.companyName} için AMAZON_ADS servis projesi bulunamadı.`,
      });
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await createTask({
          projectId,
          title: `Amazon Ads Onay Talebi - ${client.client.companyName}`,
          description:
            "FAZ-05 admin Amazon Ads panelinden oluşturulan onay talebi. Müşteri kreatif/rapor onayı bekleniyor.",
          status: "REVIEW",
          priority: "MEDIUM",
          type: "REVISION",
          workstream: "FULLSTACK",
        }).unwrap();
      },
      `${client.client.companyName} için onay talebi oluşturuldu.`,
      "Onay talebi oluşturulamadı.",
    );
  }

  if (!canReadAmazonAds) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Amazon Ads admin panelini görüntülemek için `amazonAds.config.read.any` izni gereklidir.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Amazon Ads Yönetimi</h1>
          <p className="text-sm text-[#A0A0A0]">
            Amazon Ads satın alımı olan müşterilerin bağlantı, sync ve onay süreçlerini yönetin.
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
          <h2 className="text-lg font-semibold text-white">Amazon Ads Müşteri Listesi</h2>
          {dateRange ? (
            <p className="text-xs text-[#A0A0A0]">
              Rapor aralığı: {dateRange.since} - {dateRange.until}
            </p>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm text-[#A0A0A0]">Amazon Ads müşterileri yükleniyor...</p> : null}
        {isListError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(listError, "Amazon Ads müşteri listesi alınamadı.")}
          </p>
        ) : null}
        {!isLoading && !isListError && listItems.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Amazon Ads hizmeti olan müşteri bulunmuyor.</p>
        ) : null}

        {!isLoading && !isListError && listItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Service</th>
                  <th className="py-3 pr-3">Bağlantı</th>
                  <th className="py-3 pr-3">Harcama / Satış</th>
                  <th className="py-3 pr-3">ACOS / ROAS</th>
                  <th className="py-3 pr-3">Son Sync</th>
                  <th className="py-3 pr-3">Bekleyen Onay</th>
                  <th className="py-3 pr-3">Atanan Çalışanlar</th>
                  <th className="py-3">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {listItems.map((item) => {
                  const isRowActionLoading = activeClientActionId === item.client.id && isMutating;

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
                        <Badge className={getAmazonAdsConnectionStatusBadgeClass(item.connectionStatus)}>
                          {getAmazonAdsConnectionStatusLabel(item.connectionStatus)}
                        </Badge>
                        {item.syncError ? (
                          <p className="mt-2 text-xs text-red-300">{item.syncError}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-white">
                          {formatCurrency(item.spendSummary.spend)}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          Satış: {formatCurrency(item.spendSummary.sales)}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.spendSummary.impressions.toLocaleString("tr-TR")} gösterim
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-sm text-white">{formatPercent(item.spendSummary.acos)}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          ROAS: {formatRatio(item.spendSummary.roas)}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {item.spendSummary.clicks.toLocaleString("tr-TR")} tıklama /{" "}
                          {item.spendSummary.orders.toLocaleString("tr-TR")} sipariş
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-sm text-[#DADADA]">
                        {formatClientDateTime(item.lastSyncAt)}
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
                            disabled={!canManageAmazonAds || isRowActionLoading}
                            title={canManageAmazonAds ? undefined : "Config yönetimi için yetki gerekir."}
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
                            disabled={!canManageAmazonAds || isRowActionLoading}
                            title={canManageAmazonAds ? undefined : "Bağlantı testi için yetki gerekir."}
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
                            disabled={!canManageAmazonAds || isRowActionLoading}
                            title={canManageAmazonAds ? undefined : "Sync çalıştırmak için yetki gerekir."}
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
                            disabled={!canManageAmazonAds || isRowActionLoading}
                            title={canManageAmazonAds ? undefined : "Disconnect için yetki gerekir."}
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
                            disabled={!canCreateApproval || isRowActionLoading}
                            title={canCreateApproval ? undefined : "Onay talebi oluşturma yetkisi gerekir."}
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
          <h2 className="text-lg font-semibold text-white">Hata Durumundaki Müşteriler</h2>
          <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-200">
            {failedClients.length} müşteri
          </span>
        </div>

        {failedClients.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Aktif hata kaydı bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {failedClients.map((client) => (
              <div
                key={client.client.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3"
              >
                <div>
                  <p className="font-medium text-white">{client.client.companyName}</p>
                  <p className="text-xs text-red-200">{client.syncError ?? "Bilinmeyen sync hatası."}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 border-red-500/30 text-red-200 hover:bg-red-500/10"
                  onClick={() => {
                    void handleManualSync(client);
                  }}
                  disabled={!canManageAmazonAds || isMutating}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Tekrar Sync
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={configTarget !== null} onOpenChange={(open) => (open ? undefined : closeConfigDialog())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Amazon Ads Config Düzenle</DialogTitle>
            <DialogDescription>
              {configTarget?.client.companyName ?? "Müşteri"} için Amazon Ads profile ve hesap bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleConfigSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profileId">Profile ID</Label>
                <Input
                  id="profileId"
                  value={configForm.profileId}
                  onChange={(event) => updateConfigField("profileId", event.target.value)}
                  placeholder="amzn1.account.xxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advertiserAccountId">Advertiser Account ID</Label>
                <Input
                  id="advertiserAccountId"
                  value={configForm.advertiserAccountId}
                  onChange={(event) => updateConfigField("advertiserAccountId", event.target.value)}
                  placeholder="ENTITY123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketplaceId">Marketplace ID</Label>
                <Input
                  id="marketplaceId"
                  value={configForm.marketplaceId}
                  onChange={(event) => updateConfigField("marketplaceId", event.target.value)}
                  placeholder="ATVPDKIKX0DER"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <select
                  id="region"
                  value={configForm.region}
                  onChange={(event) => updateConfigField("region", event.target.value)}
                  className="h-10 w-full rounded-md border border-white/[0.12] bg-[#1A1A1A] px-3 text-sm text-white"
                >
                  <option value="">Seçiniz</option>
                  <option value="NA">NA</option>
                  <option value="EU">EU</option>
                  <option value="FE">FE</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Input
                  id="countryCode"
                  value={configForm.countryCode}
                  onChange={(event) => updateConfigField("countryCode", event.target.value)}
                  placeholder="US"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Currency Code</Label>
                <Input
                  id="currencyCode"
                  value={configForm.currencyCode}
                  onChange={(event) => updateConfigField("currencyCode", event.target.value)}
                  placeholder="USD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={configForm.timezone}
                  onChange={(event) => updateConfigField("timezone", event.target.value)}
                  placeholder="America/Los_Angeles"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Input
                  id="accountType"
                  value={configForm.accountType}
                  onChange={(event) => updateConfigField("accountType", event.target.value)}
                  placeholder="seller / vendor"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={configForm.accountName}
                onChange={(event) => updateConfigField("accountName", event.target.value)}
                placeholder="Amazon Ads Account Name"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeConfigDialog} disabled={isUpdatingConfig}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={!canManageAmazonAds || isUpdatingConfig}
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

function hasAllAdminPermissions(
  user: AuthUserProfile | null,
  permissions: readonly string[],
): boolean {
  if (!user || user.accountType !== "ADMIN" || user.role !== "ADMIN") {
    return false;
  }

  return permissions.every((permission) => user.permissions.includes(permission));
}

function getServiceStatusLabel(status: string): string {
  if (status === "ACTIVE") {
    return "Active";
  }
  if (status === "PAUSED") {
    return "Paused";
  }
  if (status === "SUSPENDED") {
    return "Suspended";
  }
  return "Inactive";
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`;
}
