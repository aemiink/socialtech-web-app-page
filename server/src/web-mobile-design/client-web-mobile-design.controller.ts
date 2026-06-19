import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WebMobileDesignService } from './web-mobile-design.service';

@UseGuards(JwtAuthGuard)
@Controller('clients/me/web-mobile-design')
export class ClientWebMobileDesignController {
  constructor(private readonly service: WebMobileDesignService) {}

  @Get('config')
  getConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.service.getOwnClientConfig(actor);
  }

  @Get('summary')
  getSummary(@CurrentUser() actor: AuthenticatedUser) {
    return this.service.getOwnClientSummary(actor);
  }
}
