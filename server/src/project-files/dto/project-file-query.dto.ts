import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { ProjectFileCategory, ProjectFileVisibility } from "@prisma/client";

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

export class ProjectFileQueryDto {
  @IsOptional()
  @IsEnum(ProjectFileCategory)
  category?: ProjectFileCategory;

  @IsOptional()
  @IsEnum(ProjectFileVisibility)
  visibility?: ProjectFileVisibility;

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
