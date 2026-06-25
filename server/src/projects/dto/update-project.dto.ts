import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";
import {
  Priority,
  ProjectGa4MeasurementProfile,
  ProjectGa4Status,
  ProjectStatus,
  PurchasedServiceKey,
} from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateProjectDto {
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsUUID()
  clientProfileId?: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(PurchasedServiceKey)
  serviceKey?: PurchasedServiceKey | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  figmaProjectUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  repositoryUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  livePreviewUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(64)
  ga4MeasurementId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(64)
  ga4PropertyId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(ProjectGa4Status)
  ga4Status?: ProjectGa4Status;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(ProjectGa4MeasurementProfile)
  ga4MeasurementProfile?: ProjectGa4MeasurementProfile;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(Priority)
  priority?: Priority;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  startDate?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  dueDate?: string | null;
}
