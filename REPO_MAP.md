# Repository Map

## High-Level Structure

- `adminandemployeePanel/` - Vite + React SPA for the Admin Panel and role-based Employee Panel.
- `client/` - public/marketing Social Tech website. This is not the Client Portal.
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
- Admin layout: `adminandemployeePanel/src/app/components/RootLayout.tsx`
- Employee layout: `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- Role context: `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
- Admin pages: `adminandemployeePanel/src/app/pages/`
- Employee pages: `adminandemployeePanel/src/app/employee/pages/`
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

### Navigation

- The Client Portal shows `clientPanel/src/app/components/client-login.tsx` before the portal workspace when demo auth is missing.
- The Client Portal currently uses local React state in `clientPanel/src/app/App.tsx`.
- `selectedService` controls whether the service selection screen or the selected service workspace is visible.
- `currentPage` controls shared pages, service dashboards, and service tab workspaces.
- There is no current React Router route file in `clientPanel/`.

### Core Components

- `clientPanel/src/app/components/sidebar.tsx` - service-specific navigation, shared bottom items, collapse state, service switching.
- `clientPanel/src/app/components/topbar.tsx` - selected service title, demo client identity, and logout.
- `clientPanel/src/app/components/client-login.tsx` - frontend demo client login screen.
- `clientPanel/src/app/components/client-action-center.tsx` - floating action button, toast, action history drawer.
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
- `clientPanel/src/app/App.tsx` stores demo client auth in browser `localStorage` and resets selected service/page on logout.
- Client Portal data flow is still mock/static in frontend. Backend API foundation exists in `server/` but frontend integration has not started yet.

## Backend API

Location: `server/`

Purpose: shared NestJS REST API that serves as the common backend for Admin Panel, Employee Panel, and Client Portal.

### Config And Runtime

- `server/package.json` - npm scripts (`dev`, `start`, `build`, `typecheck`, `typecheck:spec`, `check`, `prisma:*`, `test:e2e*`) and `packageManager: npm@11.8.0`
- `server/.env.example` - backend env variable template
- `server/nest-cli.json`
- `server/tsconfig.json`
- `server/tsconfig.build.json`
- `server/tsconfig.spec.json` - TypeScript config for e2e/spec compilation

### App Bootstrap

- `server/src/main.ts` - Nest bootstrap, `/api/v1` global prefix, global ValidationPipe, global exception filter, CORS setup
- `server/src/app.module.ts` - root module imports for config/database/health/auth/users/clients/admin-assignments/projects/tasks
- `server/src/config/env.validation.ts` - Joi env validation schema
- `server/src/config/cors.config.ts` - env-based CORS whitelist
- `server/src/common/filters/global-exception.filter.ts` - centralized error response format

### Database Foundation

- `server/prisma/schema.prisma` - Prisma schema foundation:
  - Core models: `User`, `RefreshToken`, `ClientProfile`, `AuditLog`, `EmployeeClientAssignment`
  - Delivery models: `Project`, `Task`
  - Hybrid RBAC models: `Permission`, `RolePermission`
  - Assignment scope enum: `EmployeeClientAssignmentScope`
  - Delivery enums: `ProjectStatus`, `TaskStatus`, `Priority`
  - `User.role` enum remains the primary fixed role field
  - `ClientProfile.slug` is unique
  - `Project` slug uniqueness is client-scoped (`@@unique([clientProfileId, slug])`)
  - Assignment constraints and indexes:
    - `@@unique([employeeUserId, clientProfileId, scope])`
    - `@@index([employeeUserId, isActive])`
    - `@@index([clientProfileId, isActive])`
    - `@@index([scope, isActive])`
  - Project/task indexes:
    - `Project`: `clientProfileId`, `status`, `priority`
    - `Task`: `projectId`, `assigneeUserId`, `status`, `priority`
- `server/src/database/prisma.service.ts` - Prisma client lifecycle management
- `server/src/database/database.module.ts` - global database module
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
  - `auth.service.ts` - login/refresh/logout/me logic, refresh rotation, revoke handling
  - `auth.module.ts` - exports `JwtModule` + auth providers for downstream guard injection
  - `authorization.service.ts` - role -> permission resolution
  - `dto/` - `LoginDto`, `RefreshTokenDto`, `LogoutDto`
  - `guards/` - `JwtAuthGuard`, `PermissionsGuard`
  - `decorators/` - `CurrentUser`, `RequirePermissions`
  - `types/` - auth response, token payload, authenticated user types
