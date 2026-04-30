# Road Map

## Current Focus

- Client Portal (added in most recent commit: `feat: add Social Tech client panel portal`) — status unknown, needs mapping
- Admin Panel and Employee Panel panels appear feature-complete at the prototype/mock level

## Planned

- Real authentication system (JWT, sessions, or OAuth) — currently demo-only role picker
- Backend / API layer — all data is currently mock static arrays
- Database integration — no schema or ORM exists yet
- Persistent role/session storage (localStorage or server session)
- TypeScript strict mode enforcement — `any` types present in EmployeeLayout (icon type)
- Lint and typecheck scripts in package.json
- Test infrastructure (no tests exist)

## In Progress

- [ ] Map Client Portal structure
  - Identify the client portal directory or sub-project.
  - Inspect its routing, layouts, pages, shared components, and data source.
  - Update `PROJECT_CONTEXT.md` and `REPO_MAP.md` after mapping.

## Completed

- Admin Panel: full route structure with 14 top-level modules
- Employee Panel: role-based sidebar and 40+ specialized pages across 8 roles
- Role selection login screen (demo)
- RBAC context and role guard
- Mock data layer (`mockData.ts`) with realistic Turkish agency data
- UI component library (shadcn-style Radix + Tailwind v4)
- Shared project memory files (PROJECT_CONTEXT.md, REPO_MAP.md, DECISIONS.md, ROAD_MAP.md)

## Blocked

None identified.

## Notes

- UI language is Turkish throughout
- Brand: dark (`#131313`) + neon green (`#AAFF01`) design system
- All mock data uses realistic Turkish company names (Koçtaş, Türk Telekom, Migros, Getir, etc.)
- Client portal directory not yet confirmed — inspect git diff of latest commit or look for a new root-level directory
## Update - 2026-04-29

### Completed
- Client summary endpoint (`GET /api/v1/clients/:id/summary`)
- ClientDetail related Projects/Tasks overview UI (summary-driven)
- ClientDetail summary frontend tests

### Planned
- Client summary cache / TTL
- Backend admin summary endpoint
- Dashboard dedicated summary endpoint integration
- Clients server-side pagination/filter/sorting (only if still pending in branch-level rollout)
- Summary query optimization (count/query strategy tuning at larger scale)
