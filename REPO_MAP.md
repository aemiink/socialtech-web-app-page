# Repository Map

## High-Level Structure

- `adminandemployeePanel/` - Vite + React SPA for the Admin Panel and role-based Employee Panel.
- `client/` - public/marketing Social Tech website. This is not the Client Portal; contact form submissions now create public CRM leads.
- `clientPanel/` - Client Portal Vite + React SPA for customer service visibility.
- `server/` - NestJS + TypeScript backend (single shared REST API with implemented auth core).
- `PROJECT_CONTEXT.md` - shared product, stack, architecture, and convention memory.
- `REPO_MAP.md` - shared file and module map.
- `DECISIONS.md` - dated architecture decisions.
- `ROAD_MAP.md` - shared implementation and planning status.
- `.claude/` and `.codex/` - local tool/agent configuration.

## Admin + Employee Panel

Location: `adminandemployeePanel/`

- Entry: `adminandemployeePanel/src/main.tsx`
- App root: `adminandemployeePanel/src/app/App.tsx`
- Router: `adminandemployeePanel/src/app/routes.tsx`
- Login page: `adminandemployeePanel/src/app/pages/Login.tsx`
- Auth bootstrap: `adminandemployeePanel/src/app/features/auth/AuthBootstrap.tsx`
- Redux store:
  - `adminandemployeePanel/src/app/store/store.ts`
  - `adminandemployeePanel/src/app/store/hooks.ts`
- RTK Query base API:
  - `adminandemployeePanel/src/app/services/baseApi.ts`
- Auth feature:
  - `adminandemployeePanel/src/app/features/auth/authApi.ts`
  - `adminandemployeePanel/src/app/features/auth/authSlice.ts`
  - `adminandemployeePanel/src/app/features/auth/authSelectors.ts`
  - `adminandemployeePanel/src/app/features/auth/authTypes.ts`
  - `adminandemployeePanel/src/app/features/auth/roleMapping.ts`
- Admin domain features (RTK Query inject endpoints):
  - `adminandemployeePanel/src/app/features/dashboard/dashboardApi.ts`
  - `adminandemployeePanel/src/app/features/dashboard/dashboardTypes.ts`
  - `adminandemployeePanel/src/app/features/dashboard/dashboardUtils.ts`
  - `adminandemployeePanel/src/app/features/adminAssignments/adminAssignmentsApi.ts`
  - `adminandemployeePanel/src/app/features/adminAssignments/adminAssignmentsTypes.ts`
  - `adminandemployeePanel/src/app/features/adminAssignments/adminAssignmentsUtils.ts`
  - `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
  - `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
  - `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
  - `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
  - `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
  - `adminandemployeePanel/src/app/features/projects/projectsUtils.ts`
  - `adminandemployeePanel/src/app/features/tasks/tasksApi.ts`
  - `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
  - `adminandemployeePanel/src/app/features/tasks/tasksUtils.ts`
  - `adminandemployeePanel/src/app/features/crm/crmApi.ts`
  - `adminandemployeePanel/src/app/features/crm/crmTypes.ts`
  - `adminandemployeePanel/src/app/features/crm/crmUtils.ts`
- Admin layout: `adminandemployeePanel/src/app/components/RootLayout.tsx`
- Employee layout: `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- Role context: `adminandemployeePanel/src/app/contexts/RoleContext.tsx` (compatibility layer; Redux auth state is source of truth)
- Admin pages: `adminandemployeePanel/src/app/pages/`
- Backend-integrated admin pages (core):
  - `adminandemployeePanel/src/app/pages/Dashboard.tsx`
  - `adminandemployeePanel/src/app/pages/EmployeeAssignments.tsx`
  - `adminandemployeePanel/src/app/pages/Clients.tsx`
  - `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
  - `adminandemployeePanel/src/app/pages/Projects.tsx`
  - `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
  - `adminandemployeePanel/src/app/pages/Tasks.tsx`
  - `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
  - `adminandemployeePanel/src/app/pages/CrmLeads.tsx`
  - `adminandemployeePanel/src/app/pages/CrmLeadDetail.tsx`
