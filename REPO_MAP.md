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
  - `adminandemployeePanel/src/app/features/metaAds/metaAdsApi.ts`
  - `adminandemployeePanel/src/app/features/metaAds/metaAdsTypes.ts`
  - `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
  - `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
  - `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
  - `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
  - `adminandemployeePanel/src/app/features/projects/projectsUtils.ts`
  - `adminandemployeePanel/src/app/features/tasks/tasksApi.ts`
  - `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
  - `adminandemployeePanel/src/app/features/tasks/tasksUtils.ts`
  - `adminandemployeePanel/src/app/features/delivery/deliveryApi.ts`
  - `adminandemployeePanel/src/app/features/delivery/deliveryTypes.ts`
  - `adminandemployeePanel/src/app/features/delivery/deliveryUtils.ts`
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
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx` now includes GitHub repository connect/manage/read UI for admin users
- `adminandemployeePanel/src/app/pages/Tasks.tsx` now supports delivery taxonomy fields and bug-specific metadata
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
- Developer employee shared UI:
  - `adminandemployeePanel/src/app/employee/components/DeveloperTasksPage.tsx`
  - `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
- Employee CRM pages:
  - `adminandemployeePanel/src/app/employee/pages/CrmLeadlerim.tsx`
  - `adminandemployeePanel/src/app/employee/pages/CrmLeadDetail.tsx`
  - `adminandemployeePanel/src/app/employee/pages/BugunkuTakipler.tsx`
- Employee API-migrated page:
  - `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- Additional API-migrated developer pages:
  - `adminandemployeePanel/src/app/employee/pages/Frontend.tsx`
  - `adminandemployeePanel/src/app/employee/pages/BackendAPI.tsx`
  - `adminandemployeePanel/src/app/employee/pages/Buglar.tsx`
  - `adminandemployeePanel/src/app/employee/pages/Revizyonlar.tsx`
  - `adminandemployeePanel/src/app/employee/pages/Sprintler.tsx`
  - `adminandemployeePanel/src/app/employee/pages/TestYayin.tsx`
  - `adminandemployeePanel/src/app/employee/pages/Projeler.tsx`
- Employee page tests:
  - `adminandemployeePanel/src/app/employee/pages/__tests__/Musterilerim.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/CrmLeadDetail.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/DeveloperTaskPages.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/ProjectManagerServiceWorkspace.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/Sprintler.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/TestYayin.test.tsx`
  - `adminandemployeePanel/src/app/employee/__tests__/EmployeeLayout.crm.test.tsx`
- Employee dashboards: `adminandemployeePanel/src/app/employee/dashboards/`
- Employee dashboard tests:
  - `adminandemployeePanel/src/app/employee/dashboards/__tests__/DeveloperDashboard.test.tsx`
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
- Client Portal auth flow is backend-integrated; Web APP service pages (`service-tab-page`, `reports`, `meetings`, `web-app-dashboard`) are API-first with empty-state rendering (no mock fallback).

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
- `server/src/app.module.ts` - root module imports for config/database/health/auth/users/clients/admin-summary/admin-assignments/admin-clients/admin-users/admin-audit-logs/projects/tasks/crm/delivery/github integrations
- `server/src/config/env.validation.ts` - Joi env validation schema, including `CLIENT_ORIGIN_PUBLIC`, CRM lead scan envs, Gemini scoring envs, `GITHUB_TOKEN_ENCRYPTION_KEY`, and TikTok Ads envs
- `server/src/config/cors.config.ts` - env-based CORS whitelist, including public site origin support
- `server/src/common/filters/global-exception.filter.ts` - centralized error response format

### Database Foundation

