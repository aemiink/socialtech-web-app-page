import { IsOptional, IsUUID } from "class-validator";

export class UpdateProjectFileFolderDto {
  @IsOptional()
  @IsUUID()
  folderId?: string | null;
}
