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
- Frontend business domain data is still partially mock/static while domain-by-domain API integration is phased in

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

There are two panel types:
- Admin Panel (protected by backend auth via Redux/RTK Query)
- Employee Panel (protected by backend auth via Redux/RTK Query with role-gated sidebar)

There is also a Client Portal as a separate sub-app at `clientPanel/`.

## Main Modules

### Admin Panel (`/` routes)
Dashboard, Clients (Müşteriler), Services (Hizmetler), Projects (Projeler), Tasks (Görevler), Approvals (Onaylar), Campaigns (Kampanyalar), Contents (İçerikler), Reports (Raporlar), Meetings (Toplantılar), Employees (Çalışanlar), Finance (Finans), Automations (Otomasyonlar), Settings (Ayarlar)

### Employee Panel (`/employee` routes)
Role-based sidebar. Common pages: Dashboard, Gorevlerim, Musterilerim, Takvim, Bildirimler, Dosyalar, Ayarlar. Specialist pages vary per role (see routes.tsx).

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
  - service selection restore remains localStorage-backed
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
- Projects and tasks API foundation is now active:
  - Projects: `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PATCH /api/v1/projects/:id`
  - Tasks: `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`
- `GET /users` enforces `users.read`; service-level object authorization protects `/users/:id` and `/clients/:id`.
- Admin can read full users/client profile scopes; client users are limited to their own `ClientProfile` scope.
- Employee assignment scope is now modeled via `EmployeeClientAssignment` + active assignment checks.
- Employee users with `clients.read.assigned` can read only assigned client profiles (`GET /clients`) and assigned profile detail (`GET /clients/:id`); unassigned detail resolves as safe `404`.
- Employee users can read only active-assignment-scope projects/tasks and can update only `status` on tasks assigned to them within active assignment scope.
- Client users can read only own `clientProfileId`-scope projects/tasks; out-of-scope detail access resolves as safe `404`.
- Assignment admin endpoints are admin-only via `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions`, plus service-level `ADMIN` account/role and permission checks (`assignments.read`, `assignments.manage`).
- Authz e2e matrix is now automated in backend tests and validated with real guard chain behavior (`6/6 suites`, `139/139` tests).
- Admin dashboard summary endpoint is active: `GET /api/v1/admin/summary` (permission: `admin.summary.read`).
- `GET /api/v1/clients` now supports validated server-side pagination/filter/sorting and returns a standard `data + meta` envelope.
- Full domain endpoint authorization rollout beyond users/clients/admin-assignments/projects/tasks remains pending.

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
  - `adminandemployeePanel/src/app/features/clients/*` (`GET /clients`, `GET /clients/:id`)
  - `adminandemployeePanel/src/app/features/projects/*` (`GET/POST/PATCH /projects*`)
  - `adminandemployeePanel/src/app/features/tasks/*` (`GET/POST/PATCH /tasks*`)
- Admin pages now backend-driven for core operations:
  - `Dashboard` uses dedicated summary endpoint (`/admin/summary`)
  - `Clients` uses server-side paginated/filterable list response (`data + meta`)
  - `ClientDetail` includes related projects/tasks overview using existing `projects`/`tasks` APIs
- Layouts:
  - `RootLayout` — Admin Panel shell (sidebar + topbar + `<Outlet />`)
  - `EmployeeLayout` — Employee Panel shell (role-aware sidebar + topbar + `<Outlet />`)
- Contexts: `adminandemployeePanel/src/app/contexts/RoleContext.tsx` (compatibility layer; auth source of truth is Redux)
- Pages: `adminandemployeePanel/src/app/pages/` (admin pages)
- Employee pages: `adminandemployeePanel/src/app/employee/pages/`
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
  - Project tracking: `Project`, `Task` + enums (`ProjectStatus`, `TaskStatus`, `Priority`)
- Hybrid RBAC strategy selected: fixed `User.role` enum is kept, permission expansion is modeled via `Permission` + `RolePermission`
- Demo seed foundation exists at `server/prisma/seed.ts`:
  - Seeds demo admin/employee/client accounts
  - Seeds permission catalog and role-permission mappings
  - Seeds 3 demo client profiles (`acme-e-ticaret`, `nova-performance`, `mavi-sosyal`)
  - Links `client@socialtech.com` to `acme-e-ticaret`
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
  - Admin Assignments: `GET /api/v1/admin/assignments`, `POST /api/v1/admin/assignments`, `PATCH /api/v1/admin/assignments/:id`, `PATCH /api/v1/admin/assignments/:id/deactivate`, `PATCH /api/v1/admin/assignments/:id/activate`
  - Projects: `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PATCH /api/v1/projects/:id`
  - Tasks: `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`
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
  - Matrix suite currently covers users/clients/admin-assignments/projects/tasks/admin-user flows
  - Latest authz pattern run: `6/6` suites, `139/139` tests passed
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
  - `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (`6/6 suites`, `139/139 tests`, test DB name: `socialtech_test`)
  - `adminandemployeePanel npm run build` / `npm run check` / `npm run test:run` passed (`9` suites, `66/66` tests)
  - manual auth flow tests passed (`login`, `me`, `refresh`, `logout`, `logout` sonrası `refresh=401`)
  - `server/tsconfig.build.json` uses `incremental: false` to avoid missing-module runtime issues from stale/incomplete dist output

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
- `ProjectStatus`: `PLANNED | IN_PROGRESS | REVIEW | COMPLETED | ON_HOLD`
- `TaskStatus`: `TODO | IN_PROGRESS | REVIEW | DONE | BLOCKED`
- `Priority`: `LOW | MEDIUM | HIGH | URGENT`
- `ClientStatus`: `ACTIVE | INACTIVE | SUSPENDED`

Current protected read behavior:
- User/client responses are sanitized; auth-sensitive fields are excluded (`passwordHash`, refresh token/hash fields).
- Object-level authorization is enforced in services for `users/:id`, `clients/:id`, and `clients/me`.
- Employee access to `/clients` and `/clients/:id` is assignment-based (`isActive=true`) for accounts with `clients.read.assigned`.
- `/clients` list is envelope-shaped (`data + meta`) and validates `page`, `limit`, `sortBy`, `sortOrder`, `status`, `search`.
- Admin assignment responses are sanitized to minimal employee/client summaries; auth-sensitive fields are excluded.
- Project/task responses are authorization-scoped by role:
  - admin: full project/task scope
  - employee: active-assignment-scope read, own-assigned status-only task update
  - client: own-client-scope read

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
- Active nav item: `bg-[#AAFF01] text-[#131313]`
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
npm run test:e2e:authz         # backend authz e2e suites (users/clients/admin-summary, assignments, projects/tasks, admin-users, audit-logs, token invalidation)
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
