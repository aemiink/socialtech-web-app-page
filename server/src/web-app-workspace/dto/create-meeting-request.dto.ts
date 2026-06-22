import { Transform } from "class-transformer";
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateMeetingRequestDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  agenda?: string | null;

  @IsDateString()
  preferredStartAt!: string;

  @IsDateString()
  preferredEndAt!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  timezone!: string;
}
