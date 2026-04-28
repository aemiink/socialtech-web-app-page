import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminAssignmentsController } from "./admin-assignments.controller";
import { AdminAssignmentsService } from "./admin-assignments.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminAssignmentsController],
  providers: [AdminAssignmentsService],
})
export class AdminAssignmentsModule {}
