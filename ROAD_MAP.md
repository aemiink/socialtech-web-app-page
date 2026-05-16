# Road Map

## Current Focus

- Backend + frontend contract stabilization for admin operations
- API-first migration of remaining admin/employee/client domain UIs (from mock/static remnants to backend-driven flows)

## Planned

- Remaining employee role pages API migration (mock/static -> backend)
- Remaining admin mock/static pages API migration
- Service-specific project/task filtering refinements (client purchased service scope)
- Assignment-scoped assignee candidates endpoint for task forms
- Dedicated owner candidates endpoint (`GET /api/v1/admin/clients/owner-candidates`)
- Owner picker migration from admin users endpoint to owner-candidates endpoint
- Optional owner user deactivation policy on client deactivate
- Todo audit logging
- Dashboard fail-fast contract validation decision (normalize-to-default vs throw-on-malformed)
- Employee assignment analytics/reporting cards (summary endpoint support)
- Visual QA screenshot artifacts for critical role flows
- Bundle/code splitting optimization
- GitHub App installation flow
- GitHub webhook sync
- Task code based commit/branch association
- Branch naming convention parsing
- Related commits in task detail enrichment
- GitHub Actions release/deploy automation
- CI/CD status automation
- Advanced sprint planning
- Full release approval workflow UX
- Platform integrations: Meta/TikTok/Amazon Ads
- CRM automation/reminder notifications
- CRM pipeline analytics
- CRM outbound email/WhatsApp sending integrations
- Cloudinary asset malware scanning/quarantine flow
- Advanced revision inbox/routing and reminder notifications

## In Progress

- None

## Completed

