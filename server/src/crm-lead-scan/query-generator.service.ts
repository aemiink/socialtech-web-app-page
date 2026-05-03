import { Injectable } from "@nestjs/common";
import {
  DEFAULT_LEAD_SCAN_CITIES,
  DEFAULT_LEAD_SCAN_SECTORS,
  GeneratedLeadScanQuery,
  getLeadScanRotationSeed,
} from "./crm-lead-scan.types";

export type LeadScanQueryInput = {
  cities?: string[];
  sectors?: string[];
};

@Injectable()
export class QueryGeneratorService {
  generateQueries(input: LeadScanQueryInput, limit: number, now = new Date()): GeneratedLeadScanQuery[] {
    return generateLeadScanQueries(input, limit, now);
  }
}

export function generateLeadScanQueries(
  input: LeadScanQueryInput,
  limit: number,
  now = new Date(),
): GeneratedLeadScanQuery[] {
  const cities = sanitizeValues(input.cities, DEFAULT_LEAD_SCAN_CITIES);
  const sectors = sanitizeValues(input.sectors, DEFAULT_LEAD_SCAN_SECTORS);
  const pairs: GeneratedLeadScanQuery[] = [];

  for (const city of cities) {
    for (const sector of sectors) {
      pairs.push({
        city,
        sector,
        query: `${city} ${sector}`,
      });
    }
  }

  const rotated = rotateArray(pairs, getLeadScanRotationSeed(now));
  return rotated.slice(0, Math.max(limit, 0));
}

export function rotateArray<T>(items: readonly T[], seed: number): T[] {
  if (items.length === 0) {
    return [];
  }

  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function sanitizeValues(input: string[] | undefined, fallback: readonly string[]): string[] {
  const values = input
    ?.map((value) => value.trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

  return values && values.length > 0 ? values : [...fallback];
}
