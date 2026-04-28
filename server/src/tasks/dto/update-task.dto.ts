import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Priority, TaskStatus } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateTaskDto {
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsUUID()
  projectId?: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

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

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  assigneeUserId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  dueDate?: string | null;
}
