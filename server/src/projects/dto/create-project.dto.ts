import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Priority, ProjectStatus, PurchasedServiceKey } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateProjectDto {
  @IsUUID()
  clientProfileId!: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(PurchasedServiceKey)
  serviceKey?: PurchasedServiceKey | null;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  description?: string | null;

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
