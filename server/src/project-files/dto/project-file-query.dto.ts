import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import {
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  ProjectFileCategory,
  ProjectFileVisibility,
} from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function toInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
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

export class ProjectFileQueryDto {
  @IsOptional()
  @IsEnum(ProjectFileCategory)
  category?: ProjectFileCategory;

  @IsOptional()
  @IsEnum(ProjectFileVisibility)
  visibility?: ProjectFileVisibility;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @IsEnum(MetaAdsApprovalStatus)
  approvalStatus?: MetaAdsApprovalStatus;

  @IsOptional()
  @IsEnum(MetaAdsApprovalType)
  approvalType?: MetaAdsApprovalType;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
