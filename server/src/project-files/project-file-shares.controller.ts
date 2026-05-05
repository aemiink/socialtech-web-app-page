import { Controller, Get, Param } from "@nestjs/common";
import { ProjectFilesService } from "./project-files.service";

@Controller("file-shares")
export class ProjectFileSharesController {
  constructor(private readonly projectFilesService: ProjectFilesService) {}

  @Get(":token")
  resolveShareToken(@Param("token") token: string) {
    return this.projectFilesService.resolveShareToken(token);
  }
}

