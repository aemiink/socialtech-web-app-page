# Project Context

## Product Summary

Social Tech is a premium digital growth agency. This repository contains multiple Vite + React SPAs for agency operations and client visibility: an Admin Panel, an Employee Panel (role-based), a public/marketing client site, and a Client Portal. The UI is in Turkish. Frontend auth is backend-integrated, while domain/business data integration is still being phased from mock/static to API-driven flows.

## Tech Stack

- Framework: React 18 + React Router 7 (SPA, no Next.js)
- Build tool: Vite 6 + @vitejs/plugin-react
- Styling: Tailwind CSS v4 (via @tailwindcss/vite)
- UI primitives: Radix UI (shadcn-style), MUI v7, Lucide React icons
- Charts: Recharts
- Forms: react-hook-form
- Animations: Motion (Framer Motion), tw-animate-css
- Drag-and-drop: react-dnd
- Notifications: Sonner
- Theming: next-themes
- State management: Redux Toolkit + React Redux
- API state/cache: RTK Query
- Package manager: npm (canonical) in `adminandemployeePanel/`, `clientPanel/`, and `server/` (`packageManager: npm@11.8.0`)
- TypeScript: Yes (strict expected per CLAUDE.md)
- Backend: NestJS + TypeScript in `server/` (single shared API with implemented auth endpoints and frontend auth integration)
- Frontend business domain data is still partially mock/static while domain-by-domain API integration is phased in, but core admin operations, CRM, and developer delivery screens are now API-driven.

## Main User Roles

Backend role enum values are mapped in frontend via `roleMapping.ts`:
- `admin` — full access to all modules
- `project-manager` — client processes, tasks, approvals, deliverables
- `performance-specialist` — ad campaigns, optimizations, pixel tracking
- `social-media-specialist` — content calendar, captions, DMs, publishing
- `designer` — creatives, UI designs, revisions, delivery files
- `developer` — sprints, frontend/backend tasks, bugs, testing
- `support-specialist` — support tickets, maintenance, security, backups
- `seo-specialist` — SEO audit, keyword tracking, index status, Search Console
- `crm-specialist` — CRM/sales lead follow-up, assigned lead activities, follow-up scheduling

There are two panel types:
- Admin Panel (protected by backend auth via Redux/RTK Query)
- Employee Panel (protected by backend auth via Redux/RTK Query with role-gated sidebar)

There is also a Client Portal as a separate sub-app at `clientPanel/`.

## Main Modules

### Admin Panel (`/` routes)
Dashboard, Clients (Müşteriler), Services (Hizmetler), Projects (Projeler), Tasks (Görevler), Approvals (Onaylar), Campaigns (Kampanyalar), Contents (İçerikler), Reports (Raporlar), Meetings (Toplantılar), Employees (Çalışanlar), Finance (Finans), Automations (Otomasyonlar), Settings (Ayarlar)
CRM (`/crm`) is now an admin module for lead creation, CRM owner assignment, timeline management, status updates, conversion to `ClientProfile`, and backend-native SerpAPI lead scan automation.
Developer/Delivery is now a backend-native operations module built on top of `Project -> DeliverySprint -> Task -> TaskTodo`, with release tracking and project-scoped GitHub visibility.

### Employee Panel (`/employee` routes)
Role-based sidebar. Common pages: Dashboard, Gorevlerim, Musterilerim, Takvim, Bildirimler, Dosyalar, Ayarlar. Specialist pages vary per role (see routes.tsx).
`CRM_SPECIALIST` employees receive CRM Leadleri and Bugünkü Takipler routes and only see assigned CRM leads.
`DEVELOPER` employees now use API-driven Dashboard, Frontend, Backend/API, Buglar, Revizyonlar, Sprintler, Test & Yayın, and Projeler pages backed by delivery/task/repository endpoints.
`SOCIAL_MEDIA_SPECIALIST`, `PERFORMANCE_SPECIALIST`, and `DESIGNER` now have assigned-scope Meta Ads (`/employee/meta-ads`) and TikTok Ads (`/employee/tiktok-ads`) employee workspaces with role-specific sections/actions via `MetaAdsWorkspace` and `TikTokAdsWorkspace`.

### Client Portal
Separate Vite + React SPA at `clientPanel/`. It is a customer-facing visibility panel, not a public SaaS product.

Portal areas:
- Backend-authenticated client login gate (Redux/RTK Query)
- Service selection screen with 13 active Social Tech services
- Service-specific dashboards for Growth & Hub, Social Media, Media Hub, Meta/TikTok/Google/Amazon Ads, Web App, Mobile App, Landing Pages, Web & Mobile Design, Technical Support, and SEO Audit
- Generic service tab workspace for service-specific sections
- Shared pages: Reports, Meetings, Billing, Settings
- Floating Client Action Center for approvals, revisions, report/file actions, and action history

## Auth & RBAC Summary

- Frontend auth is integrated with backend in both SPAs using Redux Toolkit + RTK Query.
- Access token is kept in Redux memory state (not localStorage).
- Refresh token is managed as backend HttpOnly cookie and sent with `credentials: include`.
- RTK Query base API in both apps handles:
  - Bearer token header injection
  - `401 -> refresh -> retry`
  - refresh single-flight lock to prevent parallel refresh storms
- `adminandemployeePanel` route behavior:
  - `ADMIN` + `ADMIN` role => admin shell access
  - `EMPLOYEE` => employee shell access
  - `CLIENT` => rejected from this app
- `clientPanel` route behavior:
  - only `CLIENT` accounts can enter
  - state-based navigation in `App.tsx` is preserved
  - service selection restore purchased-service authorization kontrolüyle localStorage-backed
- `RoleContext` is no longer the auth source of truth in `adminandemployeePanel`; Redux auth state is canonical.
- Backend auth is now implemented under `server/`:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- Access token is returned in response body and used as Bearer token.
- Refresh token is stored as HttpOnly cookie; token plaintext is never stored in DB (`RefreshToken.tokenHash`).
- Refresh token rotation is enabled; revoked-token reuse attempt triggers bulk revocation of active sessions for that user.
- Access-token invalidation is active via `User.sessionInvalidatedAt` + JWT `siv` claim checks in `JwtAuthGuard` (with backward-compatible `iat` fallback for pre-rollout tokens).
- Invalidation triggers: own password change, admin reset-password, admin deactivate, admin role change, admin `isActive=false` updates.
- Activate does not clear `sessionInvalidatedAt`, so stale access tokens do not become valid again.
- `JwtAuthGuard` and `CurrentUser` decorator are active; `RequirePermissions` + `PermissionsGuard` exist as backend authorization scaffolding.
- `/auth/me` is guard-protected and returns role + resolved permission set + `ClientProfile` for client users.
- Protected domain API foundation is now active for `users` and `clients`:
  - `GET /api/v1/users/me`
  - `GET /api/v1/users`
  - `GET /api/v1/users/:id`
  - `GET /api/v1/clients`
  - `GET /api/v1/clients/:id`
  - `GET /api/v1/clients/me`
- Admin assignment management API is now active:
  - `GET /api/v1/admin/assignments`
  - `POST /api/v1/admin/assignments`
  - `PATCH /api/v1/admin/assignments/:id`
  - `PATCH /api/v1/admin/assignments/:id/deactivate`
  - `PATCH /api/v1/admin/assignments/:id/activate`
  - assignment create/activate now fails closed for inactive employee or inactive client profile (`400`)
- Projects and tasks API foundation is now active:
  - Projects: `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PATCH /api/v1/projects/:id`
  - Tasks: `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`
