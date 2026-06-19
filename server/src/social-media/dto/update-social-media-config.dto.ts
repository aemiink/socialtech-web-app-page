import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { SocialMediaConnectionStatus, SocialMediaGoal, SocialMediaPlatform } from "@prisma/client";

function normalizeNullableText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalHashtags(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export class UpdateSocialMediaConfigDto {
  @Transform(({ value }) => normalizeOptionalHashtags(value))
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ArrayUnique()
  @IsEnum(SocialMediaPlatform, { each: true })
  activePlatforms?: SocialMediaPlatform[];

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(120)
  instagramUsername?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(120)
  instagramAccountId?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(120)
  facebookPageId?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(120)
  tiktokUsername?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(240)
  linkedinPageUrl?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(120)
  contentFrequency?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(SocialMediaGoal)
  primaryGoal?: SocialMediaGoal | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(160)
  toneOfVoice?: string | null;

  @Transform(({ value }) => normalizeOptionalHashtags(value))
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  hashtags?: string[];

  @IsOptional()
  @IsEnum(SocialMediaConnectionStatus)
  connectionStatus?: SocialMediaConnectionStatus;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  lastSyncAt?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(500)
  syncError?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
