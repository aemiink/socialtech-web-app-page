# Road Map

## Current Focus

- Backend + frontend contract stabilization for admin operations
- API-first migration of remaining admin domain UIs (from mock/static remnants to backend-driven flows)

## Planned

- Clients/Dashboard store+baseApi integration tests (beyond hook-mocked component tests)
- Dashboard fail-fast contract validation decision (normalize-to-default vs throw-on-malformed)
- Clients search debounce (request-rate optimization)
- Radix Dialog ref warning cleanup in test/runtime console output
- Client Management CRUD API + Admin UI
- Employee Assignment UI
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

## Blocked

None identified.

## Notes

- Latest backend validation checkpoint: `6/6` authz suites, `152/152` tests.
- Latest frontend validation checkpoint: `10` test files, `82/82` tests.
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
- [ ] Employee Assignment UI
- [ ] Bundle/code splitting optimization
- [ ] Platform integrations: Meta/TikTok/Amazon Ads
