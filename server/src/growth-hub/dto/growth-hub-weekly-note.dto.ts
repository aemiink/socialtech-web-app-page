import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

function normalizeNullableText(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class CreateGrowthHubWeeklyNoteDto {
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  projectId?: string | null;

  @IsDateString()
  weekStart!: string;

  @IsDateString()
  weekEnd!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  summary!: string;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(2000)
  nextFocus?: string | null;

  @IsOptional()
  risks?: unknown;

  @IsOptional()
  @IsBoolean()
  clientVisible?: boolean;
}

export class UpdateGrowthHubWeeklyNoteDto {
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  projectId?: string | null;

  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsDateString()
  weekEnd?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  summary?: string;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(2000)
  nextFocus?: string | null;

  @IsOptional()
  risks?: unknown;

  @IsOptional()
  @IsBoolean()
  clientVisible?: boolean;
}
