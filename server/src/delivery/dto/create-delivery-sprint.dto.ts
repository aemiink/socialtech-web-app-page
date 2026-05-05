import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { DeliverySprintStatus } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateDeliverySprintDto {
  @IsUUID()
  projectId!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  goal?: string | null;

  @IsOptional()
  @IsEnum(DeliverySprintStatus)
  status?: DeliverySprintStatus;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
