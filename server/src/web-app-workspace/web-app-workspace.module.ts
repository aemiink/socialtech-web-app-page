import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebAppWorkspaceController } from "./web-app-workspace.controller";
import { WebAppWorkspaceGateway } from "./web-app-workspace.gateway";
import { WebAppWorkspaceService } from "./web-app-workspace.service";

@Module({
  imports: [AuthModule],
  controllers: [WebAppWorkspaceController],
  providers: [WebAppWorkspaceService, WebAppWorkspaceGateway],
  exports: [WebAppWorkspaceService],
})
export class WebAppWorkspaceModule {}
