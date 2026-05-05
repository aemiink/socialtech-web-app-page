import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { WebAppWorkspaceMeetingRequestStatus } from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateMeetingRequestDto {
  @IsOptional()
  @IsEnum(WebAppWorkspaceMeetingRequestStatus)
  status?: WebAppWorkspaceMeetingRequestStatus;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  responseNote?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledStartAt?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string | null;
}
