import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { AccountType, UserRole } from "@prisma/client";

const PASSWORD_REQUIRES_LETTER_AND_DIGIT = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function normalizeEmail(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class CreateAdminEmployeeUserDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Transform(({ value }) => normalizeOptionalText(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_REQUIRES_LETTER_AND_DIGIT, {
    message: "password must contain at least one letter and one digit.",
  })
  password!: string;

  @IsEnum(AccountType)
  accountType!: AccountType;

  @IsEnum(UserRole)
  role!: UserRole;
}
