import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { PurchasedServiceKey, PurchasedServiceStatus } from "@prisma/client";

export class AdminClientPurchasedServiceDto {
  @IsEnum(PurchasedServiceKey)
  serviceKey!: PurchasedServiceKey;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() || null : value))
  @IsString()
  @MaxLength(80)
  packageTierKey?: string | null;

  @IsOptional()
  @IsEnum(PurchasedServiceStatus)
  status?: PurchasedServiceStatus;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  startedAt?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  endedAt?: string | null;
}
