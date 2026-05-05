import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import { DeliverySprintStatus } from "@prisma/client";

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

function normalizeOptionalUppercase(value: unknown): unknown {
  const normalized = normalizeOptionalString(value);
  return typeof normalized === "string" ? normalized.toUpperCase() : normalized;
}

export class DeliverySprintQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalUppercase(value))
  @IsEnum(DeliverySprintStatus)
  status?: DeliverySprintStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @MaxLength(120)
  search?: string;

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
