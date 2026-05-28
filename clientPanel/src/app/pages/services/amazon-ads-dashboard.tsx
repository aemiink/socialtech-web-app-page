import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Star,
  AlertCircle,
  CheckCircle,
  Target,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  useGetOwnAmazonAdsCampaignsQuery,
  useGetOwnAmazonAdsConfigQuery,
  useGetOwnAmazonAdsInsightsQuery,
  useGetOwnAmazonAdsProductsQuery,
  useGetOwnAmazonAdsSummaryQuery,
} from '../../features/amazonAds/amazonAdsApi';

const AMAZON_ADS_REFRESH_COOLDOWN_MS = 30_000;

const retailReadiness = [
  { item: 'Title Optimizasyonu', status: true },
  { item: 'A+ İçerik', status: true },
  { item: 'Ürün Görselleri (7/7)', status: true },
  { item: 'Rekabetçi Fiyatlandırma', status: true },
  { item: 'Müşteri Yorumları (4.6★)', status: true },
  { item: 'Stok Durumu', status: true },
  { item: 'Buy Box Sahibi', status: true },
  { item: 'Sponsored Brands Video', status: false },
];

const clientActions = [
  { action: 'Ürün görsellerini güncelle', priority: 'medium', dueDate: '30 Nis' },
  { action: 'Fiyatlandırma ve stok kontrolü', priority: 'high', dueDate: '28 Nis' },
  { action: 'Keyword genişletmesini onayla', priority: 'medium', dueDate: '2 May' },
];