- `server/prisma/schema.prisma` - Prisma schema foundation:
  - Core models: `User`, `RefreshToken`, `ClientProfile`, `AuditLog`, `EmployeeClientAssignment`
  - Delivery models: `Project`, `DeliverySprint`, `DeliveryRelease`, `Task`, `TaskTodo`, `ProjectRepository`
  - Client service model: `ClientPurchasedService`
  - CRM models: `CrmLead`, `CrmLeadActivity`
  - Hybrid RBAC models: `Permission`, `RolePermission`
  - Assignment scope enum: `EmployeeClientAssignmentScope`
  - Delivery enums: `ProjectStatus`, `TaskStatus`, `Priority`, `TaskType`, `TaskWorkstream`, `TaskSeverity`, `TaskEnvironment`, `DeliverySprintStatus`, `DeliveryReleaseStatus`, `RepositoryProvider`
  - Additional enums: `PurchasedServiceKey`, `PurchasedServiceStatus`, `TaskTodoVisibility`
  - CRM enums: `CrmLeadStatus`, `CrmLeadSource`, `CrmLeadActivityType`
  - TikTok Ads models: `ClientTikTokAdsConfig`, `ClientTikTokAdsCredential`, `TikTokAdsDailyInsight`, `TikTokAdsSyncLog`
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

### TikTok Ads Backend Module

- `server/src/tiktok-ads/tiktok-ads.module.ts`
- `server/src/tiktok-ads/tiktok-ads.controller.ts`
  - admin config/connection/manual connect/test/disconnect/sync endpoints
  - admin summary/campaigns/insights reporting endpoints
  - assigned employee config/summary/campaigns/insights read endpoints
  - own client config/summary/campaigns/insights read endpoints plus TTL-gated own sync
- `server/src/tiktok-ads/tiktok-ads.service.ts`
  - service-level admin/assigned/client permission checks
  - active purchased-service check for connection management
  - encrypted credential persistence and client-safe own summary
  - daily insight aggregation, manual reporting sync, sync log writes, and client-safe sync errors
- `server/src/tiktok-ads/tiktok-ads-api.service.ts`
  - TikTok API for Business advertiser info connection test
  - reporting snapshot fetch for account/campaign/adgroup/ad levels plus campaign catalog metadata
  - normalized API error categorization
- `server/src/tiktok-ads/tiktok-ads-token.service.ts`
  - AES-256-GCM token encryption/decryption + SHA256 hash
- `server/src/tiktok-ads/dto/connect-manual-tiktok-ads.dto.ts`
- `server/src/tiktok-ads/dto/test-tiktok-ads-connection.dto.ts`
- `server/src/tiktok-ads/dto/tiktok-ads-date-range-query.dto.ts`
- `server/src/tiktok-ads/dto/tiktok-ads-campaigns-query.dto.ts`
- `server/src/tiktok-ads/dto/tiktok-ads-insights-query.dto.ts`
- `server/src/tiktok-ads/dto/update-tiktok-ads-config.dto.ts`
- `server/prisma/migrations/20260527003000_add_tiktok_ads_reporting_snapshot/migration.sql`
- `server/test/tiktok-ads-authz.e2e-spec.ts`
  - admin/employee/client authz, manual connect, test, sync, reporting reads, disconnect, sensitive-token response safety

### TikTok Ads Admin Frontend

- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
  - admin connection summary/manual connect/test/sync/disconnect and reporting RTK Query hooks
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
  - connection, reporting, sync, request/response, and status badge types/helpers
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
  - TikTok Ads connection management + performance summary/manual sync card in admin client detail
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`
  - TikTok Ads connection/reporting hook mocks with ClientDetail regression coverage

## 2026-05-05 Incremental Map Update

### Project Manager Pages (Admin/Employee Panel)
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/ProjectManagerDashboard.tsx`
- `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`

### Web APP Workspace Backend Touchpoints
- `server/src/web-app-workspace/dto/create-workspace-message.dto.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260505153000_add_workspace_message_threading/migration.sql`

### Client Panel Message Tree Touchpoints
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceTypes.ts`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`

