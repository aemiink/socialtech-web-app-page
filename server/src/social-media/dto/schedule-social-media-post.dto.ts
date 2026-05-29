import { IsBoolean, IsDateString, ValidateIf } from "class-validator";

export class ScheduleSocialMediaPostDto {
  @IsDateString()
  scheduledAt!: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  clientVisible?: boolean;
}
