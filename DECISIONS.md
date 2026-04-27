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
