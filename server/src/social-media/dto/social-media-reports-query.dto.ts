import { Transform, Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { SocialMediaReportStatus, SocialMediaReportType } from "@prisma/client";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 || trimmed.toUpperCase() === "ALL" ? undefined : trimmed;
}

export class SocialMediaReportsQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsEnum(SocialMediaReportStatus)
  status?: SocialMediaReportStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsEnum(SocialMediaReportType)
  type?: SocialMediaReportType;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsDateString()
  from?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
