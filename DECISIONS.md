# Architecture Decisions

## 2026-04-28 - Initial Repository Analysis and Context Bootstrap

Context:
PROJECT_CONTEXT.md and REPO_MAP.md were stubs with placeholder text. The repository had not been analyzed yet.

Decision:
Performed full initial analysis of the repository structure, routes, RBAC, layout architecture, tech stack, and data model. Populated all shared memory files with accurate information derived from actual source files.

Reason:
Enables Claude Code and Codex to work from shared memory rather than re-scanning the repository on each task. Reduces token usage and prevents divergent assumptions.

Affected files:
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

---

## 2026-04-28 - Shared Project Memory for Claude Code and Codex

Context:
The project may be worked on by both Claude Code and Codex depending on tool availability and limits. Both tools need a shared source of truth to avoid repeated full-repository scans and inconsistent assumptions.

Decision:
Use shared project memory files:
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `DECISIONS.md`
- `ROAD_MAP.md`

Reason:
This keeps Claude Code and Codex aligned, reduces token usage, prevents duplicate analysis, and creates a stable handoff point between tools.

Affected files:
- `CLAUDE.md`
- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `DECISIONS.md`
- `ROAD_MAP.md`
- `.claude/agents/social-tech-context-manager.md`
- `.codex/agents/context-manager.toml`

---

## 2026-04-28 - Demo RBAC (No Real Auth)

Context:
The Employee Panel has a role-selection login screen but no real authentication — no passwords, JWT, sessions, or backend.

Decision:
Role is stored in React Context (in-memory, lost on refresh). RoleAccessLogin is a UI demo only. EmployeeLayout guards the /employee routes by checking context, redirecting to /employee/login if role is null.

Reason:
App is in early/prototype stage. Auth infrastructure has not been built yet.

Affected files:
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
- `adminandemployeePanel/src/app/employee/RoleAccessLogin.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`

---

## 2026-04-28 - Employee Panel Pages: Inline Mock Data, No Shared Store

Context:
37 employee pages were placeholder-only (5-line files delegating to PlaceholderPage component). They needed realistic, role-appropriate content.

Decision:
Each page was filled with inline mock data arrays typed explicitly (no `any`) rather than adding all data to mockData.ts. Role-specific data (bugs, sprints, pixel IDs, SEO audits, etc.) is too narrow to be shared globally. Pages that already had relevant shared data (campaigns, tasks, reports, approvals, meetings, projects, clients) import from mockData.ts. Pages with highly specialized content define their own local arrays.

Reason:
Keeps mockData.ts focused on shared cross-role entities. Specialist data (e.g., pixel tracking IDs, SSL certificates, SEO audit scores) is unlikely to be reused outside its role's pages. Avoids inflating mockData.ts with rarely shared data.

Affected files:
- All 37 files in `adminandemployeePanel/src/app/employee/pages/` that previously used PlaceholderPage

---

## 2026-04-28 - Single SPA, No Next.js

Context:
Despite Social Tech building Next.js projects for clients, this internal tool is a Vite + React SPA.

Decision:
Use React Router 7 (createBrowserRouter) for all routing. No SSR, no RSC, no Next.js conventions.

Reason:
This is an internal dashboard/panel tool. SPA with client-side routing is sufficient.

Affected files:
- `adminandemployeePanel/vite.config.ts`
- `adminandemployeePanel/src/app/routes.tsx`

---

## 2026-04-28 - Demo Login Flow for Admin, Employee, and Client Portal

Context:
Admin + Employee Panel and Client Portal needed realistic login screens, but the project still has no backend, API, JWT, session, or database layer.

Decision:
Implemented frontend-only demo login flows inside the existing Vite + React SPAs. Admin and employee users authenticate through a shared `/login` screen in `adminandemployeePanel/`; demo role/account type comes from a static email map in `RoleContext.tsx`. Client Portal uses a separate frontend demo login gate in `clientPanel/` before the existing service selection flow. Demo auth state is browser-local and should be replaced by real JWT/session-backed auth later.

This supersedes the earlier demo role-picker flow for active navigation.

Reason:
This provides a realistic premium login experience without changing the current SPA architecture or introducing backend infrastructure prematurely.

Affected files:
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
- `adminandemployeePanel/src/app/pages/Login.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/EmployeeDashboard.tsx`
- `adminandemployeePanel/src/app/employee/RoleAccessLogin.tsx`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/components/client-login.tsx`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/components/topbar.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`

---

## 2026-04-28 - npm Developer Workflow Standardization

Context:
`adminandemployeePanel/` and `clientPanel/` were buildable, but developer workflow signaling was inconsistent (`package-lock.json` existed while `pnpm` metadata was still present), and there was no explicit TypeScript typecheck pipeline before backend/auth integration work.

Decision:
Standardized both apps on npm (`packageManager: npm@11.8.0`), removed pnpm-specific workspace/override metadata, moved `react` and `react-dom` into `dependencies`, added TypeScript typecheck infrastructure (`typescript`, `@types/*`, `tsconfig.json`), and added `typecheck`, `preview`, and `check` scripts. Ran `npm install` and updated lockfiles, then verified `npm run check` succeeds in both apps.

