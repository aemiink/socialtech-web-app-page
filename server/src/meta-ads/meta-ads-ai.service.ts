import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type MetaAdsAiCommentaryInput = {
  summary: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    results: number;
    roas: number | null;
  } | null;
  campaigns: Array<{
    name: string;
    spend: number;
    ctr: number;
    roas: number | null;
    results: number;
    effectiveStatus: string;
  }>;
  adSets: Array<{
    name: string | null;
    spend: number;
    ctr: number;
    cpm: number;
    costPerResult: number;
  }>;
  creatives: Array<{
    adName: string | null;
    ctr: number;
    spend: number;
    results: number;
    effectiveStatus: string;
  }>;
};

export type MetaAdsAiCommentary = {
  generalAnalysis: string;
  campaignHighlights: string;
  audienceInsights: string;
  creativeInsights: string;
  recommendations: string[];
  generatedAt: string;
  isHeuristic: boolean;
};

type CacheEntry = {
  data: MetaAdsAiCommentary;
  cachedAt: number;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const AI_COMMENTARY_JSON_SCHEMA = {
  type: "object",
  required: [
    "generalAnalysis",
    "campaignHighlights",
    "audienceInsights",
    "creativeInsights",
    "recommendations",
    "generatedAt",
    "isHeuristic",
  ],
  properties: {
    generalAnalysis: { type: "string" },
    campaignHighlights: { type: "string" },
    audienceInsights: { type: "string" },
    creativeInsights: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } },
    generatedAt: { type: "string" },
    isHeuristic: { type: "boolean" },
  },
};

@Injectable()
export class MetaAdsAiService {
  private readonly logger = new Logger(MetaAdsAiService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly configService: ConfigService) {}

