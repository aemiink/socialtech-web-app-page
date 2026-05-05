import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { WebAppWorkspaceTabKey } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateWorkspaceMessageDto {
  @IsEnum(WebAppWorkspaceTabKey)
  tabKey!: WebAppWorkspaceTabKey;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;
}
