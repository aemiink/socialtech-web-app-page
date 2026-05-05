import { Transform } from "class-transformer";
import { IsString, MaxLength } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateProjectFileFolderDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  name!: string;
}
