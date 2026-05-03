import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AGENCY_SERVICES,
  LeadScanCandidate,
  LeadScoreResult,
  WebsiteAnalysisResult,
} from "./crm-lead-scan.types";

type ScoreLeadInput = {
  candidate: LeadScanCandidate;
  analysis: WebsiteAnalysisResult;
};

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(private readonly configService: ConfigService) {}

  async scoreLead(input: ScoreLeadInput): Promise<LeadScoreResult> {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY")?.trim();
    if (!apiKey) {
      return scoreLeadHeuristically(input);
    }

    try {
      const baseUrl =
        this.configService.get<string>("GEMINI_BASE_URL")?.replace(/\/+$/, "") ??
        "https://generativelanguage.googleapis.com/v1beta";
      const model = this.configService.get<string>("GEMINI_MODEL")?.trim() || "gemini-2.5-flash";
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
              parts: [
                {
                  text: [
                    "You score Turkish B2B CRM leads for a premium digital growth agency.",
                    "Return valid JSON only.",
                    "Use these exact keys:",
                    "lead_score, priority, detected_pain_points, recommended_services, outreach_angle, email_subject, email_body, whatsapp_message, reasoning_summary.",
                    "Priority must be HOT, WARM, COLD, or LOW_QUALITY.",
                    "Score 0-100. HOT is 80-100. WARM is 60-79. COLD is 0-59.",
                    "Turkish outreach only. Never claim you already audited hidden data. Offer a short free 3-point digital improvement suggestion.",
                    "Recommended services must come only from this list:",
                    AGENCY_SERVICES.join(", "),
                    "Lead input JSON:",
                    JSON.stringify(input),
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              required: [
                "lead_score",
                "priority",
                "detected_pain_points",
                "recommended_services",
                "outreach_angle",
                "email_subject",
                "email_body",
                "whatsapp_message",
                "reasoning_summary",
              ],
              properties: {
                lead_score: { type: "number" },
                priority: { type: "string", enum: ["HOT", "WARM", "COLD", "LOW_QUALITY"] },
                detected_pain_points: { type: "array", items: { type: "string" } },
                recommended_services: { type: "array", items: { type: "string" } },
                outreach_angle: { type: "string" },
                email_subject: { type: "string" },
                email_body: { type: "string" },
                whatsapp_message: { type: "string" },
                reasoning_summary: { type: "string" },
              },
            },
          },
        }),
        signal: AbortSignal.timeout(20_000),
      });

      if (!response.ok) {
        throw new Error(`Gemini scoring failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string | null }> } }>;
      };
      const content = payload.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
      if (!content) {
        throw new Error("Gemini returned an empty lead score response.");
      }

      return sanitizeLeadScore(JSON.parse(content) as Partial<LeadScoreResult>, input);
    } catch (error) {
      this.logger.warn(
        `Gemini scoring failed, falling back to heuristic scoring: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
      return scoreLeadHeuristically(input);
    }
  }
}

export function scoreLeadHeuristically(input: ScoreLeadInput): LeadScoreResult {
  const { candidate, analysis } = input;
  let score = 30;

  if (analysis.websiteStatus === "NO_WEBSITE") {
    score += 18;
  }
  if (analysis.websiteStatus === "FETCH_FAILED") {
    score += 10;
  }
  if (analysis.websiteIssues.length >= 4) {
    score += 14;
  }
  if (candidate.googleRating !== null && candidate.googleRating >= 4) {
    score += 8;
  }
  if (candidate.reviewCount !== null && candidate.reviewCount >= 25) {
    score += 8;
  }
  if (!analysis.email && !candidate.phone && !analysis.whatsappPhone) {
    score -= 20;
  }
  if (analysis.hasCTA) {
    score -= 4;
  }
  if (analysis.hasContactForm) {
    score -= 4;
  }
  if (analysis.hasAppointment || analysis.hasReservation) {
    score -= 3;
  }

  score = Math.max(0, Math.min(100, score));

  const priority =
    score >= 80 ? "HOT" : score >= 60 ? "WARM" : !analysis.email && !candidate.phone && !analysis.whatsappPhone ? "LOW_QUALITY" : "COLD";

  const detectedPainPoints = uniqueStrings([
    ...analysis.websiteIssues.slice(0, 4),
    !analysis.metaDescription ? "Arama görünürlüğünü güçlendirecek temel SEO alanları eksik." : null,
  ]).slice(0, 4);

  const recommendedServices = uniqueStrings([
    analysis.websiteStatus !== "ANALYZED" || analysis.websiteIssues.includes("No website")
      ? "Web sitesi"
      : null,
    analysis.websiteIssues.some((issue) => /SEO|meta/i.test(issue)) ? "SEO" : "SEO",
    analysis.instagramUrl ? null : "Sosyal medya yönetimi",
    analysis.websiteIssues.some((issue) => /Weak conversion|CTA|contact form/i.test(issue))
      ? "Otomasyon"
      : "Reklam yönetimi",
    /butik|giyim|mobilya/i.test(candidate.sector) ? "E-ticaret altyapısı" : null,
  ])
    .filter((service): service is (typeof AGENCY_SERVICES)[number] =>
      AGENCY_SERVICES.includes(service as (typeof AGENCY_SERVICES)[number]),
    )
    .slice(0, 3);

  const reasoningSummary = [
    `${candidate.businessName} için ${candidate.city} / ${candidate.sector} odağında tarama yapıldı.`,
    `Skor ${score} olarak hesaplandı.`,
    detectedPainPoints.length > 0 ? `Öne çıkan ihtiyaçlar: ${detectedPainPoints.join(", ")}` : null,
  ]
    .filter((item): item is string => Boolean(item))
    .join(" ");

  return sanitizeLeadScore(
    {
      lead_score: score,
      priority,
      detected_pain_points: detectedPainPoints,
      recommended_services: recommendedServices,
      outreach_angle: "Nazik, kısa ve satış baskısı yaratmadan ücretsiz 3 maddelik iyileştirme önerisi sun.",
      email_subject: `${candidate.businessName} için 3 maddelik kısa dijital iyileştirme önerisi`,
      email_body: buildEmailBody(candidate, detectedPainPoints),
      whatsapp_message: buildWhatsappMessage(candidate),
      reasoning_summary: reasoningSummary,
    },
    input,
  );
}

