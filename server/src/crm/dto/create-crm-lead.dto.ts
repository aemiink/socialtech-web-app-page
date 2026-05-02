import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { CrmLeadSource, CrmLeadStatus } from "@prisma/client";

function requiredText(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function optionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalEmail(value: unknown): unknown {
  const normalized = optionalText(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

export class CreateCrmLeadDto {
  @Transform(({ value }) => requiredText(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  companyName!: string;

  @Transform(({ value }) => requiredText(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  contactName!: string;

  @Transform(({ value }) => optionalEmail(value))
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  contactEmail?: string;

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsUUID()
  ownerUserId!: string;

  @IsOptional()
  @IsEnum(CrmLeadSource)
  source?: CrmLeadSource;

  @IsOptional()
  @IsEnum(CrmLeadStatus)
  status?: CrmLeadStatus;

  @IsOptional()
  @IsISO8601()
  nextFollowUpAt?: string;

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  initialNote?: string;
}
