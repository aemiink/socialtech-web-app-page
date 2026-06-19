import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SocialMediaPlatform, SocialMediaPostStatus, SocialMediaPostType } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { SocialMediaMetaTokenService } from "./social-media-meta-token.service";

const META_GRAPH_BASE = "https://graph.facebook.com";
const MAX_MEDIA_PER_SYNC = 50;

// impressions removed in v22.0+ for all media types — use universal set
const POST_METRICS_ALL = "reach,saved,likes,comments,shares";

type MetaMediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_product_type?: string; // "FEED" | "REELS" | "STORY" | "AD"
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

type MetaInsightEntry = { name: string; values?: Array<{ value: number }>; value?: number };

@Injectable()
export class SocialMediaMetaSyncService {
  private readonly logger = new Logger(SocialMediaMetaSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: SocialMediaMetaTokenService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Scheduled sync every 12 hours ───────────────────────────────────────────

  @Cron(CronExpression.EVERY_12_HOURS)
  async syncAllActiveClients(): Promise<void> {
    this.logger.log("Starting scheduled social media Meta sync…");

    const credentials = await this.prisma.clientSocialMediaMetaCredential.findMany({
      where: { pageAccessTokenEnc: { not: null } },
      select: { clientProfileId: true },
    });

    for (const { clientProfileId } of credentials) {
      try {
        await this.syncClient(clientProfileId);
      } catch (err) {
        this.logger.error(`Meta sync failed for client ${clientProfileId}: ${String(err)}`);
      }
    }

    this.logger.log(`Meta sync completed for ${credentials.length} client(s).`);
  }

  // ─── Per-client sync ──────────────────────────────────────────────────────────

  async syncClient(clientProfileId: string): Promise<{ synced: number; platforms: string[] }> {
    const [credential, config] = await Promise.all([
      this.prisma.clientSocialMediaMetaCredential.findUnique({ where: { clientProfileId } }),
      this.prisma.clientSocialMediaConfig.findUnique({
        where: { clientProfileId },
        select: { instagramAccountId: true, facebookPageId: true, activePlatforms: true },
      }),
    ]);

    if (!credential?.pageAccessTokenEnc) {
      this.logger.warn(`No stored token for client ${clientProfileId} — skipping sync.`);
      return { synced: 0, platforms: [] };
    }

    const token = this.tokenService.decrypt(credential.pageAccessTokenEnc);
    const graphVersion = this.configService.get<string>("META_GRAPH_API_VERSION") ?? "v22.0";

    let totalSynced = 0;
    const syncedPlatforms: string[] = [];

    // Instagram sync — always run if we have an IG account ID
    const igAccountId = credential.instagramAccountId ?? config?.instagramAccountId;
    if (igAccountId) {
      try {
        const count = await this.syncInstagram(clientProfileId, igAccountId, token, graphVersion);
        totalSynced += count;
        if (count > 0) syncedPlatforms.push("INSTAGRAM");
      } catch (err) {
        this.logger.error(`Instagram sync error for ${clientProfileId}: ${String(err)}`);
      }
    }

    // Facebook sync — run whenever we have a page ID
    const fbPageId = credential.facebookPageId ?? config?.facebookPageId;
    if (fbPageId) {
      try {
        const count = await this.syncFacebook(clientProfileId, fbPageId, token, graphVersion);
        totalSynced += count;
        if (count > 0) syncedPlatforms.push("FACEBOOK");
      } catch (err) {
        this.logger.error(`Facebook sync error for ${clientProfileId}: ${String(err)}`);
      }
    }

    await this.prisma.clientSocialMediaConfig.update({
      where: { clientProfileId },
      data: { lastSyncAt: new Date(), syncError: null },
    });

    this.logger.log(
      `Client ${clientProfileId}: synced ${totalSynced} posts across [${syncedPlatforms.join(", ")}].`,
    );
    return { synced: totalSynced, platforms: syncedPlatforms };
  }

  // ─── Instagram ────────────────────────────────────────────────────────────────

  private async syncInstagram(
    clientProfileId: string,
    igAccountId: string,
    token: string,
    graphVersion: string,
  ): Promise<number> {
    // Fetch profile info (picture, username, followers)
    await this.syncInstagramProfileInfo(clientProfileId, igAccountId, token, graphVersion);

    const fields =
      "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
    const url = `${META_GRAPH_BASE}/${graphVersion}/${igAccountId}/media?fields=${fields}&limit=${MAX_MEDIA_PER_SYNC}&access_token=${token}`;

    let items: MetaMediaItem[] = [];
    try {
      const resp = await fetch(url);
      const payload = (await resp.json()) as { data?: unknown[]; error?: unknown };
      if (payload.error) {
        this.logger.error(`Instagram media API error: ${JSON.stringify(payload.error)}`);
        return 0;
      }
      items = this.parseMediaItems(payload.data ?? []);
    } catch (err) {
      this.logger.error(`Instagram media fetch failed: ${String(err)}`);
      return 0;
    }

    let count = 0;
    for (const item of items) {
      try {
        await this.upsertPost(clientProfileId, item, SocialMediaPlatform.INSTAGRAM);
        count++;
      } catch (err) {
        this.logger.error(`Failed to upsert IG post ${item.id}: ${String(err)}`);
      }
    }

    this.logger.log(`Instagram: upserted ${count}/${items.length} posts for client ${clientProfileId}`);

    if (items.length > 0) {
      await this.syncInstagramPostInsights(clientProfileId, items, token, graphVersion).catch((err) => {
        this.logger.warn(`Post insights sync skipped: ${String(err)}`);
      });
    }

    await this.syncInstagramAccountInsights(clientProfileId, igAccountId, token, graphVersion).catch((err) => {
      this.logger.warn(`Account insights sync skipped: ${String(err)}`);
    });

    return count;
  }

  private async syncInstagramProfileInfo(
    clientProfileId: string,
    igAccountId: string,
    token: string,
    graphVersion: string,
  ): Promise<void> {
    try {
      const url = `${META_GRAPH_BASE}/${graphVersion}/${igAccountId}?fields=profile_picture_url,username,followers_count&access_token=${token}`;
      const resp = await fetch(url);
      const data = (await resp.json()) as {
        profile_picture_url?: string;
        username?: string;
        followers_count?: number;
        error?: unknown;
      };
      if (data.error) {
        this.logger.warn(`IG profile info error: ${JSON.stringify(data.error)}`);
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (data.profile_picture_url) updateData.instagramProfilePictureUrl = data.profile_picture_url;
      if (data.username) updateData.instagramUsername = data.username;
      if (typeof data.followers_count === "number") updateData.igFollowerCount = data.followers_count;

      if (Object.keys(updateData).length > 0) {
        await this.prisma.clientSocialMediaConfig.update({ where: { clientProfileId }, data: updateData });
      }
    } catch (err) {
      this.logger.warn(`IG profile info sync failed: ${String(err)}`);
    }
  }

  // ─── Per-post insights ────────────────────────────────────────────────────────

  private async syncInstagramPostInsights(
    clientProfileId: string,
    items: MetaMediaItem[],
    token: string,
    graphVersion: string,
  ): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const item of items) {
      try {
        const url = `${META_GRAPH_BASE}/${graphVersion}/${item.id}/insights?metric=${POST_METRICS_ALL}&access_token=${token}`;

        const resp = await fetch(url);
        const payload = (await resp.json()) as { data?: MetaInsightEntry[]; error?: unknown };
        if (payload.error || !Array.isArray(payload.data)) continue;

        const get = (name: string): number | null => {
          const entry = payload.data!.find((d) => d.name === name);
          if (!entry) return null;
          if (Array.isArray(entry.values) && entry.values.length > 0) return entry.values[0].value ?? null;
          return entry.value ?? null;
        };

        const post = await this.prisma.socialMediaPost.findFirst({
          where: { clientProfileId, externalPostId: item.id },
          select: { id: true },
        });
        if (!post) continue;

        const insightData = {
          reach: get("reach"),
          likes: get("likes") ?? item.like_count ?? null,
          comments: get("comments") ?? item.comments_count ?? null,
          shares: get("shares"),
          saves: get("saved"),
        };

        const existing = await this.prisma.socialMediaPostInsight.findFirst({
          where: { postId: post.id, date: today },
          select: { id: true },
        });

        if (existing) {
          await this.prisma.socialMediaPostInsight.update({ where: { id: existing.id }, data: insightData });
        } else {
          await this.prisma.socialMediaPostInsight.create({
            data: {
              postId: post.id,
              clientProfileId,
              platform: SocialMediaPlatform.INSTAGRAM,
              date: today,
              ...insightData,
            },
          });
        }
      } catch {
        // Individual insight failure is non-fatal — continue to next post
      }
    }
  }

