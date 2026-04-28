# Road Map

## Current Focus

- Backend auth is now implemented under `server/`; next phases are domain-level authorization rollout, migration-first Prisma flow, frontend integration, and auth e2e coverage
- Client Portal is mapped at `clientPanel/`; Admin + Employee prototype UI remains feature-rich at mock level

## Planned

- Frontend auth integration for `adminandemployeePanel/` and `clientPanel/` against `server/` auth endpoints
- Broader domain endpoint authorization rollout (next modules beyond users/clients with `JwtAuthGuard` + `PermissionsGuard`)
- Employee-client assignment model for `clients.read.assigned` scope
- Database migration pipeline (migration-first Prisma workflow for PostgreSQL, migration files not created yet)
- Persistent role/session storage (localStorage or server session)
- ESLint / Prettier standardization (intentionally deferred in workflow pass)
- Authz e2e tests (plus broader backend test infrastructure)

## In Progress

None identified.

## Completed

- Admin Panel: full route structure with 14 top-level modules
- Employee Panel: role-based sidebar and 40+ specialized pages across 8 roles
- Role selection login screen (demo)
- RBAC context and role guard
- Mock data layer (`mockData.ts`) with realistic Turkish agency data
- UI component library (shadcn-style Radix + Tailwind v4)
- Shared project memory files (PROJECT_CONTEXT.md, REPO_MAP.md, DECISIONS.md, ROAD_MAP.md)
- Client Portal structure mapped: standalone Vite + React SPA at `clientPanel/`, with state-based in-app navigation, service selection, 13 service dashboards, shared reports/meetings/billing/settings pages, mock service data, and local action history
- Employee Panel page content: All 37 previously placeholder employee pages filled with realistic, role-appropriate Social Tech agency content (KPI cards, tables, status badges, mock data, action buttons). Pages covered: Projeler, Onaylar, Teslimatlar, Toplantilar, RaporTakibi, Kampanyalar, Optimizasyonlar, KreatifTalepleri, PixelTracking, RaporNotlari, IcerikTakvimi, Captionlar, OnayBekleyenler, YayinAkisi, DmYorumlar, TrendNotlari, Kreatifler, UITasarimlar, Revizyonlar, TeslimDosyalari, MarkaDosyalari, Sprintler, Frontend, BackendAPI, Buglar, TestYayin, DestekTalepleri, AcikIsler, CozulenIsler, Bakim, Guvenlik, Yedekleme, Guncellemeler, SEOAudit, TeknikHatalar, AnahtarKelimeler, SayfaHizi, IndexDurumu, SearchConsole, AksiyonPlani
- Demo login flows completed for Admin Panel, Employee Panel, and Client Portal. Real authentication remains planned.
- Developer workflow standardized for `adminandemployeePanel/` and `clientPanel/`: npm is canonical (`packageManager: npm@11.8.0`), pnpm workspace metadata removed, React runtime dependencies normalized, TypeScript typecheck infrastructure added (`tsconfig.json`, `typecheck`), and `preview`/`check` scripts added. `npm run check` passes in both apps.
- NestJS backend foundation completed under `server/`: single shared API base, `/api/v1` prefix, env/config validation, global validation/error handling, CORS setup, Prisma/PostgreSQL preparation, `GET /api/v1/health`, and auth/users/clients skeleton modules. Full auth/RBAC/domain integration remains planned.
- Prisma schema + demo seed foundation completed under `server/`: hybrid RBAC-ready schema (`User.role` enum + `Permission` + `RolePermission`), `User.displayName`, `User.lastLoginAt`, unique `ClientProfile.slug`, demo seed data (admin + 7 employee roles + 1 client owner), and seeded permission mapping. Latest local seed snapshot: users=9, permissions=33, role_permissions=107, client_profiles=1.
- Backend auth implementation completed under `server/`: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`; access token in response body, refresh token in HttpOnly cookie, hashed refresh token persistence (`RefreshToken.tokenHash`), refresh rotation, revoked-token reuse handling, bcrypt-based seed auth readiness, and guard/decorator baseline (`JwtAuthGuard`, `CurrentUser`, `RequirePermissions`, `PermissionsGuard` skeleton). Validation/build checks and manual auth flow tests passed.
- Protected users/clients API foundation completed under `server/`: `GET /api/v1/users/me`, `GET /api/v1/users`, `GET /api/v1/users/:id`, `GET /api/v1/clients`, `GET /api/v1/clients/:id`, `GET /api/v1/clients/me`; controller-level `JwtAuthGuard` + `PermissionsGuard`, `users.read` check on users list, service-level object authorization, admin full-scope reads, client own-scope reads, and constrained employee behavior for unmodeled assignment scope.

## Blocked

None identified.

## Notes

- UI language is Turkish throughout
- Brand: dark (`#131313`) + neon green (`#AAFF01`) design system
- All mock data uses realistic Turkish company names (Koçtaş, Türk Telekom, Migros, Getir, etc.)
- Client Portal directory confirmed as `clientPanel/`
- `client/` is the public/marketing Social Tech website, not the Client Portal
- `npm install` currently reports 1 high severity vulnerability in each app; `npm audit fix --force` is intentionally out of scope for this pass
- Backend auth endpoints are implemented; frontend integration and domain-wide guard/permission rollout remain planned
- Users/clients protected read foundation is implemented; assignment-aware employee client access remains planned
- Prisma schema sync currently uses `db push`; migration files remain planned
