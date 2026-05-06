import { Transform } from "class-transformer";
import {
  ClientApprovalEntityType,
  ClientApprovalStatus,
  ClientApprovalType,
  PurchasedServiceKey,
} from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateClientApprovalDto {
  @IsOptional()
  @IsEnum(ClientApprovalType)
  type?: ClientApprovalType;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(ClientApprovalStatus)
  status?: ClientApprovalStatus;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message?: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsObject()
  actionPayload?: Record<string, unknown> | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(ClientApprovalEntityType)
  entityType?: ClientApprovalEntityType | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  entityId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  projectId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsEnum(PurchasedServiceKey)
  serviceKey?: PurchasedServiceKey | null;

  @IsOptional()
  @IsBoolean()
  requiresExplicitApproval?: boolean;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  assignedToUserId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsISO8601()
  dueAt?: string | null;
}
