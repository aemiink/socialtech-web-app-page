import { AmazonAdsReportStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateAmazonAdsReportDto {
  @IsOptional()
  @IsEnum(AmazonAdsReportStatus)
  status?: AmazonAdsReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  summary?: string;

  @IsOptional()
  @IsObject()
  metricsSnapshot?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  clientVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  requestAcknowledgement?: boolean;
}
