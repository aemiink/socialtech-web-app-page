import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AdminAssignmentsModule } from "./admin-assignments/admin-assignments.module";
import { AdminAuditLogsModule } from "./admin-audit-logs/admin-audit-logs.module";
import { AdminClientsModule } from "./admin-clients/admin-clients.module";
import { AdminSummaryModule } from "./admin-summary/admin-summary.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AmazonAdsModule } from "./amazon-ads/amazon-ads.module";
import { AuthModule } from "./auth/auth.module";
import { ClientsModule } from "./clients/clients.module";
import { envValidationSchema } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { DeliveryModule } from "./delivery/delivery.module";
import { CrmModule } from "./crm/crm.module";
import { GrowthHubModule } from "./growth-hub/growth-hub.module";
import { HealthModule } from "./health/health.module";
import { GithubModule } from "./integrations/github/github.module";
import { LegalModule } from "./legal/legal.module";
import { MetaAdsModule } from "./meta-ads/meta-ads.module";
import { TikTokAdsModule } from "./tiktok-ads/tiktok-ads.module";
import { ProjectFilesModule } from "./project-files/project-files.module";
import { ProjectsModule } from "./projects/projects.module";
import { SocialMediaModule } from "./social-media/social-media.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";
import { WebAppWorkspaceModule } from "./web-app-workspace/web-app-workspace.module";
import { WebMobileDesignModule } from "./web-mobile-design/web-mobile-design.module";

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
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    LegalModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    CrmModule,
    GithubModule,
    MetaAdsModule,
    TikTokAdsModule,
    AmazonAdsModule,
    GrowthHubModule,
    SocialMediaModule,
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
    WebMobileDesignModule,
  ],
})
export class AppModule {}
