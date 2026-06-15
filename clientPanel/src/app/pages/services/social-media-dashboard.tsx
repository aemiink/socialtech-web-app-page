import { useMemo } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Hash,
  Image,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  useGetOwnSocialMediaCalendarQuery,
  useGetOwnSocialMediaConfigQuery,
  useGetOwnSocialMediaSummaryQuery,
} from '../../features/socialMedia/socialMediaApi';
import type { SocialMediaCreativeAsset, SocialMediaPost } from '../../features/socialMedia/socialMediaTypes';
import {
  formatSocialMediaDate,
  getSocialMediaGoalLabel,
  getSocialMediaPlatformLabel,
  getSocialMediaPostStatusLabel,
  getSocialMediaPostTypeLabel,
  getSocialMediaSummaryStateLabel,
  getSocialMediaStatusTone,
  groupPostsByDay,
} from '../../features/socialMedia/socialMediaUtils';

export function SocialMediaDashboard() {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    isFetching: isSummaryFetching,
  } = useGetOwnSocialMediaSummaryQuery();
  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
  } = useGetOwnSocialMediaConfigQuery();
  const {
    data,
    isLoading: isCalendarLoading,
    isError: isCalendarError,
    isFetching: isCalendarFetching,
  } = useGetOwnSocialMediaCalendarQuery({ limit: 80 });
  const posts = data?.posts ?? [];
  const pendingPosts = useMemo(
    () => filterByStatuses(posts, ['WAITING_APPROVAL', 'REVISION_REQUIRED', 'DESIGN', 'APPROVED']),
    [posts],
  );
  const publishedPosts = useMemo(() => filterByStatuses(posts, ['PUBLISHED']), [posts]);
  const upcomingPosts = useMemo(
    () =>
      posts
        .filter((post) => !['PUBLISHED', 'CANCELLED'].includes(post.status))
        .sort(comparePostDates)
        .slice(0, 6),
    [posts],
  );
  const calendarGroups = useMemo(() => groupPostsByDay(posts).slice(0, 7), [posts]);
  const isLoading = isSummaryLoading || isConfigLoading || isCalendarLoading;
  const isError = isSummaryError || isConfigError || isCalendarError;
  const plannedCount = summary?.metrics.plannedPosts ?? upcomingPosts.length;
  const pendingCount = summary?.metrics.pendingApprovals ?? pendingPosts.length;
  const publishedCount = summary?.metrics.publishedPosts ?? publishedPosts.length;
  const creativeCount = summary?.metrics.creativeAssets ?? 0;
  const statusLabel = summary ? getSocialMediaSummaryStateLabel(summary.state) : 'Hazırlanıyor';
  const contentFrequency = config?.contentFrequency ?? summary?.config?.contentFrequency ?? null;
  const primaryGoal = config?.primaryGoal ?? summary?.config?.primaryGoal ?? null;
  const toneOfVoice = config?.toneOfVoice ?? summary?.config?.toneOfVoice ?? null;
  const hashtags = config?.hashtags ?? summary?.config?.hashtags ?? [];
  const agencyNote = config?.notes ?? summary?.config?.notes ?? null;
  const creativeAssets = summary?.creativeAssets ?? [];
  const lastUpdatedAt = summary?.meta.lastUpdatedAt ?? data?.meta.generatedAt ?? null;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Sosyal Medya</h1>
          <p className="text-[#A0A0A0]">İçerik takvimi, onay akışı ve paylaşılan kreatifler</p>
        </div>
        <span className="w-fit rounded border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-xs text-[#A0A0A0]">
          {isSummaryFetching || isCalendarFetching ? 'Güncelleniyor' : `${statusLabel} · ${posts.length} görünür içerik`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Planlanan" value={plannedCount.toString()} icon={Calendar} />
        <KpiCard title="Onay Akışı" value={pendingCount.toString()} icon={AlertCircle} />
        <KpiCard title="Yayınlanan" value={publishedCount.toString()} icon={CheckCircle} />
        <KpiCard title="Kreatifler" value={creativeCount.toString()} icon={Image} />
      </div>

      {isLoading ? (
        <StatusPanel title="Sosyal medya paneli yükleniyor" description="Görünür içerikler, ayarlar ve kreatifler hazırlanıyor." />
      ) : isError ? (
        <StatusPanel title="Sosyal medya verileri alınamadı" description="Panel şu anda görüntülenemiyor. Lütfen daha sonra tekrar deneyin." />
      ) : posts.length === 0 && creativeAssets.length === 0 ? (
        <StatusPanel title="Görünür içerik yok" description="Ajans ekibi takvim veya kreatif paylaştığında burada görünecek." />
      ) : summary?.state === 'WAITING_CONFIG' || summary?.state === 'WAITING_CONTENT_PLAN' ? (
        <StatusPanel title={statusLabel} description="Ajans ekibi Social Media çalışma alanını hazırlıyor." />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentList title="Yaklaşan İçerikler" badge={`${upcomingPosts.length} plan`} posts={upcomingPosts} />
        <ContentList title="Onay Akışı" badge={`${pendingPosts.length} içerik`} posts={pendingPosts.slice(0, 6)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">İçerik Takvimi</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {calendarGroups.length > 0 ? (
              calendarGroups.map((group) => (
                <div key={group.day} className="min-h-32 rounded-lg border border-white/[0.08] bg-[#202020] p-3">
                  <div className="mb-3 text-xs text-[#A0A0A0]">{group.day}</div>
                  <div className="space-y-2">
                    {group.posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="rounded-md bg-[#131313] p-2">
                        <p className="line-clamp-2 text-xs text-white">{post.title}</p>
                        <p className="mt-1 text-[11px] text-[#A0A0A0]">
                          {getSocialMediaPlatformLabel(post.platform)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-lg border border-white/[0.08] bg-[#202020] p-6 text-sm text-[#A0A0A0]">
                Takvimde gösterilecek içerik bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <CreativeAssetsPanel assets={creativeAssets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Yayınlanan İçerikler</h2>
          <div className="space-y-3">
            {publishedPosts.length > 0 ? (
              publishedPosts.slice(0, 5).map((post) => <ContentRow key={post.id} post={post} />)
            ) : (
              <p className="text-sm text-[#A0A0A0]">Henüz yayınlanan görünür içerik yok.</p>
            )}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Strateji Özeti</h2>
          <StrategyRows
            rows={[
              ['İçerik Ritmi', contentFrequency ?? 'Tanımlı değil', Clock],
              ['Ana Hedef', getSocialMediaGoalLabel(primaryGoal), Target],
              ['Marka Tonu', toneOfVoice ?? 'Tanımlı değil', FileText],
              ['Hashtag Seti', hashtags.length > 0 ? hashtags.join(', ') : 'Tanımlı değil', Hash],
            ]}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl text-white mb-2">Sosyal Medya Uzmanı Yorumu</h2>
            {agencyNote ? (
              <p className="text-sm leading-relaxed text-[#D8D8D8]">{agencyNote}</p>
            ) : (
              <p className="text-sm text-[#A0A0A0]">Ajans notu paylaşıldığında burada görünecek.</p>
            )}
            <div className="mt-4 flex items-center gap-2 text-sm text-[#A0A0A0]">
              <Eye className="h-4 w-4 text-[#AAFF01]" />
              <span>
                Portalda yalnızca müşteri görünür içerikler listelenir.
                {lastUpdatedAt ? ` Son güncelleme: ${formatSocialMediaDate(lastUpdatedAt)}.` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon }: { title: string; value: string; icon: LucideIcon }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[#A0A0A0] text-sm">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#AAFF01]" />
        </div>
      </div>
      <div className="text-3xl text-white">{value}</div>
    </div>
  );
}

function ContentList({ title, badge, posts }: { title: string; badge: string; posts: SocialMediaPost[] }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-white">{title}</h2>
        <span className="px-2 py-1 rounded bg-[#FFA726]/10 text-[#FFA726] text-xs">{badge}</span>
      </div>
      <div className="space-y-3">
        {posts.length > 0 ? (
          posts.map((post) => <ContentRow key={post.id} post={post} />)
        ) : (
          <p className="text-sm text-[#A0A0A0]">Bu bölüm için içerik yok.</p>
        )}
      </div>
    </div>
  );
}

function ContentRow({ post }: { post: SocialMediaPost }) {
  return (
    <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="mb-2 break-words text-white">{post.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
              {getSocialMediaPlatformLabel(post.platform)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[#A0A0A0]">
              {getSocialMediaPostTypeLabel(post.type)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${getSocialMediaStatusTone(post.status)}`}>
              {getSocialMediaPostStatusLabel(post.status)}
            </span>
          </div>
          {post.caption ? <p className="mt-3 line-clamp-2 text-sm text-[#A0A0A0]">{post.caption}</p> : null}
        </div>
        <div className="shrink-0 text-right text-xs text-[#A0A0A0]">
          <Calendar className="ml-auto mb-1 h-4 w-4 text-[#AAFF01]" />
          {formatSocialMediaDate(post.scheduledAt ?? post.publishedAt)}
        </div>
      </div>
    </div>
  );
}

function CreativeAssetsPanel({ assets }: { assets: SocialMediaCreativeAsset[] }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl text-white">Kreatifler</h2>
        <span className="rounded border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-2 py-1 text-xs text-[#00D4FF]">
          {assets.length} dosya
        </span>
      </div>
      <div className="space-y-3">
        {assets.length > 0 ? (
          assets.slice(0, 4).map((asset) => (
            <a
              key={asset.id}
              href={asset.secureUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#202020] p-3 transition-colors hover:border-[#AAFF01]/30"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#131313]">
                {asset.mimeType.startsWith('image/') ? (
                  <img src={asset.secureUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileText className="h-5 w-5 text-[#AAFF01]" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{asset.title}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">{asset.project.name || asset.category}</p>
              </div>
            </a>
          ))
        ) : (
          <p className="text-sm text-[#A0A0A0]">Paylaşılan kreatif dosya yok.</p>
        )}
      </div>
    </div>
  );
}

function StrategyRows({ rows }: { rows: Array<[string, string, LucideIcon]> }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {rows.map(([label, value, Icon]) => (
        <div key={label} className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#202020] p-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#AAFF01]/10">
              <Icon className="h-5 w-5 text-[#AAFF01]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#A0A0A0]">{label}</p>
              <p className="mt-1 break-words text-sm text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
      <p className="text-white">{title}</p>
      <p className="mt-1 text-sm text-[#A0A0A0]">{description}</p>
    </div>
  );
}

function filterByStatuses(posts: SocialMediaPost[], statuses: SocialMediaPost['status'][]): SocialMediaPost[] {
  return posts.filter((post) => statuses.includes(post.status));
}

function comparePostDates(first: SocialMediaPost, second: SocialMediaPost): number {
  return getPostTime(first) - getPostTime(second);
}

function getPostTime(post: SocialMediaPost): number {
  const date = new Date(post.scheduledAt ?? post.publishedAt ?? post.createdAt);
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
}
