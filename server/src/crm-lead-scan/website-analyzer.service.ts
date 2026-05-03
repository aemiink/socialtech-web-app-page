import { Injectable } from "@nestjs/common";
import { CrmLeadWebsiteStatus } from "@prisma/client";
import { WebsiteAnalysisResult } from "./crm-lead-scan.types";

type ExtractContext = {
  sector: string | null;
};

@Injectable()
export class WebsiteAnalyzerService {
  async analyze(website: string | null, sector: string | null): Promise<WebsiteAnalysisResult> {
    if (!website) {
      return buildNoWebsiteResult();
    }

    const normalizedWebsite = normalizeWebsiteUrl(website);
    if (!normalizedWebsite) {
      return buildFetchFailedResult("Website could not be fetched");
    }

    try {
      const response = await fetch(normalizedWebsite, {
        method: "GET",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "SocialTechLeadScanner/1.0",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        return buildFetchFailedResult("Website could not be fetched");
      }

      const html = await response.text();
      return extractWebsiteAnalysisFromHtml(html, { sector });
    } catch {
      return buildFetchFailedResult("Website could not be fetched");
    }
  }
}

export function extractWebsiteAnalysisFromHtml(
  html: string,
  context: ExtractContext,
): WebsiteAnalysisResult {
  const email = firstMatch(html, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  const phone = normalizePhone(firstMatch(html, /(?:\+?90|0)?[\s(.-]*\d{3}[\s).-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}/g));
  const whatsappLink = firstMatch(html, /https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^\s"'<>]+/gi);
  const whatsappPhone = whatsappLink ? extractWhatsappPhone(whatsappLink) : null;
  const instagramUrl = firstMatch(html, /https?:\/\/(?:www\.)?instagram\.com\/[^\s"'<>]+/gi);
  const facebookUrl = firstMatch(html, /https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+/gi);
  const websiteTitle = extractTagContent(html, "title");
  const metaDescription = extractMetaDescription(html);
  const lowered = html.toLocaleLowerCase("tr-TR");
  const hasContactForm = lowered.includes("<form") && /ilet[iı]şim|contact|randevu|rezervasyon|teklif/i.test(html);
  const hasAppointment = /randevu|appointment|book now|online randevu/i.test(html);
  const hasReservation = /rezervasyon|reservation|masa ay[ıi]rt|book table/i.test(html);
  const hasEcommerce = /sepete ekle|add to cart|checkout|sat[ıi]n al|ürünler|shop/i.test(html);
  const hasCTA = /bize ula[sş][ıi]n|hemen ara|whatsapp|teklif al|randevu al|rezervasyon yap/i.test(html);

  const websiteIssues: string[] = [];
  if (!email) {
    websiteIssues.push("No email found");
  }
  if (!whatsappLink) {
    websiteIssues.push("No WhatsApp link detected");
  }
  if (!instagramUrl) {
    websiteIssues.push("No Instagram link detected");
  }
  if (!websiteTitle) {
    websiteIssues.push("No title tag");
  }
  if (!metaDescription) {
    websiteIssues.push("No meta description");
  }
  if (!hasCTA) {
    websiteIssues.push("No clear CTA");
  }
  if (!hasContactForm) {
    websiteIssues.push("No contact form");
  }
  if (!hasAppointment && !hasReservation) {
    websiteIssues.push("No appointment or reservation indicator");
  }
  if (isCommerceSector(context.sector) && !hasEcommerce) {
    websiteIssues.push("E-commerce indicators missing where relevant");
  }
  if (websiteIssues.length >= 4) {
    websiteIssues.push("Weak conversion structure");
  }

  return {
    websiteStatus: CrmLeadWebsiteStatus.ANALYZED,
    websiteIssues,
    email,
    phone,
    whatsappPhone,
    whatsappLink,
    instagramUrl,
    facebookUrl,
    websiteTitle,
    metaDescription,
    hasContactForm,
    hasAppointment,
    hasReservation,
    hasEcommerce,
    hasCTA,
  };
}

function buildNoWebsiteResult(): WebsiteAnalysisResult {
  return {
    websiteStatus: CrmLeadWebsiteStatus.NO_WEBSITE,
    websiteIssues: ["No website"],
    email: null,
    phone: null,
    whatsappPhone: null,
    whatsappLink: null,
    instagramUrl: null,
    facebookUrl: null,
    websiteTitle: null,
    metaDescription: null,
    hasContactForm: false,
    hasAppointment: false,
    hasReservation: false,
    hasEcommerce: false,
    hasCTA: false,
  };
}

function buildFetchFailedResult(issue: string): WebsiteAnalysisResult {
  return {
    ...buildNoWebsiteResult(),
    websiteStatus: CrmLeadWebsiteStatus.FETCH_FAILED,
    websiteIssues: [issue],
  };
}

function normalizeWebsiteUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return null;
    }
  }
}

function extractWhatsappPhone(value: string): string | null {
  const match = value.match(/(\d{10,15})/);
  return match?.[1] ?? null;
}

function firstMatch(value: string, pattern: RegExp): string | null {
  const match = value.match(pattern);
  return match?.[0]?.trim() ?? null;
}

function extractTagContent(html: string, tagName: string): string | null {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  const content = match?.[1]?.replace(/\s+/g, " ").trim();
  return content ? content : null;
}

function extractMetaDescription(html: string): string | null {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1]?.trim() ?? null;
}

function normalizePhone(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D+/g, "");
  return digits.length >= 10 ? digits : null;
}

function isCommerceSector(sector: string | null): boolean {
  if (!sector) {
    return false;
  }

  return /butik|giyim|mobilya/i.test(sector);
}
