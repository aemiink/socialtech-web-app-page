import { AmazonAdsReportType } from "@prisma/client";
import { IsBoolean, IsDateString, IsEnum, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateAmazonAdsReportDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsEnum(AmazonAdsReportType)
  type!: AmazonAdsReportType;

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
