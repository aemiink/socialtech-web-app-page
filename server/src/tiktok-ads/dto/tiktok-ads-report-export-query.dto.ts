import { Transform } from "class-transformer";
import { IsIn, IsOptional } from "class-validator";

export const TIKTOK_ADS_REPORT_EXPORT_FORMATS = ["json", "csv"] as const;

export type TikTokAdsReportExportFormat =
  (typeof TIKTOK_ADS_REPORT_EXPORT_FORMATS)[number];

function normalizeOptionalFormat(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class TikTokAdsReportExportQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalFormat(value))
  @IsIn(TIKTOK_ADS_REPORT_EXPORT_FORMATS)
  format: TikTokAdsReportExportFormat = "json";
}
