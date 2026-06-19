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
import { TechnicalSupportService } from './technical-support.service';
import { UpdateTechnicalSupportConfigDto } from './dto/update-technical-support-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/clients/:clientId/technical-support')
export class AdminTechnicalSupportController {
  constructor(private readonly service: TechnicalSupportService) {}

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
    @Body() dto: UpdateTechnicalSupportConfigDto,
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
