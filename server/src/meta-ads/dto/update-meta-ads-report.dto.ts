import { MetaAdsReportStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMetaAdsReportDto {
  @IsOptional()
  @IsEnum(MetaAdsReportStatus)
  status?: MetaAdsReportStatus;

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
