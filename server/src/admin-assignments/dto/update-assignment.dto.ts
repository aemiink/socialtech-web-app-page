import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, ValidateIf } from "class-validator";
import { EmployeeClientAssignmentScope } from "@prisma/client";

function parseOptionalBoolean(value: unknown): unknown {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

export class UpdateAssignmentDto {
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(EmployeeClientAssignmentScope)
  scope?: EmployeeClientAssignmentScope;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
