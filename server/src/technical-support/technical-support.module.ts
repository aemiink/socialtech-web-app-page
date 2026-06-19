import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminTechnicalSupportController } from './admin-technical-support.controller';
import { EmployeeTechnicalSupportController } from './employee-technical-support.controller';
import { ClientTechnicalSupportController } from './client-technical-support.controller';
import { TechnicalSupportService } from './technical-support.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    AdminTechnicalSupportController,
    EmployeeTechnicalSupportController,
    ClientTechnicalSupportController,
  ],
  providers: [TechnicalSupportService],
})
export class TechnicalSupportModule {}
