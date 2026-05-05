import { Transform } from "class-transformer";
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateWeeklyReportDto {
  @IsDateString()
  weekStartDate!: string;

  @IsDateString()
  weekEndDate!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  summary!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  accomplishments?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  plannedNext?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  blockers?: string | null;
}
