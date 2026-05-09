import { Transform } from "class-transformer";
import { IsDateString, IsOptional } from "class-validator";

function normalizeOptionalDate(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class MetaAdsDateRangeQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalDate(value))
  @IsDateString()
  since?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalDate(value))
  @IsDateString()
  until?: string;
}
