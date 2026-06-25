import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebAppWorkspaceController } from "./web-app-workspace.controller";
import { WebAppWorkspaceGateway } from "./web-app-workspace.gateway";
import { WebAppWorkspaceInboxController } from "./web-app-workspace-inbox.controller";
import { WebAppWorkspaceService } from "./web-app-workspace.service";

@Module({
  imports: [AuthModule],
  controllers: [WebAppWorkspaceController, WebAppWorkspaceInboxController],
  providers: [WebAppWorkspaceService, WebAppWorkspaceGateway],
  exports: [WebAppWorkspaceService],
})
export class WebAppWorkspaceModule {}
