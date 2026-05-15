import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Link2Off,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TestTube2,
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
  useDisconnectAdminClientMetaAdsMutation,
  useCreateAdminClientMetaAdsReportMutation,
  useGetAdminClientMetaAdsReportsQuery,
  useGetAdminMetaAdsClientsQuery,
  useGetAdminMetaAdsSyncLogsQuery,
  useRetryAdminClientMetaAdsSyncMutation,
  useSyncAdminClientMetaAdsMutation,
  useTestAdminClientMetaAdsConnectionMutation,
  useUpdateAdminMetaAdsReportMutation,
  useUpdateAdminClientMetaAdsConfigMutation,
} from "../features/clients/clientsApi";
import type {
  AdminMetaAdsClientListItem,
  MetaAdsReportStatus,
  MetaAdsReportType,
  MetaAdsSyncStatus,
} from "../features/clients/clientsTypes";
import {
  extractApiErrorMessage,
  formatClientDateTime,
  getClientStatusBadgeClass,
  getClientStatusLabel,
  getMetaAdsConnectionStatusBadgeClass,
  getMetaAdsConnectionStatusLabel,
} from "../features/clients/clientsUtils";
import { useCreateTaskMutation } from "../features/tasks/tasksApi";
import { useAppSelector } from "../store/hooks";

type ConfigFormState = {
  businessId: string;
  adAccountId: string;
  pixelId: string;
  facebookPageId: string;
  instagramAccountId: string;
  currency: string;
  timezone: string;
};

type ReportFormState = {
  periodStart: string;
  periodEnd: string;
  type: MetaAdsReportType;
  summary: string;
  publishNow: boolean;
  requestAcknowledgement: boolean;
};

const initialConfigForm: ConfigFormState = {
  businessId: "",
  adAccountId: "",
  pixelId: "",
  facebookPageId: "",
  instagramAccountId: "",
  currency: "",
  timezone: "",
};

const initialReportForm: ReportFormState = {
  periodStart: "",
  periodEnd: "",
  type: "WEEKLY",
  summary: "",
  publishNow: false,
  requestAcknowledgement: false,
};

const reportTypeOptions: Array<{ value: MetaAdsReportType; label: string }> = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "CAMPAIGN_PERFORMANCE", label: "Campaign" },
  { value: "CREATIVE_PERFORMANCE", label: "Creative" },
  { value: "BUDGET_RECOMMENDATION", label: "Budget" },
];