- `server/src/users/` - protected users foundation:
  - `users.controller.ts` - `GET /api/v1/users/me`, `GET /api/v1/users`, `GET /api/v1/users/:id`
  - `users.service.ts` - admin/full-scope checks + own-record object authorization for non-admin access
  - `users.module.ts` - imports `AuthModule` for guard wiring
- `server/src/clients/` - protected clients foundation:
  - `clients.controller.ts` - `GET /api/v1/clients`, `GET /api/v1/clients/:id`, `GET /api/v1/clients/me`
  - `clients.service.ts` - admin/client scope checks + assignment-based employee scope (`clients.read.assigned`) + object-level ownership/assignment checks
  - `clients.module.ts` - imports `AuthModule` for guard wiring
- `server/src/admin-assignments/` - admin assignment management module:
  - `admin-assignments.controller.ts` - `GET /api/v1/admin/assignments`, `POST /api/v1/admin/assignments`, `PATCH /api/v1/admin/assignments/:id`, `PATCH /api/v1/admin/assignments/:id/deactivate`, `PATCH /api/v1/admin/assignments/:id/activate`
  - `admin-assignments.service.ts` - admin-only service authorization, assignment query filters, duplicate-safe create/reactivate flow, and sanitized assignment responses
  - `dto/create-assignment.dto.ts` - create payload validation
  - `dto/update-assignment.dto.ts` - update payload validation
  - `dto/assignment-query.dto.ts` - list query filter validation (`employeeUserId`, `clientProfileId`, `isActive`, `scope`)
  - `admin-assignments.module.ts` - module wiring
- `server/src/admin-users/` - admin employee-user management module:
  - `admin-users.controller.ts` - `POST /api/v1/admin/users`
  - `admin-users.service.ts` - admin-only employee create flow, accountType/role constraints, unique email enforcement, sanitized response
  - `admin-users.module.ts` - module wiring
- `server/src/projects/` - projects API foundation:
  - `projects.controller.ts` - `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PATCH /api/v1/projects/:id`
  - `projects.service.ts` - admin full write scope, employee assignment-scope read, client own-scope read, object-level visibility checks
  - `dto/create-project.dto.ts`, `dto/update-project.dto.ts`, `dto/project-query.dto.ts` - payload/query validation
  - `projects.module.ts` - module wiring
- `server/src/tasks/` - tasks API foundation:
  - `tasks.controller.ts` - `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`
  - `tasks.service.ts` - admin full write scope, employee assignment-scope read + own-assigned status-only update, client own-scope read
  - `dto/create-task.dto.ts`, `dto/update-task.dto.ts`, `dto/task-query.dto.ts` - payload/query validation
  - `tasks.module.ts` - module wiring
- `users/clients/admin-assignments/projects/tasks` are now protected foundations; broader domain CRUD remains planned.

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
- `server/test/authz.e2e-spec.ts` - users/clients/admin-assignment authorization matrix (30 scenarios, real AppModule + real guards, runtime assignment/client resolution, assignment CRUD negative cases)
- `server/test/projects-tasks-authz.e2e-spec.ts` - projects/tasks authorization matrix + assignment deactivation regression coverage
- `server/test/admin-users-password-authz.e2e-spec.ts` - admin employee create + own password change authz matrix
- `server/package.json` test scripts:
  - `npm run test:e2e:prepare`
  - `npm run test:e2e`
  - `npm run test:e2e:authz`
  - latest DB-connected authz run: `3/3 suites`, `64/64` tests passed

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

The `client/` directory is the public/marketing Social Tech website, not the Client Portal. It was only checked enough to disambiguate it from `clientPanel/` for the portal mapping task.

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
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx` - Admin/Employee demo auth and RBAC foundation.
- `clientPanel/src/app/App.tsx` - Client Portal navigation state lives here until a router is introduced.
- `clientPanel/src/app/data/service-pages.ts` - dense mock service content used across portal tabs.
