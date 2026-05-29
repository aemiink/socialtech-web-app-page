import { Transform, Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { SocialMediaPlatform } from "@prisma/client";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 || trimmed.toUpperCase() === "ALL" ? undefined : trimmed;
}

export class SocialMediaInsightsQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsUUID()
  postId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsEnum(SocialMediaPlatform)
  platform?: SocialMediaPlatform;

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
