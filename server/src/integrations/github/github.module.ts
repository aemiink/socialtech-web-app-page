import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { GithubController } from "./github.controller";
import { GithubService } from "./github.service";
import { GithubClientService } from "./github-client.service";
import { GithubTokenService } from "./github-token.service";

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [GithubController],
  providers: [GithubService, GithubClientService, GithubTokenService],
  exports: [GithubService],
})
export class GithubModule {}
