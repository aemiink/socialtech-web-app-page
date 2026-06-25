import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import {
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  ProjectFileCategory,
  ProjectFileVisibility,
} from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CompleteUploadDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(200)
  originalFileName!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(400)
  publicId!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  secureUrl!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(32)
  resourceType!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(20)
  format?: string | null;

  @IsInt()
  @Min(1)
  @Max(1024 * 1024 * 1024)
  bytes!: number;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(180)
  mimeType!: string;

  @IsEnum(ProjectFileCategory)
  category!: ProjectFileCategory;

  @IsEnum(ProjectFileVisibility)
  visibility!: ProjectFileVisibility;

  @IsOptional()
  @IsUUID()
  overwriteFileId?: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @IsEnum(MetaAdsApprovalType)
  approvalType?: MetaAdsApprovalType | null;

  @IsOptional()
  @IsEnum(MetaAdsApprovalStatus)
  approvalStatus?: MetaAdsApprovalStatus | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  approvalResponseNote?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  campaignRef?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  adSetRef?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  adRef?: string | null;

  @IsOptional()
  @IsObject()
  performanceSummary?: Record<string, unknown> | null;
}
