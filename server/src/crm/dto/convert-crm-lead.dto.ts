import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const CLIENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function optionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ConvertCrmLeadDto {
  @Transform(({ value }) => optionalText(value))
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  clientName?: string;

  @Transform(({ value }) => {
    const normalized = optionalText(value);
    return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(CLIENT_SLUG_PATTERN, {
    message: "slug must contain lowercase letters, numbers, and single hyphens only.",
  })
  slug?: string;
}
