import { IsEnum, IsOptional } from "class-validator";
import { WebAppWorkspaceTabKey } from "@prisma/client";

export class WorkspaceQueryDto {
  @IsOptional()
  @IsEnum(WebAppWorkspaceTabKey)
  tabKey?: WebAppWorkspaceTabKey;
}
