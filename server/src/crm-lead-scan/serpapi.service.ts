import { BadGatewayException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GeneratedLeadScanQuery, LeadScanCandidate } from "./crm-lead-scan.types";

type SerpApiLocalResult = {
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number | string;
  reviews?: number | string;
  link?: string;
  place_id?: string;
  data_id?: string;
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };
};

type SerpApiResponse = {
  local_results?: SerpApiLocalResult[];
  error?: string;
};

@Injectable()
export class SerpApiService {
  constructor(private readonly configService: ConfigService) {}

  async searchGoogleMaps(query: GeneratedLeadScanQuery): Promise<LeadScanCandidate[]> {
    const apiKey = this.configService.get<string>("SERPAPI_API_KEY")?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException("SERPAPI_API_KEY is not configured.");
    }

    const params = new URLSearchParams({
      engine: "google_maps",
      q: query.query,
      hl: "tr",
      gl: "tr",
      type: "search",
      num: "20",
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new BadGatewayException(`SerpAPI request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as SerpApiResponse;
    if (payload.error) {
      throw new BadGatewayException(`SerpAPI error: ${payload.error}`);
    }

    return normalizeSerpApiLocalResults(query, payload.local_results ?? []);
  }
}

export function normalizeSerpApiLocalResults(
  query: GeneratedLeadScanQuery,
  localResults: SerpApiLocalResult[],
): LeadScanCandidate[] {
  return localResults
    .map((result) => {
      const businessName = result.title?.trim();
      if (!businessName) {
        return null;
      }

      return {
        businessName,
        sector: query.sector,
        city: query.city,
        address: result.address?.trim() ?? null,
        phone: result.phone?.trim() ?? null,
        website: result.website?.trim() ?? null,
        googleRating: toNumberOrNull(result.rating),
        reviewCount: toIntOrNull(result.reviews),
        googleMapsUrl: buildGoogleMapsUrl(result),
        placeId: result.place_id?.trim() ?? result.data_id?.trim() ?? null,
        sourceQuery: query.query,
        sourceProvider: "serpapi" as const,
      };
    })
    .filter((item): item is LeadScanCandidate => item !== null);
}

function buildGoogleMapsUrl(result: SerpApiLocalResult): string | null {
  if (result.link?.trim()) {
    return result.link.trim();
  }

  const latitude = result.gps_coordinates?.latitude;
  const longitude = result.gps_coordinates?.longitude;
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  return null;
}

function toNumberOrNull(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(normalized) ? normalized : null;
  }
  return null;
}

function toIntOrNull(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string") {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) {
      return null;
    }
    const normalized = Number.parseInt(digits, 10);
    return Number.isSafeInteger(normalized) ? normalized : null;
  }
  return null;
}
