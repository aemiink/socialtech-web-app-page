import { baseApi } from "../../services/baseApi";
import type {
  CreateTaskRequest,
  CreateTaskTodoRequest,
  CreateTaskWorkNoteRequest,
  PrepareTaskCodeRequest,
  Task,
  TaskGithubCommit,
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
const DELIVERY_SPRINTS_LIST_ID = "LIST";
const DELIVERY_SUMMARY_ID = "SUMMARY";

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
        { type: "DeliverySprints", id: DELIVERY_SPRINTS_LIST_ID },
        { type: "DeliverySummary", id: DELIVERY_SUMMARY_ID },
        ...(body.sprintId ? [{ type: "DeliverySprints" as const, id: body.sprintId }] : []),
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
        { type: "DeliverySprints", id: DELIVERY_SPRINTS_LIST_ID },
        { type: "DeliverySummary", id: DELIVERY_SUMMARY_ID },
        ...(result ? [{ type: "Projects" as const, id: result.projectId }] : []),
        ...(body.projectId ? [{ type: "Projects" as const, id: body.projectId }] : []),
        ...getDeliverySprintTagsFromTaskResponse(result),
        ...(body.sprintId ? [{ type: "DeliverySprints" as const, id: body.sprintId }] : []),
      ],
    }),
    getTaskWorkNotes: builder.query<Task["workNotes"], string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}/work-notes`,
        method: "GET",
      }),
    }),
    createTaskWorkNote: builder.mutation<Task, { taskId: string; body: CreateTaskWorkNoteRequest }>({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/work-notes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTaskResponse(response),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: TASKS_LIST_ID },
      ],
    }),
    prepareTaskCode: builder.mutation<Task, { taskId: string; body: PrepareTaskCodeRequest }>({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/code-preparation`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTaskResponse(response),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: TASKS_LIST_ID },
      ],
    }),
    getRelatedTaskCommits: builder.query<TaskGithubCommit[], { taskId: string }>({
      query: ({ taskId }) => ({
        url: `/tasks/${taskId}/related-commits`,
        method: "GET",
      }),
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
      invalidatesTags: (result, _error, { taskId }) => getTaskTodoInvalidations(taskId, result),
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
      invalidatesTags: (result, _error, { taskId }) => getTaskTodoInvalidations(taskId, result),
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
      invalidatesTags: (result, _error, { taskId }) => getTaskTodoInvalidations(taskId, result),
    }),
    deleteTaskTodo: builder.mutation<
      TaskTodoMutationResponse,
      { taskId: string; todoId: string }
    >({
      query: ({ taskId, todoId }) => ({
        url: `/tasks/${taskId}/todos/${todoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, _error, { taskId }) => getTaskTodoInvalidations(taskId, result),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useLazyGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskWorkNotesQuery,
  useCreateTaskWorkNoteMutation,
  usePrepareTaskCodeMutation,
  useGetRelatedTaskCommitsQuery,
  useCreateTaskTodoMutation,
  useUpdateTaskTodoMutation,
  useToggleTaskTodoMutation,
  useDeleteTaskTodoMutation,
} = tasksApi;

function getTaskTodosTagId(taskId: string): string {
  return `${TASK_TODOS_ID_PREFIX}:${taskId}`;
}

function getTaskTodoInvalidations(taskId: string, result?: TaskTodoMutationResponse) {
  return [
    { type: "Tasks" as const, id: TASKS_LIST_ID },
    { type: "Tasks" as const, id: taskId },
    { type: "TaskTodos" as const, id: getTaskTodosTagId(taskId) },
    { type: "DeliverySprints" as const, id: DELIVERY_SPRINTS_LIST_ID },
    { type: "DeliverySummary" as const, id: DELIVERY_SUMMARY_ID },
    ...getDeliverySprintTagsFromTaskResponse(result),
  ];
}

function getDeliverySprintTagsFromTaskResponse(result: unknown) {
  if (!isTaskLikeMutationResponse(result) || !result.sprintId) {
    return [];
  }

  return [{ type: "DeliverySprints" as const, id: result.sprintId }];
}

function isTaskLikeMutationResponse(
  value: unknown,
): value is Pick<Task, "projectId" | "sprintId" | "status" | "priority"> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Partial<Task>;
  return typeof record.projectId === "string" && typeof record.status === "string";
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

  if (query.sprintId !== undefined && query.sprintId.trim().length > 0) {
    params.sprintId = query.sprintId.trim();
  }

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.priority !== undefined) {
    params.priority = query.priority;
  }

  if (query.type !== undefined) {
    params.type = query.type;
  }

  if (query.workstream !== undefined) {
    params.workstream = query.workstream;
  }

  if (query.severity !== undefined) {
    params.severity = query.severity;
  }

  if (query.environment !== undefined) {
    params.environment = query.environment;
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
