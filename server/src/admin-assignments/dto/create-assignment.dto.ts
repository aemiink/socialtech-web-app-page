import { IsEnum, IsUUID } from "class-validator";
import { EmployeeClientAssignmentScope } from "@prisma/client";

export class CreateAssignmentDto {
  @IsUUID()
  employeeUserId!: string;

  @IsUUID()
  clientProfileId!: string;

  @IsEnum(EmployeeClientAssignmentScope)
  scope!: EmployeeClientAssignmentScope;
}
