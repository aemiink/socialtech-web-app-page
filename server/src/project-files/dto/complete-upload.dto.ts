import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import { ProjectFileCategory, ProjectFileVisibility } from "@prisma/client";

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

  @IsUUID()
  folderId!: string;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}
