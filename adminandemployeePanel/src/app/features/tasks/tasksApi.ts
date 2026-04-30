import { baseApi } from "../../services/baseApi";
import type {
  CreateTaskRequest,
  CreateTaskTodoRequest,
  Task,
  TaskTodoMutationResponse,
  TasksListQuery,
  TasksListResponse,
  ToggleTaskTodoRequest,
  UpdateTaskRequest,
  UpdateTaskTodoRequest,
} from "./tasksTypes";
import { normalizeTaskResponse, normalizeTasksListResponse } from "./tasksUtils";

const TASKS_LIST_ID = "LIST";
const PROJECTS_LIST_ID = "LIST";
const TASK_TODOS_ID_PREFIX = "TASK";

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TasksListResponse, TasksListQuery | void>({
      query: (query) => ({
        url: "/tasks",
        method: "GET",
        params: serializeTasksListQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeTasksListResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "Tasks", id: TASKS_LIST_ID }];
        }

        return [
          { type: "Tasks", id: TASKS_LIST_ID },
          ...result.data.map((task) => ({ type: "Tasks" as const, id: task.id })),
        ];
      },
    }),
    getTask: builder.query<Task, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeTaskResponse(response),
      providesTags: (_result, _error, id) => [
        { type: "Tasks", id },
        { type: "TaskTodos", id: getTaskTodosTagId(id) },
      ],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "Tasks", id: TASKS_LIST_ID },
        { type: "Projects", id: PROJECTS_LIST_ID },
        { type: "Projects", id: body.projectId },
      ],
    }),
    updateTask: builder.mutation<Task, { id: string; body: UpdateTaskRequest }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _error, { id, body }) => [
        { type: "Tasks", id: TASKS_LIST_ID },
        { type: "Tasks", id },
        { type: "Projects", id: PROJECTS_LIST_ID },
        ...(result ? [{ type: "Projects" as const, id: result.projectId }] : []),
        ...(body.projectId ? [{ type: "Projects" as const, id: body.projectId }] : []),
      ],
    }),
    createTaskTodo: builder.mutation<
      TaskTodoMutationResponse,
      { taskId: string; body: CreateTaskTodoRequest }
    >({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/todos`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => getTaskTodoInvalidations(taskId),
    }),
    updateTaskTodo: builder.mutation<
      TaskTodoMutationResponse,
      { taskId: string; todoId: string; body: UpdateTaskTodoRequest }
    >({
      query: ({ taskId, todoId, body }) => ({
        url: `/tasks/${taskId}/todos/${todoId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => getTaskTodoInvalidations(taskId),
    }),
    toggleTaskTodo: builder.mutation<
      TaskTodoMutationResponse,
      { taskId: string; todoId: string; body: ToggleTaskTodoRequest }
    >({
      query: ({ taskId, todoId, body }) => ({
        url: `/tasks/${taskId}/todos/${todoId}/toggle`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => getTaskTodoInvalidations(taskId),
    }),
    deleteTaskTodo: builder.mutation<
      TaskTodoMutationResponse,
      { taskId: string; todoId: string }
    >({
      query: ({ taskId, todoId }) => ({
        url: `/tasks/${taskId}/todos/${todoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { taskId }) => getTaskTodoInvalidations(taskId),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useLazyGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCreateTaskTodoMutation,
  useUpdateTaskTodoMutation,
  useToggleTaskTodoMutation,
  useDeleteTaskTodoMutation,
} = tasksApi;

function getTaskTodosTagId(taskId: string): string {
  return `${TASK_TODOS_ID_PREFIX}:${taskId}`;
}

function getTaskTodoInvalidations(taskId: string) {
  return [
    { type: "Tasks" as const, id: TASKS_LIST_ID },
    { type: "Tasks" as const, id: taskId },
    { type: "TaskTodos" as const, id: getTaskTodosTagId(taskId) },
  ];
}

function serializeTasksListQuery(
  query: TasksListQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.projectId !== undefined && query.projectId.trim().length > 0) {
    params.projectId = query.projectId.trim();
  }

  if (query.clientProfileId !== undefined && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }

  if (query.assigneeUserId !== undefined && query.assigneeUserId.trim().length > 0) {
    params.assigneeUserId = query.assigneeUserId.trim();
  }

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.priority !== undefined) {
    params.priority = query.priority;
  }

  if (query.q !== undefined && query.q.trim().length > 0) {
    params.q = query.q.trim();
  }

  if (query.dueFrom !== undefined && query.dueFrom.trim().length > 0) {
    params.dueFrom = query.dueFrom.trim();
  }

  if (query.dueTo !== undefined && query.dueTo.trim().length > 0) {
    params.dueTo = query.dueTo.trim();
  }

  return params;
}
