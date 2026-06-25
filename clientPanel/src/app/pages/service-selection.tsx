import { useMemo } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Video,
  Megaphone,
  Search,
  ShoppingCart,
  Code,
  Smartphone,
  FileText,
  Palette,
  Headphones,
  BarChart3,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import type { ServiceId } from '../data/service-pages';
import { normalizeServiceId } from '../features/auth/authNormalizers';
import { useGetClientGrowthHubSummaryQuery } from '../features/growthHub/growthHubApi';
import { useGetOwnSocialMediaSummaryQuery } from '../features/socialMedia/socialMediaApi';
import { useGetOwnMetaAdsSummaryQuery } from '../features/metaAds/metaAdsApi';
import { useGetOwnTikTokAdsSummaryQuery } from '../features/tiktokAds/tiktokAdsApi';
import { useGetOwnAmazonAdsSummaryQuery } from '../features/amazonAds/amazonAdsApi';
import { useGetOwnWebMobileDesignSummaryQuery } from '../features/webMobileDesign/webMobileDesignApi';
import { useGetOwnTechnicalSupportSummaryQuery } from '../features/technicalSupport/technicalSupportApi';
import { useGetOwnSeoAuditSummaryQuery } from '../features/seoAudit/seoAuditApi';
import { useGetClientProjectsQuery, type ClientProject } from '../features/projects/projectsApi';
import { useGetClientTasksQuery } from '../features/tasks/tasksApi';
import type { ClientTask } from '../features/tasks/tasksTypes';
import { useGetClientMeetingRequestsQuery, useGetWebAppWorkspaceQuery } from '../features/webAppWorkspace/webAppWorkspaceApi';
import type { WebAppWorkspaceResponse, WorkspaceMeetingRequest } from '../features/webAppWorkspace/webAppWorkspaceTypes';

interface Service {
  id: ServiceId;
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'active' | 'inactive';
  metrics?: ServiceMetric[];
}

type ServiceMetric = { label: string; value: string };

const services: Service[] = [
  {
    id: 'growth-hub',
    title: 'Growth & Hub',
    description: 'Büyüme stratejisi, sosyal medya, reklamlar ve raporlama',
    icon: TrendingUp,
    status: 'active',
    metrics: [{ label: 'Toplam Lead', value: '—' }, { label: 'ROAS', value: '—' }],
  },
  {
    id: 'social-media',
    title: 'Sosyal Medya Yönetimi',
    description: 'İçerik planlama, üretim, DM yönetimi ve rakip analizi',
    icon: MessageSquare,
    status: 'active',
    metrics: [{ label: 'Yayınlanan', value: '—' }, { label: 'Bekleyen', value: '—' }],
  },
  {
    id: 'media-hub',
    title: 'Medya Hub',
    description: 'Tüm reklam kanallarının birleşik yönetimi',
    icon: Video,
    status: 'active',
    metrics: [{ label: 'Toplam Harcama', value: '—' }, { label: 'Blended ROAS', value: '—' }],
  },
  {
    id: 'meta-ads',
    title: 'Meta ADS',
    description: 'Facebook ve Instagram reklam kampanyaları',
    icon: Megaphone,
    status: 'active',
    metrics: [{ label: 'ROAS', value: '—' }, { label: 'Dönüşüm', value: '—' }],
  },
  {
    id: 'tiktok-ads',
    title: 'TikTok ADS',
    description: 'TikTok reklam kampanyaları ve UGC içerik',
    icon: Video,
    status: 'active',
    metrics: [{ label: 'CTR', value: '—' }, { label: 'CPA', value: '—' }],
  },
  {
    id: 'google-ads',
    title: 'Google ADS',
    description: 'Arama, Display ve Performance Max kampanyaları',
    icon: Search,
    status: 'active',
    metrics: [{ label: 'Dönüşüm', value: '—' }, { label: 'CPA', value: '—' }],
  },
  {
    id: 'amazon-ads',
    title: 'Amazon ADS',
    description: 'Amazon Sponsored Products, Brands ve Display',
    icon: ShoppingCart,
    status: 'active',
    metrics: [{ label: 'ACOS', value: '—' }, { label: 'Satış', value: '—' }],
  },
  {
    id: 'web-app',
    title: 'Web APP',
    description: 'Web uygulama geliştirme ve SEO yapısı',
    icon: Code,
    status: 'active',
    metrics: [{ label: 'İlerleme', value: '—' }, { label: 'Sprint', value: '—' }],
  },
  {
    id: 'mobile-app',
    title: 'Mobil APP',
    description: 'iOS ve Android uygulama geliştirme',
    icon: Smartphone,
    status: 'active',
    metrics: [{ label: 'Ekranlar', value: '—' }, { label: 'Build', value: '—' }],
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    description: 'Dönüşüm odaklı açılış sayfaları',
    icon: FileText,
    status: 'active',
    metrics: [{ label: 'Aktif', value: '—' }, { label: 'CVR', value: '—' }],
  },
  {
    id: 'web-mobile-design',
    title: 'Web & Mobil Tasarımlar',
    description: 'UI/UX tasarım, design system ve prototip',
    icon: Palette,
    status: 'active',
    metrics: [{ label: 'Ekranlar', value: '—' }, { label: 'Revizyon', value: '—' }],
  },
  {
    id: 'technical-support',
    title: 'Teknik Destek',
    description: 'Bakım, güvenlik, backup ve teknik destek',
    icon: Headphones,
    status: 'active',
    metrics: [{ label: 'Açık Talep', value: '—' }, { label: 'Uptime', value: '—' }],
  },
  {
    id: 'seo-audit',
    title: 'SEO Denetimi',
    description: 'SEO audit, teknik SEO ve anahtar kelime optimizasyonu',
    icon: BarChart3,
    status: 'active',
    metrics: [{ label: 'SEO Skor', value: '—' }, { label: 'Açık Görev', value: '—' }],
  },
];

