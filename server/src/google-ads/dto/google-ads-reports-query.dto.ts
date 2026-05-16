import { GoogleAdsReportStatus, GoogleAdsReportType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
}

function normalizeOptionalInteger(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
}

function normalizeOptionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return value;
}

export class GoogleAdsReportsQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsEnum(GoogleAdsReportStatus)
  status?: GoogleAdsReportStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsEnum(GoogleAdsReportType)
  type?: GoogleAdsReportType;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalBoolean(value))
  @IsBoolean()
  clientVisible?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
