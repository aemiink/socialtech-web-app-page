import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateDeliveryReleaseDto } from "./dto/create-delivery-release.dto";
import { CreateDeliverySprintDto } from "./dto/create-delivery-sprint.dto";
import { DeliveryReleaseQueryDto } from "./dto/delivery-release-query.dto";
import { DeliverySprintQueryDto } from "./dto/delivery-sprint-query.dto";
import { UpdateDeliveryReleaseDto } from "./dto/update-delivery-release.dto";
import { UpdateDeliverySprintDto } from "./dto/update-delivery-sprint.dto";
import { DeliveryService } from "./delivery.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("delivery")
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get("sprints")
  @RequirePermissions("delivery.sprints.read.assigned")
  getSprints(@CurrentUser() currentUser: AuthenticatedUser, @Query() query: DeliverySprintQueryDto) {
    return this.deliveryService.getSprints(currentUser, query);
  }

  @Post("sprints")
  @RequirePermissions("delivery.sprints.manage.assigned")
  createSprint(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateDeliverySprintDto) {
    return this.deliveryService.createSprint(currentUser, dto);
  }

  @Get("sprints/:id")
  @RequirePermissions("delivery.sprints.read.assigned")
  getSprintById(@CurrentUser() currentUser: AuthenticatedUser, @Param("id", ParseUUIDPipe) sprintId: string) {
    return this.deliveryService.getSprintById(currentUser, sprintId);
  }

  @Patch("sprints/:id")
  @RequirePermissions("delivery.sprints.manage.assigned")
  updateSprint(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) sprintId: string,
    @Body() dto: UpdateDeliverySprintDto,
  ) {
    return this.deliveryService.updateSprint(currentUser, sprintId, dto);
  }

  @Get("releases")
  @RequirePermissions("delivery.releases.read.assigned")
  getReleases(@CurrentUser() currentUser: AuthenticatedUser, @Query() query: DeliveryReleaseQueryDto) {
    return this.deliveryService.getReleases(currentUser, query);
  }

  @Post("releases")
  @RequirePermissions("delivery.releases.manage.assigned")
  createRelease(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateDeliveryReleaseDto) {
    return this.deliveryService.createRelease(currentUser, dto);
  }

  @Get("releases/:id")
  @RequirePermissions("delivery.releases.read.assigned")
  getReleaseById(@CurrentUser() currentUser: AuthenticatedUser, @Param("id", ParseUUIDPipe) releaseId: string) {
    return this.deliveryService.getReleaseById(currentUser, releaseId);
  }

  @Patch("releases/:id")
  @RequirePermissions("delivery.releases.manage.assigned")
  updateRelease(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) releaseId: string,
    @Body() dto: UpdateDeliveryReleaseDto,
  ) {
    return this.deliveryService.updateRelease(currentUser, releaseId, dto);
  }

  @Get("summary")
  @RequirePermissions("delivery.summary.read.assigned")
  getSummary(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.deliveryService.getSummary(currentUser);
  }
}
