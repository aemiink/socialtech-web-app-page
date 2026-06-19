import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WebMobileDesignService } from './web-mobile-design.service';
import { UpdateWebMobileDesignConfigDto } from './dto/update-web-mobile-design-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/clients/:clientId/web-mobile-design')
export class AdminWebMobileDesignController {
  constructor(private readonly service: WebMobileDesignService) {}

  @Get('config')
  getConfig(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.getAdminConfig(clientId, actor);
  }

  @Patch('config')
  updateConfig(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateWebMobileDesignConfigDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.updateAdminConfig(clientId, dto, actor);
  }

  @Get('summary')
  getSummary(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.getAdminSummary(clientId, actor);
  }
}
