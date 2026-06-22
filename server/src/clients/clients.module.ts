import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebAppWorkspaceModule } from "../web-app-workspace/web-app-workspace.module";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";

@Module({
  imports: [AuthModule, WebAppWorkspaceModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
