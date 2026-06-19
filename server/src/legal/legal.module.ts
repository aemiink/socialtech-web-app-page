import { Module } from "@nestjs/common";
import { PublicLegalController } from "./public-legal.controller";

@Module({
  controllers: [PublicLegalController],
})
export class LegalModule {}
