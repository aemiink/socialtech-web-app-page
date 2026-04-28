import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminAssignmentsModule } from "./admin-assignments/admin-assignments.module";
import { AuthModule } from "./auth/auth.module";
import { ClientsModule } from "./clients/clients.module";
import { envValidationSchema } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
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
    AdminAssignmentsModule,
  ],
})
export class AppModule {}