### Admin/Employee Workspace Message Types
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`

## 2026-05-05 PM Assigned Operations Update

### Backend Authorization / Seed
- `server/prisma/seed.ts` (PM assigned-manage permissionları)
- `server/src/projects/projects.controller.ts` (`GET /projects/:id/assignee-candidates`)
- `server/src/projects/projects.service.ts` (PM assigned project manage scope checks + assignee candidates)
- `server/src/tasks/tasks.controller.ts` (task create route guard relaxation)
- `server/src/tasks/tasks.service.ts` (PM assigned task/todo/assign manage branches)

### PM Frontend Action Center
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerClientDetail.tsx` (service-card üzerinden project create)
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx` (task/sprint/release/message aksiyonları)
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts` (`useGetProjectAssigneeCandidatesQuery`)
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts` (`ProjectAssigneeCandidate`)

### Tests
- `server/test/projects-tasks-authz.e2e-spec.ts` (PM assigned operations e2e cases)
- `adminandemployeePanel/src/app/employee/pages/__tests__/ProjectManagerClientDetail.test.tsx`
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
- `server/prisma/migrations/20260503000000_add_crm_lead_scan_engine/migration.sql` - adds CRM lead scan log model, scan-derived CRM lead fields, and scan safety schema
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql` - adds task taxonomy fields, delivery sprint/release tables, project repository table, enums, indexes, and relations
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
  - seeds 7+ project tasks with idempotent assignee resolution via email/natural keys
  - seeds task taxonomy coverage (bug/frontend/backend/revision/qa/deployment)
  - seeds developer/project-manager delivery/github permissions
  - seeds delivery sprints, releases, and demo repository linkage
  - uses `bcryptjs` hashes for demo passwords
- `server/tsconfig.seed.json` - TypeScript check config for seed files

### Delivery And GitHub Modules

- `server/src/tasks/*`
  - task DTOs and service now support taxonomy fields, sprint relation, and query filters for developer delivery pages
- `server/src/delivery/*`
  - `delivery.module.ts`
  - `delivery.controller.ts`
  - `delivery.service.ts`
  - `dto/create-delivery-sprint.dto.ts`
  - `dto/update-delivery-sprint.dto.ts`
  - `dto/delivery-sprint-query.dto.ts`
  - `dto/create-delivery-release.dto.ts`
  - `dto/update-delivery-release.dto.ts`
  - `dto/delivery-release-query.dto.ts`
- `server/src/integrations/github/*`
  - `github.module.ts`
  - `github.controller.ts`
  - `github.service.ts`
  - `github-client.service.ts`
  - `github-token.service.ts`
  - `dto/connect-project-repository.dto.ts`
  - `dto/github-query.dto.ts`
- `server/test/delivery-github-authz.e2e-spec.ts`
  - delivery summary authz
  - sprint create/list authz
  - github repository connect/read authz
  - token non-exposure assertions
  - mocked GitHub API mapping assertions

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

## 2026-05-03 Update Map (Delivery Links, Task Notes, Release Approval)

### Backend
- `server/prisma/schema.prisma`
  - `Project.repositoryUrl`
  - `Project.figmaProjectUrl`
  - `Task.branchName`
  - `Task.codePreparationNotes`
  - `Task.codePreparedAt`
  - `Task.codePreparedByUserId`
  - `TaskWorkNote`
  - `DeliveryRelease.approvalStatus/approvalNotes/approvalRequestedAt/approvalRespondedAt/approvalActorUserId`
- `server/prisma/migrations/20260503153000_add_project_figma_task_notes_release_approval/migration.sql`
- `server/prisma/seed.ts`
  - project-manager assigned release manage permission wiring
  - project repositoryUrl demo data
- `server/src/projects/dto/create-project.dto.ts`
- `server/src/projects/dto/update-project.dto.ts`
- `server/src/projects/projects.service.ts`
  - `WEB_APP` / `MOBILE_APP` için repository link zorunluluğu
- `server/src/tasks/dto/create-task-work-note.dto.ts`
- `server/src/tasks/dto/prepare-task-code.dto.ts`
- `server/src/tasks/tasks.controller.ts`
  - `GET/POST /tasks/:id/work-notes`
  - `POST /tasks/:id/code-preparation`
  - `GET /tasks/:id/related-commits`
- `server/src/tasks/tasks.module.ts`
- `server/src/tasks/tasks.service.ts`
  - task code auto-generation
  - developer work-note persistence
  - repository-required code preparation checks
  - related commit reads via GitHub integration
- `server/src/integrations/github/dto/connect-project-repository.dto.ts`
  - `installationId` preparation field
- `server/src/integrations/github/github.service.ts`
  - repository upsert includes `installationId`
  - workflow summary / repository requirement helpers
