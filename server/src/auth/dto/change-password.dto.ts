import { IsString, MinLength, NotContains } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @NotContains(" ")
  newPassword!: string;
}
