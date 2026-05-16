import { GoogleAdsInsightLevel } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { GoogleAdsDateRangeQueryDto } from "./google-ads-date-range-query.dto";

function normalizeOptionalInteger(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
}

function normalizeOptionalInsightLevel(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
}

export class GoogleAdsInsightsQueryDto extends GoogleAdsDateRangeQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInsightLevel(value))
  @IsEnum(GoogleAdsInsightLevel)
  level?: GoogleAdsInsightLevel;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInteger(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
