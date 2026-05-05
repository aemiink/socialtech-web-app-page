import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { WebAppWorkspaceContentItemType } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateWorkspaceContentItemDto {
  @IsOptional()
  @IsEnum(WebAppWorkspaceContentItemType)
  itemType?: WebAppWorkspaceContentItemType;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  body?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  href?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
