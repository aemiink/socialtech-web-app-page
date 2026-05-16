import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  MousePointerClick,
  RefreshCw,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AutomationPreview } from "../../components/automation-preview";
import {
  useGetOwnGoogleAdsAdGroupsQuery,
  useGetOwnGoogleAdsAdsQuery,
  useGetOwnGoogleAdsCampaignsQuery,
  useGetOwnGoogleAdsConfigQuery,
  useGetOwnGoogleAdsConversionsQuery,
  useGetOwnGoogleAdsKeywordsQuery,
  useGetOwnGoogleAdsReportsQuery,
  useGetOwnGoogleAdsSearchTermsQuery,
  useGetOwnGoogleAdsSummaryQuery,
  useSyncOwnGoogleAdsMutation,
} from "../../features/googleAds/googleAdsApi";
import type {
  GoogleAdsAd,
  GoogleAdsAdGroup,
  GoogleAdsCampaign,
  GoogleAdsConnectionStatus,
  GoogleAdsConversion,
  GoogleAdsKeyword,
  GoogleAdsReportItem,
  GoogleAdsSearchTerm,
} from "../../features/googleAds/googleAdsTypes";
import { useGetClientProjectFilesQuery } from "../../features/projectFiles/projectFilesApi";
import type { ProjectFile } from "../../features/projectFiles/projectFilesTypes";
import { useGetClientTasksQuery, useUpdateClientTaskApprovalMutation } from "../../features/tasks/tasksApi";
import type { ClientTask, ClientTaskMetaAdsApprovalStatus } from "../../features/tasks/tasksTypes";

type GoogleAdsTabId =
  | "overview"
  | "campaigns"
  | "ad-groups"
  | "ads"
  | "keywords"
  | "conversions"
  | "search-terms"
  | "reports"
  | "agency-notes"
  | "approvals";

const GOOGLE_ADS_TABS: Array<{ id: GoogleAdsTabId; label: string }> = [
  { id: "overview", label: "Genel Bakış" },
  { id: "campaigns", label: "Kampanyalar" },
  { id: "ad-groups", label: "Reklam Grupları" },
  { id: "ads", label: "Reklamlar" },
  { id: "keywords", label: "Anahtar Kelimeler" },
  { id: "conversions", label: "Dönüşümler" },
  { id: "search-terms", label: "Arama Terimleri" },
  { id: "reports", label: "Raporlar" },
  { id: "agency-notes", label: "Ajans Notları" },
  { id: "approvals", label: "Onaylar" },
];

const GOOGLE_ADS_SERVICE_ID = "google-ads";
const GOOGLE_ADS_APPROVAL_TYPE_LABELS: Record<string, string> = {
  GOOGLE_ADS_CAMPAIGN_APPROVAL: "Campaign Launch",
  GOOGLE_ADS_BUDGET_CHANGE_APPROVAL: "Budget Change",
  GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT: "Report Acknowledgement",
  GOOGLE_ADS_STRATEGY_APPROVAL: "Strategy Approval",
  GOOGLE_ADS_CREATIVE_APPROVAL: "Creative Approval",
  GOOGLE_ADS_KEYWORD_PLAN_APPROVAL: "Keyword Plan",
};

