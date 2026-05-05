import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { WebAppWorkspaceRevisionStatus } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateWorkspaceRevisionStatusDto {
  @IsEnum(WebAppWorkspaceRevisionStatus)
  status!: WebAppWorkspaceRevisionStatus;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  note?: string | null;
}