  async generateCommentary(
    clientProfileId: string,
    input: MetaAdsAiCommentaryInput,
  ): Promise<MetaAdsAiCommentary> {
    const cacheKey = clientProfileId;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const apiKey = this.configService.get<string>("GEMINI_API_KEY")?.trim();
    if (!apiKey) {
      const heuristic = this.generateHeuristicCommentary(input);
      this.cache.set(cacheKey, { data: heuristic, cachedAt: Date.now() });
      return heuristic;
    }

    try {
      const baseUrl =
        this.configService.get<string>("GEMINI_BASE_URL")?.replace(/\/+$/, "") ??
        "https://generativelanguage.googleapis.com/v1beta";
      const model =
        this.configService.get<string>("GEMINI_MODEL")?.trim() || "gemini-2.5-flash";

      const prompt = `Sen bir Meta Ads performans uzmanısın. Aşağıdaki Meta Ads hesap verilerini analiz et ve türkçe yorum yap. Soru sorma, sadece gözlemle ve öner. JSON döndür.

Veri:
${JSON.stringify(input, null, 2)}

Kuralllar:
- generalAnalysis: Hesabın genel durumunu 2-3 cümle ile özetle
- campaignHighlights: En iyi ve en kötü kampanyayı belirt, neden iyi/kötü olduğunu açıkla
- audienceInsights: Reklam setleri bazında kitle performansını değerlendir
- creativeInsights: Kreatif performansını değerlendir, CTR'ı yüksek olan neden başarılı olabilir
- recommendations: 3-5 somut aksiyon önerisi listesi (her biri tek cümle)
- generatedAt: şu anki ISO tarih string
- isHeuristic: false`;

      const response = await fetch(`${baseUrl}/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
            responseJsonSchema: AI_COMMENTARY_JSON_SCHEMA,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`Gemini commentary failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string | null }> };
        }>;
      };

      const content = payload.candidates?.[0]?.content?.parts?.find(
        (part) => typeof part.text === "string",
      )?.text;

      if (!content) {
        throw new Error("Gemini returned an empty commentary response.");
      }

      const parsed = JSON.parse(content) as Partial<MetaAdsAiCommentary>;
      const commentary = this.sanitizeCommentary(parsed);

      this.cache.set(cacheKey, { data: commentary, cachedAt: Date.now() });
      return commentary;
    } catch (error) {
      this.logger.warn(
        `Gemini commentary failed, falling back to heuristic: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
      const heuristic = this.generateHeuristicCommentary(input);
      this.cache.set(cacheKey, { data: heuristic, cachedAt: Date.now() });
      return heuristic;
    }
  }

  clearCache(clientProfileId: string): void {
    this.cache.delete(clientProfileId);
  }

  private generateHeuristicCommentary(input: MetaAdsAiCommentaryInput): MetaAdsAiCommentary {
    const summary = input.summary;
    const campaigns = input.campaigns;
    const adSets = input.adSets;
    const creatives = input.creatives;

    const generalAnalysis = summary
      ? `Hesap toplam ${summary.spend.toFixed(2)} TL harcama ile ${summary.impressions.toLocaleString("tr-TR")} gösterim ve ${summary.clicks} tıklama elde etti. CTR ${summary.ctr.toFixed(2)}% seviyesinde, ${summary.results} dönüşüm gerçekleşti.${summary.roas !== null ? ` ROAS ${summary.roas.toFixed(2)} olarak ölçüldü.` : ""}`
      : "Hesap verisi analiz için yeterli değil.";

    const topCampaign = campaigns.reduce(
      (best, c) => (c.ctr > (best?.ctr ?? -1) ? c : best),
      campaigns[0] ?? null,
    );
    const campaignHighlights = topCampaign
      ? `En yüksek CTR'a sahip kampanya "${topCampaign.name}" (CTR: ${topCampaign.ctr.toFixed(2)}%, harcama: ${topCampaign.spend.toFixed(2)} TL, dönüşüm: ${topCampaign.results}). ${campaigns.length > 1 ? `Toplam ${campaigns.length} kampanya aktif.` : ""}`
      : "Kampanya verisi bulunamadı.";

    const topAdSet = adSets.reduce(
      (best, a) => (a.ctr > (best?.ctr ?? -1) ? a : best),
      adSets[0] ?? null,
    );
    const audienceInsights = topAdSet
      ? `En yüksek CTR'a sahip reklam seti "${topAdSet.name ?? "İsimsiz"}" (CTR: ${topAdSet.ctr.toFixed(2)}%, CPM: ${topAdSet.cpm.toFixed(2)} TL). ${adSets.length > 1 ? `Toplam ${adSets.length} reklam seti incelendi.` : ""}`
      : "Reklam seti verisi bulunamadı.";

    const topCreative = creatives.reduce(
      (best, c) => (c.ctr > (best?.ctr ?? -1) ? c : best),
      creatives[0] ?? null,
    );
    const creativeInsights = topCreative
      ? `En yüksek CTR'a sahip kreatif "${topCreative.adName ?? "İsimsiz"}" (CTR: ${topCreative.ctr.toFixed(2)}%, harcama: ${topCreative.spend.toFixed(2)} TL, dönüşüm: ${topCreative.results}). Yüksek CTR görselin veya mesajın hedef kitleyle iyi eşleştiğine işaret eder.`
      : "Kreatif verisi bulunamadı.";

    const recommendations: string[] = [
      topCampaign
        ? `"${topCampaign.name}" kampanyasının bütçesini artırarak performansından daha fazla yararlanın.`
        : "En iyi performans gösteren kampanyaya bütçe yönlendirin.",
      topCreative
        ? `"${topCreative.adName ?? "En iyi kreatif"}" kreatifini diğer kampanyalarda da test edin.`
        : "Yüksek CTR'lı kreatiflerinizi daha geniş kitlelerde deneyin.",
      "Düşük CTR'lı reklam setlerinin hedef kitle tanımlarını gözden geçirin ve güncelleyin.",
    ];

    return {
      generalAnalysis,
      campaignHighlights,
      audienceInsights,
      creativeInsights,
      recommendations,
      generatedAt: new Date().toISOString(),
      isHeuristic: true,
    };
  }

  private sanitizeCommentary(value: Partial<MetaAdsAiCommentary>): MetaAdsAiCommentary {
    return {
      generalAnalysis: value.generalAnalysis?.trim() || "Genel analiz oluşturulamadı.",
      campaignHighlights:
        value.campaignHighlights?.trim() || "Kampanya öne çıkanları oluşturulamadı.",
      audienceInsights: value.audienceInsights?.trim() || "Kitle içgörüleri oluşturulamadı.",
      creativeInsights: value.creativeInsights?.trim() || "Kreatif içgörüleri oluşturulamadı.",
      recommendations: Array.isArray(value.recommendations)
        ? value.recommendations.filter((r): r is string => typeof r === "string" && r.trim().length > 0).slice(0, 5)
        : [],
      generatedAt: value.generatedAt?.trim() || new Date().toISOString(),
      isHeuristic: value.isHeuristic === true ? true : false,
    };
  }
}
