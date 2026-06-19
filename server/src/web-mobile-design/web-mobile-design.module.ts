import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminWebMobileDesignController } from './admin-web-mobile-design.controller';
import { EmployeeWebMobileDesignController } from './employee-web-mobile-design.controller';
import { ClientWebMobileDesignController } from './client-web-mobile-design.controller';
import { WebMobileDesignService } from './web-mobile-design.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    AdminWebMobileDesignController,
    EmployeeWebMobileDesignController,
    ClientWebMobileDesignController,
  ],
  providers: [WebMobileDesignService],
})
export class WebMobileDesignModule {}
