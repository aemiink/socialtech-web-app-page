import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class ConnectProjectRepositoryDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  owner!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  repo!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(200)
  repositoryUrl?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  defaultBranch?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  accessToken?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  installationId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
