import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsString, MaxLength, ValidateIf } from "class-validator";
import { UserRole } from "@prisma/client";

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

function normalizeNullableText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class UpdateAdminUserDto {
  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(120)
  displayName?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(UserRole)
  role?: UserRole;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