  // ─── Account-level insights ───────────────────────────────────────────────────

  private async syncInstagramAccountInsights(
    clientProfileId: string,
    igAccountId: string,
    token: string,
    graphVersion: string,
  ): Promise<void> {
    const since = Math.floor((Date.now() - 30 * 86_400_000) / 1000);
    const until = Math.floor(Date.now() / 1000);
    const updateData: Record<string, unknown> = {};

    // profile_views and website_clicks use metric_type=total_value
    try {
      const tvUrl = `${META_GRAPH_BASE}/${graphVersion}/${igAccountId}/insights?metric=profile_views,website_clicks&metric_type=total_value&period=day&since=${since}&until=${until}&access_token=${token}`;
      const tvResp = await fetch(tvUrl);
      const tvData = (await tvResp.json()) as {
        data?: Array<{ name: string; total_value?: { value?: number } }>;
        error?: unknown;
      };
      if (!tvData.error && Array.isArray(tvData.data)) {
        for (const entry of tvData.data) {
          const val = entry.total_value?.value;
          if (entry.name === "profile_views" && typeof val === "number") updateData.igProfileViews = val;
          if (entry.name === "website_clicks" && typeof val === "number") updateData.igWebsiteClicks = val;
        }
      }
    } catch (err) {
      this.logger.warn(`Account profile_views/website_clicks sync failed: ${String(err)}`);
    }

    // impressions uses period=day and returns daily values to be summed
    try {
      const impUrl = `${META_GRAPH_BASE}/${graphVersion}/${igAccountId}/insights?metric=impressions&period=day&since=${since}&until=${until}&access_token=${token}`;
      const impResp = await fetch(impUrl);
      const impData = (await impResp.json()) as {
        data?: Array<{ name: string; values?: Array<{ value: number }> }>;
        error?: unknown;
      };
      if (!impData.error && Array.isArray(impData.data)) {
        const impEntry = impData.data.find((d) => d.name === "impressions");
        if (impEntry && Array.isArray(impEntry.values)) {
          const total = impEntry.values.reduce((sum, v) => sum + (v.value ?? 0), 0);
          updateData.igImpressions = total;
        }
      }
    } catch (err) {
      this.logger.warn(`Account impressions sync failed: ${String(err)}`);
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.clientSocialMediaConfig
        .update({ where: { clientProfileId }, data: updateData })
        .catch((err) => this.logger.warn(`Account insights DB update failed: ${String(err)}`));
    }
  }

