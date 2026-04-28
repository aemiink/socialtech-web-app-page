import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsUUID } from "class-validator";
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

export class AssignmentQueryDto {
  @IsOptional()
  @IsUUID()
  employeeUserId?: string;

  @IsOptional()
  @IsUUID()
  clientProfileId?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(EmployeeClientAssignmentScope)
  scope?: EmployeeClientAssignmentScope;
}
