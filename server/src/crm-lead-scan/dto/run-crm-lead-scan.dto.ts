import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

function normalizeOptionalStringArray(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : item))
    .filter((item): item is string => typeof item === "string" && item.length > 0);
}

function normalizeOptionalInt(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? value : parsed;
}

export class RunCrmLeadScanDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInt(value))
  @IsInt()
  @Min(1)
  @Max(6)
  queryLimit?: number;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalStringArray(value))
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalStringArray(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  sectors?: string[];
}