- Backend auth foundation + access-token invalidation
- Admin Users Management API (create/list/detail/update/deactivate/activate/reset-password)
- Admin User Management audit logging
- Admin Audit Logs read API
- Client summary endpoint (`GET /api/v1/clients/:id/summary`)
- ClientDetail related Projects/Tasks overview UI
- ClientDetail summary frontend tests
- Backend admin summary endpoint (`GET /api/v1/admin/summary`)
- Dashboard dedicated summary endpoint integration
- Dashboard contract-hardening / normalize layer
- Dashboard summary frontend tests
- Clients server-side pagination/filter/sorting
- Clients UI server-side query integration
- Clients pagination/filter frontend tests
- Client Management CRUD API + Admin UI
- Client owner user create/link
- Client audit logging
- Admin Client Owner Picker UI
- Clients quick employee assignment entry (list-row action)
- Clients/Dashboard store+baseApi integration tests
- Clients search debounce
- Radix Dialog ref warning cleanup
- Employee Assignment UI
- Admin assignment RTK Query integration
- Assignment management frontend tests
- Employee `Musterilerim` API integration (`GET /clients`, assignment-scope)
- Employee `Gorevlerim` API integration (`GET /tasks`, assignment-scope)
- Employee `Gorevlerim` frontend tests
- Client purchased services backend model/API
- Admin client services selection UI
- Client Portal purchased-service visibility
- Project client picker (manual ID input kaldırıldı)
- Project serviceKey selection (client purchased services ile hizalı)
- Task assignee picker (manual ID input kaldırıldı)
- Task todo/checklist backend model/API
- Employee todo toggle/progress UI
- Employee task scope visibility fix (forced assignee filter removal)
- Employee todo toggle scope alignment (assignment scope)
- Client-visible task progress UI
- Related backend e2e tests (projects/tasks/todo/authz)
- Related frontend tests (admin, employee, client portal)
- CRM backend schema and permissions
- CRM specialist role
- Admin CRM lead management API
- Admin CRM SerpAPI lead scan engine
- CRM lead duplicate detection
- Employee assigned CRM lead API
- CRM lead conversion to ClientProfile
- Admin CRM panel
- CRM specialist employee panel
- CRM frontend tests
- CRM backend e2e tests
- Public website contact form -> CRM lead integration
- Task taxonomy fields
- Developer task pages API migration
- Delivery sprint backend/API/UI
- Delivery release backend/API/UI
- Project GitHub repository integration
- Developer GitHub read visibility
- Delivery summary endpoint/UI
- Project repository link requirement for `WEB_APP` / `MOBILE_APP`
- Project-level Figma link support
- Developer task detail work notes
- Task code preparation + suggested branch metadata
- Related commits in task detail (V1 read visibility)
- Release approval state tracking
- Project-manager assigned release management
- GitHub App installation metadata preparation (`installationId`)
- Related backend e2e tests for delivery/github
- Related frontend tests for developer delivery flows
- Project files backend/API/UI (Cloudinary signed upload + share links)
- Client panel client-visible file delivery integration
- Web APP workspace backend module (sections/items/messages/revisions/reports/meeting requests)
- Web APP workspace admin/employee management UI on project detail
- Web APP workspace client panel API-driven reports/meetings/data binding
- Web APP workspace Socket.IO realtime sync
- Incremental cache patch strategy (`updateQueryData`) for workspace events
- Out-of-order websocket protection via event `sequence` guards
- Client Web APP panel mock fallback temizliği (API-first + empty-state)
- Admin ClientDetail atanan çalışan görünürlüğü
- Developer Dashboard atanan müşteri görünürlüğü
- Project Manager assigned clients API-driven dashboard
- Project Manager service-aware client detail/workspace
- Project Manager Web APP workspace message tree visibility
- Client Panel Web APP message tree görünürlük ve cache-key senkron düzeltmesi
- Workspace message parent/reply persistence (`parentMessageId`)
- Project Manager assigned-scope project management
- Project Manager assigned-scope task management
- Project Manager task todo/checklist management
- Project Manager sprint/release management
- Project Manager workspace message reply/visibility
- Project Manager service workspace action center
- Project Manager roadmap sprint planning (goal + date-range) in service workspace
- Project Manager task creation target-tab routing (type/workstream) for employee panel visibility
- Revizyonlar sekmesi hibrit model (WEB_APP workspace + non-WEB task) üretim akışı
- Client revision create + approve/reject lifecycle (WEB_APP) ve PM transition matrix uyumu
- Workspace revision authz e2e coverage (`server/test/web-app-workspace-revisions-authz.e2e-spec.ts`)
- Meta Ads Faz 0 discovery contract (official docs alignment + V1 read-first scope + permission/token strategy)
- Google Ads Faz 0 discovery contract (official docs alignment + V1 read-first scope + GAQL/access model/token strategy)
- Google Ads Faz 1 foundation (Prisma model + authz API + admin/client panel config integration + e2e coverage)
- Google Ads Faz 2 auth/token/connection management (manual connect + encrypted token storage + connection test/disconnect + admin/client connection UI)
- Google Ads Faz 3 reporting sync (daily snapshot model + manual sync + summary/campaign/insights API + client/admin summary integration)
- Google Ads Faz 4 client panel API-driven tab workspace (summary/campaign/ad-group/ad/keyword/conversion/search-term own endpoints + approvals/notes/reports tab states)
- Google Ads Faz 5 admin global panel (`/google-ads`) + backend clients list endpoint + config/test/sync/disconnect/onay talebi aksiyonları
- Google Ads Faz 6 employee role workspaces (Project Manager/Performance/Designer assigned scope + generic `GoogleAdsWorkspace` + role-aware actions + tests)
- Google Ads Faz 7 approval + creative collaboration (Google Ads approval type genişletmesi, client approve/revise/ack akışı, employee workspace approval type/status/rejection-note görünürlüğü, creative visibility ve authz coverage)
- Google Ads Faz 8 sync automation hardening (sync log modeli, manual/retry/on-demand trigger loglama, normalize error catalog, admin sync logs+retry observability, client-safe refresh/cooldown davranışı)
- Meta Ads Faz 1 backend foundation (Prisma model + authz API + e2e coverage)
- Meta Ads Faz 2 auth/token/connection management (manual connect + encrypted token storage + connection test/disconnect + admin/client connection UI)
- Meta Ads Faz 3 reporting sync (daily snapshot model + manual sync + summary/campaign/insights API + client/admin summary integration)
- Meta Ads Faz 4 client panel API-driven tab workspace (adsets/ads/pixel-status endpoints + dedicated meta tabs + approvals/reports states)
- Meta Ads Faz 5 admin global panel (`/meta-ads`) + backend clients list endpoint + config/test/sync/disconnect/onay talebi aksiyonları
- Meta Ads Faz 6 employee role workspaces (Social/Performance/Designer assigned scope + generic `MetaAdsWorkspace` + role-aware actions + tests)
- Meta Ads Faz 7 approval + creative collaboration (task-based approval metadata, client approve/reject mutation, creative approval preview/history, shared panel rendering)
- Meta Ads Faz 8 sync automation hardening (sync log modeli, TTL/rate-limit skip, normalize error catalog, admin sync observability, client safe-state refresh)
- Meta Ads Faz 9 reporting/export foundation (`MetaAdsReport` entity, admin/assigned draft-publish endpoints, client own report visibility, publish->ack task bridge)
- Meta Ads Faz 10 production hardening (client-safe sync error responses, authz/state coverage genişletmesi, client portal lazy loading + manualChunks)

