import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import {
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  Priority,
  TaskEnvironment,
  TaskSeverity,
  TaskStatus,
  TaskType,
  TaskWorkstream,
} from "@prisma/client";

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

function normalizeOptionalBoolean(value: unknown): unknown {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return undefined;
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
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  sprintId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalPriority(value))
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(TaskWorkstream)
  workstream?: TaskWorkstream;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(TaskSeverity)
  severity?: TaskSeverity;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(TaskEnvironment)
  environment?: TaskEnvironment;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalBoolean(value))
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(MetaAdsApprovalStatus)
  approvalStatus?: MetaAdsApprovalStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTaskStatus(value))
  @IsEnum(MetaAdsApprovalType)
  approvalType?: MetaAdsApprovalType;

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