  // ─── Facebook ─────────────────────────────────────────────────────────────────

  private async syncFacebook(
    clientProfileId: string,
    pageId: string,
    token: string,
    graphVersion: string,
  ): Promise<number> {
    await this.syncFacebookProfileInfo(clientProfileId, pageId, token, graphVersion);

    const fields =
      "id,message,story,created_time,permalink_url,attachments{media},likes.summary(true),comments.summary(true),shares";
    const url = `${META_GRAPH_BASE}/${graphVersion}/${pageId}/posts?fields=${fields}&limit=${MAX_MEDIA_PER_SYNC}&access_token=${token}`;

    type FacebookPostRaw = {
      id: string;
      message?: string;
      story?: string;
      created_time: string;
      permalink_url?: string;
      attachments?: { data?: Array<{ media?: { image?: { src?: string } } }> };
      likes?: { summary?: { total_count?: number } };
      comments?: { summary?: { total_count?: number } };
      shares?: { count?: number };
    };

    let posts: FacebookPostRaw[] = [];

    try {
      const resp = await fetch(url);
      const payload = (await resp.json()) as { data?: unknown[]; error?: unknown };
      if (payload.error) {
        this.logger.error(`Facebook posts API error: ${JSON.stringify(payload.error)}`);
        return 0;
      }
      if (Array.isArray(payload.data)) {
        posts = payload.data as FacebookPostRaw[];
      }
    } catch (err) {
      this.logger.error(`Facebook page posts fetch failed: ${String(err)}`);
      return 0;
    }

    this.logger.log(`Facebook: fetched ${posts.length} posts for page ${pageId}`);

    let count = 0;
    for (const post of posts) {
      try {
        const imageUrl = post.attachments?.data?.[0]?.media?.image?.src ?? null;
        const item: MetaMediaItem = {
          id: post.id,
          caption: post.message ?? post.story ?? undefined,
          media_type: "IMAGE",
          media_url: imageUrl ?? undefined,
          permalink: post.permalink_url,
          timestamp: post.created_time,
        };
        await this.upsertPost(clientProfileId, item, SocialMediaPlatform.FACEBOOK);
        count++;
      } catch (err) {
        this.logger.error(`Failed to upsert Facebook post ${post.id}: ${String(err)}`);
      }
    }

    this.logger.log(`Facebook: upserted ${count}/${posts.length} posts for client ${clientProfileId}`);

    if (posts.length > 0) {
      await this.syncFacebookPostInsights(clientProfileId, posts, token, graphVersion).catch((err) => {
        this.logger.warn(`Facebook post insights sync skipped: ${String(err)}`);
      });
    }

    return count;
  }