## Blocked

None identified.

## Notes

- Latest backend validation checkpoint: Meta Ads authz/reporting suite `38/38` tests + backend `npm run check`.
- Latest admin/employee frontend validation checkpoint: `25` test files, `153/153` tests.
- Latest client portal frontend validation checkpoint: `4` test files, `17/17` tests.
- Latest Google Ads FAZ-01 validation checkpoint:
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs google-ads-authz.e2e-spec.ts` ✅ (`8/8`)
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/Clients.test.tsx src/app/pages/__tests__/ClientDetail.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/google-ads-dashboard.test.tsx` ✅
  - `clientPanel`: `npm run check` ✅
- Latest Google Ads FAZ-03 validation checkpoint:
  - `server`: `npm run prisma:generate` ✅
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=postgresql://<user>@localhost:5432/socialtech_server_test?schema=public ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs google-ads-authz.e2e-spec.ts` ✅ (`16/16`)
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/ClientDetail.test.tsx src/app/pages/__tests__/Clients.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/google-ads-dashboard.test.tsx` ✅
  - `clientPanel`: `npm run check` ✅
- Latest Google Ads FAZ-04 validation checkpoint:
  - `server`: `npm run check` ✅
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/google-ads-dashboard.test.tsx` ✅ (`9/9`)
  - `clientPanel`: `npm run check` ✅
- Latest Google Ads FAZ-05 validation checkpoint:
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_server_test?schema=public ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs google-ads-authz.e2e-spec.ts` ✅ (`18/18`)
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/GoogleAdsAdmin.test.tsx src/app/pages/__tests__/ClientDetail.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
- Latest Google Ads FAZ-06 validation checkpoint:
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_server_test?schema=public ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs google-ads-authz.e2e-spec.ts` ✅ (`20/20`)
  - `adminandemployeePanel`: `npm run test:run -- src/app/employee/pages/__tests__/GoogleAdsWorkspace.test.tsx src/app/employee/__tests__/EmployeeLayout.google-ads.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
- Latest Google Ads FAZ-07 validation checkpoint:
  - `server`: `npm run prisma:generate` ✅
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_server_test?schema=public ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs google-ads-authz.e2e-spec.ts` ✅ (`23/23`)
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/google-ads-dashboard.test.tsx` ✅ (`10/10`)
  - `clientPanel`: `npm run check` ✅
  - `adminandemployeePanel`: `npm run test:run -- src/app/employee/pages/__tests__/GoogleAdsWorkspace.test.tsx` ✅ (`9/9`)
  - `adminandemployeePanel`: `npm run check` ✅
- Latest Google Ads FAZ-08 validation checkpoint:
  - `server`: `npm run prisma:generate` ✅
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_server_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` ✅ (`12/12 suites`, `277/277 tests`)
  - `clientPanel`: `npm test -- src/app/pages/__tests__/google-ads-dashboard.test.tsx` ✅ (`13/13`)
  - `clientPanel`: `npm run check` ✅
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/GoogleAdsAdmin.test.tsx` ✅ (`8/8`)
  - `adminandemployeePanel`: `npm run check` ✅
- Latest FAZ-05 validation checkpoint:
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs meta-ads-authz.e2e-spec.ts` ✅ (`38/38`)
  - `server`: `npm run prisma:seed` ✅
  - `server`: `npm run check` ✅
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/MetaAdsAdmin.test.tsx src/app/pages/__tests__/ClientDetail.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
- Latest FAZ-06 validation checkpoint:
  - `server`: permission sözlüğü (`metaAds.reporting.read.assigned`, `metaAds.notes.manage.assigned`, `metaAds.approvals.create.assigned`, `metaAds.creatives.manage.assigned`) seed/service katmanına taşındı ✅
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs meta-ads-authz.e2e-spec.ts` ✅ (`38/38`)
  - `adminandemployeePanel`: `npm run test:run -- src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
