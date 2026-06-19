import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SeoAuditService } from './seo-audit.service';

@UseGuards(JwtAuthGuard)
@Controller('clients/me/seo-audit')
export class ClientSeoAuditController {
  constructor(private readonly service: SeoAuditService) {}

  @Get('config')
  getConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.service.getOwnClientConfig(actor);
  }

  @Get('summary')
  getSummary(@CurrentUser() actor: AuthenticatedUser) {
    return this.service.getOwnClientSummary(actor);
  }
}
