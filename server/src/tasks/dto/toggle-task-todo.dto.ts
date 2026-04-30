import { IsBoolean, IsOptional } from "class-validator";

export class ToggleTaskTodoDto {
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