- Frontend tests (Vitest/RTL):
  - `adminandemployeePanel/src/app/pages/EmployeeDetail.test.tsx`
  - `adminandemployeePanel/src/app/pages/AuditLogs.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/EmployeeAssignments.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/Dashboard.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/Projects.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/ProjectDetail.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/Tasks.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/TaskDetail.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/CrmLeads.test.tsx`
  - `adminandemployeePanel/src/app/pages/__tests__/CrmLeadDetail.test.tsx`
- Employee pages: `adminandemployeePanel/src/app/employee/pages/`
- Employee CRM pages:
  - `adminandemployeePanel/src/app/employee/pages/CrmLeadlerim.tsx`
  - `adminandemployeePanel/src/app/employee/pages/CrmLeadDetail.tsx`
  - `adminandemployeePanel/src/app/employee/pages/BugunkuTakipler.tsx`
- Employee API-migrated page:
  - `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- Employee page tests:
  - `adminandemployeePanel/src/app/employee/pages/__tests__/Musterilerim.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/CrmLeadDetail.test.tsx`
  - `adminandemployeePanel/src/app/employee/__tests__/EmployeeLayout.crm.test.tsx`
- Employee dashboards: `adminandemployeePanel/src/app/employee/dashboards/`
- UI primitives: `adminandemployeePanel/src/app/components/ui/`
- Mock data: `adminandemployeePanel/src/app/data/mockData.ts`
- Styles: `adminandemployeePanel/src/styles/`
- Vite config: `adminandemployeePanel/vite.config.ts`
- Workflow config:
  - `adminandemployeePanel/package.json`
  - `adminandemployeePanel/package-lock.json`
  - `adminandemployeePanel/tsconfig.json`
  - npm scripts: `dev`, `build`, `typecheck`, `preview`, `check`
  - backend auth integration dependencies: `@reduxjs/toolkit`, `react-redux`, `redux@5`

## Client Portal

Location: `clientPanel/`

Purpose: customer-facing visibility panel for purchased Social Tech services, reports, approvals, meetings, billing, agency comments, and client actions.

### Config And Entry

- Package scripts: `clientPanel/package.json`
- Vite config: `clientPanel/vite.config.ts`
- Workflow config:
  - `clientPanel/package-lock.json`
  - `clientPanel/tsconfig.json`
  - npm scripts: `dev`, `build`, `typecheck`, `preview`, `check`
- HTML entry: `clientPanel/index.html`
- React entry: `clientPanel/src/main.tsx`
- App root: `clientPanel/src/app/App.tsx`
- Auth bootstrap: `clientPanel/src/app/features/auth/AuthBootstrap.tsx`
- Redux store:
  - `clientPanel/src/app/store/store.ts`
  - `clientPanel/src/app/store/hooks.ts`
- RTK Query base API:
  - `clientPanel/src/app/services/baseApi.ts`
- Auth feature:
  - `clientPanel/src/app/features/auth/authApi.ts`
  - `clientPanel/src/app/features/auth/authSlice.ts`
  - `clientPanel/src/app/features/auth/authSelectors.ts`
  - `clientPanel/src/app/features/auth/authTypes.ts`
  - `clientPanel/src/app/features/auth/authNormalizers.ts`
  - `clientPanel/src/app/features/auth/roleMapping.ts`
  - purchased-services aware auth parsing + service restore guards
- Client task visibility feature:
  - `clientPanel/src/app/features/tasks/tasksApi.ts`
  - `clientPanel/src/app/features/tasks/tasksTypes.ts`
  - `clientPanel/src/app/features/tasks/tasksUtils.ts`

### Navigation

- The Client Portal authenticates against backend auth endpoints; `clientPanel/src/app/components/client-login.tsx` is the login gate.
- Session restore is handled by `clientPanel/src/app/features/auth/AuthBootstrap.tsx` (`/auth/refresh` + `/auth/me`).
- The Client Portal keeps state-based navigation in `clientPanel/src/app/App.tsx`.
- `selectedService` controls whether the service selection screen or the selected service workspace is visible.
- `currentPage` controls shared pages, service dashboards, and service tab workspaces.
- There is no current React Router route file in `clientPanel/`.

### Core Components

- `clientPanel/src/app/components/sidebar.tsx` - service-specific navigation, shared bottom items, collapse state, service switching.
- `clientPanel/src/app/components/topbar.tsx` - selected service title, authenticated client identity, and backend logout.
- `clientPanel/src/app/components/client-login.tsx` - backend client login screen (`/auth/login`).
- `clientPanel/src/app/components/client-action-center.tsx` - floating action button, toast, action history drawer.
- `clientPanel/src/app/components/client-visible-tasks-section.tsx` - client-visible todo/progress kartları
- `clientPanel/src/app/components/button.tsx` - local portal button abstraction.
- `clientPanel/src/app/components/metric-card.tsx` - reusable metric display.
- `clientPanel/src/app/components/dashboard-widgets.tsx` - dashboard widgets.
- `clientPanel/src/app/components/automation-preview.tsx` - automation preview component.
- `clientPanel/src/app/components/ui/` - shadcn-style Radix UI primitives.

### Pages

- `clientPanel/src/app/pages/service-selection.tsx` - 13 active service cards and service entry point.
- `clientPanel/src/app/pages/service-tab-page.tsx` - generic workspace renderer for service-specific tabs.
- `clientPanel/src/app/pages/reports.tsx` - shared reports page.
- `clientPanel/src/app/pages/meetings.tsx` - shared meetings page.
- `clientPanel/src/app/pages/billing.tsx` - shared billing page.
- `clientPanel/src/app/pages/settings.tsx` - shared settings page.
- `clientPanel/src/app/pages/services/` - service dashboard pages:
  - `growth-hub-dashboard.tsx`
  - `social-media-dashboard.tsx`
  - `medya-hub-dashboard.tsx`
  - `meta-ads-dashboard.tsx`
  - `tiktok-ads-dashboard.tsx`
  - `google-ads-dashboard.tsx`
  - `amazon-ads-dashboard.tsx`
  - `web-app-dashboard.tsx`
  - `mobile-app-dashboard.tsx`
  - `landing-pages-dashboard.tsx`
  - `web-mobile-design-dashboard.tsx`
  - `technical-support-dashboard.tsx`
  - `seo-dashboard.tsx`

Additional portal pages exist under `clientPanel/src/app/pages/` and `clientPanel/src/app/pages/growth-hub/`; verify current imports before editing them because `App.tsx` is the active navigation source.

### Data And Local Behavior

- `clientPanel/src/app/data/service-pages.ts` - service labels, service profiles, KPIs, tab content, tables, timelines, agency comments, and client action prompts.
- `clientPanel/src/app/lib/client-actions.ts` - browser `localStorage` action history, action type inference, action event dispatch, and local text-file download behavior.
- `clientPanel/src/app/App.tsx` keeps service-selection/page state behavior; auth state is Redux-managed.
- `selectedService` restore purchased-service yetkisine göre doğrulanır; yetkisiz seçim otomatik temizlenir.
- Client Portal auth flow is backend-integrated; service/domain data is still partially mock/static.

## Backend API

Location: `server/`

Purpose: shared NestJS REST API that serves as the common backend for Admin Panel, Employee Panel, and Client Portal.

### Config And Runtime

- `server/package.json` - npm scripts (`dev`, `start`, `build`, `typecheck`, `typecheck:spec`, `check`, `prisma:*`, `test:e2e*`) and `packageManager: npm@11.8.0`
- `server/.env.example` - backend env variable template
- `server/nest-cli.json`
- `server/tsconfig.json`
- `server/tsconfig.build.json` (`incremental: false` to avoid dist output omissions)
- `server/tsconfig.spec.json` - TypeScript config for e2e/spec compilation

### App Bootstrap

- `server/src/main.ts` - Nest bootstrap, `/api/v1` global prefix, global ValidationPipe, global exception filter, CORS setup
- `server/src/app.module.ts` - root module imports for config/database/health/auth/users/clients/admin-summary/admin-assignments/admin-clients/admin-users/admin-audit-logs/projects/tasks
- `server/src/config/env.validation.ts` - Joi env validation schema, including `CLIENT_ORIGIN_PUBLIC`
- `server/src/config/cors.config.ts` - env-based CORS whitelist, including public site origin support
- `server/src/common/filters/global-exception.filter.ts` - centralized error response format

### Database Foundation

- `server/prisma/schema.prisma` - Prisma schema foundation:
  - Core models: `User`, `RefreshToken`, `ClientProfile`, `AuditLog`, `EmployeeClientAssignment`
  - Delivery models: `Project`, `Task`, `TaskTodo`
  - Client service model: `ClientPurchasedService`
  - CRM models: `CrmLead`, `CrmLeadActivity`
  - Hybrid RBAC models: `Permission`, `RolePermission`
  - Assignment scope enum: `EmployeeClientAssignmentScope`
  - Delivery enums: `ProjectStatus`, `TaskStatus`, `Priority`
  - Additional enums: `PurchasedServiceKey`, `PurchasedServiceStatus`, `TaskTodoVisibility`
  - CRM enums: `CrmLeadStatus`, `CrmLeadSource`, `CrmLeadActivityType`
  - `User.role` enum remains the primary fixed role field
  - `User.sessionInvalidatedAt` is used for access-token invalidation lifecycle
  - `ClientProfile.slug` is unique
  - `ClientProfile.status` enum (`ACTIVE | INACTIVE | SUSPENDED`) and indexed
  - `Project` slug uniqueness is client-scoped (`@@unique([clientProfileId, slug])`)
  - Assignment constraints and indexes:
    - `@@unique([employeeUserId, clientProfileId, scope])`
    - `@@index([employeeUserId, isActive])`
    - `@@index([clientProfileId, isActive])`
    - `@@index([scope, isActive])`
  - Project/task indexes:
    - `Project`: `clientProfileId`, `status`, `priority`
    - `Task`: `projectId`, `assigneeUserId`, `status`, `priority`
    - `TaskTodo`: `(taskId, sortOrder)`
- `server/src/database/prisma.service.ts` - Prisma client lifecycle management
- `server/src/database/database.module.ts` - global database module
- `server/prisma/migrations/20260428211614_add_session_invalidated_at/migration.sql` - adds `User.sessionInvalidatedAt` column
- `server/prisma/migrations/20260430000000_add_client_profile_status/migration.sql` - adds `ClientProfile.status` and `ClientProfile_status_idx`
- `server/prisma/migrations/20260501000000_add_purchased_services_and_task_todos/migration.sql` - adds purchased-services, project serviceKey, and task-todo checklist schema
- `server/prisma/migrations/20260502000000_add_crm_leads/migration.sql` - adds `CRM_SPECIALIST`, CRM lead/activity enums, lead tables, relations, and indexes
- `server/prisma/seed.ts` - demo seed foundation:
  - seeds admin + 7 employee roles + 1 client owner
  - seeds permission catalog and role-permission mappings
  - seeds client profiles: `acme-e-ticaret`, `nova-performance`, `mavi-sosyal`
  - links `client@socialtech.com` to `acme-e-ticaret`
  - seeds active employee-client assignments for `project@socialtech.com`, `performance@socialtech.com`, `social@socialtech.com`
  - seeds projects:
    - `acme-e-ticaret/growth-hub-launch`
    - `nova-performance/paid-acquisition-optimization`
    - `mavi-sosyal/social-calendar-refresh`
  - seeds 7 project tasks with idempotent assignee resolution via email/natural keys
  - uses `bcryptjs` hashes for demo passwords
- `server/tsconfig.seed.json` - TypeScript check config for seed files

### Auth And Core Modules

- `server/src/health/` - health service/controller/module (`GET /api/v1/health`)
- `server/src/auth/` - implemented auth flow and authorization scaffolding:
  - `auth.controller.ts` - `/api/v1/auth/login|refresh|logout|me`
  - `auth.service.ts` - login/refresh/logout/me logic, refresh rotation, revoke handling, and session invalidation checks (`siv` + fallback `iat`)
  - `auth.module.ts` - exports `JwtModule` + auth providers for downstream guard injection
  - `authorization.service.ts` - role -> permission resolution
  - `dto/` - `LoginDto`, `RefreshTokenDto`, `LogoutDto`
  - `guards/` - `JwtAuthGuard`, `PermissionsGuard` (`JwtAuthGuard` enforces DB session version checks)
  - `decorators/` - `CurrentUser`, `RequirePermissions`
  - `types/` - auth response, token payload (`siv` support), authenticated user types
- `server/src/audit-log/` - centralized audit write module:
  - `audit-log.module.ts` - exports shared audit service
  - `audit-log.service.ts` - transactional audit write helper + recursive metadata sanitization before persistence
- `server/src/users/` - protected users foundation:
  - `users.controller.ts` - `GET /api/v1/users/me`, `GET /api/v1/users`, `GET /api/v1/users/:id`
  - `users.service.ts` - admin/full-scope checks + own-record object authorization for non-admin access
  - `users.module.ts` - imports `AuthModule` for guard wiring
- `server/src/clients/` - protected clients foundation:
  - `clients.controller.ts` - `GET /api/v1/clients`, `GET /api/v1/clients/:id`, `GET /api/v1/clients/me`
  - `clients.service.ts` - admin/client scope checks + assignment-based employee scope (`clients.read.assigned`) + object-level ownership/assignment checks + server-side pagination/filter/sorting (`data + meta` envelope)
  - `dto/client-query.dto.ts` - list query validation (`page`, `limit`, `sortBy`, `sortOrder`, `status`, `search`)
  - `clients.module.ts` - imports `AuthModule` for guard wiring
- `server/src/admin-summary/` - admin dashboard summary module:
  - `admin-summary.controller.ts` - `GET /api/v1/admin/summary`
  - `admin-summary.service.ts` - count-based KPI aggregation (`users`, `clients`, `projects`, `tasks`, `auditLogs`) with admin-only service checks
  - `admin-summary.module.ts` - module wiring
- `server/src/admin-assignments/` - admin assignment management module:
  - `admin-assignments.controller.ts` - `GET /api/v1/admin/assignments`, `POST /api/v1/admin/assignments`, `PATCH /api/v1/admin/assignments/:id`, `PATCH /api/v1/admin/assignments/:id/deactivate`, `PATCH /api/v1/admin/assignments/:id/activate`
  - `admin-assignments.service.ts` - admin-only service authorization, assignment query filters, duplicate-safe create/reactivate flow, and sanitized assignment responses
  - `dto/create-assignment.dto.ts` - create payload validation
  - `dto/update-assignment.dto.ts` - update payload validation
  - `dto/assignment-query.dto.ts` - list query filter validation (`employeeUserId`, `clientProfileId`, `isActive`, `scope`)
  - `admin-assignments.module.ts` - module wiring
- `server/src/admin-audit-logs/` - admin audit read module:
  - `admin-audit-logs.controller.ts` - `GET /api/v1/admin/audit-logs`, `GET /api/v1/admin/audit-logs/:id`
  - `admin-audit-logs.service.ts` - admin-only audit log reads with pagination/sorting/filtering and read-time metadata sanitization
  - `dto/audit-log-query.dto.ts` - query validation (`page`, `limit`, `sortBy`, `sortOrder`, `action`, `actorUserId`, `targetUserId`, `targetClientProfileId`, `entityType`, `entityId`, `dateFrom`, `dateTo`, `search`)
  - `admin-audit-logs.module.ts` - module wiring
- `server/src/admin-users/` - admin employee-user management module:
  - `admin-users.controller.ts` - `POST /api/v1/admin/users`, `GET /api/v1/admin/users`, `GET /api/v1/admin/users/:id`, `PATCH /api/v1/admin/users/:id`, `PATCH /api/v1/admin/users/:id/deactivate`, `PATCH /api/v1/admin/users/:id/activate`, `PATCH /api/v1/admin/users/:id/reset-password`
  - `admin-users.service.ts` - admin-only employee lifecycle management (create/list/detail/update/deactivate/activate/reset-password), self-protection guards, refresh-token revocation on deactivate/reset-password, paginated/sorted list responses (`data` + `meta`), and transactional admin action audit writes
  - `dto/admin-user-query.dto.ts` - list query validation (`accountType`, `role`, `isActive`, `search`) + pagination (`page`, `limit`) + sorting (`sortBy`, `sortOrder`)
  - `dto/update-admin-user.dto.ts` - update payload validation (`displayName`, `role`, `isActive`)
  - `dto/reset-admin-user-password.dto.ts` - reset-password payload validation
  - `admin-users.module.ts` - module wiring
- `server/src/crm/` - CRM lead management module:
  - `crm.module.ts` - module wiring
  - `admin-crm-leads.controller.ts` - admin CRM lead list/create/detail/update/activity/convert routes
  - `employee-crm-leads.controller.ts` - assigned CRM lead list/detail/update/activity routes
  - `public-crm-leads.controller.ts` - public website lead intake route (`POST /api/v1/public/crm/leads`)
  - `crm-leads.service.ts` - RBAC/object authorization, owner validation, public website intake, activity timeline, conversion to `ClientProfile`, and audit writes
  - `dto/admin-crm-lead-query.dto.ts`
  - `dto/create-crm-lead.dto.ts`
  - `dto/create-public-crm-lead.dto.ts`
  - `dto/update-crm-lead.dto.ts`
  - `dto/create-crm-lead-activity.dto.ts`
  - `dto/update-assigned-crm-lead.dto.ts`
  - `dto/convert-crm-lead.dto.ts`
- `server/src/crm-lead-scan/` - admin-only CRM lead scan module:
  - `admin-crm-lead-scan.controller.ts` - `POST /api/v1/admin/crm/lead-scan/run`, `GET /api/v1/admin/crm/lead-scan/logs`, `GET /api/v1/admin/crm/lead-scan/logs/:id`
  - `crm-lead-scan.service.ts` - SerpAPI query execution, DB-tracked quota checks, duplicate filtering, website analysis, AI scoring, lead creation, and scan log persistence
  - `query-generator.service.ts` - bounded city/sector query generation
  - `serpapi.service.ts` - SerpAPI Google Maps fetch/normalization
  - `website-analyzer.service.ts` - website fetch, contact extraction, CTA/booking/e-commerce signal checks
  - `lead-scoring.service.ts` - Turkish outreach scoring, Gemini-backed with heuristic fallback
  - `dto/run-crm-lead-scan.dto.ts` - lead scan request validation (`queryLimit`, `cities`, `sectors`)
- `server/src/projects/` - projects API foundation:
  - `projects.controller.ts` - `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PATCH /api/v1/projects/:id`
  - `projects.service.ts` - admin full write scope, employee assignment-scope read, client own-scope read, object-level visibility checks, client purchased-service validation for `serviceKey`
  - `dto/create-project.dto.ts`, `dto/update-project.dto.ts`, `dto/project-query.dto.ts` - payload/query validation
  - `projects.module.ts` - module wiring
- `server/src/tasks/` - tasks API foundation:
  - `tasks.controller.ts` - `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`, todo CRUD/toggle endpoints
  - `tasks.service.ts` - admin full write scope, employee assignment-scope read + own-assigned status-only update, client own-scope read, todo visibility filtering (`CLIENT_VISIBLE`)
  - `dto/create-task.dto.ts`, `dto/update-task.dto.ts`, `dto/task-query.dto.ts`
  - `dto/create-task-todo.dto.ts`, `dto/update-task-todo.dto.ts`, `dto/toggle-task-todo.dto.ts`
  - `tasks.module.ts` - module wiring
- `users/clients/admin-assignments/admin-users/admin-audit-logs/projects/tasks` are now protected foundations; broader domain CRUD remains planned.

### Seed And Prisma Commands

From `server/package.json`:
- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:deploy`
- `npm run prisma:seed`
- `npm run prisma:studio`