- Task todo/checklist endpoints are now active:
  - `POST /api/v1/tasks/:id/todos`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId/toggle`
  - `DELETE /api/v1/tasks/:taskId/todos/:todoId`
- CRM lead management API is now active:
  - Admin: `GET/POST /api/v1/admin/crm/leads`, `GET/PATCH /api/v1/admin/crm/leads/:id`, `POST /api/v1/admin/crm/leads/:id/activities`, `POST /api/v1/admin/crm/leads/:id/convert`
  - Employee CRM: `GET /api/v1/crm/leads`, `GET/PATCH /api/v1/crm/leads/:id`, `POST /api/v1/crm/leads/:id/activities`
  - Public website: `POST /api/v1/public/crm/leads`
  - Admin endpoints require admin account/role plus CRM permissions; employee endpoints require `CRM_SPECIALIST` plus assigned-lead permissions.
  - Employee CRM detail access is object-scoped by `ownerUserId`; non-owned lead detail returns safe `404`.
  - Convert is admin-only, creates a `ClientProfile`, sets lead status `WON`, and prevents duplicate conversion with `409`.
  - Public website contact form creates `WEBSITE_FORM` leads, requires consent, returns only minimal receipt data, and auto-assigns the lead to an active CRM specialist.
- Admin CRM lead scan API is now active:
  - `POST /api/v1/admin/crm/lead-scan/run`
  - `GET /api/v1/admin/crm/lead-scan/logs`
  - `GET /api/v1/admin/crm/lead-scan/logs/:id`
  - Admin-only via `crm.leadScan.run` / `crm.leadScan.read`.
  - Uses SerpAPI Google Maps only, enforces DB-tracked daily query safety (`LEAD_SCAN_DAILY_QUERY_LIMIT`, default `5`, max `6`), skips duplicates before website/AI analysis, analyzes websites, and stores Turkish outreach drafts on created CRM leads.
- Delivery module API is now active:
  - `GET /api/v1/delivery/summary`
  - `GET/POST /api/v1/delivery/sprints`
  - `GET/PATCH /api/v1/delivery/sprints/:id`
  - `GET/POST /api/v1/delivery/releases`
  - `GET/PATCH /api/v1/delivery/releases/:id`
  - Delivery uses assigned-project object scope for employee/developer reads and admin-only management in V1.
- Tasks API now supports developer operations taxonomy:
  - `type`: `FEATURE | BUG | REVISION | QA | DEPLOYMENT | MAINTENANCE`
  - `workstream`: `FRONTEND | BACKEND | FULLSTACK | QA | DEVOPS | UI_INTEGRATION`
  - `severity`: `LOW | MEDIUM | HIGH | CRITICAL`
  - `environment`: `DEVELOPMENT | STAGING | PRODUCTION`
  - Additional optional fields: `affectedUrl`, `reproductionSteps`, `reportedBy`, `code`, `sprintId`
- Project GitHub integration API is now active:
  - `PUT /api/v1/projects/:id/repository`
  - `GET /api/v1/projects/:id/repository`
  - `DELETE /api/v1/projects/:id/repository`
  - `GET /api/v1/projects/:id/repository/branches`
  - `GET /api/v1/projects/:id/repository/commits`
  - `GET /api/v1/projects/:id/repository/pulls`
  - `GET /api/v1/projects/:id/repository/workflows/runs`
  - Repository config is project-scoped, GitHub token is encrypted at rest, and token plaintext is never returned in responses.
- `GET /users` enforces `users.read`; service-level object authorization protects `/users/:id` and `/clients/:id`.
- Admin can read full users/client profile scopes; client users are limited to their own `ClientProfile` scope.
- Employee assignment scope is now modeled via `EmployeeClientAssignment` + active assignment checks.
- Employee users with `clients.read.assigned` can read only assigned client profiles (`GET /clients`) and assigned profile detail (`GET /clients/:id`); unassigned detail resolves as safe `404`.
- Employee users can read only active-assignment-scope projects/tasks and can update only `status` on tasks assigned to them within active assignment scope.
- Client users can read only own `clientProfileId`-scope projects/tasks; out-of-scope detail access resolves as safe `404`.
- Assignment admin endpoints are admin-only via `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions`, plus service-level `ADMIN` account/role and permission checks (`assignments.read`, `assignments.manage`).
- Authz e2e matrix is now automated in backend tests and validated with real guard chain behavior (`8/8 suites`, `187/187` tests).
- Admin dashboard summary endpoint is active: `GET /api/v1/admin/summary` (permission: `admin.summary.read`).
- Admin summary contract is now fixed and consumed by frontend as dedicated KPI source:
  - `users`: `total`, `active`, `inactive`, `employees`, `clients`, `admins`
  - `clients`: `total`, `active`, `inactive`
  - `projects`: `total`, `planned`, `inProgress`, `review`, `completed`, `onHold`
  - `tasks`: `total`, `todo`, `inProgress`, `review`, `done`, `blocked`
  - `auditLogs`: `total`, `lastActionAt`
  - `meta`: `generatedAt`
  - removed legacy/extra fields: `clients.suspended`, `tasks.unassigned`, `auditLogs.last24Hours`, `meta.resourceCount`
- `GET /api/v1/admin/summary` authorization is enforced both route-level and service-level:
  - `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("admin.summary.read")`
  - service-level `ADMIN` accountType + `ADMIN` role + permission check
  - non-admin access returns `403` even with temporary permission mutation attempts
- `GET /api/v1/clients` now supports validated server-side pagination/filter/sorting and returns a standard `data + meta` envelope.
- Full domain endpoint authorization rollout beyond users/clients/admin-assignments/projects/tasks/crm remains pending.

## Frontend Architecture

- Entry: `adminandemployeePanel/src/main.tsx`
- App root: `adminandemployeePanel/src/app/App.tsx`
- Router: `adminandemployeePanel/src/app/routes.tsx` (createBrowserRouter)
- Login page: `adminandemployeePanel/src/app/pages/Login.tsx`
- Auth bootstrap: `adminandemployeePanel/src/app/features/auth/AuthBootstrap.tsx`
- Redux store:
  - `adminandemployeePanel/src/app/store/store.ts`
  - `adminandemployeePanel/src/app/store/hooks.ts`
- RTK Query base API: `adminandemployeePanel/src/app/services/baseApi.ts`
- Auth feature:
  - `adminandemployeePanel/src/app/features/auth/authApi.ts`
  - `adminandemployeePanel/src/app/features/auth/authSlice.ts`
  - `adminandemployeePanel/src/app/features/auth/authSelectors.ts`
  - `adminandemployeePanel/src/app/features/auth/authTypes.ts`
  - `adminandemployeePanel/src/app/features/auth/roleMapping.ts`
- Domain API features (RTK Query via `baseApi.injectEndpoints`):
  - `adminandemployeePanel/src/app/features/dashboard/*` (`GET /admin/summary`)
  - `adminandemployeePanel/src/app/features/adminAssignments/*` (`GET/POST/PATCH /admin/assignments*`)
  - `adminandemployeePanel/src/app/features/clients/*` (`GET /clients`, `GET /clients/:id`)
  - `adminandemployeePanel/src/app/features/projects/*` (`GET/POST/PATCH /projects*`)
  - `adminandemployeePanel/src/app/features/tasks/*` (`GET/POST/PATCH /tasks*`)
  - `adminandemployeePanel/src/app/features/delivery/*` (`GET/POST/PATCH /delivery/*`)
  - `adminandemployeePanel/src/app/features/crm/*` (admin + employee CRM lead queries/mutations)
- Admin pages now backend-driven for core operations:
  - `Dashboard` uses dedicated summary endpoint (`/admin/summary`)
  - `Clients` uses server-side paginated/filterable/sortable list response (`data + meta`) and syncs pagination from `currentData.meta.page` to avoid stale-page snapback
  - `ClientDetail` uses `GET /clients/:id/summary` for client basics + related projects/tasks overview
  - `Dashboard` consumes normalized summary contract via `transformResponse + normalizeAdminSummaryResponse` guard layer
  - `Clients` create/edit flow supports purchased-services selection and owner mode (`NONE` / `CREATE` / `LINK_EXISTING`)
  - `Projects` create/edit flow uses searchable client picker + `serviceKey` selection
  - `Tasks` create/edit flow uses searchable assignee picker and developer taxonomy fields (`type`, `workstream`, `severity`, `environment`, `affectedUrl`, `reproductionSteps`, `reportedBy`, `code`, `sprintId`)
  - `TaskDetail` includes todo/checklist management (`INTERNAL` / `CLIENT_VISIBLE`)
  - `ProjectDetail` now includes admin GitHub repository connect/manage/read UX with recent branches, commits, pull requests, and workflow runs
  - `CrmLeads` and `CrmLeadDetail` provide admin CRM list/detail/create/activity/status/convert workflows.
- Layouts:
  - `RootLayout` — Admin Panel shell (sidebar + topbar + `<Outlet />`)
  - `EmployeeLayout` — Employee Panel shell (role-aware sidebar + topbar + `<Outlet />`)
- Contexts: `adminandemployeePanel/src/app/contexts/RoleContext.tsx` (compatibility layer; auth source of truth is Redux)
- Pages: `adminandemployeePanel/src/app/pages/` (admin pages)
- Employee pages: `adminandemployeePanel/src/app/employee/pages/`
- Developer/Delivery employee pages are now API-driven:
  - `DeveloperDashboard` -> `GET /delivery/summary`
  - `Frontend` -> `GET /tasks?workstream=FRONTEND`
  - `BackendAPI` -> `GET /tasks?workstream=BACKEND`
  - `Buglar` -> `GET /tasks?type=BUG`
  - `Revizyonlar` -> `GET /tasks?type=REVISION`
  - `Sprintler` -> `GET /delivery/sprints`
  - `TestYayin` -> `GET /delivery/releases`
  - `Projeler` -> `GET /projects` + per-project GitHub read cards
- Employee CRM pages:
  - `CrmLeadlerim` — assigned lead list, priority cards, status/search filters
  - `CrmLeadDetail` — assigned lead detail, limited status update, activity/timeline entry
  - `BugunkuTakipler` — date-range filtered follow-up view
- Employee dashboards: `adminandemployeePanel/src/app/employee/dashboards/`
- UI primitives: `adminandemployeePanel/src/app/components/ui/` (Radix-based, shadcn style)
- Mock data: `adminandemployeePanel/src/app/data/mockData.ts`
- Styles: `adminandemployeePanel/src/styles/` (index.css imports fonts.css, tailwind.css, theme.css)
- Path alias: `@` → `./src`

### Client Portal Frontend Architecture

- Location: `clientPanel/`
- Entry: `clientPanel/src/main.tsx`
- App root: `clientPanel/src/app/App.tsx`
- Login: `clientPanel/src/app/components/client-login.tsx` (backend `/auth/login`)
- Auth bootstrap: `clientPanel/src/app/features/auth/AuthBootstrap.tsx`
- Redux store:
  - `clientPanel/src/app/store/store.ts`
  - `clientPanel/src/app/store/hooks.ts`
- RTK Query base API: `clientPanel/src/app/services/baseApi.ts`
- Auth feature:
  - `clientPanel/src/app/features/auth/authApi.ts`
  - `clientPanel/src/app/features/auth/authSlice.ts`
  - `clientPanel/src/app/features/auth/authSelectors.ts`
  - `clientPanel/src/app/features/auth/authTypes.ts`
  - `clientPanel/src/app/features/auth/roleMapping.ts`
- Navigation: backend-authenticated gate, then existing state-based flow in `App.tsx` (`selectedService`, `currentPage`); no current React Router route file
- Core components:
  - `clientPanel/src/app/components/sidebar.tsx` — service-specific sidebar menu
  - `clientPanel/src/app/components/topbar.tsx` — selected service + authenticated client identity + logout
  - `clientPanel/src/app/components/client-action-center.tsx` — floating action center and history drawer
- Pages:
  - `clientPanel/src/app/pages/service-selection.tsx`
  - `clientPanel/src/app/pages/service-tab-page.tsx`
  - `clientPanel/src/app/pages/reports.tsx`
  - `clientPanel/src/app/pages/meetings.tsx`
  - `clientPanel/src/app/pages/billing.tsx`
  - `clientPanel/src/app/pages/settings.tsx`
  - `clientPanel/src/app/pages/services/` — 13 service dashboard pages
- Portal data:
  - `clientPanel/src/app/data/service-pages.ts` — mock service profiles, KPIs, tabs, tables, timelines, agency comments, and client actions
  - `clientPanel/src/app/lib/client-actions.ts` — localStorage-backed action history and action event dispatch
- Service selection restore remains localStorage-backed during current state-based navigation
- Service selection now renders only client’ın `ACTIVE` purchased services kümesi
- `selectedService` restore unauthorized ise otomatik temizlenip service selection’a fallback edilir
- Client-visible task progress bileşeni: `clientPanel/src/app/components/client-visible-tasks-section.tsx`
- Portal styles: `clientPanel/src/styles/`

## Backend Architecture

Backend now exists at `server/` as a single shared NestJS REST API for Admin/Employee Panel and Client Portal integration.

Current backend baseline includes:
- Global API prefix: `/api/v1`
- Config/env validation: `@nestjs/config` + Joi schema validation
- Global request validation: `ValidationPipe` with `whitelist`, `transform`, `forbidNonWhitelisted`
- Global error handling: centralized exception filter with consistent JSON error shape
- CORS: env-driven whitelist (`CLIENT_ORIGIN_ADMIN`, `CLIENT_ORIGIN_PORTAL`) with local dev defaults
- Database access foundation: global `DatabaseModule` + `PrismaService`
- Prisma/PostgreSQL schema foundation expanded with hybrid RBAC-ready models:
  - Core: `User`, `RefreshToken`, `ClientProfile`, `AuditLog`
  - Authorization: `Permission`, `RolePermission`
  - Assignment scope: `EmployeeClientAssignment` + `EmployeeClientAssignmentScope`
  - Project tracking: `Project`, `Task`, `TaskTodo` + enums (`ProjectStatus`, `TaskStatus`, `Priority`, `TaskTodoVisibility`)
  - Client purchased services: `ClientPurchasedService` + enums (`PurchasedServiceKey`, `PurchasedServiceStatus`)
  - CRM sales pipeline: `CrmLead`, `CrmLeadActivity` + enums (`CrmLeadStatus`, `CrmLeadSource`, `CrmLeadActivityType`)
- Hybrid RBAC strategy selected: fixed `User.role` enum is kept, permission expansion is modeled via `Permission` + `RolePermission`
- Demo seed foundation exists at `server/prisma/seed.ts`:
  - Seeds demo admin/employee/client accounts
  - Seeds permission catalog and role-permission mappings
  - Seeds 3 demo client profiles (`acme-e-ticaret`, `nova-performance`, `mavi-sosyal`)
  - Links `client@socialtech.com` to `acme-e-ticaret`
  - Seeds demo CRM employee `crm@socialtech.com` and backup CRM owner `crm-backup@socialtech.com`
  - Seeds 4 demo CRM leads and starter timeline activities
  - Seeds active employee-client assignments for `project@socialtech.com`, `performance@socialtech.com`, and `social@socialtech.com`
  - Seeds 3 projects and 7 tasks mapped to seeded clients and employee assignees
- Auth implementation:
  - `POST /api/v1/auth/login` (email/password validation, bcrypt verify, legacy seed hash upgrade path)
  - `POST /api/v1/auth/refresh` (refresh JWT verification, DB hash check, rotation)
  - `POST /api/v1/auth/logout` (refresh token revoke)
  - `GET /api/v1/auth/me` (guarded user profile + permissions)
- Protected users/clients/admin-assignments/projects/tasks foundation:
  - Users: `GET /api/v1/users/me`, `GET /api/v1/users`, `GET /api/v1/users/:id`
  - Clients: `GET /api/v1/clients`, `GET /api/v1/clients/:id`, `GET /api/v1/clients/me`
  - Client Summary: `GET /api/v1/clients/:id/summary`
  - Admin Assignments: `GET /api/v1/admin/assignments`, `POST /api/v1/admin/assignments`, `PATCH /api/v1/admin/assignments/:id`, `PATCH /api/v1/admin/assignments/:id/deactivate`, `PATCH /api/v1/admin/assignments/:id/activate`
  - Projects: `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PATCH /api/v1/projects/:id`
  - Tasks: `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`
  - Task todos: `POST /api/v1/tasks/:id/todos`, `PATCH /api/v1/tasks/:taskId/todos/:todoId`, `PATCH /api/v1/tasks/:taskId/todos/:todoId/toggle`, `DELETE /api/v1/tasks/:taskId/todos/:todoId`
  - Admin Client Management:
    - `POST /api/v1/admin/clients`
    - `PATCH /api/v1/admin/clients/:id`
    - `PATCH /api/v1/admin/clients/:id/deactivate`
    - `PATCH /api/v1/admin/clients/:id/activate`
    - `POST /api/v1/admin/clients/:id/owner`
  - Admin Users Management:
    - Existing: `POST /api/v1/admin/users`
    - Added: `GET /api/v1/admin/users`, `GET /api/v1/admin/users/:id`, `PATCH /api/v1/admin/users/:id`, `PATCH /api/v1/admin/users/:id/deactivate`, `PATCH /api/v1/admin/users/:id/activate`, `PATCH /api/v1/admin/users/:id/reset-password`
    - `GET /api/v1/admin/users` now supports strict pagination/sorting:
      - `page` (default `1`, min `1`, max `10000`)
      - `limit` (default `20`, min `1`, max `100`)
      - `sortBy` (`createdAt`, `updatedAt`, `displayName`, `email`, `lastLoginAt`, `role`, `status`)
      - `sortOrder` (`asc`, `desc`; default `desc` on `createdAt`)
      - paginated response envelope: `data[]` + `meta{ page, limit, total, totalPages, hasNextPage, hasPreviousPage }`
      - stable order via secondary `id asc`
  - Admin user management actions are audit-logged via centralized `AuditLogService`:
    - `ADMIN_USER_CREATED`
    - `ADMIN_USER_UPDATED`

## 2026-05-05 Realtime Workspace Status

- Web APP workspace now runs with backend-native REST + Socket.IO together.
- Socket namespace: `/web-app-workspace`, room strategy: `project:{projectId}`, event: `workspace:update`.
- Event payloads now include entity snapshots for create/update flows (`message`, `revision`, `meeting-request`, `section`, `content-item`, `weekly-report`).
- Event contract includes `sequence` + `emittedAt`; frontend listeners use per-view `lastSequence` guards to ignore stale/out-of-order events.
- Admin/Employee and Client panels now use `updateQueryData` incremental RTK Query cache patching for workspace live sync instead of broad refetch.

## 2026-05-06 Revisions Hybrid Lifecycle Status

- Revision domain is hybrid:
  - WEB_APP service uses `WebAppWorkspaceRevision` lifecycle.
  - Non-WEB services use `Task(type=REVISION)` lifecycle.
- Client flow on WEB_APP is now production-aligned:
  - create revision request
  - `REQUESTED -> CANCELLED`
  - `READY_FOR_REVIEW -> APPROVED | REJECTED`
- PM/employee revision transitions are backend-enforced with actor-aware matrix and invalid moves return `400`.
- Employee `/employee/revizyonlar` now composes both sources (workspace revisions + non-web revision tasks) with shared filters.
- Client non-WEB revision tabs no longer depend on local-only action history; they read revision tasks from API.
    - `ADMIN_USER_DEACTIVATED`
    - `ADMIN_USER_ACTIVATED`
    - `ADMIN_USER_PASSWORD_RESET`
    - write path is transactional with business mutation
  - Admin Audit Logs Read API is active:
    - `GET /api/v1/admin/audit-logs`
    - `GET /api/v1/admin/audit-logs/:id`
    - admin-only, permission-protected (`audit_logs.read`)
    - filterable + paginated + sorted list response (`data + meta`)
    - sanitized metadata on read
  - Access-token invalidation:
    - `User.sessionInvalidatedAt` is active in auth/session flow
    - JWT `siv` claim snapshot is validated against DB session version
    - Backward-compatible fallback keeps pre-`siv` tokens checked by `iat <= sessionInvalidatedAt`
    - Old access tokens are invalidated after password change/reset, deactivate, role change, and `isActive=false` transitions
  - Controller-level guards: `JwtAuthGuard` + `PermissionsGuard`
  - Service-level authorization for owner/admin scope isolation and admin assignment management checks
  - Employee clients scope uses active assignment filtering (`clients.read.assigned`)
  - Employee project/task scope uses active assignment filtering; employee task updates are status-only for own assigned tasks in active assignment scope
  - Assignment API supports query filters (`employeeUserId`, `clientProfileId`, `isActive`, `scope`) and duplicate-safe create/reactivate behavior
- Authz e2e testing foundation:
  - Jest + ts-jest + supertest under `server/test/`
  - E2E runner: `server/test/run-e2e.cjs` (Prisma prepare + Jest execution)
  - DB safety guard in runner: strict test DB-name check (`_test`, `test_`, `testing`) with delimiter-aware matching
  - `ALLOW_E2E_DB_RESET=true` no longer bypasses DB-name safety check
  - Matrix suite currently covers users/clients/admin-summary/admin-assignments/projects/tasks/admin-user/admin-audit-logs/token-invalidation/crm flows
  - Latest authz pattern run: `8/8` suites, `187/187` tests passed
- Token strategy:
  - access token in response body (Bearer usage)
  - refresh token in HttpOnly cookie
  - refresh token persistence as hash only (`RefreshToken.tokenHash`)
- Foundation modules: `health`, `auth`, `users`, `clients`, `audit-log`, `admin-audit-logs`, `admin-assignments`, `admin-users`, `admin-summary`, `projects`, `tasks`
- Health endpoint: `GET /api/v1/health`
- Validation status:
  - `npm run prisma:generate` passed
  - `npm run prisma:migrate:deploy` passed
  - `npm run prisma:seed` passed
  - `npm run build` passed
  - `npm run check` passed
  - `npm run typecheck:spec` passed
  - `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (`8/8 suites`, `187/187 tests`, test DB name: `socialtech_test`)
  - `adminandemployeePanel npm run build` / `npm run check` / `npm run test:run` passed (`19` test files, `134/134` tests)
  - `clientPanel npm run build` / `npm run check` / `npm test` passed (`1` test file, `6/6` tests)
  - manual auth flow tests passed (`login`, `me`, `refresh`, `logout`, `logout` sonrası `refresh=401`)
  - `server/tsconfig.build.json` uses `incremental: false` to avoid missing-module runtime issues from stale/incomplete dist output

## TikTok Ads Faz 0 — Tamamlanan Contract (2026-05-27)

TikTok Ads Faz 0 discovery tamamlandı. Detaylı karar DECISIONS.md'de mevcut. Özet:
- `TIKTOK_ADS` PurchasedServiceKey zaten schema'da mevcut.
- V1 kapsam: Read-only reporting, manuel token girişi, no campaign management.
- TikTok Marketing API v1.3 kullanılacak. Base URL: `https://business-api.tiktok.com/open_api/v1.3/`
- Token stratejisi: Long-lived access_token (365 gün), AES-256-GCM encrypted at rest.
- 5 yeni Prisma model: `ClientTikTokAdsConfig`, `ClientTikTokAdsCredential`, `TikTokAdsDailyInsight`, `TikTokAdsSyncLog`, `TikTokAdsReport`.
- Yeni env vars: `TIKTOK_ADS_APP_ID`, `TIKTOK_ADS_APP_SECRET`, `TIKTOK_ADS_TOKEN_ENCRYPTION_KEY`, `TIKTOK_ADS_API_VERSION`, `TIKTOK_ADS_SYNC_TTL_MINUTES`.
- Faz 1 implementation contract hazır.

Uygulama durumu:
- TikTok Ads Faz 1 tamamlandı: backend module/controller/service/token service, `ClientTikTokAdsConfig`, `ClientTikTokAdsCredential`, permissions/seed, admin ClientDetail status card, client portal connection-aware empty state.
- TikTok Ads Faz 2 tamamlandı: admin manual connect, encrypted token storage, connection summary, official advertiser info based connection test, disconnect, service-level permission checks, and admin ClientDetail connection management UI.
- TikTok Ads Faz 3 tamamlandı: `TikTokAdsDailyInsight` + `TikTokAdsSyncLog` snapshot modeli, manual sync, account/campaign/adgroup/ad insight ingestion, admin/assigned/client summary-campaign-insights read API, TTL-gated own client refresh, and admin ClientDetail performance summary integration.
- TikTok Ads Faz 4 tamamlandı: client portal TikTok dashboard ve service tab workspace mock/static datadan API-driven akışa taşındı; campaigns, video creatives, hook tests, audiences, pixel/events safe-state, UGC script tasks ve optimization notes sekmeleri own-client endpointleri ve client-visible tasks ile besleniyor.
- TikTok Ads Faz 5 tamamlandı: backend global admin client list endpointi ve admin panel `/tiktok-ads` ekranı eklendi; connection/config/test/sync/disconnect aksiyonları global müşteri listesi üzerinden yönetiliyor.
- TikTok Ads Faz 6 tamamlandı: employee panelde `/employee/tiktok-ads` assigned-scope workspace eklendi; Social/Performance/Designer rolleri için campaigns, performance, video creatives, report notes, approvals ve pixel safe-state sekmeleri backend assigned TikTok endpointleri + project/task/workspace mesaj contract'ı ile çalışıyor.
- TikTok Ads Faz 7 tamamlandı: task-merkezli TikTok approval type'ları, `tiktokAds.approvals.create.assigned` / `tiktokAds.creatives.manage.assigned` permission kontrolleri, client own approval response ve client portal UGC/script approval queue + creative preview akışı eklendi.
- TikTok Ads Faz 8 tamamlandı: admin sync logları + retry endpoint/UI, assigned employee TTL-safe sync endpoint/workspace aksiyonu, sync error catalog hardening ve sync log/TTL e2e coverage eklendi.
- TikTok Ads Faz 9 tamamlandı: `TikTokAdsReport` entity/migration, admin ve assigned draft/publish endpoints, own client report visibility, publish -> acknowledgement task bridge, admin/employee/client panel rapor UI'ları ve regression coverage eklendi.
- TikTok Ads Faz 10 tamamlandı: client-safe sync/report error yüzeyi sertleştirildi, admin/assigned/own report CSV+JSON export endpointleri ve UI indirme aksiyonları eklendi, own report visibility `PUBLISHED + clientVisible` ile sınırlandı, assigned report endpointleri backend `reports.read/manage` guard'larıyla hizalandı ve authz/state edge-case coverage genişletildi.
- Active admin endpoints:
  - `GET /api/v1/admin/tiktok-ads/clients`
  - `GET /api/v1/admin/tiktok-ads/sync-logs`
  - `GET /api/v1/admin/clients/:clientId/tiktok-ads/config`
  - `PATCH /api/v1/admin/clients/:clientId/tiktok-ads/config`
  - `GET /api/v1/admin/clients/:clientId/tiktok-ads/connection`
  - `POST /api/v1/admin/clients/:clientId/tiktok-ads/connect`
  - `POST /api/v1/admin/clients/:clientId/tiktok-ads/test`
  - `DELETE /api/v1/admin/clients/:clientId/tiktok-ads/disconnect`
  - `POST /api/v1/admin/clients/:clientId/tiktok-ads/sync`
  - `POST /api/v1/admin/clients/:clientId/tiktok-ads/sync/retry`
  - `GET /api/v1/admin/clients/:clientId/tiktok-ads/summary`
  - `GET /api/v1/admin/clients/:clientId/tiktok-ads/campaigns`
  - `GET /api/v1/admin/clients/:clientId/tiktok-ads/insights`
  - `GET /api/v1/admin/clients/:clientId/tiktok-ads/reports`
  - `POST /api/v1/admin/clients/:clientId/tiktok-ads/reports`
  - `PATCH /api/v1/admin/tiktok-ads/reports/:reportId`
  - `GET /api/v1/admin/tiktok-ads/reports/:reportId/export?format=json|csv`
- Active assigned/own read endpoints:
  - `GET /api/v1/tiktok-ads/clients/:clientId/config`
  - `GET /api/v1/tiktok-ads/clients/:clientId/summary`
  - `GET /api/v1/tiktok-ads/clients/:clientId/campaigns`
  - `GET /api/v1/tiktok-ads/clients/:clientId/insights`
  - `POST /api/v1/tiktok-ads/clients/:clientId/sync`
  - `GET /api/v1/tiktok-ads/clients/:clientId/reports`
  - `POST /api/v1/tiktok-ads/clients/:clientId/reports`
  - `PATCH /api/v1/tiktok-ads/reports/:reportId`
  - `GET /api/v1/tiktok-ads/reports/:reportId/export?format=json|csv`
  - `GET /api/v1/clients/me/tiktok-ads/config`
  - `GET /api/v1/clients/me/tiktok-ads/summary`
  - `GET /api/v1/clients/me/tiktok-ads/campaigns`
  - `GET /api/v1/clients/me/tiktok-ads/insights`
  - `GET /api/v1/clients/me/tiktok-ads/reports`
  - `GET /api/v1/clients/me/tiktok-ads/reports/:reportId/export?format=json|csv`
  - `POST /api/v1/clients/me/tiktok-ads/sync`
- Connection test uses TikTok API for Business `GET /open_api/v1.3/advertiser/info/` with `Access-Token` and `advertiser_ids`.
- Reporting sync uses TikTok API for Business reporting + campaign catalog reads, stores daily rows by level (`ACCOUNT`, `CAMPAIGN`, `ADGROUP`, `AD`), and exposes read-only aggregates for V1 dashboards.

## Amazon Ads Faz 1 — Backend Foundation (2026-05-27)

Amazon Ads Faz 0 discovery contract tamamlandı; Faz 1 foundation uygulandı. Özet:
- Prisma foundation: `AmazonAdsConnectionStatus`, `AmazonAdsRegion`, `ClientAmazonAdsConfig`, `ClientAmazonAdsCredential`.
- Config alanları Amazon profile/account contract’ına göre tutulur: `profileId`, `advertiserAccountId`, `marketplaceId`, `region`, `countryCode`, `currencyCode`, `timezone`, `accountType`, `accountName`, `validPaymentMethod`.
- Backend module: `server/src/amazon-ads/` admin read/update, assigned read ve own client safe config endpointlerini sağlar.
- Permission seed: `amazonAds.config.*` ile reporting/sync/approval/note/product-collaboration slug’ları role mapping’e eklendi.
- Admin Clients create/edit formu `AMAZON_ADS` seçilince Amazon config alanlarını gösterir; ClientDetail Amazon Ads config/status kartı eklenmiştir.
- Client portal Amazon Ads dashboard artık config/connection yokken mock metrik göstermeyip connection-aware empty state döndürür.
- Faz 1 reporting sync, OAuth code exchange ve global admin Amazon panelini kapsamaz; bunlar sonraki Amazon Ads fazlarına bırakıldı.

Active Amazon Ads endpoints:
- `GET /api/v1/admin/clients/:clientId/amazon-ads/config`
- `GET /api/v1/admin/clients/:clientId/amazon-ads/connection`
- `PATCH /api/v1/admin/clients/:clientId/amazon-ads/config`
- `GET /api/v1/amazon-ads/clients/:clientId/config`
- `GET /api/v1/clients/me/amazon-ads/config`

## Amazon Ads Faz 2 — LwA OAuth ve Token Connection Management (2026-05-27)

Amazon Ads Faz 2 ile müşteri bazlı connection lifecycle eklendi. Özet:
- Backend `AmazonAdsTokenService`, `AMAZON_ADS_TOKEN_ENCRYPTION_KEY` ile AES-256-GCM refresh/access token encryption ve SHA-256 token hash üretir; admin response’larında raw/encrypted token alanları sızdırılmaz.
- Backend `AmazonAdsApiService`, LwA authorization URL/code exchange/refresh-token grant, regional `/v2/profiles` lookup ve API error normalization yüzeyi sağlar.
- Admin connection actions: OAuth URL başlatma, OAuth code exchange, manual refresh token connect, stored/transient refresh token ile test connection ve disconnect endpointleri eklendi.
- Test connection başarılı olunca profile/account/marketplace/region metadata config’e yazılır ve connection `CONNECTED` olur; API/auth/permission/rate-limit hatalarında status `ERROR` olarak normalize edilir.
- Admin ClientDetail Amazon Ads kartı artık OAuth URL/code, manual refresh token, test connection, disconnect ve config update aksiyonlarını destekler.
- Client portal Amazon Ads dashboard connected durumda readonly profile/advertiser/marketplace/region/status bilgisini gösterir.

Additional active Amazon Ads endpoints:
- `GET /api/v1/admin/clients/:clientId/amazon-ads/oauth/start`
- `POST /api/v1/admin/clients/:clientId/amazon-ads/oauth/exchange`
- `POST /api/v1/admin/clients/:clientId/amazon-ads/connect/manual`
- `POST /api/v1/admin/clients/:clientId/amazon-ads/test-connection`
- `POST /api/v1/admin/clients/:clientId/amazon-ads/disconnect`

## Amazon Ads Faz 3 — Reporting v3 Async Sync ve Snapshot Read Model (2026-05-27)

Amazon Ads Faz 3 ile read-only Reporting v3 lifecycle ve günlük snapshot read model eklendi. Özet:
- Prisma reporting foundation: `AmazonAdsDailyInsight`, `AmazonAdsSyncLog`, `AmazonAdsInsightLevel`, `AmazonAdsProductType`, `AmazonAdsSyncStatus`.
- Backend `AmazonAdsApiService`, LwA refresh token ile access token yenileyip Reporting v3 async report create/poll/download akışını çalıştırır; campaign, product ve search-term satırlarını normalize eder.
- Backend `AmazonAdsService`, manual sync endpointinde refresh token’ı decrypt eder, snapshot satırlarını yazar, account-level aggregate üretir ve sync log/request/status metadata’sını saklar.
- Admin, assigned employee ve client own read endpoints summary/campaigns/products/insights yüzeylerini snapshot’tan döndürür; client/admin UI mock performans metrikleri yerine API-driven summary/read model kullanır.
- Admin ClientDetail Amazon Ads kartı performans özeti ve manual sync aksiyonu gösterir; client portal Amazon Ads dashboard connected durumda gerçek summary/campaign/product/search-term verisiyle çalışır.
- Amazon Ads Faz 4 tamamlandı: client portal service-tab Amazon workspace mock içerikten API-driven tab yapısına taşındı; campaigns/products/search terms/approvals/notes alanları Amazon read-model endpointleriyle beslenir hale geldi.
- Amazon Ads Faz 5 tamamlandı: admin global `/amazon-ads` paneli ile tüm Amazon Ads müşterileri için bağlantı/test/sync/disconnect/onay talebi aksiyonları merkezi yönetim modeline alındı.
- Amazon Ads Faz 6 tamamlandı: `/employee/amazon-ads` assigned-scope workspace eklendi; Social/Performance/Designer rollerine göre kampanya, performans, creative, report ve approval aksiyonları role-aware hale getirildi.
- Amazon Ads Faz 7 tamamlandı: approval enum/contract ve creative collaboration katmanı backend/frontend arasında hizalandı; client approve/revise/ack akışı Amazon type setiyle standardize edildi.
- Amazon Ads Faz 8 tamamlandı: sync log observability, retry endpointi, assigned TTL/cooldown normalizasyonu ve client-safe sync error yüzeyi production-grade hale getirildi.
- Amazon Ads Faz 9 tamamlandı: `AmazonAdsReport` entity/migration, admin+assigned draft/publish lifecycle endpointleri, own client report görünürlüğü ve publish->ack task bridge’i devreye alındı; admin/employee/client panel rapor yüzeyleri read-model tabanlı API akışına taşındı.
- Amazon Ads Faz 10 tamamlandı: admin/assigned/own report CSV+JSON export endpointleri eklendi; own report visibility `PUBLISHED + clientVisible` ile sertleştirildi, assigned report surface `reports.read/manage` guard’larıyla hizalandı, client-safe report not-found contract’ı ve authz/state edge-case coverage genişletildi.

Additional active Amazon Ads reporting endpoints:
- `GET /api/v1/admin/clients/:clientId/amazon-ads/summary`
- `GET /api/v1/admin/clients/:clientId/amazon-ads/campaigns`
- `GET /api/v1/admin/clients/:clientId/amazon-ads/products`
- `GET /api/v1/admin/clients/:clientId/amazon-ads/insights`
- `POST /api/v1/admin/clients/:clientId/amazon-ads/sync`
- `GET /api/v1/amazon-ads/clients/:clientId/summary`
- `GET /api/v1/amazon-ads/clients/:clientId/campaigns`
- `GET /api/v1/amazon-ads/clients/:clientId/products`
- `GET /api/v1/amazon-ads/clients/:clientId/insights`
- `POST /api/v1/amazon-ads/clients/:clientId/sync`
- `GET /api/v1/admin/clients/:clientId/amazon-ads/reports`
- `POST /api/v1/admin/clients/:clientId/amazon-ads/reports`
- `PATCH /api/v1/admin/amazon-ads/reports/:reportId`
- `GET /api/v1/admin/amazon-ads/reports/:reportId/export?format=json|csv`
- `GET /api/v1/amazon-ads/clients/:clientId/reports`
- `POST /api/v1/amazon-ads/clients/:clientId/reports`
- `PATCH /api/v1/amazon-ads/reports/:reportId`
- `GET /api/v1/amazon-ads/reports/:reportId/export?format=json|csv`
- `GET /api/v1/clients/me/amazon-ads/summary`
- `GET /api/v1/clients/me/amazon-ads/campaigns`
- `GET /api/v1/clients/me/amazon-ads/products`
- `GET /api/v1/clients/me/amazon-ads/insights`
- `GET /api/v1/clients/me/amazon-ads/reports`
- `GET /api/v1/clients/me/amazon-ads/reports/:reportId/export?format=json|csv`

## Social Media Faz 1 — Backend Foundation (2026-05-28)

Social Media Faz 0 discovery contract sonrası organic content operations için ilk backend foundation uygulandı. Özet:
- Prisma foundation: `SocialMediaGoal`, `SocialMediaConnectionStatus`, `ClientSocialMediaConfig`.
- Config alanları müşteri bazlı organik kanal/strateji bilgilerini tutar: Instagram username/account ID, Facebook page ID, TikTok username, LinkedIn page URL, content frequency, primary goal, tone of voice, hashtags, notes.
- Backend module: `server/src/social-media/` admin/assigned config read, admin config update, admin/assigned summary ve own-client safe config/summary endpointlerini sağlar.
- Summary V1 mock veri dönmez; `ClientPurchasedService`, `ClientSocialMediaConfig`, `Project.serviceKey`, `Task`, `TaskTodo` ve `ProjectFile` kaynaklarından read model üretir. Faz 2 itibarıyla `SocialMediaPost` da summary metrics/contentPlan kaynaklarına dahil edildi; insight/report domainleri sonraki fazlara bırakıldı.
- Permission seed: `socialMedia.config.*` ve `socialMedia.summary.*` slug’ları eklendi; Project Manager, Social Media Specialist ve Designer assigned read/summary scope alır; client owner/member own read/summary scope alır.
- Admin Clients create/edit formu `SOCIAL_MEDIA` seçilince Social Media config alanlarını gösterir ve config endpointine kaydeder.

Active Social Media endpoints:
- `GET /api/v1/social-media/clients/:clientId/config`
- `PATCH /api/v1/social-media/clients/:clientId/config`
- `GET /api/v1/social-media/clients/:clientId/summary`
- `GET /api/v1/clients/me/social-media/config`
- `GET /api/v1/clients/me/social-media/summary`
- Backward-compatible aliases: `GET /api/v1/client/social-media/config`, `GET /api/v1/client/social-media/summary`

## Social Media Faz 2 — Content Calendar Backend + UI Consumption (2026-05-28)

Faz 2 organik içerik takvimini gerçek domain modeliyle başlattı ve UI tüketim katmanına bağladı:
- Prisma foundation: `SocialMediaPost`, `SocialMediaPostAsset`, `SocialMediaPlatform`, `SocialMediaPostType`, `SocialMediaPostStatus`.
- Assets yeni dosya modeli açmadan mevcut `ProjectFile` üzerinden `SocialMediaPostAsset` join modeliyle bağlanır.
- Backend Social Media modülü post CRUD, client-visible own read ve calendar read endpointlerini sağlar.
- Permission seed: `socialMedia.posts.read/manage.*`, `socialMedia.posts.assets.manage.assigned`, `socialMedia.posts.read.own`; PM/Social assigned manage, Designer assigned asset manage, client own visible read.
- Summary read model artık `SocialMediaPost` metrics/upcoming/recent content plan kaynaklarını da içerir.
- Status transition guard V1: `IDEA -> DRAFT -> DESIGN/WAITING_APPROVAL -> APPROVED/REJECTED/REVISION_REQUIRED -> SCHEDULED/PUBLISHED/CANCELLED` akışı servis katmanında doğrulanır.
- Admin/employee frontend `features/socialMedia/*` RTK Query slice ile post list/create/update/delete endpointlerini tüketir; `/social-media` admin rotası ve `/employee/icerik-takvimi` shared content calendar liste/form bileşenini kullanır.
- Client Portal `features/socialMedia/*` own posts/calendar hook’larıyla `social-media-dashboard` ve Social Media `content-calendar` / `pending-approvals` / `published-content` tablarını yalnızca `clientVisible=true` kayıtlarla API-driven gösterir.

Active Social Media post endpoints:
- `GET /api/v1/social-media/clients/:clientId/posts`
- `POST /api/v1/social-media/clients/:clientId/posts`
- `GET /api/v1/social-media/posts/:id`
- `PATCH /api/v1/social-media/posts/:id`
- `DELETE /api/v1/social-media/posts/:id`
- `POST /api/v1/social-media/posts/:id/assets`
- `DELETE /api/v1/social-media/posts/:id/assets/:assetId`
- `GET /api/v1/clients/me/social-media/posts`
- `GET /api/v1/clients/me/social-media/posts/:id`
- `GET /api/v1/clients/me/social-media/calendar`
- Backward-compatible aliases: `/api/v1/client/social-media/posts*`, `/api/v1/client/social-media/calendar`

## Social Media Faz 3 — Client Panel API-Driven Dashboard (2026-05-28)

Faz 3 client portal Social Media yüzeyini config/summary/calendar kaynaklarına genişletti. Özet:

- Own-client summary artık post/asset read modelinde yalnızca `clientVisible=true` postlar ve `CLIENT_VISIBLE` project files döndürür; admin/assigned summary operasyonel tam görünürlüğünü korur.
- Client Portal `features/socialMedia/*` own config + summary RTK Query hookları ve normalizer contract’ı içerir.
- `social-media-dashboard` KPI, strateji, ajans notu, kreatif ve içerik takvimi alanlarını API’den render eder; static DM/trend/competitor fallback blokları kaldırıldı.
- `ServiceTabPage` Social Media sekmeleri artık generic static service-page renderer’a düşmez; content calendar, pending approvals, published content, creatives ve agency notes dedicated Social Media workspace ile API/empty-state driven çalışır.
- Pending approvals tabı mevcut client task approval sistemiyle `projectServiceId="social-media"` tasklarını gösterir ve approve/revision aksiyonlarını kullanır.

## Social Media Faz 4 — Admin Social Media Paneli (2026-05-28)

Faz 4 admin/employee panel tarafında global Social Media operasyon görünümünü API-driven hale getirdi. Özet:

- Backend `GET /api/v1/social-media/clients` endpointi eklendi; yalnızca admin `socialMedia.summary.read.any` ile erişebilir.
- Global list response aktif `SOCIAL_MEDIA` hizmetli müşteriler için config/state, planned/published/pending/rejected/overdue post metrikleri, recent/upcoming postlar, creative assets, Social Media/Designer atamaları ve risk status döndürür.
- Admin `/social-media` sayfası global KPI, müşteri risk listesi, selected-client detay paneli, config edit modalı ve mevcut content calendar create/list akışını tek ekranda sunar.
- `ClientDetail` içine Social Media section eklendi; config, post counts, upcoming/recent posts, creative assets, pending approvals, assignment visibility ve report no-source state API verisiyle render edilir.
- Admin frontend `features/socialMedia/*` slice’ı global clients + client summary hooklarıyla genişledi; config update cache invalidation Social Media summary/list tag’lerini de invalid eder.
- Backend authz e2e artık admin global list, post count/overdue summary, non-admin global endpoint block ve response leak guard senaryolarını kapsar.

Active Social Media admin overview endpoint:
- `GET /api/v1/social-media/clients`

## Social Media Faz 5 — Employee Social Media Workspace (2026-05-28)

Faz 5 employee panelde assigned Social Media operasyon çalışma alanını açtı. Özet:

- Employee `/employee/social-media` rotası eklendi; sidebar entry Project Manager, Social Media Specialist ve Designer rollerinde görünür.
- `SocialMediaWorkspace` assigned client listesi, summary KPI’ları, content calendar, posts, creatives, approvals, reports ve messages tablarını rol bazlı gösterir.
- Workspace existing Social Media summary/posts endpointlerini ve projects/tasks RTK Query hooklarını kullanır; aktif `social-media` purchased service olmayan assigned client’lar listelenmez.
- Social Media approval task create bridge’i shared `POST /api/v1/tasks` endpointine bağlandı; assigned employee için `socialMedia.approvals.create.assigned` permission’ı reklam approval pattern’iyle aynı guard hattına alındı.
- Designer creative asset action `socialMedia.creatives.manage.assigned` permission’ını Social Media post asset manage guard’ında kabul eder.

Active Social Media employee workspace route:
- `/employee/social-media`

## Social Media Faz 6 — Approval + Creative Flow (2026-05-29)

Faz 6 Social Media approval lifecycle’ı shared task approval altyapısına bağladı. Özet:

- `MetaAdsApprovalType` enumu Social Media approval değerleriyle genişledi: post, creative, caption, calendar ve report acknowledgement.
- Client approval response artık `SOCIAL_MEDIA` project serviceKey’li pending approval tasklarını kabul eder.
- Linked Social Media post approval response sonucunda post status güncellenir: approved -> `APPROVED`, rejected/changes requested -> `REVISION_REQUIRED`.
- Rejection/revision note mevcut shared task flow ile follow-up revision task üretir.
- Employee workspace calendar approval tasklarını `SOCIAL_MEDIA_CALENDAR_APPROVAL`, post approval tasklarını `SOCIAL_MEDIA_POST_APPROVAL` olarak oluşturur ve post `approvalTaskId` linkini kurar.
- Client Social Media approvals tabı yeni Social Media approval type değerlerini normalize eder ve approve/revision mutation akışını kullanır.
- Faz 6 öncesi manual role matrix turu Acme seed fixture’ı üzerinde Social Media Specialist, Designer, Project Manager ve out-of-scope görünmezliğiyle doğrulandı.

Active Social Media approval bridge:
- `POST /api/v1/tasks` with `approvalRequired=true` and `approvalType=SOCIAL_MEDIA_*`
- `PATCH /api/v1/tasks/:taskId` client approval response
- `PATCH /api/v1/social-media/posts/:postId` post approval task link/status update

Planned next backend phases:
- Broader domain endpoint authorization rollout (beyond users/clients/admin-assignments/projects/tasks)
- Forced password change on first login flow
- Frontend audit log view integration for admin panel
- Audit log actor/target summary join on read API
- Audit log export endpoints
- Audit retention/purge policy
- Proxy-aware IP extraction / trust proxy configuration
- Audit logging rollout for broader domain actions
- Frontend admin employee management integration
- Project-manager project/task manage policy decision
- Assignment concurrency/race-condition e2e coverage (parallel create/update conflict scenarios)
- Broader backend e2e/integration coverage beyond current authz matrix

## Data Model Summary

Frontend mock data (still active until API integration):
- From `adminandemployeePanel/src/app/data/mockData.ts` (mock, no schema enforcement):
  - `clients` — id, name, industry, monthlyValue, contractStart/End, status, paymentStatus, services[], contactPerson, email, phone, activeProjects, totalSpent, riskLevel
  - `employees`, `projects`, `tasks`, `approvals` — also present in mockData
- From `clientPanel/src/app/data/service-pages.ts`:
  - `serviceLabels` / `ServiceId` — 13 active portal services
  - `profiles` — per-service mock KPIs, summaries, agency comments, action prompts, activity, and tab content
  - Client action history is currently browser `localStorage` based (`client-actions.ts`)

Backend Prisma data model (foundation scope):
- `User`: account type (`ADMIN | EMPLOYEE | CLIENT`), fixed role enum, status, optional `clientProfileId`, optional `displayName`, optional `lastLoginAt`, optional `sessionInvalidatedAt`
  - Admin user activation/deactivation is handled via `User.status` (`ACTIVE`/`INACTIVE`) and API-level `isActive` mapping in admin users management responses
- `RefreshToken`: hashed refresh token persistence, expiration, and revocation metadata used by live refresh/logout flow
- `ClientProfile`: client identity with unique `slug` and lifecycle `status`
- `AuditLog`: actor-based audit event records
- `AuditLog` write path is active for admin user lifecycle actions (transactional with mutation path) and read path is active via admin-only audit endpoints.
- `Permission`: permission catalog table (slug + description)
- `RolePermission`: role-to-permission mapping table for hybrid RBAC expansion
- `EmployeeClientAssignment`: employee-to-client assignment mapping with `scope`, `isActive`, and indexed lookup fields
- `EmployeeClientAssignmentScope`: assignment scope enum (`PROJECT`, `PERFORMANCE`, `SOCIAL_MEDIA`, `DESIGN`, `DEVELOPMENT`, `SUPPORT`, `SEO`)
- `Project`: client-linked project entity with lifecycle/status/priority/date fields and client-scoped slug uniqueness
- `Task`: project-linked task entity with status/priority/assignee fields
- `TaskTodo`: task checklist item with visibility (`INTERNAL`, `CLIENT_VISIBLE`), completion metadata, and sort order
- `Project.serviceKey`: project-to-service relationship for purchased-service-aware workflows
- `ClientPurchasedService`: client service entitlements with status and lifecycle dates
- `ProjectStatus`: `PLANNED | IN_PROGRESS | REVIEW | COMPLETED | ON_HOLD`
- `TaskStatus`: `TODO | IN_PROGRESS | REVIEW | DONE | BLOCKED`
- `Priority`: `LOW | MEDIUM | HIGH | URGENT`
- `ClientStatus`: `ACTIVE | INACTIVE | SUSPENDED`

Current protected read behavior:
- User/client responses are sanitized; auth-sensitive fields are excluded (`passwordHash`, refresh token/hash fields).
- Object-level authorization is enforced in services for `users/:id`, `clients/:id`, and `clients/me`.
- Employee access to `/clients` and `/clients/:id` is assignment-based (`isActive=true`) for accounts with `clients.read.assigned`.
- `/clients` list is envelope-shaped (`data + meta`) and validates `page`, `limit`, `sortBy`, `sortOrder`, `status`, `search`.
- `/clients/:id/summary` returns client + projects/tasks aggregate overview with recent scoped items (`max 5`) and `meta.generatedAt`.
- Admin assignment responses are sanitized to minimal employee/client summaries; auth-sensitive fields are excluded.
- Project/task responses are authorization-scoped by role:
  - admin: full project/task scope
  - employee: active-assignment-scope read, own-assigned status-only task update
  - client: own-client-scope read; todo payload is filtered to `CLIENT_VISIBLE` only

Demo seed baseline (fresh reset):
- `users=9` (local environments may exceed this after admin user creation tests)
- `permissions=43`
- `role_permissions=126`
- `client_profiles=3`
- `active_employee_client_assignments=7`
- `projects=3`
- `tasks=7`

## Important Conventions

- UI language is Turkish (labels, page names, variable names in Turkish)
- Brand color: `#AAFF01` (neon green) on dark `#131313` background
- Active nav item: `bg-primary/10 text-primary` (ghost tint — consistent across all panels)
- Muted text: `#A0A0A0`
- Card backgrounds: `#1A1A1A`
- All components use shadcn-style Radix UI primitives from `src/app/components/ui/`
- Lucide React for all icons
- Tailwind v4 syntax (no `tailwind.config.js` — config via CSS)
- Vite asset resolver: `figma:asset/` prefix maps to `src/assets/`

## Do Not Touch Without Reason

- `adminandemployeePanel/vite.config.ts` — contains Figma asset resolver plugin
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx` — RBAC foundation
- `adminandemployeePanel/src/app/routes.tsx` — all route definitions
- `adminandemployeePanel/src/styles/` — global CSS cascade

## Common Commands

From `adminandemployeePanel/package.json` and `clientPanel/package.json`:
```
npm run dev        # start dev server (Vite)
npm run build      # production build
npm run typecheck  # TypeScript project check (tsc --noEmit)
npm run preview    # preview production build
npm run check      # typecheck + build gate
```
Lint/format scripts are intentionally not added yet in this pass (ESLint/Prettier deferred).
Frontend auth integration dependency baseline includes `@reduxjs/toolkit`, `react-redux`, and `redux@5` in both frontend apps.

From `server/package.json`:
```bash
npm run check                  # typecheck + seed typecheck + spec typecheck + build
npm run test:e2e:prepare       # e2e db safety check + prisma generate/migrate/seed
npm run test:e2e               # full backend e2e suite
npm run test:e2e:authz         # backend authz e2e suites (users/clients/admin-summary, assignments, projects/tasks, admin-users, audit-logs, token invalidation, crm)
DATABASE_URL=postgresql://user:pass@localhost:5432/socialtech_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```
`run-e2e.cjs` now requires test DB naming (`_test`, `test_`, or `testing` in DB name); `ALLOW_E2E_DB_RESET=true` does not bypass this requirement.
Latest reported checks: `adminandemployeePanel npm run check`, `clientPanel npm run check`, and `server npm run build/check` passed. End-to-end runtime UI QA remains a manual validation step.
## Update - 2026-04-29 (Client Summary + ClientDetail Integration)

### Backend Architecture
- `server/src/clients/clients.controller.ts` now exposes `GET /api/v1/clients/:id/summary`.
- `server/src/clients/clients.service.ts` now provides aggregated client overview output:
  - client core profile
  - project status counts + recent projects (max 5)
  - task status counts + recent tasks (max 5, scoped to the client’s projects)
  - response metadata with generation timestamp
- Summary authorization follows existing object-level visibility and adds explicit project/task read permission gates.

### Admin Panel Frontend
- `adminandemployeePanel` `ClientDetail` page now consumes summary response directly.
- Client overview is no longer computed from separate projects/tasks list queries.
- UI supports loading, error, invalid UUID, not-found, and empty recent sections with existing design language preserved.

### RTK Query / API Integration
- `clientsApi` includes `useGetClientSummaryQuery` for `/clients/:id/summary`.
- `clientsTypes` and `clientsUtils` were extended for summary payload typing and normalization/mapping.
- Status/priority label mapping and safe parsing remain centralized in client feature utils.

### Testing
- Backend authz suite includes client summary access/security and response-shape validations:
  - admin/client/assigned employee allow
  - unassigned employee deny
  - unauthenticated 401
  - count fields numeric
  - recent arrays max 5
  - cross-tenant leak checks
  - fail-closed validation when admin lacks `tasks.read.any`
- Backend result: `6/6 suites`, `147/147 tests` passed.
- Frontend ClientDetail tests were updated to summary-based flow:
  - loading/error/invalid UUID/not found/success/empty/sensitive-field coverage
- Frontend result: `9 test files`, `71/71 tests` passed.

## Update - 2026-04-30 (Admin Summary + Clients Query Contract Hardening)

### Backend Architecture
- `GET /api/v1/admin/summary` is productionized for admin KPI cards and no longer exposes legacy/extra fields.
- `GET /api/v1/clients` server-side pagination/filter/sorting contract is validated and authz-tested with role-scope-safe envelope behavior.
- Backend authz result after latest hardening: `6/6 suites`, `152/152 tests` passed.

### Admin Panel Frontend
- Dashboard no longer derives KPI data from list endpoints; it only consumes `/admin/summary`.
- Clients page uses backend query params (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `status`) and backend `meta` for paging.
- Stale-data pagination regression was fixed by syncing page with `currentData.meta.page`.

### RTK Query / API Integration
- `dashboardApi` now applies `transformResponse` with `normalizeAdminSummaryResponse`.
- `dashboardUtils` normalize layer guards malformed payloads (missing nested nodes, non-numeric counts, invalid date fields).
- `clientsApi` remains envelope-first and UI query-driven (no local full-list filtering fallback path in page logic).

### Testing
- Dashboard tests cover loading/error/403/success/fallback/retry/sensitive field scenarios and legacy-field independence.
- Clients tests cover initial query contract, filter/sort/search params, backend-meta pagination, and stale-data transition regression.
- Frontend checkpoint: `10` test files, `82/82` tests passed.

### Known Risks / Notes
- Clients and Dashboard frontend tests are currently hook-mocked rather than store+baseApi integration-level.
- Dashboard normalize layer prefers fail-safe zero/default behavior; fail-fast policy decision remains planned.
- Clients search is currently non-debounced.
- Radix Dialog ref warning logs continue in Vitest output (non-blocking).
## 2026-04-29 Update Snapshot

### Backend Architecture
- Admin Client Management modülü eklendi: `server/src/admin-clients/*`.
- Admin client CRUD + owner assign endpointleri canlı:
  - `POST /api/v1/admin/clients`
  - `PATCH /api/v1/admin/clients/:id`
  - `PATCH /api/v1/admin/clients/:id/deactivate`
  - `PATCH /api/v1/admin/clients/:id/activate`
  - `POST /api/v1/admin/clients/:id/owner`
- Owner mode yaklaşımı:
  - `NONE`
  - `CREATE`
  - `LINK_EXISTING`
- `LINK_EXISTING` akışında güvenlik:
  - başka profile bağlı user -> 409
  - `sessionInvalidatedAt` güncellenir
  - aktif refresh tokenlar revoke edilir

### Admin Panel Frontend
- `adminandemployeePanel` Clients ekranı backend CRUD + owner assign ile tam entegre.
- `LINK_EXISTING` için manuel UUID yerine searchable owner picker kullanılıyor.
- Owner picker davranışı:
  - `displayName + email` listesi
  - seçili kullanıcı özeti
  - temizleme aksiyonu
  - loading/error/empty state

### RTK Query / API Integration
- Clients mutasyonları sonrası cache invalidation:
  - `Clients`
  - `Clients summary`
  - `AuditLogs`
  - `AdminSummary`
- Integration test katmanı mevcut:
  - `baseApi.clients.integration.test.tsx`
  - `baseApi.dashboard.integration.test.tsx`
- Clients search debounce:
  - `275ms`
  - search değişince `page=1`
  - boş search query paramı gönderilmez

### Auth & RBAC Summary
- Backend tarafında client management için route-level `clients.manage` + service-level admin check birlikte uygulanır.
- Frontend owner picker’da `users.manage` yoksa `LINK_EXISTING` opsiyonu disable edilir.
- Least-privilege açısından owner picker halen admin users endpointine bağlıdır (ayrı candidate endpoint planned).

### Audit Logging
- Client yönetimi aksiyonları transaction içi audit log yazar:
  - `ADMIN_CLIENT_CREATED`
  - `ADMIN_CLIENT_UPDATED`
  - `ADMIN_CLIENT_DEACTIVATED`
  - `ADMIN_CLIENT_ACTIVATED`
  - `ADMIN_CLIENT_OWNER_CREATED`
  - `ADMIN_CLIENT_OWNER_LINKED`
- Metadata recursive sanitize:
  - password/token/secret/authorization/cookie/credential/apikey türevleri dışarıda bırakılır.

### Frontend Testing
- Clients owner picker testleri eklendi/güncellendi:
  - LINK_EXISTING picker render
  - debounced search query paramı
  - `accountType=CLIENT` query doğrulaması
  - user seçimi sonrası `userId` payload
  - seçim yoksa validation error
  - NONE/CREATE akış regresyon koruması
- Son checkpoint:
  - `npm run build` ✅
  - `npm run check` ✅
  - `npm run test:run` ✅
  - `12` test file, `100/100` test passed

### Known Risks / Notes
- `GET /api/v1/admin/users` response’unda `clientProfile` alanı her durumda gelmiyorsa frontend linked-user elemesi kısmi kalabilir.
- Backend linked user durumunu 409 ile yine fail-safe engeller.
- Owner picker şu an genel admin users endpointini kullanıyor; dedicated owner-candidates endpoint planned.
- Client deactivate sırasında owner user otomatik pasifleştirme policy henüz yok.
- Vite bundle/chunk uyarısı devam edebilir (optimizasyon planned).

## Update - 2026-04-30 (Employee Assignment UI Milestone)

### Admin Panel Frontend
- Yeni admin sayfası eklendi: `Çalışan Atamaları` (`/calisanlar/atamalar`).
- `RootLayout` menüsüne `Atamalar` girdisi eklendi.
- `Employees` sayfasına hızlı geçiş CTA’sı eklendi (`Atamaları Yönet`).
- Assignment ekranı artık backend-driven:
  - listeleme
  - filtreleme (`employeeUserId`, `clientProfileId`, `scope`, `isActive`)
  - create / update scope / activate / deactivate akışları
  - loading / error / empty / success durumları
  - permission-aware buton disable davranışları

### RTK Query / API Integration
- Yeni feature: `adminandemployeePanel/src/app/features/adminAssignments/*`
  - `useGetAdminAssignmentsQuery`
  - `useCreateAdminAssignmentMutation`
  - `useUpdateAdminAssignmentMutation`
  - `useDeactivateAdminAssignmentMutation`
  - `useActivateAdminAssignmentMutation`
- `baseApi` tag listesine `AdminAssignments` eklendi.
- Assignment mutasyonları sonrası invalidation:
  - `AdminAssignments`
  - `AuditLogs`
  - `AdminSummary`
  - `Clients` (liste + ilgili client id)
- Employee/client picker’larda debounced arama (275ms) kullanıldı:
  - employee picker: `accountType=EMPLOYEE`, `isActive=true`, `limit=8`
  - client picker: `status=ACTIVE`, `limit=8`

### Auth & RBAC Summary
- Frontend tarafında assignment ekranı `assignments.read` ve `assignments.manage` izinlerine göre davranıyor.
- Backend tarafında assignment aktivasyon güvenliği güçlendirildi:
  - inactive employee veya inactive client profile ile create/activate engelleniyor (`400`).
- Route + service-level admin-only kontrol zinciri korunuyor.

### Employee Panel Frontend
- `employee/pages/Musterilerim.tsx` mock kaynaklardan çıkarılıp `GET /api/v1/clients` ile API-driven hale getirildi.
- Employee assignment-scope davranışı backend’e bırakıldı; sayfa `clients.read.assigned` izniyle çalışıyor.
- `employee/pages/Gorevlerim.tsx` mock görev datasından çıkarılıp `GET /api/v1/tasks` ile API-driven hale getirildi.
- `Gorevlerim` query’i assignment-scope görünürlüğe hizalıdır (forced `assigneeUserId` filtresi kaldırıldı) ve `tasks.read.assigned` yoksa query `skip` ediliyor.

### Frontend Testing
- Yeni test dosyaları:
  - `adminandemployeePanel/src/app/pages/__tests__/EmployeeAssignments.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/Musterilerim.test.tsx`
  - `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`
- Coverage:
  - assignment render/loading/empty
  - create payload
  - activate/deactivate
  - permission-disabled states
  - debounced employee/client query davranışı
  - `Musterilerim` loading/error/empty/unauthorized + query skip
  - `Gorevlerim` loading/error/empty/success/unauthorized + query param/skip
- Son frontend checkpoint: `15/15` test file, `115/115` test passed.

### Known Risks / Notes
- Admin assignment list endpointinde sayfalama yok; veri büyüdükçe backend-side pagination gerekecek.
- `Musterilerim` sayfasında `limit=100` geçici değer; büyük tenant’larda sayfalama ihtiyacı oluşabilir.
- `Gorevlerim` tarafında status update UX bu milestone’da eklenmedi; sonraki adımda kontrollü şekilde `PATCH /tasks/:id` ile entegre edilebilir.
- Frontend bundle/chunk warning devam ediyor (`>500kB` ana chunk), fonksiyonel bloklayıcı değil.

## Update - 2026-05-01 (Purchased Services + Picker UX + Task Todo Milestone)

### Backend Architecture
- Prisma tarafında client entitlements + task checklist genişlemesi tamamlandı:
  - `ClientPurchasedService` (unique: `clientProfileId + serviceKey`, `startedAt/endedAt`)
  - `Project.serviceKey`
  - `TaskTodo` (`visibility`, `sortOrder`, completion metadata)
- Admin client management API, purchased services payload’ıyla çalışıyor:
  - `POST /api/v1/admin/clients`
  - `PATCH /api/v1/admin/clients/:id`
  - `PATCH /api/v1/admin/clients/:id/deactivate`
  - `PATCH /api/v1/admin/clients/:id/activate`
  - `POST /api/v1/admin/clients/:id/owner`
- Task todo endpoints aktif:
  - `POST /api/v1/tasks/:id/todos`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId/toggle`
  - `DELETE /api/v1/tasks/:taskId/todos/:todoId`
- Client kullanıcı task okumalarında yalnızca `CLIENT_VISIBLE` todo’lar döndürülür; employee kendi assigned task’ında todo toggle yapabilir, client todo mutation yapamaz.

### Admin Panel Frontend
- Clients create/edit akışında satın alınan hizmetler alanı backend payload’ına bağlandı.
- Projects create/edit akışında manuel `clientProfileId` input kaldırıldı; searchable client picker + `serviceKey` seçimi eklendi.
- Tasks create/edit akışında manuel `assigneeUserId` input kaldırıldı; searchable employee picker eklendi.
- TaskDetail içinde todo ekleme/güncelleme/silme/toggle ve progress görünümü backend checklist endpointleriyle entegre.

### Employee Panel Frontend
- `Gorevlerim` sayfasında API-driven task listesi üzerinde todo/progress görünümü ve toggle akışı çalışır durumda.
- Employee görev akışı assignment + own-task scope kurallarıyla backend’e bırakılmıştır.

### Client Portal Architecture
- Service selection yalnızca authenticated client’ın `ACTIVE` purchased services kümesini gösterir.
- `selectedService` restore purchased-services setine karşı doğrulanır; yetkisiz service localStorage’dan temizlenir.
- Client-visible task progress bölümü (`ClientVisibleTasksSection`) seçili service bağlamında task/todo ilerlemesini render eder.

### RTK Query / API Integration
- Admin panelde clients/projects/tasks feature katmanları yeni purchased-service + picker + todo contract’ına göre güncellendi.
- Client portalda auth normalizer purchased services için backend enum alias’larını normalize eder (`MEDIA_HUB`, `LANDING_PAGE` vb.).
- Client portal tasks feature eklendi ve client-visible todo/progress render akışı API verisiyle bağlandı.

### Testing
- Backend doğrulama:
  - `npm run prisma:generate` ✅
  - `npm run prisma:seed` ✅
  - `npm run build` ✅
  - `npm run check` ✅
  - `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` ✅ (`7/7`, `176/176`)
- Admin/Employee frontend doğrulama:
  - `npm run build` ✅
  - `npm run check` ✅
  - `npm run test:run` ✅ (`15` file, `120/120`)
- Client portal doğrulama:
  - `npm run build` ✅
  - `npm run check` ✅
  - `npm test` ✅ (`1` file, `6/6`)

### Known Risks / Notes
- Task assignee picker şu an global active employee adaylarını kullanıyor; project/client assignment-scope aday endpoint’i henüz yok.
- Owner picker hâlâ admin users endpointine bağlı; dedicated owner-candidates endpoint planned.
- Todo audit logging henüz genişletilmedi (mutation authz + data visibility uygulanmış durumda).
- Bundle/chunk warningleri fonksiyonel bloklayıcı değil ama performans iyileştirme backlog’unda kalmalı.

## Update - 2026-05-01 (Task Scope + Todo Toggle Fix, Clients Quick Assignment)

### Admin Panel Frontend
- `Clients` listesine müşteri satırı üzerinden hızlı atama aksiyonu eklendi (`Çalışan Ata`).
- Hızlı atama modalı, scope + employee picker ile `POST /api/v1/admin/assignments` çağrısı yapar.
- Permission-aware davranış:
  - `assignments.manage` yoksa aksiyon disabled.
  - `users.manage` yoksa employee picker erişimi engellenir.

### Employee Panel Frontend
- `Gorevlerim` sayfası artık assignment scope içindeki görevleri backend’den doğrudan listeler; frontend forced assignee filtresi kaldırıldı.
- Todo kartlarında görev sahipliği badge’i eklendi (`Bana Atandı`, `Ekip Görevi`, `Atanmamış`).
- Todo toggle akışı scope içi görevlerde çalışır; scope dışı çağrılar backend tarafından güvenli şekilde engellenir.

### Auth & RBAC Summary
- Employee task visibility: active assignment scope.
- Employee todo toggle: active assignment scope.
- Employee task status update: yalnızca own-assigned task (değişmedi).
- Bu ayrım backend service-level guardlarla korunur ve e2e testlerle doğrulanır.

### RTK Query / API Integration
- `Gorevlerim` task query çağrısı scope-aware backend görünürlüğe bırakıldı (`useGetTasksQuery({})`).
- Clients hızlı atama akışında mevcut `adminAssignments` mutation endpointi yeniden kullanıldı; yeni API surface açılmadı.

### Testing
- Backend authz e2e: `7/7` suite, `176/176` test passed.
- Admin/Employee frontend: `15` test file, `124/124` test passed.
- `Gorevlerim` test seti scope içi team-task todo toggle senaryosunu kapsayacak şekilde güncellendi.

### Known Risks / Notes
- Ürün politikası açısından “employee todo toggle scope’i own-only mi assignment-scope mu?” kararı artık teknik olarak assignment-scope’a hizalıdır; policy değişirse backend guard ve test matrix birlikte revize edilmelidir.
- Görsel QA kanıtı (kritik akış screenshot artifact’ları) henüz otomatikleştirilmedi; roadmap’te planned.

## Update - 2026-05-02 (CRM Lead Management + CRM Specialist Module)

### Backend Architecture
- `CRM_SPECIALIST` employee role added to backend Prisma enum, seed data, admin user role allowlist, and frontend role mapping (`crm-specialist`, label: `CRM / Satış Uzmanı`).
- CRM schema added:
  - `CrmLead`
  - `CrmLeadActivity`
  - `CrmLeadStatus`
  - `CrmLeadSource`
  - `CrmLeadActivityType`
- CRM module added under `server/src/crm/*` with admin and employee controllers.
- Admin CRM endpoints support lead list/create/detail/update/activity/convert.
- Employee CRM endpoints support assigned-only list/detail/status-follow-up update/activity.
- Employee object auth is owner-scoped; non-owned detail returns safe `404`.
- Converted/WON leads are locked from employee update/activity mutations.
- Convert creates a `ClientProfile`, marks lead `WON`, stores `convertedClientProfileId`, and returns `409` on duplicate convert.
- CRM create/activity/convert actions write audit logs through existing `AuditLogService`.
- Public website contact form now posts into CRM as `WEBSITE_FORM` leads, requires explicit consent, and returns only a minimal receipt response.

### Admin Panel Frontend
- Admin sidebar now includes `CRM`.
- Admin routes added:
  - `/crm`
  - `/crm/:id`
- `CrmLeads` supports KPI band, filters/search, table, pagination, create dialog, and CRM owner picker.
- `CrmLeadDetail` supports lead summary, activity timeline, admin status/follow-up update, activity creation, and convert action.

### Employee Panel Frontend
- `CRM_SPECIALIST` sidebar menu added:
  - Dashboard
  - CRM Leadleri
  - Bugünkü Takipler
  - Takvim
  - Bildirimler
  - Ayarlar
- Employee CRM routes added:
  - `/employee/crm/leads`
  - `/employee/crm/leads/:id`
  - `/employee/crm/follow-ups`
- CRM employee UI can list assigned leads, view details, add activities, update allowed statuses, and update next follow-up dates.
- Employee UI does not expose WON/convert/owner mutation flows.

### RTK Query / API Integration
- New feature folder: `adminandemployeePanel/src/app/features/crm/*`.
- Hooks added for admin and employee CRM query/mutation flows.
- Cache tags include `CrmLeads`, `CrmActivities`, `Clients`, `AdminSummary`, and `AuditLogs`.
- Empty query params are omitted before requests.

### Frontend Testing
- CRM frontend tests added:
  - Admin CRM list/create/permission states
  - Admin CRM detail update/activity/convert behavior
  - CRM specialist employee sidebar visibility
  - Employee CRM detail status/activity and no-convert/WON UI
- Latest admin/employee frontend checkpoint: `19` test files, `134/134` tests passed.

### Known Risks / Notes
- Employee CRM list and Bugünkü Takipler pages have functional implementation and e2e-backed API behavior, but direct page-level frontend tests remain a useful follow-up.
- Admin CRM owner picker uses `GET /api/v1/admin/users` with `role=CRM_SPECIALIST`; a dedicated CRM owner candidates endpoint can reduce coupling later.
- CRM reminders, pipeline analytics, and outbound email/WhatsApp sending integrations are planned follow-ups.

## Update - 2026-05-09 (Meta Ads Faz 5 Admin Global Panel)

### Backend Architecture
- Global admin Meta Ads listing endpoint added:
  - `GET /api/v1/admin/meta-ads/clients`
- Endpoint returns META_ADS purchased-service client rows with:
  - connection status / token presence / sync error / last sync
  - report-range spend summary (ACCOUNT insight aggregate)
  - pending approvals aggregate (review tasks + pending release approvals on META_ADS projects)
  - active assigned employees
- Sensitive token material remains response-hidden.

### Admin Panel Frontend
- New admin route/page:
  - `/meta-ads` (`MetaAdsAdmin`)
- Page provides:
  - global Meta Ads client table + KPI cards
  - permission-aware actions: config edit, connection test, manual sync, disconnect
  - approval request create shortcut (V1 mapped to `Task(type=REVISION, status=REVIEW)` on META_ADS project)
- `ClientDetail` Meta Ads section now includes a manual sync action.

### Testing
- Backend: `npm run check` passed.
- Frontend: targeted page tests passed (`MetaAdsAdmin`, `ClientDetail`) and `npm run check` passed.
- Backend targeted e2e run is guarded until `DATABASE_URL` points to a test-pattern DB (`*_test` / `test_*` / `*testing*`).

## Update - 2026-05-03 (Developer / Delivery Operations Milestone)

### Product Summary
- Developer/Delivery tarafı artık mock ağırlıklı ekranlardan gerçek operasyon paneline taşındı.
- Ana operasyon omurgası `Project -> DeliverySprint -> Task -> TaskTodo` olarak korunuyor.
- Bug, frontend işi, backend işi, revision, QA ve deployment ayrı entity’lere bölünmedi; mevcut `Task` modeli taxonomy alanlarıyla genişletildi.

### Main Modules
- Delivery module eklendi:
  - `DeliverySprint`
  - `DeliveryRelease`
  - delivery summary endpoint
- Project bazlı GitHub repository integration eklendi.
- Proje operasyon metadatası genişletildi:
  - `repositoryUrl` (business-level GitHub/repo linki)
  - `figmaProjectUrl` (tasarım/proje Figma linki)
- Developer dashboard, sprintler, test & yayın, frontend/backend/bug/revizyon sayfaları backend-driven hale geldi.

### Auth & RBAC Summary
- Delivery tarafında developer ve project-manager kullanıcıları assigned project scope içinde okuma yapabiliyor.
- Admin kullanıcı delivery ve GitHub repository config tarafında manage-any yetkisine sahip.
- Client kullanıcılar delivery summary ve GitHub endpoint’lerine erişemiyor.
- GitHub repository access token değerleri API response’larında asla dönmüyor.

### Backend Architecture
- `Task` modeli şu alanlarla genişletildi:
  - `type`
  - `workstream`
  - `severity`
  - `environment`
  - `affectedUrl`
  - `reproductionSteps`
  - `reportedBy`
  - `code`
  - `sprintId`
- `Task` execution takip alanları eklendi:
  - `branchName`
  - `codePreparationNotes`
  - `codePreparedAt`
  - `codePreparedByUserId`
- `TaskWorkNote` modeli ile developer "yapılanlar" kayıtları backend-native hale getirildi.
- `DeliveryRelease` approval alanları eklendi:
  - `approvalStatus`
  - `approvalNotes`
  - `approvalRequestedAt`
  - `approvalRespondedAt`
  - `approvalActorUserId`
- Yeni backend module/class grupları:
  - `server/src/delivery/*`
  - `server/src/integrations/github/*`
- Yeni delivery endpointleri:
  - `GET /api/v1/delivery/summary`
  - `GET/POST /api/v1/delivery/sprints`
  - `GET/PATCH /api/v1/delivery/sprints/:id`
  - `GET/POST /api/v1/delivery/releases`
  - `GET/PATCH /api/v1/delivery/releases/:id`

### Admin Panel Frontend
- `Tasks` create/edit ekranı delivery taxonomy alanlarını destekliyor.
- `Projects` create/edit ekranı artık:
  - `WEB_APP` ve `MOBILE_APP` için repository linkini zorunlu doğruluyor
  - Figma proje linki kabul ediyor
- `ProjectDetail` içinde admin için GitHub repository connect/manage/read alanı eklendi.
- Token input write-only tutuluyor; mevcut token UI’da gösterilmiyor.
- `ClientDetail` ekranında seçili müşteri için aktif çalışan atamaları görünür hale getirildi.

### Employee Panel Frontend
- Aşağıdaki developer sayfaları artık API-driven:
  - `Frontend`
  - `Backend / API`
  - `Buglar`
  - `Revizyonlar`
  - `Sprintler`
  - `Test & Yayın`
  - `Projeler`
  - `Developer Dashboard`
- `Projeler` ekranında assigned project scope için GitHub branch/commit/PR/workflow özeti gösteriliyor.
- Developer artık assigned project/task detail sayfalarını açabiliyor ve task detail içinde work note ekleyebiliyor.
- `Developer Dashboard` ekranında atanan müşteri görünürlüğü için “Size Atanan Müşteriler” kartı eklendi.

### GitHub Integration
- V1 entegrasyon modeli project-scoped `ProjectRepository`.
- Branches, commits, pull requests ve workflow runs GitHub REST üzerinden okunuyor.
- Token storage encrypted-at-rest; plaintext saklanmıyor.
- `WEB_APP` ve `MOBILE_APP` projelerinde business-level `repositoryUrl` zorunlu tutuluyor.
- `installationId` alanı GitHub App migration hazırlığı olarak connect flow’a eklendi.
- V1 intentionally PAT tabanlı; GitHub App installation flow follow-up olarak bırakıldı.

### Project Files / Cloudinary
- `Project Files` domain is now backend-native with:
  - Cloudinary signed upload signature endpoint
  - upload completion metadata persistence
  - client-visible vs internal visibility
  - expiring share links with token hash storage
- `Dosyalar` and `Teslim Dosyaları` employee pages are API-driven.
- Client panel delivery/files view now reads real `CLIENT_VISIBLE` project files instead of static placeholders.

### Client Panel Web APP Data Mode
- `web-app` servisinde `reports`, `meetings`, `service-tab-page`, `web-app-dashboard` akışları mock fallback yerine API-first hale getirildi.
- Proje seçilmemişse veya ilgili kayıt yoksa UI artık açık empty-state mesajı gösteriyor; statik örnek içerik basılmıyor.

### RTK Query / API Integration
- Yeni delivery feature klasörü eklendi:
  - `adminandemployeePanel/src/app/features/delivery/*`
- `tasks` feature query params artık taxonomy filtrelerini destekliyor:
  - `type`
  - `workstream`
  - `severity`
  - `environment`
  - `sprintId`
- `projects` feature içine project repository GitHub endpoints eklendi.

### Frontend Testing
- Developer task page filtre testleri eklendi.
- Sprintler, Test & Yayın ve Developer Dashboard ekranları için loading/error/empty/success testleri eklendi.
- Project detail GitHub görünürlüğü ve task taxonomy form davranışı testlerle güncellendi.

### Known Risks / Notes
- GitHub integration V1 tek repository per project modeliyle çalışıyor.
- Delivery management yetkileri V1’de kasıtlı olarak admin ağırlıklı tutuldu; assigned-manage genişletmesi follow-up olabilir.
- GitHub App installation flow için sadece foundation/plumbing hazır; gerçek installation handshake hâlâ follow-up.
- CI/CD tarafında V1 yalnızca workflow read visibility ve release badge seviyesi sunuyor; tam otomasyon pipeline’ı henüz yok.
- Bundle/code splitting optimizasyonu hâlâ roadmap follow-up maddesi olarak geçerli.

## 2026-05-05 Update - Project Manager Assigned Operations

### Main User Roles
- `PROJECT_MANAGER` artık assigned scope içinde yalnızca görüntüleme değil operasyonel create/update akışlarını da kullanır.

### Auth & RBAC Summary
- PM role permission setine assigned-manage yetkileri eklendi:
  - `projects.manage.assigned`
  - `tasks.manage.assigned`
  - `tasks.assign.assigned`
  - `tasks.todos.manage.assigned`
- Global `manage.any` yetkileri admin’de kaldı; PM scope dışı erişimlerde safe `404/403` korunur.

### Project Manager Module
- PM müşteri detayında service bazlı “Proje Oluştur” aksiyonu eklendi.
- PM service workspace ekranı task/sprint/release oluşturma + todo toggle + internal message reply ile aksiyon merkezine dönüştürüldü.
- Assignee seçimleri project-scope aday endpointinden beslenir.

### Web APP Workspace
- PM internal/public message ayrımıyla cevap verebilir; internal mesajlar client görünürlüğünden gizli kalır.

### Testing
- PM assigned operation akışları backend authz e2e kapsamına eklendi (`projects-tasks-authz` genişletildi).
- PM client-detail create action için frontend test eklendi.

## 2026-05-05 Update - PM Service Workspace + Message Tree

### Employee Panel Frontend
- Project-manager akışı assigned-client merkezli gerçek API verisine taşındı.
- PM akışı müşteri kartı -> satın alınan hizmet -> service-aware operasyon workspace şeklinde çalışır.
- WEB_APP hizmetinde PM, proje bağlamında workspace sekmelerini yönetebilir.

### Web APP Workspace
- Mesaj modelinde `parentMessageId` ile parent/reply ilişkisi kalıcı hale getirildi.
- Mesaj create/list akışı proje + tab bağlamında hizalandı.
- Parent mesaj doğrulaması ve client internal-message reply kısıtı backend’de uygulanır.

### Client Portal Architecture
- Web APP mesaj akışında query/cache key standardı `{ projectId, tabKey }` olarak sabitlendi.
- Socket event patch akışı bu key ile hizalandı; görünmeme/senkron kaybı problemleri azaltıldı.

### Known Risks / Notes
- Bazı eski frontend testlerinde timeout kaynaklı kırılganlık devam edebilir; hedefli test stabilizasyonu follow-up gerektirir.

## 2026-05-09 Update - Meta Ads Faz 7 Approval + Creative Collaboration

### Backend
- `Task` modeline Meta Ads approval lifecycle alanları eklendi (`approvalRequired`, `approvalType`, `approvalStatus`, `approvalResponseNote`, approval timestamps, creative reference).
- `ProjectFile` modeline creative approval metadata alanları eklendi (approval flags/status + campaign/adset/ad refs + performance summary).
- Client kullanıcılar için task update tarafında daraltılmış approval-response akışı açıldı:
  - sadece own scope
  - sadece `META_ADS` proje
  - sadece pending approval task
  - sadece approval status response alanları

### Client Panel
- Meta Ads `approvals` tabı local aksiyon yerine gerçek backend mutation (`PATCH /tasks/:id`) ile çalışır.
- Pending approvals card + creative preview + approval history aynı ekranda render edilir.
- Revizyon isteğinde açıklama notu akışı UI ve backend doğrulamasıyla hizalandı.

### Admin/Employee Panel
- Meta Ads workspace approval listesi artık approval type/status/note alanlarını gösterir.
- Approval task create aksiyonları role-aware approval type ile oluşturulur (`campaign/budget/creative`).

## 2026-05-10 Update - Meta Ads Faz 8 Sync Automation Hardening

### Backend
- `MetaAdsSyncLog` modeli ve `MetaAdsSyncStatus` enumu eklendi; sync lifecycle artık DB’de `RUNNING/SUCCESS/FAILED/PARTIAL/SKIPPED` olarak izlenir.
- Sync akışına `trigger` ve TTL-safe skip davranışı eklendi (`MANUAL_SYNC`, `ON_DEMAND_CLIENT`, `ON_DEMAND_ASSIGNED`, `ERROR_RETRY`).
- Error normalization katmanı kullanıcı dostu kodlara standardize edildi:
  - `TOKEN_EXPIRED`
  - `PERMISSION_MISSING`
  - `AD_ACCOUNT_UNAVAILABLE`
  - `RATE_LIMIT`
  - `BUSINESS_ACCESS_REVOKED`
  - `UNKNOWN_API_ERROR`
- Client-facing own endpoints tarafında teknik hata detayları maskelenir; admin/assigned rollerde operasyonel detay korunur.
- Yeni endpointler:
  - `GET /api/v1/admin/meta-ads/sync-logs`
  - `POST /api/v1/admin/clients/:clientId/meta-ads/sync/retry`
  - `POST /api/v1/clients/me/meta-ads/sync`

### Admin Panel
- `/meta-ads` ekranına sync observability katmanı eklendi:
  - sync log tablosu
  - failed sync müşteri listesi
  - retry aksiyonu
  - status/count özetleri

### Client Panel
- Meta Ads dashboard’da güvenli durum metinleri eklendi:
  - “Son güncelleme”
  - “Veriler hazırlanıyor…”
  - “Bağlantı problemi var, ekibimiz ilgileniyor”
- Client refresh aksiyonu rate-limit TTL’ye göre `SKIPPED` geri dönüşünü kullanıcıya açık mesajla gösterir.

### Testing
- Backend `meta-ads-authz` e2e senaryoları Faz 8 kapsamıyla genişletildi:
  - sync logs read/filter
  - token error normalization
  - TTL skip behavior
  - own sync endpoint
  - client-safe error masking
- Frontend tarafında admin sync log UI ve client safe-state davranışları için test güncellemeleri eklendi.

## 2026-05-10 Update - Meta Ads Faz 9 Reporting + Export Foundation

### Backend
- Meta Ads rapor domain’i eklendi:
  - `MetaAdsReport` modeli
  - `MetaAdsReportType` enumu (`WEEKLY`, `MONTHLY`, `CAMPAIGN_PERFORMANCE`, `CREATIVE_PERFORMANCE`, `BUDGET_RECOMMENDATION`)
  - `MetaAdsReportStatus` enumu (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- Report endpointleri eklendi:
  - Admin:
    - `GET /api/v1/admin/clients/:clientId/meta-ads/reports`
    - `POST /api/v1/admin/clients/:clientId/meta-ads/reports`
    - `PATCH /api/v1/admin/meta-ads/reports/:reportId`
  - Assigned employee:
    - `GET /api/v1/meta-ads/clients/:clientId/reports`
    - `POST /api/v1/meta-ads/clients/:clientId/reports`
    - `PATCH /api/v1/meta-ads/reports/:reportId`
  - Own client:
    - `GET /api/v1/clients/me/meta-ads/reports`
- Publish + acknowledgement request akışı task lifecycle ile entegre edildi:
  - `approvalType = META_ADS_REPORT_ACKNOWLEDGEMENT`
  - report publish sırasında client-visible + pending approval task üretimi desteklenir
  - report response’unda acknowledgement durumu (`NOT_REQUESTED`, `PENDING`, `ACKNOWLEDGED`, `CHANGES_REQUESTED`) döner.

### Client Panel
- `meta-reports` sekmesi insight-list tabanlı görünümden report-entity tabanlı görünüme taşındı.
- Client panel artık `GET /clients/me/meta-ads/reports` endpointinden:
  - rapor tipi
  - yayın durumu
  - dönem aralığı
  - özet metni
  - acknowledgement state
  verilerini render eder.

### Testing
- `meta-ads-authz` e2e kapsamı Faz 9 senaryolarıyla genişletildi:
  - admin report draft create
  - assigned report create + acknowledgement task
  - draft report client’a görünmez
  - clientVisible report client’a görünür
  - own client other-client report’u göremez
  - publish + acknowledgement request task üretimi
- Client panel `service-tab-page.meta-ads` testleri report tab render/assertionlarıyla güncellendi.

## 2026-05-10 Update - Meta Ads Faz 10 Production Hardening

### Backend
- Own-client sync hata cevapları client-safe standarda çekildi; operasyonel detay sadece admin/assigned tarafında korunur.
- `meta-ads-authz` e2e kapsamına production hardening senaryoları eklendi:
  - sync logs limit/pagination davranışı
  - summary date-range validation (`<= 90` gün)
  - own sync endpoint error sanitization

### Client Panel
- `clientPanel/src/app/App.tsx` içinde dashboard/tab/shared sayfalar lazy import edildi ve `Suspense` fallback eklendi.
- `clientPanel/vite.config.ts` için `manualChunks` ayrıştırması eklendi; Meta Ads yoğun ekranlarda ilk yük daha küçük parçalara bölündü.

### Admin/Employee Panel
- `adminandemployeePanel/vite.config.ts` için `manualChunks` ayrıştırması eklendi.
- Employee Meta Ads workspace testleri role-specific görünürlük doğrulamasıyla genişletildi:
  - Social role -> `Performans` / `Pixel` tabları gizli
  - Performance role -> `Performans` / `Pixel` tabları görünür

### Known Risks / Notes
- Backend Meta Ads e2e suite’i bu checkpointte local test DB runtime erişimi olmadığı için çalıştırılamadı (`Schema engine error`).
- Admin/Employee build çıktısında bir adet >500k app chunk uyarısı sürüyor; route-level lazy migration ayrı bir follow-up olarak planlanmalı.
