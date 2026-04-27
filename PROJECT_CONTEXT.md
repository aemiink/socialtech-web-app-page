# Project Context

## Product Summary

Social Tech is a premium digital growth agency. This repository contains multiple Vite + React SPAs for agency operations and client visibility: an Admin Panel, an Employee Panel (role-based), a public/marketing client site, and a Client Portal. The UI is in Turkish. All data is currently mock/static (no live backend).

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
- Package manager: pnpm in `adminandemployeePanel/`; `clientPanel/` currently has npm scripts and `package-lock.json`
- TypeScript: Yes (strict expected per CLAUDE.md)
- No backend / no database — all data is mock

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

- Auth: Demo only — no backend authentication, JWT, session, API, or database.
- Admin + Employee login: single `/login` route in `adminandemployeePanel/` with email/password demo credentials.
- Demo users are defined in `RoleContext.tsx`; the authenticated demo account is stored by email in browser `localStorage` and rehydrated from the static demo user list.
- RBAC: `RoleContext` stores `currentUser`, `selectedRole`, account type, login, and logout helpers. Employee role comes from the demo email map, not from a free-form role picker.
- Guards: `RootLayout` redirects unauthenticated users to `/login` and only allows admin accounts. `EmployeeLayout` redirects unauthenticated users to `/login` and only allows employee accounts.
- Old `RoleAccessLogin.tsx` role picker was removed from active flow.
- Client Portal login: `clientPanel/` shows a frontend demo login gate before service selection. Demo auth is stored in browser `localStorage`.
- No backend permission checks exist (frontend-only, demo state).

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

None currently. Admin/Employee data is hardcoded in `mockData.ts`; Client Portal data is hardcoded in `clientPanel/src/app/data/service-pages.ts` and browser `localStorage` action history. No API routes, no server, no database.

## Data Model Summary

From `mockData.ts` (mock, no schema enforcement):
- `clients` — id, name, industry, monthlyValue, contractStart/End, status, paymentStatus, services[], contactPerson, email, phone, activeProjects, totalSpent, riskLevel
- `employees`, `projects`, `tasks`, `approvals` — also present in mockData (structure not fully read)

From `clientPanel/src/app/data/service-pages.ts`:
- `serviceLabels` / `ServiceId` — 13 active portal services
- `profiles` — per-service mock KPIs, summaries, agency comments, action prompts, activity, and tab content
- Client action history is stored in browser `localStorage` by `clientPanel/src/app/lib/client-actions.ts`

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

From `adminandemployeePanel/package.json`:
```
pnpm dev       # start dev server (Vite)
pnpm build     # production build
```
No test, lint, or typecheck scripts defined yet. If `pnpm` is unavailable, `npm run build` works with the existing package scripts.

From `clientPanel/package.json`:
```
npm run dev    # start Client Portal dev server (Vite)
npm run build  # production build
```
