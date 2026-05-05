import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsUUID } from "class-validator";

export class UpdateProjectFileFolderAssigneesDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(50)
  @IsUUID("4", { each: true })
  userIds?: string[];
}
