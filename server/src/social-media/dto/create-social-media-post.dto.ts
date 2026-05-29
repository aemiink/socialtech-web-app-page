import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  SocialMediaPlatform,
  SocialMediaPostStatus,
  SocialMediaPostType,
} from "@prisma/client";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateSocialMediaPostDto {
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  projectId?: string | null;

  @IsEnum(SocialMediaPlatform)
  platform!: SocialMediaPlatform;

  @IsEnum(SocialMediaPostType)
  type!: SocialMediaPostType;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(SocialMediaPostStatus)
  status?: SocialMediaPostStatus;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(4000)
  caption?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  scheduledAt?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  publishedAt?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  clientVisible?: boolean;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  approvalTaskId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  assignedToUserId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(180)
  externalPostId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  externalPostUrl?: string | null;
}
