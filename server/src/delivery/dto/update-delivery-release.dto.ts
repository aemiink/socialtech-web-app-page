import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { DeliveryReleaseApprovalStatus, DeliveryReleaseStatus, TaskEnvironment } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateDeliveryReleaseDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsEnum(TaskEnvironment)
  environment?: TaskEnvironment;

  @IsOptional()
  @IsEnum(DeliveryReleaseStatus)
  status?: DeliveryReleaseStatus;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(60)
  version?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  releaseNotes?: string | null;

  @IsOptional()
  @IsEnum(DeliveryReleaseApprovalStatus)
  approvalStatus?: DeliveryReleaseApprovalStatus;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  approvalNotes?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;
}