export function AmazonAdsDashboard() {
  const [lastManualRefreshAt, setLastManualRefreshAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (lastManualRefreshAt === null) {
      return;
    }

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [lastManualRefreshAt]);

  const refreshCooldownRemainingSeconds = useMemo(() => {
    if (lastManualRefreshAt === null) {
      return 0;
    }

    const elapsedMs = nowMs - lastManualRefreshAt;
    if (elapsedMs >= AMAZON_ADS_REFRESH_COOLDOWN_MS) {
      return 0;
    }

    return Math.max(
      Math.ceil((AMAZON_ADS_REFRESH_COOLDOWN_MS - elapsedMs) / 1000),
      0,
    );
  }, [lastManualRefreshAt, nowMs]);
  const isRefreshCooldownActive = refreshCooldownRemainingSeconds > 0;

  useEffect(() => {
    if (lastManualRefreshAt !== null && refreshCooldownRemainingSeconds === 0) {
      setLastManualRefreshAt(null);
    }
  }, [lastManualRefreshAt, refreshCooldownRemainingSeconds]);

  const {
    data: amazonAdsConfig,
    isError: isAmazonAdsConfigError,
    isFetching: isAmazonAdsConfigFetching,
    isLoading: isAmazonAdsConfigLoading,
    refetch: refetchAmazonAdsConfig,
  } = useGetOwnAmazonAdsConfigQuery();
  const isAmazonAdsConnected =
    Boolean(amazonAdsConfig?.hasConfig) && amazonAdsConfig?.connectionStatus === "CONNECTED";
  const {
    data: amazonAdsSummary,
    isError: isAmazonAdsSummaryError,
    isFetching: isAmazonAdsSummaryFetching,
    isLoading: isAmazonAdsSummaryLoading,
    refetch: refetchAmazonAdsSummary,
  } = useGetOwnAmazonAdsSummaryQuery(undefined, { skip: !isAmazonAdsConnected });
  const {
    data: amazonAdsCampaigns,
    isError: isAmazonAdsCampaignsError,
    isFetching: isAmazonAdsCampaignsFetching,
    isLoading: isAmazonAdsCampaignsLoading,
    refetch: refetchAmazonAdsCampaigns,
  } = useGetOwnAmazonAdsCampaignsQuery({ limit: 3 }, { skip: !isAmazonAdsConnected });
  const {
    data: amazonAdsProducts,
    isError: isAmazonAdsProductsError,
    isFetching: isAmazonAdsProductsFetching,
    isLoading: isAmazonAdsProductsLoading,
    refetch: refetchAmazonAdsProducts,
  } = useGetOwnAmazonAdsProductsQuery({ limit: 3 }, { skip: !isAmazonAdsConnected });
  const {
    data: amazonAdsSearchTerms,
    isError: isAmazonAdsSearchTermsError,
    isFetching: isAmazonAdsSearchTermsFetching,
    isLoading: isAmazonAdsSearchTermsLoading,
    refetch: refetchAmazonAdsSearchTerms,
  } = useGetOwnAmazonAdsInsightsQuery(
    { level: "SEARCH_TERM", limit: 5 },
    { skip: !isAmazonAdsConnected },
  );
  const isAmazonAdsReportingLoading =
    isAmazonAdsSummaryLoading ||
    isAmazonAdsCampaignsLoading ||
    isAmazonAdsProductsLoading ||
    isAmazonAdsSearchTermsLoading;
  const isAmazonAdsReportingFetching =
    isAmazonAdsSummaryFetching ||
    isAmazonAdsCampaignsFetching ||
    isAmazonAdsProductsFetching ||
    isAmazonAdsSearchTermsFetching;
  const hasAmazonAdsReportingError =
    isAmazonAdsSummaryError ||
    isAmazonAdsCampaignsError ||
    isAmazonAdsProductsError ||
    isAmazonAdsSearchTermsError;
  const currencyCode = amazonAdsConfig?.currencyCode ?? "TRY";
  const dateRangeLabel = formatDateRangeLabel(amazonAdsSummary?.dateRange);
  const dashboardStats = [
    {
      title: 'ACOS',
      value: formatPercent(amazonAdsSummary?.acos ?? 0),
      detail: dateRangeLabel,
      icon: Target,
      color: 'green',
    },
    {
      title: 'ROAS',
      value: `${formatNumber(amazonAdsSummary?.roas ?? 0)}x`,
      detail: dateRangeLabel,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Satışlar',
      value: formatCurrency(amazonAdsSummary?.sales ?? 0, currencyCode),
      detail: `${formatNumber(amazonAdsSummary?.orders ?? 0)} sipariş`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Dönüşüm',
      value: formatPercent(amazonAdsSummary?.conversionRate ?? 0),
      detail: `${formatNumber(amazonAdsSummary?.clicks ?? 0)} tık`,
      icon: ShoppingCart,
      color: 'green',
    },
    {
      title: 'Gösterim',
      value: formatCompactNumber(amazonAdsSummary?.impressions ?? 0),
      detail: `Son sync: ${formatAmazonAdsDateTime(amazonAdsSummary?.lastSyncAt ?? null)}`,
      icon: Eye,
      color: 'purple',
    },
  ];
  const campaignRows = amazonAdsCampaigns?.data ?? [];
  const searchTermRows = (amazonAdsSearchTerms?.data ?? []).map((item) => ({
    term: item.entityName ?? item.entityId,
    spend: formatCurrency(item.spend, currencyCode),
    sales: formatCurrency(item.sales, currencyCode),
    acos: formatPercent(item.acos),
    acosValue: item.acos,
    action: getSearchTermAction(item.acos).label,
    actionColor: getSearchTermAction(item.acos).color,
  }));
  const productRows = amazonAdsProducts?.data ?? [];

  const refreshAmazonAdsReporting = () => {
    if (isRefreshCooldownActive) {
      return;
    }

    void Promise.all([
      refetchAmazonAdsConfig(),
      ...(isAmazonAdsConnected
        ? [
            refetchAmazonAdsSummary(),
            refetchAmazonAdsCampaigns(),
            refetchAmazonAdsProducts(),
            refetchAmazonAdsSearchTerms(),
          ]
        : []),
    ]).finally(() => {
      setLastManualRefreshAt(Date.now());
      setNowMs(Date.now());
    });
  };

  if (isAmazonAdsConfigLoading) {
    return (
      <div className="p-8">
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/[0.08] text-[#A0A0A0]">
          Amazon Ads bağlantı durumu yükleniyor...
        </div>
      </div>
    );
  }

  if (isAmazonAdsConfigError) {
    return (
      <AmazonAdsUnavailableState
        title="Amazon Ads bağlantı durumu alınamadı"
        description="Ajans ekibi bağlantı durumunu kontrol edene kadar performans verileri gösterilmiyor."
        actionLabel={isAmazonAdsConfigFetching ? "Yenileniyor..." : "Tekrar Dene"}
        onAction={() => refreshAmazonAdsReporting()}
        disabled={isAmazonAdsConfigFetching}
      />
    );
  }

  if (!isAmazonAdsConnected) {
    return (
      <AmazonAdsUnavailableState
        title="Amazon Ads henüz bağlı değil"
        description="Amazon Ads hesabı bağlandığında kampanya ve retail readiness verileri burada görünecek."
        actionLabel={isAmazonAdsConfigFetching ? "Yenileniyor..." : "Durumu Yenile"}
        onAction={() => refreshAmazonAdsReporting()}
        disabled={isAmazonAdsConfigFetching}
        detail={
          amazonAdsConfig
            ? `${amazonAdsConfig.connectionStatus} • ${amazonAdsConfig.marketplaceId ?? "Marketplace yok"}`
            : undefined
        }
      />
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Amazon Ads</h1>
        <p className="text-[#A0A0A0]">
          {amazonAdsConfig.accountName ?? "Amazon Sponsored Products, Brands ve Display"}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-y border-white/[0.08] py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#AAFF01] px-3 py-1 text-xs font-medium text-[#131313]">
            {getAmazonAdsStatusLabel(amazonAdsConfig.connectionStatus)}
          </span>
          <span className="text-sm text-[#A0A0A0]">
            {amazonAdsConfig.marketplaceId ?? "Marketplace yok"}
          </span>
          <span className="text-sm text-[#A0A0A0]">
            {amazonAdsConfig.region ?? "Region yok"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#A0A0A0]">
          {isAmazonAdsReportingLoading || isAmazonAdsReportingFetching ? (
            <span className="text-[#d8ff8f]">Veriler yenileniyor...</span>
          ) : null}
          <span>Profile: {amazonAdsConfig.profileId ?? "—"}</span>
          <span>Advertiser: {amazonAdsConfig.advertiserAccountId ?? "—"}</span>
          <span>
            Son güncelleme: {formatAmazonAdsDateTime(amazonAdsSummary?.lastSyncAt ?? amazonAdsConfig.lastSyncAt)}
          </span>
          <button
            type="button"
            onClick={refreshAmazonAdsReporting}
            disabled={
              isAmazonAdsConfigFetching || isAmazonAdsReportingFetching || isRefreshCooldownActive
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/[0.12] px-3 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            {isRefreshCooldownActive
              ? `Yenile (${refreshCooldownRemainingSeconds}s)`
              : "Yenile"}
          </button>
        </div>
      </div>

      {hasAmazonAdsReportingError ? (
        <div className="rounded-xl border border-[#ff4444]/20 bg-[#ff4444]/10 p-4 text-sm text-red-200">
          Amazon Ads raporlama verileri alınamadı. Bağlantı ayarları korunuyor; tekrar yenilemeyi deneyebilirsiniz.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dashboardStats.map((stat) => {
          const colorMap = {
            green: { bg: 'bg-[#AAFF01]/10', text: 'text-[#AAFF01]' },
            purple: { bg: 'bg-[#7B61FF]/10', text: 'text-[#7B61FF]' },
          };
          const colors = colorMap[stat.color as keyof typeof colorMap];

          return (
            <div key={stat.title} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
              <div className={`text-3xl ${colors.text} mb-1`}>{stat.value}</div>
              <div className="text-sm text-[#A0A0A0]">{stat.detail}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Amazon Kampanya Genel Bakışı</h2>
        {campaignRows.length === 0 ? (
          <EmptyAmazonAdsSection>Henüz kampanya performans verisi bulunmuyor.</EmptyAmazonAdsSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaignRows.map((campaign) => {
              const CampaignIcon = getCampaignIcon(campaign.adProduct);

              return (
                <div key={campaign.id} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFA726]/10 flex items-center justify-center">
                      <CampaignIcon className="w-5 h-5 text-[#FFA726]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-white font-medium">{campaign.name}</h3>
                      <p className="text-xs text-[#A0A0A0]">{formatAdProduct(campaign.adProduct)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[#A0A0A0]">Harcama</span>
                      <span className="text-white">{formatCurrency(campaign.spend, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[#A0A0A0]">Satış</span>
                      <span className="text-white">{formatCurrency(campaign.sales, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[#A0A0A0]">ACOS</span>
                      <span className="text-[#AAFF01]">{formatPercent(campaign.acos)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[#A0A0A0]">ROAS</span>
                      <span className="text-white">{formatNumber(campaign.roas)}x</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Search Term Mining</h2>
        <p className="text-sm text-[#A0A0A0] mb-4">Arama terimi performans analizi</p>
        {searchTermRows.length === 0 ? (
          <EmptyAmazonAdsSection>Henüz arama terimi performans verisi bulunmuyor.</EmptyAmazonAdsSection>
        ) : (
          <div className="space-y-2">
            {searchTermRows.map((st) => {
            const actionColors = {
              green: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
              blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
              red: 'bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444]/20',
            };
            return (
              <div key={st.term} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#7B61FF]" />
                    <h3 className="break-words text-white text-sm">{st.term}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${actionColors[st.actionColor as keyof typeof actionColors]}`}>
                    {st.action}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-[#A0A0A0]">Harcama</div>
                    <div className="text-sm text-white">{st.spend}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0]">Satış</div>
                    <div className="text-sm text-white">{st.sales}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0]">ACOS</div>
                    <div className={`text-sm ${st.acosValue < 25 ? 'text-[#AAFF01]' : 'text-[#ff4444]'}`}>
                      {st.acos}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Ürün Performansı</h2>
          <p className="text-sm text-[#A0A0A0] mb-4">ASIN ve SKU bazlı reklam performansı</p>
          {productRows.length === 0 ? (
            <EmptyAmazonAdsSection>Henüz ürün performans verisi bulunmuyor.</EmptyAmazonAdsSection>
          ) : (
            <div className="space-y-3">
              {productRows.map((product, index) => (
                <div
                  key={`${product.asin ?? product.sku ?? "product"}-${index}`}
                  className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-[#FFA726]" />
                        <span className="truncate text-white text-sm font-medium">
                          {product.title ?? product.asin ?? product.sku ?? "Ürün"}
                        </span>
                      </div>
                      <span className="text-xs text-[#A0A0A0]">
                        ASIN: {product.asin ?? "—"} {product.sku ? `• SKU: ${product.sku}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-white">{formatCurrency(product.spend, currencyCode)}</div>
                      <div className="text-xs text-[#A0A0A0]">Harcama</div>
                    </div>
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-white">{formatNumber(product.clicks)}</div>
                      <div className="text-xs text-[#A0A0A0]">Tık</div>
                    </div>
                    <div className="bg-[#131313] rounded-lg p-2">
                      <div className="text-sm text-[#AAFF01]">{formatNumber(product.roas)}x</div>
                      <div className="text-xs text-[#A0A0A0]">ROAS</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Retail Readiness Checklist</h2>
          <div className="space-y-2">
            {retailReadiness.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-[#202020] rounded-xl p-3 border border-white/[0.08]">
                <span className="text-white text-sm">{item.item}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.status ? 'bg-[#AAFF01]/10' : 'bg-[#A0A0A0]/10'
                }`}>
                  {item.status ? (
                    <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#A0A0A0]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Ajans Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Amazon Ads performansında toplam harcama {formatCurrency(amazonAdsSummary?.spend ?? 0, currencyCode)},
                satış {formatCurrency(amazonAdsSummary?.sales ?? 0, currencyCode)} ve ACOS{' '}
                {formatPercent(amazonAdsSummary?.acos ?? 0)} görünüyor.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                En yüksek hacimli kampanyalarda ROAS trendini korumaya, yüksek ACOS veren arama terimlerinde bütçe
                disiplinini artırmaya odaklanıyoruz.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>
                  ACOS {formatPercent(amazonAdsSummary?.acos ?? 0)} • ROAS{' '}
                  {formatNumber(amazonAdsSummary?.roas ?? 0)}x • {formatNumber(amazonAdsSummary?.orders ?? 0)} sipariş
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Selin Yıldız - Amazon Ads Uzmanı</span>
                <span className="ml-auto">{formatAmazonAdsDateTime(amazonAdsSummary?.lastSyncAt ?? null)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-xl text-white mb-4">Müşteri Aksiyonları</h2>
            <div className="space-y-3">
              {clientActions.map((item, i) => {
                const priorityColors = {
                  high: 'bg-[#ff4444]/10 text-[#ff4444]',
                  medium: 'bg-[#FFA726]/10 text-[#FFA726]',
                };
                return (
                  <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                        {item.priority === 'high' ? 'Acil' : 'Orta'}
                      </span>
                      <span className="text-xs text-[#A0A0A0]">{item.dueDate}</span>
                    </div>
                    <p className="text-white text-sm">{item.action}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAmazonAdsStatusLabel(status: string) {
  if (status === "CONNECTED") {
    return "Bağlı";
  }

  if (status === "PENDING") {
    return "Beklemede";
  }

  if (status === "ERROR") {
    return "Hata";
  }

  if (status === "DISCONNECTED") {
    return "Bağlantı Kesildi";
  }

  return "Bağlı Değil";
}

function formatAmazonAdsDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${formatNumber(value)} ${currencyCode || "TRY"}`;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

function formatDateRangeLabel(value: { since: string; until: string } | undefined) {
  if (!value?.since || !value.until) {
    return "Son 7 gün";
  }

  return `${value.since} - ${value.until}`;
}

function formatAdProduct(value: string | null) {
  if (value === "SPONSORED_BRANDS") {
    return "Sponsored Brands";
  }

  if (value === "SPONSORED_DISPLAY") {
    return "Sponsored Display";
  }

  if (value === "SPONSORED_PRODUCTS") {
    return "Sponsored Products";
  }

  return "Amazon Ads";
}

function getCampaignIcon(adProduct: string | null) {
  if (adProduct === "SPONSORED_BRANDS") {
    return Star;
  }

  if (adProduct === "SPONSORED_DISPLAY") {
    return Eye;
  }

  return Package;
}

function getSearchTermAction(acos: number): { label: string; color: "green" | "blue" | "red" } {
  if (acos > 0 && acos < 25) {
    return { label: "Scale", color: "green" };
  }

  if (acos <= 40) {
    return { label: "Keep", color: "blue" };
  }

  return { label: "Negate", color: "red" };
}

function EmptyAmazonAdsSection({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#202020] p-4 text-sm text-[#A0A0A0]">
      {children}
    </div>
  );
}

function AmazonAdsUnavailableState({
  title,
  description,
  actionLabel,
  onAction,
  disabled = false,
  detail,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  detail?: string;
}) {
  return (
    <div className="p-8">
      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/[0.08]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFA726]/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#FFA726]" />
            </div>
            <div>
              <h1 className="text-2xl text-white mb-2">{title}</h1>
              <p className="text-sm text-[#A0A0A0]">{description}</p>
              {detail ? <p className="mt-3 text-xs text-[#d8ff8f]">{detail}</p> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onAction}
            disabled={disabled}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/[0.12] px-4 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
