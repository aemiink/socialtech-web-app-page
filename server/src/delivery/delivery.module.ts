import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";
import { GithubModule } from "../integrations/github/github.module";

@Module({
  imports: [AuthModule, GithubModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
