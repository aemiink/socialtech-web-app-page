import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WebMobileDesignService } from './web-mobile-design.service';

@UseGuards(JwtAuthGuard)
@Controller('web-mobile-design/clients/:clientId')
export class EmployeeWebMobileDesignController {
  constructor(private readonly service: WebMobileDesignService) {}

  @Get('config')
  getConfig(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.getAssignedConfig(clientId, actor);
  }

  @Get('summary')
  getSummary(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.getAssignedSummary(clientId, actor);
  }
}