- Latest FAZ-07 validation checkpoint:
  - `server`: `npm run prisma:generate` ✅
  - `server`: `npm run typecheck && npm run typecheck:seed && npm run typecheck:spec && npm run build` ✅
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs projects-tasks-authz.e2e-spec.ts` ✅ (`26/26`; rejection note -> otomatik revision task assertion dahil)
  - `clientPanel`: `npm run typecheck && npm run test -- src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx && npm run build` ✅
  - `adminandemployeePanel`: `npm run typecheck && npm run test:run -- src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx && npm run build` ✅
- Latest FAZ-08 validation checkpoint:
  - `server`: `npm run prisma:generate` ✅
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs meta-ads-authz.e2e-spec.ts` ✅ (`28/28`)
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/MetaAdsAdmin.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/meta-ads-dashboard.test.tsx src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx` ✅
  - `clientPanel`: `npm run check` ✅
- Latest FAZ-09 validation checkpoint:
  - `server`: `npm run prisma:generate` ✅
  - `server`: `npm run typecheck` ✅
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs meta-ads-authz.e2e-spec.ts` ✅ (`38/38`)
  - `server`: `npm run check` ✅
  - `clientPanel`: `npm run typecheck` ✅
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx src/app/pages/__tests__/meta-ads-dashboard.test.tsx` ✅
  - `clientPanel`: `npm run check` ✅
  - `adminandemployeePanel`: `npm run test:run -- src/app/pages/__tests__/MetaAdsAdmin.test.tsx src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅
- Latest FAZ-10 validation checkpoint:
  - `server`: `npm run check` ✅
  - `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true node ./test/run-e2e.cjs meta-ads-authz.e2e-spec.ts` ✅ (`38/38`; local test DB runtime doğrulandı)
  - `adminandemployeePanel`: `npm run test:run -- src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx src/app/pages/__tests__/MetaAdsAdmin.test.tsx` ✅
  - `adminandemployeePanel`: `npm run check` ✅ (route-level lazy splitting sonrası >500k app chunk uyarısı yok)
  - `clientPanel`: `npm run test -- src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx src/app/pages/__tests__/meta-ads-dashboard.test.tsx src/app/__tests__/client-portal.test.tsx` ✅
  - `clientPanel`: `npm run check` ✅ (lazy + chunk split sonrası Vite warning yok)
- Summary query optimization and summary-side cache/TTL remain relevant follow-ups as data volume grows.
## 2026-04-29 Checkpoint

### Completed
- [x] Admin Client Management CRUD API
- [x] Client owner user create/link
- [x] Client audit logging
- [x] Admin Clients UI CRUD integration
- [x] Clients owner assign UI
- [x] Store+baseApi integration tests for Clients/Dashboard
- [x] Clients search debounce
- [x] Radix Dialog ref warning cleanup
- [x] Admin Client Owner Picker UI

### Planned
- [ ] Dedicated owner candidates endpoint (`GET /api/v1/admin/clients/owner-candidates`)
- [ ] Owner picker migration from admin users endpoint to owner-candidates endpoint
- [ ] Optional owner user deactivation policy on client deactivate
- [x] Employee Assignment UI (2026-04-30 checkpointinde tamamlandı)
- [ ] Bundle/code splitting optimization
- [ ] Platform integrations: Meta/TikTok/Amazon Ads

## 2026-04-30 Checkpoint

