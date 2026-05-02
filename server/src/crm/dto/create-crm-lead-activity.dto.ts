import { Transform } from "class-transformer";
import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { CrmLeadActivityType } from "@prisma/client";

function requiredText(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateCrmLeadActivityDto {
  @IsEnum(CrmLeadActivityType)
  type!: CrmLeadActivityType;

  @Transform(({ value }) => requiredText(value))
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  note!: string;

  @IsOptional()
  @IsISO8601()
  nextFollowUpAt?: string;
}
