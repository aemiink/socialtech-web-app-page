import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateWorkspaceRevisionDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  description!: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsOptional()
  @IsUUID()
  releaseId?: string;

  @IsOptional()
  @IsUUID()
  projectFileId?: string;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;
}
