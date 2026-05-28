import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Download,
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
  useDisconnectAdminClientAmazonAdsMutation,
  useCreateAdminClientAmazonAdsReportMutation,
  useExportAdminAmazonAdsReportMutation,
  useGetAdminClientAmazonAdsReportsQuery,
  useGetAdminAmazonAdsClientsQuery,
  useGetAdminAmazonAdsSyncLogsQuery,
  useRetryAdminClientAmazonAdsSyncMutation,
  useSyncAdminClientAmazonAdsMutation,
  useTestAdminClientAmazonAdsConnectionMutation,
  useUpdateAdminAmazonAdsReportMutation,
  useUpdateAdminClientAmazonAdsConfigMutation,
} from "../features/clients/clientsApi";
import type {
  AdminAmazonAdsClientListItem,
  AmazonAdsReportStatus,
  AmazonAdsReportType,
  AmazonAdsReportExportFormat,
  AdminAmazonAdsSyncLogItem,
  AmazonAdsRegion,
} from "../features/clients/clientsTypes";
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

type ReportFormState = {
  periodStart: string;
  periodEnd: string;
  type: AmazonAdsReportType;
  summary: string;
  publishNow: boolean;
  requestAcknowledgement: boolean;
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

const initialReportForm: ReportFormState = {
  periodStart: "",
  periodEnd: "",
  type: "WEEKLY",
  summary: "",
  publishNow: false,
  requestAcknowledgement: false,
};

const reportTypeOptions: Array<{ value: AmazonAdsReportType; label: string }> = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "SPONSORED_PRODUCTS_PERFORMANCE", label: "SP Performance" },
  { value: "SPONSORED_BRANDS_PERFORMANCE", label: "SB Performance" },
  { value: "SPONSORED_DISPLAY_PERFORMANCE", label: "SD Performance" },
  { value: "PRODUCT_PERFORMANCE", label: "Product Performance" },
  { value: "SEARCH_TERMS", label: "Search Terms" },
  { value: "BUDGET_RECOMMENDATION", label: "Budget" },
  { value: "ACOS_OPTIMIZATION", label: "ACOS" },
];

