import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { CrmLeadStatus } from "@prisma/client";

function optionalTextOrNull(value: unknown): unknown {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalEmailOrNull(value: unknown): unknown {
  const normalized = optionalTextOrNull(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

export class UpdateCrmLeadDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  companyName?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  contactName?: string;

  @Transform(({ value }) => optionalEmailOrNull(value))
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  contactEmail?: string | null;

  @Transform(({ value }) => optionalTextOrNull(value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @IsOptional()
  @IsEnum(CrmLeadStatus)
  status?: CrmLeadStatus;

  @IsOptional()
  @IsISO8601()
  nextFollowUpAt?: string | null;
}
