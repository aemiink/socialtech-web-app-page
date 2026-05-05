import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import { ProjectFileCategory, ProjectFileVisibility } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateUploadSignatureDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(200)
  fileName!: string;

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
  @MaxLength(180)
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(1024 * 1024 * 1024)
  bytes!: number;

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
