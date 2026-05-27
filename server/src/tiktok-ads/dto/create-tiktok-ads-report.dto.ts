import { TikTokAdsReportType } from "@prisma/client";
import { IsBoolean, IsDateString, IsEnum, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateTikTokAdsReportDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsEnum(TikTokAdsReportType)
  type!: TikTokAdsReportType;

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
