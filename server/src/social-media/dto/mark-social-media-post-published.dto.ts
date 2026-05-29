import { Transform } from "class-transformer";
import { IsDateString, IsString, MaxLength, ValidateIf } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class MarkSocialMediaPostPublishedDto {
  @IsDateString()
  publishedAt!: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  externalPostUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(180)
  externalPostId?: string | null;
}
