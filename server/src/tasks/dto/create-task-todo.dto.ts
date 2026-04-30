import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsString, MaxLength, Min, MinLength, ValidateIf } from "class-validator";
import { TaskTodoVisibility } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateTaskTodoDto {
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
  @IsEnum(TaskTodoVisibility)
  visibility?: TaskTodoVisibility;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
