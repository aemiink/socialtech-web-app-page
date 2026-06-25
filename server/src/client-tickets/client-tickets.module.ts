import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ClientOwnTicketsController, WorkforceTicketsController } from "./client-tickets.controller";
import { ClientTicketsService } from "./client-tickets.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ClientOwnTicketsController, WorkforceTicketsController],
  providers: [ClientTicketsService],
})
export class ClientTicketsModule {}