export function MetaAdsAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadMetaAds = hasAdminPermission(currentUser, ["metaAds.config.read.any"]);
  const canManageMetaAds = hasAdminPermission(currentUser, ["metaAds.config.manage.any"]);
  const canCreateApproval = hasAdminPermission(currentUser, ["tasks.manage.any"]);
  const canReadReports = hasAdminPermission(currentUser, ["reports.read"]);
  const canManageReports = hasAdminPermission(currentUser, ["reports.manage"]);

  const {
    data: response,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminMetaAdsClientsQuery(undefined, {
    skip: !canReadMetaAds,
  });
  const {
    data: syncLogsResponse,
    error: syncLogsError,
    isError: isSyncLogsError,
    isLoading: isSyncLogsLoading,
  } = useGetAdminMetaAdsSyncLogsQuery(
    {
      limit: 20,
    },
    {
      skip: !canReadMetaAds,
    },
  );
  const [updateMetaAdsConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientMetaAdsConfigMutation();
  const [testMetaAdsConnection, { isLoading: isTestingConnection }] =
    useTestAdminClientMetaAdsConnectionMutation();
  const [syncMetaAds, { isLoading: isSyncing }] = useSyncAdminClientMetaAdsMutation();
  const [retryMetaAdsSync, { isLoading: isRetryingSync }] = useRetryAdminClientMetaAdsSyncMutation();
  const [disconnectMetaAds, { isLoading: isDisconnecting }] =
    useDisconnectAdminClientMetaAdsMutation();
  const [createTask, { isLoading: isCreatingApproval }] = useCreateTaskMutation();
  const [createMetaAdsReport, { isLoading: isCreatingReport }] = useCreateAdminClientMetaAdsReportMutation();
  const [updateMetaAdsReport, { isLoading: isUpdatingReport }] = useUpdateAdminMetaAdsReportMutation();

  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configTarget, setConfigTarget] = useState<AdminMetaAdsClientListItem | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(initialConfigForm);
  const [activeClientActionId, setActiveClientActionId] = useState<string | null>(null);
  const [selectedReportClientId, setSelectedReportClientId] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<MetaAdsReportStatus | "ALL">("ALL");
  const [reportTypeFilter, setReportTypeFilter] = useState<MetaAdsReportType | "ALL">("ALL");
  const [reportForm, setReportForm] = useState<ReportFormState>(initialReportForm);
  const [publishAckToggle, setPublishAckToggle] = useState(false);

  const listItems = response?.data ?? [];
  const selectedReportClient = useMemo(
    () => listItems.find((item) => item.client.id === selectedReportClientId) ?? null,
    [listItems, selectedReportClientId],
  );
  const selectedReportClientName = selectedReportClient?.client.companyName ?? "Müşteri";
  const reportsQuery = useMemo(
    () => ({
      ...(reportStatusFilter !== "ALL" ? { status: reportStatusFilter } : {}),
      ...(reportTypeFilter !== "ALL" ? { type: reportTypeFilter } : {}),
      limit: 50,
    }),
    [reportStatusFilter, reportTypeFilter],
  );
  const {
    data: reportsResponse,
    error: reportsError,
    isError: isReportsError,
    isLoading: isReportsLoading,
    isFetching: isReportsFetching,
  } = useGetAdminClientMetaAdsReportsQuery(
    {
      clientId: selectedReportClientId,
      query: reportsQuery,
    },
    {
      skip: !canReadReports || selectedReportClientId.length === 0,
    },
  );
  const meta = response?.meta;
  const dateRange = response?.dateRange;
  const syncLogs = syncLogsResponse?.data ?? [];
  const syncLogsMeta = syncLogsResponse?.meta;
  const reportRows = reportsResponse?.data ?? [];
  const reportMeta = reportsResponse?.meta;
  const failedClients = useMemo(
    () => listItems.filter((item) => item.connectionStatus === "ERROR" || Boolean(item.syncError)),
    [listItems],
  );
  const isMutating =
    isUpdatingConfig ||
    isTestingConnection ||
    isSyncing ||
    isRetryingSync ||
    isDisconnecting ||
    isCreatingApproval ||
    isCreatingReport ||
    isUpdatingReport;

  useEffect(() => {
    if (listItems.length === 0) {
      if (selectedReportClientId.length > 0) {
        setSelectedReportClientId("");
      }
      return;
    }

    if (selectedReportClientId.length === 0) {
      setSelectedReportClientId(listItems[0].client.id);
      return;
    }

    if (!listItems.some((item) => item.client.id === selectedReportClientId)) {
      setSelectedReportClientId(listItems[0].client.id);
    }
  }, [listItems, selectedReportClientId]);

  const kpis = useMemo(
    () => [
      { label: "Meta Ads Müşteri", value: meta?.total ?? 0 },
      { label: "Connected", value: meta?.connected ?? 0 },
      { label: "Hatalı Bağlantı", value: meta?.error ?? 0 },
      { label: "Bekleyen Onay", value: meta?.pendingApprovals ?? 0 },
    ],
    [meta],
  );

  function openConfigDialog(client: AdminMetaAdsClientListItem) {
    setPageMessage(null);
    setConfigTarget(client);
    setConfigForm({
      businessId: client.ids.businessId ?? "",
      adAccountId: client.ids.adAccountId ?? "",
      pixelId: client.ids.pixelId ?? "",
      facebookPageId: client.ids.facebookPageId ?? "",
      instagramAccountId: client.ids.instagramAccountId ?? "",
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
    if (!configTarget || !canManageMetaAds || isUpdatingConfig) {
      return;
    }

    setPageMessage(null);

    try {
      await updateMetaAdsConfig({
        clientId: configTarget.client.id,
        body: {
          businessId: normalizeOptionalText(configForm.businessId),
          adAccountId: normalizeOptionalText(configForm.adAccountId),
          pixelId: normalizeOptionalText(configForm.pixelId),
          facebookPageId: normalizeOptionalText(configForm.facebookPageId),
          instagramAccountId: normalizeOptionalText(configForm.instagramAccountId),
          currency: normalizeOptionalText(configForm.currency),
          timezone: normalizeOptionalText(configForm.timezone),
        },
      }).unwrap();
      closeConfigDialog();
      setPageMessage({ type: "success", text: "Meta Ads konfigürasyonu güncellendi." });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "Meta Ads konfigürasyonu güncellenemedi."),
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

  function toReportPeriodStartIso(value: string): string {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }

  function toReportPeriodEndIso(value: string): string {
    return new Date(`${value}T23:59:59.999Z`).toISOString();
  }

  async function handleCreateReportDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageReports || selectedReportClientId.length === 0 || isMutating) {
      return;
    }

    if (!reportForm.periodStart || !reportForm.periodEnd) {
      setPageMessage({
        type: "error",
        text: "Rapor başlangıç ve bitiş tarihi zorunludur.",
      });
      return;
    }

    if (reportForm.periodStart > reportForm.periodEnd) {
      setPageMessage({
        type: "error",
        text: "Rapor başlangıç tarihi bitiş tarihinden sonra olamaz.",
      });
      return;
    }

    setPageMessage(null);
    try {
      await createMetaAdsReport({
        clientId: selectedReportClientId,
        body: {
          periodStart: toReportPeriodStartIso(reportForm.periodStart),
          periodEnd: toReportPeriodEndIso(reportForm.periodEnd),
          type: reportForm.type,
          summary: normalizeOptionalText(reportForm.summary) ?? undefined,
          clientVisible: reportForm.publishNow || undefined,
          requestAcknowledgement: reportForm.requestAcknowledgement || undefined,
        },
      }).unwrap();

      setReportForm(initialReportForm);
      setPageMessage({
        type: "success",
        text: "Meta Ads rapor taslağı kaydedildi.",
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "Meta Ads raporu kaydedilemedi."),
      });
    }
  }

  async function handlePublishReport(reportId: string) {
    if (!canManageReports || selectedReportClientId.length === 0 || isMutating) {
      return;
    }

    setPageMessage(null);
    try {
      await updateMetaAdsReport({
        reportId,
        clientId: selectedReportClientId,
        body: {
          status: "PUBLISHED",
          clientVisible: true,
          requestAcknowledgement: publishAckToggle || undefined,
        },
      }).unwrap();

      setPageMessage({
        type: "success",
        text: `${selectedReportClientName} için rapor yayınlandı.`,
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "Rapor yayınlanamadı."),
      });
    }
  }

  async function handleTestConnection(client: AdminMetaAdsClientListItem) {
    if (!canManageMetaAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await testMetaAdsConnection({
          clientId: client.client.id,
          body: {
            ...(client.ids.adAccountId ? { adAccountId: client.ids.adAccountId } : {}),
            requiredScopes: ["ads_read"],
          },
        }).unwrap();
      },
      `${client.client.companyName} için bağlantı testi başarılı.`,
      "Meta Ads bağlantı testi başarısız.",
    );
  }

  async function handleManualSync(client: AdminMetaAdsClientListItem) {
    if (!canManageMetaAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await syncMetaAds({
          clientId: client.client.id,
        }).unwrap();
      },
      `${client.client.companyName} için Meta Ads senkronizasyonu tamamlandı.`,
      "Meta Ads senkronizasyonu çalıştırılamadı.",
    );
  }

  async function handleRetrySync(client: AdminMetaAdsClientListItem) {
    if (!canManageMetaAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await retryMetaAdsSync({
          clientId: client.client.id,
        }).unwrap();
      },
      `${client.client.companyName} için retry senkronizasyonu tamamlandı.`,
      "Retry senkronizasyonu çalıştırılamadı.",
    );
  }

  async function handleDisconnect(client: AdminMetaAdsClientListItem) {
    if (!canManageMetaAds || isMutating) {
      return;
    }

    if (!window.confirm(`${client.client.companyName} için Meta Ads bağlantısı kesilsin mi?`)) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await disconnectMetaAds({ clientId: client.client.id }).unwrap();
      },
      `${client.client.companyName} için Meta Ads bağlantısı kesildi.`,
      "Meta Ads bağlantısı kesilemedi.",
    );
  }

  async function handleCreateApprovalRequest(client: AdminMetaAdsClientListItem) {
    if (!canCreateApproval || isMutating) {
      return;
    }

    const projectId = client.actionContext.metaAdsProjectId;
    if (!projectId) {
      setPageMessage({
        type: "error",
        text: `${client.client.companyName} için META_ADS servis projesi bulunamadı.`,
      });
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await createTask({
          projectId,
          title: `Meta Ads Onay Talebi - ${client.client.companyName}`,
          description:
            "FAZ-05 admin Meta Ads panelinden oluşturulan onay talebi. Müşteri kreatif/rapor onayı bekleniyor.",
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

  if (!canReadMetaAds) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
        Meta Ads admin panelini görüntülemek için `metaAds.config.read.any` izni gereklidir.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Meta Ads Yönetimi</h1>
          <p className="text-sm text-[#A0A0A0]">
            Meta Ads satın alımı olan müşterilerin bağlantı, sync ve onay durumlarını yönetin.
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
          <h2 className="text-lg font-semibold text-white">Meta Ads Müşteri Listesi</h2>
          {dateRange ? (
            <p className="text-xs text-[#A0A0A0]">
              Rapor aralığı: {dateRange.since} - {dateRange.until}
            </p>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm text-[#A0A0A0]">Meta Ads müşterileri yükleniyor...</p> : null}
        {isListError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(listError, "Meta Ads müşteri listesi alınamadı.")}
          </p>
        ) : null}
        {!isLoading && !isListError && listItems.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Meta Ads hizmeti olan müşteri bulunmuyor.</p>
        ) : null}

        {!isLoading && !isListError && listItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Service</th>
                  <th className="py-3 pr-3">Bağlantı</th>
                  <th className="py-3 pr-3">Toplam Harcama</th>
                  <th className="py-3 pr-3">Son Sync</th>
                  <th className="py-3 pr-3">Bekleyen Onay</th>
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
                        <Badge className={getMetaAdsConnectionStatusBadgeClass(item.connectionStatus)}>
                          {getMetaAdsConnectionStatusLabel(item.connectionStatus)}
                        </Badge>
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
                            disabled={!canManageMetaAds || isRowActionLoading}
                            title={canManageMetaAds ? undefined : "Config yönetimi için yetki gerekir."}
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
                            disabled={!canManageMetaAds || isRowActionLoading}
                            title={canManageMetaAds ? undefined : "Bağlantı testi için yetki gerekir."}
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
                            disabled={!canManageMetaAds || isRowActionLoading}
                            title={canManageMetaAds ? undefined : "Sync çalıştırmak için yetki gerekir."}
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
                            disabled={!canManageMetaAds || isRowActionLoading}
                            title={canManageMetaAds ? undefined : "Disconnect için yetki gerekir."}
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
                  <p className="text-xs text-red-200">{client.syncError ?? "Bilinmeyen sync hatası."}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 border-red-500/30 text-red-200 hover:bg-red-500/10"
                  onClick={() => {
                    void handleRetrySync(client);
                  }}
                  disabled={!canManageMetaAds || isMutating}
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

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Meta Ads Rapor Draft / Publish</h2>
            <p className="text-xs text-[#A0A0A0]">
              Filtreleyin, taslak oluşturun ve client-visible rapor yayınlayın.
            </p>
          </div>
          {reportMeta ? (
            <p className="text-xs text-[#A0A0A0]">
              Toplam: {reportMeta.total} · Draft: {reportMeta.draft} · Published: {reportMeta.published}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="meta-ads-report-client">Müşteri</Label>
            <select
              id="meta-ads-report-client"
              className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
              value={selectedReportClientId}
              onChange={(event) => setSelectedReportClientId(event.target.value)}
            >
              {listItems.map((item) => (
                <option key={item.client.id} value={item.client.id}>
                  {item.client.companyName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-ads-report-status-filter">Status</Label>
            <select
              id="meta-ads-report-status-filter"
              className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
              value={reportStatusFilter}
              onChange={(event) => setReportStatusFilter(event.target.value as MetaAdsReportStatus | "ALL")}
            >
              <option value="ALL">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-ads-report-type-filter">Tip</Label>
            <select
              id="meta-ads-report-type-filter"
              className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
              value={reportTypeFilter}
              onChange={(event) => setReportTypeFilter(event.target.value as MetaAdsReportType | "ALL")}
            >
              <option value="ALL">All</option>
              {reportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2 text-sm text-[#DADADA]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#AAFF01]"
              checked={publishAckToggle}
              onChange={(event) => setPublishAckToggle(event.target.checked)}
            />
            Yayında onay iste
          </label>
        </div>

        <form className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-white/[0.08] p-4" onSubmit={handleCreateReportDraft}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="meta-ads-report-period-start">Dönem Başlangıç</Label>
              <Input
                id="meta-ads-report-period-start"
                type="date"
                value={reportForm.periodStart}
                onChange={(event) =>
                  setReportForm((prev) => ({
                    ...prev,
                    periodStart: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta-ads-report-period-end">Dönem Bitiş</Label>
              <Input
                id="meta-ads-report-period-end"
                type="date"
                value={reportForm.periodEnd}
                onChange={(event) =>
                  setReportForm((prev) => ({
                    ...prev,
                    periodEnd: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta-ads-report-type">Rapor Tipi</Label>
              <select
                id="meta-ads-report-type"
                className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
                value={reportForm.type}
                onChange={(event) =>
                  setReportForm((prev) => ({
                    ...prev,
                    type: event.target.value as MetaAdsReportType,
                  }))
                }
              >
                {reportTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-4 text-sm text-[#DADADA]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#AAFF01]"
                  checked={reportForm.publishNow}
                  onChange={(event) =>
                    setReportForm((prev) => ({
                      ...prev,
                      publishNow: event.target.checked,
                    }))
                  }
                />
                Hemen yayınla
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#AAFF01]"
                  checked={reportForm.requestAcknowledgement}
                  onChange={(event) =>
                    setReportForm((prev) => ({
                      ...prev,
                      requestAcknowledgement: event.target.checked,
                    }))
                  }
                />
                Ack iste
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-ads-report-summary">Özet</Label>
            <Input
              id="meta-ads-report-summary"
              value={reportForm.summary}
              onChange={(event) =>
                setReportForm((prev) => ({
                  ...prev,
                  summary: event.target.value,
                }))
              }
              placeholder="Haftalık rapor özeti..."
            />
          </div>
          <div>
            <Button
              type="submit"
              className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
              disabled={!canManageReports || selectedReportClientId.length === 0 || isMutating}
            >
              {isCreatingReport ? "Kaydediliyor..." : "Taslak Kaydet"}
            </Button>
          </div>
        </form>

        <div className="mt-5">
          {isReportsLoading || isReportsFetching ? (
            <p className="text-sm text-[#A0A0A0]">Raporlar yükleniyor...</p>
          ) : null}
          {isReportsError ? (
            <p className="text-sm text-red-300">
              {extractApiErrorMessage(reportsError, "Meta Ads raporları alınamadı.")}
            </p>
          ) : null}
          {!isReportsLoading && !isReportsError && reportRows.length === 0 ? (
            <p className="text-sm text-[#A0A0A0]">Seçili filtre için rapor kaydı bulunmuyor.</p>
          ) : null}

          {!isReportsLoading && !isReportsError && reportRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                  <tr>
                    <th className="py-3 pr-3">Dönem</th>
                    <th className="py-3 pr-3">Tip</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3">Ack</th>
                    <th className="py-3 pr-3">Özet</th>
                    <th className="py-3">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((report) => (
                    <tr key={report.id} className="border-b border-white/[0.04] align-top">
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {formatReportPeriod(report.periodStart, report.periodEnd)}
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {formatReportTypeLabel(report.type)}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-md px-2 py-1 text-xs ${getReportStatusClassName(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">{report.acknowledgementStatus}</td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">{report.summary ?? "—"}</td>
                      <td className="py-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            void handlePublishReport(report.id);
                          }}
                          disabled={report.status === "PUBLISHED" || !canManageReports || isMutating}
                        >
                          {isUpdatingReport ? "Yayınlanıyor..." : "Publish"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </Card>

      <Dialog
        open={configTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeConfigDialog();
          }
        }}
      >
        <DialogContent className="border-white/[0.12] bg-[#171717] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meta Ads Config Düzenle</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Business, ad account, pixel ve bağlantı ayarlarını güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleConfigSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ConfigField
                id="meta-business-id"
                label="Business ID"
                value={configForm.businessId}
                onChange={(value) => updateConfigField("businessId", value)}
              />
              <ConfigField
                id="meta-ad-account-id"
                label="Ad Account ID"
                value={configForm.adAccountId}
                onChange={(value) => updateConfigField("adAccountId", value)}
              />
              <ConfigField
                id="meta-pixel-id"
                label="Pixel ID"
                value={configForm.pixelId}
                onChange={(value) => updateConfigField("pixelId", value)}
              />
              <ConfigField
                id="meta-page-id"
                label="Page ID"
                value={configForm.facebookPageId}
                onChange={(value) => updateConfigField("facebookPageId", value)}
              />
              <ConfigField
                id="meta-instagram-id"
                label="Instagram Account ID"
                value={configForm.instagramAccountId}
                onChange={(value) => updateConfigField("instagramAccountId", value)}
              />
              <ConfigField
                id="meta-currency"
                label="Currency"
                value={configForm.currency}
                onChange={(value) => updateConfigField("currency", value)}
              />
              <ConfigField
                id="meta-timezone"
                label="Timezone"
                value={configForm.timezone}
                onChange={(value) => updateConfigField("timezone", value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeConfigDialog} disabled={isUpdatingConfig}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={!canManageMetaAds || isUpdatingConfig}
              >
                {isUpdatingConfig ? "Kaydediliyor..." : "Config Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Yetki Durumu</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <PermissionPill enabled={canReadMetaAds} label="metaAds.config.read.any" />
          <PermissionPill enabled={canManageMetaAds} label="metaAds.config.manage.any" />
          <PermissionPill enabled={canCreateApproval} label="tasks.manage.any" />
        </div>
      </Card>
    </div>
  );
}

function ConfigField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
      />
    </div>
  );
}

function PermissionPill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={
        enabled
          ? "inline-flex items-center gap-1 rounded-md border border-[#AAFF01]/40 bg-[#AAFF01]/10 px-2 py-1 text-[#d8ff8f]"
          : "inline-flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-red-200"
      }
    >
      {enabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

function getSyncStatusLabel(status: MetaAdsSyncStatus): string {
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

function getSyncStatusClassName(status: MetaAdsSyncStatus): string {
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

function getReportStatusClassName(status: MetaAdsReportStatus): string {
  if (status === "PUBLISHED") {
    return "bg-[#AAFF01]/15 text-[#d2ff8a]";
  }
  if (status === "ARCHIVED") {
    return "bg-white/[0.06] text-[#A0A0A0]";
  }
  return "bg-amber-500/15 text-amber-200";
}

function formatReportTypeLabel(type: MetaAdsReportType): string {
  if (type === "CAMPAIGN_PERFORMANCE") {
    return "Campaign";
  }
  if (type === "CREATIVE_PERFORMANCE") {
    return "Creative";
  }
  if (type === "BUDGET_RECOMMENDATION") {
    return "Budget";
  }

  return type;
}

function formatReportPeriod(periodStart: string, periodEnd: string): string {
  const from = periodStart.slice(0, 10);
  const until = periodEnd.slice(0, 10);
  return `${from} - ${until}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}