### E2E Test Foundation

- `server/test/run-e2e.cjs` - unified e2e runner:
  - resolves `DATABASE_URL`
  - enforces strict test DB naming in DB name (`_test`, `test_`, `testing`) with delimiter-aware matching
  - rejects non-test DB names even when `ALLOW_E2E_DB_RESET=true`
  - runs Prisma prepare (`generate`, `migrate deploy` or guarded `migrate reset`, `db seed`)
  - runs Jest e2e suite
- `server/test/jest-e2e.config.cjs` - Jest configuration for e2e files
- `server/test/jest.env.ts` - test env defaults for JWT and auth runtime
- `server/test/authz.e2e-spec.ts` - users/clients/admin-summary/admin-assignment authorization matrix, clients pagination/filter/sort coverage, and assignment negative cases
- `server/test/projects-tasks-authz.e2e-spec.ts` - projects/tasks authorization matrix + assignment deactivation regression coverage
- `server/test/admin-users-password-authz.e2e-spec.ts` - admin employee create + own password change authz matrix
- `server/test/admin-users-management-authz.e2e-spec.ts` - admin users management authz matrix (list/detail/update/deactivate/activate/reset-password + role restrictions + list pagination/sorting/validation + audit write assertions)
- `server/test/admin-audit-logs-authz.e2e-spec.ts` - admin audit logs read authz matrix (list/detail authorization + pagination/sorting/filter/date/search + metadata sensitivity checks)
- `server/test/access-token-invalidation-authz.e2e-spec.ts` - access-token invalidation matrix (password change/reset, deactivate/activate, role/displayName update behavior)
- `server/test/crm-authz.e2e-spec.ts` - CRM admin/employee/public authz matrix, assigned-only safe `404`, activity/status limits, conversion, duplicate convert, public website lead intake, validation, and converted-lead employee lock
- `server/package.json` test scripts:
  - `npm run test:e2e:prepare`
  - `npm run test:e2e`
  - `npm run test:e2e:authz`
