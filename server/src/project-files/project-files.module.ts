import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CloudinaryModule } from "../integrations/cloudinary/cloudinary.module";
import { ProjectFileSharesController } from "./project-file-shares.controller";
import { ProjectFilesController } from "./project-files.controller";
import { ProjectFilesService } from "./project-files.service";

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [ProjectFilesController, ProjectFileSharesController],
  providers: [ProjectFilesService],
})
export class ProjectFilesModule {}

