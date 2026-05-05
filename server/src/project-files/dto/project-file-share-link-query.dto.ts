import { IsOptional, IsUUID } from "class-validator";

export class ProjectFileShareLinkQueryDto {
  @IsOptional()
  @IsUUID()
  fileId?: string;
}

