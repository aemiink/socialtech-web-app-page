import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GithubModule } from "../integrations/github/github.module";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [AuthModule, GithubModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
