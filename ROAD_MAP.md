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
- Bundle/code splitting optimization
- Platform integrations: Meta/TikTok/Amazon Ads

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
- Client-visible task progress UI
- Related backend e2e tests (projects/tasks/todo/authz)
- Related frontend tests (admin, employee, client portal)

## Blocked

None identified.

## Notes

- Latest backend validation checkpoint: `7/7` authz suites, `176/176` tests.
- Latest admin/employee frontend validation checkpoint: `15` test files, `120/120` tests.
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
- [x] Related validation: backend `176/176`, admin/employee frontend `120/120`, client portal `6/6`

### Planned
- [ ] Employee task status update UX integration (`PATCH /tasks/:id`, scope keep-small)
- [ ] Employee task detail route (`/employee/gorevlerim/:id`) değerlendirmesi
- [ ] Assignment-scoped assignee candidates endpoint
- [ ] Dedicated owner candidates endpoint + frontend migration
- [ ] Todo audit logging
