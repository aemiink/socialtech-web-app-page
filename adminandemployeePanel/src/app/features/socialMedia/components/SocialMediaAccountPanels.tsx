import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Facebook,
  Instagram,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import type {
  SocialMediaConnectionStatus,
  SocialMediaPlatform,
  SocialMediaSummaryConfig,
} from "../socialMediaTypes";
import {
  formatSocialMediaDateTime,
  getSocialMediaPlatformLabel,
} from "../socialMediaUtils";

type SocialMediaOperationalMetrics = {
  plannedPosts?: number;
  publishedPosts?: number;
  pendingApprovals?: number;
  overdueScheduledPosts?: number;
  creativeAssets?: number;
};

type SocialMediaAccountPanelsProps = {
  config: SocialMediaSummaryConfig | null;
  lastUpdatedAt?: string | null;
  syncError?: string | null;
  metrics?: SocialMediaOperationalMetrics;
  riskReasons?: string[];
  className?: string;
};

type MetaProfileCardProps = {
  platform: "INSTAGRAM" | "FACEBOOK";
  title: string;
  primary: string;
  secondaryLabel: string;
  secondaryValue: string;
  externalUrl: string | null;
  connected: boolean;
  enabled: boolean;
};

const CONNECTION_STATUS_LABELS: Record<SocialMediaConnectionStatus, string> = {
  CONNECTED: "Bağlı",
  PENDING: "Beklemede",
  ERROR: "Hatalı",
  DISCONNECTED: "Kopuk",
  NOT_CONNECTED: "Bağlı değil",
};

const CONNECTION_STATUS_CLASSES: Record<SocialMediaConnectionStatus, string> = {
  CONNECTED: "border-[#AAFF01]/40 bg-[#AAFF01]/10 text-[#D8FF8A]",
  PENDING: "border-[#F5C542]/40 bg-[#F5C542]/10 text-[#FFE29A]",
  ERROR: "border-[#FF6B6B]/40 bg-[#FF6B6B]/10 text-[#FFB0B0]",
  DISCONNECTED: "border-[#FF6B6B]/40 bg-[#FF6B6B]/10 text-[#FFB0B0]",
  NOT_CONNECTED: "border-white/[0.12] bg-white/[0.05] text-[#BDBDBD]",
};

