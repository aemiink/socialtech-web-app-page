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

## 2026-05-10 - Meta Ads Faz 9 Reporting + Export Foundation (Report Entity + Publish/Ack Bridge)

Context:
Faz 8 sonrası Meta Ads tarafında sync gözlemlenebilir hale geldi ancak rapor üretimi hâlâ insight tabanlı anlık görünüm seviyesindeydi. Ajans tarafında draft/publish lifecycle’ı, client-visible rapor ayrımı ve publish sonrası onay/acknowledgement köprüsü için kalıcı bir report domain eksikti.

Decision:
Faz 9 için dedicated `MetaAdsReport` entity’si eklendi ve rapor lifecycle backend-first olarak standartlaştırıldı:

- Prisma’da:
  - `MetaAdsReport` modeli
  - `MetaAdsReportType` enumu
  - `MetaAdsReportStatus` enumu
  - report -> task acknowledgement relation eklendi
- Endpoint yüzeyi:
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
- Publish + acknowledgement request köprüsü:
  - report publish sırasında `Task(approvalType=META_ADS_REPORT_ACKNOWLEDGEMENT, approvalStatus=PENDING)` oluşturulabilir/güncellenebilir
  - report response’unda acknowledgement state normalize edilerek döner (`NOT_REQUESTED`, `PENDING`, `ACKNOWLEDGED`, `CHANGES_REQUESTED`)
- Client panel `meta-reports` sekmesi artık raw insight listesi yerine report entity listesi render eder.

Reason:
Bu karar, raporları sync snapshot’ından ayrı bir domain varlığına taşıyarak ajans deliverable akışını kalıcı hale getirir. Draft/publish/client-visible sınırları netleşir, onay süreci mevcut task approval altyapısıyla yeniden kullanılabilir ve Faz 10 production hardening/export adımları için stabil contract sağlar.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260510013000_add_meta_ads_reports/migration.sql`
- `server/src/meta-ads/dto/create-meta-ads-report.dto.ts`
- `server/src/meta-ads/dto/update-meta-ads-report.dto.ts`
- `server/src/meta-ads/dto/meta-ads-reports-query.dto.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

---

## 2026-05-10 - Meta Ads Faz 10 Production Hardening (Client-Safe Errors + Coverage + Safe Code-Splitting)

Context:
Faz 9 sonrası rapor domain’i ve publish/ack lifecycle çalışır durumdaydı ancak production öncesi hardening için üç kritik alan netleştirilmeliydi: client-facing hata güvenliği, authz/state kapsaması ve bundle davranışı.

Decision:
Faz 10 kapsamında aşağıdaki üretim sertleştirmeleri uygulandı:

- Backend:
  - Own-client on-demand sync hata mesajları client-safe seviyeye düşürüldü.
  - Admin/assigned kullanıcılar için operasyonel hata detayları korunurken client endpointlerde generic güvenli mesaj standardı uygulandı.
  - `meta-ads-authz` e2e kapsamı genişletildi:
    - sync logs limit/pagination davranışı
    - reporting date-range validation (90 gün sınırı)
    - own-client sync error sanitization
- Frontend:
  - Client portal `App.tsx` içinde service/dashboard/tab sayfaları lazy import edildi ve runtime fallback eklendi.
  - Vite `manualChunks` ayarıyla vendor parçalama iyileştirildi.
  - Employee Meta Ads workspace testlerine role-specific tab visibility doğrulaması eklendi (social vs performance).

Reason:
Bu karar, client-facing güvenlik riskini (detaylı hata sızıntısı) azaltır, role/scope davranışını testle güçlendirir ve Meta Ads ağırlıklı ekranlarda ilk yük maliyetini düşürerek production stabilitesini artırır. Değişiklikler framework migration içermeden mevcut Vite + React mimarisiyle uyumludur.

