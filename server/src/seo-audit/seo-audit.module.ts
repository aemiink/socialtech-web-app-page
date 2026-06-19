import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminSeoAuditController } from './admin-seo-audit.controller';
import { EmployeeSeoAuditController } from './employee-seo-audit.controller';
import { ClientSeoAuditController } from './client-seo-audit.controller';
import { SeoAuditService } from './seo-audit.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    AdminSeoAuditController,
    EmployeeSeoAuditController,
    ClientSeoAuditController,
  ],
  providers: [SeoAuditService],
})
export class SeoAuditModule {}
