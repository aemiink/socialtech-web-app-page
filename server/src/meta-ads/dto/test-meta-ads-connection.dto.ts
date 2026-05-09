import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalStringArray(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

export class TestMetaAdsConnectionDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MinLength(20)
  @MaxLength(8192)
  accessToken?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  adAccountId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  requiredScopes?: string[];
}
