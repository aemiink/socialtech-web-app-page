import { Transform } from "class-transformer";
import { IsIn, IsOptional } from "class-validator";

export const AMAZON_ADS_REPORT_EXPORT_FORMATS = ["json", "csv"] as const;

export type AmazonAdsReportExportFormat =
  (typeof AMAZON_ADS_REPORT_EXPORT_FORMATS)[number];

function normalizeOptionalFormat(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class AmazonAdsReportExportQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalFormat(value))
  @IsIn(AMAZON_ADS_REPORT_EXPORT_FORMATS)
  format: AmazonAdsReportExportFormat = "json";
}
