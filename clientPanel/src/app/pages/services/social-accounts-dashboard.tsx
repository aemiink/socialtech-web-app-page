import { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Grid3X3,
  Heart,
  Layers,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  useGetOwnSocialMediaConfigQuery,
  useGetOwnSocialMediaInsightsQuery,
  useGetOwnSocialMediaPostsQuery,
} from "../../features/socialMedia/socialMediaApi";
import type { SocialMediaPlatform, SocialMediaPost } from "../../features/socialMedia/socialMediaTypes";
import {
  formatSocialMediaDate,
  getSocialMediaPostStatusLabel,
  getSocialMediaPostTypeLabel,
  getSocialMediaStatusTone,
} from "../../features/socialMedia/socialMediaUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

function fmtPct(v: number): string {
  return `%${v.toFixed(1)}`;
}

function fmtRel(iso: string | null): string {
  if (!iso) return "—";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

function firstImageUrl(post: SocialMediaPost): string | null {
  if (post.externalMediaUrl) return post.externalMediaUrl;
  const asset = post.assets.find((a) => a.file?.mimeType?.startsWith("image/"));
  return asset?.file?.secureUrl ?? null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

// ─── Platform Selector ────────────────────────────────────────────────────────

type ActivePlatform = "INSTAGRAM" | "FACEBOOK";

function PlatformTab({
  platform,
  isActive,
  isConnected,
  identifier,
  onClick,
}: {
  platform: ActivePlatform;
  isActive: boolean;
  isConnected: boolean;
  identifier: string | null;
  onClick: () => void;
}) {
  const ig = platform === "INSTAGRAM";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 ${
        isActive
          ? ig
            ? "border-[#E1306C]/30 bg-gradient-to-br from-[#833AB4]/[0.08] via-[#E1306C]/[0.05] to-[#FCB045]/[0.04] ring-1 ring-[#E1306C]/20"
            : "border-[#1877F2]/30 bg-gradient-to-br from-[#1877F2]/[0.08] to-[#1877F2]/[0.03] ring-1 ring-[#1877F2]/20"
          : "border-white/[0.08] bg-[#1A1A1A] hover:border-white/[0.15] hover:bg-[#1E1E1E]"
      }`}
    >
      {/* Ambient glow for active */}
      {isActive && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
          style={{
            background: ig
              ? "radial-gradient(circle, #E1306C18, transparent)"
              : "radial-gradient(circle, #1877F218, transparent)",
          }}
        />
      )}

      {/* Platform icon */}
      <div
        className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
        style={{
          background: ig
            ? "linear-gradient(135deg, #833AB4, #E1306C, #FCB045)"
            : "#1877F2",
        }}
      >
        {ig ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white">{ig ? "Instagram" : "Facebook"}</p>
          <span
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              isConnected
                ? "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#AAFF01]"
                : "border-white/[0.10] bg-white/[0.05] text-[#606060]"
            }`}
          >
            {isConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {isConnected ? "Bağlı" : "Bağlı Değil"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-[#A0A0A0]">
          {identifier
            ? ig
              ? `@${identifier.replace(/^@+/, "")}`
              : identifier
            : "Hesap bilgisi tanımlı değil"}
        </p>
        {isActive && (
          <p className="mt-1.5 text-[11px] font-medium" style={{ color: ig ? "#E1306C" : "#1877F2" }}>
            ● Seçili hesap
          </p>
        )}
      </div>
    </button>
  );
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────

function KpiRow({
  totals,
  loading,
  igImpressions,
  igProfileViews,
  igWebsiteClicks,
}: {
  totals: { impressions: number; reach: number; likes: number; comments: number; shares: number; saves: number; profileVisits: number; follows: number; clicks: number; engagementRate: number } | undefined;
  loading: boolean;
  igImpressions?: number | null;
  igProfileViews?: number | null;
  igWebsiteClicks?: number | null;
}) {
  const impressionsVal = totals?.impressions
    ? fmt(totals.impressions)
    : igImpressions
      ? fmt(igImpressions)
      : "—";
  const profileVisitsVal = totals?.profileVisits
    ? fmt(totals.profileVisits)
    : igProfileViews
      ? fmt(igProfileViews)
      : "—";
  const clicksVal = totals?.clicks
    ? fmt(totals.clicks)
    : igWebsiteClicks
      ? fmt(igWebsiteClicks)
      : "—";

  const tiles = [
    { icon: Eye,              label: "Gösterim",        value: impressionsVal,                            accent: "#00D4FF" },
    { icon: Users,            label: "Erişim",          value: totals ? fmt(totals.reach)        : "—", accent: "#AAFF01" },
    { icon: Activity,         label: "Etkileşim",       value: totals ? fmtPct(totals.engagementRate) : "—", accent: "#7B61FF" },
    { icon: Heart,            label: "Beğeni",          value: totals ? fmt(totals.likes)        : "—", accent: "#E1306C" },
    { icon: MessageCircle,    label: "Yorum",           value: totals ? fmt(totals.comments)     : "—", accent: "#00D4FF" },
    { icon: Bookmark,         label: "Kaydetme",        value: totals ? fmt(totals.saves)        : "—", accent: "#FFA726" },
    { icon: Share2,           label: "Paylaşım",        value: totals ? fmt(totals.shares)       : "—", accent: "#CFCFCF" },
    { icon: TrendingUp,       label: "Profil Ziyareti", value: profileVisitsVal,                          accent: "#7B61FF" },
    { icon: Users,            label: "Yeni Takipçi",    value: totals?.follows ? fmt(totals.follows) : "—", accent: "#AAFF01" },
    { icon: MousePointerClick,label: "Tıklama",         value: clicksVal,                                 accent: "#00D4FF" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {tiles.map(({ icon: Icon, label, value, accent }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/[0.06] bg-[#1A1A1A] p-4 border-l-2"
          style={{ borderLeftColor: accent }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wide text-[#808080]">{label}</span>
            <Icon className="h-3 w-3" style={{ color: accent }} />
          </div>
          {loading ? (
            <Skeleton className="h-6 w-14" />
          ) : (
            <p className="text-xl font-bold text-white">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Instagram View ───────────────────────────────────────────────────────────

function InstagramProfile({
  username,
  accountId,
  profilePictureUrl,
  isConnected,
  lastSyncAt,
  postCount,
  followerCount,
  hashtags,
  toneOfVoice,
}: {
  username: string | null;
  accountId: string | null;
  profilePictureUrl: string | null;
  isConnected: boolean;
  lastSyncAt: string | null;
  postCount: number;
  followerCount: number | null;
  hashtags: string[];
  toneOfVoice: string | null;
}) {
  const cleanUsername = username?.replace(/^@+/, "") ?? null;
  const handle = cleanUsername ?? accountId ?? "—";
  const initials = handle.substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, "") || "IG";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E1306C]/20 bg-[#0F0F0F] p-6">
      {/* Instagram gradient background shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ background: "linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #FCB045 100%)" }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #E1306C10, transparent)" }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-20 w-20 rounded-full p-[3px]"
            style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #FCB045)" }}
          >
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={handle}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1A1A1A] text-xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>
          {isConnected && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0F0F0F] bg-[#AAFF01]">
              <CheckCircle2 className="h-3 w-3 text-black" />
            </span>
          )}
        </div>

        {/* Profile info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-white">
              {cleanUsername ? `@${cleanUsername}` : handle}
            </h2>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isConnected
                ? "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#AAFF01]"
                : "border-white/[0.10] bg-white/[0.05] text-[#606060]"
            }`}>
              {isConnected ? "Hesap Bağlı" : "Bağlı Değil"}
            </span>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center gap-5 text-sm">
            <div className="text-center">
              <p className="font-bold text-white">{postCount}</p>
              <p className="text-xs text-[#A0A0A0]">Gönderi</p>
            </div>
            {followerCount !== null && followerCount !== undefined && (
              <>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div className="text-center">
                  <p className="font-bold text-white">{fmt(followerCount)}</p>
                  <p className="text-xs text-[#A0A0A0]">Takipçi</p>
                </div>
              </>
            )}
            {accountId && (
              <div className="h-8 w-px bg-white/[0.08]" />
            )}
            {accountId && (
              <p className="text-xs text-[#606060]">ID: {accountId}</p>
            )}
          </div>

          {/* Bio / tone */}
          {toneOfVoice && (
            <p className="mt-3 text-sm text-[#A0A0A0]">
              Marka Tonu: <span className="text-white">{toneOfVoice}</span>
            </p>
          )}

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hashtags.slice(0, 8).map((tag) => (
                <span key={tag} className="text-xs font-medium" style={{ color: "#E1306C" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {lastSyncAt && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#606060]">
              <RefreshCw className="h-3 w-3" />
              Son senkron: {fmtRel(lastSyncAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type GridTab = "PUBLISHED" | "SCHEDULED" | "APPROVAL";

function InstagramGrid({ posts, loading }: { posts: SocialMediaPost[]; loading: boolean }) {
  const [activeTab, setActiveTab] = useState<GridTab>("PUBLISHED");

  const published  = posts.filter((p) => p.status === "PUBLISHED");
  const scheduled  = posts.filter((p) => ["SCHEDULED", "APPROVED"].includes(p.status));
  const approval   = posts.filter((p) => ["WAITING_APPROVAL", "REVISION_REQUIRED", "DESIGN"].includes(p.status));

  const tabs: { id: GridTab; label: string; count: number }[] = [
    { id: "PUBLISHED",  label: "Gönderiler",         count: published.length },
    { id: "SCHEDULED",  label: "Planlananlar",        count: scheduled.length },
    { id: "APPROVAL",   label: "Onay Bekleyen",       count: approval.length  },
  ];

  const visible = activeTab === "PUBLISHED" ? published : activeTab === "SCHEDULED" ? scheduled : approval;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0F0F0F] overflow-hidden">
      {/* Tab bar — mimics Instagram's icon tab bar */}
      <div className="flex border-b border-white/[0.08]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-white text-white"
                : "text-[#606060] hover:text-[#A0A0A0]"
            }`}
            style={activeTab === tab.id ? { borderBottomColor: "#E1306C" } : {}}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-none" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Grid3X3 className="mb-3 h-10 w-10 text-[#303030]" />
          <p className="text-sm text-[#606060]">Bu kategoride içerik yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {visible.map((post) => {
            const imgUrl = firstImageUrl(post);
            const insight = null; // insights aggregated, not per-post here

            return (
              <div key={post.id} className="group relative aspect-square overflow-hidden bg-[#1A1A1A]">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                        <span className="text-[10px] font-medium text-[#A0A0A0]">
                          {getSocialMediaPostTypeLabel(post.type).substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/70 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex justify-end">
                    <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${getSocialMediaStatusTone(post.status)}`}>
                      {getSocialMediaPostStatusLabel(post.status)}
                    </span>
                  </div>
                  <div>
                    <p className="line-clamp-2 text-[11px] font-medium text-white">{post.title}</p>
                    {post.caption && (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-white/60">{post.caption}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2.5 text-[10px] text-white/70">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-2.5 w-2.5" /> —
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-2.5 w-2.5" /> —
                      </span>
                      {post.externalPostUrl && (
                        <a
                          href={post.externalPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-0.5 text-[#E1306C]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-[9px] text-white/40">
                      {formatSocialMediaDate(post.publishedAt ?? post.scheduledAt)}
                    </p>
                  </div>
                </div>

                {/* Multi-image indicator */}
                {post.assets.length > 1 && (
                  <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-0">
                    <Layers className="h-3.5 w-3.5 text-white drop-shadow" />
                  </div>
                )}
                {post.assets.length > 1 && (
                  <div className="absolute right-1.5 top-1.5">
                    <Layers className="h-3.5 w-3.5 text-white drop-shadow" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Facebook View ────────────────────────────────────────────────────────────

function FacebookProfile({
  pageId,
  pageName,
  profilePictureUrl,
  isConnected,
  lastSyncAt,
  toneOfVoice,
  hashtags,
}: {
  pageId: string | null;
  pageName: string | null;
  profilePictureUrl: string | null;
  isConnected: boolean;
  lastSyncAt: string | null;
  toneOfVoice: string | null;
  hashtags: string[];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#1877F2]/20 bg-[#0F0F0F]">
      {/* Cover photo area */}
      <div
        className="relative h-32 w-full overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1877F2 0%, #0a5fcb 40%, #133a7a 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm">
          <Wifi className="h-3 w-3" />
          Facebook Sayfası
        </div>
      </div>

      {/* Profile row */}
      <div className="px-6 pb-5">
        {/* Avatar overlapping cover */}
        <div className="relative -mt-8 mb-4 flex items-end justify-between">
          <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-[#0F0F0F] bg-[#1877F2] flex items-center justify-center">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt={pageName ?? "Facebook"} className="h-full w-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
          </div>

          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            isConnected
              ? "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#AAFF01]"
              : "border-white/[0.10] bg-white/[0.05] text-[#606060]"
          }`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Sayfa Bağlı" : "Bağlı Değil"}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">{pageName ?? "Facebook Sayfası"}</h2>
          {pageId && (
            <p className="mt-0.5 text-sm text-[#A0A0A0]">Sayfa ID: {pageId}</p>
          )}
          {toneOfVoice && (
            <p className="mt-2 text-sm text-[#A0A0A0]">
              Marka Tonu: <span className="text-white">{toneOfVoice}</span>
            </p>
          )}
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hashtags.slice(0, 8).map((tag) => (
                <span key={tag} className="text-xs font-medium text-[#1877F2]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {lastSyncAt && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#606060]">
              <RefreshCw className="h-3 w-3" />
              Son senkron: {fmtRel(lastSyncAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FacebookFeed({ posts, loading, pageName }: { posts: SocialMediaPost[]; loading: boolean; pageName: string }) {
  const feedPosts = [...posts]
    .filter((p) => p.status === "PUBLISHED" || p.status === "SCHEDULED" || p.status === "APPROVED")
    .sort((a, b) => {
      const da = new Date(a.publishedAt ?? a.scheduledAt ?? a.createdAt).getTime();
      const db = new Date(b.publishedAt ?? b.scheduledAt ?? b.createdAt).getTime();
      return db - da;
    });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0F0F0F] p-5">
            <Skeleton className="mb-3 h-5 w-40" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-3 h-40 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (feedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0F0F0F] py-16">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2]/10">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <p className="text-sm text-[#A0A0A0]">Görünür Facebook içeriği yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedPosts.map((post) => {
        const imgUrl = firstImageUrl(post);
        const isPublished = post.status === "PUBLISHED";

        return (
          <div
            key={post.id}
            className="overflow-hidden rounded-2xl border border-[#1877F2]/10 bg-[#0F0F0F] transition-colors hover:border-[#1877F2]/20"
          >
            {/* Post header */}
            <div className="flex items-start gap-3 p-4 pb-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1877F2]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-white">{pageName}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSocialMediaStatusTone(post.status)}`}>
                    {getSocialMediaPostStatusLabel(post.status)}
                  </span>
                </div>
                <p className="text-xs text-[#606060]">
                  {fmtRel(post.publishedAt ?? post.scheduledAt)}
                  {!isPublished && post.scheduledAt && ` · Planlandı: ${formatSocialMediaDate(post.scheduledAt)}`}
                  <span className="mx-1">·</span>
                  <span className="text-[#1877F2]">{getSocialMediaPostTypeLabel(post.type)}</span>
                </p>
              </div>
              {post.externalPostUrl && (
                <a
                  href={post.externalPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-[#1877F2] hover:text-[#3897f0]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Caption */}
            <div className="px-4 pb-3">
              <p className="font-medium text-white">{post.title}</p>
              {post.caption && (
                <p className="mt-1 text-sm leading-relaxed text-[#CFCFCF]">{post.caption}</p>
              )}
            </div>

            {/* Image */}
            {imgUrl && (
              <div className="mx-0 border-y border-[#1877F2]/08 bg-[#1A1A1A]">
                <img
                  src={imgUrl}
                  alt={post.title}
                  className="max-h-80 w-full object-cover"
                />
              </div>
            )}

            {/* Multi-image indicator */}
            {!imgUrl && post.assets.length > 0 && (
              <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-4 py-3">
                <Layers className="h-4 w-4 text-[#A0A0A0]" />
                <span className="text-sm text-[#A0A0A0]">{post.assets.length} kreatif dosya eklendi</span>
              </div>
            )}

            {/* Engagement row */}
            <div className="border-t border-[#1877F2]/08 px-4 py-2.5">
              <div className="flex items-center gap-4">
                <button type="button" className="flex items-center gap-1.5 text-sm text-[#606060] transition-colors hover:text-[#1877F2]">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Beğen</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 text-sm text-[#606060] transition-colors hover:text-[#1877F2]">
                  <MessageCircle className="h-4 w-4" />
                  <span>Yorum</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 text-sm text-[#606060] transition-colors hover:text-[#1877F2]">
                  <Share2 className="h-4 w-4" />
                  <span>Paylaş</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SocialAccountsDashboard() {
  const { data: config, isLoading: isConfigLoading } = useGetOwnSocialMediaConfigQuery();

  const availablePlatforms = useMemo((): ActivePlatform[] => {
    const active: ActivePlatform[] = [];
    if (config?.activePlatforms.includes("INSTAGRAM") || config?.instagramUsername || config?.instagramAccountId) {
      active.push("INSTAGRAM");
    }
    if (config?.activePlatforms.includes("FACEBOOK") || config?.facebookPageId) {
      active.push("FACEBOOK");
    }
    return active.length > 0 ? active : ["INSTAGRAM", "FACEBOOK"];
  }, [config]);

  const [selectedPlatform, setSelectedPlatform] = useState<ActivePlatform>("INSTAGRAM");
  const activePlatform = availablePlatforms.includes(selectedPlatform)
    ? selectedPlatform
    : (availablePlatforms[0] ?? "INSTAGRAM");

  const { data: insights, isLoading: isInsightsLoading } = useGetOwnSocialMediaInsightsQuery(
    { platform: activePlatform as SocialMediaPlatform, limit: 200 },
  );

  const { data: posts = [], isLoading: isPostsLoading } = useGetOwnSocialMediaPostsQuery(
    { platform: activePlatform as SocialMediaPlatform, limit: 30 },
  );

  const isConnected = config?.connectionStatus === "CONNECTED";
  const totals = insights?.meta.totals;

  const cleanIgUsername = config?.instagramUsername?.replace(/^@+/, "") ?? null;
  const instagramIdentifier = cleanIgUsername ?? config?.instagramAccountId ?? null;
  const facebookIdentifier  = config?.facebookPageName ?? config?.facebookPageId ?? null;

  const fbPageName = config?.facebookPageName ?? "Facebook Sayfası";
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">Sosyal Hesaplar</h1>
        <p className="text-[#A0A0A0]">
          Bağlı hesaplarınızın içerikleri ve performans verileri
        </p>
      </div>

      {/* Platform selector */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {availablePlatforms.map((platform) => (
          <PlatformTab
            key={platform}
            platform={platform}
            isActive={activePlatform === platform}
            isConnected={isConnected}
            identifier={platform === "INSTAGRAM" ? instagramIdentifier : facebookIdentifier}
            onClick={() => setSelectedPlatform(platform)}
          />
        ))}
      </div>

      {/* Platform-specific profile header */}
      {isConfigLoading ? (
        <Skeleton className="h-36 w-full rounded-3xl" />
      ) : activePlatform === "INSTAGRAM" ? (
        <InstagramProfile
          username={config?.instagramUsername ?? null}
          accountId={config?.instagramAccountId ?? null}
          profilePictureUrl={config?.instagramProfilePictureUrl ?? null}
          isConnected={isConnected}
          lastSyncAt={config?.lastSyncAt ?? null}
          postCount={publishedCount}
          followerCount={config?.igFollowerCount ?? null}
          hashtags={config?.hashtags ?? []}
          toneOfVoice={config?.toneOfVoice ?? null}
        />
      ) : (
        <FacebookProfile
          pageId={config?.facebookPageId ?? null}
          pageName={config?.facebookPageName ?? null}
          profilePictureUrl={config?.facebookProfilePictureUrl ?? null}
          isConnected={isConnected}
          lastSyncAt={config?.lastSyncAt ?? null}
          toneOfVoice={config?.toneOfVoice ?? null}
          hashtags={config?.hashtags ?? []}
        />
      )}

      {/* KPI metrics */}
      <KpiRow
        totals={totals}
        loading={isInsightsLoading}
        igImpressions={activePlatform === "INSTAGRAM" ? (config?.igImpressions ?? null) : null}
        igProfileViews={activePlatform === "INSTAGRAM" ? (config?.igProfileViews ?? null) : null}
        igWebsiteClicks={activePlatform === "INSTAGRAM" ? (config?.igWebsiteClicks ?? null) : null}
      />

      {/* No metrics state */}
      {!isInsightsLoading && (!totals || totals.impressions === 0) && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] px-5 py-4">
          <Activity className="h-4 w-4 flex-shrink-0 text-[#404040]" />
          <p className="text-sm text-[#606060]">
            Bu hesap için henüz performans verisi bulunmuyor. Senkron tamamlandıktan sonra veriler otomatik olarak güncellenecek.
          </p>
        </div>
      )}

      {/* Platform-native content display */}
      {activePlatform === "INSTAGRAM" ? (
        <InstagramGrid posts={posts} loading={isPostsLoading} />
      ) : (
        <FacebookFeed posts={posts} loading={isPostsLoading} pageName={fbPageName} />
      )}

      {/* Not connected warning */}
      {!isConfigLoading && !isConnected && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-5 py-4">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <p className="text-sm text-amber-300/80">
            Hesap bağlantısı aktif değil. Ajans ekibiniz Meta entegrasyonunu tamamladığında içerikler ve performans verileri otomatik olarak burada görünecek.
          </p>
        </div>
      )}
    </div>
  );
}