- latest DB-connected authz pattern run: `8/8 suites`, `187/187` tests passed

### Styles

- `clientPanel/src/styles/index.css`
- `clientPanel/src/styles/fonts.css`
- `clientPanel/src/styles/tailwind.css`
- `clientPanel/src/styles/theme.css`
- `clientPanel/default_shadcn_theme.css`

### Imported Reference Text

- `clientPanel/src/imports/pasted_text/client-panel-pages.md`
- `clientPanel/src/imports/pasted_text/service-sidebars.md`
- `clientPanel/src/imports/pasted_text/social-media-management-dashbo.md`

## Public Site

Location: `client/`

The `client/` directory is the public/marketing Social Tech website, not the Client Portal.

- `client/src/app/components/contact/sections/FormSection.tsx` - public contact form; submits validated, consent-gated lead payloads to `POST /api/v1/public/crm/leads`

## Start Here For Client Portal Work

- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/components/client-login.tsx`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/lib/client-actions.ts`

## Do Not Touch Without Reason

- `adminandemployeePanel/vite.config.ts` and `clientPanel/vite.config.ts` - both include Figma asset resolver behavior.
- `adminandemployeePanel/src/app/routes.tsx` - Admin and Employee Panel route definitions.
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx` - role compatibility layer; Redux auth state is authoritative.
- `clientPanel/src/app/App.tsx` - Client Portal navigation state lives here until a router is introduced.
- `clientPanel/src/app/data/service-pages.ts` - dense mock service content used across portal tabs.
## Update - 2026-04-29 (Client Summary + ClientDetail)

### Backend
- `server/src/clients/clients.controller.ts`
  - includes `GET /api/v1/clients/:id/summary` route.
- `server/src/clients/clients.service.ts`
  - implements client-level aggregated summary with scoped recent projects/tasks and permission-aware access checks.
- `server/test/authz.e2e-spec.ts`
  - expanded with client summary authz/object-scope/fail-closed coverage.

### Admin Panel Frontend (`adminandemployeePanel`)
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
  - adds summary query hook for `/clients/:id/summary`.
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
  - summary response and recent item typings.
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
  - summary normalization + status/priority/date mapping helpers.
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
  - switched to summary-driven overview UI.
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`
  - summary-based UI-state and security rendering tests.

