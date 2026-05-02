import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

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

export class CreatePublicCrmLeadDto {
  @Transform(({ value }) => requiredText(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  fullName!: string;

  @Transform(({ value }) => requiredText(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  companyName!: string;

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

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  serviceInterest?: string;

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  budgetRange?: string;

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  goal?: string;

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourcePath?: string;

  @IsBoolean()
  consentAccepted!: boolean;
}