Affected files:
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/App.tsx`
- `clientPanel/vite.config.ts`
- `adminandemployeePanel/vite.config.ts`
- `adminandemployeePanel/src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx`

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

---

## 2026-05-05 - Project Manager Service-Aware Flow and Web APP Workspace V1 Boundary

Context:
The repository now has a working delivery module and a project-scoped Web APP workspace module, but the intended ownership boundary for project-manager flows and the expected shape of workspace messaging needed to be fixed before additional UI/API work. The frontend also uses two navigation models: route-based admin/employee panels and state-based client portal navigation.

Decision:
Define V1 around the existing project-scoped contract instead of introducing a new orchestration layer or navigation rewrite.

- Canonical scope anchor remains `Project`.
- Delivery workflow stays in `server/src/delivery/*` under `/api/v1/delivery/*`.
- Web APP collaboration stays in `server/src/web-app-workspace/*` under `/api/v1/projects/:projectId/web-app-workspace/*`.
- Admin/employee entry remains route-based via `adminandemployeePanel/src/app/routes.tsx`, with Web APP workspace surfaced inside `ProjectDetail`.
- Client Portal keeps its current state-driven navigation in `clientPanel/src/app/App.tsx`; no React Router migration is required for V1.
- Service-aware behavior for project managers is resolved from `project.serviceKey`, assignment scope, and purchased-service/project linkage, not from a new standalone “project-manager workspace” aggregate.
- Workspace messages remain a flat, append-only project/tab feed in V1. The message tree fix is limited to frontend presentation/query discipline and does not introduce threaded replies, parent-child persistence, or a new message domain model.

V1 behavioral boundary:
- Project managers are the only employee role that can manage delivery sprints/releases in assigned scope.
- Assigned project managers, developers, and designers may operate within assigned Web APP workspace scope according to their existing permissions; clients can read/interact only in own scope and never manage internal records.
- Revisions continue to be the structured change-request system of record; messages are lightweight discussion only.

Out of scope for V1:
- No architecture rewrite from Vite SPA to Next.js.
- No client portal router rewrite.
- No new backend aggregator/BFF that merges delivery + workspace into a separate service.
- No threaded message schema (`parentMessageId`, reply trees, per-thread unread state, mentions, reactions).
- No cross-service unified workspace for non-`WEB_APP` projects.

Reason:
This preserves the current architecture, aligns with already implemented backend/project scoping, avoids duplicating delivery/workspace responsibilities, and keeps the message-tree fix incremental instead of expanding into a new collaboration system.

Affected files:
- `DECISIONS.md`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/features/webAppWorkspace/*`
- `server/src/delivery/*`
- `server/src/web-app-workspace/*`

---

## 2026-05-05 - Project Manager Service-Aware Client Workspace Implementation

Context:
Project-manager employee panelinde müşteri operasyon akışı mock/static kalıyordu ve service-aware çalışma modeli net değildi.

Decision:
Project-manager akışı assigned-client merkezli olacak şekilde uygulandı:
- PM girişinde müşteri listesi ve satın alınan hizmet odaklı kart akışı.
- Müşteri detayında purchased services + serviceKey bazlı operasyon girişleri.
- WEB_APP/MOBILE_APP/LANDING_PAGE için workspace sekmeli operasyon ekranı.
- Non-web servislerde mock yerine gerçek project/task/file summary ve explicit empty-state yaklaşımı.

Reason:
PM operasyonunun müşteri ve hizmet bağlamında gerçek veriyle yönetilebilmesi ve mock bağımlılığının kaldırılması.

Affected files:
- `adminandemployeePanel/src/app/employee/dashboards/ProjectManagerDashboard.tsx`
- `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`

---

## 2026-05-05 - Web APP Workspace Message Tree Visibility and Reply Persistence Fix

Context:
Client panelde soru-cevap mesajları görünmeme, yanlış cache anahtarıyla patch, PM/admin tarafında cevap akışında kopukluk ve thread/reply bağının zayıf olması sorunları vardı.

Decision:
Mesaj akışı uçtan uca project+tab bağlamında hizalandı ve reply persistence eklendi:
- `WebAppWorkspaceMessage.parentMessageId` ile parent/reply ilişkisi persist edildi.
- Mesaj listeleme ve websocket patch akışında `{ projectId, tabKey }` cache anahtarı standardize edildi.
- Client ve admin/employee panellerinde reply oluşturma `parentMessageId` ile desteklendi.
- Socket sequence guard korunarak stale/out-of-order patch riski azaltıldı.

Reason:
Client mesajlarının PM/admin/employee tarafına güvenli ve tutarlı görünmesi, PM cevaplarının client tarafında doğru thread altında görünmesi.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260505153000_add_workspace_message_threading/migration.sql`
- `server/src/web-app-workspace/dto/create-workspace-message.dto.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceTypes.ts`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
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

---

## 2026-05-05 - Client Web APP Mock Fallback Removal and Assignment Visibility Hardening

Context:
Client Portal Web APP experience still contained static/mock fallback content in shared reports/meetings/tab flows, and assignment visibility was not explicit enough in admin client detail and developer dashboard.

Decision:
- Removed Web APP-facing mock fallback behavior in client panel pages and switched to API-first rendering with explicit empty states when project/data is unavailable.
- Made admin client detail show active assigned employees for the selected client.
- Added developer dashboard visibility card for assigned clients to make assignment scope immediately visible after assignment.

Reason:
Ensures production-like behavior (no hidden mock data), improves assignment transparency for operations, and reduces confusion during onboarding/testing of newly assigned developer accounts.

Affected files:
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/reports.tsx`
- `clientPanel/src/app/pages/meetings.tsx`
- `clientPanel/src/app/pages/services/web-app-dashboard.tsx`
- `clientPanel/src/app/App.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`
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

---

## 2026-04-29 - Admin Summary Endpoint and Dashboard Integration

Context:
Admin dashboard KPI cards were derived from multiple list endpoints, creating extra request cost and UI/backend contract drift risk.

Decision:
- Added dedicated backend admin KPI endpoint: `GET /api/v1/admin/summary`.
- Fixed contract to:
  - `users`: `total`, `active`, `inactive`, `employees`, `clients`, `admins`
  - `clients`: `total`, `active`, `inactive`
  - `projects`: `total`, `planned`, `inProgress`, `review`, `completed`, `onHold`
  - `tasks`: `total`, `todo`, `inProgress`, `review`, `done`, `blocked`
  - `auditLogs`: `total`, `lastActionAt`
  - `meta`: `generatedAt`
- Removed legacy/extra fields from summary output:
  - `clients.suspended`
  - `tasks.unassigned`
  - `auditLogs.last24Hours`
  - `meta.resourceCount`
- Enforced authorization:
  - route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("admin.summary.read")`
  - service-level: `ADMIN` accountType + `ADMIN` role + permission check
- Integrated `adminandemployeePanel` Dashboard to use only `/admin/summary` (no list-derived KPI path).

Validation:
- Backend authz suites passed (`6/6`, `148/148` at summary rollout checkpoint).
- Frontend dashboard checkpoint passed (`77/77` tests).

Reason:
Centralizes KPI source-of-truth, reduces frontend query fan-out, and stabilizes dashboard contract evolution.

Affected files:
- `server/src/admin-summary/admin-summary.module.ts`
- `server/src/admin-summary/admin-summary.controller.ts`
- `server/src/admin-summary/admin-summary.service.ts`
- `server/src/app.module.ts`
- `server/test/authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardTypes.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardUtils.ts`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Dashboard.test.tsx`

---

## 2026-04-29 - Clients Server-side Pagination and Dashboard Contract Hardening

Context:
Clients list needed consistent server-side pagination/filter/sorting across role scopes. Dashboard frontend also needed a single guard/normalize point against backend summary field drift.

Decision:
- Hardened `GET /api/v1/clients` server-side contract (validated paging/sorting/filter envelope already in place, authz coverage expanded):
  - `data + meta` response
  - `page` (`1..10000`), `limit` (`1..100`), `sortBy/sortOrder` whitelist
  - `search` and `status` filters
  - role-scoped visibility preserved for admin/employee/client
- Updated Clients frontend page to fully query backend params (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `status`) and rely on backend `meta`.
- Fixed stale pagination regression by syncing current page from RTK Query `currentData.meta.page`.
- Added/expanded frontend clients tests for query args, meta-driven pagination, and stale-data transition.
- Added dashboard contract hardening layer:
  - `normalizeAdminSummaryResponse(response: unknown)` in dashboard utils
  - `transformResponse` usage in dashboard API
  - safe defaults for malformed/missing fields and invalid dates
  - removal of any UI dependency on legacy removed summary fields.

Validation:
- Backend authz suite passed (`6/6`, `152/152` latest run).
- Frontend checks passed (`build`, `check`, `test:run` with `10` files, `82/82` tests).

Reason:
Keeps list UX scalable and backend-driven while reducing dashboard breakage risk from contract changes to a single normalization boundary.

Affected files:
- `server/src/clients/dto/client-query.dto.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`
- `server/test/authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
- `adminandemployeePanel/src/app/features/dashboard/dashboardApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardUtils.ts`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Dashboard.test.tsx`
## 2026-04-29 - Admin Client Management API and UI CRUD Integration

- Backend tarafında admin odaklı client management akışı `server/src/admin-clients/*` altında tamamlandı.
- Endpoint seti netleşti:
  - `POST /api/v1/admin/clients`
  - `PATCH /api/v1/admin/clients/:id`
  - `PATCH /api/v1/admin/clients/:id/deactivate`
  - `PATCH /api/v1/admin/clients/:id/activate`
  - `POST /api/v1/admin/clients/:id/owner`
- Owner mode stratejisi:
  - `NONE`
  - `CREATE` (CLIENT account + CLIENT_OWNER role oluşturur)
  - `LINK_EXISTING` (mevcut CLIENT user bağlar; bağlıysa 409)
- `LINK_EXISTING` sonrası session güvenliği için `sessionInvalidatedAt` set + aktif refresh token revoke uygulanır.
- `clients.manage` route-level permission + admin-only service-level auth birlikte korunur (defense-in-depth).
- Client mutation aksiyonları audit log’a transaction içinde yazılır:
  - `ADMIN_CLIENT_CREATED`
  - `ADMIN_CLIENT_UPDATED`
  - `ADMIN_CLIENT_DEACTIVATED`
  - `ADMIN_CLIENT_ACTIVATED`
  - `ADMIN_CLIENT_OWNER_CREATED`
  - `ADMIN_CLIENT_OWNER_LINKED`
- Frontend admin Clients ekranı CRUD + owner assign akışlarıyla backend’e bağlanmıştır; mutation sonrası Clients/Summary/AuditLogs/AdminSummary invalidation aktiftir.

## 2026-04-29 - Admin Client Owner Picker UI

- `LINK_EXISTING` owner flow’da manuel UUID input kaldırılmıştır.
- Yerine searchable owner picker eklenmiştir (`useGetAdminUsersQuery`):
  - `accountType=CLIENT`
  - `limit=8`
  - `search` debounce: `275ms`
- UI davranışı:
  - sonuç listesinde `displayName + email`
  - seçilen kullanıcı için “Seçili” görünümü
  - “Seçimi Temizle” butonu
  - loading / error / empty state
- Yetki sıkılaştırma:
  - `users.manage` yoksa `LINK_EXISTING` seçeneği disabled
  - bilgilendirme metni gösterilir
- Payload garantisi:
  - `LINK_EXISTING` için yalnızca `{ mode: "LINK_EXISTING", userId }`
  - `email/displayName/password/confirmPassword` gönderilmez
- Validation:
  - user seçilmeden submit bloklanır
  - `CREATE` ve `NONE` akışları korunur
- Önleyici filtre:
  - listeden dönen CLIENT kullanıcıları içinde `clientProfile.id` dolu olanlar (varsa) picker’da elenir
  - backend yine de linked user için fail-safe reject (409) yapar

---

## 2026-04-30 - Employee Assignment UI Integration

Context:
Admin assignment management API (`/api/v1/admin/assignments`) backend’de hazırdı ancak admin panel tarafında assignment yönetimi için API-driven bir ekran bulunmuyordu. Employee panelde `Musterilerim` sayfası da hâlâ mock/static yaklaşımdan tamamen çıkmamıştı.

Decision:
- `adminandemployeePanel` içinde yeni admin ekranı eklendi: `Çalışan Atamaları` (`/calisanlar/atamalar`).
- Mevcut `baseApi.injectEndpoints` pattern’i ile yeni `adminAssignments` feature katmanı eklendi:
  - `useGetAdminAssignmentsQuery`
  - `useCreateAdminAssignmentMutation`
  - `useUpdateAdminAssignmentMutation`
  - `useDeactivateAdminAssignmentMutation`
  - `useActivateAdminAssignmentMutation`
- Assignment ekranında:
  - employee/client/scope/isActive filtreleri
  - debounced employee picker (`accountType=EMPLOYEE`, `isActive=true`, `limit=8`)
  - debounced client picker (`status=ACTIVE`, `limit=8`)
  - create/edit/activate/deactivate akışları
  - permission-aware UX (`assignments.read`, `assignments.manage`)
  - loading/error/empty/success durumları
- Scope kontrollü ikinci migration olarak employee `Musterilerim` sayfası backend `GET /clients` ile API-driven hale getirildi (assignment-scope veri).
- Backend tarafında assignment aktivasyon güvenliği sıkılaştırıldı:
  - inactive employee veya inactive client profile için assignment create/activate engeli (`400`).
  - ilgili authz e2e senaryoları eklendi/güncellendi.

Reason:
Admin tarafında assignment lifecycle’ını gerçek API ile yönetilebilir hale getirirken, employee tarafında assignment-scope müşteri görünümünü mock’tan çıkarıp backend ile hizalamak; RBAC ve veri bütünlüğünü frontend + backend doğrulamasıyla birlikte korumak.

Affected files:
- `adminandemployeePanel/src/app/features/adminAssignments/*`
- `adminandemployeePanel/src/app/pages/EmployeeAssignments.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/EmployeeAssignments.test.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/pages/Employees.tsx`
- `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Musterilerim.test.tsx`
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `server/src/admin-assignments/admin-assignments.service.ts`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-30 - Employee Tasks API Integration

Context:
Employee panelde `Gorevlerim` sayfası hâlâ mock/static görev verisi kullanıyordu. Backend tarafında `GET /api/v1/tasks` ve employee assignment-scope authorization hazırdı.

Decision:
- `Gorevlerim` sayfası mock veriden çıkarılıp `useGetTasksQuery` ile backend’e bağlandı.
- Query employee kullanıcı için `assigneeUserId=currentUser.id` ile çağrılıyor.
- Sayfa yalnızca `EMPLOYEE` + `tasks.read.assigned` durumunda query çalıştırıyor; aksi durumda `skip` + unauthorized state gösteriyor.
- KPI kartları API’den dönen görevlerden hesaplanıyor (bugün, geciken, bu hafta teslim, incelemede, tamamlanan).
- Loading / error / empty / success state’leri standart employee page pattern’iyle işlendi.
- `Gorevlerim` için yeni frontend test dosyası eklendi.

Reason:
Employee görev görünümünü gerçek assignment-aware backend verisine taşımak, mock-data bağımlılığını azaltmak ve yetki davranışını frontend UX seviyesinde netleştirmek.

Affected files:
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`

---

## 2026-04-30 - Client Purchased Services and Portal Service Visibility

Context:
Client lifecycle’ında “satın alınan hizmet” bilgisi hem admin tarafında yönetilebilir hem de client portal tarafında zorlayıcı görünürlük kuralı olacak şekilde eksikti.

Decision:
- Backend’e `ClientPurchasedService` modeli ve ilgili enum sözleşmeleri eklendi; `clientProfileId + serviceKey` unique olacak şekilde kuruldu.
- Admin client create/update akışları `purchasedServices` payload’ını kabul edecek şekilde genişletildi; boş veya duplicate service setleri fail-closed doğrulanıyor.
- Client read/detail/summary ve auth profile (`/auth/me`) yanıtlarına purchased services bilgisi eklendi.
- Client Portal service selection artık yalnızca kullanıcının `ACTIVE` purchased services setini gösteriyor.
- localStorage restore edilen `selectedService` artık authorization-aware doğrulanıyor; yetkisiz service otomatik temizlenip service selection’a dönülüyor.

Reason:
Ürün akışında “müşterinin satın almadığı hizmete erişim” riskini hem backend veri modeli hem frontend UX seviyesinde kapatmak ve service bazlı operasyon akışlarını güvenli hale getirmek.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260501000000_add_purchased_services_and_task_todos/migration.sql`
- `server/prisma/seed.ts`
- `server/src/admin-clients/*`
- `server/src/clients/clients.service.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/types/auth-response.type.ts`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`
- `clientPanel/src/app/features/auth/authTypes.ts`
- `clientPanel/src/app/features/auth/authApi.ts`
- `clientPanel/src/app/features/auth/authNormalizers.ts`
- `clientPanel/src/app/__tests__/client-portal.test.tsx`

---

## 2026-04-30 - Project and Task Picker UX

Context:
Project ve task create/edit akışlarında manuel ID girişi (clientProfileId / assigneeUserId) hem hata üretmeye açıktı hem de operasyonel UX’i zayıflatıyordu.

Decision:
- Projects create/edit akışında manuel client ID input’u yerine backend aramalı müşteri picker kullanıldı.
- Project tarafında `serviceKey` seçimi eklendi ve seçili müşteriyle uyumlu purchased services kümesine bağlandı.
- Tasks create/edit akışında manuel assignee ID input’u yerine backend aramalı employee picker kullanıldı.
- Picker aramaları debounced query paramlarıyla (`275ms`) mevcut RTK Query pattern’i üzerinden taşındı.

Reason:
Admin operasyonunda ID-copy/paste kaynaklı hataları azaltmak, form doğruluğunu artırmak ve product akışını müşteri/hizmet/çalışan ilişkisiyle tutarlı hale getirmek.

Affected files:
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/features/tasks/*`
- `adminandemployeePanel/src/app/pages/__tests__/Projects.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Tasks.test.tsx`
- `server/src/projects/dto/create-project.dto.ts`
- `server/src/projects/dto/update-project.dto.ts`
- `server/src/projects/projects.service.ts`

---

## 2026-04-30 - Task Todo Checklist and Client Progress Visibility

Context:
Task operasyonunda checklist/todo eksikti; employee ilerleme güncellemesi ve client tarafında görünür progress ihtiyacı karşılanmıyordu.

Decision:
- Backend’e `TaskTodo` modeli (visibility + completion + sortOrder) eklendi.
- Task API’ye todo yönetimi endpointleri eklendi:
  - `POST /api/v1/tasks/:id/todos`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId/toggle`
  - `DELETE /api/v1/tasks/:taskId/todos/:todoId`
- Completion hesapları task yanıtına entegre edildi; client kullanıcılar için yalnızca `CLIENT_VISIBLE` todo’lar döndürülüyor.
- Employee, own-assigned task için todo toggle yapabiliyor; client kullanıcılar todo mutation yapamıyor.
- Admin/Employee/Client panellerinde todo/progress görünümü ve mutation akışları mevcut role sınırlarıyla entegre edildi.

Reason:
Teslimatın operasyonel takibini ölçülebilir hale getirmek, employee execution akışını hızlandırmak ve client’e kontrollü ilerleme şeffaflığı sağlamak.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260501000000_add_purchased_services_and_task_todos/migration.sql`
- `server/prisma/seed.ts`
- `server/src/tasks/tasks.controller.ts`
- `server/src/tasks/tasks.service.ts`
- `server/src/tasks/dto/create-task-todo.dto.ts`
- `server/src/tasks/dto/update-task-todo.dto.ts`
- `server/src/tasks/dto/toggle-task-todo.dto.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `clientPanel/src/app/components/client-visible-tasks-section.tsx`
- `clientPanel/src/app/features/tasks/*`

---

## 2026-05-01 - Clients Quick Employee Assignment Entry

Context:
Admin kullanıcılar müşteri satırında hızlıca çalışan ataması başlatmak istiyordu; mevcut akışta yalnızca ayrı `Çalışan Atamaları` ekranına gidip işlem yapmak gerekiyordu.

Decision:
- `Clients` listesinde her müşteri satırına `Çalışan Ata` aksiyonu eklendi.
- Bu aksiyon, ilgili müşteri için scope + employee seçimi alan küçük bir modal açıyor.
- Employee adayları mevcut admin users endpointinden (`accountType=EMPLOYEE`, `isActive=true`) searchable picker ile getiriliyor.
- Oluşturma işlemi doğrudan `POST /api/v1/admin/assignments` ile yapılıyor.
- Permission-aware UX korundu:
  - `assignments.manage` yoksa aksiyon disabled.
  - `users.manage` yoksa employee picker kullanılabilir değil.

Reason:
Müşteri operasyonunda assignment adımını kısaltmak, admin panelde context switch ihtiyacını azaltmak ve atama hızını artırmak.

Affected files:
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`

---

## 2026-05-01 - Employee Task Scope Visibility and Todo Toggle Alignment

Context:
`Gorevlerim` sayfası frontend tarafında `assigneeUserId=currentUser.id` filtresi gönderdiği için assignment scope içindeki ancak kullanıcıya doğrudan atanmamış görevler görünmüyordu. Ek olarak todo toggle kontrolü backend’de yalnızca own-assigned görevlerde çalışıyordu.

Decision:
- Employee `Gorevlerim` query’sinden zorunlu `assigneeUserId` filtresi kaldırıldı; görev görünürlüğü backend assignment-scope kuralına bırakıldı.
- Backend `toggle task todo` yetkisi own-assigned kısıtından assignment-scope kuralına hizalandı.
- Scope dışı todo toggle davranışı safe `404` olarak korundu.
- Employee task **status update** kuralı değişmedi: status mutation hâlâ own-assigned task sınırında.

Reason:
Listeleme, görüntüleme ve todo toggle davranışını aynı authorization modelinde (assignment scope) tutarlı hale getirmek; frontend filtre kaynaklı yanlış-negatif görev görünmezliğini kaldırmak.

Affected files:
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`
- `server/src/tasks/tasks.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`

---

## 2026-05-02 - CRM Lead Management and CRM Specialist Module

Context:
Social Tech operasyon panelinde satış/CRM lead takibi ayrı bir domain olarak yoktu. Admin’in manuel lead oluşturması, CRM çalışanına ataması, timeline/takip yönetmesi ve satış başarılı olduğunda lead’i müşteri kaydına dönüştürmesi gerekiyordu.

Decision:
- Backend’e `CRM_SPECIALIST` employee rolü ve CRM permission seti eklendi.
- Prisma schema’ya `CrmLead`, `CrmLeadActivity` modelleri ve CRM enumları eklendi.
- Admin CRM API’si admin-only + permission protected olarak eklendi.
- Employee CRM API’si yalnızca `CRM_SPECIALIST` çalışanların kendilerine atanmış leadleri görüp güncelleyebileceği şekilde eklendi.
- Convert işlemi sadece admin tarafında çalışır; lead `WON` olur ve yeni `ClientProfile` oluşturulur.
- CRM çalışanı lead create/convert/owner değişimi yapamaz; status sınırı `CONTACTED`, `FOLLOW_UP`, `QUALIFIED`, `LOST` ile kısıtlandı.
- Admin/Employee panelde RTK Query CRM feature’ı, admin CRM ekranları ve CRM specialist employee ekranları eklendi.

Reason:
Satış operasyonunu mevcut NestJS + Prisma + RBAC mimarisine bağlı, assignment-safe ve audit-log uyumlu bir V1 domain olarak başlatmak; public website form entegrasyonu ve otomasyonları sonraki fazlara bırakmak.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260502000000_add_crm_leads/migration.sql`
- `server/prisma/seed.ts`
- `server/src/crm/*`
- `server/src/audit-log/audit-log.service.ts`
- `server/test/crm-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/crm/*`
- `adminandemployeePanel/src/app/pages/CrmLeads.tsx`
- `adminandemployeePanel/src/app/pages/CrmLeadDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/CrmLeadlerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/CrmLeadDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/BugunkuTakipler.tsx`

---

## 2026-05-02 - Public Website Contact Form to CRM Lead Integration

Context:
CRM V1 manuel admin lead oluşturma ile başlamıştı. Public website iletişim formundaki gerçek başvuruların CRM kuyruğuna düşmesi gerekiyordu.

Decision:
- Public, unauthenticated `POST /api/v1/public/crm/leads` endpointi eklendi.
- Endpoint form payload’ını validate eder, KVKK/iletişim onayı ister ve lead’i `WEBSITE_FORM` source ile oluşturur.
- Lead aktif `CRM_SPECIALIST` çalışana otomatik atanır.
- Public response minimum tutulur (`id`, `status`) ve CRM owner/user detayları dışarı verilmez.
- Website formu backend endpointine bağlandı; submit/loading/success/error ve basit frontend validation eklendi.
- Public site CORS origin’i `CLIENT_ORIGIN_PUBLIC` olarak konfigüre edildi.

Reason:
Satış hattına gerçek public website başvurularını kontrollü şekilde almak, CRM timeline/audit akışını bozmadan lead kaynağını ayrıştırmak ve sonraki reminder/automation fazına zemin hazırlamak.

Affected files:
- `server/src/crm/public-crm-leads.controller.ts`
- `server/src/crm/dto/create-public-crm-lead.dto.ts`
- `server/src/crm/crm-leads.service.ts`
- `server/src/config/cors.config.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/crm-authz.e2e-spec.ts`
- `client/src/app/components/contact/sections/FormSection.tsx`

---

## 2026-05-03 - CRM Lead Scan Stays Backend-Native Inside `server/`

Context:
The repository already had an in-progress `server/src/crm-lead-scan/` module and extended CRM lead schema for scan-derived outreach data, but shared memory did not reflect it and backend hardening around env validation, migration coverage, permissions, and automated tests was still incomplete.

Decision:
- Keep the feature backend-native under `server/` and reuse the current NestJS + Prisma CRM structure.
- Use SerpAPI Google Maps only as the lead acquisition source.
- Enforce daily free-plan safety via DB-tracked scan logs and env-capped limits (`LEAD_SCAN_DAILY_QUERY_LIMIT`, default `5`, max `6`).
- Run duplicate detection before website analysis and AI scoring.
- Store Turkish-only outreach drafts and related scan metadata directly on created CRM leads.

Reason:
This preserves a single backend enforcement point for quota, duplication, auditability, and resilience without introducing n8n or a separate automation runtime.

Affected files:
- `server/prisma/migrations/20260503000000_add_crm_lead_scan_engine/migration.sql`
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/src/crm-lead-scan/*`
- `server/src/crm/crm.module.ts`
- `server/src/crm/crm-leads.service.ts`
- `server/test/crm-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/crm/*`
- `adminandemployeePanel/src/app/pages/CrmLeads.tsx`
- `adminandemployeePanel/src/app/pages/CrmLeadDetail.tsx`

---

## 2026-05-03 - CRM Lead Scoring Provider Switched From OpenAI To Gemini

Context:
The CRM lead scan scoring layer was wired to OpenAI-style chat completions, but the product requirement changed to use Gemini as the LLM provider while preserving the existing NestJS lead scan architecture and heuristic fallback path.

Decision:
- Keep the same `LeadScoringService` boundary and scoring contract.
- Switch provider-specific env/config from `OPENAI_*` to `GEMINI_*`.
- Use Gemini REST `models/{model}:generateContent` with structured JSON output for lead scoring.
- Preserve heuristic fallback when `GEMINI_API_KEY` is missing or the Gemini response cannot be parsed safely.

Reason:
This keeps the implementation modular and minimally invasive while satisfying the provider change without introducing a new architecture or rewriting the CRM scan flow.

Affected files:
- `server/src/crm-lead-scan/lead-scoring.service.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/crm-authz.e2e-spec.ts`
- `REPO_MAP.md`

---

## 2026-05-03 - Delivery Task Taxonomy

Context:
Developer/Delivery operations needed backend-native task classification for frontend work, backend/API work, bugs, revisions, QA, deployment, severity, and target environment without splitting work into separate models.

Decision:
Extended the existing `Task` model with delivery taxonomy fields:
- `type`
- `workstream`
- `severity`
- `environment`
- `affectedUrl`
- `reproductionSteps`
- `reportedBy`
- `code`
- `sprintId`

Reason:
Preserves the current `Project -> Task -> TaskTodo` architecture, keeps filtering/reporting centralized, and avoids duplicating workflow logic across multiple task-like entities.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql`
- `server/src/tasks/*`
- `adminandemployeePanel/src/app/features/tasks/*`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/employee/pages/Frontend.tsx`
- `adminandemployeePanel/src/app/employee/pages/BackendAPI.tsx`
- `adminandemployeePanel/src/app/employee/pages/Buglar.tsx`
- `adminandemployeePanel/src/app/employee/pages/Revizyonlar.tsx`

---

## 2026-05-03 - Delivery Sprint and Release System

Context:
Developer Sprintler and Test & Yayın pages were still mock/static and there was no backend-native sprint or release tracking model.

Decision:
Added dedicated `DeliverySprint` and `DeliveryRelease` entities plus a `delivery` backend module, while keeping both linked to the existing project/task backbone.

Reason:
Sprints and releases represent planning and operational lifecycle layers above tasks, so they benefit from explicit persistence and API contracts without replacing the current project/task structure.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql`
- `server/src/delivery/*`
- `adminandemployeePanel/src/app/features/delivery/*`
- `adminandemployeePanel/src/app/employee/pages/Sprintler.tsx`
- `adminandemployeePanel/src/app/employee/pages/TestYayin.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`

---

## 2026-05-03 - Project GitHub Repository Integration

Context:
Project delivery teams needed repository visibility inside the existing admin/employee panel, but the system had no project-scoped repository persistence or GitHub integration.

Decision:
Added a `ProjectRepository` model with encrypted token storage and project-scoped GitHub REST reads for branches, commits, pull requests, and workflow runs. V1 uses encrypted PAT storage and defers GitHub App installation flow to a later milestone.

Reason:
Delivers operational repository visibility quickly while keeping secrets out of plaintext storage and API responses, and avoids introducing webhook/app-installation complexity in the current milestone.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql`
- `server/src/integrations/github/*`
- `server/src/app.module.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Projeler.tsx`

---

## 2026-05-03 - Developer Dashboard Summary Integration

Context:
The developer dashboard still relied on inline/mock content and did not reflect assigned-scope task load, critical bugs, sprint progress, release queue, or repository activity.

Decision:
Added `GET /api/v1/delivery/summary` as the backend-native summary endpoint and migrated the developer dashboard to consume it via RTK Query.

Reason:
Provides a single assigned-scope source of truth for developer KPIs and keeps aggregation logic in the backend instead of duplicating it across multiple frontend screens.

Affected files:
- `server/src/delivery/*`
- `adminandemployeePanel/src/app/features/delivery/*`
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`

---

## 2026-05-03 - Project Delivery Links And Developer Execution Notes

Context:
Delivery teams needed stronger project-level source links and developers needed a backend-native place to record what was done on assigned tasks without exposing GitHub secrets or forcing client-facing visibility.

Decision:
Added business-level `repositoryUrl` and `figmaProjectUrl` fields on `Project`, made the repository link mandatory for `WEB_APP` and `MOBILE_APP` projects, and added task-level work notes plus code-preparation metadata (`branchName`, preparation notes, prepared-by timestamps) to support execution logging and GitHub follow-up.

Reason:
Keeps canonical delivery references on the project entity, gives designers a first-class Figma link, and lets developers document work inside the existing task model instead of using disconnected notes or mock UI state.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503153000_add_project_figma_task_notes_release_approval/migration.sql`
- `server/src/projects/*`
- `server/src/tasks/*`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/features/tasks/*`

---

## 2026-05-05 - Project Manager Assigned Operations Management

Context:
Project manager paneli müşteri/hizmet/workspace görünürlüğü sağlıyordu ancak operasyonel create/update akışlarında backend ve UI kısıtları nedeniyle pratikte read-only kalıyordu.

Decision:
PM rolü için assigned-scope yönetim modeli güçlendirildi:
- Project create/update admin-only kuralı kaldırılarak `projects.manage.assigned` + assignment scope ile PM’e açıldı.
- Task create/update/assignee/todo yönetimi `tasks.manage.assigned`, `tasks.assign.assigned`, `tasks.todos.manage.assigned` ile PM assigned scope’a açıldı.
- PM workspace aksiyon merkezi üzerinden görev/sprint/release oluşturma, todo toggle ve internal/public message reply akışları eklendi.
- Project-assignee candidates endpointi (`GET /projects/:id/assignee-candidates`) eklendi.

Reason:
PM’in kendi atanmış müşteri/proje scope’u içinde gerçek operasyon yönetebilmesini sağlarken global admin yetkilerini korumak.

Affected files:
- `server/prisma/seed.ts`
- `server/src/projects/projects.controller.ts`
- `server/src/projects/projects.service.ts`
- `server/src/tasks/tasks.controller.ts`
- `server/src/tasks/tasks.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`

---

## 2026-05-03 - Release Approval And GitHub App Preparation

Context:
The delivery release lifecycle needed explicit approval tracking, and GitHub integration needed a safe path toward GitHub App based installation without pretending a full OAuth/install flow already existed.

Decision:
Extended `DeliveryRelease` with explicit approval state fields and expanded project-manager assigned-scope release management. Also added `installationId` plumbing to the project repository connect flow as GitHub App preparation, while keeping PAT-based encrypted storage as the current active V1 authentication path.

Reason:
Approval state is part of real delivery operations and belongs in the release model. Separating installation preparation from the actual installation flow keeps the roadmap honest while still reducing future migration effort.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503153000_add_project_figma_task_notes_release_approval/migration.sql`
- `server/src/delivery/*`
- `server/src/integrations/github/*`
- `server/prisma/seed.ts`
- `server/test/delivery-github-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/delivery/*`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/employee/pages/TestYayin.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`

---

## 2026-05-03 - Project Files Cloudinary V1

Context:
`Dosyalar` and `Teslim Dosyaları` screens were static/mock and there was no backend-native file sharing model across admin/employee/client scopes.

Decision:
Introduced backend-native project files with Cloudinary signed upload flow, metadata persistence, role/scope visibility, and expiring share link tokens. V1 uses Cloudinary public delivery URLs with app-level visibility controls and supports upload mode selection (new version vs overwrite).

Reason:
This delivers real operational file sharing quickly while preserving RBAC/project scope constraints and avoids blocking on heavier storage orchestration work.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503190000_add_project_files_cloudinary/migration.sql`
- `server/src/project-files/*`
- `server/src/integrations/cloudinary/*`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/prisma/seed.ts`
- `adminandemployeePanel/src/app/employee/pages/Dosyalar.tsx`
- `adminandemployeePanel/src/app/employee/pages/TeslimDosyalari.tsx`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `clientPanel/src/app/features/projectFiles/*`
- `clientPanel/src/app/pages/service-tab-page.tsx`

---

## 2026-05-05 - Web APP Workspace Realtime Snapshot + Sequence Contract

Context:
Web APP workspace live updates were available, but some screens still relied on broad refetch patterns and could be exposed to out-of-order websocket deliveries.

Decision:
Extended `workspace:update` events to carry entity snapshots for create/update events (`message`, `revision`, `meeting-request`, `section`, `content-item`, `weekly-report`) and added monotonic `sequence` metadata next to `emittedAt`.

Admin/Employee and Client panel listeners now use:
- RTK Query `updateQueryData` incremental patching for covered events
- local `lastSequence` guards to drop stale/out-of-order events
- minimal fallback behavior only outside covered snapshot events

Reason:
Improves perceived realtime speed, reduces unnecessary API churn, and prevents stale event overwrite regressions in collaborative workspace screens.

Affected files:
- `server/src/web-app-workspace/web-app-workspace.gateway.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `adminandemployeePanel/src/app/features/projects/workspaceSocket.ts`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `clientPanel/src/app/features/webAppWorkspace/workspaceSocket.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/meetings.tsx`
- `clientPanel/src/app/pages/reports.tsx`

---

## 2026-05-06 - Revisions Tab Hybrid Lifecycle (WEB_APP Workspace + Non-WEB Task)

Context:
`Revizyonlar` akışı panellerde kısmi ve tutarsızdı. WEB_APP tarafında workspace revision lifecycle vardı, diğer servislerde ise `Task(type=REVISION)` modeli kullanılıyordu; client approve/reject ve PM transition UI tarafında üretim davranışı tam değildi.

Decision:
Hibrit model kesinleştirildi:
- WEB_APP revizyonları `WebAppWorkspaceRevision` lifecycle üzerinden yönetilir.
- Non-WEB servis revizyonları `Task(type=REVISION)` ile listelenir.
- Client yetkisi: create + `READY_FOR_REVIEW -> APPROVED|REJECTED` ve `REQUESTED -> CANCELLED`.
- PM/employee transition matrix backend tarafından actor-aware doğrulanır; geçersiz geçişler tutarlı `400` döner.
- Realtime contract korunur (`workspace:update`, `revision.created`, `revision.updated`) ve frontend cache patch akışı incremental devam eder.

Reason:
Tek bir “revizyon” UX’i sunarken, mevcut domain modelini bozmadan WEB_APP workspace lifecycle ile diğer servis task lifecycle’ını aynı sekmede güvenli şekilde birleştirmek.

Affected files:
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `server/test/web-app-workspace-revisions-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/employee/pages/Revizyonlar.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/DeveloperTaskPages.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/ProjectManagerServiceWorkspace.test.tsx`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.webapp.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 0 Discovery Contract (Read-First V1)

Context:
Meta Ads entegrasyonu roadmap’te planlıydı ancak implementation öncesi scope, permission, token ve erişim modeli netleşmeden backend/frontend geliştirmeye geçmek regresyon ve tekrar iş riski oluşturuyordu.

Decision:
`docs/meta-ads-phases/00-meta-ads-discovery-contract.md` dosyasında Faz 0 tamamlandı ve V1 teknik contract sabitlendi.

- V1 kapsamı read-first (reporting + visibility), campaign mutation akışları Faz 2+.
- Minimum permission set `ads_read`; `ads_management` ve `business_management` staged.
- Auth/token yaklaşımı V1 için Facebook Login for Business + backend-side exchange + encrypted storage; V2’de system user token yönü.
- Role-scope matrisi mevcut repo RBAC ile hizalı şekilde belirlendi.
- Faz 1’e geçiş için go/no-go checklist tamamlandı.

Reason:
Kod geliştirmesi başlamadan sınırları netleştirmek, yanlış permission/tier varsayımlarını erken kapatmak ve backend DTO/service contract’ını tek bir referans dokümandan yönetmek.

Affected files:
- `docs/meta-ads-phases/00-meta-ads-discovery-contract.md`

---

## 2026-05-09 - Meta Ads Faz 1 Backend Foundation (Config + Authz Endpoints)

Context:
Meta Ads Faz 0’da V1 read-first contract netleştirildikten sonra, frontend entegrasyonundan önce backend tarafında müşteri-bazlı config modeli, güvenli credential ayrımı ve authz kontrollü API temelinin tamamlanması gerekiyordu.

Decision:
Meta Ads backend foundation aşağıdaki sınırla tamamlandı:

- Prisma’ya `MetaAdsConnectionStatus`, `ClientMetaAdsConfig`, `ClientMetaAdsCredential` eklendi.
- Config ve credential, `ClientProfile` ile 1:1 ilişkide ayrık tutuldu.
- `server/src/meta-ads/*` modülü eklendi:
  - `GET /api/v1/admin/clients/:clientId/meta-ads/config`
  - `PATCH /api/v1/admin/clients/:clientId/meta-ads/config`
  - `GET /api/v1/meta-ads/clients/:clientId/config` (assigned employee read)
  - `GET /api/v1/clients/me/meta-ads/config`
- Permission seti ve role mapping’e `metaAds.config.*` slugları eklendi.
- PATCH akışında `META_ADS` purchased service `ACTIVE` değilse update fail-closed (`400`) davranışı benimsendi.
- Response contract summary-only tutuldu; credential/token alanları API response’a hiç dahil edilmedi.

Reason:
Bu yaklaşım, Faz 2 token/auth bağlantı işlerine geçmeden önce veri modeli + erişim sınırları + endpoint kontratını güvenli ve test edilebilir şekilde sabitleyerek entegrasyon riskini düşürür.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260509123000_add_client_meta_ads_foundation/migration.sql`
- `server/prisma/seed.ts`
- `server/src/meta-ads/*`
- `server/src/app.module.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`

---

## 2026-05-09 - Meta Ads Faz 3 Reporting Sync (Snapshot + Read API)

Context:
Meta Ads Faz 2 ile bağlantı/token yönetimi tamamlandıktan sonra, client ve operasyon panellerinde gerçek performans verisi göstermek için read-only reporting katmanının snapshot tabanlı şekilde eklenmesi gerekiyordu.

Decision:
Faz 3 aşağıdaki sınırla uygulandı:

- Prisma’ya `MetaAdsInsightLevel` enumu ve `MetaAdsDailyInsight` modeli eklendi.
- Manual reporting sync endpointleri eklendi:
  - `POST /api/v1/admin/clients/:clientId/meta-ads/sync`
  - `POST /api/v1/meta-ads/clients/:clientId/sync`
- Snapshot okuma endpointleri eklendi:
  - Admin: `GET /api/v1/admin/clients/:clientId/meta-ads/{summary|campaigns|insights}`
  - Assigned employee: `GET /api/v1/meta-ads/clients/:clientId/{summary|campaigns|insights}`
  - Own client: `GET /api/v1/clients/me/meta-ads/{summary|campaigns|insights}`
- Sync akışında Meta API response’u normalize edilip günlük snapshot’lar DB’ye yazılır; hata halinde connection `ERROR` + `syncError` güncellenir.
- Client panel `meta-ads-dashboard` KPI ve campaign alanları gerçek summary/campaigns endpointlerinden beslenir; bağlantı durumuna göre fail-safe görünüm korunur.
- Admin `ClientDetail` içinde minimal Meta Ads performans özeti gösterimi eklendi.

Reason:
Snapshot-first yaklaşımı, canlı API çağrılarını her ekran yüklemesinden ayırarak rate-limit riskini azaltır, sorgu sürelerini öngörülebilir hale getirir ve Faz 4+ raporlama/genişletme adımları için kalıcı veri tabanı oluşturur.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260509150000_add_meta_ads_reporting_snapshot/migration.sql`
- `server/src/meta-ads/*`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/features/metaAds/*`
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 4 Client Panel (API-Driven Tab Workspace)

Context:
Faz 3 sonrası client panelde Meta Ads dashboard kısmi API entegrasyonuna geçmişti ancak service-tab alanındaki Meta Ads sekmeleri hâlâ generic/mock renderer akışıyla çalışıyordu. Ayrıca adset/ads/pixel-status gibi panel sekmeleri için dedicated backend endpoint yüzeyi eksikti.

Decision:
Faz 4 için client panel Meta Ads sekmeleri API-driven özel renderer’a taşındı ve backend reporting yüzeyi genişletildi.

- Client panelde `serviceId === "meta-ads"` için özel sekme renderer kullanıldı:
  - `campaigns`, `ad-sets`, `creatives`, `audiences`, `pixel-events`, `meta-reports`, `agency-notes`, `approvals`
  - loading/error/empty/connection-missing durumları fail-safe şekilde eklendi
  - mock fallback yerine API sonuçlarına dayalı görünüm benimsendi
- RTK Query Meta Ads feature genişletildi:
  - own `adsets`, `ads`, `insights`, `pixel-status` endpointleri bağlandı
- Backend Meta Ads API genişletildi:
  - own/assigned/admin scope için `adsets`, `ads`, `pixel-status` endpointleri eklendi
  - reporting sync akışı `ADSET` ve `AD` insight level snapshot yazacak şekilde genişletildi
- Meta Ads sidebar sekme yapısı Faz 4 dokümanına hizalanarak reports/notes/approvals akışı eklendi.

Reason:
Bu karar, client panelde Meta Ads operasyon görünürlüğünü generic mock katmandan çıkarıp doğrudan backend contract’a bağlayarak sürdürülebilirliği artırır, UI davranışını connection/reporting gerçekliğine hizalar ve Faz 5/6 admin-employee genişlemeleri için ortak endpoint yüzeyi oluşturur.

Affected files:
- `server/src/meta-ads/meta-ads-api.service.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 5 Admin Global Panel + Yönetim Aksiyonları

Context:
Faz 4 sonrası Meta Ads operasyonları client panelde API-driven hale geldi ancak admin tarafında tüm Meta Ads müşterilerini tek yerden yönetebileceği global ekran ve özet endpoint eksikti.

Decision:
Faz 5 kapsamında admin global yönetim yüzeyi eklendi:

- Backend’e `GET /api/v1/admin/meta-ads/clients` endpointi eklendi.
  - `META_ADS` purchased service’i olan client profilleri döner.
  - connection status, token varlığı, sync error/last sync, spend summary, pending approvals ve assigned employees özetlenir.
  - response hiçbir credential/token alanı içermez.
- Admin panelde `/meta-ads` route/page eklendi.
  - Global müşteri listesi, durum KPI’ları ve permission-aware aksiyonlar (`config`, `test`, `sync`, `disconnect`, `onay talebi`) sunulur.
- `ClientDetail` Meta Ads section’a manual sync aksiyonu eklendi.
- Onay talebi aksiyonu V1’de mevcut domain sınırını bozmadan `Task(type=REVISION, status=REVIEW)` oluşturma akışıyla sağlandı.

Reason:
Bu karar, admin operasyonlarının müşteri-bazlı tekil ekranlardan çıkarılıp global gözlem ve müdahale ekranına taşınmasını sağlar; mevcut `tasks` ve `meta-ads` API sınırlarını koruyarak minimum invaziv ilerler.

Affected files:
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/pages/MetaAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/MetaAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 6 Employee Workspace (Generic Component + Assigned Scope)

Context:
Faz 5 sonrası Meta Ads akışı admin/client panellerde çalışıyordu ancak employee panelde Social Media Specialist, Performance Specialist ve Designer için assigned-scope operasyon ekranı ve ortak bileşen katmanı yoktu.

Decision:
Employee panelde generic `MetaAdsWorkspace` bileşeni benimsendi ve ilgili rol menülerine `/employee/meta-ads` giriş noktası eklendi.

- Tek component (`MetaAdsWorkspace`) ile role-aware görünüm:
  - social: campaign/copy/approval/messages odaklı aksiyonlar
  - performance: metrics/optimization/reporting odaklı aksiyonlar
  - designer: creative/upload/share/todo odaklı aksiyonlar
- Data scope frontend tarafında sıkı filtrelendi:
  - sadece assigned clients
  - sadece `ACTIVE META_ADS` purchased service
  - sadece `serviceKey=meta-ads` project context
- Assigned Meta Ads reporting endpointleri için admin/employee panelde ayrı RTK Query feature eklendi (`features/metaAds/*`).
- Mevcut employee Meta Ads sayfaları (`Kampanyalar`, `Optimizasyonlar`, `PixelTracking`, `RaporNotlari`, `Kreatifler`, `OnayBekleyenler`) generic workspace’e bağlandı.
- Permission-aware UX eklendi; izin olmayan aksiyonlar disabled/uyarı ile gösteriliyor.

Reason:
Bu karar faz kapsamını minimum invaziv biçimde ilerletir: farklı rol sayfaları için tekrar eden kod yerine tek bir bakım noktası sağlar, backend assigned-scope sözleşmesini doğrudan kullanır ve ileride rol aksiyonlarını genişletmeyi kolaylaştırır.

Affected files:
- `adminandemployeePanel/src/app/features/metaAds/metaAdsApi.ts`
- `adminandemployeePanel/src/app/features/metaAds/metaAdsTypes.ts`
- `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/MetaAdsCalismaAlani.tsx`
- `adminandemployeePanel/src/app/employee/pages/Kampanyalar.tsx`
- `adminandemployeePanel/src/app/employee/pages/Optimizasyonlar.tsx`
- `adminandemployeePanel/src/app/employee/pages/PixelTracking.tsx`
- `adminandemployeePanel/src/app/employee/pages/RaporNotlari.tsx`
- `adminandemployeePanel/src/app/employee/pages/Kreatifler.tsx`
- `adminandemployeePanel/src/app/employee/pages/OnayBekleyenler.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 7 Approval + Creative Collaboration (Task-Centric V1)

Context:
Faz 6 sonrası employee/admin/client taraflarında Meta Ads workspace görünürlüğü vardı ancak approval aksiyonları client panelde kalıcı değildi (`runClientAction` local feedback), creative approval metadata’sı `ProjectFile` modelinde taşınmıyordu ve task bazlı approval lifecycle backend’de standart alanlarla temsil edilmiyordu.

Decision:
FAZ-07 için ayrı bir `ApprovalRequest` modülü açmadan, mevcut domain’i bozmadan task-merkezli V1 uygulandı:
- `Task` modeline Meta Ads approval alanları eklendi (`approvalRequired`, `approvalType`, `approvalStatus`, `approvalResponseNote`, request/response timestamps, creative reference).
- Client kullanıcılar için `PATCH /tasks/:id` içinde daraltılmış approval-response akışı açıldı:
  - sadece `approvals.respond.own` ile,
  - sadece own client scope + `META_ADS` project + `approvalRequired=true` + `approvalStatus=PENDING`,
  - sadece `APPROVED | CHANGES_REQUESTED | REJECTED | ACKNOWLEDGED`.
- `ProjectFile` modeline creative approval metadata alanları eklendi (approval flags/status/note + campaign/adset/ad refs + performance summary).
- Client panel Meta Ads approvals sekmesi backend mutation’a bağlandı; pending approvals, creative preview ve approval history tek ekranda render edildi.
- Employee Meta Ads workspace approvals listesi approval type/status/note alanlarını gösterecek şekilde genişletildi.

Reason:
Bu yaklaşım mevcut `Task` + `ProjectFile` domainleriyle uyumlu, minimum invaziv ve hızlı deploy edilebilir bir approval lifecycle sağlar. Ayrı approval modülü için schema/service parçalanması, migration bağımlılığı ve yüksek entegrasyon riski yerine Faz 7 hedeflerini karşılayan pragmatik bir V1 elde edildi.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260509193000_add_meta_ads_approval_flow/migration.sql`
- `server/src/tasks/dto/*`
- `server/src/tasks/tasks.service.ts`
- `server/src/project-files/dto/*`
- `server/src/project-files/project-files.service.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `clientPanel/src/app/features/tasks/*`
- `clientPanel/src/app/features/projectFiles/*`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
- `clientPanel/src/app/components/button.tsx`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
- `ROAD_MAP.md`

---

## 2026-05-10 - Meta Ads Faz 8 Sync Automation Hardening (Observability + Safe States)

Context:
Faz 7 sonrası approval/creative akışı üretime yakın hale geldi ancak sync operasyonları için merkezi log görünürlüğü, normalize hata sınıflandırması ve client-side güvenli hata sunumu sınırlıydı. Ayrıca dashboard refresh tetiklerinde TTL-safe koruma ve admin retry görünürlüğü eksikti.

Decision:
Faz 8 kapsamında sync pipeline gözlemlenebilir ve güvenli hale getirildi:

- Prisma’ya `MetaAdsSyncLog` modeli ve `MetaAdsSyncStatus` enumu eklendi (`RUNNING | SUCCESS | FAILED | PARTIAL | SKIPPED`).
- Sync lifecycle başlangıçta log açacak, akış sonunda sonuç + hata + metrik (records/apiCallCount/duration) yazacak şekilde standardize edildi.
- Sync trigger sınıfları netleştirildi (`MANUAL_SYNC`, `ON_DEMAND_CLIENT`, `ON_DEMAND_ASSIGNED`, `ERROR_RETRY`) ve TTL kontrollü skip davranışı eklendi (`META_ADS_SYNC_TTL_MINUTES`, default `30`).
- Error normalize helper’ı aşağıdaki operasyon kodlarını üretir:
  - `TOKEN_EXPIRED`
  - `PERMISSION_MISSING`
  - `AD_ACCOUNT_UNAVAILABLE`
  - `RATE_LIMIT`
  - `BUSINESS_ACCESS_REVOKED`
  - `UNKNOWN_API_ERROR`
- Admin için sync observability endpointleri eklendi:
  - `GET /api/v1/admin/meta-ads/sync-logs`
  - `POST /api/v1/admin/clients/:clientId/meta-ads/sync/retry`
- Client için own refresh endpointi eklendi:
  - `POST /api/v1/clients/me/meta-ads/sync`
- Client-safe error policy uygulandı: client pixel-status ve dashboard katmanında teknik detay maskelenir; admin/assigned rollerde operasyonel detay korunur.
- Admin `/meta-ads` ekranında failed sync müşteriler, sync logs tablosu, retry aksiyonu ve status özetleri eklendi.
- Client dashboard tarafında “Son güncelleme”, “Veriler hazırlanıyor…”, “Bağlantı problemi var, ekibimiz ilgileniyor” güvenli durumları gösterilir.

Reason:
Bu karar, Meta Ads sync operasyonlarında hem teknik izlenebilirliği artırır hem de client-facing UI’da hata sızıntısını önler. TTL-safe refresh yaklaşımı gereksiz API çağrılarını azaltır, retry/log akışları ise operasyon ekiplerinin müdahale hızını artırır.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260510001000_add_meta_ads_sync_logs/migration.sql`
- `server/src/config/env.validation.ts`
- `server/src/meta-ads/dto/meta-ads-sync-logs-query.dto.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `server/.env.example`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/pages/MetaAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/MetaAdsAdmin.test.tsx`
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`