ESLint/Prettier were intentionally not added in this pass to keep the change set minimal and focused on package manager consistency plus type/build gating.

Reason:
Creates a stable, reproducible baseline for upcoming backend/auth integration while minimizing risk and avoiding broad formatting/lint churn.

Affected files:
- `adminandemployeePanel/package.json`
- `adminandemployeePanel/package-lock.json`
- `adminandemployeePanel/tsconfig.json`
- `adminandemployeePanel/pnpm-workspace.yaml`
- `adminandemployeePanel/vite.config.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `clientPanel/package.json`
- `clientPanel/package-lock.json`
- `clientPanel/tsconfig.json`
- `clientPanel/pnpm-workspace.yaml`
- `clientPanel/vite.config.ts`

---

## 2026-04-28 - NestJS Backend Foundation

Context:
The repository had multiple Vite + React SPAs with frontend-only demo auth and mock/static data, but no backend service. A backend foundation was required before real authentication, RBAC, database migration, and API integration phases.

Decision:
Created a new `server/` application as a NestJS + TypeScript backend foundation to act as a single shared API for Admin/Employee Panel and Client Portal. Added foundational infrastructure only:
- `/api/v1` global prefix
- env/config validation
- global request validation
- global exception handling
- env-driven CORS
- Prisma/PostgreSQL preparation
- health endpoint
- auth/users/clients module skeletons

This milestone intentionally does not include full auth, real RBAC enforcement, full domain modeling, or frontend API integration.

Reason:
Establishes a clean, testable, extensible backend base while keeping implementation risk low and preserving phased delivery.

Affected files:
- `server/.env.example`
- `server/package.json`
- `server/nest-cli.json`
- `server/tsconfig.json`
- `server/tsconfig.build.json`
- `server/src/main.ts`
- `server/src/app.module.ts`
- `server/src/config/env.validation.ts`
- `server/src/config/cors.config.ts`
- `server/src/common/filters/global-exception.filter.ts`
- `server/prisma/schema.prisma`
- `server/src/database/prisma.service.ts`
- `server/src/database/database.module.ts`
- `server/src/health/*`
- `server/src/auth/*`
- `server/src/users/*`
- `server/src/clients/*`

---

## 2026-04-28 - Hybrid RBAC Schema and Demo Seed Foundation

Context:
Backend foundation existed in `server/`, but auth implementation had not started yet. The project needed an auth-ready schema baseline and deterministic demo data before implementing real `login/refresh/logout/me`.

Decision:
Extended Prisma schema with a hybrid RBAC-ready approach:
- Keep fixed `User.role` enum as the primary role identity.
- Add `Permission` and `RolePermission` tables for expandable backend authorization mapping.
- Add `User.displayName` and `User.lastLoginAt`.
- Add unique `ClientProfile.slug`.

Added `prisma/seed.ts` and seed scripts to establish deterministic demo data:
- Admin + 7 employee role users + 1 client owner user.
- Permission catalog and role-permission mapping rows.
- `client@socialtech.com` linked to `Acme E-ticaret` client profile.

This milestone intentionally does not implement auth endpoints, JWT logic, refresh rotation, or backend guard enforcement.

Reason:
Provides a stable schema + seed baseline for the next task (real auth endpoints) while keeping scope controlled and avoiding premature full RBAC/auth implementation.

Operational note:
- Current local schema sync uses `prisma db push`.
- Prisma migration files are not created yet and remain a planned follow-up.
- `package.json#prisma` seed config is currently valid but deprecated in Prisma 7; migrate later to `prisma.config.ts`.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/package.json`
- `server/package-lock.json`
- `server/tsconfig.seed.json`

---

## 2026-04-28 - Backend Auth Flow with Refresh Token Rotation

Context:
`server/` backend foundation and Prisma seed/schema baseline were ready, but auth endpoints were still placeholder and frontend apps were operating with demo-only auth state.

Decision:
Implemented real backend auth endpoints under `/api/v1/auth`:
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`

Security and session behavior:
- Access token is returned in response body and consumed as Bearer token.
- Refresh token is issued as HttpOnly cookie.
- Refresh token plaintext is never stored in database; only hash is stored in `RefreshToken.tokenHash`.
- Refresh token rotation is enabled.
- On revoked-token reuse detection, active refresh sessions for the same user are revoked.
- Seed password hashing moved to `bcryptjs`.
- Legacy `seed-sha256` hashes are temporarily supported and upgraded to bcrypt on successful login.

Authorization baseline:
- Added `JwtAuthGuard` and `CurrentUser` decorator.
- Added `RequirePermissions` decorator and `PermissionsGuard` skeleton for domain rollout.
- `/auth/me` is protected with backend guard and returns role + resolved permissions (+ `ClientProfile` for client users).

Reason:
Establishes secure, production-aligned auth mechanics early while preserving phased delivery for frontend integration and broader domain authorization.

Operational verification:
- `npm run prisma:generate` passed
- `npm run prisma:seed` passed
- `npm run build` passed
- `npm run check` passed
- Manual auth flow checks passed (`login`, `me`, `refresh`, `logout`, `logout -> refresh=401`)

Affected files:
- `server/src/auth/auth.controller.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/auth.module.ts`
- `server/src/auth/authorization.service.ts`
- `server/src/auth/dto/login.dto.ts`
- `server/src/auth/dto/refresh-token.dto.ts`
- `server/src/auth/dto/logout.dto.ts`
- `server/src/auth/guards/jwt-auth.guard.ts`
- `server/src/auth/guards/permissions.guard.ts`
- `server/src/auth/decorators/current-user.decorator.ts`
- `server/src/auth/decorators/permissions.decorator.ts`
- `server/src/auth/types/*`
- `server/src/config/env.validation.ts`
- `server/src/main.ts`
- `server/prisma/seed.ts`
- `server/.env.example`
- `server/package.json`
- `server/package-lock.json`

---

## 2026-04-28 - Protected Users and Clients API Foundation

Context:
Auth foundation and JWT refresh rotation were completed, but domain-level protected endpoints were still limited. `users` and `clients` modules needed their first real protected read APIs with backend authorization and object-level scope checks.

Decision:
Implemented protected users/clients read foundation under `/api/v1`:
- `GET /users/me`
- `GET /users`
- `GET /users/:id`
- `GET /clients`
- `GET /clients/:id`
- `GET /clients/me`

Authorization design in this milestone:
- `JwtAuthGuard` + `PermissionsGuard` are used at controller level.
- `GET /users` is guarded with `users.read` permission.
- Service-level object authorization is enforced for user/client ownership scope.
- Admin can read full users/client profile scopes.
- Client can read only own `clientProfile` scope.
- Employee assignment model is not implemented yet; `clients.read.assigned` is intentionally constrained (safe empty/limited behavior).

Security behavior:
- No sensitive auth fields are exposed by these responses (`passwordHash`, refresh token plaintext/hash, and token internals are not returned).

Operational verification:
- `npm run build` passed
- `npm run check` passed

Reason:
Creates the first production-shaped protected domain API layer after auth, while keeping tenant isolation and incremental delivery before assignment modeling and frontend integration.

Affected files:
- `server/src/users/users.module.ts`
- `server/src/users/users.controller.ts`
- `server/src/users/users.service.ts`
- `server/src/clients/clients.module.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`

---

## 2026-04-28 - Employee Client Assignment Model

Context:
Protected users/clients endpoints were implemented, but employee client access was still placeholder-scoped because assignment relations were not modeled yet. `clients.read.assigned` existed in permissions but could not be enforced against real data.

Decision:
Implemented assignment-based employee client access with a dedicated Prisma model and updated clients authorization flow:
- Added `EmployeeClientAssignment` model
- Added `EmployeeClientAssignmentScope` enum
- Added `User.employeeClientAssignments` relation
- Added `ClientProfile.employeeAssignments` relation
- Added assignment uniqueness and query indexes:
  - `@@unique([employeeUserId, clientProfileId, scope])`
  - `@@index([employeeUserId, isActive])`
  - `@@index([clientProfileId, isActive])`
  - `@@index([scope, isActive])`

Seed updates:
- Expanded demo client profiles to 3:
  - `acme-e-ticaret`
  - `nova-performance`
  - `mavi-sosyal`
- Seeded active employee-client assignments:
  - `project@socialtech.com` -> 3 clients (`PROJECT`)
  - `performance@socialtech.com` -> 2 clients (`PERFORMANCE`)
  - `social@socialtech.com` -> 2 clients (`SOCIAL_MEDIA`)

Authorization behavior changes:
- `GET /api/v1/clients` now returns only actively assigned client profiles for employee accounts with `clients.read.assigned`.
- `GET /api/v1/clients/:id` now allows employee access only when there is an active assignment; otherwise returns safe `404`.
- Admin and client account behavior remains unchanged.
- `JwtAuthGuard` + `PermissionsGuard` + service-level object authorization remain in place.

Operational and runtime notes:
- Exported `JwtModule` from `AuthModule` to resolve runtime DI availability for guard dependencies in feature modules.
- Verified successfully:
  - `npm run prisma:generate`
  - `npm run prisma:push`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`

Reason:
Moves employee client visibility from placeholder behavior to enforceable backend authorization scope, while preserving phased rollout for assignment management APIs and test coverage.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/clients/clients.service.ts`
- `server/src/auth/auth.module.ts`

---

## 2026-04-28 - Authorization E2E Test Matrix

Context:
Auth flow, users/clients protected endpoints, and employee assignment scope were implemented, but backend authorization behavior still relied on manual validation. A repeatable e2e verification layer was required before broader domain rollout.

Decision:
Added a Jest + ts-jest + supertest based e2e test foundation under `server/test/` and implemented an authorization matrix suite for users/clients endpoints.

Implemented test characteristics:
- Tests run against real `AppModule` bootstrapping and real guards (`JwtAuthGuard`, `PermissionsGuard`).
- No guard mocking/override is used.
- Runtime setup derives assigned/unassigned client IDs from seeded DB data (no hardcoded UUID dependency).

Added safe e2e runner:
- `server/test/run-e2e.cjs` prepares Prisma and runs Jest in one controlled flow (migration-first flow now in use).
- Runner validates `DATABASE_URL` against test-style naming and blocks unsafe targets by default.
- Explicit override is possible via `ALLOW_E2E_DB_RESET=true`.

Authorization matrix coverage (10 tests):
- admin users list -> `200`
- client users list -> `403`
- employee users list -> `403`
- admin clients list -> `200`
- client clients/me -> `200`
- client another client id -> `403`
- employee assigned clients list -> `200`
- employee assigned client detail -> `200`
- employee unassigned client detail -> `404`
- unauthenticated protected request -> `401`

Validation:
- `npm run typecheck:spec` passed
- `npm run check` passed
- `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (`10/10`)
- Final DB-connected validation after migration-first + test DB access fix: `3/3` suites and `64/64` tests passed on `socialtech_test` (`authz`, `projects-tasks-authz`, `admin-users-password-authz`).

Reason:
Creates a reliable backend authz regression gate before frontend integration and broader domain endpoint expansion.

Affected files:
- `server/package.json`
- `server/package-lock.json`
- `server/tsconfig.spec.json`
- `server/test/jest-e2e.config.cjs`
- `server/test/jest.env.ts`
- `server/test/run-e2e.cjs`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Assignment Management API

Context:
Auth flow, protected users/clients endpoints, and assignment-based employee client visibility were implemented, but admins could not yet manage employee-client assignments via API. Authorization e2e coverage also needed to expand beyond users/clients matrix cases.

Decision:
Implemented a dedicated admin assignment management module under `server/src/admin-assignments/` and wired it into `AppModule`.

Added endpoints:
- `GET /api/v1/admin/assignments`
- `POST /api/v1/admin/assignments`
- `PATCH /api/v1/admin/assignments/:id`
- `PATCH /api/v1/admin/assignments/:id/deactivate`
- `PATCH /api/v1/admin/assignments/:id/activate`

Authorization design:
- Route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions`
- Service-level: explicit `ADMIN` account type + `ADMIN` role check and permission check
- Admin permissions: `assignments.read`, `assignments.manage`

Seed updates:
- Added permissions `assignments.read` and `assignments.manage`
- Admin role receives these permissions
- Non-admin stale mappings for these permissions are cleaned idempotently during seed

Behavior and safety:
- Query filtering support on list endpoint (`employeeUserId`, `clientProfileId`, `isActive`, `scope`)
- Employee/client existence validation on create
- Active duplicate assignment create returns conflict
- Inactive duplicate assignment is reactivated instead of creating a duplicate row
- Responses are sanitized (no password hashes, token hashes, refresh token internals)
- Prisma schema was not changed; existing `EmployeeClientAssignment` model is reused

Testing:
- Expanded authz e2e matrix to include admin assignment management scenarios
- Authz suite now passes `19/19`
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz`

Reason:
Completes the first admin-managed assignment lifecycle foundation and extends backend authorization regression coverage before frontend API integration and broader domain endpoint rollout.

Affected files:
- `server/src/app.module.ts`
- `server/src/admin-assignments/admin-assignments.module.ts`
- `server/src/admin-assignments/admin-assignments.controller.ts`
- `server/src/admin-assignments/admin-assignments.service.ts`
- `server/src/admin-assignments/dto/create-assignment.dto.ts`
- `server/src/admin-assignments/dto/update-assignment.dto.ts`
- `server/src/admin-assignments/dto/assignment-query.dto.ts`
- `server/prisma/seed.ts`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-28 - Hardened E2E Database Guard and Assignment Negative Tests

Context:
Authorization e2e coverage existed for users/clients/admin-assignment happy-path and core access matrix, and the e2e runner had a safety check. However, DB guard bypass risk and missing assignment negative-case coverage still remained.

Decision:
Hardened the e2e runner database guard and expanded assignment authorization negative-case test coverage.

Runner hardening (`server/test/run-e2e.cjs`):
- E2E execution now strictly requires a test-like DB name in `DATABASE_URL`.
- Allowed DB name patterns:
  - `_test`
  - `test_`
  - `testing`
- `ALLOW_E2E_DB_RESET=true` no longer bypasses the DB-name guard.
- Guard matching was made delimiter-aware to reduce false-positive risk.
- Non-test URL + `ALLOW_E2E_DB_RESET=true` was smoke-tested and correctly rejected.

Authz e2e expansion (`server/test/authz.e2e-spec.ts`):
- Added assignment admin CRUD negative-case scenarios:
  - invalid `employeeUserId` UUID -> `400`
  - invalid `clientProfileId` UUID -> `400`
  - invalid `scope` enum -> `400`
  - missing required fields -> `400`
  - non-existent `employeeUserId` -> `400`
  - non-existent `clientProfileId` -> `400`
  - `employeeUserId` from client account -> `400`
  - duplicate create -> `409`
  - update invalid UUID -> `400`
  - update null payload -> `400`
  - deactivate non-existent assignment -> `404`
  - activate non-existent assignment -> `404`
- Runtime UUID resolution remains dynamic (no hardcoded UUIDs).
- Existing matrix behavior was preserved.
- Total authz suite result: `30/30` passing.

Validation:
- `npm run typecheck:spec` passed
- `npm run check` passed
- `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (using test DB name `socialtech_test`)

Reason:
Reduces accidental non-test DB mutation risk and strengthens authorization regression coverage for assignment management edge cases before broader domain rollout.

Affected files:
- `server/test/run-e2e.cjs`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-28 - Projects and Tasks API Foundation

Context:
Backend auth, users/clients protected APIs, employee-client assignment model, and admin assignment management were completed. Project/task operations were still mock-only and not yet protected with backend object-level authorization.

Decision:
Implemented `projects` and `tasks` domain API foundations under `server/` with role-scoped authorization and assignment-aware object-level checks.

Data model updates:
- Added Prisma models: `Project`, `Task`
- Added enums: `ProjectStatus`, `TaskStatus`, `Priority`
- Added relations:
  - `ClientProfile -> Project[]`
  - `Project -> Task[]`
  - `Task -> assignee User?`
  - `User -> assignedTasks[]`
- Added indexes:
  - Project: `clientProfileId`, `status`, `priority`
  - Task: `projectId`, `assigneeUserId`, `status`, `priority`
- Enforced client-scoped slug uniqueness for projects: `@@unique([clientProfileId, slug])`

Seed updates:
- Seeded 3 client-scoped projects:
  - `acme-e-ticaret/growth-hub-launch`
  - `nova-performance/paid-acquisition-optimization`
  - `mavi-sosyal/social-calendar-refresh`
- Seeded 7 realistic tasks
- Assignee resolution is idempotent and natural-key based (email), no brittle hardcoded UUID dependency

API endpoints added:
- Projects:
  - `GET /api/v1/projects`
  - `GET /api/v1/projects/:id`
  - `POST /api/v1/projects`
  - `PATCH /api/v1/projects/:id`
- Tasks:
  - `GET /api/v1/tasks`
  - `GET /api/v1/tasks/:id`
  - `POST /api/v1/tasks`
  - `PATCH /api/v1/tasks/:id`

Authorization behavior:
- Admin: full project/task read-write scope
- Employee:
  - read only active-assignment-scoped projects/tasks
  - update only `status` on own assigned tasks within active assignment scope
- Client:
  - read only own `clientProfileId`-scoped projects/tasks
- Out-of-scope detail access preserves safe `404` behavior

Validation/testing:
- Added DTO/query validation for projects/tasks
- Added e2e suite: `server/test/projects-tasks-authz.e2e-spec.ts`
- Added regression coverage to ensure assignment deactivation removes employee task visibility in that client scope
- Authz e2e suites now pass `64/64` (`3/3` suites) after DB access fix and full suite re-run on `socialtech_test`
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz`

Known follow-up risks left intentionally out of this milestone:
- Project-manager project/task manage policy is currently admin-only behavior and needs explicit product decision
- Assignment CRUD concurrency/race-condition e2e coverage remains pending

Reason:
Establishes secure, RBAC-aware backend foundations for project/task data before frontend API integration and broader domain rollout.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/app.module.ts`
- `server/src/projects/*`
- `server/src/tasks/*`
- `server/test/projects-tasks-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Users Management API

Context:
Backend auth, protected users/clients/assignments/projects/tasks foundations, and admin employee creation were already implemented. Admin-side employee lifecycle operations (list, detail, update, deactivate, activate, reset-password) were still incomplete.

Decision:
Completed Admin Users Management API under `server/src/admin-users/` while preserving existing `POST /api/v1/admin/users`.

Implemented endpoints:
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id/deactivate`
- `PATCH /api/v1/admin/users/:id/activate`
- `PATCH /api/v1/admin/users/:id/reset-password`

Authorization design:
- Route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("users.manage")`
- Service-level: explicit `ADMIN` account type + `ADMIN` role + `users.manage` checks

Behavior and safety:
- List query filters: `accountType`, `role`, `isActive`, `search`
- Update scope restricted to: `displayName`, `role`, `isActive`
- `email` and `accountType` updates are intentionally blocked
- Mutation endpoints are intentionally restricted to `EMPLOYEE` targets
- Self-protection:
  - admin cannot deactivate self
  - admin cannot change own `role` / activation status through management update
- Deactivate uses soft status transition: `User.status = INACTIVE`
- Deactivate revokes active refresh tokens for target user
- Activate sets `User.status = ACTIVE`
- Reset-password uses bcrypt hashing and revokes active refresh tokens
- Response payloads remain sanitized (no `passwordHash`, refresh token internals, or token hashes)

Validation/testing:
- Added DTOs:
  - `AdminUserQueryDto`
  - `UpdateAdminUserDto`
  - `ResetAdminUserPasswordDto`
- Added e2e suite:
  - `server/test/admin-users-management-authz.e2e-spec.ts`
- Authz pattern run:
  - `4/4` suites passed
  - `81/81` tests passed
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:migrate:deploy`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` (with `socialtech_test`)

Known follow-up risks:
- Access tokens are stateless and may remain valid until expiry after deactivate/reset-password.
- `GET /admin/users` currently has no pagination.
- Admin user management actions are not yet written to audit logs.

Reason:
Completes backend employee lifecycle management for admins with controlled scope and RBAC enforcement before frontend management integration.

Affected files:
- `server/src/admin-users/admin-users.controller.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/src/admin-users/dto/admin-user-query.dto.ts`
- `server/src/admin-users/dto/update-admin-user.dto.ts`
- `server/src/admin-users/dto/reset-admin-user-password.dto.ts`
- `server/test/admin-users-management-authz.e2e-spec.ts`

---

## 2026-04-28 - Access Token Invalidation with sessionInvalidatedAt

Context:
Refresh-token rotation/revoke was already implemented, but access tokens were stateless and could remain valid until expiry after password reset/deactivation/role changes.

Decision:
Implemented access-token invalidation using `User.sessionInvalidatedAt` with JWT `siv` (session invalidation version) claim support.

Implementation summary:
- Prisma `User` model extended with nullable `sessionInvalidatedAt DateTime?`.
- Migration-first flow used; no `db push`.
- New migration:
  - `server/prisma/migrations/20260428211614_add_session_invalidated_at/migration.sql`
- JWT payload types extended with optional `siv` (ms timestamp snapshot) and existing `iat` compatibility.

Guard/session validation:
- `JwtAuthGuard` now fetches `sessionInvalidatedAt` from DB.
- Validation order:
  1) user active check
  2) `siv` match check against current `sessionInvalidatedAt`
  3) if `siv` absent, backward-compatible fallback: `iat <= sessionInvalidatedAt` invalidates token
- Mismatch returns `401 Unauthorized`.

Invalidation triggers:
- `PATCH /api/v1/users/me/password`:
  - updates password hash
  - revokes active refresh tokens
  - sets `sessionInvalidatedAt = now`
- `PATCH /api/v1/admin/users/:id/reset-password`:
  - updates password hash
  - revokes active refresh tokens
  - sets `sessionInvalidatedAt = now`
- `PATCH /api/v1/admin/users/:id/deactivate`:
  - sets `status = INACTIVE`
  - revokes active refresh tokens
  - sets `sessionInvalidatedAt = now`
- `PATCH /api/v1/admin/users/:id`:
  - role change -> `sessionInvalidatedAt = now`
  - `isActive=false` -> `sessionInvalidatedAt = now`
  - displayName-only update -> no session invalidation
- `activate` does not clear `sessionInvalidatedAt`, so stale tokens do not become valid again.

Refresh behavior:
- Existing revoked-token reuse handling preserved; revoked check remains before session invalidation check.
- Refresh tokens also validate session via `siv` (with `iat` fallback).

Validation/testing:
- Added e2e suite:
  - `server/test/access-token-invalidation-authz.e2e-spec.ts`
- Authz pattern run:
  - `5/5` suites passed
  - `88/88` tests passed
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:migrate:dev -- --name add-session-invalidated-at`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz`

Known follow-up risks:
- Admin users list pagination/sorting is still pending.
- Admin user management audit logs are still pending.
- Pre-`siv` legacy tokens rely on fallback `iat` evaluation.

Reason:
Provides deterministic invalidation of previously issued access tokens after security-sensitive account changes while preserving migration-first and existing RBAC behavior.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260428211614_add_session_invalidated_at/migration.sql`
- `server/src/auth/types/token-payload.type.ts`
- `server/src/auth/guards/jwt-auth.guard.ts`
- `server/src/auth/auth.service.ts`
- `server/src/users/users.service.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/test/access-token-invalidation-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin User Management Audit Logging

Context:
Admin user lifecycle endpoints were already implemented (`create`, `update`, `deactivate`, `activate`, `reset-password`) but actions were not yet persisted as durable audit trail entries.

Decision:
Implemented centralized audit write infrastructure for admin user management actions using existing `AuditLog` model (no schema change). Added `AuditLogService` + `AuditLogModule` and integrated admin user mutation flows to write audit entries in the same Prisma transaction as the business mutation.

Audit actions written:
- `ADMIN_USER_CREATED`
- `ADMIN_USER_UPDATED`
- `ADMIN_USER_DEACTIVATED`
- `ADMIN_USER_ACTIVATED`
- `ADMIN_USER_PASSWORD_RESET`

Operational behavior:
- Controller passes request context (`ipAddress`, `userAgent`) to service layer.
- Audit metadata includes safe fields (`actorUserId`, `targetUserId`, `changedFields`, and where applicable role/status transitions).
- Sensitive key fragments (`password`, `passwordHash`, `token`, `secret`, `authorization`) are recursively removed before persistence.
- Forbidden employee/client calls do not create audit rows.
- Audit failure fails the parent mutation (transactional consistency).

Validation:
- `npm run prisma:generate` passed
- `npm run prisma:seed` passed
- `npm run build` passed
- `npm run check` passed
- authz pattern passed: `5/5 suites`, `102/102 tests`

Reason:
Provides traceability and tamper-resistant operational history for privileged admin user management actions.

Affected files:
- `server/src/audit-log/audit-log.module.ts`
- `server/src/audit-log/audit-log.service.ts`
- `server/src/admin-users/admin-users.module.ts`
- `server/src/admin-users/admin-users.controller.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/test/admin-users-management-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Audit Logs Read API

Context:
Audit log writes were active, but there was no backend read API for admin-side “operation history / audit logs” screens.

Decision:
Added admin-only audit log read endpoints under `/api/v1/admin/audit-logs` with validation, filtering, pagination, sorting, and metadata sanitization:
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:id`

Authorization:
- Route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("audit_logs.read")`
- Service-level: `AccountType.ADMIN` + `UserRole.ADMIN` + permission assertion
- No seed/catalog change needed because `audit_logs.read` was already present and mapped for admin role.

Query/response behavior:
- Pagination: `page` default `1` (min `1`, max `10000`), `limit` default `20` (min `1`, max `100`)
- Sorting: `sortBy` (`createdAt`, `action`, `entityType`), `sortOrder` (`asc`, `desc`), default `createdAt desc`, stable secondary `id asc`
- Filters: `action`, `actorUserId`, `targetUserId`, `targetClientProfileId`, `entityType`, `entityId`, `dateFrom`, `dateTo`, `search`
- `dateFrom > dateTo` => `400`
- List response: `data + meta` envelope
- Detail response: single sanitized log row or `404`
- Metadata is recursively sanitized on read (`password`, `token`, `secret`, `authorization`, `apikey`, `credential`, `cookie` key fragments removed)

Validation:
- `npm run prisma:generate` passed
- `npm run prisma:seed` passed
- `npm run build` passed
- `npm run check` passed
- authz pattern passed: `6/6 suites`, `123/123 tests`

Reason:
Enables secure and filterable admin-facing audit log consumption without exposing sensitive operational data.

Affected files:
- `server/src/admin-audit-logs/admin-audit-logs.module.ts`
- `server/src/admin-audit-logs/admin-audit-logs.controller.ts`
- `server/src/admin-audit-logs/admin-audit-logs.service.ts`
- `server/src/admin-audit-logs/dto/audit-log-query.dto.ts`
- `server/src/app.module.ts`
- `server/test/admin-audit-logs-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Users Pagination and Sorting

Context:
`GET /api/v1/admin/users` existed under Admin Users Management API, but returned an unpaginated list. As user volume grows, list performance, predictable ordering, and frontend consumption shape needed a stable contract.

Decision:
Added strict pagination/sorting to `GET /api/v1/admin/users` while preserving existing auth and filter behavior.

Implemented contract:
- Pagination:
  - `page` default `1`, min `1`, max `10000`
  - `limit` default `20`, min `1`, max `100`
  - invalid values return `400`
  - offset paging: `skip = (page - 1) * limit`, `take = limit`
- Sorting:
  - `sortBy`: `createdAt | updatedAt | displayName | email | lastLoginAt | role | status`
  - `sortOrder`: `asc | desc`
  - default: `createdAt desc`
  - Prisma `orderBy` is built from a whitelist map (no raw query field passthrough)
  - stable secondary sort: `id asc`
- Response shape changed from array to paginated envelope:
  - `data: AdminUserResponse[]`
  - `meta: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }`
- Existing filters preserved:
  - `accountType`, `role`, `isActive`, `search`
  - `search` is trimmed; empty search is ignored; email/displayName case-insensitive search remains
- Authorization and safety preserved:
  - `JwtAuthGuard` + `PermissionsGuard` + `users.manage`
  - employee/client still `403`, unauthenticated still `401`
  - sensitive fields remain excluded from responses

Validation:
- `npm run prisma:generate` passed
- `npm run build` passed
- `npm run check` passed
- DB-connected authz suite re-run passed on `socialtech_test`: `5/5` suites, `100/100` tests

Reason:
Establishes a scalable and frontend-friendly admin users list contract without widening scope to schema changes or new domain behavior.

Affected files:
- `server/src/admin-users/dto/admin-user-query.dto.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/test/admin-users-management-authz.e2e-spec.ts`

---

## 2026-04-29 - Frontend Auth Integration with Redux Toolkit and RTK Query

Context:
`adminandemployeePanel/` and `clientPanel/` were still using frontend-only/demo auth gates while backend auth endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`) were already productionized in `server/`.

Decision:
Integrated both frontend apps to backend auth using Redux Toolkit + RTK Query.
- Added shared auth stack in both apps: `@reduxjs/toolkit`, `react-redux`, `redux@5`
- Implemented Redux auth state + RTK Query `baseApi` with:
  - `credentials: include`
  - Bearer token header from Redux memory state
  - `401 -> refresh -> retry` flow
  - refresh single-flight lock
- Access token remains in Redux memory only; refresh token lifecycle remains backend-managed via HttpOnly cookie.
- `adminandemployeePanel`: `ADMIN` users route to admin shell, `EMPLOYEE` users route to employee shell, `CLIENT` accounts are blocked from this app.
- `clientPanel`: accepts only `CLIENT` accounts; state-based portal navigation remains intact and service selection restore stays localStorage-backed.
- `RoleContext` in `adminandemployeePanel` is no longer auth source of truth; Redux auth state is canonical.

Validation:
- `adminandemployeePanel npm run check` passed
- `clientPanel npm run check` passed
- `server npm run build` and `npm run check` passed
- Runtime manual QA remains a separate validation step.

Reason:
Aligns both SPAs with the backend auth model while keeping integration incremental and preserving existing UI/navigation structure.

Affected files:
- `adminandemployeePanel/src/app/store/*`
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `adminandemployeePanel/src/app/features/auth/*`
- `adminandemployeePanel/src/app/pages/Login.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/main.tsx`
- `clientPanel/src/app/store/*`
- `clientPanel/src/app/services/baseApi.ts`
- `clientPanel/src/app/features/auth/*`
- `clientPanel/src/app/components/client-login.tsx`
- `clientPanel/src/app/components/topbar.tsx`
- `clientPanel/src/app/App.tsx`

---

## 2026-04-29 - Nest Build Incremental Output Fix

Context:
Backend runtime experienced intermittent `dist` output/module resolution issues during watch/build cycles.

Decision:
Disabled incremental build for Nest build config via `server/tsconfig.build.json` (`"incremental": false`) to force full deterministic output generation in `dist`.

Validation:
- `server npm run build` passed
- `server npm run check` passed

Reason:
Prioritizes runtime reliability over incremental build speed for current backend development flow.

Affected files:
- `server/tsconfig.build.json`

---

## 2026-04-30 - Admin Summary Endpoint and Client List Server-Side Query Contract

Context:
Admin dashboard KPIs were being derived from multiple list endpoints, increasing frontend request cost and coupling. `GET /api/v1/clients` also lacked a unified server-side pagination/filter/sort contract for growing datasets.

Decision:
Implemented two backend contract changes:
1. Added dedicated admin KPI endpoint:
   - `GET /api/v1/admin/summary`
   - admin-only (`JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("admin.summary.read")`)
   - service-level `ADMIN` account/role + permission enforcement
   - count/aggregate style response for users, clients, projects, tasks, audit logs
2. Standardized `GET /api/v1/clients` to server-side query + envelope response:
   - query: `page`, `limit`, `sortBy`, `sortOrder`, `status`, `search`
   - validated and whitelist-mapped sorting
   - response shape: `data[] + meta`
   - role/object-scope behavior preserved for admin/employee/client

Reason:
Reduces dashboard integration overhead, improves API consistency for frontend pagination/filter UX, and keeps authorization guarantees intact.

Affected files:
- `server/src/admin-summary/admin-summary.module.ts`
- `server/src/admin-summary/admin-summary.controller.ts`
- `server/src/admin-summary/admin-summary.service.ts`
- `server/src/clients/dto/client-query.dto.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`
- `server/src/app.module.ts`
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/prisma/migrations/20260430000000_add_client_profile_status/migration.sql`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-30 - Admin Panel Dashboard/Clients/ClientDetail Backend Integration and Test Hardening

Context:
`adminandemployeePanel` auth integration was complete, but dashboard KPIs and some domain pages still needed stronger backend-driven contracts and resilient test coverage.

Decision:
Connected core admin pages fully to backend API contracts using existing Redux Toolkit + RTK Query architecture:
- Dashboard now consumes `GET /admin/summary` via dedicated feature slice (`dashboardApi`).
- Clients list now consumes server-side paginated/filterable/sortable `GET /clients` envelope.
- Client detail now includes related projects/tasks overview via existing projects/tasks query filters.
- Strengthened frontend test coverage and resiliency:
  - Dashboard and ClientDetail backend-state tests
  - Projects/Tasks permission-path checks
  - Combobox interactions moved to label/ARIA-oriented selectors for lower brittleness.

Reason:
Improves runtime performance and maintainability, removes dependency on multi-list KPI derivation, and increases confidence in permission-aware UI behavior.

Affected files:
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/*`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/features/tasks/*`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/pages/EmployeeDetail.test.tsx`
- `adminandemployeePanel/src/app/pages/AuditLogs.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/*`
## 2026-04-29 - Client Summary Endpoint and ClientDetail Overview

- Added backend `GET /api/v1/clients/:id/summary` as a single-source client overview endpoint.
- Endpoint response standardizes:
  - `client` basic profile
  - `projects` count breakdown + `recent` (max 5)
  - `tasks` count breakdown + `recent` (max 5)
  - `meta.generatedAt`
- Kept existing route guard chain (`JwtAuthGuard`, `PermissionsGuard`) and reused object-level access from `getClientById`.
- Added explicit summary permission checks per actor:
  - Admin: `projects.read.any`, `tasks.read.any`
  - Employee: `projects.read.assigned`, `tasks.read.assigned`
  - Client: `projects.read.own`, `tasks.read.own`
- Preserved secure cross-tenant deny behavior (`403/404`) consistent with existing client detail rules.
- Frontend `ClientDetail` now uses summary endpoint as primary data source (removed multi-query derived overview path).
- Count/recent overview UI is rendered directly from summary payload; loading/error/invalid/not-found/empty states were retained.