export function SocialMediaConnectionHealth({
  config,
  lastUpdatedAt,
  syncError,
  className,
}: Pick<SocialMediaAccountPanelsProps, "config" | "lastUpdatedAt" | "syncError" | "className">) {
  const activePlatforms = resolveActivePlatforms(config);
  const status = config?.connectionStatus ?? "NOT_CONNECTED";
  const hasMetaPlatform = hasPlatform(activePlatforms, "INSTAGRAM") || hasPlatform(activePlatforms, "FACEBOOK");
  const hasMetaIds = Boolean(config?.instagramAccountId || config?.facebookPageId);
  const lastOAuthLabel = config?.lastSyncAt
    ? formatSocialMediaDateTime(config.lastSyncAt)
    : "Henüz OAuth kontrolü yok";
  const updatedLabel = lastUpdatedAt ? formatSocialMediaDateTime(lastUpdatedAt) : "Güncelleme yok";

  return (
    <section className={cn("rounded-md border border-white/[0.08] bg-[#111] p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-white">Meta ID Eşleşmesi</h3>
          <p className="mt-1 text-xs text-[#A0A0A0]">OAuth sonucu, aktif platformlar ve mevcut ID kapsamı.</p>
        </div>
        <Badge className={CONNECTION_STATUS_CLASSES[status]} variant="outline">
          {CONNECTION_STATUS_LABELS[status]}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <HealthMetric
          icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
          label="Profil Eşleşmesi"
          value={hasMetaIds ? "Aktif" : hasMetaPlatform ? "Eksik ID" : "Meta seçilmedi"}
        />
        <HealthMetric
          icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
          label="Son OAuth Kontrolü"
          value={lastOAuthLabel}
        />
        <HealthMetric
          icon={<Database className="h-4 w-4" aria-hidden="true" />}
          label="Insight Kaynağı"
          value="Snapshot"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {activePlatforms.length > 0 ? (
          activePlatforms.map((platform) => (
            <Badge key={platform} className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]" variant="outline">
              {getSocialMediaPlatformLabel(platform)}
            </Badge>
          ))
        ) : (
          <Badge className="border-white/[0.12] bg-white/[0.05] text-[#BDBDBD]" variant="outline">
            Platform seçilmedi
          </Badge>
        )}
      </div>

      {syncError ? (
        <p className="mt-3 flex items-start gap-2 rounded-md border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 p-3 text-xs text-[#FFB0B0]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {syncError}
        </p>
      ) : (
        <p className="mt-3 text-xs text-[#8F8F8F]">Son panel güncellemesi: {updatedLabel}</p>
      )}
    </section>
  );
}

export function SocialMediaProfileCards({ config, className }: Pick<SocialMediaAccountPanelsProps, "config" | "className">) {
  const activePlatforms = resolveActivePlatforms(config);
  const instagramUsername = normalizeInstagramUsername(config?.instagramUsername ?? null);
  const instagramUrl = instagramUsername ? `https://www.instagram.com/${instagramUsername}/` : null;
  const instagramEnabled = hasPlatform(activePlatforms, "INSTAGRAM") || Boolean(config?.instagramUsername || config?.instagramAccountId);
  const facebookEnabled = hasPlatform(activePlatforms, "FACEBOOK") || Boolean(config?.facebookPageId);

  if (!instagramEnabled && !facebookEnabled) {
    return null;
  }

  return (
    <section className={cn("grid gap-3 md:grid-cols-2", className)}>
      {instagramEnabled ? (
        <MetaProfileCard
          platform="INSTAGRAM"
          title="Instagram Profili"
          primary={instagramUsername ? `@${instagramUsername}` : "Username yok"}
          secondaryLabel="Account ID"
          secondaryValue={config?.instagramAccountId ?? "Tanımlı değil"}
          externalUrl={instagramUrl}
          connected={Boolean(config?.instagramAccountId)}
          enabled={instagramEnabled}
        />
      ) : null}
      {facebookEnabled ? (
        <MetaProfileCard
          platform="FACEBOOK"
          title="Facebook Sayfası"
          primary={config?.facebookPageId ? `Page ID ${config.facebookPageId}` : "Page ID yok"}
          secondaryLabel="Page ID"
          secondaryValue={config?.facebookPageId ?? "Tanımlı değil"}
          externalUrl={config?.facebookPageId ? `https://www.facebook.com/${config.facebookPageId}` : null}
          connected={Boolean(config?.facebookPageId)}
          enabled={facebookEnabled}
        />
      ) : null}
    </section>
  );
}

export function SocialMediaActionQueue({
  config,
  metrics,
  riskReasons = [],
  className,
}: Pick<SocialMediaAccountPanelsProps, "config" | "metrics" | "riskReasons" | "className">) {
  const items = buildActionQueue(config, metrics, riskReasons);

  return (
    <section className={cn("rounded-md border border-white/[0.08] bg-[#111] p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-white">Aksiyon Kuyruğu</h3>
        <Badge className="border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]" variant="outline">
          {items.length} madde
        </Badge>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2 text-sm">
            <item.icon className={cn("mt-0.5 h-4 w-4 shrink-0", item.iconClassName)} aria-hidden="true" />
            <div>
              <p className="text-white">{item.label}</p>
              <p className="text-xs text-[#A0A0A0]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetaProfileCard({
  platform,
  title,
  primary,
  secondaryLabel,
  secondaryValue,
  externalUrl,
  connected,
  enabled,
}: MetaProfileCardProps) {
  const Icon = platform === "INSTAGRAM" ? Instagram : Facebook;

  return (
    <article className="rounded-md border border-white/[0.08] bg-[#111] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#AAFF01]/10 text-[#AAFF01]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{title}</h3>
            <p className="mt-1 break-all text-sm text-[#E5E5E5]">{primary}</p>
          </div>
        </div>
        <Badge
          className={cn(
            connected
              ? "border-[#AAFF01]/40 bg-[#AAFF01]/10 text-[#D8FF8A]"
              : enabled
                ? "border-[#F5C542]/40 bg-[#F5C542]/10 text-[#FFE29A]"
                : "border-white/[0.12] bg-white/[0.05] text-[#BDBDBD]",
          )}
          variant="outline"
        >
          {connected ? "ID hazır" : enabled ? "Eksik" : "Pasif"}
        </Badge>
      </div>
      <div className="mt-4 space-y-2 text-sm text-[#A0A0A0]">
        <p>
          {secondaryLabel}: <span className="break-all text-white">{secondaryValue}</span>
        </p>
        {externalUrl ? (
          <a
            className="inline-flex items-center gap-1 text-xs font-medium text-[#AAFF01] transition hover:text-[#D8FF8A]"
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
          >
            Profili aç
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : (
          <p className="text-xs text-[#8F8F8F]">Profil linki için username veya Page ID gerekiyor.</p>
        )}
      </div>
    </article>
  );
}

function HealthMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-[#AAFF01]">
        {icon}
        <span className="text-xs font-medium uppercase text-[#A0A0A0]">{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function buildActionQueue(
  config: SocialMediaSummaryConfig | null,
  metrics: SocialMediaOperationalMetrics | undefined,
  riskReasons: string[],
) {
  const actions: Array<{
    label: string;
    description: string;
    icon: typeof AlertCircle;
    iconClassName: string;
  }> = [];
  const activePlatforms = resolveActivePlatforms(config);
  const hasInstagram = hasPlatform(activePlatforms, "INSTAGRAM");
  const hasFacebook = hasPlatform(activePlatforms, "FACEBOOK");
  const hasMetaPlatform = hasInstagram || hasFacebook;

  if (!config) {
    actions.push({
      label: "Social Media config eksik",
      description: "Önce aktif platformları ve servis hedeflerini tanımlayın.",
      icon: AlertCircle,
      iconClassName: "text-[#FFB0B0]",
    });
  } else if (activePlatforms.length === 0) {
    actions.push({
      label: "Aktif platform seçilmedi",
      description: "Müşteride Meta, TikTok veya LinkedIn kapsamını işaretleyin.",
      icon: KeyRound,
      iconClassName: "text-[#FFE29A]",
    });
  }

  if (hasMetaPlatform && config?.connectionStatus !== "CONNECTED") {
    actions.push({
      label: "Meta OAuth tamamlanmalı",
      description: "Facebook Page ID ve Instagram Account ID otomatik dolmadan Meta ID eşleşmesi tamamlanmış sayılmaz.",
      icon: KeyRound,
      iconClassName: "text-[#FFE29A]",
    });
  }

  if (hasInstagram && !config?.instagramAccountId) {
    actions.push({
      label: "Instagram Account ID bekliyor",
      description: "Meta bağlantısı tamamlandığında bu alan otomatik set edilir.",
      icon: Instagram,
      iconClassName: "text-[#FFE29A]",
    });
  }

  if (hasFacebook && !config?.facebookPageId) {
    actions.push({
      label: "Facebook Page ID bekliyor",
      description: "Müşterinin yönetilebilir Facebook sayfası OAuth sonucunda yakalanmalı.",
      icon: Facebook,
      iconClassName: "text-[#FFE29A]",
    });
  }

  if ((metrics?.overdueScheduledPosts ?? 0) > 0) {
    actions.push({
      label: `${metrics?.overdueScheduledPosts ?? 0} geciken planlı içerik`,
      description: "Takvimde yayın zamanı geçmiş ama yayınlanmamış içerik var.",
      icon: Clock3,
      iconClassName: "text-[#FFB0B0]",
    });
  }

  if ((metrics?.pendingApprovals ?? 0) > 0) {
    actions.push({
      label: `${metrics?.pendingApprovals ?? 0} onay bekliyor`,
      description: "Client-visible akışta bekleyen içerik veya görev onayı var.",
      icon: AlertCircle,
      iconClassName: "text-[#FFE29A]",
    });
  }

  if ((metrics?.creativeAssets ?? 0) === 0) {
    actions.push({
      label: "Kreatif asset yok",
      description: "Planlanan içerikleri destekleyecek görsel/video asset ekleyin.",
      icon: Database,
      iconClassName: "text-[#BDBDBD]",
    });
  }

  riskReasons.slice(0, 2).forEach((reason) => {
    actions.push({
      label: reason,
      description: "Risk motorundan gelen operasyon uyarısı.",
      icon: AlertCircle,
      iconClassName: "text-[#FFE29A]",
    });
  });

  if (actions.length === 0) {
    actions.push({
      label: "ID eşleşmesi ve operasyon akışı hazır",
      description: "Meta ID eşleşmesi, içerik planı ve snapshot insight akışı izlenebilir durumda.",
      icon: CheckCircle2,
      iconClassName: "text-[#AAFF01]",
    });
  }

  return actions.slice(0, 6);
}

function resolveActivePlatforms(config: SocialMediaSummaryConfig | null): SocialMediaPlatform[] {
  if (!config) {
    return [];
  }

  if (config.activePlatforms.length > 0) {
    return config.activePlatforms;
  }

  const inferredPlatforms: SocialMediaPlatform[] = [];
  if (config.instagramUsername || config.instagramAccountId) {
    inferredPlatforms.push("INSTAGRAM");
  }
  if (config.facebookPageId) {
    inferredPlatforms.push("FACEBOOK");
  }
  if (config.tiktokUsername) {
    inferredPlatforms.push("TIKTOK");
  }
  if (config.linkedinPageUrl) {
    inferredPlatforms.push("LINKEDIN");
  }

  return inferredPlatforms;
}

function hasPlatform(activePlatforms: SocialMediaPlatform[], platform: SocialMediaPlatform): boolean {
  return activePlatforms.includes(platform);
}

function normalizeInstagramUsername(value: string | null): string | null {
  const normalizedValue = value?.trim().replace(/^@+/, "") ?? "";
  return normalizedValue.length > 0 ? normalizedValue : null;
}
