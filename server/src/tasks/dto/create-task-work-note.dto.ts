import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateTaskWorkNoteDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  note!: string;
}
