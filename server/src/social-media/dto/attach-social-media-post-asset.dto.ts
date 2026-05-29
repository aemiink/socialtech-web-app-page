import { Transform } from "class-transformer";
import { IsInt, IsUUID, Max, Min, ValidateIf } from "class-validator";

function toInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export class AttachSocialMediaPostAssetDto {
  @IsUUID()
  fileId!: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}
