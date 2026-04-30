import { IsDateString, IsEnum, IsOptional, ValidateIf } from "class-validator";
import { PurchasedServiceKey, PurchasedServiceStatus } from "@prisma/client";

export class AdminClientPurchasedServiceDto {
  @IsEnum(PurchasedServiceKey)
  serviceKey!: PurchasedServiceKey;

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
