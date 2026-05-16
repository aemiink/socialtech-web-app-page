import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Link2Off,
  ExternalLink,
  FolderKanban,
  ListChecks,
  PlugZap,
  RefreshCw,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useGetAdminAssignmentsQuery } from "../features/adminAssignments/adminAssignmentsApi";
import {
  useConnectAdminClientGoogleAdsManualMutation,
  useDisconnectAdminClientGoogleAdsMutation,
  useGetAdminClientGoogleAdsConnectionQuery,
  useGetAdminClientGoogleAdsConfigQuery,
  useGetAdminClientGoogleAdsSummaryQuery,
  useConnectAdminClientMetaAdsManualMutation,
  useDisconnectAdminClientMetaAdsMutation,
  useGetAdminClientMetaAdsConnectionQuery,
  useGetAdminClientMetaAdsSummaryQuery,
  useGetClientSummaryQuery,
  useResetClientOwnerPasswordMutation,
  useSyncAdminClientMetaAdsMutation,
  useTestAdminClientGoogleAdsConnectionMutation,
  useTestAdminClientMetaAdsConnectionMutation,
  useUpdateAdminClientGoogleAdsConfigMutation,
} from "../features/clients/clientsApi";
import type {
  ClientSummaryRecentProject,
  ClientSummaryRecentTask,
  GoogleAdsConnectionStatus,
} from "../features/clients/clientsTypes";
import { validatePassword, validatePasswordConfirmation } from "../features/adminUsers/adminUsersUtils";
import {
  extractApiErrorMessage,
  formatClientDate,
  formatClientDateTime,
  getClientPriorityBadgeClass,
  getClientPriorityLabel,
  getClientProjectStatusBadgeClass,
  getGoogleAdsConnectionStatusBadgeClass,
  getGoogleAdsConnectionStatusLabel,
  getMetaAdsConnectionStatusBadgeClass,
  getMetaAdsConnectionStatusLabel,
  getClientProjectStatusLabel,
  getClientStatusBadgeClass,
  getClientStatusLabel,
  getClientTaskStatusBadgeClass,
  getClientTaskStatusLabel,
  isNotFoundError,
  isUuid,
} from "../features/clients/clientsUtils";

const GOOGLE_ADS_CONNECTION_STATUS_OPTIONS: GoogleAdsConnectionStatus[] = [
  "NOT_CONNECTED",
  "PENDING",
  "CONNECTED",
  "ERROR",
  "DISCONNECTED",
];

type GoogleAdsConfigFormState = {
  customerId: string;
  managerCustomerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  connectionStatus: GoogleAdsConnectionStatus;
};

const initialGoogleAdsConfigForm: GoogleAdsConfigFormState = {
  customerId: "",
  managerCustomerId: "",
  descriptiveName: "",
  currencyCode: "",
  timeZone: "",
  connectionStatus: "NOT_CONNECTED",
};

