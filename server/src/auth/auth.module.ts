import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthorizationService } from "./authorization.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PermissionsGuard } from "./guards/permissions.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthorizationService, JwtAuthGuard, PermissionsGuard],
  exports: [AuthService, AuthorizationService, JwtAuthGuard, PermissionsGuard],
})
export class AuthModule {}
