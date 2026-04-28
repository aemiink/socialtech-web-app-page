# Project Context

## Product Summary

Social Tech is a premium digital growth agency. This repository contains multiple Vite + React SPAs for agency operations and client visibility: an Admin Panel, an Employee Panel (role-based), a public/marketing client site, and a Client Portal. The UI is in Turkish. Frontend business data is still mostly mock/static while backend API/auth integration is phased in.

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
- Package manager: npm (canonical) in `adminandemployeePanel/`, `clientPanel/`, and `server/` (`packageManager: npm@11.8.0`)
- TypeScript: Yes (strict expected per CLAUDE.md)
- Backend: NestJS + TypeScript in `server/` (single shared API with implemented auth endpoints; frontend integration is still pending)
- Frontend business data is still mock/static until API integration phases

## Main User Roles

Defined in `RoleContext.tsx`:
- `admin` — full access to all modules
- `project-manager` — client processes, tasks, approvals, deliverables
- `performance-specialist` — ad campaigns, optimizations, pixel tracking
- `social-media-specialist` — content calendar, captions, DMs, publishing
- `designer` — creatives, UI designs, revisions, delivery files
- `developer` — sprints, frontend/backend tasks, bugs, testing
- `support-specialist` — support tickets, maintenance, security, backups
- `seo-specialist` — SEO audit, keyword tracking, index status, Search Console

There are two panel types:
- Admin Panel (protected by frontend demo login, flat navigation)
- Employee Panel (protected by frontend demo login, role-gated sidebar via `RoleContext`)

There is also a Client Portal as a separate sub-app at `clientPanel/`.

## Main Modules

### Admin Panel (`/` routes)
Dashboard, Clients (Müşteriler), Services (Hizmetler), Projects (Projeler), Tasks (Görevler), Approvals (Onaylar), Campaigns (Kampanyalar), Contents (İçerikler), Reports (Raporlar), Meetings (Toplantılar), Employees (Çalışanlar), Finance (Finans), Automations (Otomasyonlar), Settings (Ayarlar)

### Employee Panel (`/employee` routes)
Role-based sidebar. Common pages: Dashboard, Gorevlerim, Musterilerim, Takvim, Bildirimler, Dosyalar, Ayarlar. Specialist pages vary per role (see routes.tsx).

### Client Portal
Separate Vite + React SPA at `clientPanel/`. It is a customer-facing visibility panel, not a public SaaS product.

Portal areas:
- Frontend demo client login gate
- Service selection screen with 13 active Social Tech services
- Service-specific dashboards for Growth & Hub, Social Media, Media Hub, Meta/TikTok/Google/Amazon Ads, Web App, Mobile App, Landing Pages, Web & Mobile Design, Technical Support, and SEO Audit
- Generic service tab workspace for service-specific sections
- Shared pages: Reports, Meetings, Billing, Settings
- Floating Client Action Center for approvals, revisions, report/file actions, and action history

## Auth & RBAC Summary

- Frontend auth remains demo/local in both SPAs:
  - Admin + Employee login via `/login` in `adminandemployeePanel/` (`RoleContext` + `localStorage`)
  - Client Portal login gate in `clientPanel/` (`localStorage`)
- Backend auth is now implemented under `server/`:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- Access token is returned in response body and used as Bearer token.
- Refresh token is stored as HttpOnly cookie; token plaintext is never stored in DB (`RefreshToken.tokenHash`).
- Refresh token rotation is enabled; revoked-token reuse attempt triggers bulk revocation of active sessions for that user.
- `JwtAuthGuard` and `CurrentUser` decorator are active; `RequirePermissions` + `PermissionsGuard` exist as backend authorization scaffolding.
- `/auth/me` is guard-protected and returns role + resolved permission set + `ClientProfile` for client users.
- Protected domain API foundation is now active for `users` and `clients`:
  - `GET /api/v1/users/me`
  - `GET /api/v1/users`
  - `GET /api/v1/users/:id`
  - `GET /api/v1/clients`
  - `GET /api/v1/clients/:id`
  - `GET /api/v1/clients/me`
- `GET /users` enforces `users.read`; service-level object authorization protects `/users/:id` and `/clients/:id`.
- Admin can read full users/client profile scopes; client users are limited to their own `ClientProfile` scope.
- Employee assignment scope is now modeled via `EmployeeClientAssignment` + active assignment checks.
- Employee users with `clients.read.assigned` can read only assigned client profiles (`GET /clients`) and assigned profile detail (`GET /clients/:id`); unassigned detail resolves as safe `404`.
- Authz e2e matrix is now automated in backend tests (`server/test/authz.e2e-spec.ts`) and validated with real guard chain behavior.
- Full domain endpoint authorization rollout beyond users/clients remains pending.

## Frontend Architecture

- Entry: `adminandemployeePanel/src/main.tsx`
- App root: `adminandemployeePanel/src/app/App.tsx`
- Router: `adminandemployeePanel/src/app/routes.tsx` (createBrowserRouter)
- Login page: `adminandemployeePanel/src/app/pages/Login.tsx`
- Layouts:
  - `RootLayout` — Admin Panel shell (sidebar + topbar + `<Outlet />`)
  - `EmployeeLayout` — Employee Panel shell (role-aware sidebar + topbar + `<Outlet />`)
