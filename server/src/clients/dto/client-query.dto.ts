import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ClientStatus } from "@prisma/client";

export const CLIENT_SORT_BY_VALUES = ["createdAt", "updatedAt", "name", "slug", "status"] as const;
export type ClientSortBy = (typeof CLIENT_SORT_BY_VALUES)[number];

export const CLIENT_SORT_ORDER_VALUES = ["asc", "desc"] as const;
export type ClientSortOrder = (typeof CLIENT_SORT_ORDER_VALUES)[number];

const MAX_CLIENTS_PAGE = 10_000;

function parseOptionalPositiveInteger(value: unknown): unknown {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? value : String(value);
  }

  if (typeof value !== "string") {
    return value;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : value;
}

function normalizeOptionalSearch(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ClientQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(MAX_CLIENTS_PAGE)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(CLIENT_SORT_BY_VALUES)
  sortBy: ClientSortBy = "createdAt";

  @IsOptional()
  @IsIn(CLIENT_SORT_ORDER_VALUES)
  sortOrder: ClientSortOrder = "desc";

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @Transform(({ value }) => normalizeOptionalSearch(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
