import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminAssignmentsModule } from "./admin-assignments/admin-assignments.module";
import { AdminAuditLogsModule } from "./admin-audit-logs/admin-audit-logs.module";
import { AdminClientsModule } from "./admin-clients/admin-clients.module";
import { AdminSummaryModule } from "./admin-summary/admin-summary.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AuthModule } from "./auth/auth.module";
import { ClientsModule } from "./clients/clients.module";
import { envValidationSchema } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    AdminSummaryModule,
    AdminAssignmentsModule,
    AdminAuditLogsModule,
    AdminClientsModule,
    AdminUsersModule,
    ProjectsModule,
    TasksModule,
  ],
})
export class AppModule {}
