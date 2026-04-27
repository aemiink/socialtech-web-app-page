# Social Tech Claude Code Instructions

## Project Context

This repository belongs to Social Tech, a premium digital growth agency building scalable digital systems, SaaS interfaces, dashboards, automation workflows, and client-facing web applications.

The expected engineering style is:
- clean
- scalable
- maintainable
- TypeScript-safe
- component-based
- minimally invasive
- production-oriented

## Repository-Specific Architecture

This project is currently a Vite + React SPA, not a Next.js application.

Rules:
- Do not apply Next.js App Router conventions.
- Do not suggest Server Components, SSR, RSC, or Next.js middleware unless the project is explicitly migrated.
- Use React Router 7 patterns for routing.
- Use Vite-compatible configuration and build assumptions.
- Treat all current data as mock/static unless a backend is explicitly added.

## Default Technical Expectations

Before making changes:
- Inspect the repository structure.
- Read relevant files before editing.
- Preserve the existing architecture and naming conventions.
- Do not rewrite the whole project unless explicitly requested.
- Make the smallest safe change that solves the task.
- Avoid unnecessary dependencies.
- Keep TypeScript strict and avoid `any`.
- Respect existing styling and component patterns.
- Consider loading, empty, error, and responsive states.
- For role-based features, enforce permissions on both frontend and backend when applicable.

## Shared Project Memory Rules

This repository may be worked on by both Claude Code and Codex.

The following files are shared project memory:
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `DECISIONS.md`
- `ROAD_MAP.md`

Rules:
- Treat these files as the source of project memory.
- Do not overwrite them entirely unless explicitly requested.
- Update only the relevant sections.
- Preserve existing decisions unless a new decision explicitly replaces them.
- When adding to `DECISIONS.md`, append a new dated decision instead of editing old decisions.
- When updating `ROAD_MAP.md`, mark items as planned, in progress, blocked, or completed.
- Before implementation, read these files first.
- After a meaningful architectural or roadmap change, update only the relevant shared memory file.
- Do not duplicate the same information across all shared memory files.
- Preserve updates made by Claude Code, Codex, or human developers.

## Context Management / Token Saving

Before reading many files, first check:

1. `PROJECT_CONTEXT.md`
2. `REPO_MAP.md`
3. `DECISIONS.md`
4. `ROAD_MAP.md`

Use these files as the project memory.

Do not scan the whole repository by default.

For every task:
- First identify the smallest relevant file set.
- Prefer `Grep` and `Glob` before opening files.
- Read only the files needed for the task.
- Avoid re-reading unchanged files.
- Avoid copying large file contents into the conversation.
- If project context is missing or outdated, use `social-tech-context-manager` first.

Large tasks should follow this flow:

1. Context manager identifies relevant files.
2. Specialist agent reads only those files.
3. Implementation agent changes only necessary files.
4. Code reviewer reviews only the changed files and directly related dependencies.
5. Context manager updates `PROJECT_CONTEXT.md`, `REPO_MAP.md`, `DECISIONS.md`, or `ROAD_MAP.md` only if architecture or roadmap changed.

## Frontend Standards

If this is a frontend task:
- Prefer reusable components.
- Use existing UI primitives if available.
- Keep components focused and readable.
- Use semantic HTML.
- Keep Tailwind classes organized.
- Only use `"use client"` when truly necessary.
- Preserve Server Component behavior in Next.js where possible.

## Backend Standards

If this is a backend task:
- Keep controllers thin.
- Put business logic in services where the project structure supports it.
- Validate inputs.
- Standardize error responses.
- Never hardcode secrets.
- Keep environment variable names clear.
- Do not expose private keys, tokens, or production credentials.

## Auth / RBAC Standards

For authentication and authorization:
- Frontend hiding is not enough.
- Backend/API permission checks are required.
- Keep role logic centralized.
- Clearly distinguish unauthenticated, unauthorized, and forbidden states.
- Make sidebar/navigation role-aware only after the permission model is clear.

## Testing / Validation

After meaningful changes:
- Run the most relevant lint/typecheck/test/build command available in the repo.
- If commands cannot be run, explain why.
- Mention what should be manually verified.

## Tool Switching Workflow

If work switches between Claude Code and Codex:
- Read `PROJECT_CONTEXT.md`, `REPO_MAP.md`, `DECISIONS.md`, and `ROAD_MAP.md` before continuing.
- Inspect the latest git status or diff before editing.
- Do not redo completed work.
- Do not overwrite another tool’s recent changes.
- Prefer committing stable milestones before switching tools.

Recommended workflow:
1. Complete a focused task.
2. Run relevant checks.
3. Review the diff.
4. Update shared memory only if needed.
5. Commit the work.
6. Switch tools only after the repo is in a stable state.

## Final Response Format

At the end of every task, return:

1. What changed
2. Files changed
3. Why this approach was chosen
4. Risks or assumptions
5. Test/build commands run or recommended
6. Next recommended step