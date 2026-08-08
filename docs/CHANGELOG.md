# Chronos — Changelog

All notable changes to this project are documented in this file.
Format: `## [version] - YYYY-MM-DD`

---

## [0.7.0] - 2026-08-08

### Milestone 7: Habits

Implements full-featured daily habit tracking, streak analytics, a 7-day consistency weekly matrix, and live authenticated dashboard widget integration.

#### Added
- `src/features/habits/types/index.ts` — Habit domain types (`Habit`, `HabitLog`, `HabitWithLogs`, `HabitSummaryItem`, `HabitStats`, `CreateHabitInput`, `UpdateHabitInput`, `HabitFrequency`, `WeekDayInfo`)
- `src/features/habits/constants/domain.ts` — Categories, icon map, color identities, and Tailwind color token mappings
- `src/features/habits/constants/mockData.ts` — Default seeded habit constants
- `src/features/habits/utils/streak.ts` — Pure functions for consecutive active streaks, all-time best streaks, and daily completion checks
- `src/features/habits/utils/progress.ts` — 7-day current week intervals and completion rate utilities
- `src/services/habit.service.ts` — Prisma service layer with user ownership validation, soft delete filtering, upsert daily logging, and summary aggregation
- `src/features/habits/actions/index.ts` — Server Actions (`createHabitAction`, `updateHabitAction`, `deleteHabitAction`, `toggleHabitAction`) with NextAuth session verification and path revalidation
- `src/features/habits/components/HabitHeader.tsx` — Category filters, completion stats badge, and new habit modal trigger
- `src/features/habits/components/HabitStatsBar.tsx` — Top metrics bar (today's completion progress, best active streak, total streaks, active habits count)
- `src/features/habits/components/HabitWeeklyMatrix.tsx` — 7-day interactive consistency matrix displaying completion bubbles and streak flame badges
- `src/features/habits/components/HabitCard.tsx` — Habit card with category tag, flame streak counter, 7-day mini heatmap, one-click check-in, and options dropdown
- `src/features/habits/components/HabitIcon.tsx` — Reusable Lucide icon renderer for dynamic habit icons
- `src/features/habits/components/CreateHabitDialog.tsx` — Modal supporting habit title, description, category, color accent, icon picker, frequency, and target days
- `src/features/habits/components/EditHabitDialog.tsx` — Modal for editing habit details and archiving
- `src/features/habits/components/HabitsView.tsx` — Client layout orchestrating header, stats, weekly matrix, category filtering, and habit cards
- `Habit` and `HabitLog` models in Prisma schema with `@@unique([habitId, date])` and relations to `User`

#### Modified
- `prisma/schema.prisma` — Added `Habit` and `HabitLog` models, `habits` relation on `User`
- `prisma/seed.ts` — Added deterministic habit records and 100 historical `HabitLog` entries for `user-dev-1`
- `src/app/(app)/habits/page.tsx` — Replaced placeholder with authenticated Server Component fetching live habit list and stats
- `src/app/(app)/dashboard/page.tsx` — Connected dashboard to `getHabitSummary(session.user.id)`
- `src/features/dashboard/components/HabitSummary.tsx` — Replaced static mock data with live authenticated habit summary data

---

## [0.6.0] - 2026-08-08

### Milestone 6: Calendar

Integrates a full-featured productivity calendar featuring Month, Week, and Day views, event CRUD, read-only task deadline milestones, and strict tenant ownership.

#### Added
- `src/features/calendar/types/index.ts` — Calendar domain types, view modes, event types, unified `CalendarItem` union, and mutation inputs
- `src/features/calendar/constants/calendar.ts` — Event type labels, badge styles, icons, view mode definitions, and Tailwind v4 color styles
- `src/features/calendar/utils/dateGrid.ts` — Calendar grid utilities using `date-fns` for month matrix, week intervals, day filtering, and localized date titles
- `src/services/calendar.service.ts` — Database access layer for range-scoped feed queries and strict ownership-validated CRUD operations
- `src/features/calendar/actions/index.ts` — Server actions (`createEventAction`, `updateEventAction`, `deleteEventAction`) with session verification
- `src/features/calendar/components/TaskDeadlineBadge.tsx` — Read-only milestone badge for task deadlines on the calendar
- `src/features/calendar/components/CalendarHeader.tsx` — Navigation controls, localized title display, view switcher pill (`Month` / `Week` / `Day`), and `+ New Event` button
- `src/features/calendar/components/MonthView/` — 7-column calendar matrix with weekday headers, day cells, all-day event pills, and overflow counters
- `src/features/calendar/components/WeekView/` — 7-column 24-hour time grid with sticky all-day event shelf and auto-scroll to business hours
- `src/features/calendar/components/DayView/` — Single-day hourly schedule agenda with detailed event cards and project badges
- `src/features/calendar/components/EventDialog/EventFormDialog.tsx` — Unified Create & Edit modal supporting title, description, event type, all-day toggle, start/end dates and times, project selector, task selector, color picker, and location
- `src/features/calendar/components/EventDialog/EventDetailModal.tsx` — Modal displaying event details, location, type badge, project tag, task tag, with Edit and Delete triggers
- `src/features/calendar/components/CalendarView.tsx` — Top-level orchestrator synchronizing URL parameters, managing modal dialogs, and rendering Month, Week, or Day views
- `CalendarEvent` model and `CalendarEventType` enum in Prisma schema

#### Modified
- `prisma/schema.prisma` — Added `CalendarEvent` model and relations on `User`, `Project`, and `Task`
- `prisma/seed.ts` — Added initial `CalendarEvent` records for development user (`user-dev-1`)
- `src/app/(app)/calendar/page.tsx` — Converted placeholder page into Server Component with URL date-range calculation and live feed querying

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
