import { Transform } from "class-transformer";
import { IsOptional, IsString, MinLength } from "class-validator";

export class RefreshTokenDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(10)
  refreshToken?: string;
}
