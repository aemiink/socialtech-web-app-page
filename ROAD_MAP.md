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

## Blocked

None identified.

## Notes

- Latest backend validation checkpoint: `10/10` authz suites, `209/209` tests.
- Latest admin/employee frontend validation checkpoint: `19` test files, `134/134` tests.
- Latest client portal frontend validation checkpoint: `1` test file, `6/6` tests.
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