- Contexts: `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
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
- Login: `clientPanel/src/app/components/client-login.tsx`
- Navigation: frontend demo login gate, then state-based in-app navigation using `selectedService` and `currentPage` in `App.tsx`; no current React Router route file
- Core components:
  - `clientPanel/src/app/components/sidebar.tsx` — service-specific sidebar menu
  - `clientPanel/src/app/components/topbar.tsx` — selected service and demo client identity
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
- Hybrid RBAC strategy selected: fixed `User.role` enum is kept, permission expansion is modeled via `Permission` + `RolePermission`
- Demo seed foundation exists at `server/prisma/seed.ts`:
  - Seeds demo admin/employee/client accounts
  - Seeds permission catalog and role-permission mappings
  - Seeds 3 demo client profiles (`acme-e-ticaret`, `nova-performance`, `mavi-sosyal`)
  - Links `client@socialtech.com` to `acme-e-ticaret`
  - Seeds active employee-client assignments for `project@socialtech.com`, `performance@socialtech.com`, and `social@socialtech.com`
- Auth implementation:
  - `POST /api/v1/auth/login` (email/password validation, bcrypt verify, legacy seed hash upgrade path)
  - `POST /api/v1/auth/refresh` (refresh JWT verification, DB hash check, rotation)
  - `POST /api/v1/auth/logout` (refresh token revoke)
  - `GET /api/v1/auth/me` (guarded user profile + permissions)
- Protected users/clients foundation:
  - Users: `GET /api/v1/users/me`, `GET /api/v1/users`, `GET /api/v1/users/:id`
  - Clients: `GET /api/v1/clients`, `GET /api/v1/clients/:id`, `GET /api/v1/clients/me`
  - Controller-level guards: `JwtAuthGuard` + `PermissionsGuard`
  - Service-level object authorization for owner/admin scope isolation
  - Employee clients scope uses active assignment filtering (`clients.read.assigned`)
- Authz e2e testing foundation:
  - Jest + ts-jest + supertest under `server/test/`
  - E2E runner: `server/test/run-e2e.cjs` (Prisma prepare + Jest execution)
  - DB safety guard in runner: test-scoped DB check + optional `ALLOW_E2E_DB_RESET=true` override
  - Matrix suite currently covers 10 users/clients authorization scenarios
- Token strategy:
  - access token in response body (Bearer usage)
  - refresh token in HttpOnly cookie
  - refresh token persistence as hash only (`RefreshToken.tokenHash`)
- Foundation modules: `health`, `auth`, `users`, `clients`
- Health endpoint: `GET /api/v1/health`
- Validation status:
  - `npm run prisma:generate` passed
  - `npm run prisma:push` passed
  - `npm run prisma:seed` passed
  - `npm run build` passed
  - `npm run check` passed
  - `npm run typecheck:spec` passed
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (`10/10`)
  - manual auth flow tests passed (`login`, `me`, `refresh`, `logout`, `logout` sonrası `refresh=401`)

Planned next backend phases:
- Broader domain endpoint authorization rollout (beyond users/clients)
- Assignment admin CRUD endpoints (manage employee-client links and assignment activation)
- Frontend API/auth integration for `adminandemployeePanel/` and `clientPanel/`
- Migration-first Prisma workflow (replace current `db push` local flow)
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
- `User`: account type (`ADMIN | EMPLOYEE | CLIENT`), fixed role enum, status, optional `clientProfileId`, optional `displayName`, optional `lastLoginAt`
- `RefreshToken`: hashed refresh token persistence, expiration, and revocation metadata used by live refresh/logout flow
- `ClientProfile`: client identity with unique `slug`
- `AuditLog`: actor-based audit event records
- `Permission`: permission catalog table (slug + description)
- `RolePermission`: role-to-permission mapping table for hybrid RBAC expansion
- `EmployeeClientAssignment`: employee-to-client assignment mapping with `scope`, `isActive`, and indexed lookup fields
- `EmployeeClientAssignmentScope`: assignment scope enum (`PROJECT`, `PERFORMANCE`, `SOCIAL_MEDIA`, `DESIGN`, `DEVELOPMENT`, `SUPPORT`, `SEO`)

Current protected read behavior:
- User/client responses are sanitized; auth-sensitive fields are excluded (`passwordHash`, refresh token/hash fields).
- Object-level authorization is enforced in services for `users/:id`, `clients/:id`, and `clients/me`.
- Employee access to `/clients` and `/clients/:id` is assignment-based (`isActive=true`) for accounts with `clients.read.assigned`.

Demo seed snapshot (current local run):
- `users=9`
- `permissions=33`
- `role_permissions=107`
- `client_profiles=3`
- `active_employee_client_assignments=7`

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

From `server/package.json`:
```bash
npm run check                  # typecheck + seed typecheck + spec typecheck + build
npm run test:e2e:prepare       # e2e db safety check + prisma generate/push/seed
npm run test:e2e               # full backend e2e suite
npm run test:e2e:authz         # users/clients authorization matrix suite
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz  # explicit override for non-test DB names
```
