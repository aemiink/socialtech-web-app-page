import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { CrmLeadSource, CrmLeadStatus } from "@prisma/client";

export type CrmLeadSortBy = "createdAt" | "updatedAt" | "nextFollowUpAt" | "companyName" | "status";
export type CrmLeadSortOrder = "asc" | "desc";

function optionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalInt(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? value : parsed;
}

export class AdminCrmLeadQueryDto {
  @Transform(({ value }) => optionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Transform(({ value }) => optionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(CrmLeadStatus)
  status?: CrmLeadStatus;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @IsOptional()
  @IsEnum(CrmLeadSource)
  source?: CrmLeadSource;

  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  nextFollowUpFrom?: string;

  @IsOptional()
  @IsISO8601()
  nextFollowUpTo?: string;

  @IsOptional()
  @IsIn(["createdAt", "updatedAt", "nextFollowUpAt", "companyName", "status"])
  sortBy?: CrmLeadSortBy;

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: CrmLeadSortOrder;
}
