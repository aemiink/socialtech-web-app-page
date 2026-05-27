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
  ShoppingCart,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useGetAdminAssignmentsQuery } from "../features/adminAssignments/adminAssignmentsApi";
import {
  useConnectAdminClientTikTokAdsManualMutation,
  useDisconnectAdminClientTikTokAdsMutation,
  useGetAdminClientTikTokAdsConnectionQuery,
  useGetAdminClientTikTokAdsSummaryQuery,
  useSyncAdminClientTikTokAdsMutation,
  useTestAdminClientTikTokAdsConnectionMutation,
} from "../features/tiktokAds/tiktokAdsApi";
import {
  getTikTokAdsConnectionStatusBadgeClass,
  getTikTokAdsConnectionStatusLabel,
} from "../features/tiktokAds/tiktokAdsTypes";
import {
  useConnectAdminClientMetaAdsManualMutation,
  useDisconnectAdminClientMetaAdsMutation,
  useGetAdminClientAmazonAdsConnectionQuery,
  useGetAdminClientMetaAdsConnectionQuery,
  useGetAdminClientMetaAdsSummaryQuery,
  useGetClientSummaryQuery,
  useResetClientOwnerPasswordMutation,
  useSyncAdminClientMetaAdsMutation,
  useTestAdminClientMetaAdsConnectionMutation,
  useUpdateAdminClientAmazonAdsConfigMutation,
} from "../features/clients/clientsApi";
import type {
  AmazonAdsRegion,
  ClientSummaryRecentProject,
  ClientSummaryRecentTask,
  UpdateAdminClientAmazonAdsConfigRequest,
} from "../features/clients/clientsTypes";
import { validatePassword, validatePasswordConfirmation } from "../features/adminUsers/adminUsersUtils";
import {
  extractApiErrorMessage,
  formatClientDate,
  formatClientDateTime,
  getAmazonAdsConnectionStatusBadgeClass,
  getAmazonAdsConnectionStatusLabel,
  getClientPriorityBadgeClass,
  getClientPriorityLabel,
  getClientProjectStatusBadgeClass,
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
  const [tikTokAccessToken, setTikTokAccessToken] = useState("");
  const [tikTokAdvertiserId, setTikTokAdvertiserId] = useState("");
  const [tikTokConnectionFeedback, setTikTokConnectionFeedback] = useState<string | null>(null);
  const [amazonProfileId, setAmazonProfileId] = useState("");
  const [amazonAdvertiserAccountId, setAmazonAdvertiserAccountId] = useState("");
  const [amazonMarketplaceId, setAmazonMarketplaceId] = useState("");
  const [amazonRegion, setAmazonRegion] = useState<"" | AmazonAdsRegion>("");
  const [amazonCountryCode, setAmazonCountryCode] = useState("");
  const [amazonCurrencyCode, setAmazonCurrencyCode] = useState("");
  const [amazonTimezone, setAmazonTimezone] = useState("");
  const [amazonAccountType, setAmazonAccountType] = useState("");
  const [amazonAccountName, setAmazonAccountName] = useState("");
  const [amazonValidPaymentMethod, setAmazonValidPaymentMethod] =
    useState<"" | "true" | "false">("");
  const [amazonConnectionFeedback, setAmazonConnectionFeedback] = useState<string | null>(null);
  const [resetClientOwnerPassword, { isLoading: isResettingOwnerPassword }] =
    useResetClientOwnerPasswordMutation();
  const [connectMetaAdsManual, { isLoading: isMetaConnecting }] =
    useConnectAdminClientMetaAdsManualMutation();
  const [testMetaAdsConnection, { isLoading: isMetaTesting }] =
    useTestAdminClientMetaAdsConnectionMutation();
  const [syncMetaAds, { isLoading: isMetaSyncing }] = useSyncAdminClientMetaAdsMutation();
  const [disconnectMetaAds, { isLoading: isMetaDisconnecting }] =
    useDisconnectAdminClientMetaAdsMutation();
  const [connectTikTokAdsManual, { isLoading: isTikTokConnecting }] =
    useConnectAdminClientTikTokAdsManualMutation();
  const [testTikTokAdsConnection, { isLoading: isTikTokTesting }] =
    useTestAdminClientTikTokAdsConnectionMutation();
  const [syncTikTokAds, { isLoading: isTikTokSyncing }] = useSyncAdminClientTikTokAdsMutation();
  const [disconnectTikTokAds, { isLoading: isTikTokDisconnecting }] =
    useDisconnectAdminClientTikTokAdsMutation();
  const [updateAmazonAdsConfig, { isLoading: isAmazonConfigSaving }] =
    useUpdateAdminClientAmazonAdsConfigMutation();

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
  const {
    data: tikTokAdsConnection,
    error: tikTokAdsConnectionError,
    isFetching: isTikTokAdsConnectionFetching,
    isLoading: isTikTokAdsConnectionLoading,
    refetch: refetchTikTokAdsConnection,
  } = useGetAdminClientTikTokAdsConnectionQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });
  const {
    data: tikTokAdsSummary,
    error: tikTokAdsSummaryError,
    isFetching: isTikTokAdsSummaryFetching,
    isLoading: isTikTokAdsSummaryLoading,
    refetch: refetchTikTokAdsSummary,
  } = useGetAdminClientTikTokAdsSummaryQuery(
    { clientId: clientProfileId ?? "" },
    { skip: !isValidId },
  );
  const {
    data: amazonAdsConnection,
    error: amazonAdsConnectionError,
    isFetching: isAmazonAdsConnectionFetching,
    isLoading: isAmazonAdsConnectionLoading,
    refetch: refetchAmazonAdsConnection,
  } = useGetAdminClientAmazonAdsConnectionQuery(clientProfileId ?? "", {
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
    if (!tikTokAdsConnection?.ids.advertiserId) {
      return;
    }

    setTikTokAdvertiserId((currentValue) =>
      currentValue.trim().length > 0 ? currentValue : tikTokAdsConnection.ids.advertiserId ?? "",
    );
  }, [tikTokAdsConnection?.ids.advertiserId]);

  useEffect(() => {
    if (!amazonAdsConnection) {
      return;
    }

    setAmazonProfileId(amazonAdsConnection.ids.profileId ?? "");
    setAmazonAdvertiserAccountId(amazonAdsConnection.ids.advertiserAccountId ?? "");
    setAmazonMarketplaceId(amazonAdsConnection.ids.marketplaceId ?? "");
    setAmazonRegion(amazonAdsConnection.settings.region ?? "");
    setAmazonCountryCode(amazonAdsConnection.settings.countryCode ?? "");
    setAmazonCurrencyCode(amazonAdsConnection.settings.currencyCode ?? "");
    setAmazonTimezone(amazonAdsConnection.settings.timezone ?? "");
    setAmazonAccountType(amazonAdsConnection.account.accountType ?? "");
    setAmazonAccountName(amazonAdsConnection.account.accountName ?? "");
    setAmazonValidPaymentMethod(
      typeof amazonAdsConnection.account.validPaymentMethod === "boolean"
        ? amazonAdsConnection.account.validPaymentMethod
          ? "true"
          : "false"
        : "",
    );
  }, [amazonAdsConnection]);

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
  const hasMetaConnectionError = Boolean(metaAdsConnectionError);
  const hasMetaSummaryError = Boolean(metaAdsSummaryError);
  const hasTikTokConnectionError = Boolean(tikTokAdsConnectionError);
  const hasTikTokSummaryError = Boolean(tikTokAdsSummaryError);
  const hasAmazonConnectionError = Boolean(amazonAdsConnectionError);
  const tikTokAdsCurrency = tikTokAdsConnection?.settings.currency ?? "TRY";

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

  const handleManualTikTokConnect = async () => {
    if (!clientProfileId) {
      return;
    }

    const trimmedToken = tikTokAccessToken.trim();
    const trimmedAdvertiserId = tikTokAdvertiserId.trim();
    if (!trimmedToken || !trimmedAdvertiserId) {
      setTikTokConnectionFeedback("Manual bağlantı için access token ve advertiser ID gereklidir.");
      return;
    }

    setTikTokConnectionFeedback(null);

    try {
      await connectTikTokAdsManual({
        clientId: clientProfileId,
        data: {
          accessToken: trimmedToken,
          advertiserId: trimmedAdvertiserId,
        },
      }).unwrap();
      setTikTokAccessToken("");
      setTikTokConnectionFeedback("TikTok Ads bağlantı bilgileri kaydedildi.");
      await Promise.all([refetchTikTokAdsConnection(), refetchTikTokAdsSummary()]);
    } catch (mutationError) {
      setTikTokConnectionFeedback(
        extractApiErrorMessage(mutationError, "TikTok Ads bağlantısı kaydedilemedi."),
      );
    }
  };

  const handleTikTokConnectionTest = async () => {
    if (!clientProfileId) {
      return;
    }

    setTikTokConnectionFeedback(null);

    try {
      await testTikTokAdsConnection({
        clientId: clientProfileId,
        data: {
          ...(tikTokAccessToken.trim() ? { accessToken: tikTokAccessToken.trim() } : {}),
          ...(tikTokAdvertiserId.trim() ? { advertiserId: tikTokAdvertiserId.trim() } : {}),
        },
      }).unwrap();
      setTikTokAccessToken("");
      setTikTokConnectionFeedback("TikTok Ads bağlantı testi başarılı.");
      await Promise.all([refetchTikTokAdsConnection(), refetchTikTokAdsSummary()]);
    } catch (mutationError) {
      setTikTokConnectionFeedback(
        extractApiErrorMessage(mutationError, "TikTok Ads bağlantı testi başarısız."),
      );
    }
  };

  const handleTikTokDisconnect = async () => {
    if (!clientProfileId) {
      return;
    }

    setTikTokConnectionFeedback(null);

    try {
      await disconnectTikTokAds({ clientId: clientProfileId }).unwrap();
      setTikTokAccessToken("");
      setTikTokConnectionFeedback("TikTok Ads bağlantısı kesildi.");
      await Promise.all([refetchTikTokAdsConnection(), refetchTikTokAdsSummary()]);
    } catch (mutationError) {
      setTikTokConnectionFeedback(
        extractApiErrorMessage(mutationError, "TikTok Ads bağlantısı kesilemedi."),
      );
    }
  };

  const handleTikTokSync = async () => {
    if (!clientProfileId) {
      return;
    }

    setTikTokConnectionFeedback(null);

    try {
      await syncTikTokAds({ clientId: clientProfileId }).unwrap();
      setTikTokConnectionFeedback("TikTok Ads senkronizasyonu tamamlandı.");
      await Promise.all([refetchTikTokAdsConnection(), refetchTikTokAdsSummary()]);
    } catch (mutationError) {
      setTikTokConnectionFeedback(
        extractApiErrorMessage(mutationError, "TikTok Ads senkronizasyonu çalıştırılamadı."),
      );
    }
  };

  const handleAmazonConfigSave = async () => {
    if (!clientProfileId) {
      return;
    }

    const payload = buildAmazonAdsConfigPayload({
      profileId: amazonProfileId,
      advertiserAccountId: amazonAdvertiserAccountId,
      marketplaceId: amazonMarketplaceId,
      region: amazonRegion,
      countryCode: amazonCountryCode,
      currencyCode: amazonCurrencyCode,
      timezone: amazonTimezone,
      accountType: amazonAccountType,
      accountName: amazonAccountName,
      validPaymentMethod: amazonValidPaymentMethod,
    });

    if (!payload) {
      setAmazonConnectionFeedback("Amazon Ads yapılandırması için en az bir alan girin.");
      return;
    }

    setAmazonConnectionFeedback(null);

    try {
      await updateAmazonAdsConfig({
        clientId: clientProfileId,
        body: payload,
      }).unwrap();
      setAmazonConnectionFeedback("Amazon Ads yapılandırması kaydedildi.");
      await refetchAmazonAdsConnection();
    } catch (mutationError) {
      setAmazonConnectionFeedback(
        extractApiErrorMessage(mutationError, "Amazon Ads yapılandırması kaydedilemedi."),
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">TikTok Ads Yapılandırması</h2>
          <div className="flex items-center gap-2">
            {isTikTokAdsConnectionFetching ? (
              <span className="text-xs text-[#d2ff8a]">Bağlantı güncelleniyor...</span>
            ) : null}
            {isTikTokAdsSummaryFetching ? (
              <span className="text-xs text-[#d2ff8a]">Rapor özeti güncelleniyor...</span>
            ) : null}
            {tikTokAdsConnection ? (
              <Badge className={getTikTokAdsConnectionStatusBadgeClass(tikTokAdsConnection.connectionStatus)}>
                {getTikTokAdsConnectionStatusLabel(tikTokAdsConnection.connectionStatus)}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                void Promise.all([refetchTikTokAdsConnection(), refetchTikTokAdsSummary()]);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>

        {isTikTokAdsConnectionLoading ? (
          <p className="text-sm text-[#A0A0A0]">TikTok Ads bağlantı özeti yükleniyor...</p>
        ) : null}
        {hasTikTokConnectionError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(tikTokAdsConnectionError, "TikTok Ads bağlantı özeti alınamadı.")}
          </p>
        ) : null}
        {isTikTokAdsSummaryLoading ? (
          <p className="mt-2 text-sm text-[#A0A0A0]">TikTok Ads performans özeti yükleniyor...</p>
        ) : null}
        {hasTikTokSummaryError ? (
          <p className="mt-2 text-sm text-red-300">
            {extractApiErrorMessage(tikTokAdsSummaryError, "TikTok Ads performans özeti alınamadı.")}
          </p>
        ) : null}

        {tikTokAdsConnection ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow label="Advertiser ID" value={tikTokAdsConnection.ids.advertiserId ?? "—"} mono />
            <DetailRow
              label="Aktif Purchased Service"
              value={tikTokAdsConnection.hasActiveService ? "Evet" : "Hayır"}
            />
            <DetailRow
              label="Token Durumu"
              value={tikTokAdsConnection.credential.hasToken ? "Kayıtlı" : "Kayıtlı değil"}
            />
            <DetailRow
              label="Son Token Güncellemesi"
              value={formatClientDateTime(tikTokAdsConnection.credential.tokenLastUpdatedAt)}
            />
            <DetailRow
              label="Token Bitiş Tarihi"
              value={formatClientDateTime(tikTokAdsConnection.credential.tokenExpiresAt)}
            />
            <DetailRow label="Advertiser Adı" value={tikTokAdsConnection.account.advertiserName ?? "—"} />
            <DetailRow label="Business Center ID" value={tikTokAdsConnection.ids.businessCenterId ?? "—"} />
            <DetailRow label="Pixel ID" value={tikTokAdsConnection.ids.pixelId ?? "—"} mono />
            <DetailRow label="Para Birimi" value={tikTokAdsConnection.settings.currency ?? "—"} />
            <DetailRow label="Saat Dilimi" value={tikTokAdsConnection.settings.timezone ?? "—"} />
            <DetailRow label="Son Test/Sync" value={formatClientDateTime(tikTokAdsConnection.lastSyncAt)} />
            <DetailRow label="Hata Özeti" value={tikTokAdsConnection.syncError ?? "—"} />
          </div>

        ) : null}

        {tikTokAdsSummary ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <DetailRow label="Toplam Harcama" value={`${tikTokAdsSummary.spend.toFixed(2)} ${tikTokAdsCurrency}`} />
            <DetailRow label="Toplam Gösterim" value={String(tikTokAdsSummary.impressions)} />
            <DetailRow label="Toplam Tıklama" value={String(tikTokAdsSummary.clicks)} />
            <DetailRow label="CTR" value={`${tikTokAdsSummary.ctr.toFixed(2)}%`} />
            <DetailRow label="CPC" value={`${tikTokAdsSummary.cpc.toFixed(2)} ${tikTokAdsCurrency}`} />
            <DetailRow label="Video İzlenme" value={String(tikTokAdsSummary.videoViews)} />
            <DetailRow label="6sn İzlenme" value={String(tikTokAdsSummary.videoViews6s)} />
            <DetailRow label="VTR" value={`${tikTokAdsSummary.vtr.toFixed(2)}%`} />
            <DetailRow label="Dönüşüm" value={String(tikTokAdsSummary.conversions)} />
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            value={tikTokAdvertiserId}
            onChange={(event) => setTikTokAdvertiserId(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Advertiser ID (örn: 1234567890)"
          />
          <Input
            type="password"
            value={tikTokAccessToken}
            onChange={(event) => setTikTokAccessToken(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Yeni TikTok access token (write-only)"
            autoComplete="off"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-2"
            onClick={handleManualTikTokConnect}
            disabled={isTikTokConnecting || isTikTokTesting || isTikTokSyncing || isTikTokDisconnecting}
          >
            <PlugZap className="h-4 w-4" />
            {isTikTokConnecting ? "Kaydediliyor..." : "Token Güncelle / Manual Connect"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleTikTokConnectionTest}
            disabled={isTikTokConnecting || isTikTokTesting || isTikTokSyncing || isTikTokDisconnecting}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isTikTokTesting ? "Test Ediliyor..." : "TikTok Bağlantısını Test Et"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleTikTokSync}
            disabled={isTikTokConnecting || isTikTokTesting || isTikTokSyncing || isTikTokDisconnecting}
          >
            <RefreshCw className="h-4 w-4" />
            {isTikTokSyncing ? "Sync Çalışıyor..." : "Manual Sync"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-500/30 text-red-200 hover:bg-red-500/10"
            onClick={handleTikTokDisconnect}
            disabled={isTikTokConnecting || isTikTokTesting || isTikTokSyncing || isTikTokDisconnecting}
          >
            <Link2Off className="h-4 w-4" />
            {isTikTokDisconnecting ? "Kesiliyor..." : "Bağlantıyı Kes"}
          </Button>
        </div>

        {tikTokConnectionFeedback ? (
          <p className="mt-3 text-sm text-[#d8ff8f]">{tikTokConnectionFeedback}</p>
        ) : null}
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Amazon Ads Yapılandırması</h2>
          <div className="flex items-center gap-2">
            {isAmazonAdsConnectionFetching ? (
              <span className="text-xs text-[#d2ff8a]">Bağlantı güncelleniyor...</span>
            ) : null}
            {amazonAdsConnection ? (
              <Badge
                className={getAmazonAdsConnectionStatusBadgeClass(
                  amazonAdsConnection.connectionStatus,
                )}
              >
                {getAmazonAdsConnectionStatusLabel(amazonAdsConnection.connectionStatus)}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                void refetchAmazonAdsConnection();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>

        {isAmazonAdsConnectionLoading ? (
          <p className="text-sm text-[#A0A0A0]">Amazon Ads bağlantı özeti yükleniyor...</p>
        ) : null}
        {hasAmazonConnectionError ? (
          <p className="text-sm text-red-300">
            {extractApiErrorMessage(
              amazonAdsConnectionError,
              "Amazon Ads bağlantı özeti alınamadı.",
            )}
          </p>
        ) : null}

        {amazonAdsConnection ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow label="Profile ID" value={amazonAdsConnection.ids.profileId ?? "—"} mono />
            <DetailRow
              label="Advertiser Account ID"
              value={amazonAdsConnection.ids.advertiserAccountId ?? "—"}
              mono
            />
            <DetailRow
              label="Marketplace ID"
              value={amazonAdsConnection.ids.marketplaceId ?? "—"}
              mono
            />
            <DetailRow
              label="Aktif Purchased Service"
              value={amazonAdsConnection.hasActiveService ? "Evet" : "Hayır"}
            />
            <DetailRow
              label="Token Durumu"
              value={
                amazonAdsConnection.credential.hasAccessToken ||
                amazonAdsConnection.credential.hasRefreshToken
                  ? "Kayıtlı"
                  : "Kayıtlı değil"
              }
            />
            <DetailRow
              label="Son Token Güncellemesi"
              value={formatClientDateTime(amazonAdsConnection.credential.tokenLastUpdatedAt)}
            />
            <DetailRow label="Region" value={amazonAdsConnection.settings.region ?? "—"} />
            <DetailRow
              label="Ülke / Para Birimi"
              value={`${amazonAdsConnection.settings.countryCode ?? "—"} / ${
                amazonAdsConnection.settings.currencyCode ?? "—"
              }`}
            />
            <DetailRow
              label="Saat Dilimi"
              value={amazonAdsConnection.settings.timezone ?? "—"}
            />
            <DetailRow label="Account Type" value={amazonAdsConnection.account.accountType ?? "—"} />
            <DetailRow label="Account Name" value={amazonAdsConnection.account.accountName ?? "—"} />
            <DetailRow
              label="Payment Method"
              value={
                typeof amazonAdsConnection.account.validPaymentMethod === "boolean"
                  ? amazonAdsConnection.account.validPaymentMethod
                    ? "Geçerli"
                    : "Geçerli Değil"
                  : "—"
              }
            />
            <DetailRow
              label="Son Senkronizasyon"
              value={formatClientDateTime(amazonAdsConnection.lastSyncAt)}
            />
            <DetailRow label="Hata Özeti" value={amazonAdsConnection.syncError ?? "—"} />
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            value={amazonProfileId}
            onChange={(event) => setAmazonProfileId(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Profile ID"
          />
          <Input
            value={amazonAdvertiserAccountId}
            onChange={(event) => setAmazonAdvertiserAccountId(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Advertiser Account ID"
          />
          <Input
            value={amazonMarketplaceId}
            onChange={(event) => setAmazonMarketplaceId(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Marketplace ID"
          />
          <DetailSelectControl
            ariaLabel="Amazon Ads Region"
            value={amazonRegion}
            onChange={(value) => setAmazonRegion(value as "" | AmazonAdsRegion)}
          >
            <option value="">Region seçilmedi</option>
            <option value="NA">NA</option>
            <option value="EU">EU</option>
            <option value="FE">FE</option>
          </DetailSelectControl>
          <Input
            value={amazonCountryCode}
            onChange={(event) => setAmazonCountryCode(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Country Code"
            maxLength={2}
          />
          <Input
            value={amazonCurrencyCode}
            onChange={(event) => setAmazonCurrencyCode(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Currency Code"
            maxLength={3}
          />
          <Input
            value={amazonTimezone}
            onChange={(event) => setAmazonTimezone(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Timezone"
          />
          <Input
            value={amazonAccountType}
            onChange={(event) => setAmazonAccountType(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Account Type"
          />
          <Input
            value={amazonAccountName}
            onChange={(event) => setAmazonAccountName(event.target.value)}
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
            placeholder="Account Name"
          />
          <DetailSelectControl
            ariaLabel="Amazon Ads Payment Method"
            value={amazonValidPaymentMethod}
            onChange={(value) => setAmazonValidPaymentMethod(value as "" | "true" | "false")}
          >
            <option value="">Payment method belirtilmedi</option>
            <option value="true">Geçerli</option>
            <option value="false">Geçerli Değil</option>
          </DetailSelectControl>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-2"
            onClick={handleAmazonConfigSave}
            disabled={isAmazonConfigSaving}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAmazonConfigSaving ? "Kaydediliyor..." : "Config Güncelle"}
          </Button>
        </div>

        {amazonConnectionFeedback ? (
          <p className="mt-3 text-sm text-[#d8ff8f]">{amazonConnectionFeedback}</p>
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

function DetailSelectControl({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="h-10 rounded-md border border-white/[0.12] bg-black/20 px-3 text-sm text-white outline-none focus:border-[#AAFF01]"
    >
      {children}
    </select>
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

type AmazonAdsConfigFormSnapshot = {
  profileId: string;
  advertiserAccountId: string;
  marketplaceId: string;
  region: "" | AmazonAdsRegion;
  countryCode: string;
  currencyCode: string;
  timezone: string;
  accountType: string;
  accountName: string;
  validPaymentMethod: "" | "true" | "false";
};

function buildAmazonAdsConfigPayload(
  form: AmazonAdsConfigFormSnapshot,
): UpdateAdminClientAmazonAdsConfigRequest | null {
  const payload: UpdateAdminClientAmazonAdsConfigRequest = {};

  addOptionalAmazonAdsText(payload, "profileId", form.profileId);
  addOptionalAmazonAdsText(payload, "advertiserAccountId", form.advertiserAccountId);
  addOptionalAmazonAdsText(payload, "marketplaceId", form.marketplaceId);
  addOptionalAmazonAdsText(payload, "countryCode", form.countryCode.toUpperCase());
  addOptionalAmazonAdsText(payload, "currencyCode", form.currencyCode.toUpperCase());
  addOptionalAmazonAdsText(payload, "timezone", form.timezone);
  addOptionalAmazonAdsText(payload, "accountType", form.accountType);
  addOptionalAmazonAdsText(payload, "accountName", form.accountName);

  if (form.region) {
    payload.region = form.region;
  }

  if (form.validPaymentMethod !== "") {
    payload.validPaymentMethod = form.validPaymentMethod === "true";
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function addOptionalAmazonAdsText<K extends keyof UpdateAdminClientAmazonAdsConfigRequest>(
  payload: UpdateAdminClientAmazonAdsConfigRequest,
  key: K,
  value: string,
): void {
  const normalizedValue = value.trim();
  if (normalizedValue.length > 0) {
    payload[key] = normalizedValue as UpdateAdminClientAmazonAdsConfigRequest[K];
  }
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
