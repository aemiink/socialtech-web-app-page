import { Transform, Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ClientStatus } from "@prisma/client";
import { AdminClientOwnerDto } from "./admin-client-owner.dto";

const CLIENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeRequiredText(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalEmail(value: unknown): unknown {
  const normalized = normalizeOptionalText(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

function normalizeOptionalSlug(value: unknown): unknown {
  const normalized = normalizeOptionalText(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

export class CreateAdminClientDto {
  @Transform(({ value, obj }) => normalizeRequiredText(value ?? obj?.companyName))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

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
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  contactEmail?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminClientOwnerDto)
  owner?: AdminClientOwnerDto;
}
