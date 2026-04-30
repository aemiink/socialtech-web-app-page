import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export enum AdminClientOwnerMode {
  NONE = "NONE",
  CREATE = "CREATE",
  LINK_EXISTING = "LINK_EXISTING",
}

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

export class AdminClientOwnerDto {
  @IsOptional()
  @IsEnum(AdminClientOwnerMode)
  mode: AdminClientOwnerMode = AdminClientOwnerMode.NONE;

  @ValidateIf((owner: AdminClientOwnerDto) => owner.mode === AdminClientOwnerMode.CREATE)
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ValidateIf(
    (owner: AdminClientOwnerDto, value: unknown) =>
      owner.mode === AdminClientOwnerMode.CREATE || value !== undefined,
  )
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @ValidateIf((owner: AdminClientOwnerDto) => owner.mode === AdminClientOwnerMode.CREATE)
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_REQUIRES_LETTER_AND_DIGIT, {
    message: "password must contain at least one letter and one digit.",
  })
  password?: string;

  @ValidateIf((owner: AdminClientOwnerDto) => owner.mode === AdminClientOwnerMode.LINK_EXISTING)
  @IsUUID()
  userId?: string;
}