export function GoogleAdsDashboard() {
  const [activeTab, setActiveTab] = useState<GoogleAdsTabId>("overview");
  const [approvalDecisionNotes, setApprovalDecisionNotes] = useState<Record<string, string>>({});
  const [activeApprovalTaskId, setActiveApprovalTaskId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data: config, isLoading, isError } = useGetOwnGoogleAdsConfigQuery();
  const connectionStatus = config?.connectionStatus ?? "NOT_CONNECTED";
  const statusCopy = getClientConnectionCopy({
    connectionStatus,
    hasQueryError: isError,
    hasActiveService: config?.hasActiveService !== false,
  });
  const dashboardCurrencyCode = config?.currencyCode;
  const shouldSkipReportingQueries = statusCopy.kind !== "connected";

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetOwnGoogleAdsSummaryQuery(undefined, {
    skip: shouldSkipReportingQueries || activeTab !== "overview",
  });

  const {
    data: campaigns,
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
  } = useGetOwnGoogleAdsCampaignsQuery(
    { limit: 20 },
    { skip: shouldSkipReportingQueries || (activeTab !== "overview" && activeTab !== "campaigns") },
  );

  const {
    data: adGroups,
    isLoading: isAdGroupsLoading,
    isError: isAdGroupsError,
  } = useGetOwnGoogleAdsAdGroupsQuery(
    { limit: 50 },
    { skip: shouldSkipReportingQueries || activeTab !== "ad-groups" },
  );

  const {
    data: ads,
    isLoading: isAdsLoading,
    isError: isAdsError,
  } = useGetOwnGoogleAdsAdsQuery(
    { limit: 50 },
    { skip: shouldSkipReportingQueries || activeTab !== "ads" },
  );

  const {
    data: keywords,
    isLoading: isKeywordsLoading,
    isError: isKeywordsError,
  } = useGetOwnGoogleAdsKeywordsQuery(
    { limit: 50 },
    { skip: shouldSkipReportingQueries || activeTab !== "keywords" },
  );

  const {
    data: conversions,
    isLoading: isConversionsLoading,
    isError: isConversionsError,
  } = useGetOwnGoogleAdsConversionsQuery(
    { limit: 50 },
    { skip: shouldSkipReportingQueries || activeTab !== "conversions" },
  );

  const {
    data: searchTerms,
    isLoading: isSearchTermsLoading,
    isError: isSearchTermsError,
  } = useGetOwnGoogleAdsSearchTermsQuery(
    { limit: 50 },
    { skip: shouldSkipReportingQueries || activeTab !== "search-terms" },
  );

  const {
    data: reportsResponse,
    isLoading: isReportsLoading,
    isError: isReportsError,
  } = useGetOwnGoogleAdsReportsQuery(
    { limit: 20 },
    { skip: shouldSkipReportingQueries || activeTab !== "reports" },
  );

  const {
    data: notesTasksResponse,
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = useGetClientTasksQuery(undefined, {
    skip: shouldSkipReportingQueries || activeTab !== "agency-notes",
  });

  const {
    data: approvalsTasksResponse,
    isLoading: isApprovalsLoading,
    isError: isApprovalsError,
    refetch: refetchApprovals,
  } = useGetClientTasksQuery(
    { approvalRequired: true },
    { skip: shouldSkipReportingQueries || activeTab !== "approvals" },
  );

  const [updateClientTaskApproval, { isLoading: isUpdatingApproval }] =
    useUpdateClientTaskApprovalMutation();
  const [syncOwnGoogleAds, { isLoading: isOwnSyncing }] = useSyncOwnGoogleAdsMutation();

  const agencyNotes = useMemo(
    () =>
      (notesTasksResponse ?? [])
        .filter(
          (task) =>
            task.projectServiceId === GOOGLE_ADS_SERVICE_ID &&
            !task.approvalRequired,
        )
        .sort((left, right) => {
          const leftDate = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
          const rightDate = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
          return rightDate - leftDate;
        })
        .slice(0, 12),
    [notesTasksResponse],
  );

  const googleAdsApprovalTasks = useMemo(
    () =>
      (approvalsTasksResponse ?? []).filter(
        (task) =>
          task.projectServiceId === GOOGLE_ADS_SERVICE_ID &&
          task.approvalRequired,
      ),
    [approvalsTasksResponse],
  );

  const pendingApprovalTasks = useMemo(
    () =>
      googleAdsApprovalTasks
        .filter((task) => task.approvalStatus === "PENDING")
        .slice(0, 12),
    [googleAdsApprovalTasks],
  );

  const approvalHistoryTasks = useMemo(
    () =>
      googleAdsApprovalTasks
        .filter((task) => task.approvalStatus && task.approvalStatus !== "PENDING")
        .slice(0, 12),
    [googleAdsApprovalTasks],
  );

  const approvalProjectId =
    pendingApprovalTasks[0]?.projectId ??
    approvalHistoryTasks[0]?.projectId ??
    googleAdsApprovalTasks[0]?.projectId ??
    null;

  const {
    data: approvalCreativeFilesResponse,
    isLoading: isCreativeFilesLoading,
    isError: isCreativeFilesError,
  } = useGetClientProjectFilesQuery(
    {
      projectId: approvalProjectId ?? "",
      category: "ADS_CREATIVE",
      approvalRequired: true,
    },
    { skip: shouldSkipReportingQueries || activeTab !== "approvals" || !approvalProjectId },
  );

  const pendingCreativeFiles = useMemo(
    () =>
      (approvalCreativeFilesResponse?.data ?? [])
        .filter((file) => file.approvalStatus === "PENDING")
        .slice(0, 8),
    [approvalCreativeFilesResponse?.data],
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <PageHeader />
        <StateCard message="Google Ads bağlantı durumu yükleniyor..." />
      </div>
    );
  }

  if (statusCopy.kind !== "connected") {
    return (
      <div className="p-8 space-y-6">
        <PageHeader />
        <StatusCard status={statusCopy} />
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
          Son senkron:{" "}
          <span className="text-white">
            {formatDateTime(config?.lastSyncAt) ?? "Henüz senkron yok"}
          </span>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Toplam Harcama",
      value: summary ? formatCurrency(summary.cost, dashboardCurrencyCode) : "—",
      Icon: DollarSign,
    },
    {
      label: "CTR",
      value: summary ? `%${summary.ctr.toFixed(2)}` : "—",
      Icon: MousePointerClick,
    },
    {
      label: "Tıklamalar",
      value: summary ? formatInteger(summary.clicks) : "—",
      Icon: TrendingUp,
    },
    {
      label: "Dönüşümler",
      value: summary ? summary.conversions.toFixed(2) : "—",
      Icon: Target,
    },
  ];

  const lastSyncAt =
    summary?.lastSyncAt ??
    campaigns?.lastSyncAt ??
    adGroups?.lastSyncAt ??
    ads?.lastSyncAt ??
    keywords?.lastSyncAt ??
    conversions?.lastSyncAt ??
    searchTerms?.lastSyncAt ??
    config?.lastSyncAt ??
    null;

  const syncCooldown = useMemo(() => {
    if (!lastSyncAt) {
      return { isRateLimited: false, remainingMinutes: 0 };
    }

    const parsedDate = new Date(lastSyncAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return { isRateLimited: false, remainingMinutes: 0 };
    }

    const cooldownMinutes = 30;
    const elapsedMs = Date.now() - parsedDate.getTime();
    const cooldownMs = cooldownMinutes * 60 * 1000;
    if (!Number.isFinite(elapsedMs) || elapsedMs >= cooldownMs || elapsedMs < 0) {
      return { isRateLimited: false, remainingMinutes: 0 };
    }

    return {
      isRateLimited: true,
      remainingMinutes: Math.max(Math.ceil((cooldownMs - elapsedMs) / (60 * 1000)), 1),
    };
  }, [lastSyncAt]);
  const isRefreshDisabled = isOwnSyncing || syncCooldown.isRateLimited;
  const refreshButtonLabel = isOwnSyncing
    ? "Güncelleniyor..."
    : syncCooldown.isRateLimited
      ? `Yenile (${syncCooldown.remainingMinutes} dk)`
      : "Veriyi Yenile";

  async function handleDashboardRefresh() {
    if (syncCooldown.isRateLimited || isOwnSyncing) {
      return;
    }

    try {
      setSyncFeedback(null);
      const response = await syncOwnGoogleAds().unwrap();

      if (response.syncStatus === "SKIPPED") {
        setSyncFeedback({
          type: "warning",
          text: response.skippedReason ?? "Veri yenileme kısa süreliğine rate-limit nedeniyle beklemede.",
        });
        return;
      }

      setSyncFeedback({
        type: "success",
        text: "Google Ads verileri güncellendi.",
      });
    } catch {
      setSyncFeedback({
        type: "error",
        text: "Bağlantı problemi var, ekibimiz ilgileniyor.",
      });
    }
  }

  async function handleApprovalDecision(
    task: ClientTask,
    approvalStatus: ClientTaskMetaAdsApprovalStatus,
  ) {
    if (isUpdatingApproval) {
      return;
    }

    const note = approvalDecisionNotes[task.id]?.trim();
    const requiresNote =
      approvalStatus === "CHANGES_REQUESTED" || approvalStatus === "REJECTED";

    if (requiresNote && (!note || note.length < 2)) {
      setApprovalFeedback({
        type: "error",
        text: "Revizyon veya red yanıtı için en az 2 karakter not girin.",
      });
      return;
    }

    try {
      setActiveApprovalTaskId(task.id);
      setApprovalFeedback(null);
      await updateClientTaskApproval({
        taskId: task.id,
        body: {
          approvalStatus,
          approvalResponseNote: note || undefined,
        },
      }).unwrap();

      await refetchApprovals();
      setApprovalDecisionNotes((prev) => ({ ...prev, [task.id]: "" }));
      setApprovalFeedback({
        type: "success",
        text:
          approvalStatus === "APPROVED"
            ? "Onay cevabınız kaydedildi."
            : approvalStatus === "ACKNOWLEDGED"
              ? "Rapor onayı (okudum) kaydedildi."
              : "Revizyon talebiniz kaydedildi.",
      });
    } catch {
      setApprovalFeedback({
        type: "error",
        text: "Onay aksiyonu kaydedilemedi. Lütfen tekrar deneyin.",
      });
    } finally {
      setActiveApprovalTaskId(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader />

      <StatusCard status={statusCopy} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#A0A0A0]">
          Son güncelleme:{" "}
          <span className="text-white">{formatDateTime(lastSyncAt) ?? "Henüz senkron yok"}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            void handleDashboardRefresh();
          }}
          disabled={isRefreshDisabled}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            isRefreshDisabled
              ? "cursor-not-allowed border-white/[0.12] bg-white/[0.04] text-[#7A7A7A]"
              : "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#AAFF01] hover:bg-[#AAFF01]/20"
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${isOwnSyncing ? "animate-spin" : ""}`} />
          {refreshButtonLabel}
        </button>
      </div>

      {syncCooldown.isRateLimited ? (
        <div className="rounded-2xl border border-[#FFA726]/25 bg-[#FFA726]/10 p-4 text-sm text-[#FFD7A3]">
          Rate limit güvenliği nedeniyle yeni yenileme için yaklaşık {syncCooldown.remainingMinutes} dk bekleyin.
        </div>
      ) : null}

      {syncFeedback ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            syncFeedback.type === "success"
              ? "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#D7FFC2]"
              : syncFeedback.type === "warning"
                ? "border-[#FFA726]/25 bg-[#FFA726]/10 text-[#FFD7A3]"
                : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {syncFeedback.text}
        </div>
      ) : null}

      {config?.syncError ? (
        <div className="bg-[#FFA726]/10 rounded-2xl p-4 border border-[#FFA726]/25 text-sm text-[#FFD7A3]">
          Son veri güncellemesi tamamlanamadı. Ekibimiz bağlantıyı kontrol ediyor.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
          Son senkron: <span className="text-white">{formatDateTime(lastSyncAt) ?? "Henüz senkron yok"}</span>
        </div>
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.08] text-sm text-[#A0A0A0]">
          Hesap: <span className="text-white">{config?.descriptiveName ?? config?.customerId ?? "Henüz tanımlanmadı"}</span>
        </div>
      </div>

      <div className="bg-[#AAFF01]/10 rounded-2xl p-4 border border-[#AAFF01]/25 text-sm text-[#D7FFC2]">
        Veriler Google Ads API üzerinden alınmıştır.
      </div>

      <div className="flex flex-wrap gap-2">
        {GOOGLE_ADS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm border transition-colors ${
              activeTab === tab.id
                ? "bg-[#AAFF01]/10 border-[#AAFF01]/25 text-[#AAFF01]"
                : "bg-[#1A1A1A] border-white/[0.08] text-[#A0A0A0] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <>
          {(isSummaryLoading || isCampaignsLoading) ? (
            <StateCard message="Google Ads raporu güncelleniyor..." />
          ) : null}

          {(isSummaryError || isCampaignsError) ? (
            <StateCard
              message="Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin."
              tone="error"
            />
          ) : null}

          {!isSummaryLoading && !isSummaryError && !summary ? (
            <StateCard message="Seçili tarih aralığı için özet rapor verisi bulunamadı." />
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[#A0A0A0] text-sm">{card.label}</span>
                  <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                    <card.Icon className="w-5 h-5 text-[#AAFF01]" />
                  </div>
                </div>
                <div className="text-2xl text-white">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-xl text-white mb-4">Kampanya Genel Bakışı</h2>
            {campaigns && campaigns.data.length > 0 ? (
              <div className="space-y-3">
                {campaigns.data.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    currencyCode={dashboardCurrencyCode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#A0A0A0]">Kampanya verisi henüz bulunamadı.</div>
            )}
          </div>
        </>
      ) : null}

      {activeTab === "campaigns" ? (
        <DataSection
          isLoading={isCampaignsLoading}
          isError={isCampaignsError}
          isEmpty={!campaigns || campaigns.data.length === 0}
          loadingMessage="Kampanya verileri yükleniyor..."
          errorMessage="Kampanya verileri alınamadı."
          emptyMessage="Kampanya verisi bulunamadı."
        >
          <div className="space-y-3">
            {campaigns?.data.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                currencyCode={dashboardCurrencyCode}
              />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "ad-groups" ? (
        <DataSection
          isLoading={isAdGroupsLoading}
          isError={isAdGroupsError}
          isEmpty={!adGroups || adGroups.data.length === 0}
          loadingMessage="Reklam grubu verileri yükleniyor..."
          errorMessage="Reklam grubu verileri alınamadı."
          emptyMessage="Reklam grubu verisi bulunamadı."
        >
          <div className="space-y-3">
            {adGroups?.data.map((adGroup) => (
              <AdGroupRow
                key={adGroup.id}
                adGroup={adGroup}
                currencyCode={dashboardCurrencyCode}
              />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "ads" ? (
        <DataSection
          isLoading={isAdsLoading}
          isError={isAdsError}
          isEmpty={!ads || ads.data.length === 0}
          loadingMessage="Reklam verileri yükleniyor..."
          errorMessage="Reklam verileri alınamadı."
          emptyMessage="Reklam verisi bulunamadı."
        >
          <div className="space-y-3">
            {ads?.data.map((ad) => (
              <AdRow key={ad.id} ad={ad} currencyCode={dashboardCurrencyCode} />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "keywords" ? (
        <DataSection
          isLoading={isKeywordsLoading}
          isError={isKeywordsError}
          isEmpty={!keywords || keywords.data.length === 0}
          loadingMessage="Anahtar kelime verileri yükleniyor..."
          errorMessage="Anahtar kelime verileri alınamadı."
          emptyMessage="Anahtar kelime verisi bulunamadı."
        >
          <div className="space-y-3">
            {keywords?.data.map((keyword) => (
              <KeywordRow
                key={keyword.id}
                keyword={keyword}
                currencyCode={dashboardCurrencyCode}
              />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "conversions" ? (
        <DataSection
          isLoading={isConversionsLoading}
          isError={isConversionsError}
          isEmpty={!conversions || conversions.data.length === 0}
          loadingMessage="Dönüşüm verileri yükleniyor..."
          errorMessage="Dönüşüm verileri alınamadı."
          emptyMessage="Dönüşüm verisi bulunamadı."
        >
          <div className="space-y-3">
            {conversions?.data.map((conversion) => (
              <ConversionRow
                key={conversion.id}
                conversion={conversion}
                currencyCode={dashboardCurrencyCode}
              />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "search-terms" ? (
        <DataSection
          isLoading={isSearchTermsLoading}
          isError={isSearchTermsError}
          isEmpty={!searchTerms || searchTerms.data.length === 0}
          loadingMessage="Arama terimi verileri yükleniyor..."
          errorMessage="Arama terimi verileri alınamadı."
          emptyMessage="Arama terimi verisi bulunamadı."
        >
          <div className="space-y-3">
            {searchTerms?.data.map((searchTerm) => (
              <SearchTermRow
                key={searchTerm.id}
                searchTerm={searchTerm}
                currencyCode={dashboardCurrencyCode}
              />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "reports" ? (
        <GoogleAdsReportsPanel
          rows={reportsResponse?.data ?? []}
          loading={isReportsLoading}
          isError={isReportsError}
        />
      ) : null}

      {activeTab === "agency-notes" ? (
        <DataSection
          isLoading={isNotesLoading}
          isError={isNotesError}
          isEmpty={agencyNotes.length === 0}
          loadingMessage="Ajans notları yükleniyor..."
          errorMessage="Ajans notları alınamadı."
          emptyMessage="Ajans notu bulunamadı."
        >
          <div className="space-y-3">
            {agencyNotes.map((task) => (
              <TaskNoteRow key={task.id} task={task} />
            ))}
          </div>
        </DataSection>
      ) : null}

      {activeTab === "approvals" ? (
        <GoogleAdsApprovalsPanel
          pendingTasks={pendingApprovalTasks}
          historyTasks={approvalHistoryTasks}
          creativeFiles={pendingCreativeFiles}
          loading={isApprovalsLoading || isCreativeFilesLoading}
          isError={isApprovalsError || isCreativeFilesError}
          activeTaskId={activeApprovalTaskId}
          isActionLoading={isUpdatingApproval}
          decisionNotes={approvalDecisionNotes}
          feedback={approvalFeedback}
          onChangeDecisionNote={(taskId, note) =>
            setApprovalDecisionNotes((prev) => ({ ...prev, [taskId]: note }))
          }
          onDecision={handleApprovalDecision}
        />
      ) : null}

      <AutomationPreview />
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl text-white mb-2">Google Ads</h1>
      <p className="text-[#A0A0A0]">Arama, Display ve Performance Max görünürlüğü</p>
    </div>
  );
}

function DataSection({
  isLoading,
  isError,
  isEmpty,
  loadingMessage,
  errorMessage,
  emptyMessage,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  loadingMessage: string;
  errorMessage: string;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (isLoading) {
    return <StateCard message={loadingMessage} />;
  }

  if (isError) {
    return <StateCard message={errorMessage} tone="error" />;
  }

  if (isEmpty) {
    return <StateCard message={emptyMessage} />;
  }

  return <div className="space-y-3">{children}</div>;
}

function CampaignRow({
  campaign,
  currencyCode,
}: {
  campaign: GoogleAdsCampaign;
  currencyCode: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 md:grid-cols-6 md:items-center">
      <div>
        <div className="text-white text-sm">{campaign.name}</div>
        <div className="text-xs text-[#A0A0A0]">{campaign.channelType}</div>
      </div>
      <div className="text-sm text-white">{formatCurrency(campaign.cost, currencyCode)}</div>
      <div className="text-sm text-white">{formatInteger(campaign.clicks)} tıklama</div>
      <div className="text-sm text-white">{campaign.conversions.toFixed(2)} dönüşüm</div>
      <div className="text-sm text-white">CTR %{campaign.ctr.toFixed(2)}</div>
      <div className="text-xs text-[#A0A0A0] text-left md:text-right">{campaign.status}</div>
    </div>
  );
}

function AdGroupRow({
  adGroup,
  currencyCode,
}: {
  adGroup: GoogleAdsAdGroup;
  currencyCode: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 md:grid-cols-6 md:items-center">
      <div>
        <div className="text-white text-sm">{adGroup.adGroupName}</div>
        <div className="text-xs text-[#A0A0A0]">{adGroup.campaignName}</div>
      </div>
      <div className="text-sm text-white">{formatCurrency(adGroup.cost, currencyCode)}</div>
      <div className="text-sm text-white">{formatInteger(adGroup.clicks)} tıklama</div>
      <div className="text-sm text-white">{adGroup.conversions.toFixed(2)} dönüşüm</div>
      <div className="text-sm text-white">CTR %{adGroup.ctr.toFixed(2)}</div>
      <div className="text-xs text-[#A0A0A0] text-left md:text-right">{adGroup.status}</div>
    </div>
  );
}

function AdRow({
  ad,
  currencyCode,
}: {
  ad: GoogleAdsAd;
  currencyCode: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 md:grid-cols-6 md:items-center">
      <div>
        <div className="text-white text-sm">{ad.adName}</div>
        <div className="text-xs text-[#A0A0A0]">{ad.campaignName} / {ad.adGroupName}</div>
      </div>
      <div className="text-sm text-white">{ad.adType}</div>
      <div className="text-sm text-white">{formatCurrency(ad.cost, currencyCode)}</div>
      <div className="text-sm text-white">{formatInteger(ad.clicks)} tıklama</div>
      <div className="text-sm text-white">{ad.conversions.toFixed(2)} dönüşüm</div>
      <div className="text-xs text-[#A0A0A0] text-left md:text-right">{ad.status}</div>
    </div>
  );
}

function KeywordRow({
  keyword,
  currencyCode,
}: {
  keyword: GoogleAdsKeyword;
  currencyCode: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 md:grid-cols-7 md:items-center">
      <div>
        <div className="text-white text-sm">{keyword.keywordText}</div>
        <div className="text-xs text-[#A0A0A0]">{keyword.campaignName} / {keyword.adGroupName}</div>
      </div>
      <div className="text-sm text-white">{keyword.matchType}</div>
      <div className="text-sm text-white">{formatCurrency(keyword.cost, currencyCode)}</div>
      <div className="text-sm text-white">{formatInteger(keyword.clicks)} tıklama</div>
      <div className="text-sm text-white">{keyword.conversions.toFixed(2)} dönüşüm</div>
      <div className="text-sm text-white">CTR %{keyword.ctr.toFixed(2)}</div>
      <div className="text-xs text-[#A0A0A0] text-left md:text-right">{keyword.status}</div>
    </div>
  );
}

function ConversionRow({
  conversion,
  currencyCode,
}: {
  conversion: GoogleAdsConversion;
  currencyCode: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 md:grid-cols-5 md:items-center">
      <div>
        <div className="text-white text-sm">{conversion.conversionAction}</div>
      </div>
      <div className="text-sm text-white">{conversion.conversions.toFixed(2)} dönüşüm</div>
      <div className="text-sm text-white">
        {conversion.conversionValue === null ? "—" : formatCurrency(conversion.conversionValue, currencyCode)}
      </div>
      <div className="text-sm text-white">
        {conversion.costPerConversion === null ? "—" : formatCurrency(conversion.costPerConversion, currencyCode)}
      </div>
      <div className="text-sm text-white">%{conversion.conversionRate.toFixed(2)}</div>
    </div>
  );
}

function SearchTermRow({
  searchTerm,
  currencyCode,
}: {
  searchTerm: GoogleAdsSearchTerm;
  currencyCode: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 md:grid-cols-6 md:items-center">
      <div>
        <div className="text-white text-sm">{searchTerm.searchTerm}</div>
        <div className="text-xs text-[#A0A0A0]">{searchTerm.campaignName} / {searchTerm.adGroupName}</div>
      </div>
      <div className="text-sm text-white">{searchTerm.keywordText ?? "—"}</div>
      <div className="text-sm text-white">{formatCurrency(searchTerm.cost, currencyCode)}</div>
      <div className="text-sm text-white">{formatInteger(searchTerm.clicks)} tıklama</div>
      <div className="text-sm text-white">{searchTerm.conversions.toFixed(2)} dönüşüm</div>
      <div className="text-sm text-white">CTR %{searchTerm.ctr.toFixed(2)}</div>
    </div>
  );
}

function TaskNoteRow({ task }: { task: ClientTask }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4">
      <div className="text-white text-sm">{task.title}</div>
      <div className="text-xs text-[#A0A0A0] mt-1">{task.description ?? "Detay eklenmemiş."}</div>
      <div className="text-xs text-[#A0A0A0] mt-2">{formatDateTime(task.updatedAt) ?? "Güncelleme tarihi yok"}</div>
    </div>
  );
}

function GoogleAdsReportsPanel({
  rows,
  loading,
  isError,
}: {
  rows: GoogleAdsReportItem[];
  loading: boolean;
  isError: boolean;
}) {
  if (loading) {
    return <StateCard message="Google Ads raporları yükleniyor..." />;
  }

  if (isError) {
    return <StateCard message="Google Ads raporları alınamadı." tone="error" />;
  }

  if (rows.length === 0) {
    return <StateCard message="Henüz yayınlanan Google Ads raporu bulunmuyor." />;
  }

  return (
    <div className="space-y-3">
      {rows.map((report) => (
        <div key={report.id} className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white">{getGoogleAdsReportTypeLabel(report.type)}</p>
            <span className="text-xs text-[#D7FFC2]">
              {getGoogleAdsReportStatusLabel(report.status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            Dönem: {formatDateTime(report.periodStart)} - {formatDateTime(report.periodEnd)}
          </p>
          {report.summary ? <p className="mt-2 text-xs text-[#CFCFCF]">{report.summary}</p> : null}
          <p className="mt-2 text-xs text-[#A0A0A0]">
            Onay: {getGoogleAdsReportAcknowledgementLabel(report.acknowledgementStatus)}
          </p>
        </div>
      ))}
    </div>
  );
}

function GoogleAdsApprovalsPanel({
  pendingTasks,
  historyTasks,
  creativeFiles,
  loading,
  isError,
  activeTaskId,
  isActionLoading,
  decisionNotes,
  feedback,
  onChangeDecisionNote,
  onDecision,
}: {
  pendingTasks: ClientTask[];
  historyTasks: ClientTask[];
  creativeFiles: ProjectFile[];
  loading: boolean;
  isError: boolean;
  activeTaskId: string | null;
  isActionLoading: boolean;
  decisionNotes: Record<string, string>;
  feedback: { type: "success" | "error"; text: string } | null;
  onChangeDecisionNote: (taskId: string, note: string) => void;
  onDecision: (task: ClientTask, approvalStatus: ClientTaskMetaAdsApprovalStatus) => Promise<void>;
}) {
  if (loading) {
    return <StateCard message="Onay bekleyen talepler yükleniyor..." />;
  }

  if (isError) {
    return <StateCard message="Onay talepleri alınamadı." tone="error" />;
  }

  if (pendingTasks.length === 0 && historyTasks.length === 0 && creativeFiles.length === 0) {
    return <StateCard message="Onay bekleyen talep bulunmuyor." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#AAFF01]/20 bg-[#AAFF01]/10 p-4 text-sm text-[#D7FFC2]">
        Bekleyen Google Ads onayı: {pendingTasks.length}
      </div>

      {feedback ? (
        <div
          className={`rounded-xl border p-3 text-sm ${
            feedback.type === "success"
              ? "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#D7FFC2]"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {creativeFiles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-white">Creative Preview</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {creativeFiles.map((file) => (
              <div key={file.id} className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-3">
                <p className="text-sm text-white">{file.title}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">{file.originalFileName}</p>
                {file.mimeType.startsWith("image/") ? (
                  <img src={file.secureUrl} alt={file.title} className="mt-2 h-40 w-full rounded-lg object-cover" />
                ) : file.mimeType.startsWith("video/") ? (
                  <video className="mt-2 h-40 w-full rounded-lg object-cover" controls src={file.secureUrl} />
                ) : (
                  <a
                    href={file.secureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs text-[#AAFF01] underline"
                  >
                    Dosyayı aç
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {pendingTasks.map((task) => {
        const decisionNote = decisionNotes[task.id] ?? "";
        const requiresRevisionNote = decisionNote.trim().length < 2;
        const isReportAcknowledgement =
          task.approvalType === "GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT";

        return (
          <div key={task.id} className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-white">{task.title}</p>
              <span className="text-xs text-[#D7FFC2]">
                {getGoogleAdsApprovalStatusLabel(task.approvalStatus ?? "PENDING")}
              </span>
            </div>
            {task.approvalType ? (
              <p className="mt-1 text-xs text-[#A0A0A0]">
                Onay tipi: {getGoogleAdsApprovalTypeLabel(task.approvalType)}
              </p>
            ) : null}
            {task.description ? <p className="mt-2 text-xs text-[#CFCFCF]">{task.description}</p> : null}

            <textarea
              className="mt-3 min-h-20 w-full rounded-xl border border-white/[0.08] bg-[#151515] p-3 text-sm text-white outline-none focus:border-[#AAFF01]/40"
              placeholder="Revizyon notu (revizyon/red için en az 2 karakter)"
              value={decisionNote}
              onChange={(event) => onChangeDecisionNote(task.id, event.target.value)}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-[#AAFF01]/25 bg-[#AAFF01]/10 px-3 py-2 text-xs text-[#D7FFC2] hover:bg-[#AAFF01]/15 disabled:opacity-60"
                disabled={isActionLoading}
                onClick={() =>
                  void onDecision(task, isReportAcknowledgement ? "ACKNOWLEDGED" : "APPROVED")
                }
              >
                {activeTaskId === task.id
                  ? "Kaydediliyor..."
                  : isReportAcknowledgement
                    ? "Okudum"
                    : "Onayla"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/[0.16] bg-transparent px-3 py-2 text-xs text-[#E5E5E5] hover:border-white/[0.28] disabled:opacity-50"
                disabled={isActionLoading || requiresRevisionNote}
                onClick={() => void onDecision(task, "CHANGES_REQUESTED")}
              >
                Revizyon İste
              </button>
            </div>
          </div>
        );
      })}

      {historyTasks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-white">Onay Geçmişi</p>
          {historyTasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/[0.08] bg-[#171717] p-3 text-xs text-[#A0A0A0]">
              <p className="text-sm text-white">{task.title}</p>
              <p>Durum: {getGoogleAdsApprovalStatusLabel(task.approvalStatus ?? "PENDING")}</p>
              {task.approvalType ? <p>Tip: {getGoogleAdsApprovalTypeLabel(task.approvalType)}</p> : null}
              {task.approvalResponseNote ? <p>Not: {task.approvalResponseNote}</p> : null}
              {task.approvalRespondedAt ? <p>Tarih: {formatDateTime(task.approvalRespondedAt)}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getGoogleAdsReportTypeLabel(type: GoogleAdsReportItem["type"]): string {
  if (type === "WEEKLY") {
    return "Weekly Google Ads Report";
  }
  if (type === "MONTHLY") {
    return "Monthly Google Ads Report";
  }
  if (type === "CAMPAIGN_PERFORMANCE") {
    return "Campaign Performance Report";
  }
  if (type === "SEARCH_TERMS") {
    return "Search Terms Report";
  }
  if (type === "KEYWORD_PERFORMANCE") {
    return "Keyword Performance Report";
  }
  if (type === "BUDGET_RECOMMENDATION") {
    return "Budget Recommendation Report";
  }
  if (type === "CONVERSION_TRACKING") {
    return "Conversion Tracking Report";
  }
  return type;
}

function getGoogleAdsReportStatusLabel(status: GoogleAdsReportItem["status"]): string {
  if (status === "DRAFT") {
    return "Taslak";
  }
  if (status === "PUBLISHED") {
    return "Yayınlandı";
  }
  if (status === "ARCHIVED") {
    return "Arşiv";
  }
  return status;
}

function getGoogleAdsReportAcknowledgementLabel(
  status: GoogleAdsReportItem["acknowledgementStatus"],
): string {
  if (status === "NOT_REQUESTED") {
    return "Talep yok";
  }
  if (status === "PENDING") {
    return "Bekleniyor";
  }
  if (status === "ACKNOWLEDGED") {
    return "Okundu";
  }
  if (status === "CHANGES_REQUESTED") {
    return "Revizyon istendi";
  }
  return status;
}

function getGoogleAdsApprovalTypeLabel(approvalType: string): string {
  return (
    GOOGLE_ADS_APPROVAL_TYPE_LABELS[approvalType] ??
    approvalType.replace("GOOGLE_ADS_", "").replace(/_/g, " ")
  );
}

function getGoogleAdsApprovalStatusLabel(
  approvalStatus: ClientTaskMetaAdsApprovalStatus,
): string {
  if (approvalStatus === "PENDING") {
    return "Aksiyon Bekleniyor";
  }
  if (approvalStatus === "APPROVED") {
    return "Onaylandı";
  }
  if (approvalStatus === "ACKNOWLEDGED") {
    return "Okundu";
  }
  if (approvalStatus === "CHANGES_REQUESTED") {
    return "Revizyon İstendi";
  }
  if (approvalStatus === "REJECTED") {
    return "Reddedildi";
  }
  return approvalStatus;
}

function StateCard({
  message,
  tone = "default",
}: {
  message: string;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`rounded-2xl p-4 border text-sm ${
        tone === "error"
          ? "bg-red-500/10 border-red-500/30 text-red-200"
          : "bg-[#1A1A1A] border-white/[0.08] text-[#A0A0A0]"
      }`}
    >
      {message}
    </div>
  );
}

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleString("tr-TR");
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

function formatInteger(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getClientConnectionCopy({
  connectionStatus,
  hasQueryError,
  hasActiveService,
}: {
  connectionStatus: GoogleAdsConnectionStatus;
  hasQueryError: boolean;
  hasActiveService: boolean;
}): {
  kind: "connected" | "pending" | "issue";
  title: string;
  description: string;
} {
  if (!hasActiveService) {
    return {
      kind: "issue",
      title: "Google Ads hizmeti aktif değil",
      description: "Google Ads hizmetiniz şu anda aktif değil. Ekibimizle iletişime geçebilirsiniz.",
    };
  }

  if (hasQueryError) {
    return {
      kind: "issue",
      title: "Bağlantıda sorun var",
      description: "Bağlantıda sorun var, ekibimiz ilgileniyor.",
    };
  }

  if (connectionStatus === "CONNECTED") {
    return {
      kind: "connected",
      title: "Bağlantı aktif",
      description: "Google Ads bağlantısı aktif.",
    };
  }

  if (connectionStatus === "PENDING") {
    return {
      kind: "pending",
      title: "Veriler hazırlanıyor",
      description: "Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.",
    };
  }

  if (connectionStatus === "NOT_CONNECTED") {
    return {
      kind: "issue",
      title: "Google Ads bağlantısı bekleniyor",
      description: "Google Ads hesabı henüz bağlanmamış görünüyor.",
    };
  }

  if (connectionStatus === "DISCONNECTED") {
    return {
      kind: "issue",
      title: "Bağlantı durduruldu",
      description: "Google Ads bağlantısı şu anda kapalı. Ekibimiz yeniden bağlanma sürecini yönetiyor.",
    };
  }

  return {
    kind: "issue",
    title: "Bağlantıda sorun var",
    description: "Bağlantıda sorun var, ekibimiz ilgileniyor.",
  };
}

function StatusCard({
  status,
}: {
  status: {
    kind: "connected" | "pending" | "issue";
    title: string;
    description: string;
  };
}) {
  const palette =
    status.kind === "connected"
      ? {
          container: "bg-[#AAFF01]/10 border-[#AAFF01]/25",
          text: "text-[#D7FFC2]",
          Icon: CheckCircle,
          icon: "text-[#AAFF01]",
        }
      : status.kind === "pending"
        ? {
            container: "bg-[#00D4FF]/10 border-[#00D4FF]/25",
            text: "text-[#A7ECFF]",
            Icon: Clock,
            icon: "text-[#00D4FF]",
          }
        : {
            container: "bg-[#FF5252]/10 border-[#FF5252]/25",
            text: "text-[#FFC7C7]",
            Icon: status.title === "Google Ads bağlantısı bekleniyor" ? AlertCircle : XCircle,
            icon: "text-[#FF6E6E]",
          };

  return (
    <div className={`rounded-2xl p-6 border ${palette.container}`}>
      <div className="flex items-start gap-3">
        <palette.Icon className={`w-5 h-5 mt-0.5 ${palette.icon}`} />
        <div>
          <h2 className="text-xl text-white mb-2">{status.title}</h2>
          <p className={`text-sm ${palette.text}`}>{status.description}</p>
        </div>
      </div>
    </div>
  );
}
