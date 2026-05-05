import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

function toInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export class CreateProjectFileShareLinkDto {
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(720)
  expiresInHours?: number;
}