interface ServiceSelectionPageProps {
  onServiceSelect: (serviceId: ServiceId) => void;
  onLogout: () => void;
  clientName: string;
  companyName: string;
  availableServiceIds: ServiceId[];
}

export function ServiceSelectionPage({
  onServiceSelect,
  onLogout,
  clientName,
  companyName,
  availableServiceIds,
}: ServiceSelectionPageProps) {
  const availableServiceIdSet = useMemo(() => new Set<ServiceId>(availableServiceIds), [availableServiceIds]);
  const activeServices = availableServiceIdSet.size;
  const shouldFetchClientOperations = activeServices > 0;

  const { data: clientProjects = [] } = useGetClientProjectsQuery(undefined, {
    skip: !shouldFetchClientOperations,
  });
  const { data: clientTasks = [] } = useGetClientTasksQuery(undefined, {
    skip: !shouldFetchClientOperations,
  });
  const { data: meetingRequests = [] } = useGetClientMeetingRequestsQuery(undefined, {
    skip: !shouldFetchClientOperations,
  });

  const webAppProjectId = useMemo(
    () => getPrimaryProjectIdForService(clientProjects, 'web-app'),
    [clientProjects],
  );
  const { data: webAppWorkspace } = useGetWebAppWorkspaceQuery(
    { projectId: webAppProjectId ?? '', tabKey: 'OVERVIEW' },
    { skip: !availableServiceIdSet.has('web-app') || !webAppProjectId },
  );

  const projectServiceIdById = useMemo(() => buildProjectServiceIdMap(clientProjects), [clientProjects]);
  const tasksByServiceId = useMemo(
    () => groupClientTasksByService(clientTasks, projectServiceIdById),
    [clientTasks, projectServiceIdById],
  );
  const projectsByServiceId = useMemo(() => groupProjectsByService(clientProjects), [clientProjects]);

  const { data: growthHubSummary } = useGetClientGrowthHubSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('growth-hub'),
  });
  const { data: socialSummary } = useGetOwnSocialMediaSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('social-media'),
  });
  const { data: metaAdsSummary } = useGetOwnMetaAdsSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('meta-ads'),
  });
  const { data: tiktokAdsSummary } = useGetOwnTikTokAdsSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('tiktok-ads'),
  });
  const { data: amazonAdsSummary } = useGetOwnAmazonAdsSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('amazon-ads'),
  });
  const { data: webMobileDesignSummary } = useGetOwnWebMobileDesignSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('web-mobile-design'),
  });
  const { data: techSupportSummary } = useGetOwnTechnicalSupportSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('technical-support'),
  });
  const { data: seoAuditSummary } = useGetOwnSeoAuditSummaryQuery(undefined, {
    skip: !availableServiceIdSet.has('seo-audit'),
  });

  const totalPendingApprovals = useMemo(() => {
    const taskPendingApprovals = clientTasks.filter(isPendingClientApproval).length;
    const domainPendingApprovals =
      (growthHubSummary?.metrics.pendingApprovals ?? 0) +
      (socialSummary?.metrics.pendingApprovals ?? 0) +
      (webMobileDesignSummary?.approvalStats.pending ?? 0);

    return Math.max(taskPendingApprovals, domainPendingApprovals);
  }, [clientTasks, growthHubSummary, socialSummary, webMobileDesignSummary]);

  const nextMeetingLabel = useMemo(() => getNextMeetingLabel(meetingRequests), [meetingRequests]);

  function getRealMetrics(serviceId: ServiceId): ServiceMetric[] | null {
    const serviceTasks = tasksByServiceId.get(serviceId) ?? [];
    const serviceProjects = projectsByServiceId.get(serviceId) ?? [];

    switch (serviceId) {
      case 'growth-hub':
        if (!growthHubSummary) return null;
        return [
          { label: 'Toplam Lead', value: String(growthHubSummary.metrics.totalLeads) },
          {
            label: 'ROAS',
            value: growthHubSummary.metrics.blendedRoas
              ? `${growthHubSummary.metrics.blendedRoas.toFixed(1)}x`
              : '—',
          },
        ];
      case 'social-media':
        if (!socialSummary) return null;
        return [
          { label: 'Yayınlanan', value: String(socialSummary.metrics.publishedPosts) },
          { label: 'Bekleyen', value: String(socialSummary.metrics.pendingApprovals) },
        ];
      case 'meta-ads':
        if (!metaAdsSummary) return null;
        return [
          {
            label: 'ROAS',
            value: formatRoas(metaAdsSummary.roas),
          },
          { label: 'Dönüşüm', value: formatNumber(metaAdsSummary.results) },
        ];
      case 'tiktok-ads':
        if (!tiktokAdsSummary) return null;
        return [
          { label: 'CTR', value: formatPercentMetric(tiktokAdsSummary.ctr) },
          { label: 'CPA', value: formatCurrencyMetric(tiktokAdsSummary.costPerConversion) },
        ];
      case 'amazon-ads':
        if (!amazonAdsSummary) return null;
        return [
          { label: 'ACOS', value: formatPercentMetric(amazonAdsSummary.acos) },
          { label: 'Satış', value: formatCurrencyMetric(amazonAdsSummary.sales) },
        ];
      case 'media-hub': {
        const mediaMetrics = getMediaHubMetrics(metaAdsSummary, tiktokAdsSummary, amazonAdsSummary, serviceTasks);
        return mediaMetrics ?? getOperationalMetrics(serviceTasks, serviceProjects, 'Harcama', 'Aksiyon');
      }
      case 'web-app':
        return getWebAppMetrics(webAppWorkspace, serviceTasks, serviceProjects);
      case 'mobile-app':
        return getOperationalMetrics(serviceTasks, serviceProjects, 'İlerleme', 'Görev');
      case 'landing-pages':
        return getOperationalMetrics(serviceTasks, serviceProjects, 'İlerleme', 'Aktif');
      case 'google-ads':
        return getOperationalMetrics(serviceTasks, serviceProjects, 'İlerleme', 'Aksiyon');
      case 'web-mobile-design':
        if (!webMobileDesignSummary) {
          return getOperationalMetrics(serviceTasks, serviceProjects, 'İlerleme', 'Revizyon');
        }
        return [
          { label: 'İlerleme', value: `%${webMobileDesignSummary.progressPercent}` },
          { label: 'Revizyon', value: formatNumber(webMobileDesignSummary.revisionCount) },
        ];
      case 'technical-support':
        if (!techSupportSummary) return null;
        return [
          { label: 'Açık Talep', value: formatNumber(techSupportSummary.openTicketCount) },
          {
            label: 'Uptime',
            value:
              techSupportSummary.config?.uptimeTarget != null
                ? `%${techSupportSummary.config.uptimeTarget}`
                : '—',
          },
        ];
      case 'seo-audit':
        if (!seoAuditSummary) return null;
        return [
          {
            label: 'SEO Skor',
            value:
              seoAuditSummary.config?.lastAuditScore != null
                ? `%${seoAuditSummary.config.lastAuditScore}`
                : '—',
          },
          {
            label: 'Açık Görev',
            value: formatNumber(seoAuditSummary.taskStats.total - seoAuditSummary.taskStats.done),
          },
        ];
      default:
        return null;
    }
  }

  const serviceCards = services
    .map((service, index) => {
      const isActive = availableServiceIdSet.has(service.id);
      const realMetrics = isActive ? getRealMetrics(service.id) : null;

      return {
        ...service,
        order: index,
        isActive,
        displayMetrics: realMetrics ?? service.metrics,
      };
    })
    .sort((first, second) =>
      Number(second.isActive) - Number(first.isActive) || first.order - second.order,
    );
  const activeServicesLabel = activeServices > 0 ? String(activeServices) : '0';
  const nextMeetingValue = activeServices > 0 ? nextMeetingLabel ?? '—' : '—';

  const cardGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {serviceCards.map((service) => {
        const Icon = service.icon;
        const displayMetrics = service.displayMetrics;

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => {
              if (service.isActive) {
                onServiceSelect(service.id);
              }
            }}
            disabled={!service.isActive}
            className={`rounded-xl border p-6 text-left flex flex-col transition-all ${
              service.isActive
                ? 'border-border bg-card hover:border-primary/40 hover:shadow-[0_0_30px_rgba(170,255,1,0.08)] cursor-pointer'
                : 'border-white/[0.06] bg-[#171717] opacity-70 cursor-not-allowed'
            }`}
          >
            <div
              className={`rounded-lg p-3 w-10 h-10 flex items-center justify-center mb-4 flex-shrink-0 ${
                service.isActive ? 'bg-primary/10' : 'bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-5 h-5 ${service.isActive ? 'text-primary' : 'text-[#A0A0A0]'}`} />
            </div>

            <h3 className="text-sm font-medium text-white mb-1">{service.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{service.description}</p>

            {displayMetrics && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {displayMetrics.map((metric, i) => (
                  <div key={`${service.id}-${metric.label}-${i}`} className="bg-card-surface rounded-lg p-2">
                    <div className="text-sm text-white">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-auto">
              <span
                className={`text-xs px-3 py-1 rounded-lg border ${
                  service.isActive
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-white/[0.04] text-[#A0A0A0] border-white/[0.08]'
                }`}
              >
                {service.isActive ? 'Aktif' : 'Keşfet'}
              </span>
              <span className={service.isActive ? 'text-primary text-sm' : 'text-[#606060] text-sm'}>
                {service.isActive ? '→' : '+'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#131313] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl text-white mb-2">Hangi hizmet panelini görüntülemek istiyorsunuz?</h1>
            <p className="text-[#A0A0A0] text-lg">Aktif hizmetlerinizin detaylarına göz atın</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-3">
            <div className="text-right">
              <div className="text-sm text-white">{clientName}</div>
              <div className="text-xs text-[#A0A0A0]">{companyName}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-sm text-[#A0A0A0] transition-all hover:border-[#AAFF01]/30 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-[#AAFF01] mb-1">{activeServicesLabel}</div>
            <div className="text-sm text-[#A0A0A0]">Aktif Hizmet</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-[#FFA726] mb-1">
              {activeServices > 0 ? totalPendingApprovals : '0'}
            </div>
            <div className="text-sm text-[#A0A0A0]">Bekleyen Onay</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-white mb-1">—</div>
            <div className="text-sm text-[#A0A0A0]">Son Rapor</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-3xl text-white mb-1">{nextMeetingValue}</div>
            <div className="text-sm text-[#A0A0A0]">Sonraki Toplantı</div>
          </div>
        </div>

        {activeServices === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.04]">
              <BarChart3 className="h-7 w-7 text-[#A0A0A0]" />
            </div>
            <h2 className="mb-2 text-2xl text-white">Aktif hizmet bulunmuyor</h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#A0A0A0]">
              Bu hesap için aktif satın alınmış hizmet görünmüyor. Social Tech hizmet kataloğunu aşağıda inceleyebilirsiniz.
            </p>
          </div>
        ) : null}

        <div className={activeServices === 0 ? 'mt-6' : ''}>{cardGrid}</div>
      </div>
    </div>
  );
}

function getPrimaryProjectIdForService(projects: ClientProject[], serviceId: ServiceId): string | null {
  return projects.find((project) => normalizeServiceId(project.serviceKey) === serviceId)?.id ?? null;
}

function buildProjectServiceIdMap(projects: ClientProject[]): Map<string, ServiceId> {
  const map = new Map<string, ServiceId>();

  for (const project of projects) {
    const serviceId = normalizeServiceId(project.serviceKey);
    if (serviceId) {
      map.set(project.id, serviceId);
    }
  }

  return map;
}

function groupProjectsByService(projects: ClientProject[]): Map<ServiceId, ClientProject[]> {
  const map = new Map<ServiceId, ClientProject[]>();

  for (const project of projects) {
    const serviceId = normalizeServiceId(project.serviceKey);
    if (!serviceId) continue;
    const list = map.get(serviceId) ?? [];
    list.push(project);
    map.set(serviceId, list);
  }

  return map;
}

function groupClientTasksByService(
  tasks: ClientTask[],
  projectServiceIdById: Map<string, ServiceId>,
): Map<ServiceId, ClientTask[]> {
  const map = new Map<ServiceId, ClientTask[]>();

  for (const task of tasks) {
    const serviceId = task.projectServiceId ?? (task.projectId ? projectServiceIdById.get(task.projectId) : null);
    if (!serviceId) continue;
    const list = map.get(serviceId) ?? [];
    list.push(task);
    map.set(serviceId, list);
  }

  return map;
}

function isPendingClientApproval(task: ClientTask): boolean {
  return task.approvalRequired === true && task.approvalStatus === 'PENDING';
}

function getOperationalMetrics(
  tasks: ClientTask[],
  projects: ClientProject[],
  progressLabel: string,
  countLabel: string,
): ServiceMetric[] {
  const progress = calculateAverageTaskProgress(tasks);
  const count = countLabel === 'Aktif' ? projects.length : tasks.length;

  return [
    { label: progressLabel, value: progress === null ? '—' : `%${progress}` },
    { label: countLabel, value: formatNumber(count) },
  ];
}

function getWebAppMetrics(
  workspace: WebAppWorkspaceResponse | undefined,
  tasks: ClientTask[],
  projects: ClientProject[],
): ServiceMetric[] {
  const workspaceTasks = workspace?.sourceOfTruth?.tasks ?? [];
  const workspaceSprints = workspace?.sourceOfTruth?.sprints ?? [];
  const workspaceProgress = calculateAverageProgress(
    workspaceTasks
      .map((task) => task.progressPercent)
      .filter((progress): progress is number => typeof progress === 'number'),
  );
  const taskProgress = calculateAverageTaskProgress(tasks);
  const progress = workspaceProgress ?? taskProgress;
  const sprintCount =
    workspaceSprints.length > 0
      ? workspaceSprints.length
      : new Set(tasks.map((task) => task.sprint?.id).filter(Boolean)).size;

  return [
    { label: 'İlerleme', value: progress !== null ? `%${progress}` : projects.length > 0 ? '%0' : '—' },
    { label: 'Sprint', value: formatNumber(sprintCount) },
  ];
}

function getMediaHubMetrics(
  metaSummary: { spend: number; roas: number | null } | undefined,
  tiktokSummary: { spend: number; purchaseValue: number } | undefined,
  amazonSummary: { spend: number; sales: number } | undefined,
  tasks: ClientTask[],
): ServiceMetric[] | null {
  const totalSpend =
    (metaSummary?.spend ?? 0) +
    (tiktokSummary?.spend ?? 0) +
    (amazonSummary?.spend ?? 0);
  const estimatedRevenue =
    (metaSummary?.roas != null ? metaSummary.spend * metaSummary.roas : 0) +
    (tiktokSummary?.purchaseValue ?? 0) +
    (amazonSummary?.sales ?? 0);

  if (totalSpend <= 0 && tasks.length === 0) {
    return null;
  }

  return [
    { label: 'Toplam Harcama', value: totalSpend > 0 ? formatCurrencyMetric(totalSpend) : '—' },
    { label: 'Blended ROAS', value: totalSpend > 0 ? formatRoas(estimatedRevenue / totalSpend) : '—' },
  ];
}

function calculateAverageTaskProgress(tasks: ClientTask[]): number | null {
  return calculateAverageProgress(tasks.map((task) => task.progressPercent));
}

function calculateAverageProgress(values: number[]): number | null {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (validValues.length === 0) {
    return null;
  }

  return Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
}

function getNextMeetingLabel(requests: WorkspaceMeetingRequest[]): string | null {
  const now = Date.now();
  const nextMeeting = requests
    .map((request) => request.scheduledStartAt ?? request.preferredStartAt)
    .filter((date): date is string => typeof date === 'string')
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() >= now)
    .sort((first, second) => first.getTime() - second.getTime())[0];

  if (!nextMeeting) {
    return null;
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(nextMeeting);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function formatCurrencyMetric(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: value >= 1000 ? 0 : 1,
    notation: value >= 1000 ? 'compact' : 'standard',
  }).format(value);
}

function formatPercentMetric(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  return `%${value.toFixed(1)}`;
}

function formatRoas(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  return `${value.toFixed(1)}x`;
}