## Update - 2026-04-30 (Admin Summary + Clients Query Hardening)

### Backend
- `server/src/admin-summary/admin-summary.module.ts`
- `server/src/admin-summary/admin-summary.controller.ts`
- `server/src/admin-summary/admin-summary.service.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`
- `server/test/authz.e2e-spec.ts`

### Admin Panel Frontend (`adminandemployeePanel`)
- `adminandemployeePanel/src/app/features/dashboard/dashboardApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardTypes.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardUtils.ts`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Dashboard.test.tsx`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
## 2026-04-29 Update Map

### Backend - Admin Clients
- `server/src/admin-clients/admin-clients.module.ts`
- `server/src/admin-clients/admin-clients.controller.ts`
- `server/src/admin-clients/admin-clients.service.ts`
- `server/src/admin-clients/dto/create-admin-client.dto.ts`
- `server/src/admin-clients/dto/update-admin-client.dto.ts`
- `server/src/admin-clients/dto/admin-client-owner.dto.ts`
- `server/test/admin-clients-authz.e2e-spec.ts`

### Frontend - Clients Feature
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/adminUsers/adminUsersTypes.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`

### Frontend - baseApi Integration Tests
- `adminandemployeePanel/src/app/services/__tests__/baseApi.clients.integration.test.tsx`
- `adminandemployeePanel/src/app/services/__tests__/baseApi.dashboard.integration.test.tsx`

