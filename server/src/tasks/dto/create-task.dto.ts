import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";
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

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateTaskDto {
  @IsUUID()
  projectId!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(Priority)
  priority?: Priority;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(TaskType)
  type?: TaskType;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(TaskWorkstream)
  workstream?: TaskWorkstream;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(TaskSeverity)
  severity?: TaskSeverity | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(TaskEnvironment)
  environment?: TaskEnvironment | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(300)
  affectedUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  reproductionSteps?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(180)
  reportedBy?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(60)
  code?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  assigneeUserId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  sprintId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  dueDate?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  approvalRequired?: boolean;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(MetaAdsApprovalType)
  approvalType?: MetaAdsApprovalType | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(MetaAdsApprovalStatus)
  approvalStatus?: MetaAdsApprovalStatus | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  approvalResponseNote?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  approvalRequestedAt?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  approvalRespondedAt?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  referenceProjectFileId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  campaignRef?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  adSetRef?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  adRef?: string | null;
}