  private async syncFacebookPostInsights(
    clientProfileId: string,
    posts: Array<{
      id: string;
      created_time: string;
      likes?: { summary?: { total_count?: number } };
      comments?: { summary?: { total_count?: number } };
      shares?: { count?: number };
    }>,
    token: string,
    graphVersion: string,
  ): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const post of posts) {
      try {
        const dbPost = await this.prisma.socialMediaPost.findFirst({
          where: { clientProfileId, externalPostId: post.id, platform: SocialMediaPlatform.FACEBOOK },
          select: { id: true },
        });
        if (!dbPost) continue;

        const likes = post.likes?.summary?.total_count ?? 0;
        const comments = post.comments?.summary?.total_count ?? 0;
        const shares = post.shares?.count ?? 0;

        // Fetch reach + impressions from Page Post Insights API
        let impressions = 0;
        let reach = 0;
        try {
          const insightUrl = `${META_GRAPH_BASE}/${graphVersion}/${post.id}/insights?metric=post_impressions,post_impressions_unique&access_token=${token}`;
          const insightResp = await fetch(insightUrl);
          const insightPayload = (await insightResp.json()) as {
            data?: Array<{ name: string; values?: Array<{ value: number }>; value?: number }>;
            error?: unknown;
          };
          if (!insightPayload.error && Array.isArray(insightPayload.data)) {
            for (const entry of insightPayload.data) {
              const val = Array.isArray(entry.values) ? (entry.values[0]?.value ?? 0) : (entry.value ?? 0);
              if (entry.name === "post_impressions") impressions = val;
              if (entry.name === "post_impressions_unique") reach = val;
            }
          }
        } catch {
          // Non-fatal — post-level insight API may not be available for all post types
        }

        const engagementActions = likes + comments + shares;
        const engagementRate = reach > 0 ? (engagementActions / reach) * 100 : 0;

        const insightData = {
          impressions,
          reach,
          likes,
          comments,
          shares,
          engagementRate,
        };

        const existing = await this.prisma.socialMediaPostInsight.findFirst({
          where: { postId: dbPost.id, date: today },
          select: { id: true },
        });

        if (existing) {
          await this.prisma.socialMediaPostInsight.update({ where: { id: existing.id }, data: insightData });
        } else {
          await this.prisma.socialMediaPostInsight.create({
            data: {
              postId: dbPost.id,
              clientProfileId,
              platform: SocialMediaPlatform.FACEBOOK,
              date: today,
              ...insightData,
            },
          });
        }
      } catch {
        // Individual post insight failure is non-fatal
      }
    }
  }

  private async syncFacebookProfileInfo(
    clientProfileId: string,
    pageId: string,
    token: string,
    graphVersion: string,
  ): Promise<void> {
    try {
      const url = `${META_GRAPH_BASE}/${graphVersion}/${pageId}?fields=name,picture.type(large)&access_token=${token}`;
      const resp = await fetch(url);
      const data = (await resp.json()) as {
        name?: string;
        picture?: { data?: { url?: string } };
        error?: unknown;
      };
      if (data.error) {
        this.logger.warn(`FB profile info error: ${JSON.stringify(data.error)}`);
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (data.name) updateData.facebookPageName = data.name;
      if (data.picture?.data?.url) updateData.facebookProfilePictureUrl = data.picture.data.url;

      if (Object.keys(updateData).length > 0) {
        await this.prisma.clientSocialMediaConfig.update({ where: { clientProfileId }, data: updateData });
      }
    } catch (err) {
      this.logger.warn(`FB profile info sync failed: ${String(err)}`);
    }
  }

  // ─── Shared upsert ────────────────────────────────────────────────────────────

  private async upsertPost(
    clientProfileId: string,
    item: MetaMediaItem,
    platform: SocialMediaPlatform,
  ): Promise<void> {
    const publishedAt = new Date(item.timestamp);
    const caption = item.caption ?? null;
    const title = caption
      ? caption.substring(0, 80).replace(/\n/g, " ").trim()
      : `${platform === SocialMediaPlatform.INSTAGRAM ? "Instagram" : "Facebook"} gönderi`;

    const mediaUrl =
      item.media_type === "VIDEO"
        ? (item.thumbnail_url ?? item.media_url ?? null)
        : (item.media_url ?? null);

    const type = this.resolvePostType(item.media_type, item.media_product_type);
    const updateData = {
      title,
      caption,
      publishedAt,
      externalPostUrl: item.permalink ?? null,
      externalMediaUrl: mediaUrl,
      clientVisible: true,
      status: SocialMediaPostStatus.PUBLISHED,
    };

    const existing = await this.prisma.socialMediaPost.findFirst({
      where: { clientProfileId, externalPostId: item.id, platform },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.socialMediaPost.update({ where: { id: existing.id }, data: updateData });
    } else {
      await this.prisma.socialMediaPost.create({
        data: { clientProfileId, platform, type, ...updateData, externalPostId: item.id },
      });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private parseMediaItems(data: unknown[]): MetaMediaItem[] {
    return data.filter((item): item is MetaMediaItem => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as MetaMediaItem).id === "string" &&
        typeof (item as MetaMediaItem).timestamp === "string"
      );
    });
  }

  private resolvePostType(mediaType: string, mediaProductType?: string): SocialMediaPostType {
    if (mediaType === "VIDEO") {
      return mediaProductType === "REELS" ? SocialMediaPostType.REEL : SocialMediaPostType.REEL;
    }
    if (mediaType === "CAROUSEL_ALBUM") return SocialMediaPostType.CAROUSEL;
    return SocialMediaPostType.STATIC_IMAGE;
  }
}