- `server/test/delivery-github-authz.e2e-spec.ts`
  - repository-required WEB_APP flow
  - work-note + related-commit authz coverage
  - project-manager release manage-assigned coverage

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/features/projects/projectsUtils.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
  - repository connect payload supports `installationId`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksUtils.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksApi.ts`
  - task work-note, code-preparation, related-commit hooks
- `adminandemployeePanel/src/app/features/delivery/deliveryTypes.ts`
  - release approval state fields
- `adminandemployeePanel/src/app/pages/Projects.tsx`
  - admin create/edit project form now includes repository link + Figma link
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
  - business repository link visibility
  - Figma quick link
  - GitHub App installation ID preparation input
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
  - assigned-scope employee task detail route support
  - backend-native work-note saving
  - code preparation CTA
  - related commits panel
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
  - detail links to assigned task detail screen
- `adminandemployeePanel/src/app/employee/pages/Projeler.tsx`
  - detail links to assigned project detail screen
- `adminandemployeePanel/src/app/employee/pages/TestYayin.tsx`
  - release approval badge rendering
- `adminandemployeePanel/src/app/routes.tsx`
  - employee project/task detail routes
- `adminandemployeePanel/src/app/pages/__tests__/Projects.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ProjectDetail.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/TaskDetail.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/TestYayin.test.tsx`

## 2026-05-03 Update Map (Project Files Cloudinary V1)

### Backend
- `server/prisma/schema.prisma`
  - `ProjectFileVisibility`, `ProjectFileCategory`
  - `ProjectFile`, `ProjectFileShareLink`
- `server/prisma/migrations/20260503190000_add_project_files_cloudinary/migration.sql`
- `server/src/integrations/cloudinary/cloudinary.module.ts`
- `server/src/integrations/cloudinary/cloudinary.service.ts`
- `server/src/project-files/project-files.module.ts`
- `server/src/project-files/project-files.controller.ts`
- `server/src/project-files/project-file-shares.controller.ts`
- `server/src/project-files/project-files.service.ts`
- `server/src/project-files/dto/*`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/prisma/seed.ts`
- `server/test/delivery-github-authz.e2e-spec.ts`

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `adminandemployeePanel/src/app/employee/pages/Dosyalar.tsx`
- `adminandemployeePanel/src/app/employee/pages/TeslimDosyalari.tsx`

### Client Panel Frontend
- `clientPanel/src/app/features/projectFiles/projectFilesTypes.ts`
- `clientPanel/src/app/features/projectFiles/projectFilesApi.ts`
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/__tests__/client-portal.test.tsx`

## 2026-05-05 Update Map (Web APP Workspace Realtime)

### Backend
- `server/src/web-app-workspace/web-app-workspace.module.ts`
- `server/src/web-app-workspace/web-app-workspace.controller.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `server/src/web-app-workspace/web-app-workspace.gateway.ts`
- `server/src/web-app-workspace/dto/*`

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/projects/workspaceSocket.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`

### Client Panel Frontend
- `clientPanel/src/app/features/projects/projectsApi.ts`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceTypes.ts`
- `clientPanel/src/app/features/webAppWorkspace/workspaceSocket.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/reports.tsx`
- `clientPanel/src/app/pages/meetings.tsx`

## 2026-05-05 Update Map (Client Mock Cleanup + Assignment Visibility)

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
  - selected client için aktif çalışan atamalarını listeler
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`
  - “Size Atanan Müşteriler” görünürlüğü

### Client Panel Frontend
- `clientPanel/src/app/App.tsx`
  - `WebAppDashboard` projectId ile çağrılır
- `clientPanel/src/app/pages/services/web-app-dashboard.tsx`
  - API-first project/task/workspace özeti
- `clientPanel/src/app/pages/service-tab-page.tsx`
  - `web-app` için mock tab content yerine workspace tab render
- `clientPanel/src/app/pages/reports.tsx`
  - API-first weekly report list + empty state
- `clientPanel/src/app/pages/meetings.tsx`
  - API-first meeting list + scheduled time önceliği + empty state

## 2026-05-06 Update Map (Revisions Hybrid Lifecycle)

### Backend
- `server/src/web-app-workspace/web-app-workspace.service.ts`
  - actor-aware revision transition matrix (`client` / `employee|pm` / `admin`)
  - invalid transitions unified to `400`
  - assignee scope validation widened to `PROJECT|DEVELOPMENT|DESIGN`
- `server/test/web-app-workspace-revisions-authz.e2e-spec.ts`
  - client approve/reject, PM forbidden transition, admin override, out-of-scope safe `404`

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/employee/pages/Revizyonlar.tsx`
  - hibrit görünüm: WEB_APP workspace revisions + non-WEB `Task(type=REVISION)`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
  - PM revision create + valid transition + assignee update action flow
- `adminandemployeePanel/src/app/employee/pages/__tests__/DeveloperTaskPages.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/ProjectManagerServiceWorkspace.test.tsx`

### Client Panel Frontend
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
  - revision mutation sonrası incremental cache patch (`updateQueryData`)
- `clientPanel/src/app/pages/service-tab-page.tsx`
  - WEB_APP revision create + approve/reject UI
  - non-WEB revision sekmelerinde task-based revision panel
- `clientPanel/src/app/pages/__tests__/service-tab-page.webapp.test.tsx`

## 2026-05-09 Update Map (Meta Ads Faz 5 Admin Global Panel)

### Backend
- `server/src/meta-ads/meta-ads.controller.ts`
  - `GET /api/v1/admin/meta-ads/clients`
- `server/src/meta-ads/meta-ads.service.ts`
  - global admin Meta Ads client list aggregation (connection + spend + pending approvals + assignments)
- `server/test/meta-ads-authz.e2e-spec.ts`
  - admin global list + non-admin forbidden coverage

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/pages/MetaAdsAdmin.tsx`
  - global admin `/meta-ads` yönetim ekranı
- `adminandemployeePanel/src/app/routes.tsx`
  - `/meta-ads` route
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
  - Meta Ads sidebar menü girdisi
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
  - global list/config/sync endpoint hooks
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
  - global list + sync response normalizerları
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
  - Meta Ads manual sync aksiyonu
- `adminandemployeePanel/src/app/pages/__tests__/MetaAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`

## 2026-05-09 Update Map (Meta Ads Faz 7 Approval + Creative Collaboration)

### Backend
- `server/prisma/schema.prisma`
  - `MetaAdsApprovalType`, `MetaAdsApprovalStatus` enumları
  - `Task` approval lifecycle alanları
  - `ProjectFile` creative approval metadata alanları
- `server/prisma/migrations/20260509193000_add_meta_ads_approval_flow/migration.sql`
- `server/src/tasks/dto/create-task.dto.ts`
- `server/src/tasks/dto/update-task.dto.ts`
- `server/src/tasks/dto/task-query.dto.ts`
- `server/src/tasks/tasks.service.ts`
  - client approval response authorization + scope check + status transitions
  - approval query filters + approval relation select genişletmesi
- `server/src/project-files/dto/create-upload-signature.dto.ts`
- `server/src/project-files/dto/complete-upload.dto.ts`
- `server/src/project-files/dto/project-file-query.dto.ts`
- `server/src/project-files/project-files.service.ts`
  - approval metadata persistence + query filtering
- `server/src/meta-ads/meta-ads.service.ts`
  - pending approval aggregation now includes new task approval status fields
- `server/test/projects-tasks-authz.e2e-spec.ts`
  - client approve/reject + rejection note + out-of-scope approval mutation coverage

### Client Panel Frontend
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/features/tasks/tasksApi.ts`
  - `useUpdateClientTaskApprovalMutation`
- `clientPanel/src/app/features/projectFiles/projectFilesTypes.ts`
- `clientPanel/src/app/features/projectFiles/projectFilesApi.ts`
  - approval-aware query params
- `clientPanel/src/app/pages/service-tab-page.tsx`
  - pending approvals + creative preview + approval history UI
- `clientPanel/src/app/components/button.tsx`
  - `disabled` prop support
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
  - approval fields/types
- `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
  - approval type/status/note rendering and role-based approval task creation metadata

## 2026-05-10 Update Map (Meta Ads Faz 8 Sync Automation Hardening)

### Backend
- `server/prisma/schema.prisma`
  - `MetaAdsSyncStatus` enumu
  - `MetaAdsSyncLog` modeli
  - `ClientProfile.metaAdsSyncLogs` ilişkisi
- `server/prisma/migrations/20260510001000_add_meta_ads_sync_logs/migration.sql`
- `server/src/config/env.validation.ts`
  - `META_ADS_SYNC_TTL_MINUTES`
- `server/src/meta-ads/dto/meta-ads-sync-logs-query.dto.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
  - `GET /api/v1/admin/meta-ads/sync-logs`
  - `POST /api/v1/admin/clients/:clientId/meta-ads/sync/retry`
  - `POST /api/v1/clients/me/meta-ads/sync`
- `server/src/meta-ads/meta-ads.service.ts`
  - sync lifecycle logging
  - error normalization mapping
  - TTL/rate-limit skip control
  - client-safe error masking
- `server/test/meta-ads-authz.e2e-spec.ts`
  - sync logs, retry, TTL skip, own sync, safe error visibility coverage

### Admin + Employee Panel Frontend
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
  - `MetaAdsSyncStatus`, admin sync log response/query tipleri
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
  - sync log + sync response normalizerları
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
  - `getAdminMetaAdsSyncLogs`, `retryAdminClientMetaAdsSync`
- `adminandemployeePanel/src/app/pages/MetaAdsAdmin.tsx`
  - failed sync müşteriler, retry aksiyonu, sync logs tablosu
- `adminandemployeePanel/src/app/pages/__tests__/MetaAdsAdmin.test.tsx`

### Client Panel Frontend
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
  - `MetaAdsSyncStatus`, `MetaAdsSyncResponse`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
  - `syncOwnMetaAds` mutation
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
  - refresh action + last sync + safe status messages
- `clientPanel/src/app/pages/service-tab-page.tsx`
  - client-safe connection notices
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`

## 2026-05-10 Update Map (Meta Ads Faz 9 Reporting + Export Foundation)

### Backend
- `server/prisma/schema.prisma`
  - `MetaAdsReportType`, `MetaAdsReportStatus` enumları
  - `MetaAdsReport` modeli + `Task` acknowledgement relation
- `server/prisma/migrations/20260510013000_add_meta_ads_reports/migration.sql`
- `server/src/meta-ads/dto/create-meta-ads-report.dto.ts`
- `server/src/meta-ads/dto/update-meta-ads-report.dto.ts`
- `server/src/meta-ads/dto/meta-ads-reports-query.dto.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
  - admin/assigned/client report endpointleri
- `server/src/meta-ads/meta-ads.service.ts`
  - report list/create/publish/update service akışları
  - publish sonrası report acknowledgement task entegrasyonu
- `server/test/meta-ads-authz.e2e-spec.ts`
  - report authz + visibility + publish/ack request coverage

### Client Panel Frontend
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
  - report response tipi + status/ack enums
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
  - `getOwnMetaAdsReports` endpoint + normalize/serialize helpers
- `clientPanel/src/app/pages/service-tab-page.tsx`
  - `meta-reports` tabı report-entity list render
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
  - report tab render/assertion senaryosu

## 2026-05-10 Update Map (Meta Ads Faz 10 Production Hardening)

### Backend
- `server/src/meta-ads/meta-ads.service.ts`
  - own-client sync error response sanitization (`client-safe` mesaj)
  - sync error exception map’te role-aware detail handling
- `server/test/meta-ads-authz.e2e-spec.ts`
  - sync logs limit/pagination coverage
  - summary date-range hard-limit validation coverage
  - own-client sync error leak prevention coverage

### Client Panel Frontend
- `clientPanel/src/app/App.tsx`
  - dashboard/tab/shared page lazy imports
  - suspense loading fallback
- `clientPanel/vite.config.ts`
  - `manualChunks` vendor split (icons/redux/router/radix/recharts/core)

### Admin + Employee Panel Frontend
- `adminandemployeePanel/vite.config.ts`
  - `manualChunks` vendor split
- `adminandemployeePanel/src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx`
  - role-based view visibility assertions (`social` vs `performance`)
