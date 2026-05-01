import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { Priority, TaskStatus } from "@prisma/client";

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  if (
    normalized.length === 0 ||
    normalized.toLowerCase() === "undefined" ||
    normalized.toLowerCase() === "null" ||
    normalized.toUpperCase() === "ALL"
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeOptionalTaskStatus(value: unknown): unknown {
  const normalized = normalizeOptionalString(value);
  if (typeof normalized !== "string") {
    return normalized;
  }

  return normalized.toUpperCase();
}

function normalizeOptionalPriority(value: unknown): unknown {
  const normalized = normalizeOptionalString(value);
  if (typeof normalized !== "string") {
    return normalized;
  }

  return normalized.toUpperCase();
}

export class TaskQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  clientProfileId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  assigneeUserId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalPriority(value))
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsDateString()
  dueFrom?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsDateString()
  dueTo?: string;
}
