import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { AmazonAdsDateRangeQueryDto } from "./amazon-ads-date-range-query.dto";

function normalizeOptionalInteger(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
}

export class AmazonAdsProductsQueryDto extends AmazonAdsDateRangeQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