### Frontend - UI Primitive Update
- `adminandemployeePanel/src/app/components/ui/dialog.tsx`

## 2026-04-30 Update Map (Employee Assignment UI Milestone)

### Backend
- `server/src/admin-assignments/admin-assignments.service.ts`
  - assignment create/activate için inactive employee ve inactive client engelleri
- `server/test/authz.e2e-spec.ts`
  - assignment negative-path authz/e2e senaryoları genişletildi

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/adminAssignments/adminAssignmentsApi.ts`
- `adminandemployeePanel/src/app/features/adminAssignments/adminAssignmentsTypes.ts`
- `adminandemployeePanel/src/app/features/adminAssignments/adminAssignmentsUtils.ts`
- `adminandemployeePanel/src/app/pages/EmployeeAssignments.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/EmployeeAssignments.test.tsx`
- `adminandemployeePanel/src/app/routes.tsx` (`/calisanlar/atamalar`)
- `adminandemployeePanel/src/app/components/RootLayout.tsx` (Atamalar menü girdisi)
- `adminandemployeePanel/src/app/pages/Employees.tsx` (Atamaları Yönet CTA)
- `adminandemployeePanel/src/app/services/baseApi.ts` (`AdminAssignments` tag)
- `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx` (API migration)
- `adminandemployeePanel/src/app/employee/pages/__tests__/Musterilerim.test.tsx`

## 2026-05-01 Update Map (Employee Gorevlerim API Integration)

### Frontend - Employee Tasks
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
  - mock task kaynağı kaldırıldı, `useGetTasksQuery` ile backend `GET /tasks` entegrasyonu
  - `tasks.read.assigned` permission gate + query `skip` davranışı
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`
  - loading/error/empty/success/unauthorized/query param coverage

