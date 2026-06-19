import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SeoAuditService } from './seo-audit.service';
import { UpdateSeoAuditConfigDto } from './dto/update-seo-audit-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/clients/:clientId/seo-audit')
export class AdminSeoAuditController {
  constructor(private readonly service: SeoAuditService) {}

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
    @Body() dto: UpdateSeoAuditConfigDto,
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
