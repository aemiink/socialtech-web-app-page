# Road Map

## Current Focus

- Client Portal is now mapped at `clientPanel/`; future work should focus on auth/backend integration only when explicitly scoped
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

## Blocked

None identified.

## Notes

- UI language is Turkish throughout
- Brand: dark (`#131313`) + neon green (`#AAFF01`) design system
- All mock data uses realistic Turkish company names (Koçtaş, Türk Telekom, Migros, Getir, etc.)
- Client Portal directory confirmed as `clientPanel/`
- `client/` is the public/marketing Social Tech website, not the Client Portal