### Completed
- [x] Admin Employee Assignment UI (`/calisanlar/atamalar`)
- [x] `adminAssignments` RTK Query feature + cache invalidation wiring
- [x] Assignment create/update/activate/deactivate frontend flows
- [x] Assignment page permission-aware UX (`assignments.read`, `assignments.manage`)
- [x] Assignment frontend test coverage (`EmployeeAssignments.test.tsx`)
- [x] Employee `Musterilerim` page mock->API migration (`GET /clients`)
- [x] Backend assignment activation hardening (inactive employee/client engeli)
- [x] Backend authz coverage update (`7/7` suite, `168/168` test)

### Planned
- [ ] Employee panelde kalan sayfaların API migration’ı (`Takvim`, `Bildirimler`, `Dosyalar`, `Ayarlar` vb.)
- [ ] Admin panelde kalan mock/static alanların API migration’ı
- [ ] Assignment list için server-side pagination/sorting (gerekirse)
- [ ] Bundle/code splitting optimization
- [ ] Platform integrations: Meta/TikTok/Amazon Ads

## 2026-05-01 Checkpoint

### Completed
- [x] Employee `Gorevlerim` mock->API migration (`GET /tasks`)
- [x] Employee `Gorevlerim` page permission-aware query skip (`tasks.read.assigned`)
- [x] Employee `Gorevlerim` frontend tests (loading/error/empty/success/unauthorized/query)
- [x] Client purchased services model/API ve admin create-update entegrasyonu
- [x] Client Portal purchased-service visibility + unauthorized selectedService reset
- [x] Project create/edit client picker + serviceKey seçimi
- [x] Task create/edit assignee picker
- [x] Task todo/checklist endpointleri + completion/progress hesapları
- [x] Employee todo toggle/progress akışı
- [x] Client-visible todo/progress render akışı
- [x] Clients list üzerinden hızlı çalışan atama (quick assignment entry)
- [x] Employee görev görünürlüğü assignment scope ile hizalandı (`assigneeUserId` zorunlu filtre kaldırıldı)
- [x] Employee todo toggle yetkisi assignment scope ile hizalandı (out-of-scope safe `404`)
- [x] Related validation: backend `176/176`, admin/employee frontend `124/124`, client portal `6/6`

### Planned
- [ ] Employee task status update UX integration (`PATCH /tasks/:id`, scope keep-small)
- [ ] Employee task detail route (`/employee/gorevlerim/:id`) değerlendirmesi
- [ ] Assignment-scoped assignee candidates endpoint
- [ ] Dedicated owner candidates endpoint + frontend migration
- [ ] Todo audit logging
- [ ] Visual QA screenshot artifact üretimi (admin/employee/client kritik akışlar)

## 2026-05-02 Checkpoint

### Completed
- [x] CRM backend schema and permissions
- [x] CRM specialist role (`CRM_SPECIALIST`)
- [x] Admin CRM lead management API
- [x] Employee assigned CRM lead API
- [x] CRM lead conversion to `ClientProfile`
- [x] Admin CRM panel (`/crm`, `/crm/:id`)
- [x] CRM specialist employee panel (`/employee/crm/leads`, `/employee/crm/leads/:id`, `/employee/crm/follow-ups`)
- [x] CRM frontend tests
- [x] CRM backend e2e tests
- [x] Public website contact form -> CRM lead integration

### Planned / Follow-up
- [ ] CRM automation/reminder notifications
- [ ] CRM pipeline analytics
- [ ] CRM outbound email/WhatsApp sending integrations
- [ ] Employee CRM list/follow-up page test coverage expansion
- [ ] Service-specific full domain modules for ads/social/SEO/support
- [ ] Project Manager message inbox (cross-project aggregate)
- [ ] Advanced message assignment/routing to specific employee
- [ ] Workspace message notification/reminder automation
- [ ] Project Manager global message inbox
- [ ] Advanced employee routing/notification system
- [ ] Service-specific domain modules for ads/social/SEO/support
- [ ] Assignment-scoped assignee candidates refinements
- [ ] Mobile app: Admin + Employee sidebar hamburger menu / drawer (deferred to mobile app phase)
