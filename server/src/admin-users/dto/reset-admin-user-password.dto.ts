import { IsString, Matches, MaxLength, MinLength } from "class-validator";

const PASSWORD_REQUIRES_LETTER_AND_DIGIT = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export class ResetAdminUserPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_REQUIRES_LETTER_AND_DIGIT, {
    message: "newPassword must contain at least one letter and one digit.",
  })
  newPassword!: string;
}
