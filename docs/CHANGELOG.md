# Chronos — Changelog

All notable changes to this project are documented in this file.
Format: `## [version] - YYYY-MM-DD`

---

## [0.5.0] - 2026-08-08

### Milestone 5: Authentication

Implements full authentication, session management, and route protection using **Auth.js (NextAuth v5)** with Neon PostgreSQL.

#### Added
- `src/lib/auth.config.ts` — Edge-compatible Auth.js configuration for JWT sessions and providers
- `src/lib/auth.ts` — Node.js Auth.js configuration with `@auth/prisma-adapter` and exported auth helpers
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth GET/POST API route handler
- `src/middleware.ts` — Route protection middleware guarding all app routes and API routes
- `src/app/login/page.tsx` — Minimal, calm command-center login page with Google OAuth and demo account sign-in
- `src/components/auth/UserMenu.tsx` — Header dropdown with dynamic user avatar, initials fallback, email, and Sign Out action
- `src/types/next-auth.d.ts` — TypeScript type augmentation for `Session` and `JWT` interfaces
- `User`, `Account`, `Session`, and `VerificationToken` models in Prisma schema

#### Modified
- `prisma/schema.prisma` — Added Auth.js models and non-nullable `Project.userId` foreign key
- `prisma/seed.ts` — Added development user (`user-dev-1`) and linked all seeded projects
- `src/services/user.service.ts` — Implemented `getUserById` and `getUserByEmail`
- `src/services/project.service.ts` — Added `userId` scoping to `getAllProjects` and `getProjectById`
- `src/components/layout/Header.tsx` — Replaced placeholder avatar with `UserMenu`
- `src/app/(app)/projects/page.tsx`, `projects/[projectId]/page.tsx`, `projects/[projectId]/[taskId]/page.tsx` — Connected authenticated session to service calls

---

## [0.4.0] - 2026-08-08

### Milestone 4: Database & Persistence

Replaces all in-memory mock data with Prisma ORM + PostgreSQL (Neon). The existing UI is completely unchanged.

#### Added
- `prisma/schema.prisma` — Project, Task, Subtask models with enums and nullable `deletedAt` for soft-delete support
- `prisma.config.ts` — Prisma 7 configuration file (datasource URL, seed command, migration path)
- `prisma/seed.ts` — Idempotent seed script (upsert-based); seeds 4 projects, 17 tasks, ~30 subtasks
- `src/lib/prisma.ts` — PrismaClient singleton using `@prisma/adapter-pg` + `pg.Pool`
- `src/services/project.service.ts` — `getAllProjects()`, `getProjectById()`
- `src/services/task.service.ts` — `getTasksByProjectId()`, `getTaskById()`, `getSubtasksByTaskId()`
- `src/services/user.service.ts` — Stub for the upcoming authentication milestone

#### Modified
- `package.json` — Added `db:migrate`, `db:seed`, `db:studio` scripts; added `prisma.seed` config
- `src/app/(app)/projects/page.tsx` — Replaced mock import with `getAllProjects()` service call
- `src/app/(app)/projects/[projectId]/page.tsx` — Replaced mock data with parallel service calls
- `src/app/(app)/projects/[projectId]/[taskId]/page.tsx` — Replaced mock data with parallel service calls

#### Architecture
- Architecture: Page → Service → Prisma → pg Pool → Neon PostgreSQL
- `progress` and `health` are computed in the service layer, never stored as columns
- Enum labels with hyphens (e.g. `in-progress`) are mapped in the service layer from underscore DB values
- Soft-delete filtering applied at every query: `where: { deletedAt: null }`

#### Prisma 7 Breaking Changes Resolved
- `url` removed from `schema.prisma` → moved to `prisma.config.ts`
- `PrismaClient()` now requires a driver adapter → uses `@prisma/adapter-pg`
- `.env` no longer auto-loaded → `import "dotenv/config"` added to config and seed

---

## [0.3.0] - 2026-08-07

### Milestone 3: Project & Task Domain

#### Added
- Core domain types: `Project`, `Task`, `Subtask` with full TypeScript union types
- Domain constants: `PROJECT_COLORS`, `PROJECT_ICON_MAP`, status/priority/health definitions
- Mock data: 4 projects, 16 tasks, subtasks
- `ProjectList` and `ProjectCard` components with color/icon identity, filter tabs, `+ New Project` dialog
- `ProjectDetails` with task list grouped by status, health indicators, metadata sidebar
- `TaskDetails` with subtask checklist, progress ring, breadcrumb, tag pills
- `calculateTaskProgress()` and `calculateProjectHealth()` utility functions
- Routes: `/projects`, `/projects/[projectId]`, `/projects/[projectId]/[taskId]`

---

## [0.2.0] - 2026-08-07

### Milestone 2: Dashboard UI

#### Added
- Full dashboard layout: welcome hero, today's focus card (with progress bar, resume button, next step), task list widget, habit summary, mini calendar, quick actions
- All widgets backed by typed mock data
- Responsive grid layout (1/2/3 columns)

---

## [0.1.0] - 2026-08-07

### Milestone 1: Application Shell

#### Added
- Collapsible sidebar with Lucide icons, active route highlight, Framer Motion animations
- Mobile drawer using shadcn Sheet
- Sticky glassmorphism header with theme toggle, search, notifications, user avatar
- `AppLayout` component (responsive, desktop sidebar + mobile drawer)
- `ComingSoon` reusable placeholder component
- Placeholder pages: Dashboard, Calendar, Tasks, Habits, Focus, Analytics, Notes, Settings
- Navigation generated from `constants/navigation.ts` (no hardcoded items)
- Theme system: dark/light with hydration-safe toggle
