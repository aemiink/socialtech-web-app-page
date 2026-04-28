import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getTasks(currentUser, query);
  }

  @Get(":id")
  getTaskById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.getTaskById(currentUser, taskId);
  }

  @Post()
  @RequirePermissions("tasks.manage.any")
  createTask(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(currentUser, dto);
  }

  @Patch(":id")
  updateTask(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(currentUser, taskId, dto);
  }
}
