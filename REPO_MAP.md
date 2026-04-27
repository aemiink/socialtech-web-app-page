# Repository Map

## High-Level Structure

- `adminandemployeePanel/` - Vite + React SPA for the Admin Panel and role-based Employee Panel.
- `client/` - public/marketing Social Tech website. This is not the Client Portal.
- `clientPanel/` - Client Portal Vite + React SPA for customer service visibility.
- `PROJECT_CONTEXT.md` - shared product, stack, architecture, and convention memory.
- `REPO_MAP.md` - shared file and module map.
- `DECISIONS.md` - dated architecture decisions.
- `ROAD_MAP.md` - shared implementation and planning status.
- `.claude/` and `.codex/` - local tool/agent configuration.

## Admin + Employee Panel

Location: `adminandemployeePanel/`

- Entry: `adminandemployeePanel/src/main.tsx`
- App root: `adminandemployeePanel/src/app/App.tsx`
- Router: `adminandemployeePanel/src/app/routes.tsx`
- Admin layout: `adminandemployeePanel/src/app/layouts/RootLayout.tsx`
- Employee layout: `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- Role context: `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
- Admin pages: `adminandemployeePanel/src/app/pages/`
- Employee pages: `adminandemployeePanel/src/app/employee/pages/`
- Employee dashboards: `adminandemployeePanel/src/app/employee/dashboards/`
- UI primitives: `adminandemployeePanel/src/app/components/ui/`
- Mock data: `adminandemployeePanel/src/app/data/mockData.ts`
- Styles: `adminandemployeePanel/src/styles/`
- Vite config: `adminandemployeePanel/vite.config.ts`

## Client Portal

Location: `clientPanel/`

Purpose: customer-facing visibility panel for purchased Social Tech services, reports, approvals, meetings, billing, agency comments, and client actions.

### Config And Entry

- Package scripts: `clientPanel/package.json`
- Vite config: `clientPanel/vite.config.ts`
- HTML entry: `clientPanel/index.html`
- React entry: `clientPanel/src/main.tsx`
- App root: `clientPanel/src/app/App.tsx`

### Navigation

- The Client Portal currently uses local React state in `clientPanel/src/app/App.tsx`.
- `selectedService` controls whether the service selection screen or the selected service workspace is visible.
- `currentPage` controls shared pages, service dashboards, and service tab workspaces.
- There is no current React Router route file in `clientPanel/`.

### Core Components

- `clientPanel/src/app/components/sidebar.tsx` - service-specific navigation, shared bottom items, collapse state, service switching.
- `clientPanel/src/app/components/topbar.tsx` - selected service title and hardcoded demo client identity.
- `clientPanel/src/app/components/client-action-center.tsx` - floating action button, toast, action history drawer.
- `clientPanel/src/app/components/button.tsx` - local portal button abstraction.
- `clientPanel/src/app/components/metric-card.tsx` - reusable metric display.
- `clientPanel/src/app/components/dashboard-widgets.tsx` - dashboard widgets.
- `clientPanel/src/app/components/automation-preview.tsx` - automation preview component.
- `clientPanel/src/app/components/ui/` - shadcn-style Radix UI primitives.

### Pages

- `clientPanel/src/app/pages/service-selection.tsx` - 13 active service cards and service entry point.
- `clientPanel/src/app/pages/service-tab-page.tsx` - generic workspace renderer for service-specific tabs.
- `clientPanel/src/app/pages/reports.tsx` - shared reports page.
- `clientPanel/src/app/pages/meetings.tsx` - shared meetings page.
- `clientPanel/src/app/pages/billing.tsx` - shared billing page.
- `clientPanel/src/app/pages/settings.tsx` - shared settings page.
- `clientPanel/src/app/pages/services/` - service dashboard pages:
  - `growth-hub-dashboard.tsx`
  - `social-media-dashboard.tsx`
  - `medya-hub-dashboard.tsx`
  - `meta-ads-dashboard.tsx`
  - `tiktok-ads-dashboard.tsx`
  - `google-ads-dashboard.tsx`
  - `amazon-ads-dashboard.tsx`
  - `web-app-dashboard.tsx`
  - `mobile-app-dashboard.tsx`
  - `landing-pages-dashboard.tsx`
  - `web-mobile-design-dashboard.tsx`
  - `technical-support-dashboard.tsx`
  - `seo-dashboard.tsx`

Additional portal pages exist under `clientPanel/src/app/pages/` and `clientPanel/src/app/pages/growth-hub/`; verify current imports before editing them because `App.tsx` is the active navigation source.

### Data And Local Behavior

- `clientPanel/src/app/data/service-pages.ts` - service labels, service profiles, KPIs, tab content, tables, timelines, agency comments, and client action prompts.
- `clientPanel/src/app/lib/client-actions.ts` - browser `localStorage` action history, action type inference, action event dispatch, and local text-file download behavior.
- All Client Portal data is mock/static. There is no backend, API, database, or real authentication.

### Styles

- `clientPanel/src/styles/index.css`
- `clientPanel/src/styles/fonts.css`
- `clientPanel/src/styles/tailwind.css`
- `clientPanel/src/styles/theme.css`
- `clientPanel/default_shadcn_theme.css`

### Imported Reference Text

- `clientPanel/src/imports/pasted_text/client-panel-pages.md`
- `clientPanel/src/imports/pasted_text/service-sidebars.md`
- `clientPanel/src/imports/pasted_text/social-media-management-dashbo.md`

## Public Site

Location: `client/`

The `client/` directory is the public/marketing Social Tech website, not the Client Portal. It was only checked enough to disambiguate it from `clientPanel/` for the portal mapping task.

## Start Here For Client Portal Work

- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/lib/client-actions.ts`

## Do Not Touch Without Reason

- `adminandemployeePanel/vite.config.ts` and `clientPanel/vite.config.ts` - both include Figma asset resolver behavior.
- `adminandemployeePanel/src/app/routes.tsx` - Admin and Employee Panel route definitions.
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx` - Employee Panel RBAC foundation.
- `clientPanel/src/app/App.tsx` - Client Portal navigation state lives here until a router is introduced.
- `clientPanel/src/app/data/service-pages.ts` - dense mock service content used across portal tabs.