function sanitizeLeadScore(
  value: Partial<LeadScoreResult>,
  input: ScoreLeadInput,
): LeadScoreResult {
  const leadScore = clampScore(value.lead_score);
  const priority = sanitizePriority(value.priority, leadScore);
  const painPoints = uniqueStrings(value.detected_pain_points).slice(0, 5);
  const services = uniqueStrings(value.recommended_services)
    .filter((service): service is (typeof AGENCY_SERVICES)[number] =>
      AGENCY_SERVICES.includes(service as (typeof AGENCY_SERVICES)[number]),
    )
    .slice(0, 4);

  return {
    lead_score: leadScore,
    priority,
    detected_pain_points: painPoints,
    recommended_services: services,
    outreach_angle: value.outreach_angle?.trim() || "Kısa, saygılı ve değer odaklı ilk temas.",
    email_subject: value.email_subject?.trim() || `${input.candidate.businessName} için kısa dijital öneri`,
    email_body: value.email_body?.trim() || buildEmailBody(input.candidate, painPoints),
    whatsapp_message: value.whatsapp_message?.trim() || buildWhatsappMessage(input.candidate),
    reasoning_summary:
      value.reasoning_summary?.trim() ||
      `${input.candidate.businessName} için dijital görünürlük ve dönüşüm potansiyeli bazlı skor oluşturuldu.`,
  };
}

function clampScore(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 50;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sanitizePriority(value: string | undefined, leadScore: number) {
  if (value === "HOT" || value === "WARM" || value === "COLD" || value === "LOW_QUALITY") {
    return value;
  }
  if (leadScore >= 80) {
    return "HOT";
  }
  if (leadScore >= 60) {
    return "WARM";
  }
  return "COLD";
}

function uniqueStrings(values: Array<string | null | undefined> | undefined): string[] {
  if (!values) {
    return [];
  }
  return values
    .map((value) => value?.trim())
    .filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);
}

function buildEmailBody(candidate: LeadScanCandidate, painPoints: string[]): string {
  const list = painPoints.slice(0, 3);
  const bulletLines = list.length > 0
    ? list.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. Web görünürlüğü ve dönüşüm alanları\n2. İletişim akışı\n3. Dijital büyüme kurgusu";

  return [
    `Merhaba ${candidate.businessName} ekibi,`,
    "",
    "İşletmenizi incelerken dijital tarafta birkaç hızlı gelişim fırsatı gördüm.",
    "",
    "Özellikle:",
    bulletLines,
    "",
    "Biz Social Tech olarak web sitesi, reklam yönetimi, sosyal medya, kreatif üretim, SEO ve otomasyonları birlikte çalışan bir büyüme sistemi olarak kurguluyoruz.",
    "",
    `Uygunsa, ${candidate.businessName} için kısa ve ücretsiz 3 maddelik bir dijital iyileştirme önerisi paylaşabilirim.`,
    "",
    "Sevgiler,",
    "Emin",
    "Social Tech",
  ].join("\n");
}

function buildWhatsappMessage(candidate: LeadScanCandidate): string {
  return `Merhaba, ${candidate.businessName} için yazıyorum. Dijital tarafta birkaç hızlı iyileştirme fırsatı gördüm. Uygunsa size ücretsiz şekilde 3 maddelik kısa bir öneri paylaşabilirim.`;
}