## 2026-05-01 Update Map (Purchased Services + Picker UX + Task Todos)

### Backend
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260501000000_add_purchased_services_and_task_todos/migration.sql`
- `server/prisma/seed.ts`
- `server/src/admin-clients/admin-clients.service.ts`
- `server/src/admin-clients/dto/create-admin-client.dto.ts`
- `server/src/admin-clients/dto/update-admin-client.dto.ts`
- `server/src/admin-clients/dto/admin-client-purchased-service.dto.ts`
- `server/src/clients/clients.service.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/types/auth-response.type.ts`
- `server/src/projects/dto/create-project.dto.ts`
- `server/src/projects/dto/update-project.dto.ts`
- `server/src/projects/projects.service.ts`
- `server/src/tasks/tasks.controller.ts`
- `server/src/tasks/tasks.service.ts`
- `server/src/tasks/dto/create-task-todo.dto.ts`
- `server/src/tasks/dto/update-task-todo.dto.ts`
- `server/src/tasks/dto/toggle-task-todo.dto.ts`
- `server/test/admin-clients-authz.e2e-spec.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/features/projects/projectsUtils.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksApi.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksUtils.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Projects.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Tasks.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/TaskDetail.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`

### Client Portal Frontend
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`
- `clientPanel/src/app/components/client-visible-tasks-section.tsx`
- `clientPanel/src/app/features/auth/authApi.ts`
- `clientPanel/src/app/features/auth/authTypes.ts`
- `clientPanel/src/app/features/auth/authNormalizers.ts`
- `clientPanel/src/app/features/tasks/tasksApi.ts`
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/__tests__/client-portal.test.tsx`
- `clientPanel/src/test/setup.ts`

## 2026-05-01 Update Map (Clients Quick Assignment + Employee Task Scope Alignment)

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/pages/Clients.tsx`
  - client satırından hızlı "Çalışan Ata" aksiyonu
  - müşteri bağlamında küçük assignment modal akışı
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
  - hızlı assignment açılışı, payload ve permission davranışı testleri
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
  - employee görev sorgusunda zorunlu `assigneeUserId` filtresi kaldırıldı
  - assignment scope görünürlüğü + ekip görevi badge ayrımı
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`
  - scope tabanlı listeleme ve scoped-team todo toggle testleri

### Backend
- `server/src/tasks/tasks.service.ts`
  - employee todo toggle yetkisi assignment scope davranışıyla hizalandı
- `server/test/projects-tasks-authz.e2e-spec.ts`
  - scoped-other ve out-of-scope toggle ayrımıyla authz matris güncellemesi
