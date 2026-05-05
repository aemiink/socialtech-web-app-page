import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  if (!normalized || normalized.toLowerCase() === "all") {
    return undefined;
  }

  return normalized;
}

export class GithubQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @MaxLength(120)
  branch?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  since?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  until?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsIn(["open", "closed", "all"])
  state?: "open" | "closed" | "all";

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @MaxLength(60)
  status?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  protected?: boolean;
}
