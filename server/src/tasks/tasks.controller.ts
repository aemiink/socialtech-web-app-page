import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTaskTodoDto } from "./dto/create-task-todo.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { ToggleTaskTodoDto } from "./dto/toggle-task-todo.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskTodoDto } from "./dto/update-task-todo.dto";
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

  @Post(":id/todos")
  createTaskTodo(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) taskId: string,
    @Body() dto: CreateTaskTodoDto,
  ) {
    return this.tasksService.createTaskTodo(currentUser, taskId, dto);
  }

  @Patch(":id")
  updateTask(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(currentUser, taskId, dto);
  }

  @Patch(":taskId/todos/:todoId")
  updateTaskTodo(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("todoId", ParseUUIDPipe) todoId: string,
    @Body() dto: UpdateTaskTodoDto,
  ) {
    return this.tasksService.updateTaskTodo(currentUser, taskId, todoId, dto);
  }

  @Patch(":taskId/todos/:todoId/toggle")
  toggleTaskTodo(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("todoId", ParseUUIDPipe) todoId: string,
    @Body() dto: ToggleTaskTodoDto,
  ) {
    return this.tasksService.toggleTaskTodo(currentUser, taskId, todoId, dto);
  }

  @Delete(":taskId/todos/:todoId")
  deleteTaskTodo(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("todoId", ParseUUIDPipe) todoId: string,
  ) {
    return this.tasksService.deleteTaskTodo(currentUser, taskId, todoId);
  }
}