export function ClientDetail() {
  const { id } = useParams();
  const clientProfileId = typeof id === "string" && isUuid(id) ? id : null;
  const isValidId = clientProfileId !== null;
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [ownerPasswordFeedback, setOwnerPasswordFeedback] = useState<string | null>(null);
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaAdAccountId, setMetaAdAccountId] = useState("");
  const [metaConnectionFeedback, setMetaConnectionFeedback] = useState<string | null>(null);
  const [googleRefreshToken, setGoogleRefreshToken] = useState("");
  const [googleAccessToken, setGoogleAccessToken] = useState("");
  const [googleConnectionFeedback, setGoogleConnectionFeedback] = useState<string | null>(null);
  const [isGoogleAdsEditMode, setIsGoogleAdsEditMode] = useState(false);
  const [googleAdsFeedback, setGoogleAdsFeedback] = useState<string | null>(null);
  const [googleAdsForm, setGoogleAdsForm] = useState<GoogleAdsConfigFormState>(
    initialGoogleAdsConfigForm,
  );
  const [resetClientOwnerPassword, { isLoading: isResettingOwnerPassword }] =
    useResetClientOwnerPasswordMutation();
  const [updateGoogleAdsConfig, { isLoading: isGoogleAdsUpdating }] =
    useUpdateAdminClientGoogleAdsConfigMutation();
  const [connectGoogleAdsManual, { isLoading: isGoogleAdsConnecting }] =
    useConnectAdminClientGoogleAdsManualMutation();
  const [testGoogleAdsConnection, { isLoading: isGoogleAdsTesting }] =
    useTestAdminClientGoogleAdsConnectionMutation();
  const [disconnectGoogleAds, { isLoading: isGoogleAdsDisconnecting }] =
    useDisconnectAdminClientGoogleAdsMutation();
  const [connectMetaAdsManual, { isLoading: isMetaConnecting }] =
    useConnectAdminClientMetaAdsManualMutation();
  const [testMetaAdsConnection, { isLoading: isMetaTesting }] =
    useTestAdminClientMetaAdsConnectionMutation();
  const [syncMetaAds, { isLoading: isMetaSyncing }] = useSyncAdminClientMetaAdsMutation();
  const [disconnectMetaAds, { isLoading: isMetaDisconnecting }] =
    useDisconnectAdminClientMetaAdsMutation();

  const {
    data: summary,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetClientSummaryQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });
  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
  } = useGetAdminAssignmentsQuery(
    { clientProfileId: clientProfileId ?? "", isActive: true },
    { skip: !isValidId },
  );
  const {
    data: googleAdsConfig,
    error: googleAdsConfigError,
    isFetching: isGoogleAdsConfigFetching,
    isLoading: isGoogleAdsConfigLoading,
    refetch: refetchGoogleAdsConfig,
  } = useGetAdminClientGoogleAdsConfigQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });
  const {
    data: googleAdsConnection,
    error: googleAdsConnectionError,
    isFetching: isGoogleAdsConnectionFetching,
    isLoading: isGoogleAdsConnectionLoading,
    refetch: refetchGoogleAdsConnection,
  } = useGetAdminClientGoogleAdsConnectionQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });
  const {
    data: googleAdsSummary,
    error: googleAdsSummaryError,
    isFetching: isGoogleAdsSummaryFetching,
    isLoading: isGoogleAdsSummaryLoading,
    refetch: refetchGoogleAdsSummary,
  } = useGetAdminClientGoogleAdsSummaryQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });
  const {
    data: metaAdsConnection,
    error: metaAdsConnectionError,
    isFetching: isMetaAdsConnectionFetching,
    isLoading: isMetaAdsConnectionLoading,
    refetch: refetchMetaAdsConnection,
  } = useGetAdminClientMetaAdsConnectionQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });
  const {
    data: metaAdsSummary,
    error: metaAdsSummaryError,
    isFetching: isMetaAdsSummaryFetching,
    isLoading: isMetaAdsSummaryLoading,
    refetch: refetchMetaAdsSummary,
  } = useGetAdminClientMetaAdsSummaryQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });

  useEffect(() => {
    if (!metaAdsConnection?.ids.adAccountId) {
      return;
    }

    setMetaAdAccountId((currentValue) =>
      currentValue.trim().length > 0 ? currentValue : metaAdsConnection.ids.adAccountId ?? "",
    );
  }, [metaAdsConnection?.ids.adAccountId]);

  useEffect(() => {
    if (isGoogleAdsEditMode) {
      return;
    }

    if (!googleAdsConfig) {
      setGoogleAdsForm(initialGoogleAdsConfigForm);
      return;
    }

    setGoogleAdsForm({
      customerId: googleAdsConfig.customerId ?? "",
      managerCustomerId: googleAdsConfig.managerCustomerId ?? "",
      descriptiveName: googleAdsConfig.descriptiveName ?? "",
      currencyCode: googleAdsConfig.currencyCode ?? "",
      timeZone: googleAdsConfig.timeZone ?? "",
      connectionStatus: googleAdsConfig.connectionStatus,
    });
  }, [googleAdsConfig, isGoogleAdsEditMode]);

  useEffect(() => {
    setIsGoogleAdsEditMode(false);
    setGoogleAdsFeedback(null);
    setGoogleConnectionFeedback(null);
    setGoogleRefreshToken("");
    setGoogleAccessToken("");
  }, [clientProfileId]);

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz müşteri kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Müşteri özeti yükleniyor...
      </Card>
    );
  }

  if (isError && isNotFoundError(error)) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Müşteri kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(error, "Müşteri özeti yüklenemedi. Lütfen tekrar deneyin.")}
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Müşteri kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  const { client, projects, tasks } = summary;
  const hasGoogleAdsConfigError = Boolean(googleAdsConfigError);
  const hasGoogleAdsConnectionError = Boolean(googleAdsConnectionError);
  const hasGoogleAdsSummaryError = Boolean(googleAdsSummaryError);
  const hasMetaConnectionError = Boolean(metaAdsConnectionError);
  const hasMetaSummaryError = Boolean(metaAdsSummaryError);
  const googleAdsStatusForBadge =
    googleAdsConnection?.connectionStatus ??
    googleAdsConfig?.connectionStatus ??
    googleAdsForm.connectionStatus;

  const handleGoogleAdsEditOpen = () => {
    setGoogleAdsFeedback(null);
    setIsGoogleAdsEditMode(true);
  };

  const handleGoogleAdsEditCancel = () => {
    setGoogleAdsFeedback(null);
    setIsGoogleAdsEditMode(false);
    if (googleAdsConfig) {
      setGoogleAdsForm({
        customerId: googleAdsConfig.customerId ?? "",
        managerCustomerId: googleAdsConfig.managerCustomerId ?? "",
        descriptiveName: googleAdsConfig.descriptiveName ?? "",
        currencyCode: googleAdsConfig.currencyCode ?? "",
        timeZone: googleAdsConfig.timeZone ?? "",
        connectionStatus: googleAdsConfig.connectionStatus,
      });
    } else {
      setGoogleAdsForm(initialGoogleAdsConfigForm);
    }
  };

  const handleGoogleAdsConfigSave = async () => {
    if (!clientProfileId) {
      return;
    }

    setGoogleAdsFeedback(null);

    try {
      await updateGoogleAdsConfig({
        clientId: clientProfileId,
        body: {
          customerId: normalizeOptionalText(googleAdsForm.customerId),
          managerCustomerId: normalizeOptionalText(googleAdsForm.managerCustomerId),
          descriptiveName: normalizeOptionalText(googleAdsForm.descriptiveName),
          currencyCode: normalizeOptionalText(googleAdsForm.currencyCode)?.toUpperCase() ?? null,
          timeZone: normalizeOptionalText(googleAdsForm.timeZone),
          connectionStatus: googleAdsForm.connectionStatus,
        },
      }).unwrap();
      setGoogleAdsFeedback("Google Ads konfigürasyonu güncellendi.");
      setIsGoogleAdsEditMode(false);
      await refetchGoogleAdsConfig();
    } catch (mutationError) {
      setGoogleAdsFeedback(
        extractApiErrorMessage(mutationError, "Google Ads konfigürasyonu güncellenemedi."),
      );
    }
  };

  const handleManualGoogleAdsConnect = async () => {
    if (!clientProfileId) {
      return;
    }

    const trimmedRefreshToken = googleRefreshToken.trim();
    if (!trimmedRefreshToken) {
      setGoogleConnectionFeedback("Manual bağlantı için refresh token gereklidir.");
      return;
    }

    setGoogleConnectionFeedback(null);

    try {
      await connectGoogleAdsManual({
        clientId: clientProfileId,
        body: {
          refreshToken: trimmedRefreshToken,
          ...(googleAccessToken.trim() ? { accessToken: googleAccessToken.trim() } : {}),
          ...(googleAdsForm.customerId.trim() ? { customerId: googleAdsForm.customerId.trim() } : {}),
          ...(googleAdsForm.managerCustomerId.trim()
            ? { managerCustomerId: googleAdsForm.managerCustomerId.trim() }
            : {}),
          ...(googleAdsForm.descriptiveName.trim()
            ? { descriptiveName: googleAdsForm.descriptiveName.trim() }
            : {}),
          ...(googleAdsForm.currencyCode.trim()
            ? { currencyCode: googleAdsForm.currencyCode.trim().toUpperCase() }
            : {}),
          ...(googleAdsForm.timeZone.trim() ? { timeZone: googleAdsForm.timeZone.trim() } : {}),
        },
      }).unwrap();

      setGoogleRefreshToken("");
      setGoogleAccessToken("");
      setGoogleConnectionFeedback("Google Ads bağlantı bilgileri kaydedildi.");
      await Promise.all([
        refetchGoogleAdsConnection(),
        refetchGoogleAdsConfig(),
        refetchGoogleAdsSummary(),
      ]);
    } catch (mutationError) {
      setGoogleConnectionFeedback(
        extractApiErrorMessage(mutationError, "Google Ads bağlantısı kaydedilemedi."),
      );
    }
  };

  const handleGoogleAdsConnectionTest = async () => {
    if (!clientProfileId) {
      return;
    }

    setGoogleConnectionFeedback(null);

    try {
      await testGoogleAdsConnection({
        clientId: clientProfileId,
        body: {
          ...(googleRefreshToken.trim() ? { refreshToken: googleRefreshToken.trim() } : {}),
          ...(googleAccessToken.trim() ? { accessToken: googleAccessToken.trim() } : {}),
          ...(googleAdsForm.customerId.trim() ? { customerId: googleAdsForm.customerId.trim() } : {}),
          ...(googleAdsForm.managerCustomerId.trim()
            ? { managerCustomerId: googleAdsForm.managerCustomerId.trim() }
            : {}),
          requiredScopes: ["https://www.googleapis.com/auth/adwords"],
        },
      }).unwrap();

      setGoogleRefreshToken("");
      setGoogleAccessToken("");
      setGoogleConnectionFeedback("Google Ads bağlantı testi başarılı.");
      await Promise.all([
        refetchGoogleAdsConnection(),
        refetchGoogleAdsConfig(),
        refetchGoogleAdsSummary(),
      ]);
    } catch (mutationError) {
      setGoogleConnectionFeedback(
        extractApiErrorMessage(mutationError, "Google Ads bağlantı testi başarısız."),
      );
    }
  };

  const handleGoogleAdsDisconnect = async () => {
    if (!clientProfileId) {
      return;
    }

    setGoogleConnectionFeedback(null);

    try {
      await disconnectGoogleAds({ clientId: clientProfileId }).unwrap();
      setGoogleRefreshToken("");
      setGoogleAccessToken("");
      setGoogleConnectionFeedback("Google Ads bağlantısı kesildi.");
      await Promise.all([
        refetchGoogleAdsConnection(),
        refetchGoogleAdsConfig(),
        refetchGoogleAdsSummary(),
      ]);
    } catch (mutationError) {
      setGoogleConnectionFeedback(
        extractApiErrorMessage(mutationError, "Google Ads bağlantısı kesilemedi."),
      );
    }
  };

  const handleManualMetaConnect = async () => {
    if (!clientProfileId) {
      return;
    }

    const trimmedToken = metaAccessToken.trim();
    if (!trimmedToken) {
      setMetaConnectionFeedback("Manual bağlantı için access token gereklidir.");
      return;
    }

    setMetaConnectionFeedback(null);

    try {
      await connectMetaAdsManual({
        clientId: clientProfileId,
        body: {
          accessToken: trimmedToken,
          ...(metaAdAccountId.trim() ? { adAccountId: metaAdAccountId.trim() } : {}),
        },
      }).unwrap();
      setMetaAccessToken("");
      setMetaConnectionFeedback("Meta bağlantı bilgileri kaydedildi.");
      await refetchMetaAdsConnection();
    } catch (mutationError) {
      setMetaConnectionFeedback(
        extractApiErrorMessage(mutationError, "Meta bağlantısı kaydedilemedi."),
      );
    }
  };

  const handleMetaConnectionTest = async () => {
    if (!clientProfileId) {
      return;
    }

    setMetaConnectionFeedback(null);

    try {
      await testMetaAdsConnection({
        clientId: clientProfileId,
        body: {
          ...(metaAccessToken.trim() ? { accessToken: metaAccessToken.trim() } : {}),
          ...(metaAdAccountId.trim() ? { adAccountId: metaAdAccountId.trim() } : {}),
          requiredScopes: ["ads_read"],
        },
      }).unwrap();
      setMetaAccessToken("");
      setMetaConnectionFeedback("Meta bağlantı testi başarılı.");
      await refetchMetaAdsConnection();
    } catch (mutationError) {
      setMetaConnectionFeedback(
        extractApiErrorMessage(mutationError, "Meta bağlantı testi başarısız."),
      );
    }
  };

  const handleMetaDisconnect = async () => {
    if (!clientProfileId) {
      return;
    }

    setMetaConnectionFeedback(null);

    try {
      await disconnectMetaAds({ clientId: clientProfileId }).unwrap();
      setMetaAccessToken("");
      setMetaConnectionFeedback("Meta bağlantısı kesildi.");
      await refetchMetaAdsConnection();
    } catch (mutationError) {
      setMetaConnectionFeedback(
        extractApiErrorMessage(mutationError, "Meta bağlantısı kesilemedi."),
      );
    }
  };

  const handleMetaSync = async () => {
    if (!clientProfileId) {
      return;
    }

    setMetaConnectionFeedback(null);

    try {
      await syncMetaAds({ clientId: clientProfileId }).unwrap();
      setMetaConnectionFeedback("Meta Ads senkronizasyonu tamamlandı.");
      await Promise.all([refetchMetaAdsConnection(), refetchMetaAdsSummary()]);
    } catch (mutationError) {
      setMetaConnectionFeedback(
        extractApiErrorMessage(mutationError, "Meta Ads senkronizasyonu çalıştırılamadı."),
      );
    }
  };

  const handleOwnerPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientProfileId) {
      return;
    }

    setOwnerPasswordFeedback(null);
    const passwordError = validatePassword(ownerPassword);
    if (passwordError) {
      setOwnerPasswordFeedback(passwordError);
      return;
    }
    const confirmationError = validatePasswordConfirmation(ownerPassword, ownerPasswordConfirm);
    if (confirmationError) {
      setOwnerPasswordFeedback(confirmationError);
      return;
    }

    try {
      await resetClientOwnerPassword({
        clientId: clientProfileId,
        body: { newPassword: ownerPassword },
      }).unwrap();
      setOwnerPassword("");
      setOwnerPasswordConfirm("");
      setOwnerPasswordFeedback("Müşteri owner parolası başarıyla sıfırlandı.");
    } catch (mutationError) {
      setOwnerPasswordFeedback(
        extractApiErrorMessage(mutationError, "Müşteri owner parolası sıfırlanamadı."),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <BackButton />
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">{client.name}</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">Backend Clients Summary API müşteri özeti</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getClientStatusBadgeClass(client.status)}>
              {getClientStatusLabel(client.status)}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {client.slug}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Building2 className="h-5 w-5 text-[#AAFF01]" />} label="Firma" value={client.name} />
        <InfoCard icon={<ExternalLink className="h-5 w-5 text-[#AAFF01]" />} label="Portal Slug" value={client.slug} mono />
        <InfoCard icon={<Calendar className="h-5 w-5 text-[#AAFF01]" />} label="Oluşturulma" value={formatClientDate(client.createdAt)} />
        <InfoCard icon={<Calendar className="h-5 w-5 text-[#AAFF01]" />} label="Son Güncelleme" value={formatClientDateTime(client.updatedAt)} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Müşteri Profil Özeti</h2>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailRow label="Müşteri kayıt ID" value={client.id} mono />
          <DetailRow label="Portal slug" value={client.slug} mono />
          <DetailRow label="Durum" value={getClientStatusLabel(client.status)} />
          <DetailRow label="Oluşturulma tarihi" value={formatClientDateTime(client.createdAt)} />
          <DetailRow label="Son güncelleme" value={formatClientDateTime(client.updatedAt)} />
        </div>
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Google Ads Konfigürasyonu</h2>
          <div className="flex flex-wrap items-center gap-2">
            {isGoogleAdsConfigFetching && (
              <span className="text-xs text-[#d2ff8a]">Google Ads config güncelleniyor...</span>
            )}
            {isGoogleAdsConnectionFetching && (
              <span className="text-xs text-[#d2ff8a]">Google Ads bağlantı özeti güncelleniyor...</span>
            )}
            {isGoogleAdsSummaryFetching && (
              <span className="text-xs text-[#d2ff8a]">Google Ads performans özeti güncelleniyor...</span>
            )}
            <Badge className={getGoogleAdsConnectionStatusBadgeClass(googleAdsStatusForBadge)}>
              {getGoogleAdsConnectionStatusLabel(googleAdsStatusForBadge)}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                void Promise.all([
                  refetchGoogleAdsConfig(),
                  refetchGoogleAdsConnection(),
                  refetchGoogleAdsSummary(),
                ]);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
            {!isGoogleAdsEditMode ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGoogleAdsEditOpen}
                disabled={isGoogleAdsConfigLoading}
              >
                Config düzenle
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleAdsEditCancel}
                  disabled={isGoogleAdsUpdating}
                >
                  Vazgeç
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                  onClick={() => void handleGoogleAdsConfigSave()}
                  disabled={isGoogleAdsUpdating}
                >
                  {isGoogleAdsUpdating ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </>
            )}
          </div>
        </div>

        {isGoogleAdsConfigLoading ? (
          <p className="text-sm text-[#A0A0A0]">Google Ads konfigürasyonu yükleniyor...</p>
        ) : null}
        {isGoogleAdsConnectionLoading ? (
          <p className="text-sm text-[#A0A0A0]">Google Ads bağlantı özeti yükleniyor...</p>
        ) : null}
        {isGoogleAdsSummaryLoading ? (
          <p className="text-sm text-[#A0A0A0]">Google Ads performans özeti yükleniyor...</p>
        ) : null}
        {hasGoogleAdsConfigError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(googleAdsConfigError, "Google Ads konfigürasyonu alınamadı.")}
          </p>
        ) : null}
        {hasGoogleAdsConnectionError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(googleAdsConnectionError, "Google Ads bağlantı özeti alınamadı.")}
          </p>
        ) : null}
        {hasGoogleAdsSummaryError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(googleAdsSummaryError, "Google Ads performans özeti alınamadı.")}
          </p>
        ) : null}

        {isGoogleAdsEditMode ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-[#A0A0A0]" htmlFor="google-ads-customer-id">
                Customer ID
              </label>
              <Input
                id="google-ads-customer-id"
                value={googleAdsForm.customerId}
                onChange={(event) =>
                  setGoogleAdsForm((prev) => ({ ...prev, customerId: event.target.value }))
                }
                className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
                placeholder="1234567890"
                disabled={isGoogleAdsUpdating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A0A0A0]" htmlFor="google-ads-manager-customer-id">
                Manager Customer ID
              </label>
              <Input
                id="google-ads-manager-customer-id"
                value={googleAdsForm.managerCustomerId}
                onChange={(event) =>
                  setGoogleAdsForm((prev) => ({ ...prev, managerCustomerId: event.target.value }))
                }
                className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
                placeholder="0987654321"
                disabled={isGoogleAdsUpdating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A0A0A0]" htmlFor="google-ads-descriptive-name">
                Account Name
              </label>
              <Input
                id="google-ads-descriptive-name"
                value={googleAdsForm.descriptiveName}
                onChange={(event) =>
                  setGoogleAdsForm((prev) => ({ ...prev, descriptiveName: event.target.value }))
                }
                className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
                placeholder="Acme Google Ads"
                disabled={isGoogleAdsUpdating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A0A0A0]" htmlFor="google-ads-time-zone">
                Timezone
              </label>
              <Input
                id="google-ads-time-zone"
                value={googleAdsForm.timeZone}
                onChange={(event) =>
                  setGoogleAdsForm((prev) => ({ ...prev, timeZone: event.target.value }))
                }
                className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
                placeholder="Europe/Istanbul"
                disabled={isGoogleAdsUpdating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A0A0A0]" htmlFor="google-ads-currency-code">
                Currency
              </label>
              <Input
                id="google-ads-currency-code"
                value={googleAdsForm.currencyCode}
                onChange={(event) =>
                  setGoogleAdsForm((prev) => ({ ...prev, currencyCode: event.target.value }))
                }
                className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
                placeholder="TRY"
                disabled={isGoogleAdsUpdating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A0A0A0]" htmlFor="google-ads-connection-status">
                Connection Status
              </label>
              <select
                id="google-ads-connection-status"
                aria-label="Google Ads Connection Status"
                value={googleAdsForm.connectionStatus}
                onChange={(event) =>
                  setGoogleAdsForm((prev) => ({
                    ...prev,
                    connectionStatus: event.target.value as GoogleAdsConnectionStatus,
                  }))
                }
                disabled={isGoogleAdsUpdating}
                className="h-10 w-full rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.2] focus:border-[#AAFF01]/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {GOOGLE_ADS_CONNECTION_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {getGoogleAdsConnectionStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow label="Connection Status" value={getGoogleAdsConnectionStatusLabel(googleAdsStatusForBadge)} />
            <DetailRow label="Customer ID" value={googleAdsConfig?.customerId ?? "—"} mono />
            <DetailRow
              label="Manager Customer ID"
              value={googleAdsConfig?.managerCustomerId ?? "—"}
              mono
            />
            <DetailRow label="Currency" value={googleAdsConfig?.currencyCode ?? "—"} />
            <DetailRow label="Timezone" value={googleAdsConfig?.timeZone ?? "—"} />
            <DetailRow label="Last Sync" value={formatClientDateTime(googleAdsConfig?.lastSyncAt ?? null)} />
            <DetailRow label="Sync Error" value={googleAdsConfig?.syncError ?? "—"} />
            <DetailRow label="Account Name" value={googleAdsConfig?.descriptiveName ?? "—"} />
          </div>
        )}

        {googleAdsConnection ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow
              label="Aktif Purchased Service"
              value={googleAdsConnection.hasActiveService ? "Evet" : "Hayır"}
            />
            <DetailRow
              label="Token Durumu"
              value={googleAdsConnection.credential.hasRefreshToken ? "Kayıtlı" : "Kayıtlı değil"}
            />
            <DetailRow
              label="Son Token Güncellemesi"
              value={formatClientDateTime(googleAdsConnection.credential.tokenLastUpdatedAt)}
            />
            <DetailRow
              label="Token Bitiş Zamanı"
              value={formatClientDateTime(googleAdsConnection.credential.tokenExpiresAt)}
            />
            <DetailRow
              label="Granted Scopes"
              value={googleAdsConnection.credential.grantedScopes.join(", ") || "—"}
            />
            <DetailRow label="Sync Hata Özeti" value={googleAdsConnection.syncError ?? "—"} />
          </div>
        ) : null}

        {googleAdsSummary ? (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-4">
            <h3 className="mb-3 text-sm font-medium text-white">Google Ads Performans Özeti</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailRow label="Toplam Harcama" value={formatCurrencyTry(googleAdsSummary.cost)} />
              <DetailRow label="Impressions" value={formatInteger(googleAdsSummary.impressions)} />
              <DetailRow label="Clicks" value={formatInteger(googleAdsSummary.clicks)} />
              <DetailRow label="Conversions" value={googleAdsSummary.conversions.toFixed(2)} />
              <DetailRow label="CTR" value={`%${googleAdsSummary.ctr.toFixed(2)}`} />
              <DetailRow label="Average CPC" value={formatCurrencyTry(googleAdsSummary.averageCpc)} />
              <DetailRow
                label="Cost / Conversion"
                value={
                  googleAdsSummary.costPerConversion === null
                    ? "—"
                    : formatCurrencyTry(googleAdsSummary.costPerConversion)
                }
              />
              <DetailRow
                label="Conversion Value"
                value={
                  googleAdsSummary.conversionValue === null
                    ? "—"
                    : formatCurrencyTry(googleAdsSummary.conversionValue)
                }
              />
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            type="password"
            value={googleRefreshToken}
            onChange={(event) => setGoogleRefreshToken(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Yeni refresh token (write-only)"
            autoComplete="off"
          />
          <Input
            type="password"
            value={googleAccessToken}
            onChange={(event) => setGoogleAccessToken(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Opsiyonel access token (write-only)"
            autoComplete="off"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-2"
            onClick={handleManualGoogleAdsConnect}
            disabled={isGoogleAdsConnecting || isGoogleAdsTesting || isGoogleAdsDisconnecting}
          >
            <PlugZap className="h-4 w-4" />
            {isGoogleAdsConnecting ? "Kaydediliyor..." : "Token Güncelle / Manual Connect"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleGoogleAdsConnectionTest}
            disabled={isGoogleAdsConnecting || isGoogleAdsTesting || isGoogleAdsDisconnecting}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isGoogleAdsTesting ? "Test Ediliyor..." : "Google Ads Bağlantısını Test Et"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-500/30 text-red-200 hover:bg-red-500/10"
            onClick={handleGoogleAdsDisconnect}
            disabled={isGoogleAdsConnecting || isGoogleAdsTesting || isGoogleAdsDisconnecting}
          >
            <Link2Off className="h-4 w-4" />
            {isGoogleAdsDisconnecting ? "Kesiliyor..." : "Bağlantıyı Kes"}
          </Button>
        </div>

        {googleAdsFeedback ? (
          <p className="mt-3 text-sm text-[#d8ff8f]">{googleAdsFeedback}</p>
        ) : null}
        {googleConnectionFeedback ? (
          <p className="mt-2 text-sm text-[#d8ff8f]">{googleConnectionFeedback}</p>
        ) : null}
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Meta Ads Bağlantı Yönetimi</h2>
          <div className="flex items-center gap-2">
            {isMetaAdsConnectionFetching && (
              <span className="text-xs text-[#d2ff8a]">Bağlantı güncelleniyor...</span>
            )}
            {isMetaAdsSummaryFetching && (
              <span className="text-xs text-[#d2ff8a]">Rapor özeti güncelleniyor...</span>
            )}
            {metaAdsConnection ? (
              <Badge className={getMetaAdsConnectionStatusBadgeClass(metaAdsConnection.connectionStatus)}>
                {getMetaAdsConnectionStatusLabel(metaAdsConnection.connectionStatus)}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                void Promise.all([refetchMetaAdsConnection(), refetchMetaAdsSummary()]);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>

        {isMetaAdsConnectionLoading ? (
          <p className="text-sm text-[#A0A0A0]">Meta bağlantı özeti yükleniyor...</p>
        ) : null}
        {hasMetaConnectionError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(metaAdsConnectionError, "Meta bağlantı özeti alınamadı.")}
          </p>
        ) : null}
        {isMetaAdsSummaryLoading ? (
          <p className="mt-2 text-sm text-[#A0A0A0]">Meta Ads performans özeti yükleniyor...</p>
        ) : null}
        {hasMetaSummaryError ? (
          <p className="mt-2 text-sm text-red-300">
            {extractApiErrorMessage(metaAdsSummaryError, "Meta Ads performans özeti alınamadı.")}
          </p>
        ) : null}

        {metaAdsConnection ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow label="Meta Ad Account ID" value={metaAdsConnection.ids.adAccountId ?? "—"} mono />
            <DetailRow
              label="Aktif Purchased Service"
              value={metaAdsConnection.hasActiveService ? "Evet" : "Hayır"}
            />
            <DetailRow
              label="Token Durumu"
              value={metaAdsConnection.credential.hasToken ? "Kayıtlı" : "Kayıtlı değil"}
            />
            <DetailRow
              label="Son Token Güncellemesi"
              value={formatClientDateTime(metaAdsConnection.credential.tokenLastUpdatedAt)}
            />
            <DetailRow
              label="Son Senkronizasyon"
              value={formatClientDateTime(metaAdsConnection.lastSyncAt)}
            />
            <DetailRow label="Sync Hata Özeti" value={metaAdsConnection.syncError ?? "—"} />
          </div>
        ) : null}

        {metaAdsSummary ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <DetailRow label="Toplam Harcama" value={`${metaAdsSummary.spend.toFixed(2)} TRY`} />
            <DetailRow label="Toplam Gösterim" value={String(metaAdsSummary.impressions)} />
            <DetailRow label="Toplam Tıklama" value={String(metaAdsSummary.clicks)} />
            <DetailRow label="CTR" value={`${metaAdsSummary.ctr.toFixed(2)}%`} />
            <DetailRow label="CPC" value={`${metaAdsSummary.cpc.toFixed(2)} TRY`} />
            <DetailRow
              label="ROAS"
              value={
                typeof metaAdsSummary.roas === "number" ? `${metaAdsSummary.roas.toFixed(2)}x` : "—"
              }
            />
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            value={metaAdAccountId}
            onChange={(event) => setMetaAdAccountId(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Ad Account ID (örn: act_123456789)"
          />
          <Input
            type="password"
            value={metaAccessToken}
            onChange={(event) => setMetaAccessToken(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Yeni access token (write-only)"
            autoComplete="off"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-2"
            onClick={handleManualMetaConnect}
            disabled={isMetaConnecting || isMetaTesting || isMetaSyncing || isMetaDisconnecting}
          >
            <PlugZap className="h-4 w-4" />
            {isMetaConnecting ? "Kaydediliyor..." : "Token Güncelle / Manual Connect"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleMetaConnectionTest}
            disabled={isMetaConnecting || isMetaTesting || isMetaSyncing || isMetaDisconnecting}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isMetaTesting ? "Test Ediliyor..." : "Meta Bağlantısını Test Et"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleMetaSync}
            disabled={isMetaConnecting || isMetaTesting || isMetaSyncing || isMetaDisconnecting}
          >
            <RefreshCw className="h-4 w-4" />
            {isMetaSyncing ? "Sync Çalışıyor..." : "Manual Sync"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-500/30 text-red-200 hover:bg-red-500/10"
            onClick={handleMetaDisconnect}
            disabled={isMetaConnecting || isMetaTesting || isMetaSyncing || isMetaDisconnecting}
          >
            <Link2Off className="h-4 w-4" />
            {isMetaDisconnecting ? "Kesiliyor..." : "Bağlantıyı Kes"}
          </Button>
        </div>

        {metaConnectionFeedback ? (
          <p className="mt-3 text-sm text-[#d8ff8f]">{metaConnectionFeedback}</p>
        ) : null}
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <h2 className="mb-2 text-lg font-semibold text-white">Müşteri Portal Şifre Sıfırlama</h2>
        <p className="mb-4 text-sm text-[#A0A0A0]">
          Bu müşterinin portal owner hesabı için yeni geçici parola belirleyin.
        </p>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleOwnerPasswordReset}>
          <Input
            type="password"
            value={ownerPassword}
            onChange={(event) => setOwnerPassword(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Yeni parola"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
          <Input
            type="password"
            value={ownerPasswordConfirm}
            onChange={(event) => setOwnerPasswordConfirm(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Parola tekrarı"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
          <Button type="submit" disabled={isResettingOwnerPassword}>
            {isResettingOwnerPassword ? "Sıfırlanıyor..." : "Parolayı Sıfırla"}
          </Button>
        </form>
        <p className="mt-3 text-xs text-[#A0A0A0]">
          Parola en az 8 karakter olmalı, en az bir harf ve bir rakam içermelidir.
        </p>
        {ownerPasswordFeedback ? (
          <p className="mt-2 text-sm text-[#d8ff8f]">{ownerPasswordFeedback}</p>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CountSection
          icon={<FolderKanban className="h-5 w-5 text-[#AAFF01]" />}
          title="Proje Sayıları"
          items={[
            ["Toplam Proje", projects.total],
            ["Planlandı", projects.planned],
            ["Devam Eden", projects.inProgress],
            ["İncelemede", projects.review],
            ["Tamamlandı", projects.completed],
            ["Beklemede", projects.onHold],
          ]}
        />
        <CountSection
          icon={<ListChecks className="h-5 w-5 text-[#AAFF01]" />}
          title="Görev Sayıları"
          items={[
            ["Toplam Görev", tasks.total],
            ["Yapılacak", tasks.todo],
            ["Devam Eden", tasks.inProgress],
            ["İncelemede", tasks.review],
            ["Tamamlandı", tasks.done],
            ["Bloke", tasks.blocked],
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentProjectsSection projects={projects.recent} />
        <RecentTasksSection tasks={tasks.recent} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Atanan Çalışanlar</h2>
        {isAssignmentsLoading ? <p className="text-sm text-[#A0A0A0]">Atamalar yükleniyor...</p> : null}
        {isAssignmentsError ? (
          <p className="text-sm text-[#A0A0A0]">Atamalar görüntülenemedi.</p>
        ) : null}
        {!isAssignmentsLoading && !isAssignmentsError && assignments.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Bu müşteriye aktif çalışan ataması bulunmuyor.</p>
        ) : null}
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <div>
                <p className="text-sm text-white">
                  {assignment.employee.displayName?.trim() || assignment.employee.email}
                </p>
                <p className="text-xs text-[#A0A0A0]">{assignment.employee.email}</p>
              </div>
              <Badge variant="outline">{assignment.scope}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BackButton() {
  return (
    <Link to="/musteriler">
      <Button variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Müşterilere Dön
      </Button>
    </Link>
  );
}

function InfoCard({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-3 text-sm text-[#A0A0A0]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm font-semibold text-white ${mono ? "break-all font-mono" : "break-words"}`}>
        {value}
      </p>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
      <p className="mb-1 text-xs text-[#A0A0A0]">{label}</p>
      <p className={`text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>{value}</p>
    </div>
  );
}

function CountSection({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: Array<[string, number]>;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="mb-1 text-xs text-[#A0A0A0]">{label}</p>
            <p className="text-2xl font-semibold text-white">{value.toLocaleString("tr-TR")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentProjectsSection({ projects }: { projects: ClientSummaryRecentProject[] }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <SectionHeader
        icon={<FolderKanban className="h-5 w-5 text-[#AAFF01]" />}
        title="Son Projeler"
      />
      {projects.length === 0 ? (
        <EmptyState>Bu müşteriye bağlı son proje bulunmuyor.</EmptyState>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium text-white">{project.name}</p>
                  <p className="mt-1 text-xs text-[#A0A0A0]">
                    Deadline: {formatClientDate(project.dueDate)} • Güncelleme: {formatClientDate(project.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getClientProjectStatusBadgeClass(project.status)}>
                    {getClientProjectStatusLabel(project.status)}
                  </Badge>
                  <Badge className={getClientPriorityBadgeClass(project.priority)}>
                    {getClientPriorityLabel(project.priority)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/projeler/${project.id}`}>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Projeyi Aç
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RecentTasksSection({ tasks }: { tasks: ClientSummaryRecentTask[] }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <SectionHeader
        icon={<ListChecks className="h-5 w-5 text-[#AAFF01]" />}
        title="Son Görevler"
      />
      {tasks.length === 0 ? (
        <EmptyState>Bu müşteriye bağlı son görev bulunmuyor.</EmptyState>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-[#A0A0A0]">
                    Deadline: {formatClientDate(task.dueDate)} • Güncelleme: {formatClientDate(task.updatedAt)}
                  </p>
                  {task.projectId && (
                    <Link
                      to={`/projeler/${task.projectId}`}
                      className="mt-2 inline-flex text-xs text-[#d2ff8a] hover:underline"
                    >
                      Projeye Git
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getClientTaskStatusBadgeClass(task.status)}>
                    {getClientTaskStatusLabel(task.status)}
                  </Badge>
                  <Badge className={getClientPriorityBadgeClass(task.priority)}>
                    {getClientPriorityLabel(task.priority)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/gorevler/${task.id}`}>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Görevi Aç
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-[#A0A0A0]">
      {children}
    </div>
  );
}

function normalizeOptionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function formatCurrencyTry(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}
