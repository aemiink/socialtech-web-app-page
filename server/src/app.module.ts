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
import { DeliveryModule } from "./delivery/delivery.module";
import { CrmModule } from "./crm/crm.module";
import { HealthModule } from "./health/health.module";
import { GithubModule } from "./integrations/github/github.module";
import { ProjectFilesModule } from "./project-files/project-files.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";
import { WebAppWorkspaceModule } from "./web-app-workspace/web-app-workspace.module";

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
    CrmModule,
    GithubModule,
    ProjectFilesModule,
    DeliveryModule,
    AdminSummaryModule,
    AdminAssignmentsModule,
    AdminAuditLogsModule,
    AdminClientsModule,
    AdminUsersModule,
    ProjectsModule,
    TasksModule,
    WebAppWorkspaceModule,
  ],
})
export class AppModule {}
