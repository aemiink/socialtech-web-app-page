import { IsEnum, IsISO8601, IsOptional } from "class-validator";
import { CrmLeadStatus } from "@prisma/client";

export class UpdateAssignedCrmLeadDto {
  @IsOptional()
  @IsEnum(CrmLeadStatus)
  status?: CrmLeadStatus;

  @IsOptional()
  @IsISO8601()
  nextFollowUpAt?: string | null;
}
