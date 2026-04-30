import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ClientStatus } from "@prisma/client";

const CLIENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeNullableText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalEmail(value: unknown): unknown {
  const normalized = normalizeNullableText(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

function normalizeOptionalSlug(value: unknown): unknown {
  const normalized = normalizeOptionalText(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

export class UpdateAdminClientDto {
  @Transform(({ value, obj }) => normalizeOptionalText(value ?? obj?.companyName))
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  // Backward compatibility alias for older clients sending companyName.
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  companyName?: string;

  @Transform(({ value }) => normalizeOptionalSlug(value))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(CLIENT_SLUG_PATTERN, {
    message: "slug must contain lowercase letters, numbers, and single hyphens only.",
  })
  slug?: string;

  @Transform(({ value }) => normalizeOptionalEmail(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEmail()
  @MaxLength(254)
  contactEmail?: string | null;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}