export function AmazonAdsAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAmazonAds = hasAdminPermission(currentUser, ["amazonAds.config.read.any"]);
  const canManageAmazonAds = hasAdminPermission(currentUser, ["amazonAds.config.manage.any"]);
  const canReadReports = hasAdminPermission(currentUser, ["reports.read"]);
  const canManageReports = hasAdminPermission(currentUser, ["reports.manage"]);
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
  const {
    data: syncLogsResponse,
    error: syncLogsError,
    isError: isSyncLogsError,
    isLoading: isSyncLogsLoading,
  } = useGetAdminAmazonAdsSyncLogsQuery(
    {
      limit: 20,
    },
    {
      skip: !canReadAmazonAds,
    },
  );
  const [updateAmazonAdsConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientAmazonAdsConfigMutation();
  const [testAmazonAdsConnection, { isLoading: isTestingConnection }] =
    useTestAdminClientAmazonAdsConnectionMutation();
  const [syncAmazonAds, { isLoading: isSyncing }] = useSyncAdminClientAmazonAdsMutation();
  const [retryAmazonAdsSync, { isLoading: isRetryingSync }] =
    useRetryAdminClientAmazonAdsSyncMutation();
  const [disconnectAmazonAds, { isLoading: isDisconnecting }] =
    useDisconnectAdminClientAmazonAdsMutation();
  const [createTask, { isLoading: isCreatingApproval }] = useCreateTaskMutation();
  const [createAmazonAdsReport, { isLoading: isCreatingReport }] =
    useCreateAdminClientAmazonAdsReportMutation();
  const [updateAmazonAdsReport, { isLoading: isUpdatingReport }] =
    useUpdateAdminAmazonAdsReportMutation();
  const [exportAmazonAdsReport, { isLoading: isExportingReport }] =
    useExportAdminAmazonAdsReportMutation();

  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configTarget, setConfigTarget] = useState<AdminAmazonAdsClientListItem | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(initialConfigForm);
  const [activeClientActionId, setActiveClientActionId] = useState<string | null>(null);
  const [selectedReportClientId, setSelectedReportClientId] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<AmazonAdsReportStatus | "ALL">(
    "ALL",
  );
  const [reportTypeFilter, setReportTypeFilter] = useState<AmazonAdsReportType | "ALL">("ALL");
  const [reportForm, setReportForm] = useState<ReportFormState>(initialReportForm);
  const [publishAckToggle, setPublishAckToggle] = useState(false);
  const [exportingReportId, setExportingReportId] = useState<string | null>(null);

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
  } = useGetAdminClientAmazonAdsReportsQuery(
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
    isUpdatingReport ||
    isExportingReport;

  const kpis = useMemo(
    () => [
      { label: "Amazon Ads Müşteri", value: meta?.total ?? 0 },
      { label: "Connected", value: meta?.connected ?? 0 },
      { label: "Hatalı Bağlantı", value: meta?.error ?? 0 },
      { label: "Bekleyen Onay", value: meta?.pendingApprovals ?? 0 },
    ],
    [meta],
  );

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
      await createAmazonAdsReport({
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
        text: "Amazon Ads rapor taslağı kaydedildi.",
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "Amazon Ads raporu kaydedilemedi."),
      });
    }
  }

  async function handlePublishReport(reportId: string) {
    if (!canManageReports || selectedReportClientId.length === 0 || isMutating) {
      return;
    }

    setPageMessage(null);
    try {
      await updateAmazonAdsReport({
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

  async function handleExportReport(
    report: { id: string; periodEnd: string },
    format: AmazonAdsReportExportFormat,
  ) {
    if (!canReadReports || isMutating) {
      return;
    }

    setPageMessage(null);
    setExportingReportId(report.id);
    try {
      const body = await exportAmazonAdsReport({ reportId: report.id, format }).unwrap();
      downloadAmazonAdsReportFile(report, format, body);
      setPageMessage({
        type: "success",
        text: `${selectedReportClientName} Amazon Ads raporu ${format.toUpperCase()} olarak indirildi.`,
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(error, "Amazon Ads raporu indirilemedi."),
      });
    } finally {
      setExportingReportId(null);
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

  async function handleRetrySync(client: AdminAmazonAdsClientListItem) {
    if (!canManageAmazonAds || isMutating) {
      return;
    }

    await runClientAction(
      client.client.id,
      async () => {
        await retryAmazonAdsSync({
          clientId: client.client.id,
        }).unwrap();
      },
      `${client.client.companyName} için retry sync tamamlandı.`,
      "Amazon Ads retry sync çalıştırılamadı.",
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
            "FAZ-07 admin Amazon Ads panelinden oluşturulan strateji onay talebi.",
          status: "REVIEW",
          priority: "MEDIUM",
          type: "REVISION",
          workstream: "FULLSTACK",
          approvalRequired: true,
          approvalType: "AMAZON_ADS_STRATEGY_APPROVAL",
          approvalStatus: "PENDING",
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
                    void handleRetrySync(client);
                  }}
                  disabled={!canManageAmazonAds || isMutating}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry Sync
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Amazon Ads Rapor Draft / Publish</h2>
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
            <Label htmlFor="amazon-ads-report-client">Müşteri</Label>
            <select
              id="amazon-ads-report-client"
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
            <Label htmlFor="amazon-ads-report-status-filter">Status</Label>
            <select
              id="amazon-ads-report-status-filter"
              className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
              value={reportStatusFilter}
              onChange={(event) =>
                setReportStatusFilter(event.target.value as AmazonAdsReportStatus | "ALL")
              }
            >
              <option value="ALL">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amazon-ads-report-type-filter">Tip</Label>
            <select
              id="amazon-ads-report-type-filter"
              className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
              value={reportTypeFilter}
              onChange={(event) =>
                setReportTypeFilter(event.target.value as AmazonAdsReportType | "ALL")
              }
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

        <form
          className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-white/[0.08] p-4"
          onSubmit={handleCreateReportDraft}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="amazon-ads-report-period-start">Dönem Başlangıç</Label>
              <Input
                id="amazon-ads-report-period-start"
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
              <Label htmlFor="amazon-ads-report-period-end">Dönem Bitiş</Label>
              <Input
                id="amazon-ads-report-period-end"
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
              <Label htmlFor="amazon-ads-report-type">Rapor Tipi</Label>
              <select
                id="amazon-ads-report-type"
                className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white"
                value={reportForm.type}
                onChange={(event) =>
                  setReportForm((prev) => ({
                    ...prev,
                    type: event.target.value as AmazonAdsReportType,
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
            <Label htmlFor="amazon-ads-report-summary">Özet</Label>
            <Input
              id="amazon-ads-report-summary"
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
              {extractApiErrorMessage(reportsError, "Amazon Ads raporları alınamadı.")}
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
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${getReportStatusClassName(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={
                            report.acknowledgementStatus === "ACKNOWLEDGED"
                              ? "inline-flex items-center gap-1 text-xs text-[#AAFF01]"
                              : report.acknowledgementStatus === "CHANGES_REQUESTED"
                                ? "inline-flex items-center gap-1 text-xs text-red-300"
                                : report.acknowledgementStatus === "PENDING"
                                  ? "inline-flex items-center gap-1 text-xs text-amber-200"
                                  : "inline-flex items-center gap-1 text-xs text-[#A0A0A0]"
                          }
                        >
                          {report.acknowledgementStatus === "ACKNOWLEDGED" ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : report.acknowledgementStatus === "CHANGES_REQUESTED" ? (
                            <ShieldAlert className="h-3.5 w-3.5" />
                          ) : null}
                          {report.acknowledgementStatus}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">{report.summary ?? "—"}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              void handlePublishReport(report.id);
                            }}
                            disabled={
                              report.status === "PUBLISHED" || !canManageReports || isMutating
                            }
                          >
                            {isUpdatingReport ? "Yayınlanıyor..." : "Publish"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              void handleExportReport(report, "csv");
                            }}
                            title="CSV olarak indir"
                            disabled={!canReadReports || isMutating}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            {exportingReportId === report.id ? "İndiriliyor..." : "CSV"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              void handleExportReport(report, "json");
                            }}
                            title="JSON olarak indir"
                            disabled={!canReadReports || isMutating}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            JSON
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Sync Logları</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-white/5 px-2 py-1 text-[#DADADA]">
              Toplam: {syncLogsMeta?.total ?? 0}
            </span>
            <span className="rounded bg-red-500/15 px-2 py-1 text-red-200">
              Hatalı: {syncLogsMeta?.failed ?? 0}
            </span>
            <span className="rounded bg-yellow-500/15 px-2 py-1 text-yellow-200">
              Running: {syncLogsMeta?.running ?? 0}
            </span>
            <span className="rounded bg-[#00D4FF]/15 px-2 py-1 text-[#8defff]">
              Skipped: {syncLogsMeta?.skipped ?? 0}
            </span>
          </div>
        </div>

        {isSyncLogsLoading ? (
          <p className="text-sm text-[#A0A0A0]">Amazon Ads sync logları yükleniyor...</p>
        ) : null}
        {isSyncLogsError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(syncLogsError, "Amazon Ads sync logları alınamadı.")}
          </p>
        ) : null}
        {!isSyncLogsLoading && !isSyncLogsError && syncLogs.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Henüz sync log kaydı bulunmuyor.</p>
        ) : null}

        {!isSyncLogsLoading && !isSyncLogsError && syncLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-white/[0.06] text-left text-xs text-[#A0A0A0]">
                <tr>
                  <th className="py-3 pr-3">Müşteri</th>
                  <th className="py-3 pr-3">Trigger</th>
                  <th className="py-3 pr-3">Sync</th>
                  <th className="py-3 pr-3">Report</th>
                  <th className="py-3 pr-3">Başlangıç</th>
                  <th className="py-3 pr-3">Süre</th>
                  <th className="py-3 pr-3">API</th>
                  <th className="py-3 pr-3">Kayıt</th>
                  <th className="py-3">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => {
                  const targetClient = listItems.find((item) => item.client.id === log.clientProfileId);
                  const canRetry =
                    log.status === "FAILED" || log.status === "PARTIAL" || log.status === "SKIPPED";

                  return (
                    <tr key={log.id} className="border-b border-white/[0.04] align-top">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-white">{log.clientCompanyName}</p>
                        <p className="text-xs text-[#A0A0A0]">{log.profileId ?? "Profile yok"}</p>
                        {log.errorMessage ? (
                          <p className="mt-1 max-w-[320px] text-xs text-red-200">{log.errorMessage}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {formatSyncTriggerLabel(log.trigger)}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={getAmazonSyncStatusBadgeClass(log.status)}>
                          {getAmazonSyncStatusLabel(log.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={getAmazonReportStatusBadgeClass(log.reportStatus)}>
                          {formatReportStatusLabel(log.reportStatus)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {formatClientDateTime(log.startedAt)}
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {formatDuration(log.durationMs)}
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {log.apiCallCount ?? 0}
                      </td>
                      <td className="py-3 pr-3 text-xs text-[#DADADA]">
                        {log.recordsFetched ?? 0}
                      </td>
                      <td className="py-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            if (targetClient) {
                              void handleRetrySync(targetClient);
                            }
                          }}
                          disabled={!targetClient || !canManageAmazonAds || !canRetry || isMutating}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Retry
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
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

function getReportStatusClassName(status: AmazonAdsReportStatus): string {
  if (status === "PUBLISHED") {
    return "bg-[#AAFF01]/15 text-[#d2ff8a]";
  }
  if (status === "ARCHIVED") {
    return "bg-white/[0.06] text-[#A0A0A0]";
  }
  return "bg-amber-500/15 text-amber-200";
}

function formatReportTypeLabel(type: AmazonAdsReportType): string {
  if (type === "SPONSORED_PRODUCTS_PERFORMANCE") {
    return "SP Performance";
  }
  if (type === "SPONSORED_BRANDS_PERFORMANCE") {
    return "SB Performance";
  }
  if (type === "SPONSORED_DISPLAY_PERFORMANCE") {
    return "SD Performance";
  }
  if (type === "PRODUCT_PERFORMANCE") {
    return "Product";
  }
  if (type === "SEARCH_TERMS") {
    return "Search Terms";
  }
  if (type === "BUDGET_RECOMMENDATION") {
    return "Budget";
  }
  if (type === "ACOS_OPTIMIZATION") {
    return "ACOS";
  }

  return type;
}

function formatReportPeriod(periodStart: string, periodEnd: string): string {
  const from = periodStart.slice(0, 10);
  const until = periodEnd.slice(0, 10);
  return `${from} - ${until}`;
}

function downloadAmazonAdsReportFile(
  report: { id: string; periodEnd: string },
  format: AmazonAdsReportExportFormat,
  body: string,
) {
  if (typeof URL.createObjectURL !== "function") {
    return;
  }

  const mimeType = format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
  const blob = new Blob([body], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `amazon-ads-report-${report.periodEnd.slice(0, 10)}-${report.id}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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

function getAmazonSyncStatusLabel(status: AdminAmazonAdsSyncLogItem["status"]): string {
  if (status === "SUCCESS") {
    return "Success";
  }
  if (status === "FAILED") {
    return "Failed";
  }
  if (status === "PARTIAL") {
    return "Partial";
  }
  if (status === "SKIPPED") {
    return "Skipped";
  }
  return "Running";
}

function getAmazonSyncStatusBadgeClass(status: AdminAmazonAdsSyncLogItem["status"]): string {
  if (status === "SUCCESS") {
    return "rounded-md bg-[#AAFF01]/15 px-2 py-1 text-xs text-[#d6ff88]";
  }
  if (status === "FAILED") {
    return "rounded-md bg-red-500/20 px-2 py-1 text-xs text-red-200";
  }
  if (status === "PARTIAL") {
    return "rounded-md bg-yellow-500/20 px-2 py-1 text-xs text-yellow-200";
  }
  if (status === "SKIPPED") {
    return "rounded-md bg-[#00D4FF]/15 px-2 py-1 text-xs text-[#8defff]";
  }
  return "rounded-md bg-white/10 px-2 py-1 text-xs text-[#DADADA]";
}

function formatSyncTriggerLabel(trigger: string | null): string {
  if (trigger === "MANUAL_SYNC") {
    return "Manual";
  }
  if (trigger === "ERROR_RETRY") {
    return "Retry";
  }
  if (trigger === "ON_DEMAND_ASSIGNED_REFRESH") {
    return "Assigned Refresh";
  }
  if (trigger === "ON_DEMAND_CLIENT_REFRESH") {
    return "Client Refresh";
  }
  if (trigger === "SCHEDULED_SYNC") {
    return "Scheduled";
  }
  return "Unknown";
}

function formatDuration(durationMs: number | null): string {
  if (durationMs === null || !Number.isFinite(durationMs) || durationMs < 0) {
    return "—";
  }

  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatReportStatusLabel(status: string | null): string {
  if (!status) {
    return "—";
  }
  return status;
}

function getAmazonReportStatusBadgeClass(status: string | null): string {
  if (status === "COMPLETED" || status === "SUCCESS") {
    return "rounded-md bg-[#AAFF01]/15 px-2 py-1 text-xs text-[#d6ff88]";
  }
  if (status === "FAILED" || status === "FAILURE" || status === "CANCELLED") {
    return "rounded-md bg-red-500/20 px-2 py-1 text-xs text-red-200";
  }
  if (status === "PENDING" || status === "IN_PROGRESS") {
    return "rounded-md bg-yellow-500/20 px-2 py-1 text-xs text-yellow-200";
  }
  return "rounded-md bg-white/10 px-2 py-1 text-xs text-[#DADADA]";
}
